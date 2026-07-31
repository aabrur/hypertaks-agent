# Hypertaks for GitHub Copilot

Hypertaks uses the native Copilot plugin lifecycle. No Python installer is required.

## Install from Copilot CLI

```bash
copilot plugin install aabrur/hypertaks-agent
```

Inside an interactive Copilot CLI session, the equivalent command is:

```text
/plugin install aabrur/hypertaks-agent
```

Copilot discovers the repository `.plugin/plugin.json` manifest and the root `skills/` directory.

## Verify

```bash
copilot plugin list
```

Inside Copilot CLI:

```text
/plugin list
/skills list
```

Confirm the `hypertaks` plugin and exactly five canonical Hypertaks skills are present.

## Update

```bash
copilot plugin update hypertaks
```

Or interactively:

```text
/plugin update hypertaks
```

Reload skills after updating:

```text
/skills reload
```

## Uninstall

```bash
copilot plugin uninstall hypertaks
```

Or interactively:

```text
/plugin uninstall hypertaks
```

## Certification

Run the GitHub Copilot section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named Copilot version proves discovery, invocation, update, uninstall, and reinstall.
