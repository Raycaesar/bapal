# Round 4 Administrative Closure and Round 5 Schema v1 Implementation Log

## 1. Verdict

**PASS — READY FOR WORK MAX CLOSURE AUDIT**

Audit 08 administratively closes Round 4 without an additional repair. The clean Round 5 implementation candidate at `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` contains Model Schema v1, Formula Schema v1, their machine-readable Draft 2020-12 schemas, permanent deterministic tests, the narrowly required prototype-safe model-assignment adapter, and the developer/API documentation. All required deterministic commands pass without changing the tracked tree.

This verdict is an implementation-log disposition, not a Work Max closure verdict. Round 5 remains **IMPLEMENTED — PENDING WORK MAX CLOSURE AUDIT**. P1-06, P1-07, and Stage 0 remain open.

## 2. Repository identity

| Item | Exact identity |
|---|---|
| Repository | `Raycaesar/bapal` (`https://github.com/Raycaesar/bapal.git`) |
| Branch | `bapal-core` |
| Foundational baseline | `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287` |
| Round 1 implementation | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` |
| Round 2 implementation | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` |
| Original complete Round 3 candidate | `6bd33697491820db3d0999ac7c7ccf99b05291d5` |
| Round 3 rendering repair / Audit 07 reviewed commit | `3f27ac2d4476ecc23da0358f23f2ced87db5500d` |
| Round 4 implementation | `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea` |
| Round 4 final log-only HEAD | `ab26863374464dd1466286a6c31d19d8e1a39a66` |
| Audit 08 | `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` — **PASS — P1-04 AND P1-05 CLOSED; PROCEED TO ROUND 5** |
| Round 5 primary commit | `5a39a51f3069dde69194a11685e0445b7e98bf6d` (`close round 4 and implement round 5 versioned schemas`) |
| Complete Round 5 implementation candidate | `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` (`close round 4 refined`) |
| Candidate tree | `f1d0aad62b5aab49ceabd52349b8efa0541958cc` |
| Node.js | `v24.18.0` |
| Log preparation time | `2026-08-09T01:57:23+08:00` |

The clean-tree gate ran before any log creation:

```text
$ git status --short
<no output>
$ git rev-parse HEAD
67fc1a2a8f253fcd97a88c9fe9f656de226a93b4
$ git branch --show-current
bapal-core
```

Every required deterministic command also began and ended with an empty `git status --short`. The current HEAD is therefore the complete Round 5 implementation candidate. A later log-only commit may add this Markdown file without changing that implementation identity.

The exact candidate history after the audited Round 4 log-only HEAD is:

```text
ab26863374464dd1466286a6c31d19d8e1a39a66
  -> 5a39a51f3069dde69194a11685e0445b7e98bf6d
  -> 67fc1a2a8f253fcd97a88c9fe9f656de226a93b4
```

## 3. Round 4 administrative closure

Audit 08 is indexed in `audit/00_AUDIT_INDEX.md` with its exact path, Round 4 implementation commit, final log-only HEAD, verdict, closed findings, Stage 0 status, and Round 5 authorization.

Audit 08 records:

- P1-04 atomic legacy compact-model import is **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**;
- P1-05 semantic visibility/disclosure is **CLOSED AT `5c89ab5` — WORK MAX AUDIT 08**;
- Round 4 is closed;
- the closure remains valid at final log-only HEAD `ab26863`;
- no repository or documentary defect required an additional Round 4 repair;
- Stage 0 remains open.

The Round 4 implementation remains governed by its audited legacy compatibility boundary. The compact format was not converted into a general identifier format, and Audit 08 did not certify the later Schema v1 implementation.

## 4. Round 5 objective and non-goals

Round 5 introduces a stable, versioned semantic JSON interchange boundary for models and formulas. Model and formula formats have distinct `format` identities and their own `version` fields:

- `bapal-model`, version `1`;
- `bapal-formula`, version `1`.

The objective is exact semantic structure, explicit validation, deterministic canonical re-encoding, structured failures, and ownership independence. Schema conversion is separate from legacy compact model strings, share URLs, and formula ASCII transport.

Round 5 does not:

- repair, generalize, deprecate, or replace the legacy compact model/share format;
- migrate the current URL format or add browser import/export controls;
- change formula parsing, printing, or truth clauses;
- introduce new formula-agent semantics;
- assert or normalize an S5 frame through the schema;
- perform P1-06 result-terminology work;
- perform P1-07 checked-in independent-oracle or CI work;
- broaden the product into a satisfiability solver, validity checker, or BAPAL decision procedure;
- turn bounded regression evidence into a proof.

## 5. Schema v1 architecture

### Public namespace and API

`js/schema-v1.js` loads after `js/MPL.js` and exposes:

```text
MPL.SchemaV1.validateModelDocument(document)
MPL.SchemaV1.encodeModel(model)
MPL.SchemaV1.decodeModel(document)
MPL.SchemaV1.validateFormulaDocument(document)
MPL.SchemaV1.encodeFormula(wff)
MPL.SchemaV1.decodeFormula(document)
MPL.SchemaV1.canonicalStringify(document)
```

The browser loads the helper immediately after `js/MPL.js` and before `js/s5-policy.js` and `js/app.js`. The application does not otherwise migrate its UI or URL behavior to Schema v1.

### Implementation and artifact files

- `js/schema-v1.js` — dependency-free runtime validation, conversion, and canonicalization;
- `schemas/bapal-model-v1.schema.json` — structural Model Schema v1;
- `schemas/bapal-formula-v1.schema.json` — recursive structural Formula Schema v1;
- `scripts/check-model-schema-v1.js` — permanent model test/oracle corpus;
- `scripts/check-formula-schema-v1.js` — permanent formula test/corpus.

Both machine-readable artifacts declare JSON Schema Draft 2020-12. Objects are closed with `additionalProperties: false` at the envelope and record/node levels.

### Validation layers and errors

The JSON Schema artifacts express envelope constants, required properties, types, local bounds, recursion, formula identifier patterns, and local uniqueness. Runtime validation additionally enforces constraints that the artifacts do not express here, including target range and live-target references, well-formed Unicode scalar identifiers, cyclic programmatic formula rejection, and compatibility with the current `MPL.Model` and `MPL.Wff` representations.

Ordinary invalid input returns:

```text
{ok:false,error:{code,message,path,...}}
```

Unknown integer versions reject with `UNSUPPORTED_VERSION`; non-integer versions reject with `INVALID_VERSION_TYPE`. Missing and extra properties, invalid descendants, duplicate semantic data, and unsafe targets are explicit failures with replayable paths. No validation failure silently ignores extra structure or partially exposes decoded state.

### Canonicalization and ownership

Model canonicalization preserves world/null order, sorts atom sets by Unicode scalar sequence, and sorts transitions by numeric target then relation-label scalar sequence. Formula field construction is fixed, but semantic child, operand, and knowledge-unit order is preserved exactly. This is the repository's deterministic Schema v1 encoding, not an RFC 8785 claim.

Validation and encoding return newly constructed documents. Decoding returns a fresh `MPL.Model` or `MPL.Wff` plus a fresh canonical document. Caller input, encoded documents, decoded semantic structures, assignment records, successor arrays, formula nodes, and canonical documents do not intentionally alias across the codec boundary.

## 6. Model Schema v1

The envelope is exactly:

```json
{
  "format": "bapal-model",
  "version": 1,
  "worlds": []
}
```

The `worlds` array is the identity-bearing world domain. World identity is its zero-based array index. Empty arrays and leading, internal, and trailing `null` slots are preserved without compaction.

Every live world has exactly:

```json
{
  "trueAtoms": ["foo", "p"],
  "transitions": [
    {"target": 1, "agent": "alice"}
  ]
}
```

- `trueAtoms` is an explicit set-valued array of exact atom strings; assignments are not encoded as object property names.
- `transitions` is an explicit set-valued array of `(target, agent)` records; relations are not compact concatenated tokens.
- Atom names and relation labels are exact, nonempty, well-formed Unicode scalar strings. No normalization, truncation, concatenation, or case folding occurs. Empty strings and isolated UTF-16 surrogates reject.
- A target must be a finite safe integer, non-negative, less than `worlds.length`, and refer to a live non-null slot.
- Duplicate atoms and duplicate `(target, agent)` transitions reject with `DUPLICATE_ATOM` or `DUPLICATE_TRANSITION`; they are not silently deduplicated.
- Canonical atoms sort by Unicode scalar value. Canonical transitions sort by target and then relation-label scalar order. World order never sorts.
- Versions other than integer `1` reject explicitly; they are not interpreted as v1.

Prototype-sensitive strings such as `__proto__`, `constructor`, and `prototype` are supported model data. The approved model-assignment adapter stores decoded true atoms in null-prototype assignment objects and reads only own enumerable input keys.

## 7. Model test-first evidence

### Initial expected failure

The permanent test was created before production implementation. Its initial run stopped at the explicit assertion:

```text
MPL.SchemaV1 API does not exist. Model Schema v1 production implementation is required.
```

The gate was not weakened; the checked-in test still asserts the namespace and all required model methods before running its behavioral groups.

### Permanent groups

`scripts/check-model-schema-v1.js` contains nine deterministic groups:

1. minimized structural example;
2. canonicalization;
3. null-slot preservation;
4. identifier preservation and prototype safety;
5. schema/version validation;
6. atomic decode;
7. mutable independence;
8. semantic and truth preservation;
9. deterministic generated corpus.

The final permanent run records:

| Metric | Count |
|---|---:|
| Seed | `1548635457` (`0x5c4e4d41`) |
| Generated models | 100,000 |
| Sparse models | 84,099 |
| Null slots | 300,172 |
| Models with multi-digit targets | 45,455 |
| Models with Unicode identifiers | 91,825 |
| Adversarial identifier cases | 15 |
| Invalid document cases | 27 |
| Truth comparisons | 3,454 |

The fixed adversarial identifier set includes multi-character atoms/relations, spaces, punctuation, quotes/backslashes, angle brackets, BMP Unicode, emoji, a combining sequence, `__proto__`, `constructor`, and `prototype`. Empty and lone-surrogate identifiers reject explicitly. A separate inherited-prototype input proves that only `own_atom` is copied and that inherited pollution is false.

Atomic decode tests compare the caller document and an existing nontrivial model before and after every invalid case. Mutable-independence tests mutate the original model, decoded model, schema input, and encoded output in both directions. No cross-boundary mutation is observed. The semantic fixtures include propositional, multi-agent, S5, non-S5, PAL-relevant, BAPAL valuation-class, sparse, and multi-character-atom models.

## 8. Formula Schema v1

The envelope is exactly:

```json
{
  "format": "bapal-formula",
  "version": 1,
  "formula": {"type": "atom", "name": "p"}
}
```

The complete stable node vocabulary is:

- `atom` — `name`;
- `not`, `box`, `diamond`, `bapal` — `operand`;
- `knowledge` — ordered nonempty `agents` plus `operand`;
- `announcement` — `precondition` plus `body`;
- `and`, `or`, `implies`, `iff` — `left` plus `right`.

The stable tree does not expose parser-internal `annce_start.annce_end` or `kno_start.kno_end` structures. `encodeFormula()` directly maps the legacy `Wff.json()` constructors to stable nodes. `decodeFormula()` directly maps stable nodes to a fresh legacy JSON AST and constructs `MPL.Wff` from that object. The conversion itself does not call `.ascii()` or invoke the raw parser as semantic transport.

Formula atom names match `[A-Za-z0-9_]+`. This includes tested `p`, `foo`, `bar_baz`, `atom10`, `__proto__`, `constructor`, and `prototype`. Punctuation, whitespace, markup-shaped strings, Unicode, emoji, and combining sequences reject under Formula Schema v1 rather than producing an unstable Wff contract.

Every `knowledge.agents` item matches exactly one `[A-Za-z0-9_]` unit. The ordered array preserves current evaluator shorthand: legacy `K{abc}p` maps to `agents:["a","b","c"]`, not one agent named `abc`. Duplicate units are preserved. An item such as `"alice"` rejects; Round 5 does not introduce new multi-character epistemic-agent semantics.

Canonical formula objects use fixed field names/order and preserve every operand, child, and knowledge-unit order exactly. Binary children are not sorted merely because a connective may be semantically commutative.

## 9. Formula test-first evidence

### Initial expected failure

The Formula Schema v1 suite was run before the formula API existed and stopped on its required method assertion, for example:

```text
MPL.SchemaV1.validateFormulaDocument API does not exist. Formula Schema v1 implementation is required.
```

The checked-in suite retains the method gates for `validateFormulaDocument`, `encodeFormula`, and `decodeFormula`.

### Permanent evidence

The ten groups cover every constructor, difficult syntax, direct structural mapping, current knowledge semantics, formula identifiers, invalid documents, input mutation, exhaustive small ASTs, deterministic generated formulas, and truth preservation.

The fixed difficult corpus includes:

```text
[(K{a}p)]q
K{a}K{b}p
K{abc}p
K{a}[p]q
[p]K{a}q
[p]^K{a}q
^[p]q
□<>p
(p -> q)
(p <-> q)
~□<>^K{a}p
[(~□<>^K{a}p)]^[q]r
```

The direct-mapping test replaces `.ascii()` with a throwing function during encode and observes that decode passes an object, not text, to `MPL.Wff`.

| Metric | Count |
|---|---:|
| Exhaustive logical-size bound | 5 |
| Exhaustive counts by size 1–5 | `2, 12, 92, 792, 7312` |
| Exhaustive formulas | 8,210 |
| Generated seed | `252037658` (`0x0f05ca1a`) |
| Generated formulas | 100,000 |
| Generated maximum depth | 40 |
| Invalid formula documents | 16 |
| Truth comparisons | 724 |

The generated corpus covers every stable constructor. Its recorded constructor occurrences are `atom` 656,071; `not` 166,896; `box` 167,834; `diamond` 167,236; `bapal` 167,306; `knowledge` 166,829; `announcement` 110,912; `and` 110,957; `or` 111,194; `implies` 111,453; and `iff` 111,555.

## 10. Independent Round 5 review

Prompt 5.3 performed a separate concentrated review rather than importing the permanent test oracles. Its final disposition was **PASS AFTER SCOPED REPAIR**.

### Independent model review

| Metric | Result |
|---|---:|
| Seed | `2447445413` (`0x91e10da5`) |
| Generated model documents | 200,000 |
| Accepted | 100,000 |
| Rejected | 100,000 |
| Final classification/canonical/mutation/path mismatches | 0 |

The independent checker covered valid and malformed envelopes, sparse worlds, live/null/invalid targets, duplicate data, multi-character and Unicode identifiers, prototype-sensitive strings, and malicious-looking content. Every accepted document decoded and re-encoded to the independent canonical semantic interpretation. Every rejected document preserved caller-owned state.

### Independent formula review

| Metric | Result |
|---|---:|
| Seed | `3266489909` (`0xc2b2ae35`) |
| Generated formula documents | 200,000 |
| Valid documents | 100,000 |
| Malformed documents | 100,000 |
| Separately round-tripped valid stable ASTs | at least 100,000 |
| Final classification/identity/path/mutation mismatches | 0 |

Every node type, malformed descendants, knowledge units, invalid identifiers, extra fields, unknown versions, error paths, and direct non-ASCII transport behavior were covered.

### Independent truth review

| Metric | Result |
|---|---:|
| Seed | `1779033703` (`0x6a09e667`) |
| Formula-schema instances | 10,000 |
| Models | 8 |
| Live worlds | 32 |
| Pointed truth comparisons | 320,000 |
| Evaluator calls | 640,000 |
| BAPAL-rooted formulas | 999 |
| Truth mismatches | 0 |

BAPAL-heavy cases were bounded to at most eight worlds, four valuation classes, and eight candidate announcement subsets.

### Identifier and artifact results

- Model identifiers preserved exact prototype-sensitive names, quotes, markup-shaped strings, newlines/controls, combining Unicode, and emoji; empty strings and lone surrogates rejected explicitly.
- Formula atoms accepted the ASCII-word boundary, including prototype-looking strings, and rejected punctuation, whitespace/control strings, markup-shaped strings, and non-ASCII text.
- Knowledge arrays preserved ordered one-character ASCII word units and duplicates. `K{abc}` remained `["a","b","c"]`; `["abc"]` rejected.
- Nine adversarial mutation/alias probes reported zero cross-boundary aliases.
- Python `jsonschema` 4.10.3 was already available. Both artifacts passed Draft 2020-12 meta-schema checking. Formula artifact/runtime classification aligned in all ten reviewed boundary categories. The model artifact had exactly three documented runtime-only semantic distinctions: out-of-range targets, targets to null worlds, and lone-surrogate rejection.

### Scoped repair

The minimized counterexample placed an invalid transition at supplied array index `0` before a valid transition that canonical sorting moved ahead of it. Runtime validation reported the invalid target at canonical index `1`, not the caller's original index `0`. `js/schema-v1.js` now retains each target reference's original input `transitionIndex` for post-array semantic validation. `scripts/check-model-schema-v1.js` permanently asserts the original path and index.

This repair changes only structured error provenance. It does not change model acceptance, canonical output, decoded semantics, or logical truth.

## 11. Files changed

The exact Round 5 candidate diff is `ab26863374464dd1466286a6c31d19d8e1a39a66..67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`:

```text
15 files changed, 3243 insertions(+), 38 deletions(-)
SHA-256 of git diff --binary: 87ee7f3ad750efc66ad614f9140caec3400586960063b832f8c0325a3bbfdb0d
```

### Round 4 administration

- `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` — added read-only Audit 08 artifact;
- `audit/00_AUDIT_INDEX.md` — indexed Audit 08 and exact Round 4 closure identities.

### Schema production code

- `js/schema-v1.js` — added the Schema v1 runtime API;
- `index.html` — loads `js/schema-v1.js` after `js/MPL.js`;
- `js/MPL.js` — narrowly approved prototype-safe assignment adapter described in Section 13.

### Machine-readable schemas

- `schemas/bapal-model-v1.schema.json`;
- `schemas/bapal-formula-v1.schema.json`.

### Model tests

- `scripts/check-model-schema-v1.js`.

### Formula tests

- `scripts/check-formula-schema-v1.js`.

### Documentation/API

- `AGENTS.md`;
- `docs/BAPAL_PLAYGROUND_SPEC.md`;
- `docs/SCHEMA_V1.md`;
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`;
- `API-Reference.md`;
- `README.md`.

### Unexpected files

None. No unexpected executable file, dependency manifest, package lock, CI configuration, backend, database, build-system file, report, or UI feature is present in the candidate diff.

## 12. Deterministic validation

Every command below ran at candidate `67fc1a2`. Exit status was `0`. `git status --short` was empty immediately before and after every command, so no command changed a tracked or untracked repository path.

| Command | Concise result | Changed repository paths |
|---|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; seed `0x5c4e4d41`; 100,000 generated; 15 adversarial identifiers; 27 invalid documents; 3,454 truth comparisons | No |
| `node scripts/check-formula-schema-v1.js` | PASS; 10 groups; seed `0x0f05ca1a`; 8,210 exhaustive; 100,000 generated; 16 invalid documents; 724 truth comparisons | No |
| `node scripts/check-semantic-state-visibility.js` | PASS, 11/11 semantic-state visibility groups | No |
| `node scripts/check-atomic-model-import.js` | PASS; 9 minimized malformed; 16 compatibility; seed `0x041c0a11`; 100,000 = 50,000 accepted + 50,000 rejected/exact rollback; 3 startup cases | No |
| `node scripts/check-agent-rendering.js` | PASS, 5/5 rendering groups | No |
| `node scripts/check-s5-invariants.js` | PASS, 12/12 groups; all 531 relations through three worlds; seed `0x0055f503`; 10,000 sequences/200,000 operations | No |
| `node scripts/check-formula-roundtrip.js` | PASS; 108,246 AST round trips; 3 display smokes | No |
| `node scripts/check-structural-copy-regressions.js` | PASS, 11/11 structural-copy regressions | No |
| `node scripts/check-bapal-regression.js` | PASS, 8/8 checks | No |
| `node scripts/check-logic-regressions.js` | PASS, 6/6 checks | No |
| `node scripts/check-s5-closure.js` | PASS, 4/4 checks | No |
| `node scripts/check-bapal-valuation-class.js` | PASS, valuation-key-order regression | No |
| `node scripts/check-report-links.js` | PASS, 5/5 tracked links | No |
| `git diff --check` | PASS, no output | No |

The tracked random-report generator was not run. No report was regenerated.

## 13. Artifact and source-scope integrity

### Required SHA-256 records

| Artifact | SHA-256 |
|---|---|
| `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md` | `fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8` |
| `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md` | `875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd` |
| `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md` | `b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1` |
| `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` | `be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087` |
| `audit/05_BAPAL_STAGE_0_ROUND_2_CLOSURE_AUDIT.md` | `15ba7817c3a0c7eb7804b7312bb5d20b46821f1487032fea5ee9022e4d95c709` |
| `audit/06_BAPAL_STAGE_0_ROUND_3_CLOSURE_AUDIT.md` | `8ea2278a676d735e4b9e2ae237cd32866f297bb8811eebc1d48823c200a20dc2` |
| `audit/07_BAPAL_ROUND_3_RENDERING_CLOSURE_RECHECK.md` | `7b99956ae3fdc71c70548dd65806ff58926170c2031d30bc71a1f211d1299fc2` |
| `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md` | `9e2354770e611252e33bb1b1226ef778d1c0c41a79a17e86ad748bcf431a864f` |
| `prompt/work_max_bapal_foundational_audit_prompt.md` | `052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98` |
| `schemas/bapal-model-v1.schema.json` | `e520e6f498c6a2e5a8f6b1422f4820803a9d28e6e8a64a2f36e7ee7f07d9474f` |
| `schemas/bapal-formula-v1.schema.json` | `277d8a8d1414da8c11f0375703517d586652a1d61dbcafcc281845546cc979e6` |
| `js/schema-v1.js` | `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76` |

The tracked report `reports/random-bapal-evaluation.html` has SHA-256 `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` and is unchanged across `ab26863..67fc1a2`.

### Protected source boundaries

The candidate comparison reports no diff for `lib/formula-parser.min.js`, `js/s5-policy.js`, `js/app.js`, `css/app.css`, `scripts/random-bapal-evaluation.js`, or `reports/`. Therefore:

- the formula parser library and parser configuration are unchanged;
- Round 2 `_announcementPreconditionNeedsParentheses()` / `_jsonToASCII()` printing behavior is unchanged;
- `_truth()` and exported truth clauses are unchanged;
- the `deepCopy()` algorithm is unchanged;
- S5 closure policy/algorithms are unchanged;
- raw-label rendering is unchanged;
- the Round 4 semantic inspector is unchanged;
- the report generator and reports are unchanged.

The Round 4 compact parser `_parseModelString()` and its validation/atomic commit control flow are unchanged. The one approved representation-level adapter changes assignment allocation and lookup in `js/MPL.js`:

1. `_copyTrueAssignment()` creates `Object.create(null)` storage and copies only own enumerable keys whose value is exactly `true`;
2. `Model.addState()` uses that helper;
3. `Model.editState()` iterates `Object.keys()` rather than inherited enumerable properties;
4. `Model.valuation()` requires an own property with value exactly `true`;
5. `loadFromModelString()` uses the same helper when preparing the already-validated replacement.

This adapter is required so Schema v1 can safely materialize atom identities such as `__proto__`, `constructor`, `prototype`, `toString`, and `hasOwnProperty` without prototype mutation or inherited false positives. It does not change logical truth conditions for supported own atom keys: an own key with value `true` remains true, absent keys remain false, and false/non-true values remain unstored. It does not modify any Boolean, modal, knowledge, PAL, or BAPAL clause. All inherited semantic, structural-copy, atomic-import, S5, rendering, visibility, and report-link regressions pass.

## 14. Claims supported

The candidate and recorded evidence support only these narrow claims:

- Model Schema v1 has a local implementation at the exact candidate HEAD;
- Formula Schema v1 has a local implementation at the exact candidate HEAD;
- supported tested documents round-trip to canonical Schema v1 identity;
- supported tested model and formula identifiers preserve their exact identity under their separate v1 policies;
- Formula Schema v1 conversion is structurally independent of ASCII transport;
- tested truth values survive model and formula schema round trips;
- the legacy compact format remains a separate compatibility interface;
- Round 5 Work Max closure is pending.

This log does not claim:

- support for arbitrary future schema versions;
- that legacy compact URLs are lossless for general identifiers;
- formula-agent semantics beyond the implemented ordered one-character v1 knowledge-unit policy;
- closure of P1-06 or P1-07;
- completion of Stage 0;
- that bounded testing is a proof of correctness, soundness, completeness, satisfiability, validity, or decidability.

## 15. Remaining findings

- **P1-06 — terminology:** within-one-model report/result terminology still requires its separately scoped repair and audit.
- **P1-07 — independent oracle / CI:** the independent oracle and conformance corpus are not yet checked in as a reproducible CI gate with deliberate-mismatch detection and manifests.
- **Legacy compact identifiers:** compact assignment keys remain one character and relation labels one Unicode code point; the format remains unversioned and compatibility-only.
- **Raw/browser formula grammar:** raw parsing and browser preprocessing remain different. Browser comma removal and announcement-parenthesis rewriting are not a unified grammar.
- **BAPAL performance:** finite valuation-class enumeration remains exponential in the number of occurring classes, especially under nesting.
- **Future migration:** compatibility and migration policy beyond version 1 is not implemented. A future v2 or URL migration requires a separate contract and review.

## 16. Next planned round

**Round 6 — checked-in independent oracle, conformance corpus, and CI gate.**

Round 6 must not begin until Work Max closes the exact Round 5 implementation candidate. This log does not implement the oracle, corpus, CI configuration, manifests, or deliberate-mismatch gate.

## 17. Work Max package

Work Max should review this exact package:

### Repository and identities

- GitHub repository/branch: `Raycaesar/bapal`, `bapal-core`;
- Round 5 implementation candidate: `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`;
- primary Round 5 commit: `5a39a51f3069dde69194a11685e0445b7e98bf6d`;
- implementation range: `ab26863374464dd1466286a6c31d19d8e1a39a66..67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`;
- exact diff: 15 files, 3,243 insertions, 38 deletions, binary-patch SHA-256 `87ee7f3ad750efc66ad614f9140caec3400586960063b832f8c0325a3bbfdb0d`;
- any later commit containing only this log is documentary provenance and does not replace the implementation candidate.

### Required review artifacts

- `audit/08_BAPAL_ROUND_4_IMPORT_VISIBILITY_CLOSURE_AUDIT.md`;
- `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md`;
- `js/schema-v1.js`;
- `schemas/bapal-model-v1.schema.json`;
- `schemas/bapal-formula-v1.schema.json`;
- `scripts/check-model-schema-v1.js`;
- `scripts/check-formula-schema-v1.js`;
- `docs/SCHEMA_V1.md`;
- `API-Reference.md`;
- `AGENTS.md`;
- `docs/BAPAL_PLAYGROUND_SPEC.md`;
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`.

### Evidence package

- exact candidate diff and history;
- test-first missing-API gates;
- permanent model seed/counts and all nine groups;
- permanent formula exhaustive/generated counts and all ten groups;
- Prompt 5.3 independent model, formula, truth, identifier, alias, JSON Schema, and scoped-repair findings;
- all deterministic outputs in Section 12;
- all artifact hashes and protected-source findings in Section 13;
- clean-state evidence before log creation and after every validation command.

Work Max should audit `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` as the complete Round 5 implementation candidate and treat any later log-only commit as a documentary addition only.

## Audit 09 resource-identity repair addendum

This section was appended after Audit 09 and after the scoped resource-identity repair. It does not rewrite or imply that the pre-Audit Round 5 implementation log above already contained this later audit finding, repair identity, or rerun evidence.

### Audit and repair identities

- Audit 09 final reviewed HEAD: `ab10f64234a4d397582eab9ba68b434fea02ec26` (`ab10f642`).
- Audit 09 verdict: **PASS SUBJECT TO LOCAL REPAIRS**.
- Closure-blocking finding: **R5-A09-01 — stale JSON Schema resource identities**.
- Exact resource-identity repair commit: `edfbf32d07507bd43143bd518dbe3e2316a65979`.

### Resource identities and artifact hashes

| Artifact | Audit 09 `$id` | Repaired canonical `$id` | Audit 09 SHA-256 | Repaired SHA-256 |
|---|---|---|---|---|
| Model Schema v1 | `https://github.com/vezwork/modallogic/schemas/bapal-model-v1.schema.json` | `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` | `e520e6f498c6a2e5a8f6b1422f4820803a9d28e6e8a64a2f36e7ee7f07d9474f` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| Formula Schema v1 | `https://github.com/vezwork/modallogic/schemas/bapal-formula-v1.schema.json` | `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json` | `277d8a8d1414da8c11f0375703517d586652a1d61dbcafcc281845546cc979e6` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |

The repaired identifiers are separate, absolute HTTPS resource identities controlled by the project. They are independent of runtime `MPL.SchemaV1` API names and legacy compact/share URLs. Internal `$ref` values remain local fragments.

### Permanent tests strengthened

`scripts/check-model-schema-v1.js` and `scripts/check-formula-schema-v1.js` now read both tracked schema artifacts and pin both exact canonical `$id` constants. Each script additionally asserts the Draft 2020-12 dialect for its focal artifact, rejects any retained `vezwork/modallogic` text in that artifact, verifies that its focal `$id` is an exact absolute HTTPS URI, verifies that model and formula IDs differ, and walks every focal `$ref` to require a resolvable local fragment with at least one reference. The existing exact `format` and version checks remain in force.

### Complete deterministic rerun at the repair commit

The complete deterministic matrix was rerun at clean repair HEAD `edfbf32d07507bd43143bd518dbe3e2316a65979`. Every command exited `0`; `git status --short` was empty before the rerun and remained empty afterward.

| Command | Result |
|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; seed `0x5c4e4d41`; 100,000 generated; 15 adversarial identifiers; 27 invalid documents; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | PASS; 10 groups; seed `0x0f05ca1a`; 8,210 exhaustive ASTs; 100,000 generated; 16 invalid documents; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | PASS, 11/11 groups |
| `node scripts/check-atomic-model-import.js` | PASS; 9 minimized malformed cases; 16 compatibility cases; seed `0x041c0a11`; 100,000 generated; 3 startup cases |
| `node scripts/check-agent-rendering.js` | PASS, 5/5 groups |
| `node scripts/check-s5-invariants.js` | PASS, 12/12 groups; 531 relations; seed `0x0055f503`; 10,000 sequences / 200,000 operations |
| `node scripts/check-formula-roundtrip.js` | PASS; 108,246 AST round trips; 3 display smokes |
| `node scripts/check-structural-copy-regressions.js` | PASS, 11/11 groups |
| `node scripts/check-bapal-regression.js` | PASS, 8/8 checks |
| `node scripts/check-logic-regressions.js` | PASS, 6/6 checks |
| `node scripts/check-s5-closure.js` | PASS, 4/4 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS |
| `node scripts/check-report-links.js` | PASS, 5/5 links |
| `git diff --check` | PASS, no output |

The tracked random-report generator was not run and no report was regenerated.

### Runtime and closure disposition

The repair range `ab10f64234a4d397582eab9ba68b434fea02ec26..edfbf32d07507bd43143bd518dbe3e2316a65979` does not change the runtime codec implementation `js/schema-v1.js` or the supporting model/evaluator file `js/MPL.js`. `js/schema-v1.js` remains SHA-256 `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76`. The repair changes artifact identity, permanent assertions, and corresponding documentation/status records only; it does not alter model or formula acceptance, canonicalization, decode/encode behavior, logical truth, or legacy compact/share behavior.

Audit 09's runtime-codec PASS remains the applicable disposition, but Round 5 is still **OPEN — PENDING FOCUSED WORK MAX CLOSURE RECHECK**. This addendum does not close Round 5, P1-06, P1-07, or Stage 0, and it does not authorize Round 6.
