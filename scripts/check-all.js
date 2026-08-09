#!/usr/bin/env node

const { spawnSync } = require('child_process');

const commands = [
  ['node', ['scripts/check-bapal-regression.js']],
  ['node', ['scripts/check-logic-regressions.js']],
  ['node', ['scripts/check-s5-closure.js']],
  ['node', ['scripts/check-bapal-valuation-class.js']],
  ['node', ['scripts/check-report-terminology.js']],
  ['node', ['scripts/check-report-links.js']],
];

for (const [command, args] of commands) {
  const display = [command, ...args].join(' ');
  console.log(`\n=== ${display} ===`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`FAIL: could not run ${display}`);
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`FAIL: ${display} exited with status ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('\nPASS: all checks completed successfully.');
