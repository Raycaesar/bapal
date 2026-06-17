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

const pq = {};
pq.p = true;
pq.q = true;

const qp = {};
qp.q = true;
qp.p = true;

model.addState(pq);
model.addState(qp);
model.addTransition(0, 1, 'a');

const formula = new MPL.Wff('^~<>(p|~p)');
const result = MPL.truth(model, 0, formula);

if (result !== false) {
  console.error('FAIL: identical valuations with different key order were split into separate BAPAL classes.');
  console.error('Expected ^~<>(p|~p) at world 0 to be false, got:', result);
  process.exit(1);
}

console.log('PASS: BAPAL treats {p,q} and {q,p} as the same Boolean valuation class.');
