# Installing Hypertaks for Hermes

Hermes loads standard `SKILL.md` packages from `~/.hermes/skills/` and from directories explicitly listed under `skills.external_dirs` in `~/.hermes/config.yaml`.

Hypertaks is exactly five public skills. Install all five directories together:

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

## Option A: Hermes-owned skill directory

Copy the five repository skill folders into:

```text
~/.hermes/skills/
```

Each directory must preserve its complete `SKILL.md`, references, assets, and scripts.

## Option B: External canonical checkout

Point Hermes at the repository skill root:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/hypertaks-agent/skills
```

External directories are not a write-protection boundary. Use filesystem permissions when the canonical checkout must remain read-only to Hermes.

## Verify discovery

Start a fresh Hermes session and run:

```text
hermes skills list
```

Confirm all five Hypertaks skills appear. Invoke them as slash commands or through `skill_view`.

## Update

For copied skills, update the reviewed checkout and recopy the five owned directories. For an external directory, update the canonical checkout only through the safe updater:

```text
python scripts/update_hypertaks.py --check-only
python scripts/update_hypertaks.py
```

Start a new session after the update.

## Uninstall

Remove only the five Hypertaks directories or remove the approved external directory entry. Preserve unrelated Hermes skills and configuration.

## Certification

Run the Hermes section in `evals/coding-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until the lifecycle is observed in a real Hermes version.
