#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));
const FORMULA_SEED = 0x0f05ca1a;
const GENERATED_FORMULA_COUNT = 100000;
const GENERATED_MAX_DEPTH = 40;
const EXHAUSTIVE_SIZE_BOUND = 5;
const JSON_SCHEMA_DIALECT = 'https://json-schema.org/draft/2020-12/schema';
const MODEL_SCHEMA_ID = 'https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json';
const FORMULA_SCHEMA_ID = 'https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json';

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});
vm.runInContext(fs.readFileSync(path.join(root, 'js/schema-v1.js'), 'utf8'), context, {
  filename: 'js/schema-v1.js',
});

const MPL = context.MPL;
assert.ok(MPL.SchemaV1, 'MPL.SchemaV1 namespace is missing.');
for (const method of ['validateFormulaDocument', 'encodeFormula', 'decodeFormula']) {
  assert.strictEqual(
    typeof MPL.SchemaV1[method],
    'function',
    `MPL.SchemaV1.${method} API does not exist. Formula Schema v1 implementation is required.`
  );
}

const SchemaV1 = MPL.SchemaV1;
let invalidDocumentCount = 0;
let exhaustiveFormulaCount = 0;
let truthComparisonCount = 0;

function cloneJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

function readSchemaArtifact(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, 'schemas', filename), 'utf8'));
}

function assertAbsoluteHttpsUri(value, label) {
  const parsed = new URL(value);
  assert.strictEqual(parsed.protocol, 'https:', `${label}: $id must use HTTPS.`);
  assert.strictEqual(parsed.href, value, `${label}: $id must be an absolute canonical URI.`);
}

function assertLocalRefsResolvable(schema, label) {
  let referenceCount = 0;

  function resolveLocalRef(reference) {
    assert.ok(reference.startsWith('#/'), `${label}: $ref ${reference} must be a local fragment.`);
    const tokens = reference.slice(2).split('/').map(token =>
      token.replace(/~1/g, '/').replace(/~0/g, '~')
    );
    let target = schema;
    tokens.forEach(token => {
      assert.ok(
        target !== null && typeof target === 'object' && Object.prototype.hasOwnProperty.call(target, token),
        `${label}: unresolved local $ref ${reference}.`
      );
      target = target[token];
    });
  }

  function visit(value) {
    if (value === null || typeof value !== 'object') return;
    if (Object.prototype.hasOwnProperty.call(value, '$ref')) {
      assert.strictEqual(typeof value.$ref, 'string', `${label}: $ref must be a string.`);
      resolveLocalRef(value.$ref);
      referenceCount++;
    }
    Object.keys(value).forEach(key => visit(value[key]));
  }

  visit(schema);
  assert.ok(referenceCount > 0, `${label}: expected at least one local $ref.`);
}

function assertSchemaResourceIdentity() {
  const modelSchema = readSchemaArtifact('bapal-model-v1.schema.json');
  const formulaSchema = readSchemaArtifact('bapal-formula-v1.schema.json');

  assert.strictEqual(formulaSchema.$schema, JSON_SCHEMA_DIALECT);
  assert.strictEqual(formulaSchema.$id, FORMULA_SCHEMA_ID);
  assert.ok(!JSON.stringify(formulaSchema).includes('vezwork/modallogic'));
  assertAbsoluteHttpsUri(formulaSchema.$id, 'Formula Schema v1');
  assert.strictEqual(modelSchema.$id, MODEL_SCHEMA_ID);
  assert.notStrictEqual(formulaSchema.$id, modelSchema.$id, 'Formula and model schema $id values must differ.');
  assertLocalRefsResolvable(formulaSchema, 'Formula Schema v1');
  assert.strictEqual(formulaSchema.properties.format.const, 'bapal-formula');
  assert.strictEqual(formulaSchema.properties.version.const, 1);
}

function formulaDocument(formula) {
  return { format: 'bapal-formula', version: 1, formula };
}

function assertSuccess(result, label) {
  assert.ok(result && result.ok === true, `${label}: expected {ok:true}.`);
  return result;
}

function assertFailure(result, code, label, expectedPathPrefix) {
  assert.ok(result && result.ok === false, `${label}: expected {ok:false}.`);
  assert.ok(result.error && typeof result.error === 'object', `${label}: missing error object.`);
  assert.strictEqual(result.error.code, code, `${label}: wrong error code.`);
  assert.strictEqual(typeof result.error.message, 'string', `${label}: message must be a string.`);
  assert.ok(result.error.message.length > 0, `${label}: message must not be empty.`);
  assert.strictEqual(typeof result.error.path, 'string', `${label}: path must be a string.`);
  if (expectedPathPrefix) {
    assert.ok(
      result.error.path.startsWith(expectedPathPrefix),
      `${label}: ${result.error.path} must start with ${expectedPathPrefix}.`
    );
  }
  return result;
}

function encode(wff, label) {
  const result = assertSuccess(SchemaV1.encodeFormula(wff), label || 'encodeFormula');
  assert.ok(result.document && typeof result.document === 'object', `${label}: missing document.`);
  return cloneJSON(result.document);
}

function decode(document, label) {
  const result = assertSuccess(SchemaV1.decodeFormula(document), label || 'decodeFormula');
  assert.ok(result.wff instanceof MPL.Wff, `${label}: decoder must return an MPL.Wff.`);
  assert.ok(result.canonicalDocument, `${label}: decoder must return a canonical document.`);
  return { wff: result.wff, canonicalDocument: cloneJSON(result.canonicalDocument) };
}

function assertLegacyRoundTrip(wff, label) {
  const first = encode(wff, `${label} encode`);
  const decoded = decode(first, `${label} decode`);
  const second = encode(decoded.wff, `${label} re-encode`);
  assert.deepStrictEqual(second, first, `${label}: canonical schema changed.`);
  return { document: first, wff: decoded.wff };
}

function assertStableRoundTrip(node, label) {
  const input = formulaDocument(cloneJSON(node));
  const decoded = decode(input, `${label} decode`);
  const encoded = encode(decoded.wff, `${label} encode`);
  assert.deepStrictEqual(encoded, input, `${label}: stable formula changed.`);
  return decoded.wff;
}

function atom(name) {
  return { type: 'atom', name };
}

function unary(type, operand) {
  return { type, operand };
}

function knowledge(agents, operand) {
  return { type: 'knowledge', agents: agents.slice(), operand };
}

function announcement(precondition, body) {
  return { type: 'announcement', precondition, body };
}

function binary(type, left, right) {
  return { type, left, right };
}

function testEveryConstructor() {
  const examples = [
    ['atom', new MPL.Wff('p')],
    ['not', new MPL.Wff('~p')],
    ['box', new MPL.Wff('□p')],
    ['diamond', new MPL.Wff('<>p')],
    ['bapal', new MPL.Wff('^p')],
    ['knowledge', new MPL.Wff('K{a}p')],
    ['announcement', new MPL.Wff('[p]q')],
    ['and', new MPL.Wff('(p & q)')],
    ['or', new MPL.Wff('(p | q)')],
    ['implies', new MPL.Wff('(p -> q)')],
    ['iff', new MPL.Wff('(p <-> q)')],
  ];

  const observedTypes = new Set();
  examples.forEach(([label, wff]) => {
    const result = assertLegacyRoundTrip(wff, `constructor ${label}`);
    observedTypes.add(result.document.formula.type);
  });
  assert.deepStrictEqual(
    [...observedTypes].sort(),
    ['and', 'announcement', 'atom', 'bapal', 'box', 'diamond', 'iff', 'implies', 'knowledge', 'not', 'or']
  );

  const stringified = assertSuccess(
    SchemaV1.canonicalStringify(formulaDocument(binary('and', atom('p'), atom('q')))),
    'formula canonicalStringify'
  );
  assert.strictEqual(
    stringified.json,
    '{"format":"bapal-formula","version":1,"formula":{"type":"and","left":{"type":"atom","name":"p"},"right":{"type":"atom","name":"q"}}}'
  );
}

function testDifficultSyntax() {
  const cases = [
    '[(K{a}p)]q',
    'K{a}K{b}p',
    'K{abc}p',
    'K{a}[p]q',
    '[p]K{a}q',
    '[p]^K{a}q',
    '^[p]q',
    '□<>p',
    '(p -> q)',
    '(p <-> q)',
    '~□<>^K{a}p',
    '[(~□<>^K{a}p)]^[q]r',
  ];

  cases.forEach(input => {
    const original = new MPL.Wff(input);
    const result = assertLegacyRoundTrip(original, `difficult ${input}`);
    assert.deepStrictEqual(cloneJSON(result.wff.json()), cloneJSON(original.json()), `${input}: legacy AST changed.`);
  });

  const protective = assertLegacyRoundTrip(new MPL.Wff('[(K{a}p)]q'), 'Round 2 minimized case');
  assert.strictEqual(protective.wff.ascii(), '[(K{a}p)]q');
}

function testDirectStructuralMapping() {
  const directWff = new MPL.Wff({ conj: [{ prop: 'foo' }, { prop: 'bar_baz' }] });
  directWff.ascii = function forbiddenASCIIRead() {
    throw new Error('encodeFormula used .ascii() as a bridge.');
  };
  const encoded = encode(directWff, 'direct encode without ASCII');
  assert.deepStrictEqual(encoded.formula, binary('and', atom('foo'), atom('bar_baz')));

  const OriginalWff = MPL.Wff;
  let constructorArgument = null;
  function InspectingWff(argument) {
    constructorArgument = argument;
    assert.strictEqual(typeof argument, 'object', 'decodeFormula passed text to MPL.Wff.');
    assert.notStrictEqual(argument, null, 'decodeFormula passed null to MPL.Wff.');
    return new OriginalWff(argument);
  }
  InspectingWff.prototype = OriginalWff.prototype;
  MPL.Wff = InspectingWff;
  try {
    const decoded = assertSuccess(
      SchemaV1.decodeFormula(formulaDocument(announcement(atom('p'), knowledge(['a'], atom('q'))))),
      'direct decode without parser bridge'
    );
    assert.ok(decoded.wff instanceof OriginalWff);
    assert.deepStrictEqual(cloneJSON(constructorArgument), {
      annce_start: { annce_end: [{ prop: 'p' }, { kno_start: { kno_end: [{ prop: 'a' }, { prop: 'q' }] } }] },
    });
  } finally {
    MPL.Wff = OriginalWff;
  }
}

function makeKnowledgeModel() {
  const model = new MPL.Model();
  model.addState({ p: true });
  model.addState({ p: true });
  model.addState({});
  model.addTransition(0, 1, 'a');
  model.addTransition(0, 2, 'b');
  model.addTransition(0, 1, 'c');
  model.addTransition(1, 1, 'a');
  model.addTransition(1, 1, 'b');
  model.addTransition(1, 1, 'c');
  model.addTransition(2, 2, 'a');
  model.addTransition(2, 2, 'b');
  model.addTransition(2, 2, 'c');
  return model;
}

function testKnowledgeSemantics() {
  const model = makeKnowledgeModel();
  for (const token of ['a', 'ab', 'abc']) {
    const original = new MPL.Wff(`K{${token}}p`);
    const result = assertLegacyRoundTrip(original, `knowledge ${token}`);
    assert.deepStrictEqual(result.document.formula.agents, token.split(''));
    model.getRawStates().forEach((state, world) => {
      if (state === null) return;
      assert.strictEqual(
        MPL.truth(model, world, result.wff),
        MPL.truth(model, world, original),
        `K{${token}}p at world ${world}.`
      );
      truthComparisonCount++;
    });
  }

  const validUnits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('');
  validUnits.forEach(agent => {
    const node = knowledge([agent], atom('p'));
    assert.deepStrictEqual(encode(assertStableRoundTrip(node, `knowledge unit ${agent}`), `knowledge unit ${agent}`), formulaDocument(node));
  });

  const duplicateAgents = knowledge(['a', 'a'], atom('p'));
  assert.deepStrictEqual(
    encode(assertStableRoundTrip(duplicateAgents, 'duplicate knowledge units'), 'duplicate knowledge units'),
    formulaDocument(duplicateAgents),
    'Duplicate shorthand units are structurally preserved because current semantics does not forbid them.'
  );

  for (const invalidAgent of ['', 'ab', '-', ' ', 'é', '😀', 'e\u0301', 1, null]) {
    assertFailure(
      SchemaV1.decodeFormula(formulaDocument(knowledge([invalidAgent], atom('p')))),
      'INVALID_KNOWLEDGE_AGENT',
      `ambiguous knowledge unit ${JSON.stringify(invalidAgent)}`,
      '/formula/agents/0'
    );
  }
}

function testFormulaAtomIdentifiers() {
  const validAtoms = ['p', 'foo', 'bar_baz', 'atom10', '__proto__', 'constructor', 'prototype'];
  validAtoms.forEach(name => {
    const original = new MPL.Wff({ prop: name });
    const result = assertLegacyRoundTrip(original, `formula atom ${name}`);
    assert.strictEqual(result.document.formula.name, name);
  });

  const model = new MPL.Model();
  model.addState({});
  validAtoms.forEach(name => assert.strictEqual(model.valuation(name, 0), false, `${name}: absent must remain false.`));

  const invalidAtoms = ['', 'with spaces', 'punct!', 'quote\'"', '<angle>', '漢字', '😀', 'e\u0301'];
  invalidAtoms.forEach(name => {
    assertFailure(
      SchemaV1.decodeFormula(formulaDocument(atom(name))),
      'INVALID_FORMULA_ATOM',
      `invalid formula atom ${JSON.stringify(name)}`,
      '/formula/name'
    );
  });
}

function invalidFormulaDocuments() {
  return [
    ['wrong format', { format: 'bapal-model', version: 1, formula: atom('p') }, 'INVALID_FORMAT', '/format'],
    ['version zero', { format: 'bapal-formula', version: 0, formula: atom('p') }, 'UNSUPPORTED_VERSION', '/version'],
    ['version two', { format: 'bapal-formula', version: 2, formula: atom('p') }, 'UNSUPPORTED_VERSION', '/version'],
    ['string version', { format: 'bapal-formula', version: '1', formula: atom('p') }, 'INVALID_VERSION_TYPE', '/version'],
    ['missing formula', { format: 'bapal-formula', version: 1 }, 'MISSING_PROPERTY', '/formula'],
    ['extra envelope field', { format: 'bapal-formula', version: 1, formula: atom('p'), extra: true }, 'UNEXPECTED_PROPERTY', '/extra'],
    ['unknown node', formulaDocument({ type: 'future', operand: atom('p') }), 'INVALID_NODE_TYPE', '/formula/type'],
    ['extra atom field', formulaDocument({ type: 'atom', name: 'p', extra: true }), 'UNEXPECTED_PROPERTY', '/formula/extra'],
    ['wrong operand type', formulaDocument(unary('not', 3)), 'INVALID_NODE', '/formula/operand'],
    ['null child', formulaDocument(unary('box', null)), 'INVALID_NODE', '/formula/operand'],
    ['empty knowledge agents', formulaDocument(knowledge([], atom('p'))), 'EMPTY_KNOWLEDGE_AGENTS', '/formula/agents'],
    ['invalid knowledge identifier', formulaDocument(knowledge(['alice'], atom('p'))), 'INVALID_KNOWLEDGE_AGENT', '/formula/agents/0'],
    ['binary missing right', formulaDocument({ type: 'and', left: atom('p') }), 'MISSING_PROPERTY', '/formula/right'],
    ['announcement missing precondition', formulaDocument({ type: 'announcement', body: atom('p') }), 'MISSING_PROPERTY', '/formula/precondition'],
    ['malformed descendant', formulaDocument(binary('implies', atom('p'), unary('not', { type: 'atom' }))), 'MISSING_PROPERTY', '/formula/right/operand/name'],
  ];
}

function testInvalidFormulaDocuments() {
  const cases = invalidFormulaDocuments();
  invalidDocumentCount = cases.length + 1;
  cases.forEach(([label, document, code, pathPrefix]) => {
    assertFailure(SchemaV1.validateFormulaDocument(document), code, `${label} validation`, pathPrefix);
    assertFailure(SchemaV1.decodeFormula(document), code, `${label} decode`, pathPrefix);
  });

  const cyclicNode = unary('not', null);
  cyclicNode.operand = cyclicNode;
  assertFailure(
    SchemaV1.validateFormulaDocument(formulaDocument(cyclicNode)),
    'CYCLIC_FORMULA',
    'cyclic formula',
    '/formula/operand'
  );

  assertSchemaResourceIdentity();
  const schema = readSchemaArtifact('bapal-formula-v1.schema.json');
  assert.strictEqual(schema.$schema, JSON_SCHEMA_DIALECT);
  assert.strictEqual(schema.properties.format.const, 'bapal-formula');
  assert.strictEqual(schema.properties.version.const, 1);
  assert.strictEqual(schema.additionalProperties, false);
  for (const definition of ['atom', 'unary', 'knowledge', 'announcement', 'binary']) {
    assert.strictEqual(schema.$defs[definition].additionalProperties, false, `${definition}: extra fields must be forbidden.`);
  }
}

function testNoInputMutation() {
  const legacy = {
    annce_start: {
      annce_end: [
        { prop: 'p' },
        { kno_start: { kno_end: [{ prop: 'ab' }, { prop: 'q' }] } },
      ],
    },
  };
  const wff = new MPL.Wff(legacy);
  const legacyBefore = JSON.stringify(legacy);
  const encoded = encode(wff, 'mutation encode');
  assert.strictEqual(JSON.stringify(legacy), legacyBefore, 'Encoding mutated Wff JSON.');

  encoded.formula.body.operand.name = 'encoded_mutation';
  assert.strictEqual(wff.json().annce_start.annce_end[1].kno_start.kno_end[1].prop, 'q');

  const input = formulaDocument(announcement(atom('p'), knowledge(['a', 'b'], atom('q'))));
  const inputBefore = JSON.stringify(input);
  const decoded = decode(input, 'mutation decode');
  assert.strictEqual(JSON.stringify(input), inputBefore, 'Decoding mutated schema input.');

  input.formula.body.operand.name = 'input_mutation';
  assert.strictEqual(decoded.wff.json().annce_start.annce_end[1].kno_start.kno_end[1].prop, 'q');
  decoded.wff.json().annce_start.annce_end[1].kno_start.kno_end[1].prop = 'decoded_mutation';
  assert.strictEqual(input.formula.body.operand.name, 'input_mutation');
}

const exhaustiveAtoms = [atom('p'), atom('q')];
const unaryBuilders = [
  child => unary('not', child),
  child => unary('box', child),
  child => unary('diamond', child),
  child => unary('bapal', child),
  child => knowledge(['a'], child),
  child => knowledge(['a', 'b'], child),
];
const binaryBuilders = [
  (left, right) => announcement(left, right),
  (left, right) => binary('and', left, right),
  (left, right) => binary('or', left, right),
  (left, right) => binary('implies', left, right),
  (left, right) => binary('iff', left, right),
];

function exhaustiveStableFormulas() {
  const bySize = new Map([[1, exhaustiveAtoms.map(cloneJSON)]]);
  for (let size = 2; size <= EXHAUSTIVE_SIZE_BOUND; size++) {
    const formulas = [];
    bySize.get(size - 1).forEach(child => {
      unaryBuilders.forEach(build => formulas.push(build(cloneJSON(child))));
    });
    for (let leftSize = 1; leftSize <= size - 2; leftSize++) {
      const rightSize = size - 1 - leftSize;
      bySize.get(leftSize).forEach(left => {
        bySize.get(rightSize).forEach(right => {
          binaryBuilders.forEach(build => formulas.push(build(cloneJSON(left), cloneJSON(right))));
        });
      });
    }
    bySize.set(size, formulas);
  }
  return bySize;
}

function testExhaustiveSmallAsts() {
  const bySize = exhaustiveStableFormulas();
  const counts = [];
  for (let size = 1; size <= EXHAUSTIVE_SIZE_BOUND; size++) {
    const formulas = bySize.get(size);
    counts.push(formulas.length);
    formulas.forEach((node, index) => {
      assertStableRoundTrip(node, `exhaustive size ${size} index ${index}`);
      exhaustiveFormulaCount++;
    });
  }
  assert.deepStrictEqual(counts, [2, 12, 92, 792, 7312]);
  assert.strictEqual(exhaustiveFormulaCount, 8210);
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

const generatedAtoms = ['p', 'q', 'foo', 'bar_baz', 'atom10'];
const generatedKnowledgeUnits = [['a'], ['b'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'a']];
const generatedUnaryTypes = ['not', 'box', 'diamond', 'bapal', 'knowledge'];
const generatedBinaryTypes = ['announcement', 'and', 'or', 'implies', 'iff'];

function generateStableFormula(random, size, forcedType) {
  if (size <= 1 || forcedType === 'atom') return atom(generatedAtoms[integer(random, generatedAtoms.length)]);

  let type = forcedType;
  if (!type) {
    const eligible = size === 2 ? generatedUnaryTypes : generatedUnaryTypes.concat(generatedBinaryTypes);
    type = eligible[integer(random, eligible.length)];
  }

  if (generatedUnaryTypes.includes(type)) {
    const child = generateStableFormula(random, size - 1);
    if (type === 'knowledge') {
      return knowledge(generatedKnowledgeUnits[integer(random, generatedKnowledgeUnits.length)], child);
    }
    return unary(type, child);
  }

  const leftSize = 1 + integer(random, size - 2);
  const rightSize = size - 1 - leftSize;
  const left = generateStableFormula(random, leftSize);
  const right = generateStableFormula(random, rightSize);
  return type === 'announcement' ? announcement(left, right) : binary(type, left, right);
}

function formulaDepth(node) {
  if (node.type === 'atom') return 1;
  if (['not', 'box', 'diamond', 'bapal', 'knowledge'].includes(node.type)) return 1 + formulaDepth(node.operand);
  if (node.type === 'announcement') return 1 + Math.max(formulaDepth(node.precondition), formulaDepth(node.body));
  return 1 + Math.max(formulaDepth(node.left), formulaDepth(node.right));
}

function countTypes(node, counts) {
  counts[node.type] = (counts[node.type] || 0) + 1;
  if (node.type === 'atom') return;
  if (['not', 'box', 'diamond', 'bapal', 'knowledge'].includes(node.type)) {
    countTypes(node.operand, counts);
  } else if (node.type === 'announcement') {
    countTypes(node.precondition, counts);
    countTypes(node.body, counts);
  } else {
    countTypes(node.left, counts);
    countTypes(node.right, counts);
  }
}

function deepUnaryFormula(depth) {
  let node = atom('foo');
  const cycle = ['not', 'box', 'diamond', 'bapal'];
  while (formulaDepth(node) < depth) node = unary(cycle[(formulaDepth(node) - 1) % cycle.length], node);
  return node;
}

function testGeneratedFormulas() {
  const random = mulberry32(FORMULA_SEED);
  const types = ['atom', 'not', 'box', 'diamond', 'bapal', 'knowledge', 'announcement', 'and', 'or', 'implies', 'iff'];
  const typeCounts = Object.create(null);
  let maximumDepth = 0;

  for (let caseIndex = 0; caseIndex < GENERATED_FORMULA_COUNT; caseIndex++) {
    let node;
    if (caseIndex < types.length) {
      const type = types[caseIndex];
      const minimumSize = generatedBinaryTypes.includes(type) ? 3 : type === 'atom' ? 1 : 2;
      node = generateStableFormula(random, minimumSize, type);
    } else if (caseIndex === types.length) {
      node = deepUnaryFormula(GENERATED_MAX_DEPTH);
    } else {
      node = generateStableFormula(random, 1 + integer(random, GENERATED_MAX_DEPTH));
    }

    try {
      const first = decode(formulaDocument(node), `generated ${caseIndex} decode`);
      const encoded = encode(first.wff, `generated ${caseIndex} encode`);
      assert.deepStrictEqual(encoded, formulaDocument(node), `generated ${caseIndex}: stable identity.`);
      const second = decode(encoded, `generated ${caseIndex} second decode`);
      assert.deepStrictEqual(
        cloneJSON(second.wff.json()),
        cloneJSON(first.wff.json()),
        `generated ${caseIndex}: normalized legacy AST changed.`
      );
      countTypes(node, typeCounts);
      maximumDepth = Math.max(maximumDepth, formulaDepth(node));
    } catch (error) {
      console.error(`Formula Schema v1 replay: seed=${FORMULA_SEED} case=${caseIndex}`);
      console.error(JSON.stringify(node));
      throw error;
    }
  }

  types.forEach(type => assert.ok(typeCounts[type] > 0, `Generated corpus missed ${type}.`));
  assert.strictEqual(maximumDepth, GENERATED_MAX_DEPTH);
  console.log(`Formula Schema v1 seed: ${FORMULA_SEED} (0x${FORMULA_SEED.toString(16)})`);
  console.log(`Generated formulas: ${GENERATED_FORMULA_COUNT}`);
  console.log(`Generated maximum depth: ${maximumDepth}`);
  console.log(`Generated constructor counts: ${JSON.stringify(typeCounts)}`);
}

function makeTruthModels() {
  const sparse = new MPL.Model();
  sparse.addState({ p: true, foo: true });
  sparse.addState({ removed: true });
  sparse.addState({ p: true, q: true });
  sparse.addState({ q: true });
  sparse.removeState(1);
  sparse.addTransition(0, 2, 'a');
  sparse.addTransition(0, 3, 'b');
  sparse.addTransition(2, 0, 'a');
  sparse.addTransition(3, 3, 'c');

  const s5 = new MPL.Model();
  s5.addState({ p: true });
  s5.addState({ p: true, q: true });
  s5.addState({ q: true });
  s5.addTransition(0, 1, 'a');
  s5.addTransition(1, 2, 'b');
  s5.closeEquivalenceRelations(['a', 'b', 'c']);

  const nonS5 = makeKnowledgeModel();

  const valuationClasses = new MPL.Model();
  valuationClasses.addState({ p: true, foo: true });
  valuationClasses.addState({ foo: true, p: true });
  valuationClasses.addState({ q: true });
  valuationClasses.addState({});
  for (let source = 0; source < 4; source++) {
    for (let target = 0; target < 4; target++) valuationClasses.addTransition(source, target, 'a');
  }
  return [sparse, s5, nonS5, valuationClasses];
}

function compareTruth(original, decoded, models, label) {
  models.forEach((model, modelIndex) => {
    model.getRawStates().forEach((state, world) => {
      if (state === null) return;
      assert.strictEqual(
        MPL.truth(model, world, decoded),
        MPL.truth(model, world, original),
        `${label}: model ${modelIndex}, world ${world}.`
      );
      truthComparisonCount++;
    });
  });
}

function testTruthPreservation() {
  const models = makeTruthModels();
  const selected = [
    'p',
    'foo',
    '~p',
    '(p & q)',
    'K{a}p',
    'K{ab}p',
    'K{abc}p',
    '[p]q',
    '^p',
    'K{a}[p]q',
    '[p]K{a}q',
    '[p]^K{a}q',
    '^[p]K{a}q',
    '□p',
    '<>q',
  ];
  selected.forEach(text => {
    const original = new MPL.Wff(text);
    const decoded = decode(encode(original, `truth ${text} encode`), `truth ${text} decode`).wff;
    compareTruth(original, decoded, models, text);
  });

  const random = mulberry32(FORMULA_SEED ^ 0x74727574);
  for (let index = 0; index < 40; index++) {
    const node = generateStableFormula(random, 1 + integer(random, 7));
    const original = decode(formulaDocument(node), `truth generated ${index} original`).wff;
    const decoded = decode(encode(original, `truth generated ${index} encode`), `truth generated ${index} decode`).wff;
    compareTruth(original, decoded, models, `generated truth ${index}`);
  }
}

testEveryConstructor();
testDifficultSyntax();
testDirectStructuralMapping();
testKnowledgeSemantics();
testFormulaAtomIdentifiers();
testInvalidFormulaDocuments();
testNoInputMutation();
testExhaustiveSmallAsts();
testGeneratedFormulas();
testTruthPreservation();

console.log('Formula Schema v1 deterministic groups: 10');
console.log(`Exhaustive formulas through size ${EXHAUSTIVE_SIZE_BOUND}: ${exhaustiveFormulaCount}`);
console.log(`Invalid formula documents: ${invalidDocumentCount}`);
console.log(`Truth comparisons: ${truthComparisonCount}`);
console.log('Formula Schema v1 checks passed.');
