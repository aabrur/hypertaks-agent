# Hypertaks

**Founder/CEO-grade operating skill for AI coding agents.** Hypertaks turns your
agent into the *Hypertaks Founder* — it runs a **sized intake gate** (Express or
Deep) to lock the request, then spawns a **dynamically tiered team of specialist
agents** for the task, each equipped with the right business frameworks plus the
plugins/skills and MCP connectors available in your environment.

Domains covered: business strategy, full-spectrum engineering (web, backend,
mobile, data, and **deep Solidity/Web3 smart contracts**), marketing, copywriting,
finance, ERP, supply chain, supply chain finance, and IoT.

## Three hard rules

1. **Intake gate first, sized to the task** — every task starts with a
   verification round (Express for light tasks, Deep for heavy ones); no work
   begins until the request is unambiguous and confirmed. The gate is never
   skipped, only sized.
2. **Dynamic Agent Allocation** — the gate assesses the task into a tier that
   fixes the agent count:

   | Tier | Agents | Typical task |
   |------|--------|--------------|
   | Lite | 1 | typo fix, one copy tweak, follow-up inside a confirmed contract |
   | Standard | 3 | 2–3 domains, one deliverable |
   | Prime | 5 | classic founder-shaped cross-domain work |
   | Hyper | 6–10+ | multi-workstream programs (launches, company-wide diagnosis) |

3. **No silent deviation** — tier, gate mode, and assumptions are announced in
   the task contract; frameworks must be delivered in their defined output
   shapes (a rated Five Forces table, an ERRC grid, a 6M fishbone tree — not
   just the name); every deliverable ends with a compliance footer and a work
   log.

## Frameworks

Porter's Five Forces · SWOT/TOWS · Pareto (80/20) · Fishbone (Ishikawa) · Blue
Ocean (ERRC) · Red Apples & Bad Barrels · Theory of Constraints (bottleneck) ·
SCOR supply chain · Supply Chain Finance · ERP · Smart contracts · IoT.

## Install

This repo is a cross-agent plugin. Every agent loads the single skill under
[`skills/hypertaks`](skills/hypertaks); each agent just has its own way of
discovering it. Install per agent below — everyone runs their own flow, so no
particular workspace layout is assumed.

### Claude Code

```
/plugin marketplace add aabrur/hypertaks-agent
/plugin install hypertaks@hypertaks-marketplace
```

### Codex CLI

```
/plugins
```

Search for `hypertaks` and choose **Install Plugin**.

### Cursor

```
/add-plugin hypertaks
```

Or search for "hypertaks" in the marketplace.

### Kimi Code

```
/plugins install https://github.com/aabrur/hypertaks-agent
```

Or open `/plugins` → Marketplace → Hypertaks.

### OpenCode

Follow [`.opencode/INSTALL.md`](.opencode/INSTALL.md) — add
`"hypertaks@git+https://github.com/aabrur/hypertaks-agent.git"` to the `plugin`
array in your `opencode.json`.

### Pi

```bash
pi install git:github.com/aabrur/hypertaks-agent
```

### OpenClaw / Hermes / any other agent

These agents load skills from a skills directory they scan on startup — the
location depends on *your* setup. Clone this repo and make `skills/hypertaks`
visible in that directory (copy or symlink/junction). See
[`.openclaw/INSTALL.md`](.openclaw/INSTALL.md) and
[`.hermes/INSTALL.md`](.hermes/INSTALL.md) for exact commands. The same generic
approach works for any agent with a scanned skills folder.

### Manifest map

| Agent | Manifest / install |
|-------|--------------------|
| Claude Code | `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` |
| Codex | `.codex-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |
| Kimi Code | `.kimi-plugin/plugin.json` |
| OpenCode | `.opencode/INSTALL.md` (git-backed plugin spec) |
| Pi | `.pi/extensions/hypertaks.ts` |
| OpenClaw / Hermes / others | `.openclaw/INSTALL.md`, `.hermes/INSTALL.md` (generic copy/symlink) |
| Cross-agent index | `.agents/plugins/hypertaks.json` |

## Usage

Just address the founder:

- *"Hypertaks, fix the headline typo."* → **Lite** (Founder solo, Express gate).
- *"Hypertaks, add a pricing table + its copy."* → **Standard** (Engineer,
  Copywriting, Integrator).
- *"Hypertaks, why is our churn high?"* → **Prime** analysis lineup (Strategy,
  Finance, Marketing, Ops, Integrator).
- *"Hypertaks, launch the product: contract + app + GTM + legal."* → **Hyper**
  (6–10+ agents, one per workstream).

The skill asks its intake questions first, confirms a task contract that names
the tier, then produces the tier's agents and delivers one founder-grade result
ending with a compliance footer and work log.

## Repo layout

```
hypertaks-agent/
├── skills/hypertaks/        # the skill (SKILL.md + references/ + assets/)
├── .claude-plugin/          # Claude Code: plugin.json + marketplace.json
├── .codex-plugin/           # Codex: plugin.json
├── .cursor-plugin/          # Cursor: plugin.json
├── .kimi-plugin/            # Kimi Code: plugin.json
├── .openclaw/               # OpenClaw: INSTALL.md (generic)
├── .hermes/                 # Hermes: INSTALL.md (generic)
├── .opencode/               # OpenCode: INSTALL.md (git-backed plugin)
├── .pi/extensions/          # Pi: hypertaks.ts extension
├── .agents/plugins/         # cross-agent catalog record
├── .github/                 # CI + contributing
├── AGENTS.md  CLAUDE.md     # agent onboarding pointers
└── LICENSE  README.md
```

## License

[MIT](LICENSE) © abrur
