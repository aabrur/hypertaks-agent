# Installing Hypertaks for OpenCode

OpenCode supports Agent Skills directly. Wave 2 uses the documented native skill locations and does not claim an npm-style Git plugin package.

## Project installation

From a clean Hypertaks clone:

```text
python scripts/installer.py install opencode --scope project
```

The current project installer places the five canonical skills under:

```text
.opencode/skills/
```

OpenCode also discovers project skills from:

```text
.agents/skills/
```

## User installation

For a user-wide installation, copy or link each of the five canonical skill directories to:

```text
~/.config/opencode/skills/
```

Do not place Hypertaks in `~/.opencode/plugins/`; that is not the documented user skill root.

## Discovery and invocation

Start a new OpenCode session and inspect the native `skill` tool. Confirm exactly these IDs:

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

Load the main skill through the native skill mechanism or invoke it in natural language:

```text
Hypertaks, inspect this repository and explain what remains unfinished.
```

## Permissions

Ensure the selected OpenCode profile does not deny the five Hypertaks skill IDs. A permission value of `ask` may request approval when a skill loads; `deny` hides it.

## Update

Update the canonical checkout only after review:

```text
python scripts/update_hypertaks.py --check-only
python scripts/update_hypertaks.py
```

Restart or reload OpenCode after the update. Do not claim that an active session reloads skill content automatically.

## Uninstall

Remove only the five Hypertaks-owned skill directories and the Hypertaks ownership manifest. Preserve unrelated OpenCode skills and configuration.

## Certification

Run the OpenCode section in:

```text
evals/coding-agents/LIVE-CERTIFICATION.md
```

A structurally valid skill directory remains `PARTIAL` until discovery and invocation are observed in a real OpenCode version.
