# BAPAL Round 5 Versioned Schema v1 Closure Audit

- **Repository:** `Raycaesar/bapal`
- **Branch:** `bapal-core`
- **Audit date:** 2026-08-08 UTC
- **Final audited HEAD:** `ab10f64234a4d397582eab9ba68b434fea02ec26`
- **Complete Round 5 implementation candidate:** `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4`
- **Primary Round 5 implementation commit:** `5a39a51f3069dde69194a11685e0445b7e98bf6d`
- **Mode:** concentrated, read-only closure audit

## 1. Executive verdict

**PASS SUBJECT TO LOCAL REPAIRS**

Audit 08 is correctly recorded and byte-preserved. P1-04 and P1-05 remain closed at `5c89ab5`; Round 4 remains closed; Stage 0, P1-06, and P1-07 remain open. No later Round 4 repair is claimed or present.

The Model Schema v1 and Formula Schema v1 runtime codecs pass the structural review, independent classification and canonicalization oracles, alias/mutation probes, identifier probes, bounded truth-preservation corpus, and every inherited deterministic regression. The schema bridge does not use the legacy compact model string, URL serialization, formula parser, or formula ASCII rendering as semantic transport. The audited knowledge representation preserves the evaluator's current character-wise semantics and does not claim that a multi-character epistemic label is one agent.

Round 5 is not yet closed because both machine-readable schemas carry stale canonical resource identities:

```text
https://github.com/vezwork/modallogic/schemas/bapal-model-v1.schema.json
https://github.com/vezwork/modallogic/schemas/bapal-formula-v1.schema.json
```

Those URIs name the old repository rather than `Raycaesar/bapal`, and both presently return GitHub `404 NOT_FOUND`. JSON Schema does not require an `$id` to be dereferenceable, and the defect does not affect the runtime codecs or local `$ref` resolution. It nevertheless falsely identifies newly introduced BAPAL v1 artifacts as resources in a repository that does not contain them. The permanent tests do not assert the exact `$id` values, and the Schema v1 documentation does not state them. This is a local artifact-metadata and coverage defect, not a semantic-code failure.

The required repair is narrow: assign both artifacts documented, stable, project-controlled canonical identifiers; add exact `$id` assertions to the permanent schema checks; update the Schema v1 documentation and implementation log/hashes; rerun the deterministic suite; and obtain a focused read-only recheck. Until then, Round 5 remains open and Round 6 is not authorized.

## 2. Exact commit sequence

The exact commits after certified Round 4 final HEAD `ab26863374464dd1466286a6c31d19d8e1a39a66` are:

| Order | Commit | Subject | Audit role |
|---:|---|---|---|
| 1 | `5a39a51f3069dde69194a11685e0445b7e98bf6d` | `close round 4 and implement round 5 versioned schemas` | Primary Round 5 implementation |
| 2 | `67fc1a2a8f253fcd97a88c9fe9f656de226a93b4` | `close round 4 refined` | Complete Round 5 implementation candidate |
| 3 | `ab10f64234a4d397582eab9ba68b434fea02ec26` | `add round 5 schema implementation log` | Final branch HEAD; log only |

The relevant history is linear:

```text
5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea  Round 4 implementation
  -> ab26863374464dd1466286a6c31d19d8e1a39a66  Round 4 final log-only HEAD
  -> 5a39a51f3069dde69194a11685e0445b7e98bf6d  primary Round 5 implementation
  -> 67fc1a2a8f253fcd97a88c9fe9f656de226a93b4  complete Round 5 candidate
  -> ab10f64234a4d397582eab9ba68b434fea02ec26  Round 5 log-only HEAD
```

`5a39a51..67fc1a2` adds the browser script load, README reference, and prototype-safe `MPL.Model` assignment adapter. It is implementation refinement, not a log-only change. Accordingly, `67fc1a2` is the complete Round 5 implementation commit.

`67fc1a2..ab10f64` changes exactly one path, `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md`, adding 536 lines. Final HEAD therefore differs from the complete implementation candidate only by the Round 5 log commit.

The implementation range `ab26863..67fc1a2` contains 15 files, 3,243 insertions, and 38 deletions. Its binary-diff SHA-256 is `87ee7f3ad750efc66ad614f9140caec3400586960063b832f8c0325a3bbfdb0d`. Candidate tree is `f1d0aad62b5aab49ceabd52349b8efa0541958cc`; final tree is `79e3c329235c61d7e987cfbb74633176229f232d`.

## 3. Audit 08 administrative result

**Result: PASS.**

- `audit/00_AUDIT_INDEX.md` indexes Audit 08 with its exact verdict and reviewed identities.
- Repository Audit 08 SHA-256 is `9e2354770e611252e33bb1b1226ef778d1c0c41a79a17e86ad748bcf431a864f`.
- The supplied Audit 08 artifact has the same hash and is byte-identical.
- P1-04 and P1-05 are recorded closed at `5c89ab5536d46eb8ed01f21eec2d8bd3d0e08dea`.
- Round 4 is recorded closed; Stage 0 remains open.
- Audit 08 expressly authorized Round 5 schema work without certifying a versioned schema itself.
- No commit after Audit 08 claims or implements an additional Round 4 repair. The Round 5 `MPL.js` adapter is accurately scoped to safe Schema v1 identifier materialization and does not alter the Round 4 compact parser's validation or atomic-commit control flow.

## 4. Schema architecture

`js/schema-v1.js` exposes a dependency-free `MPL.SchemaV1` layer after `js/MPL.js`. The browser loads it before `s5-policy.js` and `app.js`, but Round 5 adds no browser import/export control and does not migrate share URLs.

The boundaries are genuine:

| Boundary probe | Observed calls during schema round trips |
|---|---:|
| `Model.prototype.getModelString()` | 0 |
| `Model.prototype.loadFromModelString()` | 0 |
| `FormulaParser.prototype.parse()` | 0 |
| `Wff.prototype.ascii()` | 0 |

The model round trip continued to work with the compact-string methods replaced by throwing sentinels. Formula encode/decode continued to work with parser and ASCII conversion instrumented as throwing sentinels. Formula conversion maps between the stable tree and the existing object AST directly. The stable formula representation contains none of `annce_start`, `annce_end`, `kno_start`, or `kno_end`; those remain internal legacy AST details.

The compact URL format remains a distinct, explicitly lossy compatibility interface. This audit does not certify it as lossless and finds no URL migration claim.

## 5. Model Schema v1 audit

The exact envelope is:

```json
{
  "format": "bapal-model",
  "version": 1,
  "worlds": []
}
```

| Requirement | Finding |
|---|---|
| Stable world identity | World identity is the `worlds` array index. Encoding uses the raw stable state array rather than compact serialization. |
| Null slots | Explicit JSON `null` slots are preserved exactly. Programmatic JavaScript holes yield `undefined` and are rejected rather than silently converted to null. |
| True atoms | Each live world stores an explicit `trueAtoms` array. Exact supported string identity is preserved. |
| Transitions | Each record is `{target, agent}`; target and agent remain separate values. No identifier concatenation occurs. |
| Multi-digit targets | Safe nonnegative integer targets, including multi-digit indices, preserve their exact numeric target. |
| Canonical output | Atom arrays sort by Unicode scalar order. Transition arrays sort by numeric target and then agent scalar order. Envelope and record property order are deterministic. |
| Duplicate policy | Duplicate atoms and duplicate `(target, agent)` transitions are explicitly rejected; they are not silently deduplicated. |
| Semantic targets | Runtime validation rejects out-of-range targets and targets to null slots with a structured path to the caller's original transition index. |
| Errors | Failures return `{ok:false,error:{code,message,path,...}}`; missing/extra fields, type errors, malformed identifiers, duplicate values, and target errors are distinct. |
| Versioning | Unknown versions are rejected with `UNSUPPORTED_VERSION`; wrong formats are rejected. |
| Extra fields | Envelope, world, and transition objects are closed. |
| Ownership | Validation, encoding, and decoding return fresh canonical data. The input, returned document, and decoded model do not share mutable arrays or records. |

The Model Schema v1 identifier contract is nonempty, well-formed Unicode scalar text. It does not normalize, case-fold, concatenate, truncate, or reinterpret supported identifiers. This is broader than the legacy compact format by design.

## 6. Formula Schema v1 audit

The formula envelope is `{format:"bapal-formula", version:1, formula:<node>}`. The stable node vocabulary is exactly:

| Node | Exact fields beyond `type` |
|---|---|
| `atom` | `name` |
| `not` | `operand` |
| `box` | `operand` |
| `diamond` | `operand` |
| `bapal` | `operand` |
| `knowledge` | `agents`, `operand` |
| `announcement` | `precondition`, `body` |
| `and` | `left`, `right` |
| `or` | `left`, `right` |
| `implies` | `left`, `right` |
| `iff` | `left`, `right` |

Every node is closed and requires exactly its listed fields. Null or malformed descendants are rejected with stable JSON Pointer-like paths. Binary operand order is preserved. PAL precondition and body remain distinct. Knowledge agent order and duplicates are preserved. Unknown node types, versions, formats, cycles in programmatic objects, and extra fields are rejected. Validation and round trips do not mutate or alias the supplied tree.

Formula atom identifiers follow the explicit ASCII-word policy `[A-Za-z0-9_]+`. Knowledge `agents` is a nonempty ordered array whose individual entries each match `[A-Za-z0-9_]`. These deliberately different policies match the current formula representation and evaluator; they are not broadened to match the Model Schema relation-label policy.

## 7. Knowledge-semantics boundary

This boundary is correctly represented and narrowly documented.

The current evaluator applies `token.prop.split('')` for knowledge. Therefore:

| Legacy expression | Current semantic units | Stable Formula Schema v1 |
|---|---|---|
| `K{a}p` | `a` | `agents: ["a"]` |
| `K{ab}p` | `a`, then `b` | `agents: ["a", "b"]` |
| `K{abc}p` | `a`, then `b`, then `c` | `agents: ["a", "b", "c"]` |

`agents:["abc"]` is rejected. The audit does **not** certify `abc` as one epistemic agent. A Model Schema v1 transition label may be an arbitrary supported multi-character string, while a Formula Schema v1 knowledge unit is one ASCII word character. The documentation makes this asymmetry explicit, and the runtime enforces it consistently.

## 8. Independent Model Schema fuzz

A temporary oracle outside the repository independently validated and canonicalized documents. It did not call production validation or encoding for its expected result. Generation was balanced 50/50 between valid and invalid cases and used a seed different from the permanent suite.

| Metric | Result |
|---|---:|
| Seed | `2769414579` (`0xa511e9b3`) |
| Total documents | 250,000 |
| Independently valid | 125,000 |
| Independently invalid | 125,000 |
| Production classification mismatches | 0 |
| Canonical mismatches after `decode -> encode` | 0 |
| Input-mutation failures | 0 |
| Alias failures | 0 of 5,000 dedicated probes |
| Valid cases with explicit sparse/null layout | 108,848 |
| Preserved null slots | 467,187 |
| Valid models with multi-digit targets | 78,978 |
| Invalid repeated-atom cases | 5,208 |
| Invalid repeated-transition cases | 5,208 |
| Cases exercising Unicode identifiers | 117,126 |
| Cases exercising prototype-sensitive names | 113,133 |
| Minimized counterexamples | 0 |

The corpus covered 0–30 world slots, all-null and mixed live/null arrays, multi-digit live targets, repeated atoms and transitions, wrong versions and formats, extra fields, invalid and null targets, multi-character atoms and agents, Unicode, punctuation, prototype-sensitive names, markup-shaped strings, control text, and malformed surrogate strings. For every accepted document, the production `decode -> encode` result exactly equaled the independently expected canonical document. Every independently invalid document was rejected.

## 9. Independent Formula Schema fuzz

A second independent generator and validator used a different deterministic seed. Stable ASTs were constructed without production encode and malformed descendants were injected across every constructor.

| Metric | Result |
|---|---:|
| Seed | `1675113877` (`0x63d83595`) |
| Classification corpus | 250,000 documents |
| Independently valid / invalid | 125,000 / 125,000 |
| Classification mismatches | 0 |
| Required valid round-trip counter | 100,000 stable ASTs |
| Accepted documents actually decoded and re-encoded | 125,000 |
| Canonical mismatches | 0 |
| Input-mutation failures | 0 |
| Alias failures | 0 of 5,000 dedicated probes |
| Minimized counterexamples | 0 |

Root-node coverage across the 125,000 independently valid classification cases was:

| Node | Count |
|---|---:|
| `atom` | 46,774 |
| `not` | 7,816 |
| `box` | 7,934 |
| `diamond` | 7,965 |
| `knowledge` | 7,675 |
| `and` | 7,782 |
| `or` | 7,903 |
| `implies` | 7,873 |
| `iff` | 7,803 |
| `announcement` | 7,797 |
| `bapal` | 7,678 |

Every valid stable tree survived `production decode -> production encode` as exact stable canonical form. The dedicated requirement counter stopped at 100,000, while the same structural comparison ran for all 125,000 accepted documents. Invalid coverage included missing, extra, wrong-typed, null, cyclic, and malformed descendant fields at every node family, invalid atom identifiers, invalid knowledge units, wrong envelopes, and wrong versions.

## 10. Truth preservation

An independently assembled finite-model corpus compared the original legacy `MPL.Wff` truth result with the truth result of the schema-decoded formula after schema model round trip, at every live world.

| Metric | Result |
|---|---:|
| Seed | `3518319154` (`0xd1b54a32`) |
| Formula documents | 3,200 |
| Models | 8 |
| Live-world points | 32 |
| Pointed truth comparisons | 102,400 |
| Evaluator calls | 204,800 |
| BAPAL-rooted formulas | 806 |
| Maximum BAPAL nesting | 2 |
| Maximum live worlds per model | 4 |
| Maximum valuation classes | 4 |
| Maximum truthful announcement subsets | 8 |
| Truth mismatches | 0 |

The corpus included atoms, Boolean constructors, ordinary box/diamond, knowledge, knowledge shorthand, PAL, BAPAL, nested knowledge/PAL/BAPAL, sparse models, S5 models, and non-S5 models. It exercised 1,402 nested-dynamic and 478 knowledge-shorthand formulas. The BAPAL bounds above are explicit computational bounds; this result is empirical evidence, not a proof.

## 11. Identifier safety

| Identifier category | Exact audited policy and result |
|---|---|
| Model atoms | Any nonempty well-formed Unicode scalar string; exact preservation. |
| Model transition agents | Any nonempty well-formed Unicode scalar string; exact preservation. |
| Formula atoms | Nonempty ASCII word strings `[A-Za-z0-9_]+`; exact preservation. |
| Formula knowledge units | Exactly one ASCII word character `[A-Za-z0-9_]` per array element; order and duplicates preserved. |

Fifty-four dedicated boundary probes included `foo`, `bar_baz`, `atom10`, `alice`, `agent_b`, `__proto__`, `constructor`, `prototype`, `toString`, quotes, angle brackets, markup-shaped strings, newlines, NUL/control characters, BMP Unicode, astral Unicode, combining sequences, and composed/decomposed Unicode forms. Model identifiers preserved each supported value exactly. Formula atoms preserved the ASCII-word subset and returned structured rejection for punctuation, markup, controls, and non-ASCII text. Formula knowledge arrays accepted only the one-character ASCII-word units and rejected multi-character entries such as `alice`, `agent_b`, and `__proto__`.

Empty model identifiers and lone high or low surrogate JavaScript strings were rejected with structured errors. No silent Unicode normalization, truncation, concatenation, or case folding occurred. Composed and decomposed sequences remained distinct. Prototype-sensitive model atoms were stored in null-prototype assignments; no prototype mutation, inherited-property truth, or property collision occurred.

## 12. JSON Schema artifact assessment

Both artifacts are valid JSON and declare Draft 2020-12. Their titles are stable and descriptive:

- `BAPAL Semantic Model Interchange v1`
- `BAPAL Formula Interchange v1`

Dependency-free structural inspection found four model-local and fourteen formula-local references, with zero unresolved references. Recursion, constants, primitive types, required fields, identifier patterns, `uniqueItems`, and `additionalProperties:false` match the runtime's structural contract.

The documented runtime-only model constraints are intentional:

- transition target must be within the current `worlds` range;
- transition target must identify a live rather than null world;
- model identifiers must not contain isolated UTF-16 surrogate code units.

Static JSON Schema is not treated as authoritative for those semantic constraints. Formula structural classification showed no additional intentional artifact/runtime category difference in the audited boundary corpus.

No compatible JSON Schema validator is installed in this audit environment: neither the available Python runtimes nor Node resolution provided `jsonschema`, Ajv, Hyperjump, or another compatible validator. No dependency was installed. The implementation log's historical statement that Python `jsonschema` 4.10.3 was available and passed both meta-schema checks therefore could not be independently replayed in this environment; source inspection and dependency-free reference/structure checks found no dialect or recursion defect.

### Closure-blocking local finding R5-A09-01

Both `$id` values name nonexistent files in `vezwork/modallogic`, not canonical Schema v1 resources controlled by the audited project. GitHub returned `404 NOT_FOUND` for both. Although all `$ref` values are local and runtime behavior is unaffected, these identities fail the requested stable artifact-identity audit. The permanent checks do not pin the exact IDs, and `docs/SCHEMA_V1.md` does not state them.

Required local repair:

1. choose and apply a stable, project-controlled canonical URI for each v1 artifact;
2. assert the two exact `$id` values in the permanent model/formula schema scripts;
3. state the identifiers in `docs/SCHEMA_V1.md` and keep API documentation consistent;
4. update the Round 5 implementation log's hashes and exact repair history;
5. rerun the complete deterministic suite and obtain a focused closure recheck.

## 13. Deterministic command results

Every required command ran at final HEAD `ab10f64` and exited `0`.

| Command | Result |
|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; seed `0x5c4e4d41`; 100,000 generated; 15 identifier cases; 27 invalid documents; 3,454 truth comparisons |
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

The repository was clean before and after. The aggregate tracked-file SHA-256 stayed `3679f02778795b9c4a242878f5ce3f16b6074a08998edff6a0dccb3298300146`; the reports aggregate stayed `90f156009535d9ea07951b2822a6462353abe42a8e3d66522461469d8752379f`. The tracked random-report generator was not run, and no tracked report or repository file was rewritten.

The checked-in schema scripts generate their documents locally with deterministic seeds, print replayable diagnostics, compare structures directly, include invalid cases without skip paths, use neither compact model strings nor formula ASCII as an oracle, and contain no tracked-file writes. They are strong implementation regressions. They are not the independent checked-in conformance oracle required by P1-07.

The external independent audit script remained outside the repository and has SHA-256 `05f31795717effe84fb1c078f09a7e6ba79170671343229a66f0bb15b04c18d1`.

## 14. Prior-repair integrity

The exact Round 5 candidate comparison has no diff for:

- `lib/formula-parser.min.js`;
- `js/s5-policy.js`;
- `js/app.js`;
- `css/app.css`;
- `scripts/random-bapal-evaluation.js`;
- `reports/`.

The formula parser, Round 2 printer closure, `_truth`, the Round 1 `deepCopy()` algorithm, S5 closure/policy, raw-label rendering, Round 4 atomic compact import, semantic-state inspector, report generator, and tracked reports are unchanged. All corresponding inherited checks pass.

`js/MPL.js` has one deliberate Round 5 representation adapter: assignments are copied into `Object.create(null)`, only own enumerable keys whose value is exactly `true` are retained, editing uses `Object.keys`, and valuation checks own properties equal to `true`. This is required for Schema v1 model atoms such as `__proto__` and `constructor`. It does not alter Boolean, modal, knowledge, PAL, or BAPAL evaluator clauses, and the independent truth corpus found no regression.

No P0-01 or P1-01 through P1-05 implementation was reopened.

## 15. Documentation and implementation-log accuracy

The behavioral content of `docs/SCHEMA_V1.md` and the Schema v1 section of `API-Reference.md` matches the runtime codec: envelopes, node vocabulary, canonical sorting, duplicate policy, identifiers, ownership, structured errors, semantic target checks, knowledge-unit semantics, and the separation from compact/ASCII transport are accurate.

`AGENTS.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, and `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` consistently state that Round 5 is implemented pending audit. They retain P1-06, P1-07, and Stage 0 as open. The legacy compact limitations remain explicit; no URL migration or browser control is claimed; no multi-character formula-agent meaning is claimed.

The one documentation gap is artifact identity: the exact `$id` values are not documented, which allowed the stale upstream identities to escape the permanent tests.

The Round 5 implementation log is otherwise accurate against history and source:

- it distinguishes primary commit `5a39a51` from complete candidate `67fc1a2`;
- final history confirms its prediction that a later commit contains only the log;
- candidate tree, 15-file diff counts, binary-diff SHA-256, protected-path scope, and command counts match;
- schema/source/audit/report hashes match, including model schema `e520e6f498c6a2e5a8f6b1422f4820803a9d28e6e8a64a2f36e7ee7f07d9474f`, formula schema `277d8a8d1414da8c11f0375703517d586652a1d61dbcafcc281845546cc979e6`, and runtime `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76`;
- its test seeds, counts, scoped structured-error-path repair, API namespace, and browser/UI non-migration scope match the implementation;
- its `jsonschema` execution is a historical environment record that was not replayable here, not a contradicted result.

The log does not identify or disclaim the stale `$id` values. After repair it must record the new identifiers, changed hashes, repair commit, and rerun outputs.

## 16. Exact closure disposition

| Item | Disposition |
|---|---|
| Audit 08 administration | Preserved; PASS |
| P1-04 | Remains closed at `5c89ab5` |
| P1-05 | Remains closed at `5c89ab5` |
| Round 4 | Remains closed |
| Model Schema v1 runtime codec | Technical audit passed under the exact identifier/validation contract above |
| Formula Schema v1 runtime codec | Technical audit passed under the exact identifier/validation contract above |
| Machine-readable Schema v1 artifacts | Local `$id` repair and coverage/documentation update required |
| Round 5 | Remains open pending the focused repair and recheck |
| Legacy compact URLs | Not certified as lossless |
| Multi-character formula-agent semantics | Not certified |
| P1-06 | Open |
| P1-07 | Open |
| Stage 0 | Open |

The local repair does not require reopening runtime codec design, formula semantics, truth preservation, prior repairs, or the foundational semantic audit unless the repair changes more than resource identity, its assertions, and corresponding documentation/log evidence.

## 17. Remaining open findings

1. **R5-A09-01 — stale JSON Schema resource identities:** closure-blocking local Round 5 repair described in Section 12.
2. **P1-06 — terminology:** still open and outside Round 5.
3. **P1-07 — independent oracle/conformance corpus/CI:** still open. The audit's external oracle is evidence, not a checked-in CI gate.
4. **Stage 0:** remains open.

The legacy compact identifier limits, raw/browser formula grammar difference, BAPAL performance bounds, absence of backend/database/general migration framework, and absence of a v2 migration policy remain explicit nonclaims rather than Round 5 regressions.

## 18. Next-round authorization

**Round 6 is not authorized at this HEAD.**

Authorization becomes appropriate after a focused read-only recheck confirms that R5-A09-01 is repaired, both exact canonical IDs are permanently asserted and documented, hashes/history are accurate, the complete deterministic suite remains green, and the worktree/reports remain unchanged by validation. At that point Round 5 may be closed narrowly for Model Schema v1 and Formula Schema v1 under the audited contracts, while keeping legacy compact URLs uncertified, formula knowledge semantics character-wise, P1-06 open, P1-07 open until its own completion, and Stage 0 open.

The then-authorized Round 6 scope is the checked-in independent oracle, conformance corpus, deliberate-mismatch detection, manifests, and CI gate. It must not broaden schema identifiers, formula-agent semantics, or legacy URL claims without separate specification and audit.
