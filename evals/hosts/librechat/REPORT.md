# LibreChat Adapter Audit Report

- **Host ID**: `librechat`
- **Official Display Name**: LibreChat
- **Official Documentation**: https://docs.librechat.ai/features/plugins
- **Tested Version**: 0.7.6 (from adapter metadata; not independently observed in this session)
- **OS**: windows, macos, linux - host OS only
- **Tested Commit**: `d845cea` (branch: `codex/cross-ai-distribution-wave-2-execution` worktree)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and manifest structure VERIFIED; live host lifecycle UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Manifest Presence**: the registered adapter path exists and is structurally valid.
   - Adapter path: `.librechat/plugin.json`
2. **Registry Entry**: `distribution/registry.json` maps `librechat` to distribution type `extension`.
3. **Skill Root**: manifest references `./skills/`; canonical skill directory present.
4. **Classification**: HOST_EXTENSION
5. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills (hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity); no sixth `hypertaks-*` skill.
6. **No Unneeded MCP**: the adapter does not bundle an MCP server; MCP remains optional external capability.

## Host Capabilities (from official documentation)

- Invocation: librechat-preset-tool-call
- Update mechanism: hypertaks-update
- Uninstall mechanism: hypertaks-uninstall
- Host tool mapping: librechat-plugin-api
- Subagent model: synthesized
- Persistent memory: file-backed
- Filesystem availability: server-filesystem
- Command execution: code-execution-tool
- Required account/plan: free-open-source
- MCP requirement: optional
- Known restrictions: extension provided as LibreChat custom tool preset

## Unverified Items (Require Manual Host Test)

1. **Installation**: run `hypertaks install librechat --scope project`; verify activation in the real host.
2. **Plugin and Skill Discovery**: confirm the host discovers exactly the five canonical skills with no sixth.
3. **Direct Invocation**: exercise `/hypertaks-verify` and the other four slash invocations.
4. **Natural Language Invocation**: `Hypertaks, fix a typo in this README.` selects Nano tier without subagent overhead.
5. **Tool Mapping**: verify capability routing matches librechat-plugin-api.
6. **Tier Behavior**: verify Lite, Standard, Prime, and Hyper contracts enforce correctly.
7. **Subagent Behavior**: verify subagent delegation per the host model.
8. **Update Mechanism**: `hypertaks update librechat` fast-forwards cleanly; rejects dirty/diverged/detached states.
9. **Uninstall Mechanism**: `hypertaks uninstall librechat` removes only Hypertaks files; `hypertaks verify librechat` then reports NOT_INSTALLED.
10. **Security Boundaries**: verify path traversal, prompt injection, and secret masking boundaries.
11. **Clean Reinstall**: uninstall then reinstall succeeds without error.

**Verdict**: `PARTIAL`
