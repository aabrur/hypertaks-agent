# Hypertaks for Google Antigravity

This directory is the source template for the generated Antigravity plugin. The
five public skills remain canonical under the repository `skills/` directory.
Do not edit generated skill copies by hand.

## Clone and build

```text
git clone https://github.com/aabrur/hypertaks-agent.git
cd hypertaks-agent
python scripts/build_distributions.py antigravity
```

The command creates:

```text
dist/antigravity/hypertaks/
├── plugin.json
├── BUILD-MANIFEST.json
├── assets/
│   └── hypertaks.svg
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

## Validate before installation

```text
python scripts/validate_distributions.py
python scripts/build_distributions.py antigravity --check-only
python -m unittest scripts.test_build_distributions -v
```

## Brand asset

The canonical project asset is `assets/Hypertask.svg`. The builder copies that
exact Git-tracked SVG to `assets/hypertaks.svg` inside the generated package and
records its SHA-256 digest in `BUILD-MANIFEST.json`. It never traces the PNG
preview, redraws the mark, or generates a substitute.
