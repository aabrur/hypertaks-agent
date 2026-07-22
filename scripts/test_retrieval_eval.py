import json
import tempfile
import unittest
from pathlib import Path

from scripts.retrieval_eval import (
    QueryResult,
    evaluate,
    exact_match_at_k,
    load_jsonl,
    ndcg_at_k,
    reciprocal_rank,
    recall_at_k,
)


class RetrievalEvalTests(unittest.TestCase):
    def setUp(self):
        self.record = QueryResult(
            query_id="q1",
            relevant={"a": 3.0, "b": 1.0},
            ranked=["x", "a", "b"],
            exact_id="a",
            latency_ms=10.0,
            cost=0.2,
        )

    def test_recall_and_mrr(self):
        self.assertEqual(recall_at_k(self.record, 1), 0.0)
        self.assertEqual(recall_at_k(self.record, 2), 0.5)
        self.assertEqual(reciprocal_rank(self.record), 0.5)

    def test_ndcg_is_bounded(self):
        value = ndcg_at_k(self.record, 3)
        self.assertGreater(value, 0.0)
        self.assertLessEqual(value, 1.0)

    def test_exact_match(self):
        self.assertEqual(exact_match_at_k(self.record, 1), 0.0)
        self.assertEqual(exact_match_at_k(self.record, 2), 1.0)

    def test_aggregate(self):
        report = evaluate([self.record], [1, 3])
        self.assertEqual(report["aggregate"]["query_count"], 1)
        self.assertEqual(report["aggregate"]["by_k"]["3"]["recall"], 1.0)
        self.assertEqual(report["aggregate"]["latency_ms_mean"], 10.0)

    def test_jsonl_validation_rejects_duplicate_ranked_ids(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "input.jsonl"
            path.write_text(
                json.dumps(
                    {
                        "query_id": "q1",
                        "relevant": ["a"],
                        "ranked": ["a", "a"],
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "duplicate"):
                load_jsonl(path)


if __name__ == "__main__":
    unittest.main()
