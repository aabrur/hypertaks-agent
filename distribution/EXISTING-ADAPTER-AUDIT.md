# Existing Adapter Audit Report

This report summarizes the structural and evidence-backed audit of the eight existing host adapters and the Google Antigravity adapter.

Audit Date: **2026-07-31**
Tested Commit: `b7fdaf9`
Branch: `feat/cross-ai-distribution-wave-2`

## Evidence Key

- `VERIFIED` = confirmed in this session by automated test, file inspection, or build validation.
- `UNVERIFIED / NEEDS_MANUAL_HOST_TEST` = structurally present but requires live execution inside the actual host application.

## Summary Table

| Host ID | Display Name | Distribution Type | Structure Verified | Live Host Test | Verdict |
|---|---|---|---|---|---|
| `claude-code` | Claude Code | `NATIVE_PLUGIN` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `codex` | Codex | `NATIVE_PLUGIN` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `cursor` | Cursor | `NATIVE_PLUGIN` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `kimi-code` | Kimi Code | `NATIVE_PLUGIN` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `opencode` | OpenCode | `PLUGIN_AND_SKILL` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `pi` | Pi | `HOST_EXTENSION` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `openclaw` | OpenClaw | `NATIVE_SKILL` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `hermes` | Hermes | `NATIVE_SKILL` | Yes | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `antigravity` | Google Antigravity | `PLUGIN_AND_SKILL` | Yes (build + installer tests) | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |

## Key Findings

1. **Exact Canonical Skill Set**: Every host adapter maps to the same five canonical public skills:
   - `hypertaks`
   - `hypertaks-verify`
   - `hypertaks-brain`
   - `hypertaks-graph`
   - `hypertaks-continuity`
2. **No Sixth Public Skill**: None of the adapters generate or bundle a sixth public skill.
3. **No Unneeded MCP**: None of these 9 hosts bundle an MCP server in the shipped adapter package; MCP remains an optional external capability.
4. **Clean Update and Uninstall Guards**: `scripts/update_hypertaks.py` and `scripts/installer.py` enforce worktree safety, dirty/diverged/detached/wrong-remote rejection, and ownership-aware uninstall.
5. **Live Testing Gap**: Actual install, discovery, direct invocation, natural-language invocation, subagent behavior, and uninstall inside the real host applications are UNVERIFIED for all 9 hosts. Manual verification procedures are documented in each host report under `evals/hosts/<host-id>/REPORT.md`.

## Manual Verification Procedures

Run the following for each host `H`:

```text
hypertaks doctor
hypertaks list-hosts
hypertaks install H --scope project
hypertaks verify H
# exercise direct and natural-language invocation
hypertaks update H
hypertaks uninstall H
hypertaks verify H   # must report NOT_INSTALLED
hypertaks install H --scope project   # clean reinstall
```

Record:
- application version
- OS
- tested commit
- commands or UI steps
- timestamps
- sanitized logs
- discovered skills
- invocation results
- update result
- uninstall result
- screenshots where useful
- PASS, FAIL, BLOCKED, or NOT_SUPPORTED verdict

## Conclusion

All nine existing adapters are structurally complete and consistent with the canonical Hypertaks identity. No adapter modifies the five-skill model or bundles unrequired MCP/hooks components. Full behavioral certification requires live host-app execution, which is outside the automated test surface available in this session.
