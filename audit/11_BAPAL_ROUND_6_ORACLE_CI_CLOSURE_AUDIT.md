# BAPAL Round 6 Independent Oracle / Conformance / CI Closure Audit

- **Repository:** `Raycaesar/bapal`
- **Branch:** `bapal-core`
- **Audit date:** 2026-08-08 UTC / 2026-08-09 UTC+08
- **Audit 10 reviewed commit:** `8451a1e289eb8e6efa19887e35955d3d8772c8d8`
- **Complete Round 6 implementation candidate:** `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`
- **Final audited HEAD:** `e9b8bd37a380c74375c7cd161711f76e605bf483`
- **Mode:** concentrated, read-only closure audit

## 1. Executive verdict

**PASS SUBJECT TO LOCAL REPAIRS**

The Round 6 executable package passes the substantive audit. The checked-in Python oracle is independent under the audited source/runtime boundary; its semantic clauses agree with a separately written third evaluator on every one of the 73 explicit core cases and on an additional independently generated 100,000-case corpus. Local FAST and FULL complete exactly 50,000 and 500,000 pointed comparisons with zero mismatches. Seven distinct production mutants and the corresponding seven Python-oracle mutants are all detected. Comparator direction, failure exit behavior, mismatch artifacts, deterministic reduction, replay, source provenance, stale-profile rejection, CI structure, remote runs, and all inherited regressions pass.

The first executable remote gate is especially probative. At pre-repair commit `e4f8a35`, hand-authored case `core-073-bapal-delimiter-collision-exact-atoms` produced expected/oracle `true` and production `false`. The gate stopped. The scoped production repair at `ffcd7cb` changes only collision-prone valuation-class identity from delimiter joining to JSON serialization of the sorted exact atom array. The unchanged expectation and unchanged Python semantic clause then agree with production locally and remotely.

One local documentary blocker remains:

> **R6-A11-01 — normative status and remote-evidence drift.** Several current normative files still state that Round 5 awaits closure or that Round 6 remote FAST revalidation remains pending. Audit 10 already closed Round 5. The candidate has successful remote push FAST and manual FAST/FULL runs, and final log-only HEAD `e9b8bd3` itself has a successful remote FAST run with a downloadable, source-matching manifest. `docs/BAPAL_PLAYGROUND_SPEC.md` also still says the independent oracle/corpus is not yet checked in.

This defect is documentary only. It does not reopen the Round 5 runtime schemas, invalidate the oracle, or identify a semantic/CI failure. It nevertheless prevents an unconditional closure because the requested documentation/status contract is false at final HEAD.

Accordingly:

- P1-07 remains **OPEN** pending the local documentary repair and a focused read-only recheck;
- Round 6 remains open;
- Round 7 is not yet authorized;
- P1-06 remains **OPEN**;
- Stage 0 remains **OPEN**.

The target repository was not edited. All temporary generators, mutation probes, historical reproductions, downloaded workflow artifacts, and manifests remained outside it.

## 2. Audit scope and certification boundary

This audit reviews:

- Audit 10 administration and Round 5 closure preservation;
- Python-oracle independence and semantic correctness;
- the explicit core corpus;
- deterministic FAST and FULL profiles;
- production/oracle comparison direction and sensitivity;
- mismatch artifacts and the deterministic reducer;
- profile and runtime provenance;
- the GitHub Actions gate and actual workflow evidence;
- the scoped exact-atom valuation-key repair;
- inherited deterministic regressions; and
- Round 6 documentation and implementation-log accuracy.

It does not certify:

- a proof of semantic correctness;
- soundness, completeness, validity, satisfiability, or decidability;
- exhaustive finite-model or unbounded BAPAL coverage;
- legacy compact/share URLs as lossless;
- genuine multi-character Formula Schema v1 epistemic agents;
- P1-06 terminology;
- Round 7; or
- Stage 0 closure.

All generated evidence is bounded computational evidence.

## 3. Exact commit sequence

### 3.1 Certified Round 5 identities

| Role | Commit |
|---|---|
| Round 5 canonical-ID repair | `edfbf32d07507bd43143bd518dbe3e2316a65979` |
| Audit 10 reviewed/documentary commit | `8451a1e289eb8e6efa19887e35955d3d8772c8d8` |

### 3.2 Exact commits after `8451a1e`

The history is linear and contains exactly five commits:

```text
8451a1e289eb8e6efa19887e35955d3d8772c8d8
  -> e0e17c09d6f9ac30399a06c5da85615b312b4b55
  -> cfcd80cd50731f7cc5cfe8b45e555060df2b3d93
  -> e4f8a3573091c70e8bcd42b13c991aa7e1d12f5b
  -> ffcd7cb2d14217859069acd8ac23cdc5ea450cbc
  -> e9b8bd37a380c74375c7cd161711f76e605bf483
```

| Order | Commit | Subject | Exact role | Diff size |
|---:|---|---|---|---|
| 1 | `e0e17c09d6f9ac30399a06c5da85615b312b4b55` | `close round 5 and implement round 6 independent conformance` | Primary oracle/corpus/profile/comparator/CI implementation and Audit 10 administration | 17 files; 3,587 insertions; 19 deletions |
| 2 | `cfcd80cd50731f7cc5cfe8b45e555060df2b3d93` | `add new readme` | One-line README conformance pointer | 1 insertion |
| 3 | `e4f8a3573091c70e8bcd42b13c991aa7e1d12f5b` | `repair round 6 conformance workflow bootstrap` | Moves artifact-path initialization into runner-time workflow steps and strengthens the structural CI check | 2 files; 82 insertions; 6 deletions |
| 4 | `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` | `fix BAPAL valuation class identifier collisions` | Complete Round 6 candidate: scoped valuation-key repair, regression strengthening, final bootstrap artifact, and corresponding status docs | 9 files; 225 insertions; 47 deletions |
| 5 | `e9b8bd37a380c74375c7cd161711f76e605bf483` | `add round 6 independent conformance implementation log` | Log only | 1 new file; 464 insertions |

The complete implementation range `8451a1e..ffcd7cb` changes 21 files with 3,860 insertions and 37 deletions.

Candidate tree:

```text
cbca95699da5853313da1c00d579e802daa84204
```

Final HEAD tree:

```text
e95e3780417e9afe6566cc09287160e52ed786cc
```

`ffcd7cb..e9b8bd3` adds exactly one path:

```text
revision/08_ROUND_5_CLOSURE_AND_ROUND_6_ORACLE_CI_IMPLEMENTATION_LOG.md
```

Therefore final HEAD differs from the complete Round 6 implementation candidate only by the requested log-only commit.

## 4. Audit 10 administration and Round 5 preservation

**Result: passed.**

- Repository Audit 10 SHA-256 is `dec0245151b2c303a964cae985399ba10b627822e5a0949a80711c923de5eaf2`.
- It is byte-identical to the previously delivered Audit 10 artifact.
- Audit 09 is likewise byte-identical to the delivered artifact at SHA-256 `26a630d610f38be1b48caf81c6b51dfbe29e0d63bd5cb82b4dcd9d84e05bfd88`.
- `audit/00_AUDIT_INDEX.md` records Audit 10's exact Round 5 closure disposition and keeps P1-06, P1-07, and Stage 0 open.
- Audit 10 actually closed R5-A09-01 and Round 5 at `edfbf32`, with reviewed documentary commit `8451a1e`.
- Round 6 did not change `js/schema-v1.js` or either JSON Schema artifact.

The exact schema identities remain:

| Artifact | `$id` | SHA-256 |
|---|---|---|
| Model Schema v1 | `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| Formula Schema v1 | `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |

Both still declare Draft 2020-12. No Round 5 runtime/schema regression was found. The stale status sentence in `docs/SCHEMA_V1.md` is handled as R6-A11-01 rather than reopening the passed runtime design.

## 5. Oracle independence

### 5.1 Python oracle

`oracle/bapal_oracle.py` satisfies the checked boundary:

- standard-library-only imports;
- no `subprocess`, Node bridge, JS interpreter, or production module import;
- no runtime read of `js/MPL.js`, `js/schema-v1.js`, or compact serialization;
- no Formula ASCII parser or printer transport;
- no production result used as expected truth;
- no file or process I/O in the semantic module;
- independently parsed immutable `FiniteModel`, `World`, `Transition`, and `Formula` structures; and
- immutable active domains, exact atom-set identities, and class-union enumeration.

The permanent AST/static guards and a behavioral probe with `open()` denied both pass.

The implementation is not a mechanical runtime derivation of production `_truth`. Its organization and representation differ materially:

| Python oracle | Production JavaScript |
|---|---|
| frozen dataclasses, tuples, `frozenset` domains | mutable `MPL.Model` states and structural copies |
| relation-filtered helper functions | inline successor predicates |
| valuation classes keyed by `frozenset[str]` | collision-free serialized sorted exact atom arrays |
| class-union iterator | power-set over unique valuation keys |
| memoized formula/domain/world recursion | direct recursive `_truth` |

Implementing the same mathematical clauses is necessary agreement, not evidence of copying.

### 5.2 Production runner

`oracle/production_runner.js` performs only the production role:

- loads the actual parser/MPL/Schema v1 files;
- calls `MPL.SchemaV1.decodeModel()` and `decodeFormula()`;
- calls the actual `MPL.truth()` once at its single source call site;
- emits actual Booleans and production canonical documents;
- contains no expected table, Python call, alternate truth recursion, valuation-class oracle, or core-corpus dependency.

### 5.3 Strong historical independence evidence

At pre-repair `e4f8a35`, the permanent core command exits `1` on exactly:

```text
case ID: core-073-bapal-delimiter-collision-exact-atoms
expected: true
oracle result: true
production result: false
```

Remote run `31278938374` independently records the same red result. A production-generated expectation dump would not have opposed production at the defect that the gate discovered.

## 6. Independent semantic audit

A third evaluator was written outside the repository. It uses a domain-bitmask representation, its own model/formula conversion, and independent control flow. It does not import `oracle/conformance.py`, use the checked-in generator, or use production output as expected truth.

### 6.1 All explicit core cases

All 73 cases were evaluated by:

1. hand-authored checked-in expectation;
2. the external third evaluator;
3. the checked-in Python oracle; and
4. production JavaScript.

All four values agree on all 73 cases.

| Requested clause | Representative independently rechecked cases | Result |
|---|---|---|
| Atoms | `core-001`, `core-002` | agree |
| All Boolean connectives | `core-003`–`core-010` | agree |
| Box/diamond and vacuity | `core-011`, `core-012`, `core-015`, `core-016` | agree |
| K vacuity and label filtering | `core-013`, `core-017`–`core-019` | agree |
| Character-wise K shorthand | `core-020`–`core-023` | agree |
| PAL false-precondition vacuity | `core-036` | agree |
| PAL source-domain restriction | `core-037`–`core-041`, `core-044` | agree |
| Nested PAL | `core-042`, `core-043`, `core-045` | agree |
| BAPAL complete valuation classes | `core-046`–`core-054` | agree |
| Pointed-class inclusion and multi-class witnesses | `core-051`, `core-052`, `core-057`, `core-058` | agree |
| Nested BAPAL | `core-055`, `core-056` | agree |
| Sparse/null worlds | `core-059`–`core-064` | agree |
| Exact/prototype-sensitive identity | `core-065`–`core-070`, `core-073` | agree |

No semantic disagreement was found.

## 7. Core corpus assessment

`conformance/v1/core-corpus.jsonl` contains exactly 73 nonblank JSON Lines records.

- case IDs: 73 unique, stable, nonempty identifiers;
- duplicate cases by ID: 0;
- invalid Schema v1 model/formula documents: 0;
- missing Formula Schema v1 constructors: 0;
- expected fields are explicit JSON Booleans checked into each record;
- every documented category is populated.

Exact category counts:

| Category | Count |
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

The corpus is hand-auditable rather than a generated result dump: it is organized as small named semantic examples with repeated transparent model fixtures, and its final adversarial expectation preceded and contradicted the defective production behavior.

## 8. FAST and FULL profiles

### 8.1 Local final-HEAD results

| Profile | Seed | Exact count | PAL | BAPAL | Nested BAPAL | Mismatches | Elapsed |
|---|---:|---:|---:|---:|---:|---:|---:|
| FAST | `0x6F524143` | 50,000 / 50,000 | 24,025 | 27,742 | 0 | 0 | 7.653503 s |
| FULL | `0xC0DEC0DE` | 500,000 / 500,000 | 232,418 | 295,446 | 78,600 | 0 | 99.897582 s |

Observed profile bounds match the documents:

| Profile | Models | Formulas | Live pointed worlds | Max live worlds | Max valuation classes | Max BAPAL nesting |
|---|---:|---:|---:|---:|---:|---:|
| FAST | 64 | 256 | 167 | 4 | 3 | 1 |
| FULL | 128 | 1,024 | 364 | 5 | 4 | 2 |

Every formula constructor has a nonzero node count. Both profiles include S5/non-S5, sparse/null, multiple-label, multi-character-atom, exact-identifier, PAL, BAPAL, and knowledge-shorthand coverage. FULL reaches configured nesting two.

Local runtime manifest SHA-256 values:

- FAST: `a0faba5da270216c34ea3c1f80f55a0e444f852d543b1d55092777a44c96b1ec`;
- FULL: `35e5082a49daf15201cd3457e152c0505bfc872373de675d8b87040ca3ca9f82`.

Both local manifests record final HEAD `e9b8bd3`, final tree `e95e378`, exact count, zero mismatch, status `pass`, and zero independently recomputed source-hash differences.

### 8.2 No silent truncation or write

The runner:

- materializes the fixed pools and yields the exact requested budget;
- raises on an incomplete count;
- asserts required constructor and coverage floors;
- completes the budget even after finding semantic mismatches;
- writes only into an explicit or temporary artifact directory; and
- leaves tracked files unchanged.

## 9. Additional independent 100,000-case corpus

The external audit generator uses:

- seed `0xA11D17E5`;
- Python's independent `random.Random` stream rather than the repository's SplitMix64;
- 160 independently generated models;
- 640 independently generated formulas;
- at most four live worlds;
- at most three complete valuation classes;
- BAPAL nesting at most two; and
- its own model/formula scheduling.

Exact results:

| Metric | Count |
|---|---:|
| Pointed comparisons | 100,000 |
| PAL-containing cases | 40,463 |
| BAPAL-containing cases | 47,034 |
| Nested-BAPAL cases | 13,738 |
| S5 cases | 50,000 |
| Non-S5 cases | 50,000 |
| Sparse/null cases | 33,125 |
| Third evaluator vs checked-in Python mismatches | 0 |
| Third evaluator vs production mismatches | 0 |
| Checked-in Python vs production mismatches | 0 |

Every Formula Schema v1 constructor occurs. All 100,000 cases were compared on all three executable semantic sides; “where tractable” did not require sampling down this corpus.

## 10. Sensitivity and mutation kills

Fourteen in-memory mutants were tested outside the repository: seven production defects and the corresponding seven Python-oracle defects.

| Defect | Production killing corpus / count / first case | Python-oracle killing corpus / count / first case |
|---|---|---|
| Inverted atom | core / 43 / `core-001-atom-true` | core / 43 / `core-001-atom-true` |
| Broken implication | core / 1 / `core-007-implies-false` | core / 1 / `core-007-implies-false` |
| K ignores labels | core / 5 / `core-017-knowledge-a-true` | core / 5 / `core-017-knowledge-a-true` |
| PAL false precondition not vacuous | core / 3 / `core-036-pal-vacuity` | core / 3 / `core-036-pal-vacuity` |
| PAL restriction recomputed in wrong source | FAST / 25 / `fast-000005381` | FAST / 412 / `fast-000000389` |
| BAPAL omits pointed-class requirement | core / 8 / `core-046-bapal-same-valuation-modal` | core / 16 / `core-046-bapal-same-valuation-modal` |
| BAPAL checks only one domain | core / 2 / `core-057-bapal-proper-class-union` | core / 2 / `core-057-bapal-proper-class-union` |

The PAL wrong-source mutation is not killed by the 73-case core alone; the complete checked-in FAST corpus kills it on both sides. No listed mutant survives.

This is useful bounded mutation evidence, not complete mutation coverage.

## 11. Comparator, mismatch artifact, and reducer

### 11.1 Direction and exit behavior

The comparator's roles remain explicit:

```text
oracleResult = expected
productionResult = actual
```

An external orientation probe supplied oracle `false` and production `true`; the produced `ComparisonMismatch` retained those values in exactly those named fields. Length/type disagreements raise errors. A nonempty mismatch count makes `scripts/check-oracle-conformance.py` exit nonzero after the manifest/artifact path has been produced.

### 11.2 Permanent deliberate sensitivity

`python3 scripts/check-oracle-sensitivity.py` passes with:

- seed `0xBAD0C0DE`;
- 24 normal comparisons;
- 0 real baseline mismatches;
- exactly one copied production Boolean flipped at case index 9;
- exactly one detected mismatch;
- 31 accepted deterministic reduction steps;
- all four shrink phases exercised;
- reduced mismatch replayed; and
- temporary artifact removed after validation.

### 11.3 Artifact contract

The mismatch artifact contains:

- exact profile, seed, case index, and case ID;
- model, formula, world, oracle result, and production result;
- source hashes;
- the complete original case;
- the complete minimized case; and
- ordered reduction steps.

The reducer retains a candidate only if the same mismatch reproduces and replays the final candidate before writing. Its wording is exactly:

```text
minimized by the implemented deterministic shrinker; not globally minimal
```

No global-minimality claim is made, and the original failing case is retained.

## 12. Manifest and provenance audit

### 12.1 Pinned source hashes

Every pinned profile SHA-256 was independently recomputed and matched:

| Path | SHA-256 |
|---|---|
| `oracle/bapal_oracle.py` | `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226` |
| `oracle/production_runner.js` | `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d` |
| `oracle/conformance.py` | `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160` |
| `conformance/v1/core-corpus.jsonl` | `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a` |

Runtime source hashes additionally match both schema artifacts, `js/MPL.js`, `js/schema-v1.js`, and the selected profile.

### 12.2 Runtime manifest content

The manifest records all required identity and evidence fields: format/version/status, profile and profile file, seed, expected/actual counts, pools and pointed counts, constructor counts, PAL/BAPAL/nesting/shorthand/model-family coverage, configured and observed bounds, git HEAD/tree, Python/Node/platform versions, timestamps/duration, source hashes, and mismatch count.

### 12.3 Stale-provenance kill

In an external archive, replacing the pinned oracle hash in FAST with 64 zeroes makes the command exit `1` before generation:

```text
pinned profile provenance is stale for: oracle/bapal_oracle.py
```

No manifest or mismatch file is written into the archived source tree.

## 13. GitHub Actions audit

### 13.1 Workflow contract

`.github/workflows/bapal-conformance.yml` satisfies the requested policy:

- every pull request -> FAST;
- push to `bapal-core` -> FAST;
- `workflow_dispatch` -> FAST and FULL;
- weekly `17 4 * * 1` -> FULL;
- top-level `contents: read` and no write permission;
- checkout credentials are not persisted;
- explicit 15-minute FAST and 30-minute FULL timeouts;
- core, sensitivity, exact generated profile, inherited checks, manifest gate, whitespace gate, and clean-tree gate;
- no `continue-on-error` around conformance;
- no random report generator or report-writing aggregate;
- artifact directory and `bootstrap.json` created before semantic steps; and
- manifest validation and artifact upload use `if: always()`.

The final failure-path source therefore retains an uploadable bootstrap artifact after a semantic failure even if conformance never writes a manifest. The earlier `e4f8a35` run predated the final bootstrap-file strengthening and is not used to certify the final failure-upload path.

### 13.2 Actual runs

| Run | Event / SHA | Outcome | Audited evidence |
|---|---|---|---|
| `31278938374` | push / `e4f8a35` | failed as designed | core stopped on `core-073`: expected/oracle true, production false |
| `31279961371` | push / `ffcd7cb` | success | FAST job success; FULL skipped |
| `31280106548` | manual / `ffcd7cb` | success | FAST and FULL success |
| `31280325814` | manual / `ffcd7cb` | success | FAST and FULL success; both artifacts downloaded and inspected |
| `31281388941` | push / final HEAD `e9b8bd3` | success | final-source FAST success; FULL correctly skipped |

The final-HEAD FAST artifact is:

- artifact ID `9028527707`;
- archive SHA-256 `3dcb41290c793527dedfc30b0263cb30d887ab99c422e7a4e2ea1d5f58ef6bf7`;
- manifest SHA-256 `182dfdb4bdbf8dcad2d33a674ae9a3ebad5ae11c0de017a54c2fa0e21b30303f`;
- manifest HEAD `e9b8bd3` and tree `e95e378`;
- 50,000 / 50,000 comparisons;
- status `pass`; and
- zero mismatches and zero source-hash discrepancies.

The independently downloaded candidate FULL artifact from run `31280325814` is:

- artifact ID `9028254984`;
- archive SHA-256 `5c60fbf89dd1d451a991914e31139f34ba72862f26a4fd7ee323fefdd9d8f9c1`;
- manifest SHA-256 `c01cd6c8a978fd70d948baacdc8ce93d7fa44405623b3f2592fdb83dd7b2163a`;
- candidate HEAD `ffcd7cb` and tree `cbca956`;
- 500,000 / 500,000 comparisons;
- status `pass`; and
- zero mismatches and zero source-hash discrepancies.

Thus remote FAST exists on the exact final source, and remote FULL exists on the complete implementation candidate from which final HEAD differs only by the log.

## 14. Deterministic command matrix

Every required command exited `0` at final HEAD.

| Command | Observed result |
|---|---|
| `python3 scripts/check-independent-oracle.py` | 73 explicit cases; all categories; independence guards pass |
| `python3 scripts/check-oracle-sensitivity.py` | 24 baseline/0 real mismatch; one flip detected; 31 reduction steps; replay/cleanup pass |
| `python3 scripts/check-oracle-conformance.py --profile fast` | 50,000 / 50,000; 0 mismatch |
| `python3 scripts/check-oracle-conformance.py --profile full` | 500,000 / 500,000; 0 mismatch |
| `python3 scripts/check-conformance-ci.py` | triggers, commands, bootstrap, permissions, manifests, clean-tree, uploads, and YAML parse pass |
| `node scripts/check-model-schema-v1.js` | 100,000 generated; 9 groups; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | 8,210 exhaustive + 100,000 generated; 10 groups; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | 11/11 groups |
| `node scripts/check-atomic-model-import.js` | 9 malformed; 16 compatibility; 100,000 fuzz; 3 startup |
| `node scripts/check-agent-rendering.js` | 5/5 groups |
| `node scripts/check-s5-invariants.js` | 12/12; 531 relations; 10,000 sequences / 200,000 operations |
| `node scripts/check-formula-roundtrip.js` | 108,246 round trips |
| `node scripts/check-structural-copy-regressions.js` | 11/11 groups |
| `node scripts/check-bapal-regression.js` | 8/8 checks |
| `node scripts/check-logic-regressions.js` | 6/6 checks |
| `node scripts/check-s5-closure.js` | 4/4 checks |
| `node scripts/check-bapal-valuation-class.js` | insertion-order invariant + 10 distinct exact-set cases |
| `node scripts/check-report-links.js` | 5/5 links |
| `git diff --check` | no output |

The random report generator and `scripts/check-all.js` were not run.

## 15. Prior-repair integrity

The sole Round 6 production semantic representation diff is:

```diff
-    return Object.keys(assignment).sort().join(',');
+    return JSON.stringify(Object.keys(assignment).sort());
```

This is an injective structural identity for the accepted finite arrays of exact atom strings, while remaining insertion-order invariant. It does not normalize, truncate, or reinterpret atom strings and does not use compact model serialization.

No other `_truth` operator clause changed. Round 6 has no diff for:

- formula parser/configuration;
- Round 2 ASCII printer behavior;
- `Model.deepCopy()` and restriction mechanics;
- ordinary modal, knowledge, or PAL clauses;
- S5 policy or UI editing;
- raw-label rendering;
- transactional compact import;
- semantic inspector;
- `js/schema-v1.js`;
- either Schema v1 artifact;
- report generator; or
- tracked reports.

Integrity before and after all audit commands:

| Gate | Before | After |
|---|---|---|
| HEAD | `e9b8bd37a380c74375c7cd161711f76e605bf483` | same |
| Tree | `e95e3780417e9afe6566cc09287160e52ed786cc` | same |
| Worktree | clean | clean |
| All tracked-file aggregate SHA-256 | `7ca2e03e111c28f423df9df29a3a32e78ca109d7ac24aecd243cf66dff7b5b24` | same |
| Tracked-reports aggregate SHA-256 | `90f156009535d9ea07951b2822a6462353abe42a8e3d66522461469d8752379f` | same |
| Random report SHA-256 | `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` | same |

Previously closed repairs remain intact.

## 16. Documentation and implementation-log audit

### 16.1 Revision 08 accuracy

`revision/08_ROUND_5_CLOSURE_AND_ROUND_6_ORACLE_CI_IMPLEMENTATION_LOG.md` is materially accurate about:

- the exact five-commit history and complete candidate;
- Audit 10 and Round 5 closure;
- architecture and independence boundaries;
- seeds, exact budgets, profile bounds, and coverage;
- the initial `core-073` failure and scoped repair;
- local zero-mismatch results;
- the three candidate success runs and their jobs/artifacts;
- the one-line production repair;
- protected-source scope; and
- nonclaims/open findings.

All 21 path/hash rows in its artifact tables independently match the final repository bytes. Its recorded local manifest hashes are run-specific and the referenced temporary files are not checked in, so those two exact historical manifest byte hashes cannot be regenerated from timestamps alone. This is not a contradiction: current local manifests and downloaded remote manifests independently validate the same counts, source hashes, HEAD/tree identities, and zero-mismatch claims.

The final log-only push run `31281388941` necessarily occurred after Revision 08 was prepared. Its omission from that earlier log is not a false historical claim, but current normative status documents must no longer call remote revalidation pending.

### 16.2 Finding R6-A11-01

| Path | Current false/stale statement | Required repair |
|---|---|---|
| `docs/SCHEMA_V1.md` | Round 5 remains pending Work Max closure | State that Audits 09–10 closed Round 5; preserve P1-06/P1-07/Stage 0 limits |
| `docs/BAPAL_PLAYGROUND_SPEC.md` | Schema v1 is “pending closure audit” in two later status blocks | Align those blocks with the already-correct Round 5 delta: closed by Audit 10 |
| `docs/BAPAL_PLAYGROUND_SPEC.md` | P1-07 says the independent oracle/corpus is not yet checked in | State that Round 6 is implemented and remotely revalidated but remains pending this documentary closure recheck |
| `AGENTS.md` | Round 6 repair/remote FAST revalidation remains pending | Record candidate and final-HEAD remote successes; keep P1-07 open pending recheck |
| `docs/CONFORMANCE.md` | Four places say remote FAST revalidation remains pending | Record actual candidate FAST/FULL and final-HEAD FAST evidence; retain bounded-evidence language |
| `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` | Round 6/P1-07 repeatedly says remote revalidation pending | Record remote success, leave only Work Max documentary closure pending, and keep P1-06/Stage 0 open |

The repair must be documentary only. It must not change:

- `js/MPL.js`;
- either oracle implementation role;
- corpus expectations, especially `core-073`;
- profile seeds, counts, or bounds;
- comparator/reducer behavior;
- workflow behavior;
- Schema v1 runtime/artifacts; or
- any prior repair.

After repair, rerun the deterministic suite or at minimum the documentation/CI/profile guards plus inherited non-writing checks, verify a clean worktree, index this audit accurately, and obtain a focused read-only recheck.

## 17. Exact closure disposition

### Substantive components accepted

The evidence supports the checked-in bounded system under the exact reviewed contract:

- independent Python oracle;
- explicit 73-case manually expected core;
- deterministic FAST 50,000 and FULL 500,000 profiles;
- production-vs-oracle comparator;
- deliberate mismatch sensitivity;
- original/reduced replayable mismatch artifacts;
- deterministic non-globally-minimal reducer;
- profile and runtime source provenance;
- stale-profile rejection;
- read-only CI gate;
- actual remote FAST/FULL execution; and
- scoped exact-atom valuation-class identity repair.

### Not closed in this audit

- R6-A11-01 remains open.
- P1-07 remains open.
- Round 6 remains open.
- P1-06 remains open.
- Stage 0 remains open.
- Round 7 is not authorized.

## 18. Remaining limitations

- Conformance evidence is finite and bounded, not a proof.
- Legacy compact model/share serialization retains its audited identifier limits.
- Formula Schema v1 knowledge remains character-wise.
- Raw/browser formula grammars remain distinct.
- BAPAL class-subset enumeration remains exponential in the number of valuation classes.
- P1-06 result/report terminology remains for Round 7 after Round 6 closure.

## 19. Next action

Apply only the R6-A11-01 documentary synchronization above and request a focused read-only closure recheck. If the repaired documents accurately record Audit 10, the completed remote evidence, the bounded nonclaims, and the still-open P1-06/Stage 0 boundaries—without source or test regressions—the recheck may close P1-07 and authorize Round 7.
