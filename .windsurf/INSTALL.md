# Hypertaks for Windsurf

Windsurf does not expose a custom `/plugin install` command for Cascade packages. Hypertaks therefore uses Windsurf's native Skills UI. No Python installer is required.

## Install through the Windsurf UI

1. Open Cascade.
2. Open the three-dot **Customizations** menu.
3. Select **Skills**.
4. Choose **+ Workspace** or **+ Global**.
5. Import or copy the five canonical Hypertaks skill folders from the repository `skills/` directory.

Workspace destination:

```text
.windsurf/skills/
```

Global destination:

```text
~/.codeium/windsurf/skills/
```

## Verify

Reload Cascade and invoke:

```text
@hypertaks inspect this repository and state what remains unfinished.
```

Confirm all five skill names appear in the Skills customization panel.

## Update and uninstall

Replace only the five Hypertaks skill folders through the same Skills UI or filesystem location. Remove only those folders during uninstall. Preserve unrelated Windsurf skills, rules, workflows, and memories.

## Plugin boundary

Do not document a Windsurf `/plugin install hypertaks` command unless Windsurf publishes such a custom-plugin lifecycle. Installing the Windsurf editor extension itself is not the same as installing a Hypertaks plugin.

## Certification

Run the Windsurf section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until discovery and invocation are observed in a named Windsurf version.
