#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadAppHarnessHelpers() {
  const harnessPath = path.join(root, 'scripts/check-agent-rendering.js');
  const source = fs.readFileSync(harnessPath, 'utf8').replace(/^#![^\n]*\n/, '');
  const end = source.indexOf('\nconst tests = [');
  assert.ok(end > 0, 'Could not locate the reusable production-app harness boundary.');
  const moduleObject = { exports: {} };
  const factory = new Function(
    'require', 'module', 'exports', '__dirname', '__filename',
    source.slice(0, end) + '\nmodule.exports = { makeHarness, runInHarness };'
  );
  factory(require, moduleObject, moduleObject.exports, path.dirname(harnessPath), harnessPath);
  return moduleObject.exports;
}

const { makeHarness, runInHarness } = loadAppHarnessHelpers();

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshot(harness) {
  return JSON.parse(runInHarness(harness, 'JSON.stringify(refreshSemanticStateInspector())'));
}

function semanticSnapshot(harness) {
  return runInHarness(
    harness,
    'JSON.stringify(SemanticState.buildSnapshot(model, nodes, links, {' +
      'supportedAtoms: propvars, displayedAtomCount: varCount,' +
      'selectableRelationLabels: epistemicAgents, s5ModeEnabled: s5ModeEnabled' +
    '}).semanticWorlds)'
  );
}

function inspectorNode(harness, selector) {
  return harness.d3.__roots.get(selector) || null;
}

function renderedPathForAgent(harness, agent) {
  return harness.svg.querySelectorAll('path.link').find(node =>
    !node.classes.has('dragline') && node.__data__ && node.__data__.agent === agent
  ) || null;
}

function testHiddenRAtTwoRows() {
  const harness = makeHarness('ArS');
  runInHarness(harness, 'setVarCount(2)');
  const state = snapshot(harness);
  assert.deepStrictEqual(plain(state.displayedAtomRows), ['p', 'q']);
  assert.deepStrictEqual(plain(state.hiddenSupportedTrueAtomKeys), ['r']);
  assert.deepStrictEqual(plain(state.semanticWorlds[0].trueAssignments), ['r']);
}

function testVarCountPreservesTAndBapalTruth() {
  const harness = makeHarness('AtS');
  const beforeModel = semanticSnapshot(harness);
  const beforeTruth = runInHarness(harness, "MPL.truth(model, 0, new MPL.Wff('^t'))");
  runInHarness(harness, 'setVarCount(1)');
  const afterModel = semanticSnapshot(harness);
  const afterTruth = runInHarness(harness, "MPL.truth(model, 0, new MPL.Wff('^t'))");
  const state = snapshot(harness);

  assert.strictEqual(afterModel, beforeModel, 'Changing displayed rows must not mutate semantic valuations.');
  assert.strictEqual(afterTruth, beforeTruth, 'Changing displayed rows must not change BAPAL truth.');
  assert.deepStrictEqual(plain(state.hiddenSupportedTrueAtomKeys), ['t']);
  assert.deepStrictEqual(plain(state.displayedAtomRows), ['p']);
}

function assertRawAtomDisclosed(atom) {
  const harness = makeHarness('AS');
  runInHarness(harness, `
    const rawAssignmentUpdate = {};
    rawAssignmentUpdate[${JSON.stringify(atom)}] = true;
    model.editState(0, rawAssignmentUpdate);
    onStateModified({updateUrl: false});
  `);
  const state = snapshot(harness);
  assert.deepStrictEqual(plain(state.unsupportedTrueAtomKeys), [atom]);
  assert.ok(state.warnings.some(warning => warning.includes(atom)));
  assert.ok(state.semanticWorlds[0].trueAssignments.includes(atom));
}

function testRawFooDisclosure() {
  assertRawAtomDisclosed('foo');
}

function testRawBarBazDisclosure() {
  assertRawAtomDisclosed('bar_baz');
}

function testUnsupportedBrowserAtomRejected() {
  const harness = makeHarness('AxS');
  const state = snapshot(harness);
  assert.strictEqual(runInHarness(harness, 'modelImportError.code'), 'UNSUPPORTED_BROWSER_ATOM');
  const boundary = JSON.parse(runInHarness(
    harness,
    "JSON.stringify(SemanticState.validateBrowserImport(MPL.parseModelString('AxS'), propvars))"
  ));
  assert.strictEqual(boundary.ok, false);
  assert.strictEqual(boundary.error.code, 'UNSUPPORTED_BROWSER_ATOM');
  assert.deepStrictEqual(boundary.error.unsupportedAtoms, ['x']);
  assert.deepStrictEqual(plain(state.semanticWorlds), [
    null,
    { index: 1, trueAssignments: [], outgoingTransitions: [] },
  ]);
  assert.ok(state.warnings.some(warning => warning.includes('UNSUPPORTED_BROWSER_ATOM')));
  assert.strictEqual(harness.historyEntries.length, 0);
  const errorNode = inspectorNode(harness, '#s5-edit-message');
  assert.ok(errorNode && errorNode.textContent.includes('unsupported atom'));
}

function testRelationXDisclosedAndRendered() {
  const harness = makeHarness('AS1x,;AS');
  const state = snapshot(harness);
  assert.deepStrictEqual(plain(state.activeRelationLabels), ['x']);
  assert.deepStrictEqual(plain(state.labelsWithoutAgentButton), ['x']);
  assert.strictEqual(state.storedTransitionCount, 1);
  assert.strictEqual(state.visibleNonLoopLinkCount, 1);
  assert.deepStrictEqual(plain(state.projectionDifferences.missingVisualLinkDescriptors), []);
  assert.deepStrictEqual(plain(state.projectionDifferences.extraVisualLinkDescriptors), []);

  const pathNode = renderedPathForAgent(harness, 'x');
  assert.ok(pathNode, 'Relation x must still receive a rendered path.');
  assert.ok(pathNode.attributes.stroke && pathNode.attributes.stroke !== 'none');
  const midTarget = String(pathNode.styles['marker-mid'] || '').match(/^url\(#(.+)\)$/);
  assert.ok(midTarget, 'Relation x must reference its visible mid-edge marker.');
  const marker = harness.svg.querySelector(`#${midTarget[1]}`);
  assert.ok(marker && marker.querySelector('text'));
  assert.strictEqual(marker.querySelector('text').textContent, 'x');
}

function testStoredLoopsAndProjectionAreDistinguished() {
  const harness = makeHarness('AS0x,1x,;AS1x,0x,');
  const state = snapshot(harness);
  assert.strictEqual(state.storedTransitionCount, 4);
  assert.strictEqual(state.storedSelfLoopCount, 2);
  assert.strictEqual(state.visibleNonLoopLinkCount, 1);
  assert.strictEqual(state.projectionDifferences.hiddenStoredSelfLoops, 2);
  assert.ok(state.warnings.some(warning => warning.includes('self-loop')));
  assert.strictEqual(state.semanticWorlds[0].outgoingTransitions.length, 2);
  assert.strictEqual(state.visualNonLoopLinks.length, 1);
}

function testNullSlotsDisclosed() {
  const harness = makeHarness(';ApS3x,;;AqS');
  const state = snapshot(harness);
  assert.strictEqual(state.liveWorldCount, 2);
  assert.deepStrictEqual(plain(state.nullWorldIndices), [0, 2]);
  assert.deepStrictEqual(plain(state.visualNodeIds), [1, 3]);
  assert.strictEqual(state.semanticWorlds[0], null);
  assert.strictEqual(state.semanticWorlds[2], null);
}

function testRawStringsUseTextBoundaries() {
  const unsafeAtom = '\"><img src=x onerror=alert(1)>';
  const unsafeAgent = '\"><script>alert(2)</script>⚡';
  const harness = makeHarness('AS;AS');
  runInHarness(harness, `
    const unsafeAssignment = {};
    unsafeAssignment[${JSON.stringify(unsafeAtom)}] = true;
    model.editState(0, unsafeAssignment);
    model.addTransition(0, 1, ${JSON.stringify(unsafeAgent)});
    syncVisualLinksFromModel();
    onStateModified({updateUrl: false});
    restart();
  `);
  const state = snapshot(harness);
  assert.ok(state.unsupportedTrueAtomKeys.includes(unsafeAtom));
  assert.ok(state.activeRelationLabels.includes(unsafeAgent));

  const jsonNode = inspectorNode(harness, '#semantic-state-json');
  const warningNode = inspectorNode(harness, '#semantic-state-warnings');
  assert.ok(jsonNode && jsonNode.textContent.includes(unsafeAtom));
  assert.ok(jsonNode.textContent.includes(unsafeAgent));
  assert.strictEqual(jsonNode.innerHTML, '', 'Machine-readable state must be assigned with text(), not html().');
  assert.strictEqual(warningNode.innerHTML, '', 'Warnings must be assigned with text(), not html().');
  assert.strictEqual(jsonNode.querySelectorAll('script').length, 0);
  assert.strictEqual(jsonNode.querySelectorAll('img').length, 0);

  const checksTitle = harness.context.document.getElementById('checks-title');
  assert.ok(String(checksTitle.textContent).includes(unsafeAgent));
  assert.ok(!String(checksTitle.innerHTML).includes(unsafeAgent));
}

function testInspectorMutationSynchronization() {
  const harness = makeHarness('AS;AS', [true]);
  assert.strictEqual(snapshot(harness).liveWorldCount, 2, 'Successful startup import must initialize the inspector.');

  runInHarness(harness, 'mousedown.call({});');
  assert.strictEqual(snapshot(harness).liveWorldCount, 3, 'Add-world path must update the inspector.');

  runInHarness(harness, 'setSelectedNode(nodes[2]); setVarForSelectedNode(0, true);');
  assert.deepStrictEqual(plain(snapshot(harness).trueAtomKeys), ['p'], 'Valuation edits must update the inspector.');

  runInHarness(harness, 'setVarCount(1)');
  assert.deepStrictEqual(plain(snapshot(harness).displayedAtomRows), ['p'], 'Display-row changes must update the inspector.');

  runInHarness(harness, "addRelationForCurrentMode(0, 1, 'a'); onStateModified({updateUrl: false}); restart();");
  assert.deepStrictEqual(plain(snapshot(harness).activeRelationLabels), ['a'], 'Relation additions must update the inspector.');

  runInHarness(harness, 'setS5Mode(true)');
  assert.strictEqual(snapshot(harness).s5ModeState, 'on', 'S5 normalization/enabling must update the inspector.');
  assert.ok(snapshot(harness).storedSelfLoopCount > 0);

  runInHarness(harness, 'setS5Mode(false)');
  assert.strictEqual(snapshot(harness).s5ModeState, 'off', 'Disabling S5 must update the inspector.');

  runInHarness(harness, 'selected_node = nodes[2]; d3.event.keyCode = 46; keydown(); keyup();');
  assert.strictEqual(snapshot(harness).liveWorldCount, 2, 'Delete-world path must update the inspector.');

  const announcementHarness = makeHarness('ApS;AS');
  runInHarness(announcementHarness, `
    evalInput.select('input').node().value = 'p';
    announceFormula();
  `);
  const announced = snapshot(announcementHarness);
  assert.strictEqual(announced.liveWorldCount, 1, 'Public-announcement restriction must update the inspector.');
  assert.deepStrictEqual(plain(announced.nullWorldIndices), [1]);

  const loadHarness = makeHarness('AS');
  runInHarness(loadHarness, `
    model.loadFromModelString(';ApS');
    onStateModified({updateUrl: false});
  `);
  const loaded = snapshot(loadHarness);
  assert.deepStrictEqual(plain(loaded.nullWorldIndices), [0]);
  assert.ok(
    loaded.warnings.some(warning => warning.includes('projection')),
    'A model/graph disagreement after a raw load must be disclosed, not silently reconciled.'
  );
}

function testStaticInspectorAccessibilityContract() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
  assert.match(html, /<details id="semantic-state-inspector"/);
  assert.match(html, /<summary>Semantic-state inspector<\/summary>/);
  assert.doesNotMatch(html, /<details id="semantic-state-inspector"[^>]*\sopen(?:\s|=|>)/);
  assert.match(html, /Changing this display does not delete semantic valuations\./);
  assert.match(html, /id="semantic-state-warnings"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="semantic-state-json"[^>]*tabindex="0"[^>]*aria-label=/);
  [
    'semantic-live-world-count',
    'semantic-null-world-indices',
    'semantic-true-atom-keys',
    'semantic-supported-atoms',
    'semantic-displayed-atoms',
    'semantic-hidden-supported-atoms',
    'semantic-unsupported-atoms',
    'semantic-active-relations',
    'semantic-transition-count',
    'semantic-self-loop-count',
    'semantic-visible-link-count',
    'semantic-unselectable-relations',
    'semantic-s5-state',
  ].forEach(id => assert.ok(html.includes(`id="${id}"`), `Missing inspector field ${id}.`));
  assert.match(css, /\.semantic-state-json\s*\{[^}]*max-height:\s*220px;[^}]*overflow:\s*auto;/s);
  assert.match(css, /#app-body \.graph\s*\{[^}]*width:\s*640px;[^}]*height:\s*540px;/s);
}

const tests = [
  ['r true with two displayed rows', testHiddenRAtTwoRows],
  ['t survives reduction to one displayed row', testVarCountPreservesTAndBapalTruth],
  ['raw atom foo disclosure', testRawFooDisclosure],
  ['raw atom bar_baz disclosure', testRawBarBazDisclosure],
  ['unsupported browser atom rejection', testUnsupportedBrowserAtomRejected],
  ['relation x disclosure and rendering', testRelationXDisclosedAndRendered],
  ['stored self-loop disclosure', testStoredLoopsAndProjectionAreDistinguished],
  ['null-slot disclosure', testNullSlotsDisclosed],
  ['safe raw-string rendering', testRawStringsUseTextBoundaries],
  ['mutation-path synchronization', testInspectorMutationSynchronization],
  ['static inspector accessibility contract', testStaticInspectorAccessibilityContract],
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
  console.error(`FAIL: ${failures}/${tests.length} semantic-state visibility groups failed.`);
  process.exitCode = 1;
} else {
  console.log(`PASS: all ${tests.length} semantic-state visibility groups.`);
  console.log('browser boundary: executable production app.js under the existing VM/DOM/D3 harness');
}
