import json
import io
import hashlib
import subprocess
import sys
import tempfile
import unittest
import zipfile
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).parent))
import run_evals


class TestRunEvalsProvenance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.case = next(c for c in run_evals.load_cases()[0] if c["id"] == "EV-24")
        cls.commit = run_evals.current_head()
        cls.tree = run_evals.git_tree(cls.commit)
        cls.skill_hash = run_evals.calc_skill_root_hash(cls.commit)

    def make_transcript(self, **overrides):
        data = {
            "case_id": "EV-24",
            "model": "executor-model",
            "model_mode": "cold-session",
            "harness": "real-harness",
            "session_id": "session-1",
            "cold_session": True,
            "tested_commit": self.commit,
            "tested_tree": self.tree,
            "skill_root": "skills/hypertaks",
            "skill_root_hash": self.skill_hash,
            "executor": "executor-agent",
            "grader": "independent-grader",
            "raw_prompt": self.case["setup"],
            "raw_response": "WIP = TH x FT = 50 x 2 = 100 units",
            "tool_calls": ["read skills/hypertaks/SKILL.md"],
            "tool_results": ["SKILL.md loaded"],
            "evidence_quotes": ["WIP = TH x FT = 50 x 2 = 100 units"],
            "verdict": "PASS",
        }
        data.update(overrides)
        return data

    def validate(self, data, result=None):
        result = result or {"verdict": "PASS", "method": "behavioral"}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "EV-24.jsonl"
            path.write_text(json.dumps(data) + "\n", encoding="utf-8")
            return run_evals.validate_transcript("EV-24", result, self.case, path)

    def test_accepts_valid_transcript(self):
        self.assertEqual(self.validate(self.make_transcript()), [])

    def test_rejects_invalid_tree_hash(self):
        errors = self.validate(self.make_transcript(tested_tree="0" * 40))
        self.assertTrue(any("tested_tree" in error for error in errors))

    def test_rejects_unknown_commit(self):
        errors = self.validate(self.make_transcript(tested_commit="0" * 40))
        self.assertTrue(any("tested_commit" in error for error in errors))

    def test_rejects_invalid_skill_hash(self):
        errors = self.validate(self.make_transcript(skill_root_hash="0" * 64))
        self.assertTrue(any("skill_root_hash" in error for error in errors))

    def test_rejects_placeholder_response(self):
        errors = self.validate(self.make_transcript(raw_response="[placeholder response]"))
        self.assertTrue(any("raw_response" in error for error in errors))

    def test_rejects_self_grading(self):
        errors = self.validate(
            self.make_transcript(
                grader="executor-agent (self-graded)",
            )
        )
        self.assertTrue(any("self-graded" in error for error in errors))
        self.assertTrue(any("executor and grader are the same" in error for error in errors))

    def test_parser_uses_jsonl_lines(self):
        first = self.make_transcript(session_id="first")
        second = self.make_transcript(session_id="second")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "two.jsonl"
            path.write_bytes((json.dumps(first) + "\r\n" + json.dumps(second) + "\r\n").encode())
            records = run_evals.read_transcript(path)
        self.assertEqual([record["session_id"] for record in records], ["first", "second"])

    def test_certified_commit_may_be_current_head_ancestor(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            subprocess.run(
                ["git", "-C", str(repo), "config", "user.name", "Test Runner"],
                check=True,
            )
            subprocess.run(
                ["git", "-C", str(repo), "config", "user.email", "runner@example.invalid"],
                check=True,
            )
            marker = repo / "marker.txt"
            marker.write_text("parent\n", encoding="utf-8")
            subprocess.run(["git", "-C", str(repo), "add", "marker.txt"], check=True)
            subprocess.run(
                ["git", "-C", str(repo), "commit", "-q", "-m", "parent"],
                check=True,
            )
            parent = subprocess.check_output(
                ["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
            marker.write_text("child\n", encoding="utf-8")
            subprocess.run(["git", "-C", str(repo), "add", "marker.txt"], check=True)
            subprocess.run(
                ["git", "-C", str(repo), "commit", "-q", "-m", "child"],
                check=True,
            )
            child = subprocess.check_output(
                ["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()

            with mock.patch.object(run_evals, "ROOT", repo):
                self.assertTrue(run_evals.commit_is_ancestor(parent, child))
                self.assertTrue(run_evals.commit_is_ancestor(child))
                self.assertFalse(run_evals.commit_is_ancestor("0" * 40, child))


class TestEvalInventory(unittest.TestCase):
    def test_capability_cases_include_v430_set_and_adapter_boundary(self):
        cases, errors = run_evals.load_cases()
        self.assertEqual(errors, [])
        capability_ids = [
            case["id"] for case in cases if case["group"] == "capability"
        ]
        self.assertEqual(
            capability_ids,
            ["EV-45", "EV-46", "EV-47", "EV-48", "EV-49", "EV-64"],
        )

    def test_suite_contains_65_case_definitions(self):
        cases, errors = run_evals.load_cases()
        self.assertEqual(errors, [])
        self.assertEqual(len(cases), 65)

    def test_v440_new_cases_are_contiguous(self):
        cases, errors = run_evals.load_cases()
        self.assertEqual(errors, [])
        ids = [case["id"] for case in cases]
        self.assertEqual(
            [case_id for case_id in ids if 50 <= int(case_id.split("-")[1]) <= 65],
            [f"EV-{number:02d}" for number in range(50, 66)],
        )


class TestBossConfirmedReport(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.commit = run_evals.current_head()
        cls.tree = run_evals.git_tree(cls.commit)
        cls.skill_hash = run_evals.calc_skill_root_hash(cls.commit)
        package_at_commit = subprocess.check_output(
            run_evals.git_args("show", f"{cls.commit}:package.json"), text=True
        )
        cls.version = json.loads(package_at_commit)["version"]
        cls.case_ids = [f"EV-{number:02d}" for number in range(1, 50)]

    def make_report(self, missing_source=None):
        non_pass = {"EV-01", "EV-02", "EV-03", "EV-04", "EV-05", "EV-20"}
        results = {}
        for case_id in self.case_ids:
            source_report = "Final-EV-Report.md"
            row = {
                "verdict": "SKIPPED(harness)" if case_id in non_pass else "PASS",
                "method": "behavioral",
                "confirmed_by_boss": True,
                "final_verdict_source": f"Boss-confirmed main-agent review of {source_report}",
                "source_report": source_report,
                "evidence_quotes": ["Harness limitation documented"] if case_id in non_pass else [],
            }
            if case_id == missing_source:
                row.pop("final_verdict_source")
            results[case_id] = row
        return {
            "meta": {
                "version": self.version,
                "case_ids": list(self.case_ids),
                "confirmed_by_boss": True,
                "final_verdict_authority": "Boss-confirmed main-agent review",
                "certification_status": "BEHAVIORALLY CERTIFIED",
                "total_ev": 49,
                "behavioral_pass": 43,
                "behavioral_non_pass": 6,
                "static_green": 49,
                "release_threshold": 24,
                "threshold_margin": 19,
                "tested_commit": self.commit,
                "tested_tree": self.tree,
                "skill_root_hash": self.skill_hash,
            },
            "results": results,
        }

    def run_report(
            self, report, exclude_archive_report=None,
            bad_archive_hash=False, invalid_archive=False):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            archive_path = directory / "source-reports.zip"
            source_reports = sorted({
                row.get("source_report") for row in report["results"].values()
                if row.get("source_report")
                and row.get("source_report") != exclude_archive_report
            })
            with zipfile.ZipFile(archive_path, "w") as archive:
                for source_report in source_reports:
                    archive.writestr(source_report, "preserved raw report evidence")
            if invalid_archive:
                archive_path.write_bytes(b"not a zip file")
            report["meta"]["source_report_archive"] = archive_path.name
            report["meta"]["source_report_archive_sha256"] = hashlib.sha256(
                archive_path.read_bytes()).hexdigest()
            if bad_archive_hash:
                report["meta"]["source_report_archive_sha256"] = "0" * 64
            path = directory / "results.yaml"
            path.write_text(run_evals.yaml.safe_dump(report, sort_keys=False), encoding="utf-8")
            output = io.StringIO()
            with redirect_stdout(output):
                status = run_evals.cmd_report(path)
        return status, output.getvalue()

    def test_accepts_boss_confirmed_43_pass_release_gate(self):
        status, output = self.run_report(self.make_report())
        self.assertEqual(status, 0)
        self.assertIn("43/49 PASS", output)
        self.assertIn("documented non-PASS: 6", output)
        self.assertIn("threshold margin: +19", output)
        self.assertIn("release gate: PASSED", output)

    def test_rejects_boss_confirmed_row_without_final_verdict_source(self):
        status, output = self.run_report(self.make_report(missing_source="EV-49"))
        self.assertEqual(status, 1)
        self.assertIn("EV-49: final_verdict_source is required", output)

    def test_rejects_source_report_missing_from_archive(self):
        report = self.make_report()
        source_report = report["results"]["EV-49"]["source_report"]
        status, output = self.run_report(
            report, exclude_archive_report=source_report)
        self.assertEqual(status, 1)
        self.assertIn("source_report is missing from source_report_archive", output)

    def test_rejects_source_report_archive_hash_mismatch(self):
        status, output = self.run_report(
            self.make_report(), bad_archive_hash=True)
        self.assertEqual(status, 1)
        self.assertIn("source_report_archive_sha256 does not match", output)

    def test_rejects_invalid_source_report_archive(self):
        status, output = self.run_report(
            self.make_report(), invalid_archive=True)
        self.assertEqual(status, 1)
        self.assertIn("source_report_archive is not a valid ZIP file", output)

    def test_evidence_missing_blocks_release_gate(self):
        report = self.make_report()
        report["results"]["EV-06"]["verdict"] = "EVIDENCE_MISSING"
        report["results"]["EV-06"]["evidence_quotes"] = ["Evidence unavailable"]
        report["meta"]["behavioral_pass"] = 42
        report["meta"]["behavioral_non_pass"] = 7
        report["meta"]["threshold_margin"] = 18
        status, output = self.run_report(report)
        self.assertEqual(status, 1)
        self.assertIn("1 EVIDENCE_MISSING: EV-06", output)
        self.assertIn("release gate: NOT PASSED", output)

    def test_rejects_stale_static_green_metadata(self):
        report = self.make_report()
        report["meta"]["static_green"] = 0
        status, output = self.run_report(report)
        self.assertEqual(status, 1)
        self.assertIn("meta: static_green must be 49", output)

    def test_rejects_malformed_verdict_suffix(self):
        report = self.make_report()
        report["results"]["EV-49"]["verdict"] = "PASS(fake)"
        report["meta"]["behavioral_pass"] = 42
        report["meta"]["behavioral_non_pass"] = 7
        report["meta"]["threshold_margin"] = 18
        status, output = self.run_report(report)
        self.assertEqual(status, 1)
        self.assertIn("EV-49: invalid verdict 'PASS(fake)'", output)


if __name__ == "__main__":
    unittest.main()
