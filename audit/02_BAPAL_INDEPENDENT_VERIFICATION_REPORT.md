# BAPAL Independent Verification Report

**Audit date:** 2026-08-03  
**Implementation under test:** `Raycaesar/bapal@92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`  
**Status:** completed independent bounded differential, property, serialization, and performance audit

## Verification verdict

An independently implemented Python evaluator agreed with the JavaScript evaluator on every tested model, world, and formula in the intended one-character representation:

- **Exhaustive S5:** 9,068 labeled finite models, 30,996 pointed models, 414 distinct ASCII formula strings used across five vocabulary configurations (905 configuration/formula-set entries), and **6,492,902** model–world–formula evaluations; zero semantic mismatches.
- **Seeded random/property:** 24 larger cases, 168 pointed models, 1,200 generated formula entries, and **8,400** evaluations; zero semantic mismatches. Twelve cases were S5 semantic tests and twelve arbitrary-frame robustness tests.
- **Combined:** **6,501,302** independent differential evaluations; zero semantic mismatches.
- **Independent Boolean-domain cross-check:** 30,996 pointed cases comparing valuation-class unions with all Boolean truth functions over the finite active vocabulary; zero mismatches.
- **S5 restriction checks:** 56,698 relation/domain checks; zero failures.
- **Metamorphic checks:** 3,192 direct property instances; zero failures.
- **Serialization on the tested one-character subset:** zero structural or truth-preservation failures.

This result is strong evidence for the finite S5 evaluator on the tested subset. It is not a mathematical proof and it does not validate the application's wider raw-parser contract. Targeted tests outside that subset found a P0 counterexample for multi-character atoms, a parser/printer round-trip defect, and S5 editor-integrity failures. Those counterexamples are recorded below rather than hidden by the zero differential-mismatch headline.

## 1. Independence of the oracle

### 1.1 Separation from production code

The reference evaluator was written in Python in a temporary audit directory. Its semantic code:

- does not import `js/MPL.js`;
- does not call `MPL.truth`;
- does not translate the JavaScript implementation;
- does not copy production algorithms or AST nodes;
- represents worlds, relations, domains, formulas, and restrictions differently from the product.

The Python side uses immutable tuple ASTs, integer bit masks for world domains and relations, and direct recursion from the formal clauses. A thin Node adapter performs only four implementation-under-test operations: construct an `MPL.Model`, parse an ASCII formula, call `MPL.truth`, and normalize/return the result. Expected truth values are computed first by Python. The adapter contains no alternative truth semantics.

This is implementation independence, not formal proof independence: both programs may still share a mistaken interpretation of the written semantics. The Boolean-domain cross-check and metamorphic properties reduce that risk, but only a mechanized proof could eliminate the testing gap.

### 1.2 Independent mathematical model

The oracle represents a finite model as:

\[
M=(W,(R_a)_{a\in A},V),
\]

where:

- `W={0,…,n−1}`;
- each valuation is an `m`-bit integer over an explicit ordered atom tuple;
- each source row of each relation is an `n`-bit successor mask;
- an active restricted domain `D⊆W` is an `n`-bit mask;
- restriction never copies or mutates the base model—it intersects successor rows and valuation access with `D`.

The oracle AST constructors are independent tags for atom, negation, conjunction, disjunction, implication, biconditional, individual knowledge, PAL, and BAPAL. Formula size is the number of AST nodes.

### 1.3 Direct semantic clauses

For an active domain `D` containing `w`, the oracle implements:

\[
\begin{aligned}
M,D,w\models p &\iff p\in V(w),\\
M,D,w\models K_a\varphi &\iff
  \forall v\in D\;(wR_av\Rightarrow M,D,v\models\varphi),\\
M,D,w\models[\psi]\varphi &\iff
  M,D,w\not\models\psi\ \text{or}\ M,D_\psi,w\models\varphi,\\
D_\psi&=\{v\in D:M,D,v\models\psi\},\\
M,D,w\models\Diamond_\beta\varphi &\iff
  \exists E\in\mathcal B_D(w)\;M,E,w\models\varphi,
\end{aligned}
\]

where `B_D(w)` is independently computed from Boolean-definable subsets of `D` that contain `w`. Boolean connectives use their ordinary truth functions. Knowledge automatically has vacuous truth on an empty successor set. PAL preconditions are evaluated in the source domain, and every relation is implicitly restricted by the new domain mask.

Memoization in the oracle is keyed by `(formula, domain, world)`. That changes performance, not semantics. The production evaluator has no corresponding memoization.

## 2. Why valuation-class enumeration is exact on a finite model

### 2.1 The theorem actually needed

Fix a finite model domain `D` but allow the formal propositional vocabulary `Prop` to remain countably infinite. Define propositional equivalence on worlds by

\[
u\equiv_{PL}v
\quad\Longleftrightarrow\quad
\forall p\in Prop\;(M,u\models p\iff M,v\models p).
\]

Then:

1. every Boolean formula has constant truth value on each `≡PL` class, so its truth set in `D` is a union of such classes;
2. every union of the finitely many `≡PL` classes occurring in `D` is the truth set in `D` of a **finite** Boolean formula.

The second direction does not require a finite global vocabulary and should not be justified with an infinite “complete valuation conjunction.” Let `U` be a selected union. For every included class `C` and excluded class `E`, choose one atom `p(C,E)` on which their valuations differ. Such an atom exists because the classes are distinct. Let `l(C,E)` be that atom or its negation, whichever is true on `C` and false on `E`. Then

\[
\theta_U=
\bigvee_{C\subseteq U}
\bigwedge_{E\not\subseteq U} l(C,E)
\]

selects exactly `U` among the classes present in `D`. Only finitely many class pairs occur, so `θU` is finite. Empty and full unions can be expressed by `p∧¬p` and `p∨¬p` respectively. This finite-separator proof is the exact hypothesis missing from the informal argument in `BAPAL_VERIFICATION.md:15-21`.

At a pointed world, a truthful announcement must contain the whole class of that world. If `k` distinct classes occur, there are exactly `2^(k−1)` candidate domains containing the pointed class.

### 2.2 Vocabulary convention in the app

The app's evaluator does not quantify over only the visible variables or only the atoms in the input formula. `_valuationKey` uses **all true keys** in every stored assignment and treats every absent atom as false (`js/MPL.js:511-513`). Under the explicit convention

> every assignment object is a complete valuation in which absent atoms are false, and all worlds use the same namespace,

atoms absent everywhere are uniformly false and cannot separate worlds. Therefore a finite stored model can legitimately stand for a countably infinite formal vocabulary with finite support. The finite UI vocabulary is not itself a semantic weakening of the quantifier.

The convention fails operationally if names are not preserved. `deepCopy` serializes a true key such as `foo` as three characters, so the implementation no longer represents the same complete valuation. The class theorem remains correct; the app has violated its representation hypothesis.

### 2.3 Two independently checked finite methods

For every pointed model in the exhaustive run, at its initial full active domain, the harness computed admissible Boolean domains two ways:

1. **Valuation classes:** enumerate every union of the actual complete-valuation classes containing the point's class.
2. **Boolean truth sets:** enumerate all `2^(2^m)` Boolean truth functions over the configuration's `m` atoms, retain functions true at the point's valuation, and collect the induced subsets of actual worlds.

Every Boolean truth function over a finite `m`-atom vocabulary has a disjunctive-normal-form characteristic formula, so method 2 is explicit enumeration of characteristic Boolean truth sets rather than reuse of the class algorithm. Duplicate truth functions that agree on the valuations occurring in the model collapse to one domain.

The domain sets were identical in all **30,996** pointed cases. With up to three atoms, method 2 enumerated at most 256 truth functions per cross-check. This independently confirms the reduction at the tested full-domain bounds. Recursive subdomains were exercised by nested semantic differential tests, but were not each re-enumerated by the second truth-function method.

## 3. Exhaustive bounded verification

### 3.1 Enumeration design

The exhaustive run used **all labeled models** in the stated bounds; no isomorphism quotient was used.

- Every valuation map `W→{0,1}^m` was enumerated.
- Every S5 relation was generated as a set partition of `W` and converted to its complete equivalence relation.
- With `a` agents, every `a`-tuple of partitions was enumerated.
- Every world was used as a point.
- Formula generation included atoms and, by exact AST size up to four, negation, individual `K`, BAPAL `^`, conjunction, and PAL. Disjunction, implication, and biconditional were exercised in targeted/random tests rather than multiplied through this exhaustive grammar.
- Maximum exhaustive BAPAL nesting was three (`^^^p`-shaped formulas); maximum PAL nesting was one because PAL is binary and the size cap was four.

For `n` worlds, `m` atoms, and `a` agents, a configuration contributes

\[
(2^m)^n\,B_n^a
\]

labeled models, where `Bn` is the Bell number. This gives an independently auditable count.

### 3.2 Exact bounds and counts

| Configuration | Worlds | Atoms | Agents | S5 models | Pointed models | Formulas in set | Evaluations | Max `^` depth | Max PAL depth |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| one agent, one atom | 1–4 | `p` | `a` | 290 | 1,098 | 60 | 65,880 | 3 | 1 |
| one agent, two atoms | 1–4 | `p,q` | `a` | 4,196 | 16,388 | 160 | 2,622,080 | 3 | 1 |
| two agents, one atom | 1–3 | `p` | `a,b` | 218 | 634 | 111 | 70,374 | 3 | 1 |
| two agents, two atoms | 1–3 | `p,q` | `a,b` | 1,668 | 4,932 | 274 | 1,351,368 | 3 | 1 |
| one agent, three atoms | 1–3 | `p,q,r` | `a` | 2,696 | 7,944 | 300 | 2,383,200 | 3 | 1 |
| **Total** | — | — | — | **9,068** | **30,996** | **905 set entries** | **6,492,902** | **3** | **1** |

The five formula sets contain **414 distinct ASCII strings in union**. “905” is the sum of configuration-specific set sizes and is the relevant multiplier for the configuration evaluation total; it is not a claim of 905 globally distinct strings.

### 3.3 Exact outcomes

| Check | Count | Failures |
|---|---:|---:|
| Python-vs-JavaScript truth evaluations | 6,492,902 | 0 |
| Pointed valuation-class/truth-function domain comparisons | 30,996 | 0 |
| S5 relations after Boolean-domain restriction | 56,698 | 0 |
| Normalized model serialization checks | 9,068 | 0 |
| Original-vs-deserialized truth-table checks | all model/formula/world entries after structural equality | 0 |
| Parser/pretty-printer round trips | 905 configuration entries | 24 failures |

The 24 round-trip failures are not 24 different root causes. They are all knowledge-rooted PAL preconditions, minimized to:

```text
parse:    [(K{a}p)]p
print:    [K{a}p]p
reparse:  Invalid JSON for formula!
```

The semantic comparison used the explicitly parenthesized form accepted by the app and raw parser. This isolates parser/printer closure from evaluator truth.

### 3.4 Timing

The fresh, no-checkpoint verification run used Python 3.12.13 and Node v24.14.0 on a Linux 6.12.13 x86-64 KVM guest exposing nine vCPUs of an AMD EPYC 9V74. Its complete wall time is **314.105 seconds**; the harness's internal elapsed timer recorded **312.659 seconds**. Component timers recorded during its exhaustive configurations were:

| Configuration | Python oracle + independent checks | JS evaluation + serialization | JS parse |
|---|---:|---:|---:|
| 1 agent / 1 atom | 108.686 ms | 1,603.330 ms | 1.075 ms |
| 1 agent / 2 atoms | 6,523.721 ms | 93,848.878 ms | 1.792 ms |
| 2 agents / 1 atom | 124.188 ms | 1,475.396 ms | 1.502 ms |
| 2 agents / 2 atoms | 3,102.430 ms | 35,682.296 ms | 2.585 ms |
| 1 agent / 3 atoms | 6,472.417 ms | 63,395.922 ms | 4.274 ms |
| **Sum** | **16,331.442 ms** | **196,005.822 ms** | **11.228 ms** |

The JavaScript timer includes original evaluation, model-string round trip, and copy truth checks, not only the first differential call. The complete wall time additionally includes JSON transfer, process launches, random/property cases, report construction, and filesystem I/O.

## 4. Reproducible random and property verification

### 4.1 Matrix

There were 24 deterministic cases. Each had 50 formulas and all worlds were evaluated.

| Mode | Cases | Worlds | Atoms | Agents | Formula size | Max `^` depth | Max PAL depth | Formula entries | Evaluations |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| S5 partitions | 12 | 6–8 | 5–8 | 1–3 | up to 20 | 2 | 2 | 600 | 4,200 |
| Arbitrary directed relations | 12 | 6–8 | 5–8 | 1–3 | up to 20 | 2 | 2 | 600 | 4,200 |
| **Total** | **24** | — | — | — | **20 max** | **2** | **2** | **1,200** | **8,400** |

Each case contained 36 random formulas, four forced shapes covering nested `^`, nested PAL, PAL inside `^`, and `^` inside a PAL precondition, plus ten metamorphic formulas. The temporary generator was bounded so ordinary random branches contained at most one generated `^`; explicit depth-two representatives supplied the nested coverage without accidentally turning the property run into the stress benchmark. A preliminary harness-only boundary mistake was corrected before these results were recorded; all listed seeds were rerun after the correction. No repository code was changed.

The arbitrary-frame cases compare the two implementations under the natural Kripke-frame extension of the same clauses. They are robustness evidence only. The S5 cases are the semantic evidence for the manuscript's intended model class.

### 4.2 Exact seeds

S5 seeds:

```text
1, 7, 42, 12345, 271828, 314159,
424242, 8675309, 20260803, 12648430, 12245589, 24301
```

Arbitrary-frame seeds, obtained by adding `1,000,000,007` modulo `2^32`:

```text
1000000008, 1000000014, 1000000049, 1000012352,
1000271835, 1000314166, 1000424249, 1008675316,
1020260810, 1012648437, 1012245596, 1000024308
```

The world/atom/agent pattern cycles deterministically through 6/5/1, 7/6/2, 8/7/3, 6/8/1, and so on. Actual distinct valuation counts were 6–8 in S5 cases and 6–8 in arbitrary cases except for the expected collisions recorded in the manifest.

### 4.3 Metamorphic properties

`top` was encoded as `p∨¬p` and `bottom` as `p∧¬p`, because the grammar has no constants.

| Property | Independent instances | Failures | Basis |
|---|---:|---:|---|
| `A → ^A` | 672 | 0 | truthful announcement of `top` leaves the model unchanged |
| `^top` | 168 | 0 | every point has at least the truthful `top` witness |
| `^bottom` | 168 | 0 | no retained point can satisfy contradiction |
| universal/existential duality | 672 | 0 | explicit universal domain enumeration equals `¬^¬A` |
| Boolean-equivalent preconditions | 672 | 0 | `[p∧q]A` equals `[q∧p]A` |
| atom/agent renaming invariance | 840 | 0 | simultaneous bijective renaming of model and formula |
| **Total** | **3,192** | **0** | — |

The six manifest counters in the table sum to **3,192** direct metamorphic assertions. The domain-method and S5-restriction checks are separate and are not included in that total.

Additional properties covered by the exhaustive construction:

- worlds with the same complete valuation always occur together in every enumerated Boolean domain;
- Boolean-equivalent announcements induce the same active domain and hence the same restricted relation/valuation view;
- every restriction of every generated equivalence relation remained an equivalence relation;
- deserialization preserved all truth values for one-character atoms/agents;
- all formulas were evaluated under every valuation, partition relation, and point in each stated exhaustive bound.

The app has no universal BAPAL syntax/display node. Duality was therefore checked against explicit universal enumeration and the definable expression `¬^¬A`; it was not mistaken for the inherited ordinary `□`.

## 5. Mismatches and minimized counterexamples

### 5.1 Differential semantic mismatches

**None** in the 6,501,302 recorded independent comparisons. There are therefore no semantic mismatch seeds to preserve from those runs.

### 5.2 Parser/printer mismatch

Smallest observed:

```text
formula accepted: [(K{a}p)]p
ASCII emitted:    [K{a}p]p
raw reparse:      error
```

Cause: `[`/`]` and `K{`/`}` are simulated through precedence operators, while `_jsonToASCII` removes the protective parentheses. See `js/MPL.js:18-33,52-89`.

### 5.3 Semantic P0 outside the exhaustive representation boundary

Smallest identifier counterexample:

```text
W = {0}
V(0) = {foo}
R_a = {(0,0)} or omitted (irrelevant)
```

| Formula | Formal/independent result | JavaScript result |
|---|---:|---:|
| `foo` | true | true |
| `[(p|~p)]foo` | true | false |
| `^foo` | true | exception: `State 0 not found!` |

Cause: `AfooS` reloads as true keys `f` and `o`; PAL/BAPAL copy through this lossy format. This case was deliberately outside the one-character exhaustive suite so the suite's representation hypothesis would be explicit, not silently mixed with an already known serialization failure.

### 5.4 S5 editor counterexamples

These are model-construction failures, not disagreements in `MPL.truth`:

1. Create an S5 `b` relation on an existing world; select agent `a`; add a world while S5 mode is on. The new world gets an `a` loop but no `b` loop, so `isReflexive('b')` becomes false (`js/app.js:809-823`).
2. Create a one-way relation in ordinary mode; turn S5 mode on. No edge changes (`setS5Mode`, `js/app.js:455-459`).
3. Leave a malformed one-way component disjoint from the endpoints of a new S5 drag. `closeEquivalenceClass` fully closes only the seeded component; the other component remains malformed (`js/MPL.js:452-490`).

### 5.5 Model-input counterexample

Loading `ApS;BROKEN;AqS` clears the previous model and silently retains only the valid `ApS` prefix. There is no parse error or rollback (`js/MPL.js:328-372`).

## 6. Performance and complexity measurements

### 6.1 Current algorithmic cost

Let:

- `n` be live worlds;
- `e` be stored labelled edges;
- `k` be distinct propositional valuation classes in the current restricted domain;
- `d` be BAPAL nesting depth.

At one `^` and one point, only `2^(k−1)` domains can be truthful witnesses. The current code nevertheless constructs the entire `2^k` power set as arrays and only then filters it (`js/MPL.js:563-564`). In a worst-case false formula it deep-copies/restricts for all `2^(k−1)` pointed candidates (`566-573`). Each copy is at least `Θ(n+e)`; repeated `removeState` scans can add substantially more work on dense relations. The valuation partition and power set are recomputed for every point and every restricted recursive call.

With two nested existential operators and singleton classes, the number of inner candidate-domain evaluations across outer domains has scale

\[
\sum_{S\subseteq k-1}2^{|S|}=3^{k-1}.
\]

This does not include copying, edge removal, formula branching, or eager arrays. Evaluating the formula at every displayed world multiplies work again. PAL prefixes add model copies even when they leave the model unchanged. Repeated branches recompute identical subproblems because there is no memoization.

### 6.2 Node benchmark method

Environment and controls:

- Node `v24.14.0`;
- Linux 6.12.13 x86-64 KVM guest, nine exposed AMD EPYC 9V74 vCPUs; the evaluator itself is single-threaded;
- V8 old-space cap 512 MiB;
- 20-second per-process timeout;
- one pointed evaluation at world 0;
- `k` worlds with `k` distinct valuations over the app's five atom names `p`–`t`;
- two maximally dense S5 relations (`2k²` labelled directed edges);
- three repetitions for `k≤12`, otherwise one; table reports median evaluation time;
- process-end `heapUsed`/RSS were captured, but reliable peak memory was not. End memory must not be read as a peak.

### 6.3 Node results

#### Eager-allocation witness case: `^K{a}~p`

| `k` | Pointed domains | Median/only evaluation | End heap | End RSS |
|---:|---:|---:|---:|---:|
| 4 | 8 | 0.124 ms | 6.4 MiB | 57.5 MiB |
| 8 | 128 | 0.408 ms | 7.1 MiB | 57.5 MiB |
| 12 | 2,048 | 2.015 ms | 8.8 MiB | 59.1 MiB |
| 16 | 32,768 | 32.390 ms | 20.4 MiB | 89.0 MiB |
| 18 | 131,072 | 67.242 ms | 70.4 MiB | 142.8 MiB |
| 20 | 524,288 | 328.596 ms | 244.7 MiB | 395.6 MiB |

Although a witness is found early, the complete power set already exists before `.some` starts. A direct follow-up at `k=21` took 569.84 ms and ended near the 512 MiB heap cap; `k=22` terminated with V8 out-of-memory. These follow-ups diagnose eager allocation, not worst-case semantic search.

#### Worst depth-1 false case: `^(p & ~p)`

| `k` | Pointed domains | Median/only evaluation | End RSS | Outcome |
|---:|---:|---:|---:|---|
| 4 | 8 | 0.432 ms | 57.6 MiB | complete |
| 8 | 128 | 13.439 ms | 69.7 MiB | complete |
| 10 | 512 | 52.067 ms | 89.3 MiB | complete |
| 12 | 2,048 | 238.949 ms | 204.6 MiB | complete |
| 14 | 8,192 | 1,220.287 ms | 238.0 MiB | complete |
| 16 | 32,768 | 6,063.328 ms | 283.1 MiB | complete |
| 17 | 65,536 | 13,472.347 ms | 302.7 MiB | complete |
| 18 | 131,072 | — | — | exceeded 20 seconds |

#### Depth-2 false case: `^^(p & ~p)`

| `k` | `3^(k−1)` inner scale | Median/only evaluation | Outcome |
|---:|---:|---:|---|
| 4 | 27 | 0.827 ms | complete |
| 6 | 243 | 12.087 ms | complete |
| 8 | 2,187 | 87.968 ms | complete |
| 10 | 19,683 | 792.187 ms | complete |
| 11 | 59,049 | 2,789.123 ms | complete |
| 12 | 177,147 | — | exceeded 20 seconds |

#### Formula structure stress

| Family | `k=8` | `k=10` | `k=12` | `k=14` |
|---|---:|---:|---:|---:|
| three tautological PAL prefixes then false `^` | 17.113 ms | — | 298.930 ms | 1,329.706 ms |
| four false `^` branches under disjunction | 53.076 ms | 172.680 ms | 826.953 ms | — |

These families demonstrate that world count alone is not a performance specification. Candidate classes, nesting, Boolean branch structure, PAL copies, and edge density all matter.

### 6.4 Live browser results

The [deployed page](https://raycaesar.github.io/bapal/) was exercised in cloud Chrome through its actual evaluation button. The browser controller did not expose a stable exact Chrome build number, so these UI timings are reproducible as a case design but not as a fully pinned browser benchmark. Served source hashes exactly matched the audited branch:

| File | SHA-256 |
|---|---|
| `js/MPL.js` | `3a9e545ad38f65d66a084a8ebbe5b867feaefee363a049c19a53fa069eee2383` |
| `js/app.js` | `3f05ec43873c4626249448879ae51801c48952f11732f191b8dc00e99c55ff49` |

The browser model used the same dense two-agent S5 family, but the UI evaluates every world and performs D3/DOM/MathJax work. A control formula `p` consistently cost about 2.9 seconds of browser-control/UI overhead, so differences from that control are only approximate evaluator time.

| `k` | Formula | Button-to-result wall time |
|---:|---|---:|
| 8 | `p` | 2,969 ms |
| 8 | `^(p & ~p)` | 2,936 ms |
| 10 | `p` | 2,845 ms |
| 10 | `^(p & ~p)` | 3,426 ms |
| 12 | `p` | 2,908 ms |
| 12 | `^(p & ~p)` | 6,463 ms |
| 13 | `p` | 2,836 ms |
| 13 | `^(p & ~p)` | 11,205 ms |
| 8 | `^^(p & ~p)` | 3,498 ms |
| 10 | `^^(p & ~p)` | 10,901 ms |
| 14 | `^(p & ~p)` | more than 20 s; protocol timed out while synchronous handler ran; page later recovered |

This is visible main-thread freezing, not merely a slow background computation. The UI has no cancellation or timeout.

### 6.5 First practical thresholds

There is no universal “largest reliable number of worlds.” On the measured hardware and adversarial dense family:

- **Browser teaching responsiveness:** keep nontrivial nested `^` around `k≤10`; keep one worst-case depth-1 `^` around `k≤12`. At `k=13`, the measured click took 11.2 seconds; `k=14` blocked beyond 20 seconds.
- **Node one-point batch:** worst depth-1 remained around 1.2 seconds at `k=14`, 6.1 seconds at `k=16`, 13.5 seconds at `k=17`, and timed out at `k=18`. Depth two was under one second at `k=10`, 2.8 seconds at `k=11`, and timed out at `k=12`.
- **Memory threshold from eager materialization:** even an early-witness case exhausted a 512 MiB V8 heap at `k=22`.

These are practical thresholds for the current algorithm, not semantic reliability bounds. Models with many worlds but few valuation classes can be much easier; sparse relations and early witnesses also help. The UI can represent up to 32 distinct valuations over five atoms, far beyond the measured safe interactive region.

## 7. Verification adequacy

| Intended use | Current adequacy | Reason |
|---|---|---|
| Teaching demonstration | **Conditional** | Good small-model visualization and strong supported-subset evidence, but syntax/S5/hidden-state caveats can misteach if uncorrected |
| Dependable finite-model checker | **No** | P0 identifier defect, non-round-tripping parser, unvalidated model input, no explicit schema/invariants/oracle CI |
| Publication-supporting experiments | **No** | No independent checked-in oracle, immutable run bundle, correct result terminology, resource manifest, versioned corpus, CI, or failure minimization |
| Research-grade formal-verification service | **No** | No proof of evaluator correctness, typed semantic boundary, hardened service, deterministic job controls, or formal mechanization |

The repository's regression tests remain useful. They should be treated as the first layer, not as the oracle.

## 8. Required verification stack

### Layer 1: deterministic unit and contract tests

- every AST constructor and Boolean truth clause;
- `K` for each agent, multi-agent shorthand, empty successor sets, and S5 self-access;
- PAL vacuity, source-domain precondition evaluation, all-agent edge restriction, deleted indices, and nested PAL;
- BAPAL witness/no-witness cases, same-valuation inseparability, nested `^`, and PAL/BAPAL alternation;
- S5 operations over full event sequences, especially toggle/import/new-world/multiple-agent cases;
- invalid world/formula/model inputs with typed errors.

### Layer 2: parser and serialization properties

- `parse(print(ast)) = ast` for every generated AST;
- an explicitly specified browser grammar equal to the library grammar—no hidden comma/bracket rewrite;
- `decode(encode(model)) = model` for arbitrary supported identifiers, null indices, all agents, and multi-digit worlds;
- schema-version and validation tests, plus rejection/rollback of malformed input;
- truth-table preservation across encode/decode.

### Layer 3: property and differential testing

- retain a genuinely separate Python oracle;
- generate independent ASTs and typed models, not only parser strings;
- use a property framework with shrinking/minimization and preserved failing seeds;
- run S5 semantic cases and label arbitrary-frame cases separately;
- include all connectives, deeper mixed PAL/BAPAL, duplicate/deleted-world stress, renaming, permutation/isomorphism, and domain-restriction laws.

### Layer 4: bounded exhaustive checks

- retain the exact matrix in this report as a versioned baseline;
- add a small, fast PR subset and a scheduled/full matrix;
- store counts derived from enumeration, not hand-maintained expectations;
- hash the implementation, oracle, generated corpus, and result manifest;
- fail on any semantic, serialization, parser, or S5-invariant mismatch.

### Layer 5: browser end-to-end and mutation tests

- browser tests for editing, URL import/export, S5 toggle, world/edge operations, formula entry, visible-variable changes, and cancellation;
- compare displayed truth sets with semantic-core results;
- mutation testing focused on PAL vacuity, relation filtering, valuation-class inclusion, current-world retention, and agent selection. A verification suite that cannot kill those mutations is not adequate.

### Layer 6: benchmarks and CI

- GitHub Actions on supported Node/browser versions;
- a locked dependency/runtime manifest;
- quick correctness jobs on every change, scheduled exhaustive/differential jobs, and artifact retention;
- benchmark families parameterized by `n,e,k,^` depth, PAL depth, and branching;
- separate time and memory baselines with explicit hardware/runtime and tolerance bands;
- worker cancellation/timeout tests once concurrency is introduced.

## 9. Minimum standard for paper-cited computations

Before a paper responsibly cites results from this tool, the supplementary bundle should contain:

1. exact repository commit and release identifier;
2. precise formal semantic version, including existential/universal convention, frame class, vocabulary convention, and model schema;
3. independent oracle version and differential/exhaustive manifest;
4. every input model and formula in a versioned machine-readable format;
5. every output truth set/witness/trace, not only an HTML screenshot;
6. deterministic seeds and generator version;
7. hardware, OS, browser/Node versions, dependency lock, timeouts, memory limits, and durations;
8. SHA-256 hashes for code, corpus, and result files;
9. failure minimization and preserved counterexamples;
10. CI record and benchmark comparison for the cited commit;
11. an explicit statement that sampled finite-model truth is not validity and failure to find a model is not unsatisfiability;
12. disclosure of all bounded dimensions and any excluded/time-out cases.

For claims central to a theorem, the computation should additionally be reproduced by a second implementation or mechanized checker, and the encoding from the theorem's mathematical objects to the tool's schema should be documented.

## 10. What has and has not been verified

### Verified within explicit bounds

- direct finite truth clauses for atoms, all Boolean connectives, individual/multiple single-character agents, PAL, and existential BAPAL;
- all labeled S5 models and all points in the exact exhaustive table;
- nested BAPAL to depth three in small exhaustive formulas;
- nested PAL/BAPAL combinations to depth two in seeded larger cases;
- finite valuation-class enumeration against explicit Boolean truth functions;
- preservation of equivalence relations under tested restrictions;
- the listed metamorphic laws;
- one-character serialization and truth preservation;
- robustness agreement on twelve arbitrary-frame samples;
- measured performance on the listed dense representative families and the live deployed UI.

### Not verified

- all finite models or all formulas beyond the stated bounds;
- any infinite model;
- all formula parser inputs, Unicode edge cases, malformed AST objects, or browser preprocessing combinations;
- the two-method Boolean-domain cross-check on every recursively reached restricted subdomain (it covered every exhaustive point at its initial full domain);
- multi-character identifier correctness—indeed, it is false;
- every S5 editor/UI event sequence—known counterexamples exist;
- numerical/runtime behavior on other engines, devices, or memory policies;
- witness construction, because the current evaluator returns only a Boolean;
- satisfiability, validity, finite-model completeness, axiomatic soundness/completeness, or a general decision procedure;
- the correctness of the manuscript's metatheory;
- a formal proof that the production evaluator implements the semantics.

Passing this audit therefore supports the narrow statement:

> At commit `92a4ba6`, the JavaScript evaluator agreed with an independent finite semantic oracle on all 6,501,302 tested model–world–formula cases under the recorded one-character representation and exact bounds.

It does not support “the evaluator is proved correct,” “the formulas are satisfiable/valid,” or “BAPAL is decided by the playground.”
