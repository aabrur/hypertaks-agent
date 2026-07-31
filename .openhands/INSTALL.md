# Hypertaks for OpenHands

OpenHands supports repository and user Skills. The current preferred repository path is `.agents/skills/`.

## Repository installation

Copy the five canonical Hypertaks skill directories into:

```text
.agents/skills/
```

OpenHands also recognizes `.openhands/skills/` and `.openhands/microagents/`, but those paths are deprecated and should not be used for new installations.

## User installation

For supported self-hosted CLI, headless, and development modes, user skills may be placed under:

```text
~/.agents/skills/
```

Project-specific skills take precedence over user skills.

## Verify

Start a new OpenHands conversation for the target repository. Confirm the five Hypertaks skills are loaded through the documented skill precedence, then test direct and natural-language invocation.

## Update and uninstall

Refresh only the five Hypertaks-owned skill directories and start a new conversation. Remove only those files during uninstall. Preserve unrelated `.agents`, `.openhands`, setup scripts, hooks, and repository configuration.

## Certification

Run the OpenHands section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named OpenHands version proves discovery, invocation, update, uninstall, and reinstall.
