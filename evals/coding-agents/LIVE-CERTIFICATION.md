# Coding-Agent Live Certification Checklist

This checklist covers Production Rollout Wave 2:

- Claude Code
- Codex
- Cursor
- Kimi Code
- OpenCode
- Pi
- OpenClaw
- Hermes

A host receives `PASS` only when the named application version completes the full lifecycle below. Static manifests, copied files, installer tests, and model-written reports remain `PARTIAL` evidence.

## Evidence header

Record before testing:

```text
Host:
Host version:
Model:
Operating system:
Hypertaks commit:
Installation scope:
Installation target:
Tester:
Timestamp:
```

## Universal preflight

```text
python scripts/validate_public_skills.py
python scripts/validate_distributions.py
python scripts/validate_coding_agents.py
python scripts/installer.py doctor --json
```

Confirm exactly these public skills:

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

## Lifecycle cases required for every host

1. Install from a clean clone without editing generated skill files.
2. Start a new host session or run the documented reload command.
3. Capture the host's discovered skill list.
4. Confirm all five skills are present and no sixth `hypertaks-*` skill exists.
5. Invoke the main skill with: `Hypertaks, inspect this repository and explain what remains unfinished.`
6. Invoke each focused skill directly or through the host's native skill mechanism.
7. Verify harmless work remains proportional and does not fabricate subagents or tools.
8. Verify mutating work requests approval through the host's real permission boundary.
9. Verify MCP is not selected merely because the host supports it.
10. Update from a newer clean commit and confirm the host reload requirement.
11. Uninstall and confirm unrelated files remain.
12. Reinstall and repeat discovery.

## Host-specific discovery and reload checks

### Claude Code

- Record `claude --version` and `claude doctor` output.
- Confirm the plugin or selected skill root is visible in a fresh Claude Code session.
- Use normal permission mode. Do not use `--dangerously-skip-permissions` for certification.
- Record whether plugin updates require a new session.

### Codex

- Record the Codex version and active plugin or skill source.
- Confirm the five skills are discoverable from the installed package.
- Run one read-only repository task and one approved write task.
- Preserve tool-call evidence and the final Git diff.

### Cursor

- Record the Cursor application or `cursor-agent` version.
- Confirm project rules, plugin metadata, or the selected adapter path is actually active.
- Verify terminal commands prompt according to Cursor permissions.
- Record whether the test ran in the desktop Agent or Cursor CLI.

### Kimi Code

- Record `/version` and `/plugins info hypertaks`.
- Install through `/plugins install <repository-or-package>` and then run `/reload` or `/new`.
- Confirm the plugin is user-scoped and the managed copy is the active source.
- Remove through `/plugins remove hypertaks` and verify the installation record is gone.

### OpenCode

- Install the five folders under `.opencode/skills/` or `.agents/skills/`.
- Confirm the native `skill` tool lists all five IDs.
- Load `hypertaks` explicitly, then verify one natural-language auto-selection.
- Check skill permissions are not `deny` for the test profile.

### Pi

- Record the Pi version and package or extension source.
- Confirm `/skill:hypertaks` and the four focused `/skill:<name>` commands exist.
- Confirm `.pi/extensions/hypertaks.ts` registers the repository skill root.
- Test `/reload`, package update, removal, and reinstall.

### OpenClaw

- Run `openclaw skills list --json` or the current equivalent.
- Confirm all five skills are eligible in the selected agent profile.
- Record the workspace or `.agents/skills` source actually used.
- Test host-native skill update or managed-checkout update, then restart the session.

### Hermes

- Run `hermes skills list` and capture all five skills.
- Confirm the source is `~/.hermes/skills` or an explicitly configured `external_dirs` entry.
- Invoke each skill as a slash command or through `skill_view`.
- Verify update, removal, and fresh-session activation.

## Verdict

Use one verdict:

- `PASS`: complete real-host lifecycle with sanitized evidence.
- `PARTIAL`: structural, installer, or incomplete host evidence only.
- `FAIL`: observed host behavior violates required invariants.
- `BLOCKED`: account, application, permission, or environment prevents the test.

Attach sanitized logs, screenshots, command output, discovered skill names, tool calls, update result, uninstall result, and resulting Git diff where applicable.
