#!/usr/bin/env python3
"""Structural validation for the Hypertaks skill and its per-agent manifests.

Run from the repo root: `python3 scripts/validate_skill.py`
Exits non-zero with every broken invariant listed so CI fails loudly.

Checks:
  1. SKILL.md has valid YAML frontmatter (kebab-case name, no angle brackets in
     description).
  2. Every `references/*.md` and `assets/*.md` path mentioned in SKILL.md exists.
  3. All JSON manifests parse.
  4. All live plugin and package records declare the same strict-semver version.
  5. Native Claude and Codex marketplace records target the canonical Git
     repository and main branch.
  6. No Indonesian-language residue in any skill markdown file.
  7. No personal absolute filesystem paths anywhere in the skill.
  8. No version numbers in skill body text (allowed only in README.md,
     RELEASE-NOTES.md, hypertaks-skill-card.md, and JSON manifest fields).
  9. No duplicate section headers in references/knowledge-base.md.
 10. Mandatory kernel and canonical router references exist.
 11. assets/contract-schema.yaml exists and parses.
 12. Domain packs: if domains/ exists, INDEX.md routes every pack in it.
 13. Contradiction guard: no file suppresses an element SKILL.md marks
     mandatory, unless the suppression is scoped to EXECUTOR MODE.

Note: these are structural invariants, not behavioral tests - they cannot
verify that an agent actually runs the intake gate or the phase loop.
Check #13 is the exception in KIND, not in strength: it compares files against
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


TRACKED_FILES = git_tracked_files()
PROSE_EXTENSIONS = {".md", ".txt", ".yaml", ".yml", ".json"}


def iter_tracked_text_files():
    for path in TRACKED_FILES:
        try:
            yield path, path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue  # tracked binary file


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

# 3. All tracked JSON records parse. Ignored caches and local state are not
# repository content and must not affect validation.
for p in (path for path in TRACKED_FILES if path.suffix.lower() == ".json"):
    try:
        json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        errors.append(f"JSON does not parse: {p.relative_to(ROOT)} ({e})")

# 4. Live plugin and package versions in sync. Historical reports and release
# notes are intentionally excluded because their recorded versions are facts.
versions = {}
VERSION_RECORDS = {
    "package.json": [("version",)],
    ".agents/plugins/hypertaks.json": [("version",)],
    ".claude-plugin/plugin.json": [("version",)],
    ".claude-plugin/marketplace.json": [
        ("metadata", "version"),
        ("plugins", 0, "version"),
    ],
    ".codex-plugin/plugin.json": [("version",)],
    ".cursor-plugin/plugin.json": [("version",)],
    ".kimi-plugin/plugin.json": [("version",)],
}


def nested_value(data, selector):
    value = data
    for part in selector:
        value = value[part]
    return value


for rel, selectors in VERSION_RECORDS.items():
    p = ROOT / rel
    check(p.exists(), f"Live version record missing: {rel}")
    if not p.exists():
        continue
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        for selector in selectors:
            key = rel + ":" + ".".join(str(part) for part in selector)
            versions[key] = nested_value(data, selector)
    except (KeyError, IndexError, TypeError):
        errors.append(f"Live version field missing in {rel}")
    except Exception:  # noqa: BLE001
        pass  # JSON-parse error already reported above
distinct = {value for value in versions.values() if value is not None}
check(all(re.fullmatch(r"\d+\.\d+\.\d+", str(value)) for value in versions.values()),
      f"Live versions must use strict semver: {versions}")
check(len(distinct) == 1,
      f"Manifest versions out of sync: {versions}")

# 5. Native marketplace records use the canonical repository and branch.
try:
    claude_marketplace = json.loads(
        (ROOT / ".claude-plugin" / "marketplace.json").read_text(encoding="utf-8"))
    claude_source = claude_marketplace["plugins"][0]["source"]
    check(claude_source == {
        "source": "github",
        "repo": "aabrur/hypertaks-agent",
        "ref": "main",
    }, f"Claude marketplace source is not canonical: {claude_source}")
except (OSError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
    errors.append(f"Claude marketplace source cannot be validated: {exc}")

codex_marketplace_path = ROOT / ".agents" / "plugins" / "marketplace.json"
check(codex_marketplace_path.exists(),
      "Codex marketplace missing: .agents/plugins/marketplace.json")
if codex_marketplace_path.exists():
    try:
        codex_marketplace = json.loads(
            codex_marketplace_path.read_text(encoding="utf-8"))
        codex_plugin = codex_marketplace["plugins"][0]
        check(codex_marketplace["name"] == "hypertaks-marketplace",
              "Codex marketplace name must be hypertaks-marketplace")
        check(codex_marketplace["interface"]["displayName"]
              == "Hypertaks Marketplace",
              "Codex marketplace display name is out of sync")
        check(codex_plugin["name"] == "hypertaks",
              "Codex marketplace plugin name must be hypertaks")
        check(codex_plugin["source"] == {
            "source": "url",
            "url": "https://github.com/aabrur/hypertaks-agent.git",
            "ref": "main",
        }, f"Codex marketplace source is not canonical: "
           f"{codex_plugin.get('source')}")
        check(codex_plugin["policy"] == {
            "installation": "AVAILABLE",
            "authentication": "ON_INSTALL",
        }, f"Codex marketplace policy is invalid: {codex_plugin.get('policy')}")
        check(codex_plugin["category"] == "Coding",
              "Codex marketplace category must be Coding")
    except (OSError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        errors.append(f"Codex marketplace cannot be validated: {exc}")

# 6. Repository text policy: tracked text only, ignored/generated files out.
INDONESIAN = re.compile(
    r"\b(yang|untuk|dengan|dari|dalam|adalah|atau|pada|tidak|bisa|akan|"
    r"harus|sudah|setiap|kalau|tanpa|sebelum|setelah|menjadi|secara|"
    r"terhadap|sebagai|karena|belum|sebuah|tersebut|melalui|antara|"
    r"berdasarkan|seluruh|lainnya|laporan|temuan|gagal|lulus|kasus|"
    r"perubahan|selesai|mulai|ditulis|catatan|aman|bersih|terbukti|"
    r"terverifikasi|dijalankan|ditemukan|mengasumsikan|memperbaiki|"
    r"kira-kira|saja|dulu)\b",
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

# 9. Mandatory kernel and canonical router references exist.
for rel in ["references/00-security-kernel.md",
            "references/01-state-and-transactions.md",
            "references/02-retrieval-and-evidence.md",
            "references/03-professional-execution.md",
            "references/04-visual-delivery.md"]:
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
            founder_fields = {
                "business_impact", "strategic_fit", "short_term_benefit",
                "long_term_cost", "stakeholders_affected", "founder_concern",
                "safer_path",
            }
            missing = sorted(founder_fields - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing Founder Operating Lens "
                  f"fields: {', '.join(missing)}")
            capability_fields = {"capability_requirements", "capability_bindings"}
            missing = sorted(capability_fields - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing capability fields: "
                  f"{', '.join(missing)}")
            integrity_fields = {
                "original_request", "desired_outcome", "proposed_method",
                "supplied_inputs", "missing_critical_data", "planned_process",
                "deliverables", "destination", "validation_evidence",
                "approval_mode", "approval_evidence", "budget_gate",
                "budget_retrieval", "budget_verification",
            }
            missing = sorted(integrity_fields - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing contract-integrity fields: "
                  f"{', '.join(missing)}")
            retrieval_fields = {
                "retrieval_need", "retrieval_route", "corpus_scope",
                "retrieval_fusion", "retrieval_rerank", "retrieval_metrics",
                "retrieval_evidence_required", "retrieval_fallback",
            }
            missing = sorted(retrieval_fields - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing retrieval fields: "
                  f"{', '.join(missing)}")
            visual_fields = {
                "visual_status", "visual_type", "visual_purpose",
                "visual_owner", "visual_capability", "visual_data_source",
                "visual_validation", "visual_exports",
            }
            missing = sorted(visual_fields - set(data["contract"]))
            check(not missing,
                  "contract-schema.yaml: missing visual fields: "
                  f"{', '.join(missing)}")
            check("execution_profiles" in data["contract"],
                  "contract-schema.yaml: missing execution_profiles")
    except ImportError:
        print("note: PyYAML absent - contract-schema.yaml checked "
              "syntactically only (CI runs the full check)")

# 10a. Capability descriptor names must stay synchronized across the canonical
# router, machine-readable contract, and agent brief.
CAPABILITY_DESCRIPTOR_FIELDS = {
    "capability_id", "kind", "categories", "operations", "side_effect",
    "approval_required", "authentication", "external_system", "context_cost",
    "availability",
}
for rel in ["references/plugins-and-mcp.md", "assets/agent-brief-template.md",
            "assets/contract-schema.yaml"]:
    path = SKILL_DIR / rel
    if not path.exists():
        continue
    content = path.read_text(encoding="utf-8")
    missing = sorted(field for field in CAPABILITY_DESCRIPTOR_FIELDS
                     if field not in content)
    check(not missing,
          f"{rel}: missing capability descriptor fields: {', '.join(missing)}")

for rel in ["references/intake-protocol.md",
            "references/01-state-and-transactions.md",
            "assets/contract-schema.yaml", "assets/agent-brief-template.md"]:
    path = SKILL_DIR / rel
    if not path.exists():
        continue
    content = path.read_text(encoding="utf-8")
    missing = sorted(field for field in
                     {"capability_requirements", "capability_bindings"}
                     if field not in content)
    check(not missing,
          f"{rel}: missing capability contract fields: {', '.join(missing)}")

# 10b. Retrieval, visual, execution, and activation field names must remain
# synchronized across their canonical references and task artifacts.
RETRIEVAL_FIELDS = {
    "retrieval_need", "retrieval_route", "corpus_scope",
    "retrieval_metrics", "retrieval_fallback",
}
for rel in ["references/02-retrieval-and-evidence.md",
            "assets/contract-schema.yaml", "assets/agent-brief-template.md",
            "assets/deliverable-template.md"]:
    path = SKILL_DIR / rel
    content = path.read_text(encoding="utf-8")
    missing = sorted(field for field in RETRIEVAL_FIELDS if field not in content)
    check(not missing,
          f"{rel}: missing retrieval fields: {', '.join(missing)}")

VISUAL_FIELDS = {
    "visual_status", "visual_type", "visual_purpose", "visual_owner",
    "visual_data_source", "visual_validation", "visual_exports",
}
for rel in ["references/04-visual-delivery.md", "assets/contract-schema.yaml",
            "assets/agent-brief-template.md"]:
    path = SKILL_DIR / rel
    content = path.read_text(encoding="utf-8")
    missing = sorted(field for field in VISUAL_FIELDS if field not in content)
    check(not missing,
          f"{rel}: missing visual fields: {', '.join(missing)}")

for rel in ["references/03-professional-execution.md",
            "assets/contract-schema.yaml", "assets/agent-brief-template.md",
            "assets/deliverable-template.md"]:
    path = SKILL_DIR / rel
    content = path.read_text(encoding="utf-8")
    check("execution profile" in content.lower() or
          "execution_profiles" in content,
          f"{rel}: missing execution profile binding")

for rel in ["references/intake-protocol.md", "assets/contract-schema.yaml"]:
    path = SKILL_DIR / rel
    content = path.read_text(encoding="utf-8")
    for field in ("approval_mode", "approval_evidence"):
        check(field in content,
              f"{rel}: missing contract activation field {field}")

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
