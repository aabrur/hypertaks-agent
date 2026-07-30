# Hypertaks ChatGPT App Adapter Installation

## Prerequisites
- ChatGPT Plus, Team, or Enterprise account
- Node.js 18+ (for local MCP transport runner)

## Setup Steps
1. Enable Developer Mode / Custom GPT / Apps SDK in ChatGPT settings.
2. Register the Hypertaks MCP adapter server (`runtime/mcp_server.js`).
3. Import the system instructions referencing the five canonical skills.
4. Verify read-only operations pass without prompt, and write operations request confirmation.
