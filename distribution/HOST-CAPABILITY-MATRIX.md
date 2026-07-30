# Hypertaks Host Capability Matrix

This matrix documents the distribution capabilities, classification, invocation model, and tool integration strategy for Hypertaks across all 22 supported and target AI platforms.

Retrieval Date: **2026-07-31**

## Summary Matrix

| Host ID | Official Display Name | Classification | Native Plugin | Native Skill | Custom Agent | Extension | Scope | MCP Requirement | Subagent Model | Evidence Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| `claude-code` | Claude Code | `NATIVE_PLUGIN` | Yes | Yes | No | Yes | Project/User | Optional | Native Subagent | `PASS` |
| `codex` | Codex | `NATIVE_PLUGIN` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized / Native | `PASS` |
| `cursor` | Cursor | `NATIVE_PLUGIN` | Yes | Yes | No | Yes | Project/User | Optional | Synthesized | `PASS` |
| `kimi-code` | Kimi Code | `NATIVE_PLUGIN` | Yes | Yes | No | No | Project/User | Optional | Synthesized | `PASS` |
| `opencode` | OpenCode | `PLUGIN_AND_SKILL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PASS` |
| `pi` | Pi | `HOST_EXTENSION` | No | No | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `openclaw` | OpenClaw | `NATIVE_SKILL` | No | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PASS` |
| `hermes` | Hermes | `NATIVE_SKILL` | No | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PASS` |
| `antigravity` | Google Antigravity | `PLUGIN_AND_SKILL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Subagent | `PASS` |
| `chatgpt` | ChatGPT | `CHATGPT_APP_ADAPTER` | No | No | Yes | Yes | Global | Required (Transport) | Synthesized | `PASS` |
| `github-copilot` | GitHub Copilot | `NATIVE_PLUGIN` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `windsurf` | Windsurf | `MANAGED_INSTALL` | Yes | Yes | No | Yes | Project/User | Optional | Synthesized | `PASS` |
| `cline` | Cline | `MANAGED_INSTALL` | No | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `roo-code` | Roo Code | `MANAGED_INSTALL` | No | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `kilo-code` | Kilo Code | `MANAGED_INSTALL` | No | Yes | No | No | Project/User | Optional | Synthesized | `PASS` |
| `aider` | Aider | `PROJECT_INSTRUCTIONS` | No | No | No | No | Project/User | Unavailable | Synthesized | `PASS` |
| `goose` | Goose | `MANAGED_INSTALL` | Yes | Yes | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `openhands` | OpenHands | `MANAGED_INSTALL` | Yes | Yes | Yes | Yes | Project/User | Optional | Native Micro-Agent | `PASS` |
| `claude-ai` | Claude.ai | `PROJECT_INSTRUCTIONS` | No | No | Yes | No | Project | Unavailable | Synthesized | `PASS` |
| `gemini-app` | Gemini App | `CUSTOM_ASSISTANT` | No | No | Yes | No | Global | Unavailable | Synthesized | `PASS` |
| `open-webui` | Open WebUI | `HOST_EXTENSION` | Yes | No | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |
| `librechat` | LibreChat | `HOST_EXTENSION` | Yes | No | Yes | Yes | Project/User | Optional | Synthesized | `PASS` |

## Canonical Product Identity Guarantees

1. **Five Canonical Public Skills**:
   - `skills/hypertaks`
   - `skills/hypertaks-verify`
   - `skills/hypertaks-brain`
   - `skills/hypertaks-graph`
   - `skills/hypertaks-continuity`
2. **MCP Policy**: Optional external capability. MCP is only required on hosts (like ChatGPT Apps SDK) where MCP serves as the host-mandated transport layer.
3. **Google Antigravity Target**: Google Antigravity is the primary active Google coding-agent target. Gemini CLI is deprecated and unlisted. Gemini App is maintained as a separate Custom Assistant definition.
4. **Canonical Logo Asset**: `assets/Hypertask.svg` is copied without destructive tracing, redrawing, or modification.
