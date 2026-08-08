# Independent Oracle and Conformance Guide

## 1. Purpose

This document is the normative developer guide for the Round 6 independent-oracle, conformance-corpus, failure-artifact, and CI infrastructure. The system compares two implementations at pointed worlds of bounded finite models:

- an independently implemented Python semantic oracle supplies expected truth values; and
- the JavaScript production evaluator supplies actual truth values.

The checked-in corpus, generated profiles, manifests, and deliberate-mismatch test make semantic divergence reproducible and reviewable. P1-07 remains open until a Work Max Round 6 closure audit passes the implementation and every concrete mismatch has an authorized disposition.

## 2. Independence boundary

`oracle/bapal_oracle.py` is Python 3 standard-library-only. Oracle evaluation must not:

- import JavaScript or a Node subprocess API;
- execute Node or any production program;
- import, call, or name `MPL.truth` or the Schema v1 runtime;
- read `js/MPL.js`, `js/schema-v1.js`, or other production evaluator source at runtime;
- parse production ASCII formula syntax;
- call the compact model serializer/importer; or
- treat production results as expected truth.

The permanent core check applies static independence guards to these boundaries. Those guards are useful regression checks, not a formal proof that two programs were developed independently.

The production runner has the opposite, deliberately narrow role. It may load production parser/MPL/Schema v1 code, decode documents, and call production truth. It must not implement a second semantic oracle, embed the core expected table, call Python, or synthesize expected answers.

`oracle/conformance.py` is orchestration and comparison code. Its types and diagnostics preserve the direction `oracleResult` = expected and `productionResult` = actual.

## 3. Schema v1 interchange

Model Schema v1 and Formula Schema v1 are the sole semantic interchange boundary:

```json
{"format":"bapal-model","version":1,"worlds":[]}
```

```json
{"format":"bapal-formula","version":1,"formula":{"type":"atom","name":"p"}}
```

The Python side parses and independently generates these documents without asking production code to encode production objects. The Node side decodes them through `MPL.SchemaV1`. The legacy compact/share representation and ASCII formula parser are not semantic transport for conformance.

World identity is the stable index in `worlds`. A `null` slot stays at its index; neither side may compact it. Formula knowledge agents use the Formula Schema v1 ordered character-unit array. Model atom names and relation labels retain the exact Model Schema v1 identity policy.

## 4. Python oracle semantics

The active domain is the set of non-null world indices in the current model restriction. Evaluation at a point outside that domain is invalid.

- `atom`: true exactly when the exact atom string occurs in the pointed world's `trueAtoms` set. Absent atoms are false.
- `not`: Boolean negation.
- `and`, `or`, `implies`, `iff`: ordinary truth functions; implication is false only for true-to-false and biconditional compares the two Boolean results.
- `box`: true exactly when the operand is true at every live outgoing successor. Every outgoing transition is included regardless of relation label. No successor makes it vacuously true.
- `diamond`: true exactly when the operand is true at some live outgoing successor, regardless of label. No successor makes it false.
- `knowledge`: for each character unit in `agents`, evaluate the operand at every outgoing successor whose relation label exactly equals that unit. Each unit is universal and vacuously true without a matching edge; multiple units are a conjunction. Differently labelled edges are ignored.
- `announcement`: evaluate the precondition at the pointed world in the source model. A false precondition makes the announcement formula vacuously true. Otherwise compute the precondition truth set across the entire source domain, restrict all worlds and transitions to that set while preserving indices, and evaluate the body at the retained point.
- `bapal`: partition the active domain by complete propositional valuation using exact full atom identities and uniform false-by-absence. Enumerate every subset of complete valuation classes that contains the pointed world's class, restrict to the corresponding class union, and evaluate the operand. Success of any candidate makes the formula true. The implementation does not enumerate syntactic Boolean formulas.

The BAPAL enumeration relies only on the finite valuation-class reduction documented in the main specification. Atom identities must not be concatenated into an ambiguous delimiter string.

## 5. Production runner

`oracle/production_runner.js` accepts structured requests containing a Schema v1 model, Schema v1 formula, and stable world index. It loads the actual production formula/MPL/schema components, decodes through `MPL.SchemaV1`, calls `MPL.truth`, and emits structured Boolean results in request order.

The runner validates request shape and reports bridge/decode/evaluation failures. It contains no manual expected table and no alternate truth recursion. Changes that add expected semantics to this file violate the independence contract even if tests continue to pass.

## 6. Core corpus

`conformance/v1/core-corpus.jsonl` contains 73 explicit JSON Lines records. Each record has exactly the reviewable semantic inputs and expectation:

```json
{
  "caseId": "stable-unique-id",
  "model": {"format": "bapal-model", "version": 1, "worlds": []},
  "formula": {"format": "bapal-formula", "version": 1, "formula": {}},
  "world": 0,
  "expected": true,
  "category": "pal"
}
```

Expected values are manually authored. They must never be generated from production output. The corpus covers atomic truth/falsity, all Boolean constructors, modal vacuity, all-label box/diamond, knowledge filtering/vacuity/shorthand, PAL vacuity/restriction/nesting, BAPAL valuation classes/nesting, sparse/null models, S5/non-S5, multi-character and prototype-sensitive atoms, raw labels, and exact atom identity.

`core-073-bapal-delimiter-collision-exact-atoms` is a permanent adversarial regression. Its two true-atom sets are `{"a","b"}` and `{"a,b"}`. Hand derivation and the independent oracle make `^K{x}a` true at world 0, while current production returns false. Until that production mismatch is separately repaired, the core check is expected to fail visibly rather than normalize or suppress it.

## 7. FAST profile

`conformance/v1/fast-profile.json` defines the every-push/pull-request profile:

- seed `0x6F524143` (`1867661635`);
- exactly 50,000 pointed comparisons;
- 64 independently generated models and 256 formulas;
- maximum four live worlds;
- maximum three complete valuation classes;
- maximum BAPAL nesting one;
- minimum 20,000 PAL and 20,000 BAPAL comparisons; and
- every Formula Schema v1 constructor plus shorthand knowledge, S5/non-S5, sparse/null, multiple-label, multi-character-atom, and exact-identifier coverage.

The runner must complete the exact count. It must not stop silently, reduce the target, or report success after a partial run. Current strengthened local execution completes all 50,000 comparisons and finds four real mismatches based on the exact-atom collision regression.

## 8. FULL profile

`conformance/v1/full-profile.json` defines the scheduled/manual profile:

- seed `0xC0DEC0DE` (`3235823838`);
- exactly 500,000 pointed comparisons;
- 128 independently generated models and 1,024 formulas;
- maximum five live worlds;
- maximum four complete valuation classes;
- maximum BAPAL nesting two;
- minimum 200,000 PAL, 250,000 BAPAL, and 75,000 nested-BAPAL comparisons; and
- the same constructor and model-family guarantees as FAST, with PAL/BAPAL-heavy generation.

The reviewed local run completed exactly 500,000 comparisons in 94.502206 seconds and found four real mismatches. It recorded 232,418 PAL, 295,446 BAPAL, and 78,600 nested-BAPAL comparisons, with observed nesting two. This red result is evidence that the gate works; it is not a passing closure result.

## 9. Seeds and bounds

The fixed Round 6 seeds are:

| Use | Hex seed |
|---|---:|
| Core/generated support | `0xBADA5506` |
| FAST | `0x6F524143` |
| FULL | `0xC0DEC0DE` |
| Deliberate sensitivity | `0xBAD0C0DE` |

Core expected values remain hand-authored, so the support seed is not a source of expected truth. FAST/FULL seeds are printed in diagnostics and recorded in both checked-in profiles and runtime manifests. Profile bounds constrain live worlds, valuation classes, and BAPAL nesting; null slots may make the raw world-array length larger than the live-domain size.

Any future budget or bound change requires an explicit reviewed contract update. Counts must never be silently reduced for convenience.

## 10. Runtime manifest

Every generated profile execution writes `manifest.json` only to its artifact directory. Omitting `--artifact-dir` creates a temporary untracked directory; CI supplies an explicit runner-temporary path.

The version-1 runtime manifest records:

- format, version, status, profile, and profile path;
- decimal and hexadecimal seed;
- expected and actual comparison counts;
- model, formula, live-pointed-world, and pointed-comparison counts;
- per-constructor node counts;
- PAL, BAPAL, nested-BAPAL, knowledge-shorthand, S5, non-S5, and sparse/null coverage;
- configured and observed bounds plus model-family coverage;
- git HEAD and tree when available;
- Python, Node, and platform versions;
- start, finish, and elapsed-duration metadata;
- source hashes; and
- mismatch count and operational error data when applicable.

`status` is `pass` only after exact completion with zero mismatches. A completed divergent run uses `mismatch`; an operational or incomplete run uses `error`. CI separately asserts exact counts, zero mismatches, and `pass`.

## 11. Source hashes

Each runtime manifest recomputes SHA-256 for:

- `oracle/bapal_oracle.py`;
- `oracle/production_runner.js`;
- `oracle/conformance.py`;
- `conformance/v1/core-corpus.jsonl`;
- the selected FAST or FULL profile;
- `schemas/bapal-model-v1.schema.json`;
- `schemas/bapal-formula-v1.schema.json`;
- `js/MPL.js`; and
- `js/schema-v1.js`.

The checked-in profile documents also pin the stable oracle, runner, comparator, and core hashes. Profile loading by `scripts/check-oracle-conformance.py` rejects stale provenance. A profile does not hash itself inside itself, avoiding a circular self-hash; the runtime manifest hashes the selected profile externally.

Source hashes establish byte provenance. They do not establish semantic correctness by themselves.

## 12. Mismatch artifact

When a generated profile finds one or more divergences, it completes the exact comparison budget, counts every mismatch, and writes the first replayable mismatch to `mismatch.json` in the artifact directory. The artifact includes:

- format/version, profile, seed, case index, and case ID;
- top-level model, formula, world, oracle result, and production result;
- relevant source hashes;
- a complete `originalCase` record;
- a complete `minimizedCase` record; and
- a minimization description and ordered steps.

Both cases remain valid Schema v1 documents with a stable pointed index. The artifact can therefore be replayed through the same oracle and production bridge. Synthetic deliberate-sensitivity artifacts additionally identify the in-memory transform that was applied.

## 13. Reducer

The reducer is deterministic. In stable order it attempts to:

1. remove transitions;
2. remove true atoms;
3. null nonpointed worlds while removing incoming edges; and
4. replace formula subtrees with strictly smaller valid candidates.

Each candidate is retained only if the same oracle/production mismatch still reproduces. The final candidate is replayed once more before being written. The artifact description is “minimized by the implemented deterministic shrinker; not globally minimal.” No code or documentation may upgrade that statement to a mathematical minimality claim.

## 14. Sensitivity test

`scripts/check-oracle-sensitivity.py` uses seed `0xBAD0C0DE` and the normal comparison/artifact/reducer path. It:

1. obtains 24 small normal oracle and production results;
2. requires zero real baseline mismatches;
3. copies the results in memory;
4. flips exactly one production Boolean;
5. requires the comparator to report exactly that mismatch;
6. writes and validates a replayable temporary mismatch artifact;
7. exercises deterministic reduction;
8. verifies the reduced case remains divergent under the deliberate transform; and
9. removes its temporary directory.

No hidden mutation flag is added to production code. If the normal baseline already contains a real mismatch, sensitivity fails before injecting another one. That is the correct current behavior while `core-073` remains unresolved.

## 15. GitHub Actions behavior

`.github/workflows/bapal-conformance.yml` has four triggers:

- every pull request runs FAST;
- pushes to `bapal-core` run FAST;
- manual dispatch runs FAST and FULL; and
- the weekly schedule runs FULL.

Both jobs use `contents: read`, disable persisted checkout credentials, set up supported Node and Python versions with official pinned-major actions, and have explicit timeouts. FAST and FULL run the independent core, sensitivity, their exact generated profile, all inherited deterministic non-writing regressions, `git diff --check`, and a clean-worktree assertion. The workflow never invokes `scripts/check-all.js` or `scripts/random-bapal-evaluation.js` because those paths may generate tracked reports.

Manifest validation runs with `if: always()` and fails a missing, incomplete, mismatching, or non-pass manifest. Artifact upload also runs with `if: always()` and includes the whole runner-temporary profile directory, covering manifests, mismatch artifacts, and reducer output without collecting environment dumps or secrets. No failure is hidden with `continue-on-error`.

## 16. Local commands

Run the independent core, deliberate sensitivity, and profiles from the repository root:

```sh
python3 scripts/check-independent-oracle.py
python3 scripts/check-oracle-sensitivity.py
python3 scripts/check-oracle-conformance.py --profile fast
python3 scripts/check-oracle-conformance.py --profile full
python3 scripts/check-conformance-ci.py
```

For retained CI-like artifacts, use an explicit untracked or temporary path:

```sh
python3 scripts/check-oracle-conformance.py --profile fast --artifact-dir /tmp/bapal-fast
python3 scripts/check-oracle-conformance.py --profile full --artifact-dir /tmp/bapal-full
```

The command prints the seed, exact target, progress, artifact path, elapsed time, and mismatch count. At the present protected-production revision, the core, sensitivity, FAST, and FULL commands fail because they expose the known exact-atom valuation-key mismatch. Do not weaken the corpus, comparator, or exit code to obtain a green result.

## 17. Failure triage

For an operational error, inspect `manifest.json` status, error, actual count, versions, bounds, and source hashes. For a semantic mismatch:

1. preserve `manifest.json` and `mismatch.json` outside tracked paths;
2. verify the manifest's git HEAD/tree and recompute its source hashes;
3. replay both `originalCase` and `minimizedCase`;
4. independently derive the expected result from the specification rather than choosing the side that matches existing production;
5. classify the defect as oracle, production, interchange, comparator, or corpus expectation;
6. add or retain the smallest understandable permanent regression before any authorized repair; and
7. rerun core, sensitivity, FAST, FULL, inherited deterministic checks, whitespace, and clean-tree checks.

Never regenerate tracked reports during triage. Never change protected production semantics as part of a Round 6 documentation or infrastructure task. The current `core-073` result is hand/oracle true and production false; it requires separately authorized production repair scope before Round 6 can close.

## 18. Nonclaims and limitations

Oracle agreement is bounded regression evidence. The oracle is not a formal proof, and agreement does not prove either side correct. Generated profile sizes are finite: FAST checks exactly 50,000 pointed cases and FULL checks exactly 500,000. Their BAPAL models are deliberately bounded by live-world, valuation-class, and nesting limits.

The system does not establish soundness, completeness, validity, satisfiability, decidability, exhaustive finite-model coverage, or correctness for all identifiers, models, or formulas. It is not a satisfiability solver, validity checker, theorem prover, or BAPAL decision procedure. It does not certify legacy compact serialization, unify raw/browser formula grammars, broaden character-wise Formula Schema v1 knowledge units, change S5 policy, or repair P1-06 terminology.

Round 6 writes no tracked runtime manifest or report by default. Its CI and local commands are designed to leave the repository unchanged apart from intentionally reviewed source/documentation changes.
