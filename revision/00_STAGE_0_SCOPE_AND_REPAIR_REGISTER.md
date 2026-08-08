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

**Stage 0 status: OPEN.** Round 1 is **CLOSED AT `55f557c` — WORK MAX AUDIT 04**. Round 2 is **CLOSED AT `e0c816f` — WORK MAX AUDIT 05**, and the closure remains valid at final log-only HEAD `f7c7d59`. P1-02 is **CLOSED AT `6bd3369` — WORK MAX AUDIT 06**. Audit 07 closes P1-03 and Round 3 at `3f27ac2` under its focused raw-label rendering contract. P1-04 and P1-05 are **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**, and Round 4 is closed. Audit 09 passed the Round 5 runtime Schema v1 codecs subject only to R5-A09-01. Audit 10 closes R5-A09-01 and Round 5 at canonical-ID repair commit `edfbf32d07507bd43143bd518dbe3e2316a65979`, with documentary final audited HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8`. P1-07 Round 6 infrastructure is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**, but a concrete production mismatch keeps P1-07 open. P1-06 and Stage 0 remain open. Round 7 is next only after Round 6 Work Max closure. The original three audit reports remain read-only historical evidence; Audits 04–10 supply only their stated narrow later-round evidence.

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

Round 1 is **CLOSED AT `55f557c` — WORK MAX AUDIT 04**. Round 2 is **CLOSED AT `e0c816f` — WORK MAX AUDIT 05**. Round 3 P1-02 is **CLOSED AT `6bd3369` — WORK MAX AUDIT 06** and P1-03 is **CLOSED AT `3f27ac2` — WORK MAX AUDIT 07**. Round 4 P1-04/P1-05 are **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**. Round 5 is **CLOSED AT `edfbf32` — WORK MAX AUDIT 10**. P1-07 Round 6 infrastructure is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**; P1-06, P1-07, and Stage 0 remain open. Round 7 may begin only after Round 6 Work Max closure, followed by the Stage 0 audit in Round 8.

### Round 1 — P0 structural model copying

**Status: CLOSED AT `55f557c` — WORK MAX AUDIT 04.**

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

**Closure evidence**

- the dedicated structural-copy regression suite, with all 11 groups passing;
- the independent Work Max targeted harness over exact keys, raw labels, null indices, multi-digit targets, repeated copies, mutations, and truth preservation;
- minimized before/after formulas: `foo` remained true; `[(p | ~p)]foo` changed from false to true; `^foo` changed from an exception to true; and `^~foo` changed from an exception to false;
- [`audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`](../audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md), which closes P0-01 only for internal semantic copying.

The legacy compact serializer/import/share limitation remains open and was not repaired by Round 1.

### Round 2 — Parser/printer closure

**Status: CLOSED AT `e0c816f` — WORK MAX AUDIT 05.**

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

**Closure evidence**

- Minimized parent reproduction at `55f557c`: `[(K{a}p)]q` printed the invalid raw form `[K{a}p]q` and failed raw reparsing; at `e0c816f` it retains protective syntax, reparses to the same AST, and prints idempotently.
- The checked-in permanent suite passed all 108,246 AST round trips with structural equality and print idempotence.
- Independent exhaustive verification through logical size 6 found zero candidate failures.
- Independent verification over 50,000 generated ASTs found zero candidate failures.
- Semantic non-regression checks found no truth mismatch, and the structural-copy, BAPAL, inherited-logic, S5 closure, valuation-class, and report-link deterministic regressions passed.
- [`audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md`](../audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md), which closes P1-01 at `e0c816f` under the supported-AST ASCII-printing contract and confirms closure at `f7c7d59`.

This closure does not certify arbitrary malformed raw input or unify the raw and browser grammars. The parser library, semantic evaluator, browser preprocessing, and `Model.deepCopy()` remain unchanged.

### Round 3 — S5 invariant repair

**P1-02 status: CLOSED AT `6bd3369` — WORK MAX AUDIT 06.**

**P1-03 status: CLOSED AT `3f27ac2` — WORK MAX AUDIT 07.**

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

**Implemented policy**

- Relevant agents are the deterministic sorted union of browser-declared agents `a`–`e`, every relation label currently stored in the semantic model, and the currently selected agent.
- Enabling S5 over an already-S5 model requires no normalization confirmation or model mutation. If any relevant relation is malformed, confirmation is required before mutation; cancellation leaves S5 off and leaves semantic and D3 relation state unchanged.
- Accepted normalization computes and verifies the least equivalence closure of every relevant-agent relation by completing each connected component of the undirected support independently, preserving every existing edge, adding every live-world loop, and never joining separate components.
- While S5 is on, world addition preserves every relevant relation, selected-agent relation addition merges exactly the bridged classes, world deletion preserves S5 by domain restriction, individual selected-edge Delete/L/R/B operations remain blocked, and disabling S5 does not mutate relations.
- The semantic model is authoritative: stored loops may remain visually hidden, while all non-loop closure edges are synchronized into a deduplicated D3 projection.
- Every non-loop descriptor must also receive visible SVG output: an explicit stroke, existing start/end markers matching its directions, and a mid-edge label preserving the semantic relation string. Unknown labels use safe injective marker keys and deterministic geometry; descriptor synchronization alone is not evidence of visible rendering.

**Local implementation evidence**

- Test-first reproduction exited 1 before production repair: P1-02 left world 2 without `2R_b2`, and P1-03 enabling over one-way/disconnected malformed relations performed no repair; 9 of 12 initial invariant groups failed.
- The checked-in suite now passes all 12 groups, including the minimized P1-02 new-world and P1-03 toggle cases, explicit cancel/no-mutation and already-S5 paths, all declared agents, raw labels `alice` and `agent_b`, class merge, world deletion, hidden stored loops, and D3 projection checks.
- Its independent test-local oracle exhausts all 531 directed relations on zero through three worlds. Its generated seed `0x0055f503` drives 10,000 deterministic event sequences and 200,000 operations with invariant checks after every accepted S5-on operation.
- Prompt 3.2's concentrated independent review exhausted all 66,067 directed relations on zero through four worlds, checked 526,625 input edges and 1,053,250 component-pair leastness conditions, and found zero failures.
- The separate Prompt 3.2 multi-agent generator used seed `0x9e3779b9` for 25,000 sequences and 600,000 operations over zero through eight live worlds, a–e, `alice`, and `agent_b`; it reported zero invariant or model/D3 projection failures and verified rejected/cancelled no-mutation paths.
- No installed headless browser was available during the implementation review. Its full-`app.js` executable VM/stub integration established semantic/D3 descriptor synchronization for confirmation, cancellation, accepted closure, new-world preservation, class merge, world deletion, blocked Delete/L/R/B, and disable-without-mutation; it did not establish computed visibility.
- Parser configuration, the Round 2 printer, semantic truth clauses, Round 1 `deepCopy()`, compact serialization, the report generator, and unrelated UI were unchanged. All specified deterministic regression commands pass, and no random report generation was run.

**Audit 06 disposition and Audit 07 closure**

- Audit 06 independently passed the semantic/model policy and closed P1-02 at `6bd3369`.
- It left P1-03 open because `AS1x,;AS` normalized and projected `x` correctly but rendered no visible stroke or usable `x` marker definitions.
- The focused local repair supplies generic explicit SVG rendering for every nonempty relation label, preserves declared `a`–`e` visuals, and adds executable VM/DOM/D3 rendering coverage for raw labels, directions, overlap, marker safety, S5 edits, cancellation, and hidden loops.
- Audit 07 passed that focused rendering contract at `3f27ac2`, closed P1-03 and Round 3, and authorized Round 4. Stage 0 remains open.

The semantic/model results are audited to Audit 06's stated boundary; the raw-label renderer is audited only to Audit 07's focused boundary.

### Round 4 — Atomic model import and visible semantic state

**Status: CLOSED AT `5c89ab5` — WORK MAX AUDIT 08.**

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

**Implemented policy**

- `MPL.parseModelString()` parses every legacy state and transition into intermediate plain data. `Model.loadFromModelString()` performs no model mutation until the complete input, all targets, and all null/live references validate and the replacement state array is prepared.
- Failure returns structured error data with stable code and source location fields. The exact prior world-array length, null slots, valuations, transitions, and stable indices remain unchanged; no valid prefix survives a malformed suffix.
- Successful legacy import retains leading/internal/trailing null slots, empty assignments, multi-digit targets, optional trailing transition commas, arbitrary supported one-code-point relation labels including `x`, and set-like duplicate-transition suppression. Compact assignment keys remain one character.
- Browser formula/edit/import atoms are exactly `p`–`t`. A compact browser import containing another atom key is rejected atomically with `UNSUPPORTED_BROWSER_ATOM`; startup retains the complete default, shows a clear error, leaves S5 off, and does not rewrite the failed URL with partial state.
- Raw programmatic models may retain other atom keys such as `foo` and `bar_baz`; the UI discloses them as unsupported semantic keys instead of silently deleting or renaming them.
- Relation labels outside the five agent buttons remain accepted where the legacy format supports them, retain the Audit 07 renderer, appear in the inspector, and are identified as lacking a direct selection button.
- The variable-count control is a display projection only. Reducing displayed rows preserves valuations, valuation classes, ordinary formula truth, and BAPAL results while listing supported true keys hidden by the projection.
- The accessible collapsed semantic-state inspector separately reports the authoritative semantic worlds/assignments/outgoing transitions and the graph's node/non-loop-link projection, along with null slots, active labels, stored transitions/self-loops, hidden/unsupported keys, S5 state, projection differences, warnings, and machine-readable JSON. Raw values use text insertion boundaries.
- Round 4 introduces no versioned JSON model/formula schema and does not start Round 5.

**Local implementation and review evidence**

- Before production repair, the new atomic suite failed on `ApS;BROKEN;AqS` because no explicit structured failure was returned and the existing loader could replace the prior model with a prefix. The permanent minimized malformed corpus contains nine named cases covering missing delimiters, invalid/out-of-range/null targets, missing labels, trailing material, and late malformed states.
- `scripts/check-atomic-model-import.js` passes 16 valid compatibility cases and 100,000 deterministic candidates with seed `0x041c0a11`: 50,000 accepted candidates match its independent test-local oracle and 50,000 malformed candidates preserve exact rollback. Three executable startup cases cover failure retention, valid `x`, and the empty URL path.
- The concentrated independent review used a separate temporary oracle and seed `0x7a4e19d3` for 250,000 candidates: 125,000 accepted structures matched and 125,000 rejected candidates preserved exact rollback. It reached 20 raw slots, 65,082 accepted multi-digit-target cases, 106,542 accepted `x` cases, eight stable error-code/location probes, and five unique tracked legacy model links, with no production counterexample.
- Before the visibility repair, all ten initial semantic-visibility groups failed because the inspector/update boundary did not exist. `scripts/check-semantic-state-visibility.js` now passes 11 groups covering hidden `r/s/t`, raw `foo`/`bar_baz`, unsupported browser rejection, visible/disclosed `x`, stored loops, null slots, inert raw-string rendering, mutation synchronization, BAPAL/display invariance, and static accessibility.
- No native local browser executable was available. The strongest executable substitute loads production `MPL.js`, `s5-policy.js`, and `app.js` under the VM/DOM/D3 harness; it covers valid/malformed/unsupported startup, default retention, errors, inspector state, actual SVG `x` stroke/markers/text, S5 normalization, formula evaluation, coherent share URLs, and no execution exception. Audit 07 separately supplies native-browser evidence for the protected raw-label renderer at the Round 3 commit.
- All inherited deterministic checks pass: 5/5 agent-rendering groups; 12/12 S5 groups with all 531 small relations and 200,000 operations; 108,246 formula round trips; 11/11 structural-copy cases; BAPAL, logic, S5-closure, valuation-class, and five report-link checks. `git diff --check` passes, and the tracked random report remains byte-identical to HEAD.

Audit 08 closes P1-04, P1-05, and Round 4 at implementation commit `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`; closure is preserved at final log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66`. The legacy compact format remains a compatibility boundary. Round 4 itself contains no Schema v1; the separate local Round 5 implementation below does not alter the audited Round 4 closure. Stage 0 remains open.

### Round 5 — Versioned model/formula schema

**Status: CLOSED AT `edfbf32` — WORK MAX AUDIT 10.**

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

**Implemented policy**

- `js/schema-v1.js` exposes separate `bapal-model` and `bapal-formula` version-1 documents through `MPL.SchemaV1`. It does not use the legacy compact format or URL encoding as an internal bridge.
- Model world identity is the preserved array index, including leading/internal/trailing null slots. Atom sets and labelled transitions are explicit arrays; model identifiers are exact nonempty well-formed Unicode scalar strings. Empty and lone-surrogate identifiers reject, and prototype-sensitive names decode into prototype-safe assignments.
- Formula Schema v1 exposes only the stable `atom`, `not`, `box`, `diamond`, `bapal`, `knowledge`, `announcement`, `and`, `or`, `implies`, and `iff` nodes. Formula atoms match `[A-Za-z0-9_]+`; ordered knowledge units match `[A-Za-z0-9_]`, preserve duplicates, and represent current `K{abc}` shorthand as `['a','b','c']`, not as one multi-character epistemic agent.
- Model canonical output preserves world/null order, sorts true atoms by Unicode scalar value, sorts transitions by target and then relation label, and rejects duplicate atoms/transitions. Formula canonical output preserves all semantic child and shorthand-unit order. Extra structural fields and unknown versions reject explicitly.
- The two Draft 2020-12 JSON Schema artifacts enforce structural shape. Runtime validation adds live/in-range target checks, exact Unicode-scalar policy, cycle safety, and current semantic-representation compatibility. Ordinary failures return stable structured error objects with replayable paths.
- The canonical resource identities are `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` and `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json`. Permanent tests assert these exact, distinct absolute HTTPS `$id` values, the unchanged Draft 2020-12 dialect and format/version constants, absence of the stale repository identity, and local `$ref` resolution.
- Model decoding returns a fresh independent `MPL.Model`; formula decoding returns a fresh independent `MPL.Wff`; both return independent canonical documents. Formula conversion directly maps stable and legacy JSON ASTs and does not use ASCII as semantic transport.
- The current compact share URL is unchanged and remains a compatibility interface. Parser, printer, evaluator, deep copy, S5, rendering, Round 4 import/visibility, report generation, reports, and result terminology remain outside Round 5's implementation diff.

**Permanent implementation evidence**

- `scripts/check-model-schema-v1.js` uses seed `0x5c4e4d41` (`1548635457`) for exactly 100,000 generated models. It records 84,099 sparse models, 300,172 null slots, 45,455 multi-digit-target models, 91,825 Unicode models, and 3,454 truth comparisons, with all nine deterministic groups passing.
- `scripts/check-formula-schema-v1.js` exhausts 8,210 formulas through logical size 5 with per-size counts `2, 12, 92, 792, 7312`. It uses seed `0x0f05ca1a` (`252037658`) for exactly 100,000 generated formulas through depth 40, covers every constructor, and records 724 truth comparisons, with all ten deterministic groups passing.

**Prompt 5.3 concentrated independent review evidence**

- The independent model oracle used seed `0x91e10da5` (`2447445413`) for 200,000 documents: 100,000 accepted and 100,000 rejected. After a scoped repair preserving the original input transition index in post-canonicalization target errors, classification, canonical interpretation, mutation, and error-path mismatches were all zero; the minimized case is permanent in the model suite.
- The independent formula oracle used seed `0xc2b2ae35` (`3266489909`) for 200,000 documents: 100,000 valid and 100,000 malformed. It separately round-tripped at least 100,000 valid stable ASTs; classification, identity, knowledge-policy, deep-path, and mutation mismatches were zero.
- Truth review used seed `0x6a09e667` (`1779033703`), exactly 10,000 formula-schema instances, eight models with 32 live worlds, and 320,000 pointed comparisons (640,000 evaluator calls). It included 999 BAPAL-rooted cases and bounded BAPAL enumeration to at most eight worlds, four valuation classes, and eight announcement subsets; mismatches were zero.
- Python `jsonschema` 4.10.3 was already installed and checked both artifacts as Draft 2020-12 schemas. Formula artifact/runtime classification aligned in all ten boundary categories. The model artifact had exactly the documented runtime-only semantic differences for out-of-range targets, targets to null worlds, and lone-surrogate rejection.
- All inherited deterministic checks listed by the Round 5 task pass, including semantic visibility, atomic import, agent rendering, S5 invariants/closure, formula round trip, structural copy, BAPAL/logic/valuation-class checks, report links, and `git diff --check`. No tracked report was regenerated.

**Audit 09 and Audit 10 disposition:** Audit 09 returned **PASS SUBJECT TO LOCAL REPAIRS**. It passed the runtime Model Schema v1 and Formula Schema v1 implementations and identified stale JSON Schema resource identities as the only closure blocker. Audit 10 verifies the exact `$id` repair and permanent regressions at `edfbf32d07507bd43143bd518dbe3e2316a65979`, records documentary final audited HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8`, and returns **PASS — ROUND 5 VERSIONED SCHEMA V1 CLOSED; PROCEED TO ROUND 6**. R5-A09-01 and Round 5 are closed. P1-06, P1-07, and Stage 0 remain open.

### Round 6 — Independent oracle, conformance corpus, and CI

**Status: IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT.**

**Scope**

- Obtain or reconstruct the independent Python oracle used in the audit.
- Preserve implementation independence from the production evaluator.
- Add a fast pull-request conformance subset and a scheduled full bounded check.
- Preserve seeds, enumeration counts, code/corpus hashes, runtime metadata, and minimized failure artifacts.
- Include `check-report-links` in aggregate verification.
- Ensure test commands do not rewrite tracked reports.

**Implemented policy**

- `oracle/bapal_oracle.py` is Python 3 standard-library-only and independently parses Model/Formula Schema v1. It does not invoke Node, read production JavaScript at runtime, call `MPL.truth` or `MPL.SchemaV1`, parse production ASCII formulas, or use production output as expected truth.
- `oracle/production_runner.js` uses production Schema v1 decoding and `MPL.truth` solely to produce actual results. `oracle/conformance.py` owns independent generation, explicit expected/actual comparison, profile validation, manifests, failure artifacts, and deterministic reduction.
- `conformance/v1/core-corpus.jsonl` contains 73 explicit hand-authored pointed cases with manually authored expected truth values across every constructor and the required modal, knowledge, PAL, BAPAL, sparse/null, S5/non-S5, identifier, and raw-label boundaries.
- FAST is fixed at seed `0x6F524143`, exactly 50,000 comparisons, at most four live worlds, three valuation classes, and BAPAL nesting one. FULL is fixed at seed `0xC0DEC0DE`, exactly 500,000 comparisons, at most five live worlds, four valuation classes, and BAPAL nesting two. Both independently generate Schema v1 documents in Python and require all constructors plus their profile coverage contract.
- Deliberate sensitivity uses seed `0xBAD0C0DE`. It flips one copied production result outside production code, runs the normal comparator, requires a nonzero mismatch and replayable temporary artifact, exercises deterministic shrinking, and cleans temporary output.
- Runtime manifests record exact counts and coverage, bounds, git HEAD/tree, Python/Node/platform, duration, mismatch count, and SHA-256 provenance. Checked-in profile documents pin stable inputs and fail when those hashes are stale.
- Mismatch artifacts retain the original and deterministically reduced replayable cases, oracle/production results, source hashes, and reduction steps. The reducer removes transitions, true atoms, safe nonpointed worlds, and formula subtrees only when the mismatch remains; it does not claim global minimality.
- `.github/workflows/bapal-conformance.yml` runs FAST on pull requests, pushes to `bapal-core`, and manual dispatch; FULL runs weekly and manually. It has `contents: read`, runs inherited non-writing regressions, enforces complete zero-mismatch manifests and clean worktrees, always uploads artifacts, and never invokes the random report generator.

**Prompt 6.4 concentrated review and local evidence**

- Five separate temporary production mutants were killed by a complete 50,000-case FAST run: inverted atoms (`23,691` mismatches; first `fast-000000000`, oracle false/mutant true), removed PAL false-precondition vacuity (`12,127`; first `fast-000000002`, oracle true/mutant false), knowledge over every outgoing label (`936`; first `fast-000000009`, oracle true/mutant false), BAPAL retaining only the pointed class (`391`; first `fast-000000130`, oracle true/mutant false), and broken implication (`5,234`; first `fast-000000001`, oracle true/mutant false).
- Three separate temporary oracle mutants were likewise detected: wrong knowledge filtering (`936` mismatches; first `fast-000000009`, mutant oracle false/production true), wrong PAL restriction (`183`; first `fast-000000152`, mutant oracle true/production false), and wrong BAPAL pointed-class inclusion (`235`; first `fast-000000331`, mutant oracle false/production true). The temporary copies did not modify the repository.
- Before the adversarial exact-identity case was added, deliberate sensitivity verified 24 normal comparisons with zero mismatch, flipped exactly one production Boolean, obtained exactly one mismatch, exercised 14 deterministic reduction steps across transitions, atoms, worlds, and formula subtrees, replayed both original and reduced cases, and cleaned its temporary artifact.
- The strengthened local FULL run used seed `0xC0DEC0DE` and completed exactly 500,000 comparisons in `94.502206` seconds: 128 models, 1,024 formulas, 364 live pointed worlds, 232,418 PAL comparisons, 295,446 BAPAL comparisons, 78,600 nested-BAPAL comparisons, maximum BAPAL nesting two, and four mismatches. All 11 Formula Schema v1 constructors were covered; configured/observed bounds were five live worlds, four valuation classes, and nesting two.
- Pre-commit revalidation repeated the exact FULL target in `93.034424` seconds with the same counts, coverage, bounds, and four mismatches.
- The first real mismatch is permanent core case `core-073-bapal-delimiter-collision-exact-atoms`: world 0 has true atoms `{"a","b"}`, world 1 has the single true atom `{"a,b"}`, and `^K{x}a` at world 0 is hand/oracle true but production false. Production's current comma-joined valuation key treats the two exact atom sets as one class. The same independently generated adversarial shape produces four FAST and four FULL mismatches.
- The FULL manifest records HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8`, tree `eab4eafba24d9fc84e8d6119946e60416cf56e6b`, mismatch count four, and source hashes. Runtime artifacts remain outside tracked paths.

**Acceptance criteria**

- CI distinguishes production regression tests from the independent oracle.
- The fast and full matrices publish machine-readable manifests tied to exact commits and hashes.
- Any mismatch fails the job and preserves a reproducible minimized artifact.
- Aggregate verification includes report-link checking and leaves the working tree unchanged.

The infrastructure acceptance points are implemented, but zero unexplained mismatch is not satisfied. P1-07 remains open, and Round 7 must not begin until the production counterexample is handled in a separately authorized scope and a Work Max Round 6 closure audit passes.

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

Every P0/P1 defect from the foundational audit appears exactly once below with one primary repair round. P0-01 is **CLOSED AT `55f557c` — WORK MAX AUDIT 04** for internal semantic copying. P1-01 is **CLOSED AT `e0c816f` — WORK MAX AUDIT 05** under the supported-AST ASCII-printing contract. P1-02 is **CLOSED AT `6bd3369` — WORK MAX AUDIT 06**. P1-03 is **CLOSED AT `3f27ac2` — WORK MAX AUDIT 07**. P1-04 and P1-05 are **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**. P1-07 is **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT** and remains open; P1-06 remains **OPEN**.

| Defect ID | Status | Severity | Affected files/functions | Primary round | Dependencies | Required minimized regression | Closure evidence |
|---|---|---|---|---|---|---|---|
| P0-01 | CLOSED AT `55f557c` — WORK MAX AUDIT 04 | P0 — wrong result/exception | `js/MPL.js`: structural `deepCopy` used by the PAL/BAPAL branches of `_truth`; the legacy `getStateString`/`loadFromModelString` boundary remains separately limited | Round 1 | Normative specification and protected-semantics baseline | One world `{foo:true}`: `foo = true`, `[(p | ~p)]foo = true`, `^foo = true`, with no exception | Structural-copy regression suite; independent Work Max targeted harness; minimized before/after formulas; Audit 04 closure report |
| P1-01 | CLOSED AT `e0c816f` — WORK MAX AUDIT 05 | P1 — parser/API contract | `js/MPL.js`: `_jsonToASCII` protective-parentheses rule and `Wff` parse/print path; parser configuration unchanged | Round 2 | Round 1 closed; supported grammar boundary recorded | `[(K{a}p)]q` prints, reparses, and yields the same AST | Minimized parent reproduction; 108,246 checked-in round trips; independent exhaustive size-6 and 50,000-generated-AST verification with zero candidate failures; semantic non-regression checks; Audit 05 |
| P1-02 | CLOSED AT `6bd3369` — WORK MAX AUDIT 06 | P1 — S5 model integrity | `js/app.js`: world-creation `mousedown` path; `js/s5-policy.js`: relevant-agent and world-addition policy; semantic relations in `MPL.Model` | Round 3 | Rounds 1–2 closed; fixed relevant-agent policy | With active S5 relations for `a` and `b`, add a world while `a` is selected; both relations remain reflexive, symmetric, and transitive | Pre-repair missing `2R_b2`; minimized new-world regression; all-agent stored-loop inspection; 10,000 checked-in sequences; independent 25,000-sequence review; executable full-app VM/stub path; Audit 06 closure |
| P1-03 | CLOSED AT `3f27ac2` — WORK MAX AUDIT 07 | P1 — misleading S5 state/incomplete or invisible closure | `js/app.js`: `setS5Mode`, model-to-D3 synchronization, generic SVG relation rendering, `addRelationForCurrentMode`; `js/s5-policy.js`: confirmation/edit policy; `js/MPL.js`: whole-relation closure | Round 3 | Same S5 policy and harness as P1-02; Audit 06 raw-label counterexample | Toggle S5 on over one-way `x` in `AS1x,;AS`; cancellation leaves state unchanged or accepted normalization repairs the relation, and every non-loop `x` descriptor has visible stroke, direction, and identity | Audit 06 passes semantic/model behavior but finds invisible `x`; Audit 07 verifies safe/deduplicated markers, explicit strokes, directions, complete raw labels, overlaps, stored hidden loops, declared-agent compatibility, and closes P1-03/Round 3 |
| P1-04 | CLOSED AT `5c89ab5` — WORK MAX AUDIT 08 | P1 — non-atomic model import | `js/MPL.js`: `parseModelString`, `loadFromModelString`; `js/app.js`: startup/share-URL load path | Round 4 | Round 3 closed by Audit 07; Round 1 structural model operations | Load `ApS;BROKEN;AqS` over a known existing model; receive structured failure and retain the exact complete prior model | Nine minimized failures; 16 compatibility cases; permanent 100,000-case oracle/fuzz with 50,000 exact rollbacks; separate 250,000-case independent review with 125,000 exact rollbacks; three startup cases; Audit 08 closure |
| P1-05 | CLOSED AT `5c89ab5` — WORK MAX AUDIT 08 | P1 — hidden semantic state | `js/app.js`: browser boundary, `SemanticState`, model-to-D3 projection, `setVarCount`, inspector synchronization; `index.html`; `css/app.css` | Round 4 | Round 1 identifier preservation; browser atom policy `p`–`t`; Audit 07 relation renderer | Hide true `r/s/t`, inject raw `foo`/`bar_baz`, import unsupported atom `x`, and store relation `x`/self-loops/null slots; every semantic fact is disclosed or browser import is rejected before mutation | 11 semantic-visibility groups; exact semantic/visual JSON comparison; valuation-class/formula/BAPAL invariance; executable production VM/DOM/D3 startup, S5, formula, rendering, escaping, URL, and mutation-path coverage; Audit 08 closure |
| P1-07 | IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT | P1 — non-independent verification/no gate | `oracle/`, `conformance/v1/`, `scripts/check-independent-oracle.py`, `scripts/check-oracle-*.py`, `.github/workflows/bapal-conformance.yml`, `docs/CONFORMANCE.md` | Round 6 | Round 5 closed by Audit 10; exact Schema v1 interchange | A deliberately altered copied result is detected, reduced, retained, and replayed; exact-atom collision case `core-073` is independently detected | 73-case manual core; FAST `0x6F524143`/50,000; FULL `0xC0DEC0DE`/500,000; sensitivity `0xBAD0C0DE`; five production and three oracle mutants killed; current FULL completes exact count but reports four real mismatches, so P1-07 is not closed |
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
