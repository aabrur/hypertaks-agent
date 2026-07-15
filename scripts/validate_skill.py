#!/usr/bin/env python3
"""Structural validation for the Hypertaks skill and its per-agent manifests.

Run from the repo root: `python3 scripts/validate_skill.py`
Exits non-zero with every broken invariant listed so CI fails loudly.

Checks:
  1. SKILL.md has valid YAML frontmatter (kebab-case name, no angle brackets in
     description).
  2. Every `references/*.md` and `assets/*.md` path mentioned in SKILL.md exists.
  3. All JSON manifests parse.
  4. All per-agent plugin manifests declare the same version.
  5. No Indonesian-language residue in any skill markdown file.
  6. No personal absolute filesystem paths anywhere in the skill.
  7. No version numbers in skill body text (allowed only in README.md,
     RELEASE-NOTES.md, hypertaks-skill-card.md, and JSON manifest fields).
  8. No duplicate section headers in references/knowledge-base.md.
  9. The two mandatory kernel references exist.
 10. assets/contract-schema.yaml exists and parses.
 11. Domain packs: if domains/ exists, INDEX.md routes every pack in it.
 12. Contradiction guard: no file suppresses an element SKILL.md marks
     mandatory, unless the suppression is scoped to EXECUTOR MODE.

Note: these are structural invariants, not behavioral tests - they cannot
verify that an agent actually runs the intake gate or the phase loop.
Check #12 is the exception in KIND, not in strength: it compares files against
each other rather than against a fixed list, so it catches a class of defect
(one file quietly cancelling another) that no single-file grep can see. It
still proves only what the files SAY. Conduct is graded in evals/.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = ROOT / "skills" / "hypertaks"
errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


def git_tracked_files():
    try:
        out = subprocess.check_output(
            ["git", "-c", f"safe.directory={ROOT}", "-C", str(ROOT), "ls-files"],
            encoding="utf-8",
        )
    except Exception as exc:  # noqa: BLE001
        errors.append(f"git ls-files failed: {exc}")
        return []
    return [ROOT / line for line in out.splitlines() if line.strip()]


TEXT_EXTENSIONS = {
    ".md", ".txt", ".yaml", ".yml", ".json", ".py", ".toml", ".sh",
    ".cfg", ".ini",
}
PROSE_EXTENSIONS = {".md", ".txt", ".yaml", ".yml", ".json"}


def iter_tracked_text_files():
    for path in git_tracked_files():
        if path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        try:
            yield path, path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue


def relpath(path):
    return path.relative_to(ROOT)


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

    # 2. Referenced files exist (nested paths included, e.g. references/domains/)
    for rel in sorted(set(re.findall(
            r"(?:references|assets)(?:/[\w-]+)*/[\w.-]+\.(?:md|yaml)", text))):
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

# 4a. Repository text policy: tracked text only, ignored/generated files out.
INDONESIAN = re.compile(
    r"\b(yang|untuk|dengan|dari|dalam|adalah|atau|pada|tidak|bisa|akan|"
    r"harus|sudah|setiap|kalau|tanpa|sebelum|setelah|menjadi|secara|"
    r"terhadap|sebagai|karena|belum|sebuah|tersebut|melalui|antara|"
    r"berdasarkan|seluruh|lainnya|laporan|temuan|gagal|lulus|kasus|"
    r"perubahan|selesai|mulai|ditulis|catatan|aman|bersih|terbukti|"
    r"terverifikasi|dijalankan|ditemukan|mengasumsikan|memperbaiki)\b",
    re.IGNORECASE,
)
for p, text in iter_tracked_text_files():
    for i, line in enumerate(text.splitlines(), 1):
        if "\u2014" in line:
            errors.append(f"Forbidden em dash in {relpath(p)}:{i}")
        if p.suffix.lower() in PROSE_EXTENSIONS:
            m = INDONESIAN.search(line)
            if m:
                errors.append(
                    f"Indonesian residue in {relpath(p)}:{i} "
                    f"(word: {m.group(0)!r})")

# --- content checks over the skill's markdown files ---
SKILL_MD = sorted(SKILL_DIR.rglob("*.md"))

# 6. Personal absolute paths (Windows user profiles, Unix home dirs).
PERSONAL_PATH = re.compile(
    r"[A-Za-z]:\\Users\\[A-Za-z0-9_.-]+|/(?:home|Users)/[A-Za-z0-9_.-]+")
for p in SKILL_MD:
    for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        m = PERSONAL_PATH.search(line)
        if m:
            errors.append(
                f"Personal path in {p.relative_to(ROOT)}:{i}: {m.group(0)}")

# 7. Version numbers outside the allowed files. JSON manifest `version`
# fields are exempt (checked in #4); only markdown body text is scanned.
VERSION_ALLOWED = {"RELEASE-NOTES.md", "hypertaks-skill-card.md", "README.md"}
VERSION_PATTERN = re.compile(r"\bv\d+\.\d+(?:\.\d+)?\b|\bversion\s+\d+\.\d+",
                             re.IGNORECASE)
for p in SKILL_MD:
    if p.name in VERSION_ALLOWED:
        continue
    for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        m = VERSION_PATTERN.search(line)
        if m:
            errors.append(
                f"Version number in body text {p.relative_to(ROOT)}:{i}: "
                f"{m.group(0)!r} (allowed only in README.md, "
                f"RELEASE-NOTES.md, hypertaks-skill-card.md)")

# 8. Duplicate section headers in the knowledge base.
kb = SKILL_DIR / "references" / "knowledge-base.md"
if kb.exists():
    seen = {}
    for i, line in enumerate(kb.read_text(encoding="utf-8").splitlines(), 1):
        if re.match(r"^#{2,3} ", line):
            header = line.strip()
            if header in seen:
                errors.append(
                    f"Duplicate header in knowledge-base.md: {header!r} "
                    f"(lines {seen[header]} and {i})")
            else:
                seen[header] = i

# 9. Mandatory kernel references exist.
for rel in ["references/00-security-kernel.md",
            "references/01-state-and-transactions.md"]:
    check((SKILL_DIR / rel).exists(), f"kernel file missing: {rel}")

# 10. Contract schema parses.
schema = SKILL_DIR / "assets" / "contract-schema.yaml"
check(schema.exists(), "assets/contract-schema.yaml missing")
if schema.exists():
    raw = schema.read_text(encoding="utf-8")
    check("\t" not in raw, "contract-schema.yaml contains tabs (invalid YAML)")
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(raw)
        check(isinstance(data, dict) and "contract" in data,
              "contract-schema.yaml: top-level 'contract' key missing")
        if isinstance(data, dict) and isinstance(data.get("contract"), dict):
            expected = {
                "business_impact", "strategic_fit", "short_term_benefit",
                "long_term_cost", "stakeholders_affected", "founder_concern",
                "safer_path",
            }
            missing = sorted(expected - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing Founder Operating Lens "
                  f"fields: {', '.join(missing)}")
    except ImportError:
        print("note: PyYAML absent - contract-schema.yaml checked "
              "syntactically only (CI runs the full check)")

# 11. Domain packs: if domains/ exists, INDEX.md exists and routes every pack.
domains = SKILL_DIR / "references" / "domains"
if domains.exists():
    index = domains / "INDEX.md"
    check(index.exists(), "references/domains/INDEX.md missing")
    if index.exists():
        itext = index.read_text(encoding="utf-8")
        for pack in sorted(p.name for p in domains.glob("D[0-9]-*.md")):
            check(pack.split("-")[0] in itext,
                  f"domains/INDEX.md does not route pack {pack}")

# 12. CONTRADICTION GUARD - the only cross-FILE check in this script.
#
# The failure it exists to catch is not a typo, it is a system that argues with
# itself: SKILL.md swears an element is mandatory on every tier, and some other
# file, read at a different phase, quietly cancels it. The agent obeys whichever
# it read last. That is how the depth bug (EV-16) shipped.
#
# The guard derives its subject matter FROM SKILL.md rather than hardcoding a
# list, so it cannot drift out of sync with the skill it polices: an element is
# in scope only while SKILL.md still declares it mandatory.
#
# THE CARVE-OUT IS THE WHOLE DIFFICULTY. EXECUTOR MODE suppresses the footer and
# the work log ON PURPOSE and CORRECTLY - a subagent at hypertaks_depth >= 1 must
# not re-run the ceremony (that is a fork bomb with paperwork). So suppression is
# legal exactly when it is scoped to depth >= 1, and illegal when it is loose. A
# guard that flagged every suppression would be demanding the bug back.
# Each mandated element: the pattern proving SKILL.md still mandates it, and the
# names it goes by. "ceremony" is the collective noun the skill itself uses for
# footer + work log ("the Founder at depth 0 owns all ceremony"), so suppressing
# ceremony suppresses both.
MANDATE = {
    "compliance footer": {
        "declared": r"ending with the \*\*compliance footer\*\*",
        "aliases": ["compliance footer", "ceremony"],
    },
    "work log": {
        "declared": r"work log is mandatory in \*\*every tier\*\*",
        "aliases": ["work log", "ceremony"],
    },
}

# Suppression is not "a negative word appears on the same line as the element" -
# that flags "never place a secret into a work log" (a rule ABOUT secrets) and
# the red-flag table, which QUOTES rationalizations in order to rebut them. The
# element must be the OBJECT of the suppressing verb. These templates encode
# that, and `{el}` is substituted per alias.
SUPPRESS_TEMPLATES = [
    r"(?:\bno\b|\bwithout\b)\s+(?:a\s+|an\s+|the\s+|any\s+)?{el}",
    r"(?:skips?|omits?|drops?|suppresses?)\s+(?:the\s+|a\s+|an\s+|any\s+)?"
    r"(?:\w+\s+){{0,6}}?{el}",
    r"(?:do(?:es)?\s+not|never)\s+"
    r"(?:produce|include|write|emit|append|carry|need|require)\s+"
    r"(?:a\s+|an\s+|the\s+|any\s+)?(?:\w+\s+){{0,6}}?{el}",
    r"{el}[^.]{{0,48}}?(?:is|are)\s+"
    r"(?:deprecated|optional|not required|no longer)",
]

# Depth-scoping tokens. Their presence NEAR a suppression means the suppression
# is the EXECUTOR MODE carve-out, not a contradiction. This exemption is the
# point of the check, not a hole in it: a subagent at depth >= 1 MUST omit the
# ceremony, and a guard that forbade that would be demanding the bug back.
DEPTH_SCOPED = re.compile(
    r"EXECUTOR MODE|hypertaks_depth|depth 0 owns all ceremony|depth >= 1",
    re.IGNORECASE)
SCOPE_WINDOW = 6  # lines either side - a section's worth of context


def strip_emphasis(s):
    """`**Do not** produce a footer` reads as suppression only once the
    markdown is out of the way."""
    return s.replace("*", "").replace("_", "").replace("`", "")


skill_text = skill.read_text(encoding="utf-8") if skill.exists() else ""
for element, spec in MANDATE.items():
    if not re.search(spec["declared"], skill_text):
        continue  # SKILL.md no longer mandates it; nothing left to contradict
    patterns = [
        re.compile(t.format(el=re.escape(alias)), re.IGNORECASE)
        for alias in spec["aliases"] for t in SUPPRESS_TEMPLATES
    ]
    for p in SKILL_MD:
        lines = p.read_text(encoding="utf-8").splitlines()
        for i, line in enumerate(lines, 1):
            flat = strip_emphasis(line)
            if not any(pat.search(flat) for pat in patterns):
                continue
            window = "\n".join(
                lines[max(0, i - 1 - SCOPE_WINDOW): i + SCOPE_WINDOW])
            if DEPTH_SCOPED.search(window):
                continue  # legitimate: EXECUTOR MODE, depth >= 1
            errors.append(
                f"CONTRADICTION in {p.relative_to(ROOT)}:{i}: SKILL.md makes "
                f"{element!r} mandatory on every tier, but this line suppresses "
                f"it outside EXECUTOR MODE: {line.strip()[:72]!r}")

if errors:
    print("VALIDATION FAILED:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print(f"Skill validation OK (version {distinct.pop() if distinct else 'n/a'})")
