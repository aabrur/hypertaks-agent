# Wave 3 Live Host Certification

This checklist covers GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider, Goose, and OpenHands.

A static package, copied directory, manifest, validator, or isolated installer lifecycle is not behavioral certification. `PASS` requires evidence from the named real host version.

## Evidence record

Record all of the following before changing a host from `PARTIAL`:

- host name and exact application or CLI version;
- operating system and architecture;
- Hypertaks commit SHA;
- installation scope and destination;
- exact installation command or UI steps;
- discovery output showing the expected Hypertaks assets;
- direct invocation result;
- natural-language invocation result where supported;
- permission or approval behavior for file and shell actions;
- update result;
- uninstall result;
- reinstall result;
- sanitized logs or screenshots;
- final verdict and remaining limitations.

## Common lifecycle

1. Start from a clean workspace and a clean host profile where practical.
2. Install Hypertaks using the host-specific guide.
3. Restart or reload the host when its documentation requires it.
4. Confirm the expected five canonical skills or the documented instruction package is discoverable.
5. Invoke the main Hypertaks entry point directly.
6. Ask a natural-language founder-shaped task and confirm Hypertaks routing is selected.
7. Confirm that mutating actions still respect the host permission boundary.
8. Update from a newer reviewed Hypertaks commit and verify checksums or host listing again.
9. Uninstall only Hypertaks-owned files and confirm unrelated host configuration remains.
10. Reinstall and repeat discovery.

## Canonical skill IDs

```text
hypertaks
hypertaks-verify
hypertaks-brain
hypertaks-graph
hypertaks-continuity
```

## GitHub Copilot

- Install the local plugin with `copilot plugin install ./.github-copilot`, or install the five skills in a supported Agent Skills directory.
- Run `copilot plugin list` and `/skills list`.
- Confirm the plugin or all five skills appear.
- Test direct and natural-language invocation in Copilot CLI or another named Copilot surface.
- Remove the plugin with the current Copilot plugin removal command, or remove only the five owned skill directories.

## Windsurf

- Install the five skills under `.windsurf/skills/` or the documented global path.
- Reload Cascade.
- Confirm automatic matching and explicit `@hypertaks` invocation.
- Verify unrelated Windsurf rules, workflows, memories, and skills remain untouched.

## Cline

- Enable **Settings -> Features -> Enable Skills**.
- Install the five skills under `.cline/skills/` or `~/.cline/skills/`.
- Start a new session and confirm Cline exposes the skills.
- Verify direct matching and `use_skill` behavior.

## Roo Code

- Install under `.roo/skills/` or `~/.roo/skills/`.
- Confirm all five skills are indexed in the selected mode.
- Test invocation and verify project skills override global copies only when intended.

## Kilo Code

- Install under `.kilo/skills/` or `~/.kilo/skills/`.
- Start a new session or run `/reload`.
- Confirm all five skill IDs and test explicit invocation.

## Aider

Aider does not provide a native Agent Skills plugin loader.

- Load the Hypertaks files read-only using `--read`, `/read`, or an reviewed `.aider.conf.yml` entry.
- Confirm Aider applies the instructions without adding the Hypertaks files to the editable chat set.
- Remove the explicit read references during uninstall.
- Verdict wording must say `PROJECT_INSTRUCTIONS`, not native plugin certification.

## Goose

- Install through the current Goose Skills Marketplace, compatible skill path, or a reviewed recipe.
- Record the exact mechanism and Goose version used.
- Confirm the selected assets are visible in a new Goose session.
- Verify update and removal through the same mechanism.

## OpenHands

- Prefer repository skills under `.agents/skills/`.
- Start a new OpenHands conversation for the target repository.
- Confirm the repository skills are loaded with the documented precedence.
- Do not describe `.openhands/microagents/` as the current preferred path; it is deprecated.

## Verdict rules

- `PASS`: complete real-host lifecycle evidence exists for the named version.
- `PARTIAL`: package or some lifecycle stages work, but one or more real-host stages are missing.
- `BLOCKED`: account, policy, platform, or environment prevents the test.
- `FAIL`: the tested adapter does not work as documented.

Never infer `PASS` from CI alone.
