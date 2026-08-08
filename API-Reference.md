# MPL.js: API Reference

> **Stage 0 warning — legacy and incomplete API reference**
>
> This document is inherited from the earlier Modal Logic / Epistemic Logic Playground and remains incomplete for the current BAPAL Playground. It is not the normative BAPAL specification; current normative behavior is documented in [`docs/BAPAL_PLAYGROUND_SPEC.md`](docs/BAPAL_PLAYGROUND_SPEC.md). Raw-parser, browser, compact-format, and Schema v1 identifier boundaries differ; only the explicit Schema v1 contract below guarantees its stated multi-character identifiers. The inherited ordinary `□` and `<>` operators are not the universal and existential BAPAL operators. This reference is scheduled to be replaced during Stage 1 extraction of the typed semantic core.
>
> **CORRECTION / DEPRECATION:** The legacy table and examples below claim that ASCII `[]A` is accepted as the ordinary box. That claim is false for the audited baseline: the raw parser accepts the literal `□A` token instead. Any `[]p` examples below are retained only as legacy documentation and must not be treated as accepted current syntax. The ordinary `□` and `<>` modalities remain distinct from BAPAL; existential BAPAL input is `^A`.

MPL is a library for parsing and evaluating well-formed formulas (wffs) of modal propositional logic.

MPL has a single dependency, [formula-parser](https://www.npmjs.com/package/formula-parser).

## Schema v1 semantic interchange

Load `js/schema-v1.js` after `js/MPL.js`. It exposes `MPL.SchemaV1`, a dependency-free semantic JSON interchange API distinct from legacy compact model strings, share URLs, and formula ASCII transport. The normative document shapes, identifier rules, node vocabulary, and examples are in [`docs/SCHEMA_V1.md`](docs/SCHEMA_V1.md).

### Canonical Schema Resource Identities

Model Schema v1:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
```

Formula Schema v1:

```text
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

Each `$id` identifies the corresponding schema resource. It is independent of runtime `MPL.SchemaV1` API names and independent of legacy compact/share URLs. Internal `$ref` values remain local fragments. JSON Schema does not require an `$id` to be dereferenceable. Changing either canonical `$id` would be a schema-artifact identity change and requires explicit version and review consideration.

All Schema v1 operations use result objects. Ordinary invalid input does not throw or partially commit data:

```javascript
// success
{ok: true, /* operation-specific fields */}

// failure
{
  ok: false,
  error: {
    code: 'UNSUPPORTED_VERSION',
    message: 'Unsupported bapal-model version 2.',
    path: '/version'
    // operation-specific replay details may follow
  }
}
```

Every returned canonical document is newly constructed and independent of caller-owned input. Model atom arrays are sorted by Unicode scalar value, transitions by target and then relation-label scalar value, and world/null order is preserved. Formula child and knowledge-unit order is preserved exactly while object fields are rebuilt in the fixed Schema v1 order. Unknown versions and additional structural fields are explicit failures.

### `MPL.SchemaV1.validateModelDocument(document)`

Input: a programmatic object intended to be a `bapal-model` version-1 document.

Success:

```javascript
{ok: true, canonicalDocument: modelDocument}
```

The canonical document preserves the input world-array indices and null slots, sorts true-atom and transition sets, and shares no mutable arrays or records with `document`. The function does not mutate the input and does not create or modify an `MPL.Model`.

Failure: `{ok:false,error:{code,message,path,...}}`. Structural failures, duplicate atoms/transitions, invalid identifiers, unsafe or out-of-range targets, targets to null worlds, and unsupported versions are distinguished. Target-reference paths report the transition's original supplied array index even when canonical sorting would move it.

### `MPL.SchemaV1.encodeModel(model)`

Input: an `MPL.Model`-compatible value exposing `getRawStates()`.

Success:

```javascript
{ok: true, document: canonicalModelDocument}
```

The result is a fresh canonical `bapal-model` version-1 document. Stable world indices and null slots are retained; exact supported atom and relation strings are copied into arrays. The source model is not mutated, and later mutation of either the source or returned document does not affect the other.

Failure: `{ok:false,error:{code,message,path,...}}` if the value is not model-compatible, its state data cannot be read, or its semantic content violates Schema v1. Encoding never uses `getModelString()` or any compact/URL representation.

### `MPL.SchemaV1.decodeModel(document)`

Input: a `bapal-model` version-1 document.

Success:

```javascript
{
  ok: true,
  model: freshModel,
  canonicalDocument: canonicalModelDocument
}
```

Validation and canonicalization complete before construction. `model` is a fresh `MPL.Model`; its assignments use prototype-safe storage. `canonicalDocument` is also fresh. Neither structure aliases `document`, and subsequent mutations across those three ownership domains are independent.

Failure: the same structured validation result as `validateModelDocument`, or `MODEL_CONSTRUCTION_FAILED` if a validated document cannot be materialized. No caller-owned model or document is mutated and no prefix is returned.

### `MPL.SchemaV1.validateFormulaDocument(document)`

Input: a programmatic object intended to be a `bapal-formula` version-1 document.

Success:

```javascript
{ok: true, canonicalDocument: formulaDocument}
```

The result is a fresh stable formula tree using only the public Schema v1 node vocabulary. Formula and knowledge order is preserved exactly, while field order is canonical. The supplied document is not mutated or aliased.

Failure: `{ok:false,error:{code,message,path,...}}` for wrong formats/versions, missing or extra fields, unknown or malformed nodes, invalid formula atoms or knowledge units, null descendants, cyclic programmatic objects, and other structural errors. Descendant paths identify the stable formula-tree location.

### `MPL.SchemaV1.encodeFormula(wff)`

Input: an `MPL.Wff`-compatible value exposing `json()`.

Success:

```javascript
{ok: true, document: canonicalFormulaDocument}
```

The encoder reads the Wff JSON AST and maps it directly to the stable Schema v1 AST. It does not call `.ascii()` or the raw parser as a representation bridge. The source Wff JSON is not mutated, and the returned document is structurally independent.

Failure: `{ok:false,error:{code,message,path,...}}` if the value is not Wff-compatible, its JSON cannot be read, its legacy AST is unsupported/malformed/cyclic, or its identifiers violate the Formula Schema v1 boundary.

### `MPL.SchemaV1.decodeFormula(document)`

Input: a `bapal-formula` version-1 document.

Success:

```javascript
{
  ok: true,
  wff: freshWff,
  canonicalDocument: canonicalFormulaDocument
}
```

The decoder validates first, directly maps the stable tree to a fresh legacy JSON AST, and constructs a fresh `MPL.Wff` from that AST. ASCII is not semantic transport. The Wff, canonical document, and supplied document do not share mutable formula nodes.

Failure: the same structured validation result as `validateFormulaDocument`, or `WFF_CONSTRUCTION_FAILED` if the validated stable AST cannot be materialized under the current Wff representation.

### `MPL.SchemaV1.canonicalStringify(document)`

Input: either exact Schema v1 document kind.

Success:

```javascript
{
  ok: true,
  json: '{"format":"bapal-model","version":1,"worlds":[]}',
  canonicalDocument: canonicalDocument
}
```

The function validates with the matching runtime validator, rebuilds the canonical document, and returns compact `JSON.stringify` output plus that fresh document. It does not mutate or alias the input. Model set arrays are sorted; formula semantic order is preserved. This is deterministic project-specific Schema v1 encoding and is not an RFC 8785 claim.

Failure: the corresponding structured model/formula validation result. A document with an unknown format is not treated as a generic JSON value.

## Parsing and displaying wffs

MPL wffs can be represented in four ways:
* ASCII, for typing
* JSON, for processing
* LaTeX, for displaying nicely
* Unicode, for displaying accessibly

All four are stored in a `Wff` object, created by providing either the ASCII or JSON representation as input.

In each case:
* Parentheses and whitespace don't matter.
* Binary connectives are strictly binary.
* Propositional variables may be any alphanumeric string.

In the table below, `p` is a propositional variable, while `A` and `B` are arbitrary subwffs.

<table>
<thead>
<tr><th></th><th>ASCII</th><th>JSON</th><th>LaTeX</th><th>Unicode</th></tr>
</thead>
<tbody>
<tr><td>Proposition</td><td><code>p</code></td><td><code>{prop: 'p'}</code></td><td><code>p</code></td><td><code>p</code></td></tr>
<tr><td>Negation</td><td><code>~A</code></td><td><code>{neg: A}</code></td><td><code>\lnot{}A</code></td><td><code>\u00acA</code></td></tr>
<tr><td>Necessity</td><td><code>[]A</code></td><td><code>{nec: A}</code></td><td><code>\Box{}A</code></td><td><code>\u25a1A</code></td></tr>
<tr><td>Possibility</td><td><code>&lt;&gt;A</code></td><td><code>{poss: A}</code></td><td><code>\Diamond{}A</code></td><td><code>\u25caA</code></td></tr>
<tr><td>Conjunction</td><td><code>(A &amp; B)</code></td><td><code>{conj: [A, B]}</code></td><td><code>(A\land{}B)</code></td><td><code>(A \u2227 B)</code></td></tr>
<tr><td>Disjunction</td><td><code>(A | B)</code></td><td><code>{disj: [A, B]}</code></td><td><code>(A\lor{}B)</code></td><td><code>(A \u2228 B)</code></td></tr>
<tr><td>Implication</td><td><code>(A -&gt; B)</code></td><td><code>{impl: [A, B]}</code></td><td><code>(A\rightarrow{}B)</code></td><td><code>(A \u2192 B)</code></td></tr>
<tr><td>Equivalence</td><td><code>(A &lt;-&gt; B)</code></td><td><code>{equi: [A, B]}</code></td><td><code>(A\leftrightarrow{}B)</code></td><td><code>(A \u2194 B)</code></td></tr>
</tbody>
</table>

### MPL.Wff( <i>asciiOrJSON</i> )

Constructor for MPL wff. Takes either ASCII or JSON representation as input.

```javascript
// the following are equivalent:
var wff = new MPL.Wff('(p -> []p)');
var wff = new MPL.Wff({impl: [{prop: 'p'}, {nec: {prop: 'p'}}]});
```

### wff.ascii()

Returns the ASCII representation of an MPL wff.

```javascript
wff.ascii();
// => '(p -> []p)'
```

### wff.json()

Returns the JSON representation of an MPL wff.

```javascript
wff.json();
// => {impl: [{prop: 'p'}, {nec: {prop: 'p'}}]}
```

### wff.latex()

Returns the LaTeX representation of an MPL wff.

```javascript
wff.latex();
// => '(p\\rightarrow{}\\Box{}p)'
```

### wff.unicode()

Returns the Unicode representation of an MPL wff.

```javascript
wff.unicode();
// => '(p \u2192 \u25a1p)'
```


## Kripke models

Mathematically, a Kripke model consists of:
* a set of *states* (or *worlds*)
* an *accessibility relation* (i.e., a set of *transitions*)
* a *valuation* (a complete assignment of truth values to each variable at each state)

Specifically, in an MPL `Model`:
* Each state has a zero-based index and an assignment.
* An assignment is an object in which the keys are propositional variable names and the values are booleans.
* Only **true** propositional variables are actually stored! All others are automatically interpreted as false.

Models can also be exported to, and imported from, a compact 'model string' notation.   

### MPL.Model()

Constructor for Kripke model. Takes no initial input.

```javascript
var model = new MPL.Model();
```

### model.addTransition( <i>source</i>, <i>target</i> )

Adds a transition to the model, given source and target state indices.

```javascript
// example: a model where states 0 and 1 have been added and not removed
model.addTransition(0, 1);
```

### model.removeTransition( <i>source</i>, <i>target</i> )

Removes a transition from the model, given source and target state indices.

```javascript
// example: a model where states 0 and 1 have been added and not removed
model.removeTransition(0, 1);
```

### model.getSuccessorsOf( <i>source</i> )

Returns an array of successor states for a given state index.

```javascript
// example: a model with transitions (0,0) and (0,1)
model.getSuccessorsOf(0);
// => [0, 1]
```

### model.addState( <i>assignment</i> )

Adds a state with a given assignment to the model.

```javascript
model.addState({'p': true});
```

### model.editState( <i>state</i>, <i>assignment</i> )

Edits the assignment of a state in the model, given a state index and a new partial assignment.

```javascript
model.editState(0, {'p': false, 'q': true});
```

### model.removeState( <i>state</i> )

Removes a state and all related transitions from the model, given a state index.

```javascript
model.removeState(0);
```

### model.getStates()

Returns an array containing the assignment (or null) of each state in the model.  
(Only true propositional variables are returned in each assignment.)

```javascript
// example: a model with states 0 and 2 (where state 1 has been removed); 'q' is true at 0, nothing true at 2
model.getStates();
// => [{'q': true}, null, {}]
```

### model.valuation( <i>propvar</i>, <i>state</i> )

Returns the truth value of a given propositional variable at a given state index.

```javascript
// example: a model where only 'q' is true at state 0
model.valuation('r', 0);
// => false
```

### model.getModelString()

Returns current model as a compact string suitable for use as a URL parameter.

```javascript
// example: a model with states 0 and 2 (where state 1 has been removed) and transitions (0,0) and (0,2);
//          'q' is true at 0, nothing true at 2
model.getModelString();
// => 'AqS0,2;;AS;'
```

### model.loadFromModelString( <i>modelString</i> )

Restores a model from a given model string.

```javascript
model.loadFromModelString('AqS0,2;;AS;');
```


## Evaluating wffs

### MPL.truth( <i>model</i>, <i>state</i>, <i>wff</i> )

Evaluate the truth of an MPL wff at a given state within a given model.

```javascript
// example: model is an MPL Model with only state 0 and no transitions; 'p' is true at state 0
//          wff is the MPL Wff '(p -> []p)'  
MPL.truth(model, 0, wff);
// => true
```
