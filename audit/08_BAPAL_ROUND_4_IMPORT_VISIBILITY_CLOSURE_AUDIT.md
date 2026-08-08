# BAPAL Round 4 Atomic Import and Semantic Visibility Closure Audit

- **Repository:** `Raycaesar/bapal`
- **Branch:** `bapal-core`
- **Audit date:** 2026-08-08 UTC
- **Final audited HEAD:** `ab26863374464dd1466286a6c31d19d8e1a39a66`
- **Round 4 implementation commit:** `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`
- **Mode:** concentrated, read-only closure audit

## Verdict

**PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5**

P1-04 is closed narrowly for transactional import of the documented legacy compact-model format. P1-05 is closed narrowly for the documented browser atom policy and visible/disclosed semantic-state contract. This verdict does not certify a versioned schema, does not extend the foundational semantic claim, and does not close P1-06, P1-07, or Stage 0.

No repository defect or documentation defect requiring a local repair was found.

## 1. Candidate identity and exact history

| Role | Exact commit | Finding |
|---|---|---|
| Original baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` | Supplied baseline |
| Round 1 | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` | Supplied identity retained |
| Round 2 | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` | Supplied identity retained |
| Original complete Round 3 candidate | `6bd33697491820db3d0999ac7c7ccf99b05291d5` | Supplied identity retained |
| Audit 06 final HEAD | `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c` | Parent of focused repair |
| Round 3 rendering-repair commit | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` | `repair round 3 raw-label relation rendering` |
| Audit 07 reviewed commit | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` | P1-03 and Round 3 closed narrowly here |
| Round 4 implementation commit | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` | `close round 3 and implement round 4 atomic import visibility` |
| Final branch HEAD | `ab26863374464dd1466286a6c31d19d8e1a39a66` | `add round 4 implementation log` |

The exact post-Audit-06 sequence is:

```text
04f264a5e5900719eb70a0eaf77bd64f73b3ef0c
  -> 3f27ac2d4476ecc23da0358f23f2ced87db5500d
  -> 5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea
  -> ab26863374464dd1466286a6c31d19d8e1a39a66
```

Commit metadata confirms a single parent at every step. The implementation diff `3f27ac2..5c89ab5` contains 11 paths, 1,978 insertions, and 87 deletions. The final diff `5c89ab5..ab26863` adds only `revision/05_ROUND_3_CLOSURE_AND_ROUND_4_IMPLEMENTATION_LOG.md` with 556 lines. Final HEAD therefore differs from the Round 4 implementation commit only by one Round 4 log-only commit.

Audit 07 reviews `3f27ac2`; its report artifact is first added to repository history as part of `5c89ab5`. Those are distinct administrative facts and are not a commit-identity conflict.

## 2. Scope and method

The requested files were read in the prescribed order. The review then inspected all new parser/import and semantic-state helpers, the application boundary, HTML/CSS, the two new checks, inherited deterministic checks, exact diffs, and commit history. Audit 07's focused closure was treated as authoritative and Round 3 was not reopened. Its generic relation renderer was regression-tested only because Round 4 calls it and exposes its state.

All repository operations were read-only. Temporary independent scripts were created outside the repository. The audited clone was clean before and after execution.

## 3. Part I — Audit 07 administration

**Result: PASS.**

- `audit/00_AUDIT_INDEX.md` contains the Audit 07 entry, its exact PASS verdict, reviewed commit `3f27ac2`, P1-03 closure, Round 3 closure, Stage 0 open status, and Round 4 authorization.
- The repository Audit 07 file has SHA-256 `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2`.
- The supplied read-only Audit 07 artifact has the same SHA-256. The files are byte-identical.
- `AGENTS.md`, the specification, and the repair register consistently mark P1-03 closed at `3f27ac2` and Round 3 closed while keeping Stage 0 open.
- The inherited 5/5 production rendering harness passes. Raw labels, `x`, arbitrary punctuation/Unicode labels, explicit stroke, direction markers, marker deduplication, label identity, overlap geometry, and S5 synchronization remain intact.

Audit 07 therefore remains administratively and technically preserved.

## 4. Part II — P1-04 reproduced before Round 4

The reproduction used pre-Round-4 commit `3f27ac2` and began each attempt with this valid model:

```text
ApS0a,2b,;;AqS0b,2a,;ArS3x,
```

Every malformed load returned JavaScript `undefined`, threw no exception, provided no explicit failure object, and destructively replaced the prior model with a parsed prefix or silently altered transition material.

| Malformed category | Attempt | Exact old result |
|---|---|---|
| Broken middle state | `ApS;BROKEN;AqS` | `ApS` |
| Missing live-state `A` | `ApS;pS;AqS` | `ApS` |
| Missing state separator | `ApS;Aq;ArS` | `ApS` |
| Invalid target text | `ApSza,;AqS` | `ApS;AqS` |
| Out-of-range target | `ApS9a,;AqS` | `ApS;AqS` |
| Target into null slot | `ApS1a,;;AqS` | `ApS;;AqS` |
| Missing agent | `ApS1,;AqS` | `ApS;AqS` |
| Unexpected suffix | `ApS1ab,;AqS` | `ApS1b,;AqS` |
| Malformed late state | `ApS;AqS;ArS;BROKEN;AtS` | `ApS;AqS;ArS` |

The required minimized input `ApS;BROKEN;AqS` thus reproduced the P1-04 failure exactly: the complete valid prior model was cleared, the valid prefix `ApS` was retained, and no explicit complete failure was returned.

## 5. Part III — Atomic implementation audit

**Result: PASS on all twelve requested properties.**

| Requirement | Finding |
|---|---|
| 1. Complete parsing before mutation | `MPL.parseModelString()` is pure and builds complete plain data before the model loader is allowed to commit. |
| 2. Complete transition validation | Every token, full numeric target, one-code-point label, safe-integer condition, range, and live target is validated after all stable slots are known. |
| 3. No malformed suffix ignored | Unconsumed state/transition material produces structured errors such as `UNEXPECTED_TRANSITION_MATERIAL`. |
| 4. No partial prefix retained | All minimized and generated failures leave the exact previous raw state array unchanged. |
| 5. Structured errors | Failures return `{ok:false,error:{code,message,offset,stateIndex,tokenIndex,token,...}}`; non-string input is also explicit. |
| 6. Exact rollback | The sole model mutation is `_states = nextStates` after parse, validation, and clone preparation succeed. Preparation exceptions return `COMMIT_PREPARATION_FAILED` without mutation. |
| 7. Stable null slots | Semicolon slots, including leading/internal/trailing nulls, preserve raw length and indices. Direct `""` remains one explicit null slot. |
| 8. Target validation | Targets must be safe integers, in range, and point to live rather than null slots. |
| 9. Valid old links compatible | The 16-case permanent corpus, existing share/report links, duplicate suppression, multi-digit targets, `x`, and one-code-point Unicode labels pass. |
| 10. Startup retains a valid model | Startup first loads valid default `;AS`; malformed or unsupported URL imports retain it, skip formula evaluation, expose an error, and do not rewrite history. Direct loader failures retain any prior model. |
| 11. No partial D3 or S5 mutation | Startup builds D3 only after accepted import. An executable S5-on application snapshot remained byte-equivalent across six malformed categories and one unsupported-atom boundary rejection, including model, nodes, visual links, S5 flag/switch/ARIA/text, inspector, and history. |
| 12. No false Round 5 schema | The implementation explicitly defines and validates the legacy compact grammar. It adds no version field, JSON interchange schema, or general identifier claim. |

The accepted compact assignment keys remain one ASCII word character other than reserved `A`/`S`. Transition labels remain exactly one Unicode code point. That is the documented legacy compatibility boundary, not a versioned schema.

## 6. Part IV — Independent parser oracle and 250,000-case fuzz

A separate temporary oracle was written without calling the production parser. It separately tokenized stable semicolon slots, assignment characters, comma records, full decimal targets, and final Unicode code-point relation labels; it independently checked safe integers, target range/live status, and duplicate suppression.

| Metric | Observed |
|---|---:|
| Independent seed | `608135816` (`0x243f6a88`) |
| Total candidates | 250,000 |
| Oracle-accepted and production-accepted | 125,000 |
| Oracle-rejected and production-rejected | 125,000 |
| Accepted cases containing null slots | 101,538 |
| Accepted cases containing multi-digit targets | 60,088 |
| Accepted cases containing relation `x` | 105,239 |
| Accepted cases containing Unicode relation labels | 110,699 |
| Stable error-code/location probes | 10 |
| Non-string structured-error probes | 1 |
| Mismatches | 0 |

For every accepted string, both the pure parse result and committed model were canonicalized and compared exactly with the independent oracle, including stable null slots, assignments, source/target indices, relation-label identity, and set-like transition deduplication.

For every rejected string, the exact canonical raw model snapshot before and after `loadFromModelString()` was compared. All 125,000 rejected cases preserved the complete prior model. Since the parser/loader has no D3 or application S5 references, it cannot mutate those layers; that source boundary was additionally checked in the executable application with S5 already on. Six malformed categories plus unsupported browser atom `x` left the complete model/D3/S5/inspector/history snapshot unchanged.

The independent fuzz script SHA-256 was `877e188f2161abf074f34103dd9ea28684af940e382389d7d0381f3812959ff3`. Its failure record includes seed, case index, input, oracle result, production parse/load results, exception, and exact before/after snapshots. There were no failures to minimize; minimized failure count is zero.

This run is separate from both the permanent seed `0x041c0a11` and the implementation log's earlier temporary seed `0x7a4e19d3`.

## 7. Part V — P1-05 reproduced before Round 4

At `3f27ac2`, the following semantic facts were active without an authoritative visible semantic-state inspector:

| Probe | Pre-repair semantic result | Pre-repair visible result |
|---|---|---|
| Hidden supported `r/s/t` at two rows | Raw assignment was `{r:true,s:true,t:true}`; direct truth for all three and BAPAL `^t` was true | Node label was only `¬p, ¬q` |
| Raw `foo` and `bar_baz` | Both remained true in the raw model and direct atomic truth | Node label was only `¬p, ¬q` |
| Browser compact atom `x` | `AxS` was accepted; raw `x` and direct `x` truth were true | Node label was only `¬p, ¬q`; no import error existed |
| Relation `x` | Stored and visibly rendered after Audit 07; it affected reachability, knowledge, and S5 relevant-agent policy | No disclosure that `x` was active but lacked a selection button |
| Self-loops | Two stored `x` loops remained semantic relation data | No stored-loop or projection count/disclosure |
| Null slots | Stable null indices `[0,2]` and live node IDs `[1,3]` existed | No stable semantic snapshot or null-index disclosure |

Hidden/raw valuations can affect atomic truth, Boolean valuation classes, and BAPAL quantification. Relation labels and loops can affect knowledge and S5 normalization. Those were the previously undisclosed semantic effects relevant to P1-05.

## 8. Part VI — Semantic-state visibility audit

**Result: PASS on all fourteen requested properties.**

| Requirement | Finding |
|---|---|
| 1. Exact browser atom policy | Compact browser assignments support exactly `p`, `q`, `r`, `s`, and `t`. The policy is documented consistently. |
| 2. Unsupported browser atoms atomic | `AxS` parses as legacy data but browser-boundary validation returns `UNSUPPORTED_BROWSER_ATOM` before model commit. |
| 3. Raw unsupported atoms disclosed | Programmatic raw `foo`, `bar_baz`, and injection-shaped keys remain semantically authoritative and appear under `unsupportedTrueAtomKeys` with warnings. |
| 4. Hidden supported atoms disclosed | Reducing rows exposes true hidden `r/s/t` under `hiddenSupportedTrueAtomKeys`. |
| 5. `varCount` does not mutate valuations | Exact semantic snapshots are identical before/after display-count changes. `setVarCount()` changes projection and refreshes the inspector only. |
| 6. BAPAL truth unchanged by display count | Direct BAPAL truth remained identical; native `^t` evaluation stayed true after hiding `t`. |
| 7. Relation labels disclosed | All active raw labels are listed, independently of the five selection buttons. |
| 8. `x` visibly rendered | `x` appears in the semantic inspector and as a painted labelled SVG path with existing direction/identity markers. |
| 9. Self-loops disclosed | Stored loop count and `projectionDifferences.hiddenStoredSelfLoops` distinguish semantic loops from non-loop graph projection. |
| 10. Null slots disclosed | `semanticWorlds` preserves nulls and `nullWorldIndices` lists their exact stable positions. |
| 11. No lossy compact snapshot | `SemanticState.buildSnapshot()` reads `model.getRawStates()` directly. Replacing `getModelString()` with a throwing function did not affect inspector refresh. |
| 12. Visual projection separate | `semanticWorlds`/stored transitions and `visualNodes`/`visualNonLoopLinks` are separate fields, with explicit missing/extra descriptor differences. |
| 13. Raw strings escaped | Inspector/warnings and SVG raw-label text use text boundaries. Injection-shaped atom/agent strings created text only, with no `script`/`img` element. |
| 14. Required synchronization | Startup, world add/delete, valuation edit, display-row change, relation add, S5 enable/disable/normalization, public announcement, and explicit model-load paths refresh or disclose the inspector. |

In the executable S5 normalization probe, the one-way `x` model became 14 stored transitions across the five selectable agents plus `x`, including 12 disclosed stored self-loops, while retaining one visible non-loop `x` descriptor. This confirms that semantic storage and visual projection are reported separately.

## 9. Part VII — Browser/model/D3 audit

### Native cloud Chrome observations

The deployed application was exercised in native Chrome for the following completed paths:

| Path | Native observation |
|---|---|
| Valid URL import `AS1x,;AS` | Two live worlds; active/unselectable relation `x`; one stored transition; one visible descriptor; painted `x` stroke, direction marker, and label; no projection disagreement. |
| Malformed URL `ApS;BROKEN;AqS` plus formula | Default `[null, live empty world 1]` retained; visible `MISSING_STATE_START` alert; S5 Off; formula not evaluated; no partial links/history rewrite. |
| Unsupported atom URL `AxS` plus formula | Default retained; visible `UNSUPPORTED_BROWSER_ATOM` alert; S5 Off; formula not evaluated. |
| Hidden key/truth | `AtS` evaluated `^t` true; after reducing displayed rows to one, inspector disclosed hidden `t`, the model retained `t`, and reevaluation remained true. |
| Inspector semantics | The `<details>/<summary>` inspector was present and collapsed by default; active semantic JSON and warnings were readable. |

The browser-control transport timed out while targeting the visually hidden S5 checkbox and could not be recovered for further native interaction. No local Chromium, Chrome, Firefox, or other native browser executable was installed. Consequently, native keyboard activation, native S5 confirmation, public announcement, and a final native console-log read could not be completed. This is an audit-environment boundary, not an observed application failure.

### Strongest executable substitute for the remaining paths

Production `MPL.js`, `s5-policy.js`, and `app.js` were executed under the repository's VM/DOM/D3 harness, augmented by a separate exact-state probe:

- S5 normalization of one-way `x` completed and synchronized the model, D3 descriptor, switch state, ARIA state, text state, and inspector.
- Six malformed categories and one unsupported browser atom preserved the complete S5-on application snapshot exactly.
- Formula `^K{a}p` evaluated true at both fixture worlds.
- Public announcement of `p` removed the false world, left the expected null slot, removed its transitions and visual link, and refreshed the inspector.
- The run recorded zero uncaught execution errors.
- The permanent visibility and rendering checks independently exercise safe strings, startup errors, formula flow, mutation synchronization, SVG paths/markers, and static accessibility attributes.

This combination is sufficient to close the code and semantic defects while preserving the native-interaction boundary explicitly.

## 10. Part VIII — Test audit and deterministic execution

### New-test quality

`scripts/check-atomic-model-import.js` contains a structurally separate test-local legacy validator. It does not call `MPL.parseModelString()` as its oracle. Its PRNG seed and exact case counts are fixed; failures print the seed, case index, input, oracle/production results, thrown exception, and exact before/after snapshots. It has no skip path and exits nonzero on failure.

`scripts/check-semantic-state-visibility.js` is a deterministic set of 11 named fixtures rather than a generated corpus, so a PRNG seed is not applicable. Expected raw assignments, counts, labels, nulls, truth, SVG state, escaped text boundaries, and update-path results are asserted explicitly. It uses production code for the snapshot under test and therefore is not itself an independent semantic oracle; the external parser oracle, direct raw-model comparisons, native observations, and independent application snapshot probe supply the audit-level independence. It has no skip path and exits nonzero on failure.

Neither new script contains tracked-file writes. The tracked-file aggregate SHA-256 was identical before and after all required commands:

```text
77d59a4aa105e9d167b5354bc1300b9e2dda9b6b533df061c46a22d76828b84d
```

The reports tree remained `13c7ea07febaa8b176a9e628772d9f9e0e159547`, and the worktree status remained empty.

### Required command results at final HEAD

| Command | Result |
|---|---|
| `node scripts/check-semantic-state-visibility.js` | PASS, 11/11 groups |
| `node scripts/check-atomic-model-import.js` | PASS; 9 minimized; 16 compatibility; seed `0x041c0a11`; 100,000 = 50,000 accepted + 50,000 rejected/exact rollback; 3 startup cases |
| `node scripts/check-agent-rendering.js` | PASS, 5/5 groups |
| `node scripts/check-s5-invariants.js` | PASS, 12/12 groups; 531 exhaustive relations; seed `0x0055f503`; 10,000 sequences/200,000 operations |
| `node scripts/check-formula-roundtrip.js` | PASS, 108,246 AST round trips and 3 display smokes |
| `node scripts/check-structural-copy-regressions.js` | PASS, 11/11 regressions |
| `node scripts/check-bapal-regression.js` | PASS, 8/8 checks |
| `node scripts/check-logic-regressions.js` | PASS, 6/6 checks |
| `node scripts/check-s5-closure.js` | PASS, 4/4 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS |
| `node scripts/check-report-links.js` | PASS, 5/5 tracked links |
| `git diff --check` | PASS, no output |

The post-suite `git status --porcelain=v1` was empty. No report generator or tracked report was run or rewritten.

## 11. Part IX — Prior repair and scope preservation

**Result: PASS.**

- `lib/formula-parser.min.js` is unchanged across `3f27ac2..5c89ab5`.
- The parser configuration, `_asciiToJSON()`, `_announcementPreconditionNeedsParentheses()`, and `_jsonToASCII()` printer closure are unchanged.
- `_truth()` and exported `truth()` clauses are unchanged; all BAPAL/PAL/logic checks pass.
- `deepCopy()` is unchanged; 11/11 structural-copy regressions pass.
- `js/s5-policy.js` is unchanged; the complete S5 invariant and closure suites pass.
- The Audit 07 `AgentRendering` implementation is unchanged. Round 4 adds inspector refresh/disclosure around the projection but does not replace raw-label rendering.
- `scripts/random-bapal-evaluation.js` and `reports/` are unchanged.
- `reports/random-bapal-evaluation.html` remains SHA-256 `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34`.
- A path-scoped comparison over the formula parser, S5 policy, report generator, and reports produced zero changed paths.

The only `js/MPL.js` Round 4 hunks add/export the pure compact parser, replace the destructive loader, and expose raw states for lossless inspection. They do not alter the formula parser/printer, truth evaluator, structural copy, or S5 equivalence-closure algorithms.

## 12. Part X — Documentation and implementation-log accuracy

**Result: PASS.**

- `AGENTS.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, and `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` mark P1-04/P1-05 **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT** at the candidate, keep P1-06/P1-07 open, and keep Stage 0 open.
- They consistently document browser atoms `p`–`t`, one-code-point compact relation labels, visible raw-model disclosure, and the difference between assignment atom `x` and relation label `x`.
- They explicitly disclaim a Round 5/versioned JSON schema and general identifier round-tripping.
- `revision/05_ROUND_3_CLOSURE_AND_ROUND_4_IMPLEMENTATION_LOG.md` correctly records the commit identities, pre-repair failures and exact old results, 11-path implementation diff, permanent seeds/counts, required test outcomes, unchanged-report hash, audit hashes, scope exclusions, browser limitation, and open P1-06/P1-07/Stage 0 status.
- Its audit hashes match the files at final HEAD, including Audit 07 SHA-256 `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2`.
- Its own SHA-256 at final HEAD is `3910b6591e93b2e03a723188173d665c5edac58665c2ce58a7b88b9daca0f69e`.

The log speaks from the implementation-candidate worktree, where it was the sole untracked post-candidate file and HEAD was `5c89ab5`. It explicitly predicts that a later documentary commit may add only that file. Final commit `ab26863` is exactly that predicted commit. The historical wording is therefore accurate, not stale implementation identity.

The earlier temporary independent run recorded in the log is not retained as a checked-in reproducible artifact; the log identifies permanent independent conformance/CI as P1-07 work. This audit did not treat that historical transcript as its sole oracle: it executed a new independently seeded 250,000-case oracle and recorded its own counts above.

## 13. Closure disposition

This audit closes only:

- **P1-04 — atomic legacy compact-model import**, at implementation commit `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`, preserved at final log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66`;
- **P1-05 — visible/disclosed semantic state**, under the exact browser/raw-model policy documented by Round 4, at the same implementation commit and final HEAD.

The following remain open or deferred:

- **P1-06 — result/report terminology:** open;
- **P1-07 — permanent independent oracle and CI gate:** open;
- **Round 5 versioned model/formula schema:** not implemented or certified by this audit;
- **Stage 0:** open;
- multi-character legacy compact identifiers and full end-to-end identifier round-tripping: not claimed;
- native keyboard/computed-layout coverage beyond the completed browser paths: environment-bounded as stated above.

The foundational semantic claim is not broadened. Round 5 is authorized to begin as separately reviewable schema work.

**Final verdict: PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5.**
