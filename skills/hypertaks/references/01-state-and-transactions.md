# State Capsule, Action Transactions, Loop Guards

## 1. State capsule (machine-readable, reprinted at every phase boundary)

```yaml
hypertaks_state:
  contract_id: HT-20260712-CHR      # <date>-<3-letter slug>
  hypertaks_depth: 0                 # 0 = Founder. >=1 = EXECUTOR MODE (see §4)
  phase: 3                           # 0..5
  tier: Prime
  gate: Deep
  agents_planned: 5
  agents_produced: 0
  permissions: [PERM_READ_LOCAL, PERM_NET_READ]
  gate_rounds_used: 1                # max 2
  retries: {agent_3: 0}              # max 2 per agent
  injection_attempts: 0
  business_impact: none              # concise; material tasks only
  strategic_fit: none
  founder_concern: none
  safer_path: none
  actions: []                        # see §2
  status: ACTIVE                     # DRAFT|AWAITING_APPROVAL|ACTIVE|BLOCKED|ABORTED|CLOSED
```

Founder Operating Lens fields are concise state, not a license to expand every
task. For Nano and harmless Lite work they may remain `none`; for material work
they preserve the tradeoff, concern, and safer path across phase boundaries.

**Rehydration rule.** On Hyper/Omega, the budget exceeds many context windows;
the harness will compact. Reprint the full capsule before each new workstream.
If you cannot find the capsule in your context, **do not continue from memory**:
say *"Contract capsule lost from context. Paste HT-xxxx before I proceed."*

## 2. Action transaction protocol (closes idempotency gap + rollback illusion)

Every action with an **external side effect** - send, publish, deploy, spend,
delete, write outside the workspace, on-chain write - is a transaction, not a
step.

```yaml
action:
  action_id: HT-20260712-CHR-A01
  class: SEND_MESSAGE | PUBLISH | DEPLOY | SPEND | ONCHAIN_WRITE | DELETE | FILE_WRITE
  target: "<exact recipient / address / path>"
  payload_summary: "<one line>"
  idempotency_key: "<contract_id>:<class>:<hash of payload>"
  reversible: false
  status: PREPARED | PREVIEWED | APPROVED | COMMITTED | RECONCILED | FAILED
```

Flow - **never skip a state**:

`PREPARE → PREVIEW to Boss → T1 APPROVAL → COMMIT ONCE → RECONCILE (read-after-write)`

Hard rules:
- **Contract approval is NOT per-action approval.** An approved contract in Phase 0 never grants permission to skip the PREVIEW and T1 APPROVAL steps for an action. Every spend, publish, delete, or on-chain write demands its own fresh T1 approval right before COMMIT.
- **A timeout is not evidence of failure.** Before retrying, perform a
  read-after-write against `idempotency_key`. Retrying without reconciling is
  how one email becomes two and one payment becomes two.
- **Irreversible actions cannot be rolled back.** The rollback protocol applies
  to *reasoning*, not to *effects*. If an irreversible action has been
  committed and a violation is later found, the response is **containment +
  disclosure**, not rollback: state what was committed, what cannot be undone,
  and what compensating action exists (if any).
- Every committed action is appended to the deliverable's **Action Ledger**.

## 3. Loop guards (closes infinite gate / retry / re-contract)

| Guard | Limit | On breach |
|---|---|---|
| `gate_rounds_used` | 2 | Stop asking. Adopt the **most conservative reading** (smallest scope, zero permissions), state assumptions, proceed. |
| `retries[agent_n]` | 2 | Report the failure to the Boss with the last error. Never silently drop the agent. |
| `re_contract_count` | 3 per session | Stop. Tell the Boss the scope is unstable and propose splitting into separate contracts. |
| `framework_expansion` | frameworks named in contract only | A framework not in the contract requires a contract amendment. |
| `hypertaks_depth` | 1 | See §4. |

## 4. Recursion guard (EXECUTOR MODE)

If `hypertaks_depth >= 1` - i.e. this brief came from another Hypertaks agent -
run **EXECUTOR MODE**:

- Do the brief. Return the artifact.
- **Do not** run an intake gate. **Do not** assess a tier. **Do not** spawn
  agents. **Do not** produce a compliance footer or a work log.
- The Founder at depth 0 owns all ceremony.

A subagent that runs the full protocol is a fork bomb with paperwork.

## 5. Abort path

Rollback assumes the task is completable. When it is not:

> **ABORT [contract_id]:** `<task>` cannot be completed at any tier because
> `<missing capability | contradictory constraints | data does not exist |
> outside ethical or legal bounds>`. What I *can* deliver instead: `<alternative>`.

Aborting an impossible task is compliance. Dressing an impossible task as a
deliverable is the failure.

## 6. Constraint feasibility check (Phase 0, before the contract is presented)

Cross-check the stated constraints for mutual contradiction (e.g. *"deploy to
mainnet today"* + *"budget $0"* + *"zero gas"*). If two constraints cannot both
hold, do **not** sign the contract. Present the contradiction, ask the Boss to
relax or rank them, and re-gate. Burning 9 agents on an impossible contract is
the most expensive failure mode in this skill.

## 7. Violation response & rollback (canonical - every other file points here)

**The six violations.** This list lives here and nowhere else; SKILL.md and
`intake-protocol.md` point at it rather than restate it, because a rule written
in three places is a rule that will disagree with itself in two.

1. Running a different tier than the approved one without re-announcing.
2. Skipping a phase without announcing it.
3. Naming a framework whose promised output shape is never produced.
4. Scope drifting past the contract's boundaries without a new approval.
5. Significantly exceeding the token budget without stopping at a checkpoint.
6. Exercising an access permission the contract did not grant.

On any of them - caught by self-check, by the Integrator, or by the Boss - the
response is fixed, in order:

1. **Stop** immediately. Never patch forward from the current position.
2. **Roll back the reasoning** to the last clean phase boundary:
   Lite -> restart lean · Standard -> Phase 2 (re-pick roles) ·
   Prime -> Phase 3 (re-equip) · Hyper -> Phase 1 (re-frame).
3. **Name the violation** to the Boss: which rule, where, what it cost.
4. **Re-present the contract**, adjusted to reality.
5. **Wait for a new T1 approval** before resuming.

**Rollback moves reasoning, never effects.** Step 2 rewinds what you were
*thinking*, not what you *did*. An email that was sent is sent; a mainnet deploy
is deployed; money moved is moved. When a violation is found *after* an
irreversible action was committed, the response is **containment + disclosure**
per §2 - state what was committed, what cannot be undone, and what compensating
action exists - and the word "rollback" is not used for it. A protocol that
claims to roll back an irreversible effect is lying to the Boss about the state
of the world.
