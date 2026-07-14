import json
import subprocess
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
        cls.commit = subprocess.check_output(
            run_evals.git_args("rev-parse", "v4-kernel"), text=True
        ).strip()
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

    def test_parser_uses_jsonl_lines(self):
        first = self.make_transcript(session_id="first")
        second = self.make_transcript(session_id="second")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "two.jsonl"
            path.write_bytes((json.dumps(first) + "\r\n" + json.dumps(second) + "\r\n").encode())
            records = run_evals.read_transcript(path)
        self.assertEqual([record["session_id"] for record in records], ["first", "second"])


if __name__ == "__main__":
    unittest.main()
