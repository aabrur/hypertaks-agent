# Hypertaks Plugin for OpenCode

## Install

Add the tracked local plugin module to `opencode.json`:

```json
{
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/.opencode/plugins/hypertaks.ts"
  ]
}
```

The plugin package continues to expose exactly five canonical Hypertaks skills from the repository `skills/` directory.

## Update

Update the reviewed Hypertaks checkout and restart OpenCode.

## Uninstall

Remove only the Hypertaks file URL from the OpenCode plugin array.

## Compatibility

Official native plugin compatibility: `PASS`.
