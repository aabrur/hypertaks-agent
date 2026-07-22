#!/usr/bin/env python3
"""Evaluate ranked retrieval results without third-party dependencies.

Input JSONL, one query per line:
{
  "query_id": "q-1",
  "relevant": {"doc-a": 3, "doc-b": 1},
  "ranked": ["doc-c", "doc-a", "doc-b"],
  "exact_id": "doc-a",
  "latency_ms": 12.5,
  "cost": 0.001
}

Relevance values may be booleans, binary integers, or graded non-negative
numbers. Values greater than zero count as relevant for recall, hit rate, and
MRR. nDCG uses the supplied grades.
"""
from __future__ import annotations

import argparse
import json
import math
import statistics
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


@dataclass(frozen=True)
class QueryResult:
    query_id: str
    relevant: Mapping[str, float]
    ranked: Sequence[str]
    exact_id: str | None = None
    latency_ms: float | None = None
    cost: float | None = None


def _as_non_negative_number(value: Any, *, field: str) -> float:
    if isinstance(value, bool):
        return float(value)
    if not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise ValueError(f"{field} must be a finite number")
    number = float(value)
    if number < 0:
        raise ValueError(f"{field} must be non-negative")
    return number


def parse_record(raw: Mapping[str, Any], line_number: int) -> QueryResult:
    query_id = raw.get("query_id")
    if not isinstance(query_id, str) or not query_id.strip():
        raise ValueError(f"line {line_number}: query_id must be a non-empty string")

    relevant_raw = raw.get("relevant")
    if isinstance(relevant_raw, list):
        relevant = {str(item): 1.0 for item in relevant_raw}
    elif isinstance(relevant_raw, Mapping):
        relevant = {
            str(key): _as_non_negative_number(
                value, field=f"line {line_number}: relevant[{key!r}]"
            )
            for key, value in relevant_raw.items()
        }
    else:
        raise ValueError(
            f"line {line_number}: relevant must be a list or object of grades"
        )
    if not any(grade > 0 for grade in relevant.values()):
        raise ValueError(f"line {line_number}: relevant contains no positive item")

    ranked_raw = raw.get("ranked")
    if not isinstance(ranked_raw, list) or not ranked_raw:
        raise ValueError(f"line {line_number}: ranked must be a non-empty list")
    ranked = [str(item) for item in ranked_raw]
    if len(set(ranked)) != len(ranked):
        raise ValueError(f"line {line_number}: ranked contains duplicate document IDs")

    exact_id_raw = raw.get("exact_id")
    exact_id = None if exact_id_raw is None else str(exact_id_raw)
    latency_raw = raw.get("latency_ms")
    cost_raw = raw.get("cost")
    latency = (
        None
        if latency_raw is None
        else _as_non_negative_number(latency_raw, field=f"line {line_number}: latency_ms")
    )
    cost = (
        None
        if cost_raw is None
        else _as_non_negative_number(cost_raw, field=f"line {line_number}: cost")
    )

    return QueryResult(
        query_id=query_id,
        relevant=relevant,
        ranked=ranked,
        exact_id=exact_id,
        latency_ms=latency,
        cost=cost,
    )


def load_jsonl(path: Path) -> list[QueryResult]:
    records: list[QueryResult] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            raw = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"line {line_number}: invalid JSON: {exc}") from exc
        if not isinstance(raw, Mapping):
            raise ValueError(f"line {line_number}: record must be a JSON object")
        records.append(parse_record(raw, line_number))
    if not records:
        raise ValueError("input contains no query records")
    query_ids = [record.query_id for record in records]
    if len(set(query_ids)) != len(query_ids):
        raise ValueError("query_id values must be unique")
    return records


def recall_at_k(record: QueryResult, k: int) -> float:
    relevant_ids = {doc_id for doc_id, grade in record.relevant.items() if grade > 0}
    found = relevant_ids.intersection(record.ranked[:k])
    return len(found) / len(relevant_ids)


def hit_rate_at_k(record: QueryResult, k: int) -> float:
    return float(recall_at_k(record, k) > 0)


def reciprocal_rank(record: QueryResult) -> float:
    relevant_ids = {doc_id for doc_id, grade in record.relevant.items() if grade > 0}
    for rank, doc_id in enumerate(record.ranked, 1):
        if doc_id in relevant_ids:
            return 1.0 / rank
    return 0.0


def _dcg(grades: Iterable[float]) -> float:
    return sum((2.0**grade - 1.0) / math.log2(rank + 1) for rank, grade in enumerate(grades, 1))


def ndcg_at_k(record: QueryResult, k: int) -> float:
    observed = [record.relevant.get(doc_id, 0.0) for doc_id in record.ranked[:k]]
    ideal = sorted(record.relevant.values(), reverse=True)[:k]
    ideal_dcg = _dcg(ideal)
    if ideal_dcg == 0:
        return 0.0
    return _dcg(observed) / ideal_dcg


def exact_match_at_k(record: QueryResult, k: int) -> float | None:
    if record.exact_id is None:
        return None
    return float(record.exact_id in record.ranked[:k])


def _mean(values: Sequence[float]) -> float:
    return statistics.fmean(values) if values else 0.0


def evaluate(records: Sequence[QueryResult], ks: Sequence[int]) -> dict[str, Any]:
    if not records:
        raise ValueError("records must not be empty")
    normalized_ks = sorted(set(ks))
    if not normalized_ks or normalized_ks[0] <= 0:
        raise ValueError("ks must contain positive integers")

    per_query: list[dict[str, Any]] = []
    for record in records:
        query_metrics: dict[str, Any] = {
            "query_id": record.query_id,
            "mrr": reciprocal_rank(record),
            "by_k": {},
        }
        for k in normalized_ks:
            query_metrics["by_k"][str(k)] = {
                "recall": recall_at_k(record, k),
                "hit_rate": hit_rate_at_k(record, k),
                "ndcg": ndcg_at_k(record, k),
                "exact_match": exact_match_at_k(record, k),
            }
        if record.latency_ms is not None:
            query_metrics["latency_ms"] = record.latency_ms
        if record.cost is not None:
            query_metrics["cost"] = record.cost
        per_query.append(query_metrics)

    aggregate_by_k: dict[str, Any] = {}
    for k in normalized_ks:
        key = str(k)
        exact_values = [
            row["by_k"][key]["exact_match"]
            for row in per_query
            if row["by_k"][key]["exact_match"] is not None
        ]
        aggregate_by_k[key] = {
            "recall": _mean([row["by_k"][key]["recall"] for row in per_query]),
            "hit_rate": _mean([row["by_k"][key]["hit_rate"] for row in per_query]),
            "ndcg": _mean([row["by_k"][key]["ndcg"] for row in per_query]),
            "exact_match": _mean(exact_values) if exact_values else None,
        }

    latencies = [record.latency_ms for record in records if record.latency_ms is not None]
    costs = [record.cost for record in records if record.cost is not None]
    aggregate: dict[str, Any] = {
        "query_count": len(records),
        "mrr": _mean([row["mrr"] for row in per_query]),
        "by_k": aggregate_by_k,
        "latency_ms_mean": _mean(latencies) if latencies else None,
        "cost_mean": _mean(costs) if costs else None,
    }

    return {
        "schema_version": 1,
        "aggregate": aggregate,
        "queries": per_query,
    }


def parse_ks(value: str) -> list[int]:
    try:
        ks = [int(item.strip()) for item in value.split(",") if item.strip()]
    except ValueError as exc:
        raise argparse.ArgumentTypeError("k values must be comma-separated integers") from exc
    if not ks or any(k <= 0 for k in ks):
        raise argparse.ArgumentTypeError("k values must be positive integers")
    return ks


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="JSONL retrieval results")
    parser.add_argument("--k", dest="ks", type=parse_ks, default=[1, 3, 5, 10])
    parser.add_argument("--output", type=Path, help="write JSON report to this path")
    args = parser.parse_args(argv)

    try:
        report = evaluate(load_jsonl(args.input), args.ks)
    except (OSError, ValueError) as exc:
        print(f"retrieval evaluation failed: {exc}", file=sys.stderr)
        return 2

    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
