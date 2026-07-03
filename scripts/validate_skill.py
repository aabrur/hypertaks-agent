#!/usr/bin/env python3
"""Structural validation for the Hypertaks skill and its per-agent manifests.

Run from the repo root: `python3 scripts/validate_skill.py`
Exits non-zero on the first broken invariant so CI fails loudly.

Checks:
  1. SKILL.md has valid YAML frontmatter (kebab-case name, no angle brackets in
     description).
  2. Every `references/*.md` and `assets/*.md` path mentioned in SKILL.md exists.
  3. All JSON manifests parse.
  4. All per-agent plugin manifests declare the same version.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = ROOT / "skills" / "hypertaks"
errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


# 1. SKILL.md frontmatter
skill = SKILL_DIR / "SKILL.md"
check(skill.exists(), "skills/hypertaks/SKILL.md missing")
if skill.exists():
    text = skill.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    check(bool(m), "SKILL.md: invalid or missing frontmatter")
    if m:
        fm = m.group(1)
        name_m = re.search(r"name:\s*(.+)", fm)
        desc_m = re.search(r'description:\s*"?(.+)', fm)
        check(bool(name_m), "SKILL.md: missing name")
        check(bool(desc_m), "SKILL.md: missing description")
        if name_m:
            name = name_m.group(1).strip()
            check(bool(re.match(r"^[a-z0-9-]+$", name)),
                  f"SKILL.md: name not kebab-case: {name}")
        if desc_m:
            desc = desc_m.group(1)
            check("<" not in desc and ">" not in desc,
                  "SKILL.md: angle brackets in description")

    # 2. Referenced files exist
    for rel in sorted(set(re.findall(r"(?:references|assets)/[\w-]+\.md", text))):
        check((SKILL_DIR / rel).exists(),
              f"SKILL.md references missing file: {rel}")

# 3. All JSON manifests parse
for p in ROOT.rglob("*.json"):
    if "node_modules" in p.parts or ".git" in p.parts:
        continue
    try:
        json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        errors.append(f"JSON does not parse: {p.relative_to(ROOT)} ({e})")

# 4. Manifest versions in sync
versions = {}
for rel in [".claude-plugin/plugin.json", ".codex-plugin/plugin.json",
            ".cursor-plugin/plugin.json", ".kimi-plugin/plugin.json"]:
    p = ROOT / rel
    if p.exists():
        try:
            versions[rel] = json.loads(p.read_text(encoding="utf-8")).get("version")
        except Exception:  # noqa: BLE001
            pass  # JSON-parse error already reported above
distinct = set(versions.values())
check(len(distinct) <= 1,
      f"Manifest versions out of sync: {versions}")

if errors:
    print("VALIDATION FAILED:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print(f"Skill validation OK (version {distinct.pop() if distinct else 'n/a'})")
