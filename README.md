# BAPAL Playground

The BAPAL Playground continues the Modal Logic Playground / Epistemic Logic Playground lineage.

This project is based on the open-source <a href="http://rkirsling.github.io/modallogic/">Modal Logic Playground</a> by <a href="https://github.com/rkirsling">Ross Kirsling</a>.
The Epistemic Logic Playground was made by <a href="https://elliot.website">Elliot Evans</a>.
Special thanks to my non-classical logic instructors Richard Zach and Audrey Yap, as well as my classmates who provided feedback on this project.


The BAPAL Playground is a graphical finite-model interface for modal logic, epistemic logic, public announcement logic, and existential Boolean Arbitrary Public Announcement Logic. It is built using [D3](http://d3js.org/), [MathJax](http://www.mathjax.org/), and [Bootstrap](http://getbootstrap.com/).

BAPAL formulas use `^A` as the ASCII input syntax for the existential Boolean-announcement diamond `◇ᵝA`. The superscript β means Boolean announcement and should not be confused with agent `b`.

Repository: [github.com/Raycaesar/bapal](https://github.com/Raycaesar/bapal).

## Current scope

This application is an explicit finite-model checker and visualizer. It evaluates formulas at worlds of one supplied finite model. It is not a general satisfiability solver, a validity checker, or a BAPAL decision procedure.

## Documentation

- [Stage 0 semantic and product specification](docs/BAPAL_PLAYGROUND_SPEC.md)
- [Schema v1 developer contract](docs/SCHEMA_V1.md)
- [Independent oracle and conformance guide](docs/CONFORMANCE.md)
- [Audit index](audit/00_AUDIT_INDEX.md)
- [Stage 0 scope and repair register](revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md)
- [Project verification notes](BAPAL_VERIFICATION.md)

## Audit status

The audited baseline is commit `92a4ba6c7ae070d1f64a1088dbbe7ddfbb02d287`. At that commit, the evaluator completed 6,501,302 bounded independent differential evaluations with zero mismatches within the recorded one-character supported subset and exact test bounds. This is bounded evidence, not a mathematical proof. The known P0/P1 defects remain open at the Stage 0 baseline; see the [repair register](revision/00_STAGE_0_SCOPE_AND_REPAIR_REGISTER.md).

## Tests

Run the Node-based semantic regression checks with:

```sh
node scripts/check-all.js
node scripts/check-logic-regressions.js
node scripts/check-bapal-regression.js
node scripts/check-s5-closure.js
node scripts/check-report-links.js
```

These repository checks are regression tests that exercise the production evaluator; they are not an independent semantic oracle. `scripts/check-all.js` currently invokes report generation and may rewrite tracked report artifacts, so inspect its commands before using it in a task that requires reports to remain unchanged.

Generate a reproducible random BAPAL evaluation report with:

```sh
node scripts/random-bapal-evaluation.js
node scripts/random-bapal-evaluation.js --s5
node scripts/random-bapal-evaluation.js --arbitrary
node scripts/random-bapal-evaluation.js --seed 12345
```

The generated report records results within generated finite models. It does not establish logical satisfiability or validity.

## Reusable code

- The core part of the code is MPL.js, a library for parsing and evaluating well-formed formulas of modal propositional logic. The [legacy API reference](API-Reference.md) is incomplete and is not the normative BAPAL specification.
- The directed graph editing code was also extracted for reuse and is available [here](http://bl.ocks.org/rkirsling/5001347).
