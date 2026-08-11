---
id: CTX-03-DOMAIN-ONTOLOGY
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/03-domain-ontology.ctx.md
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

# Domain Ontology Specification

This document defines the core entity types used within the typed graph of the Project Operating Context.

## Entity Types

1. `ENT_BOSS`: Human decision maker holding T1 authority.
2. `ENT_SPECIALIST`: Specialist AI agent (e.g. Claude Code, Grok, Agy, Hermes, Pi, Kilo, Command Code, Cline, Codex).
3. `ENT_CONTRACT`: Formally approved project contract binding scope, permissions, and deliverables.
4. `ENT_TASK`: Work item with explicit target deliverables, verification requirements, and status.
5. `ENT_ARTIFACT`: Deliverable file produced by an agent (e.g. markdown report, prototype code, schema).
6. `ENT_EVIDENCE_RECORD`: Concrete evidence record linked to repository content or execution logs.
7. `ENT_CONTRADICTION`: Structured record of conflicting assertions retained for reconciliation.
8. `ENT_CHECKPOINT`: Resumable execution snapshot recording verified state.

## Property Schema

Every entity must include: `entity_id`, `entity_type`, `label`, `authority`, `properties`, and `created_at`.
