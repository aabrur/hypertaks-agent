# Hypertaks v4.4.0 Implementation Report

**Date:** 2026-07-22
**Release channel:** Release Candidate
**Scope status:** Complete and locked
**External publication:** Not performed

## Executive summary

Hypertaks v4.4.0 adds a deterministic retrieval intelligence layer, stricter
contract activation, targeted capability binding, professional Python and
TypeScript execution profiles, and a visual necessity router. The release keeps
Hypertaks portable: it does not bundle a vector database, embedding model, MCP
server, credentials, background service, or host-specific runtime.

The implementation preserves proportionality. Harmless Nano and Lite work does
not trigger capability discovery, corpus indexing, hybrid retrieval, visual
production, or update checks unless the approved task requires them.

## Delivered goals

1. Route exact, semantic, mixed, structured, small-corpus, and unavailable
   retrieval needs to the smallest sufficient method.
2. Support keyword, vector, hybrid, metadata filtering, exact-match boosting,
   fusion, reranking, evidence packs, and safe fallback without inventing a
   capability.
3. Bind native tools, skills, MCP tools, and connectors only after the task need
   is known and the capability is verified.
4. Capture the original request, desired outcome, proposed method, supplied
   evidence, missing data, process, destination, success criteria, permissions,
   retrieval plan, visual plan, and approval evidence in the contract.
5. Require the canonical `APPROVE <contract-id>` signature from a T1 Boss turn
   before build, mutation, publication, deployment, communication, or another
   external effect.
6. Provide runnable Python retrieval evaluation with Recall@k, HitRate@k, MRR,
   nDCG@k, ExactMatch@k, latency, and cost fields.
7. Provide deterministic Matplotlib export to PNG and SVG with artifact checks.
8. Provide a strict TypeScript runtime router with typed retrieval, visual,
   capability, and contract-activation decisions plus runtime tests.
9. Route tables, charts, diagrams, UI mockups, and generated images according to
   information structure and decision risk.
10. Expand structural evaluation from 49 to 65 cases while retaining the
    historical v4.3 behavioral ledger as historical evidence only.

## Architecture delivered

```text
Request and evidence intake
        |
        v
Contract framing and feasibility
        |
        +--> retrieval need and corpus boundary
        +--> visual necessity and medium
        +--> capability and permission need
        |
        v
Contract-ID activation gate
        |
        v
Retrieval Intelligence Router
Need -> Scope -> Route -> Retrieve -> Fuse -> Boost -> Rerank
     -> Evaluate -> Evidence Pack -> Fallback
        |
        v
Capability Relevance Router
Need -> Discover -> Normalize -> Filter -> Bind -> Verify -> Fallback
        |
        v
Professional execution profiles
Python | Matplotlib | TypeScript | UI/UX | Image generation
        |
        v
Verification, evidence reconciliation, and delivery
```

## Main implementation areas

### Retrieval and evidence

Added `skills/hypertaks/references/02-retrieval-and-evidence.md` as the canonical
retrieval policy. It distinguishes exact token retrieval from semantic search,
requires pre-ranking trust-boundary filters, defines hybrid fusion and
reranking rules, and prevents retrieval quality claims without measured data.

### Contract integrity

Updated the intake protocol, contract schema, state model, skill workflow,
agent brief, and deliverable template. Mutation and external-effect approval is
source-bound and contract-bound. Runtime activation rejects bare agreement,
negated signatures, embedded tool text, and approvals from non-Boss sources.

### Professional execution

Added `skills/hypertaks/references/03-professional-execution.md` with separate
profiles for Python, Matplotlib, TypeScript, UI/UX, and image generation. Each
profile defines when it applies, evidence requirements, validation, and
precision boundaries.

### Visual delivery

Added `skills/hypertaks/references/04-visual-delivery.md`. Visuals are classified
as required, recommended, optional, or not needed. Generated images are limited
to image-native creative work and cannot replace precise numerical charts,
tables, or technical topology.

### Runtime and evaluation utilities

Added:

- `runtime/router.ts`
- `runtime/router.test.cjs`
- `scripts/retrieval_eval.py`
- `scripts/plot_retrieval_eval.py`
- `scripts/test_retrieval_eval.py`
- `evals/fixtures/retrieval-sample.jsonl`
- EV-50 through EV-65

## Validation evidence

The release candidate passed:

```text
python scripts/validate_skill.py
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v
python scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl \
  --output /tmp/hypertaks-retrieval-report.json
python scripts/plot_retrieval_eval.py \
  /tmp/hypertaks-retrieval-report.json \
  /tmp/hypertaks-retrieval-quality
npm test
python -m compileall -q scripts
python scripts/generate_figures.py
git diff --check
python scripts/run_evals.py --report evals/results.yaml
```

Observed results:

- skill validator: PASS, version 4.4.0
- eval definition validation: PASS, 65 cases
- static preconditions: 65/65 GREEN
- Python unit tests: 24/24 PASS
- retrieval report generation: PASS
- Matplotlib PNG and SVG generation: PASS
- TypeScript strict type-check: PASS
- TypeScript production build: PASS
- TypeScript runtime tests: PASS
- Python compilation: PASS
- repository figure generation: PASS
- whitespace and patch integrity: PASS
- historical v4.3 behavioral report: 43/49 PASS, 6 documented harness skips

## Scope controls

The release intentionally does not include:

- a bundled vector database;
- an embedding or reranking model;
- a bundled MCP server;
- connector credentials;
- automatic indexing of user data;
- background updates;
- silent code replacement;
- publication or deployment actions.

These exclusions preserve security, host portability, token discipline, and
reproducibility.

## Known limitation

EV-50 through EV-65 are structurally GREEN and supported by local unit and
runtime tests, but they have not yet received independent cold-session
behavioral transcripts. Hypertaks v4.4.0 must therefore not be labeled
`BEHAVIORALLY CERTIFIED` until that evidence exists.

## Final implementation status

**IMPLEMENTATION COMPLETE**

The repository is suitable for packaging as Hypertaks v4.4.0 Release Candidate.
Stable behavioral certification remains a separate evidence-producing work
item, not an assumption.
