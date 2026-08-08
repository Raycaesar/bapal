/**
 * Stable, versioned JSON interchange for BAPAL semantic models.
 *
 * This helper deliberately does not use the legacy compact URL format.
 */
(function(MPL) {
  'use strict';

  if (!MPL || typeof MPL.Model !== 'function') {
    throw new Error('MPL.SchemaV1 requires MPL.Model. Load js/MPL.js first.');
  }

  const FORMAT = 'bapal-model';
  const FORMULA_FORMAT = 'bapal-formula';
  const VERSION = 1;
  const FORMULA_ATOM_PATTERN = /^[A-Za-z0-9_]+$/;
  const KNOWLEDGE_AGENT_PATTERN = /^[A-Za-z0-9_]$/;
  const hasOwn = (object, property) => Object.prototype.hasOwnProperty.call(object, property);

  function failure(code, message, path, details) {
    return {
      ok: false,
      error: Object.assign({
        code,
        message,
        path: typeof path === 'string' ? path : '',
      }, details || {}),
    };
  }

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function escapePointerToken(value) {
    return String(value).replace(/~/g, '~0').replace(/\//g, '~1');
  }

  function propertyPath(parent, property) {
    return `${parent}/${escapePointerToken(property)}`;
  }

  function validateExactProperties(object, required, allowed, path) {
    for (const property of required) {
      if (!hasOwn(object, property)) {
        return failure(
          'MISSING_PROPERTY',
          `Required property ${JSON.stringify(property)} is missing.`,
          propertyPath(path, property),
          { property }
        );
      }
    }

    for (const property of Object.keys(object)) {
      if (!allowed.includes(property)) {
        return failure(
          'UNEXPECTED_PROPERTY',
          `Property ${JSON.stringify(property)} is not allowed.`,
          propertyPath(path, property),
          { property }
        );
      }
    }
    return null;
  }

  function isUnicodeScalarString(value) {
    if (typeof value !== 'string' || value.length === 0) return false;

    for (let index = 0; index < value.length; index++) {
      const unit = value.charCodeAt(index);
      if (unit >= 0xD800 && unit <= 0xDBFF) {
        if (index + 1 >= value.length) return false;
        const next = value.charCodeAt(index + 1);
        if (next < 0xDC00 || next > 0xDFFF) return false;
        index++;
      } else if (unit >= 0xDC00 && unit <= 0xDFFF) {
        return false;
      }
    }
    return true;
  }

  function compareUnicodeScalars(left, right) {
    const leftCharacters = Array.from(left);
    const rightCharacters = Array.from(right);
    const length = Math.min(leftCharacters.length, rightCharacters.length);

    for (let index = 0; index < length; index++) {
      const difference = leftCharacters[index].codePointAt(0) - rightCharacters[index].codePointAt(0);
      if (difference !== 0) return difference;
    }
    return leftCharacters.length - rightCharacters.length;
  }

  function validateIdentifier(identifier, path, kind) {
    if (!isUnicodeScalarString(identifier)) {
      return failure(
        'INVALID_IDENTIFIER',
        `${kind} must be a nonempty string containing only well-formed Unicode scalar values.`,
        path,
        { identifierKind: kind }
      );
    }
    return null;
  }

  function validateTarget(target, path) {
    if (typeof target !== 'number' || !Number.isFinite(target) || !Number.isInteger(target)) {
      return failure('TARGET_NOT_INTEGER', 'Transition target must be an integer.', path);
    }
    if (!Number.isSafeInteger(target)) {
      return failure('UNSAFE_TARGET', 'Transition target must be a safe integer.', path);
    }
    if (target < 0) {
      return failure('NEGATIVE_TARGET', 'Transition target must be non-negative.', path);
    }
    return null;
  }

  function validateModelDocumentInternal(document) {
    if (!isRecord(document)) {
      return failure('INVALID_DOCUMENT', 'Model document must be a non-null object.', '');
    }

    if (!hasOwn(document, 'format')) {
      return failure('MISSING_PROPERTY', 'Required property "format" is missing.', '/format', {
        property: 'format',
      });
    }
    if (document.format !== FORMAT) {
      return failure('INVALID_FORMAT', `Model format must be ${JSON.stringify(FORMAT)}.`, '/format', {
        expected: FORMAT,
        actual: document.format,
      });
    }

    if (!hasOwn(document, 'version')) {
      return failure('MISSING_PROPERTY', 'Required property "version" is missing.', '/version', {
        property: 'version',
      });
    }
    if (typeof document.version !== 'number' || !Number.isInteger(document.version)) {
      return failure('INVALID_VERSION_TYPE', 'Model version must be an integer.', '/version', {
        actual: document.version,
      });
    }
    if (document.version !== VERSION) {
      return failure('UNSUPPORTED_VERSION', `Unsupported bapal-model version ${document.version}.`, '/version', {
        supportedVersion: VERSION,
        actual: document.version,
      });
    }

    if (!hasOwn(document, 'worlds')) {
      return failure('MISSING_PROPERTY', 'Required property "worlds" is missing.', '/worlds', {
        property: 'worlds',
      });
    }

    const topLevelProperties = validateExactProperties(
      document,
      ['format', 'version', 'worlds'],
      ['format', 'version', 'worlds'],
      ''
    );
    if (topLevelProperties) return topLevelProperties;

    if (!Array.isArray(document.worlds)) {
      return failure('INVALID_WORLDS', 'Property "worlds" must be an array.', '/worlds');
    }

    const canonicalWorlds = [];
    const targetReferences = [];
    for (let worldIndex = 0; worldIndex < document.worlds.length; worldIndex++) {
      const world = document.worlds[worldIndex];
      const worldPath = `/worlds/${worldIndex}`;
      if (world === null) {
        canonicalWorlds.push(null);
        continue;
      }
      if (!isRecord(world)) {
        return failure('INVALID_WORLD', 'Each world must be null or an object.', worldPath, {
          worldIndex,
        });
      }

      const worldProperties = validateExactProperties(
        world,
        ['trueAtoms', 'transitions'],
        ['trueAtoms', 'transitions'],
        worldPath
      );
      if (worldProperties) return worldProperties;

      if (!Array.isArray(world.trueAtoms)) {
        return failure('INVALID_TRUE_ATOMS', 'Property "trueAtoms" must be an array.', `${worldPath}/trueAtoms`, {
          worldIndex,
        });
      }
      if (!Array.isArray(world.transitions)) {
        return failure('INVALID_TRANSITIONS', 'Property "transitions" must be an array.', `${worldPath}/transitions`, {
          worldIndex,
        });
      }

      const trueAtoms = [];
      const seenAtoms = new Set();
      for (let atomIndex = 0; atomIndex < world.trueAtoms.length; atomIndex++) {
        const atom = world.trueAtoms[atomIndex];
        const atomPath = `${worldPath}/trueAtoms/${atomIndex}`;
        const identifierFailure = validateIdentifier(atom, atomPath, 'Model atom name');
        if (identifierFailure) return identifierFailure;
        if (seenAtoms.has(atom)) {
          return failure('DUPLICATE_ATOM', `Duplicate true atom ${JSON.stringify(atom)}.`, atomPath, {
            worldIndex,
            atom,
          });
        }
        seenAtoms.add(atom);
        trueAtoms.push(atom);
      }

      const transitions = [];
      const seenTransitions = new Map();
      for (let transitionIndex = 0; transitionIndex < world.transitions.length; transitionIndex++) {
        const transition = world.transitions[transitionIndex];
        const transitionPath = `${worldPath}/transitions/${transitionIndex}`;
        if (!isRecord(transition)) {
          return failure('INVALID_TRANSITION', 'Each transition must be an object.', transitionPath, {
            worldIndex,
            transitionIndex,
          });
        }

        const transitionProperties = validateExactProperties(
          transition,
          ['target', 'agent'],
          ['target', 'agent'],
          transitionPath
        );
        if (transitionProperties) return transitionProperties;

        const targetFailure = validateTarget(transition.target, `${transitionPath}/target`);
        if (targetFailure) return targetFailure;
        const agentFailure = validateIdentifier(transition.agent, `${transitionPath}/agent`, 'Model relation label');
        if (agentFailure) return agentFailure;

        let agentsAtTarget = seenTransitions.get(transition.target);
        if (!agentsAtTarget) {
          agentsAtTarget = new Set();
          seenTransitions.set(transition.target, agentsAtTarget);
        }
        if (agentsAtTarget.has(transition.agent)) {
          return failure(
            'DUPLICATE_TRANSITION',
            `Duplicate transition to ${transition.target} for agent ${JSON.stringify(transition.agent)}.`,
            transitionPath,
            { worldIndex, transitionIndex, target: transition.target, agent: transition.agent }
          );
        }
        agentsAtTarget.add(transition.agent);
        transitions.push({ target: transition.target, agent: transition.agent });
        targetReferences.push({
          worldIndex,
          transitionIndex,
          target: transition.target,
        });
      }

      trueAtoms.sort(compareUnicodeScalars);
      transitions.sort((left, right) =>
        left.target - right.target || compareUnicodeScalars(left.agent, right.agent)
      );
      canonicalWorlds.push({ trueAtoms, transitions });
    }

    for (const reference of targetReferences) {
      const path = `/worlds/${reference.worldIndex}/transitions/${reference.transitionIndex}/target`;
      if (reference.target >= canonicalWorlds.length) {
        return failure(
          'TARGET_OUT_OF_RANGE',
          `Transition target ${reference.target} is outside the worlds array.`,
          path,
          {
            worldIndex: reference.worldIndex,
            transitionIndex: reference.transitionIndex,
            target: reference.target,
            worldCount: canonicalWorlds.length,
          }
        );
      }
      if (canonicalWorlds[reference.target] === null) {
        return failure(
          'TARGET_NOT_LIVE',
          `Transition target ${reference.target} refers to a null world.`,
          path,
          {
            worldIndex: reference.worldIndex,
            transitionIndex: reference.transitionIndex,
            target: reference.target,
          }
        );
      }
    }

    return {
      ok: true,
      canonicalDocument: {
        format: FORMAT,
        version: VERSION,
        worlds: canonicalWorlds,
      },
    };
  }

  function validateModelDocument(document) {
    try {
      return validateModelDocumentInternal(document);
    } catch (error) {
      return failure(
        'DOCUMENT_ACCESS_FAILED',
        'The model document could not be inspected safely.',
        '',
        { cause: error && error.message ? error.message : String(error) }
      );
    }
  }

  function encodeModel(model) {
    if (!model || typeof model.getRawStates !== 'function') {
      return failure('INVALID_MODEL', 'encodeModel requires an MPL.Model-compatible value.', '');
    }

    let states;
    try {
      states = model.getRawStates();
    } catch (error) {
      return failure('MODEL_ACCESS_FAILED', 'The model states could not be read.', '', {
        cause: error && error.message ? error.message : String(error),
      });
    }
    if (!Array.isArray(states)) {
      return failure('INVALID_MODEL', 'Model raw states must be an array.', '/worlds');
    }

    const worlds = [];
    try {
      for (let worldIndex = 0; worldIndex < states.length; worldIndex++) {
        const state = states[worldIndex];
        if (state === null) {
          worlds.push(null);
          continue;
        }
        if (!isRecord(state) || !isRecord(state.assignment) || !Array.isArray(state.successors)) {
          return failure('INVALID_MODEL_STATE', 'Model contains an invalid raw state.', `/worlds/${worldIndex}`, {
            worldIndex,
          });
        }

        const trueAtoms = Object.keys(state.assignment)
          .filter(atom => state.assignment[atom] === true);
        const transitions = state.successors.map(successor => {
          if (!isRecord(successor)) return successor;
          return { target: successor.target, agent: successor.agent };
        });
        worlds.push({ trueAtoms, transitions });
      }
    } catch (error) {
      return failure('MODEL_ACCESS_FAILED', 'The model contains unreadable state data.', '', {
        cause: error && error.message ? error.message : String(error),
      });
    }

    const validation = validateModelDocument({ format: FORMAT, version: VERSION, worlds });
    if (!validation.ok) return validation;
    return { ok: true, document: validation.canonicalDocument };
  }

  function decodeModel(document) {
    const validation = validateModelDocument(document);
    if (!validation.ok) return validation;

    const canonicalDocument = validation.canonicalDocument;
    try {
      const model = new MPL.Model();
      const nullWorlds = [];

      canonicalDocument.worlds.forEach((world, worldIndex) => {
        const assignment = Object.create(null);
        if (world === null) {
          nullWorlds.push(worldIndex);
        } else {
          world.trueAtoms.forEach(atom => {
            assignment[atom] = true;
          });
        }
        model.addState(assignment);
      });

      nullWorlds.forEach(worldIndex => model.removeState(worldIndex));
      canonicalDocument.worlds.forEach((world, sourceIndex) => {
        if (world === null) return;
        world.transitions.forEach(transition => {
          model.addTransition(sourceIndex, transition.target, transition.agent);
        });
      });

      return { ok: true, model, canonicalDocument };
    } catch (error) {
      return failure('MODEL_CONSTRUCTION_FAILED', 'The validated model could not be constructed.', '', {
        cause: error && error.message ? error.message : String(error),
      });
    }
  }

  function validateFormulaAtom(name, path) {
    if (typeof name !== 'string' || !FORMULA_ATOM_PATTERN.test(name)) {
      return failure(
        'INVALID_FORMULA_ATOM',
        'Formula atom names must be nonempty ASCII word identifiers.',
        path,
        { actual: name }
      );
    }
    return null;
  }

  function validateKnowledgeAgent(agent, path) {
    if (typeof agent !== 'string' || !KNOWLEDGE_AGENT_PATTERN.test(agent)) {
      return failure(
        'INVALID_KNOWLEDGE_AGENT',
        'Each knowledge shorthand unit must be exactly one ASCII letter, digit, or underscore.',
        path,
        { actual: agent }
      );
    }
    return null;
  }

  const unaryFormulaTypes = new Set(['not', 'box', 'diamond', 'bapal']);
  const binaryFormulaTypes = new Set(['and', 'or', 'implies', 'iff']);
  const formulaNodeTypes = new Set([
    'atom',
    'not',
    'box',
    'diamond',
    'bapal',
    'knowledge',
    'announcement',
    'and',
    'or',
    'implies',
    'iff',
  ]);

  function validateStableFormulaNode(node, path, ancestors) {
    if (!isRecord(node)) {
      return failure('INVALID_NODE', 'Formula nodes must be non-null objects.', path);
    }
    if (ancestors.has(node)) {
      return failure('CYCLIC_FORMULA', 'Formula documents must not contain cycles.', path);
    }
    ancestors.add(node);

    try {
      if (!hasOwn(node, 'type')) {
        return failure('MISSING_PROPERTY', 'Required property "type" is missing.', `${path}/type`, {
          property: 'type',
        });
      }
      if (typeof node.type !== 'string' || !formulaNodeTypes.has(node.type)) {
        return failure('INVALID_NODE_TYPE', `Unknown Formula Schema v1 node type ${JSON.stringify(node.type)}.`, `${path}/type`, {
          actual: node.type,
        });
      }

      if (node.type === 'atom') {
        const properties = validateExactProperties(node, ['type', 'name'], ['type', 'name'], path);
        if (properties) return properties;
        const atomFailure = validateFormulaAtom(node.name, `${path}/name`);
        if (atomFailure) return atomFailure;
        return { ok: true, node: { type: 'atom', name: node.name } };
      }

      if (unaryFormulaTypes.has(node.type)) {
        const properties = validateExactProperties(node, ['type', 'operand'], ['type', 'operand'], path);
        if (properties) return properties;
        const operand = validateStableFormulaNode(node.operand, `${path}/operand`, ancestors);
        if (!operand.ok) return operand;
        return { ok: true, node: { type: node.type, operand: operand.node } };
      }

      if (node.type === 'knowledge') {
        const properties = validateExactProperties(
          node,
          ['type', 'agents', 'operand'],
          ['type', 'agents', 'operand'],
          path
        );
        if (properties) return properties;
        if (!Array.isArray(node.agents)) {
          return failure('INVALID_KNOWLEDGE_AGENTS', 'Knowledge agents must be an array.', `${path}/agents`);
        }
        if (node.agents.length === 0) {
          return failure('EMPTY_KNOWLEDGE_AGENTS', 'Knowledge agents must not be empty.', `${path}/agents`);
        }

        const agents = [];
        for (let index = 0; index < node.agents.length; index++) {
          const agentFailure = validateKnowledgeAgent(node.agents[index], `${path}/agents/${index}`);
          if (agentFailure) return agentFailure;
          agents.push(node.agents[index]);
        }
        const operand = validateStableFormulaNode(node.operand, `${path}/operand`, ancestors);
        if (!operand.ok) return operand;
        return { ok: true, node: { type: 'knowledge', agents, operand: operand.node } };
      }

      if (node.type === 'announcement') {
        const properties = validateExactProperties(
          node,
          ['type', 'precondition', 'body'],
          ['type', 'precondition', 'body'],
          path
        );
        if (properties) return properties;
        const precondition = validateStableFormulaNode(node.precondition, `${path}/precondition`, ancestors);
        if (!precondition.ok) return precondition;
        const body = validateStableFormulaNode(node.body, `${path}/body`, ancestors);
        if (!body.ok) return body;
        return {
          ok: true,
          node: { type: 'announcement', precondition: precondition.node, body: body.node },
        };
      }

      if (binaryFormulaTypes.has(node.type)) {
        const properties = validateExactProperties(node, ['type', 'left', 'right'], ['type', 'left', 'right'], path);
        if (properties) return properties;
        const left = validateStableFormulaNode(node.left, `${path}/left`, ancestors);
        if (!left.ok) return left;
        const right = validateStableFormulaNode(node.right, `${path}/right`, ancestors);
        if (!right.ok) return right;
        return { ok: true, node: { type: node.type, left: left.node, right: right.node } };
      }

      return failure('INVALID_NODE_TYPE', `Unsupported formula node type ${JSON.stringify(node.type)}.`, `${path}/type`);
    } finally {
      ancestors.delete(node);
    }
  }

  function validateFormulaDocumentInternal(document) {
    if (!isRecord(document)) {
      return failure('INVALID_DOCUMENT', 'Formula document must be a non-null object.', '');
    }

    if (!hasOwn(document, 'format')) {
      return failure('MISSING_PROPERTY', 'Required property "format" is missing.', '/format', {
        property: 'format',
      });
    }
    if (document.format !== FORMULA_FORMAT) {
      return failure('INVALID_FORMAT', `Formula format must be ${JSON.stringify(FORMULA_FORMAT)}.`, '/format', {
        expected: FORMULA_FORMAT,
        actual: document.format,
      });
    }

    if (!hasOwn(document, 'version')) {
      return failure('MISSING_PROPERTY', 'Required property "version" is missing.', '/version', {
        property: 'version',
      });
    }
    if (typeof document.version !== 'number' || !Number.isInteger(document.version)) {
      return failure('INVALID_VERSION_TYPE', 'Formula version must be an integer.', '/version', {
        actual: document.version,
      });
    }
    if (document.version !== VERSION) {
      return failure('UNSUPPORTED_VERSION', `Unsupported bapal-formula version ${document.version}.`, '/version', {
        supportedVersion: VERSION,
        actual: document.version,
      });
    }

    if (!hasOwn(document, 'formula')) {
      return failure('MISSING_PROPERTY', 'Required property "formula" is missing.', '/formula', {
        property: 'formula',
      });
    }
    const properties = validateExactProperties(
      document,
      ['format', 'version', 'formula'],
      ['format', 'version', 'formula'],
      ''
    );
    if (properties) return properties;

    const formula = validateStableFormulaNode(document.formula, '/formula', new Set());
    if (!formula.ok) return formula;
    return {
      ok: true,
      canonicalDocument: {
        format: FORMULA_FORMAT,
        version: VERSION,
        formula: formula.node,
      },
    };
  }

  function validateFormulaDocument(document) {
    try {
      return validateFormulaDocumentInternal(document);
    } catch (error) {
      return failure(
        'DOCUMENT_ACCESS_FAILED',
        'The formula document could not be inspected safely.',
        '',
        { cause: error && error.message ? error.message : String(error) }
      );
    }
  }

  const legacyUnaryToStable = {
    neg: 'not',
    nec: 'box',
    poss: 'diamond',
    bapal: 'bapal',
  };
  const legacyBinaryToStable = {
    conj: 'and',
    disj: 'or',
    impl: 'implies',
    equi: 'iff',
  };

  function invalidLegacyNode(message, path, details) {
    return failure('INVALID_LEGACY_NODE', message, path, details);
  }

  function legacyFormulaToStable(node, path, ancestors) {
    if (!isRecord(node)) return invalidLegacyNode('Legacy Wff nodes must be non-null objects.', path);
    if (ancestors.has(node)) {
      return failure('CYCLIC_LEGACY_FORMULA', 'Legacy Wff JSON must not contain cycles.', path);
    }
    ancestors.add(node);

    try {
      const keys = Object.keys(node);
      if (keys.length !== 1) {
        return invalidLegacyNode('Legacy Wff nodes must contain exactly one constructor.', path, { keys });
      }
      const key = keys[0];

      if (key === 'prop') {
        const atomFailure = validateFormulaAtom(node.prop, `${path}/prop`);
        if (atomFailure) return atomFailure;
        return { ok: true, node: { type: 'atom', name: node.prop } };
      }

      if (hasOwn(legacyUnaryToStable, key)) {
        const operand = legacyFormulaToStable(node[key], `${path}/${key}`, ancestors);
        if (!operand.ok) return operand;
        return { ok: true, node: { type: legacyUnaryToStable[key], operand: operand.node } };
      }

      if (hasOwn(legacyBinaryToStable, key)) {
        if (!Array.isArray(node[key]) || node[key].length !== 2) {
          return invalidLegacyNode(`Legacy ${key} must contain exactly two operands.`, `${path}/${key}`);
        }
        const left = legacyFormulaToStable(node[key][0], `${path}/${key}/0`, ancestors);
        if (!left.ok) return left;
        const right = legacyFormulaToStable(node[key][1], `${path}/${key}/1`, ancestors);
        if (!right.ok) return right;
        return { ok: true, node: { type: legacyBinaryToStable[key], left: left.node, right: right.node } };
      }

      if (key === 'kno_start') {
        if (!isRecord(node.kno_start) || Object.keys(node.kno_start).length !== 1 ||
            !hasOwn(node.kno_start, 'kno_end') || !Array.isArray(node.kno_start.kno_end) ||
            node.kno_start.kno_end.length !== 2) {
          return invalidLegacyNode('Legacy knowledge nodes must contain kno_start.kno_end[token, operand].', `${path}/kno_start`);
        }
        const tokenNode = node.kno_start.kno_end[0];
        if (!isRecord(tokenNode) || Object.keys(tokenNode).length !== 1 || !hasOwn(tokenNode, 'prop') ||
            typeof tokenNode.prop !== 'string' || !FORMULA_ATOM_PATTERN.test(tokenNode.prop)) {
          return failure(
            'INVALID_KNOWLEDGE_TOKEN',
            'Legacy knowledge tokens must be nonempty ASCII word identifiers.',
            `${path}/kno_start/kno_end/0/prop`
          );
        }
        const operand = legacyFormulaToStable(
          node.kno_start.kno_end[1],
          `${path}/kno_start/kno_end/1`,
          ancestors
        );
        if (!operand.ok) return operand;
        return {
          ok: true,
          node: { type: 'knowledge', agents: tokenNode.prop.split(''), operand: operand.node },
        };
      }

      if (key === 'annce_start') {
        if (!isRecord(node.annce_start) || Object.keys(node.annce_start).length !== 1 ||
            !hasOwn(node.annce_start, 'annce_end') || !Array.isArray(node.annce_start.annce_end) ||
            node.annce_start.annce_end.length !== 2) {
          return invalidLegacyNode(
            'Legacy announcement nodes must contain annce_start.annce_end[precondition, body].',
            `${path}/annce_start`
          );
        }
        const precondition = legacyFormulaToStable(
          node.annce_start.annce_end[0],
          `${path}/annce_start/annce_end/0`,
          ancestors
        );
        if (!precondition.ok) return precondition;
        const body = legacyFormulaToStable(
          node.annce_start.annce_end[1],
          `${path}/annce_start/annce_end/1`,
          ancestors
        );
        if (!body.ok) return body;
        return {
          ok: true,
          node: { type: 'announcement', precondition: precondition.node, body: body.node },
        };
      }

      return invalidLegacyNode(`Unknown legacy Wff constructor ${JSON.stringify(key)}.`, `${path}/${key}`);
    } finally {
      ancestors.delete(node);
    }
  }

  const stableUnaryToLegacy = {
    not: 'neg',
    box: 'nec',
    diamond: 'poss',
    bapal: 'bapal',
  };
  const stableBinaryToLegacy = {
    and: 'conj',
    or: 'disj',
    implies: 'impl',
    iff: 'equi',
  };

  function stableFormulaToLegacy(node) {
    if (node.type === 'atom') return { prop: node.name };
    if (hasOwn(stableUnaryToLegacy, node.type)) {
      return { [stableUnaryToLegacy[node.type]]: stableFormulaToLegacy(node.operand) };
    }
    if (node.type === 'knowledge') {
      return {
        kno_start: {
          kno_end: [{ prop: node.agents.join('') }, stableFormulaToLegacy(node.operand)],
        },
      };
    }
    if (node.type === 'announcement') {
      return {
        annce_start: {
          annce_end: [
            stableFormulaToLegacy(node.precondition),
            stableFormulaToLegacy(node.body),
          ],
        },
      };
    }
    return {
      [stableBinaryToLegacy[node.type]]: [
        stableFormulaToLegacy(node.left),
        stableFormulaToLegacy(node.right),
      ],
    };
  }

  function encodeFormula(wff) {
    if (!wff || typeof wff.json !== 'function') {
      return failure('INVALID_WFF', 'encodeFormula requires an MPL.Wff-compatible value.', '');
    }

    let legacyFormula;
    try {
      legacyFormula = wff.json();
    } catch (error) {
      return failure('FORMULA_ACCESS_FAILED', 'The Wff JSON could not be read.', '', {
        cause: error && error.message ? error.message : String(error),
      });
    }

    const converted = legacyFormulaToStable(legacyFormula, '/legacy', new Set());
    if (!converted.ok) return converted;
    const validation = validateFormulaDocument({
      format: FORMULA_FORMAT,
      version: VERSION,
      formula: converted.node,
    });
    if (!validation.ok) return validation;
    return { ok: true, document: validation.canonicalDocument };
  }

  function decodeFormula(document) {
    const validation = validateFormulaDocument(document);
    if (!validation.ok) return validation;

    try {
      const legacyFormula = stableFormulaToLegacy(validation.canonicalDocument.formula);
      const wff = new MPL.Wff(legacyFormula);
      return { ok: true, wff, canonicalDocument: validation.canonicalDocument };
    } catch (error) {
      return failure('WFF_CONSTRUCTION_FAILED', 'The validated formula could not be constructed.', '/formula', {
        cause: error && error.message ? error.message : String(error),
      });
    }
  }

  function canonicalStringify(document) {
    const validation = isRecord(document) && document.format === FORMULA_FORMAT
      ? validateFormulaDocument(document)
      : validateModelDocument(document);
    if (!validation.ok) return validation;
    return {
      ok: true,
      json: JSON.stringify(validation.canonicalDocument),
      canonicalDocument: validation.canonicalDocument,
    };
  }

  MPL.SchemaV1 = MPL.SchemaV1 || {};
  MPL.SchemaV1.validateModelDocument = validateModelDocument;
  MPL.SchemaV1.encodeModel = encodeModel;
  MPL.SchemaV1.decodeModel = decodeModel;
  MPL.SchemaV1.validateFormulaDocument = validateFormulaDocument;
  MPL.SchemaV1.encodeFormula = encodeFormula;
  MPL.SchemaV1.decodeFormula = decodeFormula;
  MPL.SchemaV1.canonicalStringify = canonicalStringify;
})(MPL);
