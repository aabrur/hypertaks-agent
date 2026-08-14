# Official MCP Registry Publication Guide

This document details the exact process and commands required to submit Hypertaks to the Official Model Context Protocol (MCP) Registry (`github.com/modelcontextprotocol/registry`).

## Registry Registration Specifications

- **Namespace:** `com.crimsonriftstudio/hypertaks`
- **Server Title:** Hypertaks Founder Operating System
- **Publisher:** Crimson Rift Studio
- **Version:** 4.5.2
- **Manifest Path:** `marketplace/mcp-registry/server.json`
- **Remote MCP Endpoint:** https://hypertaks.crimsonriftstudio.com/mcp
- **Health Check Endpoint:** https://hypertaks.crimsonriftstudio.com/healthz
- **Transport Mode:** Streamable HTTP (`streamable-http`)

## Namespace & Domain Verification Requirements

Publication under the namespace `com.crimsonriftstudio/hypertaks` requires domain ownership verification for `crimsonriftstudio.com`.

Before running publication commands:
1. Ensure `https://hypertaks.crimsonriftstudio.com/healthz` returns `200 OK`.
2. Ensure DNS TXT record or GitHub organization verification for `crimsonriftstudio.com` is active.

## Submission Methods

### Method A: Direct Pull Request (Recommended)

1. Fork the official MCP Registry repository:
   `git clone https://github.com/modelcontextprotocol/registry.git`
2. Create a new branch:
   `git checkout -b submit/com.crimsonriftstudio-hypertaks`
3. Copy `marketplace/mcp-registry/server.json` into `servers/com.crimsonriftstudio/hypertaks/server.json`.
4. Validate the manifest against the official schema:
   `npx @modelcontextprotocol/publisher validate --manifest servers/com.crimsonriftstudio/hypertaks/server.json`
5. Commit and submit a Pull Request to `modelcontextprotocol/registry`.

### Method B: MCP Publisher CLI Tool

When authenticated with registry credentials:
```bash
npx @modelcontextprotocol/publisher publish --manifest marketplace/mcp-registry/server.json
```

## Readiness Status

- **Status:** `READY_FOR_SUBMISSION`
- **Validation:** Passed local schema validation.
- **Human Action Required:** Requires human owner execution of the PR or CLI publish command with authenticated domain verification.
