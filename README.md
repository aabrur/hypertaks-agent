<div align="center">

# Hypertaks

### Founder Operating System for AI coding agents

**Hypertaks turns an AI agent into a founder-grade operating partner that frames the real objective, coordinates specialist work, preserves verified context, and proves whether the work is done.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-4.5.0-blue)
![Adapter Targets](https://img.shields.io/badge/adapter%20targets-22-brightgreen)
![Live Certified](https://img.shields.io/badge/live%20certified-0%2F22-lightgrey)
![Status](https://img.shields.io/badge/status-Production%20Rollout%20Wave%203-f3a712)

**Execution profiles:** [CORE](skills/hypertaks/SKILL-core.md) for smaller models and FULL through [SKILL.md](skills/hypertaks/SKILL.md) for frontier agents.

</div>

---

## What Hypertaks is

Hypertaks is a portable operating protocol for founder-shaped work across software engineering, product, business strategy, marketing, finance, operations, data, design, smart contracts, supply chain, ERP, and IoT.

The Boss remains the final human authority. Hypertaks owns task framing, contract integrity, specialist coordination, capability relevance, evidence quality, continuity, risk disclosure, and final integration.

Hypertaks is not a hosted model, autonomous legal entity, mandatory memory service, or unrestricted agent runtime. It runs inside the AI host and tools selected by the user.

## Current production status

Hypertaks has **22 registered adapter targets**, not 22 behaviorally certified hosts.

| Area | Current evidence | Status |
|---|---|---|
| Canonical five-skill core | Structural validation and 88 static eval definitions | Confirmed |
| Host packages and adapters | Repository structure and evidence records | Confirmed |
| Universal lifecycle manager | Isolated install, verify, update, uninstall, reinstall tests | Confirmed for staging and development |
| ChatGPT runtime | Executable read-only MCP transport and local HTTP lifecycle | Partial, live app test pending |
| Wave 2 coding agents | Catalog, validator, guides, and CI | Partial, live host tests pending |
| Wave 3 managed agents | Plugin-first packages, validator, guides, and CI | Partial, live host tests pending |
| Marketplace publication | Metadata and source preparation | Not submitted |

`PASS` is reserved for evidence from a real named host version. A manifest, package, copied skill directory, local runtime, or CI result cannot independently certify discovery and invocation inside the target application.

---

## Five public skills

Hypertaks exposes exactly five public entry points.

| Skill | Purpose |
|---|---|
| `/hypertaks` | Main Founder Operating System flow |
| `/hypertaks-verify` | Verify project, storage, memory, Graphify, and Obsidian configuration |
| `/hypertaks-brain` | Inspect, record, revalidate, correct, promote, demote, or archive founder memory |
| `/hypertaks-graph` | Query code relationships and impact through verified Graphify capabilities or direct search |
| `/hypertaks-continuity` | Checkpoint, resume, handoff, reconcile, status, and proof of done |

A repository validator rejects a missing command, duplicate command, or sixth public Hypertaks skill.

---

## Founder Operating System loop

```text
Phase 0  Intake and verify
Phase 1  Frame the objective and feasibility
Phase 2  Pick the required specialist roles
Phase 3  Equip the smallest relevant capability set
Phase 4  Produce the work
Phase 5  Integrate, verify, and deliver
```

| Tier | Agents | Typical work |
|---|---:|---|
| Nano | 0 | One factual answer with no build, decision, or durable state |
| Lite | 1 | Small focused correction or follow-up |
| Standard | 3 | Bounded multi-discipline deliverable |
| Prime | 5 | Founder-shaped cross-domain work |
| Hyper | 6-10+ | Multi-workstream program |
| Omega | 10+ | Long-running program with human go or no-go gates |

Harmless Nano work creates no brain, pointer, checkpoint, graph job, registry scan, or update check.

---

## Founder Brain and continuity

Founder memory is structured evidence, not hidden authority.

```text
AgentPrivate  Temporary or agent-specific context
Project       Verified project facts, decisions, risks, and preferences
Shared        Cross-agent facts or Boss-approved decisions
```

Shared memory accepts only repository facts verified against current source state or Boss-approved decisions with valid approval evidence. Model inference remains `INFERRED`. Missing evidence remains `UNVERIFIED`. Changed source evidence becomes stale or invalidated.

A checkpoint records the objective, active contract, repository identity, branch, commit, changed files, completed and pending work, blockers, granted permissions, tests, and acceptance evidence.

Proof of done returns `DONE` only when current tests and acceptance evidence pass and no blocker remains. Otherwise it returns `NOT_DONE` with exact reasons.

User-owned destinations can include project-local storage, an approved external folder, an existing Obsidian Vault, a separate local Git repository, a verified MCP memory capability, or session-only memory.

---

## Security boundaries

Hypertaks enforces source-bound authority, explicit permissions, fail-closed external capability binding, approved-root path containment, atomic persistence, secret scanning, handoff redaction, current Git-state verification, and no silent Graphify installation, server start, or remote upload.

External side effects follow:

```text
PREPARE -> PREVIEW -> T1 APPROVAL -> COMMIT ONCE -> RECONCILE
```

A timeout is not proof of failure. Hypertaks reconciles before retrying.

---

# Install Hypertaks

## Clone the source

```bash
git clone https://github.com/aabrur/hypertaks-agent.git
cd hypertaks-agent
```

Installation is **host-native and plugin-first**. The Python lifecycle manager remains available for staging, development, and isolated package verification, but it is not the recommended end-user installation route in the matrix below.

## Native installation matrix

| Agent | Recommended native installation | Guide or adapter |
|---|---|---|
| **Google Antigravity** | Build or download the Antigravity package, then install it through the Antigravity Plugins interface | [Antigravity guide](distribution/antigravity/INSTALL.md) |
| **Claude Code** | Open `/plugin`, add this repository or its marketplace, then install `hypertaks` | [Plugin manifest](.claude-plugin/plugin.json) |
| **Codex** | Install through the Codex plugin catalog or import the five Agent Skills from this repository | [Plugin manifest](.codex-plugin/plugin.json) |
| **Cursor** | Install through the Cursor plugin surface where available, or import the repository adapter and skills | [Plugin manifest](.cursor-plugin/plugin.json) |
| **Kimi Code** | Install through the Kimi Code plugin manager using this repository | [Plugin manifest](.kimi-plugin/plugin.json) |
| **OpenCode** | Import the five native Agent Skills into `.opencode/skills/` or another documented OpenCode skill root | [OpenCode guide](.opencode/INSTALL.md) |
| **Pi** | Load the packaged Pi extension and its five skill resources | [Pi adapter](.pi/extensions/hypertaks.ts) |
| **OpenClaw** | Import the five skills through the current OpenClaw Skills mechanism | [OpenClaw guide](.openclaw/INSTALL.md) |
| **Hermes** | Import the five skills into the Hermes skill directory or approved external skill root | [Hermes guide](.hermes/INSTALL.md) |
| **ChatGPT** | Run the remote HTTPS MCP runtime, then add it as a custom app in ChatGPT Developer Mode | [ChatGPT guide](.chatgpt/INSTALL.md) |
| **GitHub Copilot** | `copilot plugin install aabrur/hypertaks-agent` or `/plugin install aabrur/hypertaks-agent` | [Copilot guide](.github-copilot/INSTALL.md) |
| **Windsurf** | Cascade -> Customizations -> Skills -> `+ Workspace` or `+ Global`, then import the five skills | [Windsurf guide](.windsurf/INSTALL.md) |
| **Cline CLI / SDK / Kanban** | `cline plugin install --git https://github.com/aabrur/hypertaks-agent.git` | [Cline guide](.cline/INSTALL.md) |
| **Cline VS Code / JetBrains** | Enable Cline Skills and import the five skill folders. Plugin loading is not currently supported on these surfaces | [Cline guide](.cline/INSTALL.md) |
| **Roo Code** | Import the five skills into `.roo/skills/` or `.agents/skills/` | [Roo guide](.roo/INSTALL.md) |
| **Kilo Code** | Register `plugins/kilo/hypertaks.ts` as a local TypeScript plugin in `kilo.json` | [Kilo guide](.kilo/INSTALL.md) |
| **Aider** | Load the five `SKILL.md` files with `--read`, `/read`, or `.aider.conf.yml` | [Aider guide](.aider/INSTALL.md) |
| **Goose** | Install through the Goose Skills Marketplace or a reviewed Goose recipe | [Goose guide](.goose/INSTALL.md) |
| **OpenHands** | `/plugin install github:aabrur/hypertaks-agent` | [OpenHands guide](.openhands/INSTALL.md) |
| **Claude.ai** | Add the instructions and required files to Claude Project Knowledge | [Claude.ai guide](.claude-ai/INSTALL.md) |
| **Gemini App** | Create a Custom Gem and import the Hypertaks instructions | [Gemini App guide](.gemini-app/INSTALL.md) |
| **Open WebUI** | Install or import the Open WebUI extension adapter through the admin interface | [Open WebUI guide](.open-webui/INSTALL.md) |
| **LibreChat** | Register the LibreChat extension adapter in the deployment configuration | [LibreChat guide](.librechat/INSTALL.md) |

## Wave 3 plugin commands

### GitHub Copilot

```bash
copilot plugin install aabrur/hypertaks-agent
copilot plugin list
copilot plugin update hypertaks
copilot plugin uninstall hypertaks
```

Inside Copilot CLI:

```text
/plugin install aabrur/hypertaks-agent
/plugin list
/skills list
/plugin update hypertaks
/plugin uninstall hypertaks
```

### Cline CLI, SDK, and Kanban

```bash
cline plugin install --git https://github.com/aabrur/hypertaks-agent.git
cline config
cline plugin install --force --git https://github.com/aabrur/hypertaks-agent.git
```

The Cline plugin registers the five canonical skill documents as rules and exposes:

```text
/hypertaks <task>
```

### OpenHands

```text
/plugin install github:aabrur/hypertaks-agent
/plugin list
/plugin enable hypertaks
/plugin disable hypertaks
/plugin uninstall hypertaks
```

### Kilo Code

Hypertaks includes a native local plugin module at:

```text
plugins/kilo/hypertaks.ts
```

Register it in `kilo.json` or `.kilo/opencode.jsonc`:

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/plugins/kilo/hypertaks.ts"
  ]
}
```

The command `kilo plugin <module>` installs npm modules. It must not be advertised as `kilo plugin hypertaks` until a Hypertaks Kilo package has actually been published.

## Hosts without a custom plugin command

Windsurf, Roo Code, Aider, and Goose do not currently expose an equivalent verified `/plugin install hypertaks` lifecycle for this package. Their guides use the official Skills, project-instruction, or recipe mechanism instead. Hypertaks does not invent unsupported commands.

---

## ChatGPT runtime quick start

The ChatGPT adapter exposes a read-only MCP transport. It does not expose write, delete, shell, deploy, publish, or user-filesystem tools.

```bash
npm install --ignore-scripts
npm run test:chatgpt
npm run start:chatgpt
```

```text
Health: http://127.0.0.1:8787/healthz
MCP:    http://127.0.0.1:8787/mcp
```

A real ChatGPT connection requires an eligible workspace and a remote HTTPS endpoint or approved secure tunnel. ChatGPT cannot connect directly to an arbitrary local MCP process.

---

## Usage

```text
Hypertaks, verify this project and connect my existing main brain.

/hypertaks-brain inspect

/hypertaks-graph impact runtime/router.ts

/hypertaks-continuity checkpoint

Hypertaks, resume the project and prove what remains unfinished.
```

Normal work can begin with plain language:

```text
Hypertaks, fix this bug.
Hypertaks, review this product decision.
Hypertaks, build the feature after the contract is approved.
Hypertaks, explain why the release is not done yet.
```

---

## Developer validation

```bash
python3 scripts/validate_skill.py
python3 scripts/validate_public_skills.py
python3 scripts/validate_distributions.py
python3 scripts/validate_coding_agents.py
python3 scripts/validate_managed_agents.py
python3 scripts/validate_host_capabilities.py
python3 scripts/validate_conformance.py
python3 scripts/build_distributions.py antigravity --check-only
python3 scripts/run_evals.py --check
python3 scripts/run_evals.py --static
python3 -m unittest scripts.test_validate_coding_agents -v
python3 -m unittest scripts.test_validate_managed_agents -v
python3 -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance scripts.test_validate_host_capabilities -v
npm run test:chatgpt
npm test
python3 -m compileall scripts
```

These commands validate repository structure and isolated behavior. They do not replace live host certification.

---

## Release status

Hypertaks 4.5.0 remains a **Release Candidate** until final merge and evidence gates pass.

Fresh independent behavioral runs are required for changed v4.4 and v4.5 behavior, real host discovery, Graphify capability behavior, approved Obsidian Vault behavior, and cross-agent continuity.

No tag, package publication, marketplace submission, deployment, guaranteed security claim, or stable behavioral certification is implied by a source merge.

---

## Repository layout

```text
hypertaks-agent/
├── skills/                        # Exactly five canonical public skills
├── plugins/cline/                 # Cline native plugin
├── plugins/kilo/                  # Kilo native local plugin
├── .plugin/                       # Open Plugin manifest for compatible hosts
├── runtime/                       # TypeScript runtime and ChatGPT MCP adapter
├── distribution/                  # Host catalogs, packages, and evidence matrix
├── evals/                         # EV-01 through EV-88 and host certification evidence
├── scripts/                       # Validators, builders, lifecycle tools, and reports
├── .chatgpt/
├── .claude-plugin/
├── .codex-plugin/
├── .cursor-plugin/
├── .kimi-plugin/
├── .github-copilot/
├── .windsurf/
├── .cline/
├── .roo/
├── .kilo/
├── .aider/
├── .goose/
├── .openhands/
└── LICENSE
```

---

## License

[MIT](LICENSE) © abrur
