# ChatGPT Adapter Audit Report

- **Host ID**: `chatgpt`
- **Official Display Name**: ChatGPT
- **Official Documentation**: https://platform.openai.com/docs/actions
- **Tested Version**: ChatGPT Web/Apps SDK 2026 (from adapter metadata; not independently observed in this session)
- **OS**: all-web-platforms - host OS only
- **Tested Commit**: `d845cea` (branch: `codex/cross-ai-distribution-wave-2-execution` worktree)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and manifest structure VERIFIED; live host lifecycle UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Manifest Presence**: the registered adapter path exists and is structurally valid.
   - Adapter path: `.chatgpt/plugin.json`
2. **Registry Entry**: `distribution/registry.json` maps `chatgpt` to distribution type `chatgpt-app-adapter`.
3. **Skill Root**: manifest references `./skills/`; canonical skill directory present.
4. **Classification**: CHATGPT_APP_ADAPTER
5. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills (hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity); no sixth `hypertaks-*` skill.
6. **No Unneeded MCP**: the adapter does not bundle an MCP server; MCP remains optional external capability.

## Host Capabilities (from official documentation)

- Invocation: chatgpt-app-action-trigger
- Update mechanism: remote-mcp-server-update
- Uninstall mechanism: remove-custom-gpt-or-app
- Host tool mapping: mcp-server-tools
- Subagent model: synthesized
- Persistent memory: custom-gpt-instructions-and-mcp-state
- Filesystem availability: none-remote-mcp-only
- Command execution: none-remote-mcp-only
- Required account/plan: chatgpt-plus-or-team
- MCP requirement: required
- Known restrictions: MCP transport is host-required for ChatGPT Apps SDK integration

## Unverified Items (Require Manual Host Test)

1. **Installation**: run `hypertaks install chatgpt --scope project`; verify activation in the real host.
2. **Plugin and Skill Discovery**: confirm the host discovers exactly the five canonical skills with no sixth.
3. **Direct Invocation**: exercise `/hypertaks-verify` and the other four slash invocations.
4. **Natural Language Invocation**: `Hypertaks, fix a typo in this README.` selects Nano tier without subagent overhead.
5. **Tool Mapping**: verify capability routing matches mcp-server-tools.
6. **Tier Behavior**: verify Lite, Standard, Prime, and Hyper contracts enforce correctly.
7. **Subagent Behavior**: verify subagent delegation per the host model.
8. **Update Mechanism**: `hypertaks update chatgpt` fast-forwards cleanly; rejects dirty/diverged/detached states.
9. **Uninstall Mechanism**: `hypertaks uninstall chatgpt` removes only Hypertaks files; `hypertaks verify chatgpt` then reports NOT_INSTALLED.
10. **Security Boundaries**: verify path traversal, prompt injection, and secret masking boundaries.
11. **Clean Reinstall**: uninstall then reinstall succeeds without error.

**Verdict**: `PARTIAL`
