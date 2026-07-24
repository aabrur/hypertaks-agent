# Hypertaks 4.5.0 Release Candidate Checkpoint

Date: 2026-07-25
Branch: `feat/v450-founder-brain-continuity-remediated`
Base commit: `b45cc6b9c686c30615b971f880c532b1ed48e80b`
Parent release line: Founder Operating System 4.4.0

## Objective

Strengthen Hypertaks as a Founder Operating System that can preserve verified
founder context, reuse a user-owned main brain, route optional graph
intelligence, continue work across sessions and agents, and reject unsupported
completion claims.

## Scope

1. Expose exactly five public Hypertaks skills.
2. Add environment and brain verification with preview-before-write approval.
3. Add evidence-backed agent-private, project, and shared memory.
4. Enforce approved-root path containment, atomic writes, runtime validation,
   and full-artifact secret scanning.
5. Bind shared Boss decisions to an opaque approval proof.
6. Verify repository facts against repository, branch, commit, tracked path, and
   content hash.
7. Add optional Graphify routing with secure modes and real direct-search
   fallback.
8. Add optional Obsidian Vault destination validation without touching
   `.obsidian/`.
9. Add Git-aware checkpoint, resume, handoff, reconciliation, and proof of done.
10. Expand the eval inventory from 65 to 88 definitions.
11. Synchronize live package and plugin records on 4.5.0.
12. Preserve retrieval, capability, visual, contract, updater, and Founder
    behavior from 4.4.0.

## Five public skills

- `/hypertaks`
- `/hypertaks-verify`
- `/hypertaks-brain`
- `/hypertaks-graph`
- `/hypertaks-continuity`

No sixth public skill whose name begins with `hypertaks` is permitted.

## Product boundary

The plugin remains portable and file-based. It contains no bundled vector
database, embedding model, reranker, Graphify server, Obsidian application,
credential, hosted memory service, or resident daemon. Graphify, Obsidian, MCP,
and persistent memory remain optional.

Memory and graph output are evidence below active system policy, active Boss
decisions, workspace standards, approved contracts, and current repository
evidence. They cannot approve actions or grant permission.

## Current implementation evidence

The candidate branch contains:

- secure founder-continuity runtime in `runtime/founder-brain.ts`;
- hardened capability, visual, and contract routing in `runtime/router.ts`;
- adversarial runtime coverage in `runtime/router.test.cjs`;
- exact-five public skill validation;
- EV-66 through EV-88 tied to runtime and public-skill behavior;
- synchronized 4.5.0 manifests and release documentation;
- GitHub Actions validation for skills, evals, Python, TypeScript, retrieval
  artifacts, and pull request diff formatting.

## Release evidence boundary

The Boss-confirmed 4.3.0 ledger remains historical evidence for its exact
certified commit. It is not behavioral certification for 4.5.0. EV-50 through
EV-88 require fresh independent behavioral runs for their changed and new
behavior.

Allowed release statuses:

- `STABLE RELEASE READY` only after required independent behavioral evidence is
  current and provenance-preserved.
- `MERGE READY AS RELEASE CANDIDATE` after the final GitHub Actions validation
  passes on the exact candidate commit.
- `REMEDIATION REQUIRED` while any required CI or adversarial check fails.

## Required validation matrix

- `python scripts/validate_skill.py`
- `python scripts/validate_public_skills.py`
- `python scripts/run_evals.py --check`
- `python scripts/run_evals.py --static`
- `python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v`
- `python scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output <report>`
- `python scripts/plot_retrieval_eval.py <report> <output-base>`
- `npm test`
- `python -m compileall scripts`
- `git diff --check origin/main...HEAD`

## Claims deliberately not made

- 88/88 behavioral PASS.
- Behaviorally Certified for 4.5.0.
- Real Graphify integration when only a mock or fallback ran.
- Obsidian application integration when only an approved Vault filesystem is
  used.
- Universal availability of Graphify, Obsidian, MCP, or persistent memory.
- Guaranteed security or outcomes.
- Tag, package publication, deployment, or marketplace submission.
