# Hypertaks Production Rollout Wave 1

Date: `2026-07-31`
Branch: `feat/production-rollout-wave-1`
Product version: `4.5.0`
Status: `PARTIAL`

## Scope

Wave 1 closes the first production blockers without changing the canonical Hypertaks identity:

- one plugin product;
- exactly five canonical public skills;
- MCP optional everywhere except where a host requires it as transport;
- no fabricated live-host certification;
- no marketplace publication without owner approval.

## Completed

- Added an executable read-only ChatGPT MCP Streamable HTTP runtime.
- Added local runtime, security, discovery, and tool-call tests.
- Added a real-host certification checklist for ChatGPT.
- Updated public status language so 22 entries mean adapter targets, not 22 live-certified hosts.
- Preserved `PASS` for real host lifecycle evidence only.

## Still blocked

- Real ChatGPT connection, discovery, invocation, refresh, disable, and removal in an eligible workspace.
- Real Antigravity install, discovery, invocation, update, uninstall, and reinstall inside the application.
- Live certification for the remaining host targets.
- External marketplace submission and publication.

## Required owner evidence

For ChatGPT, provide an eligible workspace and a remote HTTPS endpoint or approved secure tunnel. For Antigravity, execute the manual lifecycle in `evals/hosts/antigravity/REPORT.md`.

Do not upgrade either host to `PASS` without sanitized real-host evidence.
