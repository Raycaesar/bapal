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
- **Focused rendering closure audit:** [`audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md`](../audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md)
- **P1-03 status:** **CLOSED AT `3f27ac2` — WORK MAX AUDIT 07**
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

Audit 06 closes P1-02 and passes P1-03's semantic/model behavior. Audit 07 passes the focused raw-label rendering repair, closes P1-03 and Round 3 narrowly at `3f27ac2`, and authorizes Round 4. Stage 0 remains open.

### Round 4 — atomic legacy import and visible semantic state

- **Defects:** P1-04 and P1-05
- **Implementation commit:** `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`
- **Closure audit:** [`audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md`](../audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md)
- **Status:** **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**
- **Final-HEAD confirmation:** closure remains valid at final log-only HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66`.
- **Audit boundary:** Audit 08 closes transactional legacy-format import, the browser `p`–`t` atom boundary, and disclosure of raw unsupported semantic state under the documented Round 4 contract.
- **Historical baseline:** at `92a4ba6`, `loadFromModelString()` cleared the current model before validation, stopped silently at malformed state/transition fragments, could keep only a valid prefix, and could ignore invalid transitions. Hidden or unsupported valuation keys could affect semantic truth and BAPAL valuation classes without browser disclosure.
- **Transactional import:** the audited Round 4 implementation completely parses the legacy compact string into an intermediate plain-data representation, validates every record and target, prepares the full replacement, and mutates the model only after all work succeeds. Failure is an explicit structured result and preserves the exact prior world array, null slots, valuations, and transitions.
- **Legacy compatibility:** successful import preserves stable raw indices, leading/internal/trailing null slots, empty assignments, multi-digit targets, optional trailing transition commas, arbitrary supported one-code-point relation labels such as `x`, and existing duplicate-transition suppression. Compact assignment keys remain one character. The direct empty-string contract is one explicit null slot; an empty browser URL model parameter retains the valid default model.
- **Browser atom boundary:** browser formula/edit/import support remains exactly `p`–`t`. A browser/share-URL compact import containing another atom character is rejected atomically with `UNSUPPORTED_BROWSER_ATOM`, a visible error, and no partial graph, URL rewrite, or S5-on claim.
- **Raw Model API:** raw programmatic `MPL.Model` objects may contain other keys such as `foo` and `bar_baz`. Such true keys remain semantically active and preserved, and the inspector identifies them as unsupported browser keys rather than deleting or renaming them.
- **Relation labels:** relation labels are not rejected merely because they lie outside the five selection buttons `a`–`e`. They remain semantic identities, receive the audited Round 3/Audit 07 rendering behavior when projected, and are listed as active labels without direct selection buttons where applicable.
- **Display projection:** the variable-count selector is “Visible propositional-variable rows.” It controls node/table display only; it does not edit semantic valuations. Supported true keys hidden by the current row count are listed explicitly.
- **Semantic/graph distinction:** the semantic `MPL.Model` is authoritative. The inspector separately reports semantic worlds, true assignments, outgoing labelled transitions, stable null indices, and stored self-loops versus visual node IDs and non-loop D3 link descriptors. Projection differences generate warnings rather than causing silent semantic-data deletion.
- **Inspector contract:** the edit pane contains a collapsed keyboard-accessible `<details>` inspector with a concise summary, warnings, all supported/hidden/unsupported atom sets, active labels, transition/loop/projection counts, S5 status, and a machine-readable JSON `<pre>`. Raw atom and relation strings are rendered through text boundaries.
- **No Round 5 schema:** this delta does not version or replace the compact model/formula format and introduces no JSON interchange schema. The versioned schema remains deferred to the now-active Round 5.

Audit 08 closes P1-04, P1-05, and Round 4 at `5c89ab5`; final log-only HEAD `ab26863` preserves that closure. The transactional import boundary and semantic inspector remain protected behavior. This paragraph records the closed Round 4 boundary; the separately reviewable Round 5 implementation follows. P1-06, P1-07, and Stage 0 remain open.

### Round 5 — Versioned Model and Formula Schema v1

- **Status:** **CLOSED AT `edfbf32` — WORK MAX AUDIT 10**
- **Audit disposition:** Audit 09 passed the runtime Model Schema v1 and Formula Schema v1 implementations subject only to R5-A09-01, stale JSON Schema resource identities. Audit 10 verifies the exact canonical-ID repair at `edfbf32d07507bd43143bd518dbe3e2316a65979`, records documentary final audited HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8`, closes R5-A09-01 and Round 5, and authorizes Round 6.
- **Purpose:** Schema v1 is a stable semantic JSON interchange format for `MPL.Model` and `MPL.Wff`. It is separate from the unversioned legacy compact model/share format and does not migrate or replace the current URL interface.
- **Canonical schema resource identities:** Model Schema v1 is identified by `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json`; Formula Schema v1 is identified by `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json`. These `$id` values identify the artifacts independently of runtime API names and legacy compact URLs; internal `$ref` values are local fragments.
- **Model envelope:** `{"format":"bapal-model","version":1,"worlds":[...]}`. World identity is the stable array index. Every slot is `null` or an object containing the exact arrays `trueAtoms` and `transitions`; each transition has an integer `target` and string `agent`. Null indices are never compacted, assignments are not encoded as object-property names, and relations are not compact concatenated tokens.
- **Formula envelope:** `{"format":"bapal-formula","version":1,"formula":<node>}`. The stable node vocabulary is `atom`, `not`, `box`, `diamond`, `bapal`, `knowledge`, `announcement`, `and`, `or`, `implies`, and `iff`. Unary nodes use `operand`, announcements use `precondition` and `body`, and binary nodes use `left` and `right`. Parser-internal announcement/knowledge split nodes are not interchange data.
- **Model identifier policy:** atom names and relation labels are preserved as exact, nonempty, well-formed Unicode scalar strings, without normalization, concatenation, or truncation. Prototype-sensitive, whitespace, punctuation, control, markup-shaped, combining, BMP, and astral strings are ordinary data. Empty strings and isolated UTF-16 surrogate code units are rejected.
- **Formula identifier policy:** atom names must match `[A-Za-z0-9_]+`. Every entry in the ordered nonempty `knowledge.agents` array must match `[A-Za-z0-9_]`. Thus current `K{abc}A` behavior is represented by `agents:["a","b","c"]`, not by one multi-character epistemic agent; duplicate shorthand units are preserved. Formula Schema v1 does not broaden current epistemic-agent semantics.
- **Canonicalization:** envelope and node fields are constructed in fixed order. World-array order and null slots are preserved. `trueAtoms` sort by Unicode scalar value, transitions sort by target and then relation-label scalar order, and duplicate atoms or semantic transitions are rejected. Formula operand, child, and knowledge-unit order is preserved exactly, including for semantically commutative connectives. Re-encoding accepted noncanonical array order produces the canonical representation. This is the project Schema v1 canonical encoding, not a claim of RFC 8785 implementation.
- **Validation layers:** the two Draft 2020-12 JSON Schema artifacts define closed structural shapes, required fields, primitive bounds, formula identifier patterns, and local array uniqueness. Dependency-free runtime validation adds semantic checks that static JSON Schema does not express, including `target < worlds.length`, a live non-null target, safe/well-formed runtime strings, cyclic programmatic formula rejection, and current representation compatibility.
- **Errors and versions:** ordinary validation and conversion failures return structured `{ok:false,error:{code,message,path,...}}` data. Unknown versions reject explicitly with `UNSUPPORTED_VERSION`, and extra structural content is not silently ignored. Successful decode returns fresh independent semantic structures and a canonical document.
- **Conversion independence:** model conversion never calls compact-string APIs. Formula conversion maps directly between the stable Formula Schema v1 AST and legacy `Wff` JSON; ASCII printing or parsing is not used as semantic transport.
- **Bounded evidence:** the permanent model suite covers 100,000 generated models with seed `0x5c4e4d41` and 3,454 truth comparisons; the formula suite covers 8,210 exhaustive small formulas, 100,000 generated formulas with seed `0x0f05ca1a`, and 724 truth comparisons. Prompt 5.3's separate review compared 320,000 pointed truth results across 10,000 formula documents and eight models with zero mismatches after one scoped error-path repair. These counts are regression evidence, not a proof.
- **Protected compatibility:** the legacy compact model serializer/importer remains available as a compatibility interface with its documented one-character atom and one-code-point relation-label limits. Round 5 does not change the parser, printer, evaluator, S5 policy, rendering, transactional import, semantic inspector, reports, or current share URL.

The normative developer-level Schema v1 contract and examples are in [`docs/SCHEMA_V1.md`](SCHEMA_V1.md). Audits 09 and 10 together close Round 5 under their stated boundaries. P1-06, P1-07, and Stage 0 remain open.

### Round 6 — Independent oracle, conformance corpus, and CI

- **Status:** **CLOSED — WORK MAX AUDIT 12**
- **Defect target:** P1-07, non-independent verification/no permanent gate. Audit 11 substantively passed the executable package subject to R6-A11-01 documentary synchronization. The focused [`Audit 12`](../audit/12_BAPAL_ROUND_6_DOCUMENTARY_CLOSURE_RECHECK.md) recheck passed that repair, closed P1-07 and Round 6, and authorized Round 7. Stage 0 remains open.
- **Independence architecture:** `oracle/bapal_oracle.py` is a Python 3 standard-library-only semantic evaluator. It parses Schema v1 JSON into its own structures and neither imports nor invokes Node, reads production JavaScript at runtime, calls production `MPL.truth`/`MPL.SchemaV1`, parses production ASCII formulas, nor uses production output as expected truth. `oracle/production_runner.js` does the complementary production-only work: it decodes Schema v1 through `MPL.SchemaV1`, calls `MPL.truth`, and emits actual results without implementing expected semantics. `oracle/conformance.py` compares those explicit expected and actual roles.
- **Interchange boundary:** independently authored or generated Model Schema v1 and Formula Schema v1 documents are the only semantic interchange. Generated cases originate in Python rather than production encoders. Stable world-array indices, including null slots, remain stable.
- **Semantic coverage:** the oracle implements atoms; `not`, `and`, `or`, `implies`, and `iff`; ordinary `box` and `diamond` over all outgoing successors regardless of label; character-wise knowledge shorthand over only matching labels; PAL source-model precondition evaluation, false-precondition vacuity, and whole-domain restriction; and existential BAPAL over unions of complete exact-atom valuation classes that retain the pointed class. It enumerates class unions, not syntactic Boolean announcements.
- **Core corpus:** `conformance/v1/core-corpus.jsonl` has 73 explicit pointed cases with authored expected Booleans. It covers every constructor, modal and knowledge vacuity, wrong-label filtering, multiple knowledge units, PAL vacuity/restriction/nesting, BAPAL valuation-class and nesting cases, sparse/null worlds, S5 and non-S5 frames, multi-character and prototype-sensitive atom names, raw relation labels, and formula knowledge shorthand.
- **FAST:** seed `0x6F524143`; exactly 50,000 pointed comparisons; 64 models and 256 formulas; at most four live worlds, three valuation classes, and BAPAL nesting one. Every Formula Schema v1 constructor plus PAL/BAPAL, shorthand knowledge, S5/non-S5, sparse/null layouts, multiple relation labels, multi-character model atoms, and exact Schema v1 identities is required.
- **FULL:** seed `0xC0DEC0DE`; exactly 500,000 pointed comparisons; 128 models and 1,024 formulas; at most five live worlds, four valuation classes, and BAPAL nesting two. It enforces every constructor and substantial PAL, BAPAL, nested-BAPAL, sparse, S5/non-S5, and multi-agent coverage.
- **Other fixed seeds:** deliberate sensitivity uses `0xBAD0C0DE`. The reserved core/generated-support seed is `0xBADA5506`; explicit core expectations remain hand-authored rather than derived from either evaluator.
- **Runtime manifests:** every generated run requires an explicit artifact directory or creates a temporary untracked one. `manifest.json` records format/version/status, profile and profile file, seed, expected and actual counts, model/formula/live-point counts, constructor/PAL/BAPAL/nested-BAPAL/knowledge/S5/non-S5/sparse coverage, configured and observed bounds, git HEAD/tree, Python/Node/platform versions, start/end/duration, mismatch count, and SHA-256 provenance for the oracle, runner, comparator, core, active profile, both Schema v1 artifacts, `js/MPL.js`, and `js/schema-v1.js`.
- **Profile provenance:** checked-in FAST/FULL profile documents pin their format/version, seed, exact target, bounds, required coverage, generator sizing, and hashes of the stable oracle/bridge/comparator/core inputs. The permanent check rejects stale pins; profile self-hashes are deliberately excluded.
- **Mismatch and reduction artifacts:** a mismatch writes `mismatch.json` containing profile/seed/index/ID, the top-level replay data and results, source hashes, the preserved original case, the reduced replayable case, and deterministic reduction steps. The reducer attempts transition, true-atom, safe nonpointed-world, and formula-subtree reductions while retaining only reproducing changes. It truthfully calls the result “minimized by the implemented deterministic shrinker; not globally minimal.”
- **Deliberate sensitivity:** the sensitivity check first requires a small normal set with zero real mismatches, then flips exactly one copied production Boolean outside production code, runs the same comparator, requires one detected mismatch and a replayable temporary artifact, exercises and replays reduction, and cleans the temporary directory. No mutation switch exists in production.
- **CI:** `.github/workflows/bapal-conformance.yml` runs FAST on pull requests, pushes to `bapal-core`, and manual dispatch. FULL runs on weekly schedule and manual dispatch. Jobs have `contents: read`, use official pinned-major setup/upload actions, run inherited deterministic non-writing checks, require complete zero-mismatch manifests, verify whitespace and a clean worktree, always upload artifact directories, and never invoke random report generation.
- **Scoped repair and audited evidence:** the first executable remote FAST run, `31278938374`, stopped at `core-073-bapal-delimiter-collision-exact-atoms`, where comma-joined production valuation keys conflated `{"a","b"}` with the single atom set `{"a,b"}`. The authorized repair uses a collision-free canonical structural key for the sorted exact atom array. The unchanged hand expectation and independent oracle now agree with production. Candidate `ffcd7cb2d14217859069acd8ac23cdc5ea450cbc` passed push FAST in run `31279961371` and manual FAST/FULL in runs `31280106548` and `31280325814`; final log-only HEAD `e9b8bd37a380c74375c7cd161711f76e605bf483` passed push FAST in run `31281388941`. Successful FAST runs completed exactly 50,000 comparisons and successful FULL runs exactly 500,000, all with zero mismatches. Audit 11 substantively passed the executable package, and Audit 12 closed its sole documentary follow-up R6-A11-01.
- **Scope limitations:** the system supplies bounded finite regression and differential evidence. Oracle agreement is not a formal proof and does not establish semantic correctness, soundness, completeness, satisfiability, validity, decidability, or behavior outside the finite profile bounds. The scoped repair changes only production valuation-class identity; it does not alter the BAPAL quantification architecture, PAL, knowledge, ordinary modal semantics, parser/printer, Schema v1 identifier policy, S5 policy, legacy import, rendering, inspector, result terminology, report generation, or reports.

The normative developer guide is [`docs/CONFORMANCE.md`](CONFORMANCE.md). Audit 12 authorized Round 7 after closing P1-07 and Round 6.

### Round 7 — Result terminology and documentation closure

- **Status:** **CLOSED AT `91239f7` — WORK MAX AUDIT 13**
- **Defect target:** P1-06. The historical sampled report used the machine fields `satisfiable` and `globallyTrue` and the result labels “Satisfiable” and “Globally true” for aggregates over one generated model. Those names could be mistaken for logical satisfiability and validity claims.
- **Machine terminology:** pointwise results use `truthAtWorld`; aggregation over one explicit model uses exactly `trueSomewhereInModel` and `trueAtEveryWorldInModel`. The old misleading fields are removed rather than retained as aliases.
- **Human terminology:** report headings use “True at some world in this model” and “True at every live world in this model.” Console summaries use the same model-local concepts.
- **Sampled-report nonclaim:** every generated report visibly states that it evaluates formulas only in the explicit generated finite model shown; truth somewhere does not establish logical satisfiability, failure everywhere does not establish unsatisfiability, truth everywhere does not establish logical validity, and sampled/generated evidence is not a decision procedure.
- **Checking boundary:** `MPL.truth` remains pointed finite-model evaluation of `M,w \models \varphi`. The report derives some-world and every-live-world summaries only within that supplied model; it performs no model search and no satisfiability or validity inference.
- **Documentation alignment:** the README, browser metadata/help, API reference, verification guide, and technical docs distinguish ordinary modal operators, PAL, existential Boolean arbitrary announcement, the universal BAPAL operator used in literature, formal S5 target semantics, arbitrary stored-relation evaluation, browser/raw/schema identifier vocabularies, and the legacy compact/Schema v1 boundaries.
- **Verification wording:** on one finite explicit model, valuation-class definability is justified with a finite separator construction over the finitely many occurring exact-atom classes. It is not justified by an infinite complete-valuation conjunction and does not imply a finite-model property or general BAPAL decidability.
- **Permanent regression:** `scripts/check-report-terminology.js` exercises actual evaluation and rendering. It checks exact fields, formulas true at some but not all live worlds, true at all live worlds, and false at all live worlds, accurate HTML/console labels, the visible disclaimer, absence of old result fields, tracked-report alignment, valid non-writing rendering, and preservation of the tracked report during ordinary deterministic execution.

Audit 13 closes P1-06 and Round 7 at complete implementation candidate `91239f7340a330f4dc3c2b1d5546bcc3b666dc58`, with closure preserved at final reviewed log-only HEAD `8d0e64cafcfa690738fe3fdc15bea784c88ea9a0`. Stage 0 remains open pending the Round 8 final Work Max closure audit; the closed Round 6 independent conformance contract remains protected.

### Round 8 — Final Stage 0 Closure

**Status: PREPARING FINAL WORK MAX CLOSURE AUDIT.**

All identified Stage 0 P0/P1 defects are individually closed, backed by Audits 04–13 under their exact scopes. Stage 0 has not yet received one final global closure verdict. Round 8 performs only cross-round acceptance, regression integrity, evidence freeze, and documentation/status consistency. No Stage 1 work may begin before the final PASS.

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
| Ordinary modal box | `□A` |
| Ordinary modal diamond | `<>A` |
| Individual knowledge | `K{a}A` |
| Public-announcement box | `[A]B` |
| Existential Boolean arbitrary announcement | `^A` |

**NORMATIVE.** The BAPAL existential modality has ASCII form `^A`, Unicode display `◇ᵝA`, and LaTeX display `\Diamond_{\beta}A`. The `β` marks quantification over Boolean announcements; it does not denote agent `b`.

**NORMATIVE.** `□A` and `<>A` are the inherited ordinary accessibility modalities. They are not the universal or existential BAPAL operators. The universal BAPAL operator used as a primitive in some literature has no separate application syntax here.

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

**CURRENT ROUND 3 STATUS.** The audited semantic/model policy makes the S5 state and underlying invariant agree for the relevant-agent set defined in the post-baseline delta: entering S5 either requires no change because every relation is already an equivalence relation, is cancelled without mutation, or explicitly normalizes every relevant relation to its least equivalence closure. Every accepted S5-on edit preserves that invariant. Audit 07 additionally closes the raw-label rendering defect: every non-loop descriptor receives the visible rendering contract below. P1-03 and Round 3 are closed; Stage 0 remains open.

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

**CURRENT LEGACY/BROWSER COMPATIBILITY CONTRACT.** The audited dependable compact compatibility subset uses one-character atom and agent identifiers. Browser formula/edit/import atoms are exactly `p`, `q`, `r`, `s`, and `t`; browser-selectable agents are `a`, `b`, `c`, `d`, and `e`. The audited Round 4 browser boundary rejects other compact-import atom keys before mutation. It does not reject a supported compact relation solely because its label is outside `a`–`e`; such labels remain visible and disclosed but are not directly selectable by the five buttons.

**CURRENT SCHEMA V1 CONTRACT — CLOSED, WORK MAX AUDIT 10.** Audit 09 found only R5-A09-01, the stale schema-resource identities; Audit 10 verified that repair and closed Round 5. Model Schema v1 preserves exact nonempty well-formed Unicode scalar strings for atoms and relation labels. Formula Schema v1 deliberately uses the narrower `[A-Za-z0-9_]+` atom grammar and one-character `[A-Za-z0-9_]` knowledge shorthand units described in the Round 5 delta. This schema contract does not broaden the raw parser, browser surface, compact URL format, or evaluator's epistemic-agent semantics, and Round 6 does not reopen it.

**AUDITED BASELINE BEHAVIOR at commit `92a4ba6`.** Raw parser acceptance of a multi-character identifier did not guarantee correct PAL or BAPAL behavior. The compact serialization-based deep-copy path could flatten a true atom such as `foo` into the separate keys `f` and `o`, causing a wrong PAL result or a BAPAL exception. See the post-baseline Round 1 delta above for the audited structural internal-copy repair. Multi-character agents still do not have a dependable end-to-end serialization or formula-interface contract.

**NORMATIVE.** Absence of an atom key means that atom is false. Every world in a model must use one shared atom namespace, so absence has the same meaning everywhere. Hidden or unsupported keys must not silently alter valuation classes or results without disclosure.

**REMAINING REQUIREMENT.** Every interface must continue to state its own identifier boundary explicitly. Schema v1 supplies exact multi-character model identifiers and raw-parser-compatible formula atoms, but it does not establish general multi-character knowledge-agent support end to end.

## 9. Model representation and serialization

**CURRENT.** The semantic model is `MPL.Model`: an indexed array of live world records or `null` deleted slots. Each live record contains a map of true atom keys and a list of labelled outgoing transitions. Missing atom keys are false, and surviving world indices remain stable across deletion.

**NORMATIVE.** Semantic model data is authoritative for evaluation. D3 nodes, links, labels, positions, checkboxes, hidden paths, and selection state are visual projections or controls; they must not substitute for semantic worlds, valuations, or relations.

**CURRENT.** Legacy compact URL model strings concatenate true atom characters and encode each transition as a decimal target followed by one agent character. The format has no version, escaping, declared vocabulary, declared agent set, frame-class assertion, or typed validation result.

**AUDITED BASELINE BEHAVIOR at commit `92a4ba6`.** Internal PAL and BAPAL copying called `getModelString()` and then `loadFromModelString()`. Semantic copying therefore inherited the compact URL format's identifier loss and validation defects. See the post-baseline Round 1 delta above: candidate `55f557c` replaced that internal path with structural copying without changing the compact external format.

**HISTORICAL BASELINE LIMITATION at commit `92a4ba6`.** A malformed model string could clear the old model, stop at the first malformed fragment, and silently retain only a valid prefix.

**CURRENT AUDITED ROUND 4 BEHAVIOR — CLOSED AT `5c89ab5` BY AUDIT 08.** Legacy import is transactional. Complete parsing and validation produce intermediate plain data before the current model is replaced. Every target must resolve to a live indexed world, malformed suffixes are rejected, and failure returns structured error data without changing the prior model. Browser startup first establishes a complete valid default, then attempts URL import; failure retains the default, keeps S5 off, exposes the error, and does not replace the failed URL with a partial state.

**CURRENT SCHEMA V1 IMPLEMENTATION — CLOSED, WORK MAX AUDIT 10.** Round 5 provides separate versioned model and formula semantic documents without ambiguous concatenation, as specified in the post-baseline delta and [`docs/SCHEMA_V1.md`](SCHEMA_V1.md). Audit 10 closed the versioned Schema v1 implementation under the exact Audit 09/10 contracts. It deliberately makes no frame-class assertion and does not replace or certify the compact share URL as lossless. Formula Schema v1 knowledge remains character-wise, result names are governed separately by [`RESULT_TERMINOLOGY.md`](RESULT_TERMINOLOGY.md), and the audited Round 4 boundary remains unchanged.

## 10. Result terminology

[`RESULT_TERMINOLOGY.md`](RESULT_TERMINOLOGY.md) is the normative naming contract. The supported concepts are pointed `truthAtWorld`, `trueSomewhereInModel`, and `trueAtEveryWorldInModel` for one explicit finite model.

**NORMATIVE.** A within-model aggregation must not be presented as an implemented satisfiability or validity search. Failure at every live world of one model does not establish unsatisfiability; truth at every live world of one model does not establish validity. The sampled report, hand-authored core corpus, FAST profile, and FULL profile are distinct bounded artifacts, and none is an unbounded decision procedure or mathematical proof.

**HISTORICAL BASELINE LIMITATION.** The baseline random report labelled within-one-model aggregates “satisfiable” and “globally true.” The Round 7 P1-06 implementation replaces those fields and labels, adds a visible nonclaim, and protects the contract with `scripts/check-report-terminology.js`; Audit 13 closes P1-06 under that exact review boundary.

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
- **P1-03 — CLOSED AT `3f27ac2` BY AUDIT 07:** Audit 06 passed the semantic/model S5 policy; Audit 07 passed the focused raw-label SVG rendering repair and closed Round 3.
- **P1-04 — CLOSED AT `5c89ab5` — WORK MAX AUDIT 08:** the transactional parser/loader rejects malformed compact input explicitly and preserves the complete prior model.
- **P1-05 — CLOSED AT `5c89ab5` — WORK MAX AUDIT 08:** the browser boundary rejects unsupported imported atoms and the semantic inspector discloses hidden supported keys, unsupported raw keys, relation labels, stored loops, and graph-projection differences.
- **P1-06 — CLOSED AT `91239f7` — WORK MAX AUDIT 13:** the report uses `truthAtWorld`, `trueSomewhereInModel`, and `trueAtEveryWorldInModel`, with accurate display labels, explicit nonclaims, and a permanent non-writing regression. Audit 13 closes the defect narrowly under its exact terminology/report/documentation scope.
- **P1-07 — CLOSED BY AUDIT 12:** Round 6 checks in the independent Python oracle, the explicit 73-case corpus, deterministic 50,000-case FAST and 500,000-case FULL profiles, sensitivity/reducer/manifests, and the CI gate. Candidate remote FAST and FULL runs and final-log-only-HEAD remote FAST succeeded with zero mismatches. Audit 11 passed the executable package subject to one documentary repair, and Audit 12 passed that repair and closed P1-07 and Round 6.

**CURRENT STATUS.** Every identified Stage 0 P0/P1 defect has a separately reviewable closure under Audits 04–13 with minimized regression coverage and repair evidence. Those individual closures do not by themselves complete Stage 0; the Round 8 final global Work Max closure audit remains pending.

## 15. Deferred architecture

**FUTURE REQUIREMENT.** After explicit Stage 0 closure, the Stage 1 target is a pure, typed, UI-independent semantic core with explicit formula/model/domain representations, structural restriction, a versioned schema, and browser/CLI conformance.

**DEFERRED.** Web Workers, WebAssembly, Rust, a backend, a database, Z3/SAT/SMT integrations, and formal mechanization are evidence-gated later options. They are not part of this Stage 0 specification task and must not be presented as already implemented.

- A Web Worker may improve responsiveness and cancellation but does not reduce semantic work by itself.
- WebAssembly or Rust requires benchmark evidence after algorithmic and representation repairs.
- A backend is justified only by demonstrated queue, sharing, or bounded execution needs and must use the same semantic core.
- A database is not part of semantic evaluation. It may later store users, jobs, corpora, or provenance if those product requirements arise.
- Z3 may be useful for precisely bounded witness or counterexample encodings or as an additional oracle; it is not the semantic core and cannot establish general BAPAL satisfiability decidability.
- Formal mechanization may prove properties of the finite semantic core but does not by itself resolve the general BAPAL satisfiability problem.
