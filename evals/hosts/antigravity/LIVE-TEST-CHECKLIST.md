# Google Antigravity Live Host Certification Checklist

Package build and isolated installer lifecycle evidence do not prove that the
real Antigravity application discovers or invokes Hypertaks. Run this checklist
inside the installed host.

## Evidence header

Record:

- Antigravity surface and version
- Operating system
- Hypertaks commit
- Installation scope: workspace or global
- Project path
- Model used
- Reviewer and timestamp

## Install and discovery

- [ ] Build with `python scripts/build_distributions.py antigravity`.
- [ ] Install the generated plugin at `.agents/plugins/hypertaks/` for workspace
      scope or `~/.gemini/config/plugins/hypertaks/` for global scope.
- [ ] Restart or refresh Antigravity customizations.
- [ ] Confirm the plugin is enabled.
- [ ] Confirm exactly five public skills are discovered.
- [ ] Confirm no `mcp_config.json` and no `hooks.json` are bundled.

## Invocation

Run and capture results:

- [ ] `Hypertaks, fix a typo in this README.`
- [ ] `/hypertaks-verify`
- [ ] `/hypertaks-brain inspect`
- [ ] `/hypertaks-graph impact runtime/router.ts`
- [ ] `/hypertaks-continuity status`

Verify the correct skill routing, tier behavior, native or synthesized subagent
behavior, tool mapping, approval boundary, and truthful completion evidence.

## Lifecycle

- [ ] Update from a clean canonical checkout.
- [ ] Confirm dirty, detached, diverged, and wrong-remote states fail closed.
- [ ] Uninstall and confirm unrelated files remain unchanged.
- [ ] Reinstall and confirm all five skills return.

## Verdict

Use `PASS` only when real host discovery and invocation were observed. Use
`PARTIAL` or `BLOCKED` otherwise, and attach sanitized evidence to
`evals/hosts/antigravity/REPORT.md`.
