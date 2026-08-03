# Stage 0 Scope and Repair Register

## 1. Baseline

- **Repository:** `Raycaesar/bapal`
- **Target branch:** `bapal-core`
- **Audited commit:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`
- **Audit date:** 2026-08-03
- **Audit reports:**
  - [BAPAL Foundational Audit](../audit/01_BAPAL_FOUNDATIONAL_AUDIT.md)
  - [BAPAL Independent Verification Report](../audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md)
  - [BAPAL Architecture and Correctness-First Roadmap](../audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md)
- **Normative contract:** [BAPAL Playground Semantic and Product Specification](../docs/BAPAL_PLAYGROUND_SPEC.md)

**Stage 0 status: OPEN.** Round 1 is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**. This register does not independently verify, close, or certify that repair, and every later round remains scheduled. The audit reports remain read-only historical evidence about the audited commit.

## 2. Stage 0 objective

Stage 0 must close or obtain an explicit audit reclassification of every P0 and P1 correctness or contract defect before work begins on:

- new UI features;
- extraction of a TypeScript semantic core;
- performance optimization;
- Web Workers;
- WebAssembly;
- a backend;
- a database; or
- Z3 integration.

The objective is a trustworthy, tested contract for the existing finite explicit-model product. Stage 0 must not broaden the product into a satisfiability solver, validity solver, or unbounded BAPAL decision procedure.

## 3. Protected semantics

The following clauses are protected throughout every repair round and must not change accidentally:

1. **Boolean truth functions:** negation, conjunction, disjunction, implication, and biconditional retain their ordinary truth conditions.
2. **Individual knowledge `K_a`:** `K_a A` is true at a world exactly when `A` is true at every `a`-successor in the current domain, including vacuous truth when there are no such successors.
3. **PAL vacuity and restriction:** `[A]B` is vacuously true when `A` is false at the current world; otherwise `A` is evaluated in the source model and `B` is evaluated after restricting all valuation and relation data to the `A`-worlds.
4. **Existential BAPAL quantification:** `^A` quantifies over truthful Boolean announcements only and succeeds exactly when at least one such announcement leaves `A` true at the current world.
5. **Valuation-class reduction:** on a finite explicit model, Boolean-definable domains are exactly unions of complete propositional-valuation classes. A truthful candidate contains the pointed world's whole class, and the reverse direction uses a finite separator construction.
6. **S5 intended frame class:** intended epistemic BAPAL models use an equivalence relation for every declared or active agent; restriction to surviving worlds preserves that property.

Representation, parser, UI, and test-infrastructure repairs must be checked against these protected clauses rather than redefining them.

## 4. Planned repair rounds

Round 1 is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**. Rounds 2–8 remain **SCHEDULED**. No repair is independently certified by this register, and Stage 0 remains open.

### Round 1 — P0 structural model copying

**Status: IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT.**

**Scope**

- Remove semantic dependence on compact-string serialization when copying or restricting models for PAL and BAPAL.
- Preserve the legacy compact URL format only at the external compatibility boundary.
- Add minimized tests for multi-character atom identity and structural copying.

**Required minimized regressions**

- On a one-world model with `{foo: true}`, `foo` is true.
- On that model, `[(p | ~p)]foo` is true.
- On that model, `^foo` is true.

**Acceptance criteria**

- None of the three regressions returns a wrong value or throws an exception.
- Structural copy preserves every atom identifier, world identity, null/deleted slot required by the supported model contract, and labelled transition.
- Structural restriction preserves all surviving transitions and removes exactly the transitions incident to removed worlds.
- The previously supported deterministic corpus remains green.

**Excluded from this round:** parser/printer repair and S5 repair.

### Round 2 — Parser/printer closure

**Status: SCHEDULED — NEXT PLANNED IMPLEMENTATION ROUND.**

**Scope**

- Ensure `parse(print(AST)) = AST` for every supported syntax tree.
- Fix and preserve the minimized case `[(K{a}p)]q`.
- Add generated round-trip tests over the supported grammar.
- Document the confirmed differences between browser preprocessing and raw parser input.

**Acceptance criteria**

- The minimized formula prints to raw-parser-accepted syntax and reparses to the same AST.
- Generated supported ASTs, including PAL preconditions rooted at knowledge and other unary operators, round-trip without failure.
- Browser/raw grammar differences are explicit and covered by tests or documented compatibility boundaries.

**Excluded from this round:** redesign of the entire parser, model copying, and S5 behavior.

### Round 3 — S5 invariant repair

**Scope**

- Define whether enabling S5 on a non-S5 model validates, rejects, or normalizes the model.
- Prevent adding a world from breaking reflexivity for any other declared or active agent.
- Detect and correctly handle malformed disjoint relation components.
- Preserve safe world deletion and guarded relation-edit behavior.
- Add browser/event-sequence tests across at least two agents.

**Acceptance criteria**

- Whenever the UI says S5 mode is on, every declared or active agent relation is an equivalence relation after every accepted edit.
- All semantically required self-loops remain stored even when visually hidden.
- Toggle, import, new-world, edge, and deletion sequences either preserve the invariant or fail without partially changing the model.
- Any user-visible normalization requires explicit notice or confirmation; it must not silently rewrite the user's model.

### Round 4 — Atomic model import and visible semantic state

**Scope**

- Parse and validate an imported model completely before replacing the current model.
- Reject malformed input atomically, without retaining a valid prefix or destroying the prior model.
- Disclose hidden, stale, or unsupported valuation keys.
- Ensure users can inspect every item of semantic data that can affect BAPAL valuation classes or truth.

**Acceptance criteria**

- A malformed import leaves the prior semantic model unchanged and returns a clear failure.
- No unsupported key silently changes a result.
- Visible-variable controls are accurately identified as projections unless they perform an explicit semantic edit.
- The semantic model and its D3 projection are separately inspectable and tested.

### Round 5 — Versioned model/formula schema

**Scope**

- Introduce a stable, versioned JSON schema for models and formulas.
- Preserve arbitrary identifiers within the supported identifier policy.
- Separate semantic model data from legacy compact share URLs.
- Add encode/decode structural-identity and truth-preservation properties.

**Acceptance criteria**

- Valid data round-trips without losing atom, agent, world, valuation, relation, or formula identity.
- Invalid data is rejected before any semantic state mutation.
- Schema version, vocabulary, and compatibility behavior are explicit.
- Truth tables are preserved across encode/decode for the supported corpus.

This round may be coordinated with Round 4 because both touch import boundaries, but its schema work and review evidence must remain separately reviewable.

### Round 6 — Independent oracle, conformance corpus, and CI

**Scope**

- Obtain or reconstruct the independent Python oracle used in the audit.
- Preserve implementation independence from the production evaluator.
- Add a fast pull-request conformance subset and a scheduled full bounded check.
- Preserve seeds, enumeration counts, code/corpus hashes, runtime metadata, and minimized failure artifacts.
- Include `check-report-links` in aggregate verification.
- Ensure test commands do not rewrite tracked reports.

**Acceptance criteria**

- CI distinguishes production regression tests from the independent oracle.
- The fast and full matrices publish machine-readable manifests tied to exact commits and hashes.
- Any mismatch fails the job and preserves a reproducible minimized artifact.
- Aggregate verification includes report-link checking and leaves the working tree unchanged.

### Round 7 — Terminology and documentation closure

**Scope**

- Rename sampled-model result fields to terms such as `trueSomewhereInThisModel` and `trueAtEveryWorldInThisModel`.
- Update README, API reference, UI documentation, and verification notes to match the normative specification.
- Correct the finite valuation-class explanation to use the finite separator argument.
- Remove stale product claims and links.
- Document current measured performance limits without turning them into universal guarantees.

**Acceptance criteria**

- Results from one supplied model are not labelled satisfiable, unsatisfiable, valid, invalid, or globally valid without qualification.
- Documentation distinguishes model checking from satisfiability and validity.
- Operator, identifier, S5, serialization, and performance boundaries agree with the implemented and tested contract.
- No audit report is rewritten.

### Round 8 — Stage 0 closure audit

**Scope**

- Perform no implementation work.
- Submit the repository, all repair logs, manifests, minimized regressions, and test artifacts to Work Max.
- Reopen only findings that remain unresolved or have regressed.
- Receive one explicit outcome: **PASS**, **FAIL**, or **PASS SUBJECT TO REPAIRS**.

**Acceptance criteria**

- Every P0/P1 item has auditable closure evidence or an explicit audit reclassification.
- The closure result identifies the exact reviewed commit and evidence bundle.
- Later changes are not represented as covered unless separately re-audited.

## 5. Defect-to-round mapping

Every P0/P1 defect from the foundational audit appears exactly once below with one primary repair round. P0-01 is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**; every P1 item remains **OPEN**.

| Defect ID | Status | Severity | Affected files/functions | Primary round | Dependencies | Required minimized regression | Closure evidence |
|---|---|---|---|---|---|---|---|
| P0-01 | IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT | P0 — wrong result/exception | `js/MPL.js`: `getStateString`, `loadFromModelString`, `deepCopy`, PAL/BAPAL branches of `_truth`; raw parser variable acceptance; `API-Reference.md` identifier contract | Round 1 | Normative specification and protected-semantics baseline | One world `{foo:true}`: `foo = true`, `[(p | ~p)]foo = true`, `^foo = true`, with no exception | Before/after regression log; structural-copy identity and transition tests; supported corpus green; exact changed-file list |
| P1-01 | OPEN | P1 — parser/API contract | `js/MPL.js`: operator configuration, `_jsonToASCII`, `Wff` parse/print path | Round 2 | Round 1 closed; supported grammar boundary recorded | `[(K{a}p)]q` prints, reparses, and yields the same AST | Minimized test plus generated `parse(print(AST)) = AST` manifest with zero supported-corpus failures |
| P1-02 | OPEN | P1 — S5 model integrity | `js/app.js`: world-creation `mousedown` path and active-agent handling; semantic relations in `MPL.Model` | Round 3 | Rounds 1–2 closed; declared/active-agent policy fixed for the round | With active S5 relations for `a` and `b`, add a world while `a` is selected; both relations remain reflexive, symmetric, and transitive | Two-agent event-sequence test; stored-loop inspection; invariant check after each accepted edit |
| P1-03 | OPEN | P1 — misleading S5 state/incomplete closure | `js/app.js`: `setS5Mode`, `addRelationForCurrentMode`; `js/MPL.js`: `closeEquivalenceClass` | Round 3 | Same S5 policy and harness as P1-02 | Toggle S5 on over a one-way relation and over a separate malformed component; the operation explicitly rejects or knowingly normalizes the whole model | Toggle/import/component event tests; equivalence checks for every declared/active agent; proof of notice or confirmation for normalization |
| P1-04 | OPEN | P1 — non-atomic model import | `js/MPL.js`: `loadFromModelString`; `js/app.js`: startup/share-URL load path | Round 4 | Round 1 structural model operations; coordinated boundary decisions for Round 5 | Load `ApS;BROKEN;AqS` over a known existing model; receive failure and retain the complete prior model | Atomic rollback/unchanged-model assertion; typed or explicit validation error; no partial-prefix model; repair log |
| P1-05 | OPEN | P1 — hidden semantic state | `js/app.js`: model-to-D3 projection, formula validation, `setVarCount`; `js/MPL.js`: `_valuationKey` | Round 4 | Round 1 identifier preservation; shared atom-namespace policy | Import a model containing a non-visible valuation key and change visible-variable count; every BAPAL-relevant key remains disclosed and inspectable, or import is rejected before mutation | UI/semantic-state inspection test; valuation-class comparison; no silent result change; documented supported-key policy |
| P1-07 | OPEN | P1 — non-independent verification/no gate | `scripts/check-*.js`, `scripts/check-all.js`, independent audit oracle/corpus, future CI configuration, `BAPAL_VERIFICATION.md` | Round 6 | Repair outputs from Rounds 1–5 and stable schema/corpus identifiers | A deliberately injected semantic mismatch is detected and minimized; aggregate checks include `check-report-links` and leave tracked reports byte-unchanged | Checked-in independent oracle review; fast/full CI manifests with seeds, counts, hashes, artifacts, and zero unexplained mismatches |
| P1-06 | OPEN | P1 — invalid result terminology | `scripts/random-bapal-evaluation.js`: `evaluateFormulas`, report table and console labels; generated report schema; README/API/UI verification text | Round 7 | Stable result/schema naming from Rounds 4–6 | A formula true at some but not all worlds is reported only as “true somewhere in this model”; a formula true at all worlds only as “true at every world in this model” | Schema and snapshot tests; forbidden-term documentation scan; updated product docs; audit confirms no satisfiability/validity overclaim |

## 6. Non-goals

Stage 0 does not include:

- a satisfiability solver;
- a validity solver;
- a universal BAPAL operator;
- a database;
- a hosted service;
- Z3 as the semantic core;
- Rust or WebAssembly;
- a complete UI redesign; or
- formal proof-assistant work.

These items must not be introduced opportunistically as part of a correctness repair.

## 7. Stage 0 global acceptance criteria

Stage 0 closes only when all of the following hold:

1. Every P0/P1 defect is closed or explicitly reclassified by the closure audit.
2. The independent bounded baseline reports no semantic mismatch, with its exact bounds and representation limits preserved in the manifest.
3. The supported parser corpus has no `parse(print(AST))` round-trip failure.
4. Model import is atomic: malformed input never replaces the current model or loads a valid prefix.
5. Model serialization and structural copying preserve every supported identity and transition, and preserve truth across encode/decode.
6. S5 mode is truthful and invariant-preserving after every accepted edit for every declared or active agent.
7. UI, reports, schemas, and documentation use correct supplied-model result terminology.
8. CI runs deterministic regression and independent conformance checks and publishes machine-readable manifests with versions, seeds, counts, hashes, and failure artifacts.
9. Work Max completes the Stage 0 closure audit and records **PASS**, **FAIL**, or **PASS SUBJECT TO REPAIRS** against an exact commit.

Passing bounded tests remains evidence, not a mathematical soundness/completeness proof or a general BAPAL decision procedure.

## 8. Change discipline

- Use one repair round per reviewable Codex task or pull request. If coordination is necessary, keep each round's diff, tests, and closure evidence independently reviewable.
- Do not perform opportunistic refactoring, UI redesign, architecture migration, or unrelated cleanup.
- Record the exact changed-file list before review.
- Run and record relevant deterministic tests before and after each repair; preserve the pre-repair failure and post-repair result.
- Create a repair log for every round, citing the affected specification sections, defect IDs, minimized regressions, commands, results, limits, and remaining uncertainty.
- Preserve the three audit reports byte-for-byte and do not regenerate tracked reports unless a task explicitly requires it.
- Distinguish semantic, representation, UI, documentation, and performance changes in every repair log.
- Do not claim certification until Round 8 records it, and require a later re-audit before extending certification to later changes.
- Do not create a commit unless the user explicitly requests one.
