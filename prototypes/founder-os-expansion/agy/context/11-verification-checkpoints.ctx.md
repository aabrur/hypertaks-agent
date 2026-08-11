---
id: CTX-11-VERIFICATION-CHECKPOINTS
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/11-verification-checkpoints.ctx.md
  contract_id: HT-20260811-FOS
source_git_state:
  commit_sha: f6a02bda04438fc0a3b5d764f474a360651dd78e
  branch: main
  clean_tree: true
authority: 6
freshness: FRESH
status: ACTIVE
lifecycle_state: VERIFIED
---

# Verification Checkpoints Specification

This document defines checkpoint state schema, proof of done validation, and transaction reconciliation.

## Checkpoint Capsule Schema

A `WorkflowCheckpoint` must capture:
- `checkpoint_id`: Unique identifier (e.g. `CHK-[UUID]`).
- `contract_id`: Active contract reference.
- `step_index`: Execution step number.
- `completed_deliverables`: Array of verified file paths and hashes.
- `pending_tasks`: List of remaining tasks.
- `last_event_id`: Sequential event ID from the ledger.

## Proof of Done Criteria

Work cannot be marked complete without explicit command output, clean exit codes (code 0), and verified file existence within approved root boundaries.
