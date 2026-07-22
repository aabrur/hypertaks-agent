#!/usr/bin/env python3
"""Render a reproducible retrieval-quality chart from retrieval_eval.py JSON."""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence


def load_report(path: Path) -> Mapping[str, Any]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError("report must be a JSON object")
    aggregate = raw.get("aggregate")
    if not isinstance(aggregate, Mapping):
        raise ValueError("report.aggregate must be an object")
    by_k = aggregate.get("by_k")
    if not isinstance(by_k, Mapping) or not by_k:
        raise ValueError("report.aggregate.by_k must be a non-empty object")
    return raw


def render(report: Mapping[str, Any], output_base: Path, title: str) -> list[Path]:
    try:
        import matplotlib.pyplot as plt
    except ImportError as exc:
        raise RuntimeError("matplotlib is required to render the report") from exc

    by_k = report["aggregate"]["by_k"]
    ks = sorted(int(key) for key in by_k)
    metric_names = ("recall", "hit_rate", "ndcg", "exact_match")
    series: dict[str, list[float]] = {name: [] for name in metric_names}
    active: list[str] = []

    for name in metric_names:
        values = [by_k[str(k)].get(name) for k in ks]
        if all(value is None for value in values):
            continue
        numeric_values: list[float] = []
        for value in values:
            if not isinstance(value, (int, float)) or not math.isfinite(float(value)):
                raise ValueError(f"metric {name} contains a non-finite value")
            numeric_values.append(float(value))
        series[name] = numeric_values
        active.append(name)

    if not active:
        raise ValueError("report contains no plottable metrics")

    output_base.parent.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots(figsize=(9, 5.5), constrained_layout=True)
    labels = {
        "recall": "Recall",
        "hit_rate": "Hit rate",
        "ndcg": "nDCG",
        "exact_match": "Exact match",
    }
    for name in active:
        ax.plot(ks, series[name], marker="o", label=labels[name])
    ax.set_title(title)
    ax.set_xlabel("Cutoff k")
    ax.set_ylabel("Metric value")
    ax.set_ylim(0, 1.02)
    ax.set_xticks(ks)
    ax.grid(True, axis="y", alpha=0.3)
    ax.legend()

    outputs = [output_base.with_suffix(".png"), output_base.with_suffix(".svg")]
    fig.savefig(outputs[0], dpi=180)
    fig.savefig(outputs[1])
    plt.close(fig)
    for path in outputs:
        if not path.is_file() or path.stat().st_size == 0:
            raise RuntimeError(f"rendered artifact is missing or empty: {path}")
    return outputs


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("output_base", type=Path)
    parser.add_argument("--title", default="Retrieval quality by cutoff")
    args = parser.parse_args(argv)
    try:
        outputs = render(load_report(args.report), args.output_base, args.title)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"plot generation failed: {exc}", file=sys.stderr)
        return 2
    print("\n".join(str(path) for path in outputs))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
