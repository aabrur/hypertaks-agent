# CHECKPOINT — Hypertaks v4.2.0 finalization

Date: 2026-07-14
Working branch: `v4-kernel`

This checkpoint records the current repository state without treating static
checks, saved verdicts, or model grading as stronger evidence than they are.

## Three-phase scope

1. **Minimal fix** — parse JSONL with `splitlines()`, remove empty test bodies,
   and retain a minimum parser/provenance regression set.
2. **Cleanup, documentation, and figures** — remove generated scratch output,
   strengthen `.gitignore`, correct release documents, and regenerate four
   factual figures from repository data.
3. **Verification and integration** — run the five requested smoke checks,
   create one release commit, merge into the synchronized `main`, and push
   `origin/main`.

No 38-case behavioral rerun is part of this scope. No tag, force-push, or new
audit is authorized.

## Behavioral evidence boundary

| Evidence | Current repository record |
|---|---:|
| Eval case definitions | 38 |
| Saved result verdicts | 26 PASS, 12 SKIPPED(harness), 0 recorded FAIL |
| PASS transcripts with complete cold-session, tool, hash, raw-response, and independent-grader fields | 14 (EV-25–EV-38) |
| Release threshold | 24 provenance-valid behavioral PASS |
| `confirmed_by_boss` | `false` in metadata and all 38 result rows |

The 24-EV behavioral threshold is **not met** by the provenance-valid subset.
The remaining saved PASS verdicts are not promoted to release evidence by a
static check. `confirmed_by_boss` remains unchanged.

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

## Phase 3 verification gate

Before commit, run and record fresh exit-zero results for:

```text
python scripts/validate_skill.py
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python -m compileall scripts
git diff --check
```

The focused parser/provenance unit test is also run separately. Behavioral
`--report` is intentionally excluded because it is not one of the authorized
smoke checks and would not repair invalid legacy provenance.

### Fresh results on 2026-07-14

| Check | Result |
|---|---|
| `python scripts/validate_skill.py` | exit 0 — `Skill validation OK (version 4.2.0)` |
| `python scripts/run_evals.py --check` | exit 0 — 38 case definitions OK |
| `python scripts/run_evals.py --static` | exit 0 — 38/38 GREEN; not behavioral PASS |
| `python -m compileall scripts` | exit 0 |
| `git diff --check` | exit 0 |
| `python -m unittest scripts.test_run_evals -v` | exit 0 — 3 tests OK |
