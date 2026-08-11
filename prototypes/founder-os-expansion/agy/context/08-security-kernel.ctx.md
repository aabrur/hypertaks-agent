---
id: CTX-08-SECURITY-KERNEL
version: 1.0.0
timestamp: 2026-08-11T18:41:16Z
evidence_class: T6_GENERATED
provenance:
  agent_id: AGY-FOUNDER-OS
  source_file: context/08-security-kernel.ctx.md
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

# Security Kernel Specification

This document defines path containment, secret scanning, and atomic write security rules.

## Approved Root Containment

All file operations must be validated against the canonical realpath of the approved prototype root `prototypes/founder-os-expansion/agy/`.
Attempts to escape via relative paths (`../`), symlinks, or directory junctions outside the approved root must fail closed immediately.

## Secret Scanning Rules

Context files and event streams are scanned before persistence. If any raw credential matching patterns such as API keys, private keys, access tokens, or password strings is detected, write is rejected.
Secrets must travel strictly as handles such as `$NAME`.

## Atomic Write Protocol

1. Write candidate content to a temporary file (`.tmp.[random]`) inside approved root.
2. Verify integrity and perform read-after-write hash check.
3. Replace target path atomically using filesystem replace operation.
4. Clean up temporary files on any failure.
