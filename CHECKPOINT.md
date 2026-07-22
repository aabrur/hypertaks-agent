# Hypertaks 4.4.0 Release Candidate Checkpoint

Date: 2026-07-22
Branch: `release/v4.4.0`
Parent release line: Founder Operating System 4.3.0

## Scope

1. Add a deterministic Retrieval Intelligence Router.
2. Tighten contract clarity and contract-ID activation for builds and effects.
3. Bind plugins, MCP tools, connectors, and native tools only after need is
   defined.
4. Add professional Python, Matplotlib, TypeScript, UI/UX, and image-generation
   execution profiles.
5. Add a Visual Necessity Router and source-based artifact validation.
6. Add runnable Python and TypeScript reference utilities.
7. Expand the eval inventory from 49 to 65 definitions.
8. Synchronize all live plugin and package records on 4.4.0.

## Product boundary

The plugin remains portable and file-based. It contains no bundled vector
database, embedding model, reranker, MCP server, credential, background daemon,
or silent updater. Optional host capabilities are selected by relevance and
permission.

## Release evidence boundary

The Boss-confirmed 4.3.0 ledger remains historical evidence for its exact
certified commit. It is not behavioral certification for 4.4.0. EV-50 through
EV-65 require fresh independent behavioral runs.

A publish decision may use one of these statuses:

- `READY TO PUBLISH` after every validation and fresh behavioral gate passes.
- `READY WITH DISCLOSED LIMITATIONS` when structural, unit, runtime, and artifact
  checks pass but behavioral re-certification remains pending.
- `NOT READY TO PUBLISH` when any required build or validation check fails.

## Required validation matrix

- `python scripts/validate_skill.py`
- `python scripts/run_evals.py --check`
- `python scripts/run_evals.py --static`
- `python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v`
- `python scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output <report>`
- `python scripts/plot_retrieval_eval.py <report> <output-base>`
- `npm test`
- `python -m compileall scripts`
- `python scripts/generate_figures.py`
- `git diff --check`

## Claims deliberately not made

- 65/65 behavioral PASS.
- Behaviorally Certified for 4.4.0.
- Universal superiority of hybrid retrieval.
- Universal optimal reranking or fusion parameters.
- Availability of any host tool not verified in the current session.
- Guaranteed security or outcomes.
