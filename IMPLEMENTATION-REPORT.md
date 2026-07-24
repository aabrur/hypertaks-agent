# Hypertaks v4.5.0 Implementation Report

**Date:** 2026-07-25
**Release channel:** Release Candidate
**Base commit:** `b45cc6b9c686c30615b971f880c532b1ed48e80b`
**Candidate branch:** `feat/v450-founder-brain-continuity-remediated`
**Pull request:** #12
**External publication:** Source branch and pull request only; no tag, package,
deployment, or marketplace submission

## Executive summary

Hypertaks v4.5.0 adds a secure Founder Brain and Continuity System while
preserving Hypertaks as a Founder Operating System. The release gives users a
portable way to reuse a main brain, preserve verified founder decisions, ask
structural code questions through optional Graphify capabilities, continue work
across sessions and agents, and require evidence before declaring work done.

The implementation replaces the rejected v4.5.0 candidate behavior rather than
trusting its implementation claims. The remediation directly addresses the
independent audit's critical findings: path escape, fabricated Boss approval,
unverified repository facts, secret persistence, Graphify false success,
unsafe external targets, caller-supplied completion assertions, invalid evals,
and incomplete public command registration.

## Delivered public surface

Exactly five public skill entry points are present:

1. `skills/hypertaks`
2. `skills/hypertaks-verify`
3. `skills/hypertaks-brain`
4. `skills/hypertaks-graph`
5. `skills/hypertaks-continuity`

`scripts/validate_public_skills.py` rejects a missing, duplicate, misplaced, or
sixth public Hypertaks skill.

## Delivered runtime

### Approved-root storage

`runtime/founder-brain.ts` provides one canonical path-containment boundary for
pointers, memory, checkpoints, and output files. It rejects absolute paths,
traversal, invalid record identifiers, control characters, reserved names, and
symlink escapes. Writes use same-directory temporary files and rename-based
atomic replacement.

### Authority-bound memory

Memory records carry explicit scope, status, evidence, repository identity, and
creator metadata. Repository facts become verified only after matching the
active repository, branch, commit, tracked file, and content hash.

Shared Boss decisions require an opaque approval proof minted from an active T1
contract activation. Ordinary callers cannot construct a valid proof by
supplying fields that say `BossTurn`, `APPROVED`, or `VERIFIED`.

### Secret protection

The runtime scans complete serialized artifacts before persistence. It blocks
common API key, token, private-key, password, and credential-bearing connection
patterns. Cross-agent handoffs redact secret-like values rather than copying
raw secrets.

### Verification and user-owned storage

The verification engine separates scanning, preview, approval, and application.
It supports project-local storage, explicit external folders, an approved
Obsidian Vault, a separate local Git location, a verified MCP memory
capability, or session-only memory.

Existing brains remain user-owned. The focused verification skill instructs
agents to reuse the existing structure and create only the minimum pointer
metadata after approval. Obsidian Vault validation requires the approved root
and never authorizes modification of `.obsidian/`.

### Graphify routing

Graphify remains optional and lower-authority evidence. The runtime supports a
verified host executor, a shared HTTPS MCP route with authentication and T1
approval, a verified local command, or direct repository search.

The router does not hardcode availability. Missing graph source metadata is
`UNVERIFIED`, mismatched branch or commit metadata is `STALE`, and no Graphify
route reports success without a real execution result.

### Continuity and proof of done

Checkpoints record actual Git repository identity, branch, commit, changed
files, objective, contract, completed work, pending work, blockers, next action,
permissions, test evidence, and acceptance criteria.

Resume reads Git state internally and rejects repository, branch, or commit
mismatches. Proof of done derives its verdict from current test and acceptance
evidence, pending work, and blockers. It can and does return `NOT_DONE`.

### Existing router hardening

`runtime/router.ts` also closes earlier v4.4 issues:

- external systems fail closed unless explicitly allowed;
- mutating operations require approval even when capability metadata is wrong;
- negated advisory approval is rejected;
- numeric precision takes precedence over creative image routing.

## Evaluation and test coverage

EV-66 through EV-88 cover:

- existing main-brain reuse;
- custom-layout preservation;
- approval before configuration writes;
- agent-name and path traversal rejection;
- private and shared memory separation;
- project-local and Obsidian destinations;
- Graphify fallback and authority boundaries;
- shared HTTPS requirements;
- unverified and inferred memory behavior;
- secret blocking;
- repository and branch staleness;
- Boss decision promotion;
- Nano proportionality;
- checkpoint, resume, handoff, and proof of done;
- memory conflict disclosure;
- compatibility with the v4.4 runtime.

The runtime test suite includes direct adversarial probes for path escape,
fabricated approval, missing evidence, secret persistence, Graphify false
success, stale evidence, checkpoint mismatch, and unsupported completion.

## Validation matrix

The final candidate must pass the exact GitHub Actions workflow on its final
commit:

```text
python3 scripts/validate_skill.py
python3 scripts/validate_public_skills.py
python3 scripts/run_evals.py --check
python3 scripts/run_evals.py --static
python3 -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v
python3 scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output <report>
python3 scripts/plot_retrieval_eval.py <report> <output-base>
npm test
python3 -m compileall scripts
git diff --check origin/main...HEAD
```

At the time this report is written, earlier candidate workflow runs proved the
skill validator, exact-five validator, eval integrity, 88/88 static
preconditions, evaluator unit tests, retrieval utilities, TypeScript runtime,
and Python compilation. A workflow configuration issue in the shallow checkout
caused the pull request diff command to fail; the workflow was corrected to use
a full checkout and compare `origin/main...HEAD`. The final merge decision must
use the newest workflow run, not an earlier partial result.

## Product boundaries

The release intentionally excludes:

- a bundled vector database, embedding model, or reranker;
- a bundled Graphify server or Obsidian application plugin;
- credentials or secret values;
- mandatory external memory;
- automatic indexing of user data;
- a background daemon;
- silent installation or server exposure;
- automatic remote upload;
- tag, package publication, deployment, or marketplace submission.

## Known limitations

- Obsidian integration is an approved Vault filesystem destination, not
  application-level integration.
- Real Graphify behavior depends on a capability verified in the active host;
  automated tests use runtime executors and direct-search fallback rather than
  claiming universal cross-host support.
- EV-50 through EV-88 do not yet have fresh independent cold-session behavioral
  transcripts for the v4.5.0 candidate.
- Behavioral certification remains pending after merge.

## Final implementation status

**IMPLEMENTATION COMPLETE, FINAL CI REQUIRED**

The candidate becomes merge-ready as a release candidate only when the complete
GitHub Actions workflow passes on the exact final head commit. Stable behavioral
certification remains a separate evidence-producing work item.
