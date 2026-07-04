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

function addS5Pair(model, source, target, agent) {
  model.addTransition(source, target, agent);
  model.addTransition(target, source, agent);
}

function assertTruth(model, state, formula, expected, message) {
  assert.strictEqual(MPL.truth(model, state, wff(formula)), expected, message);
}

function testBapalParsingAndPrinting() {
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

function testBapalDistinguishesDifferentValuations() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  addS5Pair(model, 0, 1, 'a');
  model.closeEquivalenceClass('a', [0, 1]);

  assertTruth(
    model,
    0,
    '^K{a}p',
    true,
    'BAPAL should allow announcing p to distinguish p-worlds from non-p-worlds.'
  );
}

function testBapalCannotDistinguishSameValuation() {
  const model = new MPL.Model();
  const pq = {};
  pq.p = true;
  pq.q = true;

  const qp = {};
  qp.q = true;
  qp.p = true;

  model.addState(pq);
  model.addState(qp);
  model.addTransition(0, 1, 'a');

  assertTruth(
    model,
    0,
    '^~<>(p|~p)',
    false,
    'BAPAL should not split worlds with the same Boolean valuation.'
  );
}

function testPublicAnnouncementStillWorks() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  addS5Pair(model, 0, 1, 'a');
  model.closeEquivalenceClass('a', [0, 1]);

  assertTruth(
    model,
    0,
    '[p]K{a}p',
    true,
    'After announcing p, only p-worlds should remain, so agent a knows p.'
  );
  assertTruth(
    model,
    1,
    '[p]K{a}p',
    true,
    'PAL implication should be vacuously true at worlds removed by the announcement.'
  );
}

function testS5ClosureCreatesEquivalenceRelation() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  model.addState({ q: true });

  addS5Pair(model, 0, 1, 'a');
  model.closeEquivalenceClass('a', [0, 1]);
  addS5Pair(model, 1, 2, 'a');
  const classStates = model.closeEquivalenceClass('a', [1, 2]);

  assert.strictEqual(classStates.join(','), '0,1,2');
  assert.strictEqual(model.isReflexive('a'), true);
  assert.strictEqual(model.isSymmetric('a'), true);
  assert.strictEqual(model.isTransitive('a'), true);
}

function testHiddenSelfLoopsAffectSemantics() {
  const model = new MPL.Model();
  model.addState({ p: true });

  model.closeEquivalenceClass('a', [0]);

  assert.strictEqual(
    model.isSuccessor(0, 0, 'a'),
    true,
    'S5 closure should store the self-loop even if the UI hides it.'
  );
  assertTruth(
    model,
    0,
    'K{a}~p',
    false,
    'The stored self-loop should be used by semantic evaluation of knowledge.'
  );
}

const tests = [
  ['parsing and pretty-printing of ^φ', testBapalParsingAndPrinting],
  ['BAPAL distinguishes different Boolean valuations', testBapalDistinguishesDifferentValuations],
  ['BAPAL cannot distinguish same Boolean valuation', testBapalCannotDistinguishSameValuation],
  ['public announcement [A]B still works', testPublicAnnouncementStillWorks],
  ['S5 closure creates equivalence relations', testS5ClosureCreatesEquivalenceRelation],
  ['hidden self-loops are semantically present', testHiddenSelfLoopsAffectSemantics],
];

for (const [name, test] of tests) {
  test();
  console.log('PASS:', name);
}
