# Round 7 Closure and Round 8 Stage 0 Final Closure-Preparation Log

## 1. Verdict

PASS — READY FOR WORK MAX STAGE 0 FINAL CLOSURE AUDIT

This is a closure-preparation verdict, not a Stage 0 closure verdict. It records
the already-certified individual P0/P1 and Round 1–7 closures, freezes the exact
Round 8 candidate and its bounded evidence, and presents that package for the
independent Audit 14 decision. Stage 1 has not begun.

## 2. Repository identity

| Field | Exact value |
|---|---|
| Repository | `https://github.com/Raycaesar/bapal.git` (`/home/raycaesar/code/bapal-local`) |
| Branch | `bapal-core` |
| Foundational baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` |
| Final Round 7 candidate | `91239f7340a330f4dc3c2b1d5546bcc3b666dc58` |
| Audit 13 final reviewed log-only HEAD | `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0` |
| Round 8 closure-candidate commit | `5973d147aefdee0e3cfda817da8d49a21e7eee63` |
| Round 8 closure-candidate tree | `d391ffb6624dd15e5c0b2e0d00a1677bbe256853` |
| Remote equality | local `HEAD` = `origin/bapal-core` = `5973d147aefdee0e3cfda817da8d49a21e7eee63` |
| Initial clean-tree result | `git status --short` produced no output |
| Node | `v24.18.0` |
| Python | `3.12.3` |
| Candidate commit time | `2026-08-09T11:34:05+08:00` |
| Log preparation time | `2026-08-09T12:09:12+08:00` (`2026-08-09T04:09:12Z`) |

The candidate commit subject is `close round 7 and prepare stage 0 final
closure`. The initial gate found a clean checkout on `bapal-core`, and the
remote-tracking branch resolved to the same exact commit. A later log-only
commit may add this file; that later commit must remain explicitly distinct
from the complete Round 8 closure candidate and must not be represented as a
semantic or product change.

## 3. Audit 13 closure

Audit 13 returned exactly:

> PASS — P1-06 CLOSED; ROUND 7 CLOSED; PROCEED TO ROUND 8 STAGE 0 FINAL CLOSURE AUDIT

Under that audit's exact report-terminology and documentation scope:

- P1-06 is closed;
- Round 7 is closed;
- all identified Stage 0 P0/P1 items are individually closed;
- Stage 0 itself remained open;
- Round 8, the final Stage 0 closure audit, was authorized; and
- Stage 1 remained blocked and was not authorized.

## 4. Stage 0 repair ledger

The following ledger is reconstructed from the primary audit sequence rather
than inferred from the current repair-register labels.

| ID | Defect summary | Implementation / focused repair commit | Closing Work Max evidence | Exact scoped closing disposition | Current permanent regression path |
|---|---|---|---|---|---|
| P0-01 | PAL/BAPAL semantic updates copied through the lossy legacy compact string format, corrupting null slots, multi-character atoms, multi-digit targets, and relation labels. | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` | Audit 04 technical closure, with its two documentary findings unconditionally cleared by Audit 05 | Audit 04: `PASS SUBJECT TO TWO LOCAL DOCUMENTARY REPAIRS`; P0-01 technically closed. Audit 05: `PASS`; documentary and administrative closure complete. | `scripts/check-structural-copy-regressions.js`; PAL/BAPAL coverage in `scripts/check-logic-regressions.js` and `scripts/check-bapal-regression.js` |
| P1-01 | `Wff.ascii()` could emit announcement syntax that the raw parser could not reparse; minimized case `[(K{a}p)]q` became `[K{a}p]q`. | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` | Audit 05 | `PASS`; P1-01 closed at `e0c816f`, with closure preserved at final log-only HEAD `f7c7d599afca5622c227ea51d930dfd14005b016`. | `scripts/check-formula-roundtrip.js` |
| P1-02 | S5 editing could break reflexivity/equivalence invariants, especially when adding worlds or editing active relations. | `6bd33697491820db3d0999ac7c7ccf99b05291d5` | Audit 06 | `PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR`; P1-02 itself is closed at `6bd3369` under the audited editing policy. | `scripts/check-s5-closure.js`; `scripts/check-s5-invariants.js` |
| P1-03 | Enabling S5 did not provide a complete, visibly rendered whole-model normalization contract for every relevant stored relation label. | Semantic/model implementation `6bd33697491820db3d0999ac7c7ccf99b05291d5`; focused raw-label rendering repair `3f27ac2d4476ecc23da0358f23f2ced87db5500d` | Audit 07, following Audit 06's scoped conditional verdict | `PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4` | `scripts/check-s5-closure.js`; `scripts/check-s5-invariants.js`; `scripts/check-agent-rendering.js` |
| P1-04 | Legacy compact import mutated a model incrementally, so malformed suffixes could leave a partial imported prefix. | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` | Audit 08 | `PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5` | `scripts/check-atomic-model-import.js` |
| P1-05 | Semantically active atoms, relation labels, null slots, loops, and projection differences were not completely and truthfully disclosed by the browser. | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` | Audit 08 | `PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5` | `scripts/check-semantic-state-visibility.js`; `scripts/check-agent-rendering.js` |
| P1-06 | A sampled one-model report mislabeled some-world truth as “satisfiable” and every-world truth as “globally true,” inviting invalid satisfiability/validity inferences. | Primary implementation `3326013b5af61ae1dd4d6203e80b5421d89f0e54`; complete Round 7 candidate `91239f7340a330f4dc3c2b1d5546bcc3b666dc58` | Audit 13 | `PASS — P1-06 CLOSED; ROUND 7 CLOSED; PROCEED TO ROUND 8 STAGE 0 FINAL CLOSURE AUDIT` | `scripts/check-report-terminology.js`; non-writing inclusion in `scripts/check-all.js`; `scripts/check-report-links.js` |
| P1-07 | The project lacked an independent checked-in semantic oracle, explicit hand-auditable core corpus, deterministic exact-count conformance profiles, mismatch replay/sensitivity, and a CI gate. | Complete executable candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`; documentary repair `2ea0e0f63f42976644d35e910b2079c3f58b58ac` | Audit 12, following Audit 11's substantive executable pass and documentary condition | `PASS — P1-07 CLOSED; ROUND 6 CLOSED; PROCEED TO ROUND 7` | `scripts/check-independent-oracle.py`; `scripts/check-oracle-sensitivity.py`; `scripts/check-oracle-conformance.py`; `scripts/check-conformance-ci.py`; `conformance/v1/`; `.github/workflows/bapal-conformance.yml` |

Every identified P0/P1 therefore has an individual closing audit chain. The
conditional package verdicts in Audits 04, 06, 09, and 11 remain represented
as conditional; the focused later audits or, for P1-02, the explicit scoped
finding supply the applicable closure rather than retroactively rewriting
those historical verdicts.

## 5. Round closure ledger

| Round | Complete implementation candidate / focused follow-up | Closure audit chain | Current status |
|---|---|---|---|
| Round 1 | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` | Audit 04 technical closure; Audit 05 documentary recheck | CLOSED; P0-01 internal structural-copy contract closed, legacy compact boundary unchanged |
| Round 2 | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`; final log-only HEAD `f7c7d599afca5622c227ea51d930dfd14005b016` | Audit 05 | CLOSED; P1-01 closed |
| Round 3 | `6bd33697491820db3d0999ac7c7ccf99b05291d5`; focused repair `3f27ac2d4476ecc23da0358f23f2ced87db5500d` | Audits 06 and 07 | CLOSED; P1-02 and P1-03 closed |
| Round 4 | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`; final log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66` | Audit 08 | CLOSED; P1-04 and P1-05 closed |
| Round 5 | Complete candidate `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`; canonical-ID repair `edfbf32d07507bd43143bd518dbe3e2316a65979`; documentary final HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8` | Audits 09 and 10 | CLOSED; both Schema v1 codecs and canonical schema-resource identities closed |
| Round 6 | Complete candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`; documentary repair `2ea0e0f63f42976644d35e910b2079c3f58b58ac` | Audits 11 and 12 | CLOSED; P1-07 closed under the bounded conformance contract |
| Round 7 | Complete candidate `91239f7340a330f4dc3c2b1d5546bcc3b666dc58`; Audit 13 reviewed log-only HEAD `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0` | Audit 13 | CLOSED; P1-06 closed |
| Round 8 | Final closure candidate `5973d147aefdee0e3cfda817da8d49a21e7eee63` | Work Max Audit 14 pending | FINAL STAGE 0 CLOSURE CANDIDATE; not yet a Stage 0 closure |

## 6. Round 8 scope

Round 8 deliberately introduced no semantic or product feature. Its scope is
limited to:

- archival of the byte-preserved Audit 13 report;
- synchronization of current status in the audit index, AGENTS instructions,
  playground specification, and repair register;
- global cross-round acceptance and protected-contract review;
- a full local deterministic regression, oracle, conformance, provenance, and
  non-writing freeze;
- final remote FAST/FULL evidence on the exact candidate; and
- assembly of the final Stage 0 closure package for Audit 14.

No Stage 1 typed-core, frontend replacement, backend, solver, or other redesign
was introduced.

## 7. Round 8 changed files

The exact range is
`8d0e64cafcfa690738fe3fdc15bea784c88ea9a0..5973d147aefdee0e3cfda817da8d49a21e7eee63`.
It contains five paths, 496 insertions, and 18 deletions.

### Audit 13 archival

- `audit/13_BAPAL_ROUND_7_TERMINOLOGY_CLOSURE_AUDIT.md` — added without
  changing its certified bytes.

### Audit index

- `audit/00_AUDIT_INDEX.md` — adds Audit 13 with its exact candidate,
  reviewed HEAD, verdict, and Stage 0/Stage 1 disposition.

### AGENTS

- `AGENTS.md` — synchronizes the current P0/P1, Round 1–8, Stage 0, and Stage 1
  instructions while preserving compatibility and performance limitations.

### Specification

- `docs/BAPAL_PLAYGROUND_SPEC.md` — records the final Round 8 Stage 0 closure
  preparation boundary.

### Repair register

- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` — records Audit 13's
  P1-06/Round 7 closure and the pending Audit 14 boundary.

### Unexpected files

None. No executable source, permanent test, schema, oracle, corpus, profile,
workflow, or tracked report changed in this range.

## 8. Complete local Node matrix

Prompt 8.2 returned exactly `PASS — LOCAL STAGE 0 FREEZE CLEAN`. Each command
below was run individually and exited successfully.

| Command | Exact result |
|---|---|
| `node scripts/check-report-terminology.js` | PASS; exact current machine fields, all three model-local classifications, HTML/console wording, disclaimer, tracked-report alignment, and non-writing behavior |
| `node scripts/check-report-links.js` | PASS; 5 links |
| `node scripts/check-agent-rendering.js` | PASS; all 5 rendering groups |
| `node scripts/check-atomic-model-import.js` | PASS; 9 minimized malformed cases; 16 valid compatibility cases; empty-string contract; fuzz seed `68946449 (0x041c0a11)`; 100,000 candidates: 50,000 accepted and 50,000 rejected with exact rollback; 3 browser-startup cases |
| `node scripts/check-bapal-regression.js` | PASS; 8 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS; 1 same-set insertion-order case and 10 distinct exact-set cases |
| `node scripts/check-formula-roundtrip.js` | PASS; minimized 1, safe 10, difficult 25; exhaustive bound 5 with size counts `2, 12, 92, 792, 7312` and 8,210 distinct ASTs; seed `12245589 (0x00bada55)`, maximum size 40, 100,000 generated; 108,246 total round trips; 3 display cases |
| `node scripts/check-formula-schema-v1.js` | PASS; seed `252037658 (0x0f05ca1a)`; 100,000 generated formulas, maximum depth 40; constructor counts `atom=656071`, `not=166896`, `box=167834`, `diamond=167236`, `bapal=167306`, `knowledge=166829`, `announcement=110912`, `and=110957`, `or=111194`, `implies=111453`, `iff=111555`; 10 groups; 8,210 exhaustive formulas; 16 invalid cases; 724 truth comparisons |
| `node scripts/check-logic-regressions.js` | PASS; 6 checks |
| `node scripts/check-model-schema-v1.js` | PASS; seed `1548635457 (0x5c4e4d41)`; 100,000 generated models; 84,099 sparse models; 300,172 null slots; 45,455 multi-digit cases; 91,825 Unicode cases; 9 groups; 15 adversarial identifiers; 27 invalid cases; 3,454 truth comparisons |
| `node scripts/check-s5-closure.js` | PASS; 4 checks |
| `node scripts/check-s5-invariants.js` | PASS; 12 groups; exhaustive relation counts for worlds 0–3: `1, 2, 16, 512`; 531 directed relations and 2,337 input edges; seed `5633283 (0x0055f503)`; 10,000 sequences and 200,000 operations: 97,793 accepted, 102,207 rejected |
| `node scripts/check-semantic-state-visibility.js` | PASS; 11 groups |
| `node scripts/check-structural-copy-regressions.js` | PASS; 11 regressions |
| `node scripts/check-all.js` | PASS; the current non-writing aggregate completed its BAPAL, logic, S5, valuation-class, report-terminology, and report-link checks |

None of these commands regenerated the tracked random report.

## 9. Independent oracle and conformance matrix

The local Python commands ran with `PYTHONDONTWRITEBYTECODE=1` and placed
runtime manifests outside the tracked source tree.

| Command / evidence | Exact result |
|---|---|
| `python3 scripts/check-independent-oracle.py` | PASS; 73 explicit core cases across 11 recorded categories; static independence and no-file-I/O guards passed |
| `python3 scripts/check-oracle-sensitivity.py` | PASS; seed `0xBAD0C0DE`; 24 normal comparisons, 0 real mismatches; copied-Boolean flip at index 9 produced 1 deliberate mismatch; 31 deterministic reduction steps; artifact validation, reduced replay, and cleanup passed |
| `python3 scripts/check-oracle-conformance.py --profile fast` | PASS; seed `0x6F524143`; exactly 50,000/50,000 comparisons; 0 mismatches; local elapsed time `8.044766` seconds |
| `python3 scripts/check-oracle-conformance.py --profile full` | PASS; seed `0xC0DEC0DE`; exactly 500,000/500,000 comparisons; 0 mismatches; local elapsed time `90.627590` seconds |
| `python3 scripts/check-conformance-ci.py` | PASS; workflow triggers, job conditions, runtimes, exact commands, manifest gates, clean-tree gates, permissions, artifact upload, and absence of report generation passed |

Core-category counts were: BAPAL valuation 14, Boolean 10, identifier 6,
knowledge 7, modal labels 2, modal vacuity 4, non-S5 7, PAL 10, raw labels 2,
S5 5, and sparse/null 6. Zero mismatches in these finite profiles is bounded
differential evidence, not a proof of semantic correctness.

## 10. Final smoke probes

Temporary probes used actual production APIs and created no permanent file.

| Probe | Result |
|---|---|
| Structural deep copy | PASS; preserved a null slot, a multi-character atom, a multi-digit target index, and the exact raw relation label |
| Parser/printer | PASS; `[(K{a}p)]q` printed with its protective parentheses, reparsed to the same AST, and was idempotent |
| S5 | PASS; a malformed one-way relation normalized to the least equivalence closure of its undirected-support component without joining components |
| Valuation identity | PASS; exact true-atom sets `["a","b"]` and `["a,b"]` remained distinct valuation classes |
| Report terminology | PASS; some-but-not-all, all-live-worlds, and nowhere-in-model cases produced the exact model-local fields and labels |
| Model Schema v1 | PASS; a null world, a multi-character atom, and an exact relation label round-tripped without compaction, truncation, or normalization |
| Formula Schema v1 knowledge boundary | PASS; `["a","b"]` was accepted and evaluated character-wise, while `["ab"]` was rejected as a multi-character knowledge unit |

These probes supplement but do not replace the permanent regressions.

## 11. Protected-source freeze

The hashes below were captured during Prompt 8.2 and rechecked unchanged at the
Round 8 candidate.

| Protected path | SHA-256 |
|---|---|
| `js/MPL.js` | `63b09ca498964c9b544874fcc844932d255411b8fd49adbf89db0b29479c78e5` |
| `js/app.js` | `972faaacbaea77ee1ba3be25187a4ffa1cdb3d0d2ee803d76a89c79d2c891c60` |
| `js/s5-policy.js` | `4e90485d459f3eb1fda893ab9a6d7cce0a99d12cf87689abd95450aaf00504d2` |
| `js/schema-v1.js` | `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76` |
| `schemas/bapal-model-v1.schema.json` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| `schemas/bapal-formula-v1.schema.json` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |
| `oracle/bapal_oracle.py` | `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226` |
| `oracle/production_runner.js` | `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d` |
| `oracle/conformance.py` | `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160` |
| `conformance/v1/core-corpus.jsonl` | `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a` |
| `conformance/v1/fast-profile.json` | `9f4f8e136e5072c73be1b59e66f2360a28c567522a0c4df1da6277fd9bd55508` |
| `conformance/v1/full-profile.json` | `4e48e21e3d85ba4c7abf5945cc802cb45813552cff768a0aa00dab67982f064b` |
| `.github/workflows/bapal-conformance.yml` | `09a431dd72ff4783e73baca6153661b3232f5cfea3a58c5a10ae51b2cbf59e5e` |
| `scripts/check-structural-copy-regressions.js` | `ae0c2b980e8a5b0aeeec95d7dd10e8e1aff41aa9fb7e596c2c7dd4eb9438561e` |
| `scripts/check-formula-roundtrip.js` | `140c81baaa2c6fe9172972f4a0bd6d9468e505ad70c3d09340c10bebcbd4ae14` |
| `scripts/check-s5-invariants.js` | `9ba9eab1948873422b4203e47b0b3f5c8856fa821c2e608dba49d59591ad3f34` |
| `scripts/check-agent-rendering.js` | `e7c6fdf38f98de2c0d42cb853da4754014035a74805d550036aeac0c78b955eb` |
| `scripts/check-atomic-model-import.js` | `c94093e8742a28899d8ac3d08ec1423e2c404b41616004edf66140a911ff333d` |
| `scripts/check-semantic-state-visibility.js` | `755bd937f1b1721ee6346005a7617b6717e2fa82f9d4c99d1e9b85222da65994` |
| `scripts/check-model-schema-v1.js` | `5cace6ab6c06bf1f6b95730faf5bd1a6987e691f07e750850b96b438beed9018` |
| `scripts/check-formula-schema-v1.js` | `f81b8653201826625b791e407e71353fb2b1d89ea9c315ffeb34e01f01bba0c6` |
| `scripts/check-independent-oracle.py` | `2f22ddf569bead6622cb8accfe553b9f31640a2121a9bb35e74331a942d55cde` |
| `scripts/check-oracle-sensitivity.py` | `ec5edd4613091ac3ef1d0cee4af5a796fab8948b5f1dbc810fcd6931a214f23e` |
| `scripts/check-oracle-conformance.py` | `f64f0099de310149a59bcad12b84948510ce657320971347c35fe46c5adfb133` |
| `scripts/check-conformance-ci.py` | `41f941b60d92070e8a7c79acda2408ea4212bb6fcfcc56dda880ffd13476ab56` |
| `scripts/check-report-terminology.js` | `098b44d49aa00c7ba72da4e51cc096f015db8b620c7bb28072c04c90852088a5` |
| `reports/random-bapal-evaluation.html` | `97250cf6a1ff8513632f7a0c208f7b7b8a4cda12d621545058eb4a427babcd87` |

The semantic-scope diff from complete Round 6 candidate `ffcd7cb` and the
Round 8 diff from Audit 13's reviewed HEAD confirm that `_truth`, PAL clauses,
knowledge clauses, collision-free valuation identity, structural `deepCopy()`,
S5 behavior, Schema v1 semantics, oracle semantics, and conformance profiles
were not changed by Round 7 closure administration or Round 8 preparation.

## 12. Audit archive integrity

| Audit | Path | SHA-256 |
|---:|---|---|
| 01 | `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md` | `fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8` |
| 02 | `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md` | `875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd` |
| 03 | `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md` | `b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1` |
| 04 | `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` | `be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087` |
| 05 | `audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md` | `15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709` |
| 06 | `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md` | `8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2` |
| 07 | `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md` | `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2` |
| 08 | `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` | `9e2354770e611252e33bb1b1226ef778d1c0c41a79a17e86ad748bcf431a864f` |
| 09 | `audit/09_BAPAL_ROUND_5_VERSIONED_SCHEMA_CLOSURE_AUDIT.md` | `26a630d610f38be1b48caf81c6b51dfbe29e0d63bd5cb82b4dcd9d84e05bfd88` |
| 10 | `audit/10_BAPAL_ROUND_5_SCHEMA_ID_CLOSURE_RECHECK.md` | `dec0245151b2c303a964cae985399ba10b627822e5a0949a80711c923de5eaf2` |
| 11 | `audit/11_BAPAL_ROUND_6_ORACLE_CI_CLOSURE_AUDIT.md` | `18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a` |
| 12 | `audit/12_BAPAL_ROUND_6_DOCUMENTARY_CLOSURE_RECHECK.md` | `112a0a4de292b06841bf541ad0a47243470dc2cba0dab062119d51db34285dcc` |
| 13 | `audit/13_BAPAL_ROUND_7_TERMINOLOGY_CLOSURE_AUDIT.md` | `c2f7b7e8ec2a966d2c2ca59569e267150c545542e739ab49ba8d6429f713dabc` |

The foundational instruction artifact
`prompt/work_max_bapal_foundational_audit_prompt.md` hashes to
`052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98`.
Audits 01–12 are unchanged. Audit 13 is byte-preserved from the certified
report. No historical audit was rewritten, and historical conditional verdicts
remain conditional.

## 13. Tracked report integrity

| Check | Before tests | After tests | Result |
|---|---|---|---|
| `reports/random-bapal-evaluation.html` SHA-256 | `97250cf6a1ff8513632f7a0c208f7b7b8a4cda12d621545058eb4a427babcd87` | `97250cf6a1ff8513632f7a0c208f7b7b8a4cda12d621545058eb4a427babcd87` | Unchanged |
| Aggregate of sorted `sha256sum` records for all tracked `reports/` paths | `52d69c68c257123a958db897e9fe57726d2a48adafaaef2cc4eb148ae0768ccb` | `52d69c68c257123a958db897e9fe57726d2a48adafaaef2cc4eb148ae0768ccb` | Unchanged |

Ordinary regressions were non-writing. Runtime conformance manifests were
created only under temporary/artifact directories outside tracked paths; no
runtime manifest, bytecode file, or other check artifact remained in the
repository.

## 14. Final remote CI evidence

The evidence below was retrieved from GitHub Actions for the exact candidate;
it was not inferred or reconstructed from local output.

| Field | Push-triggered FAST | Workflow-dispatch FAST | Workflow-dispatch FULL |
|---|---|---|---|
| Candidate SHA | `5973d147aefdee0e3cfda817da8d49a21e7eee63` | `5973d147aefdee0e3cfda817da8d49a21e7eee63` | `5973d147aefdee0e3cfda817da8d49a21e7eee63` |
| Workflow run ID | `31292695906` | `31292714435` | `31292714435` |
| Job ID | `93192508312` | `93192561130` | `93192561109` |
| Trigger | `push` | `workflow_dispatch` | `workflow_dispatch` |
| Result | `completed / success` | `completed / success` | `completed / success` |
| Profile seed | `0x6F524143` | `0x6F524143` | `0xC0DEC0DE` |
| Comparisons | `50,000/50,000` | `50,000/50,000` | `500,000/500,000` |
| Mismatches | `0` | `0` | `0` |
| Generated-profile elapsed time | `11.070952` seconds | `10.908582` seconds | `133.379464` seconds |
| Artifact ID | `9031925111` | `9031931814` | `9031959188` |
| Artifact name | `bapal-conformance-fast-31292695906-1` | `bapal-conformance-fast-31292714435-1` | `bapal-conformance-full-31292714435-1` |
| Artifact SHA-256 digest | `ba022b3c95b45c48ccea2508b8766b3f1b3c4a61beeb33f921b3753f0511554d` | `fcc830d92eede2f11d08f8256f7affb3089198eb5ae82a148ea2ee2aea7f1e67` | `ca761c4be2913d7bfa1b6cc99b5ef8fefa7894170aac6573d61c6ed5c3ffdadc` |

Each successful job also passed the 73-case core and the permanent sensitivity
check. In each sensitivity run, seed `0xBAD0C0DE` produced 24 normal comparisons
with 0 real mismatches, then one deliberate copied-result mismatch at index 9
and 31 reduction steps. The jobs passed manifest validation, inherited
non-writing regressions, whitespace and clean-worktree gates, and artifact
upload. The FULL job was correctly skipped in the push run and was then run and
passed through `workflow_dispatch` on the same exact commit.

The remote results are exact-count bounded evidence. They do not establish a
proof, unbounded correctness, satisfiability, validity, or decidability.

## 15. Cross-document consistency result

Prompt 8.3 returned exactly:

> PASS AFTER SCOPED DOCUMENTARY REPAIR

The only repair was within the allowed current-status specification file: a
historical-looking present-tense sentence was synchronized to state that Audit
13 closes P1-06 under its exact boundary. The repeated sweep then found no
current normative contradiction. Current normative files agree that:

- P0-01 and P1-01 through P1-07 are individually closed;
- Rounds 1–7 are closed;
- Stage 0 remains open pending final Work Max Audit 14; and
- Stage 1 is not started and remains blocked.

They also retain the bounded-evidence nonclaims and the documented interface,
compatibility, semantic-frame, and performance limitations.

## 16. Remaining limitations

- Existential BAPAL evaluation enumerates subsets of the occurring complete
  valuation classes; this is exponential in the number of classes, and nesting
  can increase the cost further.
- Browser evaluation is synchronous and main-thread bound, with no worker,
  cancellation, timeout, progress, or resource-limit mechanism.
- The raw parser and browser-preprocessed grammar remain distinct. Browser
  comma removal and announcement-parenthesis rewriting are not raw-parser
  features.
- Formula Schema v1 knowledge entries are character-wise one-unit shorthand.
  A multi-character entry does not denote one multi-character epistemic agent.
- The legacy compact/share format remains a one-character-atom and
  one-code-point-relation-label compatibility format. It is not general
  identifier interchange, and Schema v1 does not replace the share URL.
- Formal BAPAL targets S5 epistemic models, while the evaluator can operate on
  arbitrary stored relations. An arbitrary-frame result is not automatically a
  result about formal S5 BAPAL.
- The core corpus, seeded property checks, exhaustive small bounds, FAST/FULL
  profiles, sampled report, and smoke probes are all bounded computational
  evidence.
- The application has no general satisfiability solver.
- The application has no logical validity checker.
- The application is not a theorem prover.
- The evidence does not prove a finite-model property.
- The application is not a general BAPAL decision procedure and the evidence
  does not prove general decidability.

None of these limitations contradicts the original Stage 0 acceptance target:
Stage 0 repaired and permanently guarded the identified critical and major
defects in the existing finite explicit-model playground. It did not promise a
new solver architecture, an asynchronous performance system, unified language
surfaces, or a mathematical completeness/decidability result.

## 17. P2/P3 disposition

The foundational P2/P3 inventory is retained below, including findings later
mitigated or subsumed by a higher-severity repair. “Deferred” does not mean
silently accepted as a P0/P1 defect.

| ID | Current disposition | Why it does not contradict Stage 0 P0/P1 acceptance | Likely future destination |
|---|---|---|---|
| P2-01 | OPEN / deferred: raw and browser-preprocessed grammars still differ. | Round 2 guarantees printer reparsability for the audited supported AST contract; it does not promise grammar unification. | Stage 1 typed language/parser boundary or later compatibility work |
| P2-02 | OPEN / partially mitigated: formal, raw, UI, Schema v1, and legacy compact identifier vocabularies remain distinct and are now explicitly documented. | Stage 0 required truthful preservation/disclosure and a safe versioned interchange path, not one universal vocabulary. | Stage 1 typed core and interface contracts; later migration design |
| P2-03 | PARTIALLY MITIGATED / residual behavior deferred: documentation now distinguishes inherited ordinary all-label `□`/`<>` from BAPAL, while the inherited aggregate behavior remains. | The stale/ambiguous public claims were repaired; changing the inherited operator semantics was outside the named P0/P1 repairs. | Stage 1 language/semantic API redesign or later compatibility decision |
| P2-04 | OPEN / deferred: edge-derived active-agent behavior and edge-free knowledge vacuity remain part of the inherited relation model. | Round 3 defined a deterministic relevant-agent set for S5 editing; it did not redefine formula semantics or global agent declarations. | Stage 1 explicit typed model vocabulary/agent declarations |
| P2-05 | OPEN as a deliberate documented boundary: arbitrary stored frames can still be evaluated although formal BAPAL targets S5. | Stage 0 repaired S5 editing/normalization and made the distinction visible; it did not prohibit the inherited arbitrary-frame playground. | Stage 1 frame-type enforcement or later product-mode separation |
| P2-06 | OPEN / deferred performance limitation: eager BAPAL class-subset enumeration, copying, and restriction remain exponential. | Stage 0's semantic acceptance is finite and deterministic; no polynomial-time or interactive-performance guarantee was an acceptance criterion. | Later performance architecture, pruning, caching, or research work |
| P2-07 | OPEN for the legacy compact/share boundary; separately mitigated by checked-in Schema v1. | Stage 0 added safe versioned semantic interchange without pretending to repair or replace the compatibility URL format. | Stage 1 migration/import architecture or later share-format versioning |
| P2-08 | PARTIALLY MITIGATED / evidence remains bounded: the sampled report is still a small product sample, while Round 6 added independent core/FAST/FULL coverage and mismatch reduction. | Stage 0 requires explicit bounded evidence, not exhaustive unbounded testing or transformation of the sampled report into an oracle. | Ongoing verification expansion and later property/research corpora |
| P2-09 | OPEN / deferred performance limitation: synchronous evaluation has no cancellation, timeout, worker, progress, or resource limit. | Responsiveness architecture was not one of the correctness closures; the limitation is explicit. | Later worker-based UI/performance stage |
| P2-10 | The baseline correctness coupling was SUBSUMED AND REPAIRED by P0-01 structural copying; residual copy/allocation architecture remains deferred. | Audit 04/05 directly close the lossy text-copy defect, while preserving the separate legacy external format. No unresolved P0-01 behavior is hidden here. | Stage 1 pure typed semantic core and later optimization |
| P3-01 | DOCUMENTATION ASPECT REPAIRED in Round 7; future drift prevention remains maintenance. | Correct BAPAL title/repository links are current, so this no longer contradicts public-accuracy acceptance. | Ongoing documentation/link maintenance |
| P3-02 | DOCUMENTATION ASPECT REPAIRED in Round 7; future API drift remains maintenance. | The current API reference covers knowledge, PAL, BAPAL, S5, Schema v1, ownership, and pointed results under their exact boundaries. | Ongoing generated/manual API documentation maintenance |
| P3-03 | OPEN / deferred low-severity maintenance: `getWffAgentsAndProps` object deduplication remains inefficient. | Existing callers tolerate duplicates; no demonstrated semantic misresult or Stage 0 closure defect remains. | Stage 1 typed metadata extraction/refactor |
| P3-04 | OPEN / partially mitigated maintenance issue: suite inclusion improved, but inherited overlap remains. | Duplicate coverage increases maintenance cost without invalidating the independently separated oracle/conformance evidence. | Ongoing test-suite consolidation after Stage 0 |
| P3-05 | OPEN / deferred naming and comment cleanup: inherited MPL/generic naming remains. | Public normative documentation now states the actual contract; renaming internals would be a broad, risky nonclosure refactor. | Stage 1 typed-core/module naming cleanup |

No item in this table is promoted to P0/P1 without a concrete new defect, and
no open/deferred item is represented as fixed merely because the P0/P1 ledger
is closed.

## 18. Claims supported

The closure package supports only these narrow claims:

- all identified Stage 0 P0/P1 items have individual Work Max closure evidence;
- the complete local deterministic matrix passes on the protected executable
  content frozen into the Round 8 candidate;
- the bounded independent oracle/core/FAST/FULL conformance matrix passes with
  the exact recorded seeds and counts;
- the exact Round 8 candidate passes remote push FAST and dispatch FAST/FULL;
- current documentation accurately states product, language, identifier,
  frame, evidence, result-terminology, performance, and compatibility
  boundaries; and
- the repository is ready for one final Work Max Stage 0 closure decision.

This log does not claim that Stage 0 is already closed. It does not claim a
formal proof of semantic correctness, logical satisfiability or validity,
unbounded correctness, a finite-model property, or general BAPAL decidability.

## 19. Stage 0 status

STAGE 0 OPEN — ALL IDENTIFIED P0/P1 ITEMS INDIVIDUALLY CLOSED —
READY FOR FINAL WORK MAX CLOSURE AUDIT

## 20. Stage 1 status

NOT STARTED / NOT AUTHORIZED UNTIL AUDIT 14 RETURNS A PASSING
STAGE 0 CLOSURE VERDICT

## 21. Work Max package

The exact Audit 14 package is:

- `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md` through
  `audit/13_BAPAL_ROUND_7_TERMINOLOGY_CLOSURE_AUDIT.md`;
- `audit/00_AUDIT_INDEX.md`;
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`;
- all implementation/documentary logs `revision/01_*.md` through this
  `revision/11_ROUND_7_CLOSURE_AND_ROUND_8_STAGE_0_FINAL_CLOSURE_PREPARATION_LOG.md`;
- Round 8 candidate commit
  `5973d147aefdee0e3cfda817da8d49a21e7eee63` and tree
  `d391ffb6624dd15e5c0b2e0d00a1677bbe256853`;
- the exact candidate diff from Audit 13 reviewed HEAD
  `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0`;
- protected production source and Schema v1 artifacts;
- all permanent Node and Python checks;
- the independent oracle, production runner, comparator/reducer, 73-case core
  corpus, and deterministic FAST/FULL profiles;
- `.github/workflows/bapal-conformance.yml`;
- push run `31292695906` and workflow-dispatch run `31292714435`, including
  their job and artifact identifiers recorded in Section 14;
- protected-source, audit-archive, foundational-prompt, and tracked-report
  hashes recorded in Sections 11–13; and
- the local freeze and cross-document consistency results recorded in this
  log.

Audit 14 must independently decide whether this package supplies the final
global Stage 0 PASS. This log does not make that decision and does not authorize
Stage 1.
