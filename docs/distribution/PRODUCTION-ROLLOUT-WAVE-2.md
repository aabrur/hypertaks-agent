# Production Rollout Wave 2

## Scope

Wave 2 prepares the eight primary coding-agent targets:

1. Claude Code
2. Codex
3. Cursor
4. Kimi Code
5. OpenCode
6. Pi
7. OpenClaw
8. Hermes

## Product boundary

Hypertaks remains one plugin product with exactly five canonical public skills. Host adapters may package, register, or expose those skills, but they must not fork the canonical logic or create a sixth public skill. MCP remains an optional external capability and is not bundled merely because a host supports it.

## Repository deliverables

- machine-readable coding-agent catalog;
- evidence-aware validator and unit tests;
- shared real-host certification checklist;
- corrected OpenCode installation path using native Agent Skills;
- five-skill installation guidance for OpenClaw and Hermes;
- Pi package metadata for the extension and canonical skills;
- CI coverage for the new catalog and tests.

## Evidence status

All eight targets remain `PARTIAL` until a named application version completes installation, discovery, invocation, permission handling, update, uninstall, and reinstall with sanitized evidence.

A host manifest, skill copy, plugin package, or passing structural validator does not qualify as behavioral certification.

## Exact next action

Run `evals/coding-agents/LIVE-CERTIFICATION.md` on each installed host. Update only that host's evidence record after the real session is captured. Do not batch-upgrade all eight to `PASS` from one model-generated report.
