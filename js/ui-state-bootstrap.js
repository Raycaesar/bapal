/**
 * Capture browser-only UI state before app.js rewrites the URL.
 *
 * IMPORTANT:
 * app.js performs an initial onStateModified() before ui-polish.js is loaded.
 * That legacy update rewrites the query string using only model/formula.
 * Therefore s5/vars and the incoming hash fragment must be captured BEFORE
 * app.js executes.
 *
 * This file changes no semantic model state.
 */
(function() {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const rawVars = params.get('vars');
  const parsedVars = rawVars !== null && /^[1-5]$/.test(rawVars)
    ? Number(rawVars)
    : null;

  window.__BAPAL_UI_BOOTSTRAP = Object.freeze({
    s5Requested: params.get('s5') === '1',
    varsRequested: parsedVars,
    hadVarsParameter: params.has('vars'),
    hash: window.location.hash || '',
  });
})();
