#!/usr/bin/env python3
"""Runner for the Hypertaks behavioral eval suite.

  python3 scripts/run_evals.py --check     # case files are well-formed (CI)
  python3 scripts/run_evals.py --static    # static preconditions: RED/GREEN
  python3 scripts/run_evals.py --report evals/results.yaml   # behavioral run

Three layers, deliberately distinct:

  --check   structure only. Does every case declare the required keys?

  --static  the mechanical RED/GREEN. Each case names a `static_precondition`:
            the artifacts in the skill that must exist for the graded behavior
            to be POSSIBLE at all. A skill that never defines EXECUTOR MODE
            cannot pass EV-16 no matter which model runs it. These checks are
            greps - they prove the skill is *capable*, never that it *behaves*.

  --report  the real verdict. Behavioral cases are executed by hand (or by a
            driving agent) against a fresh session with the skill loaded, then
            graded per evals/rubric.md and recorded in a results file. No
            script can run an LLM, and a GREEN static line is not a PASS.

Reporting vocabulary is PASS / FAIL / SKIPPED(harness) per case plus the list
of failing ids. There is no aggregate numeric score and none may be invented.
"""
import argparse
import re
import sys
from pathlib import Path
import subprocess
import json
import hashlib
from functools import lru_cache

try:
    import yaml
except ImportError:
    print("PyYAML is required: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parent.parent
CASES_DIR = ROOT / "evals" / "cases"
REQUIRED = ("id", "name", "group", "setup", "expect_pass", "expect_fail")
GROUPS = {"security", "loop", "transaction", "tier", "quantitative",
          "output-shape", "recursion"}
VERDICTS = {"PASS", "FAIL", "SKIPPED", "EVIDENCE_MISSING"}


def load_cases():
    """Return (cases, structural_errors)."""
    errors, cases = [], []
    files = sorted(CASES_DIR.glob("EV-*.yaml"))
    if len(files) < 18:
        errors.append(f"expected at least 18 case files, found {len(files)}")
    seen = set()
    for f in files:
        try:
            data = yaml.safe_load(f.read_text(encoding="utf-8"))
        except yaml.YAMLError as e:
            errors.append(f"{f.name}: YAML parse error: {e}")
            continue
        for key in REQUIRED:
            if key not in data:
                errors.append(f"{f.name}: missing key {key!r}")
        if data.get("id") != f.stem:
            errors.append(f"{f.name}: id {data.get('id')!r} != filename stem")
        if data.get("id") in seen:
            errors.append(f"{f.name}: duplicate id {data.get('id')!r}")
        seen.add(data.get("id"))
        if data.get("group") not in GROUPS:
            errors.append(f"{f.name}: unknown group {data.get('group')!r}")
        for key in ("expect_pass", "expect_fail"):
            if not isinstance(data.get(key), list) or not data.get(key):
                errors.append(f"{f.name}: {key} must be a non-empty list")
        cases.append(data)
    return cases, errors


def eval_static(case):
    """Return (ok, [unmet reasons]) for one case's static precondition."""
    pre = case.get("static_precondition")
    if not pre:
        return False, ["no static_precondition declared"]
    unmet = []
    for rule in pre.get("must_match", []):
        path = ROOT / rule["file"]
        if not path.exists():
            unmet.append(f"MISSING FILE {rule['file']} "
                         f"(needs /{rule['pattern']}/)")
            continue
        text = path.read_text(encoding="utf-8")
        if not re.search(rule["pattern"], text):
            unmet.append(f"{rule['file']}: no match for /{rule['pattern']}/")
    for rule in pre.get("must_not_match", []):
        path = ROOT / rule["file"]
        if not path.exists():
            continue  # absent file cannot carry forbidden text
        text = path.read_text(encoding="utf-8")
        m = re.search(rule["pattern"], text)
        if m:
            line = text[:m.start()].count("\n") + 1
            unmet.append(f"{rule['file']}:{line}: forbidden text still present "
                         f"({m.group(0)[:48]!r})")
    return not unmet, unmet


def cmd_check():
    cases, errors = load_cases()
    if errors:
        print("EVAL SUITE INVALID:")
        for e in errors:
            print("  -", e)
        return 1
    by_group = {}
    for c in cases:
        by_group.setdefault(c["group"], []).append(c["id"])
    print(f"{len(cases)} eval cases OK:")
    for g in sorted(by_group):
        print(f"  {g:<13} {', '.join(sorted(by_group[g]))}")
    return 0


def cmd_static():
    cases, errors = load_cases()
    if errors:
        print("EVAL SUITE INVALID (fix structure first):")
        for e in errors:
            print("  -", e)
        return 2
    red, green = [], []
    print("STATIC PRECONDITIONS - can the skill even exhibit the behavior?\n")
    for c in cases:
        ok, unmet = eval_static(c)
        (green if ok else red).append(c["id"])
        mark = "GREEN" if ok else "RED  "
        print(f"  {mark} {c['id']}  {c['name']}")
        for reason in unmet:
            print(f"          - {reason}")
    print()
    print(f"{len(green)}/{len(cases)} GREEN"
          + (f", {len(red)} RED: {', '.join(red)}" if red else ""))
    print("\nA GREEN static line means the capability EXISTS in the files.")
    print("It is not a PASS. Behavior is graded only by --report, from a "
          "transcript.")
    return 1 if red else 0

@lru_cache(maxsize=None)
def calc_skill_root_hash(commit):
    try:
        out = subprocess.check_output(git_args("ls-tree", "-r", commit, "skills/hypertaks"), encoding="utf-8")
        lines = sorted(out.strip().split("\n"))
        data_to_hash = ""
        for line in lines:
            if not line: continue
            parts = line.split(maxsplit=3)
            if len(parts) == 4:
                file_hash = parts[2]
                file_path = parts[3]
                file_content = subprocess.check_output(git_args("cat-file", "blob", file_hash))
                data_to_hash += file_path + "\n" + file_content.decode("utf-8") + "\n"
        return hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()
    except Exception:
        return None

def git_args(*args):
    return ["git", f"-c", f"safe.directory={ROOT}", "-C", str(ROOT), *args]

def current_head():
    return subprocess.check_output(git_args("rev-parse", "HEAD"), encoding="utf-8").strip()

def git_tree(commit):
    return subprocess.check_output(git_args("show", "-s", "--format=%T", commit), encoding="utf-8").strip()

def read_transcript(path):
    """Parse every JSONL record; a JSONL file must not be treated as one string."""
    records = []
    for line_number, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValueError(f"line {line_number}: invalid JSON: {exc}") from exc
    return records

def validate_transcript(case_id, result, case_data, transcript_path):
    problems = []
    path = Path(transcript_path)
    if not path.exists():
        return [f"{case_id}: transcript tidak ditemukan: {path}"]
    try:
        records = read_transcript(path)
    except (OSError, ValueError) as exc:
        return [f"{case_id}: transcript tidak dapat dibaca: {exc}"]
    if len(records) != 1:
        return [f"{case_id}: transcript harus memiliki tepat satu record JSONL"]
    meta = records[0]
    raw_prompt = meta.get("raw_prompt")
    raw_response = meta.get("raw_response")
    if not isinstance(raw_prompt, str) or not raw_prompt.strip() or raw_prompt.strip().startswith("["):
        problems.append(f"{case_id}: raw_prompt kosong atau bukan prompt nyata")
    if not isinstance(raw_response, str) or not raw_response.strip() or raw_response.strip().startswith("["):
        problems.append(f"{case_id}: raw_response kosong atau bukan respons model verbatim")
    if meta.get("case_id") != case_id:
        problems.append(f"{case_id}: case_id transcript tidak cocok")
    if meta.get("cold_session") is not True:
        problems.append(f"{case_id}: transcript bukan cold session")
    if not isinstance(meta.get("tool_calls"), list) or not meta["tool_calls"]:
        problems.append(f"{case_id}: tool_calls kosong")
    if not isinstance(meta.get("tool_results"), list) or not meta["tool_results"]:
        problems.append(f"{case_id}: tool_results kosong")
    placeholder = "abcdef0123456789abcdef0123456789abcdef01"
    if any(meta.get(key) == placeholder for key in ("tested_commit", "tested_tree", "skill_root_hash")):
        problems.append(f"{case_id}: Placeholder hash detected")
    commit = meta.get("tested_commit", "")
    if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
        problems.append(f"{case_id}: tested_commit bukan SHA penuh 40 karakter")
    else:
        try:
            subprocess.run(git_args("cat-file", "-e", commit), check=True, capture_output=True)
        except subprocess.CalledProcessError:
            problems.append(f"{case_id}: tested_commit tidak dapat ditemukan")
        else:
            try:
                branches = subprocess.check_output(git_args("branch", "--contains", commit), encoding="utf-8")
                if "v4-kernel" not in branches:
                    problems.append(f"{case_id}: tested_commit tidak reachable dari v4-kernel")
            except subprocess.CalledProcessError:
                problems.append(f"{case_id}: tested_commit tidak reachable")
            try:
                if meta.get("tested_tree") != git_tree(commit):
                    problems.append(f"{case_id}: tested_tree tidak sama dengan git show -s --format=%T")
            except Exception:
                problems.append(f"{case_id}: tested_tree check failed")
            skill_hash = calc_skill_root_hash(commit)
            if not skill_hash or meta.get("skill_root_hash") != skill_hash:
                problems.append(f"{case_id}: skill_root_hash tidak sama dengan hash aktual")
    executor_name = str(meta.get("executor", "")).strip()
    grader_name = re.sub(r"\s*\([^)]*\)", "", str(meta.get("grader", ""))).strip()
    if not executor_name:
        problems.append(f"{case_id}: executor kosong")
    if not grader_name:
        problems.append(f"{case_id}: grader kosong")
    if executor_name and executor_name == grader_name:
        problems.append(f"{case_id}: executor dan grader sama")
    if "self-graded" in str(meta.get("grader", "")).lower():
        problems.append(f"{case_id}: grader bertuliskan self-graded")
    quotes = meta.get("evidence_quotes")
    if not isinstance(quotes, list) or not quotes or any(str(q).lower() == "matches rubric." for q in quotes):
        problems.append(f"{case_id}: evidence_quotes kosong atau generik")
    if similar(raw_response or "", " ".join(map(str, case_data.get("expect_pass", [])))):
        problems.append(f"{case_id}: raw_response identik atau sangat dekat dengan expect_pass")
    prompt_lower = (raw_prompt or "").lower()
    if any(term in prompt_lower for term in ("expect_pass", "expect_fail", "rubric", "case_id")):
        problems.append(f"{case_id}: transcript mengandung expect_pass, expect_fail, rubric di prompt")
    if meta.get("verdict") != result.get("verdict"):
        problems.append(f"{case_id}: verdict transcript berbeda dari results.yaml")
    return problems

def similar(a, b):
    a = re.sub(r'\s+', ' ', a.lower())
    b = re.sub(r'\s+', ' ', b.lower())
    return a == b or (len(a)>20 and len(b)>20 and (a in b or b in a))

def cmd_report(results_path):
    cases, errors = load_cases()
    if errors:
        print("fix the case files first (--check)", file=sys.stderr)
        return 2
    try:
        doc = yaml.safe_load(Path(results_path).read_text(encoding="utf-8")) or {}
    except Exception:
        doc = {}
    meta = doc.get("meta", {})
    results = doc.get("results", doc)
    ids = {c["id"] for c in cases}

    def row(v):
        return v if isinstance(v, dict) else {"verdict": v, "method": "unknown"}

    rows = {k: row(v) for k, v in results.items() if k != "meta"}

    problems = []
    provenance_keys = ("tested_commit", "tested_tree", "skill_root_hash")
    for key in provenance_keys:
        value = meta.get(key)
        if not isinstance(value, str) or not value.strip():
            problems.append(f"meta: {key} kosong atau tidak ada")
            break
    else:
        commit = meta["tested_commit"]
        if not re.fullmatch(r"[0-9a-f]{40}", commit):
            problems.append("meta: tested_commit bukan SHA penuh 40 karakter")
        else:
            try:
                subprocess.run(git_args("cat-file", "-e", commit), check=True,
                               capture_output=True)
            except subprocess.CalledProcessError:
                problems.append("meta: tested_commit tidak dapat ditemukan")
            else:
                if meta["tested_tree"] != git_tree(commit):
                    problems.append("meta: tested_tree tidak sama dengan tested_commit")
                skill_hash = calc_skill_root_hash(commit)
                if meta["skill_root_hash"] != skill_hash:
                    problems.append("meta: skill_root_hash tidak sama dengan tested_commit")
                try:
                    if commit != current_head():
                        problems.append("meta: tested_commit tidak sama dengan current HEAD")
                except subprocess.CalledProcessError:
                    problems.append("meta: current HEAD tidak dapat dibaca")

    problems.extend(f"unknown case id in results: {k}" for k in rows if k not in ids)
    missing = sorted(ids - set(rows))
    if missing:
        problems.append(f"cases with no recorded result: {', '.join(missing)}")

    for k, r in rows.items():
        if str(r.get("verdict")).split("(")[0] not in VERDICTS:
            problems.append(f"{k}: invalid verdict {r.get('verdict')!r}")
        if r.get("method") not in ("behavioral", "static", "unknown"):
            problems.append(f"{k}: invalid method {r.get('method')!r}")

        if r.get("method") == "static" and str(r.get("verdict")).startswith("PASS"):
            problems.append(
                f"{k}: a static check may NEVER be recorded as PASS. Static proves "
                f"the words exist in the files; it says nothing about conduct.")

        # Guard 17
        if str(r.get("confirmed_by_boss")).lower() != "false":
            problems.append(f"{k}: confirmed_by_boss must be false without Boss auth")

        if r.get("method") == "behavioral":
            for key in provenance_keys:
                if r.get(key) != meta.get(key):
                    problems.append(f"{k}: {key} tidak sama dengan meta")

        # Guard 16
        if str(r.get("verdict")) == "PASS" and "EVIDENCE_MISSING" in str(r.get("evidence", "")):
            problems.append(f"{k}: EVIDENCE_MISSING counted as PASS")

        if r.get("method") == "behavioral" and str(r.get("verdict")) == "PASS":
            t_path = r.get("transcript")
            case_data = next((c for c in cases if c["id"] == k), None)
            if case_data is None:
                problems.append(f"{k}: case definition missing")
                continue
            problems.extend(validate_transcript(k, r, case_data, ROOT / t_path if isinstance(t_path, str) else Path(t_path or "")))
            continue

    if str(meta.get("confirmed_by_boss")).lower() != "false":
        problems.append("meta: confirmed_by_boss must be false without Boss auth")

    if problems:
        print("REPORT INVALID:")
        for p in problems:
            print("  -", p)
        return 1

    beh = {k: r for k, r in rows.items() if r.get("method") == "behavioral"}
    fails = sorted(k for k, r in beh.items() if r["verdict"] == "FAIL")
    skips = sorted(k for k, r in beh.items()
                   if str(r["verdict"]).startswith("SKIPPED"))
    passed = sorted(k for k, r in beh.items() if r["verdict"] == "PASS")
    ungraded = sorted(k for k, r in rows.items() if r.get("method") != "behavioral")

    print("BEHAVIORAL VERDICT (graded from transcripts - the only real one)\\n")
    line = f"  {len(passed)}/{len(ids)} PASS"
    if fails:
        line += f", {len(fails)} FAIL: {', '.join(fails)}"
    if skips:
        line += f", {len(skips)} SKIPPED: {', '.join(skips)}"
    print(line)
    print(f"  graded: {len(beh)} of {len(ids)} cases")
    if ungraded:
        by_id = {c["id"]: c for c in cases}
        green = [k for k in ungraded if eval_static(by_id[k])[0]]
        red = [k for k in ungraded if k not in green]
        print(f"\\n  NOT GRADED BEHAVIORALLY ({len(ungraded)}): {', '.join(ungraded)}")
        if green:
            print(f"    static GREEN, never run ({len(green)}): {', '.join(green)}")
            print("    The words exist in the files. That is not a PASS.")
        if red:
            print(f"    static RED ({len(red)}): {', '.join(red)}")
            print("    STRUCTURALLY IMPOSSIBLE: the skill lacks the artifacts these")
            print("    cases need. They cannot pass on any harness, by any model.")
        print("  All of the above block release claims for their group (evals/rubric.md).")
    if meta.get("confirmed_by_boss") is False:
        print(f"\\n  grader: {meta.get('grader', 'unknown')}")
        print("  confirmed_by_boss: FALSE - self-graded. Stronger than a grep,")
        print("  weaker than a human. Release claims need human confirmation.")
    return 1 if fails or skips or ungraded else 0


def main():
    ap = argparse.ArgumentParser()
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--static", action="store_true")
    mode.add_argument("--report", metavar="RESULTS_YAML")
    args = ap.parse_args()
    if args.check:
        sys.exit(cmd_check())
    if args.static:
        sys.exit(cmd_static())
    sys.exit(cmd_report(args.report))


if __name__ == "__main__":
    main()
