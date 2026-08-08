#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repository = path.resolve(__dirname, '..');
const FormulaParser = require(path.join(repository, 'lib/formula-parser.min.js'));
const context = { FormulaParser, console };
vm.createContext(context);
for (const relativePath of ['js/MPL.js', 'js/schema-v1.js']) {
  vm.runInContext(
    fs.readFileSync(path.join(repository, relativePath), 'utf8'),
    context,
    { filename: relativePath }
  );
}

const MPL = context.MPL;

function errorRecord(stage, error) {
  const source = error && typeof error === 'object' ? error : {};
  return {
    stage,
    code: typeof source.code === 'string' ? source.code : 'PRODUCTION_RUNNER_ERROR',
    message: typeof source.message === 'string' ? source.message : String(error),
    path: typeof source.path === 'string' ? source.path : null,
  };
}

function processRequest(request) {
  const requestId = request && Object.prototype.hasOwnProperty.call(request, 'requestId')
    ? request.requestId
    : null;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { requestId, ok: false, error: errorRecord('request', 'request must be an object') };
  }
  if (!Number.isSafeInteger(request.world) || request.world < 0) {
    return { requestId, ok: false, error: errorRecord('request', 'world must be a nonnegative safe integer') };
  }

  const modelResult = MPL.SchemaV1.decodeModel(request.model);
  if (!modelResult.ok) {
    return { requestId, ok: false, error: errorRecord('model', modelResult.error) };
  }
  const formulaResult = MPL.SchemaV1.decodeFormula(request.formula);
  if (!formulaResult.ok) {
    return { requestId, ok: false, error: errorRecord('formula', formulaResult.error) };
  }
  const states = modelResult.model.getStates();
  if (request.world >= states.length || states[request.world] === null) {
    return { requestId, ok: false, error: errorRecord('request', 'world must identify a live model world') };
  }

  try {
    const result = MPL.truth(modelResult.model, request.world, formulaResult.wff);
    return {
      requestId,
      ok: true,
      result: Boolean(result),
      canonicalModel: modelResult.canonicalDocument,
      canonicalFormula: formulaResult.canonicalDocument,
    };
  } catch (error) {
    return { requestId, ok: false, error: errorRecord('truth', error) };
  }
}

const input = fs.readFileSync(0, 'utf8');
for (const line of input.split(/\r?\n/)) {
  if (!line.trim()) continue;
  let response;
  try {
    response = processRequest(JSON.parse(line));
  } catch (error) {
    response = { requestId: null, ok: false, error: errorRecord('json', error) };
  }
  process.stdout.write(`${JSON.stringify(response)}\n`);
}
