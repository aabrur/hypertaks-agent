"""Regenerate the four release figures from facts in this repository.

Rendering dependencies are pinned in scripts/requirements-figures.txt. The
bundled Roboto variable font and its SHA-256 remove host-font drift; its OFL
license is preserved under assets/fonts/.
"""

from __future__ import annotations

import contextlib
import hashlib
import io
import json
import re
from collections import Counter
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont
from run_evals import cmd_report, eval_static, load_cases


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "hypertaks"
FONT_PATH = ROOT / "assets" / "fonts" / "Roboto-Variable.ttf"
FONT_SHA256 = "d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134"
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
    if not FONT_PATH.is_file():
        raise FileNotFoundError(f"pinned figure font is missing: {FONT_PATH}")
    actual_hash = hashlib.sha256(FONT_PATH.read_bytes()).hexdigest()
    if actual_hash != FONT_SHA256:
        raise ValueError("pinned figure font SHA-256 mismatch")
    face = ImageFont.truetype(str(FONT_PATH), size)
    face.set_variation_by_name(b"Bold" if bold else b"Regular")
    return face


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
    marketplace_paths = [
        ROOT / ".claude-plugin" / "marketplace.json",
        ROOT / ".agents" / "plugins" / "marketplace.json",
    ]
    updater_tests = (ROOT / "scripts" / "test_update_hypertaks.py").read_text(
        encoding="utf-8")
    counts = [
        ("Behavioral eval cases", len(list((ROOT / "evals" / "cases").glob("EV-*.yaml")))),
        ("Saved transcripts", len(list((ROOT / "evals" / "transcripts").glob("EV-*.jsonl")))),
        ("Domain packs", len(list((SKILL / "references" / "domains").glob("D*.md")))),
        ("Defined specialist roles", len(re.findall(r"^\|\s*\d+\s*\|\s*\*\*", roles_text, re.MULTILINE))),
        ("Reference documents", len(list((SKILL / "references").rglob("*.md")))),
        ("Skill assets", len(list((SKILL / "assets").glob("*")))),
        ("Marketplace catalogs", sum(path.is_file() for path in marketplace_paths)),
        ("Updater test scenarios", len(re.findall(
            r"^\s+def test_", updater_tests, re.MULTILINE))),
    ]
    version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    bar_chart(
        "Figure_1.png",
        f"Hypertaks v{version} - repository inventory",
        "Counts are derived from the current repository tree.",
        counts,
        "Sources: evals, skills/hypertaks, .claude-plugin, .agents/plugins, scripts/test_update_hypertaks.py",
    )


def figure_2() -> None:
    results_path = ROOT / "evals" / "results.yaml"
    report_output = io.StringIO()
    with contextlib.redirect_stdout(report_output):
        report_status = cmd_report(results_path)
    if report_status != 0:
        raise ValueError(
            "cannot render certification figure from an invalid report:\n"
            + report_output.getvalue())
    data = yaml.safe_load(results_path.read_text(encoding="utf-8"))
    meta = data["meta"]
    results = data["results"]
    passed = sum(row["verdict"] == "PASS" for row in results.values())
    non_pass = len(results) - passed
    total = len(results)
    threshold = int(meta["release_threshold"])
    margin = passed - threshold
    confirmed = meta["confirmed_by_boss"] is True
    archive_rel = Path(meta["source_report_archive"])
    archive_path = (results_path.parent / archive_rel).resolve()
    archive_hash = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    if archive_hash != meta["source_report_archive_sha256"]:
        raise ValueError("source report archive hash does not match results.yaml")
    cases, case_problems = load_cases()
    if case_problems:
        raise ValueError("invalid eval inventory: " + "; ".join(case_problems))
    case_by_id = {case["id"]: case for case in cases}
    missing_case_ids = sorted(set(results) - set(case_by_id))
    if missing_case_ids:
        raise ValueError("certification results reference missing cases: " + ", ".join(missing_case_ids))
    static_green = sum(eval_static(case_by_id[case_id])[0] for case_id in results)
    non_pass_rows = [row for row in results.values() if row["verdict"] != "PASS"]
    evidence_missing = any(
        row["verdict"] == "EVIDENCE_MISSING" for row in results.values())
    documented = all(
        isinstance(row.get("evidence_quotes"), list)
        and any(str(quote).strip() for quote in row["evidence_quotes"])
        for row in non_pass_rows
    )
    gate_passed = (
        confirmed and passed >= threshold and documented
        and not evidence_missing and static_green == total
    )
    expected = {
        "total_ev": total,
        "behavioral_pass": passed,
        "behavioral_non_pass": non_pass,
        "static_green": static_green,
        "threshold_margin": margin,
    }
    for key, value in expected.items():
        if int(meta[key]) != value:
            raise ValueError(f"results.yaml meta.{key}={meta[key]!r}, derived value is {value}")

    image, draw = canvas()
    banner_color = "#e9f8f1" if gate_passed else "#fff5dd"
    status_color = GREEN if gate_passed else AMBER
    status_text = "Release Gate Passed" if gate_passed else "Release Gate Not Passed"
    draw.rounded_rectangle((70, 45, 1530, 180), radius=24, fill=banner_color)
    text(draw, (105, 68), status_text, fill=status_color, fnt=F_TITLE)
    text(
        draw,
        (105, 125),
        f"Hypertaks behavioral certification | Version {meta['version']}",
        fill=INK,
        fnt=F_SUB,
    )

    cards = [
        ("Behavioral PASS", f"{passed}/{total}", GREEN),
        ("Documented non-PASS", str(non_pass), AMBER),
        ("Static GREEN", f"{static_green}/{total}", BLUE),
        ("Release threshold", str(threshold), INK),
        ("Threshold margin", f"{margin:+d}", GREEN),
        ("Boss Confirmed", "true" if confirmed else "false", "#6956b8"),
    ]
    card_w, card_h = 430, 230
    x_positions = [90, 585, 1080]
    y_positions = [245, 530]
    for index, (label, value, color) in enumerate(cards):
        x = x_positions[index % 3]
        y = y_positions[index // 3]
        draw.rounded_rectangle(
            (x, y, x + card_w, y + card_h),
            radius=22,
            fill="white",
            outline=GRID,
            width=3,
        )
        draw.rounded_rectangle((x, y, x + 12, y + card_h), radius=6, fill=color)
        text(draw, (x + 38, y + 42), label, fill=MUTED, fnt=F_LABEL_BOLD)
        text(draw, (x + 38, y + 105), value, fill=color, fnt=font(58, True))

    text(
        draw,
        (90, 830),
        f"confirmed_by_boss: {str(confirmed).lower()} | "
        f"{meta['certification_status'].title()} under the repository release gate",
        fill=INK,
        fnt=F_LABEL_BOLD,
    )
    text(
        draw,
        (90, 885),
        f"{non_pass} non-PASS cases remain documented. Static GREEN is not behavioral PASS.",
        fill=MUTED,
        fnt=F_SUB,
    )
    text(
        draw,
        (90, 930),
        f"Source: evals/results.yaml | report archive SHA-256 {archive_hash[:12]}",
        fill=MUTED,
        fnt=F_SMALL,
    )
    save(image, "Figure_2.png")


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
