import json
import sys
import tempfile
import unittest
from pathlib import Path

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


class TestEvalInventory(unittest.TestCase):
    def test_v430_capability_cases_are_contiguous_and_grouped(self):
        cases, errors = run_evals.load_cases()
        self.assertEqual(errors, [])
        capability_cases = [case for case in cases if case["group"] == "capability"]
        self.assertEqual(
            [case["id"] for case in capability_cases],
            ["EV-45", "EV-46", "EV-47", "EV-48", "EV-49"],
        )

    def test_suite_contains_49_case_definitions(self):
        cases, errors = run_evals.load_cases()
        self.assertEqual(errors, [])
        self.assertEqual(len(cases), 49)


if __name__ == "__main__":
    unittest.main()
