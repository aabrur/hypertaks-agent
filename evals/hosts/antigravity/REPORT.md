# Real Antigravity Lifecycle Evidence Report

- **Host ID**: `antigravity`
- **Official Display Name**: Google Antigravity
- **Application Version**: 1.4.0 (antigravity-cli 2026.7)
- **OS**: Windows 11 (build 26100)
- **Tested Commit**: `b7fdaf9` (branch: `feat/cross-ai-distribution-wave-2`)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Package build and installer-level lifecycle VERIFIED in this session; live Google Antigravity host-app invocation UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## 1. Distribution Validation & Build Verification

```powershell
python scripts/validate_skill.py
python scripts/validate_public_skills.py
python scripts/validate_distributions.py
python scripts/build_distributions.py antigravity
```

**Results**:
- Skill validation: `OK (version 4.5.0)`
- Public Hypertaks skills: `OK`
- Distribution validation: `PASS`
- Build Output: `C:\Users\abrur\Documents\hypertaks-agent\dist\antigravity\hypertaks`

## 2. Integrity & Asset Verification

- Canonical SVG Source: `assets/Hypertask.svg`
- Package SVG Output: `dist/antigravity/hypertaks/assets/hypertaks.svg`
- SHA256 Hash Match: `a2a7e019df002500e05e2de095870c70f81e8eddd04c4ad9c922cddc483e6369`
- MCP Server Bundled: `false` (verified `mcp_config.json` absent)
- Hooks Bundled: `false` (verified `hooks.json` absent)
- Package Manifest: `BUILD-MANIFEST.json` contains full file table and hashes.

## 3. Discovered Skills Verification

The built package contains exactly these five public skills:
1. `hypertaks`
2. `hypertaks-verify`
3. `hypertaks-brain`
4. `hypertaks-graph`
5. `hypertaks-continuity`

- Total Public Hypertaks Skills: **5**
- Sixth Public Skill Present: **No**

## 4. Invocation Testing

Live invocation inside the actual Antigravity application was not executed in this session.

Unverified items requiring manual host test:
- `Hypertaks, fix a typo in this README.`
- `/hypertaks-verify`
- `/hypertaks-brain inspect`
- `/hypertaks-graph impact runtime/router.ts`
- `/hypertaks-continuity status`

Manual verification procedure:
1. Install Antigravity per host docs.
2. Run `hypertaks install antigravity --scope project`.
3. Confirm discovery of the exact five canonical skills.
4. Run the five invocations above; record host version, OS, commit, timestamps, and sanitized logs.
5. Repeat for `--scope user`.

## 5. Lifecycle Scopes (Workspace & Global)

Installer-level lifecycle was executed in this session for project scope:
- **Workspace Installation**: `.agents/plugins/hypertaks`
  - Status: `PASS` via installer test `test_fresh_install_verify_update_uninstall_lifecycle`.
  - Files installed: 38; target `C:\Users\abrur\Documents\hypertaks-agent\.agents\plugins\hypertaks`
- **Global Installation**: `~/.gemini/config/plugins/hypertaks`
  - Status: UNVERIFIED in this session (Windows home-path expansion not exercised in automated test).

## 6. Update & Uninstall Verification

- Installer and update-script guards verified at code level:
  - `scripts/update_hypertaks.py` rejects dirty worktree, detached HEAD, diverged branch, and wrong remote.
  - `scripts/test_update_hypertaks.py` exercises those rejection paths.
- Package rebuild after update: verified `python scripts/build_distributions.py antigravity` produces consistent manifest and hashes.
- Uninstall test: `test_fresh_install_verify_update_uninstall_lifecycle` verified post-uninstall state shows `NOT_INSTALLED` for project scope.
- Clean reinstall: verified within the same installer test.

Live host-app update and uninstall: UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

## 7. Security & Boundary Verification

- Structural: no `mcp_config.json` and no `hooks.json` in built package. `VERIFIED`.
- Package integrity: `validate_distributions.py` enforces exact five-skill set, SVG presence, manifest hash accuracy. `VERIFIED`.
- Host-specific security boundary review: UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

**Final Verdict**: `PARTIAL`
