#!/usr/bin/env python3
"""Validator for cross-host behavioral conformance evidence."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
SPEC_PATH = ROOT / "evals" / "cross-host" / "CONFORMANCE-SPEC.md"
CASES_PATH = ROOT / "evals" / "cross-host" / "cases.jsonl"
RESULTS_PATH = ROOT / "evals" / "cross-host" / "results.json"

ALLOWED_EVIDENCE_TYPES = {
    "official-documentation",
    "static-package",
    "installer-lifecycle",
    "real-host-lifecycle",
}
PASS_EVIDENCE_TYPE = "real-host-lifecycle"
ALLOWED_VERDICTS = {
    "PASS",
    "PARTIAL",
    "FAIL",
    "BLOCKED",
    "NOT_SUPPORTED",
    "NEEDS_ACCOUNT",
    "NEEDS_PAID_PLAN",
    "NEEDS_MANUAL_HOST_TEST",
}
REQUIRED_CASE_KEYS = {
    "caseId",
    "host",
    "hostVersion",
    "model",
    "executionMode",
    "os",
    "repositoryCommit",
    "rawPrompt",
    "expectedInvariant",
    "actualResult",
    "evidenceType",
    "evidencePath",
    "verdict",
    "limitations",
    "reviewer",
}


def validate(spec_path: Path, cases_path: Path, results_path: Path) -> int:
    errors: list[str] = []

    if not spec_path.is_file():
        errors.append("CONFORMANCE-SPEC.md is missing")

    cases: list[Mapping[str, Any]] = []
    if not cases_path.is_file():
        errors.append("cases.jsonl is missing")
    else:
        with cases_path.open("r", encoding="utf-8") as handle:
            for line_num, line in enumerate(handle, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError as exc:
                    errors.append(f"cases.jsonl L{line_num} invalid JSON: {exc}")
                    continue
                if not isinstance(record, Mapping):
                    errors.append(f"cases.jsonl L{line_num} must be a JSON object")
                    continue
                missing = REQUIRED_CASE_KEYS - record.keys()
                if missing:
                    errors.append(
                        f"cases.jsonl L{line_num} (case {record.get('caseId')}) missing required keys: {sorted(missing)}"
                    )
                evidence_type = record.get("evidenceType")
                if evidence_type not in ALLOWED_EVIDENCE_TYPES:
                    errors.append(
                        f"cases.jsonl L{line_num} (case {record.get('caseId')}) unsupported evidenceType: {evidence_type}"
                    )
                verdict = record.get("verdict")
                if verdict not in ALLOWED_VERDICTS:
                    errors.append(
                        f"cases.jsonl L{line_num} (case {record.get('caseId')}) unsupported verdict: {verdict}"
                    )
                if verdict == "PASS" and evidence_type != PASS_EVIDENCE_TYPE:
                    errors.append(
                        f"cases.jsonl L{line_num} (case {record.get('caseId')}) verdict PASS requires evidenceType "
                        f"{PASS_EVIDENCE_TYPE}; only real-host-lifecycle supports a case PASS"
                    )
                evidence_path = record.get("evidencePath")
                if isinstance(evidence_path, str) and evidence_path:
                    resolved = (ROOT / evidence_path).resolve()
                    if not resolved.is_relative_to(ROOT.resolve()):
                        errors.append(
                            f"cases.jsonl L{line_num} (case {record.get('caseId')}) evidencePath escapes repository root: {evidence_path}"
                        )
                cases.append(record)

    if not results_path.is_file():
        errors.append("results.json is missing")
        results: dict[str, Any] = {}
    else:
        try:
            results = json.loads(results_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"results.json invalid JSON: {exc}")
            results = {}
        if not isinstance(results, Mapping):
            errors.append("results.json must be a JSON object")
            results = {}

    counts = Counter(c.get("verdict") for c in cases)
    total_cases = len(cases)
    failed_cases = counts.get("FAIL", 0)
    passed_cases = counts.get("PASS", 0)
    if failed_cases > 0:
        aggregate = "FAIL"
    elif passed_cases == total_cases and total_cases > 0:
        aggregate = "PASS"
    else:
        aggregate = "PARTIAL"

    if isinstance(results, Mapping):
        if results.get("totalCases") != total_cases:
            errors.append(
                f"results.json totalCases ({results.get('totalCases')}) disagrees with cases ({total_cases})"
            )
        if results.get("verdict") != aggregate:
            errors.append(
                f"results.json verdict ({results.get('verdict')}) disagrees with derived aggregate ({aggregate})"
            )
        result_cases = results.get("results")
        if isinstance(result_cases, list):
            result_ids = {r.get("caseId") for r in result_cases if isinstance(r, Mapping)}
            case_ids = {c.get("caseId") for c in cases}
            if result_ids != case_ids:
                errors.append(
                    f"results.json case ids disagree with cases.jsonl: results={sorted(result_ids)}, cases={sorted(case_ids)}"
                )

    if errors:
        print("Cross-host conformance validation FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Cross-host conformance validation: PASS")
    return 0


def main() -> int:
    return validate(SPEC_PATH, CASES_PATH, RESULTS_PATH)


if __name__ == "__main__":
    raise SystemExit(main())
