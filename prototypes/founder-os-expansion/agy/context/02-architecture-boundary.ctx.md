---
id: CTX-02-ARCH-BOUNDARY
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/02-architecture-boundary.ctx.md
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

# Architecture Boundary Specification

This document defines the strict public boundary of the Hypertaks Founder Operating System.

## Public Skill Surface

The public skill surface contains exactly five public skills:
- `hypertaks`: Primary Founder OS entry point and phase loop manager.
- `hypertaks-verify`: Environment, brain, storage, and Obsidian verification layer.
- `hypertaks-brain`: Evidence-backed founder memory and state transitions.
- `hypertaks-graph`: Optional Graphify routing and direct repository search fallback.
- `hypertaks-continuity`: Checkpoints, resumes, handoffs, and proof of done verification.

No sixth public skill starting with `hypertaks` may be added.

## Internal Native Capability Boundary

Native tools and adapters operate exclusively as internal capabilities behind host facades. They do not expand public MCP definitions or alter external service boundaries.
