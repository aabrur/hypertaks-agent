# CHECKPOINT - Hypertaks v4.3.0

Date: 2026-07-15
Working branch: `founder-operating-system`
Target branch: `origin/main`
Start commit: `d878d3166e870b7d5ffcd114c0213e2d3cbc75f3`

This checkpoint records the v4.3.0 Founder Operating System and Capability
Relevance Router update. Static checks, saved verdicts, and model grading are
not treated as stronger evidence than they are.

## Release scope

1. Add the deterministic Need, Discover, Normalize, Filter, Bind, Verify, and
   Fallback router for host skills, native tools, MCP tools, and connectors.
2. Wire relevance decisions into Phases 0 through 5, the CORE profile, task
   contract, state capsule, agent brief, deliverable, and install guidance.
3. Preserve deterministic tier selection, Nano and Lite proportionality,
   zero-agent execution, conditional reference loading, and production budgets.
4. Add EV-45 through EV-49 without creating behavioral transcripts or changing
   saved verdicts.
5. Synchronize every live plugin and package record on `4.3.0`.
6. Define safe update discovery without background or unapproved code changes.

## Behavioral evidence boundary

| Evidence | Current repository record |
|---|---:|
| Eval case definitions | 49 |
| Saved result verdicts | 26 PASS, 12 SKIPPED(harness), 0 recorded FAIL |
| Historical PASS transcripts with complete cold-session, tool, hash, raw-response, and independent-grader fields | 14 (EV-25 through EV-38) |
| Current-HEAD provenance-valid PASS | 0 |
| Release threshold | 24 provenance-valid behavioral PASS |
| `confirmed_by_boss` | `false` in metadata and all 38 saved result rows |

`python scripts/run_evals.py --report evals/results.yaml` exits 1. The saved
bundle has commit and tree mismatches, malformed or incomplete legacy
transcripts, self-grading records, and no results for EV-39 through EV-49. No
behavioral rerun was performed, and no verdict was upgraded.

## Structural state

- The main skill remains below 500 lines and defines the canonical six phases.
- The canonical router lives in `references/plugins-and-mcp.md`; the main and
  CORE skills carry only the proportional execution summary.
- Capability requirements and bindings use consistent names across the intake
  protocol, state capsule, contract schema, and agent brief.
- Live version synchronization covers `package.json`, the cross-agent catalog,
  Claude, Codex, Cursor, Kimi, and both Claude marketplace version records.
- The repository contains 49 eval definitions, 38 saved transcripts, 12 domain
  packs, 20 specialist roles, and four generated figures.
- No MCP server, background updater, credential, cache, bundle, temporary clone,
  or local agent state is included.

## Language and punctuation

- Starting-commit U+2014 matches: 0.
- Current-tree U+2014 matches: 0.
- EV-33 test prose, the D7 customs reference, and the archived Hermes report
  were translated into professional English.
- EV-33's saved `raw_prompt` remains verbatim because changing historical raw
  evidence would fabricate a transcript.
- The validator's Indonesian word list is executable policy data, not prose.

## Verification results

| Check | Result |
|---|---|
| `python scripts/validate_skill.py` | exit 0, version 4.3.0 |
| `python scripts/run_evals.py --check` | exit 0, 49 case definitions OK |
| `python scripts/run_evals.py --static` | exit 0, 49/49 GREEN; not behavioral PASS |
| `python -m unittest scripts.test_run_evals -v` | exit 0, 9 tests OK |
| `python -m compileall scripts` | exit 0 |
| `python scripts/generate_figures.py` | exit 0 |
| Skill Creator `quick_validate.py` | exit 0 under UTF-8 mode |
| Plugin Creator `validate_plugin.py` | exit 0 under UTF-8 mode |
| `git diff --check` | exit 0 |
| Behavioral report | exit 1, legacy evidence invalid; no rerun claimed |

## Claims deliberately not made

- Static GREEN is not described as behavioral PASS.
- The 24-case behavioral release threshold is not described as met.
- No saved transcript, tool call, tool result, grader decision, or Boss
  confirmation was created or modified to improve a verdict.
- Host-native update discovery is not described as universal automatic update
  support.
