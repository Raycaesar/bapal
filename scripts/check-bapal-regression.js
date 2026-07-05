#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});

const MPL = context.MPL;

function wff(input) {
  return new MPL.Wff(input);
}

function assertTruth(model, state, formula, expected, message) {
  assert.strictEqual(MPL.truth(model, state, wff(formula)), expected, message);
}

function addS5Class(model, agent, worlds) {
  worlds.forEach(source => {
    worlds.forEach(target => {
      model.addTransition(source, target, agent);
    });
  });
}

function testBapalParsingAndRendering() {
  const formula = wff('^K{a}p');

  assert.strictEqual(formula.ascii(), '^K{a}p');
  assert.deepStrictEqual(formula.json(), {
    bapal: {
      kno_start: {
        kno_end: [
          { prop: 'a' },
          { prop: 'p' },
        ],
      },
    },
  });
  assert.strictEqual(formula.unicode(), '⟨!⟩K{a}p');
  assert.strictEqual(formula.latex(), '\\langle!\\rangle{}K_{a}p');
}

function testBapalCannotSeparateSameValuation() {
  const model = new MPL.Model();
  const pq = {};
  pq.p = true;
  pq.q = true;

  const qp = {};
  qp.q = true;
  qp.p = true;

  model.addState(pq);
  model.addState(qp);
  model.addTransition(0, 0, 'a');
  model.addTransition(0, 1, 'a');

  assertTruth(
    model,
    0,
    '^~<>(p|~p)',
    false,
    'BAPAL should not find a Boolean announcement that keeps w0 but removes same-valuation w1.'
  );
}

function testBapalCanSeparateDifferentValuations() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  addS5Class(model, 'a', [0, 1]);

  assertTruth(
    model,
    0,
    '^K{a}p',
    true,
    'BAPAL should use the Boolean announcement p to keep the p-world and remove the non-p-world.'
  );
}

function testPublicAnnouncementStillWorks() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  addS5Class(model, 'a', [0, 1]);

  assertTruth(
    model,
    0,
    '[p]K{a}p',
    true,
    'After announcing p, the remaining p-world should satisfy K{a}p.'
  );
  assertTruth(
    model,
    1,
    '[p]K{a}p',
    true,
    'A public announcement formula is vacuously true at worlds where the announcement is false.'
  );
}

function testPublicAnnouncementRemovesMultiAgentIncomingEdges() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  model.addTransition(0, 0, 'b');
  model.addTransition(0, 1, 'a');
  model.addTransition(0, 1, 'b');

  assertTruth(
    model,
    0,
    '[p]K{b}p',
    true,
    'Removing a non-p world should remove all incoming agent edges to it, not only the first one.'
  );
}

function testBapalKnowledgeInSmallS5Model() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  model.addState({ p: true });
  addS5Class(model, 'a', [0, 1, 2]);

  assertTruth(
    model,
    0,
    'K{a}p',
    false,
    'Before any Boolean announcement, agent a sees a non-p world.'
  );
  assertTruth(
    model,
    0,
    '^K{a}p',
    true,
    'In this S5 model, announcing p leaves only p-worlds in the a-equivalence class.'
  );
}

function testCloseEquivalenceClass() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  model.addState({ q: true });

  model.addTransition(0, 1, 'a');
  model.addTransition(1, 0, 'a');
  model.closeEquivalenceClass('a', [0, 1]);
  model.addTransition(1, 2, 'a');
  model.addTransition(2, 1, 'a');
  const classStates = model.closeEquivalenceClass('a', [1, 2]);

  assert.strictEqual(classStates.join(','), '0,1,2');
  assert.strictEqual(model.isReflexive('a'), true);
  assert.strictEqual(model.isSymmetric('a'), true);
  assert.strictEqual(model.isTransitive('a'), true);
}

function testStoredSelfLoopsDriveSemantics() {
  const model = new MPL.Model();
  model.addState({ p: true });

  model.closeEquivalenceClass('a', [0]);

  assert.strictEqual(
    model.isSuccessor(0, 0, 'a'),
    true,
    'S5 closure should store the self-loop in MPL.Model.'
  );
  assertTruth(
    model,
    0,
    'K{a}~p',
    false,
    'Knowledge evaluation must use the stored self-loop; no visual self-loop object is needed.'
  );
}

const tests = [
  ['^A parsing and rendering', testBapalParsingAndRendering],
  ['BAPAL cannot separate same propositional valuation', testBapalCannotSeparateSameValuation],
  ['BAPAL can separate different propositional valuations', testBapalCanSeparateDifferentValuations],
  ['Public announcement [A]B still works', testPublicAnnouncementStillWorks],
  ['Public announcement removes multi-agent incoming edges', testPublicAnnouncementRemovesMultiAgentIncomingEdges],
  ['^K{a}p behaves as expected in a small S5 model', testBapalKnowledgeInSmallS5Model],
  ['Model.closeEquivalenceClass creates an equivalence relation', testCloseEquivalenceClass],
  ['Stored self-loops, not visual loops, drive semantic evaluation', testStoredSelfLoopsDriveSemantics],
];

try {
  for (const [name, test] of tests) {
    test();
    console.log('PASS:', name);
  }
} catch (error) {
  console.error('FAIL:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}
