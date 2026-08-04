# BAPAL Playground Semantic and Product Specification

## 1. Status and authority

- **Specification version:** Stage 0 baseline
- **Baseline commit:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`
- **Specification date:** 2026-08-04

**NORMATIVE.** This document is the semantic and product contract for future implementation work on the BAPAL Playground. Mathematical decisions remain subject to the source hierarchy in `AGENTS.md`: the manuscript used in the foundational audit and the primary literature rank above this repository specification.

The three Work Max reports are:

1. [`audit/01_BAPAL_FOUNDATIONAL_AUDIT.md`](../audit/01_BAPAL_FOUNDATIONAL_AUDIT.md), which reconstructs and audits the baseline implementation;
2. [`audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`](../audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md), which records the independent bounded verification and performance evidence;
3. [`audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md`](../audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md), which defines the correctness-first roadmap and architecture gates.

**CURRENT.** Those reports diagnose the audited baseline and supply evidence for this specification.

**NORMATIVE.** The reports remain read-only historical artifacts. They are not living specifications and must not be rewritten when the implementation changes. Later changes are governed by this document and require separate verification and, before any certification claim, a separate re-audit.

## Post-baseline audited/implementation deltas

### Round 1 — structural internal model copy

- **Implementation commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`
- **Closure audit:** [`audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`](../audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md)
- **Status:** **CLOSED**
- Internal PAL/BAPAL semantic copying no longer depends on compact serialization.
- Multi-character atom keys and raw transition labels are structurally preserved in the tested internal-copy contract.
- The compact serializer/import/share boundary remains unchanged and uncertified beyond its audited one-character compatibility subset.
- No PAL or BAPAL truth clause changed.

This delta closes only P0-01's internal semantic-copy defect. Stage 0 remains open, and the historical baseline account below remains evidence of the defect as it existed at commit `92a4ba6`.

### Round 2 — parser/printer closure

- **Defect:** P1-01
- **Implementation commit:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`
- **Closure audit:** [`audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md`](../audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md)
- **Status:** **CLOSED AT `e0c816f` — WORK MAX AUDIT 05**
- **Final-HEAD confirmation:** closure remains valid at final log-only HEAD `f7c7d599afca5622c227ea51d930dfd14005b016`.
- **Minimized case:** `[(K{a}p)]q`; at the audited baseline it printed as `[K{a}p]q`, which the raw parser rejected, while the Round 2 printer retains protective syntax and reparses to the same AST.
- **Repair scope:** ASCII pretty-printing only. A small AST-structural rule protects announcement preconditions whose exposed unary spine terminates in knowledge or PAL.
- **Permanent-suite evidence:** all 108,246 checked-in AST round trips passed structural equality and print idempotence.
- **Independent evidence:** exhaustive verification through logical size 6 and a separate 50,000-generated-AST verification found zero candidate failures.
- The parser library, configured parser operators, semantic evaluator, browser preprocessing, and `Model.deepCopy()` were unchanged.
- Raw/browser grammar differences remain: browser comma removal and bracket preprocessing are unchanged, and unprotected direct raw forms may remain rejected.

Audit 05 closes P1-01 only for supported AST ASCII printing under the audited Round 2 contract. It does not certify arbitrary malformed parser strings or unify the raw and browser grammars. Stage 0 remains open.

### Round 3 — S5 invariant repair

- **Defects:** P1-02 and P1-03
- **Complete implementation candidate:** `6bd33697491820db3d0999ac7c7ccf99b05291d5`
- **Final audited log-only HEAD:** `04f264a5e5900719eb70a0eaf77bd64f73b3ef0c`
- **Closure audit:** [`audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md`](../audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md)
- **Audit verdict:** **PASS SUBJECT TO ONE SCOPED ROUND 3 UI REPAIR**
- **P1-02 status:** **CLOSED AT `6bd3369` — WORK MAX AUDIT 06**
- **P1-03 status:** **SCOPED RENDERING REPAIR IMPLEMENTED — PENDING FOCUSED WORK MAX RECHECK**
- **Relevant-agent policy:** the deterministic sorted union of browser-declared agents `a`–`e`, every relation label currently stored in the semantic model, and the currently selected agent.
- **Enable policy:** if every relevant-agent relation is already an equivalence relation, S5 is enabled without confirmation or model mutation. Otherwise the application asks for explicit confirmation before any normalization.
- **Cancellation:** cancelling confirmation leaves S5 off and leaves both the semantic model and its D3 relation projection unchanged.
- **Accepted normalization:** every relevant-agent relation is replaced with its least equivalence closure. Existing directed edges induce undirected connected components; each component is completed as a directed relation with all required reflexive loops, and separate components are not joined. The result is verified before S5 is represented as on.
- **S5-on editing:** a new world receives a stored loop for every relevant agent without joining prior classes; a new selected-agent relation merges exactly the equivalence classes it bridges; deleting a world preserves equivalence by domain restriction; and individual selected-edge Delete/L/R/B operations remain blocked. Switching S5 off does not mutate relations.
- **Model/D3 synchronization:** the semantic model remains authoritative. Stored loops may remain visually hidden, but every non-loop closure edge is included in the deduplicated D3 projection after normalization and subsequent S5 edits.
- **Permanent-suite evidence:** all 12 checked-in S5 invariant groups pass, including all 531 directed relations on zero through three worlds and 10,000 deterministic event sequences comprising 200,000 operations with seed `0x0055f503`.
- **Independent audit evidence:** Audit 06 independently exhausted all 66,067 directed relations on zero through four worlds and ran 25,000 multi-agent sequences comprising 600,000 operations under a separate seed, with zero semantic invariant or model/descriptor-projection failures. Its executable full-`app.js` VM/stub integration passed confirmation, cancellation, normalization, world addition, class merge, deletion, blocked-edge, and disable paths.
- **Audit 06 rendering counterexample:** the compact model `AS1x,;AS` produces the correct stored and projected `x` relation, but the audited renderer supplied neither a visible stroke nor existing `x` marker definitions. Thus model/D3 descriptor synchronization was not sufficient evidence of visible SVG output.
- **Focused local rendering policy:** every non-loop descriptor now receives an explicit visible stroke, marker URLs backed by deduplicated start/end/mid definitions, and a mid-edge text label preserving the actual semantic agent string. Declared agents `a`–`e` retain their colors and marker identities. Other labels use a fixed accessible neutral color and an injective Unicode-code-point marker key, and deterministic pair-local geometry keeps overlapping declared/raw and raw/raw relations distinct.
- **Protected semantics:** parser configuration, Round 2 ASCII printing, PAL/BAPAL and inherited truth clauses, Round 1 `deepCopy()`, compact serialization, and the report generator were unchanged.

Audit 06 closes P1-02 and passes P1-03's semantic/model behavior. The focused raw-label rendering repair is local evidence only; P1-03 remains open until Work Max performs the focused closure recheck. Stage 0 remains open, and Round 4 remains blocked until that recheck passes.

## 2. Product identity

**NORMATIVE.** The BAPAL Playground is:

- an editor for explicit finite Kripke models;
- a pointed finite-model checker for evaluating a formula at a world;
- a whole-given-model truth-set visualizer for showing which worlds satisfy a formula;
- a teaching interface for modal logic, epistemic logic, public announcement logic (PAL), and the existential Boolean Arbitrary Public Announcement Logic (BAPAL) modality.

The product is inherited from the Modal Logic Playground / Epistemic Logic Playground and should retain their supported modal, epistemic, and PAL behavior unless an explicitly approved repair changes the contract.

**NORMATIVE.** The product is not:

- a general satisfiability solver;
- a general validity checker;
- an unbounded BAPAL decision procedure;
- a proof of axiomatic soundness or completeness;
- a proof that finite-model search is complete for BAPAL satisfiability.

**KNOWN LIMITATION.** The audited application is suitable only for bounded, carefully interpreted finite-model work. It is not currently a research-grade calculation service.

## 3. Formal vocabulary and operators

**NORMATIVE.** Let `Prop` be a countable set of propositional atoms and `Ag` a countable set of agents. The intended language contains propositional atoms, Boolean connectives, individual knowledge `K_a`, PAL, and the existential Boolean arbitrary-announcement modality.

The concrete application notation is:

| Construct | Application notation |
|---|---|
| Negation | `~A` |
| Conjunction | `(A & B)` |
| Disjunction | `(A | B)` |
| Implication | `(A -> B)` |
| Biconditional | `(A <-> B)` |
| Individual knowledge | `K{a}A` |
| Public-announcement box | `[A]B` |
| Existential Boolean arbitrary announcement | `^A` |

**NORMATIVE.** The BAPAL existential modality has ASCII form `^A`, Unicode display `◇ᵝA`, and LaTeX display `\Diamond_{\beta}A`. The `β` marks quantification over Boolean announcements; it does not denote agent `b`.

**CURRENT.** The inherited raw parser also accepts ordinary accessibility operators `□` and `<>`. Their implementation quantifies over stored outgoing accessibility edges without treating them as BAPAL quantifiers.

**NORMATIVE.** The inherited ordinary `□` and `<>` operators are distinct from universal and existential BAPAL operators. They must never be displayed, documented, or interpreted as BAPAL quantifiers.

**CURRENT.** `[!]A` is not implemented: there is no corresponding accepted syntax, AST node, or semantic clause in the baseline application.

**CURRENT.** Where the browser accepts `K{a,b,c}A`, it removes commas and evaluates the result as the conjunction `K_a A ∧ K_b A ∧ K_c A`. The raw parser accepts the corresponding compact form `K{abc}A`, not the comma-separated form directly.

**NORMATIVE.** This multi-agent notation is only a surface abbreviation for a conjunction of individual knowledge modalities. It is not distributed knowledge, common knowledge, or a separate group-knowledge operator.

## 4. Formal semantic clauses

**NORMATIVE.** A finite epistemic model is

\[
M=(W,(R_a)_{a\in Ag},V),
\]

where `W` is a finite set of worlds, each `R_a ⊆ W × W`, and `V(p) ⊆ W` for every `p ∈ Prop`. Let `w ∈ W`. Truth is defined recursively as follows:

\[
M,w\models p \quad\Longleftrightarrow\quad w\in V(p).
\]

\[
M,w\models\neg A \quad\Longleftrightarrow\quad M,w\not\models A.
\]

\[
M,w\models A\land B \quad\Longleftrightarrow\quad M,w\models A\text{ and }M,w\models B.
\]

The remaining Boolean connectives have their ordinary truth-functional clauses:

\[
\begin{aligned}
M,w\models A\lor B &\Longleftrightarrow M,w\models A\text{ or }M,w\models B,\\
M,w\models A\to B &\Longleftrightarrow M,w\not\models A\text{ or }M,w\models B,\\
M,w\models A\leftrightarrow B &\Longleftrightarrow (M,w\models A)=(M,w\models B).
\end{aligned}
\]

Individual knowledge is:

\[
M,w\models K_a A
\quad\Longleftrightarrow\quad
\forall v\in W\;(wR_av\Rightarrow M,v\models A).
\]

For any formula `A`, let

\[
W_A=\{v\in W\mid M,v\models A\},
\]

and let `M|A` be the restriction of `M` to `W_A`: every valuation and every agent relation is restricted to surviving worlds.

The PAL box clause is:

\[
M,w\models[A]B
\quad\Longleftrightarrow\quad
M,w\not\models A\text{ or }M|A,w\models B.
\]

Thus `[A]B` is vacuously true when `A` is false at the current world. When `A` is true, its truth set is computed in the source model, all non-`A` worlds are removed, every agent relation is restricted, and `B` is evaluated at the retained current world.

Let `L_PL` contain only propositional atoms and Boolean connectives. The existential BAPAL clause is:

\[
M,w\models \Diamond_{\beta} A
\quad\Longleftrightarrow\quad
\exists\theta\in L_{PL}\;
\bigl(M,w\models\theta\text{ and }M|\theta,w\models A\bigr).
\]

In the application this modality is written `^A` and displayed `◇ᵝA`. The displayed mathematical clause means existential Boolean-announcement possibility; the particular typographic symbol above is not a new application token.

**NORMATIVE.** The quantified announcement `θ` must be Boolean, must be true at the current world, and must restrict every agent relation as well as the valuation domain. Knowledge, PAL, BAPAL, and ordinary modalities are not permitted inside `θ`.

## 5. Finite valuation-class reduction

**NORMATIVE.** Define complete propositional equivalence on a finite active domain `D ⊆ W` by

\[
u\equiv_{PL}v
\quad\Longleftrightarrow\quad
\forall p\in Prop\;(u\in V(p)\Longleftrightarrow v\in V(p)).
\]

Every Boolean formula is constant on each `≡PL` class. Consequently, every Boolean-definable truth set in `D` is a union of complete propositional-valuation classes.

Conversely, every union of the finitely many valuation classes occurring in `D` is definable on `D` by a finite Boolean formula. Let `I` be the finite set of included classes and `X` the finite set of excluded classes. For every `C ∈ I` and `E ∈ X`, choose an atom `p(C,E)` on which the two complete valuations differ. Choose the corresponding literal `ℓ(C,E)` that is true throughout `C` and false throughout `E`. Then form

\[
\chi_C=\bigwedge_{E\in X}\ell(C,E)
\quad\text{and}\quad
\theta_I=\bigvee_{C\in I}\chi_C.
\]

Only finitely many classes occur, so only finitely many separating atoms and literals are used. Full and empty unions can be represented by a finite tautology and contradiction respectively.

**NORMATIVE.** This is a finite separator construction. It must not be replaced by an alleged conjunction over a complete countably infinite valuation; such a conjunction need not be a finite formula.

At a pointed world `w`, a truthful announcement domain must contain the entire valuation class `[w]PL`. If `k` valuation classes occur in the active domain, exactly

\[
2^{k-1}
\]

unions contain `[w]PL` and are therefore candidate truthful Boolean-announcement domains.

**NORMATIVE.** This reduction depends on exact preservation of atom identities, complete valuations under one shared atom namespace, and the uniform convention that absent atom keys are false. A representation that renames, splits, hides, or drops atom identities violates the reduction's implementation assumptions even though the mathematical theorem remains valid.

## 6. Frame class and S5

**NORMATIVE.** The intended BAPAL models are S5 epistemic models. For each relevant agent `a`, `R_a` is:

- reflexive: `wR_aw` for every world `w`;
- symmetric: `wR_av` implies `vR_aw`;
- transitive: `wR_av` and `vR_au` imply `wR_au`.

Restricting an equivalence relation to a subset of surviving worlds preserves reflexivity on that subset, symmetry, and transitivity.

**NORMATIVE.** A reflexive self-loop may be hidden from the D3 graph, but it must remain stored in the semantic model. Visual hiding must not remove, weaken, or invent a semantic relation.

**CURRENT.** The evaluator can run on arbitrary stored relations, and the baseline application does not tag a model as formally S5.

**HISTORICAL BASELINE LIMITATION.** At audited baseline `92a4ba6`, the S5 toggle is an editing aid: turning it on does not validate or repair every existing relation, and adding a world can break reflexivity for another active agent. Audit 06 closes the post-baseline P1-02 repair and passes P1-03's semantic/model policy at `6bd3369`.

**CURRENT ROUND 3 STATUS.** The audited semantic/model policy makes the S5 state and underlying invariant agree for the relevant-agent set defined in the post-baseline delta: entering S5 either requires no change because every relation is already an equivalence relation, is cancelled without mutation, or explicitly normalizes every relevant relation to its least equivalence closure. Every accepted S5-on edit preserves that invariant. P1-03 nevertheless remains open because Audit 06 found that an extra stored label could be projected without visible SVG output. The focused renderer is locally repaired but pending Work Max recheck.

**NORMATIVE RENDERING CONTRACT.** Every non-loop semantic descriptor must render with a visible stroke, direction markers matching its left/right flags, and a visible mid-edge label containing the actual semantic relation label. A synchronized JavaScript descriptor alone is insufficient evidence of visible browser rendering. Raw relation strings must remain unchanged in the semantic model and D3 datum; any DOM/SVG identifier derived from them must use a safe injective encoding.

## 7. Formula interfaces

The application currently has several non-identical formula interfaces.

1. **Formal language.** **NORMATIVE.** The mathematical language has countably many atoms and agents, individual knowledge, PAL, and existential BAPAL. Formal semantic syntax is not determined by parser accidents.
2. **Raw `MPL.Wff` input.** **CURRENT.** The parser accepts ASCII word-like atom tokens, Boolean operators, literal `□`, `<>`, `^`, and the split delimiters `K{...}` and `[...]`. It accepts multi-character word tokens. Its configured binary operators are right-associative. A knowledge-rooted PAL precondition requires protective parentheses: `[(K{a}p)]q` parses while `[K{a}p]q` does not.
3. **Browser preprocessing and validation.** **CURRENT.** Before parsing, the browser removes every comma, rewrites each `[` as `[(` and each `]` as `)]`, then rejects propositional atoms outside `p`–`t` and agent characters outside `a`–`e`. This preprocessing is not the raw grammar.
4. **Printed forms.** **CURRENT.** `MPL.Wff` emits ASCII, Unicode, and LaTeX representations from its AST. `^` is rendered as `◇ᵝ` and `\Diamond_{\beta}{}` in the corresponding display forms.
5. **URL formula encoding.** **CURRENT.** The browser reads the `formula` query parameter with `URLSearchParams`, supports one legacy combined `model?...formula=` form, and evaluates a nonempty loaded formula immediately. URL encoding transports a formula string; it does not define or repair the formula grammar.

**KNOWN LIMITATION.** These interfaces are not fully identical. In particular, browser preprocessing accepts shapes the raw constructor rejects, and global comma removal is not a principled agent grammar.

**AUDITED BASELINE BEHAVIOR at commit `92a4ba6`.** The ASCII printer could emit `[K{a}p]q`, which the raw parser could not reparse. See the post-baseline Round 2 delta above for the printer-only repair closed by Audit 05 and its bounded evidence.

**REMAINING FUTURE REQUIREMENT.** Compatibility handling must remain explicit and must not conceal the raw/browser divergences that still exist. Audited `parse(print(ast)) = ast` closure for supported AST printing does not make every malformed or browser-preprocessed input part of one unified grammar.

## 8. Identifier and vocabulary policy

**CURRENT SUPPORTED CONTRACT.** The audited dependable compatibility subset uses one-character atom and agent identifiers. Browser-visible atoms are `p`, `q`, `r`, `s`, and `t`; browser-visible agents are `a`, `b`, `c`, `d`, and `e`.

**AUDITED BASELINE BEHAVIOR at commit `92a4ba6`.** Raw parser acceptance of a multi-character identifier did not guarantee correct PAL or BAPAL behavior. The compact serialization-based deep-copy path could flatten a true atom such as `foo` into the separate keys `f` and `o`, causing a wrong PAL result or a BAPAL exception. See the post-baseline Round 1 delta above for the audited structural internal-copy repair. Multi-character agents still do not have a dependable end-to-end serialization or formula-interface contract.

**NORMATIVE.** Absence of an atom key means that atom is false. Every world in a model must use one shared atom namespace, so absence has the same meaning everywhere. Hidden or unsupported keys must not silently alter valuation classes or results without disclosure.

**FUTURE REQUIREMENT.** Correct preservation and validation of multi-character identifiers is a Stage 0 repair target. This specification does not require the final architecture to remain limited to one-character identifiers; the final supported identifier grammar must be explicit, structurally preserved, and tested end to end.

## 9. Model representation and serialization

**CURRENT.** The semantic model is `MPL.Model`: an indexed array of live world records or `null` deleted slots. Each live record contains a map of true atom keys and a list of labelled outgoing transitions. Missing atom keys are false, and surviving world indices remain stable across deletion.

**NORMATIVE.** Semantic model data is authoritative for evaluation. D3 nodes, links, labels, positions, checkboxes, hidden paths, and selection state are visual projections or controls; they must not substitute for semantic worlds, valuations, or relations.

**CURRENT.** Legacy compact URL model strings concatenate true atom characters and encode each transition as a decimal target followed by one agent character. The format has no version, escaping, declared vocabulary, declared agent set, frame-class assertion, or typed validation result.

**AUDITED BASELINE BEHAVIOR at commit `92a4ba6`.** Internal PAL and BAPAL copying called `getModelString()` and then `loadFromModelString()`. Semantic copying therefore inherited the compact URL format's identifier loss and validation defects. See the post-baseline Round 1 delta above: candidate `55f557c` replaced that internal path with structural copying without changing the compact external format.

**KNOWN LIMITATION.** A malformed model string can clear the old model, stop at the first malformed fragment, and silently retain only a valid prefix.

**FUTURE REQUIREMENT.** Semantic restriction and copying must become structural operations independent of URL serialization. Imports must validate atomically: either the complete input is accepted or the prior model remains unchanged with an explicit error. A future versioned schema must represent atoms, agents, worlds, valuations, relations, frame claims, and errors without ambiguous concatenation. No versioned schema is implemented by this Stage 0 document.

## 10. Result terminology

**NORMATIVE.** Approved result descriptions are:

- “true at world `w` in model `M`”;
- “true worlds in this model”;
- “false worlds in this model”;
- “true somewhere in this model”;
- “true at every world in this model.”

When only one supplied model or a finite sample has been checked, do not use the following terms without a precise logical qualification:

- satisfiable;
- unsatisfiable;
- valid;
- invalid;
- globally valid.

**NORMATIVE.** Exhibiting one correctly represented S5 pointed model `(M,w)` with `M,w ⊨ A` is a witness that `A` is satisfiable under the represented semantics. Failure at every world of one model, failure in a finite sample, or failure within a bounded search does not establish unsatisfiability. Truth at every world of one supplied model does not establish validity.

**KNOWN LIMITATION.** The baseline random report uses “satisfiable” and “globally true” for within-one-model results. Those labels are P1-06 repair targets and are not approved terminology.

## 11. Verification claims

**CURRENT EVIDENCE.** At baseline commit `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`, the JavaScript evaluator agreed with an independently implemented Python oracle in all **6,501,302** recorded model–world–formula evaluations within the audited one-character representation and exact bounded matrices. There were zero semantic mismatches in those comparisons.

The audit also reported:

- an independent valuation-class-union versus Boolean-truth-function domain cross-check on 30,996 pointed cases, with zero mismatches;
- 56,698 S5 restriction checks with zero failures;
- 3,192 direct metamorphic checks with zero failures;
- one-character serialization and truth preservation within the tested bounds.

**NORMATIVE.** This is bounded differential and property evidence, not a mathematical proof. It does not certify later commits or inputs outside the recorded boundary.

The following remain unverified or are known not to hold:

- all finite models and formulas beyond the exact recorded bounds;
- every infinite model;
- correctness for multi-character identifiers, which has a concrete counterexample;
- the full parser, malformed-input, Unicode, and browser-preprocessing input spaces;
- all S5 editor and browser event sequences;
- all deeper PAL/BAPAL combinations and cross-runtime behavior;
- witness construction, because the baseline evaluator returns only a Boolean;
- satisfiability, validity, finite-model completeness, or an unbounded decision procedure;
- axiomatic soundness/completeness, the manuscript's metatheory, or a formal refinement proof for the evaluator;
- performance and memory behavior outside the measured environments.

## 12. Performance and resource scope

**NORMATIVE.** The meaningful performance parameters include:

- `k`, the number of distinct complete propositional-valuation classes in the active domain;
- BAPAL nesting depth;
- PAL nesting depth;
- Boolean branch structure;
- relation edge density;
- the number of worlds at which the UI repeats evaluation.

World count alone is not an adequate resource bound. At one existential BAPAL operator and one pointed class, there are `2^(k-1)` truthful candidate domains. The baseline implementation eagerly constructs a full `2^k` power set before filtering, copies/restricts models repeatedly, recomputes partitions, and evaluates synchronously on the browser main thread.

**CURRENT MEASURED EVIDENCE.** On the audit's dense representative browser family, approximate interactive guidance was `k ≤ 10` for nontrivial nested `^` and `k ≤ 12` for one worst-case depth-one `^`. A `k = 13` depth-one false case took about 11.2 seconds from click to result, and `k = 14` blocked beyond the 20-second browser-controller timeout. These measurements include environment and UI overhead and are not universal guarantees.

**NORMATIVE.** No UI, CLI, worker, or future service may promise unrestricted evaluation. Advertised limits must be explicit, evidence-based, tied to runtime/resource controls, and revised only with reproducible benchmarks.

**FUTURE REQUIREMENT.** Later work must add cancellation or bounded failure behavior before advertising expensive interactive workloads. Performance optimization must remain semantically differential-tested.

## 13. Change-control rules

**NORMATIVE.** Every future implementation change must:

1. cite the affected sections of this specification and the relevant audit finding;
2. include minimized regression cases for every repaired defect or changed contract;
3. distinguish semantic changes, representation changes, UI changes, verification changes, and performance-only changes;
4. preserve `audit/01`, `audit/02`, and `audit/03` as read-only historical artifacts;
5. produce a repair log recording the finding, before/after behavior, changed files, tests, results, and remaining uncertainty;
6. state claims no more broadly than the executed test evidence supports;
7. preserve inherited modal, epistemic, and PAL behavior unless a scoped decision explicitly changes it;
8. avoid regenerating tracked reports unless a task explicitly requires it and records provenance;
9. trigger a separate re-audit before describing later behavior as audited, certified, or independently verified.

Small, separately reviewable changes are preferred. Multiple P0/P1 repairs must not be combined into an uncontrolled change.

## 14. Known Stage 0 defects

**AUDITED BASELINE DEFECTS.** The following defects were open at commit `92a4ba6`. The post-baseline deltas above record later implementation and audit status without rewriting this historical defect list.

- **P0-01 — lossy identifiers:** multi-character atoms accepted by the parser/API are flattened during serialization-based copying, causing wrong PAL results or BAPAL exceptions.
- **P1-01 — parser/printer non-closure:** at the audited baseline, a knowledge-rooted PAL precondition could print without required parentheses, so raw reparsing failed. See the Round 2 delta; P1-01 is closed at `e0c816f` by Audit 05 under the supported-AST ASCII-printing contract.
- **P1-02 — S5 new-world reflexivity:** at the audited baseline, adding a world in S5 mode adds only the selected agent's loop and can break reflexivity for another active agent. Audit 06 closes P1-02 at `6bd3369` under the recorded relevant-agent policy.
- **P1-03 — S5 toggle/invariant mismatch and visible projection:** at the audited baseline, enabling S5 mode does not validate or repair the existing model, and seeded closure can leave another malformed component unchanged. Audit 06 passes the semantic/model repair but leaves P1-03 open for the raw-label SVG counterexample. The scoped renderer repair is locally implemented pending focused Work Max recheck.
- **P1-04 — partial malformed import:** malformed compact model input clears the old model and can silently load only a valid prefix.
- **P1-05 — hidden semantic valuation keys:** hidden, stale, or unsupported atom keys can change BAPAL valuation classes while remaining invisible or unmentionable in the UI.
- **P1-06 — incorrect report terminology:** within-one-model truth is labelled “satisfiable” or “globally true,” inviting invalid logical conclusions.
- **P1-07 — insufficient independent verification gate:** repository checks call the production evaluator, and the independent oracle/corpus is not yet a checked-in automated conformance gate.

**FUTURE REQUIREMENT.** Each defect must be closed by a separately reviewable repair with minimized regression coverage and a repair log. Closure of one item does not certify the others or complete Stage 0.

## 15. Deferred architecture

**FUTURE REQUIREMENT.** After explicit Stage 0 closure, the Stage 1 target is a pure, typed, UI-independent semantic core with explicit formula/model/domain representations, structural restriction, a versioned schema, and browser/CLI conformance.

**DEFERRED.** Web Workers, WebAssembly, Rust, a backend, a database, Z3/SAT/SMT integrations, and formal mechanization are evidence-gated later options. They are not part of this Stage 0 specification task and must not be presented as already implemented.

- A Web Worker may improve responsiveness and cancellation but does not reduce semantic work by itself.
- WebAssembly or Rust requires benchmark evidence after algorithmic and representation repairs.
- A backend is justified only by demonstrated queue, sharing, or bounded execution needs and must use the same semantic core.
- A database is not part of semantic evaluation. It may later store users, jobs, corpora, or provenance if those product requirements arise.
- Z3 may be useful for precisely bounded witness or counterexample encodings or as an additional oracle; it is not the semantic core and cannot establish general BAPAL satisfiability decidability.
- Formal mechanization may prove properties of the finite semantic core but does not by itself resolve the general BAPAL satisfiability problem.
