# Hypertaks Plugin for ChatGPT

ChatGPT consumes the Hypertaks plugin through its tracked HTTPS MCP adapter. The adapter exposes exactly five canonical skills and read-only routing tools.

## Prepare the plugin endpoint

```bash
npm run test:chatgpt
npm run start:chatgpt
```

Default local endpoints:

```text
MCP:    http://127.0.0.1:8787/mcp
Health: http://127.0.0.1:8787/healthz
```

Deploy the MCP endpoint behind HTTPS before connecting it to ChatGPT.

## Install in ChatGPT

1. Open **Plugins** or **Developer Mode** in ChatGPT.
2. Choose **Create custom plugin app**.
3. Enter the deployed Hypertaks HTTPS MCP URL ending in `/mcp`.
4. Review the discovered read-only tools and save the plugin.

## Update

Deploy the newer Hypertaks runtime, then refresh the custom plugin app.

## Uninstall

Remove or disconnect the Hypertaks custom plugin app.

## Security

The adapter provides no write, delete, shell, deployment, publication, or local user-filesystem tools. Remote deployment must use HTTPS and appropriate authentication.

## Compatibility

Official native plugin-app compatibility: `PASS`.
