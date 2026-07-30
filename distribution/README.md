# Hypertaks Distribution Foundation

Hypertaks remains one product with one canonical skill core:

```text
canonical skills + runtime policies + thin host adapters + generated packages
```

It is not converted into an MCP product. MCP remains an optional external
capability that a verified host may expose when the approved task needs it.

## Sources of truth

- `skills/` contains the five canonical public skills.
- `distribution/registry.json` records host adapter status and package routes.
- `distribution/<host>/` contains host-specific source templates only.
- `scripts/build_distributions.py` generates host-native packages from the
  canonical skills.
- `dist/` contains generated output and is never hand-edited or committed.

## Status vocabulary

- `present-needs-live-verification`: an adapter exists, but current host
  discovery and invocation still require a real host test.
- `buildable-needs-live-verification`: a deterministic package can be built,
  but installation and invocation still require a real host test.
- `planned`: no supported adapter is claimed yet.

## Antigravity replacement

Google Antigravity is the active Google agent-host target. Gemini CLI is not an
active distribution target in this registry.

The Antigravity package is generated rather than maintained as a second copy of
the skills. This prevents the plugin package and canonical skill core from
silently drifting apart.

## Build and validate

```text
python scripts/validate_distributions.py
python scripts/build_distributions.py antigravity --check-only
python -m unittest scripts.test_build_distributions -v
```

A successful structural build is not behavioral certification. Live discovery,
activation, tool mapping, update, and uninstall tests remain separate release
gates for every host.
