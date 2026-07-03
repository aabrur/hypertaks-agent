**Full Changelog**: https://github.com/aabrur/hypertaks-agent/commits/v2.0.0

# Release Notes

## v2.0.0 - Extended knowledge base

Adds the **Encyclopedia of Applied Knowledge** as
`references/knowledge-base.md` - a 1,600+ item catalog of theories, methods,
frameworks, and workflows across business, learning, science, and technology
(JTBD, Kano, RICE, Cynefin, OKR, PESTLE, DDD, MLOps, distributed-systems
consistency models, EIP standards, sales methodologies, mental models, and
far more).

- **Lazy-loaded by design** - the catalog is grepped by keyword/domain in
  Phase 3, never loaded whole, so it adds zero context cost on any AI surface.
- **Same output-shape law** - items pulled from the catalog must define the
  shape their application returns, just like the core frameworks.
- **Integrator lens** - Phase 5 reconciliation now explicitly uses Systems
  Thinking + Cynefin (coherent, blind-spot-free, executable).
- **Retrospective** - Prime/Hyper deliverables close with a 2–3 line
  post-run retrospective (continuous improvement loop).
- Note: the catalog's item names are English; some annotations are Indonesian.
  Treat item names as the lookup key. Sections 5–10 promised by its index are
  folded into the section-4 catalog.

<img width="1200" height="764" alt="Figure_1" src="https://github.com/user-attachments/assets/3a98d406-520c-43a0-838d-76d5802b5c7a" />

## v2.0.0 - Hypertaks: dynamic tiering & enforcement

<img width="1442" height="700" alt="Figure_2" src="https://github.com/user-attachments/assets/0d0fe09a-e625-478e-864b-b5e0221e77ac" />

Breaking behavior change, driven by two independent AI reviews that found the
same failure pattern: the protocol was well-designed but easy to abandon
silently (references unread, frameworks name-dropped without their output
shapes, "exactly 5" quietly dropped after the first turn, work logs omitted).

### Highlights

<img width="1442" height="764" alt="Figure_3" src="https://github.com/user-attachments/assets/4bfea23a-6175-48cf-8356-77b990f0f814" />

- **Dynamic Agent Allocation replaces "exactly 5, always"** - the intake gate
  now assesses every task into a tier that fixes the agent count: **Lite** (1,
  Founder solo), **Standard** (3), **Prime** (5 - the classic default), and
  **Hyper** (6–10+ for multi-workstream programs, scaled by splitting roles and
  adding QA/red-team, never by padding).
- **Sized intake gate** - **Express** mode (3 highest-leverage dimensions,
  one-line contract) for Lite/Standard; **Deep** mode (all 8 dimensions) for
  Prime/Hyper. The gate is never skipped, only sized.
- **Explicit follow-up rule** - a continuation inside a confirmed contract runs
  as Lite with a one-line announcement; new scope means a new loop. Silent
  reclassification is the violation, not the downgrade itself.
- **Framework output-shape law** - naming a framework obliges producing its
  defined output shape (rated Five Forces table, SWOT 2×2 + TOWS, ERRC grid,
  6M fishbone tree, ranked Pareto list, TOC 5 steps). Label-dropping counts as
  not having used the framework.
- **Mandatory reference reads** - Phases 2–3 require reading `agent-roles.md`,
  `frameworks.md`, `plugins-and-mcp.md` (and `engineering.md` for builds) this
  session; working from memory of them is a violation.
- **Red-flags table** - anti-rationalization counters seeded with the exact
  excuses observed in review ("this is just a follow-up", "I know what SWOT
  means", "the full gate is overkill").
- **Compliance footer + mandatory work log** - every deliverable, every tier,
  ends with a self-check (tier announced? references read? output shapes
  delivered? evidence attached?) and the Daily-note log (one-line variant for
  Lite).
- **Engineering quality gate hardened** - test evidence, systematic debugging,
  and verification-before-completion are now a hard gate for any code
  deliverable; Web3 additionally passes the audit checklist before "done".
- **New QA / Red-Team / Verifier role** (role 15) for Hyper lineups.
- **CSO fix** - the SKILL.md frontmatter description now states only the
  triggering conditions, not the workflow, so agents read the body instead of
  shortcutting from the description.

## v1.1.0 - Cross-surface portability

Makes the skill run correctly on AI surfaces with no agent/task-spawning tool
(claude.ai chat, other assistants, bare API access), not just Claude Code.

### Highlights

- **Environment modes** - a new `SKILL.md` section makes Phase 4 detect
  whether an Agent/Task-spawning tool is available. **Orchestrated mode**
  spawns 5 real subagents (unchanged Claude Code behavior). **Synthesized
  mode** produces all 5 role perspectives directly in one response, in the
  role's voice, with no fabricated tool calls - used automatically wherever
  no spawning tool exists.
- **Portable intake gate** - Phase 0 falls back to plain numbered chat
  questions when `AskUserQuestion` is unavailable; the gate itself is never
  skipped, only its UI changes.
- **Optional vault logging** - Phase 5's Daily-note log now only writes to
  the local Obsidian vault when filesystem/MCP access exists; otherwise the
  same log snippet is included inline in the deliverable for manual pasting.
- No change to the 5-phase loop's discipline: intake gate, exactly 5 roles,
  auto-detected equipping, and integrated deliverable all still apply on
  every surface.

## v1.0.0 - Initial release

First public release of **Hypertaks Founder**, a founder/CEO-grade operating
skill packaged as a cross-agent plugin.

### Highlights

- **Intake gate first** - every task starts with a structured verification round;
  no work begins until the request is confirmed as a one-paragraph task contract.
- **Exactly 5 agents, always** - after the gate, the skill spawns precisely 5
  specialist agents chosen for the task, each equipped with the right frameworks
  plus auto-detected plugins/skills and MCP connectors.
- **Full domain coverage** - business strategy, full-spectrum engineering
  (web, backend, mobile, data, and deep **Solidity/Web3** smart contracts),
  marketing, copywriting, finance, ERP, supply chain, supply chain finance, and
  IoT.
- **Frameworks** - Porter's Five Forces, SWOT/TOWS, Pareto, Fishbone, Blue Ocean
  (ERRC), Red Apples & Bad Barrels, Theory of Constraints, SCOR, Supply Chain
  Finance, ERP, smart contracts, and IoT.

### Skill contents

- `skills/hypertaks/SKILL.md` - the 5-phase orchestrator loop.
- `references/intake-protocol.md` - the Phase 0 verification gate.
- `references/agent-roles.md` - 14-role pool, the "pick exactly 5" heuristics,
  and plugin/MCP auto-detection.
- `references/frameworks.md` - applied how-to for every framework.
- `references/engineering.md` - full-spectrum coding + Solidity/Web3 deep dive.
- `references/plugins-and-mcp.md` - live inventory of plugins/MCP connectors.
- `assets/agent-brief-template.md`, `assets/deliverable-template.md` - templates.

### Cross-agent install

Verified manifests / install paths for:

- **Claude Code** - `.claude-plugin/plugin.json` + `marketplace.json`
- **Codex** - `.codex-plugin/plugin.json`
- **Cursor** - `.cursor-plugin/plugin.json`
- **Kimi Code** - `.kimi-plugin/plugin.json`
- **OpenCode** - `.opencode/INSTALL.md` (git-backed plugin spec)
- **Pi** - `.pi/extensions/hypertaks.ts`
- **OpenClaw / Hermes / any scanned-skills agent** - `.openclaw/INSTALL.md`,
  `.hermes/INSTALL.md` (generic copy/symlink, no assumed workspace layout)

### Notes

Manifest field shapes follow the proven cross-agent conventions; adjust per-agent
fields if a specific agent version's schema differs.
