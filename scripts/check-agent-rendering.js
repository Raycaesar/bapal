#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));
const cssSource = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
const DECLARED_COLORS = {
  a: 'orangered',
  b: 'orange',
  c: 'purple',
  d: 'yellowgreen',
  e: 'turquoise',
};

function stripNamespace(tagName) {
  return String(tagName).replace(/^svg:/, '');
}

function matchesSelector(node, selector) {
  if (!node) return false;
  if (selector === 'text:not(.id)') {
    return node.tagName === 'text' && !node.classes.has('id');
  }
  if (selector[0] === '#') return node.attributes.id === selector.slice(1);

  const parts = selector.split('.');
  const tagName = parts[0] ? stripNamespace(parts[0]) : null;
  const classNames = parts.slice(tagName ? 1 : 0).filter(Boolean);
  return (!tagName || node.tagName === tagName) &&
    classNames.every(className => node.classes.has(className));
}

class VirtualNode {
  constructor(tagName, parentNode) {
    this.tagName = stripNamespace(tagName);
    this.parentNode = parentNode || null;
    this.children = [];
    this.attributes = {};
    this.styles = {};
    this.properties = {};
    this.classes = new Set();
    this.textContent = '';
    this.innerHTML = '';
    this.handlers = {};
    this.__data__ = undefined;
    this.value = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  descendants() {
    const result = [];
    this.children.forEach(child => {
      result.push(child);
      result.push(...child.descendants());
    });
    return result;
  }

  querySelector(selector) {
    return this.descendants().find(node => matchesSelector(node, selector)) || null;
  }

  querySelectorAll(selector) {
    return this.descendants().filter(node => matchesSelector(node, selector));
  }
}

function evaluateValue(value, node, index) {
  return typeof value === 'function' ? value.call(node, node.__data__, index) : value;
}

class Selection {
  constructor(nodes, parents) {
    this.nodes = nodes || [];
    this.parents = parents || [];
    this.enterPlaceholders = null;
    this.exitNodes = [];
    this.updateSelection = null;
    this.refreshArrayShape();
  }

  refreshArrayShape() {
    this[0] = this.nodes;
    this.length = 1;
    return this;
  }

  empty() {
    return this.nodes.length === 0;
  }

  node() {
    return this.nodes[0] || null;
  }

  append(tagName) {
    const appended = [];
    if (this.enterPlaceholders) {
      this.enterPlaceholders.forEach(placeholder => {
        const child = new VirtualNode(tagName, placeholder.parent);
        child.__data__ = placeholder.data;
        placeholder.parent.appendChild(child);
        appended.push(child);
        this.updateSelection.nodes.push(child);
      });
      this.updateSelection.refreshArrayShape();
    } else {
      this.nodes.forEach(node => {
        const child = new VirtualNode(tagName, node);
        child.__data__ = node.__data__;
        node.appendChild(child);
        appended.push(child);
      });
    }
    return new Selection(appended, this.nodes);
  }

  select(selector) {
    const selected = [];
    this.nodes.forEach(node => {
      const match = node.querySelector(selector);
      if (match) selected.push(match);
    });
    return new Selection(selected, this.nodes);
  }

  selectAll(selector) {
    const selected = [];
    this.nodes.forEach(node => selected.push(...node.querySelectorAll(selector)));
    return new Selection(selected, this.nodes);
  }

  attr(name, value) {
    if (arguments.length === 1) {
      const node = this.node();
      return node ? node.attributes[name] : undefined;
    }
    this.nodes.forEach((node, index) => {
      const resolved = evaluateValue(value, node, index);
      if (resolved === null || resolved === undefined) delete node.attributes[name];
      else node.attributes[name] = String(resolved);
      if (name === 'class') {
        node.classes = new Set(String(resolved || '').split(/\s+/).filter(Boolean));
      }
    });
    return this;
  }

  style(name, value) {
    if (arguments.length === 1) {
      const node = this.node();
      return node ? node.styles[name] : undefined;
    }
    this.nodes.forEach((node, index) => {
      const resolved = evaluateValue(value, node, index);
      if (resolved === null || resolved === undefined || resolved === '') delete node.styles[name];
      else node.styles[name] = String(resolved);
    });
    return this;
  }

  property(name, value) {
    if (arguments.length === 1) {
      const node = this.node();
      return node ? (name in node ? node[name] : node.properties[name]) : undefined;
    }
    this.nodes.forEach((node, index) => {
      const resolved = evaluateValue(value, node, index);
      node.properties[name] = resolved;
      node[name] = resolved;
    });
    return this;
  }

  classed(className, value) {
    if (arguments.length === 1) {
      const node = this.node();
      return !!node && node.classes.has(className);
    }
    this.nodes.forEach((node, index) => {
      if (evaluateValue(value, node, index)) node.classes.add(className);
      else node.classes.delete(className);
    });
    return this;
  }

  text(value) {
    if (arguments.length === 0) {
      const node = this.node();
      return node ? node.textContent : undefined;
    }
    this.nodes.forEach((node, index) => {
      node.textContent = String(evaluateValue(value, node, index));
    });
    return this;
  }

  html(value) {
    if (arguments.length === 0) {
      const node = this.node();
      return node ? node.innerHTML : undefined;
    }
    this.nodes.forEach((node, index) => {
      node.innerHTML = String(evaluateValue(value, node, index));
    });
    return this;
  }

  on(eventName, handler) {
    this.nodes.forEach(node => { node.handlers[eventName] = handler; });
    return this;
  }

  each(handler) {
    this.nodes.forEach((node, index) => handler.call(node, node.__data__, index));
    return this;
  }

  call() {
    return this;
  }

  data(values) {
    const data = values || [];
    const updateNodes = this.nodes.slice(0, data.length);
    updateNodes.forEach((node, index) => { node.__data__ = data[index]; });
    const parent = this.parents[0] || null;
    const update = new Selection(updateNodes, this.parents);
    update.enterPlaceholders = data.slice(updateNodes.length).map(item => ({ parent, data: item }));
    update.exitNodes = this.nodes.slice(data.length);
    return update;
  }

  enter() {
    const selection = new Selection([], this.parents);
    selection.enterPlaceholders = this.enterPlaceholders || [];
    selection.updateSelection = this;
    return selection;
  }

  exit() {
    return new Selection(this.exitNodes || [], this.parents);
  }

  remove() {
    this.nodes.forEach(node => {
      if (!node.parentNode) return;
      const index = node.parentNode.children.indexOf(node);
      if (index !== -1) node.parentNode.children.splice(index, 1);
    });
    return this;
  }
}

function makeD3Stub(windowObject) {
  const roots = new Map();

  function rootFor(selector) {
    if (!roots.has(selector)) {
      const rootNode = new VirtualNode('div', null);
      rootNode.attributes['data-selector'] = selector;
      if (selector === '#eval-pane .eval-input') {
        rootNode.appendChild(new VirtualNode('input', rootNode));
      }
      roots.set(selector, rootNode);
    }
    return roots.get(selector);
  }

  function forceLayout() {
    const force = {
      drag: function() {},
      nodes() { return force; },
      links() { return force; },
      size() { return force; },
      linkDistance() { return force; },
      charge() { return force; },
      on() { return force; },
      start() { return force; },
    };
    return force;
  }

  const d3 = {
    event: {
      preventDefault() {},
      ctrlKey: false,
      keyCode: 0,
    },
    select(target) {
      if (target instanceof VirtualNode) return new Selection([target], [target.parentNode].filter(Boolean));
      if (target === windowObject) return new Selection([rootFor('__window__')], []);
      return new Selection([rootFor(String(target))], []);
    },
    selectAll(selector) {
      return new Selection([], [rootFor(String(selector))]);
    },
    scale: {
      category10() {
        const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
        return index => colors[Number(index) % colors.length];
      },
    },
    rgb(value) {
      return { brighter() { return value; } };
    },
    layout: { force: forceLayout },
    mouse() { return [100, 100]; },
    __roots: roots,
  };
  return d3;
}

function makeHarness(modelString, confirmations) {
  const confirmationQueue = (confirmations || []).slice();
  const location = {
    pathname: '/index.html',
    search: `?model=${encodeURIComponent(modelString)}`,
  };
  const windowObject = {
    location,
    confirm() {
      return confirmationQueue.length > 0 ? confirmationQueue.shift() : true;
    },
  };
  windowObject.window = windowObject;

  const elementsById = new Map();
  const document = {
    getElementById(id) {
      if (!elementsById.has(id)) elementsById.set(id, { checked: false, innerHTML: '' });
      return elementsById.get(id);
    },
  };
  const historyEntries = [];
  const history = {
    pushState(state, title, href) { historyEntries.push(href); },
  };
  const d3 = makeD3Stub(windowObject);
  const context = {
    FormulaParser,
    URLSearchParams,
    console,
    d3,
    document,
    history,
    location,
    window: windowObject,
    MathJax: { Hub: { Queue() {} } },
  };
  vm.createContext(context);
  ['js/MPL.js', 'js/s5-policy.js', 'js/app.js'].forEach(relativePath => {
    vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, {
      filename: relativePath,
    });
  });

  const graphRoot = d3.__roots.get('#app-body .graph');
  const svg = graphRoot.children.find(node => node.tagName === 'svg');
  assert.ok(svg, 'The production app must create its graph SVG.');
  return { context, d3, svg, historyEntries };
}

function runInHarness(harness, source) {
  return vm.runInContext(source, harness.context);
}

function markerTarget(markerValue) {
  const match = String(markerValue || '').match(/^url\(#([a-zA-Z0-9_-]+)\)$/);
  return match ? match[1] : null;
}

function cssStrokeFor(node) {
  for (const className of node.classes) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cssSource.match(new RegExp(`\\.${escaped}\\s*\\{[^}]*?stroke\\s*:\\s*([^;]+);`, 'm'));
    if (match) return match[1].trim();
  }
  const linkMatch = cssSource.match(/path\.link\s*\{[^}]*?stroke\s*:\s*([^;]+);/m);
  return linkMatch ? linkMatch[1].trim() : null;
}

function renderedPaths(harness) {
  return harness.svg.querySelectorAll('path.link')
    .filter(node => !node.classes.has('dragline'));
}

function pathForAgent(harness, agent) {
  return renderedPaths(harness).find(node => node.__data__ && node.__data__.agent === agent) || null;
}

function markerById(harness, id) {
  return harness.svg.querySelector(`#${id}`);
}

function inspectAgentPath(harness, agent) {
  const pathNode = pathForAgent(harness, agent);
  assert.ok(pathNode, `Expected a rendered path for ${JSON.stringify(agent)}.`);
  const stroke = pathNode.attributes.stroke || pathNode.styles.stroke || cssStrokeFor(pathNode);
  const startTarget = markerTarget(pathNode.styles['marker-start'] || pathNode.attributes['marker-start']);
  const endTarget = markerTarget(pathNode.styles['marker-end'] || pathNode.attributes['marker-end']);
  const midTarget = markerTarget(pathNode.styles['marker-mid'] || pathNode.attributes['marker-mid']);
  return {
    pathNode,
    stroke,
    visibleStroke: !!stroke && stroke !== 'none' && stroke !== 'transparent',
    startTarget,
    endTarget,
    midTarget,
    startExists: !!startTarget && !!markerById(harness, startTarget),
    endExists: !!endTarget && !!markerById(harness, endTarget),
    midExists: !!midTarget && !!markerById(harness, midTarget),
  };
}

function serializableInspection(inspection) {
  return {
    stroke: inspection.stroke,
    visibleStroke: inspection.visibleStroke,
    classes: Array.from(inspection.pathNode.classes).sort(),
    startTarget: inspection.startTarget,
    endTarget: inspection.endTarget,
    midTarget: inspection.midTarget,
    startExists: inspection.startExists,
    endExists: inspection.endExists,
    midExists: inspection.midExists,
  };
}

function setFixture(harness, worldCount, transitions) {
  const transitionSource = transitions.map(([source, target, agent]) =>
    `model.addTransition(${source}, ${target}, ${JSON.stringify(agent)});`
  ).join('\n');
  runInHarness(harness, `
    model.removeAllStatesAndTransitions();
    nodes.splice(0, nodes.length);
    links.splice(0, links.length);
    for (let world = 0; world < ${worldCount}; world++) {
      model.addState({});
      nodes.push({id: world, vals: propvars.map(function() { return false; }), x: 100 + world * 120, y: 160});
    }
    lastNodeId = ${worldCount - 1};
    ${transitionSource}
    syncVisualLinksFromModel();
    restart();
    tick();
  `);
}

function assertVisibleAgent(harness, agent, expectedLeft, expectedRight) {
  const inspection = inspectAgentPath(harness, agent);
  assert.strictEqual(inspection.visibleStroke, true, `${agent} must have a visible nonempty stroke.`);
  assert.strictEqual(inspection.midExists, true, `${agent} must reference an existing mid marker.`);
  assert.strictEqual(inspection.startExists, expectedLeft, `${agent} start-marker use must match its left direction.`);
  assert.strictEqual(inspection.endExists, expectedRight, `${agent} end-marker use must match its right direction.`);

  const midMarker = markerById(harness, inspection.midTarget);
  const textNode = midMarker.querySelector('text');
  assert.ok(textNode, `${agent} mid marker must contain text.`);
  assert.strictEqual(textNode.textContent, agent, `${agent} mid marker must preserve the semantic label.`);
  assert.ok(
    textNode.attributes.fill || textNode.styles.fill || cssStrokeFor(textNode),
    `${agent} mid marker text must have an explicit visible color.`
  );
  return inspection;
}

function testMinimizedXCounterexample() {
  const harness = makeHarness('AS1x,;AS', [true]);
  const beforeDescriptor = JSON.parse(runInHarness(
    harness,
    'JSON.stringify(S5Policy.buildLinkProjection(model, true))'
  ));
  assert.deepStrictEqual(beforeDescriptor, [{
    sourceId: 0,
    targetId: 1,
    agent: 'x',
    left: false,
    right: true,
  }], 'The compact x fixture must begin as one right-directed descriptor.');

  const before = inspectAgentPath(harness, 'x');
  runInHarness(harness, 'setS5Mode(true)');
  const afterDescriptor = JSON.parse(runInHarness(
    harness,
    'JSON.stringify(S5Policy.buildLinkProjection(model, true))'
  ));
  assert.deepStrictEqual(afterDescriptor, [{
    sourceId: 0,
    targetId: 1,
    agent: 'x',
    left: true,
    right: true,
  }], 'Accepted S5 normalization must produce one bidirectional x descriptor.');

  const after = inspectAgentPath(harness, 'x');
  const renderPasses = before.visibleStroke && before.endExists && before.midExists &&
    after.visibleStroke && after.startExists && after.endExists && after.midExists;
  assert.ok(renderPasses, [
    'Audit 06 minimized x rendering counterexample.',
    `before descriptor: ${JSON.stringify(beforeDescriptor[0])}`,
    `before rendering: ${JSON.stringify(serializableInspection(before))}`,
    `after descriptor: ${JSON.stringify(afterDescriptor[0])}`,
    `after rendering: ${JSON.stringify(serializableInspection(after))}`,
    'The descriptor exists, but the actual production path is invisible or references absent marker definitions.',
  ].join('\n'));

  assertVisibleAgent(harness, 'x', true, true);
  assert.strictEqual(runInHarness(harness, "model.isSuccessor(0, 0, 'x')"), true);
  assert.strictEqual(runInHarness(harness, "model.isSuccessor(1, 1, 'x')"), true);
  assert.strictEqual(renderedPaths(harness).some(node => node.__data__.source === node.__data__.target), false);
}

function testDeclaredCompatibilityAndSafeKeys() {
  const harness = makeHarness('AS1a,1b,1c,1d,1e,;AS');
  const rendering = harness.context.AgentRendering;
  assert.ok(rendering, 'js/app.js must expose the production AgentRendering policy to the VM harness.');

  Object.entries(DECLARED_COLORS).forEach(([agent, color]) => {
    const spec = rendering.getVisualSpec(agent);
    assert.strictEqual(spec.color, color, `${agent} must retain its exact declared color.`);
    assert.strictEqual(spec.markerKey, agent, `${agent} must retain its marker identity.`);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(spec.markerIds)), {
      start: `start-arrow-${agent}`,
      end: `end-arrow-${agent}`,
      mid: `mid-arrow-${agent}`,
    });
    const midMarker = markerById(harness, spec.markerIds.mid);
    assert.ok(midMarker, `${agent} mid marker definition must exist.`);
    assert.strictEqual(midMarker.querySelector('text').textContent, agent);
    assert.strictEqual(inspectAgentPath(harness, agent).stroke, color);
  });

  const unsafe = '\"><script>alert(1)</script>⚡';
  const first = rendering.getVisualSpec(unsafe);
  const second = rendering.getVisualSpec(unsafe);
  assert.strictEqual(first.markerKey, second.markerKey, 'Marker keys must be stable across calls.');
  assert.match(first.markerKey, /^[a-z0-9-]+$/, 'Unknown marker keys must contain only safe identifier characters.');
  assert.ok(!first.markerKey.includes('<') && !first.markerKey.includes('>'));
  assert.notStrictEqual(
    rendering.getVisualSpec('a/b').markerKey,
    rendering.getVisualSpec('ab').markerKey,
    'Distinct raw labels must receive distinct injective marker keys.'
  );

  setFixture(harness, 2, [[0, 1, unsafe], [0, 1, 'raw_agent']]);
  assertVisibleAgent(harness, unsafe, false, true);
  assertVisibleAgent(harness, 'raw_agent', false, true);
  const unsafeMarker = markerById(harness, first.markerIds.mid);
  assert.ok(unsafeMarker, 'The punctuation/Unicode marker must be created under its safe ID.');
  assert.strictEqual(unsafeMarker.querySelector('text').textContent, unsafe);
  assert.strictEqual(unsafeMarker.querySelectorAll('script').length, 0, 'Raw label text must not create executable markup.');

  const rawSpec = rendering.getVisualSpec('raw_agent');
  const rawMarker = markerById(harness, rawSpec.markerIds.mid);
  assert.strictEqual(rawMarker.attributes.markerUnits, 'userSpaceOnUse');
  assert.ok(
    Number(rawMarker.attributes.markerWidth) > 10,
    'A multi-character raw label must receive a text-sized marker viewport rather than the one-character viewport.'
  );
}

function testDirectionsAndDefinitionDeduplication() {
  const harness = makeHarness('AS1x,;AS');
  assertVisibleAgent(harness, 'x', false, true);

  setFixture(harness, 2, [[1, 0, 'x']]);
  assertVisibleAgent(harness, 'x', true, false);

  setFixture(harness, 2, [[0, 1, 'x'], [1, 0, 'x']]);
  assertVisibleAgent(harness, 'x', true, true);
  const markerCountBefore = harness.svg.querySelectorAll('marker').length;
  runInHarness(harness, 'restart(); restart(); restart();');
  assert.strictEqual(
    harness.svg.querySelectorAll('marker').length,
    markerCountBefore,
    'Repeated restart calls must not duplicate marker definitions.'
  );
}

function testS5OperationsCancellationAndHiddenLoops() {
  const harness = makeHarness('AS1x,;AS', [true]);
  runInHarness(harness, 'setS5Mode(true)');
  assertVisibleAgent(harness, 'x', true, true);
  assert.strictEqual(runInHarness(harness, "model.isSuccessor(0, 0, 'x')"), true);
  assert.strictEqual(runInHarness(harness, "model.isSuccessor(1, 1, 'x')"), true);
  assert.strictEqual(renderedPaths(harness).filter(node => node.__data__.agent === 'x').length, 1);

  runInHarness(harness, `
    const addResult = S5Policy.addWorld(model, {}, epistemicAgents, currentEpistemicAgent);
    nodes.push({id: addResult.world, vals: propvars.map(function() { return false; }), x: 380, y: 160});
    lastNodeId = addResult.world;
    syncVisualLinksFromModel();
    restart();
    tick();
  `);
  assertVisibleAgent(harness, 'x', true, true);
  runInHarness(harness, `
    S5Policy.removeWorld(model, 2, epistemicAgents, currentEpistemicAgent);
    const removedNode = nodes.filter(function(node) { return node.id === 2; })[0];
    nodes.splice(nodes.indexOf(removedNode), 1);
    syncVisualLinksFromModel();
    restart();
    tick();
  `);
  assertVisibleAgent(harness, 'x', true, true);

  setFixture(harness, 4, [
    [0, 0, 'x'], [0, 1, 'x'], [1, 0, 'x'], [1, 1, 'x'],
    [2, 2, 'x'], [2, 3, 'x'], [3, 2, 'x'], [3, 3, 'x'],
  ]);
  runInHarness(harness, `
    S5Policy.requestEnable(model, epistemicAgents, currentEpistemicAgent, function() { return true; });
    S5Policy.addRelation(model, 1, 2, 'x', epistemicAgents, currentEpistemicAgent);
    syncVisualLinksFromModel();
    restart();
    tick();
  `);
  const mergedXPathCount = renderedPaths(harness).filter(node => node.__data__.agent === 'x').length;
  assert.strictEqual(mergedXPathCount, 6, 'Merging two two-world x classes must show all six non-loop pairs.');
  renderedPaths(harness)
    .filter(node => node.__data__.agent === 'x')
    .forEach(() => assertVisibleAgent(harness, 'x', true, true));

  const cancelled = makeHarness('AS1x,;AS', [false]);
  const beforeModel = runInHarness(cancelled, 'JSON.stringify(model.getRawStates())');
  const beforeLinks = runInHarness(cancelled, 'JSON.stringify(S5Policy.buildLinkProjection(model, true))');
  runInHarness(cancelled, 'setS5Mode(true)');
  assert.strictEqual(runInHarness(cancelled, 's5ModeEnabled'), false);
  assert.strictEqual(runInHarness(cancelled, 'JSON.stringify(model.getRawStates())'), beforeModel);
  assert.strictEqual(runInHarness(cancelled, 'JSON.stringify(S5Policy.buildLinkProjection(model, true))'), beforeLinks);
  assertVisibleAgent(cancelled, 'x', false, true);
}

function testOverlappingAgentIdentityAndGeometry() {
  const harness = makeHarness('AS1a,;AS');
  setFixture(harness, 2, [[0, 1, 'a'], [0, 1, 'x']]);
  const a = assertVisibleAgent(harness, 'a', false, true);
  const x = assertVisibleAgent(harness, 'x', false, true);
  assert.notStrictEqual(a.pathNode.attributes.d, x.pathNode.attributes.d, 'a+x paths must not occupy identical geometry.');

  setFixture(harness, 2, [[0, 1, 'x'], [0, 1, 'y']]);
  const xWithY = assertVisibleAgent(harness, 'x', false, true);
  const y = assertVisibleAgent(harness, 'y', false, true);
  assert.notStrictEqual(xWithY.pathNode.attributes.d, y.pathNode.attributes.d, 'x+y paths must retain distinct geometry.');
  assert.notStrictEqual(xWithY.midTarget, y.midTarget, 'x+y paths must retain distinct marker identity.');
}

const tests = [
  ['Audit 06 minimized x counterexample', testMinimizedXCounterexample],
  ['declared compatibility and safe raw-label keys', testDeclaredCompatibilityAndSafeKeys],
  ['direction markers and marker-definition deduplication', testDirectionsAndDefinitionDeduplication],
  ['S5 operations, cancellation, and hidden loops', testS5OperationsCancellationAndHiddenLoops],
  ['overlapping agent identity and geometry', testOverlappingAgentIdentityAndGeometry],
];

let failures = 0;
tests.forEach(([name, test]) => {
  try {
    test();
    console.log(`PASS: ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL: ${name}`);
    console.error(error.stack || error.message);
  }
});

if (failures > 0) {
  console.error(`FAIL: ${failures}/${tests.length} agent-rendering groups failed.`);
  process.exitCode = 1;
} else {
  console.log(`PASS: all ${tests.length} agent-rendering groups.`);
  console.log('browser boundary: executable production app.js under VM/DOM/D3 stubs with explicit SVG attribute and marker inspection');
}
