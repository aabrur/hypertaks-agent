# Hypertaks for Google Antigravity

This directory is the source template for the generated Antigravity plugin. The
five public skills remain canonical under the repository `skills/` directory.
Do not edit generated skill copies by hand.

## Build

From the repository root:

```text
python scripts/build_distributions.py antigravity
```

The command creates:

```text
dist/antigravity/hypertaks/
├── plugin.json
├── BUILD-MANIFEST.json
├── assets/                  # Present only when a canonical SVG is configured
└── skills/
    ├── hypertaks/
    ├── hypertaks-verify/
    ├── hypertaks-brain/
    ├── hypertaks-graph/
    └── hypertaks-continuity/
```

The package intentionally contains no `mcp_config.json` and no `hooks.json`.
Hypertaks may use a verified MCP capability supplied by the host when a task
requires it, but MCP is not the product identity and no MCP server is bundled.

## Install

Copy the generated `hypertaks` directory to one Antigravity plugin location:

- Workspace: `<workspace>/.agents/plugins/hypertaks/`
- Global: `~/.gemini/config/plugins/hypertaks/`

Start a new conversation after installation and ask Antigravity to list the
available Hypertaks skills. Confirm that exactly five public skills are found.

## Brand asset

The builder only copies the exact tracked SVG configured in
`distribution/registry.json`. It never traces the PNG preview, redraws the mark,
or generates a substitute. Marketplace publication remains blocked until the
canonical SVG path is configured and verified.
