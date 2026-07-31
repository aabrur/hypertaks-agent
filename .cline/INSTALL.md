# Hypertaks for Cline

Hypertaks uses the native Cline plugin lifecycle for Cline CLI, SDK, and Kanban. No Python installer is required.

Cline plugins are not currently available in the VS Code or JetBrains extension surfaces. Those surfaces must continue using Cline Skills until plugin support arrives.

## Install plugin from GitHub

```bash
cline plugin install --git https://github.com/aabrur/hypertaks-agent.git
```

For project-scoped installation:

```bash
cline plugin install --git https://github.com/aabrur/hypertaks-agent.git --cwd .
```

The repository `package.json` declares `plugins/cline/hypertaks.ts` as the plugin entry point. The plugin registers the five canonical Hypertaks skill documents as Cline rules and exposes the `/hypertaks` command.

## Verify

```bash
cline config
```

Confirm `hypertaks` appears in the plugin section, then start Cline and run:

```text
/hypertaks inspect this repository and state what remains unfinished
```

## Update

```bash
cline plugin install --force --git https://github.com/aabrur/hypertaks-agent.git
```

Use `--cwd .` again for a project-scoped plugin.

## Uninstall

Use the current Cline plugin management screen or remove the `hypertaks` entry from the plugin configuration shown by `cline config`. Do not remove unrelated Cline plugins, rules, skills, or provider settings.

## Extension fallback

For Cline VS Code and JetBrains, enable Skills and import the five canonical folders into `.cline/skills/`. This is a skill fallback, not plugin certification.

## Certification

Run the Cline section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep CLI/SDK plugin evidence separate from extension skill evidence.
