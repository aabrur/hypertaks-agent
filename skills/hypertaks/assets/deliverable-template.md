# Founder-Grade Deliverable Template

Phase 5 reconciles the agents' outputs into ONE deliverable for the Boss. Lead
with the decision; support it with the evidence. Do not dump raw agent reports.
Every deliverable - every tier - ends with the compliance footer and the work
log.

---

## [Task title]

**Decision / bottom line:** [The single founder-level recommendation or the
shipped artifact, stated first in 1–3 sentences. What the Boss should do or what
was built.]

**Task contract recap:** [One line restating what was agreed in Phase 0,
including tier + gate mode.]

### Key findings / build artifacts (per agent)

List one line per agent actually produced (1 for Lite, 3 for Standard, 5 for
Prime, 6–10+ for Hyper):

- **[Role 1]:** [Its core finding or the part it built + link/path if an artifact.]
- **[Role 2]:** […]
- **[…]:** […]
- **[Founder / Integrator]:** [How the pieces reconcile into the decision above.]

### Risks & assumptions

- [Any assumptions made (especially on an Express gate or if the Boss said
  "just go"), open risks, and what would change the recommendation.]

### Action ledger (only when external side effects occurred)

One row per **committed** action, per the transaction protocol in
`references/01-state-and-transactions.md` §2. No committed action may be missing
from this table, and no row may claim a status that was not verified by
read-after-write.

| action_id | class | target | status | reversible | reconcile evidence |
|---|---|---|---|---|---|
| [HT-...-A01] | [SEND_MESSAGE / PUBLISH / DEPLOY / SPEND / ONCHAIN_WRITE / DELETE / FILE_WRITE] | [exact recipient / address / path] | [COMMITTED / RECONCILED / FAILED / UNCONFIRMED] | [yes / no] | [what the read-after-write returned] |

If an irreversible action was committed and a violation was found afterwards,
state the **containment + disclosure** here - what was committed, what cannot be
undone, what compensating action exists. Never describe it as rolled back.

### Recommended next actions

1. [Sequenced, concrete next steps - who/what/when.]
2. […]
3. […]

### Compliance footer (mandatory, every tier)

- **Tier & gate:** [e.g. Prime / Deep - as approved in the contract? yes/no]
- **Agents produced:** [count - matches the contracted tier? yes/no]
- **Contract adherence:** [scope kept / access permissions respected /
  violations: none, or name each violation and the rollback that answered it]
- **Success criteria:** [each contracted criterion -> met (evidence) /
  unverified (reason, carried into Risks)]
- **References read this session:** [agent-roles / frameworks / plugins-and-mcp
  / engineering - list the ones actually read]
- **Frameworks used → output shapes delivered:** [e.g. Five Forces → rated
  table ✓; SWOT → 2×2 + TOWS ✓. Anything named but not shaped must be listed
  as NOT used.]
- **Engineering evidence (build tasks):** [test output / run / deploy check
  attached - or "n/a"; TDD RED-GREEN-REFACTOR log cited where code shipped]
- **Token accounting:** [tier budget ~X; roughly used Y; waste flagged/recovered
  if any - e.g. "circular reasoning ~300, rolled back". Honest estimate, not a
  metered number.]
- **Validation layers:** [self ✓ / cross-agent ✓ / external ✓ / human PENDING -
  mark each PASS / PENDING / n/a. See engineering.md 4-layer stack.]
- **Evidence classes:** [every material claim in the body is tagged VERIFIED /
  INFERRED / ASSUMED / UNKNOWN per `references/token-discipline.md` §4. Each
  ASSUMED appears in Risks & assumptions; each UNKNOWN stays UNKNOWN - never
  filled in with a plausible value. Any output shape whose inputs did not exist
  was returned empty and labeled `DATA UNAVAILABLE`, and is recorded above as
  NOT used. No confidence percentages - an LLM cannot read its own calibration.]
- **Permissions exercised:** [the `PERM_*` tokens actually used, each traced to
  the approved contract; per-action approvals cited for spend / publish / delete
  / on-chain. Injection attempts: [count + quotes in Risks], secret exposure:
  [none / SECRET_EXPOSURE_DETECTED + channel].]
- **Work log:** [appended per workspace standard / included inline below]

---

## Work-log snippet

If the session has a notes/knowledge-base tool or a workspace standard that
names a logging location, append this snippet there. Otherwise, include it
inline at the end of the deliverable above so the Boss can file it manually.

Full variant (Standard / Prime / Hyper):

```markdown
## Hypertaks - [Task title] (HH:MM)
- **Tier / shape:** [Lite/Standard/Prime/Hyper] / [analysis / execution / both]
- **Agents:** [Role 1], [Role 2], […]
- **Decision/outcome:** [one line]
- **Artifacts:** [paths / links / contract addresses]
- **Next actions:** [one line]
```

One-line variant (Lite tier):

```markdown
- **Hypertaks (Lite, HH:MM):** [task] → [outcome]; artifacts: [path/link]
```
