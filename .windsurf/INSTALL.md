# Hypertaks for Windsurf

Windsurf Cascade supports native Agent Skills with progressive loading.

## Workspace installation

From the Hypertaks repository root:

```bash
python scripts/installer.py install windsurf --scope project
```

This prepares the five canonical skill folders under:

```text
.windsurf/skills/
```

Windsurf also discovers compatible workspace skills under `.agents/skills/`.

## Global installation

Install the five skill folders under:

```text
~/.codeium/windsurf/skills/
```

Use `--scope user` only after confirming the target path on the active Windsurf version.

## Verify

Reload Cascade, then invoke the main skill explicitly:

```text
@hypertaks inspect this repository and state what remains unfinished.
```

Also confirm automatic matching with a founder-shaped natural-language request.

## Update and uninstall

Refresh the reviewed Hypertaks checkout and rerun the installation. Remove only the five Hypertaks-owned skill directories during uninstall. Preserve unrelated Windsurf skills, rules, workflows, and memories.

## Certification

Run the Windsurf section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until discovery and invocation are observed in a named Windsurf version.
