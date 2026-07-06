#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const reportsDir = path.join(root, 'reports');
const reportPath = path.join(reportsDir, 'random-bapal-evaluation.html');
const FormulaParser = require(path.join(root, 'lib/formula-parser.min.js'));

const context = { FormulaParser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/MPL.js'), 'utf8'), context, {
  filename: 'js/MPL.js',
});

const MPL = context.MPL;
const PROPS = ['p', 'q', 'r', 's'];
const AGENTS = ['a', 'b'];
const WORLD_COUNT = 5;
const FORMULA_COUNT = 10;
const MAX_FORMULA_LENGTH = 10;
const MAX_GENERATION_RETRIES = 500;

function parseArgs(argv) {
  const options = {
    mode: 's5',
    seed: Math.floor(Date.now() % 0xffffffff),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--s5') {
      options.mode = 's5';
    } else if (arg === '--arbitrary') {
      options.mode = 'arbitrary';
    } else if (arg === '--seed') {
      const seed = Number.parseInt(argv[++i], 10);
      if (!Number.isFinite(seed)) {
        throw new Error('--seed requires an integer value.');
      }
      options.seed = seed >>> 0;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/random-bapal-evaluation.js
  node scripts/random-bapal-evaluation.js --s5
  node scripts/random-bapal-evaluation.js --arbitrary
  node scripts/random-bapal-evaluation.js --seed 12345`);
}

function makeRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomInt(rng, maxExclusive) {
  return Math.floor(rng() * maxExclusive);
}

function chance(rng, probability) {
  return rng() < probability;
}

function choose(rng, items) {
  return items[randomInt(rng, items.length)];
}

function makeAssignment(rng) {
  const assignment = {};
  PROPS.forEach(prop => {
    if (chance(rng, 0.5)) assignment[prop] = true;
  });
  return assignment;
}

function buildRandomModel(rng, mode) {
  const model = new MPL.Model();
  const assignments = [];

  for (let i = 0; i < WORLD_COUNT; i++) {
    const assignment = makeAssignment(rng);
    assignments.push(assignment);
    model.addState(assignment);
  }

  if (mode === 's5') {
    AGENTS.forEach(agent => addRandomS5Relation(model, rng, agent));
  } else {
    AGENTS.forEach(agent => addRandomArbitraryRelation(model, rng, agent));
  }

  return { model, assignments };
}

function addRandomArbitraryRelation(model, rng, agent) {
  for (let source = 0; source < WORLD_COUNT; source++) {
    for (let target = 0; target < WORLD_COUNT; target++) {
      if (chance(rng, 0.35)) model.addTransition(source, target, agent);
    }
  }
}

function addRandomS5Relation(model, rng, agent) {
  const classes = [];

  for (let world = 0; world < WORLD_COUNT; world++) {
    if (classes.length === 0 || chance(rng, 0.35)) {
      classes.push([world]);
    } else {
      choose(rng, classes).push(world);
    }
  }

  classes.forEach(worlds => {
    worlds.forEach(source => {
      worlds.forEach(target => {
        model.addTransition(source, target, agent);
      });
    });
  });
}

function countJsonLength(json) {
  if (json.prop) return 1;
  if (json.neg) return 1 + countJsonLength(json.neg);
  if (json.bapal) return 1 + countJsonLength(json.bapal);
  if (json.kno_start && json.kno_start.kno_end) return 1 + countJsonLength(json.kno_start.kno_end[1]);

  const binaryKey = ['conj', 'disj', 'impl', 'equi'].find(key => json[key]);
  if (binaryKey) return 1 + countJsonLength(json[binaryKey][0]) + countJsonLength(json[binaryKey][1]);

  throw new Error(`Cannot count formula length for ${JSON.stringify(json)}`);
}

function generateAnyFormula(rng, maxLength) {
  if (maxLength <= 1) return choose(rng, PROPS);

  const choices = ['prop', 'not', 'know', 'binary'];
  const choice = choose(rng, choices);

  if (choice === 'prop') return choose(rng, PROPS);

  if (choice === 'not') {
    return '~' + generateAnyFormula(rng, maxLength - 1);
  }

  if (choice === 'know') {
    return `K{${choose(rng, AGENTS)}}` + generateAnyFormula(rng, maxLength - 1);
  }

  if (maxLength < 3) return choose(rng, PROPS);

  const connective = choose(rng, ['&', '|', '->', '<->']);
  const remaining = maxLength - 1;
  const leftLength = 1 + randomInt(rng, remaining - 1);
  const rightLength = remaining - leftLength;
  const left = generateAnyFormula(rng, leftLength);
  const right = generateAnyFormula(rng, rightLength);
  return `(${left} ${connective} ${right})`;
}

function generateBapalFormula(rng) {
  for (let attempt = 0; attempt < MAX_GENERATION_RETRIES; attempt++) {
    const innerMax = 1 + randomInt(rng, MAX_FORMULA_LENGTH - 1);
    const candidate = '^' + generateAnyFormula(rng, innerMax);

    try {
      const wff = new MPL.Wff(candidate);
      const length = countJsonLength(wff.json());
      if (length <= MAX_FORMULA_LENGTH && wff.ascii().includes('^')) {
        return wff;
      }
    } catch (error) {
      // Retry with a different random shape.
    }
  }

  throw new Error(`Could not generate a parseable BAPAL formula after ${MAX_GENERATION_RETRIES} retries.`);
}

function generateFormulas(rng) {
  const formulas = [];
  for (let i = 0; i < FORMULA_COUNT; i++) {
    formulas.push(generateBapalFormula(rng));
  }
  return formulas;
}

function evaluateFormulas(model, formulas) {
  return formulas.map((wff, index) => {
    const truthByWorld = [];
    for (let world = 0; world < WORLD_COUNT; world++) {
      truthByWorld.push(MPL.truth(model, world, wff));
    }

    return {
      number: index + 1,
      wff,
      length: countJsonLength(wff.json()),
      truthByWorld,
      satisfiable: truthByWorld.some(Boolean),
      globallyTrue: truthByWorld.every(Boolean),
    };
  });
}

function formatAssignment(assignment) {
  const trueProps = PROPS.filter(prop => assignment[prop]);
  return trueProps.length ? trueProps.join(', ') : '(none)';
}

function collectRelations(model) {
  const rawStates = model.getRawStates();
  const relations = {};

  AGENTS.forEach(agent => {
    relations[agent] = [];
    rawStates.forEach((state, source) => {
      if (!state) return;
      model.getSuccessorsOf(source, agent).forEach(successor => {
        relations[agent].push(`${source} -> ${successor.target}`);
      });
    });
  });

  return relations;
}

function playgroundUrl(modelString, ascii) {
  return `../index.html?model=${encodeURIComponent(modelString)}&formula=${encodeURIComponent(ascii)}`;
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeHtmlReport({ mode, seed, model, assignments, relations, results }) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const modelString = model.getModelString();

  const valuationRows = assignments.map((assignment, world) =>
    `<tr><td>w${world}</td><td>${htmlEscape(formatAssignment(assignment))}</td></tr>`
  ).join('\n');

  const relationRows = AGENTS.map(agent =>
    `<tr><td>${agent}</td><td>${htmlEscape(relations[agent].join(', ') || '(none)')}</td></tr>`
  ).join('\n');

  const formulaRows = results.map(result => {
    const ascii = result.wff.ascii();
    const truthCells = result.truthByWorld
      .map(value => `<td class="${value ? 'true' : 'false'}">${value ? 'T' : 'F'}</td>`)
      .join('');
    return `<tr>
      <td>${result.number}</td>
      <td><code>${htmlEscape(ascii)}</code></td>
      <td><code>${htmlEscape(result.wff.unicode())}</code></td>
      <td><code>${htmlEscape(result.wff.latex())}</code></td>
      <td>${result.length}</td>
      ${truthCells}
      <td>${result.satisfiable ? 'yes' : 'no'}</td>
      <td>${result.globallyTrue ? 'yes' : 'no'}</td>
      <td><a href="${htmlEscape(playgroundUrl(modelString, ascii))}">open</a></td>
    </tr>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Random BAPAL Evaluation</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.45; margin: 32px; }
      code { background: #f5f5f5; padding: 1px 4px; }
      table { border-collapse: collapse; margin: 16px 0; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background: #eee; }
      .true { background: #d7f5d0; text-align: center; }
      .false { background: #ffd6d6; text-align: center; }
    </style>
  </head>
  <body>
    <h1>Random BAPAL Evaluation</h1>
    <p><strong>Mode:</strong> ${htmlEscape(mode)}<br>
    <strong>Seed:</strong> ${htmlEscape(seed)}<br>
    <strong>Model string:</strong> <code>${htmlEscape(modelString)}</code></p>

    <p>
      Playground links use standard query parameters with encoded model and formula values.
      BAPAL formulas use <code>^A</code> as the ASCII input syntax for the existential
      Boolean-announcement diamond <code>◇ᵝA</code>; β marks Boolean announcement,
      not an agent.
    </p>

    <h2>World Valuations</h2>
    <table>
      <thead><tr><th>World</th><th>True propositions</th></tr></thead>
      <tbody>${valuationRows}</tbody>
    </table>

    <h2>Agent Relations</h2>
    <table>
      <thead><tr><th>Agent</th><th>Stored directed relations</th></tr></thead>
      <tbody>${relationRows}</tbody>
    </table>

    <h2>Formulas</h2>
    <table>
      <thead>
        <tr>
          <th>#</th><th>ASCII</th><th>Unicode</th><th>LaTeX</th><th>Length</th>
          <th>w0</th><th>w1</th><th>w2</th><th>w3</th><th>w4</th>
          <th>Satisfiable</th><th>Globally true</th><th>Playground</th>
        </tr>
      </thead>
      <tbody>${formulaRows}</tbody>
    </table>
  </body>
</html>
`;

  fs.writeFileSync(reportPath, html, 'utf8');
}

function printConsoleReport({ mode, seed, model, assignments, relations, results }) {
  console.log('Random BAPAL evaluation');
  console.log(`Mode: ${mode}`);
  console.log(`Seed: ${seed}`);
  console.log(`Model string: ${model.getModelString()}`);
  console.log('');
  console.log('World valuations:');
  assignments.forEach((assignment, world) => {
    console.log(`  w${world}: ${formatAssignment(assignment)}`);
  });
  console.log('');
  console.log('Agent relations:');
  AGENTS.forEach(agent => {
    console.log(`  ${agent}: ${relations[agent].join(', ') || '(none)'}`);
  });
  console.log('');
  console.log('Formula results:');
  results.forEach(result => {
    const values = result.truthByWorld.map((value, world) => `w${world}=${value ? 'T' : 'F'}`).join(', ');
    console.log(`${result.number}. ${result.wff.ascii()} (length ${result.length})`);
    console.log(`   Unicode: ${result.wff.unicode()}`);
    console.log(`   LaTeX: ${result.wff.latex()}`);
    console.log(`   Truth: ${values}`);
    console.log(`   Satisfiable: ${result.satisfiable ? 'yes' : 'no'}; globally true: ${result.globallyTrue ? 'yes' : 'no'}`);
  });
  console.log('');
  console.log(`HTML report written to: ${path.relative(root, reportPath)}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const rng = makeRng(options.seed);
  const { model, assignments } = buildRandomModel(rng, options.mode);
  const formulas = generateFormulas(rng);
  const results = evaluateFormulas(model, formulas);
  const relations = collectRelations(model);

  const payload = {
    mode: options.mode,
    seed: options.seed,
    model,
    assignments,
    relations,
    results,
  };

  printConsoleReport(payload);
  writeHtmlReport(payload);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('FAIL:', error.message);
    process.exit(1);
  }
}

module.exports = {
  playgroundUrl,
};
