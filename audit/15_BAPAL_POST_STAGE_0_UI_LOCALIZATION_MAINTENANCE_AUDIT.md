# BAPAL Playground post-Stage-0 UI/localization maintenance audit

**Audit mode:** concentrated, independent, read-only maintenance audit
**Repository:** `https://github.com/Raycaesar/bapal`
**Branch:** `bapal-core`
**Audit date:** 2026-08-09 UTC
**Certified Stage 0 HEAD:** `67cd668db7c5aaf4b91dec378728616469cd6c85`
**Certified Stage 0 tree:** `9528d60670081f4f11a10b17d8d421e8be4b3a3a`
**Maintenance HEAD audited:** `6ea7b125d66381632da3b3f1ced4665b69ebdde4`
**Maintenance tree audited:** `51f2e009efc94fc8f15134ddcd1f8d2465f7161c`

## Final verdict

**PASS SUBJECT TO LOCAL REPAIRS**

Scope classification: **B. safe subject to local documentary/UI repairs**.

The maintenance does not reopen a protected logical contract and does not mix in Stage 1 work. The formula editor, browser-only `s5`/`vars` state, bilingual pages, S5 visual projection lifecycle, research examples, deterministic regression matrix, and final remote FAST run all pass. One reproducible browser-navigation defect prevents unconditional certification: an existing URL hash fragment is discarded by `app.js` before or during a state update, so it cannot be preserved by the language link as required. A complete-delta whitespace check also reports five intentional Markdown hard-break lines in the archived Audit 14 metadata; the UI/localization delta itself is whitespace-clean.

This conditional result does not alter Audit 14's Stage 0 closure. It withholds only unconditional certification of the post-Stage-0 maintenance candidate.

## 1. Certified boundary and exact candidate

### 1.1 Hard gate

`audit/14_BAPAL_STAGE_0_FINAL_CLOSURE_AUDIT.md` is present. Line 12 contains the exact unconditional gate text:

> PASS — STAGE 0 CLOSED; STAGE 1 MAY BEGIN UNDER A SEPARATELY AUDITED PLAN

The certified boundary is therefore found and this maintenance audit is not blocked.

### 1.2 Post-boundary history

The full first-parent sequence after the certified Stage 0 HEAD is:

| Order | Commit | Tree | Subject | Maintenance significance |
|---:|---|---|---|---|
| 1 | `a84e874db2e14df2dc0703014b77cdcf0e25bc94` | `835dfe151ca0e41df1604d5a5078a83519766d89` | `archive stage 0 final closure audit` | Adds Audit 14 only |
| 2 | `024e2b1b41ed2d980ef49df7d5c6da2e287c146c` | `ebb2885d6a3ad1a4cfc29029462bed4e552ebb86` | `add UI polish and Chinese localization` | Initial UI/localization maintenance |
| 3 | `4e4238199244d71175a8cc9a226eadd8b04b3ab3` | `47d79bbfa011c1b66d5c7be172549489cb9aeb1e` | `add bilingual UI polish and persistent editor state` | Principal maintenance commit |
| 4 | `6ea7b125d66381632da3b3f1ced4665b69ebdde4` | `51f2e009efc94fc8f15134ddcd1f8d2465f7161c` | `remove trailing whitespace from Chinese page` | Final cleanup and audited HEAD |

The commit after `4e42381` is truly whitespace-only. It changes only `zh.html`, with five removed trailing-space instances represented as five deletions and five insertions. `git diff --quiet -w 4e42381..6ea7b12` succeeds.

### 1.3 Remote and checkout identity

- `HEAD` and `origin/bapal-core` both resolve to `6ea7b125d66381632da3b3f1ced4665b69ebdde4`.
- Both local and remote trees resolve to `51f2e009efc94fc8f15134ddcd1f8d2465f7161c`.
- An independent `git ls-remote origin refs/heads/bapal-core` returns the same SHA.
- A fresh checkout was clean before testing and remained clean after all deterministic tests.
- No untracked or ignored files appeared in the fresh checkout.

### 1.4 Complete changed-file inventory and classification

The exact `67cd668..6ea7b12` delta is 1,716 insertions and 5 deletions across six files:

| File | Git status | Classification | Finding |
|---|---:|---|---|
| `audit/14_BAPAL_STAGE_0_FINAL_CLOSURE_AUDIT.md` | added | documentation/content | Certified Stage 0 archive; no executable effect |
| `css/ui-polish.css` | added | presentation/UI | Cursor, expanded editor, long-formula layout, and UI styling only |
| `index.html` | modified | presentation/UI + documentation/content | English UI wiring and research examples |
| `js/ui-polish.js` | added | presentation/UI + browser-only state | DOM bridge, localization, URL UI state, and visual projection refresh |
| `js/ui-state-bootstrap.js` | added | browser-only state | Captures `s5` and `vars` before legacy URL normalization |
| `zh.html` | added | presentation/UI + documentation/content | Chinese page and executable example links |

There are no changed files in the semantic-executable, test/oracle/schema/workflow, or unexpected categories.

## 2. Findings requiring disposition

### F-1 — hash fragment is lost by the legacy state rewrite

Severity: local UI/navigation defect; no semantic effect.

Reproduction at the immutable audited commit:

1. Load a nontrivial `zh.html` URL containing exact `model`, a 77-character nested `formula`, `s5=1`, `vars=4`, and `#maintenance-anchor`.
2. Before a new state update, the address contains the fragment.
3. Press Evaluate, which invokes `onStateModified()`.
4. The resulting address still has exact `model`, exact `formula`, `s5=1`, and `vars=4`, but has no fragment. The English-language link likewise has no fragment.

The same initial-load loss was reproduced on both `index.html` and `zh.html`.

Root cause is deterministic. `app.js` performs an initial and later `history.pushState` using only `location.pathname`, `model`, and optional `formula`. `ui-state-bootstrap.js`, correctly loaded before `app.js`, captures `s5` and `vars` but not `location.hash`. By the time `ui-polish.js` runs after `app.js`, the original fragment has already been lost. The `onStateModified` wrapper calls the legacy function first, so the same loss occurs after later model/formula updates before `persistUiStateToUrl()` can append the current hash.

Required local repair:

- capture the incoming hash before `app.js` executes;
- reapply that captured hash during the initial UI-state restoration;
- preserve the current hash across every wrapped `onStateModified` call before invoking the legacy URL writer; and
- add a permanent non-writing EN→ZH and ZH→EN regression covering both initial load and a state change before switching languages.

The repair belongs in the browser-only bootstrap/polish layer. It does not require changing model serialization, Schema v1, `MPL.truth`, or S5 relation semantics.

### F-2 — complete-delta whitespace check has a documentary exception

`git diff --check a84e874..6ea7b12`, which isolates the UI/localization maintenance after the Audit 14 archive commit, is clean. `git diff --check 67cd668..6ea7b12` reports exactly five lines in Audit 14's metadata, each ending with two spaces used as Markdown hard breaks. No executable, HTML, CSS, Chinese, or UI-state file is implicated.

These are meaningful Markdown formatting in the certified archive rather than malformed maintenance code. Nevertheless, a literal zero-warning policy over every post-boundary byte must either explicitly accept this archive-only Markdown convention or remove those five hard breaks in a separately scoped documentary cleanup that leaves Audit 14's verdict text unchanged. This observation is documentary only and does not reopen Stage 0.

No other maintenance defect was found. The three duplicate SVG marker IDs in `index.html` are present at the certified baseline at the corresponding tutorial diagrams; they are not introduced by this maintenance delta.

## 3. Stage 0 protected-contract non-regression

The complete patch was inspected, including executable contents. A protected-path diff over `67cd668..6ea7b12` is empty. The conclusion is not inferred merely from filenames.

| Protected contract | Direct diff result | Corroborating evidence |
|---|---|---|
| `MPL.truth` clauses | no hunk | independent core cases and 50,000 FAST comparisons pass |
| Boolean valuation-class enumeration | no hunk | exact valuation-class regression passes |
| Collision-free valuation identity | no hunk | distinct exact valuation-set cases pass |
| PAL semantics | no hunk | core, round-trip/schema, and conformance cases pass |
| Knowledge semantics and shorthand | no hunk | oracle corpus and 12,308 FAST shorthand comparisons pass |
| Structural `deepCopy` | no hunk | 11 structural-copy groups pass |
| Parser/printer semantics | no parser/printer hunk | 108,246 formula round trips pass |
| Model and Formula Schema v1 | no schema or implementation hunk | both 100,000-case schema matrices pass |
| S5Policy closure/edit policy | no hunk | closure and invariant matrices pass; live lifecycle probe passes |
| Independent Python oracle | no hunk | core, sensitivity, conformance, and CI-contract checks pass |
| Production runner | no hunk | local and remote FAST manifests pass |
| Core corpus | no hunk | source hash unchanged and CI manifest matches |
| FAST/FULL profiles | no hunk | profile hashes and CI contract unchanged |
| CI workflow semantic contract | no hunk | final push FAST job succeeds; FULL remains normally skipped on push |
| Sampled-model terminology | no hunk | report terminology/link checks pass; tracked report remains unchanged |

Relevant final source hashes in the remote manifest include:

- `js/MPL.js`: `63b09ca498964c9b544874fcc844932d255411b8fd49adbf89db0b29479c78e5`
- `js/schema-v1.js`: `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76`
- `oracle/bapal_oracle.py`: `f1d27693bdf2a3549accbab7d87161655b90d1a14b482ec1e907c5f2034f5226`
- `oracle/production_runner.js`: `1349dba7f68c77c568c38cb2e30443e8c9353b3c14d7e99067a76c25ebbd620d`
- `oracle/conformance.py`: `8645946faf6ea80a08dc35af865f5cf964a3843f2e777a6cc2ff4edbd03e0160`
- `conformance/v1/core-corpus.jsonl`: `082341406c9b0cd50271e19c395801aff1e83229b6aaa19002b41e42396abc5a`

No separately scoped semantic repair is present or needed.

## 4. Repository hygiene

The fresh checkout contains:

- no `Zone.Identifier` files;
- no tracked or untracked ZIP archives;
- no patch, reject, original, editor-swap, install, or temporary artifacts;
- no unintended helper files; and
- no untracked files after tests.

The final Chinese cleanup removes the intermediate trailing whitespace. All UI/localization files pass the final whitespace check. The only complete-delta warnings are the five Audit 14 Markdown hard breaks described in F-2.

## 5. Permanent deterministic regression matrix

All required non-writing Node checks passed individually:

| Command | Result and material coverage |
|---|---|
| `node scripts/check-report-terminology.js` | pass; 4 terminology groups |
| `node scripts/check-report-links.js` | pass; 5 report links |
| `node scripts/check-agent-rendering.js` | pass; 5 rendering groups |
| `node scripts/check-atomic-model-import.js` | pass; malformed/valid/browser cases and 100,000 candidates |
| `node scripts/check-bapal-regression.js` | pass; 8 cases |
| `node scripts/check-bapal-valuation-class.js` | pass; order invariance and 10 distinct exact sets |
| `node scripts/check-formula-roundtrip.js` | pass; 108,246 round trips, including 100,000 seeded generated formulas |
| `node scripts/check-formula-schema-v1.js` | pass; 100,000 generated schema cases and 724 truth checks |
| `node scripts/check-logic-regressions.js` | pass; 6 groups |
| `node scripts/check-model-schema-v1.js` | pass; 100,000 generated cases plus sparse, null, multi-digit, Unicode, and truth coverage |
| `node scripts/check-s5-closure.js` | pass; 4 closure groups |
| `node scripts/check-s5-invariants.js` | pass; 531 exhaustive relations, 2,337 edges, 10,000 sequences, 200,000 operations |
| `node scripts/check-semantic-state-visibility.js` | pass; 11 groups |
| `node scripts/check-structural-copy-regressions.js` | pass; 11 groups |
| `node scripts/check-all.js` | pass; aggregate matrix |

All required Python checks were run with `PYTHONDONTWRITEBYTECODE=1` and passed:

| Command | Result |
|---|---|
| `python3 scripts/check-independent-oracle.py` | 73 exact core cases; pass |
| `python3 scripts/check-oracle-sensitivity.py` | 24 normal cases, 0 real mismatch; deliberate mutation detected, minimized, replayed, and cleaned |
| `python3 scripts/check-oracle-conformance.py --profile fast` | exact 50,000/50,000 comparisons, 0 mismatch; seed `0x6F524143` |
| `python3 scripts/check-conformance-ci.py` | all CI/profile/manifest contracts pass |

The local FAST run completed in 7.905102 seconds. FULL was not required because no semantic executable changed and neither the diff nor the permanent matrix exposed a semantic anomaly.

The tracked-report hash remained stable and final `git status --short` was empty. Ordinary tests did not rewrite tracked reports.

## 6. Canvas cursor and graph interaction

The cursor rule is confined to `css/ui-polish.css`. It supplies a black crosshair with a white outline and a centered high-contrast dot, with the native `crosshair` as fallback. Computed style at the exact maintenance commit resolves to that SVG cursor on the white editing canvas.

The rule adds no event handler, `pointer-events`, geometry, overlay, or hit-test change. It applies only to `svg.edit:not(.active):not(.ctrl)`, so it is absent during active drawing and Ctrl positioning.

Live exact-commit probes confirmed:

- clicking open canvas adds a world;
- dragging from one world to another adds a relation;
- the resulting relation is selected and responds to direction editing; and
- node/link selection remains operational.

The browser automation surface could not keep the legacy global Control keydown state held across its drag gesture, so it did not provide an independent end-to-end Ctrl-drag motion assertion. The protected Ctrl-drag implementation in `app.js` is byte-for-byte unchanged, its D3 force-drag binding remains present, and the new CSS expressly excludes the `.ctrl` state. There is no maintenance path capable of altering that hit-testing or drag behavior.

## 7. Formula editor and long-formula presentation

`ui-polish.js` retains the original text input as the authoritative hidden storage node and inserts a visible textarea. Every textarea `input`/`change` synchronizes its exact value to the original input. Existing `app.js` evaluation, announcement, and URL serialization continue to read the original input unchanged.

The textarea uses `wrap="soft"`; CSS uses `white-space: pre-wrap` and `overflow-wrap: anywhere`. Browser probes showed visual wrapping with zero inserted newline characters. Enter calls `preventDefault()`, synchronizes the exact string, and invokes the existing evaluator.

Short exact-string tests passed for:

- Boolean: `(p | ~p)`;
- knowledge: `K{a}(p | ~p)`;
- PAL: `[p](p | ~p)`;
- BAPAL: `^K{a}(p | ~p)`; and
- nested PAL/BAPAL: `[p]^K{a}(p | ~p)`.

A substantially wider nested test also passed exactly:

`[p]^K{a}([q]K{b}((p | ~p) & ((q | ~q) & ((r | ~r) & ((s | ~s) & (t | ~t))))))`

Its visible textarea value, hidden authoritative value, and decoded URL `formula` value were byte-identical; the string contained no newline; evaluation succeeded; and one dynamic current-formula MathJax rendering node was present. Announce was separately exercised with `(p | ~p)` and consumed the exact string without changing the model.

The current-formula banner now spans the graph area with a right inset, a 150px maximum height, wrapping, and horizontal/vertical overflow fallback. A long rendered formula remained inside the app body and inspectable. MathJax 2 rendering remained functional, and automatic line-breaking is configured for CommonHTML, HTML-CSS, and SVG output.

## 8. Browser-only URL state and exact reload

### 8.1 State classification and order

`s5=1` and `vars=N` are query parameters used only by the editor/presentation layer:

- `s5=1` requests S5 editing mode;
- `vars=N` requests 1–5 visible atom rows.

They are not Model Schema v1 fields, Formula Schema v1 fields, or legacy compact-model tokens. The semantic compact model remains solely in `model`; the formula remains solely in `formula`.

The bootstrap-before-app order is logically necessary because `app.js` invokes `onStateModified()` during startup and rebuilds the query from only `model` and `formula`. If `s5` and `vars` are not captured first, they disappear before the after-app polish layer can restore them. Both pages use the correct order:

1. MathJax;
2. D3;
3. formula parser;
4. `MPL.js`;
5. `schema-v1.js`;
6. `s5-policy.js`;
7. `ui-state-bootstrap.js`;
8. `app.js`;
9. `ui-polish.js`.

F-1 shows that the same necessary capture was omitted for the hash fragment.

### 8.2 Parameter matrix

Live reload probes established:

- exact `s5=1` restoration;
- exact `vars=N` restoration for every `N` in 1, 2, 3, 4, and 5;
- only the requested p/q/r/s/t prefix is displayed;
- values outside 1–5 or non-integers are rejected by the bootstrap regex and normalized safely;
- only exact `s5=1` enables S5; other values are removed on normalization;
- invalid UI-state values do not alter model or formula;
- repeated evaluations/state updates retain one each of `model`, `formula`, `s5`, and `vars` rather than recursively nesting or expanding the URL;
- the added layer uses `replaceState`, so it does not add a second history entry after the legacy `pushState`; and
- pre-existing model/formula-only links remain compatible, loading with ordinary mode and the existing visible-row default/auto behavior.

History behavior is sane within the legacy design: semantic state updates retain the existing `app.js` push behavior, while the added UI parameters amend the same entry with `replaceState`.

### 8.3 Exact already-S5 reload

A nontrivial stored S5 model with three live worlds, 19 stored transitions, 15 reflexive loops, and two projected non-loop links was loaded with an exact formula, `s5=1`, and `vars=4`. Simultaneously after load and reload:

- S5 toggle was On;
- variable count was 4;
- p, q, r, and s rows were displayed;
- URL retained `s5=1&vars=4`;
- compact semantic model and formula were exact;
- all 19 stored transitions and 15 loops remained present; and
- the visual graph showed the two non-loop links and hid the 15 self-loops.

The same test with `vars=5` displayed p, q, r, s, and t and retained exact semantic state and URL parameters.

## 9. S5 visual projection lifecycle

The lifecycle was exercised against the already-S5 model described above.

### A. S5 enabled

- stored transition count: 19;
- stored self-loop count: 15;
- projected paths: 2 non-loop equivalence links;
- reflexive, symmetric, and transitive checks: all true.

The graph hiding was purely a `S5Policy.buildLinkProjection(model, true)` choice. No self-loop was removed from the model.

### B. S5 On to Off, without refresh

- toggle changed to Off immediately;
- a byte-for-byte JSON semantic snapshot remained equal;
- projected paths changed immediately from 2 to 17: the same 2 non-loop descriptors plus all 15 stored self-loops;
- non-loop directions remained faithful; and
- relation checks remained reflexive, symmetric, and transitive.

Individual-arrow editing became available.

### C. S5 Off to On

Because the relation had remained S5, the app reported that the invariant was already satisfied. It performed no normalization. The semantic snapshot remained equal, stored loops stayed present, and the graph immediately returned to two visible non-loop links with self-loops hidden.

### D. Ordinary editing after Off

After disabling S5, one bidirectional relation was selected and changed to a single rightward relation. The stored transition count became 18, with all 15 loops retained. The graph showed the one remaining direction. The checks changed truthfully to reflexive=true, symmetric=false, transitive=true. This confirms that ordinary individual-arrow editing is enabled and that a resulting non-S5 relation is represented rather than normalized or concealed.

## 10. Language switching and page integrity

### 10.1 State preservation

Starting from a nontrivial model/formula URL with `s5=1&vars=4`, the state was modified after initial load to a new formula and five displayed variables. EN→ZH→EN switching preserved the latest current model, formula, `s5=1`, and `vars=5`; it did not reuse the original captured query.

The language link refreshes from current `location.search` on pointer entry, focus, and click, so current query state is used. It fails the required hash-preservation case for the reason in F-1.

### 10.2 Chinese page

`zh.html` correctly presents the application as a finite-model checker and explicitly distinguishes truth at worlds of the displayed model from satisfiability search and validity. Its modal, epistemic, PAL, BAPAL, Boolean-announcement, and S5 terminology is consistent. The BAPAL `^A` syntax is described as an existential Boolean-announcement operator, not exponentiation or an agent label. Syntax examples and the S5 editing restriction are accurate.

The Chinese page has a coherent six-section structure, valid local assets, executable example links, and primary research links. It need not mirror every English sentence to be accurate.

### 10.3 English page

The prior English tutorial is retained. The maintenance adds the finite-model-checker qualification, UI material, and two research-example subsections without deleting the modal, epistemic, PAL, BAPAL, editing, or project sections. Heading hierarchy and MathJax markup remain coherent. It makes no finite-model satisfiability or validity claim.

### 10.4 Parser and link integrity

An independent HTML parser found zero errors and zero duplicate IDs in `zh.html`. In `index.html`, its only three diagnostics are redefinitions of `mid-arrow-a`, `end-arrow-a`, and `start-arrow-a`; all three are present at the certified baseline in repeated tutorial SVGs. Both pages have balanced section elements, closing HTML elements, correct script order, and no missing local `href`/`src` target. No malformed encoded example URL was found; all supplied research example URLs decoded and executed.

## 11. Hans–Tim vocabulary-extension example

The primary source, [Hans van Ditmarsch and Tim French, “Quantifying over Boolean Announcements”](https://doi.org/10.46298/lmcs-18(1:20)2022), confirms the vocabulary-parametrized form of Lemma 3.15 statement (3.3). The public English and Chinese text does not pretend that the playground literally changes a model's vocabulary from Q to P. Both explicitly call the P-side link a finite-model simulation.

Independent production-semantics evaluation of the Q-side displayed model gives the target truth vector `[true, false, true]` at live worlds w1, w2, w3. For the Boolean witness `(p <-> q)`:

| World | p | q | Witness |
|---|---:|---:|---:|
| w1 | true | true | true |
| w2 | true | false | false |
| w3 | false | false | true |

The announcement therefore removes exactly w2 and retains w1/w3. In the restricted model, the remaining a-accessibility at w1 and b-accessibility make the displayed target true at w1; the direct updated-model target vector is `[true, true]` on the retained worlds.

For the P-side simulation, q and every otherwise unused browser atom are constant across worlds. They therefore do not split any finite valuation class and cannot increase Boolean separation power in that displayed finite model. This narrower partition claim is correct. The page does not upgrade it to literal equivalence with the paper's full vocabulary-parametrized model construction.

## 12. Kuijer APAL example

The primary manuscript is [Louwe B. Kuijer, “Unsoundness of R(□)”](https://personal.us.es/hvd/APAL_counterexample.pdf). The 2015 date is independently corroborated in the scholarly bibliography of [Arbitrary Public Announcement Logic with Memory](https://link.springer.com/article/10.1007/s10992-022-09664-6).

The pages correctly identify:

- the manuscript title and year;
- `R(□)` as the unsound APAL rule at issue;
- APAL's □ as quantification over its allowed public announcements;
- the BAPAL replacement □β as Boolean-announcement quantification;
- `gamma = p ∧ diamond_b not-p ∧ diamond_a K_b p`;
- `[q]` as the concrete announcement in the valid APAL premise pattern; and
- `p or diamond_a r` as the crucial non-Boolean witness because it contains an epistemic operator.

All three supplied playground links were decoded and evaluated independently on the six live worlds of the displayed countermodel:

| Displayed formula | Live-world truth vector | Required claim |
|---|---|---|
| Boolean-restricted premise `pre_beta` | `[true, true, true, true, true, true]` | true at every displayed world |
| Boolean-restricted conclusion `con_beta` | `[true, true, true, true, true, true]` | true at every displayed world |
| Explicit non-Boolean witness formula `exp` | `[false, true, true, true, true, true]` | not true at every displayed world |

The wording is properly model-local. It says that this APAL countermodel no longer refutes the Boolean-restricted formula; it does not call either BAPAL formula valid on the basis of one model and does not infer a general BAPAL soundness theorem.

## 13. Remote CI evidence

Final certification evidence attaches to the final cleanup HEAD, not merely the principal maintenance commit.

| Run | Head SHA | Conclusion | FAST comparisons | Mismatches | Artifact evidence |
|---|---|---|---:|---:|---|
| [31341605911](https://github.com/Raycaesar/bapal/actions/runs/31341605911) | `6ea7b125d66381632da3b3f1ced4665b69ebdde4` | success | 50,000 / 50,000 | 0 | artifact `bapal-conformance-fast-31341605911-1`; SHA-256 `4e516fe9d28e4b6ed86c2c7b363c11fa29d10c1ddd40d0c5c4b42436bfeed4d9` |
| [31341198350](https://github.com/Raycaesar/bapal/actions/runs/31341198350) | `4e4238199244d71175a8cc9a226eadd8b04b3ab3` | success | 50,000 / 50,000 | 0 | historical principal-commit artifact; SHA-256 `6b627bd0a524777ba6171e6017da60bcfe9ca9ae575563b0c33bf9de30b8975b` |

The final manifest records tree `51f2e009efc94fc8f15134ddcd1f8d2465f7161c`, profile `fast`, seed `0x6F524143`, 64 models, 256 formulas, 167 live pointed worlds, 25,000 S5 comparisons, 25,000 non-S5 comparisons, 27,742 BAPAL-bearing comparisons, 24,025 PAL-bearing comparisons, zero mismatch, and status `pass`. The final FAST job succeeded; the FULL job was skipped as expected for this push contract.

## 14. Scope judgment and certification effect

This is ordinary post-Stage-0 UI/localization maintenance, not Stage 1 implementation. Audit 14's Stage 0 closure remains intact. No protected logical semantic contract was reopened or silently changed. Browser-only UI state is distinct from semantic model state. S5 on/off graph projection faithfully reflects stored relations without changing relation semantics. Formula-input and long-formula changes remain compatible with existing evaluation. Both language pages preserve finite-model-checker nonclaims. The Hans–Tim explanation is properly limited to finite-model simulation where appropriate. The Kuijer section is a model-local illustration rather than an unsupported soundness proof. Final maintenance HEAD has successful remote FAST evidence.

Unconditional maintenance certification is withheld until F-1 is repaired and a focused read-only regression confirms initial-load and post-state-change hash preservation in both language directions. F-2 should be resolved by an explicit archive-format policy decision or documentary cleanup if the project requires literal zero output from `git diff --check` over the entire post-boundary range.

No Stage 1 code was implemented, proposed as a patch, or authorized by this audit. Stage 1 should remain a separately planned and audited activity after the local maintenance repair is closed.
