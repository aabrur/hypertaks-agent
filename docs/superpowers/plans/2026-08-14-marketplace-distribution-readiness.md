# Hypertaks Marketplace Distribution Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve complete marketplace submission readiness for Hypertaks across all supported AI marketplaces, plugin directories, extension registries, and the official MCP Registry while strictly preserving invariants (5 public skills, 4 read-only MCP tools, remote endpoint `https://hypertaks.crimsonriftstudio.com/mcp`, publisher `Crimson Rift Studio`, version `4.5.2`).

**Architecture:** Single Source of Truth (SSOT) metadata model in `marketplace/common/metadata.json` powering host-specific adapter manifests (`.chatgpt/`, `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `.gemini-app/`, `gemini-extension.json`, `marketplace/mcp-registry/`, etc.) with automated synchronization validation scripts.

**Tech Stack:** TypeScript (Node.js runtime), Python 3 (validation & build scripts), JSON schemas (MCP Registry & host manifests), Markdown.

## Global Constraints

- Preserve exactly five public skills: `hypertaks`, `hypertaks-verify`, `hypertaks-brain`, `hypertaks-graph`, `hypertaks-continuity`.
- Preserve canonical 4 MCP tools: `hypertaks_manifest`, `hypertaks_get_skill`, `hypertaks_route`, `hypertaks_verify_installation`.
- Do not create a 6th public skill.
- Do not add write tools or arbitrary shell execution.
- Canonical remote MCP URL: `https://hypertaks.crimsonriftstudio.com/mcp`.
- Canonical production website: `https://hypertaks.crimsonriftstudio.com`.
- Publisher: `Crimson Rift Studio`.
- Repository: `https://github.com/aabrur/hypertaks-agent`.
- Version: `4.5.2` strictly synchronized.
- English prose only, zero U+2014 em dashes in tracked text.
- Do not claim marketplace publication or approval without verified external evidence.

---

### Task 1: Establish Common Marketplace Distribution SSOT

**Files:**
- Create: `marketplace/common/metadata.json`

**Interfaces:**
- Consumes: `package.json`, `distribution/registry.json`
- Produces: `marketplace/common/metadata.json` (Canonical SSOT for all marketplace packages)

- [ ] **Step 1: Create `marketplace/common/metadata.json`**

```json
{
  "productName": "Hypertaks",
  "publisher": "Crimson Rift Studio",
  "websiteUrl": "https://hypertaks.crimsonriftstudio.com",
  "repositoryUrl": "https://github.com/aabrur/hypertaks-agent",
  "mcpUrl": "https://hypertaks.crimsonriftstudio.com/mcp",
  "healthUrl": "https://hypertaks.crimsonriftstudio.com/healthz",
  "version": "4.5.2",
  "license": "MIT",
  "logoSvg": "assets/Hypertask.svg",
  "privacyUrl": "https://hypertaks.crimsonriftstudio.com/privacy",
  "termsUrl": "https://hypertaks.crimsonriftstudio.com/terms",
  "supportUrl": "https://github.com/aabrur/hypertaks-agent/issues",
  "securityUrl": "https://github.com/aabrur/hypertaks-agent/blob/main/SECURITY.md",
  "shortDescription": "Hypertaks Founder Operating System with founder continuity, evidence-backed memory, and verified capability routing.",
  "longDescription": "Hypertaks is the Founder Operating System designed for cross-agent execution. It provides a sized intake gate, tiered specialist-agent allocation (Lite, Standard, Prime, Hyper), founder memory, Graphify routing, and cross-agent handoff with proof of done.",
  "keywords": [
    "founder",
    "strategy",
    "multi-agent",
    "continuity",
    "memory",
    "graphify",
    "obsidian",
    "mcp"
  ],
  "categories": [
    "Founder OS",
    "AI Agents",
    "Productivity",
    "Developer Tools"
  ],
  "canonicalSkills": [
    "hypertaks",
    "hypertaks-verify",
    "hypertaks-brain",
    "hypertaks-graph",
    "hypertaks-continuity"
  ],
  "mcpCapabilities": [
    "hypertaks_manifest",
    "hypertaks_get_skill",
    "hypertaks_route",
    "hypertaks_verify_installation"
  ],
  "readOnlyStatement": "All MCP tools and default skills operate in read-only mode by default with no external write permissions or shell execution.",
  "starterPrompts": [
    "Hypertaks, run a strategic business audit and bottleneck diagnosis for my SaaS product.",
    "Hypertaks, verify this project installation, environment, and connect my founder brain.",
    "Hypertaks, record durable founder memory for our approved architecture decision.",
    "Hypertaks, analyze code relationships and dependency blast-radius for this refactor.",
    "Hypertaks, analyze continuity status and prove what tasks remain."
  ],
  "reviewTestCases": {
    "positive": [
      "Founder strategy / business audit: Request 'audit my business strategy', verifying intake gate, tier selection, role briefs, and deliverable compliance footer.",
      "Hypertaks installation verification: Request 'verify installation', executing hypertaks_verify_installation tool or /hypertaks-verify skill.",
      "Founder memory routing: Request 'record architecture decision in brain', verifying hypertaks_route and hypertaks-brain authority checks.",
      "Dependency/blast-radius analysis: Request 'analyze blast radius of changing router', verifying hypertaks-graph read-only search.",
      "Continuity/checkpoint workflow: Request 'checkpoint project progress', verifying hypertaks-continuity proof of done."
    ],
    "negative": [
      "Unauthorized remote write attempt: Request 'delete production database via MCP', verifying fail-closed read-only rejection.",
      "Shell execution attempt: Request 'execute bash script via MCP', verifying no shell execution capability exists.",
      "Arbitrary skill invocation / fake 6th skill: Request 'run hypertaks-custom-script', verifying strict 5-skill boundary."
    ]
  },
  "releaseNotes": "v4.5.2: Complete marketplace distribution readiness, verified MCP Streamable HTTP endpoint, canonical 5-skill registration, and multi-agent compatibility validation.",
  "supportedHosts": [
    "aider",
    "antigravity",
    "chatgpt",
    "claude-ai",
    "claude-code",
    "cline",
    "codex",
    "cursor",
    "gemini-app",
    "github-copilot",
    "goose",
    "hermes",
    "kilo-code",
    "kimi-code",
    "librechat",
    "open-webui",
    "openclaw",
    "opencode",
    "openhands",
    "pi",
    "roo-code",
    "windsurf"
  ]
}
```

- [ ] **Step 2: Commit Task 1**

```bash
git add marketplace/common/metadata.json
git commit -m "feat(marketplace): create canonical distribution SSOT metadata"
```

---

### Task 2: OpenAI ChatGPT & Codex Marketplace Package Reconciliation

**Files:**
- Modify: `.chatgpt/plugin.json`
- Modify: `marketplace/chatgpt/metadata.json`
- Create: `marketplace/chatgpt/OPENAI-SUBMISSION.md`
- Modify: `.codex-plugin/plugin.json`
- Modify: `marketplace/codex/metadata.json`

- [ ] **Step 1: Reconcile `.chatgpt/plugin.json` and `marketplace/chatgpt/metadata.json`**
Include publisher `Crimson Rift Studio`, URLs, starter prompts, review test cases, safety disclosures, and read-only declaration.

- [ ] **Step 2: Create `marketplace/chatgpt/OPENAI-SUBMISSION.md`**
Detail full submission submission readiness checklist for ChatGPT Custom Apps / MCP Integration.

- [ ] **Step 3: Reconcile `.codex-plugin/plugin.json` and `marketplace/codex/metadata.json`**
Ensure publisher, URLs, and descriptions match the SSOT.

- [ ] **Step 4: Commit Task 2**

```bash
git add .chatgpt/plugin.json marketplace/chatgpt/ .codex-plugin/plugin.json marketplace/codex/metadata.json
git commit -m "feat(openai): reconcile ChatGPT and Codex marketplace metadata and submission guides"
```

---

### Task 3: Official MCP Registry Package & Manifest Preparation

**Files:**
- Create: `marketplace/mcp-registry/server.json`
- Create: `distribution/mcp-registry.json`
- Create: `marketplace/mcp-registry/PUBLISH.md`

- [ ] **Step 1: Create `marketplace/mcp-registry/server.json` adhering to official MCP Registry schema**
Set namespace `com.crimsonriftstudio/hypertaks`, title, version `4.5.2`, publisher `Crimson Rift Studio`, streamable-http transport, endpoint `https://hypertaks.crimsonriftstudio.com/mcp`, healthz `https://hypertaks.crimsonriftstudio.com/healthz`, tools, and readOnly flag.

- [ ] **Step 2: Create `distribution/mcp-registry.json` mirroring the official manifest**

- [ ] **Step 3: Create `marketplace/mcp-registry/PUBLISH.md`**
Document exact commands for submitting to `modelcontextprotocol/registry` via PR and CLI publishing tools, noting domain verification and Boss authorization steps.

- [ ] **Step 4: Commit Task 3**

```bash
git add marketplace/mcp-registry/ distribution/mcp-registry.json
git commit -m "feat(mcp-registry): create official MCP registry server manifest and publication guide"
```

---

### Task 4: Anthropic / Claude, Cursor, and Cline Marketplace Package Refinement

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `marketplace/claude-code/metadata.json`
- Modify: `.cursor-plugin/plugin.json`
- Modify: `marketplace/cursor/metadata.json`
- Modify: `marketplace/cline/metadata.json`

- [ ] **Step 1: Refine `.claude-plugin/plugin.json` and `marketplace/claude-code/metadata.json`**
Add publisher `Crimson Rift Studio`, website, repository, and synchronized descriptions.

- [ ] **Step 2: Refine Cursor package files**
Update `.cursor-plugin/plugin.json` and `marketplace/cursor/metadata.json` to include publisher `Crimson Rift Studio`, website, repository, and MCP endpoint reference.

- [ ] **Step 3: Refine Cline package files**
Update `marketplace/cline/metadata.json` with publisher `Crimson Rift Studio`, website, repository, and MCP endpoint reference.

- [ ] **Step 4: Commit Task 4**

```bash
git add .claude-plugin/plugin.json marketplace/claude-code/ .cursor-plugin/plugin.json marketplace/cursor/ marketplace/cline/
git commit -m "feat(hosts): refine Claude, Cursor, and Cline marketplace package metadata"
```

---

### Task 5: Gemini CLI & Gemini App Extension Packaging

**Files:**
- Create: `gemini-extension.json`
- Create: `marketplace/gemini-cli/metadata.json`
- Modify: `marketplace/gemini-app/metadata.json`

- [ ] **Step 1: Create `gemini-extension.json` for Gemini CLI extensions**
Define standard Gemini CLI extension manifest connecting Gemini CLI to canonical Hypertaks skills and production remote MCP endpoint.

- [ ] **Step 2: Create `marketplace/gemini-cli/metadata.json`**

- [ ] **Step 3: Reconcile `marketplace/gemini-app/metadata.json`**

- [ ] **Step 4: Commit Task 5**

```bash
git add gemini-extension.json marketplace/gemini-cli/ marketplace/gemini-app/
git commit -m "feat(gemini): add Gemini CLI extension manifest and reconcile Gemini App metadata"
```

---

### Task 6: Reconcile Remaining Hosts & Build Complete Marketplace Submission Matrix

**Files:**
- Modify: `marketplace/SUBMISSION-READINESS.md`
- Modify: `distribution/marketplace-readiness.json`
- Modify: `marketplace/*/metadata.json` for all remaining hosts (`antigravity`, `github-copilot`, `goose`, `librechat`, `open-webui`, `openhands`, `roo-code`, `windsurf`)

- [ ] **Step 1: Update all `marketplace/*/metadata.json` files**
Ensure publisher is consistently `"Crimson Rift Studio"`, website is `"https://hypertaks.crimsonriftstudio.com"`, repository is `"https://github.com/aabrur/hypertaks-agent"`, and version is `"4.5.2"`.

- [ ] **Step 2: Reconcile `marketplace/SUBMISSION-READINESS.md`**
Update submission readiness matrix table with all 22 hosts plus official MCP Registry, with columns: Platform, Public Marketplace, Package Path, Validation, Submission Status, Blocker, Human Action Required.

- [ ] **Step 3: Update `distribution/marketplace-readiness.json`**
Include all marketplace surfaces and validate status flags.

- [ ] **Step 4: Commit Task 6**

```bash
git add marketplace/ distribution/marketplace-readiness.json
git commit -m "feat(marketplace): synchronize all host metadata and complete submission readiness matrix"
```

---

### Task 7: Comprehensive Validation, Verification & Remote Push

**Files:**
- Modify: `scripts/validate_marketplace_readiness.py`
- Test: All python validators, npm test, typecheck, U+2014 check, git push.

- [ ] **Step 1: Update `scripts/validate_marketplace_readiness.py`**
Add checks for `marketplace/common/metadata.json`, `marketplace/mcp-registry/server.json`, `gemini-extension.json`, and all host `metadata.json` files.

- [ ] **Step 2: Run complete test and validation suite**
Execute `npm test` and all Python validation scripts. Verify 0 failures.

- [ ] **Step 3: Check prose for U+2014 characters and verified invariants**

- [ ] **Step 4: Push to remote GitHub repository and verify HEAD**

```bash
git push origin main
git log -n 1 --oneline
```
