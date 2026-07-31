# Hypertaks for ChatGPT Plugins

Hypertaks remains a plugin plus exactly five canonical skills. The MCP server in
this adapter exists only because ChatGPT uses MCP as the plugin transport. It is
not the canonical Hypertaks product and it does not replace the skill core.

## Current evidence status

- Local MCP Streamable HTTP runtime: executable and tested.
- Exact five-skill verification: tested.
- Tool discovery and representative tool calls: tested locally.
- Origin rejection and optional bearer authentication: tested locally.
- Real ChatGPT Developer mode connection: still requires a manual host test.
- Public Plugin Directory submission: not performed.

## Requirements

- Node.js 20 or newer. Node.js 22 is recommended.
- A ChatGPT account and workspace where Developer mode is available.
- Secure MCP Tunnel or a temporary HTTPS tunnel for Developer mode testing.
- A stable public HTTPS endpoint and production authentication before public
  submission if private user data or write actions are added.

Official documentation:

- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/deploy/connect-chatgpt

## Run locally

From the repository root:

```text
npm run start:chatgpt
```

Default endpoints:

```text
MCP:    http://127.0.0.1:8787/mcp
Health: http://127.0.0.1:8787/healthz
```

Run the local runtime tests:

```text
npm run test:chatgpt
```

The server uses only Node.js built-in modules, binds to loopback by default, and
exposes four read-only tools:

- `hypertaks_manifest`
- `hypertaks_get_skill`
- `hypertaks_route`
- `hypertaks_verify_installation`

It exposes no write tool and cannot access or mutate the user's local repository
from ChatGPT. Repository changes require a coding-agent host or a separately
authorized connector.

## Environment variables

```text
HYPERTAKS_MCP_HOST=127.0.0.1
HYPERTAKS_MCP_PORT=8787
HYPERTAKS_ALLOWED_ORIGINS=https://chatgpt.com
HYPERTAKS_MCP_BEARER_TOKEN=<optional-development-token>
```

The runtime refuses to bind a non-loopback interface without a bearer token.
`HYPERTAKS_ALLOW_INSECURE_REMOTE=1` exists only for isolated test networks and
must not be used for public deployment.

## Connect in ChatGPT Developer mode

1. Start the local server.
2. Expose `/mcp` through Secure MCP Tunnel or an HTTPS development tunnel.
3. In ChatGPT, open Settings, select Security and login, then enable Developer
   mode when your workspace policy allows it.
4. Open ChatGPT Plugins and add a new connection.
5. Enter the public HTTPS MCP URL including `/mcp`, or select the Secure MCP
   Tunnel connection.
6. Review the four discovered tools and confirm all are read-only.
7. Run the cases in `evals/hosts/chatgpt/LIVE-TEST-CHECKLIST.md`.
8. Save sanitized logs, screenshots, host version, account policy, and results.

## Public submission boundary

A local server or temporary tunnel is sufficient only for development testing.
Public submission requires a stable reachable HTTPS endpoint, production-grade
authentication and authorization where needed, monitoring, domain verification,
privacy documentation, live ChatGPT evidence, and explicit owner approval.
