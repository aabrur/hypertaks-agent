# Marketplace Submission Readiness Matrix

This document tracks submission readiness for third-party AI host marketplaces.

> [!IMPORTANT]
> **Human Approval Gate**: No marketplace publication will take place without explicit, real-time human owner approval for that exact package version and target marketplace.

> [!NOTE]
> The statuses below reflect **structural submission-readiness**: the adapter package,
> classification, and required metadata are present and validated against the local catalog.
> They are **not** a behavioral certification. Live host skill invocation, tool mapping, and
> runtime behavior are unverified (`PARTIAL`) for every host. Behavioral certification remains a
> separate, owner-performed live-test gate before any external submission.

## Marketplace Status Matrix

| Host ID | Target Marketplace | Package ID | Submission Status | Prerequisites / Blockers |
|---|---|---|---|---|
| `antigravity` | Google Antigravity Plugin Catalog | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `claude-code` | Anthropic Claude Code Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `codex` | Codex Plugin Marketplace | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `cursor` | Cursor Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `chatgpt` | ChatGPT App Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `github-copilot` | GitHub Marketplace | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `windsurf` | Windsurf Plugins Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `cline` | VS Code Marketplace (Cline) | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `roo-code` | VS Code Marketplace (Roo Code) | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `goose` | Goose Extension Registry | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `openhands` | OpenHands Micro-Agent Registry | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `open-webui` | Open WebUI Community Hub | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
| `librechat` | LibreChat Plugin Directory | `hypertaks` | `READY_FOR_HUMAN_SUBMISSION` | Requires human owner trigger |
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

- **`SUBMITTED`**, **`APPROVED`**, or **`PUBLISHED`** status strings are strictly forbidden without verified external proof (e.g. publication approval email or public live URL).
