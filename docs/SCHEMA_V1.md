# BAPAL Schema v1

## 1. Purpose

BAPAL Schema v1 is the stable JSON interchange contract for semantic models and formulas in the current Stage 0 implementation. It preserves semantic structure without routing data through the legacy compact model string or formula ASCII syntax.

Model and formula documents are different formats and are versioned independently:

- `bapal-model`, version `1`;
- `bapal-formula`, version `1`.

This document is normative for Schema v1. The broader semantic and product contract remains [`BAPAL_PLAYGROUND_SPEC.md`](BAPAL_PLAYGROUND_SPEC.md).

## 2. Non-goals

Schema v1 does not:

- repair, replace, deprecate, or generalize the legacy compact URL format;
- change the current share URL or add schema documents to URLs;
- redesign the formula parser, printer, or evaluator;
- add a new logical operator or new epistemic-agent semantics;
- assert that a model is S5 or normalize its relations;
- provide a satisfiability solver, validity checker, or proof of semantic correctness;
- implement RFC 8785 canonical JSON.

## 3. Model envelope

A Model Schema v1 document has exactly three top-level fields:

```json
{
  "format": "bapal-model",
  "version": 1,
  "worlds": [
    null,
    {
      "trueAtoms": ["foo", "p"],
      "transitions": [
        {
          "target": 1,
          "agent": "alice"
        }
      ]
    }
  ]
}
```

World identity is its zero-based array index. A slot is either `null` or a live world with exactly `trueAtoms` and `transitions`. Leading, internal, and trailing null slots are meaningful and must not be compacted. A transition target is a non-negative safe integer that must identify a live slot in the same `worlds` array.

`trueAtoms` is the set of exact atom strings true at that world; absent atoms are false. A transition is the explicit `(target, agent)` pair. Assignments are not encoded as JSON object property names, and relation identity is not encoded by concatenating target and agent tokens.

## 4. Formula envelope

A Formula Schema v1 document has exactly three top-level fields:

```json
{
  "format": "bapal-formula",
  "version": 1,
  "formula": {
    "type": "atom",
    "name": "p"
  }
}
```

`formula` is a stable semantic AST from the vocabulary below. Parser-internal nodes such as `annce_start.annce_end` and `kno_start.kno_end` are not part of the interchange contract.

## 5. Node vocabulary

Every node is a closed object: required fields must be present and additional fields are rejected.

| Type | Exact fields | Meaning |
|---|---|---|
| `atom` | `type`, `name` | Propositional atom |
| `not` | `type`, `operand` | Negation |
| `box` | `type`, `operand` | Ordinary necessity |
| `diamond` | `type`, `operand` | Ordinary possibility |
| `bapal` | `type`, `operand` | Existential Boolean-announcement diamond |
| `knowledge` | `type`, `agents`, `operand` | Current conjunction-like `K{...}` shorthand |
| `announcement` | `type`, `precondition`, `body` | Public-announcement box |
| `and` | `type`, `left`, `right` | Conjunction |
| `or` | `type`, `left`, `right` | Disjunction |
| `implies` | `type`, `left`, `right` | Implication |
| `iff` | `type`, `left`, `right` | Biconditional |

The `agents` array is ordered and nonempty. Its entries are the exact one-character units used by the current evaluator. For example, legacy `K{abc}p` maps to `agents: ["a", "b", "c"]`; it does not map to `agents: ["abc"]` and does not establish one agent named `abc`. Duplicate units are preserved rather than silently deduplicated.

Formula child order is always significant to the representation. In particular, left and right operands are never sorted merely because a connective is semantically commutative.

## 6. Identifier policy

The four identifier categories have intentionally different contracts.

| Category | Schema v1 policy |
|---|---|
| Model atom name | Exact nonempty well-formed Unicode scalar string |
| Model relation label | Exact nonempty well-formed Unicode scalar string |
| Formula atom name | Nonempty ASCII word string matching `[A-Za-z0-9_]+` |
| Formula knowledge unit | Exactly one ASCII letter, digit, or underscore matching `[A-Za-z0-9_]` |

Model identifiers are not normalized, case-folded, escaped into a different identity, concatenated, or truncated. Spaces, punctuation, quotes, angle brackets, markup-shaped text, newlines and controls, BMP text, emoji, and combining sequences are representable. Prototype-sensitive names such as `__proto__`, `constructor`, `prototype`, `toString`, and `hasOwnProperty` are ordinary data. Empty strings and strings containing isolated UTF-16 surrogate code units are rejected.

Formula atom and knowledge-unit policies are narrower so decoded data remains within the current `MPL.Wff` parser/printer/evaluator contract. Formula atom strings such as `__proto__`, `constructor`, `prototype`, `toString`, and `hasOwnProperty` are supported because they satisfy the ASCII-word rule and are treated as data. Unicode, punctuation, whitespace, controls, and markup-shaped formula identifiers are rejected explicitly. A multi-character model relation label can therefore be represented in Model Schema v1 while not being representable as one Formula Schema v1 knowledge agent.

## 7. Canonicalization

Canonical encoder output follows these rules:

- envelope and node fields are emitted in the fixed order shown by this contract;
- the `worlds` array and every null position are preserved exactly;
- each `trueAtoms` set is sorted lexicographically by Unicode scalar values;
- transitions are sorted first by numeric `target`, then by the agent's Unicode scalar values;
- duplicate true atoms and duplicate `(target, agent)` transitions are rejected rather than normalized;
- formula operands, announcement fields, binary children, and knowledge units retain their original semantic order;
- no semantic identity depends on caller object insertion order.

A decoder accepts otherwise valid model atom or transition arrays in noncanonical order. Re-encoding returns the canonical order. Formula documents already have structural order and are rebuilt with fixed field order. `canonicalStringify(document)` validates and canonicalizes a recognized Schema v1 document before applying `JSON.stringify` without spacing.

This is the BAPAL Schema v1 canonicalization contract. It is not advertised as RFC 8785 canonical JSON.

## 8. Structural JSON Schema versus semantic validation

The machine-readable Draft 2020-12 artifacts are:

- [`schemas/bapal-model-v1.schema.json`](../schemas/bapal-model-v1.schema.json);
- [`schemas/bapal-formula-v1.schema.json`](../schemas/bapal-formula-v1.schema.json).

### Canonical Schema Resource Identities

Model Schema v1:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
```

Formula Schema v1:

```text
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

Each `$id` identifies its schema resource. It is independent of the runtime `MPL.SchemaV1` API names and independent of legacy compact/share URLs. Internal `$ref` values are local fragments within the same schema resource. JSON Schema does not require these identifiers to be dereferenceable. Changing either canonical `$id` would change the schema artifact's resource identity and therefore requires explicit version and review consideration.

They express envelope constants, required fields, closed objects, primitive types and bounds, recursive formula shapes, formula identifier patterns, nonempty arrays, and local array uniqueness.

Runtime validation is additionally authoritative for constraints that static JSON Schema does not express here:

- a model target must be less than `worlds.length`;
- a model target must refer to a live non-null world;
- model identifiers must contain only well-formed Unicode scalar values, excluding isolated UTF-16 surrogates;
- programmatic formula objects must be acyclic;
- converted objects must be compatible with the current `MPL.Model` and `MPL.Wff` representations.

Consequently, structural-schema acceptance does not by itself imply runtime semantic acceptance. Both layers are required before decode succeeds.

## 9. Runtime API

Load [`js/MPL.js`](../js/MPL.js) before [`js/schema-v1.js`](../js/schema-v1.js). The helper exposes:

```text
MPL.SchemaV1.validateModelDocument(document)
MPL.SchemaV1.encodeModel(model)
MPL.SchemaV1.decodeModel(document)
MPL.SchemaV1.validateFormulaDocument(document)
MPL.SchemaV1.encodeFormula(wff)
MPL.SchemaV1.decodeFormula(document)
MPL.SchemaV1.canonicalStringify(document)
```

Validation returns a fresh canonical document on success. Model decode returns a fresh `MPL.Model`; formula decode returns a fresh `MPL.Wff`. The formula bridge reads and constructs JSON ASTs directly. It does not call `.ascii()` or the raw parser as a semantic transport step. Exact return shapes and ownership guarantees are documented in [`API-Reference.md`](../API-Reference.md#schema-v1-semantic-interchange).

## 10. Error model

Ordinary validation and conversion failures are returned, not silently ignored:

```json
{
  "ok": false,
  "error": {
    "code": "UNSUPPORTED_VERSION",
    "message": "Unsupported bapal-model version 2.",
    "path": "/version",
    "supportedVersion": 1,
    "actual": 2
  }
}
```

Every failure has stable `code`, `message`, and `path` fields; relevant failures add replay details such as world, transition, target, version, or property data. Paths use JSON Pointer-style escaping and identify the supplied input position. Unknown versions use `UNSUPPORTED_VERSION`, while a non-integer version uses `INVALID_VERSION_TYPE`. Required fields, extra fields, invalid descendants, duplicates, unsafe targets, null targets, and incompatible identifiers are explicit failures.

Validation completes before model or Wff construction is exposed. A failed decode does not partially commit a model prefix or mutate the caller's document.

## 11. Legacy compact-format relationship

Schema v1 and the legacy compact model/share format are separate interfaces. Schema conversion never calls `getModelString()`, `loadFromModelString()`, or the compact parser. The legacy format remains available for current compatibility and sharing, with its documented one-character atom and one-code-point relation-label restrictions.

Round 5 does not migrate current URLs, embed Schema v1 in a query parameter, or claim that compact round trips preserve general identifiers. ASCII remains a formula input/display boundary, not the stable formula-schema bridge.

## 12. Examples

The model example in Section 3 contains a null world, the multi-character atom `foo`, and the multi-character relation label `alice`.

Current knowledge shorthand `K{abc}p`:

```json
{
  "format": "bapal-formula",
  "version": 1,
  "formula": {
    "type": "knowledge",
    "agents": ["a", "b", "c"],
    "operand": {"type": "atom", "name": "p"}
  }
}
```

PAL `[p]K{a}q`:

```json
{
  "format": "bapal-formula",
  "version": 1,
  "formula": {
    "type": "announcement",
    "precondition": {"type": "atom", "name": "p"},
    "body": {
      "type": "knowledge",
      "agents": ["a"],
      "operand": {"type": "atom", "name": "q"}
    }
  }
}
```

Existential BAPAL `^p`:

```json
{
  "format": "bapal-formula",
  "version": 1,
  "formula": {
    "type": "bapal",
    "operand": {"type": "atom", "name": "p"}
  }
}
```

## 13. Compatibility and versioning rule

A decoder accepts only its exact `format` and integer version `1`. Unknown formats and versions fail explicitly. Required or extra structural content is never silently ignored.

Changes that preserve the exact v1 meaning and accepted document contract may be implemented as compatible repairs with regressions. Any intentional incompatible change to identifiers, node meaning, required fields, canonicalization, or decode semantics requires a new version. Model and formula formats can advance independently; neither format's version implies the other's.

## 14. What a future v2 may change

A future version may, after a separately specified semantic change and migration plan:

- represent genuine multi-character formula agents if the evaluator and all formula interfaces acquire that meaning;
- add explicit vocabulary, frame-class, metadata, or extension mechanisms;
- adopt a different canonical byte-level JSON standard;
- add compatibility metadata or migration operations.

Such changes must not be retroactively attributed to v1. Moving schema documents into share URLs would be a separate product migration, not an automatic consequence of v2.

## 15. Current limitations

- Formula atom identifiers remain limited to ASCII word strings.
- Formula knowledge entries remain one-character shorthand units; multi-character model relation labels cannot be named as one Formula Schema v1 knowledge agent.
- Model documents do not assert or certify S5 frame properties.
- Static JSON Schema alone cannot validate cross-world target liveness or isolated-surrogate semantics.
- The browser has no Schema v1 import/export control, and current share URLs still use the compact compatibility format.
- Canonical output is deterministic under this contract but is not RFC 8785 canonical JSON.
- Audit 09 found the JSON Schema resource-identity issue R5-A09-01 as the only Round 5 closure blocker. Audit 10 verified its repair and closed Round 5: **Versioned Schema v1 is CLOSED — WORK MAX AUDIT 10**. Model Schema v1 and Formula Schema v1 are closed under the exact Audit 09/10 contracts, and Round 6 does not reopen them.
- Legacy compact share URLs remain a limited compatibility boundary and are not certified as lossless for general identifiers. Formula Schema v1 knowledge entries remain character-wise shorthand units. P1-06 remains **OPEN**; P1-07 remains **OPEN pending the focused Audit 11 documentary recheck**; Stage 0 remains **OPEN**.
