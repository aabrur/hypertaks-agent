# Hypertaks v4.2.0 update blueprint

## 1. Objective

Hypertaks v4.2.0 adds a security kernel, deterministic runtime rules, and
quantitative domain packs without changing the core founder workflow. The
canonical runtime remains six phases, Phase 0 through Phase 5.

The release favors observable evidence over broad claims:

- authority is bound to source;
- permissions are explicit;
- external effects use transaction semantics;
- tiers come from a printed seven-factor score;
- missing quantitative inputs stop computation;
- saved behavioral verdicts count only when their provenance is valid.

## 2. Repository architecture

```text
skills/hypertaks/
├── SKILL.md
├── SKILL-core.md
├── references/
│   ├── 00-security-kernel.md
│   ├── 01-state-and-transactions.md
│   ├── intake-protocol.md
│   ├── agent-roles.md
│   ├── frameworks.md
│   ├── engineering.md
│   ├── token-discipline.md
│   ├── plugins-and-mcp.md
│   ├── superpowers-map.md
│   ├── knowledge-base.md
│   └── domains/INDEX.md + D1–D12
└── assets/
    ├── agent-brief-template.md
    ├── deliverable-template.md
    └── contract-schema.yaml

evals/
├── cases/EV-01.yaml … EV-38.yaml
├── transcripts/EV-01.jsonl … EV-38.jsonl
├── README.md
├── rubric.md
└── results.yaml

scripts/
├── validate_skill.py
├── run_evals.py
├── test_run_evals.py
└── generate_figures.py
```

## 3. Runtime contract

### Phase 0 — Intake and verify

Read the security kernel, scan capabilities, score the task, size the gate,
state explicit permissions, and bind an approved task contract.

### Phase 1 — Frame

Restate the objective, task shape, tier, scope, and success check.

### Phase 2 — Pick roles

Use the tier's exact agent count. Prime is four specialists plus one
Founder/Integrator. Hyper scales by splitting real workstreams, never padding.

### Phase 3 — Equip

Bind installed tools by function category, select frameworks with required
output shapes, and route domain work through `references/domains/INDEX.md`.

### Phase 4 — Produce

Run dependency-declared waves in orchestrated mode or produce the same role
outputs sequentially in synthesized mode. Subagents at `hypertaks_depth >= 1`
run executor mode and do not recurse.

### Phase 5 — Integrate and deliver

Reconcile outputs, attach verification evidence, state unresolved risks, and
close with the compliance footer and work log.

## 4. Deterministic tier allocation

| Tier | Agents | Gate |
|---|---:|---|
| Nano | 0 | zero-sized |
| Lite | 1 | Express |
| Standard | 3 | Express |
| Prime | 5 | Deep |
| Hyper | 6–10+ | Deep |
| Omega | 10+ | Deep plus Boss check-ins |

The tier score uses domain count, deliverable count, reversibility, external
side effects, ambiguity, dependency depth, and evidence requirements.

## 5. Quantitative expansion

The repository contains 12 routed domain packs:

1. quantitative core;
2. economics;
3. data tools;
4. research methods;
5. logistics and supply chain;
6. operations and quality;
7. trade and customs;
8. business and finance;
9. software engineering;
10. design and UX;
11. engineering economy and reliability;
12. soft skills and management.

Every computation requires sourced inputs, units, formula, substitution, result,
and assumptions. Missing inputs are returned as `DATA UNAVAILABLE`. Volatile
rates are not recalled from memory.

## 6. Eval and provenance policy

- `--check` validates case structure.
- `--static` checks whether required capability text exists.
- `--report` evaluates saved behavioral evidence and provenance.
- Static GREEN never counts as behavioral PASS.
- Skipped cases never count as PASS.
- The v4.2.0 release threshold is 24 provenance-valid behavioral PASS cases.
- `confirmed_by_boss` remains false until the Boss explicitly confirms a case.

The JSONL parser uses `splitlines()` so LF and CRLF records are handled as
records rather than searched for the literal characters `\\n`.

## 7. Release evidence matrix

| Criterion | Current state | Evidence class |
|---|---|---|
| Security kernel present | `references/00-security-kernel.md` | VERIFIED on disk |
| State and transaction protocol present | `references/01-state-and-transactions.md` | VERIFIED on disk |
| Six phase headings present | Phase 0–5 in `SKILL.md` | VERIFIED on disk |
| Domain packs routed | 12 packs plus `domains/INDEX.md` | VERIFIED on disk |
| Specialist role pool | 20 roles in `agent-roles.md` | VERIFIED on disk |
| CORE profile | 40 lines | VERIFIED on disk |
| Eval inventory | 38 cases in seven declared groups | VERIFIED on disk |
| Saved behavioral verdicts | 26 PASS, 12 SKIPPED(harness) | VERIFIED as saved records |
| Complete historical PASS records | 14, EV-25–EV-38 | VERIFIED from saved JSONL fields; not current-HEAD evidence |
| Current-HEAD provenance-valid PASS | 0; canonical `--report` is invalid | VERIFIED from report exit 1 |
| 24-EV release threshold | Not met; fresh provenance-valid evidence is required | VERIFIED release boundary |
| Boss confirmation | false for metadata and all 38 rows | VERIFIED on disk |

## 8. Finalization scope

The finalization commit may integrate the current code and documentation after
the requested smoke checks pass. It must not claim that the 24-EV behavioral
threshold, human confirmation, or full behavioral coverage has been achieved.
No behavioral rerun, force-push, tag, or new audit is included.

## 9. Six-agent audit remediation boundary

The 2026-07-15 remediation validates the six audit reports against canonical
`origin/main`. Accepted changes are limited to evaluator provenance guards,
hash caching, regression tests, CI coverage, and documentation synchronization.
Historical PASS rows remain recorded but are not promoted: the current
`--report` result is invalid, skipped cases remain skipped, and
`confirmed_by_boss: false` remains unchanged. v4.2.0 is therefore described as
a structural release with partial behavioral evidence, not release-certified
behavior.
