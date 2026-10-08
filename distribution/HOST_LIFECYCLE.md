# Hypertaks Host Lifecycle and Repository Operating Vault Guide

Version: `0.0.4.5.9`
Architecture: Founder Operating System Repository Lifecycle

---

## 1. Executive Summary

Hypertaks 0.0.4.5.9 establishes a zero-command repository initialization experience with an uncompromising zero-consent write guard.

When an AI coding agent attaches to a repository:
1. Hypertaks detects the repository root automatically.
2. Performs a strictly read-only preflight without modifying any files.
3. Reports repository identity, vault status, and planned actions.
4. Pauses for authentic Boss approval if filesystem mutation is required.
5. Bootstraps or synchronizes `.hypertaks/` only after authentic T1 activation.

Zero-command initiation never means zero-consent mutation. Preflight is read-only. Mutation requires approval.

---

## 2. Security Kernel and Invariants

| Invariant | Specification | Guarantee |
|---|---|---|
| Zero-Consent Guard | `runPreflight()` produces zero filesystem writes | Safe for read-only repositories and unauthenticated audits |
| Authentic Boss Proof | `BossApprovalProof` required for `issueBootstrapGrant` | Boolean flags and arbitrary caller strings cannot mint grants |
| Approved-Root Confinement | All mutations restricted strictly to `.hypertaks/**` | Source code, git history, and user workspace remain immutable |
| Persistent Vault Key | Root secret persisted in `.hypertaks/state/bootstrap.key` (0600) | Grants survive process restarts without static public salt |
| Concurrency Locking | `.hypertaks/.lifecycle.lock` with 30s stale lock recovery | Prevents parallel corruption across multi-agent processes |
| Proof-of-Done Gate | Mandatory evidence and physical file verification on disk | Rejects simulated completion when deliverables are missing or empty |

---

## 3. Host Lifecycle Integration Matrix

Hypertaks integrates across 22 officially supported AI agent hosts categorized into 4 lifecycle patterns:

### Category A: Plugin SDK and Native Extensions (4 Hosts)
Programmatic lifecycle hooks executed upon workspace attach or session launch.
* **Cline**: `plugins/cline/hypertaks.ts` and `.cline/plugin.json`
* **Pi**: `.pi/extensions/hypertaks.ts`
* **Kilo Code**: `.kilo/plugin.json`
* **Roo Code**: `.roo/plugin.json`

### Category B: Workspace Open Triggers (5 Hosts)
Workspace root inspection executed automatically when agent attaches to a directory.
* **Google Antigravity**: `distribution/antigravity/plugin.json`
* **Cursor**: `.cursor-plugin/plugin.json`
* **Windsurf**: `.windsurf/plugin.json`
* **OpenHands**: `.openhands/plugin.json`
* **Goose**: `.goose/plugin.json`

### Category C: Command and Instruction Triggers (7 Hosts)
Instruction and CLI lifecycle preflight executed at conversation turn or agent startup.
* **Claude Code**: `.claude-plugin/plugin.json`
* **Codex**: `.codex-plugin/plugin.json`
* **Hermes**: `.hermes/plugin.json`
* **OpenCode**: `.opencode/plugin.json`
* **OpenClaw**: `.openclaw/plugin.json`
* **Kimi Code**: `.kimi-plugin/plugin.json`
* **Aider**: `.aider/plugin.json`

### Category D: Managed and Chat Web Interfaces (6 Hosts)
Instruction prompt and context attachment with remote MCP or local preflight verification.
* **GitHub Copilot**: `.github-copilot/plugin.json`
* **ChatGPT**: `.chatgpt/plugin.json`
* **Claude.ai**: `.claude-ai/plugin.json`
* **Google Gemini App**: `.gemini-app/plugin.json`
* **LibreChat**: `.librechat/plugin.json`
* **Open WebUI**: `.openwebui/plugin.json`

---

## 4. Lifecycle Execution Protocol

### Step 1: Automatic Detection and Read-Only Preflight
```bash
hypertaks preflight
```
Inspects 13 Project Operating Context files, critical vault files, repository identity, grant validity, and local graph freshness. Returns state: `UNINITIALIZED`, `HEALTHY`, `STALE_INDEXES`, `CORRUPTED_OR_PARTIAL`, or `REBIND_DETECTED`.

### Step 2: Authentic Boss Approval Prompt
When preflight determines mutation is needed, Hypertaks outputs:
```
APPROVAL_REQUIRED: Filesystem mutation requires explicit Boss approval.
Run 'hypertaks init --approve <contractId>' to authorize initialization.
```

### Step 3: Atomic Mutation and Index Generation
Upon receiving `APPROVE <contractId>`:
1. Acquires `.hypertaks/.lifecycle.lock`.
2. Verifies `BossApprovalProof`.
3. Issues `RepoBootstrapGrant`.
4. Initializes directory topology.
5. Populates Project Operating Context files without overwriting user edits.
6. Runs Repository Topological Scanner (RTS).
7. Compiles Architecture Pack (`ARCHITECTURE.md`, `FUNCTION-MAP.md`, `DATA-MODEL.md`, `NETWORK-DEPENDENCIES.md`, `ASSET-INDEX.md`).
8. Constructs and saves Local Intelligence Graph.
9. Releases lifecycle lock.
