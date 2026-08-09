# BAPAL Playground API Reference

This reference describes the current JavaScript interfaces in `js/MPL.js`, `js/s5-policy.js`, and `js/schema-v1.js`. The normative semantic contract is [`docs/BAPAL_PLAYGROUND_SPEC.md`](docs/BAPAL_PLAYGROUND_SPEC.md), and result names are governed by [`docs/RESULT_TERMINOLOGY.md`](docs/RESULT_TERMINOLOGY.md).

The library performs pointed evaluation in explicit finite models. It does not search for satisfiability or validity.

## Loading

In a browser, load the current components in this order:

```html
<script src="lib/formula-parser.min.js"></script>
<script src="js/MPL.js"></script>
<script src="js/schema-v1.js"></script>
<script src="js/s5-policy.js"></script>
```

`MPL.js` exposes `MPL.Wff`, `MPL.Model`, `MPL.parseModelString`, and `MPL.truth`. Schema v1 extends `MPL` with `MPL.SchemaV1`. The S5 editing helper exposes the separate global `S5Policy`.

## Formula API

### `new MPL.Wff(asciiOrJSON)`

Constructs a formula from either the configured raw-parser input string or the current legacy JSON AST.

```javascript
const parsed = new MPL.Wff('[(K{a}p)]^q');
const constructed = new MPL.Wff({
  impl: [{prop: 'p'}, {poss: {prop: 'q'}}]
});
```

The supported current constructors are:

| Construct | Raw parser / ASCII printer | Legacy JSON shape |
|---|---|---|
| Atom | `p`, `foo`, `bar_baz` | `{prop: 'p'}` |
| Negation | `~A` | `{neg: A}` |
| Ordinary modal box | literal `□A` | `{nec: A}` |
| Ordinary modal diamond | `<>A` | `{poss: A}` |
| Existential Boolean announcement | `^A` | `{bapal: A}` |
| Knowledge shorthand | `K{a}A`, `K{abc}A` | `{kno_start:{kno_end:[{prop:'a'}, A]}}` |
| Public announcement | `[A]B` | `{annce_start:{annce_end:[A, B]}}` |
| Conjunction | `(A & B)` | `{conj:[A, B]}` |
| Disjunction | `(A \| B)` | `{disj:[A, B]}` |
| Implication | `(A -> B)` | `{impl:[A, B]}` |
| Biconditional | `(A <-> B)` | `{equi:[A, B]}` |

The ordinary `□` and `<>` operators range over stored accessibility transitions. They are not universal or existential BAPAL operators. `^A` is the existential Boolean-announcement modality. The universal BAPAL operator used as a primitive in some literature has no separate application syntax here.

The raw parser does **not** accept `[]A` as ordinary-box syntax. Use the literal `□A`. PAL uses the two-part form `[A]B`.

Knowledge remains character-wise shorthand: `K{abc}A` behaves as the conjunction of the individual `a`, `b`, and `c` knowledge clauses. It is not one agent named `abc`, distributed knowledge, or common knowledge.

### Raw parser versus browser input

The raw `MPL.Wff` constructor and browser formula field are different interfaces:

- the raw parser accepts ASCII word-like identifiers, the literal ordinary box `□`, `<>`, `^`, `K{...}`, and `[...]` under its configured precedence rules;
- the browser removes commas, rewrites each `[` to `[(` and each `]` to `)]` before construction, then permits only atoms `p`–`t` and knowledge units `a`–`e`; and
- a raw knowledge- or PAL-rooted announcement precondition needs protective parentheses, for example `[(K{a}p)]q`. The ASCII printer supplies those parentheses for supported ASTs.

Browser acceptance therefore does not imply direct raw-parser acceptance, and raw multi-character atom acceptance does not broaden the browser vocabulary.

### Formula representations

Each `MPL.Wff` provides:

```text
wff.ascii()
wff.json()
wff.latex()
wff.unicode()
```

`ascii()` is the current canonical printer for the supported legacy AST. It emits literal `□` for ordinary box, `<>` for ordinary diamond, `[A]B` for PAL, and `^A` for existential BAPAL. `latex()` renders `^` as `\Diamond_{\beta}{}`, and `unicode()` renders it as `◇ᵝ`.

The constructor stores a supplied legacy JSON object directly, and `json()` exposes that stored object rather than a defensive clone. Treat it as formula representation data, not a versioned interchange document. Use Formula Schema v1 when fresh ownership and stable node names are required.

## Model API

### Representation

`new MPL.Model()` creates an indexed finite model. Internally, each array slot is either `null` or:

```javascript
{
  assignment: {p: true},
  successors: [{target: 1, agent: 'a'}]
}
```

World identity is the stable zero-based array index. Removing a world leaves a `null` slot. Assignments store only keys whose value is exactly `true`; absent keys are false. A successor combines a numeric target with its exact stored relation label.

### World and valuation methods

| Method | Current behavior |
|---|---|
| `model.addState(assignment)` | Appends a live world, copies only exactly-true keys into prototype-safe storage, and returns its index. |
| `model.editState(world, assignment)` | Applies a partial update: `true` stores a key and `false` deletes it. |
| `model.removeState(world)` | Replaces the slot with `null` and removes every incoming transition to it. |
| `model.removeAllStatesAndTransitions()` | Resets the internal world array to empty. |
| `model.valuation(atom, world)` | Returns the exact-key Boolean value; throws if the world is not live. |
| `model.getStates()` | Returns a new slot array containing current assignment objects or `null`. The assignment objects are not cloned. |
| `model.getRawStates()` | Exposes the internal state array used by semantic and audited infrastructure. It is not a defensive snapshot. |

### Transition methods

| Method | Current behavior |
|---|---|
| `model.addTransition(source, target, agent)` | Adds the labelled pair if both worlds are live and that exact `(target, agent)` pair is not already present. |
| `model.removeTransition(source, target, agent)` | Removes matching target edges; when a truthy `agent` is supplied, only that exact label is removed. |
| `model.getSuccessorsOf(source, agent)` | Returns successor records `{target, agent}`; a truthy label filters by exact equality. |
| `model.isSuccessor(source, target, agent)` | Tests for a target, optionally filtered by a truthy exact label. |
| `model.getActiveAgents()` | Returns the sorted distinct stored relation labels. |

`getSuccessorsOf()` does not return bare world indices. Callers must read each record's `target` and `agent`.

### Structural copy

`model.deepCopy()` creates a fresh `MPL.Model` structurally. It preserves live and null indices, exactly-true assignment keys, targets, and relation labels without using compact serialization. Mutating the copied states or transitions does not mutate the source model.

### Relation and S5 methods

The model exposes these whole-relation operations:

| Method | Meaning |
|---|---|
| `isReflexive(agent)` | Tests stored reflexivity on every live world. |
| `isSymmetric(agent)` | Tests stored symmetry for the exact label. |
| `isTransitive(agent)` | Tests stored transitivity for the exact label. |
| `isEquivalenceRelation(agent)` | Conjunction of the three tests. |
| `closeEquivalenceRelation(agent)` | Completes each undirected-support connected component as the least stored equivalence closure and returns its components. |
| `closeEquivalenceRelations(agents)` | Deduplicates/sorts labels and closes each independently. |
| `closeEquivalenceClass(agent, seedWorlds)` | Completes the connected class containing the live seeds and stores reflexive loops for that label on all live worlds. |

`S5Policy` supplies the browser's audited editing contract:

```text
S5Policy.getRelevantAgents(model, declaredAgents, selectedAgent)
S5Policy.planEnable(model, declaredAgents, selectedAgent)
S5Policy.requestEnable(model, declaredAgents, selectedAgent, confirmNormalization)
S5Policy.addWorld(model, assignment, declaredAgents, selectedAgent)
S5Policy.addRelation(model, source, target, agent, declaredAgents, selectedAgent)
S5Policy.removeWorld(model, world, declaredAgents, selectedAgent)
S5Policy.attemptIndividualRelationEdit(s5Enabled, edit)
S5Policy.buildLinkProjection(model, hideSelfLoops)
```

The relevant-agent set is the sorted union of declared browser agents, active stored labels, and the selected agent. Enabling S5 either observes already-valid relations without mutation, obtains confirmation before least-equivalence normalization, or remains disabled without mutation. Accepted S5 edits preserve the equivalence invariant.

Formal BAPAL targets S5 epistemic models. `MPL.Model` and `MPL.truth` do not require or certify S5; arbitrary stored relations can be evaluated as explicit-model behavior or robustness input.

## Legacy compact model boundary

### `MPL.parseModelString(modelString)`

Parses the complete legacy compact string into plain intermediate data without mutating a model. It returns either:

```javascript
{ok: true, modelData, stateCount, liveStateCount,
 nullStateIndices, duplicateTransitionsSuppressed}
```

or structured failure data with `ok:false` and an error containing a code, message, location fields, and relevant token details.

### `model.getModelString()` and `model.loadFromModelString(text)`

`getModelString()` serializes the current model to the inherited compact/share representation. `loadFromModelString()` validates and prepares the entire replacement before one commit. Failure returns `{ok:false,error:{...}}` and leaves the previous model unchanged; success returns counts and null-slot information.

The compact representation is only a compatibility boundary:

- assignment names are concatenated one-character atom tokens;
- a transition token is a decimal target followed by one terminal Unicode code point used as its label;
- it has no escaping, vocabulary declaration, or version; and
- it is not a lossless general-identifier format.

The browser further restricts compact-import atoms to `p`–`t`. Use Model Schema v1 for exact multi-character/Unicode model identifiers.

## Schema v1 semantic interchange

Load `js/schema-v1.js` after `js/MPL.js`. It exposes exactly:

```text
MPL.SchemaV1.validateModelDocument(document)
MPL.SchemaV1.encodeModel(model)
MPL.SchemaV1.decodeModel(document)
MPL.SchemaV1.validateFormulaDocument(document)
MPL.SchemaV1.encodeFormula(wff)
MPL.SchemaV1.decodeFormula(document)
MPL.SchemaV1.canonicalStringify(document)
```

Model and formula envelopes are separate:

```json
{"format":"bapal-model","version":1,"worlds":[]}
```

```json
{"format":"bapal-formula","version":1,"formula":{"type":"atom","name":"p"}}
```

The canonical schema resource identifiers are:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

### Return and ownership contract

- `validateModelDocument` and `validateFormulaDocument` return `{ok:true,canonicalDocument}` on success.
- `encodeModel` and `encodeFormula` return `{ok:true,document}`.
- `decodeModel` returns `{ok:true,model,canonicalDocument}` with a fresh `MPL.Model`.
- `decodeFormula` returns `{ok:true,wff,canonicalDocument}` with a fresh `MPL.Wff` built through direct AST mapping, not ASCII transport.
- `canonicalStringify` returns `{ok:true,json,canonicalDocument}` for a recognized Schema v1 document.
- Ordinary failures return `{ok:false,error:{code,message,path,...}}`; unknown versions fail explicitly rather than falling back.

Successful canonical documents are newly constructed. Decode results, canonical documents, and caller inputs do not share mutable model/formula structures. Encoding and validation do not mutate caller-owned values. Conversion never routes models through compact strings, and formula conversion never uses ASCII as semantic transport.

Model Schema v1 accepts exact nonempty well-formed Unicode scalar strings for atom names and relation labels. Formula Schema v1 atoms match `[A-Za-z0-9_]+`, and every ordered `knowledge.agents` entry is exactly one `[A-Za-z0-9_]` shorthand unit. These categories are intentionally different.

The complete document shapes, canonicalization, error behavior, and versioning rules are in [`docs/SCHEMA_V1.md`](docs/SCHEMA_V1.md).

## Pointed evaluation

### `MPL.truth(model, world, wff)`

Returns the Boolean truth value of one `MPL.Wff` at one live world of one `MPL.Model`. Invalid model/Wff instances and non-live points throw.

The current evaluator covers Boolean connectives, ordinary all-label box/diamond, character-wise knowledge filtered by exact relation label, PAL with source-model precondition evaluation and restriction, and existential BAPAL over valuation-class unions in the active finite model.

This is pointed finite-model evaluation, recommended as `truthAtWorld`. Repeating it across one model can compute `trueSomewhereInModel` and `trueAtEveryWorldInModel`. None of these APIs searches across S5 models or decides logical satisfiability or validity.
