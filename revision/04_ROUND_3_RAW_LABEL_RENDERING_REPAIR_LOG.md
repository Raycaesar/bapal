# Round 3 Raw-Label Rendering Repair Log

## 1. Audit 06 verdict and candidate identity

- **Audit:** `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md`
- **Verdict:** **PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR**
- **Complete audited Round 3 implementation candidate:** `6bd33697491820db3d0999ac7c7ccf99b05291d5`
- **Final audited log-only HEAD:** `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`
- **Branch and local starting HEAD:** `bapal-core` at `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`
- **Audit disposition:** P1-02 is closed at `6bd3369`; the semantic/model part of P1-03 passes; P1-03 remains open pending this focused rendering repair and a focused Work Max recheck.

This task does not begin Round 4 and does not modify Audit 06.

## 2. Exact `x` counterexample

The minimized compact model is:

```text
AS1x,;AS
```

Before S5 normalization it stores `0R_x1`. After accepted normalization, production `MPL.Model` stores:

```text
x = {0->0, 0->1, 1->0, 1->1}
```

`S5Policy.buildLinkProjection(model, true)` correctly returns one non-loop descriptor:

```json
{
  "sourceId": 0,
  "targetId": 1,
  "agent": "x",
  "left": true,
  "right": true
}
```

At audited HEAD `04f264a`, the actual production `restart()` path had only class `link`, no inline or class-resolved stroke, and marker URLs targeting absent `start-arrow-x`, `end-arrow-x`, and `mid-arrow-x` definitions. The semantic relation and D3 descriptor existed, but the SVG relation was invisible and carried no usable direction or identity marker.

## 3. Test-first pre-repair failure

`scripts/check-agent-rendering.js` was added before any production edit. It loads the real `js/MPL.js`, `js/s5-policy.js`, and complete `js/app.js` in the repository's VM/DOM/D3-stub style, calls the production S5 and rendering functions, and inspects the SVG nodes actually created by `restart()`. CSS source is used only to resolve a class stroke on an already executed SVG path; the test is not a pure source-string check.

Exact command and status:

```text
$ node scripts/check-agent-rendering.js
exit 1
```

Decisive pre-repair diagnostic:

```text
FAIL: Audit 06 minimized x counterexample
before descriptor: {"sourceId":0,"targetId":1,"agent":"x","left":false,"right":true}
before rendering: {"stroke":null,"visibleStroke":false,"classes":["link"],"startTarget":null,"endTarget":"end-arrow-x","midTarget":"mid-arrow-x","startExists":false,"endExists":false,"midExists":false}
after descriptor: {"sourceId":0,"targetId":1,"agent":"x","left":true,"right":true}
after rendering: {"stroke":null,"visibleStroke":false,"classes":["link"],"startTarget":"start-arrow-x","endTarget":"end-arrow-x","midTarget":"mid-arrow-x","startExists":false,"endExists":false,"midExists":false}
The descriptor exists, but the actual production path is invisible or references absent marker definitions.
FAIL: 5/5 agent-rendering groups failed.
```

## 4. Rendering policy

`js/app.js` now defines one deterministic `AgentRendering` visual specification and applies it through the actual graph renderer.

- Every current relation label is collected from `links` in deterministic Unicode-code-point order.
- Marker definitions are ensured before marker URLs are assigned.
- Every relation path receives an explicit `stroke` SVG attribute.
- Every descriptor receives an existing mid marker displaying the actual semantic agent string.
- Unknown-label mid markers use deterministic text-sized `userSpaceOnUse` viewports so multi-character labels are not confined to the declared one-character viewport.
- `left` selects only the start marker, `right` selects only the end marker, and a bidirectional descriptor selects both.
- Marker shapes and marker text receive explicit fill attributes, so raw-label visibility does not depend on a missing CSS class.
- Marker creation first searches within the application SVG and therefore remains idempotent across repeated `restart()` calls.
- Stored semantic self-loops remain in `MPL.Model`; model-derived S5 graph projection continues to hide them.

## 5. Safe marker-key method

Declared labels `a`–`e` retain their historical marker keys. Every other label is encoded as `u-` followed by each Unicode code point in fixed six-digit lowercase hexadecimal, separated by hyphens.

Examples:

```text
x          -> u-000078
raw_agent  -> u-000072-000061-000077-00005f-000061-000067-000065-00006e-000074
```

The encoding is injective over Unicode code-point sequences, independent of insertion/render order, and contains only ASCII letters, digits, and hyphens. Raw relation text is never interpolated into an SVG identifier. Labels are inserted into markers with D3 `.text()`, not HTML, so punctuation or markup-shaped text remains inert text content.

## 6. Declared-agent compatibility

The declared visual contract is unchanged:

| Agent | Stroke/fill | Marker key | Curviness | Angle |
|---|---|---|---:|---:|
| `a` | `orangered` | `a` | 0 | 0 |
| `b` | `orange` | `b` | -20 | -0.5 |
| `c` | `purple` | `c` | 20 | 0.5 |
| `d` | `yellowgreen` | `d` | -40 | -1 |
| `e` | `turquoise` | `e` | 40 | 1 |

Their marker IDs remain `start-arrow-{agent}`, `end-arrow-{agent}`, and `mid-arrow-{agent}`, and their mid-marker text remains the agent character. Explicit SVG color attributes equal the existing CSS colors.

## 7. Other-label color, markers, and overlap

Every other nonempty stored label uses fixed neutral `#3f4a54`, which remains visibly contrasted against the white graph background. It receives all three marker definitions even when a one-way descriptor uses only one direction marker.

Unknown-label geometry is assigned within each ordered world pair after sorting its unknown labels by Unicode code point. Slots are `+60`, `-60`, `+100`, `-100`, and so on. These do not alter declared `a`–`e` geometry and keep the tested `a+x` and `x+y` relations on distinct paths. The semantic agent string remains unchanged in `MPL.Model`, `S5Policy` descriptors, and D3 link data.

## 8. Files changed

Production and test repair:

- `js/app.js` — deterministic visual specification, safe marker definitions, explicit path/marker color, safe marker URLs, and deterministic raw-label overlap geometry.
- `scripts/check-agent-rendering.js` — executable production rendering regression matrix.

Status documentation:

- `audit/00_AUDIT_INDEX.md` — indexes Audit 06 and its scoped verdict.
- `AGENTS.md` — records P1-02 closure, P1-03's focused pending state, and the visible-rendering contract.
- `docs/BAPAL_PLAYGROUND_SPEC.md` — records Audit 06 and the normative raw-label rendering boundary.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` — closes P1-02, records the pending P1-03 renderer recheck, and keeps Round 4 blocked.
- `revision/03_ROUND_2_ADMINISTRATIVE_CLOSURE_AND_ROUND_3_IMPLEMENTATION_LOG.md` — appends an Audit 06 addendum without rewriting the historical record.
- `revision/04_ROUND_3_RAW_LABEL_RENDERING_REPAIR_LOG.md` — this scoped repair log.

`audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md` was already present as an untracked input at the initial status check. It was read and preserved without modification. No CSS change was needed because every dynamic relation now has explicit SVG color attributes.

## 9. Deterministic validation outputs

All required post-repair commands exited 0:

| Command | Exit | Observed result |
|---|---:|---|
| `node scripts/check-agent-rendering.js` | 0 | 5/5 rendering groups pass: minimized `x`, declared compatibility/safe keys, direction/deduplication, S5 operations/cancellation/hidden loops, and overlapping identity/geometry |
| `node scripts/check-s5-invariants.js` | 0 | 12/12 groups; 531 exhaustive directed relations, 2,337 input edges, seed `0x0055f503`, 10,000 sequences, 200,000 operations, 97,793 accepted and 102,207 rejected |
| `node scripts/check-formula-roundtrip.js` | 0 | 108,246 AST/ASCII round trips and 3 display cases |
| `node scripts/check-structural-copy-regressions.js` | 0 | 11/11 structural-copy groups |
| `node scripts/check-bapal-regression.js` | 0 | 8/8 BAPAL/PAL/S5 checks |
| `node scripts/check-logic-regressions.js` | 0 | 6/6 inherited logic checks |
| `node scripts/check-s5-closure.js` | 0 | 4/4 closure/edit-guard checks |
| `node scripts/check-bapal-valuation-class.js` | 0 | valuation-order regression passes |
| `node scripts/check-report-links.js` | 0 | all 5 encoded report links pass |
| `git diff --check` | 0 | no output |

The working-tree path set was identical immediately before and after the nine Node validation commands. No validation command changed or generated a tracked or untracked file. `scripts/check-all.js` and random report generation were not run because they rewrite `reports/random-bapal-evaluation.html`.

## 10. Browser/VM boundary and source-scope integrity

Browser detection found no installed `chromium`, `chromium-browser`, `google-chrome`, `google-chrome-stable`, or `firefox` executable; no Playwright browser cache directory existed. Therefore no native computed-style claim is made.

The focused substitute executes complete production `app.js` with DOM/D3 stubs and inspects explicit SVG `stroke`/`fill` attributes, actual marker definitions, marker URL targets, text-node content, direction flags, geometry, and definition counts. This makes fallback visibility independent of unavailable browser CSS computation while still exercising the production renderer.

`git diff --exit-code HEAD -- js/MPL.js js/s5-policy.js index.html css/app.css lib/formula-parser.min.js scripts/random-bapal-evaluation.js reports` exited 0 with no output. Thus the repair did not change:

- `js/MPL.js`, including parser/printer setup, `_truth`, `deepCopy`, S5 semantic operations, and the compact serializer;
- `js/s5-policy.js`, including all S5 semantic/edit operations;
- formula parser library or browser loader;
- CSS, model import, variable visibility, report generator, or tracked reports.

## 11. Audit artifact hashes

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087  audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md
15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709  audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md
8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2  audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md
```

## 12. Claims not made

This repair does not claim:

- that P1-03 is closed, audited, certified, or independently verified after Audit 06;
- that Stage 0 is complete;
- that Round 4 is authorized or begun;
- that raw multi-character relation labels round-trip through the legacy compact serializer or share URL;
- that multi-character epistemic-agent formula syntax works end to end;
- that arbitrary browser event dispatch or computed CSS was tested natively;
- that bounded regression evidence proves correctness for every model or execution trace.

## 13. Status

**P1-03 repair implemented, pending focused Work Max closure.**

P1-02 remains closed at `6bd3369` by Audit 06. P1-03's semantic/model part remains passed under Audit 06, while the new rendering code remains local until the focused recheck.

## 14. Round 4 gate

**Round 4 remains blocked until the focused Work Max recheck records PASS for this scoped P1-03 raw-label rendering repair.**
