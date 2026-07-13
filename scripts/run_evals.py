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
VERDICTS = {"PASS", "FAIL", "SKIPPED"}


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


def cmd_report(results_path):
    """The real verdict - and the one place static and behavioral must NEVER mix.

    A static GREEN proves the words are on disk. It is not a PASS. This function
    refuses to count one as the other: only `method: behavioral` rows can carry a
    PASS, and the headline number is behavioral-only. Anything else is reported
    separately, as ungraded.
    """
    cases, errors = load_cases()
    if errors:
        print("fix the case files first (--check)", file=sys.stderr)
        return 2
    doc = yaml.safe_load(Path(results_path).read_text(encoding="utf-8")) or {}
    meta = doc.get("meta", {})
    results = doc.get("results", doc)  # tolerate the old flat shape
    ids = {c["id"] for c in cases}

    def row(v):
        return v if isinstance(v, dict) else {"verdict": v, "method": "unknown"}

    rows = {k: row(v) for k, v in results.items() if k != "meta"}

    problems = [f"unknown case id in results: {k}" for k in rows if k not in ids]
    missing = sorted(ids - set(rows))
    if missing:
        problems.append(f"cases with no recorded result: {', '.join(missing)}")
    for k, r in rows.items():
        if str(r.get("verdict")).split("(")[0] not in VERDICTS:
            problems.append(f"{k}: invalid verdict {r.get('verdict')!r}")
        if r.get("method") not in ("behavioral", "static", "unknown"):
            problems.append(f"{k}: invalid method {r.get('method')!r}")
        # The load-bearing rule of this whole suite.
        if r.get("method") == "static" and str(r.get("verdict")).startswith("PASS"):
            problems.append(
                f"{k}: a static check may NEVER be recorded as PASS. Static proves "
                f"the words exist in the files; it says nothing about conduct.")
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

    print("BEHAVIORAL VERDICT (graded from transcripts - the only real one)\n")
    line = f"  {len(passed)}/{len(ids)} PASS"
    if fails:
        line += f", {len(fails)} FAIL: {', '.join(fails)}"
    if skips:
        line += f", {len(skips)} SKIPPED: {', '.join(skips)}"
    print(line)
    print(f"  graded: {len(beh)} of {len(ids)} cases")
    if ungraded:
        print(f"\n  NOT GRADED BEHAVIORALLY ({len(ungraded)}): {', '.join(ungraded)}")
        print("  These carry a static GREEN and nothing else. A static GREEN is not")
        print("  a PASS. They block release claims for their group (evals/rubric.md).")
    if meta.get("confirmed_by_boss") is False:
        print(f"\n  grader: {meta.get('grader', 'unknown')}")
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
