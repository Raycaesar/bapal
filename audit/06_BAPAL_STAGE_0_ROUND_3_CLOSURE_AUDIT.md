# BAPAL Playground Stage 0 Round 3 Closure Audit

## 1. Audit identity and verdict

**Repository:** `Raycaesar/bapal`  
**Branch:** `bapal-core`  
**Original foundational baseline:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`  
**Round 1 implementation:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`  
**Round 2 implementation:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`  
**Round 2 final log-only HEAD:** `f7c7d599afca5622c227ea51d930dfd14005b016`  
**Complete Round 3 implementation candidate:** `6bd33697491820db3d0999ac7c7ccf99b05291d5`  
**Final audited branch HEAD:** `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`  
**Audit date:** 2026-08-04 UTC  
**Audit checkout:** clean before and after all commands  
**Repository modifications by this audit:** none

### Verdict

**PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR.**

The administrative recording of Audit 05 and closure of P1-01 pass. The Round 3 semantic/model policy also passes: the implementation computes the exact least equivalence closure for every relevant agent, preserves the invariant through the audited S5-on edits, respects confirmation and cancellation, and synchronizes a complete model-derived D3 link descriptor set.

One Round 3 acceptance requirement is not fully met. A stored one-character relation label outside the five browser buttons, such as `x`, is correctly included in the relevant-agent set, normalized, and represented in the D3 data projection, but its SVG path has no stroke class or fallback stroke and its marker definitions do not exist. The resulting non-loop `x` edge is not visibly rendered. This contradicts the fixed requirement that every non-loop closure edge appear in the graph. It also exposes a gap in the checked-in integration test, which checks descriptors and source strings but not computed rendering.

The closure disposition is therefore:

- **Round 2 administrative closure and P1-01 recording: PASS.**
- **P1-02 S5 new-world invariant: CLOSED at `6bd3369` on the audited policy.**
- **P1-03 whole-model normalization and semantic invariant: implementation behavior passes, but P1-03 remains administratively OPEN pending the raw-label graph-rendering repair and a focused closure rerun.**
- **Stage 0: OPEN.** P1-04 through P1-07 and the previously recorded limitations remain outside this round.

No Round 1 or Round 2 semantic result was reopened. The foundational 6,501,302-case audit was not rerun.

## 2. Exact commit history and comparison boundaries

The exact commits after `f7c7d59` are:

| Order | Commit | Author time | Subject | Audited role |
|---:|---|---|---|---|
| 1 | `172a204e3520ec4939efe30a5031bb23c6e29bf4` | 2026-08-04T21:01:06+08:00 | `close round 2 and implement round 3 S5 invariants` | Initial Round 3 code, documentation, and test commit; incomplete because `app.js` references `S5Policy` without the helper or browser loader |
| 2 | `6bd33697491820db3d0999ac7c7ccf99b05291d5` | 2026-08-04T21:21:38+08:00 | `complete round 3 S5 policy integration` | Adds `js/s5-policy.js` and loads it before `app.js`; complete Round 3 implementation candidate |
| 3 | `edfafc977f95106fa5455fdcd34a41e27acb4c42` | 2026-08-04T21:40:35+08:00 | `add round 3 implementation log` | Adds only the Round 3 Markdown implementation log |
| 4 | `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c` | 2026-08-04T21:50:53+08:00 | `add round 3 implementation log` | Refines only that same log; final branch HEAD |

The complete implementation is the two-commit sequence `172a204` plus `6bd3369`; `172a204` alone is not executable as the committed browser application. The implementation commit to record is therefore `6bd33697491820db3d0999ac7c7ccf99b05291d5`.

The final HEAD differs from the complete implementation candidate only through Round 3 log content. More precisely, this is not one intervening commit but two successive log-only commits:

- `6bd3369..edfafc9`: adds only `revision/03_ROUND_2_ADMINISTRATIVE_CLOSURE_AND_ROUND_3_IMPLEMENTATION_LOG.md`;
- `edfafc9..04f264a`: modifies only that same file;
- net `6bd3369..04f264a`: one Markdown path, 543 insertions, no executable or test change.

Diff sizes and roles:

| Comparison | Result |
|---|---|
| `f7c7d59..172a204` | 8 files, 1,380 insertions, 60 deletions |
| `172a204..6bd3369` | 2 files, 159 insertions; `index.html` and new `js/s5-policy.js` only |
| `f7c7d59..6bd3369` | 10 files, 1,539 insertions, 60 deletions |
| `6bd3369..04f264a` | the Round 3 implementation-log path only |
| `92a4ba6..04f264a` | 22 files, 7,039 insertions, 64 deletions |

## 3. Part I — Audit 05 administrative recording

### 3.1 Indexing and byte preservation

Audit 05 is indexed in `audit/00_AUDIT_INDEX.md` with the correct Round 2 implementation commit, final Round 2 log-only HEAD, PASS verdict, P1-01 closure, and open Stage 0 status.

The repository copy and the previously delivered external artifact are byte-identical:

```text
15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709  audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md
15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709  prior delivered Audit 05
```

Audits 01–04 are unchanged from `f7c7d59`. Their current SHA-256 identities remain:

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087  audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md
```

### 3.2 P1-01 and Stage 0 status

The administrative state is accurate:

- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` marks P1-01 **CLOSED AT `e0c816f` — WORK MAX AUDIT 05**;
- `AGENTS.md` and `docs/BAPAL_PLAYGROUND_SPEC.md` describe the narrow supported-AST ASCII-printing closure and retain the raw/browser grammar distinction;
- none of these files says P1-01 is pending;
- Stage 0 remains explicitly open;
- P1-04 through P1-07 remain open;
- Round 4 is gated on Round 3 closure.

No Round 2 implementation code changed. `lib/formula-parser.min.js`, the Round 2 printer hunk, formula preprocessing, `deepCopy()`, the serializer, and `_truth()` are unchanged between `f7c7d59` and `6bd3369`. The only `MPL.js` production change is the added S5 equivalence predicate and whole-relation closure API. `app.js` changed only in the S5 UI/edit paths.

## 4. Part II — Independent pre-Round-3 reproduction at `f7c7d59`

The parent reproduction used the production `MPL.Model` at `f7c7d59` and a separate audit probe. It did not call the new policy helper.

### 4.1 P1-02: adding a world preserves only the selected agent

Starting relation sets for both `a` and `b` were the complete two-world equivalence relation. Agent `a` was selected. The legacy S5 world-addition path created world 2 and added only `2R_a2`.

Exact post-operation relations:

```text
a = {0->0, 0->1, 1->0, 1->1, 2->2}
b = {0->0, 0->1, 1->0, 1->1}
```

`a` remained reflexive; `b` was not reflexive because `2->2` was absent.

### 4.2 P1-03: the toggle performed no whole-model repair

For two worlds with only `0R_a1`:

```text
before a = {0->1}
after  a = {0->1}
legacy toggle state = true
a equivalence = false
```

Thus the UI policy could say S5 was on while the semantic relation remained one-way and non-reflexive.

### 4.3 Separate malformed component left incomplete

With six live worlds and input:

```text
a = {0->1, 2->3, 3->4}
```

the seeded legacy closure produced:

```text
a = {0->0, 0->1, 1->0, 1->1,
     2->2, 2->3, 3->3, 3->4, 4->4, 5->5}
```

The `{2,3,4}` component still lacked `2->4`, `3->2`, `4->2`, and `4->3`; the relation remained non-equivalent.

These exact results agree with the implementation log's pre-repair transcript.

## 5. Part III — Production code audit

### 5.1 Whole-relation implementation

`Model.isEquivalenceRelation()` delegates to the existing reflexive, symmetric, and transitive predicates (`js/MPL.js:436-444`). `Model.closeEquivalenceRelation()` (`js/MPL.js:475-529`) gathers only live worlds, builds undirected support from valid same-agent edges, traverses every component, and calls duplicate-suppressing `addTransition()` for every ordered pair within each component. `closeEquivalenceRelations()` deduplicates, filters empty labels, sorts, and closes agents independently (`js/MPL.js:531-542`).

The policy helper computes the sorted relevant-agent union and separates planning, confirmation, mutation, assertion, and projection (`js/s5-policy.js:12-145`). The browser loads that helper before `app.js` (`index.html:391-395`).

### 5.2 Requirement-by-requirement result

| # | Requirement | Result | Evidence |
|---:|---|---|---|
| 1 | Relevant agents include a–e | PASS | `getRelevantAgents()` begins with the declared set; browser passes `epistemicAgents` |
| 2 | Include every stored relation label | PASS | `model.getActiveAgents()` is unioned into the set |
| 3 | Include selected agent | PASS | selected agent is added when nonempty |
| 4 | Deterministic and deduplicated set | PASS | `Set` plus `.sort()`; independent dedup/sort probe passed |
| 5 | Whole relation covers every component | PASS | traversal begins at every unvisited live world |
| 6 | Existing edges preserved | PASS | closure only calls `addTransition()`; exhaustive superset checks passed |
| 7 | Distinct components not joined | PASS | completion is confined to each independent component |
| 8 | Isolated worlds receive loops | PASS | each isolated live world forms a singleton component |
| 9 | Null worlds stay null | PASS | null slots are skipped and never passed to `addTransition()` |
| 10 | Invalid targets are not introduced | PASS | invalid targets do not enter adjacency; public transition API rejects invalid endpoints; an injected pre-existing invalid record remained one record rather than being multiplied |
| 11 | Single-agent merge does not alter other agents | PASS | `addRelation()` closes only its `agent`; independent and checked-in comparisons passed |
| 12 | Closure is idempotent | PASS | exact exhaustive second-closure comparisons produced zero changes |
| 13 | Cancellation occurs before mutation | PASS | confirmation is evaluated before line 61 mutation; snapshot tests passed |
| 14 | Cancellation keeps switch off | PASS | `app.js:470-474` resets semantic flag and switch state; VM integration passed |
| 15 | Already-S5 enable does not modify model | PASS | policy returns before mutation and requests no confirmation; snapshots passed |
| 16 | Accepted normalization verifies before On | PASS | policy asserts at `s5-policy.js:62`; app sets `s5ModeEnabled` only at `app.js:483` |
| 17 | Graph projection refreshed | PASS | accepted normalization, relation merge, and deletion call `syncVisualLinksFromModel()` |
| 18 | Non-loop closure edges are visible | **FAIL for stored labels outside a–e** | descriptor exists, but renderer and CSS supply no stroke or marker for `x`; see Section 8 |
| 19 | Semantic loops remain stored when hidden | PASS | closure stores loops; `buildLinkProjection(..., true)` alone hides them from the projection |
| 20 | New world preserves every relevant relation | PASS | `addWorld()` adds one loop for every recomputed relevant agent and then asserts all relations |
| 21 | Relation addition merges only intended classes | PASS | adds the selected-agent bridge, then closes only that relation; class and unrelated-agent checks passed |
| 22 | World deletion preserves S5 | PASS | `removeState()` restricts all relations; policy immediately asserts equivalence |
| 23 | Delete/L/R/B selected-edge guards remain | PASS | four guarded paths at `app.js:1078,1089,1108,1152`; VM key execution passed |
| 24 | Disabling S5 does not mutate relations | PASS | disable branch changes UI/policy state only; snapshot passed |
| 25 | Parser, printer, truth evaluator, deepCopy, serializer unchanged | PASS | exact candidate diff contains no hunk in those slices; all inherited deterministic regressions pass |

### 5.3 Least-equivalence-closure properties

The implementation matches the fixed policy. For each agent, the directed input is interpreted as undirected support; connected components are completed to all ordered pairs. This is the unique least equivalence relation containing the input: every equivalence superset must relate all vertices connected by an input path, while the implementation introduces no relation between separate components.

The method does not sanitize an already-corrupt raw successor record targeting an invalid world. That is outside the Round 3 closure contract. The independent corruption probe had one invalid record before and one after closure, showing that closure did not introduce additional invalid targets.

## 6. Part IV — Independent exhaustive least-closure oracle

The independent oracle used a disjoint-set/component construction; it did not import, translate, or call the production closure implementation, whose traversal is breadth-first search. It exhausted every directed relation on zero through four labelled worlds.

| Live worlds | Directed relations exhausted |
|---:|---:|
| 0 | 1 |
| 1 | 2 |
| 2 | 16 |
| 3 | 512 |
| 4 | 65,536 |
| **Total** | **66,067** |

Exact aggregate checks:

| Check | Count | Failures |
|---|---:|---:|
| Directed relation cases | 66,067 | 0 exact-edge failures |
| Input edges examined | 526,625 | 0 superset failures |
| Expected closure edges compared | 1,025,642 | 0 exact-set failures |
| Component-pair leastness checks | 1,053,250 | 0 |
| Required distinct-component nonedges | 27,608 | 0 |
| Reflexivity/symmetry/transitivity cases | 66,067 each | 0 |
| Idempotence cases | 66,067 | 0 |
| Unrelated-agent mutation cases | 66,067 | 0 |

Additional sparse-null, deterministic batch deduplication, and relevant-agent sorting probes passed. No counterexample existed to minimize within the exhaustive bound.

## 7. Part V — Independent multi-agent event sequences

The separate audit generator used independent seed `1779033703` (`0x6a09e667`), not either repository seed or the implementation log's earlier external-review seed. It ran 25,000 sequences of 24 operations: exactly 600,000 operations.

Coverage included:

- initial live-world counts 0–8, with exact histogram `2778,2778,2778,2778,2778,2778,2778,2777,2777`;
- declared agents `a`–`e` and raw labels `alice`, `agent_b`;
- malformed initial relations and multiple components;
- enable/accept, enable/cancel, already-S5 enable, disable, add world, add relation, delete world, selected-agent change, malformed off-mode injection, and Delete/L/R/B attempts;
- an independent equivalence oracle and independent semantic/D3 descriptor comparison after every operation while S5 was on;
- canonical no-mutation snapshots for every rejected or cancelled operation.

Exact operation results:

| Operation | Attempts | Accepted | Rejected |
|---|---:|---:|---:|
| Change selected agent | 50,101 | 50,101 | 0 |
| Enable/accept path | 50,181 | 31,247 | 18,934 |
| Enable/cancel path | 49,848 | 0 | 49,848 |
| Disable | 49,709 | 18,730 | 30,979 |
| Add world | 49,886 | 43,643 | 6,243 |
| Add relation | 49,663 | 44,781 | 4,882 |
| Delete world | 50,019 | 36,034 | 13,985 |
| Edge Delete | 50,257 | 22,469 | 27,788 |
| Edge L | 49,839 | 22,179 | 27,660 |
| Edge R | 49,950 | 22,289 | 27,661 |
| Edge B | 50,229 | 22,394 | 27,835 |
| Inject malformed off-mode edge | 50,318 | 24,693 | 25,625 |

The S5-on blocked subsets were 13,159 Delete, 13,197 L, 13,191 R, and 13,350 B operations. The generator observed 25,058 accepted confirmations, 24,481 cancelled confirmations, and 6,189 already-S5 enables. It performed 239,738 invariant checks, 239,738 projection checks, and 261,440 rejected/cancelled no-mutation checks.

**Failures: 0.** No minimized failure was produced.

## 8. Part VI — UI/browser and graph audit

### 8.1 Native browser boundary

The cloud Chrome session opened the deployed playground with a one-way model and exposed the Round 3 S5 switch and graph. During the first confirmation-dialog interaction, the CDP tab became unavailable. Subsequent tab listing and fresh-tab creation both timed out. The local runtime has the Playwright library but no installed Chromium, Firefox, or WebKit executable. Therefore this audit does not claim a complete native-browser event run.

### 8.2 Strongest executable substitute

A temporary Node VM executed the complete production `MPL.js`, `s5-policy.js`, and `app.js` with DOM/D3 stubs. It called the application's own functions and key handlers rather than reproducing their logic. The executed sequence:

1. loaded a two-world one-way non-S5 model;
2. injected a raw stored label;
3. enabled S5 and cancelled;
4. checked switch Off plus exact semantic-model and link-array snapshots;
5. enabled again and accepted;
6. checked switch On, stored loops, all relevant equivalence relations, and projection refresh;
7. added world 2 through the real `mousedown()` path;
8. merged `a` classes through `addRelationForCurrentMode()` as used by drag completion;
9. deleted a world through the real Delete-key path;
10. invoked real selected-link Delete/L/R/B key handlers and compared exact snapshots;
11. disabled S5 without mutation;
12. re-enabled the already-S5 model without confirmation or mutation.

The VM observed two confirmation calls, relevant agents `a,b,c,d,e,raw_agent`, final live worlds `0,2`, five URL/history updates, and zero semantic/projection/key-guard failures.

### 8.3 Blocking minimized rendering counterexample

The strongest substitute does not compute CSS. Static inspection found a counterexample that the descriptor-level checks miss.

Use the valid one-character compact model:

```text
AS1x,;AS
```

It has two live worlds and the stored one-way relation `0R_x1`. The Round 3 policy correctly normalizes it to:

```text
x = {0->0, 0->1, 1->0, 1->1}
```

The post-normalization D3 descriptor is also correct:

```json
{
  "sourceId": 0,
  "targetId": 1,
  "agent": "x",
  "left": true,
  "right": true
}
```

Rendering nevertheless fails:

- `app.js:647-651` and `app.js:660-664` assign stroke classes only for `agent-a` through `agent-e`;
- marker URLs are formed for `x` at `app.js:635-643`, but marker definitions are created only by iterating the declared a–e array;
- `css/app.css:228-232` gives `path.link` a width but no fallback `stroke`;
- only `.agent-a` through `.agent-e` provide a stroke (`css/app.css:234-253`);
- the initial SVG `stroke` value is `none`.

Consequently the `x` path exists in the data join but has no visible stroke, arrow, or agent marker. This is within the audited one-character serialization boundary and within the explicit Round 3 relevant-agent policy. It is not a deferred multi-character-agent issue.

Required closure repair: provide a deterministic visible rendering and direction/label treatment for every stored relevant-agent label, or reject unsupported labels before they enter the claimed S5 model/UI contract. A focused browser/computed-style regression must cover at least one imported label outside a–e. No repair was implemented by this audit.

## 9. Part VII — Checked-in test audit

`scripts/check-s5-invariants.js` is a useful deterministic invariant suite and passed all twelve groups.

| Required property | Result |
|---|---|
| Independent test-local closure oracle | PASS; independent adjacency/component implementation |
| Exhaustive bounds and counts | PASS; all 531 relations on 0–3 worlds and 2,337 total input edges |
| Deterministic seed | PASS; `0x0055f503` |
| Declared agents a–e | PASS |
| Raw extra labels | PASS at model/policy level; `alice`, `agent_b` |
| P1-02/P1-03 minimized cases | PASS |
| Cancel/no mutation | PASS |
| Already-S5 no mutation | PASS |
| Class merge | PASS |
| New world | PASS |
| Deletion | PASS |
| Generated sequences | PASS; 10,000 sequences, 200,000 operations |
| Silent skipped failures | None observed; all groups run under explicit try/catch and any failure sets nonzero exit status |
| Tracked-file mutation | None; aggregate tracked hash unchanged |

The conditional helper load does not silently pass a missing integration: at the incomplete `172a204` commit, fallback behavior leaves seven groups failing. At the complete candidate the production helper is present and used.

The material test gap is Group 12. It verifies the policy projection and statically checks `app.js` integration strings; it does not instantiate a browser, compute CSS, confirm marker existence for raw labels, or test native event dispatch. Group 4 proves that extra labels are normalized but never hands such a descriptor to a computed renderer. This is why all twelve groups can pass while the minimized `x` relation remains invisible.

The generated group also selects only a–e; raw labels are covered separately rather than inside its event stream. That is acceptable for semantic closure when combined with Group 4, but it does not close the rendering gap.

## 10. Part VIII — Deterministic commands

The following commands were run at final HEAD `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c` under Node `v24.14.0`:

| Command | Exit | Observed result |
|---|---:|---|
| `node scripts/check-s5-invariants.js` | 0 | 12/12 groups pass; 531 exhaustive relations; 10,000 sequences; 200,000 operations; 97,793 accepted, 102,207 rejected |
| `node scripts/check-formula-roundtrip.js` | 0 | 108,246 round trips and 3 display cases pass |
| `node scripts/check-structural-copy-regressions.js` | 0 | 11/11 groups pass |
| `node scripts/check-bapal-regression.js` | 0 | 8/8 checks pass |
| `node scripts/check-logic-regressions.js` | 0 | 6/6 checks pass |
| `node scripts/check-s5-closure.js` | 0 | 4/4 checks pass |
| `node scripts/check-bapal-valuation-class.js` | 0 | valuation-order check passes |
| `node scripts/check-report-links.js` | 0 | all 5 links pass |

`git diff --check` produced no output. `git status --short` was empty before and after. The aggregate tracked-file hash was identical before and after all commands:

```text
8e9a8dc05870d6fdcf2fa390fbc2a81d6afe15c2b01a8f5f52c081d957747dea
```

No tracked or untracked repository file was created or changed. The aggregate report-generating command was not run because it rewrites a tracked report and was outside the requested deterministic command list.

## 11. Accuracy of the Round 3 implementation log

### 11.1 Accurate records

The log accurately records:

- the Round 2 commits and Audit 05 verdict;
- the incomplete role of `172a204` and complete-candidate role of `6bd3369`;
- the exact complete-candidate diff size;
- the pre-repair failures and relation sets;
- the production model/policy architecture;
- the checked-in suite's commands, seeds, counts, and PASS outputs;
- the unchanged parser/printer/evaluator/copy/serializer scope;
- Stage 0 and P1-04 through P1-07 as open;
- the absence of a native headless-browser run in its implementation review.

Its externally recorded exhaustive numbers—66,067 relations, 526,625 input edges, and 1,053,250 component-pair checks—were independently reproduced exactly. Its prior 25,000-sequence seed `0x9e3779b9` is a provenance statement for a temporary non-checked-in run and cannot be replayed from repository artifacts, but this audit corroborated the same policy with a distinct seed and 600,000 operations.

The log's reference to `edfafc9` is explicitly qualified as the HEAD at final-log generation. Final branch HEAD `04f264a` is the anticipated later documentary refinement and changes no implementation or test file.

### 11.2 Overbroad rendering claim

The log says the executable VM/stub review passed “visible non-loop synchronization,” and its supported-claims section says the D3 projection is synchronized. The descriptor claim is accurate. The word “visible,” if applied to all relevant stored labels, is not: the VM stubs do not compute CSS, and the `x` counterexample has no rendered stroke or marker.

The log should not be treated as evidence that all relevant-label edges are visibly rendered. Either the production renderer must be repaired or the statement must be narrowed to descriptor synchronization and the declared a–e rendering path. This is the only material Round 3 log overclaim found.

## 12. Closure decision and next gate

The semantic core of Round 3 is strongly supported within the stated finite bounds:

- 66,067 independently exhausted relations through four worlds;
- 600,000 independently generated multi-agent operations through eight worlds;
- the checked-in 531-relation and 200,000-operation suite;
- executable production app-function coverage through VM/DOM/D3 stubs;
- all inherited deterministic regressions.

This is testing evidence, not a proof for all possible models or event traces.

The remaining defect is narrow but is inside the fixed Round 3 graph contract. Round 4 should not begin until the raw-label rendering repair is committed and a focused closure audit verifies:

1. an imported one-character `x` edge has a visible stroke and direction/label representation before and after accepted normalization;
2. a normalized non-loop `x` closure edge is visible;
3. declared a–e rendering is unchanged;
4. cancel, already-S5, add-world, class-merge, deletion, Delete/L/R/B, and disable behavior still pass;
5. all eight deterministic commands remain clean and passing.

Until then, P1-03 and Round 3 remain open. P1-02 may be recorded as closed at `6bd3369`; Stage 0 remains open.
