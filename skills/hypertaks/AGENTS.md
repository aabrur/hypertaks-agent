# AGENTS.md

Guidance for any AI agent (Claude Code, Codex, Cursor, Kimi Code, OpenClaw,
Hermes, OpenCode, Pi) working in this repository.

## What this repo is

A cross-agent plugin that ships exactly five public Hypertaks skills:

1. `skills/hypertaks` for the main Founder Operating System flow.
2. `skills/hypertaks-verify` for environment, brain, storage, and capability verification.
3. `skills/hypertaks-brain` for evidence-backed founder memory.
4. `skills/hypertaks-graph` for optional Graphify and direct-search routing.
5. `skills/hypertaks-continuity` for checkpoint, resume, handoff, reconciliation, and proof of done.

Do not create a sixth public skill whose name starts with `hypertaks`.

## Routing rule

The main `hypertaks` skill remains the default entry point. It routes setup work
to `hypertaks-verify`, durable memory work to `hypertaks-brain`, structural code
questions to `hypertaks-graph`, and session lifecycle work to
`hypertaks-continuity`. Users may also invoke those four focused skills directly.

Graphify, Obsidian, MCP, and persistent memory remain optional. Current
repository evidence and active Boss decisions outrank historical memory. No
memory or graph output can approve an action.

## Ground rules

1. Read `skills/hypertaks/SKILL.md` and the affected focused skill before changing behavior.
2. Use English and imperative voice in skill files.
3. Keep the main Founder Operating System invariants intact: sized intake,
   deterministic tiering, distinct roles, explicit contracts, evidence classes,
   and no silent deviation.
4. Keep every per-agent manifest version in sync with
   `.claude-plugin/plugin.json` and `package.json`.
5. Validate before committing. Run the workflow-equivalent checks, including
   public-skill validation, eval integrity, static evals, Python tests, runtime
   tests, and compilation.
6. Keep retrieval, execution, visuals, security, founder continuity, and
   capability routing canonical in their owning references or focused skills.
   Adapters may translate host tools but may not weaken authority, permissions,
   approved-root containment, secret handling, or proof requirements.
7. Disclose the authoring environment and target agent in any pull request.

## Contributing

See `.github/CONTRIBUTING.md`.
