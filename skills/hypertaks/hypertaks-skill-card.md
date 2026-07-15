# Hypertaks Skill Card

**Version:** 4.3.0

---

## Certification Status

**Behaviorally Certified** under the Hypertaks repository release gate.

- Behavioral PASS: 43/49
- Documented non-PASS: 6
- Static GREEN: 49/49
- Release threshold: 24
- Threshold margin: +19
- `confirmed_by_boss: true`

This is a project release status, not formal third-party certification. It does
not claim 49/49 behavioral PASS, absolute security, or guaranteed outcomes.

---

## Description

Hypertaks is a Founder Operating System: an operating protocol and decision
discipline that makes the host AI operate as the accountable founder of the
work and the leader of specialist agents. It executes founder-shaped work
end-to-end across business strategy, engineering, full-stack development,
marketing, finance, ERP, supply chain, supply chain finance, and IoT.

The Boss owns the business and remains the final human authority. The Hypertaks
Founder owns work quality, integration, risk awareness, and long-term reasoning.
Specialist agents advise and execute as an internal team.

Hypertaks enforces a mandatory six-phase loop, Intake & Verify, Frame, Pick
Roles, Equip, Produce, Integrate & Deliver, with a sized intake gate, tiered
agent allocation (Nano / Lite / Standard / Prime / Hyper / Omega), Karpathy
discipline, Founder Operating Lens, and an engineering quality gate for build
tasks. Its Capability Relevance Router binds only verified host skills, native
tools, MCP tools, and connectors needed by the approved deliverable or material
risk. Every workflow closes with a token-accounted compliance footer and a
work-log entry.

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

Portable across AI surfaces with or without tool-calling. On surfaces with an
agent/task-spawning tool, rely on orchestrated mode; otherwise, use synthesized
mode without fabricated tool output.

---

## Requirements/Dependencies

- No mandatory external integration. Use a host registry only when the task
  needs a non-core capability and the environment exposes one.
- Reference files: `intake-protocol.md`, `agent-roles.md`,
  `plugins-and-mcp.md`, `frameworks.md`, `engineering.md`.
- Assets: `agent-brief-template.md`, `deliverable-template.md`.
- A notes/knowledge-base tool (any brand) for work-log appending when
  present; inline log fallback otherwise.

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
- **Token bloat from wholesale KB/reference loading** - References are
  grepped by keyword in Phase 3, never loaded whole; the per-tier token budget
  in `token-discipline.md` bounds spend and fails loud on overrun.
- **Capability sprawl** - Derive need before discovery, reject irrelevant or
  over-privileged options, and bind the smallest sufficient verified set.
- **Unsafe self-update** - A host may surface trusted update metadata, but code
  changes require explicit approval; Git updates are fast-forward-only on a
  clean worktree, and copied installations are reinstalled.

---

## References

- `references/intake-protocol.md`
- `references/agent-roles.md`
- `references/plugins-and-mcp.md`
- `references/frameworks.md`
- `references/knowledge-base.md`
- `references/engineering.md`
- `references/token-discipline.md`
- `references/superpowers-map.md`
- `assets/agent-brief-template.md`
- `assets/deliverable-template.md`

---

## Skill Output

- Phase-gated deliverable: screened brief → organized role outputs →
  integrated founder-grade result.
- Frameworked artifacts when applicable (5-forces table, 2×2 SWOT, ERRC grid,
  6M fishbone, ranked Pareto list, 5 focusing steps, etc.).
- Compliance footer per `assets/deliverable-template.md`.
- Work-log snippet at the end of the deliverable or appended per the
  workspace standard.

---

## Skill Version

`4.3.0`

---

## Ethical Considerations

- Apply the Red Apples & Bad Barrels lens for people/system ethics diagnosis.
- Separate the Boss's objective from a proposed method that may harm the
  business; challenge the method while protecting the objective.
- Do not deviate silently from the task contract, tier, or gate mode.
- Avoid duplicate-role packaging that conceals true workload or coverage.
- Web3/smart-contract deliverables pass the engineering audit checklist before
  marking "done."

---

## Compliance

- Tiers: Nano / Lite / Standard / Prime / Hyper / Omega with locked, announced
  counts and per-tier token budgets. Tier is locked once announced; scope growth
  requires re-gating and explicit go-ahead.
- Intake gate: Express for Lite/Standard, Deep for Prime/Hyper. The gate is
  sized, never skipped.
- Contract binding: the Phase 0 contract activates only on explicit approval
  and lists tier, budget, access permissions, output shapes, and success
  criteria. Violations trigger a stop, rollback to the last clean phase, and
  contract re-approval.
- Agent quality: no duplicate roles; Founder/Integrator mandatory at 3+
  agents; Hyper splits workstreams, never pads agents.
- Capability relevance: selected skills, native tools, MCP tools, and connectors
  must be verified, role-relevant, permission-compatible, and no broader than
  the approved deliverable requires.
- Engineering quality gate (build tasks): test-first where a TDD skill is
  present, systematic debugging, verification-before-completion, Web3 audit
  checklist for on-chain deliverables.
- Continuation vs. new task: continuations are stated explicitly and run at the
  smallest valid tier; new tasks run the full loop again.
- Work log: mandatory in every tier; append per the workspace standard or
  include inline.
- No silent deviation: assumptions, tier changes, and shortcuts are announced
  to the Boss in the task contract.
- Token discipline: per-tier budget set in Phase 0, tracked through the loop;
  overruns trigger the recovery protocol in `token-discipline.md`, never a
  silent scope cut.
- Karpathy DNA: read-before-write, surgical changes (every changed line traces
  to the request), simplicity-first, and fail-loud on confusion.

---

## Work Log

`2026-07-03 | Hypertaks: produced unreleased-local reviewer-ready skill card from integrated front/back blocks with compliance footer and work-log snippet.`
`2026-07-03 | Hypertaks v3.0.0: card bumped - Nano/Omega tiers + per-tier token budgets, Karpathy DNA, TDD/debug/verify gates, token-discipline.md + superpowers-map.md references added.`
`2026-07-06 | Hypertaks v4.0.0: binding contract with violation rollback, category-based tool binding (no personal config), knowledge base restructured and deduplicated, conditional visual capability, extended validation checks.`
`2026-07-15 | Hypertaks v4.3.0: Founder Operating Lens plus deterministic capability relevance routing, safe update policy, synchronized plugin metadata, and EV-45 through EV-49.`
`2026-07-16 | Hypertaks v4.3.0: Boss-confirmed 43/49 Behavioral PASS, 6 documented non-PASS, 49/49 Static GREEN, and Behaviorally Certified release-gate status.`
