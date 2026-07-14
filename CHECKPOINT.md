# CHECKPOINT — Hypertaks v4.2.0 finalization

Date: 2026-07-15
Working branch: `main`

This checkpoint records the current repository state without treating static
checks, saved verdicts, or model grading as stronger evidence than they are.

## Remediation scope

1. **Evaluator integrity** — enforce current-HEAD, row/meta commit-tree-hash
   consistency; reject placeholders and non-independent graders; cache skill
   root hashes; retain focused regression coverage.
2. **CI and documentation** — run validator, case check, static check, unit
   tests, and compileall in CI; synchronize release wording with the invalid
   legacy report.
3. **Verification and integration** — run the required checks, commit one
   remediation work item, and push `origin/main` without a force-push or tag.

No 38-case behavioral rerun is part of this scope. No tag, force-push, or new
audit is authorized.

## Behavioral evidence boundary

| Evidence | Current repository record |
|---|---:|
| Eval case definitions | 38 |
| Saved result verdicts | 26 PASS, 12 SKIPPED(harness), 0 recorded FAIL |
| Historical PASS transcripts with complete cold-session, tool, hash, raw-response, and independent-grader fields | 14 (EV-25–EV-38) |
| Release threshold | 24 provenance-valid behavioral PASS |
| `confirmed_by_boss` | `false` in metadata and all 38 result rows |

The `--report` command currently exits 1, so the current-release
provenance-valid PASS count is **0**. The 14 complete historical rows are not
promoted across the current-HEAD boundary. The remaining saved PASS verdicts
are not promoted by a static check. `confirmed_by_boss` remains unchanged.

## Structural state

- The skill defines six phases, Phase 0 through Phase 5.
- The repository contains 12 domain packs, 20 specialist roles, 38 eval case
  definitions, 38 saved transcript files, and a 40-line CORE profile.
- All versioned plugin manifests and `package.json` declare `4.2.0`.
- Figure data and generation logic live in `scripts/generate_figures.py`.

## Claims deliberately not made

- No claim that all 38 cases passed behaviorally.
- No claim that skipped cases passed.
- No claim that the behavioral release threshold is met.
- No claim that repository history is secret-free or that runtime coverage is
  complete; those require evidence outside this scope.

## Verification gate

Before commit, run and record fresh exit-zero results for:

```text
python scripts/validate_skill.py
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python -m compileall scripts
git diff --check
```

The focused parser/provenance unit tests are also run separately. Behavioral
`--report` is diagnostic for this legacy bundle; its non-zero result is
recorded and does not block structural CI because no behavioral rerun occurred.

### Fresh results on 2026-07-15

| Check | Result |
|---|---|
| `python scripts/validate_skill.py` | exit 0 — `Skill validation OK (version 4.2.0)` |
| `python scripts/run_evals.py --check` | exit 0 — 38 case definitions OK |
| `python scripts/run_evals.py --static` | exit 0 — 38/38 GREEN; not behavioral PASS |
| `python -m compileall scripts` | exit 0 |
| `git diff --check` | exit 0 |
| `python -m unittest scripts.test_run_evals -v` | exit 0 — 7 tests OK |
