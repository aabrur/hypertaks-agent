# Frameworks - Applied How-To

Each entry gives **when to use**, **inputs needed**, **steps**, and **output
shape**. Apply frameworks; do not merely define them. Assign each to the agent(s)
whose role owns it (see `agent-roles.md`).

## Output-shape law (read first)

**Naming a framework obliges producing its output shape as written below.**
"Blue Ocean thinking" without an ERRC grid, "SWOT" without the 2×2 + TOWS list,
or "Five Forces" without the rated table is label-dropping - it counts as not
having used the framework, and the deliverable's compliance footer must not
claim it. If the full shape is genuinely disproportionate to the task, either
pick a lighter framework or say explicitly that the framework is being applied
partially and why. The narrative may summarize the shape; it never replaces it.

This file holds the **core** frameworks with full applied how-tos. The
**extended catalog** - 1,600+ theories, methods, frameworks, and workflows
across business, learning, science, and technology - lives in
`references/knowledge-base.md`. Grep it by keyword or domain (it is far too
large to load whole). Items pulled from the catalog obey the same output-shape
law: define the shape their application must return in the agent brief.

---

## Porter's Five Forces

- **When:** assessing industry attractiveness and structural profit pressure.
- **Inputs:** competitor set, supplier/buyer concentration, substitutes, entry
  barriers.
- **Steps:** rate each force (Low/Med/High) - (1) competitive rivalry,
  (2) supplier power, (3) buyer power, (4) threat of substitutes, (5) threat of
  new entrants. Justify each rating with evidence.
- **Output:** a 5-force table + one-line verdict on where structural profit
  leaks and how to defend against it.

## SWOT (+ TOWS actioning)

- **When:** consolidating internal vs. external position into moves.
- **Inputs:** internal capabilities/weaknesses, external trends/threats.
- **Steps:** fill Strengths, Weaknesses, Opportunities, Threats. Then run **TOWS**
  to convert into strategies: SO (leverage), WO (improve), ST (defend), WT
  (avoid).
- **Output:** a 2×2 SWOT + a prioritized TOWS action list.

## Pareto (80/20)

- **When:** finding the vital few causes/inputs driving most of the effect.
- **Inputs:** a frequency or value distribution (defects, revenue, churn reasons).
- **Steps:** rank items by contribution, compute cumulative %, identify the ~20%
  accounting for ~80%.
- **Output:** a ranked bar/cumulative view + the short list to act on first.

## Fishbone / Ishikawa (6M)

- **When:** structured root-cause analysis of a defect or failure.
- **Inputs:** a clearly stated problem/effect.
- **Steps:** branch causes across the 6M - Man, Machine, Method, Material,
  Measurement, Environment (Milieu). Drill each with "why".
- **Output:** a cause tree + the most probable root cause(s) to test.

## Blue Ocean (ERRC + strategy canvas)

- **When:** escaping red-ocean competition by redefining value.
- **Inputs:** industry factors buyers compete on.
- **Steps:** build the **ERRC grid** - Eliminate, Reduce, Raise, Create. Plot a
  **strategy canvas** vs. incumbents to visualize the new value curve.
- **Output:** an ERRC grid + a differentiated value proposition and canvas.

## Red Apples & Bad Barrels

- **When:** diagnosing ethics, integrity, fraud, or persistent misconduct - deciding
  whether the problem is people or the system.
- **Inputs:** incident patterns, incentive structures, controls, culture signals.
- **Steps:** separate **bad apples** (individual actors) from **bad barrels**
  (systemic conditions: incentives, pressure, weak controls, tone at the top) and
  the **bad-barrel-makers** (leaders/policies shaping the barrel). Test whether
  removing individuals would actually fix the pattern.
- **Output:** a verdict - apple vs. barrel vs. barrel-maker - with targeted
  remedies (discipline vs. redesign incentives/controls vs. leadership change).

## Bottleneck / Theory of Constraints (5 focusing steps)

- **When:** throughput, lead time, or capacity is limited by one constraint.
- **Inputs:** the process flow and its stage capacities/rates.
- **Steps:** (1) **Identify** the constraint, (2) **Exploit** it (max its output
  with no capex), (3) **Subordinate** everything else to it, (4) **Elevate** it
  (add capacity), (5) **Repeat** - the constraint moves; do not let inertia
  become the new one.
- **Output:** the current constraint + the sequenced plan to raise system
  throughput.

## Supply Chain (SCOR-style)

- **When:** modeling or optimizing end-to-end material/information flow.
- **Inputs:** the Plan-Source-Make-Deliver-Return stages and their metrics.
- **Steps:** map each SCOR stage; measure reliability, responsiveness, cost, asset
  efficiency; locate the weakest link (tie to Theory of Constraints).
- **Output:** a stage map + prioritized improvements with metric targets.

## Supply Chain Finance

- **When:** optimizing working capital across the trading network.
- **Inputs:** payment terms, DPO/DSO, supplier cash-flow health, cost of capital.
- **Steps:** evaluate instruments - **factoring** (seller sells receivables),
  **reverse factoring** (buyer-led supplier financing), **dynamic discounting**
  (early payment for a discount), and inventory finance. Weigh cost vs. liquidity
  vs. supplier resilience.
- **Output:** a recommended SCF program + expected working-capital and cost impact.

## ERP (module / process view)

- **When:** designing or auditing integrated business processes and data.
- **Inputs:** the processes in scope (finance, procurement, inventory, sales, HR).
- **Steps:** map processes to ERP modules, define the master-data model, identify
  integrations and single-source-of-truth ownership; flag manual gaps.
- **Output:** a process/module map + integration and data-ownership plan.

## Smart Contracts (design & risk)

- **When:** any on-chain logic is part of the deliverable.
- **Inputs:** the trust model, actors, funds flow, and network.
- **Steps:** specify state, roles/access, invariants, and failure modes; choose
  standards; plan tests and an audit pass. Deep implementation guidance lives in
  `engineering.md` (Web3 section).
- **Output:** a contract spec + risk/audit checklist feeding the engineering
  build.

## IoT (edge → cloud architecture)

- **When:** sensors/devices feed data or trigger actions.
- **Inputs:** device types, connectivity, data volume, latency/security needs.
- **Steps:** design the layers - device/edge, gateway, ingestion, storage,
  analytics, action; decide edge-vs-cloud compute split; address security and OTA
  updates.
- **Output:** a layered architecture diagram + data-flow and security plan.
