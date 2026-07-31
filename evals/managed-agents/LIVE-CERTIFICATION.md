# Wave 3 Official Native Compatibility

This record covers GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider, Goose, and OpenHands.

Compatibility is accepted when the active official host website, documentation, or repository supports the declared plugin or plugin-compatible route and the corresponding Hypertaks adapter is tracked in this repository.

| Host | Native route | Verdict |
|---|---|---|
| GitHub Copilot | `copilot plugin` or `/plugin` | PASS |
| Windsurf | Plugin bundle imported through Cascade Skills | PASS |
| Cline | `cline plugin install --git` | PASS |
| Roo Code | Archived plugin bundle through Agent Skills | PASS |
| Kilo Code | Local TypeScript plugin configuration | PASS |
| Aider | Plugin instruction bundle through read-only conventions | PASS |
| Goose | Plugin bundle through Skills Marketplace or Recipe | PASS |
| OpenHands | `/plugin install` | PASS |

The canonical machine-readable record is `distribution/managed-agents.json`. The unified 22-host record is `distribution/plugin-compatibility.json`.

This compatibility verdict does not claim that a third-party marketplace listing has already been published. Marketplace package readiness is tracked separately in `distribution/marketplace-readiness.json`.
