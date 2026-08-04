# Stage 0 and Round 1 Implementation Log

## 1. Verdict

ROUND 1 CLOSED — WORK MAX AUDIT 04; STAGE 0 OPEN

## 2. Repository baseline

- **Repository:** `Raycaesar/bapal`
- **Branch:** `bapal-core`
- **Original audited commit:** `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`
- **Round 1 candidate/implementation commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`
- **Candidate HEAD reviewed by Work Max:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`
- **Audit date:** 2026-08-03
- **Round 1 closure-audit date:** 2026-08-03 UTC / 2026-08-04 UTC+08
- **Implementation date:** 2026-08-04
- **Candidate state:** the Round 1 candidate was committed at `55f557c`; the Work Max candidate checkout was clean before testing and remained clean afterward.
- **Historical transcript note:** Section 9 preserves the pre-commit local validation transcript from the uncommitted implementation workspace based on `92a4ba6`. It is evidence of that workspace, not post-commit candidate metadata.
- **Source hierarchy:** (1) the manuscript used by the foundational audit; (2) Hans van Ditmarsch and Tim French, “Quantifying over Boolean Announcements,” LMCS 18(1), 2022; (3) `docs/BAPAL_PLAYGROUND_SPEC.md`; (4) implementation code; (5) UI text and `README.md`.

## 3. Stage 0 work completed

- Organized the three original Work Max reports under `audit/` and added `audit/00_AUDIT_INDEX.md`.
- Strengthened `AGENTS.md` with the Stage 0 freeze, source hierarchy, semantic boundaries, claim limits, and change discipline.
- Added the normative semantic and product specification at `docs/BAPAL_PLAYGROUND_SPEC.md`.
- Added the Stage 0 scope and repair register at `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`.
- Added finite-explicit-model scope notices and audit navigation to `README.md` and `API-Reference.md`.
- Preserved the foundational audit prompt under `prompt/work_max_bapal_foundational_audit_prompt.md`.

Stage 0 documentation work froze the contract; it did not itself repair semantic defects. Stage 0 is not globally closed, and the remaining P1 defects are still open or scheduled.

## 4. Round 1 objective

Remove semantic dependence of PAL/BAPAL model copying on the legacy compact-string serializer and address audit defect P0-01.

## 5. Pre-repair defect

The minimized observed model had one live world, world 0, with `foo = true`.

- `foo` evaluated to `true`.
- `[(p | ~p)]foo` was expected to be `true` but evaluated to `false`.
- `^foo` was expected to be `true` but threw `State 0 not found!`.

The old `Model.deepCopy()` called `getModelString()` and reloaded the result with `loadFromModelString()`. The legacy compact format concatenated atom names and re-read them character by character, so `foo` became the keys `f` and `o`. PAL and BAPAL inherited that lossy copy because both truth clauses call `deepCopy()` before restricting a model. These statements describe the recorded counterexample; they do not assert behavior outside the observed and tested cases.

## 6. Tests added before repair

- **Dedicated script:** `scripts/check-structural-copy-regressions.js`
- **Initial expected result:** fail against the pre-repair serializer-based copy.
- **Recorded initial result:** exit status `1` at Test 1.

```text
FAIL: Test 1 — direct multi-character atom preservation
AssertionError [ERR_ASSERTION]: deepCopy must preserve the exact atom-key set.
+ actual - expected

  [
+   '_',
+   'a',
+   'b',
+   'f',
+   'o',
-   'bar_baz',
-   'foo',
    'p',
+   'r',
+   'z'
  ]
```

The permanent suite now contains:

1. direct preservation of `foo`, `bar_baz`, and ordinary atom keys;
2. preservation of deleted/null world indices;
3. exact transition source, target, and raw agent-label preservation;
4. assignment, successor-array, and successor-record mutation independence in both directions;
5. the PAL multi-character regression;
6. the BAPAL `^foo` and `^~foo` regressions, with explicit throw reporting;
7. nested PAL/BAPAL copy paths involving `foo`;
8. empty-model and ordinary one-character compatibility;
9. 12 indices, two holes, multi-digit targets 10/11, unsorted transitions, `alice`/`agent_b`, duplicate suppression, and repeated copies;
10. truth-table preservation for selected formulas at every live world across `original -> copy1 -> copy2`;
11. copying after an additional world removal.

The structural oracle is a test-local canonical snapshot of raw states, sorted assignment entries, and sorted successor records. It does not use `getModelString()`.

## 7. Production implementation

The old `deepCopy()` created a new `MPL.Model`, set `copy.copied`, serialized the source with `getModelString()`, and reconstructed it with `loadFromModelString()`.

The new structural path:

- creates a new `MPL.Model` and retains `copy.copied = true`;
- visits every source array index and creates one destination state at the same index;
- passes each live state's assignment through `addState()`, which builds a distinct assignment object and successor array;
- represents each source `null` slot temporarily with an empty placeholder and records its index;
- after all indices exist, recreates each valid live-to-live transition through `addTransition(source, target, agent)`;
- thereby preserves numeric source/target indices and complete agent strings while retaining duplicate suppression;
- restores each recorded null slot with `removeState()` after transition copying;
- returns a model whose assignment objects, successor arrays, and successor-record objects are independent from the source.

Neither the PAL nor the BAPAL truth clause changed. They now receive identity-preserving structural copies through their existing `deepCopy()` calls.

## 8. Files changed

### Stage 0 files

- `AGENTS.md`
- `README.md`
- `API-Reference.md`
- `audit/00_AUDIT_INDEX.md`
- `audit/01_BAPAL_FOUNDATIONAL_AUDIT.md`
- `audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md`
- `audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md`
- `docs/BAPAL_PLAYGROUND_SPEC.md`
- `prompt/work_max_bapal_foundational_audit_prompt.md`
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`
- `revision/01_STAGE_0_AND_ROUND_1_IMPLEMENTATION_LOG.md`

### Round 1 test files

- `scripts/check-structural-copy-regressions.js`

### Round 1 production files

- `js/MPL.js`

### Unexpected files

None. Relative to the audited baseline, there are no changes to `js/app.js`, `index.html`, `css/`, `lib/`, `reports/`, `scripts/random-bapal-evaluation.js`, the formula parser, S5 UI behavior, or `BAPAL_VERIFICATION.md`.

## 9. Historical pre-commit local validation transcript

The command outputs below are preserved exactly as the historical local validation record. Their `git rev-parse HEAD`, `git status --short`, `git diff --stat`, and `git diff --name-status` output describe the uncommitted implementation workspace before commit `55f557c`; they are not the post-commit candidate state. In particular, the recorded `git diff --check` covered the then-tracked pre-commit diff and must not be read as a candidate-wide comparison of the imported audit files.

All commands below exited with status `0`. The six Node checks left tracked files unchanged; the status before and after those checks had the same tracked-file set. No random-report command was run.

### Structural-copy suite

```text
$ node scripts/check-structural-copy-regressions.js
PASS: Test 1 — direct multi-character atom preservation
PASS: Test 2 — null/deleted world-index preservation
PASS: Test 3 — transition preservation
PASS: Test 4 — mutation independence
PASS: Test 5 — PAL multi-character regression
PASS: Test 6 — BAPAL multi-character regression
PASS: Test 7 — nested PAL/BAPAL copy paths
PASS: Test 8 — empty and ordinary one-character compatibility
PASS: Test 9 — sparse multi-digit indices and repeated copies
PASS: Test 10 — truth preservation across repeated copies
PASS: Test 11 — copying after an additional world removal
PASS: all structural-copy regressions.
```

### Existing BAPAL regression

```text
$ node scripts/check-bapal-regression.js
PASS: ^A parsing and rendering
PASS: BAPAL cannot separate same propositional valuation
PASS: BAPAL can separate different propositional valuations
PASS: Public announcement [A]B still works
PASS: Public announcement removes multi-agent incoming edges
PASS: ^K{a}p behaves as expected in a small S5 model
PASS: Model.closeEquivalenceClass creates an equivalence relation
PASS: Stored self-loops, not visual loops, drive semantic evaluation
```

### Existing logic regression

```text
$ node scripts/check-logic-regressions.js
PASS: parsing and pretty-printing of ^φ
PASS: BAPAL distinguishes different Boolean valuations
PASS: BAPAL cannot distinguish same Boolean valuation
PASS: public announcement [A]B still works
PASS: S5 closure creates equivalence relations
PASS: hidden self-loops are semantically present
```

### Existing S5 closure regression

```text
$ node scripts/check-s5-closure.js
PASS: S5 closure stores reflexive loops and closes agent relations
PASS: ordinary-mode relation deletion still removes one directed edge
PASS: deleting a world from an S5 model leaves the remaining relation S5
PASS: S5 selected-relation Delete/L/R/B edits are guarded in the app
```

### Existing valuation-class regression

```text
$ node scripts/check-bapal-valuation-class.js
PASS: BAPAL treats {p,q} and {q,p} as the same Boolean valuation class.
```

### Existing report-link check

```text
$ node scripts/check-report-links.js
PASS: ^K{a}p -> ../index.html?model=ApqS0a%2C1a%2C0b%2C%3BArS1a%2C0a%2C1b%2C&formula=%5EK%7Ba%7Dp
PASS: ^(r <-> K{a}r) -> ../index.html?model=ApqS0a%2C1a%2C0b%2C%3BArS1a%2C0a%2C1b%2C&formula=%5E(r%20%3C-%3E%20K%7Ba%7Dr)
PASS: ^(q & (q -> s)) -> ../index.html?model=ApqS0a%2C1a%2C0b%2C%3BArS1a%2C0a%2C1b%2C&formula=%5E(q%20%26%20(q%20-%3E%20s))
PASS: [p]K{a}p -> ../index.html?model=ApqS0a%2C1a%2C0b%2C%3BArS1a%2C0a%2C1b%2C&formula=%5Bp%5DK%7Ba%7Dp
PASS: ^~K{b}s -> ../index.html?model=ApqS0a%2C1a%2C0b%2C%3BArS1a%2C0a%2C1b%2C&formula=%5E~K%7Bb%7Ds
```

### Runtime and repository metadata

```text
$ node --version
v24.18.0

$ git diff --check
[no output]

$ git rev-parse HEAD
92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287

$ git branch --show-current
bapal-core

$ git status --short
 M AGENTS.md
 M API-Reference.md
 M README.md
 M js/MPL.js
?? audit/
?? docs/
?? prompt/
?? revision/
?? scripts/check-structural-copy-regressions.js

$ git diff --stat
 AGENTS.md        | 160 ++++++++++++++++++++++++++++++++++++++++++++-----------
 API-Reference.md |   6 +++
 README.md        |  43 +++++++++++----
 js/MPL.js        |  24 ++++++++-
 4 files changed, 190 insertions(+), 43 deletions(-)

$ git diff --name-status
M	AGENTS.md
M	API-Reference.md
M	README.md
M	js/MPL.js
```

The Git summaries omit untracked files until they are added to the index; Section 8 records those files explicitly.

## Round 1 closure-audit addendum

- **Audit report:** [`audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md`](../audit/04_BAPAL_STAGE_0_ROUND_1_CLOSURE_AUDIT.md)
- **Audit verdict:** **PASS SUBJECT TO TWO LOCAL DOCUMENTARY REPAIRS**
- **Implementation commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`
- **Candidate checkout:** Work Max reviewed the committed candidate in a clean checkout, which remained clean after the requested verification commands.
- **Technical closure:** P0-01 is closed for internal PAL/BAPAL semantic copying; `Model.deepCopy()` is structural and no PAL or BAPAL truth clause changed.
- **Open external boundary:** the legacy compact serializer/import/share format remains lossy for multi-character atoms and agents and is not closed by Round 1.
- **Stage status:** Stage 0 remains open; P1-01 through P1-07 remain open.
- **Next round:** Round 2 — parser/printer closure.

This addendum records the post-commit Work Max result. It does not rewrite the historical pre-commit transcript above or extend the original 6,501,302 bounded comparisons to candidate `55f557c`.

## 10. Audit artifact integrity

Current SHA-256 hashes:

```text
fb5944eddd87221babfc8381e0b89ad67e441a5b408e03449177632791dbf9f8  audit/01_BAPAL_FOUNDATIONAL_AUDIT.md
875c63a9c9066f842b258e67a6133b9888a7165e156b7e228f285aa3915b87fd  audit/02_BAPAL_INDEPENDENT_VERIFICATION_REPORT.md
b3ffdee2fca97316af18f44dc3e1e56ac1df20e1db854ef779bd1738c0246ad1  audit/03_BAPAL_ARCHITECTURE_AND_ROADMAP.md
052e3b6a08fc7d9a470b7e887f48c90af0bc4c8e444d330444f739dec0b38f98  prompt/work_max_bapal_foundational_audit_prompt.md
```

The three reports and preserved prompt were not modified during Round 1 or this final local review; their pre-log and post-log hashes are identical. They are new Stage 0 organization files relative to the original audited commit, so Git has no baseline blob against which to infer their external provenance. Their hashes above identify the exact review package bytes.

## 11. Claims supported

- P0-01 is closed at `55f557c` for internal semantic copying by Work Max Audit 04.
- The minimized counterexamples now pass.
- The dedicated structural-copy regression suite passes.
- The existing deterministic regression checks pass.
- The committed candidate was independently checked by the targeted Work Max closure harness.

This evidence does not show that the entire evaluator is proved correct, that every multi-character identifier issue is solved, that the compact serializer supports arbitrary identifiers, that Stage 0 is complete, that every P1 defect is closed, or that BAPAL satisfiability is decided.

## 12. Known limitations left open

- parser/printer closure;
- the S5 mode invariant, including toggle and new-world behavior;
- malformed partial model loading;
- disclosure of hidden semantic valuations;
- random-report terminology;
- the independent oracle is not yet checked into the repository;
- no CI is configured;
- compact legacy serialization remains limited to its audited one-character subset;
- raw-parser and browser grammar mismatch;
- exponential BAPAL valuation-class subset enumeration;
- multi-character raw transition labels are structurally preserved, but this does not expand the knowledge parser's agent semantics.

## 13. Next planned round

Round 2 — parser/printer closure, beginning with the minimized case:

```text
[(K{a}p)]q
```

It is not implemented by this task.

## 14. Work Max review package

- **GitHub branch:** `bapal-core`
- **Candidate commit:** `55f557c210a6a6ad78c928bb1b94b2010929d2a2`; Work Max reviewed this committed candidate in a clean checkout.
- **Historical local evidence:** the Section 9 transcript records the uncommitted workspace before the candidate commit and is not post-commit repository metadata.
- This implementation log.
- `AGENTS.md`.
- `docs/BAPAL_PLAYGROUND_SPEC.md`.
- `revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md`.
- The three original audit reports under `audit/`.
- `js/MPL.js`.
- `scripts/check-structural-copy-regressions.js`.
- The Git diff from the audited baseline, including all added Stage 0 and Round 1 files.
- The deterministic command outputs recorded in Section 9.
