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

function exactAssignment(atoms) {
  const assignment = Object.create(null);
  atoms.forEach(atom => {
    assignment[atom] = true;
  });
  return assignment;
}

function completeXModel(firstAtoms, secondAtoms) {
  const model = new MPL.Model();
  model.addState(exactAssignment(firstAtoms));
  model.addState(exactAssignment(secondAtoms));
  for (let source = 0; source < 2; source++) {
    for (let target = 0; target < 2; target++) {
      model.addTransition(source, target, 'x');
    }
  }
  return model;
}

function bapalKnowsExactAtom(atom) {
  return new MPL.Wff({
    bapal: {
      kno_start: {
        kno_end: [{ prop: 'x' }, { prop: atom }],
      },
    },
  });
}

function legacyDelimiterKey(atoms) {
  return atoms.slice().sort().join(',');
}

function assertDistinctValuations(testCase) {
  const model = completeXModel(testCase.firstAtoms, testCase.secondAtoms);
  const states = model.getRawStates();
  assert.deepStrictEqual(
    Object.keys(states[0].assignment),
    testCase.firstAtoms,
    `${testCase.label}: first exact atom strings were not preserved.`
  );
  assert.deepStrictEqual(
    Object.keys(states[1].assignment),
    testCase.secondAtoms,
    `${testCase.label}: second exact atom strings were not preserved.`
  );
  assert.ok(
    !testCase.secondAtoms.includes(testCase.observableAtom),
    `${testCase.label}: observable atom must be absent at the second world.`
  );
  if (testCase.legacyCollision) {
    assert.strictEqual(
      legacyDelimiterKey(testCase.firstAtoms),
      legacyDelimiterKey(testCase.secondAtoms),
      `${testCase.label}: test data no longer reproduces the legacy delimiter collision.`
    );
  }
  assert.strictEqual(
    MPL.truth(model, 0, bapalKnowsExactAtom(testCase.observableAtom)),
    true,
    `${testCase.label}: BAPAL failed to distinguish different exact valuation sets.`
  );
}

function assertInsertionOrderInvariant() {
  const model = new MPL.Model();
  model.addState(exactAssignment(['p', 'q']));
  model.addState(exactAssignment(['q', 'p']));
  model.addTransition(0, 1, 'a');
  assert.strictEqual(
    MPL.truth(model, 0, new MPL.Wff('^~<>(p|~p)')),
    false,
    'Identical valuations with different insertion order were split into separate BAPAL classes.'
  );
}

assertInsertionOrderInvariant();

const distinctValuationCases = [
  {
    label: 'A — separate a/b versus one comma-bearing atom',
    firstAtoms: ['a', 'b'],
    secondAtoms: ['a,b'],
    observableAtom: 'a',
    legacyCollision: true,
  },
  {
    label: 'B — comma placement across three lexical units',
    firstAtoms: ['a,b', 'c'],
    secondAtoms: ['a', 'b,c'],
    observableAtom: 'c',
    legacyCollision: true,
  },
  {
    label: 'D — multi-character atoms',
    firstAtoms: ['foo', 'bar_baz'],
    secondAtoms: ['bar_baz,foo'],
    observableAtom: 'foo',
    legacyCollision: true,
  },
  {
    label: 'E — prototype-sensitive atoms',
    firstAtoms: ['__proto__', 'constructor'],
    secondAtoms: ['__proto__,constructor'],
    observableAtom: 'constructor',
    legacyCollision: true,
  },
  {
    label: 'comma punctuation',
    firstAtoms: ['p', ','],
    secondAtoms: [',,p'],
    observableAtom: 'p',
    legacyCollision: true,
  },
  {
    label: 'quote punctuation',
    firstAtoms: ['p', '"quoted"'],
    secondAtoms: ['"quoted",p'],
    observableAtom: 'p',
    legacyCollision: true,
  },
  {
    label: 'backslash punctuation',
    firstAtoms: ['p', '\\'],
    secondAtoms: ['\\,p'],
    observableAtom: 'p',
    legacyCollision: true,
  },
  {
    label: 'empty-looking bracket punctuation',
    firstAtoms: ['p', '[]', '{}'],
    secondAtoms: ['[],p,{}'],
    observableAtom: 'p',
    legacyCollision: true,
  },
  {
    label: 'Unicode atom collision',
    firstAtoms: ['p', '漢字'],
    secondAtoms: ['p,漢字'],
    observableAtom: 'p',
    legacyCollision: true,
  },
  {
    label: 'Unicode normalization remains exact',
    firstAtoms: ['é'],
    secondAtoms: ['e\u0301'],
    observableAtom: 'é',
    legacyCollision: false,
  },
];

distinctValuationCases.forEach(assertDistinctValuations);

console.log('PASS: BAPAL valuation classes use collision-free exact atom-set identity.');
console.log('same-set insertion-order cases: 1');
console.log(`distinct exact-set cases: ${distinctValuationCases.length}`);
