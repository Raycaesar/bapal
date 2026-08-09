# Result Terminology

This document is the normative terminology contract for evaluation results and bounded verification evidence in the BAPAL Playground.

## Evaluation concepts

| Concept | Input or question | Implemented? | Recommended name | Required interpretation |
|---|---|---:|---|---|
| Pointed finite-model truth | Given `M`, `w`, and `φ`, is `M,w ⊨ φ`? | Yes | `truthAtWorld` | Truth at one live world of one explicit finite model. |
| Some-world truth in one explicit model | Does `φ` hold at some live world of this specific `M`? | Yes | `trueSomewhereInModel` | A within-model aggregation. It is not equivalent to logical satisfiability. |
| Every-world truth in one explicit model | Does `φ` hold at every live world of this specific `M`? | Yes | `trueAtEveryWorldInModel` | A within-model aggregation. It is not equivalent to logical validity. |
| Logical satisfiability | Does some S5 model/world satisfy `φ`? | No | `satisfiable` only in mathematical explanations or explicit nonclaims | The application does not search the class of S5 models for a witness. |
| Logical validity | Does every S5 model/world satisfy `φ`? | No | `valid` only in mathematical explanations or explicit nonclaims | The application does not quantify over the class of S5 models. |

The human-facing forms of the two aggregations are:

- “True at some world in this model”;
- “True at every live world in this model.”

False at every live world of one supplied or generated model is not an unsatisfiability result. True at every live world of one model is not a validity result. The formal target semantics is S5, but the evaluator can also run on arbitrary stored relations; a result on such a frame is finite-model checking or robustness evidence, not automatically a claim about the formal S5 logic.

## Sampled report

The generated artifact in `reports/random-bapal-evaluation.html` is a **generated finite-model evaluation report** (also called a sampled finite-model evaluation report). It evaluates formulas only in the one explicit generated finite model displayed in that report.

Every such report must state visibly that:

- truth somewhere in that model does not establish logical satisfiability;
- failure everywhere in that model does not establish unsatisfiability;
- truth everywhere in that model does not establish logical validity; and
- sampled or generated evidence is not a decision procedure.

## Bounded conformance evidence

Bounded conformance is finite, deterministic regression evidence comparing independently separated expected and production results. Zero mismatches within a bounded run is not a proof, a validity result, a satisfiability result, or an unbounded decision procedure.

The repository distinguishes four evidence sets:

| Evidence | Meaning |
|---|---|
| Hand-authored core corpus | 73 explicit pointed cases with reviewed expected Boolean results. |
| FAST conformance | Exactly 50,000 deterministic pointed comparisons under the checked-in FAST seed and bounds. |
| FULL conformance | Exactly 500,000 deterministic pointed comparisons under the checked-in FULL seed and wider bounds. |
| Sampled report | Human-readable results for formulas in one generated five-world model; it is not an oracle or conformance profile. |

Regression, exhaustive, generated, verified, correct, proof, satisfiability, validity, and decidability must always be qualified by their actual scope. “Exhaustive” is acceptable only with the exact finite domain or bound stated.
