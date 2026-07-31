# Cross-AI Distribution Wave 2 Implementation Report

- **Author**: codex (cross-ai-distribution-wave-2-execution agent)
- **Tested Commit**: `d845cea` (worktree `cross-ai-distribution-wave-2-execution`, base `feat/cross-ai-distribution-wave-2` @ `688508a`)
- **Date**: `2026-07-31`
- **Product Version**: `4.5.0`
- **Overall Status**: `NEEDS_VERIFICATION` - Structural implementation complete; behavioral certification pending live host tests.

---

## Executive Summary

This report records the cross-AI distribution evidence gathered during wave 2. The
Hypertaks plugin now extends across **22 host targets** while preserving exactly five
canonical public skills and the canonical SVG asset.

The behavioral conclusion for this wave is deliberately scoped:

- **Structural identity, adapters, installer, and conformance validators**: `CONFIRMED`.
- **Canonical five-skill set, SVG hash, build, and ownership-aware install/verify/update/uninstall/reinstall**: `CONFIRMED` (Antigravity installer lifecycle).
- **Live host skill discovery, direct or natural-language invocation, tool mapping, and behavioral execution**: `NOT_SUPPORTED` in this session (no host account or paid plan was authenticated; no live host application was exercised).

No marketplace publication, merge to `main`, or pull request was performed without explicit owner approval.

---

## Tested Commit and Changed Files

| Area | Path |
|---|---|
| Validator (new) | `scripts/validate_host_capabilities.py` |
| Validator tests (new) | `scripts/test_validate_host_capabilities.py` |
| Installer hardening | `scripts/installer.py` |
| Installer tests | `scripts/test_installer.py` |
| Conformance validator | `scripts/validate_conformance.py` |
| Conformance tests | `scripts/test_validate_conformance.py` |
| Host capability records | `distribution/host-capabilities.json` |
| Host matrix | `distribution/HOST-CAPABILITY-MATRIX.md` |
| Adapter audit | `distribution/EXISTING-ADAPTER-AUDIT.md` |
| Conformance data | `evals/cross-host/cases.jsonl`, `results.json`, `SUMMARY.md` |
| Host reports | `evals/hosts/<host-id>/REPORT.md` (22) |
| CI workflow | `.github/workflows/validate-distributions.yml` |
| README | `README.md` |
| Marketplace readiness | `marketplace/SUBMISSION-READINESS.md` |

## Official Source List and Host Matrix

| Host ID | Display Name | Documentation URL | Evidence Type | Verdict |
|---|---|---|---|---|
| `claude-code` | Claude Code | https://docs.anthropic.com/en/docs/agents-and-tools/claude-code | static-package | PARTIAL |
| `codex` | Codex | https://github.com/openai/codex | static-package | PARTIAL |
| `cursor` | Cursor | https://docs.cursor.com | static-package | PARTIAL |
| `kimi-code` | Kimi Code | https://kimi.moonshot.cn/docs | static-package | PARTIAL |
| `opencode` | OpenCode | https://opencode.ai/docs | static-package | PARTIAL |
| `pi` | Pi | https://github.com/minds/pi | static-package | PARTIAL |
| `openclaw` | OpenClaw | https://openclaw.ai/docs | static-package | PARTIAL |
| `hermes` | Hermes | https://github.com/hermes-agent/hermes | static-package | PARTIAL |
| `antigravity` | Google Antigravity | https://cloud.google.com/antigravity/docs | installer-lifecycle | PARTIAL |
| `chatgpt` | ChatGPT | https://platform.openai.com/docs/actions | static-package | PARTIAL |
| `github-copilot` | GitHub Copilot | https://docs.github.com/en/copilot | static-package | PARTIAL |
| `windsurf` | Windsurf | https://codeium.com/windsurf/docs | static-package | PARTIAL |
| `cline` | Cline | https://github.com/cline/cline | static-package | PARTIAL |
| `roo-code` | Roo Code | https://github.com/RooVetGit/Roo-Code | static-package | PARTIAL |
| `kilo-code` | Kilo Code | https://kilo.ai/docs | static-package | PARTIAL |
| `aider` | Aider | https://aider.chat/docs | static-package | PARTIAL |
| `goose` | Goose | https://block.github.io/goose/docs | static-package | PARTIAL |
| `openhands` | OpenHands | https://github.com/All-Hands-AI/OpenHands | static-package | PARTIAL |
| `claude-ai` | Claude.ai | https://support.anthropic.com/en/articles/9517377-about-projects | static-package | PARTIAL |
| `gemini-app` | Gemini App | https://support.google.com/gemini/answer/14579631 | static-package | PARTIAL |
| `open-webui` | Open WebUI | https://docs.openwebui.com/features/plugin | static-package | PARTIAL |
| `librechat` | LibreChat | https://docs.librechat.ai/features/plugins | static-package | PARTIAL |

## Lifecycle Matrix

| Host | Build | Install/Verify/Update/Uninstall/Reinstall (isolated) | Live host invocation |
|---|---|---|---|
| `antigravity` | CONFIRMED | CONFIRMED (installer-lifecycle) | NOT_SUPPORTED |
| all other 21 | CONFIRMED (adapter manifest present) | NOT_SUPPORTED | NOT_SUPPORTED |

Antigravity installer lifecycle was executed in an isolated temporary project root
(`scripts/test_installer.py`); it never writes to the repository's own `.agents/`.

## Marketplace Matrix

| Host | Target Marketplace | Status |
|---|---|---|
| `antigravity` | Google Antigravity Plugin Catalog | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `chatgpt` | ChatGPT App Directory | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `claude-code` | Anthropic Claude Code Plugin Directory | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `codex` | Codex Plugin Marketplace | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `cursor` | Cursor Plugin Directory | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `github-copilot` | GitHub Marketplace | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `windsurf` | Windsurf Plugins Directory | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `cline` | VS Code Marketplace (Cline) | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `roo-code` | VS Code Marketplace (Roo Code) | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `goose` | Goose Extension Registry | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `librechat` | LibreChat Plugin Directory | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `open-webui` | Open WebUI Community Hub | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `openhands` | OpenHands Micro-Agent Registry | `READY_FOR_HUMAN_SUBMISSION` (structural) |
| `kilo-code` | N/A (managed adapter) | `NO_PUBLIC_MARKETPLACE` |
| `aider` | N/A (project instructions) | `NO_PUBLIC_MARKETPLACE` |
| `claude-ai` | N/A (project knowledge) | `NO_PUBLIC_MARKETPLACE` |
| `gemini-app` | N/A (custom gem) | `NO_PUBLIC_MARKETPLACE` |
| `kimi-code`, `opencode`, `openclaw`, `hermes`, `pi` | N/A (direct/local install) | `NO_PUBLIC_MARKETPLACE` |

`READY_FOR_HUMAN_SUBMISSION` denotes structural package/metadata readiness only; it does
not imply `SUBMITTED`, `APPROVED`, or `PUBLISHED`. No submission occurred.

## Conformance Results

| Field | Value |
|---|---|
| Total cases | 5 |
| Passed cases | 0 |
| Partial cases | 5 |
| Aggregate verdict | `PARTIAL` |

All five cases are spec-derived expectation checks with `evidenceType: static-package`.
No case carries `real-host-lifecycle` evidence, so none may claim `PASS`. The conformance
validator rejects any `PASS` case whose evidence is not live-host lifecycle and rejects a
`results.json` whose totals or aggregate disagree with the cases.

## Security Findings

- **Path traversal**: `validate_owned_relative_path` rejects absolute or escaping
  manifest paths; uninstall deletes only manifest-listed files and prunes empty dirs.
  `test_uninstall_preserves_unknown_files` confirms an unrelated file survives uninstall.
  `CONFIRMED`.
- **Dirty/diverged/detached/wrong-remote**: `scripts/update_hypertaks.py` and its tests
  reject unsafe Git states. `CONFIRMED`.
- **No unneeded MCP/hooks**: the Antigravity package ships no `mcp_config.json` or
  `hooks.json`. `CONFIRMED`.
- **SVG integrity**: package SVG SHA256 matches `assets/Hypertask.svg`. `CONFIRMED`.
- **Five-skill invariant**: `validate_skill.py` and `validate_public_skills.py` enforce
  exactly five public skills and reject a sixth. `CONFIRMED`.
- **Secret scanning**: no secrets added to reports, manifests, or commits. `CONFIRMED`.

## Blockers

- `BLOCKED` for all 22 live-host behavioral claims until a live host session is run with an
  authenticated account and paid plan where required (ChatGPT, Claude.ai, Gemini App).
- `BLOCKED` for any marketplace publication until explicit human owner approval for the
  exact package version and target marketplace is obtained.

## Manual Owner Actions

1. Run live host verification per `evals/hosts/<host-id>/REPORT.md` (at minimum Antigravity,
   then the priority native-plugin hosts).
2. Review the full branch and approve the merge of
   `codex/cross-ai-distribution-wave-2-execution` to `main` (Task 7 PR preview).
3. Provide explicit approval before submitting any package to any external marketplace.

## Exact Next Step

Run the complete validation gate (Task 6, Step 3) and prepare the pull-request preview
(Task 7) against `origin/main...HEAD`. The push and pull-request creation remain owner-approved
external actions.
