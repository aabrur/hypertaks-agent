# Hypertaks Host Capability Matrix

This matrix documents the distribution capabilities, classification, invocation model, tool integration strategy, and evidence status for Hypertaks across all 22 supported and target AI platforms.

Retrieval Date: **2026-07-31**

## Evidence model

Every host record carries an `evidenceStatus` and an `evidenceType`. A host
`PASS` is permitted only when `evidenceType` is `real-host-lifecycle`, meaning
discovery and invocation were observed in the named host application. Structural
package or installer evidence alone supports `PARTIAL` at most. No host in this
matrix currently holds a `PASS` verdict, because no real host application
lifecycle was run during this wave.

| Evidence type | Permitted conclusion |
|---|---|
| `official-documentation` | Capability classification is documented; behavior remains `NEEDS_MANUAL_HOST_TEST` until observed. |
| `static-package` | Package format and tracked contents are structurally valid. |
| `installer-lifecycle` | Hypertaks-owned install, update, uninstall, and reinstall behavior works in an isolated test target. |
| `runtime-lifecycle` | An executable host transport starts, initializes, lists tools, and completes representative local calls, but the real host has not been observed. |
| `real-host-lifecycle` | Discovery and invocation in the named host version were observed; the only type that supports a host `PASS`. |

## Summary Matrix

| Host ID | Official Display Name | Classification | Native Plugin | Native Skill | Custom Agent | Extension | Scope | MCP Requirement | Subagent Model | Evidence Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| `claude-code` | Claude Code | `NATIVE_PLUGIN` | Yes | Yes | No | Yes | Project/User | Optional | Native Subagent | `PARTIAL (static-package)` |
| `codex` | Codex | `NATIVE_PLUGIN` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized / Native | `PARTIAL (static-package)` |
| `cursor` | Cursor | `NATIVE_PLUGIN` | Yes | Yes | No | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `kimi-code` | Kimi Code | `NATIVE_PLUGIN` | Yes | Yes | No | No | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `opencode` | OpenCode | `PLUGIN_AND_SKILL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PARTIAL (static-package)` |
| `pi` | Pi | `HOST_EXTENSION` | No | No | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `openclaw` | OpenClaw | `NATIVE_SKILL` | No | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PARTIAL (static-package)` |
| `hermes` | Hermes | `NATIVE_SKILL` | No | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PARTIAL (static-package)` |
| `antigravity` | Google Antigravity | `PLUGIN_AND_SKILL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PARTIAL (installer-lifecycle)` |
| `chatgpt` | ChatGPT Plugins | `CHATGPT_APP_ADAPTER` | No | No | Yes | Yes | Global | Required (Transport) | Synthesized | `PARTIAL (runtime-lifecycle)` |
| `github-copilot` | GitHub Copilot | `NATIVE_PLUGIN` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `windsurf` | Windsurf | `MANAGED_INSTALL` | Yes | Yes | No | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `cline` | Cline | `MANAGED_INSTALL` | No | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `roo-code` | Roo Code | `MANAGED_INSTALL` | No | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `kilo-code` | Kilo Code | `MANAGED_INSTALL` | No | Yes | No | No | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `aider` | Aider | `PROJECT_INSTRUCTIONS` | No | No | No | No | Project/User | Unavailable | Synthesized | `PARTIAL (static-package)` |
| `goose` | Goose | `MANAGED_INSTALL` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `openhands` | OpenHands | `MANAGED_INSTALL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Micro-Agent | `PARTIAL (static-package)` |
| `claude-ai` | Claude.ai | `PROJECT_INSTRUCTIONS` | No | No | Yes | No | Project | Unavailable | Synthesized | `PARTIAL (static-package)` |
| `gemini-app` | Gemini App | `CUSTOM_ASSISTANT` | No | No | Yes | No | Global | Unavailable | Synthesized | `PARTIAL (static-package)` |
| `open-webui` | Open WebUI | `HOST_EXTENSION` | Yes | No | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |
| `librechat` | LibreChat | `HOST_EXTENSION` | Yes | No | Yes | Yes | Project/User | Optional | Synthesized | `PARTIAL (static-package)` |

## Canonical Product Identity Guarantees

1. **Five Canonical Public Skills**:
   - `skills/hypertaks`
   - `skills/hypertaks-verify`
   - `skills/hypertaks-brain`
   - `skills/hypertaks-graph`
   - `skills/hypertaks-continuity`
2. **MCP Policy**: Optional external capability. MCP is only required on hosts such as ChatGPT Plugins where MCP serves as the host transport layer.
3. **Google Antigravity Target**: Google Antigravity is the primary active Google coding-agent target. Gemini CLI is deprecated and unlisted. Gemini App is maintained as a separate Custom Assistant definition.
4. **Canonical Logo Asset**: `assets/Hypertask.svg` is copied without destructive tracing, redrawing, or modification.
