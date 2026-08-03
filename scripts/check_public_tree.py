#!/usr/bin/env python3
"""Fail if the repo root or eval hosts layout is unsafe for a public push."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN_ROOT_NAMES = {
    "Figure_1.png",
    "Figure_2.png",
    "Figure_3.png",
    "Figure_4.png",
    "Figure_CAC_LTV.png",
    "cac_ltv_trends.csv",
    "cleaned_data.csv",
    "data.csv",
    "revenue_2024.png",
    "generate_chart.py",
    "transform_data.py",
    "summary_report.json",
}

FORBIDDEN_ANYWHERE = {
    "generate_eval_reports.py",
}

REQUIRED_HOST_RUNS = [
    "evals/hosts/hermes/runs/EV-50-62/reports/Hermes-EV-50.md",
    "evals/hosts/cline/runs/EV-63-75/reports/Cline-EV-63.md",
    "evals/hosts/command-code/runs/EV-76-88/reports/Command-Code-EV-76.md",
    "evals/hosts/kilo-cli/runs/EV-50-88-validation/VALIDATION.md",
    "evals/hosts/README.md",
    "evals/archive/ev-01-88-source-reports-2026-08-04.zip",
    "evals/results.yaml",
]

SECRET_MARKERS = (
    "Pr0dDb#S3cr3t!2026",
    "password=Pr0dDb",
)


def main() -> int:
    problems: list[str] = []

    for name in FORBIDDEN_ROOT_NAMES:
        if (ROOT / name).exists():
            problems.append(f"forbidden root debris present: {name}")

    plot = ROOT / "scripts" / "plot_cac_ltv.py"
    if plot.exists():
        problems.append("forbidden scratch script present: scripts/plot_cac_ltv.py")

    for path in ROOT.rglob("*"):
        if path.name in FORBIDDEN_ANYWHERE and path.is_file():
            # allow under .git only
            if ".git" in path.parts:
                continue
            problems.append(f"forbidden generator present: {path.relative_to(ROOT).as_posix()}")

    for rel in REQUIRED_HOST_RUNS:
        if not (ROOT / rel).is_file():
            problems.append(f"missing required public path: {rel}")

    # secret markers in public host runs
    hosts = ROOT / "evals" / "hosts"
    if hosts.is_dir():
        for path in hosts.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".md", ".txt", ".json", ".csv", ".env", ".py", ".yaml", ".yml"}:
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            for marker in SECRET_MARKERS:
                if marker in text:
                    problems.append(
                        f"secret-like marker in {path.relative_to(ROOT).as_posix()}: {marker}"
                    )

    antigravity_runs = ROOT / "evals/hosts/antigravity/runs"
    if antigravity_runs.exists():
        problems.append("stale antigravity/runs should not remain; use host-named runs")

    if problems:
        print("PUBLIC TREE CHECK FAILED:")
        for p in problems:
            print(" -", p)
        return 1

    print("Public tree check OK")
    print(" - no root scratch debris")
    print(" - host-named EV-50..88 runs present")
    print(" - certification archive present")
    print(" - no known secret markers under evals/hosts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
