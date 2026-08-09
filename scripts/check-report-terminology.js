#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const generatorPath = path.join(__dirname, 'random-bapal-evaluation.js');
const reportPath = path.join(root, 'reports', 'random-bapal-evaluation.html');
const generatorSource = fs.readFileSync(generatorPath, 'utf8');
const reportBefore = fs.readFileSync(reportPath, 'utf8');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(text, fragments, label) {
  fragments.forEach(fragment => {
    check(text.includes(fragment), `${label} is missing ${JSON.stringify(fragment)}.`);
  });
}

check(
  !/\bsatisfiable\s*:|\.satisfiable\b/.test(generatorSource),
  'Generator retains the misleading machine/result field satisfiable.'
);
check(
  !/\bgloballyTrue\s*:|\.globallyTrue\b/.test(generatorSource),
  'Generator retains the misleading machine/result field globallyTrue.'
);
check(
  !/\btruthByWorld\b/.test(generatorSource),
  'Generator retains the imprecise pointwise field truthByWorld.'
);
check(
  !/<th>Satisfiable<\/th>/i.test(generatorSource) && !/<th>Satisfiable<\/th>/i.test(reportBefore),
  'Generated or tracked report retains the display label "Satisfiable".'
);
check(
  !/Globally true/i.test(generatorSource) && !/Globally true/i.test(reportBefore),
  'Generated or tracked report retains the display label "Globally true".'
);

const requiredDisclaimerFragments = [
  'explicit generated finite model',
  'not logical satisfiability',
  'not logical validity',
  'not an unsatisfiability result',
  'not a decision procedure',
];
includesAll(reportBefore, requiredDisclaimerFragments, 'Tracked report disclaimer');

let generator = null;
try {
  generator = require(generatorPath);
} catch (error) {
  failures.push(`Generator module could not be loaded: ${error.message}`);
}

if (generator) {
  const requiredFunctions = [
    'createReportPayload',
    'evaluateFormulas',
    'renderHtmlReport',
    'renderConsoleReport',
  ];
  requiredFunctions.forEach(name => {
    check(typeof generator[name] === 'function', `Generator does not export ${name}().`);
  });

  if (requiredFunctions.every(name => typeof generator[name] === 'function')) {
    let fixturePayload = null;
    try {
      fixturePayload = generator.createReportPayload({
        mode: 's5',
        seed: 12345,
        formulaTexts: ['^p', '^(p | ~p)', '^(p & ~p)'],
      });
    } catch (error) {
      failures.push(`Behavioral fixture generation failed: ${error.message}`);
    }

    if (fixturePayload) {
      const results = fixturePayload.results;
      check(Array.isArray(results) && results.length === 3, 'Behavioral fixture must contain three results.');

      if (Array.isArray(results) && results.length === 3) {
        results.forEach((result, index) => {
          check(Object.prototype.hasOwnProperty.call(result, 'truthAtWorld'), `Result ${index + 1} lacks truthAtWorld.`);
          check(Object.prototype.hasOwnProperty.call(result, 'trueSomewhereInModel'), `Result ${index + 1} lacks trueSomewhereInModel.`);
          check(Object.prototype.hasOwnProperty.call(result, 'trueAtEveryWorldInModel'), `Result ${index + 1} lacks trueAtEveryWorldInModel.`);
          check(!Object.prototype.hasOwnProperty.call(result, 'truthByWorld'), `Result ${index + 1} retains truthByWorld.`);
          check(!Object.prototype.hasOwnProperty.call(result, 'satisfiable'), `Result ${index + 1} retains satisfiable.`);
          check(!Object.prototype.hasOwnProperty.call(result, 'globallyTrue'), `Result ${index + 1} retains globallyTrue.`);
        });

        try {
          assert.deepStrictEqual(Array.from(results[0].truthAtWorld), [true, false, false, false, true]);
          assert.strictEqual(results[0].trueSomewhereInModel, true);
          assert.strictEqual(results[0].trueAtEveryWorldInModel, false);
        } catch (error) {
          failures.push(`Some-but-not-all classification is incorrect: ${error.message}`);
        }

        try {
          assert.deepStrictEqual(Array.from(results[1].truthAtWorld), [true, true, true, true, true]);
          assert.strictEqual(results[1].trueSomewhereInModel, true);
          assert.strictEqual(results[1].trueAtEveryWorldInModel, true);
        } catch (error) {
          failures.push(`All-live-world classification is incorrect: ${error.message}`);
        }

        try {
          assert.deepStrictEqual(Array.from(results[2].truthAtWorld), [false, false, false, false, false]);
          assert.strictEqual(results[2].trueSomewhereInModel, false);
          assert.strictEqual(results[2].trueAtEveryWorldInModel, false);
        } catch (error) {
          failures.push(`False-at-all-live-worlds classification is incorrect: ${error.message}`);
        }
      }

      let html = '';
      let consoleReport = '';
      try {
        html = generator.renderHtmlReport(fixturePayload);
        consoleReport = generator.renderConsoleReport(fixturePayload);
      } catch (error) {
        failures.push(`Report rendering failed: ${error.message}`);
      }

      if (html) {
        includesAll(html, [
          'Generated Finite-Model Evaluation Report',
          'True at some world in this model',
          'True at every live world in this model',
          ...requiredDisclaimerFragments,
        ], 'Generated HTML');
        check(!/<th>Unsatisfiable<\/th>|Unsatisfiable\s*:/i.test(html), 'HTML classifies a false-everywhere result as unsatisfiable.');
        check(!/<th>Satisfiable<\/th>|Globally true/i.test(html), 'HTML retains an old misleading result label.');
      }

      if (consoleReport) {
        includesAll(consoleReport, [
          'Generated finite-model evaluation report',
          'True at some world in this model:',
          'True at every live world in this model:',
        ], 'Console report');
        check(!/Unsatisfiable\s*:|Satisfiable\s*:|Globally true\s*:/i.test(consoleReport), 'Console output retains a misleading result classification.');
      }
    }

    try {
      const canonicalPayload = generator.createReportPayload({ mode: 's5', seed: 12345 });
      const canonicalHtml = generator.renderHtmlReport(canonicalPayload);
      check(canonicalHtml === reportBefore, 'Tracked report is not byte-aligned with the canonical S5 seed-12345 rendering.');
    } catch (error) {
      failures.push(`Tracked-report alignment check failed: ${error.message}`);
    }
  }
}

const reportAfter = fs.readFileSync(reportPath, 'utf8');
check(reportAfter === reportBefore, 'Ordinary terminology checking rewrote the tracked report.');

if (failures.length > 0) {
  failures.forEach(message => console.error(`FAIL: ${message}`));
  console.error(`FAIL: report terminology contract has ${failures.length} violation(s).`);
  process.exit(1);
}

console.log('PASS: report result objects use truthAtWorld, trueSomewhereInModel, and trueAtEveryWorldInModel.');
console.log('PASS: some/not-all, all-live-world, and false-at-all-live-world classifications are exact.');
console.log('PASS: HTML, console, disclaimer, and tracked report use the finite-model terminology contract.');
console.log('PASS: the tracked report matches canonical seed-12345 rendering and was not rewritten by the check.');
