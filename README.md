<div align="center">

# 🧭 Hypertaks

### Founder Operating System for AI coding agents

**Turns your agent into the *Hypertaks Founder*** - an accountable operating
protocol that evaluates requests against business health, protects the Boss's
objective when a proposed method is harmful, and leads a dynamically tiered
team of specialist agents to ship the work.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-4.3.0-blue)
![Cross--Agent](https://img.shields.io/badge/cross--agent-7%2B%20platforms-brightgreen)

**Execution profiles:** CORE (small models) / FULL (frontier). See [SKILL-core.md](skills/hypertaks/SKILL-core.md).

</div>

---

> **Hypertaks** = *"A founder who owns a library of more than 1,400
> books, knows exactly which book to consult for this issue, and has a
> strict SOP: gate → frame → roles → equip → produce → integrate -
> six phases (0–5)."*

**Domains covered:** business strategy, full-spectrum engineering (web,
backend, mobile, data, and **deep Solidity/Web3 smart contracts**),
marketing, copywriting, finance, ERP, supply chain, supply chain finance,
and IoT.

Hypertaks is an operating protocol and decision discipline. The Boss owns the
business and remains the final human authority. The Hypertaks Founder owns the
quality, integration, risk awareness, and long-term reasoning of the work, and
manages specialist agents as an internal team.

---

## 🏆 Why Hypertaks

The figure below is a repository inventory, generated from tracked files and
defined entries. It is not a quality score or benchmark.

<div align="center">
<img src="https://github.com/aabrur/hypertaks-agent/blob/main/Figure_1.png?raw=true" alt="Hypertaks v4.3.0 repository inventory" width="850">
</div>

---

## 📈 What changed in 4.3.0

Version 4.3.0 adds the Founder Operating Lens and the Capability Relevance
Router. The Founder separates the Boss's objective from the proposed method,
protects business health, and binds only the smallest sufficient set of
verified skills, native tools, MCP tools, and connectors. Nano and Lite remain
proportional, and the structural suite now contains 49 case definitions. These
are repository facts; runtime behavior is reported separately from structural
presence. Full detail is in the
[release notes](skills/hypertaks/RELEASE-NOTES.md).

### Behavioral evidence status

The saved results are legacy records: 26 recorded PASS and 12
SKIPPED(harness). The canonical report currently rejects them because the
bundle mixes historical tested commits, placeholder/incomplete transcripts,
self-grading, and malformed JSONL. Fourteen rows (EV-25 through EV-38) have
complete fields relative to their historical run, but none count as
current-release provenance-valid evidence until a clean rerun targets the
current commit. EV-39 through EV-49 have no behavioral PASS records.
`confirmed_by_boss` remains `false` for all saved rows. Static GREEN is not a
behavioral PASS, and v4.3.0 is a structural release with
partial behavioral evidence, not a behavioral certification.

<div align="center">
<img src="https://github.com/aabrur/hypertaks-agent/blob/main/Figure_2.png?raw=true" alt="Behavioral evidence recorded in evals/results.yaml" width="850">
</div>

The eval inventory contains nine declared groups:

<div align="center">
<img src="https://github.com/aabrur/hypertaks-agent/blob/main/Figure_4.png?raw=true" alt="Behavioral eval case distribution by group" width="850">
</div>

---

## ⚙️ The Mandatory Loop - Six Phases (0–5)

Every task - Lite or Hyper - runs through the same six phases, from Phase 0
(the intake gate) to Phase 5 (integrate & deliver). The loop never
disappears, it only scales: light tasks move through it fast, heavy tasks
spawn more agents inside it.

<div align="center">
<img src="https://github.com/aabrur/hypertaks-agent/blob/main/Figure_3.png?raw=true" alt="Hypertaks mandatory phase-loop diagram" width="850">
</div>

## 🔒 Four hard rules

1. **Intake gate first, sized to the task** - Nano uses a zero-sized gate;
   Lite/Standard use Express and Prime/Hyper use Deep. Build work begins only
   after the request and permissions are explicit.
2. **Dynamic Agent Allocation** - the gate assesses the task into a tier
   that fixes the agent count:

   | Tier | Agents | Typical task |
   |------|--------|--------------|
   | ⚪ Nano | 0 | a single factual answer - no contract, no team (escalates the moment anything must be built or decided) |
   | 🟢 Lite | 1 | typo fix, one copy tweak, follow-up inside a confirmed contract |
   | 🔵 Standard | 3 | 2–3 domains, one deliverable |
   | 🟣 Prime | 5 | classic founder-shaped cross-domain work |
   | 🔴 Hyper | 6–10+ | multi-workstream programs (launches, company-wide diagnosis) |
   | ⚫ Omega | 10+ | multi-quarter programs with human go/no-go gates (needs explicit framing at this scale) |

   The tier is set by a **printed 7-factor score**, not by a hunch, and it can be
   *de-escalated* mid-run if the task proves smaller. The table in
   `skills/hypertaks/SKILL.md` is the canonical one; this is a copy for readers.

3. **Capability relevance** - Hypertaks derives need before discovery, rejects
   irrelevant or over-privileged capabilities, and binds only verified host
   skills, native tools, MCP tools, and connectors needed by the approved work.
   Nano performs no registry scan or update check for harmless local work.

4. **No silent deviation** - tier, gate mode, and assumptions are announced
   in the task contract; frameworks must be delivered in their defined
   output shapes (a rated Five Forces table, an ERRC grid, a 6M fishbone
   tree - not just the name); every deliverable ends with a compliance
   footer and a work log.

---

## ⚡ Lazy-loaded, not bloated

The 1,400+ item knowledge base and reference docs are **grepped by keyword
in Phase 3**, never loaded wholesale, and reference reading is conditional
by tier. How much that saves versus loading everything up front is **not
measured** - the figure this section used to quote compared Hypertaks
against a strawman that loaded the entire knowledge base, which nothing
does. Measured numbers will come from [`evals/`](evals/), or they will not
be claimed.

---

## 📚 Frameworks

**Core** (full applied how-tos with mandatory output shapes): Porter's Five
Forces · SWOT/TOWS · Pareto (80/20) · Fishbone (Ishikawa) · Blue Ocean (ERRC)
· Red Apples & Bad Barrels · Theory of Constraints (bottleneck) · SCOR
supply chain · Supply Chain Finance · ERP · Smart contracts · IoT.

**Extended:** [`references/knowledge-base.md`](skills/hypertaks/references/knowledge-base.md)
is a 1,400+ item encyclopedia of theories, methods, frameworks, and
workflows across business, learning, science, and technology (JTBD, Kano,
RICE, Cynefin, OKR, PESTLE, DDD, MLOps, EIP standards, sales methodologies,
mental models, and more). Agents route to it by keyword instead of loading the
whole catalog.

---

## 🚀 Install

This repo is a cross-agent plugin. Every agent loads the single skill under
[`skills/hypertaks`](skills/hypertaks); each agent just has its own way of
discovering it. Install per agent below - everyone runs their own flow, so
no particular workspace layout is assumed.

<details open>
<summary><strong>Claude Code</strong></summary>

```
/plugin marketplace add aabrur/hypertaks-agent
/plugin install hypertaks@hypertaks-marketplace
```
</details>

<details>
<summary><strong>Codex CLI</strong></summary>

```
/plugins
```

Search for `hypertaks` and choose **Install Plugin**.
</details>

<details>
<summary><strong>Cursor</strong></summary>

```
/add-plugin hypertaks
```

Or search for "hypertaks" in the marketplace.
</details>

<details>
<summary><strong>Kimi Code</strong></summary>

```
/plugins install https://github.com/aabrur/hypertaks-agent
```

Or open `/plugins` → Marketplace → Hypertaks.
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Follow [`.opencode/INSTALL.md`](.opencode/INSTALL.md) - add
`"hypertaks@git+https://github.com/aabrur/hypertaks-agent.git"` to the
`plugin` array in your `opencode.json`.
</details>

<details>
<summary><strong>Pi</strong></summary>

```bash
pi install git:github.com/aabrur/hypertaks-agent
```
</details>

<details>
<summary><strong>OpenClaw / Hermes / any other agent</strong></summary>

These agents load skills from a skills directory they scan on startup - the
location depends on *your* setup. Clone this repo and make
`skills/hypertaks` visible in that directory (copy or symlink/junction).
See [`.openclaw/INSTALL.md`](.openclaw/INSTALL.md) and
[`.hermes/INSTALL.md`](.hermes/INSTALL.md) for exact commands. The same
generic approach works for any agent with a scanned skills folder.
</details>

### Updating safely

Hypertaks never replaces its own code in the background. A trusted host
marketplace or plugin manager may surface update metadata, but applying the
update requires explicit approval. For a clean Git clone, use
`git pull --ff-only` after approval. Archive and copied-directory installations
must be reinstalled from a trusted release source.

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

---

## 💬 Usage

Just address the founder:

- *"Hypertaks, fix the headline typo."* → **Lite** (Founder solo, Express gate)
- *"Hypertaks, add a pricing table + its copy."* → **Standard** (Engineer, Copywriting, Integrator)
- *"Hypertaks, why is our churn high?"* → **Prime** analysis lineup (Strategy, Finance, Marketing, Ops, Integrator)
- *"Hypertaks, launch the product: contract + app + GTM + legal."* → **Hyper** (6–10+ agents, one per workstream)

The skill asks its intake questions first, confirms a task contract that
names the tier, then produces the tier's agents and delivers one
founder-grade result ending with a compliance footer and work log.

---

## 🗂️ Repo layout

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

---

<div align="center">

## 📄 License

[MIT](LICENSE) © abrur

</div>
