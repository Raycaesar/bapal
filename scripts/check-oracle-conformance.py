#!/usr/bin/env python3
"""Run one exact deterministic independent-oracle conformance profile."""

from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path


sys.dont_write_bytecode = True
REPOSITORY = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPOSITORY))

from oracle import conformance


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", choices=("fast", "full"), required=True)
    parser.add_argument(
        "--artifact-dir",
        type=Path,
        help="explicit output directory for manifest and mismatch artifacts",
    )
    return parser.parse_args()


def main() -> int:
    arguments = parse_arguments()
    try:
        profiles = conformance.validate_checked_in_profiles(REPOSITORY)
        profile = profiles[arguments.profile]
        profile_path = (
            REPOSITORY / "conformance" / "v1" / f"{arguments.profile}-profile.json"
        )
        if arguments.artifact_dir is None:
            artifact_directory = Path(
                tempfile.mkdtemp(prefix=f"bapal-conformance-{arguments.profile}-")
            )
        else:
            artifact_directory = arguments.artifact_dir.resolve()

        print(
            f"{arguments.profile.upper()} profile: seed={profile['seedHex']}; "
            f"target={profile['expectedComparisonCount']}"
        )
        print(f"artifact directory: {artifact_directory}")

        def progress(actual: int, expected: int) -> None:
            print(f"progress: {actual}/{expected}", flush=True)

        result = conformance.run_generated_profile(
            REPOSITORY,
            profile_path,
            profile,
            artifact_directory,
            progress=progress,
        )
    except (conformance.ConformanceError, OSError, ValueError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1

    print(
        f"comparisons: {result.actual_comparison_count}/{result.expected_comparison_count}; "
        f"mismatches: {result.mismatch_count}"
    )
    print(f"elapsed seconds: {result.elapsed_seconds:.6f}")
    print(f"runtime manifest: {result.manifest_path}")
    if result.mismatch_path is not None:
        print(f"mismatch artifact: {result.mismatch_path}")
    if result.mismatch_count:
        print("FAIL: generated oracle/production mismatches detected", file=sys.stderr)
        return 1
    print(f"PASS: exact {arguments.profile.upper()} conformance profile")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
