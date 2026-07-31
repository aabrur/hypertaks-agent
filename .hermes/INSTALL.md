# Hypertaks Plugin for Hermes

The repository root contains `plugin.yaml` and `__init__.py`, which register the five canonical Hypertaks skills through the Hermes plugin API.

## Install

```bash
hermes plugins install aabrur/hypertaks-agent --enable
```

## Manage

```bash
hermes plugins list
hermes plugins update hypertaks
hermes plugins enable hypertaks
hermes plugins disable hypertaks
hermes plugins remove hypertaks
```

Inside a Hermes session, `/plugins` shows the loaded plugin state.

## Compatibility

Official native plugin compatibility: `PASS`.
