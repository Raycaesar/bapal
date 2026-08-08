# BAPAL Round 5 Schema v1 Canonical Resource-Identity Closure Recheck

- **Repository:** `Raycaesar/bapal`
- **Branch:** `bapal-core`
- **Audit date:** 2026-08-08 UTC / 2026-08-09 UTC+08
- **Audit 09 final reviewed / pre-repair HEAD:** `ab10f64234a4d397582eab9ba68b434fea02ec26`
- **Canonical-ID repair commit:** `edfbf32d07507bd43143bd518dbe3e2316a65979`
- **Documentary follow-up / final audited HEAD:** `8451a1e289eb8e6efa19887e35955d3d8772c8d8`
- **Mode:** focused, read-only closure recheck

## 1. Executive verdict

**PASS — ROUND 5 VERSIONED SCHEMA V1 CLOSED; PROCEED TO ROUND 6**

R5-A09-01 is closed. The two machine-readable Schema v1 artifacts now use the exact required, distinct, project-controlled canonical resource identities:

```text
https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json
https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json
```

The repair changes only the two artifact identities, permanent identity checks, and corresponding documentation/status records. The accepted structural languages of both schemas are otherwise byte-semantically unchanged: after removing `$id`, each pre-repair JSON document is exactly equal to its repaired counterpart. Draft 2020-12, every local `$ref`, all definitions, constraints, constants, and closed-object policies are unchanged.

Both canonical resources were dereferenced from GitHub Pages during this recheck. Each returned HTTP `200` with `application/json`; each deployed body was byte-identical to the corresponding artifact at final HEAD.

The strengthened permanent tests genuinely detect recurrence: both old tests pass at `ab10f64` despite the stale IDs, while restoring the old model or formula `$id` in separate external copies of the current tree makes the corresponding current test fail with exit status `1` on the exact-ID assertion.

Audit 09's passed runtime-codec, canonicalization, ownership, identifier, truth-preservation, and character-wise knowledge-semantics conclusions are preserved rather than reopened or broadened. Legacy compact URLs remain uncertified as lossless. P1-06, P1-07, and Stage 0 remain open. Round 6 independent-oracle, conformance-corpus, and CI work is authorized.

The target repository was not edited. All temporary mutation and historical tests ran in external, untracked archives.

## 2. Scope and closure boundary

This recheck reviews only Audit 09 finding **R5-A09-01 — stale JSON Schema resource identities** and the documentation/tests required to close it.

It does not recertify or broaden:

- the legacy compact model/share URL format;
- formula knowledge beyond the evaluator's existing character-wise shorthand;
- model or formula identifiers beyond Audit 09's exact supported policies;
- satisfiability, validity, soundness, completeness, or decidability;
- P1-06 result terminology;
- P1-07 independent-oracle/CI infrastructure; or
- Stage 0 as a whole.

No Round 6 implementation is present in the reviewed post-`ab10f64` range.

## 3. Exact commit sequence

The branch history after Audit 09 final reviewed HEAD is linear and contains exactly two commits:

```text
ab10f64234a4d397582eab9ba68b434fea02ec26
  -> edfbf32d07507bd43143bd518dbe3e2316a65979
  -> 8451a1e289eb8e6efa19887e35955d3d8772c8d8
```

| Order | Commit | Subject | Exact role |
|---:|---|---|---|
| 1 | `edfbf32d07507bd43143bd518dbe3e2316a65979` | `repair round 5 schema canonical resource ids` | Canonical-ID artifact repair, exact permanent checks, Audit 09 preservation/indexing, and associated status/API/schema documentation |
| 2 | `8451a1e289eb8e6efa19887e35955d3d8772c8d8` | `record round 5 schema id repair` | Documentary follow-up only; adds the Audit 09 addendum to revision 06 and creates revision 07 |

The repair commit is the direct child of `ab10f64`. It changes 11 files with 562 insertions and 18 deletions. The final follow-up is the direct child of the repair commit and changes exactly two paths with 245 insertions:

- `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md`;
- `revision/07_ROUND_5_SCHEMA_RESOURCE_ID_REPAIR_LOG.md`.

Final HEAD tree is `eab4eafba24d9fc84e8d6119946e60416cf56e6b`; repair-commit tree is `58e29936dfdb4ccd5963fb097be38b532e19232d`. The tree difference consists solely of those two documentary paths.

## 4. Audit 09 administration

**Result: PASS.**

- The repository copy of `audit/09_BAPAL_ROUND_5_VERSIONED_SCHEMA_CLOSURE_AUDIT.md` has SHA-256 `26a630d610f38be1b48caf81c6b51dfbe29e0d63bd5cb82b4dcd9d84e05bfd88`.
- It is byte-identical to the previously delivered Audit 09 artifact with the same hash.
- `audit/00_AUDIT_INDEX.md` records the exact Audit 09 verdict, primary and complete Round 5 candidates, final reviewed HEAD, sole blocker R5-A09-01, pending-recheck status, open P1-06/P1-07/Stage 0, and blocked Round 6 gate.
- Audit 09 is correctly added after its reviewed code HEAD; it is not falsely represented as already present at `ab10f64`.
- The pre-recheck documents consistently keep Round 5 open pending this focused recheck. They do not self-certify closure or authorize Round 6 prematurely.

## 5. Reproduction of the pre-repair defect

At exact commit `ab10f64234a4d397582eab9ba68b434fea02ec26`, the artifacts contain:

| Artifact | Pre-repair `$id` | Pre-repair SHA-256 |
|---|---|---|
| Model Schema v1 | `https://github.com/vezwork/modallogic/schemas/bapal-model-v1.schema.json` | `e520e6f498c6a2e5a8f6b1422f4820803a9d28e6e8a64a2f36e7ee7f07d9474f` |
| Formula Schema v1 | `https://github.com/vezwork/modallogic/schemas/bapal-formula-v1.schema.json` | `277d8a8d1414da8c11f0375703517d586652a1d61dbcafcc281845546cc979e6` |

Those are the stale upstream identities identified by Audit 09.

Source inspection of both `ab10f64` permanent schema scripts found none of the following:

- an exact model or formula schema-ID constant;
- either required `raycaesar.github.io` identity;
- the stale `vezwork/modallogic` text; or
- any `$id` assertion.

The omission was also reproduced executably. In a `.git`-free external archive of `ab10f64`, both old commands exited `0` while the stale IDs remained present:

| Historical command | Result with stale IDs |
|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; 100,000 generated models |
| `node scripts/check-formula-schema-v1.js` | PASS; 10 groups; 8,210 exhaustive and 100,000 generated formulas |

The old checked-in tests therefore did not enforce canonical resource identity.

## 6. Exact artifact repair

At final HEAD the artifacts contain exactly the required identities:

| Artifact | Canonical `$id` | Repaired SHA-256 |
|---|---|---|
| Model Schema v1 | `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` |
| Formula Schema v1 | `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` |

Independent checks establish all requested properties:

1. Neither current artifact contains `vezwork/modallogic`.
2. Both IDs parse as exact absolute HTTPS URIs.
3. Both lie under the `raycaesar.github.io/bapal` project namespace controlled by repository owner `Raycaesar`.
4. The IDs are distinct.
5. Both retain `https://json-schema.org/draft/2020-12/schema` as `$schema`.
6. Removing `$id` from the old and new parsed documents yields exact structural equality for each artifact.
7. The model artifact retains four local references; the formula artifact retains fourteen. Every reference remains a local `#/...` fragment and resolves within its own artifact.
8. No runtime format/version constant, required field, type, bound, pattern, uniqueness rule, or `additionalProperties` policy changed.

The repair changes resource identity, not the structural validation language or runtime codec behavior.

## 7. Deployment dereference

Network dereference succeeded during this audit:

| Resource | HTTP/content result | Deployed SHA-256 | Repository match |
|---|---|---|---|
| Model canonical ID | HTTP `200`; `application/json; charset=utf-8` | `c46074541d1ac27fa369ffbfddf27d21b11ec88f139440511260141136532aaf` | Exact |
| Formula canonical ID | HTTP `200`; `application/json; charset=utf-8` | `7446ce2654f8a62ac475188dd20782944a344662a8e1f624addedc6ae609377a` | Exact |

The canonical resources are therefore not merely syntactically valid identities: the deployed resources currently resolve to the exact reviewed bytes. This is useful deployment evidence, although dereferenceability is not made a JSON Schema validity requirement.

## 8. Permanent regression coverage

`scripts/check-model-schema-v1.js` and `scripts/check-formula-schema-v1.js` now both read the two tracked artifacts and pin the exact two canonical constants.

Collectively, the scripts permanently enforce:

- exact Model Schema v1 `$id`;
- exact Formula Schema v1 `$id`;
- Draft 2020-12 on each focal artifact;
- distinct model/formula IDs;
- absolute canonical HTTPS syntax;
- absence of `vezwork/modallogic` from each focal artifact;
- nonempty, local, resolvable `$ref` sets;
- unchanged `bapal-model` / `bapal-formula` format constants; and
- unchanged version constant `1`.

### External old-ID mutation test

Two independent, `.git`-free copies of final HEAD were used. Only one `$id` was restored in each copy:

| Mutant | Corresponding command | Result |
|---|---|---|
| Model `$id` restored to old upstream URI | `node scripts/check-model-schema-v1.js` | Exit `1`; exact actual/expected ID assertion failed |
| Formula `$id` restored to old upstream URI | `node scripts/check-formula-schema-v1.js` | Exit `1`; exact actual/expected ID assertion failed |

The mutation test establishes that the new gates are active rather than documentary-only.

## 9. Documentation and repair-log accuracy

**Result: PASS.**

- `docs/SCHEMA_V1.md` states both exact IDs and distinguishes resource identity from runtime API names and compact/share URLs.
- `API-Reference.md` states the same two IDs and the same local-fragment, dereferenceability, and review policy.
- `AGENTS.md`, `docs/BAPAL_PLAYGROUND_SPEC.md`, and `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` accurately state Audit 09's PASS-subject-to-repair status, the implemented local repair, the pending focused recheck, and the still-open P1-06/P1-07/Stage 0 boundary.
- `revision/06_ROUND_4_CLOSURE_AND_ROUND_5_SCHEMA_IMPLEMENTATION_LOG.md` preserves the original implementation history and appends a clearly later Audit 09/resource-ID addendum.
- `revision/07_ROUND_5_SCHEMA_RESOURCE_ID_REPAIR_LOG.md` records the exact repair commit, old/new IDs, old/new artifact hashes, permanent assertions, deterministic results, protected-source range, and scope limitations accurately.
- Revision 07's note that its two revision-log edits were uncommitted at the time is reconciled by the subsequent documentary-only commit `8451a1e`; it does not misidentify that later commit as the repair.
- No document claims URL migration, lossless compact serialization, multi-character epistemic-agent semantics, P1-06/P1-07 closure, Stage 0 closure, or pre-recheck Round 5 closure.

No local documentary repair is required.

## 10. Protected-source and prior-repair integrity

The complete repair range `ab10f64..8451a1e` has no diff for:

- `js/schema-v1.js`;
- `js/MPL.js`;
- `lib/formula-parser.min.js`;
- `js/s5-policy.js`;
- `js/app.js`;
- `css/app.css`;
- `scripts/random-bapal-evaluation.js`; or
- any file under `reports/`.

`js/schema-v1.js` remains SHA-256 `7a29b93d11e45ca8261047b9b73175ed931beff42ce65a8c0f42f6bcdf9f6b76`, exactly as recorded by Audit 09.

Consequently, the scoped repair did not alter:

- runtime model/formula codec acceptance, canonicalization, encode/decode, or ownership;
- the formula parser or Round 2 printer closure;
- `_truth` or Boolean/modal/knowledge/PAL/BAPAL evaluation;
- Round 1 structural `deepCopy()`;
- S5 closure or editing policy;
- Round 4 atomic compact import;
- semantic-state inspection;
- raw-label SVG rendering;
- report generation; or
- tracked reports.

No concrete regression requires reopening Audit 09's passed runtime findings or any prior round.

## 11. Deterministic rerun

All required commands ran at final HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8` and exited `0`.

| Command | Observed result |
|---|---|
| `node scripts/check-model-schema-v1.js` | PASS; 9 groups; seed `0x5c4e4d41`; 100,000 generated; 15 adversarial identifiers; 27 invalid documents; 3,454 truth comparisons |
| `node scripts/check-formula-schema-v1.js` | PASS; 10 groups; seed `0x0f05ca1a`; 8,210 exhaustive; 100,000 generated; maximum depth 40; 16 invalid documents; 724 truth comparisons |
| `node scripts/check-semantic-state-visibility.js` | PASS; 11/11 groups |
| `node scripts/check-atomic-model-import.js` | PASS; 9 malformed, 16 compatibility, 100,000 fuzz, 3 startup cases |
| `node scripts/check-agent-rendering.js` | PASS; 5/5 groups |
| `node scripts/check-s5-invariants.js` | PASS; 12/12 groups; 531 exhaustive relations; 10,000 sequences / 200,000 operations |
| `node scripts/check-formula-roundtrip.js` | PASS; 108,246 AST round trips; 3 display smokes |
| `node scripts/check-structural-copy-regressions.js` | PASS; 11/11 groups |
| `node scripts/check-bapal-regression.js` | PASS; 8/8 checks |
| `node scripts/check-logic-regressions.js` | PASS; 6/6 checks |
| `node scripts/check-s5-closure.js` | PASS; 4/4 checks |
| `node scripts/check-bapal-valuation-class.js` | PASS |
| `node scripts/check-report-links.js` | PASS; 5/5 links |
| `git diff --check` | PASS; no output |

Integrity gates:

| Gate | Before | After | Result |
|---|---|---|---|
| HEAD | `8451a1e289eb8e6efa19887e35955d3d8772c8d8` | same | PASS |
| Worktree | clean | clean | PASS |
| All tracked-file aggregate SHA-256 | `250f776a6545cf724eec5d96662f6390ad451724e813d4c21b7c1d787f02f1db` | same | PASS |
| Tracked-reports aggregate SHA-256 | `90f156009535d9ea07951b2822a6462353abe42a8e3d66522461469d8752379f` | same | PASS |
| `reports/random-bapal-evaluation.html` SHA-256 | `88556aba98a89959ab0fa131eac4b4836dcc9661735cfe1fe65cf4399cf5ce34` | same | PASS |

The tracked random-report generator was not run. No report or repository path was regenerated or modified.

## 12. Exact closure disposition

### Closed now

- **R5-A09-01 — CLOSED** at canonical-ID repair commit `edfbf32d07507bd43143bd518dbe3e2316a65979`.
- **Round 5 Versioned Schema v1 — CLOSED** at final reviewed HEAD `8451a1e289eb8e6efa19887e35955d3d8772c8d8`.
- Model Schema v1 is certified only under canonical resource ID `https://raycaesar.github.io/bapal/schemas/bapal-model-v1.schema.json` and Audit 09's exact structural/runtime identifier and validation contract.
- Formula Schema v1 is certified only under canonical resource ID `https://raycaesar.github.io/bapal/schemas/bapal-formula-v1.schema.json` and Audit 09's exact stable-AST, formula-identifier, validation, and character-wise knowledge contract.

### Preserved limitations and open findings

- Legacy compact model/share URLs remain uncertified as lossless for general identifiers.
- Formula knowledge remains character-wise: `K{abc}p` corresponds to `agents:["a","b","c"]`; this audit does not certify `"abc"` as one epistemic agent.
- Model relation labels may remain broader than Formula Schema v1 knowledge units under the documented v1 asymmetry.
- P1-06 remains **OPEN**.
- P1-07 remains **OPEN**.
- Stage 0 remains **OPEN**.

## 13. Next-round authorization

**Round 6 is authorized.**

The authorized scope is the separately reviewable independent oracle, conformance corpus, deliberate-mismatch detection, reproducible manifests, and CI gate described in the Stage 0 register. This authorization does not itself close P1-07 or permit unrelated feature, terminology, performance, backend, database, or architecture work.

