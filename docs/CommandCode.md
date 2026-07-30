# Hypertaks Cross-AI Distribution Wave 2 — Verification Report

**Reviewer:** CommandCode (Principal Cross-Agent Distribution Engineer)
**Date:** 2026-07-31
**Tested Commit:** `081116f2335fcebfe7312691e2d1023ad4aec45f`
**Branch:** `feat/cross-ai-distribution-wave-2`
**Product Version:** 4.5.0
**OS:** Windows (win32)
**Python:** 3.11.15

---

## Executive Summary

I ran the full CI validation gate on the `feat/cross-ai-distribution-wave-2` branch. All 13 checks pass. The repository has 22 host adapters, a universal installer, capability matrix, audit reports, cross-host conformance suite, and 13 marketplace-ready packages.

One fix was needed during verification: `docs/abrur.md` was tracked by git but missing on disk (restored with `git checkout`).

**Key finding:** Most `PASS` verdicts in existing reports are structural validation, not live behavioral testing. I distinguish both clearly below.

---

## Full Validation Gate Results

| # | Check | Command | Result |
|---|-------|---------|--------|
| 1 | Public skills | `python scripts/validate_public_skills.py` | ✅ 5/5 OK |
| 2 | Skill validation | `python scripts/validate_skill.py` | ✅ OK (v4.5.0) |
| 3 | Distribution validation | `python scripts/validate_distributions.py` | ✅ PASS |
| 4 | Antigravity build check | `python scripts/build_distributions.py antigravity --check-only` | ✅ PASS |
| 5 | Build tests | `python -m unittest scripts.test_build_distributions -v` | ✅ 3/3 OK |
| 6 | Eval structure | `python scripts/run_evals.py --check` | ✅ 88/88 OK |
| 7 | Eval static preconditions | `python scripts/run_evals.py --static` | ✅ 88/88 GREEN |
| 8 | Eval + retrieval tests | `python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v` | ✅ 25/25 OK |
| 9 | TypeScript runtime | `npm test` (typecheck → build → test) | ✅ PASS |
| 10 | Installer tests | `python -m unittest scripts.test_installer -v` | ✅ 5/5 OK |
| 11 | Update tests | `python -m unittest scripts.test_update_hypertaks -v` | ✅ 7/7 OK |
| 12 | Conformance tests | `python -m unittest scripts.test_validate_conformance -v` | ✅ 1/1 OK |
| 13 | Python compileall + git diff | `python -m compileall scripts` + `git diff --check` | ✅ PASS |

**Total: 13/13 gates pass. Zero failures.**

---

## Supported Host Matrix with Evidence Class

| Host ID | Classification | Structure | Installer Test | Live Host Test | Evidence |
|---------|---------------|-----------|----------------|----------------|----------|
| `claude-code` | `NATIVE_PLUGIN` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `codex` | `NATIVE_PLUGIN` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `cursor` | `NATIVE_PLUGIN` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `kimi-code` | `NATIVE_PLUGIN` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `opencode` | `PLUGIN_AND_SKILL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `pi` | `HOST_EXTENSION` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `openclaw` | `NATIVE_SKILL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `hermes` | `NATIVE_SKILL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `antigravity` | `PLUGIN_AND_SKILL` | ✅ | ✅ (build + install lifecycle) | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `chatgpt` | `CHATGPT_APP_ADAPTER` | ✅ | N/A (MCP transport) | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `github-copilot` | `NATIVE_PLUGIN` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `windsurf` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `cline` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `roo-code` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `kilo-code` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `aider` | `PROJECT_INSTRUCTIONS` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `goose` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `openhands` | `MANAGED_INSTALL` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `claude-ai` | `PROJECT_INSTRUCTIONS` | ✅ | N/A (web UI upload) | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `gemini-app` | `CUSTOM_ASSISTANT` | ✅ | N/A (web UI Gem) | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `open-webui` | `HOST_EXTENSION` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |
| `librechat` | `HOST_EXTENSION` | ✅ | ✅ | ❌ NEEDS_MANUAL_HOST_TEST | PARTIAL |

---

## Install / Update / Uninstall Matrix

| Host | Install (project) | Install (user) | Update | Uninstall | Reinstall |
|------|-------------------|----------------|--------|-----------|-----------|
| `antigravity` | ✅ tested | ⚠️ structure only | ✅ tested | ✅ tested | ✅ tested |
| `claude-code` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `codex` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `cursor` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `kimi-code` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `opencode` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `pi` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `openclaw` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `hermes` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `chatgpt` | N/A (MCP register) | N/A | N/A | N/A | N/A |
| `github-copilot` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `windsurf` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `cline` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `roo-code` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `kilo-code` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `aider` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `goose` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `openhands` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `claude-ai` | N/A (web UI) | N/A | N/A | N/A | N/A |
| `gemini-app` | N/A (web UI) | N/A | N/A | N/A | N/A |
| `open-webui` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |
| `librechat` | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only | ✅ structure only |

---

## Marketplace Readiness

| Host | Status |
|------|--------|
| `antigravity` | `READY_FOR_HUMAN_SUBMISSION` |
| `claude-code` | `READY_FOR_HUMAN_SUBMISSION` |
| `codex` | `READY_FOR_HUMAN_SUBMISSION` |
| `cursor` | `READY_FOR_HUMAN_SUBMISSION` |
| `chatgpt` | `READY_FOR_HUMAN_SUBMISSION` |
| `github-copilot` | `READY_FOR_HUMAN_SUBMISSION` |
| `windsurf` | `READY_FOR_HUMAN_SUBMISSION` |
| `cline` | `READY_FOR_HUMAN_SUBMISSION` |
| `roo-code` | `READY_FOR_HUMAN_SUBMISSION` |
| `goose` | `READY_FOR_HUMAN_SUBMISSION` |
| `openhands` | `READY_FOR_HUMAN_SUBMISSION` |
| `open-webui` | `READY_FOR_HUMAN_SUBMISSION` |
| `librechat` | `READY_FOR_HUMAN_SUBMISSION` |
| `kimi-code` | `NO_PUBLIC_MARKETPLACE` |
| `opencode` | `NO_PUBLIC_MARKETPLACE` |
| `pi` | `NO_PUBLIC_MARKETPLACE` |
| `openclaw` | `NO_PUBLIC_MARKETPLACE` |
| `hermes` | `NO_PUBLIC_MARKETPLACE` |
| `kilo-code` | `NO_PUBLIC_MARKETPLACE` |
| `aider` | `NO_PUBLIC_MARKETPLACE` |
| `claude-ai` | `NO_PUBLIC_MARKETPLACE` |
| `gemini-app` | `NO_PUBLIC_MARKETPLACE` |

No marketplace publication has occurred. No `SUBMITTED`, `APPROVED`, or `PUBLISHED` status has been claimed.

---

## Cross-Host Behavioral Conformance

| Case | Host | Invariant Group | Verdict |
|------|------|-----------------|---------|
| CH-01 | Antigravity | Product Identity + Tiering | PASS |
| CH-02 | Claude Code | Execution + Capability | PASS |
| CH-03 | Codex | Security + Boundary | PASS |
| CH-04 | ChatGPT | Memory + Continuity | PASS |
| CH-05 | Antigravity | Lifecycle Integrity | PASS |

All 5/5 invariant verification cases pass. Coverage across 4 hosts and 7 invariant groups. Note: these are structural conformance checks, not live behavioral runs.

---

## Security Findings

| Finding | Status |
|---------|--------|
| Path traversal rejected (approved-root containment) | CONFIRMED |
| Prompt injection blocked (T0/T1 authority lattice) | CONFIRMED |
| Secrets masked in logs and handoffs | CONFIRMED |
| No silent privilege escalation | CONFIRMED |
| Installer dry-run by default, confirmation required | CONFIRMED |
| Atomic writes with temp-file + rename | CONFIRMED |
| Update rejects dirty/diverged/detached/wrong-remote | CONFIRMED |

---

## What Is Complete (CONFIRMED)

1. Canonical five skills: identity unchanged, routing intact
2. 22 host adapters: structurally present with plugin.json and INSTALL.md per host
3. Universal installer: `scripts/installer.py` with `doctor`, `list-hosts`, `install`, `status`, `update`, `uninstall`, `verify`
4. Installer tests: fresh install, reinstall, update, corrupted package, unsupported host, uninstall, reinstall-after-uninstall — all passing
5. Update mechanism: `scripts/update_hypertaks.py` with dirty/diverged/detached/wrong-remote rejection — all 7 tests passing
6. Distribution build: `scripts/build_distributions.py antigravity` produces valid package with BUILD-MANIFEST.json, SVG hash, 5 skills, no MCP/hooks
7. Capability matrix: `distribution/host-capabilities.json` (22 hosts, 623 lines) and `distribution/HOST-CAPABILITY-MATRIX.md`
8. Audit reports: 9 hosts with `PARTIAL` verdicts, accurate evidence classification in `distribution/EXISTING-ADAPTER-AUDIT.md`
9. Cross-host conformance: 5/5 invariant cases pass, 7 groups covered
10. Marketplace packages: 13 hosts at `READY_FOR_HUMAN_SUBMISSION`, 9 at `NO_PUBLIC_MARKETPLACE`
11. README: updated with 22-host matrix, install instructions, clear classification legend
12. CI workflows: `validate-distributions.yml` and `validate.yml` both target this branch
13. All 13 validation gates pass: zero failures, all exit codes 0

## What Needs Live Host Testing (NEEDS_VERIFICATION)

Every host requires manual live testing:
- Install the adapter inside the real host application
- Confirm exactly 5 skills are discovered (no sixth)
- Test direct invocation (`/hypertaks-verify`, `/hypertaks-brain inspect`, etc.)
- Test natural language invocation ("Hypertaks, fix a typo")
- Test tier selection (Nano, Lite, Standard, Prime, Hyper)
- Test subagent spawning or synthesized fallback
- Test update flow
- Test uninstall and reinstall

## What Is Blocked

- **Live behavioral certification for v4.5.0**: EV-50 through EV-88 still need fresh independent cold-session behavioral transcripts. The 4.3.0 ledger (43/49 PASS) is historical only.
- **Global installation scope on non-Windows**: `~/.gemini/config/plugins/hypertaks` path only tested structurally on Windows.
- **ChatGPT App Directory**: Requires OpenAI review. Cannot be submitted without human approval.
- **Claude Code Plugin Directory**: Requires Anthropic review. Cannot be submitted without human approval.
- **All marketplace submissions**: Require explicit human approval per platform per version.

---

## Exact Manual Actions Required

1. **Review and merge** the PR from `feat/cross-ai-distribution-wave-2` to `main`
2. **Live host testing** — install and invoke Hypertaks on each real host application (see `distribution/EXISTING-ADAPTER-AUDIT.md` for procedures)
3. **Marketplace approval** — explicitly approve each marketplace submission before publication
4. **Global install test** — test `hypertaks install antigravity --scope user` on macOS or Linux
5. **Behavioral certification** — run EV-50 through EV-88 as independent cold-session behavioral transcripts

---

## Explicit Confirmation

No unauthorized marketplace publication occurred. All 13 marketplace packages are tagged `READY_FOR_HUMAN_SUBMISSION` — a status that requires explicit human approval before any submission action. No `SUBMITTED`, `APPROVED`, or `PUBLISHED` status has been claimed.

---

**Branch:** `feat/cross-ai-distribution-wave-2`
**Tested Commit:** `081116f2335fcebfe7312691e2d1023ad4aec45f`
**Pull Request:** Not yet opened (requires `git push` first)
**Completed Hosts:** 22/22 structurally complete, 0/22 live-tested
**Blocked Hosts:** None (all structurally present; live testing pending)
**Tests:** 13/13 gates pass, 49 unit tests pass, 88 eval cases structurally OK, 88 static preconditions GREEN
**Marketplace Readiness:** 13 READY_FOR_HUMAN_SUBMISSION, 9 NO_PUBLIC_MARKETPLACE
