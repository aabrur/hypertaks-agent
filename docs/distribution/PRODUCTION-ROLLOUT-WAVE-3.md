# Production Rollout Wave 3

Wave 3 covers:

- GitHub Copilot
- Windsurf
- Cline
- Roo Code
- Kilo Code
- Aider
- Goose
- OpenHands

## Plugin-first result

Wave 3 now prefers a real host-native plugin lifecycle whenever the host provides one.

| Host | Wave 3 route |
|---|---|
| GitHub Copilot | Native repository plugin through `copilot plugin` or `/plugin` |
| Cline CLI, SDK, Kanban | Native `AgentPlugin` installed through `cline plugin install --git` |
| Kilo Code | Native local TypeScript plugin registered in Kilo configuration |
| OpenHands | Native Open Plugin package through `/plugin install` |
| Windsurf | Official Skills UI because no verified custom plugin command exists |
| Roo Code | Native Agent Skills because no verified custom plugin command exists |
| Aider | Read-only project instructions because Aider has no native plugin loader for this package |
| Goose | Skills Marketplace or reviewed recipe because no generic Hypertaks plugin command exists |

Hypertaks does not invent `/plugin` commands for unsupported hosts.

## Scope completed

- universal `.plugin/plugin.json` for compatible Open Plugin hosts;
- executable Cline plugin at `plugins/cline/hypertaks.ts`;
- executable Kilo plugin module at `plugins/kilo/hypertaks.ts`;
- package metadata for the Cline plugin entry point;
- machine-readable Wave 3 catalog in `distribution/managed-agents.json`;
- evidence-aware validator in `scripts/validate_managed_agents.py`;
- validator unit tests that reject Python-first installation and fake plugin commands;
- plugin-first host guides and README matrix;
- shared live certification checklist;
- registry, package scripts, and GitHub Actions integration.

## Product boundary

Hypertaks remains one product with exactly five canonical public skills. Wave 3 creates no sixth public skill and does not bundle optional MCP capabilities merely because a host supports MCP.

## Publication boundary

Kilo supports npm-backed plugin installation, but `kilo plugin hypertaks` is not advertised until a corresponding package is actually published and verified. Copilot, Cline, and OpenHands can consume repository-backed plugin packages through their documented native lifecycle.

## Evidence boundary

Structural readiness, source code, official documentation, and repository tests do not prove behavior inside a real host application. Every Wave 3 host remains `PARTIAL` until `evals/managed-agents/LIVE-CERTIFICATION.md` is completed against a named version and surface with sanitized evidence.

## Release gate

Wave 3 repository work is ready for review when:

1. `python scripts/validate_managed_agents.py` passes;
2. `python -m unittest scripts.test_validate_managed_agents -v` passes;
3. existing distribution and skill workflows remain green;
4. no Wave 3 install guide recommends `python scripts/installer.py`;
5. unsupported hosts declare no fake plugin command;
6. no host is upgraded to `PASS` without real-host lifecycle evidence.
