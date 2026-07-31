# Hypertaks for OpenHands

Hypertaks uses the native OpenHands plugin format. The repository includes `.plugin/plugin.json` and the root `skills/` package. No Python installer is required.

## Install plugin

Inside OpenHands CLI, install directly from GitHub:

```text
/plugin install github:aabrur/hypertaks-agent
```

For a pinned release or commit, use the supported source/ref fields in the current OpenHands plugin flow.

## Verify

```text
/plugin list
```

Confirm the `hypertaks` plugin is enabled and exposes exactly five canonical skills. Start a new conversation and test direct and natural-language invocation.

## Enable or disable

```text
/plugin enable hypertaks
/plugin disable hypertaks
```

## Update

Use the current OpenHands plugin update command or reinstall the same GitHub source at the reviewed ref. Record the exact command during live certification because the CLI surface may vary by version.

## Uninstall

```text
/plugin uninstall hypertaks
```

Do not remove unrelated OpenHands plugins, skills, hooks, MCP configuration, or repository settings.

## Skill-only fallback

OpenHands also supports `/add-skill` for individual GitHub-hosted skills. That is a fallback and does not certify the combined plugin package.

## Certification

Run the OpenHands section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named OpenHands version proves plugin install, discovery, invocation, update, uninstall, and reinstall.
