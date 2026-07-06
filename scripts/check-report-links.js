#!/usr/bin/env node

const assert = require('assert');
const { playgroundUrl } = require('./random-bapal-evaluation');

const modelString = 'ApqS0a,1a,0b,;ArS1a,0a,1b,';
const formulas = [
  '^K{a}p',
  '^(r <-> K{a}r)',
  '^(q & (q -> s))',
  '[p]K{a}p',
  '^~K{b}s',
];

for (const formula of formulas) {
  const href = playgroundUrl(modelString, formula);
  const url = new URL(href, 'https://example.test/reports/random-bapal-evaluation.html');

  assert.ok(href.startsWith('../index.html?model='), `Expected model param first in ${href}`);
  assert.ok(href.includes('&formula='), `Expected &formula= in ${href}`);
  assert.ok(!href.includes('?formula='), `Did not expect legacy ?formula= delimiter in ${href}`);
  assert.strictEqual(url.searchParams.get('model'), modelString);
  assert.strictEqual(url.searchParams.get('formula'), formula);

  console.log(`PASS: ${formula} -> ${href}`);
}
