# Work Max read-only foundational audit and development roadmap: BAPAL Playground

Execute this audit now. Do not review, rewrite, or comment on these instructions.

Perform a comprehensive, read-only audit of the current Boolean Arbitrary Public Announcement Logic playground and produce a correctness-first development roadmap.

Do not edit the repository. Do not create commits, branches, pull requests, patches, replacement applications, or production code. You may run the existing test suite and create temporary analysis scripts outside the tracked repository, but do not modify tracked files.

## Repository

Repository:

`https://github.com/Raycaesar/bapal`

Target branch:

`bapal-core`

Branch URL:

`https://github.com/Raycaesar/bapal/tree/bapal-core`

The application is inherited from the Modal Logic Playground / Epistemic Logic Playground and has been extended with BAPAL evaluation, S5 model-construction support, random evaluation reports, and regression tests.

## Formal sources

Use the following as the semantic specification, not the implementation itself:

1. the supplied current manuscript `main(1).tex`, especially its BAPAL syntax and semantics;
2. Hans van Ditmarsch and Tim French, “Quantifying over Boolean Announcements,” *Logical Methods in Computer Science* 18(1), 2022;
3. any primary literature needed to verify the current status and complexity of BAPAL model checking, satisfiability, decidability, and finite-model methods.

The manuscript uses the existential Boolean-announcement modality as primitive:

\[
(M,w)\models\Diamond\varphi
\quad\Longleftrightarrow\quad
\exists\theta\in\mathcal L_{PL}\;
(M,w)\models\langle\theta\rangle\varphi.
\]

The app uses `^A` as ASCII input for that existential modality. Keep separate:

- the formal BAPAL language;
- the app’s ASCII syntax and display aliases;
- finite pointed-model checking;
- satisfiability or validity decision procedures.

Do not treat these as the same problem.

## Read the repository in this order

1. `AGENTS.md`
2. `README.md`
3. `index.html`
4. `css/app.css`
5. `lib/formula-parser.min.js` and any source or documentation for that parser
6. `js/MPL.js`
7. `js/app.js`
8. `API-Reference.md`
9. every file under `scripts/`
10. `BAPAL_VERIFICATION.md`
11. `reports/random-bapal-evaluation.html`
12. relevant Git history on `bapal-core`
13. the corresponding inherited files on the repository’s baseline branch and, where possible, the upstream Modal Logic / Epistemic Logic Playground sources

Identify which defects or limitations are inherited and which were introduced by the BAPAL extension.

## Part I — Extract the exact implemented specification

Before judging correctness, reconstruct the app’s actual specification.

Report precisely:

1. the accepted formula grammar;
2. operator precedence and associativity;
3. the semantics implemented for:
   - propositional atoms;
   - Boolean connectives;
   - `K{a}A`;
   - any multi-agent syntax such as `K{a,b,c}A`;
   - ordinary modal box/diamond syntax, if still accepted;
   - public announcement `[A]B`;
   - BAPAL `^A`;
4. the permitted atom and agent names;
5. the model representation and serialization format;
6. the meaning of S5 mode;
7. whether switching S5 mode on repairs an existing non-S5 relation or only changes later editing operations;
8. whether hidden self-loops exist in the semantic model;
9. how deleted worlds, copied models, nested announcements, and URL-loaded models are handled;
10. which features are merely visual and which affect semantic evaluation.

Flag every mismatch among:

- manuscript semantics;
- van Ditmarsch–French semantics;
- parser behavior;
- evaluator behavior;
- UI documentation;
- README/API documentation;
- tests.

Pay special attention to the distinction between the universal BAPAL box in the 2022 paper and the existential dual implemented as primitive in the manuscript and app.

## Part II — Line-by-line semantic and engineering audit

Audit `js/MPL.js` and all semantic call paths in `js/app.js`.

At minimum, check:

- parsing and pretty-printing round trips;
- malformed or ambiguous formula handling;
- precedence of `~`, `K`, announcements, `^`, `&`, `|`, `->`, and `<->`;
- nested public announcements;
- nested BAPAL operators;
- BAPAL inside announcement preconditions and announcement operators inside BAPAL scope;
- knowledge evaluation for multiple agents;
- treatment of worlds with no successors;
- vacuous truth in `[A]B`;
- restriction of every agent relation after announcements;
- removal of all incoming and outgoing edges to deleted worlds;
- preservation of S5 under model restriction;
- deep-copy correctness;
- null/deleted state indices;
- valuation-key construction;
- dependence on JavaScript object-key order;
- duplicate transitions;
- model-string parsing and round trips;
- one-character assumptions for atoms and agents;
- stale hidden variables when the visible variable count is reduced;
- formula atoms not represented in the UI;
- active-agent detection;
- all S5 editing operations, including mode switching, adding worlds, adding relations, deleting worlds, deleting relations, and L/R/B direction commands;
- URL encoding and report links;
- UI state versus semantic-model state.

Classify findings as:

- P0: semantic result can be wrong;
- P1: serious verification or model-integrity defect;
- P2: important limitation, ambiguity, or scalability problem;
- P3: presentation, maintainability, or minor UX issue.

Give exact file, function, and line references.

## Part III — Independent semantic verification

The existing tests call the same `MPL.truth` implementation they are intended to validate. They are regression tests, not an independent semantic oracle.

Construct a genuinely independent reference evaluator in a temporary audit location. Prefer Python or another implementation that does not import, translate, copy, or call `MPL.truth`. Derive it directly from the formal semantics in the supplied manuscript.

The oracle must independently implement:

- finite multi-agent Kripke models;
- Boolean connectives;
- S5 knowledge;
- public announcement restriction;
- existential BAPAL quantification over Boolean announcements.

For finite models, independently justify and implement the valuation-class method. Check the exact hypothesis under which every union of valuation classes is Boolean-definable. Determine whether the app’s finite set of visible atoms is a legitimate fixed vocabulary convention or an accidental weakening of the countably infinite BAPAL semantics.

### Differential verification

Compare the independent oracle with the JavaScript implementation on all worlds of every tested model.

Use two complementary methods.

#### A. Exhaustive bounded verification

Choose the largest tractable bounds and report them exactly. Aim initially for combinations such as:

- 1–4 worlds;
- 1–2 agents;
- 1–3 propositional atoms;
- all S5 relations represented as partitions/equivalence relations;
- formulas up to a stated syntactic size, including nested `K`, public announcements, and at least one or two levels of `^`.

Use isomorphism or canonicalization to reduce duplicate models if necessary.

Report:

- number of models;
- number of pointed models;
- number of formulas;
- number of model–world–formula evaluations;
- maximum formula size and BAPAL nesting depth;
- elapsed time;
- every mismatch.

For every mismatch, minimize it to the smallest model and formula and identify the defective code path.

#### B. Reproducible property-based/random verification

Generate larger reproducible cases, for example:

- up to 6–8 worlds;
- up to 3 agents;
- up to 5–8 atoms;
- formulas of size up to 12–20;
- nested PAL and BAPAL;
- both S5 models and arbitrary-relation stress tests.

S5 tests validate intended BAPAL semantics. Arbitrary-frame tests are only robustness tests unless a separate non-S5 semantics is explicitly specified.

Use fixed seeds and preserve failing seeds.

### Cross-check the BAPAL quantifier by two independent finite methods

Where tractable, compare:

1. enumeration of unions of propositional valuation classes;
2. explicit enumeration of Boolean truth sets or characteristic Boolean formulas over the finite active vocabulary.

These two methods must agree.

Also test semantic/metamorphic properties derived directly from the formal clauses, including:

- Boolean-equivalent announcements induce the same restricted model;
- worlds with the same complete propositional valuation cannot be separated by a Boolean announcement;
- announcement restriction preserves equivalence relations;
- `A -> ^A` via the truthful announcement of `top`, where the grammar supports the required abbreviation;
- expected behavior of `^top` and `^bottom`;
- duality between existential and universal arbitrary announcement operators if a universal display or abbreviation is present;
- invariance under renaming of atoms and agents where appropriate;
- serialization and deserialization preserve all truth values.

Do not label a formula valid merely because it passed sampled models.

## Part IV — Verification adequacy and scientific reliability

Assess whether the current test suite is sufficient for:

1. a teaching demonstration;
2. a dependable finite-model checker;
3. publication-supporting computational experiments;
4. a research-grade formal-verification service.

Examine test independence, coverage, reproducibility, failure minimization, continuous integration, browser/UI testing, and performance regression testing.

Recommend a concrete verification stack. Consider:

- unit tests;
- parser round-trip tests;
- model serialization tests;
- property-based testing;
- differential testing against the independent oracle;
- exhaustive bounded checks;
- browser end-to-end tests;
- mutation testing;
- GitHub Actions;
- benchmark baselines;
- versioned test corpora;
- machine-readable run manifests.

State what would be required before a paper could responsibly cite computational results produced by this tool.

## Part V — Complexity and performance audit

Measure or estimate the actual algorithmic cost of the current evaluator.

In particular, analyze:

- number \(k\) of distinct propositional valuation classes;
- the present enumeration of approximately \(2^{k-1}\) candidate announcement domains at a pointed world;
- repeated evaluation at multiple worlds;
- nested `^` operators;
- repeated model copying and restriction;
- repeated computation of valuation partitions;
- repeated truth evaluation of identical subproblems.

Benchmark representative families rather than only random examples. Include cases designed to maximize:

- distinct valuations;
- accessibility density;
- BAPAL nesting;
- announcement nesting;
- formula branching.

Report time and memory behavior and identify the first practical failure thresholds in the browser and in Node.

Evaluate, without prematurely implementing:

- bit-set model representations;
- cached valuation partitions;
- memoization keyed by formula, world, and restricted domain;
- structural hashing of formulas and submodels;
- dynamic programming;
- symbolic set representations;
- BDDs;
- SAT;
- SMT/Z3;
- Web Workers;
- WebAssembly;
- a Rust, TypeScript, or Python semantic core.

Do not assume that Z3 is automatically appropriate. Distinguish D3, which is used for visualization, from Z3, which is an SMT solver. Explain exactly which bounded or symbolic problem Z3 could encode, and what it cannot establish without a proven decision procedure.

## Part VI — Model checking versus satisfiability

This distinction is mandatory.

Determine, from current primary literature:

- the current status and known complexity of BAPAL model checking;
- the current status of BAPAL satisfiability and decidability;
- whether a finite-model property or complete bounded search method is known;
- whether any later work resolves claims deferred in the 2022 paper.

Cite primary sources and dates. If the literature is unsettled or no result is found, say so.

Explain why the current app is a finite pointed-model checker, not a satisfiability solver. Do not propose advertising it as a general BAPAL decision procedure unless the required theorem and algorithm are established.

## Part VII — Architecture options

Evaluate three architectures.

### Option A — Improved static teaching tool

- D3-based visualization;
- pure browser execution;
- Web Worker for expensive model checking;
- bounded model sizes;
- witness animation and explanation;
- import/export of models and formulas.

### Option B — Shared research core plus browser frontend

- a pure, UI-independent semantic library;
- typed AST and explicit model schema;
- CLI and batch mode;
- browser frontend using the same core, possibly through TypeScript or Rust/WASM;
- independent reference implementation retained for differential testing.

### Option C — Hosted research service

- frontend separated from backend;
- API for parsing, model checking, witness extraction, batch evaluation, and benchmarks;
- worker queue, timeouts, memory limits, cancellation, and deterministic seeds;
- optional persistence for models, jobs, results, and provenance;
- reproducible downloadable result bundles.

For each option, assess:

- mathematical reliability;
- implementation effort;
- performance;
- maintainability;
- deployment complexity;
- security;
- reproducibility;
- suitability for teaching;
- suitability for research.

Do not recommend a database merely because a backend is possible. State whether a database is needed for the semantic algorithm itself—it probably is not—or only for users, saved models, job histories, shared datasets, and provenance.

Give a clear recommendation. It may be staged, but identify the next architecture that should actually be built.

## Part VIII — Research-facing features

Evaluate and prioritize:

- explicit witness extraction: show a Boolean announcement or valuation-class union witnessing `^A`;
- animation of the selected announcement and restricted model;
- explanation traces for `K`, `[A]B`, and `^A`;
- counterexample worlds for false universal claims;
- batch JSON/CSV input and output;
- stable model/formula identifiers;
- reproducible seeds and run manifests;
- benchmark suites;
- model minimization;
- formula simplification;
- comparison of alternative evaluation algorithms;
- export suitable for papers and supplementary material;
- a machine-checkable API;
- possible mechanization of the semantics and evaluator correctness in Lean, Coq, Isabelle, or another proof assistant.

Distinguish useful near-term features from speculative long-term research.

## Required deliverables

Produce these Markdown files:

1. `01_BAPAL_FOUNDATIONAL_AUDIT.md`
2. `02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`
3. `03_BAPAL_ARCHITECTURE_AND_ROADMAP.md`

### File 1 must contain

- executive verdict;
- reconstructed implemented specification;
- semantic audit;
- parser/model/UI audit;
- severity-ranked defect register;
- exact file/function/line references;
- distinction between inherited and newly introduced issues.

### File 2 must contain

- independent oracle design;
- exact exhaustive bounds;
- exact tested counts;
- random seeds and test matrix;
- all mismatches and minimized counterexamples;
- performance measurements;
- a precise statement of what has and has not been verified.

### File 3 must contain

- literature-grounded model-checking/satisfiability distinction;
- architecture comparison;
- database/backend/Z3 assessment;
- recommended target architecture;
- staged roadmap with dependencies and acceptance criteria.

Use this roadmap structure:

- Stage 0: correctness freeze and independent oracle;
- Stage 1: pure semantic core and typed model/formula representations;
- Stage 2: witness extraction and explanation traces;
- Stage 3: performance engineering and benchmarks;
- Stage 4: browser worker/WASM or backend prototype, only if justified;
- Stage 5: research service, persistence, and formal mechanization, only if justified.

For every stage specify:

- exact purpose;
- files/components affected;
- prerequisites;
- tests;
- measurable acceptance criteria;
- risks;
- whether it changes semantics, UI, or architecture.

## Final verdict questions

Answer explicitly:

1. Is the current BAPAL evaluator semantically correct on the tested finite S5 models?
2. What remains unverified?
3. Is the current app adequate for teaching?
4. Is it adequate for research calculations?
5. What is the largest reliable problem size under the present implementation?
6. Is the valuation-class enumeration correct, and under exactly which vocabulary assumptions?
7. Should the next step be more frontend work, a pure semantic-core refactor, a Web Worker/WASM implementation, or a backend?
8. Is a database needed now?
9. Is Z3 useful, and for which precisely bounded task?
10. What should the next Codex implementation task be?

Do not give generic software advice. Ground every conclusion in the repository, executed verification, formal semantics, measured behavior, and primary literature.

Do not claim mathematical correctness from passing tests alone. Distinguish:

- proof from testing;
- independent differential evidence from self-tests;
- finite-model checking from satisfiability;
- teaching visualization from scientific computation.
