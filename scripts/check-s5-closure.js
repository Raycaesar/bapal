#!/usr/bin/env node

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
const model = new MPL.Model();

model.addState({ p: true });
model.addState({});
model.addState({ q: true });

model.addTransition(0, 1, 'a');
model.addTransition(1, 0, 'a');
let classStates = model.closeEquivalenceClass('a', [0, 1]);

if (classStates.join(',') !== '0,1') {
  console.error('FAIL: expected first S5 class to contain worlds 0 and 1, got:', classStates);
  process.exit(1);
}

for (let source = 0; source <= 1; source++) {
  for (let target = 0; target <= 1; target++) {
    if (!model.isSuccessor(source, target, 'a')) {
      console.error(`FAIL: missing first-class S5 transition ${source} -> ${target} for agent a.`);
      process.exit(1);
    }
  }
}

if (!model.isReflexive('a')) {
  console.error('FAIL: S5 closure did not store reflexive loops for all worlds.');
  process.exit(1);
}

model.addTransition(1, 2, 'a');
model.addTransition(2, 1, 'a');
classStates = model.closeEquivalenceClass('a', [1, 2]);

if (classStates.join(',') !== '0,1,2') {
  console.error('FAIL: expected merged S5 class to contain worlds 0, 1, and 2, got:', classStates);
  process.exit(1);
}

for (let source = 0; source <= 2; source++) {
  for (let target = 0; target <= 2; target++) {
    if (!model.isSuccessor(source, target, 'a')) {
      console.error(`FAIL: missing S5 transition ${source} -> ${target} for agent a.`);
      process.exit(1);
    }
  }
}

if (!model.isReflexive('a') || !model.isSymmetric('a') || !model.isTransitive('a')) {
  console.error('FAIL: merged S5 closure is not an equivalence relation for agent a.');
  process.exit(1);
}

console.log('PASS: S5 closure stores reflexive loops and closes agent relations under symmetry and transitivity.');
