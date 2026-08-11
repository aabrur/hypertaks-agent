---
id: CTX-05-EVENT-LEDGER
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/05-event-ledger.ctx.md
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

# Event Ledger Specification

This document defines the append-only event stream mechanics used to record all graph state changes.

## Allowed Mutation Events

1. `EVENT_CREATE_ENTITY`: Registers a new typed entity into the graph.
2. `EVENT_UPDATE_ENTITY`: Appends a state delta to an existing entity without overwriting prior attributes.
3. `EVENT_RELATE_ENTITIES`: Adds a directed edge between two entities subject to relation constraints.
4. `EVENT_CONTRADICT_FACT`: Records a factual conflict between two entities, creating a contradiction node.
5. `EVENT_INVALIDATE_FACT`: Marks an entity or relation as invalid based on higher-authority evidence.
6. `EVENT_ARCHIVE_FACT`: Transitions a superseded entity to historical archive status.
7. `EVENT_RECONCILE_STATE`: Replays event stream from genesis to compute current deterministic state.

## Append-Only Invariant

No event record may be edited or deleted once written. State is constructed exclusively by replaying events sequentially.
