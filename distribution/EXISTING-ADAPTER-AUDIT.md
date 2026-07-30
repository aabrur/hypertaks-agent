# Existing Adapter Audit Report

This report summarizes the live lifecycle audit of the eight existing host adapters and the Google Antigravity adapter.

Audit Date: **2026-07-31**
Tested Commit: `b7fdaf9`

## Summary Table

| Host ID | Display Name | Tested Version | Distribution Type | Skills Discovered | Verdict |
|---|---|---|---|---|---|
| `claude-code` | Claude Code | 2.1.215 | `NATIVE_PLUGIN` | 5/5 | `PASS` |
| `codex` | Codex | 0.146.0 | `NATIVE_PLUGIN` | 5/5 | `PASS` |
| `cursor` | Cursor | 0.45.0 | `NATIVE_PLUGIN` | 5/5 | `PASS` |
| `kimi-code` | Kimi Code | 1.2.0 | `NATIVE_PLUGIN` | 5/5 | `PASS` |
| `opencode` | OpenCode | 0.9.4 | `PLUGIN_AND_SKILL` | 5/5 | `PASS` |
| `pi` | Pi | 0.82.1 | `HOST_EXTENSION` | 5/5 | `PASS` |
| `openclaw` | OpenClaw | 2026.7.1-2 | `NATIVE_SKILL` | 5/5 | `PASS` |
| `hermes` | Hermes | 0.19.0 | `NATIVE_SKILL` | 5/5 | `PASS` |
| `antigravity` | Google Antigravity | 1.4.0 | `PLUGIN_AND_SKILL` | 5/5 | `PASS` |

## Key Findings

1. **Exact Canonical Skill Set**: Every host discovers and routes the exact five canonical public skills:
   - `hypertaks`
   - `hypertaks-verify`
   - `hypertaks-brain`
   - `hypertaks-graph`
   - `hypertaks-continuity`
2. **No Sixth Public Skill**: None of the adapters generate or bundle a sixth public skill.
3. **No Unneeded MCP**: None of these 9 hosts bundle an MCP server; MCP remains an optional external capability.
4. **Clean Update and Uninstall**: All adapters support clean fast-forward updates, worktree safety, and uninstalls that remove only Hypertaks files.
