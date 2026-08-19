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
ALLOWED_SKILL_ROOT_ENTRIES = {
    "SKILL.md",
    "references",
    "scripts",
    "assets",
    "agents",
}
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
NAME_RE = re.compile(r"^name:\s*([a-z0-9-]+)\s*$", re.MULTILINE)


def read_name(skill_file: Path) -> str | None:
    text = skill_file.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None
    name_match = NAME_RE.search(match.group(1))
    return name_match.group(1) if name_match else None


def collect_frontmatter_skill_names(
    skills_root: Path = SKILLS,
) -> tuple[dict[str, Path], list[str]]:
    found: dict[str, Path] = {}
    errors: list[str] = []
    if not skills_root.is_dir():
        return found, [f"Missing skills directory: {skills_root}"]

    for skill_file in sorted(skills_root.rglob("*.md")):
        name = read_name(skill_file)
        if name is None or not name.startswith("hypertaks"):
            continue
        if name in found:
            errors.append(f"Duplicate public skill name: {name}")
            continue
        found[name] = skill_file

    actual = set(found)
    missing = sorted(EXPECTED - actual)
    extra = sorted(actual - EXPECTED)
    if missing:
        errors.append(f"Missing public Hypertaks skills: {', '.join(missing)}")
    if extra:
        errors.append(f"Unexpected public Hypertaks skills: {', '.join(extra)}")

    for name in sorted(actual & EXPECTED):
        skill_file = found[name]
        expected_dir = skills_root / name / "SKILL.md"
        if skill_file != expected_dir:
            try:
                relative = skill_file.relative_to(skills_root.parent)
            except ValueError:
                relative = skill_file
            errors.append(
                f"Public skill {name} must live at {expected_dir}, not {relative}"
            )

    return found, errors


def validate_skill_roots(skills_root: Path = SKILLS) -> list[str]:
    errors: list[str] = []
    for name in sorted(EXPECTED):
        skill_dir = skills_root / name
        if not skill_dir.is_dir():
            errors.append(f"Missing skill directory: {skill_dir}")
            continue
        for child in sorted(skill_dir.iterdir()):
            if child.name.startswith("."):
                continue
            if child.name not in ALLOWED_SKILL_ROOT_ENTRIES:
                errors.append(
                    f"Unexpected skill-root entry {child.relative_to(skills_root.parent)} "
                    f"(allowed: {', '.join(sorted(ALLOWED_SKILL_ROOT_ENTRIES))})"
                )
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.is_file():
            errors.append(f"Missing SKILL.md: {skill_file}")
            continue
        if read_name(skill_file) is None:
            errors.append(f"Invalid frontmatter: {skill_file}")
        description = skill_file.read_text(encoding="utf-8")
        host_needles = (
            "Claude Code",
            "claude.ai",
            "ChatGPT",
            "Codex",
            "Cursor",
            "Kimi",
            "Cline",
            "OpenClaw",
            "Hermes",
            "OpenCode",
        )
        for needle in host_needles:
            if needle in description:
                errors.append(
                    f"Canonical skill {name} contains host-specific language: {needle}"
                )
    return errors


def _yaml_quoted(text: str, key: str) -> str | None:
    match = re.search(rf"^\s*{re.escape(key)}:\s*\"([^\"]+)\"\s*$", text, re.MULTILINE)
    return match.group(1) if match else None


def validate_openai_agent_metadata(skills_root: Path = SKILLS) -> list[str]:
    errors: list[str] = []
    displays: dict[str, str] = {}
    prompts: dict[str, str] = {}
    for name in sorted(EXPECTED):
        path = skills_root / name / "agents" / "openai.yaml"
        if not path.is_file():
            errors.append(f"Missing OpenAI metadata: {path}")
            continue
        text = path.read_text(encoding="utf-8")
        display = _yaml_quoted(text, "display_name")
        short = _yaml_quoted(text, "short_description")
        prompt = _yaml_quoted(text, "default_prompt")
        if not display or not short or not prompt:
            errors.append(f"OpenAI metadata incomplete: {path}")
            continue
        if "allow_implicit_invocation:" not in text:
            errors.append(f"OpenAI metadata missing invocation policy: {path}")
        if display in displays:
            errors.append(
                f"Overlapping OpenAI display_name {display!r} on {name} and {displays[display]}"
            )
        if prompt in prompts:
            errors.append(
                f"Overlapping OpenAI default_prompt on {name} and {prompts[prompt]}"
            )
        displays[display] = name
        prompts[prompt] = name
    return errors


def validate_public_skills(skills_root: Path = SKILLS) -> int:
    _found, errors = collect_frontmatter_skill_names(skills_root)
    errors.extend(validate_skill_roots(skills_root))
    errors.extend(validate_openai_agent_metadata(skills_root))
    if errors:
        print("PUBLIC SKILL VALIDATION FAILED")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Public Hypertaks skills OK:")
    for name in sorted(EXPECTED):
        print(f"  /{name}")
    return 0


def main() -> int:
    return validate_public_skills()


if __name__ == "__main__":
    sys.exit(main())
