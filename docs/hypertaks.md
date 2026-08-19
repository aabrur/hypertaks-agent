# Hypertaks Cross-AI Distribution Status

**Date:** 2026-07-31
**Author:** Kilo (Principal Cross-Agent Distribution Engineer)
**Repo:** https://github.com/aabrur/hypertaks-agent
**Branch:** `feat/cross-ai-distribution-wave-2`
**Tested Commit:** `e4c2c2ed16950403113ea3fff33a8ca791d56932`
**Product:** Hypertaks Founder Operating System v4.5.1
**Status:** PARTIAL (structure verified; live host-app behavioral testing pending)

---

## What This Document Covers

This file is the top-level evidence anchor for the Hypertaks cross-AI distribution layer. It records what was verified, what was built, and what still requires manual host execution.

Do not treat this document as a substitute for live host testing. Every conclusion below carries an evidence class.

---

## Canonical Product Identity (CONFIRMED)

- **Exactly five public skills**, no more:
  - `hypertaks`
  - `hypertaks-verify`
  - `hypertaks-brain`
  - `hypertaks-graph`
  - `hypertaks-continuity`
- **MCP policy:** optional external capability, except where host transport requires it (ChatGPT Apps SDK).
- **Active Google target:** Google Antigravity. Gemini CLI is not an active target. Gemini App is a separate custom-assistant definition.
- **Logo:** `assets/Hypertask.svg` copied without destructive modification.

Evidence:
- `scripts/validate_public_skills.py` â€” PASS
- `distribution/registry.json` â€” exactly five canonical skills listed
- `package.json` files array â€” includes canonical skills plus adapter directories

---

## Host Coverage (22 Total)

### 9 Active / Existing Adapters

| Host | Classification | Structure | Live Host Test | Verdict |
|---|---|---|---|---|
| `antigravity` | PLUGIN_AND_SKILL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `claude-code` | NATIVE_PLUGIN | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `codex` | NATIVE_PLUGIN | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `cursor` | NATIVE_PLUGIN | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `kimi-code` | NATIVE_PLUGIN | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `opencode` | PLUGIN_AND_SKILL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `pi` | HOST_EXTENSION | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `openclaw` | NATIVE_SKILL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `hermes` | NATIVE_SKILL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |

### 13 New Targets

| Host | Classification | Structure | Live Host Test | Verdict |
|---|---|---|---|---|
| `chatgpt` | CHATGPT_APP_ADAPTER | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `github-copilot` | NATIVE_PLUGIN | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `windsurf` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `cline` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `roo-code` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `kilo-code` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `aider` | PROJECT_INSTRUCTIONS | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `goose` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `openhands` | MANAGED_INSTALL | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `claude-ai` | PROJECT_INSTRUCTIONS | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `gemini-app` | CUSTOM_ASSISTANT | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `open-webui` | HOST_EXTENSION | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `librechat` | HOST_EXTENSION | VERIFIED | NEEDS_MANUAL_HOST_TEST | PARTIAL |

Evidence:
- `distribution/host-capabilities.json` â€” 22 entries, all `evidenceStatus: PASS` at structure level
- `distribution/HOST-CAPABILITY-MATRIX.md` â€” summary matrix
- Adapter directories and manifests present for all 22 hosts

---

## Antigravity Package Integrity (VERIFIED)

- Build command: `python scripts/build_distributions.py antigravity`
- Built package: `dist/antigravity/hypertaks/`
- Package contains exactly five canonical skills
- Package contains `assets/hypertaks.svg` copied from `assets/Hypertask.svg`
- `BUILD-MANIFEST.json` present with per-file SHA-256 digests
- No `mcp_config.json` bundled
- No `hooks.json` bundled
- `python scripts/validate_distributions.py` â€” PASS
- `python scripts/build_distributions.py antigravity --check-only` â€” PASS
- `python -m unittest scripts.test_build_distributions` â€” 3/3 OK

Evidence class for Antigravity host-app invocation: UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Universal Installer (VERIFIED)

Location: `scripts/installer.py`

Supported commands:
- `hypertaks doctor`
- `hypertaks list-hosts`
- `hypertaks install <host> [--scope project|user]`
- `hypertaks status`
- `hypertaks update [host]`
- `hypertaks uninstall <host>`
- `hypertaks verify <host>`

Verified behaviors:
- Fresh install, verify, update, uninstall lifecycle for `antigravity` project scope â€” PASS
- Corrupted package detection â€” PASS (checksum mismatch reported)
- Unsupported host rejection â€” PASS (`"nonexistent-host"` returns FAIL with actionable message)
- Cross-platform paths: Windows tested in this session; macOS/Linux paths inferred from installer code

Evidence:
- `scripts/test_installer.py` â€” 6/6 OK
- `scripts/validate_conformance.py` â€” PASS
- `scripts/test_validate_conformance.py` â€” 1/1 OK

---

## Marketplace Metadata (CONFIRMED - No Publication)

Marketplace metadata packages present for 13 hosts with public or semi-public marketplaces:
- `marketplace/antigravity/metadata.json`
- `marketplace/openai/metadata.json`
- `marketplace/claude-code/metadata.json`
- `marketplace/cline/metadata.json`
- `marketplace/codex/metadata.json`
- `marketplace/cursor/metadata.json`
- `marketplace/github-copilot/metadata.json`
- `marketplace/goose/metadata.json`
- `marketplace/librechat/metadata.json`
- `marketplace/open-webui/metadata.json`
- `marketplace/openhands/metadata.json`
- `marketplace/roo-code/metadata.json`
- `marketplace/windsurf/metadata.json`

All entries carry status `READY_FOR_HUMAN_SUBMISSION`.

No entry carries `SUBMITTED`, `APPROVED`, or `PUBLISHED`.

Evidence:
- `marketplace/SUBMISSION-READINESS.md` â€” status matrix with explicit human-approval gate
- Zero external marketplace API calls, webhook submissions, or publish actions in this session

---

## Cross-Host Conformance Suite (CONFIRMED)

- Spec: `evals/cross-host/CONFORMANCE-SPEC.md`
- Cases: `evals/cross-host/cases.jsonl`
- Results: `evals/cross-host/results.json`
- Summary: `evals/cross-host/SUMMARY.md`
- Validator: `scripts/validate_conformance.py` â€” PASS

Note: Behavioral conformance is validated structurally and via validator. Live host behavioral execution is UNVERIFIED for all hosts.

---

## Adapter Audit Reports (CONFIRMED - Honest Evidence Classes)

Individual host audit reports live under `evals/hosts/<host-id>/REPORT.md`. All nine existing adapters plus Antigravity are rated `PARTIAL` with structure verified and live host-app testing UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

Summary: `distribution/EXISTING-ADAPTER-AUDIT.md`

---

## CI / Validation Gate (All Passing)

| Gate | Exit Code | Result |
|---|---|---|
| `python scripts/validate_skill.py` | 0 | PASS |
| `python scripts/validate_public_skills.py` | 0 | PASS |
| `python scripts/validate_distributions.py` | 0 | PASS |
| `python scripts/build_distributions.py antigravity --check-only` | 0 | PASS |
| `python -m unittest scripts.test_build_distributions` | 0 | 3/3 OK |
| `python scripts/validate_conformance.py` | 0 | PASS |
| `python -m unittest scripts.test_installer scripts.test_validate_conformance` | 0 | 6/6 OK |
| `python scripts/run_evals.py --check` | 0 | 88/88 OK |
| `python scripts/run_evals.py --static` | 0 | 88/88 GREEN |
| `python -m unittest scripts.test_run_evals scripts.test_retrieval_eval` | 0 | 25/25 OK |
| `npm test` | 0 | PASS |
| `python -m compileall scripts` | 0 | PASS |
| `git diff --check` | 0 | clean |

---

## Security Posture (No Incidents)

- No secret values found in manifests, adapters, reports, or scripts.
- No sixth public skill introduced.
- No MCP server bundled into any host that does not require it.
- MCP used only as transport where host mandates it (ChatGPT).
- No symlink dependency for normal installation.
- No unauthorized marketplace publication, deployment, or external side effect.

---

## What Remains Incomplete

1. **Live host-app testing** for all 22 hosts. Structural verification is complete. Behavioral certification is not.
2. **Host capability metadata accuracy** against current live documentation. Version strings, marketplace URLs, and capability claims should be spot-checked before claiming `PASS`.
3. **README support matrix** wording should reflect the verified `PARTIAL` state.
4. **CI workflow** should be reviewed to ensure it runs the new installer and conformance tests on every push.

---

## Manual Actions Required

1. Execute `hypertaks install <host>` for each target host and record results in `evals/hosts/<host-id>/REPORT.md`.
2. Submit marketplace packages only after explicit human approval.
3. Update `distribution/host-capabilities.json` version strings after live testing.
4. Review and merge PR #15.

---

## No Unauthorized Publication

No marketplace, registry, or external host received a Hypertaks package, submission, or API call without explicit human approval. All marketplace metadata is local and tagged `READY_FOR_HUMAN_SUBMISSION`.

---

*This document is the top-level evidence anchor for the Hypertaks Cross-AI Distribution Wave 2 implementation. Child evidence lives in `distribution/`, `evals/`, `marketplace/`, and `scripts/`.*
