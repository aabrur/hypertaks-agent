# Hypertaks for Cline

Cline supports modular Skills, but the feature is experimental and must be enabled first.

## Enable Skills

Open Cline settings and enable:

```text
Settings -> Features -> Enable Skills
```

## Workspace installation

```bash
python scripts/installer.py install cline --scope project
```

The five canonical skills are prepared under:

```text
.cline/skills/
```

Cline also documents `.clinerules/skills/` and `.claude/skills/` as compatible project locations.

## Global installation

Place the five skill folders under:

```text
~/.cline/skills/
```

Start a new Cline session after installation or update.

## Verify

Ask Cline to use `hypertaks` explicitly, then test natural-language matching. Confirm the `use_skill` path loads the expected `SKILL.md` rather than an unrelated rule.

## Update and uninstall

Refresh the reviewed source, replace only Hypertaks-owned skill files, and start a new session. During uninstall, preserve unrelated Cline rules and skills.

## Certification

Run the Cline section in `evals/managed-agents/LIVE-CERTIFICATION.md`. The status remains `PARTIAL` until the experimental feature is verified in a named Cline version.
