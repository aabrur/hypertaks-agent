# Hypertaks for Roo Code

Roo Code supports native Agent Skills with project, global, cross-agent, and mode-specific discovery.

## Workspace installation

```bash
python scripts/installer.py install roo-code --scope project
```

The preferred Roo-specific project root is:

```text
.roo/skills/
```

Roo also discovers cross-agent skills under:

```text
.agents/skills/
```

## Global installation

Place the five canonical skill folders under:

```text
~/.roo/skills/
```

or the cross-agent root `~/.agents/skills/` when intentional sharing is desired.

## Verify

Confirm all five skill IDs are indexed in the selected Roo mode. Ask Roo to use `hypertaks` explicitly and then test automatic matching.

Project Roo-specific skills override global and cross-agent copies with the same name. Avoid duplicate conflicting installations.

## Update and uninstall

Refresh only the Hypertaks-owned files. Roo file watchers may detect changes, but start a new task when validating updated behavior. Remove only the five Hypertaks directories during uninstall.

## Certification

Run the Roo Code section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until the full lifecycle is captured in a named Roo Code version.
