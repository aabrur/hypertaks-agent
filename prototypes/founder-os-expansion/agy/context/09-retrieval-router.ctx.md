---
id: CTX-09-RETRIEVAL-ROUTER
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/09-retrieval-router.ctx.md
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

# Retrieval Router Specification

This document defines context retrieval, graph query execution, and freshness scoring logic.

## Query Interfaces

- `get_entity(id)`: Fetches an entity by ID along with its current state.
- `get_relations(entity_id, relation_type)`: Retrieves all directed edges for an entity.
- `find_contradictions(entity_id)`: Locates all unresolved or historical contradiction records for an entity.
- `trace_provenance(entity_id)`: Traverses provenance chains back to source evidence documents.

## Freshness Decay

Documents marked `STALE` or `DEPRECATED` receive reduced ranking during compilation queries.
`FRESH` documents backed by T0-T3 evidence take precedence.
