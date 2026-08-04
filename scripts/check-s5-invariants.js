#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));
const policyPath = path.join(root, 'js/s5-policy.js');
const DECLARED_AGENTS = ['a', 'b', 'c', 'd', 'e'];
const GENERATED_SEED = 0x0055f503;
const GENERATED_SEQUENCE_COUNT = 10000;
const GENERATED_OPERATIONS_PER_SEQUENCE = 20;

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});
if (fs.existsSync(policyPath)) {
  vm.runInContext(fs.readFileSync(policyPath, 'utf8'), context, {
    filename: 'js/s5-policy.js',
  });
}

const MPL = context.MPL;

function canonicalSnapshot(model) {
  return model.getRawStates().map((state, source) => {
    if (state === null) return null;
    return {
      assignment: Object.entries(state.assignment)
        .sort(([left], [right]) => left.localeCompare(right)),
      successors: state.successors
        .map(successor => ({ source, target: successor.target, agent: successor.agent }))
        .sort((left, right) =>
          left.source - right.source ||
          left.target - right.target ||
          String(left.agent).localeCompare(String(right.agent))
        ),
    };
  });
}

function snapshotString(model) {
  return JSON.stringify(canonicalSnapshot(model));
}

function liveWorlds(model) {
  const worlds = [];
  model.getRawStates().forEach((state, world) => {
    if (state !== null) worlds.push(world);
  });
  return worlds;
}

function relationEdges(model, agent) {
  const edges = [];
  model.getRawStates().forEach((state, source) => {
    if (state === null) return;
    state.successors.forEach(successor => {
      if (successor.agent === agent && model.getRawStates()[successor.target] !== null) {
        edges.push(`${source}->${successor.target}`);
      }
    });
  });
  return edges.sort();
}

function relationSnapshot(model, agent) {
  return `{${relationEdges(model, agent).join(', ')}}`;
}

function relationInput(model, agent) {
  return {
    worlds: liveWorlds(model),
    edges: relationEdges(model, agent),
  };
}

function leastClosureOracle(worlds, inputEdges) {
  const worldSet = new Set(worlds);
  const adjacency = new Map(worlds.map(world => [world, new Set()]));

  inputEdges.forEach(edge => {
    const [source, target] = edge.split('->').map(Number);
    if (!worldSet.has(source) || !worldSet.has(target)) return;
    adjacency.get(source).add(target);
    adjacency.get(target).add(source);
  });

  const seen = new Set();
  const closure = [];
  worlds.slice().sort((a, b) => a - b).forEach(start => {
    if (seen.has(start)) return;
    const component = [];
    const queue = [start];
    seen.add(start);
    while (queue.length > 0) {
      const current = queue.shift();
      component.push(current);
      Array.from(adjacency.get(current)).sort((a, b) => a - b).forEach(next => {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      });
    }
    component.sort((a, b) => a - b).forEach(source => {
      component.forEach(target => closure.push(`${source}->${target}`));
    });
  });

  return closure.sort();
}

function assertExactRelation(model, agent, input, expected, label) {
  const actual = relationEdges(model, agent);
  assert.deepStrictEqual(
    actual,
    expected,
    `${label}\ninput ${agent}: {${input.join(', ')}}\nexpected ${agent}: {${expected.join(', ')}}\nactual ${agent}: {${actual.join(', ')}}`
  );
}

function assertEquivalence(model, agent, label) {
  assert.strictEqual(model.isReflexive(agent), true, `${label}: ${agent} must be reflexive; actual ${relationSnapshot(model, agent)}`);
  assert.strictEqual(model.isSymmetric(agent), true, `${label}: ${agent} must be symmetric; actual ${relationSnapshot(model, agent)}`);
  assert.strictEqual(model.isTransitive(agent), true, `${label}: ${agent} must be transitive; actual ${relationSnapshot(model, agent)}`);
}

function assertAllRelevantEquivalence(model, selectedAgent, label) {
  getPolicy().getRelevantAgents(model, DECLARED_AGENTS, selectedAgent).forEach(agent => {
    assertEquivalence(model, agent, label);
  });
}

function addCompleteClass(model, agent, worlds) {
  worlds.forEach(source => worlds.forEach(target => model.addTransition(source, target, agent)));
}

function legacyProjection(model, hideSelfLoops) {
  const descriptors = new Map();
  model.getRawStates().forEach((state, sourceId) => {
    if (state === null) return;
    state.successors.forEach(successor => {
      const targetId = successor.target;
      if (model.getRawStates()[targetId] === null) return;
      if (sourceId === targetId && hideSelfLoops) return;
      const lower = Math.min(sourceId, targetId);
      const higher = Math.max(sourceId, targetId);
      const key = JSON.stringify([successor.agent, lower, higher]);
      if (!descriptors.has(key)) {
        descriptors.set(key, {
          sourceId: lower,
          targetId: higher,
          agent: successor.agent,
          left: sourceId === targetId,
          right: sourceId === targetId,
        });
      }
      const descriptor = descriptors.get(key);
      if (sourceId < targetId) descriptor.right = true;
      if (sourceId > targetId) descriptor.left = true;
    });
  });
  return Array.from(descriptors.values()).sort((left, right) =>
    String(left.agent).localeCompare(String(right.agent)) ||
    left.sourceId - right.sourceId ||
    left.targetId - right.targetId
  );
}

// Before the production helper exists, this adapter executes the current
// app.js policy against real Model objects so the parent failures remain
// reproducible. Once js/s5-policy.js exists, every behavioral group uses it.
const legacyPolicy = {
  getRelevantAgents(model, declaredAgents, selectedAgent) {
    const agents = new Set(model.getActiveAgents());
    if (selectedAgent) agents.add(selectedAgent);
    return Array.from(agents).sort();
  },
  planEnable(model, declaredAgents, selectedAgent) {
    const relevantAgents = this.getRelevantAgents(model, declaredAgents, selectedAgent);
    return { relevantAgents, invalidAgents: [], confirmationRequired: false };
  },
  requestEnable(model, declaredAgents, selectedAgent) {
    return {
      enabled: true,
      normalized: false,
      confirmationRequired: false,
      confirmed: null,
      relevantAgents: this.getRelevantAgents(model, declaredAgents, selectedAgent),
    };
  },
  addWorld(model, assignment, declaredAgents, selectedAgent) {
    const world = model.addState(assignment || {});
    model.addTransition(world, world, selectedAgent);
    return { world, relevantAgents: this.getRelevantAgents(model, declaredAgents, selectedAgent) };
  },
  addRelation(model, source, target, agent, declaredAgents, selectedAgent) {
    model.addTransition(source, target, agent);
    model.addTransition(target, source, agent);
    model.closeEquivalenceClass(agent, [source, target]);
    return { accepted: true, relevantAgents: this.getRelevantAgents(model, declaredAgents, selectedAgent) };
  },
  removeWorld(model, world) {
    if (model.getRawStates()[world] === null || model.getRawStates()[world] === undefined) {
      return { accepted: false };
    }
    model.removeState(world);
    return { accepted: true };
  },
  attemptIndividualRelationEdit(s5Enabled, edit) {
    if (s5Enabled) return { accepted: false, blocked: true };
    edit();
    return { accepted: true, blocked: false };
  },
  buildLinkProjection: legacyProjection,
};

function getPolicy() {
  return context.S5Policy || legacyPolicy;
}

function closeWholeRelation(model, agent) {
  if (typeof model.closeEquivalenceRelation === 'function') {
    return model.closeEquivalenceRelation(agent);
  }
  const worlds = liveWorlds(model);
  return model.closeEquivalenceClass(agent, worlds.length > 0 ? [worlds[0]] : []);
}

function closeAllRelations(model, agents) {
  if (typeof model.closeEquivalenceRelations === 'function') {
    return model.closeEquivalenceRelations(agents);
  }
  return agents.map(agent => closeWholeRelation(model, agent));
}

function testWholeAgentClosure() {
  const model = new MPL.Model();
  for (let world = 0; world < 7; world++) model.addState({});
  model.removeState(6);
  model.addTransition(0, 1, 'a');
  model.addTransition(2, 3, 'a');
  model.addTransition(3, 4, 'a');

  const input = relationEdges(model, 'a');
  const expected = leastClosureOracle(liveWorlds(model), input);
  closeWholeRelation(model, 'a');

  assertExactRelation(model, 'a', input, expected, 'Group 1 whole-agent least equivalence closure failed.');
  assertEquivalence(model, 'a', 'Group 1');
  assert.strictEqual(model.isSuccessor(0, 2, 'a'), false, 'Separate components must not be connected.');
  assert.strictEqual(model.isSuccessor(5, 5, 'a'), true, 'Isolated world must remain a singleton equivalence class.');
  assert.strictEqual(model.getRawStates()[6], null, 'Whole-relation closure must preserve null world indices.');
}

function testExhaustiveClosureOracle() {
  let relationCount = 0;
  let inputEdgeCount = 0;
  const counts = [];

  for (let worldCount = 0; worldCount <= 3; worldCount++) {
    const relationTotal = 2 ** (worldCount * worldCount);
    counts.push(relationTotal);
    for (let mask = 0; mask < relationTotal; mask++) {
      const model = new MPL.Model();
      for (let world = 0; world < worldCount; world++) model.addState({});
      for (let source = 0; source < worldCount; source++) {
        for (let target = 0; target < worldCount; target++) {
          const bit = source * worldCount + target;
          if ((mask & (2 ** bit)) !== 0) model.addTransition(source, target, 'a');
        }
      }

      const input = relationEdges(model, 'a');
      inputEdgeCount += input.length;
      const expected = leastClosureOracle(liveWorlds(model), input);
      closeWholeRelation(model, 'a');
      assertExactRelation(
        model,
        'a',
        input,
        expected,
        `Group 2 exhaustive case worlds=${worldCount} mask=${mask}/${relationTotal - 1} failed.`
      );
      assertEquivalence(model, 'a', `Group 2 worlds=${worldCount} mask=${mask}`);
      input.forEach(edge => assert.ok(relationEdges(model, 'a').includes(edge), `Input edge ${edge} was not preserved.`));
      const once = relationEdges(model, 'a');
      closeWholeRelation(model, 'a');
      assert.deepStrictEqual(relationEdges(model, 'a'), once, 'Closure must be idempotent.');
      relationCount++;
    }
  }

  console.log(`  exhaustive relation counts by worlds 0..3: ${counts.join(', ')}`);
  console.log(`  exhaustive directed relations checked: ${relationCount}`);
  console.log(`  exhaustive input edges checked: ${inputEdgeCount}`);
  assert.strictEqual(relationCount, 531);
}

function testAllDeclaredAgents() {
  const model = new MPL.Model();
  model.addState({});
  model.addState({});
  const result = getPolicy().requestEnable(model, DECLARED_AGENTS, 'a', () => true);
  assert.strictEqual(result.enabled, true);
  DECLARED_AGENTS.forEach(agent => {
    liveWorlds(model).forEach(world => {
      assert.strictEqual(model.isSuccessor(world, world, agent), true, `Missing stored ${agent} loop at world ${world}.`);
    });
    assertEquivalence(model, agent, 'Group 3');
  });
}

function testActiveExtraLabels() {
  const model = new MPL.Model();
  for (let world = 0; world < 3; world++) model.addState({});
  model.addTransition(0, 1, 'alice');
  model.addTransition(2, 1, 'agent_b');
  const expectedAgents = DECLARED_AGENTS.concat(['alice', 'agent_b']).sort();
  assert.deepStrictEqual(
    Array.from(getPolicy().getRelevantAgents(model, DECLARED_AGENTS, 'a')),
    expectedAgents,
    'Raw model relation labels must be included in the relevant-agent set.'
  );
  getPolicy().requestEnable(model, DECLARED_AGENTS, 'a', () => true);
  ['alice', 'agent_b'].forEach(agent => assertEquivalence(model, agent, 'Group 4'));
}

function makeTwoWorldS5Base() {
  const model = new MPL.Model();
  model.addState({});
  model.addState({});
  addCompleteClass(model, 'a', [0, 1]);
  addCompleteClass(model, 'b', [0, 1]);
  ['c', 'd', 'e'].forEach(agent => {
    model.addTransition(0, 0, agent);
    model.addTransition(1, 1, agent);
  });
  return model;
}

function testP102NewWorldRegression() {
  const model = makeTwoWorldS5Base();
  const result = getPolicy().addWorld(model, {}, DECLARED_AGENTS, 'a');
  assert.strictEqual(result.world, 2);
  assert.strictEqual(
    model.isSuccessor(2, 2, 'a'),
    true,
    `P1-02 expected 2R_a2; actual a=${relationSnapshot(model, 'a')}`
  );
  assert.strictEqual(
    model.isSuccessor(2, 2, 'b'),
    true,
    `P1-02 expected 2R_b2; actual b=${relationSnapshot(model, 'b')}`
  );
  assertAllRelevantEquivalence(model, 'a', 'P1-02 after adding world 2');
  assert.strictEqual(model.isSuccessor(2, 0, 'a'), false, 'New a singleton must not merge with the old class.');
  assert.strictEqual(model.isSuccessor(2, 0, 'b'), false, 'New b singleton must not merge with the old class.');

  const newAgentModel = new MPL.Model();
  newAgentModel.addState({});
  newAgentModel.addState({});
  assert.strictEqual(newAgentModel.getSuccessorsOf(0, 'c').length, 0, 'Agent c should begin without a relation.');
  getPolicy().requestEnable(newAgentModel, DECLARED_AGENTS, 'a', () => true);
  const selectedC = getPolicy().addWorld(newAgentModel, {}, DECLARED_AGENTS, 'c');
  assert.strictEqual(newAgentModel.isSuccessor(selectedC.world, selectedC.world, 'c'), true);
  assertAllRelevantEquivalence(newAgentModel, 'c', 'newly selected c after world addition');
}

function testP103ToggleNormalization() {
  const model = new MPL.Model();
  for (let world = 0; world < 5; world++) model.addState({});
  model.addTransition(0, 1, 'a');
  model.addTransition(2, 3, 'a');
  model.addTransition(1, 2, 'b');

  const agents = DECLARED_AGENTS.slice();
  const expected = new Map();
  agents.forEach(agent => {
    const input = relationEdges(model, agent);
    expected.set(agent, { input, closure: leastClosureOracle(liveWorlds(model), input) });
  });

  const plan = getPolicy().planEnable(model, DECLARED_AGENTS, 'a');
  assert.strictEqual(plan.confirmationRequired, true, 'P1-03 must detect a non-S5 model before mutation.');
  assert.ok(plan.invalidAgents.includes('a'), 'P1-03 plan must identify malformed agent a.');
  assert.ok(plan.invalidAgents.includes('b'), 'P1-03 plan must identify malformed agent b.');

  let confirmations = 0;
  let confirmationMessage = null;
  const result = getPolicy().requestEnable(model, DECLARED_AGENTS, 'a', message => {
    confirmations++;
    confirmationMessage = message;
    return true;
  });
  assert.strictEqual(confirmations, 1, 'P1-03 accepted path must request confirmation once.');
  assert.strictEqual(
    confirmationMessage,
    'The current model is not S5 for all relevant agents. Convert its relations to their least equivalence closure? This may add reflexive, symmetric, and transitive edges.'
  );
  assert.strictEqual(result.enabled, true);
  assert.strictEqual(result.normalized, true);
  agents.forEach(agent => {
    const evidence = expected.get(agent);
    assertExactRelation(model, agent, evidence.input, evidence.closure, `P1-03 exact closure failed for ${agent}.`);
  });
}

function testCancelNoMutation() {
  const model = new MPL.Model();
  model.addState({});
  model.addState({});
  model.addTransition(0, 1, 'a');
  const before = snapshotString(model);
  let confirmations = 0;
  const result = getPolicy().requestEnable(model, DECLARED_AGENTS, 'a', () => {
    confirmations++;
    return false;
  });
  assert.strictEqual(confirmations, 1, 'Non-S5 enable must ask before mutation.');
  assert.strictEqual(result.enabled, false, 'Cancellation must keep S5 mode off.');
  assert.strictEqual(result.normalized, false);
  assert.strictEqual(snapshotString(model), before, 'Cancellation must leave the semantic model byte-for-byte unchanged.');
}

function testAlreadyS5Enable() {
  const model = new MPL.Model();
  model.addState({});
  model.addState({});
  closeAllRelations(model, DECLARED_AGENTS);
  const before = snapshotString(model);
  let confirmations = 0;
  const result = getPolicy().requestEnable(model, DECLARED_AGENTS, 'a', () => {
    confirmations++;
    return true;
  });
  assert.strictEqual(result.enabled, true);
  assert.strictEqual(result.normalized, false);
  assert.strictEqual(result.confirmationRequired, false);
  assert.strictEqual(confirmations, 0, 'Already-S5 path must not ask for confirmation.');
  assert.strictEqual(snapshotString(model), before, 'Already-S5 enable must not mutate the model.');
}

function testClassMerge() {
  const model = new MPL.Model();
  for (let world = 0; world < 5; world++) model.addState({});
  addCompleteClass(model, 'a', [0, 1]);
  addCompleteClass(model, 'a', [2, 3]);
  model.addTransition(4, 4, 'a');
  addCompleteClass(model, 'b', [0, 2]);
  [1, 3, 4].forEach(world => model.addTransition(world, world, 'b'));
  ['c', 'd', 'e'].forEach(agent => liveWorlds(model).forEach(world => model.addTransition(world, world, agent)));
  const bBefore = relationEdges(model, 'b');

  getPolicy().addRelation(model, 1, 2, 'a', DECLARED_AGENTS, 'a');

  const merged = [0, 1, 2, 3];
  merged.forEach(source => merged.forEach(target => {
    assert.strictEqual(model.isSuccessor(source, target, 'a'), true, `Merged a class missing ${source}->${target}.`);
  }));
  assert.strictEqual(model.isSuccessor(4, 0, 'a'), false, 'Unrelated a singleton must not be merged.');
  assert.deepStrictEqual(relationEdges(model, 'b'), bBefore, 'Unrelated b classes must be unchanged.');
  assertAllRelevantEquivalence(model, 'a', 'Group 9 class merge');
}

function testWorldDeletion() {
  const model = new MPL.Model();
  for (let world = 0; world < 5; world++) model.addState({});
  addCompleteClass(model, 'a', [0, 1, 2]);
  addCompleteClass(model, 'a', [3, 4]);
  addCompleteClass(model, 'b', [0, 3]);
  [1, 2, 4].forEach(world => model.addTransition(world, world, 'b'));
  ['c', 'd', 'e'].forEach(agent => liveWorlds(model).forEach(world => model.addTransition(world, world, agent)));

  const result = getPolicy().removeWorld(model, 1, DECLARED_AGENTS, 'a');
  assert.strictEqual(result.accepted, true);
  assert.strictEqual(model.getRawStates()[1], null);
  assertAllRelevantEquivalence(model, 'a', 'Group 10 deletion');
  model.getRawStates().forEach(state => {
    if (state !== null) state.successors.forEach(successor => {
      assert.notStrictEqual(successor.target, 1, 'No remaining edge may target the removed world.');
    });
  });
}

function makeRng(seed) {
  let state = seed >>> 0;
  return {
    integer(maxExclusive) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state % maxExclusive;
    },
    boolean() {
      return this.integer(2) === 1;
    },
  };
}

function firstRelationEdge(model) {
  for (let source = 0; source < model.getRawStates().length; source++) {
    const state = model.getRawStates()[source];
    if (state !== null && state.successors.length > 0) {
      const successor = state.successors[0];
      return { source, target: successor.target, agent: successor.agent };
    }
  }
  return null;
}

function testGeneratedEventSequences() {
  const rng = makeRng(GENERATED_SEED);
  let accepted = 0;
  let rejected = 0;
  let operationCount = 0;

  for (let sequence = 0; sequence < GENERATED_SEQUENCE_COUNT; sequence++) {
    const model = new MPL.Model();
    let selectedAgent = DECLARED_AGENTS[rng.integer(DECLARED_AGENTS.length)];
    let enabled = false;

    for (let operation = 0; operation < GENERATED_OPERATIONS_PER_SEQUENCE; operation++) {
      const kind = rng.integer(7);
      const before = snapshotString(model);
      let wasAccepted = true;
      let operationName = '';

      try {
        if (kind === 0) {
          operationName = 'add-world';
          if (liveWorlds(model).length >= 6) {
            wasAccepted = false;
          } else if (enabled) {
            getPolicy().addWorld(model, {}, DECLARED_AGENTS, selectedAgent);
          } else {
            model.addState({});
          }
        } else if (kind === 1) {
          operationName = 'add-relation';
          const worlds = liveWorlds(model);
          if (worlds.length < 2) {
            wasAccepted = false;
          } else {
            const source = worlds[rng.integer(worlds.length)];
            const target = worlds[rng.integer(worlds.length)];
            if (source === target) {
              wasAccepted = false;
            } else if (enabled) {
              getPolicy().addRelation(model, source, target, selectedAgent, DECLARED_AGENTS, selectedAgent);
            } else {
              model.addTransition(source, target, selectedAgent);
            }
          }
        } else if (kind === 2) {
          operationName = 'delete-world';
          const candidate = rng.integer(model.getRawStates().length + 1);
          if (model.getRawStates()[candidate] === undefined || model.getRawStates()[candidate] === null) {
            wasAccepted = false;
          } else if (enabled) {
            wasAccepted = getPolicy().removeWorld(model, candidate, DECLARED_AGENTS, selectedAgent).accepted;
          } else {
            model.removeState(candidate);
          }
        } else if (kind === 3) {
          operationName = 'change-selected-agent';
          selectedAgent = DECLARED_AGENTS[rng.integer(DECLARED_AGENTS.length)];
        } else if (kind === 4) {
          operationName = 'normalize-enable';
          if (enabled) {
            wasAccepted = false;
          } else {
            const confirm = rng.boolean();
            const result = getPolicy().requestEnable(model, DECLARED_AGENTS, selectedAgent, () => confirm);
            enabled = result.enabled;
            wasAccepted = result.enabled;
          }
        } else if (kind === 5) {
          operationName = 'disable';
          if (!enabled) {
            wasAccepted = false;
          } else {
            enabled = false;
          }
        } else {
          operationName = 'individual-edge-edit';
          const edge = firstRelationEdge(model);
          if (!edge) {
            wasAccepted = false;
          } else {
            const result = getPolicy().attemptIndividualRelationEdit(enabled, () => {
              model.removeTransition(edge.source, edge.target, edge.agent);
            });
            wasAccepted = result.accepted;
          }
        }

        if (!wasAccepted) {
          rejected++;
          assert.strictEqual(
            snapshotString(model),
            before,
            `Rejected operation partially mutated the model: ${operationName}.`
          );
        } else {
          accepted++;
        }

        if (enabled) {
          assertAllRelevantEquivalence(
            model,
            selectedAgent,
            `generated sequence=${sequence} operation=${operation} kind=${operationName}`
          );
        }
      } catch (error) {
        error.message = [
          `Generated S5 event failure.`,
          `seed=${GENERATED_SEED} (0x${GENERATED_SEED.toString(16).padStart(8, '0')})`,
          `sequence=${sequence}/${GENERATED_SEQUENCE_COUNT - 1}`,
          `operation=${operation}/${GENERATED_OPERATIONS_PER_SEQUENCE - 1}`,
          `kind=${operationName || kind}`,
          `selectedAgent=${selectedAgent}`,
          `enabled=${enabled}`,
          `before=${before}`,
          `after=${snapshotString(model)}`,
          `cause=${error.message}`,
        ].join('\n');
        throw error;
      }
      operationCount++;
    }
  }

  console.log(`  generated seed: ${GENERATED_SEED} (0x${GENERATED_SEED.toString(16).padStart(8, '0')})`);
  console.log(`  generated sequences: ${GENERATED_SEQUENCE_COUNT}`);
  console.log(`  generated operations: ${operationCount}`);
  console.log(`  generated accepted operations: ${accepted}`);
  console.log(`  generated rejected operations: ${rejected}`);
  assert.ok(rejected > 0, 'Generated sequences must exercise rejected operations.');
}

function testAppIntegrationContract() {
  const policy = getPolicy();
  const model = new MPL.Model();
  model.addState({});
  model.addState({});
  model.addTransition(0, 1, 'a');
  policy.requestEnable(model, DECLARED_AGENTS, 'a', () => true);
  const projection = JSON.parse(JSON.stringify(policy.buildLinkProjection(model, true)));
  assert.deepStrictEqual(projection, [{
    sourceId: 0,
    targetId: 1,
    agent: 'a',
    left: true,
    right: true,
  }], 'Graph projection must expose both normalized non-loop directions and omit stored loops.');
  assert.strictEqual(model.isSuccessor(0, 0, 'a'), true, 'Hidden loop must remain stored in Model.');
  assert.strictEqual(model.isSuccessor(1, 1, 'a'), true, 'Hidden loop must remain stored in Model.');

  const appSource = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const guardCalls = appSource.match(/ignoreS5SelectedRelationEdit\(\)/g) || [];
  const cancelBranch = appSource.match(/if \(!result\.enabled\) \{([\s\S]*?)\n  \}/);
  const normalizedBranch = appSource.match(/if \(result\.normalized\) \{([\s\S]*?)\n  \}/);
  assert.ok(appSource.includes('S5Policy.requestEnable'), 'app.js must use the testable confirmation-before-normalization boundary.');
  assert.ok(appSource.includes('window.confirm'), 'app.js must request user confirmation for non-S5 normalization.');
  assert.ok(cancelBranch, 'app.js must have an explicit cancellation branch.');
  assert.ok(cancelBranch[1].includes('s5ModeEnabled = false'), 'Cancellation must keep S5 mode off.');
  assert.ok(cancelBranch[1].includes('updateS5ModeToggle()'), 'Cancellation must roll the checkbox back to off.');
  assert.ok(!cancelBranch[1].includes('syncVisualLinksFromModel'), 'Cancellation must not mutate the D3 projection.');
  assert.ok(normalizedBranch && normalizedBranch[1].includes('syncVisualLinksFromModel'), 'Accepted normalization must refresh D3 from the semantic model.');
  assert.ok(appSource.includes('syncVisualLinksFromModel'), 'Accepted normalization must refresh D3 from the semantic model.');
  assert.ok(appSource.includes('S5Policy.addWorld'), 'S5 world creation must use all-relevant-agent preservation.');
  assert.ok(appSource.includes('S5Policy.addRelation'), 'S5 relation creation must use the production class-merge policy.');
  assert.ok(appSource.includes('S5Policy.buildLinkProjection'), 'D3 synchronization must use the testable model projection.');
  assert.ok(guardCalls.length >= 4, 'Selected-edge Delete/L/R/B must remain guarded.');
}

const tests = [
  ['Group 1 — whole-agent equivalence closure', testWholeAgentClosure],
  ['Group 2 — exhaustive closure oracle', testExhaustiveClosureOracle],
  ['Group 3 — all declared agents', testAllDeclaredAgents],
  ['Group 4 — active extra labels', testActiveExtraLabels],
  ['Group 5 — P1-02 new-world regression', testP102NewWorldRegression],
  ['Group 6 — P1-03 toggle normalization', testP103ToggleNormalization],
  ['Group 7 — cancel/no mutation', testCancelNoMutation],
  ['Group 8 — already-S5 enable path', testAlreadyS5Enable],
  ['Group 9 — class merge', testClassMerge],
  ['Group 10 — world deletion', testWorldDeletion],
  ['Group 11 — deterministic generated event sequences', testGeneratedEventSequences],
  ['Group 12 — app integration contract', testAppIntegrationContract],
];

let failures = 0;
for (const [name, test] of tests) {
  try {
    test();
    console.log(`PASS: ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL: ${name}`);
    console.error(error.stack || error.message);
  }
}

if (failures > 0) {
  console.error(`FAIL: ${failures}/${tests.length} S5 invariant groups failed.`);
  process.exitCode = 1;
} else {
  console.log(`PASS: all ${tests.length} S5 invariant groups.`);
}
