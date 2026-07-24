#!/usr/bin/env python3
"""Validate the exact public Hypertaks skill surface."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
EXPECTED = {
    "hypertaks",
    "hypertaks-verify",
    "hypertaks-brain",
    "hypertaks-graph",
    "hypertaks-continuity",
}


def read_name(skill_file: Path) -> str | None:
    text = skill_file.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None
    name_match = re.search(r"^name:\s*([a-z0-9-]+)\s*$", match.group(1), re.MULTILINE)
    return name_match.group(1) if name_match else None


def main() -> int:
    found: dict[str, Path] = {}
    errors: list[str] = []
    for skill_file in sorted(SKILLS.glob("*/SKILL.md")):
        name = read_name(skill_file)
        if name is None:
            errors.append(f"Invalid frontmatter: {skill_file.relative_to(ROOT)}")
            continue
        if name.startswith("hypertaks"):
            if name in found:
                errors.append(f"Duplicate public skill name: {name}")
            found[name] = skill_file

    actual = set(found)
    missing = sorted(EXPECTED - actual)
    extra = sorted(actual - EXPECTED)
    if missing:
        errors.append(f"Missing public Hypertaks skills: {', '.join(missing)}")
    if extra:
        errors.append(f"Unexpected public Hypertaks skills: {', '.join(extra)}")

    for name, skill_file in found.items():
        expected_dir = SKILLS / name / "SKILL.md"
        if skill_file != expected_dir:
            errors.append(
                f"Public skill {name} must live at {expected_dir.relative_to(ROOT)}, "
                f"not {skill_file.relative_to(ROOT)}"
            )

    if errors:
        print("PUBLIC SKILL VALIDATION FAILED")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Public Hypertaks skills OK:")
    for name in sorted(actual):
        print(f"  /{name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
