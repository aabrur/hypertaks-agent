# Cursor Adapter Audit Report

- **Host ID**: `cursor`
- **Official Display Name**: Cursor
- **Tested Version**: 0.45.0 (claimed in adapter metadata; not independently verified in this session)
- **OS**: Windows 11 (build 26100) - host OS only
- **Tested Commit**: `b7fdaf9` (branch: `feat/cross-ai-distribution-wave-2`)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and manifest structure VERIFIED; live lifecycle on Cursor application UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Manifest Presence**: `.cursor-plugin/plugin.json` exists and is valid JSON.
2. **Skill Root**: Manifest references `./skills/`; canonical skill directory present.
3. **Registry Entry**: `distribution/registry.json` maps `cursor` to `.cursor-plugin/plugin.json`.
4. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills.

## Unverified Items (Require Manual Host Test)

1. **Installation**: Install via `hypertaks install cursor --scope project`; verify `.cursor-plugin/` activation in Cursor.
2. **Plugin & Skill Discovery**: Confirm exactly 5 canonical skills discovered via Cursor rules.
3. **Direct Invocation**: Verify slash-command or rule-triggered invocation.
4. **Natural Language Invocation**: `Hypertaks, analyze why customer churn increased.` routes correctly.
5. **Tool Mapping**: Verify mapping to Cursor editor tools.
6. **Tier Behavior**: Verify tiering in Cursor execution context.
7. **Subagent Behavior**: Verify synthesized subagent behavior.
8. **Update Mechanism**: `hypertaks update cursor` syncs cleanly.
9. **Uninstall Mechanism**: `hypertaks uninstall cursor` removes only Hypertaks files.
10. **Security Boundaries**: Verify path containment, secret masking, injection resistance.
11. **Clean Reinstall**: Uninstall then reinstall succeeds.

**Verdict**: `PARTIAL`
