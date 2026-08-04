/**
 * Pure S5 editing policy shared by the browser and deterministic Node checks.
 *
 * Dependencies: MPL.Model-compatible objects only.
 */
var S5Policy = (function() {
  'use strict';

  const NORMALIZATION_CONFIRMATION =
    'The current model is not S5 for all relevant agents. Convert its relations to their least equivalence closure? This may add reflexive, symmetric, and transitive edges.';

  function getRelevantAgents(model, declaredAgents, selectedAgent) {
    const agents = new Set(declaredAgents || []);
    model.getActiveAgents().forEach(agent => agents.add(agent));
    if (selectedAgent) agents.add(selectedAgent);
    return [...agents].sort();
  }

  function planEnable(model, declaredAgents, selectedAgent) {
    const relevantAgents = getRelevantAgents(model, declaredAgents, selectedAgent);
    const invalidAgents = relevantAgents.filter(agent => !model.isEquivalenceRelation(agent));
    return {
      relevantAgents,
      invalidAgents,
      confirmationRequired: invalidAgents.length > 0,
      confirmationMessage: invalidAgents.length > 0 ? NORMALIZATION_CONFIRMATION : null,
    };
  }

  function assertEquivalenceRelations(model, agents) {
    const invalidAgents = agents.filter(agent => !model.isEquivalenceRelation(agent));
    if (invalidAgents.length > 0) {
      throw new Error(`S5 invariant failed for agent${invalidAgents.length === 1 ? '' : 's'} ${invalidAgents.join(', ')}.`);
    }
  }

  function requestEnable(model, declaredAgents, selectedAgent, confirmNormalization) {
    const plan = planEnable(model, declaredAgents, selectedAgent);
    if (!plan.confirmationRequired) {
      return {
        enabled: true,
        normalized: false,
        confirmationRequired: false,
        confirmed: null,
        relevantAgents: plan.relevantAgents,
      };
    }

    const confirmed = typeof confirmNormalization === 'function' &&
      !!confirmNormalization(plan.confirmationMessage);
    if (!confirmed) {
      return {
        enabled: false,
        normalized: false,
        confirmationRequired: true,
        confirmed: false,
        relevantAgents: plan.relevantAgents,
      };
    }

    model.closeEquivalenceRelations(plan.relevantAgents);
    assertEquivalenceRelations(model, plan.relevantAgents);
    return {
      enabled: true,
      normalized: true,
      confirmationRequired: true,
      confirmed: true,
      relevantAgents: plan.relevantAgents,
    };
  }

  function addWorld(model, assignment, declaredAgents, selectedAgent) {
    const world = model.addState(assignment || {});
    const relevantAgents = getRelevantAgents(model, declaredAgents, selectedAgent);
    relevantAgents.forEach(agent => model.addTransition(world, world, agent));
    assertEquivalenceRelations(model, relevantAgents);
    return { world, relevantAgents };
  }

  function addRelation(model, source, target, agent, declaredAgents, selectedAgent) {
    const states = model.getRawStates();
    if (!agent || !states[source] || !states[target]) {
      return { accepted: false, relevantAgents: getRelevantAgents(model, declaredAgents, selectedAgent) };
    }

    model.addTransition(source, target, agent);
    model.closeEquivalenceRelation(agent);
    const relevantAgents = getRelevantAgents(model, declaredAgents, selectedAgent);
    assertEquivalenceRelations(model, relevantAgents);
    return { accepted: true, relevantAgents };
  }

  function removeWorld(model, world, declaredAgents, selectedAgent) {
    if (!model.getRawStates()[world]) {
      return { accepted: false, relevantAgents: getRelevantAgents(model, declaredAgents, selectedAgent) };
    }

    model.removeState(world);
    const relevantAgents = getRelevantAgents(model, declaredAgents, selectedAgent);
    assertEquivalenceRelations(model, relevantAgents);
    return { accepted: true, relevantAgents };
  }

  function attemptIndividualRelationEdit(s5Enabled, edit) {
    if (s5Enabled) return { accepted: false, blocked: true };
    edit();
    return { accepted: true, blocked: false };
  }

  function buildLinkProjection(model, hideSelfLoops) {
    const states = model.getRawStates();
    const descriptors = new Map();

    states.forEach((state, sourceId) => {
      if (!state) return;
      state.successors.forEach(successor => {
        const targetId = successor.target;
        if (!states[targetId]) return;
        if (sourceId === targetId && hideSelfLoops) return;

        const lowerId = Math.min(sourceId, targetId);
        const higherId = Math.max(sourceId, targetId);
        const key = JSON.stringify([successor.agent, lowerId, higherId]);
        if (!descriptors.has(key)) {
          descriptors.set(key, {
            sourceId: lowerId,
            targetId: higherId,
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

    return [...descriptors.values()].sort((left, right) =>
      String(left.agent).localeCompare(String(right.agent)) ||
      left.sourceId - right.sourceId ||
      left.targetId - right.targetId
    );
  }

  return {
    NORMALIZATION_CONFIRMATION,
    getRelevantAgents,
    planEnable,
    requestEnable,
    addWorld,
    addRelation,
    removeWorld,
    attemptIndividualRelationEdit,
    buildLinkProjection,
  };
})();
