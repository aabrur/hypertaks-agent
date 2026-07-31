# Claude.ai Adapter Audit Report

- **Host ID**: `claude-ai`
- **Official Display Name**: Claude.ai
- **Official Documentation**: https://support.anthropic.com/en/articles/9517377-about-projects
- **Tested Version**: Claude.ai Web App 2026 (from adapter metadata; not independently observed in this session)
- **OS**: all-web-platforms - host OS only
- **Tested Commit**: `d845cea` (branch: `codex/cross-ai-distribution-wave-2-execution` worktree)
- **Timestamp**: `2026-07-31T01:16:00+07:00`
- **Verdict**: `PARTIAL`
- **Evidence Class**: Adapter files and manifest structure VERIFIED; live host lifecycle UNVERIFIED / NEEDS_MANUAL_HOST_TEST.

---

## Verified Items (Code/Structure)

1. **Manifest Presence**: the registered adapter path exists and is structurally valid.
   - Adapter path: `.claude-ai/plugin.json`
2. **Registry Entry**: `distribution/registry.json` maps `claude-ai` to distribution type `project-instructions`.
3. **Skill Root**: manifest references `./skills/`; canonical skill directory present.
4. **Classification**: PROJECT_INSTRUCTIONS
5. **Skill Count Validation**: `python scripts/validate_public_skills.py` confirms exactly 5 canonical public skills (hypertaks, hypertaks-verify, hypertaks-brain, hypertaks-graph, hypertaks-continuity); no sixth `hypertaks-*` skill.
6. **No Unneeded MCP**: the adapter does not bundle an MCP server; MCP remains optional external capability.

## Host Capabilities (from official documentation)

- Invocation: project-instructions-and-knowledge-files
- Update mechanism: manual-project-file-sync
- Uninstall mechanism: delete-project-or-knowledge-files
- Host tool mapping: artifacts-and-analysis-tool
- Subagent model: synthesized
- Persistent memory: project-knowledge-files
- Filesystem availability: none-upload-only
- Command execution: none-sandboxed-javascript-artifacts-only
- Required account/plan: claude-pro-or-team
- MCP requirement: unavailable
- Known restrictions: no native terminal command execution; uses uploaded project instructions package

## Unverified Items (Require Manual Host Test)

1. **Installation**: run `hypertaks install claude-ai --scope project`; verify activation in the real host.
2. **Plugin and Skill Discovery**: confirm the host discovers exactly the five canonical skills with no sixth.
3. **Direct Invocation**: exercise `/hypertaks-verify` and the other four slash invocations.
4. **Natural Language Invocation**: `Hypertaks, fix a typo in this README.` selects Nano tier without subagent overhead.
5. **Tool Mapping**: verify capability routing matches artifacts-and-analysis-tool.
6. **Tier Behavior**: verify Lite, Standard, Prime, and Hyper contracts enforce correctly.
7. **Subagent Behavior**: verify subagent delegation per the host model.
8. **Update Mechanism**: `hypertaks update claude-ai` fast-forwards cleanly; rejects dirty/diverged/detached states.
9. **Uninstall Mechanism**: `hypertaks uninstall claude-ai` removes only Hypertaks files; `hypertaks verify claude-ai` then reports NOT_INSTALLED.
10. **Security Boundaries**: verify path traversal, prompt injection, and secret masking boundaries.
11. **Clean Reinstall**: uninstall then reinstall succeeds without error.

**Verdict**: `PARTIAL`
