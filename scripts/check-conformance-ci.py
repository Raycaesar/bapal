#!/usr/bin/env python3
"""Narrow static contract check for the BAPAL conformance workflow."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any


sys.dont_write_bytecode = True
REPOSITORY = Path(__file__).resolve().parents[1]
WORKFLOW = REPOSITORY / ".github" / "workflows" / "bapal-conformance.yml"


def require(condition: bool, message: str) -> None:
    if not condition:
        print(f"FAIL: {message}", file=sys.stderr)
        raise SystemExit(1)


def job_section(source: str, job: str, following_job: str | None = None) -> str:
    start_marker = f"  {job}:\n"
    require(start_marker in source, f"workflow is missing the {job} job")
    section = source.split(start_marker, 1)[1]
    if following_job is not None:
        end_marker = f"  {following_job}:\n"
        require(end_marker in section, f"cannot delimit the {job} job")
        section = section.split(end_marker, 1)[0]
    return section


def job_level_mapping(section: str, key: str) -> str:
    """Return one concrete job-level mapping, excluding nested step mappings."""

    marker = f"    {key}:"
    lines = section.splitlines()
    for index, line in enumerate(lines):
        if not line.startswith(marker):
            continue
        selected = [line]
        for following in lines[index + 1 :]:
            if re.match(r"^    \S", following):
                break
            selected.append(following)
        return "\n".join(selected)
    return ""


def require_artifact_bootstrap(
    section: str, label: str, variable: str, profile: str
) -> None:
    """Check the runner-time artifact path repair and its three consumers."""

    bootstrap_fragments = (
        f"      - name: Configure {label} artifact directory",
        f'          artifact_dir="$RUNNER_TEMP/bapal-conformance/{profile}"',
        '          mkdir -p "$artifact_dir"',
        f'          echo "{variable}=$artifact_dir" >> "$GITHUB_ENV"',
        f'          printf \'%s\\n\' \'{{"format":"bapal-conformance-bootstrap","version":1,"profile":"{profile}","status":"artifact-directory-configured"}}\' > "$artifact_dir/bootstrap.json"',
    )
    require(
        all(fragment in section for fragment in bootstrap_fragments),
        f"{label} runner-time artifact bootstrap is incomplete",
    )
    require(
        section.index("      - name: Set up Python")
        < section.index(f"      - name: Configure {label} artifact directory"),
        f"{label} artifact path is configured before runner setup",
    )
    require(
        f'--artifact-dir "${variable}"' in section,
        f"{label} conformance command does not use the runtime artifact variable",
    )
    require(
        f'os.environ["{variable}"]' in section,
        f"{label} manifest check does not use the runtime artifact variable",
    )
    require(
        f"path: ${{{{ env.{variable} }}}}/" in section,
        f"{label} artifact upload does not resolve the runtime environment variable",
    )


def optional_yaml_check(source: str) -> str:
    try:
        import yaml  # type: ignore[import-not-found]
    except ImportError:
        return "not installed; standard-library structural checks used"
    parsed: Any = yaml.load(source, Loader=yaml.BaseLoader)
    require(isinstance(parsed, dict), "YAML parser did not return a mapping")
    require("on" in parsed and "jobs" in parsed, "parsed workflow lacks on/jobs mappings")
    require(set(parsed["jobs"]) == {"fast", "full"}, "parsed workflow jobs must be fast/full")
    return "PASS"


def main() -> None:
    require(WORKFLOW.is_file(), "workflow does not exist")
    source = WORKFLOW.read_text(encoding="utf-8")
    lowered = source.lower()

    require(re.search(r"^on:\s*$", source, re.MULTILINE) is not None, "on trigger mapping is missing")
    for trigger in ("pull_request", "push", "workflow_dispatch", "schedule"):
        require(
            re.search(rf"^  {re.escape(trigger)}:\s*$", source, re.MULTILINE) is not None,
            f"{trigger} trigger is missing",
        )
    require(re.search(r"^      - bapal-core\s*$", source, re.MULTILINE) is not None, "push is not limited to bapal-core")
    require(
        re.search(r'^    - cron: "17 4 \* \* 1"\s*$', source, re.MULTILINE) is not None,
        "fixed weekly cron is missing",
    )
    require(re.search(r"^permissions:\s*\n  contents: read\s*$", source, re.MULTILINE) is not None, "permissions are not contents: read")
    require("contents: write" not in lowered and "write-all" not in lowered, "workflow grants write permission")

    fast = job_section(source, "fast", "full")
    full = job_section(source, "full")
    require("github.event_name == 'pull_request'" in fast, "FAST does not run for pull requests")
    require("github.event_name == 'push'" in fast, "FAST does not run for pushes")
    require("github.event_name == 'workflow_dispatch'" in fast, "FAST does not run manually")
    require("github.event_name == 'schedule'" not in fast, "FAST unexpectedly runs on schedule")
    require("github.event_name == 'schedule'" in full, "FULL does not run on schedule")
    require("github.event_name == 'workflow_dispatch'" in full, "FULL does not run manually")
    require("pull_request" not in full and "github.event_name == 'push'" not in full, "FULL runs on PR/push")
    require(re.search(r"timeout-minutes:\s*15", fast) is not None, "FAST timeout is missing")
    require(re.search(r"timeout-minutes:\s*30", full) is not None, "FULL timeout is missing")

    for action in ("checkout", "setup-node", "setup-python", "upload-artifact"):
        require(f"actions/{action}@v7" in source, f"official actions/{action}@v7 is missing")
    require(source.count("actions/upload-artifact@v7") == 2, "both jobs must upload artifacts")
    require(source.count("if: always()") >= 6, "always-run verification/upload steps are missing")

    fast_job_env = job_level_mapping(fast, "env")
    full_job_env = job_level_mapping(full, "env")
    require(
        "${{ runner." not in fast_job_env and "${{ runner." not in full_job_env,
        "runner-only context appears under jobs.<job_id>.env",
    )
    require(
        "FAST_ARTIFACT_DIR" not in fast_job_env,
        "FAST artifact path must not be established in job-level env",
    )
    require(
        "FULL_ARTIFACT_DIR" not in full_job_env,
        "FULL artifact path must not be established in job-level env",
    )
    workflow_environment = source.split("jobs:", 1)[0]
    require(
        "FAST_ARTIFACT_DIR" not in workflow_environment,
        "FAST artifact path is configured before a runner exists",
    )
    require(
        "FULL_ARTIFACT_DIR" not in workflow_environment,
        "FULL artifact path is configured before a runner exists",
    )
    require_artifact_bootstrap(fast, "FAST", "FAST_ARTIFACT_DIR", "fast")
    require_artifact_bootstrap(full, "FULL", "FULL_ARTIFACT_DIR", "full")

    fast_command = "python3 scripts/check-oracle-conformance.py\n          --profile fast"
    full_command = "python3 scripts/check-oracle-conformance.py\n          --profile full"
    require(fast_command in fast, "exact FAST conformance command is missing")
    require(full_command in full, "exact FULL conformance command is missing")
    for section_name, section in (("FAST", fast), ("FULL", full)):
        require("python3 scripts/check-independent-oracle.py" in section, f"{section_name} core check is missing")
        require("python3 scripts/check-oracle-sensitivity.py" in section, f"{section_name} sensitivity check is missing")
        require("git diff --check" in section, f"{section_name} whitespace check is missing")
        require("git status --porcelain=v1" in section, f"{section_name} clean-tree check is missing")
        require("manifest.json" in section, f"{section_name} manifest existence check is missing")
        require("mismatchCount" in section, f"{section_name} manifest mismatch check is missing")

    inherited_checks = (
        "check-agent-rendering.js",
        "check-atomic-model-import.js",
        "check-bapal-regression.js",
        "check-bapal-valuation-class.js",
        "check-formula-roundtrip.js",
        "check-formula-schema-v1.js",
        "check-logic-regressions.js",
        "check-model-schema-v1.js",
        "check-report-links.js",
        "check-s5-closure.js",
        "check-s5-invariants.js",
        "check-semantic-state-visibility.js",
        "check-structural-copy-regressions.js",
    )
    for script in inherited_checks:
        require(source.count(f"node scripts/{script}") == 2, f"{script} must run once in each job")
    require("random-bapal-evaluation" not in source, "workflow invokes the random report generator")
    require("check-all.js" not in source, "workflow invokes the report-generating aggregate check")
    require("continue-on-error" not in source, "workflow hides a conformance failure")

    parser_result = optional_yaml_check(source)
    print("PASS: triggers, job conditions, supported runtimes, and timeouts")
    print("PASS: exact FAST/FULL/core/sensitivity commands and inherited non-writing checks")
    print("PASS: FAST/FULL artifact paths and bootstrap diagnostics are created after runner setup")
    print("PASS: minimal permissions, clean-tree gates, manifest gates, and always-run uploads")
    print("PASS: random report generation is absent")
    print(f"YAML parser check: {parser_result}")


if __name__ == "__main__":
    main()
