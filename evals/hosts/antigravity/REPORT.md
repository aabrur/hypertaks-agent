# Real Antigravity Lifecycle Evidence Report

- **Host ID**: `antigravity`
- **Official Display Name**: Google Antigravity
- **Application Version**: 1.4.0 (antigravity-cli 2026.7; claimed in adapter metadata, not independently observed in this session)
- **OS**: Windows 11 (build 26100) - host OS only
- **Tested Commit**: `d845cea` (branch: `codex/cross-ai-distribution-wave-2-execution` in worktree `cross-ai-distribution-wave-2-execution`, base `feat/cross-ai-distribution-wave-2`)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Package build and installer-level lifecycle VERIFIED in this session; live Google Antigravity host-app invocation UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## 1. Distribution Validation and Build Verification

Commands:

```text
python scripts/validate_skill.py
python scripts/validate_public_skills.py
python scripts/validate_distributions.py
python scripts/validate_host_capabilities.py
python scripts/build_distributions.py antigravity --check-only
```

Results:

- Skill validation: `OK (version 4.5.1)`
- Public Hypertaks skills: `OK` (exactly five: hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity)
- Host capabilities validation: `PASS`
- Distribution validation: `PASS`
- Antigravity build check (`--check-only`): `PASS`
- Build output: `dist/antigravity/hypertaks`

## 2. Integrity and Asset Verification

- Canonical SVG source: `assets/Hypertask.svg`
- Package SVG output: `dist/antigravity/hypertaks/assets/hypertaks.svg`
- SHA256 hash match: `a2a7e019df002500e05e2de095870c70f81e8eddd04c4ad9c922cddc483e6369`
- MCP server bundled: `false` (no `mcp_config.json` in built package)
- Hooks bundled: `false` (no `hooks.json` in built package)
- Package manifest: `BUILD-MANIFEST.json` contains the full file table and hashes.

## 3. Discovered Skills Verification

The built package contains exactly these five public skills:

1. `hypertaks`
2. `hypertaks-verify`
3. `hypertaks-brain`
4. `hypertaks-graph`
5. `hypertaks-continuity`

- Total public Hypertaks skills: **5**
- Sixth public skill present: **No**

## 4. Invocation Testing

Live invocation inside the actual Antigravity application was not executed in this session.

Unverified items requiring manual host test:

- `Hypertaks, fix a typo in README.md` (INV-04)
- `/hypertaks-verify` (INV-01)
- `/hypertaks-brain inspect` (INV-15)
- `/hypertaks-graph impact runtime/router.ts`
- `/hypertaks-continuity status`

Manual verification procedure:

1. Install Antigravity per host docs.
2. Run `hypertaks install antigravity --scope project`.
3. Confirm discovery of the exact five canonical skills.
4. Run the invocations above; record host version, OS, commit, timestamps, and sanitized logs.
5. Repeat for `--scope user`.

## 5. Installer Lifecycle (Isolated Target)

The hardened universal installer was exercised against Antigravity in an isolated temporary project root (never the repository's own `.agents/`), via `scripts/test_installer.py`:

- **Workspace install**: `cmd_install(host="antigravity", scope="project", project_root=<temp>)` -> `PASS`, 38 files installed at `<temp>/.agents/plugins/hypertaks`.
- **Verify**: `cmd_verify` -> `PASS` (all 38 checksums match).
- **Update**: `cmd_update` recalculates ownership hashes; `cmd_verify` passes afterward.
- **Uninstall**: `cmd_uninstall` removes only the 38 manifest-owned files; an unrelated `skills/UNKNOWN.md` is preserved; post-uninstall `cmd_verify` returns `NOT_INSTALLED`.
- **Clean reinstall**: install -> uninstall -> install succeeds idempotently.
- **Dirty/unsafe guards**: malformed manifest, traversal path, and unmanaged collision are each rejected without deletion; noninteractive calls without `--yes` change nothing.

## 6. Update and Uninstall Verification

- Installer and update-script guards verified at code level: `scripts/update_hypertaks.py` rejects dirty worktree, detached HEAD, diverged branch, and wrong remote (see `scripts/test_update_hypertaks.py`).
- Package rebuild after update: `python scripts/build_distributions.py antigravity --check-only` produces a consistent manifest and hashes.
- Live host-app update and uninstall: UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

## 7. Security and Boundary Verification

- Structural: no `mcp_config.json` and no `hooks.json` in the built package. VERIFIED.
- Package integrity: `scripts/validate_distributions.py` enforces the exact five-skill set, canonical SVG presence, and manifest hash accuracy. VERIFIED.
- Host-specific security boundary review (path traversal, prompt injection, secret masking): UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

**Final Verdict**: `PARTIAL`
