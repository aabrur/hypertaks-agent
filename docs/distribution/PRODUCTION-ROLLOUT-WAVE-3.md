# Production Rollout Wave 3

Wave 3 covers the managed coding-agent ecosystem:

- GitHub Copilot
- Windsurf
- Cline
- Roo Code
- Kilo Code
- Aider
- Goose
- OpenHands

## Scope completed in this wave

- machine-readable host catalog in `distribution/managed-agents.json`;
- evidence-aware validator in `scripts/validate_managed_agents.py`;
- validator unit tests;
- one shared live certification checklist;
- corrected host-native skill paths and invocation guidance;
- corrected Aider classification as project instructions rather than a native plugin;
- corrected OpenHands guidance away from deprecated microagent wording;
- GitHub Copilot plugin manifest aligned with the current plugin-directory shape;
- registry, package scripts, and CI integration.

## Product boundary

Hypertaks remains one plugin product with exactly five canonical public skills. Wave 3 does not create a sixth public skill and does not bundle MCP merely because a host supports MCP.

## Evidence boundary

Structural readiness, official documentation, and repository tests do not prove behavior inside a real host application. Every Wave 3 host remains `PARTIAL` until the checklist in `evals/managed-agents/LIVE-CERTIFICATION.md` is completed against a named version with sanitized evidence.

## Installation model

The preferred path is host-native Agent Skills when the host supports them. Aider is the exception: it must load Hypertaks as read-only project instructions through `--read`, `/read`, or an explicit configuration entry. Goose may use its current skill or recipe mechanism, and the exact mechanism must be captured during certification.

## Release gate

Wave 3 repository work is ready to merge when:

1. `python scripts/validate_managed_agents.py` passes;
2. `python -m unittest scripts.test_validate_managed_agents -v` passes;
3. the existing distribution and skill workflows remain green;
4. no host is upgraded to `PASS` without real-host lifecycle evidence.
