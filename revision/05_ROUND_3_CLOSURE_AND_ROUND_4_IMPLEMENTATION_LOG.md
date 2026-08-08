# Round 3 Closure and Round 4 Implementation Log

## 1. Verdict

**PASS — READY FOR WORK MAX CLOSURE AUDIT**

Audit 07 has closed P1-03 and Round 3 under its focused raw-label rendering contract. The clean implementation candidate at `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` contains local implementations for P1-04 and P1-05 and passes the recorded deterministic and independent review evidence. P1-04 and P1-05 remain **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**; this log does not close them. P1-06, P1-07, and Stage 0 remain open.

## 2. Repository identity

- **Repository:** `Raycaesar/bapal` (`https://github.com/Raycaesar/bapal.git`)
- **Branch:** `bapal-core`
- **Foundational baseline:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` (`refine inteface and add bicondition`), committed 2026-07-06T09:09:43+08:00
- **Round 1 implementation:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2` (`new round check`), committed 2026-08-04T06:58:23+08:00
- **Round 2 implementation:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` (`close round 1 docs and implement round 2 parser printer closure`), committed 2026-08-04T09:02:07+08:00
- **Round 2 final log-only HEAD:** `f7c7d599afca5622c227ea51d930dfd14005b016`
- **Complete original Round 3 implementation candidate:** `6bd33697491820db3d0999ac7c7ccf99b05291d5` (`complete round 3 S5 policy integration`), committed 2026-08-04T21:21:38+08:00
- **Audit 06 final reviewed/log-only HEAD:** `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c` (`add round 3 implementation log`), committed 2026-08-04T21:50:53+08:00
- **Scoped Round 3 rendering-repair commit:** `3f27ac2d4476ecc23da0358f23f2ced87db5500d` (`repair round 3 raw-label relation rendering`), committed 2026-08-04T23:26:05+08:00
- **Audit 07:** `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md`, dated 2026-08-08 UTC, verdict **PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4**
- **Exact Round 4 implementation candidate:** `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` (`close round 3 and implement round 4 atomic import visibility`), committed 2026-08-08T23:43:58+08:00
- **Candidate state:** the required initial `git status --short` produced no output; all pre-log validation also left the candidate clean
- **Node:** `v24.18.0`
- **Foundational audit date:** 2026-08-03
- **Audit 06 date:** 2026-08-04 UTC
- **Audit 07 date:** 2026-08-08 UTC
- **Round 4 candidate date:** 2026-08-08 UTC+08
- **Log-generation date:** 2026-08-08 UTC+08

Current clean HEAD is the complete Round 4 implementation candidate. This run creates only this Markdown log and creates no commit. If the log is later committed, that later commit must be documentary-only: it will add this file while leaving the reviewed implementation identity at `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`.

## 3. Round 3 focused closure

Audit 06 returned **PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR**. It closed P1-02 and passed the semantic/model portion of P1-03, including relevant-agent discovery, confirmation and cancellation, least equivalence closure, S5-preserving edit paths, stored self-loops, and model-derived D3 descriptors.

Its remaining counterexample was the compact model:

```text
AS1x,;AS
```

The one-way semantic relation `0R_x1` was accepted and projected. Accepted S5 normalization correctly produced `x = {0->0, 0->1, 1->0, 1->1}` and one bidirectional non-loop descriptor. At `04f264a`, however, the `x` path had no usable stroke and referred to nonexistent raw-label marker definitions, so the relation was semantically present but invisible.

Commit `3f27ac2d4476ecc23da0358f23f2ced87db5500d` repaired only that rendering boundary. Every projected non-loop relation now receives a deterministic visible stroke, actual start/end markers matching its direction flags, and a visible mid-edge label containing the original semantic relation string. Unknown labels use injective Unicode-code-point SVG keys; definitions are deduplicated; raw strings are inserted as text; declared `a`–`e` keep their prior colors, keys, and geometry; stored self-loops remain semantic but hidden from the non-loop projection.

Audit 07 independently rechecked that repair and returned the exact verdict:

```text
PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4
```

Accordingly, P1-02 is closed at `6bd3369` by Audit 06, P1-03 is closed at `3f27ac2` by Audit 07, and Round 3 is closed. Stage 0 remains open.

## 4. Round 4 objectives

### P1-04 — non-atomic compact-model import

The inherited `Model.loadFromModelString()` cleared the current model before validating the complete input. A malformed late state or transition could silently leave a valid prefix, silently discard a transition, reinterpret malformed transition text, or replace a valid prior model without exposing an error. Round 4 must make the legacy compact boundary transactional: complete parse and validation first, one commit only after success, structured failure, and exact rollback on every failure.

### P1-05 — undisclosed semantic state

True atom keys hidden by the current row count, raw unsupported atom keys, relation labels outside the five buttons, stored self-loops, null slots, and semantic/graph projection differences could affect atomic truth, valuation classes, BAPAL truth, or S5 relevant-agent policy without being disclosed by the browser. Round 4 must either reject such data at the browser boundary or preserve and disclose it, while keeping raw programmatic `MPL.Model` values semantically authoritative.

## 5. Pre-repair P1-04 reproduction

The pre-repair production point was `3f27ac2`. The known prior model was:

```text
compact: ApS0a,2b,;;AqS0b,2a,;ArS3x,
slot 0: true {p}; successors 0-a, 2-b
slot 1: null
slot 2: true {q}; successors 0-b, 2-a
slot 3: true {r}; successor 3-x
```

Every attempted load below returned JavaScript `undefined`, threw no exception, exposed no error, and had already called `removeAllStatesAndTransitions()`. The exact resulting compact model was independently replayed against the `3f27ac2` source:

| Category | Attempted input | Exact old result | Old behavior |
|---|---|---|---|
| Broken middle state | `ApS;BROKEN;AqS` | `ApS` | Cleared old model, silently stopped, retained one-world prefix |
| Valid prefix then missing `A` | `ApS;pS;AqS` | `ApS` | Cleared old model, silently stopped, retained prefix |
| Missing `S` | `ApS;Aq;ArS` | `ApS` | Cleared old model, silently stopped, retained prefix |
| Malformed transition target | `ApSza,;AqS` | `ApS;AqS` | Kept states but silently ignored target `NaN` |
| Out-of-range target | `ApS9a,;AqS` | `ApS;AqS` | Kept states but silently ignored absent target 9 |
| Target into null slot | `ApS1a,;;AqS` | `ApS;;AqS` | Added against a temporary live slot, then removed the slot and edge |
| Missing agent label | `ApS1,;AqS` | `ApS;AqS` | Parsed an empty target and silently ignored the transition |
| Unexpected transition suffix | `ApS1ab,;AqS` | `ApS1b,;AqS` | `parseInt("1a")` became target 1 and the final `b` became the agent |
| Malformed late state | `ApS;AqS;ArS;BROKEN;AtS` | `ApS;AqS;ArS` | Cleared old model and retained three valid prefix worlds |

This establishes the three material baseline failure modes: destructive clearing before validation, partial-prefix acceptance, and silent transition loss or reinterpretation. No case provided a machine-readable failure.

## 6. Atomic parser/import implementation

### API and intermediate representation

`js/MPL.js` now exports the pure public boundary:

```js
MPL.parseModelString(modelString)
```

It returns either a complete plain-data representation or a structured failure without constructing or mutating an `MPL.Model`:

```js
{
  ok: true,
  modelData: { states: [...] },
  stateCount,
  liveStateCount,
  nullStateIndices,
  duplicateTransitionsSuppressed
}
```

```js
{
  ok: false,
  error: {
    code,
    message,
    offset,
    stateIndex,
    tokenIndex,
    token,
    // target or cause where applicable
  }
}
```

`Model.loadFromModelString(modelString)` calls the pure parser, returns its structured failure unchanged, prepares a separate cloned `nextStates` array after validation, and performs the sole mutation `_states = nextStates` only after preparation succeeds. A preparation exception becomes `COMMIT_PREPARATION_FAILED`; it does not alter the current model.

### Explicit accepted legacy grammar

- The input is split into stable raw state slots on semicolons.
- Every empty state record is a null/deleted slot. Direct input `""` therefore means exactly one null slot.
- A live record is `A<assignment>S<transitions>` and must begin with `A` and contain `S`.
- The compact assignment is a concatenation of one-character `[A-Za-z0-9_]` atom keys other than reserved delimiters `A` and `S`. Repetition is set-like through the assignment object.
- The transition field is empty or a comma-separated list of tokens. One final trailing comma is optional; an internal empty token or more trailing empty material is rejected.
- A transition token is a full non-negative decimal target followed by exactly one Unicode code-point agent label. Thus one-character labels such as `x` remain supported, while the legacy format is not promoted to a general multi-character-agent format.
- Every target must be a safe integer, within the stable raw array, and point to a live rather than null world.
- Exact duplicate `(source,target,agent)` transitions are accepted with the inherited set-like suppression.
- No state or transition suffix may remain unparsed.

The stable failure codes exercised by the boundary include `INPUT_NOT_STRING`, `MISSING_STATE_START`, `MISSING_STATE_SEPARATOR`, `INVALID_ATOM_CHARACTER`, `EMPTY_TRANSITION_RECORD`, `MISSING_AGENT`, `INVALID_TARGET_FORMAT`, `UNEXPECTED_TRANSITION_MATERIAL`, `TARGET_NOT_SAFE_INTEGER`, `TARGET_OUT_OF_RANGE`, `TARGET_NOT_LIVE`, and `COMMIT_PREPARATION_FAILED`.

The nine minimized locations are deterministic:

| Input | Code | Location |
|---|---|---|
| `ApS;BROKEN;AqS` | `MISSING_STATE_START` | offset 4, state 1, token `BROKEN` |
| `ApS;pS;AqS` | `MISSING_STATE_START` | offset 4, state 1, token `pS` |
| `ApS;Aq;ArS` | `MISSING_STATE_SEPARATOR` | offset 6, state 1, token `Aq` |
| `ApSza,;AqS` | `INVALID_TARGET_FORMAT` | offset 3, state 0, transition 0, token `za` |
| `ApS9a,;AqS` | `TARGET_OUT_OF_RANGE` | offset 3, state 0, transition 0, target 9 |
| `ApS1a,;;AqS` | `TARGET_NOT_LIVE` | offset 3, state 0, transition 0, target 1 |
| `ApS1,;AqS` | `MISSING_AGENT` | offset 3, state 0, transition 0, token `1` |
| `ApS1ab,;AqS` | `UNEXPECTED_TRANSITION_MATERIAL` | offset 3, state 0, transition 0, token `1ab` |
| `ApS;AqS;ArS;BROKEN;AtS` | `MISSING_STATE_START` | offset 12, state 3, token `BROKEN` |

### Browser startup transaction

`js/app.js` first loads the built-in valid default `;AS`, representing stable slots `[null, live empty world 1]`, with S5 off. A nonempty URL model is then parsed and browser-boundary validated before `loadFromModelString()` is allowed to commit it. On malformed or unsupported input:

- the complete default/prior model remains authoritative;
- D3 nodes and links are built only from that complete retained model;
- S5 remains off;
- the formula parameter is not evaluated against a failed import;
- a visible `role="alert"` message reports the stable code and says that the default was retained;
- the failed partial state is not written into browser history or substituted into the URL.

A direct empty parser string retains its explicit one-null-slot legacy contract. An empty browser `model=` parameter is treated as no requested import and retains the valid browser default. This distinction preserves existing startup behavior while making both contracts explicit.

### Compatibility decisions

The accepted corpus covers leading, internal, and trailing null slots; stable raw indices; empty assignments; one-character atom keys; multi-digit targets; one optional trailing transition comma; arbitrary one-code-point relation labels including `x`; duplicate suppression; S5 models; existing share URLs; and all five tracked report fixtures. Round 4 does not introduce a versioned format or claim general identifier round-tripping through the legacy compact serializer.

## 7. Atomic-import tests

The permanent test is `scripts/check-atomic-model-import.js`. It contains a test-local independent legacy validator and does not use the production parser as its oracle.

Before the production repair, its first minimized case failed with:

```text
AssertionError: existing model plus broken middle: expected an explicit {ok:false,error} result.
```

The independent `3f27ac2` reproduction in Section 5 records the exact changed model for all nine malformed cases rather than weakening the tests to accept the old behavior.

The fixed suite verifies, for every rejected minimized or generated input:

- explicit structured failure and stable code/location fields;
- exact complete-model snapshot equality;
- unchanged raw world-array length;
- unchanged null slots;
- unchanged valuations;
- unchanged transitions.

For every accepted input it compares the complete world/null/assignment/transition structure with the independent oracle. Its compatibility corpus contains exactly 16 cases, including six existing-link/report model strings. Duplicate `AS1x,1x,;AS` input reports one suppressed duplicate and stores one edge.

Permanent deterministic fuzz provenance:

```text
seed: 68946449 (0x041c0a11)
candidates: 100000
accepted valid strings compared with oracle: 50000
rejected malformed strings with exact rollback: 50000
minimized malformed cases: 9
valid compatibility cases: 16
browser startup cases: 3
```

The generator prints seed, case index, input, oracle result, production parse result, load result, exception, and before/after snapshots on failure. Final output is `PASS: atomic compact-model import checks completed.`

## 8. Pre-repair P1-05 reproduction

Before the P1-05 repair, the browser had no authoritative semantic-state inspector. The following facts could be semantically active without a visible row, warning, stable-index snapshot, loop count, or relation-selection disclosure:

| Case | Semantic effect | Pre-repair disclosure gap |
|---|---|---|
| True `r`, `s`, or `t` with `varCount` 1 or 2 | Atomic truth and complete valuation classes include the key; BAPAL announcements may distinguish its class | Key absent from node labels and selected-world rows, with no hidden-key notice |
| Raw true `foo` or `bar_baz` | Raw formulas can test the atom; the complete key participates in valuation classes and BAPAL witnesses | No browser row and no unsupported-key warning |
| Browser compact atom `x` | Old startup accepted it as a true valuation key even though the browser supports only `p`–`t` | No supported-vocabulary rejection or visible disclosure |
| Relation label `x` | Affects accessibility, knowledge, and the Round 3 relevant-agent S5 policy | Rendered after Audit 07 but had no selection button and no explicit unselectable-label notice |
| Stored reflexive loops | Affect reflexivity, knowledge, and S5 truthfulness | Intentionally omitted from the graph, with no count or projection warning |
| Null/deleted slots | Preserve stable indices and transition target meaning | Absent from live graph nodes, with no stable-index listing |

The semantic impact is concrete. In a two-world universal `a` relation, with the current world alone true for `r`, production semantics reports `r = true` and `^K{a}r = true`; after removing that valuation both results are false and the two worlds collapse from distinct assignment classes to the same empty class. The same raw-API probe for `foo` reports `foo = true` and `^K{a}foo = true`, versus both false after removing `foo`. Thus a hidden key can affect atomic truth, complete valuation classes, and BAPAL truth even when the UI does not show it.

The first test-first visibility run predated `SemanticState` and the inspector markup. Its ten initial behavior groups failed because the production inspection/boundary API and corresponding elements did not yet exist. The finalized suite adds an eleventh static accessibility/layout contract.

## 9. Visible semantic-state implementation

### Browser atom and relation boundaries

The browser edit/formula/share-import atom vocabulary is exactly `p`, `q`, `r`, `s`, and `t`. `SemanticState.validateBrowserImport()` inspects the already parsed intermediate representation before model mutation. Any other assignment key returns `UNSUPPORTED_BROWSER_ATOM`, including all occurrences and unsupported keys, and startup retains its complete default/prior model. The atom is not silently deleted or renamed.

Raw programmatic `MPL.Model` values remain able to contain true keys such as `foo` and `bar_baz`. Such keys remain semantically active and are listed as unsupported semantic keys with an explicit warning. To avoid emitting a misleading lossy share state, `onStateModified()` does not update the URL while unsupported true keys are present.

Relations are not rejected merely because their labels lie outside `a`–`e`. A compact transition label `x` remains accepted, semantic, covered by the Audit 07 renderer, listed as active, and listed as lacking a direct agent-selection button. This is distinct from an assignment atom `x`, which the browser import boundary rejects.

### Display-only variable count

The UI label is now **Visible propositional-variable rows**, followed by the explicit statement: **Changing this display does not delete semantic valuations.** `setVarCount()` changes only the p–t node/table projection and refreshes the inspector. It does not call `editState()` and does not change the semantic model, formula truth, valuation classes, or BAPAL results. Supported true p–t keys outside the displayed prefix are listed in `hiddenSupportedTrueAtomKeys`.

### Semantic-state inspector

The existing edit pane now contains a collapsed, native keyboard-accessible `<details id="semantic-state-inspector">` with a `<summary>`. It reports:

1. live world count;
2. null/deleted stable slot indices;
3. all true atom keys in the semantic model;
4. browser-supported vocabulary p–t;
5. currently displayed atom rows;
6. supported true keys hidden by the projection;
7. unsupported true semantic keys;
8. active relation labels;
9. stored transition count;
10. stored self-loop count;
11. visible non-loop D3 link count;
12. labels without an agent-selection button;
13. S5 mode state;
14. clear warnings.

Its focusable JSON `<pre>` is built directly from `model.getRawStates()`, visual nodes, and visual link descriptors. It includes semantic worlds by stable index, sorted true assignments, sorted outgoing labelled transitions, visual node IDs, visible non-loop descriptors, and explicit `projectionDifferences`. It does not use `getModelString()` as the semantic snapshot.

The semantic model is authoritative. Stored loops, missing/extra visual nodes, and missing/extra visual descriptors are reported as projection differences; the helper never reconciles a disagreement by deleting semantic data.

### Synchronization and safe rendering

Inspector refresh is reached from successful and failed startup handling, `onStateModified()`, `restart()`, `setVarCount()`, and S5 toggle/status updates. Those production paths cover add world, delete world, valuation edit, relation add/merge, S5 normalization, S5 enable/disable, public-announcement restriction, and explicit model load/reset followed by state synchronization.

Inspector fields, warnings, JSON, and active-agent status use D3 `.text()` or DOM `textContent`. Raw atom and relation strings are never inserted with `.html()`/`innerHTML`. The inspector is collapsed by default, uses normal document flow, provides focus styling and bounded JSON scrolling, and leaves the graph at 640×540.

## 10. Visibility tests

The permanent test is `scripts/check-semantic-state-visibility.js`. It executes the actual production `MPL.js`, `s5-policy.js`, and `app.js` through the repository's VM/DOM/D3 harness and inspects the production helper, event paths, rendered SVG attributes/markers, and inspector text nodes.

All 11 final groups pass:

1. `r` true with two displayed rows is listed as hidden while remaining in semantic world 0;
2. true `t` survives reduction to one displayed row, with exact semantic snapshot and `^t` truth preserved;
3. raw `foo` is retained, listed, and warned;
4. raw `bar_baz` is retained, listed, and warned;
5. browser URL atom `x` is rejected as `UNSUPPORTED_BROWSER_ATOM`, the default `[null, live world 1]` is retained, history is untouched, and the error is visible;
6. relation `x` is active, unselectable by current buttons, present in the semantic and visual snapshots, and visibly rendered with a real labelled marker;
7. two stored `x` self-loops are distinguished from one visible non-loop descriptor;
8. leading/internal null slots remain explicit and visual node IDs preserve stable indices;
9. markup-shaped raw atom/agent strings remain inert text, create no `script` or `img`, and are still disclosed;
10. startup, add world, valuation edit, var-count change, relation add, S5 enable/normalization, S5 disable, world deletion, public announcement, and raw-load projection-difference paths refresh the inspector;
11. the static `<details>`, `<summary>`, live/status regions, focusable JSON, scrolling, display note, and graph-size contract are present.

Final executable result:

```text
PASS: all 11 semantic-state visibility groups.
browser boundary: executable production app.js under the existing VM/DOM/D3 harness
```

No new dependency was added. A native browser executable was unavailable in the local environment, so this permanent suite does not claim native keyboard-event or computed-layout coverage.

## 11. Independent review

Prompt 4.3 performed a concentrated review after both repairs and returned **PASS**. No scoped production or permanent-test correction was required.

### Independent compact-string oracle and fuzz

The temporary external parser oracle did not call production parsing. It used a seed distinct from the permanent suite and generated models up to 20 raw slots with null slots, p–t atoms, multi-digit targets, and one-character relation labels including `x`.

```text
seed: 2051938771 (0x7a4e19d3)
total candidates: 250000
oracle-accepted / production-accepted: 125000
oracle-rejected / production-rejected with exact rollback: 125000
accepted cases containing null slots: 124998
accepted cases containing multi-digit targets: 65082
accepted cases containing relation x: 106542
stable code/location probes: 8
distinct tracked legacy links checked: 5
```

Every rejection compared the full before/after world array, null placement, assignments, and transitions. Every acceptance compared the complete parsed and loaded structure against the independent oracle. There were zero mismatches and therefore no failure to minimize.

### Independent semantic-state review

Four independent groups constructed hidden `r/s/t`, raw `foo/bar_baz`, raw `x` and multiple relation labels, null slots, stored loops, S5 closure, and public-announcement deletion. Inspector semantic worlds, assignments, outgoing transitions, counts, labels, warnings, node IDs, and visual non-loop descriptors matched the authoritative model and graph projection exactly.

Changing `varCount` preserved exact model snapshots, direct formula-truth vectors, complete valuation-class partitions, and BAPAL result vectors. Unsupported browser atoms were rejected before mutation; raw unsupported atoms remained active and disclosed. The Audit 07 `x` rendering and Round 3 S5 state remained intact.

### Browser boundary result

No local Chromium, Chrome, Firefox, or other native headless browser executable was available. The strongest available substitute executed complete production startup and application functions under the VM/DOM/D3 harness. Valid URL import, malformed import, unsupported atom import, retained default model, visible error text, hidden-key disclosure, `x` inspector/rendering, S5 normalization, formula evaluation, console-exception absence, and coherent history behavior passed. Static native semantics establish keyboard access through `<details>/<summary>`, and the JSON region is focusable, but native keyboard activation and computed layout remain for Work Max to check manually.

Manual Work Max browser checklist:

- open one valid, one malformed, and one unsupported-atom URL in a native browser;
- confirm the retained default graph, alert text, S5 Off state, no formula evaluation after failure, and no premature URL rewrite;
- focus the inspector summary with Tab and toggle it with Enter and Space;
- reduce displayed rows and confirm hidden p–t keys appear without truth/model changes;
- confirm raw relation `x` appears both in the inspector and as a painted, labelled graph edge;
- normalize S5, evaluate a formula, inspect the console, and confirm subsequent URLs serialize only supported browser state.

## 12. Files changed

The exact implementation-candidate diff `3f27ac2..5c89ab5` contains 11 paths, 1,978 insertions, and 87 deletions.

### Round 3 administration

- `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md` — adds the supplied focused PASS audit artifact.
- `audit/00_AUDIT_INDEX.md` — records Audit 07, P1-03/Round 3 closure, the raw-label rendering contract, Stage 0 open, and Round 4 authorization.

### Round 4 model parser

- `js/MPL.js` — pure complete compact parser, structured errors, target/null validation, intermediate plain data, and transactional `loadFromModelString()` commit.

### Round 4 application and UI

- `js/app.js` — browser import boundary, transactional startup path, `SemanticState`, inspector synchronization, safe text boundaries, display-only var count, and URL/error behavior.
- `index.html` — variable-row wording/note and accessible semantic-state `<details>` markup.
- `css/app.css` — compact inspector, focus, warning, and bounded-scroll styling without graph-size change.

### Round 4 tests

- `scripts/check-atomic-model-import.js` — independent oracle, minimized rollback matrix, compatibility corpus, 100,000-case fuzz, and startup cases.
- `scripts/check-semantic-state-visibility.js` — 11 executable visibility, disclosure, rendering, synchronization, escaping, and accessibility groups.

### Round 4 documentation

- `AGENTS.md` — records Round 3 closure and the pending-audit Round 4 implementation boundary.
- `docs/BAPAL_PLAYGROUND_SPEC.md` — records the post-baseline transactional/import/disclosure delta without a Round 5 schema.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` — closes P1-03, marks P1-04/P1-05 implemented pending Work Max, and keeps P1-06/P1-07/Stage 0 open.

The three documentation paths above also carry the necessary Round 3 administrative closure statement. There are **no unexpected files**. This log is the sole post-candidate uncommitted path and is not part of `5c89ab5`.

## 13. Deterministic validation

The initial repository gate produced:

```text
git status --short
<no output>

git rev-parse HEAD
5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea

git branch --show-current
bapal-core
```

`git log -10 --oneline` began with:

```text
5c89ab5 close round 3 and implement round 4 atomic import visibility
3f27ac2 repair round 3 raw-label relation rendering
04f264a add round 3 implementation log
edfafc9 add round 3 implementation log
6bd3369 complete round 3 S5 policy integration
172a204 close round 2 and implement round 3 S5 invariants
f7c7d59 add round 2 implementation log
e0c816f close round 1 docs and implement round 2 parser printer closure
55f557c new round check
92a4ba6 refine inteface and add bicondition
```

All required deterministic commands were rerun at candidate HEAD immediately before this log:

| Command | Exit | Concise observed output |
|---|---:|---|
| `node scripts/check-semantic-state-visibility.js` | 0 | 11/11 groups; production app VM/DOM/D3 boundary |
| `node scripts/check-atomic-model-import.js` | 0 | 9 minimized, 16 compatibility, seed `0x041c0a11`, 100,000 candidates = 50,000 accepted + 50,000 rejected/rollback, 3 startup cases |
| `node scripts/check-agent-rendering.js` | 0 | 5/5 renderer groups, including `x`, real markers, directions, deduplication, S5 paths, overlaps |
| `node scripts/check-s5-invariants.js` | 0 | 12/12 groups; 531 exhaustive relations; seed `0x0055f503`; 10,000 sequences and 200,000 operations (97,793 accepted, 102,207 rejected) |
| `node scripts/check-formula-roundtrip.js` | 0 | 108,246 AST/ASCII round trips and 3 display smoke cases |
| `node scripts/check-structural-copy-regressions.js` | 0 | 11/11 structural-copy regressions |
| `node scripts/check-bapal-regression.js` | 0 | 8/8 BAPAL/PAL/S5 regressions |
| `node scripts/check-logic-regressions.js` | 0 | 6/6 inherited logic regressions |
| `node scripts/check-s5-closure.js` | 0 | 4/4 closure/edit-guard checks |
| `node scripts/check-bapal-valuation-class.js` | 0 | valuation-order class regression passes |
| `node scripts/check-report-links.js` | 0 | 5/5 tracked report links parse and execute |
| `git diff --check` | 0 | no output before log creation |

The post-suite `git status --short` and `git diff --check` both produced no output. The tracked random report remained SHA-256 `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34`. No deterministic check changed or generated a tracked file; the aggregate write-producing `scripts/check-all.js` and random report generator were intentionally not run.

Post-write validation also ran `git diff --check` with exit 0 and no output. Because the new log is intentionally untracked, a supplementary `git diff --no-index --check /dev/null revision/05_ROUND_3_CLOSURE_AND_ROUND_4_IMPLEMENTATION_LOG.md` produced no whitespace diagnostic (its exit 1 denotes that the new file differs from `/dev/null`). `git status --short` then contained exactly `?? revision/05_ROUND_3_CLOSURE_AND_ROUND_4_IMPLEMENTATION_LOG.md`; HEAD remained `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` on `bapal-core`.

## 14. Source-scope integrity

The exact Round 4 source diff was reviewed from `3f27ac2` through `5c89ab5`.

- **Formula parser:** `lib/formula-parser.min.js`, parser configuration, and `_asciiToJSON()` are unchanged.
- **Round 2 printer:** `_announcementPreconditionNeedsParentheses()`, `_jsonToASCII()`, ASCII/LaTeX/Unicode conversion behavior, and the supported-AST contract are unchanged.
- **Truth evaluator:** `_truth()` and the exported `truth()` clauses are unchanged; only new compact-boundary code appears in `js/MPL.js`.
- **`deepCopy()`:** unchanged; 11/11 structural-copy checks pass.
- **S5 closure:** `js/s5-policy.js` and `MPL.Model` equivalence-closure algorithms are unchanged; the full invariant and closure suites pass.
- **Generic relation rendering:** the Audit 07 `AgentRendering`, marker-definition, explicit-stroke, direction, raw-label, and overlap implementation is unchanged. Round 4 only adds inspector refresh after rendering and disclosure of projection data; the 5/5 rendering suite passes.
- **Report generator and reports:** `scripts/random-bapal-evaluation.js` and `reports/` are unchanged; no report generation ran.
- **Architecture:** no JSON schema, backend, database, build system, framework replacement, or unrelated UI redesign was added.

Audit and foundational-prompt hashes at the candidate are:

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087  audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md
15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709  audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md
8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2  audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md
7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2  audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md
052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98  prompt/work_max_bapal_foundational_audit_prompt.md
```

Audits 01–06 remain byte-stable historical artifacts. Audit 07 was added as the supplied read-only focused closure artifact and was not rewritten by the Round 4 implementation work.

## 15. Claims supported

The evidence supports only these narrow claims:

- P1-04 and P1-05 have local implementations at exact candidate `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`.
- In the tested minimized, compatibility, 100,000-case permanent, and 250,000-case independent corpora, malformed compact imports are rejected transactionally and leave the prior model unchanged.
- Under the tested browser policy, hidden supported semantic keys are disclosed, raw unsupported keys are preserved and disclosed, and unsupported compact browser imports are rejected before model mutation.
- Relation labels outside `a`–`e`, including `x`, remain accepted where the legacy one-character relation format supports them and are disclosed/rendered under the Audit 07 contract.
- The variable-count control is a display projection and preserves semantic valuations and tested formula, valuation-class, and BAPAL results.
- All recorded deterministic checks pass without tracked-file mutation.
- Work Max closure audit for P1-04/P1-05 is pending.

This log does **not** claim:

- that a versioned model/formula schema exists;
- that arbitrary future or multi-character compact formats are supported;
- that all malformed strings have been mathematically classified;
- that bounded fuzzing proves correctness for every input;
- that P1-06 or P1-07 is closed;
- that Round 4 is audited or closed;
- that Stage 0 is complete.

## 16. Remaining findings

- **P1-06 — terminology:** result/report language still requires a dedicated supplied-model terminology repair and audit.
- **P1-07 — independent oracle/CI:** permanent independent conformance gating, CI manifests, reproducible artifacts, and deliberate-mismatch detection remain open.
- **Legacy compact format:** it remains unversioned, concatenates one-character atom keys, and stores only one terminal agent code point per transition token. It is not a general identifier interchange format.
- **Raw/browser grammar divergence:** the raw formula parser and browser preprocessing remain distinct; browser comma removal and announcement rewriting have not been unified.
- **BAPAL performance:** finite valuation-class enumeration remains exponential in the number of occurring classes; no performance architecture repair is claimed.
- **Native browser evidence:** Round 4 has strong executable VM/DOM/D3 coverage but still needs Work Max native-browser keyboard/layout/console confirmation.
- **Round 5 schema:** the versioned model/formula schema is deliberately deferred.

## 17. Next planned round

**Round 5 — versioned model/formula schema.**

Round 5 must not begin until Work Max audits and closes the exact Round 4 implementation candidate. This log does not implement, design-finalize, or create that schema.

## 18. Work Max package

Work Max should review the following exact package.

### Commits and comparison ranges

- Foundational baseline: `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`
- Round 1 implementation: `55f557c210a6a6ad78c928bb1b94b2010929d2a2`
- Round 2 implementation: `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`
- Round 2 final log-only HEAD: `f7c7d599afca5622c227ea51d930dfd14005b016`
- Complete original Round 3 candidate: `6bd33697491820db3d0999ac7c7ccf99b05291d5`
- Audit 06 final reviewed HEAD: `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`
- Round 3 rendering repair: `3f27ac2d4476ecc23da0358f23f2ced87db5500d`
- Round 4 implementation candidate: `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`
- Focused rendering diff: `04f264a..3f27ac2`
- Round 4 implementation/administration diff: `3f27ac2..5c89ab5`
- Full post-foundational candidate diff: `92a4ba6..5c89ab5`
- A future log-only commit, if created, must add only this file and must not replace the implementation identity above.

### Audits and logs

- `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md`
- `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`
- `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md`
- `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`
- `audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md`
- `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md`
- `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md`
- `revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md`
- `revision/02_ROUND_1_DOCUMENTARY_REPAIR_AND_ROUND_2_IMPLEMENTATION_LOG.md`
- `revision/03_ROUND_2_ADMINISTRATIVE_CLOSURE_AND_ROUND_3_IMPLEMENTATION_LOG.md`
- `revision/04_ROUND_3_RAW_LABEL_RENDERING_REPAIR_LOG.md`
- `revision/05_ROUND_3_CLOSURE_AND_ROUND_4_IMPLEMENTATION_LOG.md` (this uncommitted documentary file)

### Round 4 code, UI, and tests

- `js/MPL.js`
- `js/app.js`
- `index.html`
- `css/app.css`
- `scripts/check-atomic-model-import.js`
- `scripts/check-semantic-state-visibility.js`
- inherited protection checks: `scripts/check-agent-rendering.js`, `scripts/check-s5-invariants.js`, `scripts/check-formula-roundtrip.js`, `scripts/check-structural-copy-regressions.js`, `scripts/check-bapal-regression.js`, `scripts/check-logic-regressions.js`, `scripts/check-s5-closure.js`, `scripts/check-bapal-valuation-class.js`, and `scripts/check-report-links.js`

### Administrative/specification files

- `audit/00_AUDIT_INDEX.md`
- `AGENTS.md`
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`

### Outputs and evidence

- Section 5 exact old-model mutation transcript and nine minimized counterexamples
- Section 6 structured error codes/locations and explicit grammar contract
- permanent seed `0x041c0a11`, 100,000 candidates, and 50,000 rollback comparisons
- independent seed `0x7a4e19d3`, 250,000 candidates, and 125,000 rollback comparisons
- 11 semantic-state visibility groups and 3 startup cases
- independent semantic snapshot/truth/valuation-class/BAPAL comparisons
- Audit 07 raw-label rendering evidence and inherited 5/5 rendering checks
- all command outputs in Section 13
- exact file list/stat for `3f27ac2..5c89ab5`
- hashes in Section 14 and unchanged random-report hash
- the native-browser manual checklist in Section 11

Work Max should audit `5c89ab5` as the implementation candidate and treat any later commit containing only this file as documentary provenance, not as a different implementation.
