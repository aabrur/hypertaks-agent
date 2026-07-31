# OpenCode Adapter Audit Report

- **Host ID**: `opencode`
- **Official Display Name**: OpenCode
- **Tested Version**: 0.9.4 (claimed in adapter metadata; not independently verified in this session)
- **OS**: Windows 11 (build 26100) - host OS only
- **Tested Commit**: `d845cea` (branch: `feat/cross-ai-distribution-wave-2`)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and install guide structure VERIFIED; live lifecycle on OpenCode application UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Install Guide Presence**: `.opencode/INSTALL.md` exists.
2. **Registry Entry**: `distribution/registry.json` maps `opencode` to install guide `.opencode/INSTALL.md`.
3. **Plugin Manager Discovery Path**: Install guide references OpenCode plugin manager discovery.
4. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills.

## Unverified Items (Require Manual Host Test)

1. **Installation**: Follow `.opencode/INSTALL.md`; verify OpenCode plugin manager discovers Hypertaks.
2. **Plugin & Skill Discovery**: Confirm exactly 5 canonical skills discovered via OpenCode plugin manager.
3. **Direct Invocation**: Verify slash-command invocation.
4. **Natural Language Invocation**: Natural language prompts route to Hypertaks.
5. **Tool Mapping**: Verify mapping to OpenCode tools.
6. **Tier Behavior**: Verify tiering in OpenCode execution context.
7. **Subagent Behavior**: Verify native-subagent support or synthesized fallback.
8. **Update Mechanism**: `hypertaks update opencode` syncs cleanly.
9. **Uninstall Mechanism**: `hypertaks uninstall opencode` removes only Hypertaks files.
10. **Security Boundaries**: Verify path containment, secret masking, injection resistance.
11. **Clean Reinstall**: Uninstall then reinstall succeeds.

**Verdict**: `PARTIAL`
