#!/usr/bin/env node

'use strict';

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

const MINIMIZED_INPUT = '[(K{a}p)]q';
const EXHAUSTIVE_MAX_SIZE = 5;
const EXHAUSTIVE_COUNTS_BY_SIZE = [2, 12, 92, 792, 7312];
const EXHAUSTIVE_EXPECTED_COUNT = 8210;
const GENERATED_SEED = 0x00bada55;
const GENERATED_COUNT = 100000;
const GENERATED_MAX_SIZE = 40;
const GENERATED_ATOMS = ['p', 'q', 'foo', 'bar_baz', 'atom10'];
const GENERATED_AGENTS = ['a', 'b'];

const ROOT_TAGS = [
  'prop',
  'neg',
  'nec',
  'poss',
  'bapal',
  'kno_start',
  'annce_start',
  'conj',
  'disj',
  'impl',
  'equi',
];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);

  if (value !== null && typeof value === 'object') {
    const normalized = {};
    Object.keys(value).sort().forEach(key => {
      normalized[key] = canonicalize(value[key]);
    });
    return normalized;
  }

  return value;
}

function canonicalAstString(ast) {
  return JSON.stringify(canonicalize(ast));
}

function assertAstEqual(actual, expected, message) {
  assert.deepStrictEqual(canonicalize(actual), canonicalize(expected), message);
}

// Test-local constructors. Generated ASTs are built from these shapes directly;
// they are never obtained by parsing the ASCII later used for the round trip.
function atom(identifier) {
  return { prop: identifier };
}

function negation(scope) {
  return { neg: scope };
}

function necessity(scope) {
  return { nec: scope };
}

function possibility(scope) {
  return { poss: scope };
}

function bapal(scope) {
  return { bapal: scope };
}

function knowledge(agent, scope) {
  return {
    kno_start: {
      kno_end: [atom(agent), scope],
    },
  };
}

function pal(precondition, scope) {
  return {
    annce_start: {
      annce_end: [precondition, scope],
    },
  };
}

function conjunction(left, right) {
  return { conj: [left, right] };
}

function disjunction(left, right) {
  return { disj: [left, right] };
}

function implication(left, right) {
  return { impl: [left, right] };
}

function biconditional(left, right) {
  return { equi: [left, right] };
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function rootTag(ast) {
  assert.ok(ast && typeof ast === 'object', `Expected an AST object, received ${String(ast)}.`);

  for (const tag of ROOT_TAGS) {
    if (hasOwn(ast, tag)) return tag;
  }

  assert.fail(`Unknown formula AST root: ${canonicalAstString(ast)}`);
}

function childFormulae(ast) {
  const tag = rootTag(ast);

  if (tag === 'prop') return [];
  if (tag === 'neg' || tag === 'nec' || tag === 'poss' || tag === 'bapal') return [ast[tag]];
  if (tag === 'kno_start') return [ast.kno_start.kno_end[1]];
  if (tag === 'annce_start') return ast.annce_start.annce_end;
  return ast[tag];
}

// Agent payloads are identifiers rather than formula nodes, so knowledge counts
// as one logical AST node plus the size of its formula scope.
function astSize(ast) {
  return 1 + childFormulae(ast).reduce((sum, child) => sum + astSize(child), 0);
}

function operatorRootClassifications(ast) {
  const result = {
    formulaRoot: rootTag(ast),
    announcementPreconditionRoots: [],
    announcementScopeRoots: [],
  };

  function visit(node) {
    if (rootTag(node) === 'annce_start') {
      const [precondition, scope] = node.annce_start.annce_end;
      result.announcementPreconditionRoots.push(rootTag(precondition));
      result.announcementScopeRoots.push(rootTag(scope));
    }
    childFormulae(node).forEach(visit);
  }

  visit(ast);
  return result;
}

function formatError(error) {
  if (!error) return '<none>';
  return `${error.name || 'Error'}: ${error.message || String(error)}`;
}

function traceDiagnostic(label, trace, error) {
  return [
    `FAIL: ${label}`,
    `original AST: ${canonicalAstString(trace.originalAst)}`,
    `printed ASCII: ${trace.printed === undefined ? '<not produced>' : trace.printed}`,
    `reparsed AST: ${trace.reparsedAst === undefined ? '<unavailable>' : canonicalAstString(trace.reparsedAst)}`,
    `parser error: ${formatError(trace.parserError)}`,
    `assertion: ${formatError(error)}`,
  ].join('\n');
}

function assertWffRoundTrip(original, label) {
  const trace = {
    originalAst: original.json(),
    printed: undefined,
    reparsedAst: undefined,
    parserError: null,
  };

  try {
    trace.printed = original.ascii();
    let reparsed;
    assert.doesNotThrow(() => {
      try {
        reparsed = new MPL.Wff(trace.printed);
      } catch (error) {
        trace.parserError = error;
        throw error;
      }
    }, `${label}: printed ASCII must be accepted by the raw parser.`);

    trace.reparsedAst = reparsed.json();
    assertAstEqual(
      trace.reparsedAst,
      trace.originalAst,
      `${label}: raw reparsing must preserve the structural AST.`
    );
    assert.strictEqual(
      reparsed.ascii(),
      trace.printed,
      `${label}: ASCII printing must be idempotent.`
    );
    return trace;
  } catch (error) {
    error.roundTripTrace = trace;
    throw error;
  }
}

function assertAstRoundTrip(ast, label) {
  let original;
  let constructionError = null;

  try {
    assert.doesNotThrow(() => {
      try {
        original = new MPL.Wff(ast);
      } catch (error) {
        constructionError = error;
        throw error;
      }
    }, `${label}: MPL.Wff must accept the independently constructed AST.`);
  } catch (error) {
    error.roundTripTrace = {
      originalAst: ast,
      printed: undefined,
      reparsedAst: undefined,
      parserError: constructionError,
    };
    throw error;
  }

  return assertWffRoundTrip(original, label);
}

function runMinimizedRegression() {
  const original = new MPL.Wff('[(K{a}p)]q');
  const printed = original.ascii();
  let reparsed;
  let parserError = null;

  try {
    assert.doesNotThrow(() => {
      try {
        reparsed = new MPL.Wff(printed);
      } catch (error) {
        parserError = error;
        throw error;
      }
    }, 'Minimized regression: reparsing printed ASCII must not throw.');

    assertAstEqual(
      reparsed.json(),
      original.json(),
      'Minimized regression: reparsed AST must equal the original AST.'
    );
    assert.strictEqual(
      reparsed.ascii(),
      printed,
      'Minimized regression: the canonical ASCII print must be idempotent.'
    );
  } catch (error) {
    error.roundTripDiagnostic = [
      'FAIL: minimized regression — knowledge-rooted PAL precondition',
      `input: ${MINIMIZED_INPUT}`,
      `printed ASCII: ${printed}`,
      `parser error: ${formatError(parserError)}`,
    ].join('\n');
    throw error;
  }

  return 1;
}

const SAFE_CANONICAL_CASES = [
  ['[p]q', '[p]q'],
  ['[(~p)]q', '[~p]q'],
  ['[(□p)]q', '[□p]q'],
  ['[(<>p)]q', '[<>p]q'],
  ['[(^p)]q', '[^p]q'],
  ['[(p & q)]r', '[(p & q)]r'],
  ['[(p | q)]r', '[(p | q)]r'],
  ['[(p -> q)]r', '[(p -> q)]r'],
  ['[(p <-> q)]r', '[(p <-> q)]r'],
  ['[(foo & bar_baz)]atom10', '[(foo & bar_baz)]atom10'],
];

function runSafeCanonicalPreservationChecks() {
  SAFE_CANONICAL_CASES.forEach(([input, expected], index) => {
    const label = `safe canonical case ${index + 1}: ${input}`;
    const original = new MPL.Wff(input);
    assert.strictEqual(
      original.ascii(),
      expected,
      `${label}: an already-safe canonical form must not gain protective parentheses.`
    );
    assertWffRoundTrip(original, label);
  });

  return SAFE_CANONICAL_CASES.length;
}

const FIXED_CORPUS = [
  '[p]q',
  '[(K{a}p)]q',
  '[(K{a}K{b}p)]q',
  '[(~K{a}p)]q',
  '[(^K{a}p)]q',
  '[(□p)]q',
  '[(<>p)]q',
  '[(p & q)]r',
  '[(p | q)]K{a}r',
  '[(p -> q)]^K{a}r',
  // The raw parser rejects [[p]q]r, so the nested PAL precondition uses the
  // minimally parenthesized raw form that denotes the intended AST.
  '[([p]q)]r',
  '[p][q]r',
  'K{a}[p]q',
  '[p]K{a}q',
  '[p]^K{a}q',
  '^[p]q',
  '[(foo & bar_baz)]atom10',
  '[foo]K{b}bar_baz',
  '^K{a}atom10',
  '((p <-> q) <-> (foo <-> atom10))',
  '(p <-> (q <-> (foo <-> bar_baz)))',
  '~□<>^K{a}p',
  '^~□<>K{b}foo',
  '[(~□<>^K{a}p)]^[q]r',
  '[(~[p]q)]r',
];

function runFixedCorpus() {
  for (let index = 0; index < FIXED_CORPUS.length; index++) {
    const input = FIXED_CORPUS[index];
    const label = `fixed corpus case ${index + 1}: ${input}`;
    let original;
    let rawInputError = null;

    try {
      assert.doesNotThrow(() => {
        try {
          original = new MPL.Wff(input);
        } catch (error) {
          rawInputError = error;
          throw error;
        }
      }, `${label}: fixture must be accepted by the current raw grammar.`);
      assertWffRoundTrip(original, label);
    } catch (error) {
      const trace = error.roundTripTrace || {
        originalAst: original ? original.json() : { fixture: input },
        printed: original ? original.ascii() : undefined,
        reparsedAst: undefined,
        parserError: rawInputError,
      };
      error.roundTripDiagnostic = traceDiagnostic(label, trace, error);
      throw error;
    }
  }

  return FIXED_CORPUS.length;
}

function addUnique(map, ast) {
  map.set(canonicalAstString(ast), ast);
}

function generateExhaustiveAsts() {
  const bySize = Array.from({ length: EXHAUSTIVE_MAX_SIZE + 1 }, () => []);
  bySize[1] = [atom('p'), atom('q')];

  for (let size = 2; size <= EXHAUSTIVE_MAX_SIZE; size++) {
    const unique = new Map();

    for (const child of bySize[size - 1]) {
      addUnique(unique, negation(child));
      addUnique(unique, necessity(child));
      addUnique(unique, possibility(child));
      addUnique(unique, bapal(child));
      addUnique(unique, knowledge('a', child));
      addUnique(unique, knowledge('b', child));
    }

    for (let leftSize = 1; leftSize <= size - 2; leftSize++) {
      const rightSize = size - 1 - leftSize;
      for (const left of bySize[leftSize]) {
        for (const right of bySize[rightSize]) {
          addUnique(unique, conjunction(left, right));
          addUnique(unique, disjunction(left, right));
          addUnique(unique, implication(left, right));
          addUnique(unique, biconditional(left, right));
          addUnique(unique, pal(left, right));
        }
      }
    }

    bySize[size] = Array.from(unique.values());
  }

  return bySize;
}

function makeCoverage() {
  return {
    formulaRoots: new Set(),
    announcementPreconditionRoots: new Set(),
    announcementScopeRoots: new Set(),
    atomIdentifiers: new Set(),
    agentIdentifiers: new Set(),
  };
}

function recordCoverage(ast, coverage) {
  coverage.formulaRoots.add(rootTag(ast));

  function visit(node) {
    const tag = rootTag(node);
    if (tag === 'prop') coverage.atomIdentifiers.add(node.prop);
    if (tag === 'kno_start') {
      coverage.agentIdentifiers.add(node.kno_start.kno_end[0].prop);
    }
    if (tag === 'annce_start') {
      const [precondition, scope] = node.annce_start.annce_end;
      coverage.announcementPreconditionRoots.add(rootTag(precondition));
      coverage.announcementScopeRoots.add(rootTag(scope));
    }
    childFormulae(node).forEach(visit);
  }

  visit(ast);
}

function assertCompleteCoverage(coverage, label) {
  const expected = ROOT_TAGS.slice().sort();
  assert.deepStrictEqual(
    Array.from(coverage.formulaRoots).sort(),
    expected,
    `${label}: every supported operator must occur as a formula root.`
  );
  assert.deepStrictEqual(
    Array.from(coverage.announcementPreconditionRoots).sort(),
    expected,
    `${label}: every supported operator must occur as an announcement-precondition root.`
  );
  assert.deepStrictEqual(
    Array.from(coverage.announcementScopeRoots).sort(),
    expected,
    `${label}: every supported operator must occur as an announcement-scope root.`
  );
}

function runExhaustiveSet() {
  const bySize = generateExhaustiveAsts();
  const observedCounts = bySize.slice(1).map(asts => asts.length);
  assert.deepStrictEqual(
    observedCounts,
    EXHAUSTIVE_COUNTS_BY_SIZE,
    'Exhaustive AST generation volume changed.'
  );

  const asts = bySize.slice(1).flat();
  assert.strictEqual(
    asts.length,
    EXHAUSTIVE_EXPECTED_COUNT,
    'Exhaustive AST generation must retain its measured exact count.'
  );
  assert.strictEqual(
    new Set(asts.map(canonicalAstString)).size,
    asts.length,
    'Exhaustive AST generation must contain no structural duplicates.'
  );

  const coverage = makeCoverage();
  for (let index = 0; index < asts.length; index++) {
    const ast = asts[index];
    recordCoverage(ast, coverage);
    try {
      assertAstRoundTrip(ast, `exhaustive AST ${index + 1}/${asts.length}`);
    } catch (error) {
      const trace = error.roundTripTrace || {
        originalAst: ast,
        printed: undefined,
        reparsedAst: undefined,
        parserError: null,
      };
      error.roundTripDiagnostic = traceDiagnostic(
        `exhaustive AST ${index + 1}/${asts.length}`,
        trace,
        error
      );
      throw error;
    }
  }

  assertCompleteCoverage(coverage, 'Exhaustive set');
  return asts.length;
}

function makeRng(seed) {
  let state = seed >>> 0;
  assert.notStrictEqual(state, 0, 'The xorshift32 seed must be nonzero.');

  return {
    integer(maxExclusive) {
      assert.ok(Number.isInteger(maxExclusive) && maxExclusive > 0);
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state % maxExclusive;
    },
  };
}

function sampleForRoot(tag) {
  switch (tag) {
    case 'prop': return atom('foo');
    case 'neg': return negation(atom('p'));
    case 'nec': return necessity(atom('q'));
    case 'poss': return possibility(atom('foo'));
    case 'bapal': return bapal(knowledge('a', atom('bar_baz')));
    case 'kno_start': return knowledge('b', atom('atom10'));
    case 'annce_start': return pal(atom('p'), atom('q'));
    case 'conj': return conjunction(atom('p'), atom('foo'));
    case 'disj': return disjunction(atom('q'), atom('bar_baz'));
    case 'impl': return implication(atom('foo'), atom('atom10'));
    case 'equi': return biconditional(atom('bar_baz'), atom('q'));
    default: assert.fail(`No forced sample for root ${tag}.`);
  }
}

function forcedGeneratedAsts() {
  const formulaRoots = ROOT_TAGS.map(sampleForRoot);
  const preconditionRoots = ROOT_TAGS.map(tag => pal(sampleForRoot(tag), atom('atom10')));
  const scopeRoots = ROOT_TAGS.map(tag => pal(atom('bar_baz'), sampleForRoot(tag)));
  return formulaRoots.concat(preconditionRoots, scopeRoots);
}

function randomAst(rng, size) {
  assert.ok(Number.isInteger(size) && size >= 1 && size <= GENERATED_MAX_SIZE);
  if (size === 1) return atom(GENERATED_ATOMS[rng.integer(GENERATED_ATOMS.length)]);

  const unaryTags = ['neg', 'nec', 'poss', 'bapal', 'kno_start'];
  const nonAtomTags = ROOT_TAGS.filter(tag => tag !== 'prop');
  const eligibleTags = size === 2 ? unaryTags : nonAtomTags;
  const tag = eligibleTags[rng.integer(eligibleTags.length)];

  if (tag === 'neg') return negation(randomAst(rng, size - 1));
  if (tag === 'nec') return necessity(randomAst(rng, size - 1));
  if (tag === 'poss') return possibility(randomAst(rng, size - 1));
  if (tag === 'bapal') return bapal(randomAst(rng, size - 1));
  if (tag === 'kno_start') {
    const agent = GENERATED_AGENTS[rng.integer(GENERATED_AGENTS.length)];
    return knowledge(agent, randomAst(rng, size - 1));
  }

  const leftSize = 1 + rng.integer(size - 2);
  const rightSize = size - 1 - leftSize;
  const left = randomAst(rng, leftSize);
  const right = randomAst(rng, rightSize);

  if (tag === 'annce_start') return pal(left, right);
  if (tag === 'conj') return conjunction(left, right);
  if (tag === 'disj') return disjunction(left, right);
  if (tag === 'impl') return implication(left, right);
  if (tag === 'equi') return biconditional(left, right);

  assert.fail(`Random generator selected unsupported root ${tag}.`);
}

function probeRoundTrip(ast) {
  const result = {
    ok: false,
    phase: 'construct',
    printed: undefined,
    reparsedAst: undefined,
    reprinted: undefined,
    error: null,
  };

  try {
    const original = new MPL.Wff(ast);
    result.phase = 'print';
    result.printed = original.ascii();
    result.phase = 'reparse';
    const reparsed = new MPL.Wff(result.printed);
    result.reparsedAst = reparsed.json();
    result.phase = 'compare-ast';

    if (canonicalAstString(result.reparsedAst) !== canonicalAstString(ast)) {
      result.error = new assert.AssertionError({
        message: 'Reparsed AST differs structurally from the generated AST.',
        actual: canonicalize(result.reparsedAst),
        expected: canonicalize(ast),
        operator: 'deepStrictEqual',
      });
      return result;
    }

    result.phase = 'print-idempotence';
    result.reprinted = reparsed.ascii();
    if (result.reprinted !== result.printed) {
      result.error = new assert.AssertionError({
        message: 'ASCII printing is not idempotent.',
        actual: result.reprinted,
        expected: result.printed,
        operator: 'strictEqual',
      });
      return result;
    }

    result.phase = 'complete';
    result.ok = true;
    return result;
  } catch (error) {
    result.error = error;
    return result;
  }
}

function collectSubformulae(ast) {
  const unique = new Map();

  function visit(node) {
    addUnique(unique, node);
    childFormulae(node).forEach(visit);
  }

  visit(ast);
  return Array.from(unique.values()).sort((left, right) =>
    astSize(left) - astSize(right) || canonicalAstString(left).localeCompare(canonicalAstString(right))
  );
}

function smallestFailingSubformula(ast) {
  for (const candidate of collectSubformulae(ast)) {
    const outcome = probeRoundTrip(candidate);
    if (!outcome.ok) return { ast: candidate, outcome };
  }

  return { ast, outcome: probeRoundTrip(ast) };
}

function generatedFailureDiagnostic(caseNumber, ast) {
  const outcome = probeRoundTrip(ast);
  const minimized = smallestFailingSubformula(ast);
  const replayAst = canonicalAstString(minimized.ast);

  return [
    'FAIL: deterministic generated AST round trip',
    `seed: ${GENERATED_SEED} (0x${GENERATED_SEED.toString(16).padStart(8, '0')})`,
    `generated case: ${caseNumber}/${GENERATED_COUNT}`,
    `original AST: ${canonicalAstString(ast)}`,
    `printed ASCII: ${outcome.printed === undefined ? '<not produced>' : outcome.printed}`,
    `reparsed AST: ${outcome.reparsedAst === undefined ? '<unavailable>' : canonicalAstString(outcome.reparsedAst)}`,
    `exception: ${formatError(outcome.error)}`,
    `failure phase: ${outcome.phase}`,
    `operator-root classifications: ${JSON.stringify(operatorRootClassifications(ast))}`,
    'replayable minimized-looking diagnostic:',
    `  minimized AST: ${replayAst}`,
    `  minimized ASCII: ${minimized.outcome.printed === undefined ? '<not produced>' : minimized.outcome.printed}`,
    `  minimized reparsed AST: ${minimized.outcome.reparsedAst === undefined ? '<unavailable>' : canonicalAstString(minimized.outcome.reparsedAst)}`,
    `  minimized exception: ${formatError(minimized.outcome.error)}`,
    `  minimized classifications: ${JSON.stringify(operatorRootClassifications(minimized.ast))}`,
    `  replay: const ast = ${replayAst}; const printed = new MPL.Wff(ast).ascii(); const reparsed = new MPL.Wff(printed);`,
  ].join('\n');
}

function runGeneratedSet() {
  const rng = makeRng(GENERATED_SEED);
  const forced = forcedGeneratedAsts();
  assert.strictEqual(forced.length, ROOT_TAGS.length * 3);

  const coverage = makeCoverage();
  for (let index = 0; index < GENERATED_COUNT; index++) {
    const ast = index < forced.length
      ? forced[index]
      : randomAst(rng, 1 + rng.integer(GENERATED_MAX_SIZE));
    const caseNumber = index + 1;

    assert.ok(astSize(ast) <= GENERATED_MAX_SIZE, `Generated AST ${caseNumber} exceeded the size bound.`);
    recordCoverage(ast, coverage);

    try {
      assertAstRoundTrip(ast, `generated AST ${caseNumber}/${GENERATED_COUNT}`);
    } catch (error) {
      error.roundTripDiagnostic = generatedFailureDiagnostic(caseNumber, ast);
      throw error;
    }
  }

  assertCompleteCoverage(coverage, 'Deterministic generated set');
  assert.deepStrictEqual(
    Array.from(coverage.atomIdentifiers).sort(),
    GENERATED_ATOMS.slice().sort(),
    'Deterministic generated set must use every declared atom identifier and no others.'
  );
  assert.deepStrictEqual(
    Array.from(coverage.agentIdentifiers).sort(),
    GENERATED_AGENTS.slice().sort(),
    'Deterministic generated set must use both declared agent identifiers and no others.'
  );
  return GENERATED_COUNT;
}

function runDisplaySmokeChecks() {
  const protective = new MPL.Wff(MINIMIZED_INPUT);
  const bapalDisplay = new MPL.Wff(bapal(knowledge('a', atom('p'))));
  const connectiveDisplay = new MPL.Wff('((p -> q) <-> (q -> p))');
  const representatives = [protective, bapalDisplay, connectiveDisplay];

  representatives.forEach((wff, index) => {
    assert.strictEqual(typeof wff.unicode(), 'string', `Display case ${index + 1}: Unicode must be a string.`);
    assert.ok(wff.unicode().length > 0, `Display case ${index + 1}: Unicode must be nonempty.`);
    assert.strictEqual(typeof wff.latex(), 'string', `Display case ${index + 1}: LaTeX must be a string.`);
    assert.ok(wff.latex().length > 0, `Display case ${index + 1}: LaTeX must be nonempty.`);
  });

  assert.ok(bapalDisplay.unicode().includes('◇ᵝ'), 'BAPAL Unicode must render as ◇ᵝ.');
  assert.ok(
    bapalDisplay.latex().includes('\\Diamond_{\\beta}'),
    'BAPAL LaTeX must render with \\Diamond_{\\beta}.'
  );
  assert.strictEqual(
    connectiveDisplay.unicode(),
    '((p → q) ↔ (q → p))',
    'Implication and biconditional Unicode replacement order must remain intact.'
  );
  assert.strictEqual(
    connectiveDisplay.latex(),
    '((p\\rightarrow{}q)\\leftrightarrow{}(q\\rightarrow{}p))',
    'Implication and biconditional LaTeX replacement order must remain intact.'
  );

  // The repaired canonical ASCII is expected to retain only the protective
  // parentheses needed for raw reparsing; display conversion leaves them harmless.
  assert.strictEqual(protective.ascii(), '[(K{a}p)]q');
  assert.strictEqual(protective.unicode(), '[(K{a}p)]q');
  assert.strictEqual(protective.latex(), '[(K_{a}p)]q');

  return representatives.length;
}

function main() {
  const minimizedCount = runMinimizedRegression();
  const safeCanonicalCount = runSafeCanonicalPreservationChecks();
  const fixedCount = runFixedCorpus();
  const exhaustiveCount = runExhaustiveSet();
  const generatedCount = runGeneratedSet();
  const displayCount = runDisplaySmokeChecks();
  const roundTripCount = minimizedCount + safeCanonicalCount + fixedCount + exhaustiveCount + generatedCount;

  console.log('PASS: formula AST/ASCII round-trip checks completed.');
  console.log(`minimized regression cases: ${minimizedCount}`);
  console.log(`safe canonical preservation cases: ${safeCanonicalCount}`);
  console.log(`fixed difficult corpus cases: ${fixedCount}`);
  console.log(`exhaustive logical AST-size bound: ${EXHAUSTIVE_MAX_SIZE}`);
  console.log(`exhaustive counts by size 1..${EXHAUSTIVE_MAX_SIZE}: ${EXHAUSTIVE_COUNTS_BY_SIZE.join(', ')}`);
  console.log(`exhaustive distinct AST cases: ${exhaustiveCount}`);
  console.log(`generated seed: ${GENERATED_SEED} (0x${GENERATED_SEED.toString(16).padStart(8, '0')})`);
  console.log(`generated maximum logical AST size: ${GENERATED_MAX_SIZE}`);
  console.log(`deterministic generated AST cases: ${generatedCount}`);
  console.log(`total AST round-trip cases: ${roundTripCount}`);
  console.log(`display smoke cases: ${displayCount}`);
}

try {
  main();
} catch (error) {
  console.error(error.roundTripDiagnostic || error.stack || error.message);
  process.exitCode = 1;
}
