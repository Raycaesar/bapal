# BAPAL Round 6 Documentary Closure Recheck

- Repository: Raycaesar/bapal
- Branch: bapal-core
- Audit date: 2026-08-08 UTC / 2026-08-09 UTC+08
- Complete Round 6 implementation candidate: ffcd7cb2d14217859069acd8ac23cdc5ea450cbc
- Audit 11 final reviewed HEAD: e9b8bd37a380c74375c7cd161711f76e605bf483
- Documentary-repair commit and current HEAD: 2ea0e0f63f42976644d35e910b2079c3f58b58ac
- Mode: focused, read-only closure recheck

## 1. Executive verdict

**PASS — P1-07 CLOSED; ROUND 6 CLOSED; PROCEED TO ROUND 7**

R6-A11-01 is closed. The sole commit after the Audit 11 boundary synchronizes the normative Round 5/Round 6 status and remote-evidence record without changing the Round 6 executable package, Schema v1 artifacts, tests, workflow, reports, or historical Revision 08.

Audit 11 remains byte-preserved with its historical conditional verdict. Its substantive bounded-oracle conclusions remain the certification basis for the executable package. This recheck closes only the documentary finding, P1-07, and Round 6.

Accordingly:

- R6-A11-01 is closed;
- P1-07 is closed narrowly under the Audit 11 bounded contract;
- Round 6 is closed;
- P1-06 remains OPEN;
- Stage 0 remains OPEN; and
- Round 7 terminology/documentation closure is authorized.

No Stage 0 closure is claimed. The target repository was not edited during this recheck.

## 2. Exact commit boundary

The current history after the Audit 11 final reviewed HEAD is linear:

| Order | Commit | Parent | Subject | Role |
|---:|---|---|---|---|
| 0 | e9b8bd37a380c74375c7cd161711f76e605bf483 | ffcd7cb2d14217859069acd8ac23cdc5ea450cbc | add round 6 independent conformance implementation log | Audit 11 final reviewed log-only HEAD |
| 1 | 2ea0e0f63f42976644d35e910b2079c3f58b58ac | e9b8bd37a380c74375c7cd161711f76e605bf483 | synchronize round 6 closure documentation | Sole documentary repair and current branch HEAD |

Current tree:

3341ca64f7ad4cba0a8aa0d3a6d04bbef36e6f6a

The range e9b8bd3..2ea0e0f contains exactly one commit and these eight paths:

| Path | Status | Disposition |
|---|---|---|
| AGENTS.md | modified | normative status synchronization |
| audit/00_AUDIT_INDEX.md | modified | Audit 11 index entry |
| audit/11_BAPAL_ROUND_6_ORACLE_CI_CLOSURE_AUDIT.md | added to Git | byte-preserved pre-existing audit input |
| docs/BAPAL_PLAYGROUND_SPEC.md | modified | Round 5/Round 6 status synchronization |
| docs/CONFORMANCE.md | modified | remote-evidence synchronization |
| docs/SCHEMA_V1.md | modified | Round 5 closure synchronization |
| revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md | modified | repair-register synchronization |
| revision/09_ROUND_6_AUDIT_11_DOCUMENTARY_REPAIR_LOG.md | added | documentary repair log |

There is no executable, schema, workflow, corpus, profile, test, report, README, API, UI, or Round 7 implementation path in the range.

## 3. Audit 11 preservation and administration

Audit 11 remains historically and byte-wise intact:

- delivered Audit 11 SHA-256: 18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a;
- repository Audit 11 SHA-256: 18be9a8e7fcca909cbfd7f3603346e8523b1d44df5c0ccbb0461f130051d183a;
- direct byte comparison: identical;
- historical verdict: PASS SUBJECT TO LOCAL REPAIRS.

The index does not rewrite that verdict as unconditional. It records:

- complete candidate ffcd7cb2d14217859069acd8ac23cdc5ea450cbc;
- final reviewed log-only HEAD e9b8bd37a380c74375c7cd161711f76e605bf483;
- the documentary-only R6-A11-01 blocker;
- P1-07 and Round 6 open pending this focused recheck;
- P1-06 and Stage 0 open; and
- Round 7 blocked pending this verdict.

This accurately represents the pre-recheck state.

## 4. Round 5 and Schema v1 status

Every normative location carrying a Round 5 status now records that Audit 10 closed R5-A09-01 and Round 5. No current normative file calls Schema v1 pending closure. The Round 6 conformance guide contains no contrary Round 5 statement and does not reopen Schema v1.

The canonical resource identities remain exact:

| Artifact | Canonical $id | SHA-256 |
|---|---|---|
| Model Schema v1 | https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json | c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf |
| Formula Schema v1 | https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json | 7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a |

Both artifacts are byte-identical to e9b8bd3. Their identities, Draft 2020-12 declarations, local references, runtime boundaries, and character-wise Formula Schema v1 knowledge policy are unchanged.

## 5. Round 6 normative synchronization

The repaired normative package accurately records the implemented executable status:

| Required statement | Observed disposition |
|---|---|
| Independent Python oracle is checked in | stated accurately |
| 73-case manually expected core corpus is checked in | stated accurately |
| FAST and FULL generated profiles are checked in | stated accurately, with exact seeds/counts/bounds |
| GitHub Actions conformance gate is checked in | stated accurately |
| Audit 11 substantively passed the executable package | stated accurately |
| Bounded evidence is not a proof | retained throughout |
| P1-07 remains open before this recheck | stated accurately |
| Round 6 remains open before this recheck | stated accurately |
| P1-06 remains OPEN | stated accurately |
| Stage 0 remains OPEN | stated accurately |
| Round 7 remains blocked before this verdict | stated accurately |

No normative file falsely says that Audit 11 itself closed P1-07 or Round 6.

The repaired files also preserve the important nonclaims:

- legacy compact/share URLs are not certified as lossless;
- Formula Schema v1 knowledge remains character-wise;
- raw and browser formula interfaces remain distinct;
- conformance evidence is finite and bounded; and
- no soundness, completeness, satisfiability, validity, decidability, or unbounded correctness proof is claimed.

## 6. Remote GitHub Actions evidence

Run metadata, job outcomes, and job logs were inspected independently. The four historical run claims are exact:

| Run | Event | SHA | FAST | FULL | Exact generated result |
|---:|---|---|---|---|---|
| 31279961371 | push | ffcd7cb2d14217859069acd8ac23cdc5ea450cbc | success | skipped | 50,000 / 50,000; zero mismatches |
| 31280106548 | workflow_dispatch | ffcd7cb2d14217859069acd8ac23cdc5ea450cbc | success | success | FAST 50,000 / 50,000; FULL 500,000 / 500,000; zero mismatches |
| 31280325814 | workflow_dispatch | ffcd7cb2d14217859069acd8ac23cdc5ea450cbc | success | success | FAST 50,000 / 50,000; FULL 500,000 / 500,000; zero mismatches |
| 31281388941 | push | e9b8bd37a380c74375c7cd161711f76e605bf483 | success | skipped | 50,000 / 50,000; zero mismatches |

The documentary-repair commit also has a later successful FAST run:

| Run | Event | SHA | FAST | FULL | Exact generated result |
|---:|---|---|---|---|---|
| 31283038443 | push | 2ea0e0f63f42976644d35e910b2079c3f58b58ac | success | skipped | 50,000 / 50,000; zero mismatches |

For repair-commit run 31283038443:

- FAST job: 93167292959, success;
- artifact: 9028997968;
- artifact archive SHA-256: 424d3537691c2dd194f1bd1c5325e50f7f57aba6029be031534eacd1540eb7f7;
- manifest SHA-256: 4313de9f317972278b09ce47eaca95181ca9568f23546c1e19a81a9f7f278566;
- manifest HEAD: 2ea0e0f63f42976644d35e910b2079c3f58b58ac;
- manifest tree: 3341ca64f7ad4cba0a8aa0d3a6d04bbef36e6f6a;
- seed: 0x6F524143;
- status: pass;
- comparisons: 50,000 / 50,000;
- mismatches: 0; and
- all nine pinned source hashes match the current executable/schema bytes.

The repair-commit run additionally passed the inherited deterministic non-writing regressions, whitespace gate, clean-worktree gate, manifest gate, and artifact upload. This is bounded remote regression evidence, not a proof.

## 7. Documentary repair accuracy

Revision 09 accurately records:

- Audit 11's historical conditional verdict and sole finding;
- the complete candidate and final reviewed HEAD/tree;
- the six normative files repaired;
- the exact candidate FAST/FULL and final-HEAD FAST evidence;
- the byte-preserved protected package;
- the local validation matrix;
- the still-open pre-recheck P1-07, P1-06, and Stage 0 status; and
- the pre-recheck Round 7 block.

Its statement that Audit 11 was a pre-existing untracked audit input is consistent with the evidence: the current commit introduces it to Git, but its bytes exactly match the previously delivered Audit 11 artifact. Revision 09 does not claim to have created or rewritten Audit 11.

Revision 08 remains an unchanged historical implementation log:

- SHA-256: d595055efea3bf45a568cdf0bf5ce4725555271118f8fab9b8641472f306ddea;
- diff against e9b8bd3: none.

Its omission of the later final-HEAD and repair-commit FAST runs is chronological, not a false historical claim.

## 8. Executable scope preservation

A direct diff from e9b8bd3 to current HEAD is empty for every protected path requested by the recheck:

- js/MPL.js;
- js/schema-v1.js;
- oracle/bapal_oracle.py;
- oracle/production_runner.js;
- oracle/conformance.py;
- conformance/v1/core-corpus.jsonl;
- conformance/v1/fast-profile.json;
- conformance/v1/full-profile.json;
- .github/workflows/bapal-conformance.yml;
- scripts/check-independent-oracle.py;
- scripts/check-oracle-conformance.py;
- scripts/check-oracle-sensitivity.py;
- scripts/check-conformance-ci.py;
- both Schema v1 artifacts;
- tracked reports; and
- Revision 08.

The P1-06/Round 7 implementation targets are also unchanged:

- scripts/random-bapal-evaluation.js;
- README.md;
- API-Reference.md;
- index.html; and
- reports/random-bapal-evaluation.html.

No Round 7 implementation has begun. Therefore the user-specified BLOCKED condition does not apply.

## 9. Focused local validation

All required focused commands exited 0 at current HEAD.

| Command | Observed result |
|---|---|
| python3 scripts/check-independent-oracle.py | 73 explicit cases; all 11 categories; static and no-file-I/O independence guards pass |
| python3 scripts/check-oracle-sensitivity.py | seed 0xBAD0C0DE; 24 normal comparisons; zero real mismatch; one deliberate flip detected; 31 reduction steps; replay and cleanup pass |
| python3 scripts/check-oracle-conformance.py --profile fast | seed 0x6F524143; exactly 50,000 / 50,000; zero mismatch; 8.174568 seconds |
| python3 scripts/check-conformance-ci.py | triggers, conditions, supported runtimes, exact commands, artifacts, permissions, manifest/clean-tree/upload gates, no random report generation, and YAML parse pass |
| git diff --check | no output |

The local FAST manifest records:

- HEAD 2ea0e0f63f42976644d35e910b2079c3f58b58ac;
- tree 3341ca64f7ad4cba0a8aa0d3a6d04bbef36e6f6a;
- exact target and actual count 50,000;
- zero mismatches;
- status pass; and
- exact current source hashes.

All inherited deterministic Node checks were run, rather than inferred:

| Command | Observed result |
|---|---|
| node scripts/check-model-schema-v1.js | 100,000 generated models; 9 groups; 3,454 truth comparisons |
| node scripts/check-formula-schema-v1.js | 8,210 exhaustive plus 100,000 generated formulas; 10 groups; 724 truth comparisons |
| node scripts/check-semantic-state-visibility.js | 11 groups |
| node scripts/check-atomic-model-import.js | 9 malformed, 16 compatibility, 100,000 fuzz, and 3 startup cases |
| node scripts/check-agent-rendering.js | 5 groups |
| node scripts/check-s5-invariants.js | 12 groups; 531 exhaustive relations; 10,000 sequences and 200,000 operations |
| node scripts/check-formula-roundtrip.js | 108,246 round trips |
| node scripts/check-structural-copy-regressions.js | 11 regressions |
| node scripts/check-bapal-regression.js | 8 checks |
| node scripts/check-logic-regressions.js | 6 checks |
| node scripts/check-s5-closure.js | 4 checks |
| node scripts/check-bapal-valuation-class.js | insertion-order invariant plus 10 distinct exact-set cases |
| node scripts/check-report-links.js | 5 links |

No tracked random report generator or aggregate that invokes it was run.

## 10. Before/after integrity

| Gate | Before | After |
|---|---|---|
| HEAD | 2ea0e0f63f42976644d35e910b2079c3f58b58ac | same |
| Tree | 3341ca64f7ad4cba0a8aa0d3a6d04bbef36e6f6a | same |
| Worktree | clean | clean |
| All tracked-file aggregate SHA-256 | f71e15f6f743d3d9a83746d8a8b7549c0ca9a79d4f24dd4f4685d2326ac8ab41 | same |
| Tracked-reports aggregate SHA-256 | 90f156009535d9ea07951b2822a6462353abe42a8e3d66522461469d8752379f | same |
| Random report SHA-256 | 88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34 | same |

The audit checkout remained clean after every local command. Runtime manifests and mismatch artifacts remained under temporary paths outside the repository.

## 11. Closure disposition

This recheck closes R6-A11-01 because:

1. Audit 11 is byte-preserved and accurately indexed under its historical verdict;
2. all current Round 5 status locations record Audit 10 closure;
3. canonical Schema v1 identities and bytes remain unchanged;
4. current Round 6 status locations accurately record the checked-in oracle, corpus, profiles, CI gate, substantive Audit 11 disposition, and completed remote evidence;
5. P1-07, Round 6, P1-06, and Stage 0 were not prematurely closed before this recheck;
6. the repair is documentary only;
7. no Round 7 implementation is present;
8. the repair-commit FAST run and all focused local checks pass; and
9. the repository remains clean and byte-stable outside the documented repair.

P1-07 is therefore closed only for the checked-in independent bounded conformance system and CI gate under Audit 11's exact semantic, identifier, profile, and provenance boundaries. The finite evidence is not upgraded to a mathematical proof or broadened beyond those bounds.

## 12. Remaining open boundaries

- P1-06 result/report terminology remains OPEN for Round 7.
- Stage 0 remains OPEN.
- Legacy compact/share URLs remain uncertified for general lossless identifiers.
- Formula Schema v1 knowledge semantics remain character-wise.
- Raw and browser formula grammars remain distinct.
- FAST/FULL and the 73-case corpus remain bounded computational evidence.
- BAPAL class-subset enumeration remains exponential in the number of valuation classes.

## 13. Next-round authorization

Round 7 terminology/documentation closure is authorized.

Round 7 may address P1-06 under the existing change-discipline rules. It must not claim Stage 0 closure; Stage 0 still requires its later dedicated closure audit after P1-06 is resolved.

