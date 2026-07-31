#!/usr/bin/env python3
"""Unit tests for cross-host conformance validator."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_conformance import validate


class ValidateConformanceTests(unittest.TestCase):
    def _fixtures(self, cases: list[dict] | None, results: dict | None) -> tuple[Path, Path, Path]:
        self.tmp = tempfile.mkdtemp(prefix="hypertaks-conformance-test-")
        directory = Path(self.tmp)
        spec = directory / "CONFORMANCE-SPEC.md"
        spec.write_text("# Spec\n", encoding="utf-8")
        cases_path = directory / "cases.jsonl"
        if cases is not None:
            with cases_path.open("w", encoding="utf-8") as handle:
                for case in cases:
                    handle.write(json.dumps(case) + "\n")
        results_path = directory / "results.json"
        if results is not None:
            results_path.write_text(json.dumps(results), encoding="utf-8")
        return spec, cases_path, results_path

    def tearDown(self) -> None:
        import shutil

        shutil.rmtree(self.tmp, ignore_errors=True)

    def _base_case(self, **overrides) -> dict:
        record = {
            "caseId": "CH-T1",
            "host": "antigravity",
            "hostVersion": "1.4.0",
            "model": "gemini-3.6-flash",
            "executionMode": "native-plugin",
            "os": "linux",
            "repositoryCommit": "deadbeef",
            "rawPrompt": "Hypertaks, fix a typo in README.md",
            "expectedInvariant": "INV-04",
            "actualResult": "task completed",
            "evidenceType": "static-package",
            "evidencePath": "evals/hosts/antigravity/REPORT.md",
            "verdict": "PARTIAL",
            "limitations": "structural check only; not run on a live host",
            "reviewer": "codex-cross-ai-distribution-wave-2",
        }
        record.update(overrides)
        return record

    def _results_for(self, verdict: str, cases: list[dict]) -> dict:
        return {
            "totalCases": len(cases),
            "passedCases": sum(1 for c in cases if c["verdict"] == "PASS"),
            "failedCases": sum(1 for c in cases if c["verdict"] == "FAIL"),
            "verdict": verdict,
            "testedCommit": "deadbeef",
            "results": [{"caseId": c["caseId"], "host": c["host"], "verdict": c["verdict"]} for c in cases],
        }

    def test_missing_evidence_type_rejected(self) -> None:
        case = self._base_case()
        del case["evidenceType"]
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_missing_evidence_path_rejected(self) -> None:
        case = self._base_case()
        del case["evidencePath"]
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_missing_actual_result_rejected(self) -> None:
        case = self._base_case()
        del case["actualResult"]
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_missing_limitations_rejected(self) -> None:
        case = self._base_case()
        del case["limitations"]
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_missing_reviewer_rejected(self) -> None:
        case = self._base_case()
        del case["reviewer"]
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_pass_requires_real_host_lifecycle(self) -> None:
        case = self._base_case(verdict="PASS", evidenceType="static-package")
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PASS", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_escaping_evidence_path_rejected(self) -> None:
        case = self._base_case(evidencePath="../escape.txt")
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_results_totals_disagree_rejected(self) -> None:
        case = self._base_case()
        results = self._results_for("PARTIAL", [case])
        results["totalCases"] = 99
        spec, cases_path, results_path = self._fixtures([case], results)
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_results_aggregate_disagrees_rejected(self) -> None:
        case = self._base_case()
        results = self._results_for("PARTIAL", [case])
        results["verdict"] = "PASS"
        spec, cases_path, results_path = self._fixtures([case], results)
        self.assertNotEqual(validate(spec, cases_path, results_path), 0)

    def test_valid_real_host_pass_accepted(self) -> None:
        case = self._base_case(verdict="PASS", evidenceType="real-host-lifecycle")
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PASS", [case]))
        self.assertEqual(validate(spec, cases_path, results_path), 0)

    def test_valid_partial_accepted(self) -> None:
        case = self._base_case()
        spec, cases_path, results_path = self._fixtures([case], self._results_for("PARTIAL", [case]))
        self.assertEqual(validate(spec, cases_path, results_path), 0)


if __name__ == "__main__":
    unittest.main()
