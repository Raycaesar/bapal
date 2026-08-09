# BAPAL Playground

BAPAL Playground is an interactive finite-model playground and checker for modal logic, epistemic logic, public announcement logic (PAL), and the existential Boolean Arbitrary Public Announcement Logic (BAPAL) modality. It evaluates formulas at worlds of an explicit finite model and visualizes that model.

The application includes S5-aware model editing, PAL and existential BAPAL evaluation, versioned Model and Formula Schema v1 interchange, deterministic regressions, and bounded conformance checks against an independent Python oracle. BAPAL input uses `^A` for the existential Boolean-announcement diamond `◇ᵝA`; `β` means Boolean announcement, not agent `b`.

Repository: [github.com/Raycaesar/bapal](https://github.com/Raycaesar/bapal).

## Scope

The formal target semantics is S5. S5 mode enforces the audited editing contract for the relevant stored relations. The evaluator can also inspect arbitrary stored relations for finite-model checking and robustness work; such a run is not automatically a result about the formal S5 logic.

This project is not a theorem prover, satisfiability solver, validity checker, or complete BAPAL decision procedure. Truth at some or every world of one supplied or generated model remains a result about that model. See the normative [result terminology contract](docs/RESULT_TERMINOLOGY.md).

The public interfaces intentionally have different identifier boundaries:

- the browser editor and formula surface use atoms `p`–`t` and selectable agents `a`–`e`;
- raw `MPL.Wff` parsing accepts a broader ASCII word-like atom vocabulary, while knowledge syntax retains the current character-wise shorthand behavior;
- Model Schema v1 preserves exact Unicode scalar atom and relation-label strings, while Formula Schema v1 atoms are ASCII word identifiers and each knowledge entry is one ASCII shorthand unit; and
- the legacy compact model/share format remains a one-character compatibility format and is not general identifier interchange.

These boundaries are documented limitations, not interchangeable syntax contracts.

## Documentation

- [Semantic and product specification](docs/BAPAL_PLAYGROUND_SPEC.md)
- [Schema v1 developer contract](docs/SCHEMA_V1.md)
- [Independent oracle and bounded conformance guide](docs/CONFORMANCE.md)
- [Normative result terminology](docs/RESULT_TERMINOLOGY.md)
- [Current API reference](API-Reference.md)
- [BAPAL verification notes](BAPAL_VERIFICATION.md)
- [Audit index](audit/00_AUDIT_INDEX.md)

## Checks and reports

Run the ordinary non-writing aggregate and the independent FAST conformance profile with:

```sh
node scripts/check-all.js
python3 scripts/check-independent-oracle.py
python3 scripts/check-oracle-sensitivity.py
python3 scripts/check-oracle-conformance.py --profile fast
```

FAST, FULL, the hand-authored core corpus, and the inherited regressions provide bounded evidence only. Zero mismatches is not a mathematical proof of soundness, completeness, satisfiability, validity, decidability, or correctness for unbounded inputs.

Report generation is an explicit writing operation. A reproducible sampled finite-model evaluation report can be generated with:

```sh
node scripts/random-bapal-evaluation.js --s5 --seed 12345
```

This command writes `reports/random-bapal-evaluation.html`. Ordinary deterministic checking does not regenerate that tracked report.

## Lineage

The BAPAL Playground continues the Modal Logic Playground / Epistemic Logic Playground lineage. It is based on Ross Kirsling's open-source [Modal Logic Playground](http://rkirsling.github.io/modallogic/), and the Epistemic Logic Playground was created by [Elliot Evans](https://elliot.website). The application uses [D3](http://d3js.org/), [MathJax](http://www.mathjax.org/), and [Bootstrap](http://getbootstrap.com/).
