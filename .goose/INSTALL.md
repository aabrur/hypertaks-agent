# Hypertaks for Goose

Goose supports skills, recipes, and MCP extensions. Wave 3 treats Hypertaks as a skill or recipe package and does not claim that editing `.goose/config.yaml` alone installs it.

## Skill path

Use the current Goose Skills Marketplace flow when available, or place the five canonical skill folders in the compatible cross-agent root:

```text
.agents/skills/
```

For a user-wide shared installation, use:

```text
~/.agents/skills/
```

Record the exact Goose version and installation mechanism because Goose distribution surfaces can evolve independently.

## Recipe path

A reviewed Goose recipe may reference the Hypertaks instructions and required extensions. Keep recipes declarative, inspect every extension, and do not bundle optional MCP capabilities unless the user approved them.

## Verify

Start a new Goose session and confirm the installed skills or recipe are visible. Invoke `hypertaks` directly and test a natural-language founder task.

## Update and uninstall

Update through the same skill or recipe mechanism used for installation. Remove only Hypertaks-owned assets and preserve unrelated Goose extensions, recipes, and configuration.

## Certification

Run the Goose section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Status remains `PARTIAL` until install, discovery, invocation, update, uninstall, and reinstall are observed in a named Goose version.
