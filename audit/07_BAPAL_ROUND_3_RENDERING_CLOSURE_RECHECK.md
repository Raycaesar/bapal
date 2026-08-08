# BAPAL Round 3 Raw-Label Relation Rendering Closure Recheck

Audit date: 2026-08-08 UTC  
Repository: `Raycaesar/bapal`  
Branch audited: `bapal-core`  
Audit mode: focused, read-only closure recheck  
Scoped defect: non-loop relations whose stored label lies outside declared agents `a`–`e` were semantically normalized and projected but not visibly rendered

## Verdict

**PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4**

P1-03 is closed narrowly at `3f27ac2d4476ecc23da0358f23f2ced87db5500d`. For every relevant stored relation label covered by the Round 3 model and projection contract, a non-loop projected relation now receives a deterministic visible stroke, direction markers backed by real SVG marker definitions, and a visible mid-edge identity label. Raw semantic agent strings remain unchanged.

This verdict does not close Stage 0. Atomic import, hidden valuations, terminology, CI/oracle coverage, serializer limitations, and performance findings remain open. Round 4 is authorized; it had not begun in the audited candidate.

## 1. Commit boundary and scope lock

| Role | Commit |
|---|---|
| Original foundational baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` |
| Complete original Round 3 implementation | `6bd33697491820db3d0999ac7c7ccf99b05291d5` |
| Audit 06 final reviewed HEAD | `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c` |
| Scoped rendering-repair commit | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` |
| Final audited `bapal-core` HEAD | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` |

The exact commit range `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c..bapal-core` contains one commit and only one commit:

```text
3f27ac2d4476ecc23da0358f23f2ced87db5500d
repair round 3 raw-label relation rendering
parent: 04f264a5e5900719eb70a0eaf77bd64f73b3ef0c
author/commit time: 2026-08-04T23:26:05+08:00
```

The exact changed paths in that commit are:

```text
M  AGENTS.md
M  audit/00_AUDIT_INDEX.md
A  audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md
M  docs/BAPAL_PLAYGROUND_SPEC.md
M  js/app.js
M  revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md
M  revision/03_ROUND_2_ADMINISTRATIVE_CLOSURE_AND_ROUND_3_IMPLEMENTATION_LOG.md
A  revision/04_ROUND_3_RAW_LABEL_RENDERING_REPAIR_LOG.md
A  scripts/check-agent-rendering.js
```

The only production-code change is in `js/app.js`, and its source diff is confined to relation rendering policy, marker creation, raw-label path geometry, and application of those visual properties during rendering. The other changes are scoped documentation, audit capture, and the focused rendering regression harness.

No Round 4 implementation is present. There is no post-repair commit, no Round 4 source path in the range, and no production change outside the scoped renderer. Round 4 references in administrative material remain scheduling/authorization text, not implementation.

The newly tracked Audit 06 file is byte-for-byte the previously delivered audit artifact: SHA-256 `8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2`.

## 2. Ordered review and preserved Audit 06 conclusions

The requested material was read in the specified order: Audit 06; audit index; `AGENTS.md`; playground specification; scope/repair register; Round 3 implementation log; rendering-repair log; `js/MPL.js`; `js/s5-policy.js`; `js/app.js`; `css/app.css`; `index.html`; the two named focused checks; every deterministic check source; and the exact diff from `04f264a`.

| Audit 06 conclusion or protected surface | Recheck result |
|---|---|
| P1-02 new-world S5 regression | Remains closed. The unchanged S5 invariant check passes its dedicated P1-02 group. |
| Least equivalence closure | Unchanged. Both `js/MPL.js` and `js/s5-policy.js` have an empty diff from `04f264a`; no rendering-related semantic alteration was made or needed. |
| Confirmation and cancel | Intact. Acceptance normalizes; cancellation leaves the graph and mode unchanged. |
| New world | Intact and closed under active S5 relations. |
| Class merge | Intact. The affected equivalence class is merged and remains S5. |
| World deletion | Intact. The residual relation remains S5. |
| Selected-relation Delete/L/R/B guards | Intact while S5 mode is active. |
| Disable path | Intact; disabling S5 does not rewrite the graph. |
| Parser, printer, and truth evaluator | Unchanged in the exact commit range; formula, BAPAL, and logic regressions pass. |
| `deepCopy` | Unchanged; all 11 structural-copy regressions pass. |
| Serializer | Unchanged. Its previously documented limitations remain open. |
| Reports | No report path changed in the commit range or during this audit. |
| Round 4 | Not started. |

The exact protected-path diff from `04f264a` is empty for `js/MPL.js`, `js/s5-policy.js`, `css/app.css`, `index.html`, all pre-existing deterministic checks, and `reports/`.

## 3. Reproduction of the Audit 06 failure at `04f264a`

The new focused rendering check was copied into a temporary external checkout of `04f264a` and executed against that old production code. It exited `1`, with all five groups failing. The minimized `AS1x,;AS` output was:

```text
before descriptor: {"sourceId":0,"targetId":1,"agent":"x","left":false,"right":true}
before rendering: {"stroke":null,"visibleStroke":false,"classes":["link"],
  "startTarget":null,"endTarget":"end-arrow-x","midTarget":"mid-arrow-x",
  "startExists":false,"endExists":false,"midExists":false}

after descriptor: {"sourceId":0,"targetId":1,"agent":"x","left":true,"right":true}
after rendering: {"stroke":null,"visibleStroke":false,"classes":["link"],
  "startTarget":"start-arrow-x","endTarget":"end-arrow-x","midTarget":"mid-arrow-x",
  "startExists":false,"endExists":false,"midExists":false}
```

Before normalization, the semantic relation is the stored directed edge `0 → 1` for agent `x`, and the D3 descriptor exists. After accepted S5 normalization, the semantic `x` relation is exactly the equivalence relation over the two worlds: `0 → 0`, `0 → 1`, `1 → 0`, and `1 → 1`. The D3 projection correctly hides the loops and yields one bidirectional non-loop descriptor whose `agent` remains the literal string `x`.

The old renderer nevertheless left the path without a stroke: its only class was `link`, while the stylesheet assigns colors only through `.agent-a` through `.agent-e`. It also referenced `*-arrow-x` IDs for which no marker elements existed. The relation was therefore semantic and projectable but lacked a usable visible stroke and marker definitions.

The old checked-in invariant test did not detect this. It asserted semantic closure and descriptor shape, but not an actual SVG stroke, marker target resolution, marker text, or computed/explicit rendering visibility. This precisely reproduces and bounds the Audit 06 defect.

## 4. Repair audit

### 4.1 Rendering contract

| Required property | Finding and evidence |
|---|---|
| 1. Visible deterministic stroke | PASS. Every projected label is mapped by `AgentRendering.getVisualSpec`. Declared agents retain their historical colors; every other label receives fallback `#3f4a54`. `restart()` writes that color as an explicit SVG `stroke` attribute on both existing and entering paths. |
| 2. Start arrow for left direction | PASS. A true `left` flag emits `url(#start-arrow-<safe-key>)`; false emits no start marker. The referenced definition is generated before path rendering. |
| 3. End arrow for right direction | PASS. A true `right` flag emits `url(#end-arrow-<safe-key>)`; false emits no end marker. The referenced definition is generated before path rendering. |
| 4. Visible mid-edge identity | PASS. Every projected edge references its mid marker, whose SVG text is the complete original agent label and whose fill is explicitly the same visible color. Unknown-label marker width scales with Unicode code-point length and uses `markerUnits="userSpaceOnUse"`. |
| 5. Actual marker definitions | PASS. Start, end, and mid markers are created in the live SVG marker definitions for each distinct projected label before marker URLs are applied. Tests resolve each URL to a real element. |
| 6. Safe, non-colliding marker IDs | PASS. Extra labels are encoded as `u-` followed by fixed six-digit lowercase hexadecimal Unicode code points separated by hyphens. The mapping is injective over code-point sequences, uses only `[a-z0-9-]`, and cannot collide with the unchanged single-letter keys for declared `a`–`e`. |
| 7. No raw-label DOM injection | PASS. Raw text is never interpolated into an ID and is inserted with D3 `.text()`, not `.html()`. A markup-shaped punctuation/Unicode label remains one inert text node and creates no `script` element. |
| 8. No duplicate marker definitions | PASS. Each of the three marker IDs is queried before append. Repeated rendering leaves exactly one start, one end, and one mid definition per label. |
| 9. Declared `a`–`e` compatibility | PASS. Marker IDs, classes, colors, angles, and curviness remain exactly: `a/orangered/0/0`, `b/orange/-0.5/-20`, `c/purple/0.5/20`, `d/yellowgreen/-1/-40`, and `e/turquoise/1/40`. The explicit stroke/fill values match their former CSS behavior. |
| 10. Hidden semantic self-loops | PASS. S5 normalization stores the required reflexive loops, while `S5Policy.buildLinkProjection` omits them and the rendered D3 paths contain no self-loop. |
| 11. Original D3 semantic identity | PASS. Safe keys are used only for marker IDs. `link.agent`, `getVisualSpec(...).agent`, marker text, model queries, and descriptors preserve the original full semantic string. |

### 4.2 Required label and overlap cases

| Case | Result |
|---|---|
| `x` | Visible before normalization; after acceptance, visible bidirectional path with start/end/mid definitions and semantic loops retained but hidden. |
| `y` | Visible with safe deterministic marker IDs and intact semantic identity. |
| `raw_agent` | Visible path and marker text; safe key is `u-000072-000061-000077-00005f-000061-000067-000065-00006e-000074`. |
| Punctuation label | A markup-shaped label containing quotes, angle brackets, a slash, and parentheses-like markup remains inert text and renders through a safe ID. |
| Unicode label | The same executable path covers `⚡`; an independent policy probe additionally covers `漢字⚡` as a standalone label. |
| `a` and `x` on the same pair | Both identities are retained and their generated path geometry differs; declared `a` geometry is unchanged. |
| `x` and `y` on the same pair | Both identities are retained and deterministic unknown-label slots give distinct curves. |

An external read-only policy probe also exercised `x`, `y`, `raw_agent`, a standalone punctuation-heavy label, `漢字⚡`, and a markup-injection label. It generated 20,000 deterministic Unicode strings and found 20,000 unique safe keys, zero unsafe characters, zero round-trip failures, and zero collisions. This supplements the construction-level injectivity argument; it is not used as a claim of exhaustive testing over all Unicode strings.

## 5. Browser and computed/explicit rendering boundary

A native cloud Chrome session loaded the deployed fixture:

```text
https://raycaesar.github.io/bapal/?model=AS1x%2C%3BAS
```

The deployed `js/app.js` SHA-256 was `f6e033856ded6075bb46a2eb484fbd3e72d62720d28b24786c27247d903cb42c`, exactly matching the audited candidate file. Native DOM inspection of the imported, not-yet-normalized `x` edge found:

- a real nonempty path with explicit `stroke="#3f4a54"`;
- `marker-end: url("#end-arrow-u-000078")`;
- `marker-mid: url("#mid-arrow-u-000078")`;
- existing end and mid marker elements under those exact IDs;
- mid-marker text content `x` with explicit fill `#3f4a54`;
- no start marker, matching the one-way input;
- 18 unique marker definitions in total: three each for declared `a`–`e` and `x`.

The native browser-control session timed out while crossing the confirmation dialog, and no local Chrome, Chromium, Firefox, or equivalent executable was installed. No semantic or rendering failure was observed; the remaining browser actions were therefore checked with the strongest available executable substitute: the real production `MPL.js`, `s5-policy.js`, and `app.js` in a VM-backed DOM/D3 harness that inspects explicit SVG attributes and actual generated marker elements. Descriptor existence alone was not accepted.

| Required browser/computed case | Evidence | Result |
|---|---|---|
| 1. Imported `x` before normalization | Native Chrome live SVG DOM and explicit presentation attributes | PASS |
| 2. Accepted S5 normalization | Production app confirmation path in VM/DOM/D3 harness | PASS |
| 3. Normalized bidirectional `x` | Explicit stroke plus start/end/mid URLs and real definitions; semantic relation is equivalence | PASS |
| 4. Marker references resolve | Native end/mid resolution before normalization; executable start/end/mid resolution after normalization | PASS |
| 5. Mid label displays `x` | Native marker text content and executable post-normalization assertion | PASS |
| 6. Declared `a` visually unchanged | Exact legacy ID/class/color/geometry assertions and explicit path/marker attributes | PASS |
| 7. Cancel does not modify graph | Production confirmation/cancel path with before/after semantic and rendered snapshots | PASS |
| 8. Add-world, class-merge, deletion, guards, disable | Production event handlers executed in the VM/DOM/D3 harness; focused and invariant suites agree | PASS |

The fallback therefore verifies explicit inline stroke/fill, actual marker nodes, URL resolution, text content, and full workflow behavior. It does not rely on D3 descriptor existence as a proxy for visibility.

## 6. Test and documentary audit

### `scripts/check-agent-rendering.js`

The focused script executes the production `MPL.js`, `s5-policy.js`, and `app.js` under deterministic VM/DOM/D3 stubs. Its five groups cover:

1. the minimized `AS1x,;AS` failure before and after accepted normalization;
2. exact declared-agent compatibility, `raw_agent`, safe marker keys, markup-shaped punctuation/Unicode, and inert text insertion;
3. left/right/bidirectional marker behavior and repeated-render definition deduplication;
4. confirmation, cancellation, already-S5 enable, new-world closure, class merge, deletion, guards, disable, and hidden loops;
5. `a+x` and `x+y` identity and geometry.

Its visibility assertion requires a nonempty explicit stroke and real marker definitions with the expected text/fill. It therefore closes the specific test gap from Audit 06 rather than repeating the old descriptor-only assertion.

### Repair log and Audit 06 addendum

`revision/04_ROUND_3_RAW_LABEL_RENDERING_REPAIR_LOG.md` accurately describes the defect, scoped source change, safe-key construction, explicit colors, marker generation, overlap geometry, test boundary, and remaining open findings.

The Audit 06 addendum in `revision/03_ROUND_2_ADMINISTRATIVE_CLOSURE_AND_ROUND_3_IMPLEMENTATION_LOG.md` correctly narrows the earlier word “visible”: the prior evidence proved semantic storage and D3 descriptor projection, not an actually painted path or resolvable raw-label markers. The current text does not preserve the old overclaim.

## 7. Required command results

All commands were run from the detached checkout of final HEAD `3f27ac2d4476ecc23da0358f23f2ced87db5500d`.

| Command | Exit | Result |
|---|---:|---|
| `node scripts/check-agent-rendering.js` | 0 | 5/5 rendering groups pass |
| `node scripts/check-s5-invariants.js` | 0 | 12/12 groups pass; 531 exhaustive relations, 10,000 generated sequences, 200,000 operations |
| `node scripts/check-formula-roundtrip.js` | 0 | 108,246 AST round trips and 3 display smoke cases pass |
| `node scripts/check-structural-copy-regressions.js` | 0 | 11/11 regressions pass |
| `node scripts/check-bapal-regression.js` | 0 | 8/8 regressions pass |
| `node scripts/check-logic-regressions.js` | 0 | 6/6 regressions pass |
| `node scripts/check-s5-closure.js` | 0 | 4/4 checks pass |
| `node scripts/check-bapal-valuation-class.js` | 0 | PASS |
| `node scripts/check-report-links.js` | 0 | 5/5 report links pass |
| `git diff --check` | 0 | No output |

The write-producing aggregate wrapper was not invoked because the audit expressly required a read-only run and unchanged tracked reports; every deterministic constituent named by this recheck was invoked directly.

Post-test integrity checks:

```text
git status --short --branch
## HEAD (no branch)

git diff --name-only
<no output>

aggregate SHA-256 over sorted tracked-file hashes, before and after tests
c45dcf6d91d5649767a6f94235b809dc9f0821f1f23b997f2da1f3ca4f4abe9a

reports/random-bapal-evaluation.html working-tree and HEAD-content SHA-256
88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34
```

The worktree is clean, no tracked report changed, and this audit made no repository edit.

## 8. Closure disposition

P1-03 is closed only for the audited Round 3 rendering defect. The evidence establishes that all relevant stored relation labels receive the audited visible rendering contract when projected as non-loop edges: deterministic stroke; appropriate start/end direction arrows; visible full mid-edge identity; real, unique, deduplicated marker definitions; safe IDs; and inert raw text. The semantic agent string is not rewritten, and semantic reflexive loops remain stored while hidden from the projection.

P1-02 remains closed. The least-equivalence implementation and the confirmation/cancel/new-world/class-merge/delete/guard/disable workflows remain intact. No parser, printer, truth evaluator, structural copy, serializer, or report implementation was changed.

The following remain open and are outside this narrow closure:

- atomic import;
- hidden valuations;
- terminology consistency;
- CI and independent-oracle coverage;
- serializer limitations;
- performance findings.

**Stage 0 remains open. Round 3 is closed. Proceed to Round 4.**
