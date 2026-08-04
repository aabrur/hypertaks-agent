"""One-shot public-tree cleanup for hypertaks-agent.

- Moves EV-50..88 evidence under the host that ran each batch
- Renames reports to Host-EV-NN.md
- Removes root scratch + rejected generators
- Redacts EV-78 fixture secrets
- Rebuilds evals/archive zip + updates results.yaml source_report names
"""
from __future__ import annotations

import hashlib
import re
import shutil
import sys
import zipfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import run_evals  # noqa: E402

OLD = ROOT / "evals/hosts/antigravity/runs/EV-50-88"
ARCHIVE_DIR = ROOT / "evals/archive"
OLD_ZIP = ARCHIVE_DIR / "final-ev-source-reports-2026-07-16.zip"
NEW_ZIP_NAME = "ev-01-88-source-reports-2026-08-04.zip"
NEW_ZIP = ARCHIVE_DIR / NEW_ZIP_NAME
RESULTS = ROOT / "evals/results.yaml"

# Host batches from Kilo validation
BATCHES = {
    "hermes": {
        "ids": list(range(50, 63)),
        "run": "EV-50-62",
        "status_src": "STATUS-HERMES.md",
        "prompt_src": "HERMES-EV-50-62.md",
        "label": "Hermes",
        "report_prefix": "Hermes",
    },
    "cline": {
        "ids": list(range(63, 76)),
        "run": "EV-63-75",
        "status_src": "STATUS-CLINE.md",
        "prompt_src": "CLINE-EV-63-75.md",
        "label": "Cline",
        "report_prefix": "Cline",
        "driver": "cline-run-EV-63-75.cjs",
    },
    "command-code": {
        "ids": list(range(76, 89)),
        "run": "EV-76-88",
        "status_src": "STATUS-Command-CODE.md",
        "prompt_src": "COMMAND-CODE-EV-76-88.md",
        "label": "Command Code",
        "report_prefix": "Command-Code",
    },
}

ROOT_JUNK = [
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
    "scripts/plot_cac_ltv.py",
]

ANTIGRAVITY_REJECT = [
    "evals/hosts/antigravity/generate_eval_reports.py",
    "evals/hosts/antigravity/run_behavioral_suite.py",
    "evals/hosts/antigravity/dump_details.py",
    "evals/hosts/antigravity/inspect_cases.py",
    "evals/hosts/antigravity/cases_dump.txt",
    "evals/hosts/antigravity/PROMPT-EV-50-88-BEHAVIORAL.md",
]

SECRET_RE = re.compile(
    r"password\s*=\s*\S+|Pr0dDb#S3cr3t!2026|sk-[A-Za-z0-9]{10,}|Bearer\s+[A-Za-z0-9._\-]+",
    re.I,
)


def ensure_dir(p: Path) -> Path:
    p.mkdir(parents=True, exist_ok=True)
    return p


def copy_file(src: Path, dst: Path) -> None:
    ensure_dir(dst.parent)
    shutil.copy2(src, dst)


def redact_text(text: str) -> str:
    text = text.replace("Pr0dDb#S3cr3t!2026", "<REDACTED_PROD_DB_SECRET>")
    text = SECRET_RE.sub(lambda m: "<REDACTED_SECRET>" if "password" in m.group(0).lower() or m.group(0).startswith(("sk-", "Bearer")) else m.group(0), text)
    # explicit password= form
    text = re.sub(r"(password\s*=\s*)(\S+)", r"\1<REDACTED_SECRET>", text, flags=re.I)
    return text


def write_text(path: Path, body: str) -> None:
    ensure_dir(path.parent)
    path.write_text(body, encoding="utf-8", newline="\n")


def move_batch(host_id: str, cfg: dict) -> dict[str, str]:
    """Returns map old_report_name -> new_report_name for results.yaml."""
    run_dir = ensure_dir(ROOT / "evals/hosts" / host_id / "runs" / cfg["run"])
    reports = ensure_dir(run_dir / "reports")
    transcripts = ensure_dir(run_dir / "transcripts")
    fixtures = ensure_dir(run_dir / "fixtures")
    rename_map: dict[str, str] = {}
    prefix = cfg["report_prefix"]

    for n in cfg["ids"]:
        eid = f"EV-{n}"
        old_report = OLD / "reports" / f"{eid}.md"
        old_tx = OLD / "transcripts" / f"{eid}.txt"
        old_fix = OLD / "fixtures" / eid
        new_report_name = f"{prefix}-{eid}.md"
        new_report = reports / new_report_name
        if old_report.is_file():
            body = redact_text(old_report.read_text(encoding="utf-8"))
            # fix internal paths in report front matter
            body = body.replace(
                f"transcript_file: transcripts/{eid}.txt",
                f"transcript_file: transcripts/{eid}.txt",
            )
            body = body.replace(
                f"boss_prompt_file: fixtures/{eid}/boss-prompt.txt",
                f"boss_prompt_file: fixtures/{eid}/boss-prompt.txt",
            )
            # host field normalize
            if host_id == "command-code":
                body = re.sub(r"^- host:.*$", f"- host: {cfg['label']}", body, count=1, flags=re.M)
            write_text(new_report, body)
            rename_map[f"{eid}.md"] = new_report_name
        if old_tx.is_file():
            write_text(transcripts / f"{eid}.txt", redact_text(old_tx.read_text(encoding="utf-8")))
        if old_fix.is_dir():
            dest = fixtures / eid
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(old_fix, dest)
            # redact all text fixtures
            for f in dest.rglob("*"):
                if f.is_file() and f.suffix.lower() in {".txt", ".md", ".json", ".csv", ".env", ".py"}:
                    try:
                        write_text(f, redact_text(f.read_text(encoding="utf-8")))
                    except UnicodeDecodeError:
                        pass

    # status + prompt
    ap = OLD / "agent-prompts"
    status_src = ap / cfg["status_src"]
    if status_src.is_file():
        write_text(run_dir / "STATUS.md", redact_text(status_src.read_text(encoding="utf-8")))
    prompt_src = ap / cfg["prompt_src"]
    if not prompt_src.is_file():
        # fallbacks
        for alt in ap.glob(f"*{cfg['run']}*"):
            prompt_src = alt
            break
    if prompt_src.is_file():
        write_text(run_dir / "DRIVER-PROMPT.md", prompt_src.read_text(encoding="utf-8"))

    driver = cfg.get("driver")
    if driver:
        dsrc = OLD / driver
        if dsrc.is_file():
            copy_file(dsrc, run_dir / driver)

    # per-host index
    lines = [
        f"# {cfg['label']} behavioral run `{cfg['run']}`",
        "",
        f"- host: {cfg['label']}",
        f"- cases: EV-{cfg['ids'][0]} .. EV-{cfg['ids'][-1]}",
        f"- reports: `reports/{prefix}-EV-*.md`",
        f"- transcripts: `transcripts/EV-*.txt`",
        f"- fixtures: `fixtures/EV-*/` (secrets redacted)",
        f"- status: `STATUS.md`",
        "",
        "Public ledger rows point at archive members named like the report files.",
        "",
    ]
    write_text(run_dir / "README.md", "\n".join(lines))

    # thin host REPORT addendum for behavioral batch
    host_report = ROOT / "evals/hosts" / host_id / f"REPORT-{cfg['run']}.md"
    write_text(
        host_report,
        "\n".join(
            [
                f"# {cfg['label']} - behavioral {cfg['run']}",
                "",
                f"- host: {cfg['label']}",
                f"- cases: EV-{cfg['ids'][0]}..EV-{cfg['ids'][-1]}",
                f"- run folder: `evals/hosts/{host_id}/runs/{cfg['run']}/`",
                f"- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990",
                f"- validation: `evals/hosts/kilo-cli/runs/EV-50-88-validation/VALIDATION.md`",
                "",
                "See `STATUS.md` and per-case reports under the run folder.",
                "",
            ]
        ),
    )
    return rename_map


def move_kilo_validation() -> None:
    dest = ensure_dir(ROOT / "evals/hosts/kilo-cli/runs/EV-50-88-validation")
    mapping = {
        "VALIDATION-KILO.md": "VALIDATION.md",
        "VALIDATION-REJECTED.md": "VALIDATION-REJECTED.md",
        "SUMMARY.md": "SUMMARY.md",
        "READY-FOR-LEDGER.md": "READY-FOR-LEDGER.md",
        "record_ledger.py": "record_ledger.py",
        "kilo-run-EV-84-88.cjs": "kilo-run-EV-84-88.cjs",
    }
    for src_name, dst_name in mapping.items():
        src = OLD / src_name
        if src.is_file():
            body = src.read_text(encoding="utf-8")
            # rewrite old paths in docs
            body = body.replace(
                "evals/hosts/antigravity/runs/EV-50-88/",
                "evals/hosts/<host>/runs/<batch>/ (see hermes|cline|command-code)",
            )
            write_text(dest / dst_name, body)
    # orchestration prompts kept under kilo validation
    orch = OLD / "agent-prompts" / "BOSS-ORCHESTRATION.md"
    if orch.is_file():
        write_text(dest / "BOSS-ORCHESTRATION.md", orch.read_text(encoding="utf-8"))
    write_text(
        dest / "README.md",
        "\n".join(
            [
                "# Kilo validation - EV-50..88 multi-host",
                "",
                "Kilo validated host batches and Boss confirmed the ledger.",
                "",
                "| Host | Run folder |",
                "|---|---|",
                "| Hermes | `evals/hosts/hermes/runs/EV-50-62/` |",
                "| Cline | `evals/hosts/cline/runs/EV-63-75/` |",
                "| Command Code | `evals/hosts/command-code/runs/EV-76-88/` |",
                "",
                "Rejected Antigravity coached/synthetic batches are documented in `VALIDATION-REJECTED.md` only.",
                "",
            ]
        ),
    )
    # kilo-cli top-level REPORT if missing
    kilo_report = ROOT / "evals/hosts/kilo-cli/REPORT.md"
    if not kilo_report.is_file():
        write_text(
            kilo_report,
            "\n".join(
                [
                    "# Kilo CLI host",
                    "",
                    "- Adapter / driver host for Hypertaks local validation.",
                    "- Behavioral validation runs live under `evals/hosts/kilo-cli/runs/`.",
                    "",
                ]
            ),
        )


def delete_paths(paths: list[str]) -> None:
    for rel in paths:
        p = ROOT / rel
        if p.is_file():
            p.unlink()
            print("deleted file", rel)
        elif p.is_dir():
            shutil.rmtree(p)
            print("deleted dir", rel)


def rebuild_archive_and_results(rename_map: dict[str, str]) -> None:
    # rebuild zip: old 10 + renamed EV reports + provenance
    ensure_dir(ARCHIVE_DIR)
    with zipfile.ZipFile(NEW_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        with zipfile.ZipFile(OLD_ZIP, "r") as zin:
            for name in zin.namelist():
                zout.writestr(name, zin.read(name))
        for host_id, cfg in BATCHES.items():
            run_dir = ROOT / "evals/hosts" / host_id / "runs" / cfg["run"]
            for n in cfg["ids"]:
                name = f"{cfg['report_prefix']}-EV-{n}.md"
                src = run_dir / "reports" / name
                if not src.is_file():
                    raise SystemExit(f"missing {src}")
                zout.write(src, arcname=name)
        # provenance
        val = ROOT / "evals/hosts/kilo-cli/runs/EV-50-88-validation/VALIDATION.md"
        if val.is_file():
            zout.write(val, arcname="provenance/VALIDATION-KILO.md")
        for host_id, cfg in BATCHES.items():
            st = ROOT / "evals/hosts" / host_id / "runs" / cfg["run"] / "STATUS.md"
            if st.is_file():
                zout.write(st, arcname=f"provenance/STATUS-{cfg['report_prefix']}.md")

    sha = hashlib.sha256(NEW_ZIP.read_bytes()).hexdigest()
    print("archive", NEW_ZIP, "sha", sha, "entries", len(zipfile.ZipFile(NEW_ZIP).namelist()))

    doc = yaml.safe_load(RESULTS.read_text(encoding="utf-8"))
    meta = doc["meta"]
    meta["source_report_archive"] = f"archive/{NEW_ZIP_NAME}"
    meta["source_report_archive_sha256"] = sha
    meta["extension_notes"] = (
        "EV-50-62 Hermes under evals/hosts/hermes/runs/EV-50-62/. "
        "EV-63-75 Cline under evals/hosts/cline/runs/EV-63-75/. "
        "EV-76-88 Command Code under evals/hosts/command-code/runs/EV-76-88/. "
        "Kilo validation under evals/hosts/kilo-cli/runs/EV-50-88-validation/. "
        "Rejected prior Antigravity coached/synthetic batches not ledgered."
    )

    results = doc["results"]
    for eid, row in results.items():
        src = str(row.get("source_report", ""))
        if src in rename_map:
            new_name = rename_map[src]
            row["source_report"] = new_name
            fvs = str(row.get("final_verdict_source", ""))
            # replace old EV-N.md mention with new name
            fvs = fvs.replace(src, new_name)
            # also handle bare EV-N.md if present
            row["final_verdict_source"] = fvs

    # keep provenance hashes consistent with HEAD commit used at certification
    commit = meta["tested_commit"]
    meta["tested_tree"] = run_evals.git_tree(commit)
    meta["skill_root_hash"] = run_evals.calc_skill_root_hash(commit)

    RESULTS.write_text(
        yaml.safe_dump(doc, sort_keys=False, allow_unicode=True, default_flow_style=False, width=100),
        encoding="utf-8",
    )
    print("updated", RESULTS)


def write_evals_hosts_readme() -> None:
    write_text(
        ROOT / "evals/hosts/README.md",
        "\n".join(
            [
                "# Eval hosts",
                "",
                "Each subdirectory is one adapter/host id.",
                "",
                "## Layout",
                "",
                "```text",
                "evals/hosts/<host-id>/",
                "  REPORT.md                 # adapter audit / install check",
                "  REPORT-EV-XX-YY.md        # optional behavioral batch summary",
                "  runs/<batch-id>/          # behavioral evidence for a batch",
                "    README.md",
                "    STATUS.md",
                "    DRIVER-PROMPT.md",
                "    reports/<Host>-EV-NN.md",
                "    transcripts/EV-NN.txt",
                "    fixtures/EV-NN/",
                "```",
                "",
                "## EV-50..88 hosts",
                "",
                "| Host folder | Cases |",
                "|---|---|",
                "| `hermes/runs/EV-50-62/` | EV-50..62 |",
                "| `cline/runs/EV-63-75/` | EV-63..75 |",
                "| `command-code/runs/EV-76-88/` | EV-76..88 |",
                "| `kilo-cli/runs/EV-50-88-validation/` | cross-host validation |",
                "",
                "Canonical ledger: `evals/results.yaml` (Boss-confirmed).",
                "Hashed source reports: `evals/archive/ev-01-88-source-reports-2026-08-04.zip`.",
                "",
                "Do not store raw secrets in fixtures or transcripts. Redact before commit.",
                "",
            ]
        ),
    )


def main() -> int:
    if not OLD.is_dir():
        print("OLD run folder missing; already reorganized?", OLD)
        # still allow cleanup of junk if present
    rename_map: dict[str, str] = {}
    if OLD.is_dir():
        for host_id, cfg in BATCHES.items():
            m = move_batch(host_id, cfg)
            rename_map.update(m)
            print("moved", host_id, "reports", len(m))
        move_kilo_validation()
        # remove old antigravity run tree after copy
        shutil.rmtree(OLD)
        print("removed", OLD)
        # remove empty runs dir if empty
        runs = ROOT / "evals/hosts/antigravity/runs"
        if runs.is_dir() and not any(runs.iterdir()):
            runs.rmdir()

    delete_paths(ROOT_JUNK)
    delete_paths(ANTIGRAVITY_REJECT)

    write_evals_hosts_readme()

    if rename_map:
        rebuild_archive_and_results(rename_map)
    elif NEW_ZIP.is_file():
        print("no rename map; archive left as-is")
    else:
        raise SystemExit("no evidence moved and no archive present")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
