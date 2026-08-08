# Round 6 Audit 11 Documentary Repair Log

## 1. Audit 11 identity and verdict

- Audit report: `audit/11_BAPAL_ROUND_6_ORACLE_CI_CLOSURE_AUDIT.md`
- Audit 10 reviewed commit: `8451a1e289eb8e6efa19887e35955d3d8772c8d8`
- Audit 11 verdict: **PASS SUBJECT TO LOCAL REPAIRS**
- Substantive disposition: the Round 6 executable oracle, conformance, artifact, and CI package passed Audit 11.
- Sole blocker: R6-A11-01, a documentary normative-status and remote-evidence synchronization defect.

This repair does not reinterpret or modify `revision/08_ROUND_5_CLOSURE_AND_ROUND_6_ORACLE_CI_IMPLEMENTATION_LOG.md`. Revision 08 remains an accurate historical record prepared before the final-log-only-HEAD FAST run occurred.

## 2. Exact candidate and final audited HEAD

- Complete Round 6 implementation candidate: `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`
- Candidate tree: `cbca95699da5853313da1c00d579e802daa84204`
- Final audited log-only HEAD: `e9b8bd37a380c74375c7cd161711f76e605bf483`
- Final audited tree: `e95e3780417e9afe6566cc09287160e52ed786cc`
- Difference: the final audited HEAD adds only the Round 6 Markdown implementation log to the complete candidate.

## 3. R6-A11-01

Audit 11 found that several current normative files still described Round 5 Schema v1 as awaiting closure, Round 6 remote FAST revalidation as pending, or the independent oracle/corpus as absent. Those statements conflicted with Audit 10 and the remote runs Audit 11 independently verified. This was the only closure blocker; Audit 11 found no remaining executable or CI blocker.

The evidence chain includes the designed failure: push run `31278938374` at pre-repair commit `e4f8a35` created the FAST job and stopped on `core-073-bapal-delimiter-collision-exact-atoms`, exposing the production valuation-key collision. This failure is retained as evidence that the gate detected the concrete semantic regression.

## 4. Stale statements found

The six normative files contained these stale classes of statement:

- `audit/00_AUDIT_INDEX.md` did not yet index Audit 11 or its conditional verdict.
- `docs/SCHEMA_V1.md` said Round 5 still awaited Work Max closure.
- `docs/BAPAL_PLAYGROUND_SPEC.md` had two later Schema v1 status blocks marked pending, called the oracle/corpus absent, and called remote revalidation pending.
- `AGENTS.md` called Round 6 remote FAST revalidation pending.
- `docs/CONFORMANCE.md` called remote FAST revalidation pending in four status locations.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` repeatedly called Round 6/P1-07 remote revalidation pending.

## 5. Exact corrected statements

- Round 5 Versioned Schema v1 is **CLOSED — WORK MAX AUDIT 10** under the exact Audit 09/10 contracts; Round 6 does not reopen it.
- Round 6 is **SUBSTANTIVE IMPLEMENTATION PASSED AUDIT 11 — DOCUMENTARY REPAIR APPLIED — PENDING FOCUSED WORK MAX CLOSURE RECHECK**.
- Remote FAST and FULL revalidation of complete candidate `ffcd7cb` is complete; final log-only HEAD `e9b8bd3` has a successful remote push FAST run but is not claimed to have a FULL run.
- No executable Round 6 closure blocker remains. Only R6-A11-01 documentary synchronization awaits focused recheck.
- P1-07 and Round 6 remain open pending that recheck. P1-06 and Stage 0 remain open. Round 7 remains blocked.
- Bounded oracle agreement remains computational regression evidence, not a formal proof or an exhaustive BAPAL result.

## 6. Candidate remote FAST evidence

At complete candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc`:

- push run `31279961371`: FAST **success**; FULL skipped as expected;
- workflow-dispatch run `31280106548`: FAST **success** and FULL **success**; and
- workflow-dispatch run `31280325814`: FAST **success** and FULL **success**.

Each successful FAST execution completed exactly 50,000 comparisons with zero mismatches.

## 7. Candidate remote FULL evidence

Workflow-dispatch runs `31280106548` and `31280325814` ran FULL successfully at candidate `ffcd7cb`. Each completed exactly 500,000 comparisons with zero mismatches. Audit 11 independently downloaded and inspected the artifacts from run `31280325814`, including the source-matching runtime manifest. This finite evidence is not a proof of correctness outside the configured bounds.

## 8. Final-head remote FAST evidence

Push run `31281388941` at final audited log-only HEAD `e9b8bd37a380c74375c7cd161711f76e605bf483` completed FAST successfully at exactly 50,000 comparisons with zero mismatches; FULL was skipped as expected for a push. No FULL execution is attributed to the final log-only HEAD.

## 9. Files changed

Modified documentary-status files:

- `audit/00_AUDIT_INDEX.md`
- `AGENTS.md`
- `docs/SCHEMA_V1.md`
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `docs/CONFORMANCE.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`

Created only this repair log:

- `revision/09_ROUND_6_AUDIT_11_DOCUMENTARY_REPAIR_LOG.md`

Audit 11 itself was a pre-existing untracked audit input at the start of this repair and was not created or modified by it.

## 10. Protected executable files

The following remained byte-identical to `e9b8bd37a380c74375c7cd161711f76e605bf483`:

- `js/MPL.js` and `js/schema-v1.js`;
- `oracle/bapal_oracle.py`, `oracle/production_runner.js`, and `oracle/conformance.py`;
- the 73-case core corpus and FAST/FULL profile documents;
- `.github/workflows/bapal-conformance.yml`;
- all four Round 6 Python/CI check scripts and `scripts/check-bapal-valuation-class.js`;
- both Schema v1 JSON artifacts;
- tracked reports; and
- `revision/08_ROUND_5_CLOSURE_AND_ROUND_6_ORACLE_CI_IMPLEMENTATION_LOG.md`.

No semantic clause, oracle behavior, generated-profile contract, workflow behavior, test, schema artifact, `core-073` expectation, or report was changed.

## 11. Validation commands

All required commands exited `0` on 2026-08-09:

| Command | Result |
|---|---|
| `python3 scripts/check-independent-oracle.py` | PASS; 73 explicit cases; all 11 categories; independence guards PASS; Python 3.12.3; Node v24.18.0 |
| `python3 scripts/check-oracle-sensitivity.py` | PASS; seed `0xBAD0C0DE`; 24 normal/0 real mismatches; one flipped result detected; 31 reductions; replay and cleanup PASS |
| `python3 scripts/check-oracle-conformance.py --profile fast` | PASS; seed `0x6F524143`; 50,000/50,000; zero mismatches; 9.937103 seconds; manifest under `/tmp` |
| `python3 scripts/check-conformance-ci.py` | PASS; triggers, conditions, exact commands, post-runner artifacts, permissions, manifest/clean-tree/upload gates, and YAML parse check |
| `node scripts/check-model-schema-v1.js` | PASS; 100,000 generated models; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | PASS; 8,210 exhaustive and 100,000 generated formulas; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | PASS; 11 groups |
| `node scripts/check-atomic-model-import.js` | PASS; 100,000 fuzz candidates plus fixed cases |
| `node scripts/check-agent-rendering.js` | PASS; 5 groups |
| `node scripts/check-s5-invariants.js` | PASS; 12 groups; 531 exhaustive relations; 200,000 generated operations |
| `node scripts/check-formula-roundtrip.js` | PASS; 108,246 total round trips |
| `node scripts/check-structural-copy-regressions.js` | PASS; 11 regressions |
| `node scripts/check-bapal-regression.js` | PASS; 8 checks |
| `node scripts/check-logic-regressions.js` | PASS; 6 checks |
| `node scripts/check-s5-closure.js` | PASS; 4 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS; insertion-order invariant and 10 distinct exact-set cases |
| `node scripts/check-report-links.js` | PASS; 5 links |

`git diff --check` is part of the final gate below. The tracked random report generator and `scripts/check-all.js` were not run.

## 12. Source, audit, and report integrity

Audit input and protected package SHA-256 values, recomputed before and after the documentary edits, are:

| Path | SHA-256 |
|---|---|
| `audit/11_BAPAL_ROUND_6_ORACLE_CI_CLOSURE_AUDIT.md` | `18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a` |
| `js/MPL.js` | `63b09ca498964c9b544874fcc844932d255411b8fd49adbf89db0b29479c78e5` |
| `js/schema-v1.js` | `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76` |
| `oracle/bapal_oracle.py` | `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226` |
| `oracle/production_runner.js` | `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d` |
| `oracle/conformance.py` | `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160` |
| `conformance/v1/core-corpus.jsonl` | `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a` |
| `conformance/v1/fast-profile.json` | `9f4f8e136e5072c73be1b59e66f2360a28c567522a0c4df1da6277fd9bd55508` |
| `conformance/v1/full-profile.json` | `4e48e21e3d85ba4c7abf5945cc802cb45813552cff768a0aa00dab67982f064b` |
| `.github/workflows/bapal-conformance.yml` | `09a431dd72ff4783e73baca6153661b3232f5cfea3a58c5a10ae51b2cbf59e5e` |
| `scripts/check-independent-oracle.py` | `2f22ddf569bead6622cb8accfe553b9f31640a2121a9bb35e74331a942d55cde` |
| `scripts/check-oracle-conformance.py` | `f64f0099de310149a59bcad12b84948510ce657320971347c35fe46c5adfb133` |
| `scripts/check-oracle-sensitivity.py` | `ec5edd4613091ac3ef1d0cee4af5a796fab8948b5f1dbc810fcd6931a214f23e` |
| `scripts/check-conformance-ci.py` | `41f941b60d92070e8a7c79acda2408ea4212bb6fcfcc56dda880ffd13476ab56` |
| `scripts/check-bapal-valuation-class.js` | `e14f1f94cc37a2e1f98afc0c89384945e5b3a780a799cd3cb347ed9b3ddcdafe` |
| `schemas/bapal-model-v1.schema.json` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| `schemas/bapal-formula-v1.schema.json` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |
| `revision/08_ROUND_5_CLOSURE_AND_ROUND_6_ORACLE_CI_IMPLEMENTATION_LOG.md` | `d595055efea3bf45a568cdf0bf5ce4725555271118f8fab9b8641472f306ddea` |
| `reports/random-bapal-evaluation.html` | `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` |

The SHA-256 of the sorted tracked-report checksum stream is `90f156009535d9ea07951b2822a6462353abe42a8e3d66522461469d8752379f`, matching Audit 11. A direct `git diff --exit-code e9b8bd3 -- <protected paths>` produced no differences. Audits 01–10 are unchanged; Audit 11 retained its pre-repair hash; the only tracked report retained its pre-repair hash.

## 13. Narrow claims

This repair supports only these claims:

- the six current normative/status files now record Audit 10 and Audit 11 accurately;
- the Round 6 executable package substantively passed Audit 11;
- the checked-in finite FAST/FULL profiles have the stated exact counts and audited successful local/remote runs;
- the final log-only HEAD has remote FAST evidence, while candidate `ffcd7cb` supplies the audited remote FULL evidence; and
- the documentary repair did not alter executable behavior or historical Revision 08.

It does not claim formal proof, exhaustive or unbounded BAPAL correctness, P1-07 closure, P1-06 closure, Round 6 closure, or Stage 0 closure.

## 14. P1-07 remains pending focused recheck

P1-07 remains **OPEN**. Its substantive implementation passed Audit 11, and R6-A11-01 has been repaired locally, but only a focused Work Max recheck may close the finding, P1-07, and Round 6.

## 15. P1-06 and Stage 0 remain open

P1-06 terminology remains **OPEN** and was not modified. Stage 0 remains **OPEN**. This repair neither performs terminology cleanup nor advances the Stage 0 closure gate.

## 16. Round 7 remains blocked

Round 7 is not begun or authorized by this repair. It remains blocked until the focused Work Max recheck returns PASS and explicitly authorizes Round 7.

## 17. Focused Work Max package

The focused recheck package consists of:

- Audit 11 at SHA-256 `18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a`;
- complete candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` and final audited log-only HEAD `e9b8bd37a380c74375c7cd161711f76e605bf483`;
- remote runs `31278938374`, `31279961371`, `31280106548`, `31280325814`, and `31281388941` with the dispositions recorded above;
- the six synchronized normative/status files;
- this documentary repair log;
- the byte-identical protected executable, Schema, report, and Revision 08 artifacts;
- the complete passing local validation matrix; and
- the final whitespace, status, name-status, and protected-diff checks.

The requested next action is a focused read-only Work Max closure recheck of R6-A11-01. Round 7 remains outside this package.
