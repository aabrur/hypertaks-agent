# Production Rollout Wave 4

Wave 4 covers ChatGPT, Claude.ai, Gemini App, Open WebUI, and LibreChat.

## Result

All five targets are `PASS` for official native plugin or plugin-compatible host integration.

| Host | Native route | Status |
|---|---|---|
| ChatGPT | Custom plugin app connected to the Hypertaks HTTPS MCP adapter | PASS |
| Claude.ai | Uploaded Claude plugin package | PASS |
| Gemini App | Hypertaks plugin instruction bundle wrapped as a Gem | PASS |
| Open WebUI | Workspace Tool or Function plugin import | PASS |
| LibreChat | MCP or OpenAPI Action plugin adapter | PASS |

The tracked source of truth is `distribution/chat-selfhosted-agents.json` and the unified `distribution/plugin-compatibility.json`.

## Release gate

Wave 4 is complete when both catalogs validate, all adapter paths exist, and the main repository workflows pass.
