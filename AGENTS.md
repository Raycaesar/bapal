# AGENTS.md

This file is the authoritative working instruction set for future Codex changes in this repository. Read it before editing and apply the more restrictive rule whenever a task instruction and a general project preference differ.

## Project identity

This repository is a finite explicit-model playground and checker for modal logic, epistemic logic, public announcement logic (PAL), and the existential Boolean Arbitrary Public Announcement Logic (BAPAL) operator. It evaluates formulas at worlds of a supplied finite model and visualizes that model.

The project is inherited from the Modal Logic Playground / Epistemic Logic Playground. Preserve inherited modal, epistemic, and PAL behavior unless an explicitly scoped, tested repair requires a change.

The application is currently static JavaScript. Its main files are:

- `index.html`: UI and explanatory text.
- `css/app.css`: presentation styling.
- `js/MPL.js`: formula parser interface, model representation, serialization, and semantic evaluator.
- `js/app.js`: D3 graph editor, UI interaction, model editing, and formula evaluation.
- `scripts/`: Node-based diagnostics, regression checks, and report generation.

## Source hierarchy

Use the following hierarchy for mathematical and semantic decisions, in this order:

1. the current manuscript used in the foundational audit;
2. Hans van Ditmarsch and Tim French, “Quantifying over Boolean Announcements,” *Logical Methods in Computer Science* 18(1), 2022;
3. `docs/BAPAL_PLAYGROUND_SPEC.md`, once that file is created and approved;
4. implementation code;
5. UI text and `README.md`.

Implementation behavior is evidence about the current program; it is not itself the semantic specification. When layers disagree, document the mismatch and resolve it using the higher-ranked source rather than silently treating existing behavior as normative.

## Operator conventions

- `K{a}A` is individual knowledge of `A` for agent `a`.
- `[A]B` is the public-announcement box: if `A` is true at the current world, then after publicly announcing `A` and restricting the model to the `A`-worlds, `B` holds there; it is vacuously true where `A` is false.
- `^A` is the ASCII input for the existential Boolean-announcement modality.
- Its displayed notation is `◇ᵝA` / `\Diamond_{\beta}A`.
- `β` means Boolean announcement, not agent `b`.
- The inherited ordinary `□` and `<>` operators are ordinary accessibility modalities. They are not the universal or existential BAPAL operators.
- `[!]A` is not currently implemented.
- `K{a,b,c}A`, where the browser or another supported surface accepts it, is only shorthand for the conjunction of the listed individual knowledge modalities. It is not distributed knowledge, common knowledge, or a new group modality. Do not assume the comma form is accepted by the raw parser.

## Product scope and prohibited claims

The application checks formulas on one supplied finite explicit model, either at one selected world through the semantic API or across the displayed worlds through the UI.

It is not:

- a general BAPAL satisfiability solver;
- a validity checker;
- a BAPAL decision procedure;
- evidence that finite-model search is complete for BAPAL satisfiability.

Truth at some world of one supplied or sampled model must not be called “satisfiability” without the explicit qualification “in this model.” Truth at every world of one model must not be called “validity” or “global validity.” Prefer labels such as `trueSomewhereInModel` and `trueAtEveryWorldInModel`.

Tests provide bounded regression, property, exhaustive, or differential evidence. They are not a mathematical proof of soundness, completeness, validity, satisfiability, decidability, or correctness on all finite models.

## Finite BAPAL semantic convention

Boolean announcements may contain propositional atoms and Boolean connectives only. They may not contain knowledge operators, PAL operators, BAPAL operators, or other modalities.

On a finite explicit model, Boolean-definable announcement domains are exactly unions of complete propositional-valuation classes. A truthful witness for existential `^A` must retain the current world's entire valuation class; worlds in the same complete valuation class cannot be separated by a Boolean announcement.

This reduction is valid only when:

- atom identities are preserved exactly through every model operation;
- valuations are complete under one shared vocabulary convention;
- absent atoms are treated uniformly as false;
- restriction and copying preserve every relevant valuation key.

Do not justify the reduction using an infinite “complete valuation conjunction.” Use the finite separator argument: because only finitely many valuation classes occur in the active finite domain, choose a distinguishing atom for each relevant included/excluded class pair and build a finite Boolean formula from those finitely many separating literals.

Hidden, stale, or unsupported valuation keys must never silently affect semantic results. Any semantically active key must be preserved and disclosed, or the input must be rejected with an explicit error.

## Current supported implementation boundary

Keep these five layers distinct:

1. **Formal language:** the mathematical sources use countably many propositional atoms and agents.
2. **Raw parser:** the inherited parser accepts ASCII word-like identifiers, including multi-character atoms, and has behavior that differs from browser preprocessing.
3. **Browser surface:** the current UI supports atoms `p`–`t` and agents `a`–`e`, with browser-specific comma removal and announcement-parenthesis rewriting.
4. **Audited internal semantic copy:** Round 1 P0-01 is closed at commit `55f557c210a6a6ad78c928bb1b94b2010929d2a2` by `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`. `Model.deepCopy()` is structural and internal PAL/BAPAL semantic copying no longer uses compact model strings. Under the tested internal-copy contract, multi-character atom keys and raw multi-character transition labels are preserved exactly, as are null world indices and multi-digit targets.
5. **Still-limited external boundary:** the legacy compact serializer/import/share format concatenates atom names and stores only one terminal agent character per transition token. It remains dependable only for the audited one-character compatibility subset and was not repaired by Round 1.

**Round 2 parser/printer status: CLOSED AT `e0c816f` — WORK MAX AUDIT 05.** Audit 05 closes P1-01 under the audited Round 2 contract: supported AST ASCII printing is raw-parser-reparsable. Its minimized case is `[(K{a}p)]q`: the ASCII printer preserves the protective parentheses required around exposed knowledge- or PAL-rooted announcement preconditions, including through ordinary unary-prefix chains. This is a printer-only repair; the raw parser grammar, browser comma removal, and browser bracket preprocessing remain distinct and unchanged. Direct unprotected raw inputs such as `[K{a}p]q` may therefore still be rejected even though the printer does not emit that unprotected form. The audited closure does not certify arbitrary malformed parser inputs or unify the raw and browser grammars.

The audit's zero-mismatch result applies only to the recorded one-character representation and the exact bounded test matrices in `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`: 6,501,302 model–world–formula comparisons, not all possible inputs.

Round 1 P0-01 is closed for internal semantic copying at `55f557c` by Audit 04. Round 2 P1-01 is closed at `e0c816f` by Audit 05, and the closure remains valid at final log-only HEAD `f7c7d59`. Audit 06 closes Round 3 P1-02 at `6bd3369` and passes the semantic/model part of P1-03. Audit 07 closes P1-03 and Round 3 narrowly at `3f27ac2` under the audited raw-label rendering contract. Audit 08 closes P1-04, P1-05, and Round 4 at `5c89ab5`; closure is preserved at final log-only HEAD `ab26863`. Round 5 Schema v1 is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT** in the current local worktree. P1-06, P1-07, and Stage 0 remain open. Do not claim that all multi-character formula interfaces are safe, that a multi-character Formula Schema v1 knowledge-agent entry denotes one epistemic agent, that the legacy compact format has become a general identifier format, that Schema v1 has replaced share URLs, that Round 5 is audited or closed, that P1-06 or P1-07 is closed, or that Stage 0 is complete.

## S5 convention

Formal BAPAL is normally evaluated on epistemic models whose relation for each agent is an equivalence relation: reflexive, symmetric, and transitive.

Historical audited-baseline limitations at `92a4ba6`:

- turning S5 mode on does not necessarily validate or repair an existing non-S5 model;
- adding a world in S5 mode can break reflexivity for another active agent;
- the baseline toggle is an editing policy, not proof that the underlying model is S5.

Audit 06 passed the following Round 3 semantic/model policy and closed P1-02 at `6bd3369`:

- the relevant-agent set is the deterministic sorted union of browser-declared agents `a`–`e`, every relation label currently stored in the semantic model, and the currently selected agent;
- enabling S5 over an already-S5 model requires no confirmation and does not mutate the model;
- enabling S5 over any malformed relevant-agent relation requires explicit confirmation before mutation; cancellation keeps S5 off and leaves both the semantic model and D3 relation projection unchanged;
- accepted normalization computes and verifies the least equivalence closure for every relevant agent by completing each undirected-support connected component independently, adding every required stored reflexive loop, preserving existing edges, and never joining separate components;
- while S5 is on, adding a world preserves every relevant-agent equivalence relation, adding a selected-agent relation merges exactly the connected equivalence classes it bridges, and deleting a world preserves S5 by domain restriction;
- individual selected-edge Delete/L/R/B operations remain blocked while S5 is on, and switching S5 off does not mutate relations;
- reflexive self-loops hidden from the visualization remain stored in the semantic model, while every non-loop semantic edge added by closure must appear in the synchronized D3 projection.

Audit 06 established that descriptor synchronization alone does not establish visible browser rendering. Every non-loop descriptor for every relevant relation label must receive an explicit visible stroke, the start/end markers required by its direction flags, and a visible mid-edge label containing the actual semantic agent string. Marker definitions must exist, must not be duplicated, and unknown raw labels must use safe injective DOM/SVG keys rather than raw agent text. Declared agents `a`–`e` retain their existing colors and marker identities.

Audit 07 rechecked the focused raw-label renderer and passed that visual contract at `3f27ac2`. P1-03 and Round 3 are closed. Stage 0 remains open.

## Round 4 audited implementation boundary

**Status: CLOSED AT `5c89ab5` — WORK MAX AUDIT 08.** Audit 08 closes P1-04 atomic legacy compact import and P1-05 semantic visibility/disclosure under the documented Round 4 boundary. The transactional import boundary and semantic inspector are protected behavior. Round 4 is closed; Stage 0 remains open.

- **Atomic legacy import:** `MPL.parseModelString()` parses the entire legacy compact input into intermediate plain data. `Model.loadFromModelString()` validates every state, transition, target, and null reference, prepares the replacement model completely, and performs a single commit only after success. Failure returns a structured `{ok:false,error:{...}}` result and leaves the prior model unchanged; no malformed suffix or valid prefix is retained.
- **Stable legacy structure:** successful imports preserve raw world-array length, stable indices, null/deleted slots, valuations, and set-like transition deduplication. The legacy compact serializer/import/share boundary remains a compatibility format with its documented one-character atom and one-code-point relation-label restrictions; Round 4 does not make it a general multi-character identifier format.
- **Browser atom boundary:** browser/share-URL compact imports support exactly `p`, `q`, `r`, `s`, and `t`. A parsed import containing any other atom key is rejected atomically with `UNSUPPORTED_BROWSER_ATOM` and a clear visible error. The valid default model remains intact, the failed URL is not replaced by a partial model, and S5 remains off.
- **Raw Model API:** programmatically constructed `MPL.Model` values may contain other true atom keys such as `foo` or `bar_baz`. Those keys are preserved and disclosed as unsupported semantic keys; they are not silently deleted, renamed, or hidden from the semantic snapshot.
- **Relation-label policy:** the compact boundary does not reject a relation merely because its one-code-point label lies outside browser buttons `a`–`e`. Labels such as `x` remain semantic relation identities, retain the Audit 07 rendering contract, appear in the semantic inspector, and are identified when no direct selection button exists.
- **Variable-count policy:** the selector controls only the displayed `p`–`t` rows and node-label projection. Reducing it does not edit semantic valuations or change formula/BAPAL truth. The UI explicitly states this and lists supported true keys hidden by the current projection.
- **Semantic inspector:** the edit pane contains a collapsed accessible `<details>` inspector. Its text summary and JSON snapshot report live and null worlds, all true keys, supported/displayed/hidden/unsupported keys, active relation labels, transition and stored-loop counts, visible non-loop link descriptors, labels without buttons, S5 state, warnings, semantic worlds by stable index, and the separate graph projection. Raw atom/agent strings are inserted through text boundaries, not HTML.
- **Round 4 historical scope:** the Round 4 implementation itself kept the legacy compact format explicit and introduced no versioned JSON model/formula schema. Audit 08 authorized the separately reviewable Round 5 work described below.

## Round 5 local implementation boundary

**Status: IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT.** The current local worktree introduces Schema v1 as a semantic JSON interchange boundary. It has permanent deterministic and concentrated independent review evidence, but no Work Max closure audit yet. Round 5 is not closed, P1-06/P1-07 remain open, and Stage 0 remains open.

- **Separate formats:** model documents use `{"format":"bapal-model","version":1,"worlds":[...]}` and formula documents use `{"format":"bapal-formula","version":1,"formula":...}`. Their `format` and `version` values identify and version the two document kinds independently.
- **Not a compact/share repair:** Schema v1 does not call the legacy compact parser or serializer, is not a URL encoding, and does not replace the current share URL. The legacy compact serializer/import boundary remains a compatibility format with its documented one-character atom and one-code-point relation-label restrictions.
- **Model identity:** a world's identity is its array index. Array order, empty arrays, and leading/internal/trailing `null` slots are preserved without compaction. True atoms and labelled transitions are explicit arrays; assignments are not object-property interchange data, and relations are not concatenated tokens.
- **Model identifiers:** atom names and relation labels are exact, nonempty, well-formed Unicode scalar strings. They are not normalized or truncated. Whitespace, punctuation, markup-shaped strings, combining sequences, emoji, and prototype-sensitive strings such as `__proto__` are data; empty strings and isolated UTF-16 surrogate code units are rejected. Decoding uses prototype-safe assignment storage.
- **Formula identifiers:** Formula Schema v1 atom names are nonempty ASCII word strings matching `[A-Za-z0-9_]+`. Each `knowledge.agents` entry is exactly one ASCII letter, digit, or underscore matching `[A-Za-z0-9_]`. The ordered, nonempty agents array preserves the evaluator's current conjunction-like `K{abc}` shorthand as `["a","b","c"]`; it does not claim that `"abc"` is one supported epistemic-agent identifier. Duplicate shorthand units are preserved.
- **Stable formula AST:** the public node vocabulary is `atom`, `not`, `box`, `diamond`, `bapal`, `knowledge`, `announcement`, `and`, `or`, `implies`, and `iff`, with explicit operand fields. Parser-internal `annce_start.annce_end` and `kno_start.kno_end` nodes do not appear in Schema v1 documents.
- **Direct formula bridge:** formula encoding reads the legacy `Wff` JSON AST and formula decoding constructs a fresh `Wff` from a directly mapped legacy JSON AST. ASCII parsing/printing is not used as semantic transport.
- **Canonicalization:** model world order and null indices are fixed; atom sets sort by Unicode scalar value; transitions sort by numeric target and then relation label; duplicate atoms and duplicate semantic transitions are rejected. Formula child and knowledge-unit order are preserved exactly. Canonical field construction and `canonicalStringify()` do not use JavaScript insertion order as semantic identity and are not described as RFC 8785 canonical JSON.
- **Validation layers:** the Draft 2020-12 JSON Schema artifacts express document shape, required fields, closed objects, primitive types, formula identifier patterns, and local uniqueness. Runtime validation additionally enforces well-formed Unicode scalar identifiers, safe/live model targets, cyclic-input rejection where applicable, and compatibility with the current `MPL.Model`/`MPL.Wff` representations.
- **Failures and ownership:** unknown versions fail explicitly with `UNSUPPORTED_VERSION`; unexpected structural fields are rejected. Ordinary validation failures return `{ok:false,error:{code,message,path,...}}`. Successful decode returns fresh model or Wff structures plus an independent canonical document; encoding and decoding do not mutate caller-owned inputs.
- **Protected boundaries:** the formula parser, Round 2 printer, `_truth`, Round 1 `deepCopy()`, S5 closure, Round 3 rendering, Round 4 transactional legacy import and semantic inspector, report generator, and reports remain protected.

## Stage 0 correctness freeze

**Until Stage 0 closure is explicitly certified, correctness work takes priority over features and architecture changes.**

Until that certification:

- do not add new logical operators;
- do not add a backend;
- do not add a database;
- do not add Z3 as the semantic core;
- do not add React, Vue, or a replacement frontend;
- do not add TypeScript, a build system, WebAssembly, or Rust unless a later explicitly approved Stage 1 task requires it;
- do not perform opportunistic UI redesign;
- do not combine multiple P0/P1 repairs into one uncontrolled change;
- do not expand a repair beyond its named audit finding without explicit approval.

Every future implementation task must include minimized regression cases and a repair log that identifies the audit finding, before/after behavior, files changed, tests run, and remaining uncertainty. Keep each repair small enough to review independently.

## Audit handling

- `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md`, `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`, and `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md` are read-only historical audit artifacts for commit `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`.
- Future agents must not rewrite, refresh, or silently “correct” those three reports.
- `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` is the read-only closure audit for candidate commit `55f557c210a6a6ad78c928bb1b94b2010929d2a2`; it closes only P0-01's internal semantic-copy defect.
- `audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md` is the read-only PASS closure audit for Round 2 implementation commit `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` and final log-only HEAD `f7c7d599afca5622c227ea51d930dfd14005b016`; it closes P1-01 under the audited supported-AST ASCII-printing contract while leaving Stage 0 open.
- `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md` is the read-only **PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR** audit for complete implementation candidate `6bd33697491820db3d0999ac7c7ccf99b05291d5` and final audited log-only HEAD `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`. It closes P1-02, passes P1-03's semantic/model behavior, and leaves P1-03 open pending the focused raw-label rendering repair and recheck.
- `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md` is the read-only **PASS — P1-03 CLOSED; ROUND 3 CLOSED; PROCEED TO ROUND 4** focused recheck for rendering-repair commit `3f27ac2d4476ecc23da0358f23f2ced87db5500d`. It closes only Audit 06's remaining raw-label SVG rendering defect and leaves Stage 0 open.
- `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` is the read-only **PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5** closure audit for Round 4 implementation commit `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` and final log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66`. It closes Round 4 under the documented legacy-format and semantic-visibility boundaries while leaving P1-06, P1-07, and Stage 0 open.
- `audit/00_AUDIT_INDEX.md` identifies the audit date, scope, and audited baseline.
- `BAPAL_VERIFICATION.md` is project documentation, not an audit report.
- Except for the narrow Round 1 conclusion in Audit 04, the narrow Round 2 conclusion in Audit 05, the semantic/model Round 3 disposition in Audit 06, the focused rendering closure in Audit 07, and the Round 4 import/visibility closure in Audit 08, later code changes are not covered by those audits. The local Round 5 Schema v1 implementation is pending its own Work Max closure audit and must not be described as audited or closed.

## Engineering rules

- Read this file and the audit findings relevant to the requested change before editing.
- Keep the application static during Stage 0 and preserve inherited modal, epistemic, and PAL behavior.
- Distinguish semantic model data in `MPL.Model` from D3 nodes, links, labels, checkboxes, and other visual projections. The semantic model is authoritative for truth evaluation.
- Semantic restriction, copying, or evaluation must not depend on URL or compact-string serialization. Treat serialization as an external boundary, not an internal semantic operation.
- Malformed model or formula inputs must never silently clear valid state or produce a partial model. Validation must be atomic: either accept the complete input or return an explicit error without changing the prior model.
- Preserve atom names, agent names, world identities, valuations, and all agents' relations exactly across supported model operations.
- Prefer small, reviewable changes tied to one documented defect or acceptance criterion.
- Add or update minimized tests whenever changing `js/MPL.js`, parsing/printing, serialization, relation editing, S5 behavior, report terminology, or semantic/UI boundaries.
- Run the relevant deterministic tests after every implementation change. Use independent differential or property checks when the semantic boundary changes.
- Never regenerate tracked reports, especially `reports/random-bapal-evaluation.html`, unless the task explicitly requires regeneration and provenance is recorded.
- Before running an aggregate script, inspect whether it rewrites tracked files. `scripts/check-all.js` currently invokes report-generating commands.
- After every change, state exactly what changed, why the intended logic remains correct, what was tested, the observed results, and what remains unverified.
- Do not create commits, branches, tags, releases, or pull requests unless the user explicitly requests them.
