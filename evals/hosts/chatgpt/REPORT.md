# ChatGPT Adapter Audit Report

- **Host ID**: `chatgpt`
- **Tested Commit**: `a494f15`
- **Branch**: `feat/production-rollout-wave-1`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Local runtime lifecycle and adapter structure verified. Real ChatGPT lifecycle remains unverified.

## Verified in Wave 1

1. Hypertaks still exposes exactly five canonical public skills.
2. `.chatgpt/plugin.json` points to the executable runtime at `runtime/chatgpt-mcp-server.mjs`.
3. MCP is used only as the ChatGPT host transport. It does not replace the canonical skill core.
4. The runtime exposes exactly four read-only tools:
   - `hypertaks_manifest`
   - `hypertaks_get_skill`
   - `hypertaks_route`
   - `hypertaks_verify_installation`
5. No write action is exposed.
6. Local tests cover protocol initialization, tool discovery, representative calls, request validation, origin validation, optional bearer validation, and shutdown.
7. Distribution validation and GitHub Actions passed on the Wave 1 branch.

## Not yet verified

1. Connection from an eligible ChatGPT workspace to the remote HTTPS endpoint.
2. Tool discovery and invocation inside ChatGPT.
3. Refresh behavior after a runtime update.
4. Removal of the draft app and disappearance of its tools.
5. App Directory review or publication.

Use `evals/hosts/chatgpt/LIVE-TEST-CHECKLIST.md` for the real-host evidence procedure.

Local runtime success is not behavioral certification. ChatGPT remains `PARTIAL` until real-host lifecycle evidence exists.
