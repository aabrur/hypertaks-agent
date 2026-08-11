---
id: CTX-10-FOUNDER-BRAIN-STATE
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/10-founder-brain-state.ctx.md
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

# Founder Brain State Specification

This document defines memory integration rules for founder memory and evidence persistence.

## Memory Lifecycle States

1. `STATE_CANDIDATE`: Unverified observation awaiting evidence binding.
2. `STATE_VERIFIED`: Evidence-backed finding bound to T0-T4 evidence.
3. `STATE_PROMOTED`: Active core memory used in context compilation.
4. `STATE_DEMOTED`: Stale or contradicted memory node retained in history.
5. `STATE_RETIRED`: Archived node no longer actively loaded into prompt context.

## Memory Integration Rules

- External memory tools, Obsidian vaults, and Graphify graphs are optional integrations.
- Local repository context remains the canonical source of truth.
