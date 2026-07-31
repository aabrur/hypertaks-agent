# Production Rollout Wave 3

Wave 3 covers GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider, Goose, and OpenHands.

## Result

All eight targets are `PASS` for official native plugin compatibility.

| Host | Native route | Status |
|---|---|---|
| GitHub Copilot | `copilot plugin` or `/plugin` | PASS |
| Windsurf | Hypertaks plugin bundle through Cascade Skills UI | PASS |
| Cline | `cline plugin install --git` | PASS |
| Roo Code | Archived plugin bundle through Roo Agent Skills | PASS |
| Kilo Code | Local TypeScript plugin in Kilo configuration | PASS |
| Aider | Plugin instruction bundle through read-only conventions | PASS |
| Goose | Plugin bundle through Skills Marketplace or Recipe | PASS |
| OpenHands | `/plugin install` | PASS |

Compatibility is verified from each host's official website, documentation, or repository and matched to a tracked Hypertaks adapter.

## Product boundary

Hypertaks remains one product with exactly five canonical public skills. Wave 3 creates no sixth public skill.

## Release gate

Wave 3 is complete. The unified plugin compatibility validator, managed-agent validator, marketplace validator, and repository workflows pass.
