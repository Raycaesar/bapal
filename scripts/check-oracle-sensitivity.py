#!/usr/bin/env python3
"""Prove that the shared comparator detects one deliberate in-memory mismatch."""

from __future__ import annotations

import copy
import json
import sys
import tempfile
from pathlib import Path


sys.dont_write_bytecode = True
REPOSITORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPOSITORY))

from oracle import conformance


SEED = 0xBAD0C0DE


def require(condition: bool, message: str) -> None:
    if not condition:
        raise conformance.ConformanceError(message)


def main() -> int:
    runner_path = REPOSITORY / "oracle" / "production_runner.js"
    temporary_path: Path | None = None
    try:
        conformance.validate_checked_in_profiles(REPOSITORY)
        cases = conformance.sensitivity_cases(SEED)
        oracle_results, production_results = conformance.collect_results(cases, runner_path)
        real_mismatches = conformance.compare_result_sets(
            cases, oracle_results, production_results
        )
        require(not real_mismatches, "sensitivity baseline contains a real mismatch")

        flipped_index = 9
        mutated_production = copy.copy(production_results)
        mutated_production[flipped_index] = not mutated_production[flipped_index]
        deliberate_mismatches = conformance.compare_result_sets(
            cases, oracle_results, mutated_production
        )
        require(len(deliberate_mismatches) == 1, "comparator did not report exactly one flipped result")
        mismatch = deliberate_mismatches[0]
        require(
            mismatch.case.case_index == flipped_index,
            "comparator reported the wrong deliberate-mismatch case",
        )

        synthetic_predicate = lambda candidate: conformance.evaluate_mismatch(
            candidate, runner_path, production_transform=lambda value: not value
        )
        minimized, steps, minimized_oracle, minimized_production = conformance.minimize_mismatch(
            mismatch.case, synthetic_predicate
        )
        require(bool(steps), "deterministic minimization retained no reduction")
        reduction_kinds = {step["kind"] for step in steps}
        require(
            {
                "remove-transition",
                "remove-true-atom",
                "remove-nonpointed-world",
                "replace-formula-subtree",
            }.issubset(reduction_kinds),
            "sensitivity case did not exercise every implemented shrink phase",
        )
        require(
            minimized.model != mismatch.case.model or minimized.formula != mismatch.case.formula,
            "implemented shrinker did not reduce the deliberate mismatch",
        )
        replay_mismatch, replay_oracle, replay_production = synthetic_predicate(minimized)
        require(replay_mismatch, "reduced deliberate case is not replayably mismatching")
        require(
            (replay_oracle, replay_production) == (minimized_oracle, minimized_production),
            "reduced replay results changed after minimization",
        )

        with tempfile.TemporaryDirectory(prefix="bapal-oracle-sensitivity-") as temporary:
            temporary_path = Path(temporary)
            mismatch_path = temporary_path / "mismatch.json"
            artifact = conformance.write_mismatch_artifact(
                mismatch_path,
                "sensitivity",
                SEED,
                mismatch,
                minimized,
                minimized_oracle,
                minimized_production,
                steps,
                conformance.source_hashes(REPOSITORY),
                synthetic_transform="one production Boolean flipped in memory",
            )
            require(mismatch_path.is_file(), "sensitivity mismatch artifact was not created")
            reloaded = json.loads(mismatch_path.read_text(encoding="utf-8"))
            require(reloaded == artifact, "written mismatch artifact is not replayable JSON")
            require(
                reloaded["caseId"] == cases[flipped_index].case_id,
                "mismatch artifact does not contain the flipped case",
            )
            require(
                reloaded["productionResult"] == mutated_production[flipped_index],
                "mismatch artifact did not retain the flipped production result",
            )
            require(
                reloaded["minimizedCase"]["oracleResult"]
                is not reloaded["minimizedCase"]["productionResult"],
                "artifact's reduced case does not retain the deliberate mismatch",
            )
        require(temporary_path is not None and not temporary_path.exists(), "temporary artifacts were not cleaned")
    except (conformance.ConformanceError, OSError, ValueError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1

    print(f"seed: 0x{SEED:08X}")
    print(f"normal comparisons: {len(cases)}; real mismatches: 0")
    print(f"flipped case index: {flipped_index}; deliberate mismatches: 1")
    print(f"minimization steps: {len(steps)}; phases: {', '.join(sorted(reduction_kinds))}")
    print("temporary mismatch artifact: created, validated, replayed, and cleaned")
    print("PASS: deliberate mismatch sensitivity")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
