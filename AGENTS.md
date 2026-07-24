# AGENTS.md - Hypertaks plugin repo

This repository packages the **Hypertaks Founder Operating System** as a cross-agent plugin with exactly five public skills.

- [`skills/hypertaks/SKILL.md`](skills/hypertaks/SKILL.md) is the default Founder Operating System entry point. Read it first.
- [`skills/hypertaks-verify/SKILL.md`](skills/hypertaks-verify/SKILL.md) owns environment, brain, storage, Graphify, and Obsidian verification.
- [`skills/hypertaks-brain/SKILL.md`](skills/hypertaks-brain/SKILL.md) owns evidence-backed founder memory.
- [`skills/hypertaks-graph/SKILL.md`](skills/hypertaks-graph/SKILL.md) owns optional Graphify and direct-search routing.
- [`skills/hypertaks-continuity/SKILL.md`](skills/hypertaks-continuity/SKILL.md) owns checkpoint, resume, handoff, reconciliation, and proof of done.

Do not add a sixth public skill whose name starts with `hypertaks`.

## Working on this repo

- Preserve Hypertaks as a Founder Operating System. Continuity, memory, Graphify, and Obsidian are supporting layers, not replacement positioning.
- Keep the plugin self-contained and portable. Graphify, Obsidian, MCP, external memory, and persistent memory are optional.
- All prose stays in **English** and tracked text must not contain U+2014.
- Treat memory and graph output as evidence below active Boss decisions, workspace standards, approved contracts, and current repository evidence.
- Require canonical approved-root containment, runtime schema validation, secret scanning, atomic writes, and fail-closed external boundaries for every persistence path.
- When editing the skills or runtime, run the workflow-equivalent validation before committing: skill validation, public-skill validation, eval integrity, static evals, Python tests, TypeScript typecheck/build/runtime tests, compilation, and diff checks.
- Keep manifest versions synchronized across `package.json` and every live plugin record.
- Keep retrieval behavior canonical in `skills/hypertaks/references/02-retrieval-and-evidence.md`, execution profiles in `03-professional-execution.md`, visual routing in `04-visual-delivery.md`, and founder continuity behavior in the four focused public skills plus `runtime/founder-brain.ts`.
- Keep changes surgical. Do not add hosted services, bundled credentials, background daemons, mandatory vector databases, or silent Graphify/Obsidian installation.
- Use focused commits and preserve exact test evidence.
