# BAPAL Playground Round 1 Documentary Repair and Round 2 Closure Audit

**Audit mode:** concentrated, read-only closure audit  
**Repository:** `Raycaesar/bapal`  
**Branch:** `bapal-core`  
**Original foundational baseline:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`  
**Round 1 implementation commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`  
**Round 2 implementation commit:** `e0c816f9b7e8a6e58774df635ca13e166d24a0d8`  
**Final branch HEAD:** `f7c7d599afca5622c227ea51d930dfd14005b016`  
**Audit date:** 2026-08-04 UTC  
**Audit runtime:** Node `v24.14.0`

## Executive verdict

**PASS.**

The two documentary repairs required by Audit 04 are complete and accurate. P0-01 is administratively recorded as closed at `55f557c` for internal semantic copying, while the legacy compact serializer/import/share defect remains explicitly open. Audit 04 is indexed and is byte-identical to the previously delivered closure report. Stage 0 remains open.

The Round 2 P1-01 repair also passes. At parent commit `55f557c`, the raw parser accepts `[(K{a}p)]q`, `Wff.ascii()` prints the non-reparsable form `[K{a}p]q`, and raw reparsing fails. At implementation commit `e0c816f`, the printer emits `[(K{a}p)]q`, raw reparsing succeeds, the reparsed AST is structurally identical, and printing is idempotent.

The production change is correctly limited to ASCII pretty-printing. The parser library, parser operator configuration, browser preprocessing, semantic evaluator, structural `deepCopy()`, serializer, S5 behavior, and every other production file are unchanged. The final HEAD differs from the implementation commit only by the addition of the Round 2 implementation log.

Accordingly:

- **DOC-01: CLOSED.**
- **DOC-02: CLOSED.**
- **P0-01 administrative closure: PASS; technical closure remains at `55f557c`.**
- **P1-01 parser/printer non-closure: CLOSED at `e0c816f`; closure remains valid at final HEAD `f7c7d59`.**
- **Round 2 generated-test evidence: PASS.**
- **Round 2 implementation log: materially accurate.**
- **Stage 0: OPEN.** P1-02 through P1-07 and the separately recorded external-format, grammar, and performance limitations remain open.
- **Next scheduled implementation round: Round 3 — S5 invariant repair.**

No local documentary or production repair is required before proceeding to Round 3.

## 1. Repository identity and commit sequence

The exact sequence after the certified Round 1 commit is:

| Order | Commit | Date (`+08:00`) | Subject | Role |
|---:|---|---|---|---|
| 0 | `55f557c210a6a6ad78c928bb1b94b2010929d2a2` | 2026-08-04 06:58:23 | `new round check` | Certified Round 1 implementation |
| 1 | `e0c816f9b7e8a6e58774df635ca13e166d24a0d8` | 2026-08-04 09:02:07 | `close round 1 docs and implement round 2 parser printer closure` | Round 1 documentary repair plus Round 2 implementation |
| 2 | `f7c7d599afca5622c227ea51d930dfd14005b016` | 2026-08-04 09:10:48 | `add round 2 implementation log` | Final log-only commit and branch HEAD |

Repository and remote comparison both establish:

- `55f557c..e0c816f`: one commit, eight changed paths, 1,196 insertions, 25 deletions;
- `e0c816f..f7c7d59`: one commit, one added Markdown file, 249 insertions, zero deletions;
- `92a4ba6..f7c7d59`: 16 changed paths, 4,997 insertions, 44 deletions.

The sole final-HEAD delta after the implementation candidate is:

```text
A  revision/02_ROUND_1_DOCUMENTARY_REPAIR_AND_ROUND_2_IMPLEMENTATION_LOG.md
```

Therefore final HEAD differs from the Round 2 implementation commit only by the later log-only commit, exactly as the log anticipates.

## 2. Scope discipline and historical artifact integrity

This audit did not restart the foundational 6,501,302-evaluation audit. It reopened no certified semantic component because the Round 2 candidate changes only the formula printer and creates no concrete semantic regression.

The historical audit artifacts have these SHA-256 identities at final HEAD:

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
be1de429fc5283bb79a163bddd40118712cab255a0cc12883493fecca4994087  audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md
052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98  prompt/work_max_bapal_foundational_audit_prompt.md
```

Audit 04's hash is exactly the hash of the previously delivered external report. It was added to the repository without byte changes. Audits 01–03, `lib/formula-parser.min.js`, `js/app.js`, and `scripts/check-structural-copy-regressions.js` have identical Git blob identities at `55f557c`, `e0c816f`, and final HEAD.

## 3. Part I — Round 1 documentary repairs

### 3.1 DOC-01 — Round 1 implementation-log metadata

**Result: PASS.**

`revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md` now:

1. identifies `55f557c210a6a6ad78c928bb1b94b2010929d2a2` as both the Round 1 candidate/implementation commit and the exact HEAD reviewed by Work Max;
2. records the committed candidate and the clean Work Max checkout before and after testing;
3. no longer says that no candidate commit exists;
4. no longer presents baseline `92a4ba6` as the current candidate HEAD;
5. labels Section 9 as a **historical pre-commit local validation transcript**;
6. explains that the transcript's baseline HEAD, dirty status, tracked-only diff summary, and `git diff --check` belong to the pre-commit workspace;
7. retains the original command output rather than rewriting it as post-commit output;
8. adds the Audit 04 verdict, technical closure, external serializer limitation, Stage 0 status, and exact review package.

The old transcript remains internally intact. The new surrounding text supplies the necessary temporal distinction. No stale “candidate not yet created” statement remains.

### 3.2 DOC-02 — internal copying versus external serialization

**Result: PASS.**

`AGENTS.md` now distinguishes five layers. Its fourth layer records structural internal copying at `55f557c`; its fifth retains the compact serializer/import/share format as limited to the audited one-character compatibility subset. It expressly prohibits global claims about multi-character formula interfaces, multi-character epistemic-agent behavior, URL import/share, or Stage 0 closure.

`docs/BAPAL_PLAYGROUND_SPEC.md` adds a clear post-baseline Round 1 delta while retaining the baseline serializer-dependent account as historically identified behavior at `92a4ba6`. It states that:

- internal PAL/BAPAL semantic copying no longer uses compact serialization;
- the tested internal contract preserves multi-character atom keys and raw transition labels;
- compact external serialization remains unchanged and uncertified outside the one-character subset;
- no PAL or BAPAL truth clause changed;
- the delta closes only P0-01's internal-copy defect.

No global multi-character-agent or end-to-end formula-interface correctness claim was introduced.

### 3.3 Administrative closure of P0-01

**Result: PASS.**

- `audit/00_AUDIT_INDEX.md` indexes Audit 04 with its exact candidate, conditional documentary verdict, technical conclusion, remaining serializer limitation, and open Stage 0 status.
- Audit 04 is byte-preserved.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md` marks P0-01 **CLOSED AT `55f557c` — WORK MAX AUDIT 04** only for internal semantic copying.
- The register keeps the compact serializer/import/share limitation open.
- P1-01 was marked implemented but pending this audit; P1-02 through P1-07 remain open.
- Stage 0 remains explicitly open.

The Round 1 structural-copy implementation was not changed after certification. The full `js/MPL.js` file necessarily changes in Round 2, but the `deepCopy()` slice is byte-identical at `55f557c` and `e0c816f`. Using the same inclusive source slice recorded by the implementation log, both hashes are:

```text
51914b561bd17170b6f3f04fd9c37093c5b809f7a18473decd9acda9460cd6af
```

The Round 1 dedicated regression script also has the same Git blob at all three relevant commits.

## 4. Part II — Independent reproduction of P1-01

### 4.1 Parent commit `55f557c`

The independent probe loaded the raw parser and `MPL.js` directly from an archive of `55f557c`.

```text
input:    [(K{a}p)]q
printed:  [K{a}p]q
reparse:  Error: Invalid JSON for formula!
```

Copying the committed Round 2 test script into that disposable parent archive also reproduced its documented test-first failure exactly and exited with status 1:

```text
FAIL: minimized regression — knowledge-rooted PAL precondition
input: [(K{a}p)]q
printed ASCII: [K{a}p]q
parser error: Error: Invalid JSON for formula!
```

This independently confirms the pre-Round-2 defect and the implementation log's before-state transcript.

### 4.2 Round 2 candidate and final HEAD

At `e0c816f` and final HEAD:

```text
input:    [(K{a}p)]q
printed:  [(K{a}p)]q
reparse:  success
AST:      structurally identical
reprint:  [(K{a}p)]q
```

The unprotected direct raw input `[K{a}p]q` still fails, as documented. That is not a Round 2 failure: the acceptance target is closure of printer output under the existing raw parser, not expansion or redesign of raw input grammar.

## 5. Part III — Production repair audit

### 5.1 Exact production change

The only Round 2 production changes are at final `js/MPL.js:52-63` and `js/MPL.js:90-97`:

- `_announcementPreconditionNeedsParentheses(json)` was added;
- the PAL branch of `_jsonToASCII(json)` now conditionally wraps its printed precondition in one pair of grouping parentheses.

No other production file changed from `55f557c` to `e0c816f`.

### 5.2 Why the rule matches the inherited parser

The parser represents PAL and knowledge delimiters as split operators:

- `[` is a unary operator of precedence 5 and `]` is a right-associative binary operator of precedence 5;
- `K{` is a unary operator of precedence 4 and `}` is a right-associative binary operator of precedence 4.

An exposed knowledge-rooted precondition can let its lower-precedence `}` parse consume the outer announcement's `]`. An exposed PAL-rooted precondition can let its equal-precedence, right-associative inner `]` consume the outer `]`. Prefixes `~`, `□`, `<>`, and `^` do not create a grouping boundary, so a unary chain ending at either risky root inherits the same problem.

The printer's possible precondition roots divide as follows:

| Printed precondition structure | Existing boundary | New action | Result |
|---|---|---|---|
| atom | complete word token | none | safe |
| Boolean binary | printer already emits `(A op B)` | none | safe |
| knowledge root | no grouping boundary | add parentheses | safe |
| PAL root | no grouping boundary | add parentheses | safe |
| `~`/`□`/`<>`/`^` chain ending in knowledge or PAL | prefixes add no grouping boundary | recurse and add parentheses | safe |
| such a chain ending in atom or Boolean binary | terminal token or existing grouping | none | safe |

This is the complete structural partition for supported formula AST constructors. The predicate follows precisely the exposed unary spine and stops at the first terminal constructor. It neither under-protects the two risky terminal forms nor changes a structurally safe root.

### 5.3 Scope preservation

Exact source comparison establishes:

- `lib/formula-parser.min.js`: unchanged;
- parser operator configuration in `js/MPL.js:18-36`: unchanged;
- `js/app.js` formula preprocessing: unchanged;
- `Model.deepCopy()`: unchanged from the certified Round 1 implementation;
- `_valuationKey()` and `_truth()`: unchanged;
- compact model serialization: unchanged;
- S5 editing/model code: unchanged.

The `_valuationKey()` through `truth()` comparison slice has the implementation log's exact SHA-256 at both `55f557c` and `e0c816f`:

```text
3bc950f06914bc63fb18066e6c835aa6c9ee731a9ac4e46f31b49480eab03e4a
```

The foundational-baseline-to-final production diff contains exactly two conceptual repairs: Round 1 structural `deepCopy()` and Round 2 protective ASCII printing. No truth clause changed.

## 6. Part IV — Dedicated generated round-trip tests

### 6.1 Permanent repository suite

`scripts/check-formula-roundtrip.js` is deterministic and test-local AST construction is independent of ASCII parsing. A successful case requires:

1. `MPL.Wff` to accept the directly constructed supported AST;
2. ASCII printing;
3. raw reparsing of that ASCII;
4. canonical structural AST equality;
5. ASCII print idempotence.

Its executed corpus is accurately recorded:

| Component | Cases |
|---|---:|
| Minimized regression | 1 |
| Previously safe canonical forms | 10 |
| Fixed difficult corpus | 25 |
| Exhaustive ASTs through logical size 5 | 8,210 |
| Seeded generated ASTs through logical size 40 | 100,000 |
| **Total AST round trips** | **108,246** |
| Separate Unicode/LaTeX smoke cases | 3 |

The exhaustive per-size counts are exactly:

```text
2, 12, 92, 792, 7312
```

The generated seed is decimal `12245589`, equal to hexadecimal `0x00bada55`. The test uses atoms `p`, `q`, `foo`, `bar_baz`, and `atom10`; agents `a` and `b`; all 11 supported root constructors; and explicit coverage checks for every constructor as a whole-formula root, PAL-precondition root, and PAL-scope root.

Executed at final HEAD, the suite exited 0 and reported all 108,246 round trips passing.

### 6.2 Independent generated verification

A separate temporary harness did not import the repository's Round 2 test. It loaded archived baseline and candidate implementations independently, used its own stable structural comparator, generator, PRNG, identifier set, and corpus limits, and checked both AST equality and print idempotence.

#### Independent exhaustive comparison through size 5

| Measure | Result |
|---|---:|
| ASTs | 8,210 |
| Baseline failures | 192 |
| Candidate failures | 0 |
| Baseline-failing cases repaired | 192 |
| Baseline-safe outputs byte-unchanged | 8,018 |
| Previously safe outputs changed | 0 |

This reproduces every exact exhaustive count stated in the implementation log.

#### Stronger independent exhaustive comparison through size 6

| Measure | Result |
|---|---:|
| Per-size counts | `2, 12, 92, 792, 7312, 70752` |
| ASTs | 78,962 |
| Baseline failures | 3,152 |
| Candidate failures | 0 |
| Baseline-failing cases repaired | 3,152 |
| Baseline-safe outputs byte-unchanged | 75,810 |
| Previously safe outputs changed | 0 |

#### Independent generated comparison

| Parameter | Value |
|---|---:|
| PRNG/seed | independent SplitMix-style 32-bit generator, `0x5eedc0de` (`1592639710`) |
| ASTs | 50,000 |
| Maximum logical size | 64 |
| Identifiers | `p`, `q`, `_`, `0`, `foo`, `a1_b`, `atom10`; agents `a`, `b`, `agent10` |
| Baseline failures | 13,997 |
| Candidate failures | 0 |
| Baseline-failing cases repaired | 13,997 |
| Baseline-safe outputs byte-unchanged | 36,003 |
| Previously safe outputs changed | 0 |

An additional 512 targeted long unary-spine cases terminating in knowledge or PAL all passed and all received the required outer grouping boundary.

These finite results are verification evidence, not a proof by enumeration over an infinite AST set. The all-supported-AST closure conclusion also rests on the complete structural case analysis in §5.2.

### 6.3 Accuracy qualification for the log's temporary 25,000-case replay

The implementation log expressly says its separate 25,000-case review harness was temporary and was not added to the repository. Its exact `0x0230cafe`/4,207-failure run therefore cannot be byte-for-byte rerun from the submitted tree alone. This is not a closure blocker: the permanent 108,246-case suite is reproducible, the exact 8,210/192/8,018 independent counts were reproduced, and this audit supplied a distinct, stronger 50,000-case generated comparison with zero candidate failures. No material log claim is contradicted.

## 7. Part V — Regression and worktree checks

### 7.1 Deterministic commands at final HEAD

| Command | Exit | Observed result |
|---|---:|---|
| `node scripts/check-formula-roundtrip.js` | 0 | 108,246 round trips and 3 display cases passed |
| `node scripts/check-structural-copy-regressions.js` | 0 | all 11 Round 1 groups passed |
| `node scripts/check-bapal-regression.js` | 0 | all 8 checks passed |
| `node scripts/check-logic-regressions.js` | 0 | all 6 checks passed |
| `node scripts/check-s5-closure.js` | 0 | all 4 existing checks passed |
| `node scripts/check-bapal-valuation-class.js` | 0 | valuation-key-order check passed |
| `node scripts/check-report-links.js` | 0 | all 5 link checks passed |

`scripts/check-all.js` was inspected. Because it intentionally regenerates a tracked HTML report, it was executed only in a disposable archive of `e0c816f`, not in the audit checkout. Both fixed-seed random runs and all constituent checks completed successfully there.

The clean final-HEAD audit checkout had the following aggregate SHA-256 over all tracked-file hashes before the seven read-only commands:

```text
3411be4711fd81c1d2697264886674aa353357bf14ab00aaf164fd0a29f49d53
```

It had the identical aggregate afterward. `git status --porcelain=v1 --untracked-files=all` was empty before and after.

### 7.2 Expected `git diff --check` notices

The implementation worktree's ordinary `git diff --check` is empty because the checkout is clean. A historical candidate-wide `55f557c..e0c816f` diff check reports only the Markdown hard-break spaces and final blank line already present in the byte-preserved Audit 04 artifact. It reports no Round 2 production or test whitespace error. This is consistent with both Audit 04 and the new implementation log's careful description of working-tree versus candidate-wide checks.

## 8. Implementation-log accuracy

### 8.1 Verified claims

The following statements in `revision/02_ROUND_1_DOCUMENTARY_REPAIR_AND_ROUND_2_IMPLEMENTATION_LOG.md` are exact:

- implementation commit, subject, date, parent Round 1 commit, and branch;
- expectation and realization of a later log-only commit;
- Round 1 DOC-01, DOC-02, and administrative changes;
- parent-commit reproduction of `[K{a}p]q` and its raw reparse failure;
- production helper and PAL-printer scope;
- exact changed-path count and `+1196/-25` statistics;
- permanent-test composition, seed, exact exhaustive counts, and total 108,246 round trips;
- 192 parent failures, zero candidate failures, and 8,018 safe unchanged outputs through size 5;
- unchanged parser, app preprocessing, structural-copy test, `deepCopy()`, and evaluator;
- reported audit-artifact, `deepCopy()`, and evaluator-slice hashes;
- open-defect list and next-round status.

The deterministic outputs reproduce on Node `v24.14.0`. The log records its own execution under Node `v24.18.0`; Git does not preserve a runtime transcript independently of the Markdown record, but no output or source evidence contradicts it.

### 8.2 No material overclaim

The log correctly limits its pre-audit verdict, distinguishes implementation from closure, and disclaims:

- arbitrary malformed-input acceptance;
- raw/browser grammar unification;
- global multi-character interface correctness;
- repair of other P1 findings;
- Stage 0 closure;
- proof of evaluator correctness.

No materially inaccurate or overbroad implementation-log statement was found.

## 9. Remaining open boundaries

Closing P1-01 does not close or alter:

- P1-02/P1-03: S5 new-world, toggle, and whole-model invariant defects;
- P1-04: non-atomic malformed compact import;
- P1-05: hidden or stale semantically active valuation keys;
- P1-06: sampled-model result terminology;
- P1-07: absence of a checked-in independent oracle and CI gate;
- lossy compact import/share serialization outside the one-character subset;
- browser comma removal and bracket preprocessing versus raw grammar;
- rejection of some unprotected direct raw inputs;
- exponential, synchronous BAPAL subset enumeration;
- any claim of satisfiability solving, validity checking, or an unbounded BAPAL decision procedure.

P1-01 closes only the contract that `MPL.Wff.ascii()` prints supported formula ASTs in raw-parser-reparsable form.

## 10. Final decision

**Round 1 documentary repairs: PASS.**  
**P0-01 administrative status: CLOSED at `55f557c` for internal semantic copying.**  
**Legacy compact serializer/import/share boundary: OPEN.**  
**Round 2 production repair: PASS.**  
**P1-01 parser/printer non-closure: CLOSED at `e0c816f`.**  
**Final log-only HEAD `f7c7d59`: PASS.**  
**Stage 0: OPEN.**  
**Next implementation round: Round 3 — S5 invariant repair.**

No repository edit or follow-up repair is required by this closure audit.
