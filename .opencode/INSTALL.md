# Installing Hypertaks for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add hypertaks to the `plugin` array in your `opencode.json` (global or
project-level):

```json
{
  "plugin": ["hypertaks@git+https://github.com/aabrur/hypertaks-agent.git"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager and
registers the skill.

Verify by asking: *"Hypertaks, analyze why our churn is high."* - it should run
the intake gate first, announce the tier (Prime for this task), then spawn the
tier's specialist agents.

## Pinning a version

```json
{
  "plugin": ["hypertaks@git+https://github.com/aabrur/hypertaks-agent.git#v1.0.0"]
}
```

## Usage

Use OpenCode's native `skill` tool:

```
use skill tool to list skills
use skill tool to load hypertaks
```

## Tool mapping

The skill speaks in actions. On OpenCode they resolve to:

- Ask the user (Phase 0 intake gate) → present options; if a question tool is
  available use it, otherwise ask inline.
- Spawn the tier's agents (Phase 4) → `task` tool with `subagent_type: "general"`
  (or `"explore"` for read-only research roles).
- Invoke a skill → OpenCode's native `skill` tool.
- Read a file → `read`; create/edit/delete → `apply_patch`; run a shell command
  → `bash`; search contents / find files → `grep`, `glob`; fetch a URL →
  `webfetch`.

## Troubleshooting

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i hypertaks`
2. Verify the plugin line in your `opencode.json`.
3. Make sure you are running a recent version of OpenCode.

## Getting help

- Issues: https://github.com/aabrur/hypertaks-agent/issues
