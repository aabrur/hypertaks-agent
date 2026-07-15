# Hypertaks v4.3.0 Relevance Router Implementation Plan

**Goal:** Release Hypertaks v4.3.0 with a deterministic Capability Relevance
Router that binds only verified, task-relevant skills, native tools, MCP tools,
and connectors while preserving security, evidence integrity, and tier-based
token discipline.

**Approved design:**
`docs/superpowers/specs/2026-07-15-hypertaks-v430-relevance-router-design.md`

## Task 1: Add failing structural eval cases

- Add EV-45 through EV-49 for relevant selection, irrelevant rejection,
  permission-gated mutation, honest fallback, and Nano proportionality.
- Run `python scripts/run_evals.py --check` and `python scripts/run_evals.py
  --static`; confirm the new static cases are RED before implementation.

## Task 2: Implement the canonical router

- Replace the broad enumerate-and-match procedure in
  `references/plugins-and-mcp.md` with the deterministic Need, Discover,
  Normalize, Filter, Bind, Verify, and Fallback stages.
- Wire the router into Phases 0 through 5 in `SKILL.md` and the CORE profile.
- Extend the agent brief with concise capability bindings, relevance,
  permissions, side effects, context cost, and fallback behavior.
- Keep contract additions conditional; do not make capability analysis
  mandatory for harmless Nano and Lite tasks.

## Task 3: Strengthen validation and version synchronization

- Validate the capability-binding field names across the router, agent brief,
  and contract schema.
- Validate every tracked version-bearing live plugin record, including package
  metadata and the Claude marketplace.
- Bump all live plugin and package versions to `4.3.0` without rewriting
  historical release evidence.

## Task 4: Update release documentation

- Update README, CHANGELOG, CHECKPOINT, release notes, skill card, install
  documentation, and eval documentation.
- Document trusted update discovery with explicit approval before code changes.
- Preserve the distinction between static GREEN and behavioral PASS.

## Task 5: Verify, review, organize, and release

- Run the full validation command set from the approved contract.
- Regenerate figures and confirm only expected binary artifacts changed.
- Run a focused code review and address findings.
- Review repository organization without deleting or moving user files unless
  a concrete cleanup need is found and separately approved.
- Stage one focused work item, commit with an English message, and push normally
  to `origin/main` without a tag or force-push.
- Record the completed work in the Boss's Obsidian shared-memory locations.
