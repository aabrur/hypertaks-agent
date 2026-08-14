# Marketplace Submission Readiness Matrix

This document tracks marketplace packaging and submission readiness for third-party AI host marketplaces, plugin directories, extension registries, and the Official MCP Registry.

> [!IMPORTANT]
> **Human Approval Gate**: No marketplace publication will take place without explicit, real-time human owner approval for that exact package version and target marketplace.

> [!NOTE]
> The statuses below reflect **structural submission readiness**: the adapter package, schema compliance, publisher identity, and required metadata are present and validated against local and schema constraints.
> They are **not** an unverified assertion of live external publication.

## Marketplace Status Matrix

| Platform / Host ID | Target Marketplace / Surface | Package Path | Native Package Support | MCP Support | Validation | Submission Status | Blocker / Notes | Human Action Required |
|---|---|---|---|---|---|---|---|---|
| `mcp-registry` | Official MCP Registry (`modelcontextprotocol/registry`) | `marketplace/mcp-registry/server.json` | Manifest | Streamable HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Requires domain TXT/org verification for `crimsonriftstudio.com` | Human owner PR or `npx @modelcontextprotocol/publisher publish` |
| `antigravity` | Google Antigravity Plugin Catalog | `.agents/plugins/hypertaks` | Plugin Import | No | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner catalog release trigger |
| `claude-code` | Anthropic Claude Code Plugin Directory | `.claude-plugin/marketplace.json` | Slash Plugin | Optional | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner plugin directory PR |
| `codex` | OpenAI Codex Plugin Marketplace | `.agents/plugins/marketplace.json` | Plugin Catalog | Optional | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner plugin marketplace submission |
| `cursor` | Cursor Plugin Directory / MCP Settings | `.cursor-plugin/plugin.json` | Add Plugin | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner directory submission / MCP registration |
| `chatgpt` | OpenAI ChatGPT Custom Apps / Directory | `.chatgpt/plugin.json` | Custom App | Streamable HTTP (`/mcp`) | PASS | `BLOCKED_BY_ACCOUNT` | Developer workspace account and domain verification required | Human owner account registration at platform.openai.com |
| `github-copilot` | GitHub Marketplace (Copilot Extensions) | `.plugin/plugin.json` | Copilot Extension | Optional | PASS | `READY_FOR_SUBMISSION` | Requires GitHub Partner / Organization app registration | Human owner GitHub Organization app registration |
| `windsurf` | Windsurf Plugins Directory | `.windsurf/plugin.json` | Skills UI | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner directory submission |
| `cline` | VS Code Marketplace (Cline MCP Registry) | `plugins/cline/hypertaks.ts` | CLI / SDK | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner PR to cline/mcp-marketplace |
| `roo-code` | VS Code Marketplace (Roo Code) | `.roo/plugin.json` | Plugin Bundle | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner extension registry submission |
| `goose` | Goose Extension Registry | `.goose/plugin.json` | Extension Recipe | Optional | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner registry submission |
| `openhands` | OpenHands Micro-Agent Registry | `.plugin/plugin.json` | Open Plugin | Optional | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner micro-agent registry PR |
| `open-webui` | Open WebUI Community Hub | `.open-webui/plugin.json` | Tool Import | Optional | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner submission at openwebui.com |
| `librechat` | LibreChat Plugin Directory | `.librechat/plugin.json` | Plugin Manifest | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner plugin listing submission |
| `gemini-cli` | Gemini CLI Extension Gallery | `gemini-extension.json` | Extension Manifest | Remote HTTP (`/mcp`) | PASS | `READY_FOR_SUBMISSION` | Structurally ready | Human owner extension gallery registration |
| `gemini-app` | Gemini App (Web Custom Gems) | `.gemini-app/plugin.json` | Custom Gem | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct user Custom Gem import | None (Direct install) |
| `kimi-code` | Kimi Plugin Manager | `.kimi-plugin/plugin.json` | Slash Plugins | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct local plugin manifest | None (Direct install) |
| `opencode` | OpenCode Plugin Architecture | `.opencode/plugins/hypertaks.ts` | Native TS Plugin | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct local plugin TS file | None (Direct install) |
| `pi` | Pi Extension Architecture | `.pi/extensions/hypertaks.ts` | TS Extension | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct local extension file | None (Direct install) |
| `openclaw` | OpenClaw Local Skill Scanner | `.openclaw/INSTALL.md` | Skill Scanner | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct skill directory scan | None (Direct install) |
| `hermes` | Hermes Local Skill Scanner | `plugin.yaml` | Skill Scanner | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct skill directory scan | None (Direct install) |
| `kilo-code` | Kilo Code Managed Installer | `plugins/kilo/hypertaks.ts` | Native Plugin | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct local plugin file | None (Direct install) |
| `aider` | Aider Project Configuration | `.aider/plugin.json` | Instructions | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct project instructions | None (Direct install) |
| `claude-ai` | Claude.ai Project Knowledge | `.claude-ai/INSTALL.md` | Custom Instructions | No | PASS | `NO_PUBLIC_MARKETPLACE` | Direct project instructions | None (Direct install) |

## Publication Verification Compliance Rule

- `READY_FOR_SUBMISSION` means structurally prepared, schema-validated, and canonical metadata synchronized. It does NOT mean submitted, accepted, or certified externally.
- `SUBMITTED`, `IN_REVIEW`, `APPROVED`, or `PUBLISHED` are forbidden without external verifiable evidence.
