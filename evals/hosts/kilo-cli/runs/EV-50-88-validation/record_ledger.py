"""Boss-approved: record EV-50..88 into evals/results.yaml."""
from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "scripts"))
import run_evals  # noqa: E402

RUN = ROOT / "evals/hosts/antigravity/runs/EV-50-88"
ARCHIVE_DIR = ROOT / "evals/archive"
OLD_RESULTS = ROOT / "evals/results.yaml"
OLD_ZIP = ARCHIVE_DIR / "final-ev-source-reports-2026-07-16.zip"
NEW_ZIP_NAME = "ev-01-88-source-reports-2026-08-04.zip"
NEW_ZIP = ARCHIVE_DIR / NEW_ZIP_NAME
HIST_RESULTS = ARCHIVE_DIR / "results-pre-ev-50-88-2026-08-04.yaml"

COMMIT = "a1103c6cfba1513963ceea093d3f4bed6be52990"
TREE = run_evals.git_tree(COMMIT)
SKILL = run_evals.calc_skill_root_hash(COMMIT)
VERSION = "4.5.1"
TODAY = "2026-08-04"

if not TREE or not SKILL:
    raise SystemExit(f"provenance failed tree={TREE!r} skill={SKILL!r}")

HIST_RESULTS.write_text(OLD_RESULTS.read_text(encoding="utf-8"), encoding="utf-8")

ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(NEW_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zout:
    with zipfile.ZipFile(OLD_ZIP, "r") as zin:
        for name in zin.namelist():
            zout.writestr(name, zin.read(name))
    for i in range(50, 89):
        src = RUN / "reports" / f"EV-{i}.md"
        if not src.is_file():
            raise SystemExit(f"missing report {src}")
        zout.write(src, arcname=f"EV-{i}.md")
    for extra in [
        RUN / "VALIDATION-KILO.md",
        RUN / "agent-prompts" / "STATUS-HERMES.md",
        RUN / "agent-prompts" / "STATUS-CLINE.md",
        RUN / "agent-prompts" / "STATUS-Command-CODE.md",
    ]:
        if extra.is_file():
            zout.write(extra, arcname=f"provenance/{extra.name}")

sha = hashlib.sha256(NEW_ZIP.read_bytes()).hexdigest()
print("archive", NEW_ZIP)
print("sha256", sha)
print("zip_entries", len(zipfile.ZipFile(NEW_ZIP).namelist()))

old = yaml.safe_load(OLD_RESULTS.read_text(encoding="utf-8"))
old_results = old["results"]
old_keys = sorted(old_results.keys(), key=lambda x: int(x.split("-")[1]))

HERMES_PASS = {50, 51, 52, 56, 59, 61}
HERMES_SKIP = {
    53: "SKIPPED(harness): harness limit - router runtime evidence only; no executed tenant filtering artifact.",
    54: "SKIPPED(harness): harness limit - no executed rank-fusion artifact.",
    55: "SKIPPED(harness): harness limit - no executed reranking artifact.",
    57: "SKIPPED(harness): harness limit - no executed evaluation artifact.",
    58: "SKIPPED(harness): harness limit - no runtime-generated contract artifact.",
    60: "SKIPPED(harness): harness limit - no executed Python artifact.",
    62: "SKIPPED(harness): harness limit - no chart-render artifact.",
}
CLINE = set(range(63, 76))
CMD = set(range(76, 89))


def host_for(n: int) -> str:
    if n <= 62:
        return "Hermes"
    if n <= 75:
        return "Cline"
    return "Command Code"


new_results = dict(old_results)
for n in range(50, 89):
    eid = f"EV-{n}"
    report = f"EV-{n}.md"
    host = host_for(n)
    if n in HERMES_PASS or n in CLINE or n in CMD:
        new_results[eid] = {
            "verdict": "PASS",
            "method": "behavioral",
            "confirmed_by_boss": True,
            "final_verdict_source": (
                f"Boss-confirmed Kilo validation of {report} "
                f"({host} runtime-gated behavioral; commit {COMMIT[:12]})"
            ),
            "source_report": report,
        }
    elif n in HERMES_SKIP:
        new_results[eid] = {
            "verdict": "SKIPPED(harness)",
            "method": "behavioral",
            "confirmed_by_boss": True,
            "final_verdict_source": (
                f"Boss-confirmed Kilo validation of {report} "
                f"({host} honest harness skip; commit {COMMIT[:12]})"
            ),
            "source_report": report,
            "evidence_quotes": [HERMES_SKIP[n]],
        }
    else:
        raise SystemExit(f"unmapped {eid}")

case_ids = old_keys + [f"EV-{i}" for i in range(50, 89)]
ordered = {cid: new_results[cid] for cid in case_ids}

pass_count = sum(1 for r in ordered.values() if r["verdict"] == "PASS")
non_pass = len(ordered) - pass_count
if len(ordered) != 88:
    raise SystemExit(f"expected 88 rows got {len(ordered)}")
if pass_count != 75:
    raise SystemExit(f"expected 75 PASS got {pass_count}")
if non_pass != 13:
    raise SystemExit(f"expected 13 non-PASS got {non_pass}")

meta = {
    "version": VERSION,
    "certification_status": "BEHAVIORALLY CERTIFIED",
    "harness": (
        "multi-host runtime-gated behavioral "
        "(Hermes + Cline + Command Code); Kilo validated"
    ),
    "date": TODAY,
    "grader": "Kilo final validation; Boss-confirmed",
    "confirmed_by_boss": True,
    "final_verdict_authority": (
        "Boss-confirmed Kilo review of Hermes/Cline/Command-Code EV-50-88 run folder "
        "plus preserved EV-01-49 final source reports"
    ),
    "tested_commit": COMMIT,
    "tested_tree": TREE,
    "skill_root_hash": SKILL,
    "total_ev": 88,
    "behavioral_pass": pass_count,
    "behavioral_non_pass": non_pass,
    "static_green": 88,
    "release_threshold": 24,
    "threshold_margin": pass_count - 24,
    "evidence_policy": (
        "Boss-confirmed Kilo final verdicts override host STATUS self-claims, "
        "coached batches, and synthetic generators. Runtime-gated behavioral "
        "evidence (natural Boss prompt + real .build/runtime gates) accepted for EV-50-88. "
        "EV-01-49 rows preserved from 4.3.0 certification archive."
    ),
    "historical_results_archive": "archive/results-pre-ev-50-88-2026-08-04.yaml",
    "prior_certification_archive": "archive/results-pre-certification-2026-07-16.yaml",
    "source_report_archive": f"archive/{NEW_ZIP_NAME}",
    "source_report_archive_sha256": sha,
    "extension_notes": (
        "EV-50-62 Hermes: 6 PASS runtime-gated + 7 SKIPPED(harness). "
        "EV-63-75 Cline: 13 PASS runtime-gated driver. "
        "EV-76-88 Command Code: 13 PASS runtime-gated. "
        "Rejected prior Antigravity coached/synthetic batches not ledgered."
    ),
    "case_ids": case_ids,
}

doc = {"meta": meta, "results": ordered}
OLD_RESULTS.write_text(
    yaml.safe_dump(doc, sort_keys=False, allow_unicode=True, default_flow_style=False, width=100),
    encoding="utf-8",
)
print("wrote", OLD_RESULTS)
print("pass", pass_count, "non_pass", non_pass, "margin", pass_count - 24)
