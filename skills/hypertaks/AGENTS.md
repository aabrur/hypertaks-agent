# AGENTS.md

Guidance for any AI agent (Claude Code, Codex, Cursor, Kimi Code, OpenClaw,
Hermes, opencode, Pi) working in this repository.

## What this repo is

A cross-agent plugin that ships one skill: **Hypertaks Founder**
(`skills/hypertaks`). Each agent platform has its own manifest directory that
loads the same skill.

## Ground rules

1. Read `skills/hypertaks/SKILL.md` before changing behavior.
2. English only, imperative voice in the skill files.
3. The three hard rules of the skill are non-negotiable: always run the intake
   gate first (sized Express/Deep, never skipped), always produce the announced
   tier's agent count (Lite 1 / Standard 3 / Prime 5 / Hyper 6–10+), and never
   deviate silently (tier, gate mode, and framework output shapes are
   announced and enforced). Do not weaken these.
4. Keep every per-agent manifest's `version` in sync with
   `.claude-plugin/plugin.json` and `package.json`.
5. Validate the skill before committing (`.github/workflows/validate.yml` runs
   the same checks in CI), including retrieval utility tests and `npm test` for
   TypeScript runtime changes.
6. Retrieval, execution, and visual behavior stays canonical in references
   `02`, `03`, and `04`; adapters may translate host tools but may not weaken
   those rules.
7. Disclose your authoring environment and target agent in any PR.

## Contributing

See `.github/CONTRIBUTING.md`.
