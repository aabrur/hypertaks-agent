# Contributing to Hypertaks

Thanks for helping improve the Hypertaks Founder skill.

## Before you open a PR

1. **Read the skill** - `skills/hypertaks/SKILL.md` and its `references/`.
2. **Preserve the two hard rules** - the intake gate and the exactly-5-agents
   rule are the identity of the skill. Do not weaken or remove them.
3. **English only**, imperative voice, in all skill files.
4. **Keep versions in sync** - if you bump the version, update every per-agent
   manifest (`.claude-plugin`, `.codex-plugin`, `.cursor-plugin`, `.kimi-plugin`,
   `.openclaw`, `.hermes`, `.opencode`, `.pi`, `.agents/plugins`) and
   `package.json`.
5. **Validate** - the `Validate skill & manifests` workflow must pass. You can run
   the same checks locally.

## Disclosure requirement

To reduce low-quality, machine-generated PRs, every contribution must disclose:

- **Authoring environment** - which agent/tool wrote the change (e.g. Claude Code,
  Codex, Cursor, human).
- **Target agent(s)** - which agent platform(s) you tested the change against.

State both in the PR description (the PR template prompts for them).

## Scope

Focus PRs on one concern: the skill content, a specific agent manifest, or docs.
Avoid sweeping reformatting.
