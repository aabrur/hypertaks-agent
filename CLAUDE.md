# CLAUDE.md - Hypertaks plugin repo

This repository packages the **Hypertaks Founder** skill as a cross-agent plugin.

- The skill itself lives in [`skills/hypertaks/SKILL.md`](skills/hypertaks/SKILL.md).
  Read it first - it defines the mandatory six-phase loop, Phase 0-5 (sized intake gate →
  frame → pick the tier's roles → equip → produce the agents → integrate &
  deliver) and the Dynamic Agent Allocation tiers (Lite 1 / Standard 3 /
  Prime 5 / Hyper 6–10+).
- Reference material is under `skills/hypertaks/references/` and templates under
  `skills/hypertaks/assets/`.

## Working on this repo

- Keep the skill self-contained; do not add hard dependencies on any single
  agent's tooling.
- All prose stays in **English**.
- When editing the skill, re-validate it (see `.github/workflows/validate.yml`)
  before committing.
- Manifest files in the dot-directories (`.claude-plugin`, `.codex-plugin`, etc.)
  are per-agent adapters that all point back to the single `skills/hypertaks`
  skill - keep versions in sync when bumping.
