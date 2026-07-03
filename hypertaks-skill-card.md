# Hypertaks Skill Card

**Version:** unreleased-local

---

## Description

Hypertaks is the founder-operator layer that executes founder-shaped work
end-to-end across business strategy, engineering, full-stack-developer, marketing, finance, ERP,
supply-chain, supply-chain finance, and IoT. It enforces a mandatory 5-phase
loop-Intake & Verify, Frame, Pick Roles, Equip, Produce, Integrate & Deliver-
with a sized intake gate, tiered agent allocation (Lite / Standard / Prime /
Hyper), and an engineering quality gate for build tasks. Every workflow closes
with a compliance footer and a work-log entry.

---

## Owner

Hypertaks Founder by Rempeyek/@aabrur

---

## License/Terms

Use and redistribution are governed by the canonical Hypertaks project license. No third-party sublicensing is implied without an explicit grant from the owner.

---

## Use Case

- Analysis/diagnosis (churn, bottlenecking, competitor/SWOT/fishbone/Pareto).
- Strategy (GTM, pricing, positioning, business model).
- Execution/build (landing pages, features, smart contracts, ERP flows, supply
  chain finance, IoT integration).
- Growth/ops (marketing, financial modeling, throughput optimization).

Typical usage: any request framed as founder-shaped work or any explicit
mention of "Hypertaks."

---

## Deployment Geography

Portable across AI surfaces: Claude Code, claude.ai chat, and assistants
without tool-calling. On surfaces with an agent/task-spawning tool, rely on
orchestrated mode; otherwise, synthesized mode-never fabricated tool output.

---

## Requirements/Dependencies

- Verified plugins/skills and MCP connectors registry presence (if the
  environment exposes one).
- Reference files: `intake-protocol.md`, `agent-roles.md`,
  `plugins-and-mcp.md`, `frameworks.md`, `engineering.md`.
- Assets: `agent-brief-template.md`, `deliverable-template.md`.
- Filesystem or Obsidian MCP access to the workspace vault for work-log
  appending; inline log fallback when absent.

---

## Risks/Mitigations

- **Skipping the intake gate or silent tier downgrade** - Run the sized gate,
  announce tier + gate mode + task contract, and obtain explicit go-ahead.
- **Agent padding or duplicate roles** - Use the tier table; Hyper scales by
  splitting distinct workstreams, not by adding overlapping roles.
- **Framework name-dropping without output shape** - Apply the output-shape law:
  every named framework must yield its defined artifact.
- **Fabricated tool output in synthesized mode** - State synthesized mode
  plainly; never pretend to spawn what the environment does not provide.
- **Missing or late work log** - Work log is mandatory in every tier; close the
  deliverable with it.

---

## References

- `references/intake-protocol.md`
- `references/agent-roles.md`
- `references/plugins-and-mcp.md`
- `references/frameworks.md`
- `references/knowledge-base.md`
- `references/engineering.md`
- `assets/agent-brief-template.md`
- `assets/deliverable-template.md`

---

## Skill Output

- Phase-gated deliverable: screened brief → organized role outputs →
  integrated founder-grade result.
- Frameworked artifacts when applicable (5-forces table, 2×2 SWOT, ERRC grid,
  6M fishbone, ranked Pareto list, 5 focusing steps, etc.).
- Compliance footer per `assets/deliverable-template.md`.
- Work-log snippet at the end of the deliverable or appended to the vault
  Daily note.

---

## Skill Version

`unreleased-local`

---

## Ethical Considerations

- Apply the Red Apples & Bad Barrels lens for people/system ethics diagnosis.
- Do not deviate silently from the task contract, tier, or gate mode.
- Avoid duplicate-role packaging that conceals true workload or coverage.
- Web3/smart-contract deliverables pass the engineering audit checklist before
  marking "done."

---

## Compliance

- Tiers: Lite / Standard / Prime / Hyper with locked, announced counts. Tier
  is locked once announced; scope growth requires re-gating and explicit
  go-ahead.
- Intake gate: Express for Lite/Standard, Deep for Prime/Hyper. The gate is
  sized, never skipped.
- Agent quality: no duplicate roles; Founder/Integrator mandatory at 3+
  agents; Hyper splits workstreams, never pads agents.
- Engineering quality gate (build tasks): test-first where a TDD skill is
  present, systematic debugging, verification-before-completion, Web3 audit
  checklist for on-chain deliverables.
- Continuation vs. new task: continuations are stated explicitly and run at the
  smallest valid tier; new tasks run the full loop again.
- Work log: mandatory in every tier; append to vault Daily note or include
  inline.
- No silent deviation: assumptions, tier changes, and shortcuts are announced
  to the Boss in the task contract.

---

## Work Log

`2026-07-03 | Hypertaks: produced unreleased-local reviewer-ready skill card from integrated front/back blocks with compliance footer and work-log snippet.`
