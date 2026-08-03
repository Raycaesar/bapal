# BAPAL Playground Foundational Audit

**Audit date:** 2026-08-03  
**Repository:** `Raycaesar/bapal`  
**Target branch:** `bapal-core`  
**Audited commit:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` (`refine inteface and add bicondition`)  
**Audit mode:** read-only; no tracked file was changed

## Executive verdict

The central finite-model idea in the BAPAL extension is mathematically appropriate: on a finite model, existential quantification over Boolean announcements can be reduced to enumeration of unions of complete propositional-valuation classes, provided the model represents a complete valuation over one common propositional vocabulary. Within the playground's effective single-character vocabulary and on the finite S5 models independently tested in the companion verification report, `MPL.truth` agreed with an independently written semantic oracle in every one of **6,501,302** model–world–formula evaluations. This is strong bounded differential evidence, not a proof of correctness.

The current application is nevertheless not ready to be treated as a dependable research calculator. One P0 defect makes public announcements and BAPAL wrong—or makes BAPAL throw—on multi-character atom names that the parser and API explicitly accept. The formula printer is not closed under parsing for knowledge operators in announcement preconditions. S5 mode is an editing aid, not a model invariant: enabling it does not repair an existing relation, and adding a world can break reflexivity for already active agents. URL/model parsing is unversioned and accepts malformed input by silently loading a prefix. Hidden or unsupported valuation keys can affect BAPAL while remaining invisible and unmentionable in the UI. The random report calls truth in one sampled model “satisfiable” and “globally true,” which is not satisfiability or validity.

Accordingly:

- **Teaching:** usable for small, deliberately constructed examples over `p`–`t` and `a`–`e`, if its bounded finite-model purpose and S5 caveats are made explicit. The P0/P1 defects should still be fixed before classroom reliance.
- **Finite-model checking:** the evaluator has strong independent evidence on the audited supported subset, but the application as a whole is not yet dependable because syntax, serialization, model integrity, and verification are not aligned.
- **Research calculations:** not adequate in its current form. It lacks an independent oracle in the repository, a typed/versioned input schema, CI, machine-readable run provenance, resource controls, and scientifically correct result labels.
- **Satisfiability/validity:** the application does neither. It evaluates formulas at worlds of one explicit finite model. Sampling models cannot establish satisfiability failure or validity.

No semantic mismatch was found for the intended one-character finite S5 subset. That negative result does not erase the concrete counterexamples outside the subset, does not prove all finite cases, and does not address BAPAL satisfiability.

## 1. Scope, evidence, and source hierarchy

### 1.1 Semantic specification used

The implementation was judged against, in this order:

1. the supplied `main.tex`, especially lines 88–110;
2. Hans van Ditmarsch and Tim French, [“Quantifying over Boolean Announcements”](https://doi.org/10.46298/lmcs-18(1:20)2022), *Logical Methods in Computer Science* 18(1), 2022;
3. the current primary-literature record discussed in the architecture report.

The manuscript declares a countably infinite propositional vocabulary and countably many agents (`main.tex:88-95`), S5 epistemic models (`main.tex:100-110`), and the existential operator as primitive:

\[
(M,w)\models\Diamond\varphi
\quad\Longleftrightarrow\quad
\exists\theta\in\mathcal L_{PL}\;(M,w)\models\langle\theta\rangle\varphi.
\]

The 2022 paper presents the **universal** Boolean-announcement box as primitive and defines the existential diamond as its dual. The manuscript and app instead take the existential diamond as primitive. These are equivalent at the semantic level under the stated duality; they are not the same concrete syntax or AST. The app's `^A`, Unicode `◇ᵝA`, and LaTeX `\Diamond_{\beta}A` all denote the existential operator. The ordinary modal `□` still accepted by the parser is a different, inherited accessibility-box operator.

The supplied manuscript also identifies a false pointwise signature-reduct claim and a gap in the 2022 paper's printed soundness argument (`main.tex:42,60-70,185-298`). It expressly says this refutes that argument, not the rules or soundness theorem. This software audit relies on the shared semantic clauses, not on the disputed proof step, and does not independently certify either paper's metatheory.

### 1.2 Repository and lineage inspected

Files were read in the requested order, including every script, the generated random report, and relevant history. The audited branch adds six commits over `origin/master`:

| Commit | Change relevant to this audit |
|---|---|
| `40e3b66` | Initial existential BAPAL parser/evaluator support |
| `d024ffa` | Sort valuation keys to eliminate JavaScript key-order dependence in BAPAL classes |
| `3ad1dcb` | Add a valuation-class diagnostic |
| `db102f1` | Add S5 editing mode and documentation |
| `9761583` | Expand regression scripts and S5 documentation |
| `92a4ba6` | Interface refinements and biconditional support |

`origin/master` is byte/history-aligned with the inspected `vezwork/modallogic` Epistemic Logic Playground baseline at `edfd9a6`; the older `rkirsling/modallogic` repository supplied the original modal playground. This comparison permits inherited defects to be separated from BAPAL-introduced defects below.

### 1.3 Executed evidence

- Existing Node checks were run from an isolated `git archive`, because `scripts/check-all.js` regenerates the tracked HTML report. All passed. `scripts/check-report-links.js` is not included by `check-all.js:5-12`, so it was run separately and also passed.
- Parser probes, model round trips, targeted counterexamples, S5 editing-state probes, and URL/report checks were executed.
- A Python semantic oracle that does not import, translate, copy, or call `MPL.truth` was constructed outside the repository. Exhaustive and seeded random differential results are in `02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`.
- Adversarial Node and live-browser performance families were measured. The deployed `js/MPL.js` and `js/app.js` had the same SHA-256 hashes as the audited branch.
- The worktree was checked clean after the audit.

## 2. Reconstructed implemented specification

This section describes what the program actually accepts and computes, not what its UI appears to promise.

### 2.1 Three distinct formula interfaces

There are three formula languages that currently differ:

1. **Formal BAPAL.** The manuscript grammar has atoms, Boolean connectives, individual `K_a`, existential PAL, and existential Boolean-announcement quantification. Models are S5. The Boolean quantifier ranges over all finite formulas in the countably infinite propositional vocabulary.
2. **Raw `MPL.Wff` syntax.** `js/MPL.js:18-36` configures `formula-parser` with inherited split delimiters for announcements and knowledge. Variables match `/^\w+/` in formula-parser 1.0.2 `dist/formula-parser.js:53-62`, so raw atoms are nonempty ASCII word strings: letters, digits, or underscore, including multi-character names and names beginning with digits. Leading/trailing and inter-token whitespace is ignored (`dist/formula-parser.js:22-25,207-217`).
3. **Browser input syntax.** Before parsing, `js/app.js:194-199,281-286` removes every comma and replaces every `[` by `[(` and every `]` by `)]`. It then rejects atoms outside `p,q,r,s,t` and treats each character between `K{...}` as an agent, rejecting characters outside `a,b,c,d,e` (`js/app.js:219-241,306-328`). Thus `K{a,b,c}p` is accepted by the UI only because commas are erased to produce `K{abc}p`; the raw API rejects the comma form.

The implementation has no tokens for `top` or `bottom`. Tautology and contradiction must be written, for example, as `(p | ~p)` and `(p & ~p)`.

### 2.2 Accepted raw grammar

A useful abstraction of the configured raw grammar is:

```text
atom       ::= /[A-Za-z0-9_]+/
formula    ::= atom
             | "(" formula ")"
             | "~" formula
             | "□" formula
             | "<>" formula
             | "^" formula
             | "[" formula "]" formula
             | "K{" atom "}" formula
             | formula "&" formula
             | formula "|" formula
             | formula "->" formula
             | formula "<->" formula
```

This is an abstraction because `[`/`]` and `K{`/`}` are implemented as unary/binary operator pairs, not dedicated grammar productions (`js/MPL.js:18-33`; formula-parser `dist/formula-parser.js:96-174`). That implementation detail causes the round-trip failure described under P1-01.

Raw parser details:

- `□A` is accepted; the documented ASCII `[]A` is not.
- `<>A` is accepted.
- `^A` is accepted and means existential BAPAL.
- There is no input form for the manuscript's existential PAL diamond `⟨A⟩B`. The app exposes its universal dual `[A]B`; `<>A` is ordinary inherited modal possibility, not an announcement diamond.
- `K{abc}A` is syntactically one word in the AST but semantically the conjunction `K_a A ∧ K_b A ∧ K_c A`.
- `[p]q` parses raw, but `[K{a}p]q` does not. `[(K{a}p)]q` parses; the browser inserts those parentheses automatically.
- Any full-language formula can be a PAL precondition, including one containing `K`, PAL, or `^`. The Boolean restriction applies only to the formula existentially quantified *by* `^`; it does not syntactically restrict the scope of `^`.

### 2.3 Precedence and associativity

The configured levels are exact (`js/MPL.js:18-33`):

| Level | Operators | Implementation associativity/binding |
|---:|---|---|
| 6 | `~`, literal `□`, `<>`, `^` | Prefix; binds tighter than Boolean binaries |
| 5 | `[` ... `]` | Delimiter pair; `]` is right-associative |
| 4 | `K{` ... `}` | Delimiter pair; `}` is right-associative |
| 3 | `&` | Right-associative |
| 2 | `|` | Right-associative |
| 1 | `->` | Right-associative |
| 0 | `<->` | Right-associative |

Executed parses confirmed:

| Input | Implemented grouping |
|---|---|
| `~p&q` | `(~p) & q` |
| `p&q|r` | `(p & q) | r` |
| `p|q&r` | `p | (q & r)` |
| `p->q->r` | `p -> (q -> r)` |
| `p<->q<->r` | `p <-> (q <-> r)` |
| `^p&q` | `(^p) & q` |
| `K{a}p&q` | `(K{a}p) & q` |
| `[p]q&r` | `([p]q) & r` |

All binary Boolean connectives being right-associative is legal but insufficiently documented. The pretty-printer parenthesizes Boolean binaries, so their printed output is unambiguous.

### 2.4 AST and display aliases

`MPL.Wff` stores an object AST. Relevant nodes are:

| Construct | AST shape |
|---|---|
| atom `p` | `{prop: "p"}` |
| `~A` | `{neg: A}` |
| `A & B` | `{conj: [A,B]}` (similarly `disj`, `impl`, `equi`) |
| `K{a}A` | `{kno_start: {kno_end: [{prop:"a"}, A]}}` |
| `[A]B` | `{annce_start: {annce_end: [A,B]}}` |
| `^A` | `{bapal: A}` |
| ordinary box/diamond | `{nec:A}` / `{poss:A}` |

`_jsonToASCII` is at `js/MPL.js:52-89`; display conversion is at `js/MPL.js:95-124`. `^` becomes `\Diamond_{\beta}{}` in LaTeX and `◇ᵝ` in Unicode. No universal BAPAL token or AST node exists. Consequently, `□A` must not be described as the universal Boolean-announcement dual; it is the inherited ordinary modal box.

### 2.5 Implemented truth conditions

The evaluator is `js/MPL.js:_truth`, lines 515–578.

| Form | Actual condition at `(M,w)` | Audit result |
|---|---|---|
| atom `p` | key `p` is truthy in `w.assignment`; absence means false (`281-285,516-517`) | Standard for the stored valuation convention |
| `~A` | Boolean negation (`518-519`) | Standard |
| `A&B`, `A|B`, `A->B`, `A<->B` | short-circuit JavaScript Boolean clauses (`537-544`) | Standard truth functions |
| `K{a}A` | every stored outgoing edge labelled `a` reaches an `A`-world (`520-524`) | Standard Kripke box; vacuously true with no `a`-successor |
| `K{abc}A` | the preceding condition holds separately for every character `a,b,c` | Conjunction of individual knowledge, **not** distributed, common, or group knowledge |
| `□A` | every outgoing edge of every label reaches an `A`-world (`545-546`) | Inherited all-edge box; not an indexed epistemic operator and not BAPAL's universal box |
| `<>A` | some outgoing edge of any label reaches an `A`-world (`547-548`) | Inherited all-edge diamond |
| `[A]B` | if `A` is false at `w`, true; otherwise evaluate `B` at `w` after restricting the model to worlds satisfying `A` in the original model (`525-536`) | Correct PAL box clause on serializable models |
| `^A` | enumerate every union of current valuation classes that contains `w`'s class; restrict to it; return true if `A` holds at `w` in one restriction (`549-575`) | Correct finite valuation-class method under the hypotheses in Report 2; implementation is eager/exponential |

Knowledge with no successor is vacuously true because `.every` over an empty array is true. That is correct on arbitrary Kripke frames, but an S5 world should at least access itself. The default and some UI-generated models do not enforce that.

For PAL, the precondition is re-evaluated at every live world in the **original** model (`js/MPL.js:526,528-530`), then every false world is removed from a deep copy. `removeState` nulls the world and removes all incoming edges regardless of agent (`js/MPL.js:254-262`); outgoing edges disappear with the nulled source. Thus all agents' relations and valuations are restricted. If the input relations are equivalence relations, restriction preserves equivalence. Nested announcements use the already restricted copy and behaved correctly in independent tests on the supported subset.

For `^`, `_valuationKey` sorts all true assignment keys (`js/MPL.js:511-513`). This fixes the earlier object-key-order defect: `{p:true,q:true}` and `{q:true,p:true}` are the same class. It does **not** use the UI's visible-variable count. The power set is built eagerly at `js/MPL.js:563-564`, then candidates not containing the current class are discarded, and a full serialized copy is made per attempted candidate (`566-573`). Nested `^`, PAL within `^`, `^` within PAL preconditions, and announcements in a `^` scope are all recursively supported.

### 2.6 Model representation

`MPL.Model` stores an array whose index is the world identifier (`js/MPL.js:172-179`):

```text
state := null
       | {
           assignment: { atomName: true, ... },
           successors: [{ target: integerWorldIndex, agent: agentName }, ...]
         }
```

Only true atoms are stored (`addState`, `editState`, lines 227–249). Missing atoms are false. Deleted worlds remain as `null`, preserving later world indices (`254-275`). Duplicate `(source,target,agent)` transitions are suppressed (`184-193`). `removeTransition` removes every matching duplicate and, when an agent is supplied, only that agent's edge (`198-209`). This is a BAPAL-branch repair of an inherited path that previously could leave another agent's incoming edge when a world was removed.

### 2.7 Compact serialization and URL loading

The compact model-string format is implemented at `js/MPL.js:298-372`:

```text
model       ::= slot (";" slot)*
slot        ::= ""                          # deleted/null index
              | "A" trueAtomChars "S" transition*
transition  ::= decimalTarget oneAgentChar ","
```

Example: `AqS0a,2b;;AS` has a live world 0 where `q` is true, a null index 1, and a live empty-valuation world 2. World 0 has an `a` edge to 0 and a `b` edge to 2.

The format has no escaping, delimiters between atom names, schema version, declared vocabulary, declared agent set, S5 flag, validation checksum, or error result. Serialization concatenates `Object.keys(assignment)` in insertion order (`312-322`). Deserialization reads that substring one character at a time and treats the final character of each transition token as its agent (`328-360`). Multi-digit target indices work. Multi-character atoms and agents do not round-trip. On a malformed state fragment, loading simply `break`s and retains the valid prefix (`338-342`), after having cleared the old model (`328-330`).

`deepCopy` is not a structural copy: it serializes and parses this format (`js/MPL.js:495-500`). PAL and BAPAL therefore inherit every format limitation. For supported one-character names, copies preserve null indices, valuations, and transitions. For multi-character names, they do not.

The browser reads standard `model` and `formula` query parameters with `URLSearchParams` and supports one legacy delimiter (`js/app.js:34-46`). It writes encoded query parameters on every state modification (`760-769`), and generated report links use `encodeURIComponent` correctly (`scripts/random-bapal-evaluation.js:244-245`; `scripts/check-report-links.js:6-25`). Formula query values are immediately evaluated (`js/app.js:1204-1211`). Model query input inherits the silent partial-load behavior above.

### 2.8 Meaning and limits of S5 mode

Formal BAPAL in the supplied specification is interpreted on S5 models. The app's S5 switch does **not** change the truth clauses and does not tag a model as S5. It only changes later editor operations (`BAPAL_VERIFICATION.md:29-35`; `js/app.js:451-484,940-952,1008-1090`).

Exact behavior:

- Switching S5 mode on merely sets `s5ModeEnabled` and updates the UI (`js/app.js:setS5Mode`, 455–459). It does **not** inspect, reject, or repair existing relations.
- Dragging a relation in S5 mode stores both directions and invokes `Model.closeEquivalenceClass` on the component containing the endpoints (`js/app.js:addRelationForCurrentMode`, 940–952).
- `closeEquivalenceClass` treats either-direction edges as component membership, adds a self-loop for the specified agent at **every live world**, and fully connects only the seeded component (`js/MPL.js:452-490`). A separate malformed nontrivial component can remain non-symmetric or non-transitive.
- Adding a new world in S5 mode adds a self-loop only for the currently selected agent (`js/app.js:809-823`). If another agent was already active, that other relation becomes non-reflexive on the enlarged domain.
- Pressing `R` on a selected world in S5 mode stores the current agent's loop, adds that agent's loops at all worlds, and closes the selected component (`js/app.js:1063-1071`).
- Delete/L/R/B edits of a selected relation are ignored in S5 mode (`js/app.js:480-484,1008-1090`), while deleting a world is allowed. Restricting an actual equivalence relation by world deletion preserves S5.

There are no implicit semantic self-loops. A loop affects `K` only if it exists in `MPL.Model`. Some S5 editing paths store loops and remove their D3 link objects to avoid clutter (`js/app.js:928-938`); `MPL.truth` reads only the stored model. A loop hidden from the graph is semantically real. A loop absent from the model is not “assumed.”

The default string `;AS0a,` creates a null world 0 and a live world 1 whose attempted edge to deleted world 0 is removed during loading (`js/app.js:31-46`; `js/MPL.js:366-370`). The resulting default has one live world and no relation. It is not S5 for any named agent; `K{a}A` is vacuously true there.

### 2.9 UI state versus semantic state

The semantic source of truth is `MPL.Model`. D3 nodes, links, labels, checkboxes, and selection are projections or controls.

| Feature | Visual only | Semantic effect |
|---|:---:|---:|
| Node position, selection highlight, arrow curvature/colors | Yes | No |
| Visible proposition count | Yes | No; it hides rows/labels only (`setVarCount`, `js/app.js:486-504`) |
| Proposition toggle on a world | No | Writes `model.editState` (`506-512`) |
| Visible arrows | Usually projection | Stored transitions determine truth; S5 self-loops can be hidden |
| Reflexive/symmetric/transitive checkboxes | Report only | They inspect edge-active agents (`760-797`) |
| S5 toggle | Editing policy | Does not change evaluator or repair model |
| Evaluate button colors | Result display | Calls `MPL.truth` at every D3 node synchronously (`331-345`) |
| “Announce formula” action | No | Destructively removes false worlds from the actual model (`194-263`) |

`css/app.css` is presentation-only: the S5 switch rules (`85-141`), agent colors (`234-253`), hidden-link rule (`267-269`), and truth-state styling do not read or mutate `MPL.Model`. In particular, `path.link.hidden` changes stroke width, not accessibility.

Lowering the visible variable count does not delete `r`, `s`, or `t`. An invisible true value continues to affect atom truth and valuation classes. URL-loaded keys outside `p`–`t` remain in `MPL.Model` and affect BAPAL, but are ignored when D3 node valuations are built (`js/app.js:54-72`) and cannot be mentioned in a formula because UI validation rejects them. This is a semantic/UI split, not a cosmetic detail.

The “active agent” set is derived only from labels on stored edges (`js/MPL.js:421-430`). An agent mentioned in a formula but with no edges is absent from the S5 check display, and its knowledge modality is vacuously true. Therefore a green-looking model or “No agents in use” message is not certification that the formal model is S5 for all agents in the language.

## 3. Semantic and engineering audit by concern

### 3.1 Parsing, printing, and malformed formulas

The ordinary Boolean printer wraps every binary in parentheses, and the independent bounded run found no round-trip failures for atoms, Booleans, `K`, `^`, ordinary modal operators, or PAL with purely propositional preconditions. It did find **24 configuration/formula round-trip failures**, all instances of the same grammar defect: an announcement precondition whose root is knowledge. For example:

```text
input:    [(K{a}p)]q
printed:  [K{a}p]q
reparse:  SyntaxError: Invalid JSON for formula!
```

The browser masks this by re-inserting parentheses, but `Wff.ascii()` is an advertised raw-API representation. The printer at `js/MPL.js:76-83` must produce syntax accepted by the constructor at `43-45,130-165`; it currently does not.

Malformed formulas are caught by the UI and reported generically (`js/app.js:294-303`). The parser does reject trailing junk and unmatched parentheses. However, the browser's unconditional bracket rewrite is not a parser specification and creates a divergence from raw API behavior. Commas are erased globally rather than parsed as agent separators.

### 3.2 Multi-character identifiers: minimized P0 counterexample

The raw parser and `API-Reference.md:17-21` accept `foo`. The model can store `{foo:true}`, and the atomic formula `foo` is true. But the compact copier writes `AfooS` and reloads it as `{f:true,o:true}`. The smallest direct consequences are:

```text
model:       one world, assignment {foo:true}
formula:     [(p | ~p)]foo
expected:    true
actual:      false

formula:     ^foo
expected:    true   (truthful top announcement witnesses it)
actual:      throws "State 0 not found!"
```

For `^foo`, the original current valuation key is `foo`; after copying it is `f,o`, so the candidate-domain filter removes the current world and the recursive atomic lookup throws. The defective path is parser variable acceptance (`formula-parser dist/formula-parser.js:53-62`) → assignment/model serialization (`js/MPL.js:227-249,312-360`) → `deepCopy` (`495-500`) → PAL/BAPAL (`525-575`). This is a semantic P0, not merely a URL-format issue.

### 3.3 Knowledge and multiple agents

`K{abc}A` is an app-specific shorthand for all three individual agents knowing the same `A`. It is not in the manuscript grammar and should be documented as a surface abbreviation. Executed probes confirmed separate relation filtering and vacuity: with an `a` edge to a false world and a `b` edge only to a true world, `K{a}p` is false, `K{b}p` true, `K{ab}p` false, and `K{c}p` true if there is no `c` edge.

No group, distributed, or common knowledge semantics is implemented. Agent identifiers are semantically split into characters (`js/MPL.js:520-524`), while raw model transitions can temporarily carry longer strings and serialization retains only their last character. The actual dependable convention is therefore one-character agents.

### 3.4 PAL restriction and deleted indices

Within the one-character format, PAL restriction is implemented correctly:

- false preconditions make `[A]B` vacuously true;
- the precondition truth set is computed in the source model;
- all incoming and outgoing edges of all labels touching removed worlds disappear;
- surviving world indices remain stable through `null` slots;
- S5 is preserved when the source model really is S5;
- nested PAL and PAL/BAPAL combinations agreed with the independent oracle.

`MPL.truth` rejects a deleted pointed index with an exception (`js/MPL.js:583-588`). Internal BAPAL checks a deleted current state and returns false (`549-553`), but malformed copy/valuation interaction can still reach an atomic lookup and throw. Public callers therefore receive exceptions rather than a typed invalid-point result.

### 3.5 Valuation keys and vocabulary

The current `_valuationKey` sorts all true keys, so it is independent of insertion order (`js/MPL.js:511-513`; regression at `scripts/check-bapal-valuation-class.js:19-40`). The earlier object-order defect was correctly fixed in `d024ffa`.

The class computation is not based on:

- atoms occurring in the formula;
- atoms currently visible in the UI;
- only `p,q` or the selected variable-count button.

It is based on every true key found in each stored assignment, with every absent atom understood as false. That convention can faithfully represent a finite-support restriction of a countably infinite valuation: atoms not present anywhere are uniformly false and cannot distinguish worlds. It becomes unsound whenever serialization loses names, UI import hides relevant keys, or callers do not share the same absence-means-false convention. The exact mathematical justification is in Report 2.

`BAPAL_VERIFICATION.md:15-21` states the right conclusion but gives an incomplete construction: a “conjunction corresponding to the valuation” could be infinite over countably many atoms. The correct finite construction selects one separating atom for each included/excluded pair of the finitely many valuation classes, then forms finite characteristic formulas over that finite separator set.

### 3.6 S5 editing operation matrix

| Operation | Actual effect | Integrity judgment |
|---|---|---|
| Turn S5 on | Set flag only | Does not repair or validate; model may remain non-S5 |
| Add first relation for agent | Add both directions; add all loops; close endpoint component | Produces S5 for the component and reflexivity globally if no malformed other component |
| Merge two valid classes | Fully connects merged component | Correct |
| Add world | Add current-agent self-loop only | Breaks reflexivity for every other previously active agent |
| Press `R` on world | Add current-agent loops globally; close selected component | Can repair reflexivity for that agent, but not a separate malformed component |
| Delete world | Restrict relation | Preserves S5 if relation was S5 |
| Delete selected edge | Ignored while S5 on | Protects a valid class |
| `L`/`R`/`B` on selected edge | Ignored while S5 on | Protects a valid class |
| Switch off then damage, switch on | Damage persists | S5 label is not an invariant |
| Load non-S5 URL while toggle later on | Non-S5 data persists | No import validation/normalization |

The tests cover valid class merging, stored loops, guarded edge edits, and world restriction (`scripts/check-s5-closure.js:33-130`). They do not exercise toggle repair, new-world behavior with multiple active agents, arbitrary malformed components, or browser event sequences.

### 3.7 Existing verification and random report

The regression scripts directly import the production `MPL.js` and use `MPL.truth` as the expected-result engine (`scripts/check-bapal-regression.js:8-24`; `check-logic-regressions.js:8-30`; `random-bapal-evaluation.js:7-18,204-219`). They are useful regression tests, not an independent semantic oracle.

Additional limitations:

- There is no `package.json`, test runner manifest, dependency lock, CI workflow, browser end-to-end suite, coverage report, mutation test, benchmark regression, or versioned oracle corpus.
- `check-all.js:5-12` omits `check-report-links.js` and rewrites a tracked report through the two random commands.
- Several checks duplicate the same small examples.
- The random generator is fixed at five worlds, two agents, four atoms, ten formulas, and length at most ten (`random-bapal-evaluation.js:19-24`). It always places one outer `^`, does not generate PAL, and its length walker has no PAL case (`138-180`).
- Arbitrary-frame runs are robustness checks, not validation against the manuscript's S5 model class.
- `evaluateFormulas` labels “true at some world of this generated model” as `satisfiable` and “true at every world of this generated model” as `globallyTrue` (`204-219,269-334`). Those columns and console labels (`361-369`) are not logical satisfiability or global validity. They must be renamed to `trueSomewhereInThisModel` and `trueAtEveryWorldInThisModel`, or equivalent.
- `reports/random-bapal-evaluation.html` contains results generated by production code only and has no environment, commit, code hash, runtime version, duration, or resource-limit manifest.

The caveat in `BAPAL_VERIFICATION.md:87-105` correctly says the tests are not a mathematical proof. The rest of the verification stack does not yet operationalize that caution.

## 4. Severity-ranked defect register

Severity meanings are those requested: P0 wrong semantic result; P1 serious verification or model-integrity defect; P2 important limitation, ambiguity, or scalability problem; P3 presentation, maintainability, or minor UX issue.

### P0

| ID | Finding and consequence | Exact reference | Origin |
|---|---|---|---|
| P0-01 | Multi-character atoms are accepted by parser/API but flattened into characters by model copying. PAL can return a wrong Boolean result and `^` can delete its pointed world and throw. Minimized model `{foo:true}`: `[p|~p]foo` is false instead of true; `^foo` throws instead of true. | formula-parser 1.0.2 `dist/formula-parser.js:_parseVariable`, 53–62; `API-Reference.md:17-21`; `js/MPL.js:getStateString/loadFromModelString`, 312–372; `deepCopy`, 495–500; `_truth` PAL/BAPAL, 525–575 | Serializer/copy limitation inherited; BAPAL adds a new crashing path and exposes it through valuation keys |

### P1

| ID | Finding and consequence | Exact reference | Origin |
|---|---|---|---|
| P1-01 | `Wff.ascii()` is not parse-round-trip safe for a knowledge-rooted announcement precondition: `[(K{a}p)]q` prints `[K{a}p]q`, which raw `MPL.Wff` rejects. API consumers and serialized formulas can fail. | `js/MPL.js:_jsonToASCII`, 52–89; split operator setup, 18–33; formula-parser `_parseUnarySubformula/_parseBinarySubformula`, 96–134 | Split-delimiter design inherited from epistemic PAL; printer rewritten/retained on BAPAL branch without closure test |
| P1-02 | Adding a world in S5 mode adds only the current agent's loop, breaking reflexivity for every other active agent on the enlarged domain. | `js/app.js:mousedown`, 809–823; S5 definition in `main.tex:100-110` | Introduced with S5 mode |
| P1-03 | Enabling S5 mode does not validate or repair the existing model. `closeEquivalenceClass` repairs only the seeded nontrivial component, so a disjoint malformed component can remain non-S5 while the switch says “On.” | `js/app.js:setS5Mode`, 455–459; `addRelationForCurrentMode`, 940–952; `js/MPL.js:closeEquivalenceClass`, 452–490 | Introduced with S5 mode |
| P1-04 | Malformed model strings clear the old model, silently stop at the first malformed state, and retain a partial prefix. A shared URL can therefore mean a different model without an error. | `js/MPL.js:loadFromModelString`, 328–372, especially 338–342; `js/app.js:34-46` | Inherited compact loader |
| P1-05 | Hidden/stale/unsupported valuation keys remain semantically active. Reducing visible variables is cosmetic; unknown URL atoms affect BAPAL classes but are invisible and rejected in formulas. Users cannot audit the model actually evaluated. | `js/app.js:54-72,219-241,486-504`; `js/MPL.js:_valuationKey`, 511–513 | Visible-count behavior inherited; BAPAL makes hidden keys change quantified domains |
| P1-06 | The generated report mislabels within-one-model truth as “satisfiable” and “globally true,” inviting invalid scientific conclusions. | `scripts/random-bapal-evaluation.js:evaluateFormulas`, 204–219; report table, 269–334; console, 361–369; generated report | Introduced by BAPAL report |
| P1-07 | Claimed semantic verification is not independent and has no automated reproducible gate. All repository checks call production `MPL.truth`; no CI or oracle exists. | `scripts/check-*.js` production imports/calls; `check-all.js:5-34`; `BAPAL_VERIFICATION.md:87-105` | Verification expansion introduced on BAPAL branch; absence of CI inherited |

### P2

| ID | Finding and consequence | Exact reference | Origin |
|---|---|---|---|
| P2-01 | Browser and raw API grammars differ: commas and PAL parentheses are preprocessed only by `app.js`. Examples accepted in the UI are invalid in `MPL.Wff`. | `js/app.js:194-199,281-286`; `index.html:342-353` | PAL preprocessing inherited; multi-agent shorthand documented on BAPAL branch |
| P2-02 | Formal vocabulary, raw parser vocabulary, UI vocabulary, and serializer vocabulary are four different sets. The formal language is countably infinite; raw atoms are `\w+`; UI atoms are `p`–`t`; dependable serialization is one character. Agents have the analogous mismatch. | `main.tex:88-95`; formula-parser 53–62; `js/app.js:18-23,219-241`; `js/MPL.js:312-360,520-524` | Mixed lineage; not resolved by extension |
| P2-03 | Inherited ordinary `□`/`<>` aggregate edges across every agent and are not documented in current UI. API claims `[]A`, which the parser rejects. `□` risks confusion with the paper's universal BAPAL box. | `js/MPL.js:18-24,545-548`; `API-Reference.md:24-36` | Inherited/stale API |
| P2-04 | “Active agents” means agents occurring on at least one edge. S5 indicators ignore agents named only in formulas, and edge-free `K` is vacuous. | `js/MPL.js:getActiveAgents`, 421–430; `js/app.js:onStateModified`, 775–796; `_truth`, 520–524 | Inherited relation model; S5 display added later |
| P2-05 | Default and arbitrary-mode models need not be S5, even though formal BAPAL is specified over S5. Nothing prevents evaluating `^` on arbitrary frames. | `js/app.js:23,31-46,451-459`; `js/MPL.js:_truth`, 549–575 | Arbitrary-frame editor inherited; S5 mode optional by design |
| P2-06 | BAPAL eagerly materializes the full power set before filtering and copies/restricts a model per candidate. Runtime, allocation, and main-thread blocking grow exponentially; nested `^` grows faster. | `js/MPL.js:563-573`; `js/app.js:331-345` | Introduced by BAPAL evaluator |
| P2-07 | Compact models have no version, schema, declared vocabulary/agents, frame-class assertion, escaping, or validation result. This prevents stable research identifiers and safe evolution. | `js/MPL.js:288-372`; `API-Reference.md:182-199` | Inherited format, now carrying multi-agent/BAPAL experiments |
| P2-08 | Random tests omit PAL, mostly force a single outer BAPAL, use small fixed dimensions, and do not minimize failures. | `scripts/random-bapal-evaluation.js:19-24,138-202` | Introduced with BAPAL report |
| P2-09 | Evaluation is synchronous at every displayed world; there is no cancellation, timeout, worker, progress indicator, or resource bound. | `js/app.js:evaluateFormula`, 281–367 | Inherited synchronous UI; severity amplified by BAPAL |
| P2-10 | Every PAL/BAPAL update copies via an unvalidated text protocol rather than a structural model operation. Even after identifier repair, this couples semantics to URL serialization and repeats work. | `js/MPL.js:495-500,525-575` | Inherited PAL design; BAPAL magnifies it |

### P3

| ID | Finding and consequence | Exact reference | Origin |
|---|---|---|---|
| P3-01 | Page title and repository/issues links still identify the inherited project rather than the BAPAL branch. | `index.html:5,12-13,368-380`; `README.md:1-13` | Inherited/stale |
| P3-02 | API reference omits agents, knowledge, PAL, BAPAL, S5 helpers, and the current transition record shape; several examples use obsolete agentless edges/model strings. | `API-Reference.md:87-213` | Inherited documentation not updated |
| P3-03 | `getWffAgentsAndProps` attempts object deduplication with `indexOf` on newly allocated objects, so duplicates remain. Current callers tolerate it but do repeated validation work. | `js/app.js:getWffAgentsAndProps`, 373–407 | Introduced/modified on branch |
| P3-04 | Tests contain substantial duplicate cases and inconsistent suite inclusion, increasing maintenance without equivalent independent coverage. | `check-bapal-regression.js`, `check-logic-regressions.js`, `check-all.js:5-12` | Introduced on BAPAL branch |
| P3-05 | Naming/comments still describe “MPL,” generic modal logic, and mixed-language implementation notes, obscuring the actual semantic contract. | `js/MPL.js:1-9,551`; `js/app.js:1-8`; `BAPAL_VERIFICATION.md` | Mixed inherited/new |

## 5. Required mismatch register

| Compared layers | Mismatch |
|---|---|
| Manuscript vs 2022 paper | Manuscript uses existential `Diamond` as primitive; paper uses universal Boolean-announcement box as primitive. They are dual, but UI symbols must not collapse them. |
| Formal PAL syntax vs app | The manuscript takes existential `⟨A⟩B` as primitive and defines `[A]B` by duality; the app accepts only `[A]B`. Inherited `<>A` is ordinary modal possibility, not PAL. |
| Formal language vs app | Formal countably many atoms/agents and individual `K_a`; UI exposes five atoms and five agents plus a finite-character multi-agent shorthand. |
| Formal frame class vs app | Formal models are S5; app evaluates arbitrary relations and defaults to a non-S5 model. S5 is an optional future-edit policy. |
| Parser vs serializer | Parser/API accept multi-character atoms; model serialization/copy does not. |
| Parser vs pretty-printer | Knowledge-rooted PAL preconditions need protective parentheses on raw reparse; printer removes them. |
| Raw parser vs browser | Browser strips commas and inserts announcement parentheses; raw constructor does neither. |
| Parser vs API docs | Parser accepts literal `□`, not documented `[]`; API omits all epistemic/dynamic/BAPAL constructs. |
| UI visibility vs evaluator | Visible variable count is not semantic; hidden/unknown keys alter valuations and BAPAL classes. |
| UI S5 label vs model | Toggle on does not imply current model is S5; a subsequent new-world operation can break another agent's S5 relation. |
| Tests vs correctness claim | Repository tests call the same evaluator under test; they provide regression evidence, not an independent oracle or proof. |
| Random report vs logic terminology | “Satisfiable”/“globally true” mean only some/all worlds of one sampled model. |
| `BAPAL_VERIFICATION.md` vs exact theorem | It asserts valuation-class definability with a potentially infinite “complete valuation” conjunction; a finite separator argument is required. |

## 6. Inherited versus BAPAL-introduced findings

### Inherited foundations and defects

- formula-parser 1.0.2's generic word-token grammar and precedence-climbing machinery;
- the split-operator encoding of `K{...}` and `[... ]`, plus browser bracket preprocessing;
- object-of-true-atoms valuations, null deleted indices, compact model strings, and deep copy through serialization;
- ordinary modal `□`/`<>`, all-edge semantics, synchronous D3 UI, visual variable count, stale title/links/API;
- arbitrary-relation editing and vacuous box behavior;
- the lack of a versioned schema, dependency manifest, CI, browser tests, or independent oracle.

### Introduced or materially amplified by the BAPAL extension

- `^` parsing/display and valuation-class enumeration;
- the initial object-key-order risk, correctly fixed by sorted keys in `d024ffa`;
- P0-01's BAPAL crash path: the old serializer defect becomes semantically fatal under quantification;
- optional S5 construction mode and its new-world/toggle/component defects;
- BAPAL regression/random-report infrastructure, including the misleading satisfiability/validity labels;
- exponential eager power-set work on the browser main thread;
- the stronger need for hidden-valuation transparency because every stored atom can split an announcement class.

### Improvements on the branch

- duplicate transitions are suppressed (`js/MPL.js:184-193`);
- `removeTransition` scans backward and can remove all matching agent-labelled edges (`198-209`), so PAL/world deletion now removes every incoming agent edge;
- valuation keys are sorted, eliminating dependence of BAPAL equivalence classes on JavaScript insertion order (`511-513`);
- URL report links use standard encoded query parameters and have a dedicated check;
- S5 class merging, stored loops, relation-edit guards, and restriction under world deletion have useful regression coverage;
- documentation explicitly acknowledges that regression tests are not a mathematical proof (`BAPAL_VERIFICATION.md:87-105`).

## 7. Direct answers supported by this audit

1. **Is the current BAPAL evaluator semantically correct on the tested finite S5 models?** Yes, within the tested single-character atom/agent convention: all 6,501,302 independent differential evaluations agreed. This is bounded empirical evidence. The unrestricted API is not semantically correct because P0-01 is a concrete counterexample.
2. **What remains unverified?** All larger/unbounded formulas and models; many deeper PAL/BAPAL alternations; all browser event sequences; malformed inputs beyond targeted probes; numerical/runtime portability; correctness outside the one-character serialization convention; and any theorem connecting the implementation to all finite models. Satisfiability, validity, axiomatic soundness/completeness, and the open decidability question are outside what was tested.
3. **Is it adequate for teaching?** Conditionally, for small curated models with explicit warnings and after priority fixes. It is a useful visualization, not currently a “trust without checking” calculator.
4. **Is it adequate for research calculations?** No. See Report 2 for verification requirements and Report 3 for the target architecture.
5. **What is the largest reliable problem size?** There is no sound world-count-only answer; the controlling quantity is the number `k` of distinct valuation classes plus formula shape and edge density. Current browser responsiveness is reasonable around `k≤10` for nontrivial nested `^` and around `k≤12` for one worst-case depth-1 `^`; `k=13` already took about 11.2 seconds wall time and `k=14` blocked the browser protocol beyond 20 seconds. These are practical, hardware-specific thresholds, not semantic bounds.
6. **Is valuation-class enumeration correct?** Yes for finite explicit models when assignments give complete valuations over one common vocabulary, absence uniformly means false, and class identities/copies preserve every atom name. The app violates the last condition for multi-character atoms and can hide relevant keys in the UI.
7. **What should be built next?** A pure, UI-independent typed semantic core with structural restriction/copying and the independent oracle retained as a separate implementation—not more frontend features, WASM, or a backend first.
8. **Is a database needed now?** No. It is irrelevant to the semantic algorithm. Persistence is only later useful for users, jobs, shared corpora, and provenance.
9. **Is Z3 useful?** Potentially for a precisely bounded fixed-model/domain-selection encoding or as an additional cross-check. It cannot establish general BAPAL satisfiability decidability, a finite-model property, or implementation correctness.
10. **What should the next Codex implementation task be?** Stage 0 from Report 3: introduce a frozen semantic conformance corpus and independent-oracle CI; specify a versioned AST/model schema; fix P0-01, P1-01, S5 invariant handling, partial-load rejection, hidden-valuation disclosure, and report terminology before any feature work.

## 8. Bottom line

The BAPAL evaluator's core finite valuation-class clause is substantially better than its current verification story suggests: the independent bounded evidence is strong and no supported-subset semantic mismatch was found. The surrounding application contract is substantially weaker than the green regression output suggests: syntax, printing, copying, visible state, S5 state, and scientific labels disagree in ways that include one direct semantic failure. The correct development move is to freeze behavior, repair those contract violations, and extract one explicit semantic core with an independent oracle—not to advertise a decision procedure or expand the UI first.
