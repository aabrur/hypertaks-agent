# Hypertaks for Kilo Code

Hypertaks uses a native Kilo TypeScript plugin. No Python installer is required.

## Install the repository plugin

Clone Hypertaks to a stable location, then register the plugin file in the project `kilo.json` or `.kilo/opencode.jsonc`:

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/plugins/kilo/hypertaks.ts"
  ]
}
```

The plugin injects the five canonical Hypertaks skill documents through Kilo's native plugin hook.

Kilo's `kilo plugin <module>` command installs npm modules only. Do not use `kilo plugin hypertaks` until a Hypertaks Kilo npm package has actually been published.

## Verify

```bash
kilo config check
kilo --print-logs --log-level DEBUG
```

Start a new Kilo session and confirm the `hypertaks` plugin loads without an error. Invoke Hypertaks in natural language or through the canonical skill name.

## Update

Update the reviewed Hypertaks checkout in its stable location, then restart Kilo or run:

```text
/reload
```

## Uninstall

Remove only the Hypertaks plugin entry from the Kilo configuration. Preserve unrelated plugins and settings.

## Future registry command

After an npm package is published and verified, installation may use:

```bash
kilo plugin <published-hypertaks-package>
```

That command is intentionally not presented as available before publication.

## Certification

Run the Kilo Code section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named Kilo version proves plugin loading, invocation, update, uninstall, and reinstall.
