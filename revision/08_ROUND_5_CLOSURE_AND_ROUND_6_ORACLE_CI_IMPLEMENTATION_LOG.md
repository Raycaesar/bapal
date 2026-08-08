# Round 5 Closure and Round 6 Independent Oracle / CI Implementation Log

## 1. Verdict

**PASS — READY FOR WORK MAX CLOSURE AUDIT**

Round 5 is closed by Audit 10. The complete Round 6 implementation candidate is clean, committed, pushed, locally revalidated, and exercised successfully by GitHub Actions at the exact candidate commit. A push-triggered FAST run and two `workflow_dispatch` runs containing both FAST and FULL completed successfully.

This is an implementation-log disposition, not a Work Max closure verdict. P1-07 remains open until a separate Work Max Round 6 closure audit passes it. P1-06 and Stage 0 also remain open.

## 2. Repository identity

| Item | Exact identity |
|---|---|
| Repository | `Raycaesar/bapal` |
| Branch | `bapal-core` |
| Foundational baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` |
| Round 1 implementation | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` |
| Round 2 implementation | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` |
| Original complete Round 3 candidate | `6bd33697491820db3d0999ac7c7ccf99b05291d5` |
| Round 3 rendering repair / Audit 07 reviewed commit | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` |
| Round 4 implementation | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` |
| Round 4 final log-only HEAD | `ab26863374464dd1466286a6c31d19d8e1a39a66` |
| Round 5 primary implementation | `5a39a51f3069dde69194a11685e0445b7e98bf6d` |
| Round 5 complete candidate | `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` |
| Audit 09 final reviewed / pre-repair HEAD | `ab10f64234a4d397582eab9ba68b434fea02ec26` |
| Schema-ID repair commit | `edfbf32d07507bd43143bd518dbe3e2316a65979` |
| Audit 10 documentary reviewed commit | `8451a1e289eb8e6efa19887e35955d3d8772c8d8` |
| Round 6 primary implementation | `e0e17c09d6f9ac30399a06c5da85615b312b4b55` |
| Round 6 README follow-up | `cfcd80cd50731f7cc5cfe8b45e555060df2b3d93` |
| Round 6 workflow-bootstrap repair | `e4f8a3573091c70e8bcd42b13c991aa7e1d12f5b` |
| Exact complete Round 6 implementation candidate | `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` |
| Candidate tree | `cbca95699da5853313da1c00d579e802daa84204` |
| Remote branch identity | `origin/bapal-core` = `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` |
| Node.js | `v24.18.0` |
| Python | `3.12.3` |
| Log preparation time | `2026-08-09T06:10:55+08:00` |

The required pre-log gate produced:

```text
$ git status --short
<no output>
$ git rev-parse HEAD
ffcd7cb2d14217859069acd8ac23cdc5ea450cbc
$ git branch --show-current
bapal-core
```

`git branch -vv` showed `bapal-core` tracking `origin/bapal-core` at the same commit. A later log-only commit may add this file; such a documentary commit must not replace `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` as the exact Round 6 implementation candidate.

## 3. Round 5 focused closure

Audit 09 passed the runtime Model Schema v1 and Formula Schema v1 codecs but identified one closure blocker: **R5-A09-01 — stale JSON Schema resource identities**. At the Audit 09 pre-repair boundary, both schema `$id` values still named the inherited `vezwork/modallogic` repository.

Commit `edfbf32d07507bd43143bd518dbe3e2316a65979` repaired only the schema resource identities and their permanent/documentary contract. The canonical IDs are:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

Internal `$ref` values remain local fragments. The IDs identify schema artifacts; they are not runtime API names, compact serialization, or share URLs.

Audit 10, `audit/10_BAPAL_ROUND_5_SCHEMA_ID_CLOSURE_RECHECK.md`, contains exactly:

```text
PASS — ROUND 5 VERSIONED SCHEMA V1 CLOSED; PROCEED TO ROUND 6
```

Audit 10 closes R5-A09-01 and Round 5 at the schema-ID repair commit, with documentary reviewed commit `8451a1e289eb8e6efa19887e35955d3d8772c8d8`. P1-06, P1-07, and Stage 0 remained open.

## 4. Round 6 objective

Round 6 implements P1-07: the repository previously lacked a checked-in semantic oracle independent of production evaluation, a hand-auditable conformance corpus, reproducible bounded differential profiles, deliberate-mismatch sensitivity, replayable mismatch evidence, provenance manifests, and a permanent CI gate.

The objective is bounded regression and differential evidence for the existing finite explicit-model semantics. It is not a proof, validity checker, satisfiability solver, exhaustive BAPAL verification, or unbounded decision procedure.

## 5. Independence architecture

The checked-in architecture separates semantic roles:

- `oracle/bapal_oracle.py` is Python 3 standard-library-only semantic code. It parses Model Schema v1 and Formula Schema v1 into its own immutable structures. It does not import or invoke Node, read production JavaScript, call `MPL.truth` or `MPL.SchemaV1`, parse production ASCII formulas, or consume production expected values.
- Model Schema v1 and Formula Schema v1 are the only semantic interchange boundary. The Python generator creates those documents independently; it does not ask production objects or production Schema v1 encoders to generate them.
- `oracle/production_runner.js` performs the opposite role: it loads `js/MPL.js` and `js/schema-v1.js`, decodes through production `MPL.SchemaV1`, calls `MPL.truth` exactly once per request, and emits actual Boolean results plus canonical production documents. It has no manual truth table or independent expected evaluator.
- `oracle/conformance.py` invokes the production runner as a subprocess, evaluates the Python oracle separately, retains the expected/actual distinction, and compares the result sets. Subprocess support is confined to the comparator; the oracle itself has none.
- Core expected values are explicit JSON Booleans authored in the corpus. Generated expectations come only from the independent Python semantics, never from production output.

Permanent independence guards parse the oracle with Python `ast`, reject process/Node bridge imports and calls, reject production path or `MPL.truth` references, reject runtime file/process operations, deny `open()` during an oracle behavioral probe, require the production runner's Schema v1 decoding and sole `MPL.truth` call, and reject signs of a duplicate evaluator or embedded expected table in the runner. These are practical structural and behavioral guards, not a formal proof of program independence.

## 6. Core corpus

- Path: `conformance/v1/core-corpus.jsonl`
- Exact pointed cases: **73**
- Expected values: explicit manually specified JSON Booleans; none are generated from production output.
- SHA-256: `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a`

Exact category coverage is:

| Category | Cases |
|---|---:|
| `bapal-valuation-classes` | 14 |
| `boolean` | 10 |
| `identifier-preservation` | 6 |
| `knowledge` | 7 |
| `modal-labels` | 2 |
| `modal-vacuity` | 4 |
| `non-s5` | 7 |
| `pal` | 10 |
| `raw-relation-labels` | 2 |
| `s5` | 5 |
| `sparse-null` | 6 |

The corpus covers every Formula Schema v1 constructor and the required atom, Boolean, all-label modal, knowledge filtering/vacuity/shorthand, PAL vacuity/restriction/nesting, BAPAL valuation-class/nesting, S5/non-S5, sparse/null, multi-character, prototype-sensitive, Unicode/raw-label, and exact-identifier boundaries. `core-073-bapal-delimiter-collision-exact-atoms` permanently distinguishes the valuation sets `{"a","b"}` and `{"a,b"}`.

## 7. Oracle semantics

The Python oracle independently implements the audited semantics using mathematical helpers rather than production parser or evaluator control flow:

- **Atoms and Booleans:** an atom is true exactly when its exact string occurs in the pointed world's true-atom set. `not`, `and`, `or`, `implies`, and `iff` use their ordinary Boolean truth functions.
- **Ordinary box and diamond:** successors are all live outgoing targets regardless of relation label. Box is universal, including vacuity over no successors; diamond is existential.
- **Knowledge:** each Formula Schema v1 `agents` entry remains one character-wise agent unit. For every unit, only outgoing edges with that exact relation label are quantified. A missing matching edge gives vacuous truth; differently labelled edges are ignored. Multiple units retain the current conjunction-like shorthand.
- **PAL:** the precondition is evaluated in the source model. A false pointed precondition makes the announcement formula vacuously true. Otherwise the source domain is restricted to all and only source worlds satisfying the precondition, stable indices and null slots are preserved, transitions to removed worlds are discarded, and the body is evaluated at the retained point.
- **BAPAL:** active worlds are partitioned by complete valuations over exact full model atom identities, with absence uniformly false. The oracle enumerates unions of complete valuation classes whose subset contains the pointed world's entire class, restricts to each union, and evaluates the operand. It does not enumerate syntactic Boolean formulas.

## 8. FAST profile

| Field | Observed value at the candidate |
|---|---|
| Profile file | `conformance/v1/fast-profile.json` |
| Seed | `0x6F524143` (`1867661635`) |
| Comparisons | exactly `50,000 / 50,000` |
| Models / formulas / live pointed worlds | `64 / 256 / 167` |
| Bounds | at most 4 live worlds, 3 valuation classes, BAPAL nesting 1 |
| PAL / BAPAL / nested BAPAL | `24,025 / 27,742 / 0` |
| Knowledge shorthand | `12,308` comparisons |
| S5 / non-S5 | `25,000 / 25,000` comparisons |
| Sparse/null | `16,406` comparisons |
| Mismatches | `0` |
| Local candidate runtime | `7.827023` seconds |
| Local runtime manifest SHA-256 | `478cc74ca127a98fe16e5eb947aeb7119e175fecb44ea9ec09d03746fbe5f472` |

Exact constructor counts were:

```json
{"and":24778,"announcement":32228,"atom":173629,"bapal":29890,"box":22840,"diamond":22664,"iff":16806,"implies":25798,"knowledge":23253,"not":22273,"or":24019}
```

The local manifest records `gitHead` `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`, `gitTree` `cbca95699da5853313da1c00d579e802daa84204`, status `pass`, and zero mismatches. The manifest file hash is specific to this recorded run because timestamps and duration are runtime metadata.

## 9. FULL profile

| Field | Observed value at the candidate |
|---|---|
| Profile file | `conformance/v1/full-profile.json` |
| Seed | `0xC0DEC0DE` (`3235823838`) |
| Comparisons | exactly `500,000 / 500,000` |
| Models / formulas / live pointed worlds | `128 / 1,024 / 364` |
| Bounds | at most 5 live worlds, 4 valuation classes, BAPAL nesting 2 |
| PAL / BAPAL / nested BAPAL | `232,418 / 295,446 / 78,600` |
| Knowledge shorthand | `142,173` comparisons |
| S5 / non-S5 | `250,000 / 250,000` comparisons |
| Sparse/null | `164,062` comparisons |
| Mismatches | `0` |
| Local candidate runtime | `96.371175` seconds |
| Local runtime manifest SHA-256 | `50f0d9307a1ae421eaafe3400ced02a60d170c60fba9bb8da6193f68a6b2a9cb` |

Exact constructor counts were:

```json
{"and":280358,"announcement":377939,"atom":1995777,"bapal":415536,"box":288569,"diamond":288171,"iff":288105,"implies":273990,"knowledge":284823,"not":292541,"or":275385}
```

The local manifest records the exact candidate HEAD/tree, status `pass`, maximum observed BAPAL nesting two, every configured/observed bound at its declared maximum, and zero mismatches.

## 10. Sensitivity and mutation detection

The permanent sensitivity test uses seed `0xBAD0C0DE`. It obtains 24 normal oracle/production results and requires zero real mismatches, copies them in memory, flips exactly one production Boolean at case index 9, invokes the ordinary comparator, and requires exactly one mismatch. It writes a temporary replayable `mismatch.json`, preserves the original and reduced cases, checks source hashes, replays the reduced mismatch, and removes the temporary directory.

The current run executed 31 accepted deterministic reduction steps and exercised all four implemented phases: `remove-transition`, `remove-true-atom`, `remove-nonpointed-world`, and `replace-formula-subtree`. The artifact truthfully describes the result as “minimized by the implemented deterministic shrinker; not globally minimal.” No production mutation flag exists.

Prompt 6.4 separately used complete temporary copies to kill five production mutants with FAST:

| Temporary production mutant | FAST mismatches | First killing case | Difference |
|---|---:|---|---|
| Invert atomic truth | 23,691 | `fast-000000000` | oracle `false`, mutant `true` |
| Remove PAL false-precondition vacuity | 12,127 | `fast-000000002` | oracle `true`, mutant `false` |
| Make knowledge quantify over all outgoing labels | 936 | `fast-000000009` | oracle `true`, mutant `false` |
| Make BAPAL retain only the pointed valuation class | 391 | `fast-000000130` | oracle `true`, mutant `false` |
| Break implication | 5,234 | `fast-000000001` | oracle `true`, mutant `false` |

Three temporary oracle mutants were also killed against unchanged production:

| Temporary oracle mutant | FAST mismatches | First killing case | Difference |
|---|---:|---|---|
| Wrong knowledge filtering | 936 | `fast-000000009` | mutant oracle `false`, production `true` |
| Wrong PAL restriction | 183 | `fast-000000152` | mutant oracle `true`, production `false` |
| Wrong BAPAL pointed-class inclusion | 235 | `fast-000000331` | mutant oracle `false`, production `true` |

These results demonstrate useful sensitivity on both sides; they are not complete mutation coverage.

## 11. Manifest and failure artifacts

Runtime manifests use exact identity `{"format":"bapal-conformance-runtime-manifest","version":1}`. Their fields are:

```text
format, version, status, profile, profileFile, seed, seedHex,
expectedComparisonCount, actualComparisonCount, modelCount, formulaCount,
livePointedWorldCount, pointedComparisonCount, nodeConstructorCounts,
palCount, bapalCount, nestedBapalComparisonCount,
knowledgeShorthandComparisonCount, s5ComparisonCount,
nonS5ComparisonCount, sparseNullComparisonCount, bapalNestingMaximum,
bounds, observedBounds, modelCoverage, gitHead, gitTree, pythonVersion,
nodeVersion, platform, sourceHashes, startedAt, finishedAt,
elapsedSeconds, mismatchCount
```

Operational failures add an `error` object and preserve the partial comparison count. Every normal manifest carries SHA-256 provenance for the core corpus, selected profile, Python oracle, production runner, comparator, Model Schema v1, Formula Schema v1, `js/MPL.js`, and `js/schema-v1.js`.

Mismatch artifacts use exact identity `{"format":"bapal-conformance-mismatch","version":1}` and include `profile`, `seed`, `seedHex`, `caseIndex`, `caseId`, `model`, `formula`, `world`, `oracleResult`, `productionResult`, `sourceHashes`, `originalCase`, `minimizedCase`, and `minimization.description/steps`. The sensitivity artifact additionally records its explicit synthetic transform.

Runtime manifests and mismatch/reducer artifacts are written only to an explicit artifact directory or a temporary untracked directory. They are never silently written into tracked reports or source paths.

## 12. GitHub Actions

The workflow is `.github/workflows/bapal-conformance.yml`.

- Triggers: every `pull_request`; `push` to `bapal-core`; `workflow_dispatch`; weekly schedule `17 4 * * 1`.
- Permissions: top-level `contents: read`; checkout disables persisted credentials; there is no write token permission.
- Official actions: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/setup-python@v7`, and `actions/upload-artifact@v7`.
- FAST: PR, `bapal-core` push, and manual dispatch; inherited deterministic checks, core, sensitivity, exactly 50,000 comparisons, manifest gate, whitespace check, clean-tree check, and upload; timeout 15 minutes.
- FULL: weekly schedule and manual dispatch; core, sensitivity, exactly 500,000 comparisons, manifest gate, inherited deterministic checks, whitespace and clean-tree checks, and upload; timeout 30 minutes.
- Artifact directories are created from `$RUNNER_TEMP` after runner setup. A bootstrap JSON exists even for early semantic failures. Manifest validation, whitespace, clean-tree, and artifact upload use always-run behavior; no failure is hidden with `continue-on-error`.
- The workflow never invokes `scripts/check-all.js` or the random report generator.

Actual public GitHub Actions evidence for candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` is:

| Run | Event | Observed result |
|---|---|---|
| [31279961371](https://github.com/Raycaesar/bapal/actions/runs/31279961371) | `push` | completed/success; FAST job `93159567471` success from `21:42:39Z` to `21:43:44Z`; FULL correctly skipped |
| [31280106548](https://github.com/Raycaesar/bapal/actions/runs/31280106548) | `workflow_dispatch` | completed/success; FAST job `93159926632` success; FULL job `93159926657` success |
| [31280325814](https://github.com/Raycaesar/bapal/actions/runs/31280325814) | `workflow_dispatch` | completed/success; FAST job `93160459559` success; FULL job `93160459594` success |

For run 31280325814, every core, sensitivity, generated-conformance, manifest, inherited-check, clean-tree, and upload step reports success. Its public artifact metadata records:

- `bapal-conformance-fast-31280325814-1`, artifact `9028234819`, 1,591 bytes;
- `bapal-conformance-full-31280325814-1`, artifact `9028254984`, 1,612 bytes.

The GitHub CLI was present but its configured token was invalid. Public GitHub API metadata supplied the run/job/artifact evidence above. Anonymous artifact ZIP download returned HTTP 401, so no remote manifest contents or remote manifest hashes are fabricated; Sections 8, 9, and 16 record independently regenerated local manifests at the exact candidate.

Historical precursor runs also proved the gate's failure behavior: runs 31278179312 and 31278215950 failed before job creation because `runner.temp` was incorrectly used at job-level `env`; commit `e4f8a3573091c70e8bcd42b13c991aa7e1d12f5b` repaired that bootstrap. The first executable FAST run, 31278938374, then stopped at the real `core-073` production mismatch rather than hiding it.

## 13. Independent review

Prompt 6.4 performed a concentrated review without assuming that agreement made the oracle correct.

- **Independence:** the Python oracle did not invoke Node, read production JavaScript, consume production expected values, or structurally duplicate `_truth` line for line. It is organized around live domains, successor sets, relation-filtered successors, restrictions, valuation classes, and class-union enumeration. The runner contained no second evaluator, and generated Schema v1 documents originated in Python.
- **Hand derivation:** atomic true/false, implication/iff, box vacuity, diamond, wrong-label knowledge, knowledge vacuity, `K{ab}`, PAL false-precondition vacuity, PAL restriction, nested PAL, equal-valuation BAPAL, selectable-class BAPAL, and nested BAPAL were calculated independently and probed. Hand result, Python oracle, and production agreed except for the newly exposed exact-atom collision before its scoped repair; all agree after repair.
- **Mutation kills:** all five production and all three oracle mutants listed in Section 10 were detected. No plausible listed mutant survived FAST.
- **FULL:** the concentrated review completed exactly 500,000 comparisons and initially found four independently generated instances of the exact-atom delimiter collision. That red result was retained as evidence rather than normalized away.
- **Artifacts and manifests:** the deliberate mismatch retained original/reduced cases and replayed; reducer wording made no global-minimality claim; runtime artifacts remained untracked. Every source SHA-256 was independently recomputed, manifest HEAD/tree values matched the checkout, and a stale pinned profile hash failed the permanent check in a temporary copy.
- **Scoped repair:** `core-073-bapal-delimiter-collision-exact-atoms` showed that comma joining conflated `{"a","b"}` with `{"a,b"}`. The production repair changed only `_valuationKey` from sorted delimiter concatenation to `JSON.stringify(Object.keys(assignment).sort())`. A truth-level permanent matrix covers commas, quote/backslash/bracket punctuation, multi-character atoms, prototype-sensitive names, Unicode exact/non-normalized strings, and insertion-order invariance. The independent oracle and `core-073` expected value remained unchanged.
- **Post-repair review:** core, sensitivity, FAST 50,000/50,000, FULL 500,000/500,000, CI structure, and every inherited deterministic check pass with zero real mismatches at the candidate.

This review supplies bounded adversarial evidence, not a proof of either implementation.

## 14. Files changed

The exact Round 6 range is `8451a1e289eb8e6efa19887e35955d3d8772c8d8..ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`.

### Audit 10 administration

- Modified: `audit/00_AUDIT_INDEX.md`
- Added: `audit/10_BAPAL_ROUND_5_SCHEMA_ID_CLOSURE_RECHECK.md`

### Python oracle

- Added: `oracle/bapal_oracle.py`

### Production bridge/comparator

- Added: `oracle/production_runner.js`
- Added: `oracle/conformance.py`

### Conformance corpus/profiles

- Added: `conformance/v1/core-corpus.jsonl`
- Added: `conformance/v1/fast-profile.json`
- Added: `conformance/v1/full-profile.json`

### Permanent checks

- Added: `scripts/check-independent-oracle.py`
- Added: `scripts/check-oracle-conformance.py`
- Added: `scripts/check-oracle-sensitivity.py`
- Added: `scripts/check-conformance-ci.py`
- Modified: `scripts/check-bapal-valuation-class.js`
- Modified: `scripts/check-model-schema-v1.js`

### CI

- Added: `.github/workflows/bapal-conformance.yml`

### Docs/register

- Modified: `AGENTS.md`
- Modified: `README.md` with a minimal conformance pointer
- Modified: `docs/BAPAL_PLAYGROUND_SPEC.md`
- Added: `docs/CONFORMANCE.md`
- Modified: `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`

### Explicit scoped semantic repair

- Modified: `js/MPL.js`, solely replacing collision-prone delimiter valuation identity with the structural sorted-array JSON identity.

### Unexpected files

- None.

Audits 01–09, `js/schema-v1.js`, parser artifacts, UI/S5/render/import code, report generator, and tracked reports have no Round 6 diff.

## 15. Deterministic command matrix

Every command below exited `0` at candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` unless its row explicitly describes the intentional injected mismatch inside a passing sensitivity test.

| Command | Exit | Concise observed result |
|---|---:|---|
| `python3 scripts/check-independent-oracle.py` | 0 | PASS; 73 explicit cases; all 11 categories; oracle/runner/comparator/core hashes printed; independence guards PASS |
| `python3 scripts/check-oracle-sensitivity.py` | 0 | PASS; seed `0xBAD0C0DE`; 24 normal/0 real mismatches; one deliberate flip detected; 31 reduction steps; all four shrink phases; artifact replayed and cleaned |
| `python3 scripts/check-oracle-conformance.py --profile fast` | 0 | PASS; seed `0x6F524143`; exactly 50,000/50,000; 0 mismatches; 7.827023 seconds in the recorded candidate run |
| `python3 scripts/check-oracle-conformance.py --profile full` | 0 | PASS; seed `0xC0DEC0DE`; exactly 500,000/500,000; 0 mismatches; 96.371175 seconds in the recorded candidate run |
| `python3 scripts/check-conformance-ci.py` | 0 | PASS; triggers/conditions, exact commands, runtimes/timeouts, runtime artifact bootstrap, permissions, manifest/clean-tree/upload gates; available YAML parser PASS |
| `node scripts/check-model-schema-v1.js` | 0 | PASS; 9 groups; 100,000 generated models; 84,099 sparse; 300,172 null slots; 91,825 Unicode; 27 invalid; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | 0 | PASS; 10 groups; 8,210 exhaustive; 100,000 generated; maximum depth 40; 16 invalid; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | 0 | PASS; all 11 groups |
| `node scripts/check-atomic-model-import.js` | 0 | PASS; 9 minimized malformed, 16 compatibility, 100,000 fuzz split 50,000 accepted/50,000 rollback, 3 startup cases |
| `node scripts/check-agent-rendering.js` | 0 | PASS; all 5 groups |
| `node scripts/check-s5-invariants.js` | 0 | PASS; all 12 groups; 531 exhaustive relations; 10,000 sequences/200,000 operations |
| `node scripts/check-formula-roundtrip.js` | 0 | PASS; 8,210 exhaustive, 100,000 generated, 108,246 total round trips |
| `node scripts/check-structural-copy-regressions.js` | 0 | PASS; all 11 regressions |
| `node scripts/check-bapal-regression.js` | 0 | PASS; all 8 checks |
| `node scripts/check-logic-regressions.js` | 0 | PASS; all 6 checks |
| `node scripts/check-s5-closure.js` | 0 | PASS; all 4 checks |
| `node scripts/check-bapal-valuation-class.js` | 0 | PASS; 1 insertion-order invariant and 10 distinct exact-set truth cases |
| `node scripts/check-report-links.js` | 0 | PASS; all 5 links |
| `git diff --check` | 0 | PASS; no whitespace errors before this log was created |

The random report generator and `scripts/check-all.js` were not run. Runtime manifests were generated under `/tmp`, not the repository.

## 16. Artifact integrity

### Core implementation and conformance artifacts

| Path | SHA-256 |
|---|---|
| `oracle/bapal_oracle.py` | `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226` |
| `oracle/production_runner.js` | `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d` |
| `oracle/conformance.py` | `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160` |
| `conformance/v1/core-corpus.jsonl` | `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a` |
| `conformance/v1/fast-profile.json` | `9f4f8e136e5072c73be1b59e66f2360a28c567522a0c4df1da6277fd9bd55508` |
| `conformance/v1/full-profile.json` | `4e48e21e3d85ba4c7abf5945cc802cb45813552cff768a0aa00dab67982f064b` |
| `schemas/bapal-model-v1.schema.json` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| `schemas/bapal-formula-v1.schema.json` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |
| `js/MPL.js` | `63b09ca498964c9b544874fcc844932d255411b8fd49adbf89db0b29479c78e5` |
| `js/schema-v1.js` | `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76` |
| `.github/workflows/bapal-conformance.yml` | `09a431dd72ff4783e73baca6153661b3232f5cfea3a58c5a10ae51b2cbf59e5e` |

The final local FAST and FULL manifest hashes are respectively `478cc74ca127a98fe16e5eb947aeb7119e175fecb44ea9ec09d03746fbe5f472` and `50f0d9307a1ae421eaafe3400ced02a60d170c60fba9bb8da6193f68a6b2a9cb`.

### Audits 01–10

| Audit | SHA-256 |
|---|---|
| `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md` | `fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8` |
| `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md` | `875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd` |
| `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md` | `b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1` |
| `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` | `be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087` |
| `audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md` | `15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709` |
| `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md` | `8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2` |
| `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md` | `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2` |
| `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` | `9e2354770e611252e33bb1b1226ef778d1c0c41a79a17e86ad748bcf431a864f` |
| `audit/09_BAPAL_ROUND_5_VERSIONED_SCHEMA_CLOSURE_AUDIT.md` | `26a630d610f38be1b48caf81c6b51dfbe29e0d63bd5cb82b4dcd9d84e05bfd88` |
| `audit/10_BAPAL_ROUND_5_SCHEMA_ID_CLOSURE_RECHECK.md` | `dec0245151b2c303a964cae985399ba10b627822e5a0949a80711c923de5eaf2` |

The tracked random report remains SHA-256 `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` and was not regenerated.

## 17. Protected-source integrity

Round 6 made one explicitly authorized production semantic representation repair. The exact `js/MPL.js` diff from Audit 10 reviewed HEAD to the candidate is:

```diff
-    return Object.keys(assignment).sort().join(',');
+    return JSON.stringify(Object.keys(assignment).sort());
```

This collision-free key distinguishes every different finite set of exact atom strings while treating the same set in different insertion orders identically. It preserves exact strings and performs no Unicode normalization or legacy compact serialization. It does not change the mathematical BAPAL class-union quantification architecture.

No other logical production semantic change occurred. Source comparison confirms unchanged:

- formula parser and parser configuration;
- Round 2 formula printer;
- every `_truth` operator clause;
- `Model.deepCopy()` and structural restriction/copy behavior;
- ordinary box/diamond, knowledge, and PAL clauses;
- S5 closure/edit policy;
- raw-label renderer;
- atomic legacy compact import;
- semantic inspector;
- `js/schema-v1.js` runtime codecs and identifier policy;
- report generator and tracked reports.

`js/app.js`, `js/s5-policy.js`, `index.html`, `css/`, `scripts/random-bapal-evaluation.js`, and `reports/` have no diff in the Round 6 range. The oracle semantics and `core-073` expected value remained unchanged during the production repair.

## 18. Claims supported

The evidence supports these narrow claims:

- a checked-in independent Python oracle exists under the documented dependency and independence boundary;
- a checked-in, manually expected, hand-auditable 73-case core corpus exists;
- deterministic FAST and FULL finite conformance profiles exist at exact counts and seeds;
- tested production/oracle results agree within the stated finite model/formula/profile bounds at the candidate;
- deliberate copied-result mismatches and the listed temporary semantic mutants are detected;
- replayable mismatch artifacts preserve original and deterministically reduced cases;
- runtime and checked-in provenance manifests exist with exact source hashes;
- a read-only GitHub Actions conformance gate exists, and actual push FAST plus manual FAST/FULL successes are recorded;
- the P1-07 local implementation package is ready for a separate Work Max closure audit.

The evidence does **not** support claims of formal proof, exhaustive BAPAL correctness, correctness on all finite or unbounded models, soundness/completeness, validity/satisfiability solving, an unbounded decision procedure, P1-06 closure, P1-07 closure, Round 6 closure, or Stage 0 closure.

## 19. Remaining findings

- **P1-06 terminology:** result/report terminology remains open for Round 7; no terminology cleanup was performed in Round 6.
- **Legacy compact limits:** the compatibility serializer/import/share format still has its audited one-character atom and one-code-point terminal relation-label limits.
- **Raw/browser grammar differences:** raw parser syntax, browser comma removal, and browser announcement preprocessing remain distinct.
- **BAPAL performance:** class-subset enumeration is exponential in the number of complete valuation classes; the conformance profiles deliberately bound live worlds, valuation classes, and nesting.
- **Finite conformance:** 73 core cases, 50,000 FAST comparisons, and 500,000 FULL comparisons are finite bounded regression evidence, not exhaustive semantic coverage.

## 20. Next planned round

**Round 7 — terminology and documentation closure.**

Round 7 targets P1-06. It is not implemented by this log and must not begin until a Work Max Round 6 closure audit authorizes it.

## 21. Work Max package

The Round 6 Work Max review package is:

- exact implementation candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` and tree `cbca95699da5853313da1c00d579e802daa84204`;
- the distinction between that candidate and any later log-only commit adding this file;
- Audit 10 and its exact Round 5 closure verdict;
- `oracle/bapal_oracle.py`;
- `oracle/production_runner.js` and `oracle/conformance.py`;
- `conformance/v1/core-corpus.jsonl`;
- checked-in FAST/FULL profile documents and their pinned provenance;
- final local FAST/FULL manifests, exact counts, coverage, hashes, and runtimes recorded here;
- `scripts/check-independent-oracle.py`, `scripts/check-oracle-conformance.py`, and `scripts/check-oracle-sensitivity.py`;
- deliberate sensitivity mismatch/reducer evidence and Prompt 6.4 temporary mutation-kill evidence;
- `.github/workflows/bapal-conformance.yml` and `scripts/check-conformance-ci.py`;
- `docs/CONFORMANCE.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, `AGENTS.md`, `README.md`, and the Stage 0 register;
- the scoped exact-atom valuation-key repair and permanent truth-level regressions;
- the complete deterministic command outputs summarized in Section 15;
- public GitHub Actions runs 31279961371, 31280106548, and 31280325814, their job outcomes, and current artifact metadata.

This package is ready for independent Work Max review. It does not self-certify P1-07 or Round 6 closure.
