---
id: CTX-06-CONTRADICTION-LOG
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/06-contradiction-log.ctx.md
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

# Contradiction Log Specification

This document defines non-destructive contradiction retention rules.

## Contradiction Handling Principles

1. **No Destructive Overwrite**: When new evidence conflicts with an existing node or fact, the system must NOT delete or mutate the original record.
2. **Explicit Contradiction Entity**: Generate an `ENT_CONTRADICTION` node linking the target entities and recording both claims, evidence classes, and timestamps.
3. **Authority-Based Resolution**: Higher evidence authority (e.g. T1 Boss decision over T4 repository evidence) governs active query routing, but lower-authority evidence remains preserved in log history.
