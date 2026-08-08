#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));
const FUZZ_SEED = 0x041c0a11;
const FUZZ_CASE_COUNT = 100000;

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});
const MPL = context.MPL;

function canonicalSnapshot(model) {
  return model.getRawStates().map((state, source) => {
    if (state === null) return null;
    return {
      assignment: Object.entries(state.assignment)
        .sort(([left], [right]) => left.localeCompare(right)),
      successors: state.successors
        .map(successor => ({ source, target: successor.target, agent: successor.agent }))
        .sort((left, right) =>
          left.source - right.source ||
          left.target - right.target ||
          String(left.agent).localeCompare(String(right.agent))
        ),
    };
  });
}

function snapshotString(model) {
  return JSON.stringify(canonicalSnapshot(model));
}

function nullSlots(model) {
  const result = [];
  model.getRawStates().forEach((state, index) => {
    if (state === null) result.push(index);
  });
  return result;
}

function valuationSnapshot(model) {
  return model.getRawStates().map(state =>
    state === null ? null : Object.entries(state.assignment).sort(([a], [b]) => a.localeCompare(b))
  );
}

function transitionSnapshot(model) {
  return canonicalSnapshot(model).flatMap(state => state === null ? [] : state.successors);
}

function makeExistingModel() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({ removed: true });
  model.addState({ q: true });
  model.addState({ r: true });
  model.removeState(1);
  model.addTransition(0, 0, 'a');
  model.addTransition(0, 2, 'b');
  model.addTransition(2, 0, 'b');
  model.addTransition(2, 2, 'a');
  model.addTransition(3, 3, 'x');
  return model;
}

function normalizeFailure(result, thrown) {
  if (thrown) return { ok: false, error: thrown };
  return result;
}

function assertStructuredFailure(result, expectedCode, label) {
  assert.ok(result && result.ok === false, `${label}: expected an explicit {ok:false,error} result.`);
  assert.ok(result.error && typeof result.error === 'object', `${label}: expected a structured error object.`);
  assert.strictEqual(result.error.code, expectedCode, `${label}: unexpected stable error code.`);
  assert.strictEqual(typeof result.error.message, 'string', `${label}: error message must be a string.`);
  assert.ok(result.error.message.length > 0, `${label}: error message must be nonempty.`);
  assert.ok(
    Number.isInteger(result.error.stateIndex) || Number.isInteger(result.error.offset),
    `${label}: error must identify a state index or source offset.`
  );
}

function assertFailureIsAtomic(input, expectedCode, label) {
  const model = makeExistingModel();
  const beforeSnapshot = snapshotString(model);
  const beforeLength = model.getRawStates().length;
  const beforeNulls = JSON.stringify(nullSlots(model));
  const beforeValuations = JSON.stringify(valuationSnapshot(model));
  const beforeTransitions = JSON.stringify(transitionSnapshot(model));
  let returned;
  let thrown = null;

  try {
    returned = model.loadFromModelString(input);
  } catch (error) {
    thrown = error;
  }

  const failure = normalizeFailure(returned, thrown);
  assertStructuredFailure(failure, expectedCode, label);
  assert.strictEqual(snapshotString(model), beforeSnapshot, `${label}: complete model snapshot changed.`);
  assert.strictEqual(model.getRawStates().length, beforeLength, `${label}: world-array length changed.`);
  assert.strictEqual(JSON.stringify(nullSlots(model)), beforeNulls, `${label}: null slots changed.`);
  assert.strictEqual(JSON.stringify(valuationSnapshot(model)), beforeValuations, `${label}: valuations changed.`);
  assert.strictEqual(JSON.stringify(transitionSnapshot(model)), beforeTransitions, `${label}: transitions changed.`);
}

// Test-local independent legacy validator. It does not call any production
// parsing or loading API. Round 4's explicit compatibility contract is:
// - semicolon-separated state slots, with every empty record representing null;
// - the empty string represents exactly one null slot;
// - live states are A<one-character word atoms>S<transitions>;
// - transitions are full decimal targets plus one Unicode-code-point label;
// - a single trailing transition comma is optional;
// - every target must name an existing live slot;
// - duplicate transitions are accepted with set-like suppression.
function oracleFailure(code, message, details) {
  return {
    ok: false,
    error: Object.assign({
      code,
      message,
      offset: null,
      stateIndex: null,
      tokenIndex: null,
      token: null,
    }, details || {}),
  };
}

function oracleParse(modelString) {
  if (typeof modelString !== 'string') {
    return oracleFailure('INPUT_NOT_STRING', 'Compact model input must be a string.', {});
  }

  const records = modelString.split(';');
  const states = [];
  const pending = [];
  let recordOffset = 0;

  for (let stateIndex = 0; stateIndex < records.length; stateIndex++) {
    const record = records[stateIndex];
    if (record === '') {
      states.push(null);
      recordOffset += 1;
      continue;
    }

    if (record[0] !== 'A') {
      return oracleFailure('MISSING_STATE_START', `State ${stateIndex} must begin with A.`, {
        offset: recordOffset,
        stateIndex,
        token: record,
      });
    }

    const separatorIndex = record.indexOf('S', 1);
    if (separatorIndex === -1) {
      return oracleFailure('MISSING_STATE_SEPARATOR', `State ${stateIndex} is missing S.`, {
        offset: recordOffset + record.length,
        stateIndex,
        token: record,
      });
    }

    const atomText = record.slice(1, separatorIndex);
    const assignment = {};
    for (const atom of Array.from(atomText)) {
      if (!/^[A-Za-z0-9_]$/.test(atom) || atom === 'A' || atom === 'S') {
        return oracleFailure('INVALID_ATOM_CHARACTER', `State ${stateIndex} contains an invalid atom character.`, {
          offset: recordOffset + 1,
          stateIndex,
          token: atom,
        });
      }
      assignment[atom] = true;
    }
    states.push({ assignment, successors: [] });

    const transitionText = record.slice(separatorIndex + 1);
    if (transitionText === '') {
      recordOffset += record.length + 1;
      continue;
    }

    const tokens = transitionText.split(',');
    if (tokens[tokens.length - 1] === '') tokens.pop();
    if (tokens.length === 0 || tokens.some(token => token === '')) {
      return oracleFailure('EMPTY_TRANSITION_RECORD', `State ${stateIndex} contains an empty transition record.`, {
        offset: recordOffset + separatorIndex + 1,
        stateIndex,
        token: '',
      });
    }

    let transitionOffset = recordOffset + separatorIndex + 1;
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      const codePoints = Array.from(token);
      if (codePoints.length < 2) {
        const code = /^[0-9]+$/.test(token) ? 'MISSING_AGENT' : 'INVALID_TARGET_FORMAT';
        return oracleFailure(code, `State ${stateIndex} transition ${tokenIndex} is incomplete.`, {
          offset: transitionOffset,
          stateIndex,
          tokenIndex,
          token,
        });
      }

      const agent = codePoints[codePoints.length - 1];
      const targetText = codePoints.slice(0, -1).join('');
      if (!/^[0-9]+$/.test(targetText)) {
        const code = /^[0-9]/.test(token) ? 'UNEXPECTED_TRANSITION_MATERIAL' : 'INVALID_TARGET_FORMAT';
        return oracleFailure(code, `State ${stateIndex} transition ${tokenIndex} has an invalid target.`, {
          offset: transitionOffset,
          stateIndex,
          tokenIndex,
          token,
        });
      }

      const target = Number(targetText);
      if (!Number.isSafeInteger(target)) {
        return oracleFailure('TARGET_NOT_SAFE_INTEGER', `State ${stateIndex} transition ${tokenIndex} target is not a safe integer.`, {
          offset: transitionOffset,
          stateIndex,
          tokenIndex,
          token,
        });
      }
      pending.push({ source: stateIndex, target, agent, tokenIndex, token, offset: transitionOffset });
      transitionOffset += token.length + 1;
    }

    recordOffset += record.length + 1;
  }

  for (const transition of pending) {
    if (transition.target < 0 || transition.target >= states.length) {
      return oracleFailure('TARGET_OUT_OF_RANGE', `Transition target ${transition.target} is out of range.`, {
        offset: transition.offset,
        stateIndex: transition.source,
        tokenIndex: transition.tokenIndex,
        token: transition.token,
        target: transition.target,
      });
    }
    if (states[transition.target] === null) {
      return oracleFailure('TARGET_NOT_LIVE', `Transition target ${transition.target} is a null slot.`, {
        offset: transition.offset,
        stateIndex: transition.source,
        tokenIndex: transition.tokenIndex,
        token: transition.token,
        target: transition.target,
      });
    }

    const successors = states[transition.source].successors;
    if (!successors.some(existing =>
      existing.target === transition.target && existing.agent === transition.agent
    )) {
      successors.push({ target: transition.target, agent: transition.agent });
    }
  }

  return { ok: true, modelData: { states } };
}

function oracleSnapshot(parsed) {
  return parsed.modelData.states.map((state, source) => state === null ? null : ({
    assignment: Object.entries(state.assignment).sort(([a], [b]) => a.localeCompare(b)),
    successors: state.successors
      .map(successor => ({ source, target: successor.target, agent: successor.agent }))
      .sort((left, right) =>
        left.source - right.source ||
        left.target - right.target ||
        String(left.agent).localeCompare(String(right.agent))
      ),
  }));
}

function runMinimizedFailures() {
  const cases = [
    ['existing model plus broken middle', 'ApS;BROKEN;AqS', 'MISSING_STATE_START'],
    ['valid prefix followed by missing A', 'ApS;pS;AqS', 'MISSING_STATE_START'],
    ['missing S', 'ApS;Aq;ArS', 'MISSING_STATE_SEPARATOR'],
    ['malformed transition target', 'ApSza,;AqS', 'INVALID_TARGET_FORMAT'],
    ['out-of-range target', 'ApS9a,;AqS', 'TARGET_OUT_OF_RANGE'],
    ['target to null world', 'ApS1a,;;AqS', 'TARGET_NOT_LIVE'],
    ['missing agent label', 'ApS1,;AqS', 'MISSING_AGENT'],
    ['transition with unexpected trailing material', 'ApS1ab,;AqS', 'UNEXPECTED_TRANSITION_MATERIAL'],
    ['malformed late state', 'ApS;AqS;ArS;BROKEN;AtS', 'MISSING_STATE_START'],
  ];

  cases.forEach(([label, input, expectedCode]) => {
    const oracle = oracleParse(input);
    assert.strictEqual(oracle.ok, false, `${label}: independent oracle fixture must be malformed.`);
    assert.strictEqual(oracle.error.code, expectedCode, `${label}: oracle fixture code drifted.`);
    assertFailureIsAtomic(input, expectedCode, label);
  });
  return cases.length;
}

const EXISTING_LINK_MODELS = [
  ';AqS',
  'ApS1a,0a,;AS0a,1a,',
  'ApqS1a,0a,2b,0b,1b,4a,;ApqS0a,1a,2b,1b,0b,4a,;ApqS0b,1b,2b,2a,;;AS1a,0a,4a,4b,',
  ';ApS2b,3a,1b,1a,;AS1b,2a,2b,;ApqS1a,3a,3b,',
  'ApqS0a,1a,0b,;ArS1a,0a,1b,',
  'ApqS0a,1a,2a,0b,3b,;AqrS0a,1a,2a,1b,;ArS0a,1a,2a,2b,;AqsS3a,4a,0b,3b,;AprS3a,4a,4b,',
];

function runCompatibilityCorpus() {
  const twelveStates = Array.from({ length: 12 }, (_, index) =>
    index === 0 ? 'ApS10x,' : (index === 10 ? 'AqS' : 'AS')
  ).join(';');
  const cases = [
    ['', [0]],
    [';ApS1x,', [0]],
    ['ApS2x,;;AqS', [1]],
    ['ApS;', [1]],
    [twelveStates, []],
    ['AS', []],
    ['ApqS', []],
    ['AS1x,;AS', []],
    ['AS1x,1x,;AS', []],
    ['ApS0a,1a,;AS0a,1a,', []],
    ...EXISTING_LINK_MODELS.map(input => [input, null]),
  ];

  cases.forEach(([input, expectedNulls], index) => {
    const oracle = oracleParse(input);
    assert.strictEqual(oracle.ok, true, `compatibility case ${index + 1}: oracle rejected ${input}`);
    const parsed = MPL.parseModelString(input);
    assert.ok(parsed && parsed.ok === true, `compatibility case ${index + 1}: pure production parser rejected ${input}`);
    assert.strictEqual(
      JSON.stringify(oracleSnapshot({ modelData: parsed.modelData })),
      JSON.stringify(oracleSnapshot(oracle)),
      `compatibility case ${index + 1}: pure parser structure differs from oracle.`
    );
    const model = makeExistingModel();
    const result = model.loadFromModelString(input);
    assert.ok(result && result.ok === true, `compatibility case ${index + 1}: production rejected ${input}`);
    assert.strictEqual(
      snapshotString(model),
      JSON.stringify(oracleSnapshot(oracle)),
      `compatibility case ${index + 1}: production structure differs from oracle.`
    );
    if (expectedNulls) {
      assert.deepStrictEqual(nullSlots(model), expectedNulls, `compatibility case ${index + 1}: null-slot contract changed.`);
    }
  });

  const duplicateModel = new MPL.Model();
  const duplicateResult = duplicateModel.loadFromModelString('AS1x,1x,;AS');
  assert.strictEqual(duplicateResult.duplicateTransitionsSuppressed, 1);
  assert.strictEqual(duplicateModel.getSuccessorsOf(0, 'x').length, 1);

  const emptyModel = new MPL.Model();
  const emptyResult = emptyModel.loadFromModelString('');
  assert.strictEqual(emptyResult.ok, true);
  assert.strictEqual(emptyModel.getRawStates().length, 1, 'Empty string must retain the explicit one-null-slot legacy contract.');
  assert.strictEqual(emptyModel.getRawStates()[0], null);
  return cases.length;
}

function makeRng(seed) {
  let state = seed >>> 0;
  return {
    integer(maxExclusive) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state % maxExclusive;
    },
    boolean() {
      return this.integer(2) === 1;
    },
  };
}

const FUZZ_ATOMS = ['p', 'q', 'r', 's', 't', 'f', 'o', '7', '_'];
const FUZZ_AGENTS = ['a', 'b', 'x', 'y', '7', '⚡'];

function generateValidCandidate(rng, caseIndex) {
  if (caseIndex % 997 === 0) return '';
  const stateCount = 1 + rng.integer(8);
  const live = Array.from({ length: stateCount }, () => rng.integer(5) !== 0);
  if (!live.some(Boolean)) live[rng.integer(stateCount)] = true;
  const records = [];

  for (let source = 0; source < stateCount; source++) {
    if (!live[source]) {
      records.push('');
      continue;
    }
    let atomText = '';
    const atomCount = rng.integer(5);
    for (let atomIndex = 0; atomIndex < atomCount; atomIndex++) {
      atomText += FUZZ_ATOMS[rng.integer(FUZZ_ATOMS.length)];
    }

    const liveTargets = live.map((isLive, index) => isLive ? index : null).filter(index => index !== null);
    const transitionCount = rng.integer(5);
    const transitions = [];
    for (let transitionIndex = 0; transitionIndex < transitionCount; transitionIndex++) {
      const target = liveTargets[rng.integer(liveTargets.length)];
      const agent = FUZZ_AGENTS[rng.integer(FUZZ_AGENTS.length)];
      const token = `${target}${agent}`;
      transitions.push(token);
      if (rng.integer(13) === 0) transitions.push(token);
    }
    const transitionText = transitions.join(',') + (transitions.length > 0 && rng.boolean() ? ',' : '');
    records.push(`A${atomText}S${transitionText}`);
  }
  return records.join(';');
}

function generateMalformedCandidate(rng, caseIndex) {
  const atom = FUZZ_ATOMS[rng.integer(FUZZ_ATOMS.length)];
  const suffix = String(caseIndex) + atom;
  switch (caseIndex % 10) {
    case 0: return `A${atom}S;BROKEN${suffix};AqS`;
    case 1: return `A${atom}S;${atom}S;AqS`;
    case 2: return `A${atom}S;A${atom}${suffix}`;
    case 3: return `A${atom}Sz${atom},;AqS`;
    case 4: return `A${atom}S999999x,;AqS`;
    case 5: return `A${atom}S1x,;;AqS`;
    case 6: return `A${atom}S1,;AqS`;
    case 7: return `A${atom}S1ab,;AqS`;
    case 8: return `A${atom}S;AqS;ArS;BROKEN${suffix};AtS`;
    default: return `A${atom}S1x,,;AqS`;
  }
}

function runDeterministicFuzz() {
  const rng = makeRng(FUZZ_SEED);
  const model = makeExistingModel();
  let accepted = 0;
  let rejected = 0;

  for (let caseIndex = 0; caseIndex < FUZZ_CASE_COUNT; caseIndex++) {
    const input = caseIndex % 2 === 0
      ? generateValidCandidate(rng, caseIndex)
      : generateMalformedCandidate(rng, caseIndex);
    const oracle = oracleParse(input);
    const parsed = MPL.parseModelString(input);
    const before = snapshotString(model);
    const beforeLength = model.getRawStates().length;
    const beforeNulls = JSON.stringify(nullSlots(model));
    let production;
    let thrown = null;

    try {
      production = model.loadFromModelString(input);
    } catch (error) {
      thrown = error;
    }

    try {
      if (oracle.ok) {
        accepted++;
        assert.ok(parsed && parsed.ok === true, 'Pure production parser rejected an oracle-accepted input.');
        assert.strictEqual(
          JSON.stringify(oracleSnapshot({ modelData: parsed.modelData })),
          JSON.stringify(oracleSnapshot(oracle)),
          'Pure production parser structure differs from the oracle.'
        );
        assert.strictEqual(thrown, null, 'Production threw for an oracle-accepted input.');
        assert.ok(production && production.ok === true, 'Production rejected an oracle-accepted input.');
        assert.strictEqual(snapshotString(model), JSON.stringify(oracleSnapshot(oracle)));
      } else {
        rejected++;
        assert.ok(parsed && parsed.ok === false, 'Pure production parser accepted an oracle-rejected input.');
        const failure = normalizeFailure(production, thrown);
        assert.ok(failure && failure.ok === false, 'Production accepted an oracle-rejected input.');
        assert.ok(failure.error && typeof failure.error.code === 'string');
        assert.strictEqual(snapshotString(model), before, 'Rejected fuzz input changed the model snapshot.');
        assert.strictEqual(model.getRawStates().length, beforeLength, 'Rejected fuzz input changed world-array length.');
        assert.strictEqual(JSON.stringify(nullSlots(model)), beforeNulls, 'Rejected fuzz input changed null slots.');
      }
    } catch (error) {
      error.message = [
        'Deterministic compact-model fuzz failure.',
        `seed=${FUZZ_SEED} (0x${FUZZ_SEED.toString(16).padStart(8, '0')})`,
        `case=${caseIndex}/${FUZZ_CASE_COUNT - 1}`,
        `input=${JSON.stringify(input)}`,
        `oracle=${JSON.stringify(oracle)}`,
        `parsed=${JSON.stringify(parsed)}`,
        `production=${JSON.stringify(production)}`,
        `thrown=${thrown ? thrown.stack || thrown.message : '<none>'}`,
        `before=${before}`,
        `after=${snapshotString(model)}`,
        `cause=${error.message}`,
      ].join('\n');
      throw error;
    }
  }

  assert.ok(accepted >= 50000, 'Fuzz corpus must contain at least 50,000 valid cases.');
  assert.ok(rejected >= 50000, 'Fuzz corpus must contain at least 50,000 malformed cases.');
  return { accepted, rejected };
}

function loadAppHarnessHelpers() {
  const harnessPath = path.join(root, 'scripts/check-agent-rendering.js');
  const source = fs.readFileSync(harnessPath, 'utf8').replace(/^#![^\n]*\n/, '');
  const end = source.indexOf('\nconst tests = [');
  assert.ok(end > 0, 'Could not locate the reusable rendering harness boundary.');
  const moduleObject = { exports: {} };
  const factory = new Function(
    'require', 'module', 'exports', '__dirname', '__filename',
    source.slice(0, end) + '\nmodule.exports = { makeHarness, runInHarness };'
  );
  factory(require, moduleObject, moduleObject.exports, path.dirname(harnessPath), harnessPath);
  return moduleObject.exports;
}

function runBrowserStartupChecks() {
  const { makeHarness, runInHarness } = loadAppHarnessHelpers();
  const malformed = makeHarness('ApS;BROKEN;AqS');
  const defaultSnapshot = JSON.stringify([
    null,
    { assignment: [], successors: [] },
  ]);
  assert.strictEqual(
    runInHarness(malformed, `JSON.stringify(model.getRawStates().map(function(state, source) {
      return state === null ? null : {
        assignment: Object.entries(state.assignment).sort(),
        successors: state.successors.map(function(successor) {
          return {source: source, target: successor.target, agent: successor.agent};
        }).sort(function(left, right) {
          return left.source - right.source || left.target - right.target || String(left.agent).localeCompare(String(right.agent));
        })
      };
    }))`),
    defaultSnapshot,
    'Malformed startup import must retain the complete valid default model.'
  );
  assert.deepStrictEqual(JSON.parse(runInHarness(malformed, 'JSON.stringify(nodes.map(function(node) { return node.id; }))')), [1]);
  assert.deepStrictEqual(JSON.parse(runInHarness(malformed, 'JSON.stringify(links)')), []);
  assert.strictEqual(runInHarness(malformed, 's5ModeEnabled'), false);
  assert.strictEqual(malformed.historyEntries.length, 0, 'Failed startup import must not rewrite the URL.');
  const errorNode = malformed.d3.__roots.get('#s5-edit-message');
  assert.ok(errorNode.textContent.includes('Model import failed'), 'Startup must display a clear model-import error.');
  assert.strictEqual(errorNode.attributes.role, 'alert');

  const valid = makeHarness('AS1x,;AS');
  assert.strictEqual(runInHarness(valid, 'model.isSuccessor(0, 1, "x")'), true);
  assert.deepStrictEqual(JSON.parse(runInHarness(valid, 'JSON.stringify(nodes.map(function(node) { return node.id; }))')), [0, 1]);
  assert.strictEqual(runInHarness(valid, 's5ModeEnabled'), false);
  assert.strictEqual(valid.historyEntries.length, 1, 'Valid startup import should retain the normal canonical URL update.');

  const emptyUrl = makeHarness('');
  assert.deepStrictEqual(JSON.parse(runInHarness(emptyUrl, 'JSON.stringify(nodes.map(function(node) { return node.id; }))')), [1]);
  return 3;
}

function main() {
  const minimized = runMinimizedFailures();
  const compatibility = runCompatibilityCorpus();
  const fuzz = runDeterministicFuzz();
  const browser = runBrowserStartupChecks();

  console.log('PASS: atomic compact-model import checks completed.');
  console.log(`minimized malformed cases: ${minimized}`);
  console.log(`valid compatibility cases: ${compatibility}`);
  console.log('empty-string contract: one explicit null slot; empty URL parameter retains the valid default model');
  console.log(`fuzz seed: ${FUZZ_SEED} (0x${FUZZ_SEED.toString(16).padStart(8, '0')})`);
  console.log(`fuzz candidates: ${FUZZ_CASE_COUNT}`);
  console.log(`fuzz accepted valid strings: ${fuzz.accepted}`);
  console.log(`fuzz rejected malformed strings with rollback: ${fuzz.rejected}`);
  console.log(`browser startup cases: ${browser}`);
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
