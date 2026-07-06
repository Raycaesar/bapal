#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});

const MPL = context.MPL;

function makeThreeWorldModel() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({});
  model.addState({ q: true });
  return model;
}

function assertS5(model, agent, message) {
  assert.strictEqual(model.isReflexive(agent), true, `${message}: expected reflexive relation.`);
  assert.strictEqual(model.isSymmetric(agent), true, `${message}: expected symmetric relation.`);
  assert.strictEqual(model.isTransitive(agent), true, `${message}: expected transitive relation.`);
}

function testS5ClosureMergesEquivalenceClasses() {
  const model = makeThreeWorldModel();

  model.addTransition(0, 1, 'a');
  model.addTransition(1, 0, 'a');
  let classStates = model.closeEquivalenceClass('a', [0, 1]);

  assert.strictEqual(classStates.join(','), '0,1');

  for (let source = 0; source <= 1; source++) {
    for (let target = 0; target <= 1; target++) {
      assert.strictEqual(
        model.isSuccessor(source, target, 'a'),
        true,
        `missing first-class S5 transition ${source} -> ${target} for agent a.`
      );
    }
  }

  assert.strictEqual(model.isReflexive('a'), true, 'S5 closure should store reflexive loops for all worlds.');

  model.addTransition(1, 2, 'a');
  model.addTransition(2, 1, 'a');
  classStates = model.closeEquivalenceClass('a', [1, 2]);

  assert.strictEqual(classStates.join(','), '0,1,2');

  for (let source = 0; source <= 2; source++) {
    for (let target = 0; target <= 2; target++) {
      assert.strictEqual(
        model.isSuccessor(source, target, 'a'),
        true,
        `missing S5 transition ${source} -> ${target} for agent a.`
      );
    }
  }

  assertS5(model, 'a', 'merged S5 closure');
}

function testOrdinaryRelationDeletionStillWorks() {
  const model = makeThreeWorldModel();
  model.addTransition(0, 1, 'a');
  model.addTransition(1, 0, 'a');

  model.removeTransition(0, 1, 'a');

  assert.strictEqual(model.isSuccessor(0, 1, 'a'), false);
  assert.strictEqual(model.isSuccessor(1, 0, 'a'), true);
}

function testDeletingWorldFromS5ModelLeavesRemainingRelationS5() {
  const model = makeThreeWorldModel();
  model.addTransition(0, 1, 'a');
  model.addTransition(1, 0, 'a');
  model.closeEquivalenceClass('a', [0, 1]);
  model.addTransition(1, 2, 'a');
  model.addTransition(2, 1, 'a');
  model.closeEquivalenceClass('a', [1, 2]);

  model.removeState(1);

  assert.strictEqual(model.getStates()[1], null);
  assert.strictEqual(model.isSuccessor(0, 1, 'a'), false);
  assert.strictEqual(model.isSuccessor(2, 1, 'a'), false);
  assertS5(model, 'a', 'remaining relation after deleting a world');
}

function testS5SelectedRelationEditsAreGuardedInApp() {
  const appSource = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const guardCalls = appSource.match(/ignoreS5SelectedRelationEdit\(\)/g) || [];

  assert.ok(
    appSource.includes('S5 mode keeps relations as equivalence classes. Switch S5 mode off to edit individual arrows.'),
    'Expected the S5 relation edit warning message in app.js.'
  );
  assert.ok(
    guardCalls.length >= 4,
    'Expected selected-relation Delete/L/R/B handlers to call the S5 no-op guard.'
  );
}

const tests = [
  ['S5 closure stores reflexive loops and closes agent relations', testS5ClosureMergesEquivalenceClasses],
  ['ordinary-mode relation deletion still removes one directed edge', testOrdinaryRelationDeletionStillWorks],
  ['deleting a world from an S5 model leaves the remaining relation S5', testDeletingWorldFromS5ModelLeavesRemainingRelationS5],
  ['S5 selected-relation Delete/L/R/B edits are guarded in the app', testS5SelectedRelationEditsAreGuardedInApp],
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
