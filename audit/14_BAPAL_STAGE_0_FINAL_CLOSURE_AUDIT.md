# BAPAL Playground Stage 0 Final Closure Audit

**Audit mode:** comprehensive, global, read-only final closure audit  
**Repository:** `https://github.com/Raycaesar/bapal.git`  
**Branch:** `bapal-core`  
**Audit date:** 2026-08-09 UTC  
**Fresh audit runtime:** Node `v24.14.0`; Python `3.12.13`  
**Repository edits:** none

## 1. Final verdict

**PASS — STAGE 0 CLOSED; STAGE 1 MAY BEGIN UNDER A SEPARATELY AUDITED PLAN**

The closure attaches to the exact Round 8 semantic/administrative candidate
`5973d147aefdee0e3cfda817da8d49a21e7eee63` (tree
`d391ffb6624dd15e5c0b2e0d00a1677bbe256853`) and to the audited final log-only
branch HEAD `67cd668db7c5aaf4b91dec378728616469cd6c85` (tree
`9528d60670081f4f11a10b17d8d421e8be4b3a3a`). The latter differs from the
candidate only by
`revision/11_ROUND_7_CLOSURE_AND_ROUND_8_STAGE_0_FINAL_CLOSURE_PREPARATION_LOG.md`.

All identified Stage 0 P0/P1 defects have valid individual closure chains, all
Rounds 1–7 are closed, the final cross-round acceptance criteria are satisfied,
and Round 8 contains no semantic feature or Stage 1 implementation. The known
P2/P3, compatibility, evidence-bound, and performance limitations remain
documented; this audit does not represent them as solved.

## 2. Hard gate, identities, and commit boundary

The hard gate passed. The current repository contains
`audit/13_BAPAL_ROUND_7_TERMINOLOGY_CLOSURE_AUDIT.md`, and its final verdict is
exactly:

> PASS — P1-06 CLOSED; ROUND 7 CLOSED; PROCEED TO ROUND 8 STAGE 0 FINAL CLOSURE AUDIT

The certified pre-Round-8 identities were all found in one linear history:

| Role | Commit/tree | Result |
|---|---|---|
| Foundational baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` | Present and ancestor of HEAD |
| Complete Round 6 candidate | `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` | Present and ancestor of HEAD |
| Complete Round 7 candidate | `91239f7340a330f4dc3c2b1d5546bcc3b666dc58` | Present and ancestor of HEAD |
| Audit 13 reviewed log-only HEAD | `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0` | Present; tree `3296340fc9ef76704d79130126d25428cb5bdcc1` |
| Round 8 closure-preparation candidate | `5973d147aefdee0e3cfda817da8d49a21e7eee63` | Tree `d391ffb6624dd15e5c0b2e0d00a1677bbe256853` |
| Final branch HEAD | `67cd668db7c5aaf4b91dec378728616469cd6c85` | Tree `9528d60670081f4f11a10b17d8d421e8be4b3a3a`; equals remote branch HEAD |

There are exactly two commits after `8d0e64c`:

| Order | Commit | Parent | Subject | Tree | Scope |
|---:|---|---|---|---|---|
| 1 | `5973d147aefdee0e3cfda817da8d49a21e7eee63` | `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0` | `close round 7 and prepare stage 0 final closure` | `d391ffb6624dd15e5c0b2e0d00a1677bbe256853` | Five documentary/administrative paths only |
| 2 | `67cd668db7c5aaf4b91dec378728616469cd6c85` | `5973d147aefdee0e3cfda817da8d49a21e7eee63` | `add stage 0 final closure preparation log` | `9528d60670081f4f11a10b17d8d421e8be4b3a3a` | Adds only `revision/11_..._LOG.md` |

The first range contains 496 insertions and 18 deletions across only
`AGENTS.md`, `audit/00_AUDIT_INDEX.md`, the byte-preserved Audit 13 report,
`docs/BAPAL_PLAYGROUND_SPEC.md`, and the repair register. It changes no
production JavaScript, schema, oracle, corpus, profile, workflow, permanent
test, or tracked report. No Stage 1 typed core, replacement frontend, backend,
solver, migration, or other Stage 1 implementation is present.

## 3. Independent P0/P1 closure ledger

This ledger was reconstructed from the immutable audit sequence, commit diffs,
protected-path history, minimized counterexamples, and current regressions. The
current repair register was checked against, but was not used as the sole
closure source.

| ID | Original defect | Implementation and focused repair | Closing Work Max audit and exact scoped verdict | Current protected source and permanent evidence | Later modification and re-establishment |
|---|---|---|---|---|---|
| P0-01 | PAL/BAPAL updates copied through the lossy compact string format, so null slots, multi-character atoms, multi-digit targets, and labels could be corrupted or cause wrong results/exceptions. | Structural `deepCopy` at `55f557c210a6a6ad78c928bb1b94b2010929d2a2`. | Audit 04: `PASS SUBJECT TO TWO LOCAL DOCUMENTARY REPAIRS` and technical P0-01 closure. Audit 05: `PASS`, clearing the two documentary findings and recording unconditional administrative closure. | `js/MPL.js` structural `Model.deepCopy`; `scripts/check-structural-copy-regressions.js`; PAL/BAPAL logic regressions. | `js/MPL.js` was later touched for printer, S5/model, import, schema, and valuation-class work, but the structural-copy implementation and its test remained protected. The current 11-case suite and fresh sparse/world-10/PAL/BAPAL probe pass. |
| P1-01 | `Wff.ascii()` could print a supported AST into text that the raw parser could not reparse; `[(K{a}p)]q` became `[K{a}p]q`. | Protective PAL-precondition printer rule at `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`; final Round 2 log-only HEAD `f7c7d599afca5622c227ea51d930dfd14005b016`. | Audit 05: `PASS`; P1-01 closed at `e0c816f`. | `js/MPL.js` `_announcementPreconditionNeedsParentheses` / `_jsonToASCII`; `scripts/check-formula-roundtrip.js`. | Later `js/MPL.js` changes did not alter the protective rule. The current 108,246-round-trip corpus and a fresh exact `[(K{a}p)]q` parse/print/reparse AST probe pass. Raw/browser grammar unification is not claimed. |
| P1-02 | S5 editing could lose reflexivity/equivalence, particularly when a new world was added while another agent was selected. | Complete policy/app integration at `6bd33697491820db3d0999ac7c7ccf99b05291d5`. | Audit 06: `PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR`; the report explicitly closes P1-02 at `6bd3369` while leaving only P1-03 rendering open. | `js/s5-policy.js`, the world-creation path in `js/app.js`, and `MPL.Model` relation methods; `check-s5-closure.js` and `check-s5-invariants.js`. | `js/app.js` was later changed for raw-label rendering and Round 4 import/visibility; `s5-policy.js` remained frozen. All 12 current invariant groups, 531 exhaustive directed relations, and 10,000 generated event sequences pass. |
| P1-03 | Enabling S5 lacked a complete truthful normalization/rendering contract for every relevant stored label; Audit 06 found a normalized raw `x` relation with no visible usable stroke/marker. | Semantic policy at `6bd3369`; focused generic raw-label rendering repair at `3f27ac2d4476ecc23da0358f23f2ced87db5500d`. | Audit 07: `PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4`. | `js/app.js` S5 toggle/synchronization/rendering, `js/s5-policy.js`, `js/MPL.js`; S5 closure/invariant and five-group agent-rendering checks. | `js/app.js` later changed for import/visibility. Current policy, rendering, visibility, hidden-loop, and fresh raw-`x` direction/identity projections pass and re-establish the contract. |
| P1-04 | Compact import mutated the current model incrementally, allowing a valid prefix of malformed input to replace part of the previous model. | Transactional parse/validate/commit boundary at `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`; log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66`. | Audit 08: `PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5`. | `js/MPL.js` `parseModelString` / `loadFromModelString`; `js/app.js` startup/share-load boundary; `check-atomic-model-import.js`. | Later `js/MPL.js` work added Schema v1 support and the valuation identity fix without changing the compact transaction. Current evidence includes 9 minimized malformed cases, 16 historical-valid cases, 100,000 deterministic candidates with 50,000 exact rollbacks, 3 browser cases, and a fresh malformed-startup rollback. |
| P1-05 | Browser display could hide semantically active atoms, raw labels, null slots, and stored loops or permit the graph projection to misrepresent the semantic model. | Semantic-state inspector, browser atom boundary, and projection synchronization at `5c89ab5`. | Audit 08: same exact unconditional verdict as P1-04. | `js/app.js` `SemanticState`, model-to-D3 paths, `index.html`, `css/app.css`; 11 visibility groups plus rendering tests. | Round 7 later changed public/help documentation in `index.html`, not the semantic inspector. Current tests and a fresh snapshot show `foo`, hidden `q/t`, raw `x`, null index 1, hidden loop count, exact non-loop direction, and display-row non-mutation. |
| P1-06 | The sampled single-model report mislabeled some-world truth as satisfiability and every-world truth as global truth, inviting invalid satisfiability/validity claims. | Primary terminology rewrite `3326013b5af61ae1dd4d6203e80b5421d89f0e54`; complete candidate `91239f7340a330f4dc3c2b1d5546bcc3b666dc58`; final log-only HEAD `8d0e64c`. | Audit 13: `PASS — P1-06 CLOSED; ROUND 7 CLOSED; PROCEED TO ROUND 8 STAGE 0 FINAL CLOSURE AUDIT`. | `scripts/random-bapal-evaluation.js`, `check-report-terminology.js`, `check-report-links.js`, tracked HTML report, and synchronized public/API/verification documents. | Round 8 did not change the generator, terminology check, or report. Current checks and fresh some/all/none HTML/console rendering reproduce only the three model-local fields and nonclaim language. |
| P1-07 | Verification lacked a checked-in independent semantic oracle, hand-auditable core, exact deterministic profiles, mismatch sensitivity/replay, provenance artifacts, and a CI gate. | Complete executable candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`; documentary repair `2ea0e0f63f42976644d35e910b2079c3f58b58ac`. | Audit 11 historical verdict: `PASS SUBJECT TO LOCAL REPAIRS`, with no executable blocker. Audit 12: `PASS — P1-07 CLOSED; ROUND 6 CLOSED; PROCEED TO ROUND 7`. | `oracle/`, `conformance/v1/`, four Python checks, CI contract check, and `.github/workflows/bapal-conformance.yml`. | No later round changed oracle, comparator, core corpus, profiles, or workflow. Fresh core/sensitivity/FAST/FULL/CI runs, 20-case third checking, 12 mutation kills, and exact-candidate/final-HEAD Actions artifacts re-establish the bounded contract. |

Every identified P0/P1 has an unconditional closure chain. The historical
conditional package verdicts remain conditional in the archive; later focused
rechecks supply closure rather than rewriting history.

## 4. Round-by-round closure reconstruction

| Round | Implementation candidate and final log | Conditional finding / focused repair | Unconditional closure | Later regression evidence |
|---|---|---|---|---|
| 1 | `55f557c210a6a6ad78c928bb1b94b2010929d2a2`; its register/spec documentary corrections landed with the next-round commit `e0c816f`. | Audit 04 required two local documentary repairs but technically closed structural copy. | Audit 05 cleared both documentary findings and preserved P0-01 closure. | Structural-copy suite and every later full freeze; fresh sparse/multi-character/world-10/raw-label probe. |
| 2 | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`; final log `f7c7d599afca5622c227ea51d930dfd14005b016`. | None after implementation. | Audit 05 `PASS`. | 108,246 current round trips plus schema/conformance formula paths. |
| 3 | Primary `172a204e3520ec4939efe30a5031bb23c6e29bf4`; complete `6bd33697491820db3d0999ac7c7ccf99b05291d5`; logs `edfafc977f95106fa5455fdcd34a41e27acb4c42` and `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`. | Audit 06 closed P1-02 but exposed raw-label UI defect P1-03; repair `3f27ac2d4476ecc23da0358f23f2ced87db5500d`. | Audit 07 closed P1-03 and Round 3. | Current S5 closure/invariants/rendering/visibility matrix and independent policy probe. |
| 4 | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`; final log `ab26863374464dd1466286a6c31d19d8e1a39a66`. | None. | Audit 08 closed P1-04, P1-05, and Round 4. | Current 100,000-case import and 11-group visibility suites; later browser/schema/oracle tests. |
| 5 | Primary `5a39a51f3069dde69194a11685e0445b7e98bf6d`; complete `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`; initial log `ab10f64234a4d397582eab9ba68b434fea02ec26`. | Audit 09 passed runtime codecs but found stale JSON Schema `$id` values; repair `edfbf32d07507bd43143bd518dbe3e2316a65979`; repair log `8451a1e289eb8e6efa19887e35955d3d8772c8d8`. | Audit 10 closed the canonical-ID finding and Round 5. | Current 100,000 Formula and 100,000 Model Schema runs; core/FAST/FULL all use Schema v1. |
| 6 | Primary `e0e17c09d6f9ac30399a06c5da85615b312b4b55`; README `cfcd80cd50731f7cc5cfe8b45e555060df2b3d93`; workflow repair `e4f8a3573091c70e8bcd42b13c991aa7e1d12f5b`; complete exact-identity candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`; log `e9b8bd37a380c74375c7cd161711f76e605bf483`. | Audit 11 found only documentary status drift R6-A11-01; repair `2ea0e0f63f42976644d35e910b2079c3f58b58ac`. | Audit 12 closed the finding, P1-07, and Round 6. | Current local 73/50k/500k evidence and prior candidate/final Actions evidence; valuation collision remains in core-073. |
| 7 | Primary `3326013b5af61ae1dd4d6203e80b5421d89f0e54`; complete `91239f7340a330f4dc3c2b1d5546bcc3b666dc58`; log `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0`. | None. | Audit 13 closed P1-06 and Round 7. | Candidate push FAST run `31286878702`, log-head push FAST `31288293718`, permanent terminology check, current exact some/all/none probe. |
| 8 | Closure-preparation candidate `5973d147aefdee0e3cfda817da8d49a21e7eee63`; final log-only HEAD `67cd668db7c5aaf4b91dec378728616469cd6c85`. | None; no semantic implementation is present. | This Audit 14. | Exact-candidate push FAST and dispatch FAST/FULL, plus final-HEAD push FAST; full fresh local freeze. |

Round 8 introduces no unauthorized semantic feature. It archives Audit 13,
synchronizes current status, records evidence, and adds the final preparation
log only.

## 5. Original Stage 0 correctness-first objectives

The intended objectives were independently recovered from Audits 01–03 and the
current specification, then checked against source and behavior.

| Objective | Result and current basis |
|---|---|
| 1. Semantic copy integrity | Satisfied: structural, sparse, exact-key/label/index-preserving fresh copies drive PAL/BAPAL. |
| 2. Parser/printer closure | Satisfied for the certified supported legacy AST/raw-parser contract; 108,246 current round trips. No raw/browser grammar-unification claim. |
| 3. S5 invariant enforcement | Satisfied: deterministic relevant agents, confirmation, least closure, no-op/cancel, new loops, class merge, deletion, and guarded edits. |
| 4. Raw/stored relation-label visibility | Satisfied: exact labels, direction, identity, generic markers/strokes, and stored hidden loops are disclosed. |
| 5. Transactional legacy import | Satisfied for the documented compact compatibility grammar; failure retains the complete previous state. |
| 6. Semantic-state visibility | Satisfied: exact atoms, relations, null slots, loops, and projection differences are disclosed; unsupported browser atoms fail before mutation. |
| 7. Stable versioned semantic interchange | Satisfied under the exact Model/Formula Schema v1 contracts and canonical resource identities. |
| 8. Independent semantic oracle | Satisfied: pure Python semantic implementation has no Node/production import or runtime file/process bridge. |
| 9. Hand-auditable conformance core | Satisfied: 73 explicit JSONL cases across 11 recorded categories with reviewed Boolean expectations. |
| 10. Deterministic FAST/FULL comparison | Satisfied: fixed seeds, exact counts, manifest bounds, and zero mismatches locally and remotely. |
| 11. Deliberate mismatch sensitivity | Satisfied: the permanent copied-result flip is detected, minimized, replayed, and cleaned. |
| 12. Provenance and mismatch artifacts | Satisfied: manifests bind SHA/tree, versions, bounds, counts, coverage, runtime, and source hashes; failure/sensitivity artifacts are validated and replayable. |
| 13. CI gating | Satisfied: exact trigger/job/permission/timeout/clean-tree/manifest/upload contract passes; report generation is absent. |
| 14. Sampled-model terminology | Satisfied: `truthAtWorld`, `trueSomewhereInModel`, and `trueAtEveryWorldInModel` only. |
| 15. Public/API/verification accuracy | Satisfied: current README, help, API, verification, specification, schema, conformance, and terminology documents state the exact bounded finite-model contract. |
| 16. Non-writing deterministic validation | Satisfied: individual checks and aggregate leave HEAD/tree/reports/all tracked hashes unchanged. |
| 17. Preservation of known limitations | Satisfied: grammar, identifier, frame, performance, bounded-evidence, and solver nonclaims remain explicit. |

## 6. Structural copy and parser/printer probes

A fresh external JavaScript probe used production APIs but no checked-in test
assertions. It built 12 indexed worlds, removed world 5, stored
`foo`, `bar_baz`, `a,b`, target world 10, a self-loop, and exact labels `x` and
`raw/relation`. The structural copy was identical, preserved the null slot and
target 10, and remained independent after assignment and world mutations.
PAL and BAPAL truth agreed between source and copy.

The minimized parser case printed exactly `[(K{a}p)]q`; reparsing produced the
same JSON AST. Together with the 108,246 permanent round trips, this confirms
that P0-01 and P1-01 remain closed under their exact contracts.

## 7. S5 invariants, rendering, import, and visibility

Fresh policy-level and browser-boundary probes independently confirmed:

- the relevant-agent set is the sorted union of declared, active, and selected
  labels;
- cancellation prompts once and leaves the semantic snapshot byte-identical;
- accepted enablement computes equivalence closure, while already-S5
  enablement neither prompts nor mutates;
- a new world receives stored loops for every relevant label;
- relation insertion merges only the affected class, removal preserves the
  remaining equivalence relations, and individual S5 edge edits are blocked;
- hidden `x` loops remain semantic, while a non-loop `x` projection retains
  rightward direction and exact identity;
- malformed `ApS;BROKEN;AqS` produces a structured error and retains the full
  prior browser model without a URL rewrite;
- historical valid `ApS1x,;AqS0x,` remains accepted;
- the browser atom boundary rejects `x` as an atom but preserves `x` as a
  relation label;
- raw semantic `foo`, hidden supported `q/t`, null index 1, stored loops, and
  visual/semantic projection equality are disclosed; and
- changing displayed atom-row count changes no valuation or BAPAL result.

P1-02 through P1-05 remain closed.

## 8. Schema v1 and valuation-class identity

The exact current canonical schema resource identities are:

- Model: `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json`
- Formula: `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json`

Fresh tests and source review verified stable world indices and nulls; exact
Unicode/model atom and relation strings; explicit unknown-version rejection;
deterministic canonical output; fresh ownership between inputs, canonical
documents, and decodes; stable Formula v1 AST mapping; no compact-model or
ASCII-formula transport; and the character-wise Formula v1 knowledge boundary
(`['a','b']` accepted, `['ab']` rejected). The permanent Model run compared
truth 3,454 times and the Formula run 724 times, in addition to the independent
core and generated conformance comparisons. No semantics beyond this exact v1
contract is certified.

The current BAPAL identity is the collision-free structural key
`JSON.stringify(Object.keys(assignment).sort())`. A fresh probe and permanent
regression confirm that complete valuation sets `['a','b']` and `['a,b']` are
distinct, while `['a','b']` and the same keys inserted as `['b','a']` are one
class. The authored `core-073` expectation remains unchanged and passes.

## 9. Independent oracle and third semantic checker

Static and behavioral review reconfirmed that `oracle/bapal_oracle.py`:

- does not execute Node;
- does not import production JavaScript, the production parser, `MPL.truth`, or
  Schema v1 production code;
- has no runtime file or process I/O; and
- derives expected values only from its own immutable Python structures and
  semantic clauses.

`oracle/production_runner.js` loads production `MPL.js` and Schema v1, performs
one production `MPL.truth` call per request, and returns actual values and
canonical values only. It contains no expected-result table, core-corpus read,
Python bridge, or duplicate evaluator.

A new external third evaluator independently implemented exact finite-domain
Boolean, ordinary modal, label-filtered K, PAL restriction/vacuity, and BAPAL
valuation-class-union clauses. It agreed with hand expectations, the checked-in
Python oracle, and production on 20 selected cases covering Boolean,
modal-label, K, non-S5, S5, PAL, BAPAL, sparse/null, identifier-preservation,
and the delimiter-collision case.

## 10. Core, sensitivity, FAST, FULL, and CI

Every required Python command exited successfully in a clean checkout with
`PYTHONDONTWRITEBYTECODE=1`; runtime artifacts were directed outside the
repository.

| Command | Fresh result |
|---|---|
| `python3 scripts/check-independent-oracle.py` | 73/73 explicit core cases; category coverage: BAPAL valuation 14, Boolean 10, identifier 6, knowledge 7, modal labels 2, modal vacuity 4, non-S5 7, PAL 10, raw labels 2, S5 5, sparse/null 6; independence guards pass |
| `python3 scripts/check-oracle-sensitivity.py` | Seed `0xBAD0C0DE`; 24 normal comparisons, 0 real mismatches; flipped index 9, 1 deliberate mismatch; 31 reduction steps; artifact created, validated, replayed, and cleaned |
| `python3 scripts/check-oracle-conformance.py --profile fast` | Seed `0x6F524143`; exactly 50,000/50,000; 0 mismatches; `24.812803` seconds |
| `python3 scripts/check-oracle-conformance.py --profile full` | Seed `0xC0DEC0DE`; exactly 500,000/500,000; 0 mismatches; `288.670970` seconds |
| `python3 scripts/check-conformance-ci.py` | All trigger, job, runtime, exact-command, artifact-directory, manifest, clean-tree, permission, upload, YAML, and no-report-generation checks pass |

Fresh manifest coverage was:

| Field | FAST | FULL |
|---|---:|---:|
| Models / formulas / live pointed worlds | 64 / 256 / 167 | 128 / 1,024 / 364 |
| S5 / non-S5 comparisons | 25,000 / 25,000 | 250,000 / 250,000 |
| Sparse/null comparisons | 16,406 | 164,062 |
| Knowledge-shorthand comparisons | 12,308 | 142,173 |
| PAL comparisons | 24,025 | 232,418 |
| BAPAL comparisons | 27,742 | 295,446 |
| Nested-BAPAL comparisons | 0 | 78,600 |
| Observed max live worlds / classes / BAPAL nesting | 4 / 3 / 1 | 5 / 4 / 2 |
| Multi-character / multiple-label / sparse models | 64 / 63 / 21 | 128 / 127 / 42 |

The manifests bind the audited SHA/tree and these exact source hashes:

| Source | SHA-256 |
|---|---|
| `oracle/bapal_oracle.py` | `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226` |
| `oracle/production_runner.js` | `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d` |
| `oracle/conformance.py` | `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160` |
| `conformance/v1/core-corpus.jsonl` | `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a` |
| FAST / FULL profiles | `9f4f8e136e5072c73be1b59e66f2360a28c567522a0c4df1da6277fd9bd55508` / `4e48e21e3d85ba4c7abf5945cc802cb45813552cff768a0aa00dab67982f064b` |
| `js/MPL.js` | `63b09ca498964c9b544874fcc844932d255411b8fd49adbf89db0b29479c78e5` |
| `js/schema-v1.js` | `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76` |
| Model / Formula JSON Schemas | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` / `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |

These fixed finite comparisons are strong deterministic regression evidence;
they are not a formal proof.

## 11. Independent mutation sensitivity

All mutations were applied only to in-memory source copies outside the
checkout. Normal production/oracle values first matched the authored core
expectations. The following representative production defects were then
detected:

| Mutant | Killing case | Mutant outcome versus expected |
|---|---|---|
| Inverted atom | `core-001-atom-true` | `false` versus `true` |
| Broken conjunction (`&&` to `||`) | `core-005-and` | `true` versus `false` |
| K ignores relation labels | `core-018-wrong-agent-exclusion` | `false` versus `true` |
| PAL false precondition returns false | `core-036-pal-vacuity` | `false` versus `true` |
| BAPAL allows domains omitting pointed class | `core-047-bapal-same-valuation-k` | `true` versus `false` |
| Delimiter-based BAPAL valuation identity | `core-073-bapal-delimiter-collision-exact-atoms` | `false` versus `true` |

The same six representative clauses were independently mutated on the Python
oracle side. All six were detected; five produced the opposite Boolean and the
pointed-class mutant produced an explicit removed-point error. Result: 6/6
production mutations and 6/6 oracle mutations killed. No tracked source was
changed.

## 12. Report terminology and documentation correctness

A fresh three-world model used formulas with these exact result vectors:

| Shape | `truthAtWorld` | `trueSomewhereInModel` | `trueAtEveryWorldInModel` |
|---|---|---:|---:|
| True at some but not all live worlds | `[true,false,false]` | `true` | `false` |
| True at every live world | `[true,true,true]` | `true` | `true` |
| False at every live world | `[false,false,false]` | `false` | `false` |

Rendered HTML and console output used only the exact model-local labels. They
contained no active satisfiable, globally-true, unsatisfiable, or validity
classification. The explicit disclaimer correctly says that model-local
some/every/none results are not satisfiability/validity/unsatisfiability
results. P1-06 remains closed.

The current README, index help, API reference, verification document, Stage 0
specification, Schema v1 guide, conformance guide, and result-terminology
contract consistently distinguish:

- pointed finite-model truth `M,w ⊨ φ`;
- some-world and all-live-world truth within one explicit model;
- satisfiability and validity across models, neither of which the application
  decides;
- ordinary all-stored-edge `□`/diamond from character-wise knowledge K;
- PAL `[A]B` from existential BAPAL `^A`;
- the implemented existential BAPAL operator from a literature universal BAPAL
  operator, for which this application has no separate syntax;
- the formal S5 epistemic target from robustness/model-checking evaluation over
  arbitrary stored relations; and
- browser/raw/Schema/legacy identifier and grammar boundaries.

The finite valuation-class definability explanation uses a finite separator:
for each pair of actually occurring distinct classes it chooses a differing
atom, builds a finite conjunction separating one class from the finitely many
others, and finitely disjoins selected classes. It does not rely on an infinite
complete-valuation conjunction.

## 13. Full permanent Node regression matrix

Every current deterministic non-writing Node check requested by the audit was
run individually, followed by the aggregate.

| Command | Exact current count/result |
|---|---|
| `node scripts/check-report-terminology.js` | 4 pass groups; exact fields/classifications/rendered wording/tracked-report non-write |
| `node scripts/check-report-links.js` | 5 links |
| `node scripts/check-agent-rendering.js` | 5 rendering groups |
| `node scripts/check-atomic-model-import.js` | 9 malformed, 16 valid, empty contract, seed `0x041c0a11`, 100,000 candidates (50,000 accepted / 50,000 rejected), 3 browser cases |
| `node scripts/check-bapal-regression.js` | 8 checks |
| `node scripts/check-bapal-valuation-class.js` | 1 insertion-order and 10 distinct-exact-set cases |
| `node scripts/check-formula-roundtrip.js` | 1 minimized, 10 safe, 25 difficult, 8,210 exhaustive ASTs, 100,000 generated at seed `0x00bada55`, 108,246 total, 3 display cases |
| `node scripts/check-formula-schema-v1.js` | Seed `0x0f05ca1a`; 100,000 generated; 10 groups; 8,210 exhaustive; 16 invalid; 724 truth comparisons; all 11 constructors covered |
| `node scripts/check-logic-regressions.js` | 6 checks |
| `node scripts/check-model-schema-v1.js` | Seed `0x5c4e4d41`; 100,000 models; 84,099 sparse; 300,172 null slots; 45,455 multi-digit; 91,825 Unicode; 9 groups; 15 adversarial IDs; 27 invalid; 3,454 truth comparisons |
| `node scripts/check-s5-closure.js` | 4 checks |
| `node scripts/check-s5-invariants.js` | 12 groups; 531 exhaustive relations / 2,337 edges; seed `0x0055f503`; 10,000 sequences / 200,000 operations (97,793 accepted / 102,207 rejected) |
| `node scripts/check-semantic-state-visibility.js` | 11 groups |
| `node scripts/check-structural-copy-regressions.js` | 11 regressions |
| `node scripts/check-all.js` | All current aggregate members pass |

The tracked report SHA-256 stayed
`97250cf6a1ff8513632f7a0c208f7b7b8a4cda12d621545058eb4a427babcd87`.
No command regenerated it.

## 14. Audit/archive integrity

Current SHA-256 values exactly match the preparation log's recorded values:

| Audit | SHA-256 |
|---:|---|
| 01 | `fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8` |
| 02 | `875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd` |
| 03 | `b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1` |
| 04 | `be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087` |
| 05 | `15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709` |
| 06 | `8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2` |
| 07 | `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2` |
| 08 | `9e2354770e611252e33bb1b1226ef778d1c0c41a79a17e86ad748bcf431a864f` |
| 09 | `26a630d610f38be1b48caf81c6b51dfbe29e0d63bd5cb82b4dcd9d84e05bfd88` |
| 10 | `dec0245151b2c303a964cae985399ba10b627822e5a0949a80711c923de5eaf2` |
| 11 | `18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a` |
| 12 | `112a0a4de292b06841bf541ad0a47243470dc2cba0dab062119d51db34285dcc` |
| 13 | `c2f7b7e8ec2a966d2c2ca59569e267150c545542e739ab49ba8d6429f713dabc` |

The conditional Audits 04, 06, 09, and 11 remain historically conditional;
the focused follow-ups remain separate. No historical report was rewritten to
make the sequence appear cleaner.

## 15. Round 8 diff and current-status consistency

The exact `8d0e64c..5973d147` delta is documentary/administrative only. The
exact `5973d147..67cd668` delta is only the 447-line Revision 11 preparation
log. No executable semantics changed during Round 8, so no unaudited repair is
being smuggled into closure.

Current normative documents consistently say, before this Audit 14 decision,
that all identified P0/P1 items were individually closed, Rounds 1–7 were
closed, Stage 0 remained pending this final audit, and Stage 1 had not started.
Historical logs correctly retain their historical pending/open states.

The final preparation log was checked line by line against commits, trees,
diffs, audit verdicts, permanent-test output, protected hashes, report hashes,
remote runs/artifacts, changed files, and limitations. Its historical local
runtimes describe its recorded machine; this fresh audit's different runtimes
describe the current machine. No materially incorrect claim was found. The log
also correctly anticipates a later log-only commit and does not claim that its
own preparation verdict closes Stage 0.

## 16. Surviving P2/P3 findings and limitations

All foundational P2/P3 findings were retained in the reconstruction, including
those later mitigated or subsumed.

| ID | Current disposition | Stage 0 acceptance effect |
|---|---|---|
| P2-01 | Open/deferred: raw and browser-preprocessed grammars differ. | Documented interface boundary; Round 2 certifies printer closure, not grammar unification. |
| P2-02 | Open/partly mitigated: formal, raw, browser, Schema v1, and compact vocabularies remain different. | Truthful boundaries and exact Schema v1 interchange satisfy Stage 0; one universal vocabulary was not promised. |
| P2-03 | Documentary ambiguity repaired; inherited ordinary modal operators still aggregate all stored labels. | Current help/API distinguish ordinary modal operators from BAPAL; semantic redesign is deferred. |
| P2-04 | Open/deferred residual: edge-derived active agents and edge-free K vacuity remain inherited behavior outside the declared browser-agent policy. | Round 3 supplies a deterministic S5 editing agent set; it does not redefine K semantics. |
| P2-05 | Deliberate documented boundary: arbitrary stored frames remain evaluable although formal BAPAL targets S5. | S5 editing is truthful; arbitrary-frame results are not promoted to formal S5 claims. |
| P2-06 | Open performance limitation: BAPAL enumerates valuation-class subsets and copies/restricts models; nesting compounds exponential cost. | No polynomial-time or responsiveness guarantee was a Stage 0 acceptance criterion. |
| P2-07 | Compact/share format remains unversioned and identifier-limited; Schema v1 separately mitigates semantic interchange. | The legacy format is explicitly a compatibility boundary, not certified general interchange. |
| P2-08 | Primary verification deficiency mitigated by core/FAST/FULL and reducer; sampled report remains small and bounded. | The report is no longer treated as an oracle or decision procedure. |
| P2-09 | Open performance/UX limitation: synchronous main-thread evaluation has no worker, cancellation, timeout, progress, or resource bound. | Deferred performance architecture; does not contradict current finite correctness acceptance. |
| P2-10 | Lossy semantic text-copy coupling repaired by P0-01; residual copy/allocation cost remains. | No unresolved semantic-copy defect remains; optimization is deferred. |
| P3-01 | Current title/repository/issues documentation repaired. | No current public-accuracy blocker; future drift is maintenance. |
| P3-02 | Current API coverage repaired. | No current API-accuracy blocker; future drift is maintenance. |
| P3-03 | Open low-severity maintenance: object-based deduplication in `getWffAgentsAndProps` remains ineffective. | Current callers tolerate duplicates; no semantic misresult was demonstrated. |
| P3-04 | Open/partly mitigated: inherited regression overlap and aggregate subset maintenance remain. | Duplicate coverage does not compromise the separately independent oracle evidence. |
| P3-05 | Open/deferred internal MPL/generic naming and mixed-language comment cleanup. | Current normative/public contract is accurate; broad internal renaming is outside closure. |

Additional explicit limitations remain: Formula Schema v1 knowledge is
character-wise; compact identifiers are limited; Schema v1 is not RFC 8785 and
is not exposed as a browser share control; Model v1 does not assert S5; static
JSON Schema cannot alone enforce cross-world liveness; all core/exhaustive-small
and FAST/FULL evidence is bounded; no finite-model property is proved; and the
application supplies no satisfiability solver, validity checker, theorem
prover, or general BAPAL decision procedure. These are documented deferred
limitations, not contradictions of the Stage 0 finite explicit-model target.

## 17. Remote CI evidence

Actual GitHub Actions run/job records and downloaded artifact manifests were
inspected, not inferred from the preparation log.

| Evidence | Run / job | SHA / tree in artifact | Count / mismatches / status | Runtime | Artifact / digest |
|---|---|---|---|---:|---|
| Candidate push FAST | [`31292695906`](https://github.com/Raycaesar/bapal/actions/runs/31292695906) / `93192508312` | `5973d147...` / `d391ffb6...` | 50,000/50,000; 0; pass | 11.070952 s | `9031925111`; `ba022b3c95b45c48ccea2508b8766b3f1b3c4a61beeb33f921b3753f0511554d` |
| Candidate dispatch FAST | [`31292714435`](https://github.com/Raycaesar/bapal/actions/runs/31292714435) / `93192561130` | same exact candidate/tree | 50,000/50,000; 0; pass | 10.908582 s | `9031931814`; `fcc830d92eede2f11d08f8256f7affb3089198eb5ae82a148ea2ee2aea7f1e67` |
| Candidate dispatch FULL | same run / `93192561109` | same exact candidate/tree | 500,000/500,000; 0; pass | 133.379464 s | `9031959188`; `ca761c4be2913d7bfa1b6cc99b5ef8fefa7894170aac6573d61c6ed5c3ffdadc` |
| Final log-only HEAD push FAST | [`31294140174`](https://github.com/Raycaesar/bapal/actions/runs/31294140174) / `93196329901` | `67cd668d...` / `9528d606...` | 50,000/50,000; 0; pass | 10.224517 s | `9032389870`; `98824f2096ffbf32b5b5b5871a0fc38f1002b7dd6da310305a7be10daef87025` |

All artifact manifests report `status: pass`, the fixed profile seeds, exact
counts, zero mismatches, and the same certified semantic source hashes. Each
FAST job passed inherited deterministic non-writing regressions, core,
sensitivity, manifest validation, whitespace, clean-tree, and upload. The FULL
job did the same for FULL. The push runs correctly skipped FULL; the manually
dispatched candidate run supplied both FAST and FULL.

## 18. Clean repository attestation

The target checkout was measured before any audit execution and after the full
Node, Python, independent-probe, mutation, remote-artifact, and document-review
sequence.

| Check | Before | After |
|---|---|---|
| `git status --short` | No output | No output |
| `git diff --check` | No output | No output |
| HEAD | `67cd668db7c5aaf4b91dec378728616469cd6c85` | Same |
| Tree | `9528d60670081f4f11a10b17d8d421e8be4b3a3a` | Same |
| Aggregate of sorted SHA-256 records for all tracked paths | `0646092390e9e8927cefaea27c805ec287379d2257c0573a564065fb6840ab29` | Same |
| Aggregate for all tracked `reports/` paths | `52d69c68c257123a958db897e9fe57726d2a48adafaaef2cc4eb148ae0768ccb` | Same |
| Tracked report | `97250cf6a1ff8513632f7a0c208f7b7b8a4cda12d621545058eb4a427babcd87` | Same |

No runtime manifest, mismatch file, bootstrap file, Python bytecode, temporary
script, or other analysis artifact remained in the repository. The Audit 14
report was produced outside the target checkout, as required.

## 19. Closure effect and authorization boundary

1. Stage 0 is closed at the exact audited Round 8 candidate and final log-only
   HEAD identified in Section 1.
2. All identified Stage 0 P0/P1 defects are individually closed.
3. The final cross-round acceptance criteria are satisfied.
4. Known P2/P3 and compatibility/performance limitations remain documented and
   are not falsely represented as solved.
5. The bounded oracle/conformance evidence is not a formal proof.
6. The application remains an explicit finite-model checker/playground, not a
   satisfiability solver, validity checker, theorem prover, or general BAPAL
   decision procedure.
7. Stage 1 may begin only under a new, separately documented and audited plan.
8. No Stage 1 work was performed in this audit.
