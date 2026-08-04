# Round 1 Documentary Repair and Round 2 Implementation Log

## 1. Verdict

**PASS — READY FOR WORK MAX CLOSURE AUDIT**

This verdict is limited to the committed Round 1 documentary repairs and the local Round 2 implementation candidate. It does not close P1-01, the other P1 findings, or Stage 0; Work Max closure review is still required.

## 2. Repository identity

- **Repository:** `Raycaesar/bapal` (`https://github.com/Raycaesar/bapal.git`)
- **Branch:** `bapal-core`
- **Exact implementation commit at pre-log HEAD:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` (`close round 1 docs and implement round 2 parser printer closure`)
- **Implementation commit date:** 2026-08-04T09:02:07+08:00
- **Original foundational baseline:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`
- **Round 1 implementation commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2` (`new round check`), committed 2026-08-04T06:58:23+08:00
- **Round 1 closure audit:** `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`
- **Audit 04 verdict:** **PASS SUBJECT TO TWO LOCAL DOCUMENTARY REPAIRS**
- **Foundational audit date:** 2026-08-03
- **Audit 04 date:** 2026-08-03 UTC / 2026-08-04 UTC+08
- **Log-generation date:** 2026-08-04 UTC+08
- **Node:** `v24.18.0`
- **Clean-state verification:** the initial `git status --short` produced no output. It again produced no output after the deterministic validation and temporary independent review, immediately before this log was created.

The implementation candidate described throughout this log is exactly `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`. A later log-only commit may place this file on `bapal-core`; that commit will add documentary evidence only and will not change the implementation candidate identified here.

## 3. Round 1 documentary repairs

### DOC-01

`revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md` previously retained stale pre-commit metadata. It was corrected to:

- identify `55f557c210a6a6ad78c928bb1b94b2010929d2a2` as the Round 1 implementation candidate and the exact HEAD reviewed by Work Max;
- record that the candidate was committed and that its checkout was clean before and after review;
- add the Round 1 closure-audit date, Audit 04 verdict, technical closure, still-open legacy serializer boundary, and Stage 0 status;
- replace the former “ready for audit” wording with the narrow Audit 04 closure result;
- update the claims and Work Max package to name the actual candidate commit.

The original command transcript was not rewritten. Section 9 of `revision/01` was relabelled **Historical pre-commit local validation transcript**, and a note now explains that its baseline HEAD, dirty status, diff summaries, and tracked-only `git diff --check` describe the pre-commit workspace rather than the committed Work Max candidate.

### DOC-02

`AGENTS.md` and `docs/BAPAL_PLAYGROUND_SPEC.md` now distinguish two boundaries that the earlier text conflated:

- internal PAL/BAPAL copying is structural at `55f557c` and preserves the identities covered by the audited Round 1 contract; and
- the external legacy compact serialization/import/share format is unchanged, lossy outside the audited one-character compatibility subset, and still open.

`AGENTS.md` replaced the former four-layer boundary with five explicit layers and added Audit 04 to the read-only audit instructions. The specification added a post-baseline Round 1 delta while retaining the old serializer-dependent behavior as a historical account of baseline `92a4ba6`; its formula-interface, identifier, representation, and defect-status language was adjusted accordingly. Neither document turns the structural-copy result into an end-to-end multi-character-agent or serializer claim.

### Administrative closure

- `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` was added to the repository and indexed in `audit/00_AUDIT_INDEX.md`.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` marks P0-01 **CLOSED AT `55f557c` — WORK MAX AUDIT 04** for internal semantic copying and records the narrow closure evidence.
- The register retains the legacy compact boundary as open, P1-01 as implemented but pending closure audit, P1-02 through P1-07 as open, and Stage 0 as open.

## 4. Round 2 objective

Close P1-01 parser/printer non-closure for supported AST printing, beginning with:

```text
[(K{a}p)]q
```

The acceptance target is raw `parse(print(AST)) = AST`, not unification of every browser and raw-parser input form.

## 5. Pre-repair reproduction

The raw parser accepted `[(K{a}p)]q`. Its AST was:

```text
{"annce_start":{"annce_end":[{"kno_start":{"kno_end":[{"prop":"a"},{"prop":"p"}]}},{"prop":"q"}]}}
```

At parent commit `55f557c`, the ASCII printer emitted `[K{a}p]q`. Passing that output directly back to `MPL.Wff` failed with `Error: Invalid JSON for formula!`.

The browser masked this defect because `js/app.js` rewrites every `[` to `[(` and every `]` to `)]` before constructing `MPL.Wff`; the invalid printed form was therefore repaired incidentally at that surface. The raw constructor performs no such preprocessing. Because `Wff.ascii()` is the printer/API representation and its output could not be consumed by the same raw constructor, the problem remained a printer/API closure defect even when browser evaluation appeared to work.

## 6. Test-first evidence

The dedicated permanent suite is `scripts/check-formula-roundtrip.js`. Running that committed suite against the pre-repair `55f557c` version of `js/MPL.js` exited `1` with this exact initial output:

```text
FAIL: minimized regression — knowledge-rooted PAL precondition
input: [(K{a}p)]q
printed ASCII: [K{a}p]q
parser error: Error: Invalid JSON for formula!
```

The permanent suite contains:

- 1 minimized regression;
- 10 already-safe canonical-output cases;
- 25 fixed difficult formulas covering direct and nested PAL, knowledge, all ordinary unary prefixes, Boolean operators, BAPAL, multi-character atom identifiers, and announcement precondition/scope combinations;
- every distinct generated AST through logical size 5 over atoms `p` and `q`, with exact per-size counts `2, 12, 92, 792, 7312`, totaling **8,210**;
- exactly **100,000** deterministic generated ASTs through logical size 40, using seed **12245589** (`0x00bada55`), atoms `p`, `q`, `foo`, `bar_baz`, and `atom10`, and agents `a` and `b`;
- 3 Unicode/LaTeX display smoke cases.

The generated coverage assertions require all 11 supported root tags—atom, negation, necessity, possibility, BAPAL, knowledge, PAL, conjunction, disjunction, implication, and biconditional—to occur as formula roots, PAL precondition roots, and PAL scope roots. The suite executes **108,246 AST round trips** in total: `1 + 10 + 25 + 8,210 + 100,000`.

Success requires both canonical structural AST equality after raw reparsing and ASCII print idempotence. Generated ASTs are built directly with test-local constructors rather than first being obtained from the ASCII parser. Failure diagnostics retain the original AST, printed ASCII, parser error, failure phase, root classifications, and a replayable minimized-looking subformula.

## 7. Production repair

Only `js/MPL.js` production code changed. The change added `_announcementPreconditionNeedsParentheses(json)` and modified only the PAL branch of `_jsonToASCII(json)`.

An announcement precondition requires protection when its exposed root is:

- a knowledge node (`kno_start`/`kno_end`);
- a PAL node (`annce_start`/`annce_end`); or
- an ordinary unary-prefix chain of `neg`, `nec`, `poss`, or `bapal` whose terminal exposed node is knowledge or PAL.

For that exact condition, `_jsonToASCII` wraps the already-printed precondition in one grouping pair before placing it between `[` and `]`. This is parser-compatible because the raw parser implements PAL and knowledge delimiters as split operators; the grouping boundary prevents an exposed inner `}` or `]` from binding across the outer announcement delimiter. Boolean binary output already carries its own grouping, while atoms and safe unary spines do not need extra protection.

The repair changes representation only. `_truth`, every Boolean/knowledge/PAL/ordinary-modal/BAPAL truth clause, model restriction, and `Model.deepCopy()` are unchanged. `lib/formula-parser.min.js` and the parser operator configuration were not changed because this round repairs output closure rather than redesigning accepted raw input. `js/app.js` was not changed because browser comma removal and bracket rewriting remain separately documented compatibility behavior.

Canonical compatibility was kept narrow: the 10 fixed safe forms retain their prior ASCII output, and the independent exhaustive review found all 8,018 previously round-tripping outputs byte-identical. Protective parentheses are added only for the structural condition above. Unicode and LaTeX continue to be derived from the canonical ASCII string.

## 8. Independent local review

Prompt 2.3 used a temporary independent review harness rather than importing `scripts/check-formula-roundtrip.js`. Its baseline/candidate findings were replayed during final-log generation with an in-memory harness; no harness or generated artifact was added to the repository.

The independent replay reported:

- exact exhaustive counts `2, 12, 92, 792, 7312` through logical size 5: **8,210 ASTs per implementation** and **16,420 baseline/candidate round-trip attempts**;
- **192** baseline exhaustive failures, **0** candidate exhaustive failures, **8,018** safe canonical outputs unchanged, and all **192** baseline-failing cases repaired at the candidate;
- a separate deterministic generated set using seed `0x0230cafe`, maximum logical AST size 30, and **25,000 ASTs per implementation**: **50,000 round-trip attempts**, with **4,207** baseline failures and **0** candidate failures;
- baseline reproduction `[K{a}p]q` followed by `Error: Invalid JSON for formula!`, versus candidate output `[(K{a}p)]q` with structural AST equality;
- **120/120 semantic-preservation comparisons** across 2 finite models, 3 worlds per model, and 20 formulas spanning atoms, Booleans, knowledge, ordinary modalities, PAL, BAPAL, and nested PAL/BAPAL, with no baseline/candidate truth mismatch.

The scoped repair retained after review protects PAL-rooted as well as knowledge-rooted preconditions and follows the exposed spine through `~`, `□`, `<>`, and `^`; `[(~[p]q)]r` is one fixed-corpus example. The review did not justify or make a parser, browser-preprocessing, evaluator, model-copy, serializer, or S5 change. The final-log replay required no additional source repair.

## 9. Files changed by category

The exact parent-to-candidate comparison is `55f557c210a6a6ad78c928bb1b94b2010929d2a2..e0c816f9b7e8a6e58774df635ca13e166d24a0d8`: 8 paths, 1,196 insertions, and 25 deletions. Some documentation paths intentionally appear in both documentary categories because the same committed file records both round statuses.

### Round 1 documentary closure

- `AGENTS.md`
- `audit/00_AUDIT_INDEX.md`
- `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md` (added)
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`
- `revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md`

### Round 2 tests

- `scripts/check-formula-roundtrip.js` (added)

### Round 2 production code

- `js/MPL.js`

### Round 2 documentation/register

- `AGENTS.md`
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`

### Unexpected files

None.

## 10. Deterministic validation

All commands below were run at implementation commit `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` before this log was created.

| Command | Exit | Concise observed output |
|---|---:|---|
| `node scripts/check-formula-roundtrip.js` | 0 | PASS; 1 minimized, 10 safe canonical, 25 fixed, 8,210 exhaustive, 100,000 seeded generated, 108,246 total round trips, and 3 display cases |
| `node scripts/check-structural-copy-regressions.js` | 0 | PASS; all 11 structural-copy groups |
| `node scripts/check-bapal-regression.js` | 0 | PASS; all 8 BAPAL/PAL/S5 checks |
| `node scripts/check-logic-regressions.js` | 0 | PASS; all 6 inherited logic checks |
| `node scripts/check-s5-closure.js` | 0 | PASS; all 4 existing S5 closure/edit-guard checks |
| `node scripts/check-bapal-valuation-class.js` | 0 | PASS; `{p,q}` and `{q,p}` remain one Boolean valuation class |
| `node scripts/check-report-links.js` | 0 | PASS; all 5 encoded playground links |
| `git diff --check` | 0 | No output |

`git status --short` was empty both before and after these commands, so no command left a tracked or untracked change. No random report generation was run. In particular, `scripts/check-all.js` was inspected but not executed because it invokes `scripts/random-bapal-evaluation.js`, which writes `reports/random-bapal-evaluation.html`.

## 11. Source-scope integrity

The scoped comparison `git diff --name-status 55f557c..e0c816f -- lib/formula-parser.min.js js/app.js reports audit/01_BAPAL_FOUNDATIONAL_AUDIT.md audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md scripts/check-structural-copy-regressions.js` produced no output. Therefore:

- `lib/formula-parser.min.js` is unchanged;
- `js/app.js` is unchanged;
- all tracked reports are unchanged;
- the Round 1 dedicated structural-copy test is unchanged;
- Audits 01–03 are byte-identical to the Round 1 candidate.

The extracted `Model.deepCopy()` slice has SHA-256 `51914b561bd17170b6f3f04fd9c37093c5b809f7a18473decd9acda9460cd6af` at both `55f557c` and `e0c816f`. The extracted `_valuationKey`/`_truth` evaluator slice has SHA-256 `3bc950f06914bc63fb18066e6c835aa6c9ee731a9ac4e46f31b49480eab03e4a` at both commits. The full `js/MPL.js` diff contains only the printer helper and PAL ASCII-printing hunk described in Section 7.

Audit 04 was added as the original read-only Round 1 closure artifact in the implementation/documentation commit; it was not altered by Round 2 production work or by this log. `git diff --exit-code HEAD --` over Audits 01–04 and the foundational prompt exited `0` before log creation. Their current SHA-256 identities are:

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087  audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md
052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98  prompt/work_max_bapal_foundational_audit_prompt.md
```

## 12. Claims supported

The evidence supports only these claims:

- the Round 1 documentary closure conditions have been implemented;
- P1-01 has a local implementation repair;
- the tested supported ASTs round-trip with structural equality and print idempotence;
- the minimized formula now prints to reparsable raw syntax;
- the existing deterministic regressions pass; and
- Work Max Round 2 closure is still pending.

It does not show that every arbitrary parser string is accepted, that browser and raw grammars are unified, that all syntax interfaces are identical, that all P1 defects are closed, that Stage 0 is complete, or that evaluator correctness is proved.

## 13. Remaining open defects

- **P1-02/P1-03:** S5 new-world, toggle, and whole-model invariant defects.
- **P1-04:** malformed compact import is not atomic.
- **P1-05:** hidden/stale semantic valuation state remains possible.
- **P1-06:** sampled-model report terminology remains inaccurate.
- **P1-07:** the independent oracle and CI gate are not checked in.
- The legacy compact serialization/import/share format remains lossy outside its one-character compatibility subset.
- Raw-parser and browser preprocessing/grammar remain divergent.
- BAPAL valuation-class subset enumeration remains exponential and synchronous.

## 14. Next planned round

**Round 3 — S5 invariant repair.**

Its scope and acceptance criteria remain those already recorded in `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`; this log does not propose additional implementation details.

## 15. Work Max review package

- **Final GitHub branch for submission:** `bapal-core`
- **Implementation candidate:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`
- **Later log-only commit:** the commit that adds this file must be identified separately and must not be treated as changing the implementation candidate
- `audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`
- `revision/02_ROUND_1_DOCUMENTARY_REPAIR_AND_ROUND_2_IMPLEMENTATION_LOG.md` (this log)
- `AGENTS.md`
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`
- `revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md`
- `js/MPL.js`
- `scripts/check-structural-copy-regressions.js`
- `scripts/check-formula-roundtrip.js`
- Exact implementation comparison: `git diff 55f557c210a6a6ad78c928bb1b94b2010929d2a2 e0c816f9b7e8a6e58774df635ca13e166d24a0d8`
- The exact deterministic commands and observed results in Section 10

The later log-only commit should be compared separately against `e0c816f`; its expected content change is this one Markdown file only.
