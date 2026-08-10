/**
 * BAPAL Playground UI polish / lightweight localization layer.
 *
 * Loaded after js/app.js.
 *
 * This file deliberately does NOT change:
 *   - MPL.truth or any logical truth condition;
 *   - the BAPAL valuation-class algorithm;
 *   - S5Policy semantics;
 *   - Model / Formula Schema v1;
 *   - oracle / conformance behavior.
 *
 * It adds presentation and browser-state behavior only:
 *   1. a larger soft-wrapping formula editor;
 *   2. long-formula rendering support;
 *   3. S5 edit-lock wording beside the S5 toggle;
 *   4. URL persistence for S5 mode, displayed atom-row count, and fragments;
 *   5. Chinese runtime labels on zh.html.
 */
(function() {
  'use strict';

  if (window.__bapalUiPolishLoaded) return;
  window.__bapalUiPolishLoaded = true;

  const isZh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');

  const S5_RULE_EN =
    ' While S5 mode is on, individual relation arrows cannot be deleted or redirected. ' +
    'Switch S5 mode off to edit individual arrows; deleting worlds is still allowed.';

  const S5_RULE_ZH =
    ' S5 模式下不能单独删除关系箭头，也不能用 L/R/B 改变单条关系的方向；' +
    '如需逐条编辑关系，请先关闭 S5 模式。删除整个世界仍然允许。';

  const capturedUiState = window.__BAPAL_UI_BOOTSTRAP || (function() {
    const fallbackParams = new URLSearchParams(window.location.search);
    const rawVars = fallbackParams.get('vars');
    return {
      s5Requested: fallbackParams.get('s5') === '1',
      varsRequested: rawVars !== null && /^[1-5]$/.test(rawVars) ? Number(rawVars) : null,
      hadVarsParameter: fallbackParams.has('vars'),
      hash: window.location.hash || '',
    };
  })();

  let persistVarCount = !!capturedUiState.hadVarsParameter;
  let restoringUiState = false;

  function getCurrentVarCount() {
    try {
      return (typeof varCount !== 'undefined') ? Number(varCount) : null;
    } catch (_) {
      return null;
    }
  }

  function isS5On() {
    try {
      return typeof s5ModeEnabled !== 'undefined' && !!s5ModeEnabled;
    } catch (_) {
      return false;
    }
  }

  function updateLanguageSwitchHref() {
    const link = document.querySelector('[data-language-target]');
    if (!link) return;
    const target = link.getAttribute('data-language-target');
    if (!target) return;
    link.setAttribute('href', target + window.location.search + window.location.hash);
  }

  function installLiveLanguageSwitch() {
    const link = document.querySelector('[data-language-target]');
    if (!link || link.dataset.uiPolishBound === '1') return;
    link.dataset.uiPolishBound = '1';

    const refresh = function() {
      updateLanguageSwitchHref();
    };
    link.addEventListener('pointerenter', refresh);
    link.addEventListener('focus', refresh);
    link.addEventListener('click', refresh);
    updateLanguageSwitchHref();
  }

  /**
   * Keep presentation state in the shareable URL without changing the compact
   * semantic model format.
   *
   *   s5=1    -- editor is in S5 mode
   *   vars=N  -- number of displayed propositional-variable rows (1..5)
   *
   * app.js still writes model/formula.  This wrapper runs afterwards and uses
   * replaceState so it does not create a second history entry.
   */
  function persistUiStateToUrl(hashOverride) {
    if (restoringUiState) return;

    const params = new URLSearchParams(window.location.search);

    if (isS5On()) params.set('s5', '1');
    else params.delete('s5');

    const count = getCurrentVarCount();
    if (persistVarCount && Number.isInteger(count) && count >= 1 && count <= 5) {
      params.set('vars', String(count));
    } else {
      params.delete('vars');
    }

    /*
     * Legacy app.js rebuilds the URL from pathname + model/formula and can
     * therefore discard an existing fragment.  Callers that invoke legacy
     * state writers capture the fragment first and pass it back here.
     */
    const hash =
      typeof hashOverride === 'string'
        ? hashOverride
        : window.location.hash;

    const query = params.toString();
    const nextUrl =
      window.location.pathname +
      (query ? '?' + query : '') +
      (hash || '');

    window.history.replaceState(window.history.state || {}, '', nextUrl);
    updateLanguageSwitchHref();
  }

  function rebuildVisualProjection(hideSelfLoops) {
    /*
     * app.js exposes syncVisualLinksFromModel(), but that helper intentionally
     * hard-codes hideSelfLoops=true for S5 presentation. For ordinary mode we
     * rebuild the same descriptor list with hideSelfLoops=false so stored
     * reflexive arrows become visible immediately instead of only after F5.
     */
    if (hideSelfLoops && typeof window.syncVisualLinksFromModel === 'function') {
      window.syncVisualLinksFromModel();
    } else if (typeof S5Policy !== 'undefined' &&
               typeof S5Policy.buildLinkProjection === 'function' &&
               typeof model !== 'undefined' &&
               typeof links !== 'undefined' &&
               typeof getNodeById === 'function') {
      const projection = S5Policy.buildLinkProjection(model, !!hideSelfLoops);
      if (typeof selected_link !== 'undefined') selected_link = null;
      links.splice(0, links.length);
      projection.forEach(function(descriptor) {
        const source = getNodeById(descriptor.sourceId);
        const target = getNodeById(descriptor.targetId);
        if (!source || !target) return;
        links.push({
          source: source,
          target: target,
          left: descriptor.left,
          right: descriptor.right,
          agent: descriptor.agent,
        });
      });
    }

    if (typeof window.restart === 'function') {
      window.restart();
    }
  }

  function refreshS5VisualProjection() {
    if (!isS5On()) return;
    rebuildVisualProjection(true);
  }

  function refreshOrdinaryVisualProjection() {
    if (isS5On()) return;
    rebuildVisualProjection(false);
  }

  function restoreUiStateFromCapturedUrl() {
    restoringUiState = true;

    if (capturedUiState.varsRequested !== null &&
        typeof window.setVarCount === 'function') {
      persistVarCount = true;
      window.setVarCount(capturedUiState.varsRequested);
    }

    if (capturedUiState.s5Requested &&
        !isS5On() &&
        typeof window.setS5Mode === 'function') {
      /*
       * A normal URL produced while S5 mode was on already contains the stored
       * S5 relation in `model`.  setS5Mode(true) therefore normally takes the
       * already-S5 branch and does not mutate the semantic relation.
       *
       * If somebody hand-edits the URL so that s5=1 accompanies a non-S5 model,
       * the existing S5Policy confirmation remains authoritative.
       */
      window.setS5Mode(true);
    }

    /*
     * app.js renders stored self-loops when it starts in ordinary mode.
     * When an already-S5 model is subsequently restored to S5 mode,
     * app.js's setS5Mode() does not resync the graph if no normalization was
     * required.  Force the existing audited projection helper once so the
     * visual graph matches normal S5 presentation (self-loops hidden).
     */
    refreshS5VisualProjection();

    restoringUiState = false;
    persistUiStateToUrl(capturedUiState.hash || '');
  }

  function translateS5Message(message) {
    const text = String(message == null ? '' : message);

    if (!isZh) {
      if (text.startsWith('S5 mode is on.') &&
          !text.includes('individual relation arrows')) {
        return text + S5_RULE_EN;
      }
      return text;
    }

    if (text === 'S5 mode is on. Relevant relations were normalized to their least equivalence closure.') {
      return 'S5 模式已开启。相关关系已规范化为其最小等价闭包。' + S5_RULE_ZH;
    }
    if (text === 'S5 mode is on. The model already satisfied the S5 invariant.') {
      return 'S5 模式已开启。当前模型已经满足 S5 不变式。' + S5_RULE_ZH;
    }
    if (text === 'S5 mode remains off. The model was not changed.') {
      return 'S5 模式仍为关闭状态；模型没有被修改。';
    }
    if (text === 'S5 mode keeps relations as equivalence classes. Switch S5 mode off to edit individual arrows.') {
      return 'S5 模式把关系保持为等价类，不能单独删除或改变某一条箭头。请先关闭 S5 模式，再逐条编辑关系。';
    }

    const unsupported = text.match(
      /^Browser compact import contains unsupported atom (.+)\. Supported browser atoms are p, q, r, s, and t\.$/
    );
    if (unsupported) {
      return '浏览器紧凑格式导入包含不支持的原子 ' + unsupported[1] +
        '。浏览器支持的原子为 p、q、r、s、t。';
    }

    const importFailed = text.match(/^Model import failed \(([^)]+)\): (.*) The default model was retained\.$/);
    if (importFailed) {
      return '模型导入失败（' + importFailed[1] + '）：' +
        translateS5Message(importFailed[2]) + ' 已保留默认模型。';
    }

    return text;
  }

  function translateInspectorWarning(warning) {
    const text = String(warning);

    let match = text.match(/^Supported true atom keys hidden by the current display projection: (.*)\.$/);
    if (match) return '当前显示投影隐藏了这些仍为真的受支持原子：' + match[1] + '。';

    match = text.match(
      /^Unsupported semantic atom keys are preserved and affect truth\/valuation classes, but browser import rejects them: (.*)\.$/
    );
    if (match) {
      return '这些不受浏览器支持的语义原子仍被模型保留，并会影响真值与赋值类，但浏览器导入会拒绝它们：' +
        match[1] + '。';
    }

    match = text.match(/^Active relation labels without a direct agent selection button: (.*)\.$/);
    if (match) return '以下活动关系标签没有对应的主体选择按钮：' + match[1] + '。';

    match = text.match(/^(\d+) stored semantic self-loop(?: is|s are) intentionally omitted from the non-loop graph projection\.$/);
    if (match) return '有 ' + match[1] + ' 条已存储的语义自环按设计不显示在非自环图投影中。';

    if (text === 'The current graph projection differs from the authoritative semantic model; see projectionDifferences.') {
      return '当前图形投影与权威语义模型不一致；请查看机器可读快照中的 projectionDifferences。';
    }

    match = text.match(/^Browser import failed \(([^)]+)\); the prior complete model was retained\.$/);
    if (match) return '浏览器导入失败（' + match[1] + '）；先前的完整模型已保留。';

    return text;
  }

  function zhList(values) {
    return values && values.length
      ? values.map(function(value) { return JSON.stringify(value); }).join(', ')
      : '无';
  }

  function localizeInspector(snapshot) {
    if (!isZh || !snapshot) return;

    const summary = document.getElementById('semantic-state-summary');
    if (summary) {
      summary.textContent =
        snapshot.liveWorldCount + ' 个活动世界，' +
        snapshot.storedTransitionCount + ' 条已存储关系，' +
        snapshot.warnings.length + ' 条警告。';
    }

    const fieldValues = {
      'semantic-live-world-count': String(snapshot.liveWorldCount),
      'semantic-null-world-indices': zhList(snapshot.nullWorldIndices),
      'semantic-true-atom-keys': zhList(snapshot.trueAtomKeys),
      'semantic-supported-atoms': zhList(snapshot.browserSupportedAtomVocabulary),
      'semantic-displayed-atoms': zhList(snapshot.displayedAtomRows),
      'semantic-hidden-supported-atoms': zhList(snapshot.hiddenSupportedTrueAtomKeys),
      'semantic-unsupported-atoms': zhList(snapshot.unsupportedTrueAtomKeys),
      'semantic-active-relations': zhList(snapshot.activeRelationLabels),
      'semantic-transition-count': String(snapshot.storedTransitionCount),
      'semantic-self-loop-count': String(snapshot.storedSelfLoopCount),
      'semantic-visible-link-count': String(snapshot.visibleNonLoopLinkCount),
      'semantic-unselectable-relations': zhList(snapshot.labelsWithoutAgentButton),
      'semantic-s5-state': snapshot.s5ModeState === 'on' ? '开' : '关'
    };

    Object.keys(fieldValues).forEach(function(id) {
      const element = document.getElementById(id);
      if (element) element.textContent = fieldValues[id];
    });

    const warnings = document.getElementById('semantic-state-warnings');
    if (warnings) {
      warnings.textContent = snapshot.warnings.length
        ? snapshot.warnings.map(translateInspectorWarning).join('\n')
        : '无。';
    }
  }

  function localizeS5Dom() {
    const state = document.getElementById('s5-mode-state');
    if (state && isZh) {
      state.textContent = isS5On() ? '开' : '关';
    }

    const message = document.getElementById('s5-edit-message');
    if (message && message.textContent.trim()) {
      message.textContent = translateS5Message(message.textContent.trim());
    }
  }

  function localizeSelectedNode(node) {
    if (!isZh) return;
    const label = document.querySelector('#edit-pane .selected-node-id');
    if (!label) return;
    label.innerHTML = node
      ? '<strong>世界 ' + node.id + '</strong>'
      : '未选择世界';
  }

  function localizeChecksTitle() {
    if (!isZh) return;
    const title = document.getElementById('checks-title');
    if (!title) return;

    const text = title.textContent.trim();
    if (text === 'No agents in use!') {
      title.textContent = '当前没有使用任何主体关系。';
      return;
    }

    const match = text.match(/^For agents? (.*) :$/);
    if (match) {
      title.textContent = '主体 ' + match[1] + ' 的关系性质：';
    }
  }

  function replaceRuntimePhrases(html) {
    if (!isZh) return html;
    return String(html)
      .replace(/No formula!/g, '未输入公式！')
      .replace(/Invalid formula!/g, '公式无效！')
      .replace(/Formula contains invalid propositional variable:/g, '公式包含不支持的命题变元：')
      .replace(/Formula contains invalid agent:/g, '公式包含不支持的主体：')
      .replace(/<strong>True:<\/strong>/g, '<strong>为真：</strong>')
      .replace(/<strong>False:<\/strong>/g, '<strong>为假：</strong>')
      .replace(/<strong>Worlds removed by announcement:<\/strong>/g, '<strong>宣告后被删除的世界：</strong>')
      .replace(/<strong>Current formula:<\/strong>/g, '<strong>当前公式：</strong>')
      .replace(/<strong>Announced formula:<\/strong>/g, '<strong>已宣告公式：</strong>');
  }

  function localizeEvalDom() {
    if (!isZh) return;

    const output = document.querySelector('#eval-pane .eval-output');
    if (output) {
      const translated = replaceRuntimePhrases(output.innerHTML);
      if (translated !== output.innerHTML) output.innerHTML = translated;
    }

    const current = document.querySelector('#app-body .current-formula');
    if (current) {
      const translated = replaceRuntimePhrases(current.innerHTML);
      if (translated !== current.innerHTML) current.innerHTML = translated;
    }
  }

  /**
   * Keep app.js's original input in the DOM as the authoritative storage node,
   * but expose a larger textarea to the user.  This avoids touching app.js:
   * evaluateFormula(), announceFormula(), URL serialization, and startup code
   * continue to read the original input exactly as before.
   */
  function installExpandedFormulaEditor() {
    const container = document.querySelector('#eval-pane .eval-input');
    if (!container || container.querySelector('.formula-input-expanded')) return;

    const storage = container.querySelector('input[type="text"]');
    if (!storage) return;

    storage.classList.add('formula-storage-input');
    storage.setAttribute('aria-hidden', 'true');
    storage.tabIndex = -1;

    const textarea = document.createElement('textarea');
    textarea.className = 'formula-input-expanded form-control';
    textarea.rows = 4;
    textarea.wrap = 'soft';
    textarea.spellcheck = false;
    textarea.autocapitalize = 'off';
    textarea.autocomplete = 'off';
    textarea.value = storage.value;
    textarea.placeholder = storage.placeholder || '';
    textarea.setAttribute('aria-label', isZh ? '公式输入' : 'Formula input');

    storage.insertAdjacentElement('afterend', textarea);

    const help = document.createElement('div');
    help.className = 'formula-input-help';
    help.textContent = isZh
      ? '长公式会自动换行显示；按 Enter 求值。'
      : 'Long formulas wrap automatically; press Enter to evaluate.';
    textarea.insertAdjacentElement('afterend', help);

    const syncToStorage = function() {
      storage.value = textarea.value;
    };

    textarea.addEventListener('input', syncToStorage);
    textarea.addEventListener('change', syncToStorage);

    textarea.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        syncToStorage();
        if (typeof window.evaluateFormula === 'function') {
          window.evaluateFormula();
        }
      }
    });

    /*
     * If some later code writes directly to the hidden storage input, callers
     * can dispatch a normal input/change event; for current app.js the only
     * programmatic write occurs before this layer is installed.
     */
  }

  /**
   * MathJax 2 disables automatic equation line breaking by default.  Configure
   * all output processors used by MathJax 2 so dynamic long formulas can break
   * at legal mathematical break points.  CSS scrolling remains the fallback.
   */
  function configureMathJaxLinebreaks() {
    if (!window.MathJax || !MathJax.Hub || typeof MathJax.Hub.Config !== 'function') {
      return false;
    }

    MathJax.Hub.Config({
      CommonHTML: { linebreaks: { automatic: true, width: 'container' } },
      'HTML-CSS': { linebreaks: { automatic: true, width: 'container' } },
      SVG: { linebreaks: { automatic: true, width: 'container' } }
    });
    return true;
  }

  function wrapGlobal(name, factory) {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = factory(original);
  }

  /*
   * Put the S5 individual-arrow restriction beside the S5 toggle itself,
   * rather than only in the long instructions below.
   */
  wrapGlobal('showS5Message', function(original) {
    return function(message) {
      return original.call(this, translateS5Message(message));
    };
  });

  wrapGlobal('updateS5ModeToggle', function(original) {
    return function() {
      const result = original.apply(this, arguments);
      localizeS5Dom();
      return result;
    };
  });

  wrapGlobal('setS5Mode', function(original) {
    return function(enabled) {
      const hashBeforeUpdate = window.location.hash;
      const result = original.apply(this, arguments);
      if (enabled && isS5On()) {
        refreshS5VisualProjection();
      } else if (!enabled && !isS5On()) {
        refreshOrdinaryVisualProjection();
      }
      localizeS5Dom();
      persistUiStateToUrl(hashBeforeUpdate);
      return result;
    };
  });

  wrapGlobal('setVarCount', function(original) {
    return function(count) {
      const result = original.apply(this, arguments);
      if (!restoringUiState) persistVarCount = true;
      persistUiStateToUrl();
      return result;
    };
  });

  wrapGlobal('refreshSemanticStateInspector', function(original) {
    return function() {
      const snapshot = original.apply(this, arguments);
      localizeInspector(snapshot);
      return snapshot;
    };
  });

  wrapGlobal('onStateModified', function(original) {
    return function() {
      const hashBeforeUpdate = window.location.hash;
      const snapshot = original.apply(this, arguments);
      localizeInspector(snapshot);
      localizeChecksTitle();
      localizeS5Dom();
      persistUiStateToUrl(hashBeforeUpdate);
      return snapshot;
    };
  });

  wrapGlobal('setSelectedNode', function(original) {
    return function(node) {
      const result = original.apply(this, arguments);
      localizeSelectedNode(node);
      return result;
    };
  });

  wrapGlobal('evaluateFormula', function(original) {
    return function() {
      const hashBeforeUpdate = window.location.hash;
      const result = original.apply(this, arguments);
      localizeEvalDom();
      persistUiStateToUrl(hashBeforeUpdate);
      return result;
    };
  });

  wrapGlobal('announceFormula', function(original) {
    return function() {
      const hashBeforeUpdate = window.location.hash;
      const result = original.apply(this, arguments);
      localizeEvalDom();
      persistUiStateToUrl(hashBeforeUpdate);
      return result;
    };
  });

  installLiveLanguageSwitch();
  installExpandedFormulaEditor();

  if (!configureMathJaxLinebreaks()) {
    window.addEventListener('load', configureMathJaxLinebreaks, { once: true });
  }

  /*
   * app.js has already loaded the model/formula before this layer runs and,
   * during that startup, may already have rewritten the URL.  Restore from the
   * values captured by ui-state-bootstrap.js before app.js executed.
   */
  restoreUiStateFromCapturedUrl();

  if (isZh) {
    try {
      if (typeof window.refreshSemanticStateInspector === 'function') {
        window.refreshSemanticStateInspector();
      }
    } catch (error) {
      console.warn('Chinese semantic-state localization could not refresh the inspector:', error);
    }

    localizeSelectedNode(window.selected_node || null);
    localizeChecksTitle();
    localizeS5Dom();
    localizeEvalDom();
  }

  updateLanguageSwitchHref();
})();
