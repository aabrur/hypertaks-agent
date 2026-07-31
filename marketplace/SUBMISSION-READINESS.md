# Marketplace Submission Readiness Matrix

This document tracks submission readiness for third-party AI host marketplaces.

> [!IMPORTANT]
> **Human Approval Gate**: No marketplace publication will take place without explicit, real-time human owner approval for that exact package version and target marketplace.

> [!NOTE]
> The statuses below reflect **structural submission-readiness**: the adapter package,
> classification, and required metadata are present and validated against the local catalog.
> They are **not** a behavioral certification. Live host skill invocation, tool mapping, and
> runtime behavior remain a separate evidence gate before any external submission.

## Marketplace Status Matrix

| Host ID | Target Marketplace | Package ID | Submission Status | Prerequisites / Blockers |
|---|---|---|---|---|
| `antigravity` | Google Antigravity Plugin Catalog | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `claude-code` | Anthropic Claude Code Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `codex` | Codex Plugin Marketplace | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `cursor` | Cursor Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `chatgpt` | ChatGPT App Directory | `hypertaks` | `BLOCKED_BY_ACCOUNT` | Eligible workspace, remote HTTPS endpoint, live host evidence, and owner approval required |
| `github-copilot` | GitHub Marketplace | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `windsurf` | Windsurf Plugins Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `cline` | VS Code Marketplace (Cline) | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `roo-code` | VS Code Marketplace (Roo Code) | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `goose` | Goose Extension Registry | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `openhands` | OpenHands Micro-Agent Registry | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `open-webui` | Open WebUI Community Hub | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `librechat` | LibreChat Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger and live host evidence |
| `kimi-code` | N/A (Direct Install) | N/A | `NO_PUBLIC_MARKETPLACE` | Scanned local manifest |
| `opencode` | N/A (Direct Install) | N/A | `NO_PUBLIC_MARKETPLACE` | Scanned local manifest |
| `pi` | N/A (Direct Extension) | N/A | `NO_PUBLIC_MARKETPLACE` | Local TypeScript extension |
| `openclaw` | N/A (Local Skill Scanner) | N/A | `NO_PUBLIC_MARKETPLACE` | Scanned local skill directory |
| `hermes` | N/A (Local Skill Scanner) | N/A | `NO_PUBLIC_MARKETPLACE` | Scanned local skill directory |
| `kilo-code` | N/A (Managed Adapter) | N/A | `NO_PUBLIC_MARKETPLACE` | Local managed installer |
| `aider` | N/A (Project Instructions) | N/A | `NO_PUBLIC_MARKETPLACE` | Project configuration file |
| `claude-ai` | N/A (Project Knowledge) | N/A | `NO_PUBLIC_MARKETPLACE` | Project custom instructions |
| `gemini-app` | N/A (Custom Gem) | N/A | `NO_PUBLIC_MARKETPLACE` | Web Custom Gem instructions |

## Publication Verification Compliance Rule

- `READY_FOR_HUMAN_SUBMISSION` means structurally prepared. It does not mean submitted, accepted, or behaviorally certified.
- `SUBMITTED`, `APPROVED`, or `PUBLISHED` are forbidden without verified external proof.
