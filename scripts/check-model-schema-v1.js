#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));
const SCHEMA_SEED = 0x5c4e4d41;
const GENERATED_MODEL_COUNT = 100000;

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});

const schemaHelperPath = path.join(root, 'js/schema-v1.js');
if (fs.existsSync(schemaHelperPath)) {
  vm.runInContext(fs.readFileSync(schemaHelperPath, 'utf8'), context, {
    filename: 'js/schema-v1.js',
  });
}

const MPL = context.MPL;
assert.ok(
  MPL.SchemaV1,
  'MPL.SchemaV1 API does not exist. Model Schema v1 production implementation is required.'
);

const SchemaV1 = MPL.SchemaV1;
for (const method of [
  'validateModelDocument',
  'encodeModel',
  'decodeModel',
  'canonicalStringify',
]) {
  assert.strictEqual(typeof SchemaV1[method], 'function', `Missing SchemaV1.${method}().`);
}

let truthComparisonCount = 0;
let invalidCaseCount = 0;
let identifierCount = 0;

function compareUnicodeScalars(left, right) {
  const leftPoints = Array.from(left, character => character.codePointAt(0));
  const rightPoints = Array.from(right, character => character.codePointAt(0));
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index++) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function makeAssignment(keys) {
  const assignment = Object.create(null);
  keys.forEach(key => {
    Object.defineProperty(assignment, key, {
      value: true,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  });
  return assignment;
}

function cloneJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshot(model) {
  return Array.from(model.getRawStates(), state => {
    if (state === null) return null;
    return {
      trueAtoms: Object.keys(state.assignment)
        .filter(atom => state.assignment[atom] === true)
        .sort(compareUnicodeScalars),
      transitions: Array.from(
        state.successors,
        successor => ({ target: successor.target, agent: successor.agent })
      )
        .sort((left, right) =>
          left.target - right.target || compareUnicodeScalars(left.agent, right.agent)
        ),
    };
  });
}

function snapshotString(model) {
  return JSON.stringify(snapshot(model));
}

function assertSuccess(result, label) {
  assert.ok(result && result.ok === true, `${label}: expected {ok:true}, got ${JSON.stringify(result)}.`);
  return result;
}

function assertFailure(result, expectedCode, label) {
  assert.ok(result && result.ok === false, `${label}: expected {ok:false}.`);
  assert.ok(result.error && typeof result.error === 'object', `${label}: missing structured error.`);
  assert.strictEqual(result.error.code, expectedCode, `${label}: wrong error code.`);
  assert.strictEqual(typeof result.error.message, 'string', `${label}: message must be a string.`);
  assert.ok(result.error.message.length > 0, `${label}: message must not be empty.`);
  assert.strictEqual(typeof result.error.path, 'string', `${label}: path must be a string.`);
  return result;
}

function encode(model, label) {
  const result = assertSuccess(SchemaV1.encodeModel(model), label || 'encodeModel');
  assert.ok(result.document && typeof result.document === 'object', `${label}: missing document.`);
  return cloneJSON(result.document);
}

function decode(document, label) {
  const result = assertSuccess(SchemaV1.decodeModel(document), label || 'decodeModel');
  assert.ok(result.model instanceof MPL.Model, `${label}: decoder must return a fresh MPL.Model.`);
  assert.ok(result.canonicalDocument, `${label}: decoder must return its canonical document.`);
  return {
    model: result.model,
    canonicalDocument: cloneJSON(result.canonicalDocument),
  };
}

function addSlots(model, assignments, nullIndices) {
  assignments.forEach(assignment => model.addState(assignment));
  nullIndices.forEach(index => model.removeState(index));
  return model;
}

function assertRoundTrip(model, label) {
  const before = snapshot(model);
  const firstDocument = encode(model, `${label} encode`);
  const decoded = decode(firstDocument, `${label} decode`);
  assert.deepStrictEqual(snapshot(decoded.model), before, `${label}: semantic snapshot changed.`);
  const secondDocument = encode(decoded.model, `${label} re-encode`);
  assert.deepStrictEqual(secondDocument, firstDocument, `${label}: canonical document changed.`);
  return { document: firstDocument, model: decoded.model };
}

function testMinimizedStructuralExample() {
  const model = new MPL.Model();
  const assignments = Array.from({ length: 12 }, (_, index) =>
    makeAssignment(index === 0 ? ['p', 'foo', 'bar_baz', 'atom10'] : [`world_${index}`])
  );
  addSlots(model, assignments, [2]);
  model.addTransition(0, 10, 'alice');
  model.addTransition(0, 3, 'agent_b');
  model.addTransition(0, 10, 'agent_b');
  model.addTransition(10, 11, 'relation-long');

  const encoded = encode(model, 'minimized structure');
  assert.strictEqual(encoded.format, 'bapal-model');
  assert.strictEqual(encoded.version, 1);
  assert.strictEqual(encoded.worlds.length, 12);
  assert.strictEqual(encoded.worlds[2], null);
  assert.deepStrictEqual(encoded.worlds[0], {
    trueAtoms: ['atom10', 'bar_baz', 'foo', 'p'],
    transitions: [
      { target: 3, agent: 'agent_b' },
      { target: 10, agent: 'agent_b' },
      { target: 10, agent: 'alice' },
    ],
  });

  const decoded = decode(encoded, 'minimized structure');
  assert.deepStrictEqual(snapshot(decoded.model), snapshot(model));
  assert.deepStrictEqual(encode(decoded.model, 'minimized structure re-encode'), encoded);
}

function testCanonicalization() {
  const unsorted = {
    format: 'bapal-model',
    version: 1,
    worlds: [
      {
        trueAtoms: ['p', 'atom10', 'bar_baz'],
        transitions: [
          { target: 1, agent: 'z' },
          { target: 0, agent: 'alice' },
          { target: 0, agent: 'a' },
        ],
      },
      { trueAtoms: [], transitions: [] },
    ],
  };
  const result = decode(unsorted, 'unsorted valid document');
  assert.deepStrictEqual(result.canonicalDocument.worlds[0], {
    trueAtoms: ['atom10', 'bar_baz', 'p'],
    transitions: [
      { target: 0, agent: 'a' },
      { target: 0, agent: 'alice' },
      { target: 1, agent: 'z' },
    ],
  });
  assert.deepStrictEqual(encode(result.model, 'unsorted re-encode'), result.canonicalDocument);

  const stringResult = assertSuccess(
    SchemaV1.canonicalStringify(unsorted),
    'canonicalStringify'
  );
  assert.strictEqual(
    stringResult.json,
    '{"format":"bapal-model","version":1,"worlds":[{"trueAtoms":["atom10","bar_baz","p"],"transitions":[{"target":0,"agent":"a"},{"target":0,"agent":"alice"},{"target":1,"agent":"z"}]},{"trueAtoms":[],"transitions":[]}]}',
    'Canonical string key and array order must be fixed.'
  );

  assertFailure(
    SchemaV1.decodeModel({
      format: 'bapal-model',
      version: 1,
      worlds: [{
        trueAtoms: [],
        transitions: [{ target: 0, agent: 'a' }, { agent: 'a', target: 0 }],
      }],
    }),
    'DUPLICATE_TRANSITION',
    'duplicate transitions'
  );

  const invalidBeforeCanonicalSort = assertFailure(
    SchemaV1.validateModelDocument({
      format: 'bapal-model',
      version: 1,
      worlds: [{
        trueAtoms: [],
        transitions: [{ target: 99, agent: 'z' }, { target: 0, agent: 'a' }],
      }],
    }),
    'TARGET_OUT_OF_RANGE',
    'invalid target before canonical sorting'
  );
  assert.strictEqual(
    invalidBeforeCanonicalSort.error.path,
    '/worlds/0/transitions/0/target',
    'Validation errors must retain the input transition index rather than a sorted canonical index.'
  );
  assert.strictEqual(invalidBeforeCanonicalSort.error.transitionIndex, 0);

  const corruptedModel = new MPL.Model();
  corruptedModel.addState({});
  corruptedModel.addTransition(0, 0, 'a');
  corruptedModel.getRawStates()[0].successors.push({ target: 0, agent: 'a' });
  assertFailure(
    SchemaV1.encodeModel(corruptedModel),
    'DUPLICATE_TRANSITION',
    'duplicate transitions in raw model'
  );
}

function documentFromSlots(slotKinds, transitions) {
  return {
    format: 'bapal-model',
    version: 1,
    worlds: slotKinds.map((kind, index) =>
      kind === null ? null : { trueAtoms: [`w${index}`], transitions: [] }
    ),
  };
}

function testNullSlots() {
  const cases = [
    { label: 'empty worlds', slots: [] },
    { label: 'one null world', slots: [null] },
    { label: 'leading nulls', slots: [null, null, 'live'] },
    { label: 'internal nulls', slots: ['live', null, 'live', null, 'live'] },
    { label: 'trailing nulls', slots: ['live', null, null] },
    { label: 'many sparse slots', slots: [null, 'live', null, null, 'live', null, 'live', null] },
  ];

  cases.forEach(testCase => {
    const document = documentFromSlots(testCase.slots);
    const result = decode(document, testCase.label);
    assert.strictEqual(result.model.getRawStates().length, testCase.slots.length, `${testCase.label}: length.`);
    assert.deepStrictEqual(
      Array.from(result.model.getRawStates(), state => state === null),
      testCase.slots.map(slot => slot === null),
      `${testCase.label}: null positions.`
    );
    assert.deepStrictEqual(encode(result.model, `${testCase.label} re-encode`), result.canonicalDocument);
  });

  const afterHoles = documentFromSlots([null, 'live', null, null, 'live', null, 'live']);
  afterHoles.worlds[1].transitions.push({ target: 6, agent: 'after-holes' });
  const result = decode(afterHoles, 'live target after holes');
  assert.strictEqual(result.model.getRawStates()[1].successors[0].target, 6);
}

function testIdentifierPreservation() {
  const identifiers = [
    'foo',
    'bar_baz',
    'atom10',
    'alice',
    'agent_b',
    'with spaces',
    'punct.!?/:-',
    'quote\'"\\',
    '<angle brackets>',
    '漢字代理',
    '😀',
    'e\u0301',
    '__proto__',
    'constructor',
    'prototype',
  ];
  identifierCount = identifiers.length;

  const document = {
    format: 'bapal-model',
    version: 1,
    worlds: [{
      trueAtoms: identifiers.slice().reverse(),
      transitions: identifiers.slice().reverse().map(agent => ({ target: 0, agent })),
    }],
  };
  const decoded = decode(document, 'adversarial identifiers');
  const assignment = decoded.model.getRawStates()[0].assignment;
  assert.deepStrictEqual(Object.keys(assignment).sort(compareUnicodeScalars), identifiers.slice().sort(compareUnicodeScalars));
  identifiers.forEach(identifier => {
    assert.strictEqual(decoded.model.valuation(identifier, 0), true, `${identifier}: valuation lost.`);
    assert.ok(
      decoded.model.getRawStates()[0].successors.some(successor => successor.agent === identifier),
      `${identifier}: relation label lost.`
    );
  });
  assert.deepStrictEqual(encode(decoded.model, 'adversarial identifiers re-encode'), decoded.canonicalDocument);

  const absent = new MPL.Model();
  absent.addState({});
  for (const identifier of ['__proto__', 'constructor', 'prototype']) {
    assert.strictEqual(absent.valuation(identifier, 0), false, `${identifier}: absent atom must be false.`);
  }

  const pollutedPrototype = { inherited_pollution: true };
  const pollutedInput = Object.create(pollutedPrototype);
  pollutedInput.own_atom = true;
  const pollutionModel = new MPL.Model();
  pollutionModel.addState(pollutedInput);
  assert.deepStrictEqual(Object.keys(pollutionModel.getRawStates()[0].assignment), ['own_atom']);
  assert.strictEqual(pollutionModel.valuation('inherited_pollution', 0), false);

  for (const invalidIdentifier of ['\ud800', '\udc00', '']) {
    assertFailure(
      SchemaV1.decodeModel({
        format: 'bapal-model',
        version: 1,
        worlds: [{ trueAtoms: [invalidIdentifier], transitions: [] }],
      }),
      'INVALID_IDENTIFIER',
      `invalid atom ${JSON.stringify(invalidIdentifier)}`
    );
    assertFailure(
      SchemaV1.decodeModel({
        format: 'bapal-model',
        version: 1,
        worlds: [{ trueAtoms: [], transitions: [{ target: 0, agent: invalidIdentifier }] }],
      }),
      'INVALID_IDENTIFIER',
      `invalid agent ${JSON.stringify(invalidIdentifier)}`
    );
  }
}

function invalidDocuments() {
  const baseWorld = () => ({ trueAtoms: [], transitions: [] });
  return [
    ['null document', null, 'INVALID_DOCUMENT'],
    ['array document', [], 'INVALID_DOCUMENT'],
    ['wrong format', { format: 'legacy-model', version: 1, worlds: [] }, 'INVALID_FORMAT'],
    ['version zero', { format: 'bapal-model', version: 0, worlds: [] }, 'UNSUPPORTED_VERSION'],
    ['version two', { format: 'bapal-model', version: 2, worlds: [] }, 'UNSUPPORTED_VERSION'],
    ['string version', { format: 'bapal-model', version: '1', worlds: [] }, 'INVALID_VERSION_TYPE'],
    ['missing worlds', { format: 'bapal-model', version: 1 }, 'MISSING_PROPERTY'],
    ['extra top field', { format: 'bapal-model', version: 1, worlds: [], extra: true }, 'UNEXPECTED_PROPERTY'],
    ['world number', { format: 'bapal-model', version: 1, worlds: [7] }, 'INVALID_WORLD'],
    ['missing trueAtoms', { format: 'bapal-model', version: 1, worlds: [{ transitions: [] }] }, 'MISSING_PROPERTY'],
    ['missing transitions', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [] }] }, 'MISSING_PROPERTY'],
    ['extra world field', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [], extra: 1 }] }, 'UNEXPECTED_PROPERTY'],
    ['invalid atom type', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [3], transitions: [] }] }, 'INVALID_IDENTIFIER'],
    ['empty atom', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [''], transitions: [] }] }, 'INVALID_IDENTIFIER'],
    ['duplicate atom', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: ['p', 'p'], transitions: [] }] }, 'DUPLICATE_ATOM'],
    ['transition null', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [null] }] }, 'INVALID_TRANSITION'],
    ['missing target', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ agent: 'a' }] }] }, 'MISSING_PROPERTY'],
    ['missing agent', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0 }] }] }, 'MISSING_PROPERTY'],
    ['extra transition field', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0, agent: 'a', extra: 1 }] }] }, 'UNEXPECTED_PROPERTY'],
    ['negative target', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: -1, agent: 'a' }] }] }, 'NEGATIVE_TARGET'],
    ['fractional target', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0.5, agent: 'a' }] }] }, 'TARGET_NOT_INTEGER'],
    ['unsafe target', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: Number.MAX_SAFE_INTEGER + 1, agent: 'a' }] }] }, 'UNSAFE_TARGET'],
    ['out of range target', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 1, agent: 'a' }] }] }, 'TARGET_OUT_OF_RANGE'],
    ['target to null', { format: 'bapal-model', version: 1, worlds: [baseWorld(), null, baseWorld()] }, 'TARGET_NOT_LIVE'],
    ['empty agent', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0, agent: '' }] }] }, 'INVALID_IDENTIFIER'],
    ['invalid agent type', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0, agent: 3 }] }] }, 'INVALID_IDENTIFIER'],
    ['duplicate transition data', { format: 'bapal-model', version: 1, worlds: [{ trueAtoms: [], transitions: [{ target: 0, agent: 'a' }, { target: 0, agent: 'a' }] }] }, 'DUPLICATE_TRANSITION'],
  ].map(entry => {
    if (entry[0] === 'target to null') {
      entry[1].worlds[0].transitions.push({ target: 1, agent: 'a' });
    }
    return entry;
  });
}

function testSchemaAndVersionValidation() {
  const cases = invalidDocuments();
  invalidCaseCount = cases.length;
  cases.forEach(([label, document, code]) => {
    assertFailure(SchemaV1.validateModelDocument(document), code, `${label} validation`);
    assertFailure(SchemaV1.decodeModel(document), code, `${label} decode`);
    assertFailure(SchemaV1.canonicalStringify(document), code, `${label} stringify`);
  });

  const schemaDocument = JSON.parse(
    fs.readFileSync(path.join(root, 'schemas/bapal-model-v1.schema.json'), 'utf8')
  );
  assert.strictEqual(schemaDocument.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.strictEqual(schemaDocument.properties.format.const, 'bapal-model');
  assert.strictEqual(schemaDocument.properties.version.const, 1);
  assert.strictEqual(schemaDocument.additionalProperties, false);
  assert.strictEqual(schemaDocument.$defs.world.additionalProperties, false);
  assert.strictEqual(schemaDocument.$defs.transition.additionalProperties, false);
}

function makeExistingModel() {
  const model = new MPL.Model();
  addSlots(model, [makeAssignment(['p']), makeAssignment(['removed']), makeAssignment(['q'])], [1]);
  model.addTransition(0, 2, 'alice');
  model.addTransition(2, 0, 'agent_b');
  return model;
}

function testAtomicDecode() {
  const existing = makeExistingModel();
  const existingBefore = snapshotString(existing);

  invalidDocuments().forEach(([label, document, code]) => {
    const inputBefore = JSON.stringify(document);
    assertFailure(SchemaV1.decodeModel(document), code, `atomic ${label}`);
    assert.strictEqual(snapshotString(existing), existingBefore, `atomic ${label}: existing model changed.`);
    assert.strictEqual(JSON.stringify(document), inputBefore, `atomic ${label}: caller document changed.`);
  });

  const valid = encode(existing, 'atomic valid source');
  const OriginalModel = MPL.Model;
  MPL.Model = function ModelRejectingLegacyLoad() {
    const model = new OriginalModel();
    model.loadFromModelString = function forbiddenLegacyLoad() {
      throw new Error('Schema decoder called legacy compact loading.');
    };
    return model;
  };
  try {
    assertSuccess(SchemaV1.decodeModel(valid), 'decode without legacy compact loading');
  } finally {
    MPL.Model = OriginalModel;
  }
}

function testMutableIndependence() {
  const original = makeExistingModel();
  original.getModelString = function forbiddenLegacyEncode() {
    throw new Error('Schema encoder called legacy compact serialization.');
  };
  const encoded = encode(original, 'independence encode');
  const input = cloneJSON(encoded);
  const decoded = decode(input, 'independence decode').model;

  original.editState(0, { original_only: true });
  original.addTransition(0, 0, 'original-only');
  assert.strictEqual(decoded.valuation('original_only', 0), false);
  assert.ok(!decoded.getRawStates()[0].successors.some(item => item.agent === 'original-only'));

  decoded.editState(0, { decoded_only: true });
  decoded.addTransition(0, 0, 'decoded-only');
  assert.strictEqual(original.valuation('decoded_only', 0), false);
  assert.ok(!original.getRawStates()[0].successors.some(item => item.agent === 'decoded-only'));

  input.worlds[0].trueAtoms.push('input_mutation');
  input.worlds[0].transitions.push({ target: 0, agent: 'input-mutation' });
  assert.strictEqual(decoded.valuation('input_mutation', 0), false);
  assert.ok(!decoded.getRawStates()[0].successors.some(item => item.agent === 'input-mutation'));

  encoded.worlds[0].trueAtoms.push('encoded_mutation');
  encoded.worlds[0].transitions.push({ target: 0, agent: 'encoded-mutation' });
  assert.strictEqual(original.valuation('encoded_mutation', 0), false);
  assert.ok(!original.getRawStates()[0].successors.some(item => item.agent === 'encoded-mutation'));
}

function makeSemanticFixtures() {
  const propositional = new MPL.Model();
  propositional.addState(makeAssignment(['p', 'foo']));
  propositional.addState(makeAssignment(['q']));

  const multipleAgents = new MPL.Model();
  multipleAgents.addState(makeAssignment(['p']));
  multipleAgents.addState(makeAssignment(['p', 'q']));
  multipleAgents.addState(makeAssignment(['q']));
  multipleAgents.addTransition(0, 1, 'a');
  multipleAgents.addTransition(0, 2, 'b');
  multipleAgents.addTransition(1, 1, 'a');
  multipleAgents.addTransition(2, 2, 'b');

  const s5 = new MPL.Model();
  s5.addState(makeAssignment(['p']));
  s5.addState(makeAssignment(['p', 'q']));
  s5.addState(makeAssignment(['q']));
  s5.addTransition(0, 1, 'a');
  s5.closeEquivalenceRelations(['a', 'b']);

  const nonS5 = new MPL.Model();
  nonS5.addState(makeAssignment(['p']));
  nonS5.addState(makeAssignment(['q']));
  nonS5.addTransition(0, 1, 'a');

  const pal = new MPL.Model();
  pal.addState(makeAssignment(['p', 'q']));
  pal.addState(makeAssignment(['p']));
  pal.addState(makeAssignment(['q']));
  pal.addTransition(0, 0, 'a');
  pal.addTransition(0, 1, 'a');
  pal.addTransition(0, 2, 'a');
  pal.addTransition(1, 0, 'a');
  pal.addTransition(2, 2, 'a');

  const bapal = new MPL.Model();
  bapal.addState(makeAssignment(['p', 'foo']));
  bapal.addState(makeAssignment(['p', 'foo']));
  bapal.addState(makeAssignment(['q']));
  bapal.addState(makeAssignment([]));
  for (let source = 0; source < 4; source++) {
    for (let target = 0; target < 4; target++) bapal.addTransition(source, target, 'a');
  }

  return [
    ['propositional', propositional],
    ['multiple agents', multipleAgents],
    ['S5', s5],
    ['non-S5', nonS5],
    ['PAL', pal],
    ['BAPAL valuation classes', bapal],
  ];
}

function assertTruthPreserved(original, decoded, formulas, label) {
  formulas.forEach(formula => {
    const wff = new MPL.Wff(formula);
    original.getRawStates().forEach((state, world) => {
      if (state === null) return;
      assert.strictEqual(
        MPL.truth(decoded, world, wff),
        MPL.truth(original, world, wff),
        `${label}: ${formula} at world ${world}.`
      );
      truthComparisonCount++;
    });
  });
}

function testSemanticPreservation() {
  const formulas = [
    'p',
    'foo',
    '~p',
    '(p & q)',
    '(p | q)',
    'K{a}p',
    'K{b}q',
    '[p]q',
    '^p',
    '^K{a}p',
    '[p]^K{a}q',
    '^[p]K{a}q',
  ];

  makeSemanticFixtures().forEach(([label, model]) => {
    const roundTrip = assertRoundTrip(model, label);
    assertTruthPreserved(model, roundTrip.model, formulas, label);
    if (label === 'S5') {
      assert.strictEqual(roundTrip.model.isEquivalenceRelation('a'), true);
      assert.strictEqual(roundTrip.model.isEquivalenceRelation('b'), true);
    }
  });
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value = (value + 0x6D2B79F5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(random, upperExclusive) {
  return Math.floor(random() * upperExclusive);
}

const generatedAtomPool = ['p', 'q', 'foo', 'bar_baz', 'atom10', '漢字', '😀', 'e\u0301'];
const generatedAgentPool = ['a', 'b', 'alice', 'agent_b', '代理', '😀', '__proto__'];

function generateModelSpec(random) {
  const slotCount = integer(random, 21);
  const worlds = [];
  for (let world = 0; world < slotCount; world++) {
    if (random() < 0.3) {
      worlds.push(null);
      continue;
    }
    const atomAttempts = integer(random, 6);
    const atomSet = new Set();
    for (let attempt = 0; attempt < atomAttempts; attempt++) {
      atomSet.add(generatedAtomPool[integer(random, generatedAtomPool.length)]);
    }
    worlds.push({ trueAtoms: [...atomSet], transitionAttempts: [] });
  }

  const live = worlds.map((world, index) => world === null ? null : index).filter(index => index !== null);
  worlds.forEach(world => {
    if (world === null || live.length === 0) return;
    const transitionAttempts = integer(random, 8);
    for (let attempt = 0; attempt < transitionAttempts; attempt++) {
      const transition = {
        target: live[integer(random, live.length)],
        agent: generatedAgentPool[integer(random, generatedAgentPool.length)],
      };
      world.transitionAttempts.push(transition);
      if (random() < 0.25) world.transitionAttempts.push({ ...transition });
    }
  });
  return { worlds };
}

function modelFromGeneratedSpec(spec) {
  const model = new MPL.Model();
  spec.worlds.forEach(world => model.addState(makeAssignment(world === null ? [] : world.trueAtoms)));
  spec.worlds.forEach((world, index) => {
    if (world === null) model.removeState(index);
  });
  spec.worlds.forEach((world, source) => {
    if (world === null) return;
    world.transitionAttempts.forEach(transition => {
      model.addTransition(source, transition.target, transition.agent);
    });
  });
  return model;
}

function testGeneratedCorpus() {
  const random = mulberry32(SCHEMA_SEED);
  let sparseModelCount = 0;
  let nullSlotCount = 0;
  let multiDigitModelCount = 0;
  let unicodeModelCount = 0;

  for (let caseIndex = 0; caseIndex < GENERATED_MODEL_COUNT; caseIndex++) {
    const spec = generateModelSpec(random);
    const model = modelFromGeneratedSpec(spec);
    const nulls = spec.worlds.filter(world => world === null).length;
    if (nulls > 0) sparseModelCount++;
    nullSlotCount += nulls;
    if (spec.worlds.some(world => world !== null && world.transitionAttempts.some(item => item.target >= 10))) {
      multiDigitModelCount++;
    }
    if (spec.worlds.some(world => world !== null && (
      world.trueAtoms.some(atom => /[^\u0000-\u007f]/.test(atom)) ||
      world.transitionAttempts.some(item => /[^\u0000-\u007f]/.test(item.agent))
    ))) {
      unicodeModelCount++;
    }

    try {
      const before = snapshot(model);
      const first = encode(model, `generated ${caseIndex} encode`);
      const decoded = decode(first, `generated ${caseIndex} decode`).model;
      assert.deepStrictEqual(snapshot(decoded), before, `generated ${caseIndex}: snapshot mismatch.`);
      assert.deepStrictEqual(
        encode(decoded, `generated ${caseIndex} re-encode`),
        first,
        `generated ${caseIndex}: canonical mismatch.`
      );

      if (caseIndex % 1000 === 0) {
        assertTruthPreserved(model, decoded, ['p', '~q', '(p | q)', 'K{a}p', '[p]q'], `generated ${caseIndex}`);
      }
    } catch (error) {
      console.error(`Model Schema v1 replay: seed=${SCHEMA_SEED} case=${caseIndex}`);
      console.error(JSON.stringify(spec));
      throw error;
    }
  }

  console.log(`Model Schema v1 seed: ${SCHEMA_SEED} (0x${SCHEMA_SEED.toString(16)})`);
  console.log(`Generated models: ${GENERATED_MODEL_COUNT}`);
  console.log(`Sparse models: ${sparseModelCount}; null slots: ${nullSlotCount}`);
  console.log(`Models with multi-digit targets: ${multiDigitModelCount}`);
  console.log(`Models with Unicode identifiers: ${unicodeModelCount}`);
}

testMinimizedStructuralExample();
testCanonicalization();
testNullSlots();
testIdentifierPreservation();
testSchemaAndVersionValidation();
testAtomicDecode();
testMutableIndependence();
testSemanticPreservation();
testGeneratedCorpus();

console.log('Model Schema v1 deterministic groups: 9');
console.log(`Adversarial identifiers: ${identifierCount}`);
console.log(`Invalid document cases: ${invalidCaseCount}`);
console.log(`Truth comparisons: ${truthComparisonCount}`);
console.log('Model Schema v1 checks passed.');
