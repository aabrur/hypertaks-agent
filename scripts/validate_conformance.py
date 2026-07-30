#!/usr/bin/env python3
"""Validator for cross-host behavioral conformance evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
SPEC_PATH = ROOT / "evals" / "cross-host" / "CONFORMANCE-SPEC.md"
CASES_PATH = ROOT / "evals" / "cross-host" / "cases.jsonl"
RESULTS_PATH = ROOT / "evals" / "cross-host" / "results.json"


def main() -> int:
    errors: list[str] = []

    if not SPEC_PATH.is_file():
        errors.append("CONFORMANCE-SPEC.md is missing")

    if not CASES_PATH.is_file():
        errors.append("cases.jsonl is missing")
    else:
        cases = []
        with CASES_PATH.open("r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    if not isinstance(record, dict):
                        errors.append(f"cases.jsonl L{line_num} must be a JSON object")
                        continue
                    if not record.get("caseId"):
                        errors.append(f"cases.jsonl L{line_num} missing caseId")
                    if not record.get("host"):
                        errors.append(f"cases.jsonl L{line_num} missing host")
                    if record.get("verdict") not in ("PASS", "FAIL", "PARTIAL", "BLOCKED"):
                        errors.append(f"cases.jsonl L{line_num} invalid verdict: {record.get('verdict')}")
                    cases.append(record)
                except json.JSONDecodeError as exc:
                    errors.append(f"cases.jsonl L{line_num} invalid JSON: {exc}")

    if not RESULTS_PATH.is_file():
        errors.append("results.json is missing")
    else:
        try:
            results = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))
            if not isinstance(results, dict):
                errors.append("results.json must be a JSON object")
            elif results.get("verdict") != "PASS":
                errors.append("results.json overall verdict must be PASS")
        except json.JSONDecodeError as exc:
            errors.append(f"results.json invalid JSON: {exc}")

    if errors:
        print("Cross-host conformance validation FAILED:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("Cross-host conformance validation: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
