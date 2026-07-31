<div align="center">

# Hypertaks

### Founder Operating System for AI agents

**One plugin product, five canonical skills, and native compatibility across 22 registered AI hosts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-4.5.0-blue)
![Native Compatibility](https://img.shields.io/badge/native%20compatibility-22%2F22-brightgreen)
![Rollout](https://img.shields.io/badge/production%20rollout-complete-brightgreen)
![Status](https://img.shields.io/badge/status-PASS-brightgreen)

</div>

---

## What Hypertaks is

Hypertaks turns an AI agent into a founder-grade operating partner that frames the real objective, coordinates specialist work, preserves verified context, and proves whether the work is done.

The Boss remains the final human authority. Hypertaks owns task framing, contract integrity, specialist coordination, capability relevance, evidence quality, continuity, risk disclosure, and final integration.

Hypertaks remains one plugin product with exactly five public skills:

| Skill | Purpose |
|---|---|
| `/hypertaks` | Main Founder Operating System flow |
| `/hypertaks-verify` | Verify project, storage, memory, Graphify, and Obsidian configuration |
| `/hypertaks-brain` | Inspect and maintain evidence-backed founder memory |
| `/hypertaks-graph` | Query relationships and change impact |
| `/hypertaks-continuity` | Checkpoint, resume, handoff, reconcile, and prove completion |

A repository validator rejects a missing command, duplicate command, or sixth public Hypertaks skill.

---

## Production rollout

| Wave | Scope | Result |
|---|---|---|
| Wave 1 | Core, ChatGPT transport, truth reconciliation, distribution foundation | PASS |
| Wave 2 | Claude Code, Codex, Cursor, Kimi Code, OpenCode, Pi, OpenClaw, Hermes | 8/8 PASS |
| Wave 3 | GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider, Goose, OpenHands | 8/8 PASS |
| Wave 4 | ChatGPT, Claude.ai, Gemini App, Open WebUI, LibreChat | 5/5 PASS |
| Wave 5 | Marketplace and plugin-directory package readiness | PASS |
| Final | Official native compatibility across all registered hosts | 22/22 PASS |

`PASS` here means the declared installation route is supported by the host's current official website, documentation, or repository and matches a tracked Hypertaks adapter or package. It does not claim that Hypertaks is already published in every third-party marketplace.

The machine-readable certification record is [`distribution/plugin-compatibility.json`](distribution/plugin-compatibility.json).

---

# Install Hypertaks

Clone the plugin source once:

```bash
git clone https://github.com/aabrur/hypertaks-agent.git
cd hypertaks-agent
```

Use the native plugin route for the selected host.

## Wave 1 and Wave 2

### Google Antigravity

Open **Antigravity Plugins**, choose **Install** or **Import Plugin**, then select the Hypertaks Antigravity package from this repository.

Guide: [`distribution/antigravity/INSTALL.md`](distribution/antigravity/INSTALL.md)

### Claude Code

```text
/plugin marketplace add aabrur/hypertaks-agent
/plugin install hypertaks@hypertaks-marketplace
```

Update or remove:

```text
/plugin update hypertaks@hypertaks-marketplace
/plugin uninstall hypertaks@hypertaks-marketplace
```

### Codex

```bash
codex plugin marketplace add https://github.com/aabrur/hypertaks-agent.git
```

Open `/plugins`, locate `hypertaks@hypertaks-marketplace`, then enable it. Use the same plugin interface to refresh, disable, or remove it.

### Cursor

Run:

```text
/add-plugin
```

Select or paste:

```text
https://github.com/aabrur/hypertaks-agent
```

Manage Hypertaks from Cursor Plugins.

### Kimi Code

```text
/plugins install https://github.com/aabrur/hypertaks-agent.git
/plugins list
/plugins reload hypertaks
/plugins remove hypertaks
```

### OpenCode

Register the local Hypertaks plugin in `opencode.json`:

```json
{
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/.opencode/plugins/hypertaks.ts"
  ]
}
```

Restart OpenCode after changing the plugin entry.

### Pi

```bash
pi install https://github.com/aabrur/hypertaks-agent.git
pi update hypertaks
pi remove hypertaks
```

### OpenClaw

```bash
openclaw plugins install git:github.com/aabrur/hypertaks-agent@main
openclaw plugins enable hypertaks
openclaw plugins update hypertaks
openclaw plugins uninstall hypertaks
```

### Hermes

```bash
hermes plugins install aabrur/hypertaks-agent --enable
hermes plugins list
hermes plugins update hypertaks
hermes plugins remove hypertaks
```

---

## Wave 3

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
/plugin update hypertaks
/plugin uninstall hypertaks
```

### Windsurf

Open **Cascade → Customizations → Skills**, choose **+ Workspace** or **+ Global**, then import the five Hypertaks skill folders as one Hypertaks plugin bundle.

### Cline CLI, SDK, and Kanban

```bash
cline plugin install --git https://github.com/aabrur/hypertaks-agent.git
cline plugin install --force --git https://github.com/aabrur/hypertaks-agent.git
```

The plugin exposes:

```text
/hypertaks <task>
```

Cline VS Code and JetBrains use the same Hypertaks plugin bundle through the native Skills import surface.

### Roo Code

Roo Code is archived. For its final compatible environment, import the Hypertaks plugin bundle into:

```text
.roo/skills/
```

or:

```text
.agents/skills/
```

### Kilo Code

Register the local plugin in `kilo.json`:

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "plugin": [
    "file:///absolute/path/to/hypertaks-agent/plugins/kilo/hypertaks.ts"
  ]
}
```

Run `/reload` after updating the plugin.

### Aider

Load the Hypertaks plugin instruction bundle:

```bash
aider --read skills/hypertaks/SKILL.md --read skills/hypertaks-verify/SKILL.md --read skills/hypertaks-brain/SKILL.md --read skills/hypertaks-graph/SKILL.md --read skills/hypertaks-continuity/SKILL.md
```

The same files can be registered through `/read` or the `read` section of `.aider.conf.yml`.

### Goose

Install the Hypertaks plugin bundle through **Goose Skills Marketplace** or import the reviewed Hypertaks recipe from this repository.

### OpenHands

```text
/plugin install github:aabrur/hypertaks-agent
/plugin list
/plugin enable hypertaks
/plugin disable hypertaks
/plugin uninstall hypertaks
```

---

## Wave 4

### ChatGPT

Deploy the tracked Hypertaks HTTPS MCP runtime. In ChatGPT, open **Plugins** or **Developer Mode**, create a custom plugin app, and connect its MCP endpoint.

Guide: [`.chatgpt/INSTALL.md`](.chatgpt/INSTALL.md)

### Claude.ai

Open **Claude Plugins**, choose **Upload Plugin**, and upload the Hypertaks plugin package from this repository. Replace the uploaded package to update it.

### Gemini App

Create a **Gem** and import the Hypertaks plugin instruction bundle as the Gem instructions and knowledge. Replace those files to update the plugin.

### Open WebUI

Open **Admin Panel → Workspace → Tools or Functions**, then import the Hypertaks plugin adapter. Replace or remove it from the same workspace interface.

### LibreChat

Register the Hypertaks plugin adapter as an MCP server or OpenAPI Action in LibreChat configuration. Update or remove the corresponding Hypertaks entry to manage its lifecycle.

---

## Wave 5 marketplace readiness

The repository includes the tracked manifests, metadata, skill package, plugin adapters, logo asset, installation records, and compatibility catalog needed for supported plugin directories and marketplaces.

| Distribution surface | Package status |
|---|---|
| Claude Code marketplace | PASS |
| Codex marketplace | PASS |
| Cursor Plugins | PASS |
| Kimi plugin manager | PASS |
| GitHub Copilot plugins | PASS |
| ChatGPT Plugins and custom apps | PASS |
| Claude Plugins | PASS |
| Goose Skills Marketplace | PASS |
| Open WebUI Tools and Functions | PASS |
| Repository and direct-Git plugin installation | PASS |

Marketplace listing or publication remains an action performed through the relevant third-party account. Repository package readiness is complete.

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

## Founder Operating System loop

```text
Phase 0  Intake and verify
Phase 1  Frame the objective and feasibility
Phase 2  Pick the required specialist roles
Phase 3  Equip the smallest relevant capability set
Phase 4  Produce the work
Phase 5  Integrate, verify, and deliver
```

Founder memory remains evidence-backed. External actions continue to follow:

```text
PREPARE -> PREVIEW -> T1 APPROVAL -> COMMIT ONCE -> RECONCILE
```

---

## Validation

```bash
npm test
npm run check:distribution
npm run test:plugin-compatibility
```

These gates verify the five-skill contract, plugin manifests, adapter paths, native compatibility catalog, distribution records, and runtime tests.

---

## Repository layout

```text
hypertaks-agent/
├── skills/                         # Exactly five canonical public skills
├── plugins/cline/                  # Cline native plugin
├── plugins/kilo/                   # Kilo native plugin
├── .plugin/                        # Open Plugin manifest
├── .claude-plugin/                 # Claude Code and Claude.ai plugin package
├── .codex-plugin/                  # Codex plugin package
├── .cursor-plugin/                 # Cursor plugin package
├── .kimi-plugin/                   # Kimi Code plugin package
├── .opencode/plugins/              # OpenCode plugin module
├── runtime/                        # Runtime and ChatGPT MCP adapter
├── distribution/                   # Compatibility and marketplace records
├── evals/                          # Core evaluation definitions
├── scripts/                        # Validators and builders
└── LICENSE
```

---

## License

[MIT](LICENSE) © abrur
