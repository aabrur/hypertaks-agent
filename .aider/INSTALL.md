# Hypertaks for Aider

Aider has no native Agent Skills plugin loader. Hypertaks is therefore installed as read-only project instructions and supporting skill files, not as a native plugin.

## Load directly

From the Hypertaks repository root, start Aider with the five skill files loaded read-only:

```bash
aider \
  --read skills/hypertaks/SKILL.md \
  --read skills/hypertaks-verify/SKILL.md \
  --read skills/hypertaks-brain/SKILL.md \
  --read skills/hypertaks-graph/SKILL.md \
  --read skills/hypertaks-continuity/SKILL.md
```

Inside an existing session, use `/read` for the same files.

## Persistent project configuration

Aider can always load reviewed convention files through `.aider.conf.yml`:

```yaml
read:
  - skills/hypertaks/SKILL.md
  - skills/hypertaks-verify/SKILL.md
  - skills/hypertaks-brain/SKILL.md
  - skills/hypertaks-graph/SKILL.md
  - skills/hypertaks-continuity/SKILL.md
```

Merge these entries manually into an existing configuration. Do not overwrite unrelated Aider settings or API configuration.

## Update and uninstall

Update the reviewed Hypertaks checkout, then restart Aider so the read-only files are loaded again. To uninstall, remove only the Hypertaks entries from `.aider.conf.yml` or stop passing the `--read` arguments.

## Certification

Run the Aider section in `evals/managed-agents/LIVE-CERTIFICATION.md`. The correct classification is `PROJECT_INSTRUCTIONS`; do not report native plugin certification.
