# Agent Brief Template

Fill one brief per role - as many as the tier announced in the task contract
(Lite 1, Standard 3, Prime 5, Hyper 6–10+) - in either production mode.

- **Orchestrated mode:** hand the completed brief as the `prompt` to the
  **Agent** tool. Keep it self-contained - the spawned agent starts cold and
  must not re-derive the task contract.
- **Synthesized mode:** use the completed brief as your own outline before
  answering in that role's voice inside the single response - same fields,
  no tool call.
- **Lite tier:** the Founder fills one brief for itself - it still fixes the
  frameworks, tools, and definition of done before answering.

---

**Agent [N of T] - [Role from the pool] - [Tier]**

**Objective / deliverable:** [The one concrete output this agent must return. Be
specific and testable. In Hyper tier, name the workstream slice so split roles
stay distinct.]

**Task-contract context:** [Paste the confirmed task contract from Phase 0 -
one line (Express) or one paragraph (Deep) - so the agent has full context:
objective, scope, constraints, success criteria, deliverable, deadline, task
shape, tier.]

**Frameworks to apply:** [List from `references/frameworks.md`, e.g. Porter's
Five Forces + Pareto. State how each applies to this agent's slice. The agent
must return each framework's defined **output shape** - see the output-shape
law in `references/frameworks.md`.]

**Tool bindings (skills / MCP):** [Per category from
`references/plugins-and-mcp.md`, only tools verified present this session,
recorded as category -> actual tool name (e.g. "spreadsheets -> the session's
xlsx skill", "web testing -> the session's browser tool"). If nothing
matches, say "core tools only".]

**Constraints:** [Budget, stack, brand, compliance, on-chain network, data
sensitivity - inherited from the contract, plus any specific to this role.]

**Depends on:** [none - spawn in the first wave | Agent N's output (name the
artifact) - spawn in the wave after that output exists. In synthesized mode
this sets the writing order instead.]

**Output format expected back:** [Exact shape you need for integration, e.g. a
ranked root-cause table; a working code file + test results; an ERRC grid.]

**Definition of done:** [The check that proves this agent finished, e.g. tests
pass; contract deploys to testnet; 3 ranked recommendations with evidence. For
engineering roles this includes the quality gate in
`references/engineering.md` - evidence attached, not asserted.]
