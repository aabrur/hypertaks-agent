# CLAUDE.md - Hypertaks plugin repo

This repository packages the **Hypertaks Founder Operating System** as a cross-agent plugin with exactly five public skills.

- Read [`skills/hypertaks/SKILL.md`](skills/hypertaks/SKILL.md) first. It remains the default entry point and owns the Founder loop.
- `skills/hypertaks-verify` owns environment and destination verification.
- `skills/hypertaks-brain` owns evidence-backed founder memory.
- `skills/hypertaks-graph` owns optional Graphify and direct-search behavior.
- `skills/hypertaks-continuity` owns checkpoints, resume, handoff, reconciliation, and proof of done.

Do not create a sixth public skill whose name starts with `hypertaks`.

## Working on this repo

- Preserve the Founder Operating System positioning and its intake, contract, tier, evidence, and execution invariants.
- Keep Graphify, Obsidian, MCP, external memory, and persistent memory optional.
- Treat memory and graph output as evidence, never authority or approval.
- Keep every persistence operation inside an approved root. Validate record IDs and schemas, scan for secrets, and write atomically.
- Keep all prose in English and do not use U+2014 in tracked text.
- Run the workflow-equivalent validation before claiming completion.
- Keep all live manifest versions synchronized with `package.json`.
- Keep changes surgical and avoid hosted services, mandatory databases, credentials, background daemons, silent installation, and unsupported claims.
