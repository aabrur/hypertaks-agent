# Hypertaks for GitHub Copilot

GitHub Copilot supports installable plugin directories and Agent Skills. Hypertaks preserves exactly five public skills.

## Option A: local Copilot plugin

Prepare the plugin directory from the repository clone:

```bash
python scripts/installer.py install github-copilot --scope project
copilot plugin install ./.github-copilot
```

Confirm the plugin and skills:

```text
copilot plugin list
/skills list
```

The plugin directory must contain `plugin.json` and `.github-copilot/skills/` with all five canonical skill folders.

## Option B: repository Agent Skills

Copy the five canonical skill directories into:

```text
.github/skills/
```

Copilot also supports compatible project skills under `.agents/skills/` and personal skills under `~/.copilot/skills/` or `~/.agents/skills/`.

## Update

Update the reviewed Hypertaks checkout, rerun the staging install, then use the current Copilot plugin update flow or reinstall the local plugin. Start a new session before verifying changed skill content.

## Uninstall

Remove the plugin through the current Copilot plugin command, or remove only the five Hypertaks-owned directories from the selected Agent Skills root. Preserve unrelated Copilot configuration and skills.

## Certification

Run the GitHub Copilot section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named Copilot version proves discovery, invocation, update, uninstall, and reinstall.
