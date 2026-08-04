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
4. **Audited internal semantic copy:** at candidate commit `55f557c210a6a6ad78c928bb1b94b2010929d2a2`, `Model.deepCopy()` is structural and internal PAL/BAPAL semantic copying no longer uses compact model strings. Under the tested internal-copy contract, multi-character atom keys and raw multi-character transition labels are preserved exactly, as are null world indices and multi-digit targets. This repair is covered by `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`.
5. **Still-limited external boundary:** the legacy compact serializer/import/share format concatenates atom names and stores only one terminal agent character per transition token. It remains dependable only for the audited one-character compatibility subset and was not repaired by Round 1.

**Round 2 parser/printer status: IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT.** The local P1-01 repair establishes raw `parse(print(AST)) = AST` over the tested supported AST corpus. Its minimized case is `[(K{a}p)]q`: the ASCII printer now preserves the protective parentheses required around exposed knowledge- or PAL-rooted announcement preconditions, including through ordinary unary-prefix chains. This is a printer-only repair; the raw parser grammar, browser comma removal, and browser bracket preprocessing remain distinct and unchanged. Direct raw inputs such as `[K{a}p]q` may therefore still be rejected even though the printer no longer emits that unprotected form. The bounded round-trip evidence does not certify arbitrary malformed parser inputs or close P1-01 before Work Max review.

The audit's zero-mismatch result applies only to the recorded one-character representation and the exact bounded test matrices in `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`: 6,501,302 model–world–formula comparisons, not all possible inputs.

Round 1 is closed for internal semantic copying. Round 2 is locally implemented, but P1-01 remains open pending Work Max closure audit; P1-02 through P1-07 remain open, and Stage 0 remains open. Do not claim that all multi-character formula interfaces are safe, that multi-character epistemic-agent syntax works end to end, that URL import/share is repaired, or that Stage 0 is complete.

## S5 convention

Formal BAPAL is normally evaluated on epistemic models whose relation for each agent is an equivalence relation: reflexive, symmetric, and transitive.

Current audited limitations:

- turning S5 mode on does not necessarily validate or repair an existing non-S5 model;
- adding a world in S5 mode can break reflexivity for another active agent;
- the current toggle is an editing policy, not proof that the underlying model is S5.

Target invariant for future repair:

- whenever the application claims a model is in S5 mode, every declared or active agent relation must remain an equivalence relation after every accepted import and edit;
- adding, deleting, or relating worlds must preserve that invariant for every relevant agent;
- reflexive self-loops hidden from the visualization must still be stored in the semantic model;
- visually hiding an edge or loop must never remove or invent a semantic relation.

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
- `audit/00_AUDIT_INDEX.md` identifies the audit date, scope, and audited baseline.
- `BAPAL_VERIFICATION.md` is project documentation, not an audit report.
- Except for the narrow Round 1 conclusion in Audit 04, later code changes are not covered by the 2026-08-03 foundational audit. A separate re-audit is required before claiming that later behavior or repairs are audited, certified, or independently verified.

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
