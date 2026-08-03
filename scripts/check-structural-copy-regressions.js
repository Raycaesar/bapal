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

function canonicalSnapshot(model) {
  return model.getRawStates().map((state, source) => {
    if (state === null) return null;

    const assignment = Object.entries(state.assignment)
      .sort(([left], [right]) => left.localeCompare(right));
    const successors = state.successors
      .map(successor => ({
        source,
        target: successor.target,
        agent: successor.agent,
      }))
      .sort((left, right) =>
        left.source - right.source ||
        left.target - right.target ||
        left.agent.localeCompare(right.agent)
      );

    return { assignment, successors };
  });
}

function transitionsFromSnapshot(snapshot) {
  return snapshot.flatMap(state => state === null ? [] : state.successors);
}

function assertTruth(model, state, formula, expected) {
  let actual;
  try {
    actual = MPL.truth(model, state, new MPL.Wff(formula));
  } catch (error) {
    assert.fail(`Evaluation of ${formula} threw: ${error.message}`);
  }
  assert.strictEqual(actual, expected, `${formula} at world ${state}`);
}

function makeFooModel() {
  const model = new MPL.Model();
  model.addState({ foo: true });
  return model;
}

function makeLargeSparseModel() {
  const world10Assignment = {};
  world10Assignment.atom10 = true;
  world10Assignment.foo = true;
  world10Assignment.bar_baz = true;
  world10Assignment.p = true;

  const assignments = [
    { foo: true, p: true },
    { bar_baz: true, q: true },
    { removed_two: true },
    { p: true, foo: true },
    { atom10: true, q: true },
    { foo: true, p: true },
    { q: true, bar_baz: true },
    { removed_seven: true },
    { q: true, atom10: true },
    { foo: true, p: true },
    world10Assignment,
    { bar_baz: true, q: true },
  ];

  const model = new MPL.Model();
  assignments.forEach(assignment => model.addState(assignment));
  model.removeState(2);
  model.removeState(7);

  // Deliberately unsorted, with multiple labels sharing target 10.
  model.addTransition(0, 11, 'a');
  model.addTransition(0, 10, 'agent_b');
  model.addTransition(0, 3, 'b');
  model.addTransition(0, 10, 'alice');
  model.addTransition(0, 11, 'alice');
  model.addTransition(0, 10, 'alice'); // Existing duplicate suppression must remain in force.
  model.addTransition(1, 10, 'agent_b');
  model.addTransition(3, 10, 'a');
  model.addTransition(4, 0, 'a');
  model.addTransition(6, 11, 'b');
  model.addTransition(8, 10, 'b');
  model.addTransition(9, 0, 'a');
  model.addTransition(10, 11, 'agent_b');
  model.addTransition(11, 10, 'alice');

  return model;
}

function assertTruthTablesEqual(original, copy, formulas) {
  const originalStates = original.getRawStates();
  const copiedStates = copy.getRawStates();

  formulas.forEach(formula => {
    const parsed = new MPL.Wff(formula);
    originalStates.forEach((state, world) => {
      if (state === null) return;

      assert.notStrictEqual(copiedStates[world], null, `World ${world} must be live in both models.`);
      let originalTruth;
      let copiedTruth;
      try {
        originalTruth = MPL.truth(original, world, parsed);
        copiedTruth = MPL.truth(copy, world, parsed);
      } catch (error) {
        assert.fail(`Truth comparison for ${formula} at world ${world} threw: ${error.message}`);
      }
      assert.strictEqual(
        copiedTruth,
        originalTruth,
        `Copy changed the truth of ${formula} at live world ${world}.`
      );
    });
  });
}

function testDirectMultiCharacterAtomPreservation() {
  const model = new MPL.Model();
  model.addState({ foo: true, bar_baz: true, p: true });

  const copy = model.deepCopy();
  const copiedAssignment = copy.getRawStates()[0].assignment;

  assert.deepStrictEqual(
    Object.keys(copiedAssignment).sort(),
    ['bar_baz', 'foo', 'p'],
    'deepCopy must preserve the exact atom-key set.'
  );
  assert.strictEqual(copy.valuation('foo', 0), true, 'foo must remain true in the copy.');
  assert.strictEqual(copy.valuation('bar_baz', 0), true, 'bar_baz must remain true in the copy.');

  for (const accidentalAtom of ['f', 'o', 'b', 'a', 'r', '_']) {
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(copiedAssignment, accidentalAtom),
      false,
      `deepCopy must not introduce the fragment atom ${JSON.stringify(accidentalAtom)}.`
    );
  }
}

function testNullWorldIndexPreservation() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({ removed: true });
  model.addState({ q: true });
  model.addState({ r: true });
  model.removeState(1);

  const copy = model.deepCopy();
  const copiedStates = copy.getRawStates();

  assert.strictEqual(copiedStates.length, model.getRawStates().length);
  assert.strictEqual(copiedStates[1], null, 'Deleted world index 1 must remain null.');
  for (const world of [0, 2, 3]) {
    assert.notStrictEqual(copiedStates[world], null, `World ${world} must remain live.`);
  }
  assert.deepStrictEqual(Object.keys(copiedStates[0].assignment).sort(), ['p']);
  assert.deepStrictEqual(Object.keys(copiedStates[2].assignment).sort(), ['q']);
  assert.deepStrictEqual(Object.keys(copiedStates[3].assignment).sort(), ['r']);
}

function testTransitionPreservation() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({ removed: true });
  model.addState({ q: true });
  model.addState({ r: true });
  model.removeState(1);

  model.addTransition(0, 2, 'a');
  model.addTransition(2, 0, 'b');
  model.addTransition(0, 3, 'alice');
  model.addTransition(3, 0, 'alice');
  model.addTransition(2, 3, 'a');

  const copy = model.deepCopy();
  const originalTransitions = transitionsFromSnapshot(canonicalSnapshot(model));
  const copiedTransitions = transitionsFromSnapshot(canonicalSnapshot(copy));

  assert.deepStrictEqual(
    copiedTransitions,
    originalTransitions,
    'deepCopy must preserve every source, target, and raw agent string without extras.'
  );
}

function testMutationIndependence() {
  const original = new MPL.Model();
  original.addState({ p: true });
  original.addState({ q: true });
  original.addState({ r: true });
  original.addTransition(0, 1, 'a');
  original.addTransition(1, 2, 'b');
  original.addTransition(2, 0, 'a');

  const copy = original.deepCopy();
  const originalStates = original.getRawStates();
  const copiedStates = copy.getRawStates();

  assert.notStrictEqual(copiedStates, originalStates, 'Raw-state arrays must not be shared.');
  for (const world of [0, 1, 2]) {
    assert.notStrictEqual(
      copiedStates[world].assignment,
      originalStates[world].assignment,
      `World ${world} assignments must not be shared.`
    );
    assert.notStrictEqual(
      copiedStates[world].successors,
      originalStates[world].successors,
      `World ${world} successor arrays must not be shared.`
    );
    originalStates[world].successors.forEach((successor, successorIndex) => {
      assert.notStrictEqual(
        copiedStates[world].successors[successorIndex],
        successor,
        `World ${world} successor record ${successorIndex} must not be shared.`
      );
    });
  }

  const originalBeforeCopyMutations = canonicalSnapshot(original);
  copy.editState(0, { p: false, copied_only: true });
  assert.deepStrictEqual(canonicalSnapshot(original), originalBeforeCopyMutations);
  copy.addTransition(0, 2, 'b');
  assert.deepStrictEqual(canonicalSnapshot(original), originalBeforeCopyMutations);
  copy.removeTransition(1, 2, 'b');
  assert.deepStrictEqual(canonicalSnapshot(original), originalBeforeCopyMutations);
  copy.removeState(2);
  assert.deepStrictEqual(canonicalSnapshot(original), originalBeforeCopyMutations);

  const copyBeforeOriginalMutations = canonicalSnapshot(copy);
  original.editState(1, { q: false, original_only: true });
  original.addTransition(2, 1, 'b');
  original.removeTransition(0, 1, 'a');
  original.removeState(0);
  assert.deepStrictEqual(
    canonicalSnapshot(copy),
    copyBeforeOriginalMutations,
    'Mutating the original must not change its copy.'
  );
}

function testPalMultiCharacterRegression() {
  const model = makeFooModel();

  assertTruth(model, 0, 'foo', true);
  assertTruth(model, 0, '[(p | ~p)]foo', true);
}

function testBapalMultiCharacterRegression() {
  const model = makeFooModel();

  assertTruth(model, 0, '^foo', true);
  assertTruth(model, 0, '^~foo', false);
}

function testNestedPalBapalCopyPaths() {
  const model = makeFooModel();

  // Both forms parse directly in raw MPL.Wff syntax; no browser bracket rewrite is needed.
  assertTruth(model, 0, '[(p | ~p)]^foo', true);
  assertTruth(model, 0, '^[(p | ~p)]foo', true);
}

function testEmptyAndOneCharacterCompatibility() {
  const empty = new MPL.Model();
  let emptyCopy;
  assert.doesNotThrow(() => {
    emptyCopy = empty.deepCopy();
  }, 'Deep-copying an empty model must not throw.');
  assert.ok(emptyCopy instanceof MPL.Model);
  assert.strictEqual(canonicalSnapshot(emptyCopy).length, 0);
  assert.strictEqual(emptyCopy.copied, true);

  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({ q: true });
  model.addTransition(0, 0, 'a');
  model.addTransition(0, 1, 'a');
  model.addTransition(1, 0, 'b');
  model.addTransition(1, 1, 'b');

  const copy = model.deepCopy();
  assert.deepStrictEqual(
    canonicalSnapshot(copy),
    canonicalSnapshot(model),
    'Ordinary one-character models must remain structurally identical.'
  );
  assertTruth(model, 0, '[p]K{a}p', true);
  assertTruth(copy, 0, '[p]K{a}p', true);
}

function testLargeSparseMultiDigitAndRepeatedCopies() {
  const original = makeLargeSparseModel();
  const originalBeforeCopying = canonicalSnapshot(original);
  const copy1 = original.deepCopy();
  const copy2 = copy1.deepCopy();

  assert.strictEqual(original.getRawStates().length, 12);
  assert.strictEqual(copy1.getRawStates().length, 12);
  assert.strictEqual(copy2.getRawStates().length, 12);
  for (const hole of [2, 7]) {
    assert.strictEqual(copy1.getRawStates()[hole], null, `copy1 must preserve null index ${hole}.`);
    assert.strictEqual(copy2.getRawStates()[hole], null, `copy2 must preserve null index ${hole}.`);
  }
  for (const liveWorld of [8, 9, 10, 11]) {
    assert.notStrictEqual(copy2.getRawStates()[liveWorld], null, `World ${liveWorld} must survive both copies.`);
  }

  assert.deepStrictEqual(canonicalSnapshot(original), originalBeforeCopying, 'Copying must not mutate the source.');
  assert.deepStrictEqual(canonicalSnapshot(copy1), originalBeforeCopying);
  assert.deepStrictEqual(canonicalSnapshot(copy2), originalBeforeCopying);
  assert.strictEqual(copy1.copied, true);
  assert.strictEqual(copy2.copied, true);

  assert.strictEqual(copy2.valuation('foo', 10), true);
  assert.strictEqual(copy2.valuation('bar_baz', 10), true);
  assert.strictEqual(copy2.valuation('atom10', 10), true);
  assert.strictEqual(copy2.isSuccessor(0, 10, 'alice'), true);
  assert.strictEqual(copy2.isSuccessor(0, 10, 'agent_b'), true);
  assert.strictEqual(copy2.isSuccessor(0, 11, 'alice'), true);
  assert.strictEqual(copy2.isSuccessor(10, 11, 'agent_b'), true);
  assert.strictEqual(
    copy2.getSuccessorsOf(0).filter(successor => successor.target === 10 && successor.agent === 'alice').length,
    1,
    'Repeated copying must retain duplicate suppression.'
  );
}

function testTruthPreservationAcrossRepeatedCopies() {
  const original = makeLargeSparseModel();
  const copy1 = original.deepCopy();
  const copy2 = copy1.deepCopy();
  const formulas = [
    'foo',
    'bar_baz',
    'atom10',
    '~foo',
    '(foo | bar_baz)',
    'K{a}foo',
    '<>foo',
    '[foo]foo',
    '[(p | ~p)]foo',
    '^foo',
    '^~foo',
    '[(p | ~p)]^foo',
    '^[(p | ~p)]foo',
  ];

  assertTruthTablesEqual(original, copy1, formulas);
  assertTruthTablesEqual(copy1, copy2, formulas);
}

function testCopyAfterWorldRemoval() {
  const model = makeLargeSparseModel();
  model.removeState(5);

  const beforeCopy = canonicalSnapshot(model);
  const copy = model.deepCopy();

  assert.strictEqual(copy.getRawStates()[5], null, 'A world removed immediately before copying must remain null.');
  assert.deepStrictEqual(canonicalSnapshot(copy), beforeCopy);
  assertTruthTablesEqual(model, copy, [
    'foo',
    '[(p | ~p)]^foo',
    '^[(p | ~p)]foo',
  ]);
}

const tests = [
  ['Test 1 — direct multi-character atom preservation', testDirectMultiCharacterAtomPreservation],
  ['Test 2 — null/deleted world-index preservation', testNullWorldIndexPreservation],
  ['Test 3 — transition preservation', testTransitionPreservation],
  ['Test 4 — mutation independence', testMutationIndependence],
  ['Test 5 — PAL multi-character regression', testPalMultiCharacterRegression],
  ['Test 6 — BAPAL multi-character regression', testBapalMultiCharacterRegression],
  ['Test 7 — nested PAL/BAPAL copy paths', testNestedPalBapalCopyPaths],
  ['Test 8 — empty and ordinary one-character compatibility', testEmptyAndOneCharacterCompatibility],
  ['Test 9 — sparse multi-digit indices and repeated copies', testLargeSparseMultiDigitAndRepeatedCopies],
  ['Test 10 — truth preservation across repeated copies', testTruthPreservationAcrossRepeatedCopies],
  ['Test 11 — copying after an additional world removal', testCopyAfterWorldRemoval],
];

for (const [name, test] of tests) {
  try {
    test();
    console.log('PASS:', name);
  } catch (error) {
    console.error('FAIL:', name);
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

console.log('PASS: all structural-copy regressions.');
