# Installing Hypertaks for OpenClaw

OpenClaw loads standard `SKILL.md` packages from workspace skill roots, including `<workspace>/skills` and `<workspace>/.agents/skills` where supported by the active profile.

Hypertaks is exactly five public skills. Install all five directories together:

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

## Project installation

Clone the repository, then copy or link the complete contents of the repository `skills/` directory into one OpenClaw workspace skill root. The resulting layout must contain:

```text
<workspace>/.agents/skills/hypertaks/SKILL.md
<workspace>/.agents/skills/hypertaks-verify/SKILL.md
<workspace>/.agents/skills/hypertaks-brain/SKILL.md
<workspace>/.agents/skills/hypertaks-graph/SKILL.md
<workspace>/.agents/skills/hypertaks-continuity/SKILL.md
```

Use a normal file copy for the public installation path. A managed link may be used only when the user explicitly chooses developer mode and understands that changes in the source checkout become immediately visible.

## Verify discovery

Run the current OpenClaw skill listing command:

```text
openclaw skills list --json
```

Confirm all five skills are present and eligible for the selected agent profile. Start a new session before testing invocation.

## Update

Use OpenClaw's tracked skill update when the installation came from a supported source, or update the reviewed canonical checkout:

```text
python scripts/update_hypertaks.py --check-only
python scripts/update_hypertaks.py
```

Reconcile the five destination folders after the source update, then restart the session.

## Uninstall

Remove only the five Hypertaks directories. Do not delete the containing skill root or unrelated skills.

## Certification

Run the OpenClaw section in `evals/coding-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a real OpenClaw session proves discovery, invocation, update, uninstall, and reinstall.
