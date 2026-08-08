#!/usr/bin/env python3
"""Permanent checks for the checked-in independent semantic oracle."""

from __future__ import annotations

import ast
import builtins
import hashlib
import json
import platform
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any, NoReturn


sys.dont_write_bytecode = True

REPOSITORY = Path(__file__).resolve().parents[1]
ORACLE_PATH = REPOSITORY / "oracle" / "bapal_oracle.py"
RUNNER_PATH = REPOSITORY / "oracle" / "production_runner.js"
COMPARATOR_PATH = REPOSITORY / "oracle" / "conformance.py"
CORPUS_PATH = REPOSITORY / "conformance" / "v1" / "core-corpus.jsonl"


def fail(message: str) -> NoReturn:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def import_names(tree: ast.AST) -> set[str]:
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.add(node.module)
    return names


def check_oracle_source() -> None:
    source = ORACLE_PATH.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(ORACLE_PATH))
    imports = import_names(tree)
    direct_calls = {
        node.func.id
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
    }
    attribute_calls = {
        node.func.attr
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
    }

    forbidden_import_roots = {
        "subprocess",
        "asyncio.subprocess",
        "nodejs",
        "execjs",
        "js2py",
    }
    bad_imports = sorted(
        name for name in imports if name in forbidden_import_roots
        or name.split(".", 1)[0] in {"subprocess", "nodejs", "execjs", "js2py"}
    )
    if bad_imports:
        fail(f"oracle imports forbidden execution bridge(s): {', '.join(bad_imports)}")

    lowered = source.lower()
    forbidden_fragments = (
        "mpl.truth",
        "js/mpl.js",
        "js\\mpl.js",
        "js/schema-v1.js",
        "js\\schema-v1.js",
        "production_runner",
        "child_process",
    )
    present = [fragment for fragment in forbidden_fragments if fragment in lowered]
    if present:
        fail(f"oracle source contains forbidden production reference(s): {', '.join(present)}")

    forbidden_direct_calls = {
        "open",
        "exec",
        "eval",
        "compile",
        "__import__",
    }
    forbidden_attribute_calls = {
        "open",
        "read_text",
        "read_bytes",
        "system",
        "popen",
        "Popen",
        "spawnl",
        "spawnlp",
        "spawnv",
        "spawnvp",
    }
    bad_calls = sorted(
        (direct_calls & forbidden_direct_calls) | (attribute_calls & forbidden_attribute_calls)
    )
    if bad_calls:
        fail(f"oracle performs forbidden runtime file/process operation(s): {', '.join(bad_calls)}")

    process_literals = {
        value.strip().lower()
        for value in (
            node.value
            for node in ast.walk(tree)
            if isinstance(node, ast.Constant) and isinstance(node.value, str)
        )
    }
    if "node" in process_literals or "nodejs" in process_literals:
        fail("oracle source contains a Node executable literal")


def check_runner_source() -> None:
    source = RUNNER_PATH.read_text(encoding="utf-8")
    lowered = source.lower()

    required_fragments = (
        "MPL.SchemaV1.decodeModel",
        "MPL.SchemaV1.decodeFormula",
        "MPL.truth",
    )
    missing = [fragment for fragment in required_fragments if fragment not in source]
    if missing:
        fail(f"production runner omits required production call(s): {', '.join(missing)}")
    if source.count("MPL.truth") != 1:
        fail("production runner must contain exactly one MPL.truth call")

    forbidden_fragments = (
        "core-corpus",
        "bapal_oracle",
        "child_process",
        "subprocess",
        "python",
        "expected",
    )
    present = [fragment for fragment in forbidden_fragments if fragment in lowered]
    if present:
        fail(f"production runner contains forbidden oracle/table bridge(s): {', '.join(present)}")

    duplicate_evaluator_patterns = {
        "formula-type dispatch": r"\b(?:switch\s*\([^)]*\.type|\.type\s*===)",
        "semantic evaluator function": r"\bfunction\s+(?:truth|evaluate|evalFormula|satisfies)\b",
        "valuation-class helper": r"\b(?:valuationClasses|booleanDefinableDomains|powerSet)\b",
    }
    for label, pattern in duplicate_evaluator_patterns.items():
        if re.search(pattern, source):
            fail(f"production runner appears to contain a duplicate {label}")


def check_oracle_runtime_no_io(oracle_module: Any) -> None:
    model_document = {
        "format": "bapal-model",
        "version": 1,
        "worlds": [{"trueAtoms": ["p"], "transitions": []}],
    }
    formula_document = {
        "format": "bapal-formula",
        "version": 1,
        "formula": {"type": "atom", "name": "p"},
    }
    original_open = builtins.open

    def denied_open(*_args: Any, **_kwargs: Any) -> Any:
        raise AssertionError("independent oracle attempted runtime file I/O")

    builtins.open = denied_open
    try:
        result = oracle_module.evaluate(model_document, formula_document, 0)
    finally:
        builtins.open = original_open
    if result is not True:
        fail("oracle behavioral independence probe did not return the expected atom result")


def print_mismatch(outcome: Any) -> None:
    print("MISMATCH", file=sys.stderr)
    print(f"case ID: {outcome.case_id}", file=sys.stderr)
    print(f"category: {outcome.category}", file=sys.stderr)
    print(f"world: {outcome.world}", file=sys.stderr)
    print(f"expected: {json.dumps(outcome.expected)}", file=sys.stderr)
    print(f"oracle result: {json.dumps(outcome.oracle_result)}", file=sys.stderr)
    print(f"production result: {json.dumps(outcome.production_result)}", file=sys.stderr)
    print(
        "canonical model: "
        + json.dumps(outcome.canonical_model, ensure_ascii=False, separators=(",", ":")),
        file=sys.stderr,
    )
    print(
        "canonical formula: "
        + json.dumps(outcome.canonical_formula, ensure_ascii=False, separators=(",", ":")),
        file=sys.stderr,
    )


def main() -> None:
    required = (ORACLE_PATH, RUNNER_PATH, COMPARATOR_PATH, CORPUS_PATH)
    for path in required:
        if not path.is_file():
            fail(f"required Round 6 file is missing: {path.relative_to(REPOSITORY)}")

    check_oracle_source()
    check_runner_source()

    sys.path.insert(0, str(REPOSITORY))
    from oracle import bapal_oracle
    from oracle import conformance

    check_oracle_runtime_no_io(bapal_oracle)
    cases = conformance.load_core_corpus(CORPUS_PATH)
    conformance.validate_core_cases(cases)
    outcomes = conformance.compare_core_cases(cases, RUNNER_PATH)

    mismatches = [
        outcome
        for outcome in outcomes
        if outcome.oracle_result is not outcome.expected
        or outcome.production_result is not outcome.expected
        or outcome.oracle_result is not outcome.production_result
    ]
    if mismatches:
        for outcome in mismatches:
            print_mismatch(outcome)
        fail(f"{len(mismatches)} core conformance mismatch(es)")

    categories = Counter(case["category"] for case in cases)
    print(f"PASS: {len(cases)} explicit core cases")
    print("category coverage: " + ", ".join(f"{name}={categories[name]}" for name in sorted(categories)))
    print(f"Python: {platform.python_version()}")
    print(f"Node: {conformance.node_version()}")
    for path in (ORACLE_PATH, RUNNER_PATH, COMPARATOR_PATH, CORPUS_PATH, Path(__file__).resolve()):
        print(f"SHA-256 {path.relative_to(REPOSITORY)}: {sha256(path)}")
    print("independence guards: PASS (static source checks plus no-file-I/O evaluation probe)")


if __name__ == "__main__":
    main()
