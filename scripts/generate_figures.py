"""Regenerate the four release figures from facts in this repository.

The script intentionally uses Pillow, which is available in the repo's current
Python environment, instead of requiring matplotlib.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "hypertaks"
W, H = 1600, 1000
INK = "#172033"
BLUE = "#2f6fed"
GREEN = "#19a974"
AMBER = "#f3a712"
RED = "#d95d5d"
MUTED = "#6b7280"
GRID = "#d9dee8"
BG = "white"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


F_TITLE = font(42, True)
F_SUB = font(24)
F_LABEL = font(25)
F_LABEL_BOLD = font(25, True)
F_SMALL = font(19)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (W, H), BG)
    return image, ImageDraw.Draw(image)


def save(image: Image.Image, filename: str) -> None:
    image.save(ROOT / filename)


def text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str,
         fill: str = INK, fnt: ImageFont.ImageFont = F_LABEL) -> None:
    draw.text(xy, value, fill=fill, font=fnt)


def bar_chart(filename: str, title: str, subtitle: str, items: list[tuple[str, int]],
              footer: str, threshold: int | None = None) -> None:
    image, draw = canvas()
    text(draw, (90, 55), title, fnt=F_TITLE)
    text(draw, (90, 112), subtitle, fill=MUTED, fnt=F_SUB)

    left, top, right, bottom = 470, 195, 1450, 850
    max_value = max([value for _, value in items] + ([threshold] if threshold else [0]) + [1])
    step = max(1, round(max_value / 6))
    for tick in range(0, max_value + step, step):
        x = left + int((right - left) * tick / max_value)
        draw.line((x, top, x, bottom), fill=GRID, width=1)
        text(draw, (x - 10, bottom + 18), str(tick), fill=MUTED, fnt=F_SMALL)
    if threshold is not None:
        x = left + int((right - left) * threshold / max_value)
        draw.line((x, top, x, bottom), fill=RED, width=4)
        text(draw, (x - 90, top - 36), f"threshold {threshold}", fill=RED, fnt=F_SMALL)

    row_h = max(48, int((bottom - top) / max(len(items), 1)))
    colors = [BLUE, GREEN, AMBER, RED, "#6956b8", MUTED, "#3aa99e", "#9b5de5"]
    for idx, (label, value) in enumerate(items):
        y = top + idx * row_h + 6
        text(draw, (90, y + 8), label, fnt=F_LABEL)
        bar_w = int((right - left) * value / max_value)
        draw.rounded_rectangle((left, y, left + bar_w, y + 36), radius=8,
                               fill=colors[idx % len(colors)])
        text(draw, (left + bar_w + 14, y + 4), str(value), fnt=F_LABEL_BOLD)

    text(draw, (90, 920), footer, fill=MUTED, fnt=F_SMALL)
    save(image, filename)


def figure_1() -> None:
    roles_text = (SKILL / "references" / "agent-roles.md").read_text(encoding="utf-8")
    counts = [
        ("Behavioral eval cases", len(list((ROOT / "evals" / "cases").glob("EV-*.yaml")))),
        ("Saved transcripts", len(list((ROOT / "evals" / "transcripts").glob("EV-*.jsonl")))),
        ("Domain packs", len(list((SKILL / "references" / "domains").glob("D*.md")))),
        ("Defined specialist roles", len(re.findall(r"^\|\s*\d+\s*\|\s*\*\*", roles_text, re.MULTILINE))),
        ("Reference documents", len(list((SKILL / "references").rglob("*.md")))),
        ("Skill assets", len(list((SKILL / "assets").glob("*")))),
    ]
    bar_chart(
        "Figure_1.png",
        "Hypertaks v4.2.0 - repository inventory",
        "Counts are derived from the current repository tree.",
        counts,
        "Sources: evals/cases, evals/transcripts, skills/hypertaks/references, assets, agent-roles.md",
    )


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
    bar_chart(
        "Figure_2.png",
        "Behavioral evidence recorded in evals/results.yaml",
        "This figure reads saved evidence; it does not rerun the behavioral suite.",
        [
            ("PASS + complete independent record", complete),
            ("Other recorded PASS", legacy_pass),
            ("SKIPPED (not a PASS)", skipped),
        ],
        "Complete record = cold-session, tool, hash, raw prompt/response, and independent-grader fields.",
        threshold=24,
    )


def figure_3() -> None:
    skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
    phases = re.findall(r"^### Phase (\d) - ([^\r\n]+)", skill_text, re.MULTILINE)
    if len(phases) != 6:
        raise ValueError(f"Expected six Phase 0-5 headings, found {len(phases)}")

    image, draw = canvas()
    text(draw, (90, 55), "Hypertaks mandatory loop - six phases (Phase 0-5)", fnt=F_TITLE)
    text(draw, (90, 112), "Phase headings are read directly from skills/hypertaks/SKILL.md.", fill=MUTED, fnt=F_SUB)

    positions = [(115, 245), (610, 245), (1105, 245), (1105, 590), (610, 590), (115, 590)]
    colors = [INK, "#6956b8", BLUE, GREEN, AMBER, RED]
    box_w, box_h = 370, 145
    centers = []
    for (number, title), (x, y), color in zip(phases, positions, colors):
        title = title.split(" (", 1)[0]
        draw.rounded_rectangle((x, y, x + box_w, y + box_h), radius=20, fill=color)
        text(draw, (x + 126, y + 32), f"PHASE {number}", fill="white", fnt=F_LABEL_BOLD)
        text(draw, (x + 42, y + 82), title[:28], fill="white", fnt=F_LABEL_BOLD)
        centers.append((x + box_w // 2, y + box_h // 2))

    for idx, (x1, y1) in enumerate(centers):
        x2, y2 = centers[(idx + 1) % len(centers)]
        draw.line((x1, y1, x2, y2), fill=INK, width=4)
        draw.ellipse((x2 - 7, y2 - 7, x2 + 7, y2 + 7), fill=INK)

    text(draw, (245, 890), "The loop scales by tier; Phase 0 gates the work and Phase 5 integrates the result.",
         fill=MUTED, fnt=F_SUB)
    save(image, "Figure_3.png")


def figure_4() -> None:
    groups = Counter()
    for path in (ROOT / "evals" / "cases").glob("EV-*.yaml"):
        match = re.search(r"^group:\s*([^\s#]+)", path.read_text(encoding="utf-8"), re.MULTILINE)
        if not match:
            raise ValueError(f"Missing group field in {path}")
        groups[match.group(1)] += 1
    items = sorted(groups.items(), key=lambda item: (-item[1], item[0]))
    bar_chart(
        "Figure_4.png",
        "Behavioral eval case distribution",
        f"{sum(value for _, value in items)} case definitions grouped by declared YAML metadata.",
        items,
        "Source: group field in evals/cases/EV-*.yaml",
    )


def main() -> None:
    figure_1()
    figure_2()
    figure_3()
    figure_4()
    print("Generated Figure_1.png through Figure_4.png")


if __name__ == "__main__":
    main()
