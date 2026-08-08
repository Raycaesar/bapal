#!/usr/bin/env python3
"""Compare independent Python results with production JavaScript results."""

from __future__ import annotations

import copy
import hashlib
import json
import platform
import subprocess
import sys
import time
from collections import Counter
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Iterator, Mapping, Sequence

from oracle import bapal_oracle


class ConformanceError(RuntimeError):
    """Raised for malformed corpus data or a production-runner protocol error."""


@dataclass(frozen=True)
class CoreOutcome:
    case_id: str
    category: str
    world: int
    expected: bool
    oracle_result: bool
    production_result: bool
    canonical_model: dict[str, Any]
    canonical_formula: dict[str, Any]


_CORE_FIELDS = frozenset({"caseId", "model", "formula", "world", "expected", "category"})
_FORMULA_CONSTRUCTORS = frozenset(
    {"atom", "not", "and", "or", "implies", "iff", "box", "diamond", "knowledge", "announcement", "bapal"}
)
_REQUIRED_REGRESSION_CASES = frozenset(
    {
        "core-001-atom-true",
        "core-002-atom-false",
        "core-011-modal-box-vacuity",
        "core-012-modal-diamond-empty",
        "core-013-knowledge-vacuity",
        "core-015-ordinary-box-all-labels",
        "core-016-ordinary-diamond-raw-label",
        "core-018-wrong-agent-exclusion",
        "core-020-multiple-agents-false",
        "core-023-three-unit-shorthand",
        "core-024-non-s5-k-false",
        "core-031-s5-knowledge-true",
        "core-036-pal-vacuity",
        "core-037-pal-restricts-worlds",
        "core-042-nested-pal",
        "core-046-bapal-same-valuation-modal",
        "core-051-bapal-separates-classes",
        "core-052-bapal-reflexive-obstruction",
        "core-055-nested-bapal-true",
        "core-059-sparse-atom",
        "core-062-sparse-bapal-removes-target",
        "core-065-multi-character-atom",
        "core-066-prototype-atom",
        "core-070-prototype-sensitive-bapal-split",
        "core-071-raw-labels-visible-to-diamond",
        "core-072-raw-labels-included-by-box",
        "core-073-bapal-delimiter-collision-exact-atoms",
    }
)


def _formula_constructors(expression: Mapping[str, Any]) -> set[str]:
    operator = expression["type"]
    constructors = {operator}
    if operator in {"not", "box", "diamond", "bapal", "knowledge"}:
        constructors.update(_formula_constructors(expression["operand"]))
    elif operator == "announcement":
        constructors.update(_formula_constructors(expression["precondition"]))
        constructors.update(_formula_constructors(expression["body"]))
    elif operator in {"and", "or", "implies", "iff"}:
        constructors.update(_formula_constructors(expression["left"]))
        constructors.update(_formula_constructors(expression["right"]))
    return constructors


def load_core_corpus(path: Path) -> list[dict[str, Any]]:
    """Load newline-delimited explicit cases without deriving any truth value."""

    cases: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            raise ConformanceError(f"{path}:{line_number}: blank lines are not permitted")
        try:
            value = json.loads(line)
        except json.JSONDecodeError as error:
            raise ConformanceError(f"{path}:{line_number}: invalid JSON: {error}") from error
        if not isinstance(value, dict):
            raise ConformanceError(f"{path}:{line_number}: each case must be a JSON object")
        cases.append(value)
    return cases


def validate_core_cases(cases: Sequence[Mapping[str, Any]]) -> None:
    """Validate the permanent corpus envelope and both Schema v1 payloads."""

    if len(cases) < 64:
        raise ConformanceError(f"core corpus must contain at least 64 cases; found {len(cases)}")
    seen_ids: set[str] = set()
    category_counts: dict[str, int] = {}
    constructors: set[str] = set()
    for case_index, case in enumerate(cases):
        label = f"core case {case_index}"
        actual_fields = set(case)
        if actual_fields != _CORE_FIELDS:
            missing = sorted(_CORE_FIELDS - actual_fields)
            extra = sorted(actual_fields - _CORE_FIELDS)
            raise ConformanceError(f"{label} has invalid fields; missing={missing}, extra={extra}")
        case_id = case["caseId"]
        if not isinstance(case_id, str) or not case_id:
            raise ConformanceError(f"{label}.caseId must be a nonempty string")
        if case_id in seen_ids:
            raise ConformanceError(f"duplicate core case ID: {case_id}")
        seen_ids.add(case_id)
        category = case["category"]
        if not isinstance(category, str) or not category:
            raise ConformanceError(f"{case_id}.category must be a nonempty string")
        category_counts[category] = category_counts.get(category, 0) + 1
        if type(case["expected"]) is not bool:
            raise ConformanceError(f"{case_id}.expected must be a manually supplied JSON boolean")
        world = case["world"]
        if not isinstance(world, int) or isinstance(world, bool) or world < 0:
            raise ConformanceError(f"{case_id}.world must be a nonnegative integer")
        try:
            model = bapal_oracle.parse_model_document(case["model"])
            bapal_oracle.parse_formula_document(case["formula"])
        except bapal_oracle.OracleInputError as error:
            raise ConformanceError(f"{case_id}: invalid Schema v1 payload: {error}") from error
        if world not in bapal_oracle.live_domain(model):
            raise ConformanceError(f"{case_id}.world does not identify a live world")
        constructors.update(_formula_constructors(case["formula"]["formula"]))

    required_categories = {
        "boolean",
        "modal-vacuity",
        "modal-labels",
        "knowledge",
        "pal",
        "bapal-valuation-classes",
        "sparse-null",
        "s5",
        "non-s5",
        "identifier-preservation",
        "raw-relation-labels",
    }
    missing_categories = sorted(required_categories - set(category_counts))
    if missing_categories:
        raise ConformanceError(
            "core corpus is missing required category coverage: " + ", ".join(missing_categories)
        )
    missing_constructors = sorted(_FORMULA_CONSTRUCTORS - constructors)
    if missing_constructors:
        raise ConformanceError(
            "core corpus is missing Formula Schema v1 constructor coverage: "
            + ", ".join(missing_constructors)
        )
    missing_regressions = sorted(_REQUIRED_REGRESSION_CASES - seen_ids)
    if missing_regressions:
        raise ConformanceError(
            "core corpus is missing named semantic regressions: " + ", ".join(missing_regressions)
        )


def _production_requests(cases: Sequence[Mapping[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "requestId": case["caseId"],
            "model": case["model"],
            "formula": case["formula"],
            "world": case["world"],
        }
        for case in cases
    ]


def run_production(
    requests: Iterable[Mapping[str, Any]], runner_path: Path, timeout_seconds: int = 120
) -> list[dict[str, Any]]:
    """Send a deterministic JSONL batch to the production-only runner."""

    request_list = list(requests)
    standard_input = "".join(
        json.dumps(request, ensure_ascii=False, separators=(",", ":")) + "\n"
        for request in request_list
    )
    completed = subprocess.run(
        ["node", str(runner_path)],
        input=standard_input,
        text=True,
        capture_output=True,
        check=False,
        timeout=timeout_seconds,
        cwd=runner_path.resolve().parents[1],
    )
    if completed.returncode != 0:
        raise ConformanceError(
            f"production runner exited {completed.returncode}: {completed.stderr.strip()}"
        )
    response_lines = [line for line in completed.stdout.splitlines() if line.strip()]
    if len(response_lines) != len(request_list):
        raise ConformanceError(
            f"production runner returned {len(response_lines)} responses for {len(request_list)} requests; "
            f"stderr={completed.stderr.strip()!r}"
        )
    responses: list[dict[str, Any]] = []
    for response_index, line in enumerate(response_lines):
        try:
            response = json.loads(line)
        except json.JSONDecodeError as error:
            raise ConformanceError(
                f"production response {response_index} is not JSON: {line!r}"
            ) from error
        if not isinstance(response, dict):
            raise ConformanceError(f"production response {response_index} is not an object")
        responses.append(response)
    return responses


def compare_core_cases(cases: Sequence[Mapping[str, Any]], runner_path: Path) -> list[CoreOutcome]:
    """Evaluate manual cases on both sides and retain diagnostic documents."""

    validate_core_cases(cases)
    responses = run_production(_production_requests(cases), runner_path)
    outcomes: list[CoreOutcome] = []
    for case, response in zip(cases, responses):
        case_id = case["caseId"]
        if response.get("requestId") != case_id:
            raise ConformanceError(
                f"production response ID {response.get('requestId')!r} does not match {case_id!r}"
            )
        if response.get("ok") is not True:
            raise ConformanceError(f"{case_id}: production runner error: {response.get('error')!r}")
        if type(response.get("result")) is not bool:
            raise ConformanceError(f"{case_id}: production result is not a boolean")

        model = bapal_oracle.parse_model_document(case["model"])
        formula = bapal_oracle.parse_formula_document(case["formula"])
        canonical_model = bapal_oracle.canonical_model_document(model)
        canonical_formula = bapal_oracle.canonical_formula_document(formula)
        if response.get("canonicalModel") != canonical_model:
            raise ConformanceError(f"{case_id}: production and independent model canonicalization differ")
        if response.get("canonicalFormula") != canonical_formula:
            raise ConformanceError(f"{case_id}: production and independent formula canonicalization differ")

        oracle_result = bapal_oracle.SemanticOracle(model).holds(formula, case["world"])
        outcomes.append(
            CoreOutcome(
                case_id=case_id,
                category=case["category"],
                world=case["world"],
                expected=case["expected"],
                oracle_result=oracle_result,
                production_result=response["result"],
                canonical_model=canonical_model,
                canonical_formula=canonical_formula,
            )
        )
    return outcomes


def node_version() -> str:
    """Return the production runtime version used by this check."""

    completed = subprocess.run(
        ["node", "--version"],
        text=True,
        capture_output=True,
        check=True,
        timeout=10,
    )
    return completed.stdout.strip()


@dataclass(frozen=True)
class GeneratedModel:
    document: dict[str, Any]
    parsed: bapal_oracle.FiniteModel
    live_worlds: tuple[int, ...]
    valuation_class_count: int
    model_kind: str
    sparse: bool
    relation_labels: tuple[str, ...]
    has_multi_character_atom: bool


@dataclass(frozen=True)
class GeneratedFormula:
    document: dict[str, Any]
    parsed: bapal_oracle.Formula
    constructor_counts: Mapping[str, int]
    bapal_nesting: int


@dataclass(frozen=True)
class GeneratedSuite:
    profile_name: str
    seed: int
    expected_comparison_count: int
    bounds: Mapping[str, int]
    models: tuple[GeneratedModel, ...]
    formulas: tuple[GeneratedFormula, ...]
    batch_size: int


@dataclass(frozen=True)
class ConformanceCase:
    case_index: int
    case_id: str
    model: dict[str, Any]
    formula: dict[str, Any]
    world: int


@dataclass(frozen=True)
class ComparisonMismatch:
    case: ConformanceCase
    oracle_result: bool
    production_result: bool


@dataclass(frozen=True)
class ConformanceRunResult:
    artifact_directory: Path
    manifest_path: Path
    mismatch_path: Path | None
    expected_comparison_count: int
    actual_comparison_count: int
    mismatch_count: int
    elapsed_seconds: float


class DeterministicRandom:
    """Small specified SplitMix64 stream, independent of Python's random module."""

    _MASK = (1 << 64) - 1

    def __init__(self, seed: int):
        self.state = seed & self._MASK

    def next_u64(self) -> int:
        self.state = (self.state + 0x9E3779B97F4A7C15) & self._MASK
        value = self.state
        value = ((value ^ (value >> 30)) * 0xBF58476D1CE4E5B9) & self._MASK
        value = ((value ^ (value >> 27)) * 0x94D049BB133111EB) & self._MASK
        return (value ^ (value >> 31)) & self._MASK

    def below(self, limit: int) -> int:
        if limit <= 0:
            raise ValueError("limit must be positive")
        rejection_limit = (1 << 64) - ((1 << 64) % limit)
        while True:
            value = self.next_u64()
            if value < rejection_limit:
                return value % limit

    def chance(self, numerator: int, denominator: int) -> bool:
        return self.below(denominator) < numerator


def _scalar_key(value: str) -> tuple[int, ...]:
    return tuple(map(ord, value))


def _formula_document(expression: dict[str, Any]) -> dict[str, Any]:
    return {"format": "bapal-formula", "version": 1, "formula": expression}


def _atom_expression(name: str) -> dict[str, Any]:
    return {"type": "atom", "name": name}


def _generate_model(
    stream: DeterministicRandom, model_index: int, bounds: Mapping[str, int]
) -> GeneratedModel:
    max_live_worlds = bounds["maxLiveWorlds"]
    max_valuation_classes = bounds["maxValuationClasses"]
    if model_index == 0:
        if max_live_worlds < 2 or max_valuation_classes < 2:
            raise ConformanceError("generated exact-atom collision case exceeds profile bounds")
        document = {
            "format": "bapal-model",
            "version": 1,
            "worlds": [
                {
                    "trueAtoms": ["a", "b"],
                    "transitions": [
                        {"target": 0, "agent": "x"},
                        {"target": 1, "agent": "x"},
                    ],
                },
                {
                    "trueAtoms": ["a,b"],
                    "transitions": [
                        {"target": 0, "agent": "x"},
                        {"target": 1, "agent": "x"},
                    ],
                },
            ],
        }
        parsed = bapal_oracle.parse_model_document(document)
        return GeneratedModel(
            document=document,
            parsed=parsed,
            live_worlds=(0, 1),
            valuation_class_count=2,
            model_kind="s5",
            sparse=False,
            relation_labels=("x",),
            has_multi_character_atom=True,
        )
    model_kind = "s5" if model_index % 2 == 0 else "non-s5"
    live_count = 1 + ((model_index + stream.below(max_live_worlds)) % max_live_worlds)
    if model_kind == "non-s5" and max_live_worlds >= 2:
        live_count = max(2, live_count)
    class_limit = min(max_valuation_classes, live_count)
    class_count = 1 + ((model_index // 2 + stream.below(class_limit)) % class_limit)

    class_valuations: list[set[str]] = []
    base_atoms = ("p", "q", "r", "foo", "alpha_2")
    for class_index in range(class_count):
        valuation = {f"class_{class_index}"}
        for atom_name in base_atoms:
            if stream.chance(1, 3):
                valuation.add(atom_name)
        if (model_index + class_index) % 4 == 0:
            valuation.add("__proto__")
        if (model_index + class_index) % 7 == 0:
            valuation.add("constructor")
        if (model_index + class_index) % 11 == 0:
            valuation.add("原子")
        class_valuations.append(valuation)

    ordinal_classes = list(range(class_count))
    while len(ordinal_classes) < live_count:
        ordinal_classes.append(stream.below(class_count))

    sparse = model_index % 3 == 0
    if sparse:
        slot_count = live_count + 2
        if model_index % 2 == 0:
            live_indices = list(range(1, live_count + 1))
        else:
            null_indices = {live_count // 2, slot_count - 1}
            live_indices = [index for index in range(slot_count) if index not in null_indices]
    else:
        slot_count = live_count
        live_indices = list(range(live_count))

    label_patterns = (
        ("a", "b"),
        ("a", "raw/agent"),
        ("a", "b", "__proto__"),
    )
    relation_labels = label_patterns[model_index % len(label_patterns)]
    transitions_by_source: dict[int, set[tuple[int, str]]] = {
        world_index: set() for world_index in live_indices
    }

    if model_kind == "s5":
        for label_index, label in enumerate(relation_labels):
            block_count = 1 + ((model_index + label_index) % min(2, live_count))
            blocks: dict[int, list[int]] = {}
            for ordinal, world_index in enumerate(live_indices):
                blocks.setdefault(ordinal % block_count, []).append(world_index)
            for block in blocks.values():
                for source in block:
                    for target in block:
                        transitions_by_source[source].add((target, label))
    else:
        first, second = live_indices[0], live_indices[1]
        transitions_by_source[first].add((second, "a"))
        transitions_by_source[first].add((first, relation_labels[1]))
        if len(relation_labels) > 2:
            transitions_by_source[first].add((live_indices[-1], relation_labels[2]))
        for source in live_indices:
            for target in live_indices:
                for label in relation_labels:
                    if source == first and target == first and label == "a":
                        continue
                    if stream.chance(1, 7):
                        transitions_by_source[source].add((target, label))

    worlds: list[dict[str, Any] | None] = [None] * slot_count
    for ordinal, world_index in enumerate(live_indices):
        atoms = sorted(class_valuations[ordinal_classes[ordinal]], key=_scalar_key)
        transitions = [
            {"target": target, "agent": agent}
            for target, agent in sorted(
                transitions_by_source[world_index], key=lambda edge: (edge[0], _scalar_key(edge[1]))
            )
        ]
        worlds[world_index] = {"trueAtoms": atoms, "transitions": transitions}

    document = {"format": "bapal-model", "version": 1, "worlds": worlds}
    parsed = bapal_oracle.parse_model_document(document)
    observed_classes = len(bapal_oracle.valuation_classes(parsed, bapal_oracle.live_domain(parsed)))
    if observed_classes > max_valuation_classes:
        raise ConformanceError("generated model exceeded its valuation-class bound")
    return GeneratedModel(
        document=document,
        parsed=parsed,
        live_worlds=tuple(live_indices),
        valuation_class_count=observed_classes,
        model_kind=model_kind,
        sparse=sparse,
        relation_labels=relation_labels,
        has_multi_character_atom=any(
            len(atom_name) > 1 for valuation in class_valuations for atom_name in valuation
        ),
    )


_GENERATED_ROOT_SCHEDULE = (
    "atom",
    "not",
    "and",
    "or",
    "implies",
    "iff",
    "box",
    "diamond",
    "knowledge",
    "announcement",
    "bapal",
    "announcement",
    "announcement",
    "announcement",
    "announcement",
    "bapal",
    "bapal",
    "bapal",
    "bapal",
    "bapal",
)
_GENERATED_ATOMS = ("p", "q", "r", "foo", "__proto__", "constructor", "class_0", "alpha_2")


def _generated_expression(
    stream: DeterministicRandom,
    depth: int,
    bapal_budget: int,
    forced_operator: str | None = None,
    force_nested_bapal: bool = False,
) -> dict[str, Any]:
    if depth <= 0:
        return _atom_expression(_GENERATED_ATOMS[stream.below(len(_GENERATED_ATOMS))])

    permitted = [
        "atom",
        "not",
        "and",
        "or",
        "implies",
        "iff",
        "box",
        "diamond",
        "knowledge",
        "announcement",
    ]
    if bapal_budget > 0:
        permitted.append("bapal")
    operator = forced_operator if forced_operator in permitted else permitted[stream.below(len(permitted))]
    if forced_operator is None and stream.chance(1, 6):
        operator = "atom"

    if operator == "atom":
        return _atom_expression(_GENERATED_ATOMS[stream.below(len(_GENERATED_ATOMS))])
    if operator in {"not", "box", "diamond"}:
        return {
            "type": operator,
            "operand": _generated_expression(stream, depth - 1, bapal_budget),
        }
    if operator == "bapal":
        if force_nested_bapal and bapal_budget >= 2 and depth >= 2:
            operand = _generated_expression(
                stream,
                depth - 1,
                bapal_budget - 1,
                forced_operator="bapal",
            )
        else:
            operand = _generated_expression(stream, depth - 1, bapal_budget - 1)
        return {"type": "bapal", "operand": operand}
    if operator == "knowledge":
        patterns = (("a",), ("b",), ("a", "b"), ("a", "a"), ("a", "b", "c"))
        agents = patterns[stream.below(len(patterns))]
        return {
            "type": "knowledge",
            "agents": list(agents),
            "operand": _generated_expression(stream, depth - 1, bapal_budget),
        }
    if operator == "announcement":
        return {
            "type": "announcement",
            "precondition": _generated_expression(stream, depth - 1, bapal_budget),
            "body": _generated_expression(stream, depth - 1, bapal_budget),
        }
    return {
        "type": operator,
        "left": _generated_expression(stream, depth - 1, bapal_budget),
        "right": _generated_expression(stream, depth - 1, bapal_budget),
    }


def _formula_metrics(expression: Mapping[str, Any]) -> tuple[Counter[str], int]:
    operator = expression["type"]
    counts: Counter[str] = Counter({operator: 1})
    children: list[Mapping[str, Any]] = []
    if operator in {"not", "box", "diamond", "bapal", "knowledge"}:
        children.append(expression["operand"])
    elif operator == "announcement":
        children.extend((expression["precondition"], expression["body"]))
    elif operator in {"and", "or", "implies", "iff"}:
        children.extend((expression["left"], expression["right"]))

    maximum_child_nesting = 0
    for child in children:
        child_counts, child_nesting = _formula_metrics(child)
        counts.update(child_counts)
        maximum_child_nesting = max(maximum_child_nesting, child_nesting)
    return counts, maximum_child_nesting + (1 if operator == "bapal" else 0)


def _generate_formula(
    stream: DeterministicRandom,
    formula_index: int,
    bounds: Mapping[str, int],
    maximum_depth: int,
) -> GeneratedFormula:
    if formula_index == 0:
        expression = {
            "type": "bapal",
            "operand": {
                "type": "knowledge",
                "agents": ["x"],
                "operand": {"type": "atom", "name": "a"},
            },
        }
        document = _formula_document(expression)
        parsed = bapal_oracle.parse_formula_document(document)
        counts, nesting = _formula_metrics(expression)
        if nesting > bounds["maxBapalNesting"]:
            raise ConformanceError("generated exact-atom collision formula exceeds profile bounds")
        return GeneratedFormula(document, parsed, dict(counts), nesting)
    root_operator = _GENERATED_ROOT_SCHEDULE[formula_index % len(_GENERATED_ROOT_SCHEDULE)]
    max_bapal_nesting = bounds["maxBapalNesting"]
    force_nested = (
        max_bapal_nesting >= 2
        and root_operator == "bapal"
        and formula_index % 4 == 0
    )
    expression = _generated_expression(
        stream,
        maximum_depth,
        max_bapal_nesting,
        forced_operator=root_operator,
        force_nested_bapal=force_nested,
    )
    document = _formula_document(expression)
    parsed = bapal_oracle.parse_formula_document(document)
    counts, nesting = _formula_metrics(expression)
    if nesting > max_bapal_nesting:
        raise ConformanceError("generated formula exceeded its BAPAL-nesting bound")
    return GeneratedFormula(document, parsed, dict(counts), nesting)


def build_generated_suite(profile: Mapping[str, Any]) -> GeneratedSuite:
    """Materialize independently generated, reusable model and formula pools."""

    seed = profile["seed"]
    bounds = profile["bounds"]
    generation = profile["generation"]
    model_stream = DeterministicRandom(seed ^ 0x4D4F44454C563100)
    formula_stream = DeterministicRandom(seed ^ 0x464F524D554C4131)
    models = tuple(
        _generate_model(model_stream, index, bounds)
        for index in range(generation["modelCount"])
    )
    formulas = tuple(
        _generate_formula(formula_stream, index, bounds, generation["maxFormulaDepth"])
        for index in range(generation["formulaCount"])
    )
    return GeneratedSuite(
        profile_name=profile["profile"],
        seed=seed,
        expected_comparison_count=profile["expectedComparisonCount"],
        bounds=bounds,
        models=models,
        formulas=formulas,
        batch_size=generation["batchSize"],
    )


def generated_cases(suite: GeneratedSuite) -> Iterator[ConformanceCase]:
    """Yield the profile's exact number of deterministic pointed requests."""

    model_count = len(suite.models)
    formula_count = len(suite.formulas)
    for case_index in range(suite.expected_comparison_count):
        model_index = case_index % model_count
        block_index = case_index // model_count
        formula_index = (block_index + model_index * 17) % formula_count
        generated_model = suite.models[model_index]
        world = generated_model.live_worlds[(block_index + formula_index) % len(generated_model.live_worlds)]
        yield ConformanceCase(
            case_index=case_index,
            case_id=f"{suite.profile_name}-{case_index:09d}",
            model=generated_model.document,
            formula=suite.formulas[formula_index].document,
            world=world,
        )


def sensitivity_cases(seed: int, count: int = 24) -> list[ConformanceCase]:
    """Build a small generated set used only by the deliberate-mismatch check."""

    profile = {
        "profile": "sensitivity",
        "seed": seed,
        "expectedComparisonCount": count,
        "bounds": {"maxLiveWorlds": 4, "maxValuationClasses": 3, "maxBapalNesting": 1},
        "generation": {
            "modelCount": 12,
            "formulaCount": 20,
            "maxFormulaDepth": 4,
            "batchSize": count,
        },
    }
    suite = build_generated_suite(profile)
    cases: list[ConformanceCase] = []
    for case_index in range(count):
        generated_model = suite.models[case_index % len(suite.models)]
        generated_formula = suite.formulas[case_index % len(suite.formulas)]
        cases.append(
            ConformanceCase(
                case_index=case_index,
                case_id=f"sensitivity-{case_index:04d}",
                model=generated_model.document,
                formula=generated_formula.document,
                world=generated_model.live_worlds[0],
            )
        )
    return cases


class OracleEvaluationCache:
    """Reuse parsed independent structures without consulting production state."""

    def __init__(self) -> None:
        self._models: dict[int, tuple[dict[str, Any], bapal_oracle.SemanticOracle]] = {}
        self._formulas: dict[int, tuple[dict[str, Any], bapal_oracle.Formula]] = {}

    def evaluate(self, case: ConformanceCase) -> bool:
        model_identity = id(case.model)
        formula_identity = id(case.formula)
        cached_model = self._models.get(model_identity)
        if cached_model is None or cached_model[0] is not case.model:
            semantic_oracle = bapal_oracle.SemanticOracle(
                bapal_oracle.parse_model_document(case.model)
            )
            self._models[model_identity] = (case.model, semantic_oracle)
        else:
            semantic_oracle = cached_model[1]
        cached_formula = self._formulas.get(formula_identity)
        if cached_formula is None or cached_formula[0] is not case.formula:
            parsed_formula = bapal_oracle.parse_formula_document(case.formula)
            self._formulas[formula_identity] = (case.formula, parsed_formula)
        else:
            parsed_formula = cached_formula[1]
        return semantic_oracle.holds(parsed_formula, case.world)


def _case_requests(cases: Sequence[ConformanceCase]) -> list[dict[str, Any]]:
    return [
        {
            "requestId": case.case_id,
            "model": case.model,
            "formula": case.formula,
            "world": case.world,
        }
        for case in cases
    ]


def collect_results(
    cases: Sequence[ConformanceCase],
    runner_path: Path,
    oracle_cache: OracleEvaluationCache | None = None,
) -> tuple[list[bool], list[bool]]:
    """Obtain independent and production booleans for one shared case batch."""

    cache = oracle_cache or OracleEvaluationCache()
    oracle_results = [cache.evaluate(case) for case in cases]
    responses = run_production(_case_requests(cases), runner_path, timeout_seconds=300)
    production_results: list[bool] = []
    for case, response in zip(cases, responses):
        if response.get("requestId") != case.case_id:
            raise ConformanceError(
                f"production response ID {response.get('requestId')!r} does not match {case.case_id!r}"
            )
        if response.get("ok") is not True:
            raise ConformanceError(
                f"{case.case_id}: production runner error: {response.get('error')!r}"
            )
        if type(response.get("result")) is not bool:
            raise ConformanceError(f"{case.case_id}: production result is not a boolean")
        if response.get("canonicalModel") != case.model:
            raise ConformanceError(f"{case.case_id}: production changed the generated model document")
        if response.get("canonicalFormula") != case.formula:
            raise ConformanceError(f"{case.case_id}: production changed the generated formula document")
        production_results.append(response["result"])
    return oracle_results, production_results


def compare_result_sets(
    cases: Sequence[ConformanceCase],
    oracle_results: Sequence[bool],
    production_results: Sequence[bool],
) -> list[ComparisonMismatch]:
    """The sole boolean comparator used by normal and sensitivity executions."""

    if len(cases) != len(oracle_results) or len(cases) != len(production_results):
        raise ConformanceError("case and result lengths differ")
    mismatches: list[ComparisonMismatch] = []
    for case, oracle_result, production_result in zip(
        cases, oracle_results, production_results
    ):
        if type(oracle_result) is not bool or type(production_result) is not bool:
            raise ConformanceError(f"{case.case_id}: comparator inputs must be booleans")
        if oracle_result is not production_result:
            mismatches.append(ComparisonMismatch(case, oracle_result, production_result))
    return mismatches


_PROFILE_HASH_PATHS = (
    "oracle/bapal_oracle.py",
    "oracle/production_runner.js",
    "oracle/conformance.py",
    "conformance/v1/core-corpus.jsonl",
)
_RUNTIME_HASH_PATHS = _PROFILE_HASH_PATHS + (
    "schemas/bapal-model-v1.schema.json",
    "schemas/bapal-formula-v1.schema.json",
    "js/MPL.js",
    "js/schema-v1.js",
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_hashes(
    repository: Path, profile_path: Path | None = None
) -> dict[str, str]:
    paths = list(_RUNTIME_HASH_PATHS)
    if profile_path is not None:
        relative_profile = profile_path.resolve().relative_to(repository.resolve()).as_posix()
        paths.append(relative_profile)
    return {relative: sha256_file(repository / relative) for relative in paths}


def profile_provenance_hashes(repository: Path) -> dict[str, str]:
    return {relative: sha256_file(repository / relative) for relative in _PROFILE_HASH_PATHS}


def load_profile(profile_path: Path, repository: Path) -> dict[str, Any]:
    """Validate profile shape, fixed budget, bounds, coverage, and pinned hashes."""

    try:
        profile = json.loads(profile_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ConformanceError(f"cannot load profile {profile_path}: {error}") from error
    if not isinstance(profile, dict):
        raise ConformanceError(f"{profile_path}: profile must be an object")
    required_fields = {
        "format",
        "version",
        "profile",
        "seed",
        "seedHex",
        "expectedComparisonCount",
        "bounds",
        "requiredConstructorCoverage",
        "requiredCoverage",
        "generation",
        "sourceHashes",
    }
    if set(profile) != required_fields:
        raise ConformanceError(
            f"{profile_path}: invalid profile fields; missing={sorted(required_fields - set(profile))}, "
            f"extra={sorted(set(profile) - required_fields)}"
        )
    if profile["format"] != "bapal-conformance-profile" or profile["version"] != 1:
        raise ConformanceError(f"{profile_path}: unsupported profile format/version")
    profile_name = profile["profile"]
    fixed_contracts = {
        "fast": {
            "seed": 0x6F524143,
            "count": 50_000,
            "bounds": {"maxLiveWorlds": 4, "maxValuationClasses": 3, "maxBapalNesting": 1},
        },
        "full": {
            "seed": 0xC0DEC0DE,
            "count": 500_000,
            "bounds": {"maxLiveWorlds": 5, "maxValuationClasses": 4, "maxBapalNesting": 2},
        },
    }
    if profile_name not in fixed_contracts:
        raise ConformanceError(f"{profile_path}: profile must be fast or full")
    contract = fixed_contracts[profile_name]
    if profile["seed"] != contract["seed"] or profile["seedHex"] != f"0x{contract['seed']:08X}":
        raise ConformanceError(f"{profile_path}: seed does not match the fixed {profile_name} seed")
    if profile["expectedComparisonCount"] != contract["count"]:
        raise ConformanceError(f"{profile_path}: comparison target does not match the fixed budget")
    if profile["bounds"] != contract["bounds"]:
        raise ConformanceError(f"{profile_path}: bounds do not match the fixed profile contract")
    if set(profile["requiredConstructorCoverage"]) != _FORMULA_CONSTRUCTORS:
        raise ConformanceError(f"{profile_path}: required constructor coverage is incomplete")
    required_coverage = {
        "pal",
        "bapal",
        "knowledge-shorthand",
        "s5",
        "non-s5",
        "sparse-null",
        "multiple-relation-labels",
        "multi-character-model-atoms",
        "exact-schema-v1-identifiers",
    }
    if not required_coverage.issubset(set(profile["requiredCoverage"])):
        raise ConformanceError(f"{profile_path}: required semantic/model coverage is incomplete")
    generation = profile["generation"]
    generation_fields = {
        "modelCount",
        "formulaCount",
        "maxFormulaDepth",
        "batchSize",
        "minimumPalComparisons",
        "minimumBapalComparisons",
        "minimumNestedBapalComparisons",
    }
    if not isinstance(generation, dict) or set(generation) != generation_fields:
        raise ConformanceError(f"{profile_path}: generation contract has invalid fields")
    for field in generation_fields:
        if not isinstance(generation[field], int) or isinstance(generation[field], bool) or generation[field] < 0:
            raise ConformanceError(f"{profile_path}: generation.{field} must be a nonnegative integer")
    if min(generation["modelCount"], generation["formulaCount"], generation["batchSize"]) <= 0:
        raise ConformanceError(f"{profile_path}: pool and batch counts must be positive")
    if generation["formulaCount"] < len(_GENERATED_ROOT_SCHEDULE):
        raise ConformanceError(f"{profile_path}: formula pool is too small for scheduled coverage")

    pinned_hashes = profile["sourceHashes"]
    current_hashes = profile_provenance_hashes(repository)
    if pinned_hashes != current_hashes:
        stale = sorted(
            path
            for path in set(pinned_hashes) | set(current_hashes)
            if pinned_hashes.get(path) != current_hashes.get(path)
        )
        raise ConformanceError(
            f"{profile_path}: pinned profile provenance is stale for: {', '.join(stale)}"
        )
    return profile


def validate_checked_in_profiles(repository: Path) -> dict[str, dict[str, Any]]:
    profiles: dict[str, dict[str, Any]] = {}
    for profile_name in ("fast", "full"):
        profile_path = repository / "conformance" / "v1" / f"{profile_name}-profile.json"
        profile = load_profile(profile_path, repository)
        if profile["profile"] != profile_name:
            raise ConformanceError(f"{profile_path}: filename and profile name differ")
        profiles[profile_name] = profile
    return profiles


MismatchPredicate = Callable[[ConformanceCase], tuple[bool, bool, bool]]


def evaluate_mismatch(
    case: ConformanceCase,
    runner_path: Path,
    production_transform: Callable[[bool], bool] | None = None,
) -> tuple[bool, bool, bool]:
    """Replay one case, optionally applying an in-memory result transform."""

    oracle_results, production_results = collect_results([case], runner_path)
    if production_transform is not None:
        production_results = [production_transform(production_results[0])]
    mismatches = compare_result_sets([case], oracle_results, production_results)
    return bool(mismatches), oracle_results[0], production_results[0]


def _trial_reduction(
    candidate: ConformanceCase,
    predicate: MismatchPredicate,
) -> tuple[bool, bool, bool]:
    try:
        bapal_oracle.parse_model_document(candidate.model)
        bapal_oracle.parse_formula_document(candidate.formula)
    except bapal_oracle.OracleInputError:
        return False, False, False
    return predicate(candidate)


def _formula_size(expression: Mapping[str, Any]) -> int:
    counts, _nesting = _formula_metrics(expression)
    return sum(counts.values())


def _formula_paths(expression: Mapping[str, Any], path: tuple[str, ...] = ()) -> list[tuple[str, ...]]:
    paths = [path]
    operator = expression["type"]
    fields: tuple[str, ...] = ()
    if operator in {"not", "box", "diamond", "bapal", "knowledge"}:
        fields = ("operand",)
    elif operator == "announcement":
        fields = ("precondition", "body")
    elif operator in {"and", "or", "implies", "iff"}:
        fields = ("left", "right")
    for field in fields:
        paths.extend(_formula_paths(expression[field], path + (field,)))
    return paths


def _expression_at(expression: Mapping[str, Any], path: tuple[str, ...]) -> Mapping[str, Any]:
    selected = expression
    for field in path:
        selected = selected[field]
    return selected


def _replace_expression(
    expression: Mapping[str, Any], path: tuple[str, ...], replacement: Mapping[str, Any]
) -> dict[str, Any]:
    if not path:
        return copy.deepcopy(dict(replacement))
    result = copy.deepcopy(dict(expression))
    selected: dict[str, Any] = result
    for field in path[:-1]:
        selected = selected[field]
    selected[path[-1]] = copy.deepcopy(dict(replacement))
    return result


def _smaller_formula_candidates(expression: Mapping[str, Any]) -> list[dict[str, Any]]:
    operator = expression["type"]
    candidates: list[dict[str, Any]] = []
    if operator in {"not", "box", "diamond", "bapal", "knowledge"}:
        candidates.append(copy.deepcopy(expression["operand"]))
    elif operator == "announcement":
        candidates.extend(
            (copy.deepcopy(expression["precondition"]), copy.deepcopy(expression["body"]))
        )
    elif operator in {"and", "or", "implies", "iff"}:
        candidates.extend((copy.deepcopy(expression["left"]), copy.deepcopy(expression["right"])))
    if operator != "atom":
        candidates.append(_atom_expression("p"))
    original_size = _formula_size(expression)
    unique: list[dict[str, Any]] = []
    seen: set[str] = set()
    for candidate in candidates:
        identity = json.dumps(candidate, sort_keys=True, separators=(",", ":"))
        if identity not in seen and _formula_size(candidate) < original_size:
            seen.add(identity)
            unique.append(candidate)
    return unique


def minimize_mismatch(
    original_case: ConformanceCase,
    predicate: MismatchPredicate,
) -> tuple[ConformanceCase, list[dict[str, Any]], bool, bool]:
    """Deterministically reduce a mismatch; no global minimality is claimed."""

    still_mismatches, oracle_result, production_result = predicate(original_case)
    if not still_mismatches:
        raise ConformanceError("cannot minimize a case that does not reproduce a mismatch")
    current = replace(
        original_case,
        model=copy.deepcopy(original_case.model),
        formula=copy.deepcopy(original_case.formula),
    )
    steps: list[dict[str, Any]] = []

    # 1. Remove transitions in stable source/list order.
    for source_index, world in enumerate(current.model["worlds"]):
        if world is None:
            continue
        transition_index = 0
        while transition_index < len(current.model["worlds"][source_index]["transitions"]):
            candidate_model = copy.deepcopy(current.model)
            removed = candidate_model["worlds"][source_index]["transitions"].pop(transition_index)
            candidate = replace(current, model=candidate_model)
            reproduces, candidate_oracle, candidate_production = _trial_reduction(candidate, predicate)
            if reproduces:
                current = candidate
                oracle_result, production_result = candidate_oracle, candidate_production
                steps.append(
                    {
                        "kind": "remove-transition",
                        "source": source_index,
                        "target": removed["target"],
                        "agent": removed["agent"],
                    }
                )
            else:
                transition_index += 1

    # 2. Remove true atoms in stable world/list order.
    for world_index, world in enumerate(current.model["worlds"]):
        if world is None:
            continue
        atom_index = 0
        while atom_index < len(current.model["worlds"][world_index]["trueAtoms"]):
            candidate_model = copy.deepcopy(current.model)
            removed_atom = candidate_model["worlds"][world_index]["trueAtoms"].pop(atom_index)
            candidate = replace(current, model=candidate_model)
            reproduces, candidate_oracle, candidate_production = _trial_reduction(candidate, predicate)
            if reproduces:
                current = candidate
                oracle_result, production_result = candidate_oracle, candidate_production
                steps.append(
                    {"kind": "remove-true-atom", "world": world_index, "atom": removed_atom}
                )
            else:
                atom_index += 1

    # 3. Null nonpointed worlds and remove their incoming transitions.
    for world_index, world in enumerate(tuple(current.model["worlds"])):
        if world is None or world_index == current.world:
            continue
        candidate_model = copy.deepcopy(current.model)
        candidate_model["worlds"][world_index] = None
        for source in candidate_model["worlds"]:
            if source is not None:
                source["transitions"] = [
                    edge for edge in source["transitions"] if edge["target"] != world_index
                ]
        candidate = replace(current, model=candidate_model)
        reproduces, candidate_oracle, candidate_production = _trial_reduction(candidate, predicate)
        if reproduces:
            current = candidate
            oracle_result, production_result = candidate_oracle, candidate_production
            steps.append({"kind": "remove-nonpointed-world", "world": world_index})

    # 4. Replace formula subtrees with strictly smaller valid expressions.
    changed = True
    while changed:
        changed = False
        root = current.formula["formula"]
        paths = sorted(_formula_paths(root), key=lambda value: (-len(value), value))
        for path in paths:
            selected = _expression_at(root, path)
            for replacement_expression in _smaller_formula_candidates(selected):
                candidate_formula = copy.deepcopy(current.formula)
                candidate_formula["formula"] = _replace_expression(
                    root, path, replacement_expression
                )
                candidate = replace(current, formula=candidate_formula)
                reproduces, candidate_oracle, candidate_production = _trial_reduction(
                    candidate, predicate
                )
                if reproduces:
                    before_size = _formula_size(root)
                    after_size = _formula_size(candidate_formula["formula"])
                    current = candidate
                    oracle_result, production_result = candidate_oracle, candidate_production
                    steps.append(
                        {
                            "kind": "replace-formula-subtree",
                            "path": list(path),
                            "replacementType": replacement_expression["type"],
                            "formulaSizeBefore": before_size,
                            "formulaSizeAfter": after_size,
                        }
                    )
                    changed = True
                    break
            if changed:
                break

    final_mismatch, oracle_result, production_result = predicate(current)
    if not final_mismatch:
        raise ConformanceError("implemented shrinker failed to preserve its mismatch")
    return current, steps, oracle_result, production_result


def _case_artifact_record(
    case: ConformanceCase, oracle_result: bool, production_result: bool
) -> dict[str, Any]:
    return {
        "caseIndex": case.case_index,
        "caseId": case.case_id,
        "model": case.model,
        "formula": case.formula,
        "world": case.world,
        "oracleResult": oracle_result,
        "productionResult": production_result,
    }


def write_mismatch_artifact(
    output_path: Path,
    profile_name: str,
    seed: int,
    mismatch: ComparisonMismatch,
    minimized_case: ConformanceCase,
    minimized_oracle_result: bool,
    minimized_production_result: bool,
    minimization_steps: Sequence[Mapping[str, Any]],
    hashes: Mapping[str, str],
    synthetic_transform: str | None = None,
) -> dict[str, Any]:
    """Write a replayable original/reduced mismatch record."""

    original_record = _case_artifact_record(
        mismatch.case, mismatch.oracle_result, mismatch.production_result
    )
    minimized_record = _case_artifact_record(
        minimized_case, minimized_oracle_result, minimized_production_result
    )
    artifact: dict[str, Any] = {
        "format": "bapal-conformance-mismatch",
        "version": 1,
        "profile": profile_name,
        "seed": seed,
        "seedHex": f"0x{seed:08X}",
        "caseIndex": mismatch.case.case_index,
        "caseId": mismatch.case.case_id,
        "model": mismatch.case.model,
        "formula": mismatch.case.formula,
        "world": mismatch.case.world,
        "oracleResult": mismatch.oracle_result,
        "productionResult": mismatch.production_result,
        "sourceHashes": dict(hashes),
        "originalCase": original_record,
        "minimizedCase": minimized_record,
        "minimization": {
            "description": "minimized by the implemented deterministic shrinker; not globally minimal",
            "steps": list(minimization_steps),
        },
    }
    if synthetic_transform is not None:
        artifact["syntheticTransform"] = synthetic_transform
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return artifact


def _has_knowledge_shorthand(expression: Mapping[str, Any]) -> bool:
    operator = expression["type"]
    if operator == "knowledge" and len(expression["agents"]) > 1:
        return True
    fields: tuple[str, ...] = ()
    if operator in {"not", "box", "diamond", "bapal", "knowledge"}:
        fields = ("operand",)
    elif operator == "announcement":
        fields = ("precondition", "body")
    elif operator in {"and", "or", "implies", "iff"}:
        fields = ("left", "right")
    return any(_has_knowledge_shorthand(expression[field]) for field in fields)


def _git_revision(repository: Path, revision: str) -> str | None:
    completed = subprocess.run(
        ["git", "rev-parse", revision],
        cwd=repository,
        text=True,
        capture_output=True,
        check=False,
        timeout=10,
    )
    return completed.stdout.strip() if completed.returncode == 0 else None


def _write_json(path: Path, value: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def run_generated_profile(
    repository: Path,
    profile_path: Path,
    profile: Mapping[str, Any],
    artifact_directory: Path,
    progress: Callable[[int, int], None] | None = None,
) -> ConformanceRunResult:
    """Execute an exact generated profile and always emit its runtime manifest."""

    artifact_directory.mkdir(parents=True, exist_ok=True)
    manifest_path = artifact_directory / "manifest.json"
    mismatch_path: Path | None = None
    started_wall = datetime.now(timezone.utc)
    started_clock = time.perf_counter()
    hashes = source_hashes(repository, profile_path)
    suite = build_generated_suite(profile)
    formula_by_identity = {id(item.document): item for item in suite.formulas}
    model_by_identity = {id(item.document): item for item in suite.models}
    cache = OracleEvaluationCache()
    expected_count = suite.expected_comparison_count
    actual_count = 0
    mismatch_count = 0
    first_mismatch: ComparisonMismatch | None = None
    constructor_counts: Counter[str] = Counter()
    pal_count = 0
    bapal_count = 0
    nested_bapal_count = 0
    shorthand_count = 0
    s5_comparison_count = 0
    non_s5_comparison_count = 0
    sparse_comparison_count = 0
    failure: Exception | None = None

    try:
        case_iterator = generated_cases(suite)
        while actual_count < expected_count:
            batch: list[ConformanceCase] = []
            for _unused in range(min(suite.batch_size, expected_count - actual_count)):
                batch.append(next(case_iterator))
            oracle_results, production_results = collect_results(batch, repository / "oracle" / "production_runner.js", cache)
            mismatches = compare_result_sets(batch, oracle_results, production_results)
            mismatch_count += len(mismatches)
            if first_mismatch is None and mismatches:
                first_mismatch = mismatches[0]

            for case in batch:
                generated_formula = formula_by_identity[id(case.formula)]
                generated_model = model_by_identity[id(case.model)]
                constructor_counts.update(generated_formula.constructor_counts)
                if generated_formula.constructor_counts.get("announcement", 0):
                    pal_count += 1
                if generated_formula.constructor_counts.get("bapal", 0):
                    bapal_count += 1
                if generated_formula.bapal_nesting >= 2:
                    nested_bapal_count += 1
                if _has_knowledge_shorthand(case.formula["formula"]):
                    shorthand_count += 1
                if generated_model.model_kind == "s5":
                    s5_comparison_count += 1
                else:
                    non_s5_comparison_count += 1
                if generated_model.sparse:
                    sparse_comparison_count += 1
            actual_count += len(batch)
            if progress is not None and (
                actual_count == expected_count
                or actual_count % max(1, expected_count // 10) == 0
            ):
                progress(actual_count, expected_count)

        if actual_count != expected_count:
            raise ConformanceError(
                f"profile stopped at {actual_count}, expected exactly {expected_count} comparisons"
            )
        missing_constructors = sorted(
            constructor for constructor in _FORMULA_CONSTRUCTORS if constructor_counts[constructor] == 0
        )
        if missing_constructors:
            raise ConformanceError(
                "generated profile missed constructors: " + ", ".join(missing_constructors)
            )
        generation = profile["generation"]
        if pal_count < generation["minimumPalComparisons"]:
            raise ConformanceError(
                f"PAL coverage {pal_count} is below {generation['minimumPalComparisons']}"
            )
        if bapal_count < generation["minimumBapalComparisons"]:
            raise ConformanceError(
                f"BAPAL coverage {bapal_count} is below {generation['minimumBapalComparisons']}"
            )
        if nested_bapal_count < generation["minimumNestedBapalComparisons"]:
            raise ConformanceError(
                f"nested BAPAL coverage {nested_bapal_count} is below "
                f"{generation['minimumNestedBapalComparisons']}"
            )
        if min(shorthand_count, s5_comparison_count, non_s5_comparison_count, sparse_comparison_count) <= 0:
            raise ConformanceError("generated profile missed a required model/formula coverage family")
        if max(len(model.live_worlds) for model in suite.models) > suite.bounds["maxLiveWorlds"]:
            raise ConformanceError("generated profile exceeded the live-world bound")
        if max(model.valuation_class_count for model in suite.models) > suite.bounds["maxValuationClasses"]:
            raise ConformanceError("generated profile exceeded the valuation-class bound")
        if max(formula.bapal_nesting for formula in suite.formulas) > suite.bounds["maxBapalNesting"]:
            raise ConformanceError("generated profile exceeded the BAPAL-nesting bound")

        if first_mismatch is not None:
            predicate = lambda candidate: evaluate_mismatch(
                candidate, repository / "oracle" / "production_runner.js"
            )
            minimized, steps, minimized_oracle, minimized_production = minimize_mismatch(
                first_mismatch.case, predicate
            )
            mismatch_path = artifact_directory / "mismatch.json"
            write_mismatch_artifact(
                mismatch_path,
                suite.profile_name,
                suite.seed,
                first_mismatch,
                minimized,
                minimized_oracle,
                minimized_production,
                steps,
                hashes,
            )
    except Exception as error:  # The manifest below records operational failure and partial count.
        failure = error

    finished_wall = datetime.now(timezone.utc)
    elapsed_seconds = time.perf_counter() - started_clock
    model_coverage = {
        "s5ModelCount": sum(model.model_kind == "s5" for model in suite.models),
        "nonS5ModelCount": sum(model.model_kind == "non-s5" for model in suite.models),
        "sparseModelCount": sum(model.sparse for model in suite.models),
        "multipleRelationLabelsModelCount": sum(
            len(model.relation_labels) > 1 for model in suite.models
        ),
        "multiCharacterAtomModelCount": sum(
            model.has_multi_character_atom for model in suite.models
        ),
        "exactSchemaIdentifierModelCount": sum(
            any(
                atom_name in {"__proto__", "constructor", "原子"}
                for world in model.document["worlds"]
                if world is not None
                for atom_name in world["trueAtoms"]
            )
            for model in suite.models
        ),
    }
    observed_bounds = {
        "maxLiveWorlds": max(len(model.live_worlds) for model in suite.models),
        "maxValuationClasses": max(model.valuation_class_count for model in suite.models),
        "maxBapalNesting": max(formula.bapal_nesting for formula in suite.formulas),
    }
    status = "error" if failure is not None else ("mismatch" if mismatch_count else "pass")
    manifest: dict[str, Any] = {
        "format": "bapal-conformance-runtime-manifest",
        "version": 1,
        "status": status,
        "profile": suite.profile_name,
        "profileFile": profile_path.resolve().relative_to(repository.resolve()).as_posix(),
        "seed": suite.seed,
        "seedHex": f"0x{suite.seed:08X}",
        "expectedComparisonCount": expected_count,
        "actualComparisonCount": actual_count,
        "modelCount": len(suite.models),
        "formulaCount": len(suite.formulas),
        "livePointedWorldCount": sum(len(model.live_worlds) for model in suite.models),
        "pointedComparisonCount": actual_count,
        "nodeConstructorCounts": {
            constructor: constructor_counts[constructor]
            for constructor in sorted(_FORMULA_CONSTRUCTORS)
        },
        "palCount": pal_count,
        "bapalCount": bapal_count,
        "nestedBapalComparisonCount": nested_bapal_count,
        "knowledgeShorthandComparisonCount": shorthand_count,
        "s5ComparisonCount": s5_comparison_count,
        "nonS5ComparisonCount": non_s5_comparison_count,
        "sparseNullComparisonCount": sparse_comparison_count,
        "bapalNestingMaximum": observed_bounds["maxBapalNesting"],
        "bounds": dict(suite.bounds),
        "observedBounds": observed_bounds,
        "modelCoverage": model_coverage,
        "gitHead": _git_revision(repository, "HEAD"),
        "gitTree": _git_revision(repository, "HEAD^{tree}"),
        "pythonVersion": platform.python_version(),
        "nodeVersion": node_version(),
        "platform": platform.platform(),
        "sourceHashes": hashes,
        "startedAt": started_wall.isoformat(),
        "finishedAt": finished_wall.isoformat(),
        "elapsedSeconds": round(elapsed_seconds, 6),
        "mismatchCount": mismatch_count,
    }
    if failure is not None:
        manifest["error"] = {"type": type(failure).__name__, "message": str(failure)}
    _write_json(manifest_path, manifest)
    if failure is not None:
        raise ConformanceError(
            f"profile execution failed after {actual_count} comparisons; manifest: {manifest_path}; {failure}"
        ) from failure
    return ConformanceRunResult(
        artifact_directory=artifact_directory,
        manifest_path=manifest_path,
        mismatch_path=mismatch_path,
        expected_comparison_count=expected_count,
        actual_comparison_count=actual_count,
        mismatch_count=mismatch_count,
        elapsed_seconds=elapsed_seconds,
    )
