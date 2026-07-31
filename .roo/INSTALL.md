# Hypertaks for Roo Code

Roo Code does not expose a documented custom `/plugin install` lifecycle for Hypertaks packages. Hypertaks therefore uses Roo's native Agent Skills discovery. No Python installer is required.

## Install as Roo skills

Place the five canonical Hypertaks skill folders under the project root:

```text
.roo/skills/
```

Roo also discovers compatible cross-agent skills under:

```text
.agents/skills/
```

For a global installation, use:

```text
~/.roo/skills/
```

or `~/.agents/skills/` when intentional sharing is desired.

## Verify

Start a new Roo task, confirm all five skill IDs are indexed in the selected mode, then request `hypertaks` explicitly and test automatic matching.

## Update and uninstall

Replace only the five Hypertaks-owned skill folders. Remove only those folders during uninstall. Preserve unrelated Roo modes, rules, MCP settings, and skills.

## Plugin boundary

Do not publish a Roo `/plugin install hypertaks` command until Roo documents and supports that lifecycle. Native Skills are the supported installation mechanism for this adapter.

## Certification

Run the Roo Code section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until the full lifecycle is captured in a named Roo Code version.
