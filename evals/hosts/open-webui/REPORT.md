# Open WebUI Adapter Audit Report

- **Host ID**: `open-webui`
- **Official Display Name**: Open WebUI
- **Official Documentation**: https://docs.openwebui.com/features/plugin
- **Tested Version**: 0.5.10 (from adapter metadata; not independently observed in this session)
- **OS**: windows, macos, linux - host OS only
- **Tested Commit**: `d845cea` (branch: `codex/cross-ai-distribution-wave-2-execution` worktree)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and manifest structure VERIFIED; live host lifecycle UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Manifest Presence**: the registered adapter path exists and is structurally valid.
   - Adapter path: `.open-webui/plugin.json`
2. **Registry Entry**: `distribution/registry.json` maps `open-webui` to distribution type `extension`.
3. **Skill Root**: manifest references `./skills/`; canonical skill directory present.
4. **Classification**: HOST_EXTENSION
5. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills (hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity); no sixth `hypertaks-*` skill.
6. **No Unneeded MCP**: the adapter does not bundle an MCP server; MCP remains optional external capability.

## Host Capabilities (from official documentation)

- Invocation: open-webui-function-or-tool-call
- Update mechanism: hypertaks-update
- Uninstall mechanism: hypertaks-uninstall
- Host tool mapping: open-webui-tools-api
- Subagent model: synthesized
- Persistent memory: file-backed-and-db-val
- Filesystem availability: server-side-file-system
- Command execution: server-python-execution
- Required account/plan: free-open-source
- MCP requirement: optional
- Known restrictions: extension registered via Open WebUI Functions/Tools Python script

## Unverified Items (Require Manual Host Test)

1. **Installation**: run `hypertaks install open-webui --scope project`; verify activation in the real host.
2. **Plugin and Skill Discovery**: confirm the host discovers exactly the five canonical skills with no sixth.
3. **Direct Invocation**: exercise `/hypertaks-verify` and the other four slash invocations.
4. **Natural Language Invocation**: `Hypertaks, fix a typo in this README.` selects Nano tier without subagent overhead.
5. **Tool Mapping**: verify capability routing matches open-webui-tools-api.
6. **Tier Behavior**: verify Lite, Standard, Prime, and Hyper contracts enforce correctly.
7. **Subagent Behavior**: verify subagent delegation per the host model.
8. **Update Mechanism**: `hypertaks update open-webui` fast-forwards cleanly; rejects dirty/diverged/detached states.
9. **Uninstall Mechanism**: `hypertaks uninstall open-webui` removes only Hypertaks files; `hypertaks verify open-webui` then reports NOT_INSTALLED.
10. **Security Boundaries**: verify path traversal, prompt injection, and secret masking boundaries.
11. **Clean Reinstall**: uninstall then reinstall succeeds without error.

**Verdict**: `PARTIAL`
