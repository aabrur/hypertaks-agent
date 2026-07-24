---
name: hypertaks-continuity
description: "Create and resume verified project checkpoints, produce safe cross-agent handoffs, reconcile work with Git and acceptance criteria, and reject unsupported completion claims."
---

# Hypertaks Continuity

Use this skill for pausing, resuming, handing off, reconciling, or proving completion of a meaningful Hypertaks task.

Load `../hypertaks/references/00-security-kernel.md` first. Continuity artifacts preserve scope and evidence. They do not create new permission, approval, or authority.

## Public actions

- `checkpoint`: capture the active objective, contract, actual repository identity, branch, commit, changed files, completed work, pending work, blockers, next action, permissions, test evidence, and acceptance criteria.
- `resume`: read the checkpoint and compare it with actual Git state. Refuse silent continuation on a repository, branch, or commit mismatch.
- `handoff`: produce a compact cross-agent document without copying the raw transcript or secrets.
- `reconcile`: compare the approved contract, expected artifacts, working tree, tests, and open criteria.
- `status`: report active checkpoint state and stale evidence.
- `proof-of-done`: return `DONE` only when current evidence proves every required criterion. Otherwise return `NOT_DONE` with exact reasons.

## Checkpoint evidence

Read branch and commit from Git. Never default to `main`, `head`, wildcard values, or caller assertions. Test evidence records the command, exit code, timestamp, and tested commit. Acceptance criteria carry an identifier, status, and evidence locator.

A checkpoint with missing tests, stale test evidence, pending work, blockers, failed criteria, or a commit mismatch cannot pass proof of done.

## Storage safety

Write only inside an approved project or brain root. Validate checkpoint identifiers, use atomic writes, and scan the entire serialized artifact for secrets before persistence. Handoffs must redact secret-like values while preserving the existence of the redaction.

Do not checkpoint harmless Nano answers. Suggest a checkpoint at a meaningful pause, host session end, or handoff boundary when the configured policy allows it.

Return actual Git state, checkpoint ID, completed and open criteria, evidence status, exact next action, and the final `DONE` or `NOT_DONE` verdict.
