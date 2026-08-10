#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const bootstrapSource = fs.readFileSync(
  path.join(repoRoot, 'js', 'ui-state-bootstrap.js'),
  'utf8'
);
const polishSource = fs.readFileSync(
  path.join(repoRoot, 'js', 'ui-polish.js'),
  'utf8'
);

function makeLocation(initialUrl) {
  let parsed = new URL(initialUrl);

  return {
    get href() { return parsed.href; },
    get pathname() { return parsed.pathname; },
    get search() { return parsed.search; },
    get hash() { return parsed.hash; },
    set hash(value) {
      parsed.hash = value || '';
    },
    _replace(relativeUrl) {
      parsed = new URL(relativeUrl, parsed.origin);
    },
    _url() {
      return parsed;
    },
  };
}

function makeLanguageLink(target) {
  const attributes = new Map([
    ['data-language-target', target],
    ['href', target],
  ]);
  const listeners = new Map();

  return {
    dataset: {},
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    fire(name) {
      const listener = listeners.get(name);
      if (listener) listener();
    },
    href() {
      return attributes.get('href');
    },
  };
}

function runDirection({ lang, page, target }) {
  const initialModel = ';ApS0a,;AS0a,';
  const initialFormula = '^K{a}p';
  const fragment = '#maintenance-anchor';
  const initialUrl =
    'http://example.test/' + page +
    '?model=' + encodeURIComponent(initialModel) +
    '&formula=' + encodeURIComponent(initialFormula) +
    '&s5=1&vars=4' +
    fragment;

  const location = makeLocation(initialUrl);
  const languageLink = makeLanguageLink(target);

  const window = {
    location,
    history: {
      state: {},
      pushState(state, title, url) {
        this.state = state;
        location._replace(url);
      },
      replaceState(state, title, url) {
        this.state = state;
        location._replace(url);
      },
    },
    addEventListener() {},
    confirm() { return true; },
  };

  const document = {
    documentElement: { lang },
    querySelector(selector) {
      if (selector === '[data-language-target]') return languageLink;
      return null;
    },
    getElementById() {
      return null;
    },
  };

  const context = {
    window,
    document,
    URL,
    URLSearchParams,
    console,
    Object,
    Array,
    Set,
    Map,
    String,
    Number,
    Boolean,
    RegExp,
    JSON,
    Math,
  };

  // Browser globals used by ui-polish.js.
  context.varCount = 2;
  context.s5ModeEnabled = false;
  context.selected_node = null;
  context.selected_link = null;
  context.links = [];
  context.model = {};
  context.S5Policy = {
    buildLinkProjection() { return []; },
  };

  context.getNodeById = function() { return null; };
  context.restart = function() {};
  context.syncVisualLinksFromModel = function() {};

  context.showS5Message = function() {};
  context.updateS5ModeToggle = function() {};
  context.refreshSemanticStateInspector = function() {
    return {
      liveWorldCount: 0,
      storedTransitionCount: 0,
      warnings: [],
      nullWorldIndices: [],
      trueAtomKeys: [],
      browserSupportedAtomVocabulary: [],
      displayedAtomRows: [],
      hiddenSupportedTrueAtomKeys: [],
      unsupportedTrueAtomKeys: [],
      activeRelationLabels: [],
      storedSelfLoopCount: 0,
      visibleNonLoopLinkCount: 0,
      labelsWithoutAgentButton: [],
      s5ModeState: context.s5ModeEnabled ? 'on' : 'off',
    };
  };
  context.setSelectedNode = function() {};
  context.setVarCount = function(count) {
    context.varCount = Number(count);
  };
  context.setS5Mode = function(enabled) {
    context.s5ModeEnabled = !!enabled;
  };

  // Simulate the legacy URL writer in app.js: model/formula only, hash omitted.
  context.onStateModified = function() {
    const current = location._url();
    const params = new URLSearchParams();
    params.set('model', current.searchParams.get('model') || initialModel);
    const formula = current.searchParams.get('formula');
    if (formula) params.set('formula', formula);
    window.history.pushState({}, '', location.pathname + '?' + params.toString());
    return context.refreshSemanticStateInspector();
  };

  context.evaluateFormula = function() {
    return context.onStateModified();
  };
  context.announceFormula = function() {
    return context.onStateModified();
  };

  Object.assign(window, context);
  window.window = window;
  window.document = document;

  vm.createContext(context);

  // 1. Capture UI state and fragment before the legacy app starts.
  vm.runInContext(bootstrapSource, context, {
    filename: 'js/ui-state-bootstrap.js',
  });

  assert.strictEqual(
    window.__BAPAL_UI_BOOTSTRAP.hash,
    fragment,
    page + ': bootstrap must capture the incoming fragment'
  );

  // 2. Reproduce legacy initial startup rewrite that drops s5/vars/hash.
  context.onStateModified();
  assert.strictEqual(location.hash, '', page + ': legacy startup simulation must drop hash');

  // 3. Load polish after app.js; it must restore s5/vars/hash from bootstrap.
  vm.runInContext(polishSource, context, {
    filename: 'js/ui-polish.js',
  });

  let current = location._url();
  assert.strictEqual(current.hash, fragment, page + ': initial fragment must be restored');
  assert.strictEqual(current.searchParams.get('s5'), '1', page + ': s5 must be restored');
  assert.strictEqual(current.searchParams.get('vars'), '4', page + ': vars must be restored');
  assert.strictEqual(
    current.searchParams.get('model'),
    initialModel,
    page + ': model must survive initial restoration'
  );
  assert.strictEqual(
    current.searchParams.get('formula'),
    initialFormula,
    page + ': formula must survive initial restoration'
  );

  // 4. A later state update must not discard the current fragment.
  window.onStateModified();
  current = location._url();
  assert.strictEqual(current.hash, fragment, page + ': state update must preserve fragment');

  // 5. Evaluate and announce both exercise state-writing paths.
  window.evaluateFormula();
  assert.strictEqual(location.hash, fragment, page + ': Evaluate must preserve fragment');

  window.announceFormula();
  assert.strictEqual(location.hash, fragment, page + ': Announce must preserve fragment');

  // 6. The language link must use the latest query AND fragment.
  languageLink.fire('pointerenter');
  const switched = new URL(languageLink.href(), 'http://example.test/' + page);
  assert.strictEqual(switched.pathname, '/' + target, page + ': language target mismatch');
  assert.strictEqual(switched.hash, fragment, page + ': language switch must preserve fragment');
  assert.strictEqual(switched.searchParams.get('model'), initialModel);
  assert.strictEqual(switched.searchParams.get('formula'), initialFormula);
  assert.strictEqual(switched.searchParams.get('s5'), '1');
  assert.strictEqual(switched.searchParams.get('vars'), '4');

  // 7. No duplicate UI-state parameters may accumulate.
  assert.strictEqual(switched.searchParams.getAll('s5').length, 1);
  assert.strictEqual(switched.searchParams.getAll('vars').length, 1);

  return {
    page,
    target,
    finalUrl: location.href,
    switchUrl: switched.href,
  };
}

const directions = [
  runDirection({ lang: 'en', page: 'index.html', target: 'zh.html' }),
  runDirection({ lang: 'zh-CN', page: 'zh.html', target: 'index.html' }),
];

for (const result of directions) {
  console.log(
    'PASS: ' + result.page + ' -> ' + result.target +
    ' preserves model/formula/s5/vars/hash across initial restore and state updates.'
  );
}

console.log('PASS: browser UI-state/hash persistence regression.');
