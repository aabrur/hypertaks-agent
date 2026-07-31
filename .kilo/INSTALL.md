# Hypertaks Plugin for Kilo Code

## Install

Register the tracked local plugin module in `kilo.json` or `.kilo/opencode.jsonc`:

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/plugins/kilo/hypertaks.ts"
  ]
}
```

## Update

Update the reviewed Hypertaks checkout and run:

```text
/reload
```

## Uninstall

Remove only the Hypertaks file URL from the Kilo plugin array.

## Compatibility

Official native plugin compatibility: `PASS`.
