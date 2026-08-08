# Round 5 Schema Resource-ID Repair Log

## 1. Audit 09 verdict

Audit 09, `audit/09_BAPAL_ROUND_5_VERSIONED_SCHEMA_CLOSURE_AUDIT.md`, gives the exact verdict **PASS SUBJECT TO LOCAL REPAIRS**. Its runtime review passes both Schema v1 codecs under the documented model/formula contracts. Its only Round 5 closure blocker is **R5-A09-01 — stale JSON Schema resource identities**.

The finding is local to machine-readable artifact identity, permanent coverage, and corresponding documentation. Audit 09 expressly states that it does not require reopening runtime codec design, formula semantics, truth preservation, prior repairs, or the foundational semantic audit unless the repair broadens beyond that scope.

## 2. Exact audited candidate and final pre-repair HEAD

| Role | Exact commit |
|---|---|
| Primary Round 5 implementation | `5a39a51f3069dde69194a11685e0445b7e98bf6d` |
| Complete Round 5 implementation candidate | `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` |
| Audit 09 final reviewed / final pre-repair HEAD | `ab10f64234a4d397582eab9ba68b434fea02ec26` |

Audit 09 confirms that `67fc1a2..ab10f64` changed only `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md`. The complete runtime candidate is therefore `67fc1a2`, while `ab10f64` is the exact final pre-repair documentary HEAD reviewed by Audit 09.

## 3. Exact repair commit

The exact committed repair is:

```text
edfbf32d07507bd43143bd518dbe3e2316a65979
repair round 5 schema canonical resource ids
```

The required clean-tree gate passed before this documentary task: `git status --short` produced no output, `git rev-parse HEAD` returned the exact commit above, and current history places it directly after `ab10f64234a4d397582eab9ba68b434fea02ec26`.

## 4. R5-A09-01 reproduction

At Audit 09 final reviewed HEAD `ab10f64234a4d397582eab9ba68b434fea02ec26`, the artifacts identified themselves as:

```text
https://github.com/vezwork/modallogic/schemas/bapal-model-v1.schema.json
https://github.com/vezwork/modallogic/schemas/bapal-formula-v1.schema.json
```

Audit 09 established that those URIs name the old `vezwork/modallogic` repository and both returned GitHub `404 NOT_FOUND`. The resource names were therefore stale even though JSON Schema does not require `$id` dereferenceability, the runtime codecs do not consume these `$id` values, and all artifact `$ref` values were local and resolved.

The minimized defect was the first `$id` line in each otherwise-passing Draft 2020-12 artifact. Neither permanent schema check pinned the exact resource identities, and `docs/SCHEMA_V1.md` did not state them.

## 5. Canonical-ID policy

The repaired canonical resource identities are:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

The policy is intentionally narrow:

- each document kind has a distinct, absolute HTTPS `$id` under the project-controlled `raycaesar.github.io/bapal` namespace;
- the IDs identify schema artifacts, not runtime `MPL.SchemaV1` API names;
- the IDs do not identify or replace legacy compact/share URLs;
- internal `$ref` values remain local fragments in their own schema resource;
- `$id` dereferenceability is not asserted as a JSON Schema requirement;
- a future `$id` change is an artifact-identity change requiring explicit version and review consideration.

## 6. Test-first failure

The exact-ID assertions were designed to fail against the Audit 09 artifacts before the two artifact lines were repaired. The minimized failures compare these actual and expected values:

| Check | Pre-repair actual | Required expected |
|---|---|---|
| Model `$id` | `https://github.com/vezwork/modallogic/schemas/bapal-model-v1.schema.json` | `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` |
| Formula `$id` | `https://github.com/vezwork/modallogic/schemas/bapal-formula-v1.schema.json` | `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json` |

In each permanent script, `assert.strictEqual()` therefore rejects the stale value. This is the minimized test-first failure for R5-A09-01; it is independent of runtime encode/decode behavior.

## 7. Artifact repair

Only one value changed in each machine-readable schema:

- `schemas/bapal-model-v1.schema.json`: `$id` changed from the stale `github.com/vezwork/modallogic` URI to the exact canonical model URI;
- `schemas/bapal-formula-v1.schema.json`: `$id` changed from the stale `github.com/vezwork/modallogic` URI to the exact canonical formula URI.

No `$schema`, title, description, envelope, definition, required field, type, identifier pattern, bound, uniqueness rule, local `$ref`, or `additionalProperties` rule changed. The repair therefore changes resource identity without changing the accepted structural document language.

## 8. Permanent regression assertions

`scripts/check-model-schema-v1.js` now permanently:

1. reads both tracked schema artifacts;
2. pins Model Schema v1 to the exact model `$id`;
3. pins Formula Schema v1 to the exact formula `$id` as a cross-artifact check;
4. asserts the model artifact's exact Draft 2020-12 `$schema` value;
5. rejects retained `vezwork/modallogic` text in the model artifact;
6. parses the model `$id` and requires an exact absolute HTTPS URI;
7. requires model and formula `$id` values to differ;
8. walks all model `$ref` values, requires local `#/` fragments, resolves every JSON Pointer token, and requires at least one reference;
9. retains the exact `bapal-model` format and version `1` assertions.

`scripts/check-formula-schema-v1.js` performs the symmetric assertions for the formula artifact: it pins both IDs, asserts the formula Draft 2020-12 dialect, rejects the stale repository text, validates the formula ID as an exact absolute HTTPS URI, requires distinct model/formula IDs, resolves all formula-local references with a nonzero reference count, and retains the exact `bapal-formula` format and version `1` checks.

These are permanent deterministic gates. Reintroducing either old ID, swapping the two IDs, duplicating them, making the focal ID relative or non-HTTPS, or breaking a focal local reference fails the corresponding script.

## 9. Documentation changes

The repair commit documents the canonical IDs in both `docs/SCHEMA_V1.md` and `API-Reference.md`, including their independence from runtime names and compact/share URLs, the local-fragment `$ref` policy, the absence of a dereferenceability claim, and the review consequence of changing an ID.

The same repair commit also adds the read-only Audit 09 artifact and updates `audit/00_AUDIT_INDEX.md`, `AGENTS.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, and `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` so that the exact Audit 09 verdict, local repair status, remaining focused recheck, and Round 6 block are not misstated.

This log and the addendum to `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md` are later documentary records. They do not pretend that the original pre-Audit implementation log already contained Audit 09's finding or the repair evidence.

## 10. New SHA-256 values

| Artifact | Audit 09 SHA-256 | Repair SHA-256 |
|---|---|---|
| `schemas/bapal-model-v1.schema.json` | `e520e6f498c6a2e5a8f6b1422f4820803a9d28e6e8a64a2f36e7ee7f07d9474f` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| `schemas/bapal-formula-v1.schema.json` | `277d8a8d1414da8c11f0375703517d586652a1d61dbcafcc281845546cc979e6` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |

The old values are the exact pre-repair hashes recorded by Audit 09. The new values were recomputed from the tracked artifacts at repair commit `edfbf32d07507bd43143bd518dbe3e2316a65979`.

## 11. Complete deterministic validation

The complete deterministic matrix was rerun at clean repair HEAD `edfbf32d07507bd43143bd518dbe3e2316a65979`. Every command exited `0`. `git status --short` was empty before the matrix and remained empty after all executable checks.

| Command | Observed result |
|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; seed `1548635457` (`0x5c4e4d41`); 100,000 generated models; 84,099 sparse; 300,172 null slots; 45,455 with multi-digit targets; 91,825 with Unicode identifiers; 15 adversarial identifiers; 27 invalid documents; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | PASS; 10 groups; seed `252037658` (`0x0f05ca1a`); 8,210 exhaustive ASTs through size 5; 100,000 generated formulas; maximum depth 40; 16 invalid documents; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | PASS, all 11 groups |
| `node scripts/check-atomic-model-import.js` | PASS; 9 minimized malformed cases; 16 valid compatibility cases; seed `68946449` (`0x041c0a11`); 100,000 fuzz candidates split 50,000 accepted / 50,000 rejected with rollback; 3 startup cases |
| `node scripts/check-agent-rendering.js` | PASS, all 5 groups |
| `node scripts/check-s5-invariants.js` | PASS, all 12 groups; 531 exhaustive relations; seed `5633283` (`0x0055f503`); 10,000 sequences / 200,000 operations |
| `node scripts/check-formula-roundtrip.js` | PASS; 1 minimized regression; 10 safe canonical cases; 25 difficult cases; 8,210 exhaustive; seed `0x00bada55`; 100,000 generated; 108,246 total AST round trips; 3 display smokes |
| `node scripts/check-structural-copy-regressions.js` | PASS, all 11 groups |
| `node scripts/check-bapal-regression.js` | PASS, all 8 checks |
| `node scripts/check-logic-regressions.js` | PASS, all 6 checks |
| `node scripts/check-s5-closure.js` | PASS, all 4 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS |
| `node scripts/check-report-links.js` | PASS, all 5 links |
| `git diff --check` | PASS, no output |

The tracked random-report generator was not run. `reports/random-bapal-evaluation.html` remained SHA-256 `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` and was not regenerated.

## 12. Protected-source integrity

The exact repair range is:

```text
ab10f64234a4d397582eab9ba68b434fea02ec26..edfbf32d07507bd43143bd518dbe3e2316a65979
```

That range has no diff for the runtime codec implementation `js/schema-v1.js` or supporting model/evaluator `js/MPL.js`. The runtime codec remains SHA-256 `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76`, exactly the value recorded by Audit 09.

The range also has no diff for `lib/formula-parser.min.js`, `js/s5-policy.js`, `js/app.js`, `css/app.css`, `scripts/random-bapal-evaluation.js`, or `reports/`. Consequently the raw parser, Round 2 printer, `_truth` clauses, Round 1 structural copy, S5 algorithms, raw-label rendering, Round 4 atomic compact import and semantic inspector, report generator, and tracked reports are not implementation targets of this repair. The complete inherited deterministic matrix passes as recorded above.

## 13. Claims not broadened

This repair and log do not claim:

- that `$id` dereferenceability is required by JSON Schema or currently guaranteed by a deployment check;
- that the runtime codecs use `$id` values during encode, decode, or validation;
- that Schema v1 replaces or repairs legacy compact/share URLs;
- that the legacy compact format preserves general multi-character identifiers;
- that a multi-character Formula Schema v1 knowledge entry denotes one epistemic agent;
- that model/formula v2, migration, browser import/export, a backend, or a new operator exists;
- that bounded deterministic or differential evidence is a proof of correctness, soundness, completeness, satisfiability, validity, or decidability;
- that P1-06, P1-07, Stage 0, or Round 5 is closed.

The separate Model Schema v1 and Formula Schema v1 identifier policies, current character-wise knowledge shorthand, legacy compact limitations, raw/browser grammar difference, and runtime-only semantic validations remain unchanged.

## 14. Round 5 remains pending focused recheck

The local R5-A09-01 repair is implemented and committed, both runtime codecs retain Audit 09's PASS disposition, both permanent schema checks pass with exact-ID assertions, documentation states the canonical identities, and the deterministic matrix is green.

Round 5 nevertheless remains **OPEN — PENDING FOCUSED WORK MAX CLOSURE RECHECK**. This implementation log does not self-certify closure. A focused read-only review must confirm the exact repair, permanent coverage, hashes/history, documentary accuracy, clean validation behavior, and absence of scope expansion before Round 5 can be closed narrowly.

## 15. Round 6 remains blocked

Round 6 remains blocked and is not authorized by the local repair. Work on the checked-in independent oracle, conformance corpus, deliberate-mismatch detection, manifests, or CI gate must wait for the focused Work Max recheck to close Round 5. P1-06, P1-07, and Stage 0 remain open.

## 16. Focused Work Max review package

The focused recheck should review this exact package:

- Audit 09: `audit/09_BAPAL_ROUND_5_VERSIONED_SCHEMA_CLOSURE_AUDIT.md`;
- complete Round 5 implementation candidate: `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`;
- final pre-repair reviewed HEAD: `ab10f64234a4d397582eab9ba68b434fea02ec26`;
- exact repair commit: `edfbf32d07507bd43143bd518dbe3e2316a65979`;
- exact repair comparison: `ab10f64234a4d397582eab9ba68b434fea02ec26..edfbf32d07507bd43143bd518dbe3e2316a65979`;
- repaired artifacts: `schemas/bapal-model-v1.schema.json` and `schemas/bapal-formula-v1.schema.json`;
- strengthened permanent checks: `scripts/check-model-schema-v1.js` and `scripts/check-formula-schema-v1.js`;
- canonical-ID documentation: `docs/SCHEMA_V1.md` and `API-Reference.md`;
- status/provenance records updated in the repair commit: `AGENTS.md`, `audit/00_AUDIT_INDEX.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, and `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`;
- the Audit 09 addendum in `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md` and this repair log;
- the exact old/new IDs, old/new schema hashes, test-first counterexamples, complete deterministic outputs, protected-source comparison, and final clean-scope evidence recorded here.

These two revision-log edits are intentionally left uncommitted by this documentary task. Any later commit containing only them is documentary provenance and does not replace `edfbf32d07507bd43143bd518dbe3e2316a65979` as the exact resource-ID repair commit.
