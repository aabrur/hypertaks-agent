# CHECKPOINT - Hypertaks v4.3.0

Date: 2026-07-16
Working branch: `founder-operating-system`
Target branch: `origin/main`
Certified commit: `bf989f4d425c3801136c20f09a1111af8e5c1e47`

This checkpoint records the v4.3.0 Founder Operating System, Capability
Relevance Router, and Boss-confirmed behavioral certification status. Static
and behavioral results remain separate evidence classes.

## Release scope

1. Add the deterministic Need, Discover, Normalize, Filter, Bind, Verify, and
   Fallback router for host skills, native tools, MCP tools, and connectors.
2. Wire relevance decisions into Phases 0 through 5, the CORE profile, task
   contract, state capsule, agent brief, deliverable, and install guidance.
3. Preserve deterministic tier selection, Nano and Lite proportionality,
   zero-agent execution, conditional reference loading, and production budgets.
4. Maintain 49 behavioral case definitions across nine declared groups.
5. Synchronize every live plugin and package record on `4.3.0`.
6. Define safe update discovery without background or unapproved code changes.

## Certification status

**BEHAVIORALLY CERTIFIED** under the repository release gate.

| Evidence | Final repository record |
|---|---:|
| Total EV cases | 49 |
| Behavioral PASS | 43 |
| Documented non-PASS | 6 |
| Static GREEN | 49/49 |
| Release threshold | 24 Behavioral PASS |
| Threshold margin | +19 |
| `confirmed_by_boss` | `true` |

The six non-PASS cases are EV-01 through EV-05 and EV-20. They remain
explicitly documented and are not counted as PASS. The final per-case verdicts
validated by the main agent and confirmed by the Boss are canonical. Spawned
agent output, generated summaries, temporary fragments, and intermediate grader
drafts do not override that final verdict.

"Behaviorally Certified" is a project release-gate status. It is not formal
third-party certification and does not claim absolute security or guaranteed
outcomes.

## Evidence preservation

- Raw transcripts under `evals/transcripts/` remain unchanged.
- The pre-certification `evals/results.yaml` is preserved byte-for-byte at
  `evals/archive/results-pre-certification-2026-07-16.yaml`.
- The ten cited EV source reports are preserved byte-for-byte in the hashed
  `evals/archive/final-ev-source-reports-2026-07-16.zip` archive.
- Historical audit reports remain unchanged.
- Canonical certification metadata now lives in `evals/results.yaml`.

## Structural state

- The main skill remains below 500 lines and defines the canonical six phases.
- The canonical router lives in `references/plugins-and-mcp.md`; the main and
  CORE skills carry only the proportional execution summary.
- Capability requirements and bindings use consistent names across the intake
  protocol, state capsule, contract schema, and agent brief.
- Live version synchronization covers `package.json`, the cross-agent catalog,
  Claude, Codex, Cursor, Kimi, and both Claude marketplace version records.
- The repository contains 49 eval definitions, 12 domain packs, 20 specialist
  roles, and four generated figures.
- No MCP server, background updater, credential, cache, bundle, temporary clone,
  or local agent state is included.

## Verification commands

Final verification must run all of the following after the documentation and
figures are updated:

- `python scripts/validate_skill.py`
- `python scripts/run_evals.py --check`
- `python scripts/run_evals.py --static`
- `python scripts/run_evals.py --report evals/results.yaml`
- `python -m unittest scripts.test_run_evals -v`
- `python -m compileall scripts`
- `python scripts/generate_figures.py`
- `git diff --check`

## Verification results

| Check | Result |
|---|---|
| `python scripts/validate_skill.py` | exit 0, version 4.3.0 |
| `python scripts/run_evals.py --check` | exit 0, 49 case definitions OK |
| `python scripts/run_evals.py --static` | exit 0, 49/49 GREEN |
| `python scripts/run_evals.py --report evals/results.yaml` | exit 0, 43/49 PASS, 6 documented non-PASS, gate passed |
| `python -m unittest scripts.test_run_evals -v` | exit 0, 18 tests OK |
| `python -m compileall scripts` | exit 0 |
| `python scripts/generate_figures.py` | exit 0, four figures regenerated |
| `git diff --check` | exit 0 |

## Claims deliberately not made

- The project does not claim 49/49 behavioral PASS.
- Static GREEN is not described as behavioral PASS.
- The six documented non-PASS cases are not hidden or upgraded.
- The project does not claim formal third-party certification.
- The project does not claim absolute security or guaranteed outcomes.
