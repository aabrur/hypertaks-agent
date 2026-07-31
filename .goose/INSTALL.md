# Hypertaks for Goose

Goose supports skills, recipes, and MCP extensions. Goose does not expose a generic `/plugin install` command for Hypertaks packages, so Wave 3 uses the native Skills Marketplace or a reviewed recipe. No Python installer is required.

## Skills Marketplace

Use the current Goose Skills Marketplace flow when available. Select or import the five canonical Hypertaks skills from the repository.

For compatible local skill discovery, use:

```text
.agents/skills/
```

For a user-wide shared installation, use:

```text
~/.agents/skills/
```

## Recipe path

A reviewed Goose recipe may reference the Hypertaks instructions and required extensions. Keep recipes declarative, inspect every extension, and do not bundle optional MCP capabilities unless the user approved them.

## Verify

Start a new Goose session and confirm the installed skills or recipe are visible. Invoke `hypertaks` directly and test a natural-language founder task.

## Update and uninstall

Update through the same Skills Marketplace or recipe mechanism used for installation. Remove only Hypertaks-owned assets and preserve unrelated Goose extensions, recipes, and configuration.

## Plugin boundary

Do not document `/plugin install hypertaks` unless Goose publishes that exact lifecycle. Goose extensions are MCP integrations and are not interchangeable with the Hypertaks instruction package.

## Certification

Run the Goose section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Status remains `PARTIAL` until install, discovery, invocation, update, uninstall, and reinstall are observed in a named Goose version.
