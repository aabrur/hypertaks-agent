# Release Notes

## v1.0.0 — Initial release

First public release of **Hypertaks Founder**, a founder/CEO-grade operating
skill packaged as a cross-agent plugin.

### Highlights

- **Intake gate first** — every task starts with a structured verification round;
  no work begins until the request is confirmed as a one-paragraph task contract.
- **Exactly 5 agents, always** — after the gate, the skill spawns precisely 5
  specialist agents chosen for the task, each equipped with the right frameworks
  plus auto-detected plugins/skills and MCP connectors.
- **Full domain coverage** — business strategy, full-spectrum engineering
  (web, backend, mobile, data, and deep **Solidity/Web3** smart contracts),
  marketing, copywriting, finance, ERP, supply chain, supply chain finance, and
  IoT.
- **Frameworks** — Porter's Five Forces, SWOT/TOWS, Pareto, Fishbone, Blue Ocean
  (ERRC), Red Apples & Bad Barrels, Theory of Constraints, SCOR, Supply Chain
  Finance, ERP, smart contracts, and IoT.

### Skill contents

- `skills/hypertaks/SKILL.md` — the 5-phase orchestrator loop.
- `references/intake-protocol.md` — the Phase 0 verification gate.
- `references/agent-roles.md` — 14-role pool, the "pick exactly 5" heuristics,
  and plugin/MCP auto-detection.
- `references/frameworks.md` — applied how-to for every framework.
- `references/engineering.md` — full-spectrum coding + Solidity/Web3 deep dive.
- `references/plugins-and-mcp.md` — live inventory of plugins/MCP connectors.
- `assets/agent-brief-template.md`, `assets/deliverable-template.md` — templates.

### Cross-agent install

Verified manifests / install paths for:

- **Claude Code** — `.claude-plugin/plugin.json` + `marketplace.json`
- **Codex** — `.codex-plugin/plugin.json`
- **Cursor** — `.cursor-plugin/plugin.json`
- **Kimi Code** — `.kimi-plugin/plugin.json`
- **OpenCode** — `.opencode/INSTALL.md` (git-backed plugin spec)
- **Pi** — `.pi/extensions/hypertaks.ts`
- **OpenClaw / Hermes / any scanned-skills agent** — `.openclaw/INSTALL.md`,
  `.hermes/INSTALL.md` (generic copy/symlink, no assumed workspace layout)

### Notes

Manifest field shapes follow the proven cross-agent conventions; adjust per-agent
fields if a specific agent version's schema differs.
