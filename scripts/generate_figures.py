"""Regenerate the four release figures from facts in this repository."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "hypertaks"
INK = "#172033"
BLUE = "#2f6fed"
GREEN = "#19a974"
AMBER = "#f3a712"
RED = "#d95d5d"
MUTED = "#6b7280"
GRID = "#d9dee8"


def setup() -> None:
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "axes.titleweight": "bold",
        "axes.titlesize": 17,
        "axes.labelcolor": INK,
        "axes.edgecolor": GRID,
        "text.color": INK,
        "xtick.color": MUTED,
        "ytick.color": INK,
    })


def finish(fig: plt.Figure, filename: str) -> None:
    fig.savefig(ROOT / filename, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def figure_1() -> None:
    roles_text = (SKILL / "references" / "agent-roles.md").read_text(encoding="utf-8")
    counts = {
        "Behavioral eval cases": len(list((ROOT / "evals" / "cases").glob("EV-*.yaml"))),
        "Saved transcripts": len(list((ROOT / "evals" / "transcripts").glob("EV-*.jsonl"))),
        "Domain packs": len(list((SKILL / "references" / "domains").glob("D*.md"))),
        "Defined specialist roles": len(re.findall(r"^\|\s*\d+\s*\|\s*\*\*", roles_text, re.MULTILINE)),
        "Reference documents": len(list((SKILL / "references").rglob("*.md"))),
        "Skill assets": len(list((SKILL / "assets").glob("*"))),
    }
    labels = list(counts)
    values = list(counts.values())
    fig, ax = plt.subplots(figsize=(12, 7.5))
    bars = ax.barh(labels[::-1], values[::-1], color=[BLUE, GREEN, AMBER, BLUE, GREEN, AMBER][::-1])
    ax.set_title("Hypertaks v4.2.0 — repository inventory", loc="left", pad=20)
    ax.text(0, 1.01, "Counts are derived from the current repository tree.", transform=ax.transAxes, color=MUTED)
    ax.set_xlabel("Files or defined entries")
    ax.grid(axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines[["top", "right", "left"]].set_visible(False)
    for bar, value in zip(bars, values[::-1]):
        ax.text(value + 0.6, bar.get_y() + bar.get_height() / 2, str(value), va="center", fontweight="bold")
    ax.text(0, -0.12, "Sources: evals/cases, evals/transcripts, skills/hypertaks/references, assets, agent-roles.md",
            transform=ax.transAxes, color=MUTED, fontsize=9)
    finish(fig, "Figure_1.png")


def transcript_has_complete_independent_record(path: Path) -> bool:
    try:
        records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    except (OSError, json.JSONDecodeError):
        return False
    if len(records) != 1:
        return False
    row = records[0]
    grader = re.sub(r"\s*\([^)]*\)", "", str(row.get("grader", ""))).strip()
    return all([
        row.get("verdict") == "PASS",
        row.get("cold_session") is True,
        isinstance(row.get("tool_calls"), list) and bool(row["tool_calls"]),
        isinstance(row.get("tool_results"), list) and bool(row["tool_results"]),
        bool(str(row.get("raw_prompt", "")).strip()),
        bool(str(row.get("raw_response", "")).strip()),
        bool(re.fullmatch(r"[0-9a-f]{40}", str(row.get("tested_commit", "")))),
        bool(re.fullmatch(r"[0-9a-f]{40}", str(row.get("tested_tree", "")))),
        bool(re.fullmatch(r"[0-9a-f]{64}", str(row.get("skill_root_hash", "")))),
        bool(str(row.get("executor", "")).strip()),
        bool(grader),
        str(row.get("executor", "")).strip() != grader,
        "self-graded" not in str(row.get("grader", "")).lower(),
    ])


def figure_2() -> None:
    results_text = (ROOT / "evals" / "results.yaml").read_text(encoding="utf-8")
    transcripts = (ROOT / "evals" / "transcripts").glob("EV-*.jsonl")
    complete = sum(transcript_has_complete_independent_record(path) for path in transcripts)
    recorded_pass = len(re.findall(r"^    verdict: PASS\s*$", results_text, re.MULTILINE))
    skipped = len(re.findall(r"^    verdict: SKIPPED", results_text, re.MULTILINE))
    legacy_pass = recorded_pass - complete
    threshold = 24

    fig, (ax, note) = plt.subplots(1, 2, figsize=(12, 7.5), gridspec_kw={"width_ratios": [1.45, 1]})
    labels = ["PASS + complete independent record", "Other recorded PASS", "SKIPPED (not a PASS)"]
    values = [complete, legacy_pass, skipped]
    colors = [GREEN, AMBER, MUTED]
    bars = ax.barh(labels[::-1], values[::-1], color=colors[::-1])
    ax.axvline(threshold, color=RED, linestyle="--", linewidth=2, label=f"Release threshold: {threshold} EV")
    ax.set_xlim(0, max(38, threshold + 3))
    ax.set_xlabel("Eval cases")
    ax.grid(axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.legend(frameon=False, loc="lower right")
    for bar, value in zip(bars, values[::-1]):
        ax.text(value + 0.5, bar.get_y() + bar.get_height() / 2, str(value), va="center", fontweight="bold")

    note.axis("off")
    note.add_patch(FancyBboxPatch((0.06, 0.30), 0.88, 0.48, boxstyle="round,pad=0.04",
                                  facecolor="#f6f8fc", edgecolor=GRID, transform=note.transAxes))
    note.text(0.13, 0.69, "Evidence boundary", transform=note.transAxes, fontsize=15, fontweight="bold")
    note.text(0.13, 0.58, f"{complete} cases meet the displayed\nrecord-completeness criteria.",
              transform=note.transAxes, fontsize=14, color=GREEN, fontweight="bold")
    note.text(0.13, 0.44, f"{threshold - complete} more are needed to reach\nthe 24-EV release threshold.",
              transform=note.transAxes, fontsize=12)
    note.text(0.13, 0.34, "confirmed_by_boss: false\nfor all 38 result rows", transform=note.transAxes, color=MUTED)
    fig.suptitle("Behavioral evidence recorded in evals/results.yaml", x=0.06, ha="left", fontsize=18, fontweight="bold")
    fig.text(0.06, 0.91, "This figure reads saved evidence; it does not rerun the behavioral suite.", color=MUTED)
    fig.text(0.06, 0.03, "Complete record = one valid JSONL object with cold-session, tool, hash, raw prompt/response, and independent-grader fields.",
             color=MUTED, fontsize=9)
    finish(fig, "Figure_2.png")


def figure_3() -> None:
    text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
    phases = re.findall(r"^### Phase (\d) - ([^\r\n]+)", text, re.MULTILINE)
    if len(phases) != 6:
        raise ValueError(f"Expected six Phase 0-5 headings, found {len(phases)}")
    fig, ax = plt.subplots(figsize=(12, 7.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")
    positions = [(0.8, 5.4), (4.4, 5.4), (8.0, 5.4), (8.0, 2.2), (4.4, 2.2), (0.8, 2.2)]
    colors = [INK, "#6956b8", BLUE, GREEN, AMBER, RED]
    boxes = []
    for (number, title), (x, y), color in zip(phases, positions, colors):
        display_title = title.split(" (", 1)[0]
        box = FancyBboxPatch((x, y), 3.0, 1.35, boxstyle="round,pad=0.12",
                             facecolor=color, edgecolor=color, transform=ax.transData)
        ax.add_patch(box)
        boxes.append((x, y))
        ax.text(x + 1.5, y + 0.82, f"PHASE {number}", ha="center", color="white", fontsize=11, fontweight="bold")
        ax.text(x + 1.5, y + 0.44, display_title, ha="center", color="white", fontsize=11.5, fontweight="bold")
    for index in range(len(boxes)):
        x1, y1 = boxes[index]
        x2, y2 = boxes[(index + 1) % len(boxes)]
        if index in (0, 1):
            start, end = (x1 + 3.05, y1 + 0.68), (x2 - 0.05, y2 + 0.68)
        elif index == 2:
            start, end = (x1 + 1.5, y1 - 0.05), (x2 + 1.5, y2 + 1.4)
        elif index in (3, 4):
            start, end = (x1 - 0.05, y1 + 0.68), (x2 + 3.05, y2 + 0.68)
        else:
            start, end = (x1 + 1.5, y1 + 1.4), (x2 + 1.5, y2 - 0.05)
        ax.annotate("", xy=end, xytext=start, arrowprops={"arrowstyle": "->", "color": INK, "lw": 2})
    ax.text(0.8, 7.35, "Hypertaks mandatory loop — six phases (Phase 0–5)", fontsize=19, fontweight="bold")
    ax.text(0.8, 7.02, "Phase headings are read directly from skills/hypertaks/SKILL.md.", color=MUTED)
    ax.text(6, 0.75, "The loop scales by tier; Phase 0 is the intake gate and Phase 5 integrates the result.",
            ha="center", color=MUTED)
    finish(fig, "Figure_3.png")


def figure_4() -> None:
    groups = Counter()
    for path in (ROOT / "evals" / "cases").glob("EV-*.yaml"):
        match = re.search(r"^group:\s*([^\s#]+)", path.read_text(encoding="utf-8"), re.MULTILINE)
        if not match:
            raise ValueError(f"Missing group field in {path}")
        groups[match.group(1)] += 1
    ordered = sorted(groups.items(), key=lambda item: (item[1], item[0]))
    labels = [name for name, _ in ordered]
    values = [count for _, count in ordered]
    fig, ax = plt.subplots(figsize=(12, 7.5))
    bars = ax.barh(labels, values, color=[BLUE if value < 10 else GREEN for value in values])
    ax.set_title("Behavioral eval case distribution", loc="left", pad=20)
    ax.text(0, 1.01, f"{sum(values)} case definitions grouped by their declared YAML metadata.",
            transform=ax.transAxes, color=MUTED)
    ax.set_xlabel("Cases")
    ax.grid(axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines[["top", "right", "left"]].set_visible(False)
    for bar, value in zip(bars, values):
        ax.text(value + 0.25, bar.get_y() + bar.get_height() / 2, str(value), va="center", fontweight="bold")
    ax.text(0, -0.12, "Source: group field in evals/cases/EV-01.yaml through EV-38.yaml",
            transform=ax.transAxes, color=MUTED, fontsize=9)
    finish(fig, "Figure_4.png")


def main() -> None:
    setup()
    figure_1()
    figure_2()
    figure_3()
    figure_4()
    print("Generated Figure_1.png through Figure_4.png")


if __name__ == "__main__":
    main()
