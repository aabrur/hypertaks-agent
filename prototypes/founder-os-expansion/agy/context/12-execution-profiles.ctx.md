---
id: CTX-12-EXECUTION-PROFILES
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/12-execution-profiles.ctx.md
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

# Execution Profiles Specification

This document defines execution tier constraints and agent allocation profiles.

## Tier Allocation Table

- `Nano`: Zero-sized gate, 1 model response, 0 subagents.
- `Lite`: Sized intake gate, 1 specialist agent, minimal context scope.
- `Standard`: 3 specialist agents, standard context budget, full evidence validation.
- `Prime`: 5 specialist agents, deep context compilation, comprehensive red-team audit.
- `Hyper`: 6 to 10+ specialist agents, full multi-perspective execution.

## Execution Constraints

All executions operating under `hypertaks_depth >= 1` enter EXECUTOR MODE. Subagent creation and contract tier adjustments are forbidden without T1 Boss authorization.
