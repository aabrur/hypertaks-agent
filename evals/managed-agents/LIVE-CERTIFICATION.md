# Wave 3 Live Host Certification

This checklist covers GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider, Goose, and OpenHands.

Wave 3 is plugin-first where the host provides a real plugin lifecycle. A fake `/plugin` command is not acceptable. Hosts without a verified plugin command must be certified through their official Skills, project-instruction, or recipe mechanism.

A static package, manifest, plugin source file, copied skill directory, validator, or CI result is not behavioral certification. `PASS` requires evidence from the named real host version.

## Evidence record

Record all of the following before changing a host from `PARTIAL`:

- host name and exact application or CLI version;
- host surface, such as CLI, VS Code, JetBrains, web, desktop, or self-hosted;
- operating system and architecture;
- Hypertaks commit SHA;
- exact installation command or UI steps;
- plugin or skill discovery output;
- direct invocation result;
- natural-language invocation result where supported;
- permission or approval behavior for file and shell actions;
- update result;
- uninstall result;
- reinstall result;
- sanitized logs or screenshots;
- final verdict and remaining limitations.

## Canonical skill IDs

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

## Common lifecycle

1. Start from a clean workspace and clean host profile where practical.
2. Use the host-native plugin command when the host supports one.
3. Otherwise use only the official host fallback named in the guide.
4. Restart or reload the host when required.
5. Confirm the plugin and exactly five canonical skills or instruction assets are discoverable.
6. Invoke the main Hypertaks entry point directly.
7. Ask a founder-shaped natural-language task and confirm Hypertaks routing is selected.
8. Confirm mutating actions still respect the host permission boundary.
9. Update to a newer reviewed Hypertaks commit and repeat discovery.
10. Uninstall only Hypertaks-owned assets and confirm unrelated host configuration remains.
11. Reinstall and repeat discovery.

## GitHub Copilot

Install:

```bash
copilot plugin install aabrur/hypertaks-agent
```

Interactive equivalent:

```text
/plugin install aabrur/hypertaks-agent
```

Verify:

```text
/plugin list
/skills list
```

Update and uninstall:

```text
/plugin update hypertaks
/plugin uninstall hypertaks
```

Capture both plugin discovery and all five skill IDs.

## Windsurf

Windsurf has no verified custom `/plugin install` command for this package.

- Open Cascade -> Customizations -> Skills.
- Import the five folders with `+ Workspace` or `+ Global`.
- Reload Cascade.
- Confirm explicit `@hypertaks` and automatic matching.
- Do not label this a plugin certification.

## Cline

Cline plugin certification applies to CLI, SDK, and Kanban only.

Install:

```bash
cline plugin install --git https://github.com/aabrur/hypertaks-agent.git
```

Verify the plugin through `cline config`, then run:

```text
/hypertaks inspect this repository and state what remains unfinished
```

Update with the current `--force --git` lifecycle and remove only the Hypertaks plugin configuration during uninstall.

Cline VS Code and JetBrains must be tested separately through Skills. Do not reuse CLI plugin evidence for those surfaces.

## Roo Code

Roo has no verified custom `/plugin install` command for this package.

- Import the five skills under `.roo/skills/` or `.agents/skills/`.
- Confirm all five skills are indexed in the selected Roo mode.
- Test direct and automatic invocation.
- Do not label this a plugin certification.

## Kilo Code

Register the local plugin module in `kilo.json` or `.kilo/opencode.jsonc`:

```text
file:///absolute/path/to/hypertaks-agent/plugins/kilo/hypertaks.ts
```

Verify with `kilo config check` and debug logs, then confirm the plugin injects Hypertaks context in a new session.

Do not test or document `kilo plugin hypertaks` until a corresponding npm package is actually published and pinned.

## Aider

Aider has no native plugin lifecycle for this package.

- Load all five `SKILL.md` files read-only through `--read`, `/read`, or `.aider.conf.yml`.
- Confirm the files remain read-only and are not added to the editable chat set.
- Remove only the Hypertaks read references during uninstall.
- Verdict wording must say `PROJECT_INSTRUCTIONS`, not plugin certification.

## Goose

Goose has no verified generic `/plugin install` lifecycle for this package.

- Install through the current Skills Marketplace or a reviewed recipe.
- Record the exact Goose version and mechanism.
- Confirm visibility in a new Goose session.
- Update and remove through the same mechanism.
- Do not treat MCP extension installation as equivalent to the Hypertaks instruction package.

## OpenHands

Install:

```text
/plugin install github:aabrur/hypertaks-agent
```

Verify:

```text
/plugin list
```

Test enable, disable, update or reinstall, and uninstall:

```text
/plugin enable hypertaks
/plugin disable hypertaks
/plugin uninstall hypertaks
```

Confirm OpenHands discovers `.plugin/plugin.json` and exactly five root skills.

## Verdict rules

- `PASS`: complete real-host lifecycle evidence exists for the named version and surface.
- `PARTIAL`: package or some lifecycle stages work, but one or more real-host stages are missing.
- `BLOCKED`: account, policy, platform, or environment prevents the test.
- `FAIL`: the tested adapter does not work as documented.

Never infer `PASS` from CI alone.
