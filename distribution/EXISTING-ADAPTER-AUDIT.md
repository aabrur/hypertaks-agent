# Existing Adapter Audit Report

This report summarizes the structural and evidence-backed audit of all 22 host
adapters for the Hypertaks cross-AI distribution, including the eight original
existing adapters, Google Antigravity, and the thirteen newly mapped host
adapters.

Audit Date: **2026-07-31**
Tested Commit: `d845cea`
Branch: `feat/cross-ai-distribution-wave-2` (worktree `cross-ai-distribution-wave-2-execution`)

## Evidence Key

- `VERIFIED` = confirmed in this session by automated test, file inspection, or build validation.
- `UNVERIFIED / NEEDS_MANUAL_HOST_TEST` = structurally present but requires live execution inside the actual host application.
- Evidence types: `installer-lifecycle` (build plus isolated installer lifecycle) or `static-package` (adapter manifest and structure only).

## Summary Matrix (22 hosts)

| Host ID | Display Name | Distribution Type | Classification | Evidence Type | Structure | Live Host Test | Verdict |
|---|---|---|---|---|---|---|---|
| `claude-code` | Claude Code | `NATIVE_PLUGIN` | `NATIVE_PLUGIN` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `codex` | Codex | `NATIVE_PLUGIN` | `NATIVE_PLUGIN` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `cursor` | Cursor | `NATIVE_PLUGIN` | `NATIVE_PLUGIN` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `kimi-code` | Kimi Code | `NATIVE_PLUGIN` | `NATIVE_PLUGIN` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `opencode` | OpenCode | `NATIVE_PLUGIN_MANAGER` (registry) | `PLUGIN_AND_SKILL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `pi` | Pi | `EXTENSION` | `HOST_EXTENSION` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `openclaw` | OpenClaw | `SCANNED_SKILL_HOST` (registry) | `NATIVE_SKILL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `hermes` | Hermes | `SCANNED_SKILL_HOST` (registry) | `NATIVE_SKILL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `antigravity` | Google Antigravity | `GENERATED_NATIVE_PLUGIN` | `PLUGIN_AND_SKILL` | `installer-lifecycle` | VERIFIED (build + installer tests) | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `github-copilot` | GitHub Copilot | `NATIVE_PLUGIN` | `NATIVE_PLUGIN` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `windsurf` | Windsurf | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `cline` | Cline | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `roo-code` | Roo Code | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `kilo-code` | Kilo Code | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `aider` | Aider | `PROJECT_INSTRUCTIONS` | `PROJECT_INSTRUCTIONS` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `goose` | Goose | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `openhands` | OpenHands | `MANAGED_INSTALL` | `MANAGED_INSTALL` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `claude-ai` | Claude.ai | `PROJECT_INSTRUCTIONS` | `PROJECT_INSTRUCTIONS` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `gemini-app` | Gemini App | `CUSTOM_ASSISTANT` | `CUSTOM_ASSISTANT` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `open-webui` | Open WebUI | `EXTENSION` | `HOST_EXTENSION` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `librechat` | LibreChat | `EXTENSION` | `HOST_EXTENSION` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |
| `chatgpt` | ChatGPT | `CHATGPT_APP_ADAPTER` | `CHATGPT_APP_ADAPTER` | `static-package` | VERIFIED | NEEDS_MANUAL_HOST_TEST | `PARTIAL` |

## Key Findings

1. **Exact Canonical Skill Set**: Every host adapter maps to the same five canonical public skills (hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity). `python scripts/validate_public_skills.py` confirms exactly 5; no sixth `hypertaks-*` skill exists.
2. **No Sixth Public Skill**: None of the adapters generate or bundle a sixth public skill.
3. **No Unneeded MCP**: None of the 22 adapters bundle an MCP server in the shipped package; MCP remains an optional external capability except where a host (such as ChatGPT Apps SDK) mandates MCP transport, documented in the host record.
4. **Clean Update and Uninstall Guards**: `scripts/update_hypertaks.py` and `scripts/installer.py` enforce worktree safety, dirty/diverged/detached/wrong-remote rejection, and ownership-aware uninstall (only manifest-listed files are removed; unrelated files are preserved). The hardened uninstall was verified by `test_uninstall_preserves_unknown_files`.
5. **Live Testing Gap**: Actual install, discovery, direct invocation, natural-language invocation, subagent behavior, and uninstall inside the real host applications are UNVERIFIED for all 22 hosts. Manual verification procedures are documented in each report under `evals/hosts/<host-id>/REPORT.md`.

## New Adapter Boundary Validation (13 hosts)

Per the wave-2 design, the thirteen newly mapped hosts each received a documentation-only or limited adapter classification with no fabricated native plugin:

- `chatgpt` -> `CHATGPT_APP_ADAPTER`; adapter manifest `.chatgpt/plugin.json`; MCP required as host transport.
- `github-copilot` -> `NATIVE_PLUGIN`; `.github-copilot/plugin.json`.
- `windsurf` -> `MANAGED_INSTALL`; `.windsurf/plugin.json`.
- `cline` -> `MANAGED_INSTALL`; `.cline/plugin.json`.
- `roo-code` -> `MANAGED_INSTALL`; `.roo/plugin.json`.
- `kilo-code` -> `MANAGED_INSTALL`; `.kilo/plugin.json`.
- `aider` -> `PROJECT_INSTRUCTIONS`; `.aider/plugin.json`; no native terminal tool mapping.
- `goose` -> `MANAGED_INSTALL`; `.goose/plugin.json`.
- `openhands` -> `MANAGED_INSTALL`; `.openhands/plugin.json`.
- `claude-ai` -> `PROJECT_INSTRUCTIONS`; `.claude-ai/plugin.json`; no command execution.
- `gemini-app` -> `CUSTOM_ASSISTANT`; `.gemini-app/plugin.json`; separate from Google Antigravity.
- `open-webui` -> `HOST_EXTENSION`; `.open-webui/plugin.json`.
- `librechat` -> `HOST_EXTENSION`; `.librechat/plugin.json`.

For each, `python scripts/validate_distributions.py` confirms the registered adapter path resolves to a real tracked file, so the structural evidence is VERIFIED. No live host session was executed, so each verdict remains PARTIAL (static-package evidence, NEEDS_MANUAL_HOST_TEST for behavior).

## Manual Verification Procedures

Run the following for each host H:

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

Record: application version, OS, tested commit, commands or UI steps, timestamps, sanitized logs, discovered skills, invocation results, update result, uninstall result, and a PASS, FAIL, BLOCKED, or NOT_SUPPORTED verdict.

## Conclusion

All twenty-two adapters are structurally complete and consistent with the canonical five-skill Hypertaks identity. No adapter modifies the five-skill model or bundles unrequired MCP or hooks components. Google Antigravity additionally carries installer-lifecycle evidence from an isolated build and install/verify/update/uninstall/reinstall test run; every other host carries static-package evidence only. Full behavioral certification requires live host-app execution, which is outside the automated test surface available in this session.
