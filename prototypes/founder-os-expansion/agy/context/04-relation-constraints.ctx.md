---
id: CTX-04-RELATION-CONSTRAINTS
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/04-relation-constraints.ctx.md
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

# Relation Constraints Specification

This document defines allowed directed relations, cardinality limits, and acyclic dependency invariants.

## Relation Types

- `REL_AUTHORIZES`: Boss -> Contract (1 to Many)
- `REL_EXECUTES`: Specialist -> Task (1 to Many)
- `REL_PRODUCES`: Task -> Artifact (1 to Many)
- `REL_DEPENDS_ON`: Task -> Task (Directed Acyclic Graph enforced)
- `REL_VERIFIES`: Evidence -> Artifact (1 to Many)
- `REL_CONTRADICTS`: Entity -> Entity (Bidirectional relation linking opposing facts)
- `REL_SUPERSEDES`: Entity -> Entity (Acyclic relation marking replaced historical records)

## Acyclic Dependency Rule

Any relation loop in `REL_DEPENDS_ON` or `REL_SUPERSEDES` is strictly forbidden. The engine must run cycle detection (Tarjan/DFS) on every relation insertion.
