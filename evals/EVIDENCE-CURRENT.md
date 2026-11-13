# Hypertaks evaluation evidence (current checkout)

- **Date (local):** 2026-11-13
- **Working tree:** local uncommitted changes may exist; see `git status`.
- **Authority:** repository eval rules in `evals/README.md` and `evals/rubric.md`.

## Hard rule (do not collapse layers)

| Layer | Command | Verdict words | Counts as behavior? |
|---|---|---|---|
| Structure | `python scripts/run_evals.py --check` | OK / INVALID | No |
| Static capability | `python scripts/run_evals.py --static` | GREEN / RED | **No** |
| Behavioral ledger | `python scripts/run_evals.py --report evals/results.yaml` | PASS / FAIL / SKIPPED | Yes |
| Automated runtime | `npm run typecheck`, `build:runtime`, `test:runtime`, `test:mcp` | pass/fail | Engineering evidence only |

A GREEN static line is never a behavioral PASS.

## Fresh verification (this session)

### 1) Eval structure

```text
python scripts/run_evals.py --check
# 90 eval cases OK
# exit 0
```

### 2) Static preconditions

```text
python scripts/run_evals.py --static
# 90/90 GREEN
# exit 0
```

Meaning: the skill files contain the artifacts required for `EV-01` through `EV-90`
to be structurally possible (`EV-89` workspace bootstrap and `EV-90` 14-`*ctx.md`
context adaptability remain static-verified definitions added after the `EV-01..EV-88`
behavioral ledger).

### 3) Behavioral ledger (`evals/results.yaml`)

```text
python scripts/run_evals.py --report evals/results.yaml
# 88/88 PASS
# confirmed_by_boss: TRUE
# release threshold: 80
# threshold margin: +8
# documented non-PASS: 0
# release gate: PASSED
# exit 0
```

Ledger facts (Boss-confirmed 2026-09-20):

- `meta.version`: 4.5.0
- `meta.certification_status`: BEHAVIORALLY CERTIFIED
- `meta.confirmed_by_boss`: true
- `meta.case_ids`: EV-01 .. EV-88
- `meta.tested_commit`: `a1103c6cfba1513963ceea093d3f4bed6be52990`
- `meta.source_report_archive`: `archive/ev-01-88-source-reports-2026-09-20.zip`
- `meta.historical_results_archive`: `archive/results-pre-ev-50-88-2026-08-04.yaml`
- `meta.final_verdict_authority`: Boss-confirmed multi-host behavioral suite (EV-01-88 all PASS)
- Extension method: runtime-gated behavioral (natural Boss prompt + real `.build/runtime` gates + executed Python/Matplotlib artifacts + real planted security fixtures)

Host-named evidence:

| Host | Run folder | Report names |
|---|---|---|
| Kilo CLI | `evals/hosts/kilo-cli/runs/EV-01-05-20/` | `EV-01.md` .. `EV-05.md`, `EV-20.md` |
| Hermes | `evals/hosts/hermes/runs/EV-50-62/` | `Hermes-EV-50.md` .. `Hermes-EV-62.md` |
| Cline | `evals/hosts/cline/runs/EV-63-75/` | `Cline-EV-63.md` .. `Cline-EV-75.md` |
| Command Code | `evals/hosts/command-code/runs/EV-76-88/` | `Command-Code-EV-76.md` .. `Command-Code-EV-88.md` |
| Kilo validation | `evals/hosts/kilo-cli/runs/EV-50-88-validation/` | `VALIDATION.md` |

Documented non-PASS: 0 (All 88 cases pass with verified behavioral evidence).

### 4) Public skills

```text
python scripts/validate_public_skills.py
# Public Hypertaks skills OK (exactly five)
# exit 0
```

### 5) Runtime / MCP engineering evidence (current local code)

```text
npm run test:all           # 94/94 V2 + 12/12 MCP + 10/10 stress + 15/15 security + 16/16 integrity + 22/22 edge, exit 0
npm run check:distribution # 22/22 host compatibility, marketplace readiness, version sync, dry builds, exit 0
```

Runtime engineering coverage includes:
- `test:runtime`: `a2.3` EN/ID routing, cross-locale negation isolation, 14-`*ctx.md` POC gate enforcement
- `test:mcp`: generic adapter metadata, 3 MCP protocol versions, 4 read-only tools, `none`/`compact`/`full` diagnostics, A4 regression matrix, CORS/origin & payload fail-closed (`12/12` pass)
- `test:v2` (18 suites, `94/94` pass): vault bootstrap, `RepoIdentity`, deep scanner, local structural graph & incremental freshness, Orchestrator V2 DAG resume + `BLOCKED` propagation, Agency injection containment, 5-layer `context verify`, and REA stdio 5-step E2E (`EV-91` through `EV-112`)
- `test:stress` (`10/10`), `test:security` (`15/15`), `test:skill-integrity` (`16/16`), `test:edge` (`22/22`)

## What is NOT claimed

1. **Behavioral scope of `results.yaml` is `EV-01` through `EV-88`.** `EV-89` and
   `EV-90` have static `GREEN` preconditions (`90/90 GREEN`) rather than behavioral
   transcript rows in `evals/results.yaml`, and `EV-91` through `EV-112` are
   automated engineering runtime tests (`npm run test:v2`).
2. **Not third-party certification.** "BEHAVIORALLY CERTIFIED" is the repository
   release-gate status for the Boss-confirmed `EV-01`..`EV-88` multi-host ledger
   in `evals/results.yaml` and does not imply external audit or universal correctness.
3. **Not external host PASS** for untested SaaS/web surfaces (ChatGPT, Claude.ai,
   Gemini App) from local protocol checks alone; inspect `evals/cross-host/results.json`
   for exact per-host evidence classification.

## Boss confirmation

The current `evals/results.yaml` records `confirmed_by_boss: true` across
`meta.case_ids` `EV-01` through `EV-88` (`88/88 PASS`, threshold `80`, margin `+8`).

Promoting new behavioral cases (such as `EV-89`, `EV-90`, or live SaaS host runs)
into `evals/results.yaml` requires:

1. Real behavioral runs (or main-agent review of final per-case source reports)
2. Hashed source-report archive under `evals/archive/`
3. Provenance (`tested_commit`, `tested_tree`, `skill_root_hash`) for that commit
4. Explicit Boss confirmation after review

Fabricating PASS rows without those steps is rejected by policy and by
`scripts/run_evals.py` integrity checks.

## How to re-verify on GitHub CI / clone

```bash
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python scripts/run_evals.py --report evals/results.yaml
python scripts/validate_public_skills.py
npm run test:all
npm run check:distribution
```

All commands above return exit 0 on the verified `v0.0.4.5.13` checkout.
