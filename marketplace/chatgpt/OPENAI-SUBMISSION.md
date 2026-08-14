# OpenAI ChatGPT App / MCP Submission Readiness Guide

This document provides the complete submission materials and verification checklist for integrating Hypertaks with the OpenAI ChatGPT Apps / MCP Directory.

## Product & Publisher Identity

- **Product Name:** Hypertaks Founder Operating System
- **Publisher:** Crimson Rift Studio
- **Canonical Version:** 4.5.2
- **Website:** https://hypertaks.crimsonriftstudio.com
- **Repository:** https://github.com/aabrur/hypertaks-agent
- **License:** MIT
- **Logo Asset:** `assets/Hypertask.svg`

## Endpoints

- **Production MCP Endpoint:** https://hypertaks.crimsonriftstudio.com/mcp
- **Health Check Endpoint:** https://hypertaks.crimsonriftstudio.com/healthz
- **Transport Type:** Streamable HTTP (`streamable-http`)

## Compliance & Legal URLs

- **Privacy Policy:** https://hypertaks.crimsonriftstudio.com/privacy
- **Terms of Service:** https://hypertaks.crimsonriftstudio.com/terms
- **Support / Issues:** https://github.com/aabrur/hypertaks-agent/issues
- **Security Policy:** https://github.com/aabrur/hypertaks-agent/blob/main/SECURITY.md

## Canonical Capabilities

### 5 Public Skills
1. `hypertaks` - Founder Operating System main entry point and workflow loop
2. `hypertaks-verify` - Environment, brain, storage, Graphify, and Obsidian verification
3. `hypertaks-brain` - Evidence-backed founder memory
4. `hypertaks-graph` - Structural code search and graph analysis routing
5. `hypertaks-continuity` - Checkpoint, handoff, reconciliation, and proof of done

### 4 Read-Only MCP Tools
1. `hypertaks_manifest` - Discovers available canonical skills and configuration
2. `hypertaks_get_skill` - Retrieves canonical skill instructions
3. `hypertaks_route` - Evaluates prompt intent and determines skill routing
4. `hypertaks_verify_installation` - Validates installation integrity and permissions

## Starter Prompts

1. **Founder Strategy & Business Audit:**
   `Hypertaks, run a strategic business audit and bottleneck diagnosis for my SaaS product.`
2. **Installation & Health Check:**
   `Hypertaks, verify this project installation, environment, and connect my founder brain.`
3. **Founder Memory Routing:**
   `Hypertaks, record durable founder memory for our approved architecture decision.`
4. **Code Dependency & Blast-Radius Analysis:**
   `Hypertaks, analyze code relationships and dependency blast-radius for this refactor.`
5. **Continuity & Project Checkpoint:**
   `Hypertaks, analyze continuity status and prove what tasks remain.`

## Safety & Boundary Disclosures

- **Read-Only Boundary:** Hypertaks MCP operates purely in read-only mode. It contains zero remote write capabilities and zero shell execution tools.
- **Data Privacy:** Requests are processedstatelessly against canonical skills. No user data is persisted on remote servers without explicit local Boss approval.
- **Fail-Closed Execution:** Malformed, unauthorized, or out-of-scope requests fail closed immediately.

## Review Test Cases

### Positive Test Cases
1. **Business Audit:** Invoke "audit my business strategy", verifying intake gate sizing, framework selection, and compliance footer.
2. **Verification:** Call `hypertaks_verify_installation` or `/hypertaks-verify` to confirm environment readiness.
3. **Memory Management:** Call `hypertaks_route` for memory requests and verify boundary checks.
4. **Graph Analysis:** Search repository dependencies via `hypertaks-graph` read-only search.
5. **Continuity:** Run checkpoint reconciliation and verify proof of done.

### Negative Test Cases
1. **Remote Write Attempt:** Request database deletion or file modification via MCP -> fails closed with read-only error.
2. **Shell Execution:** Request arbitrary bash/shell command execution -> fails closed as unsupported tool.
3. **Non-Canonical Skill:** Request `hypertaks-unknown-skill` -> fails closed adhering to strict 5-skill boundary.

## Submission Status

- **Status:** `BLOCKED_BY_ACCOUNT` (Structurally prepared in repository; requires active OpenAI developer account login and domain ownership verification by human owner).
