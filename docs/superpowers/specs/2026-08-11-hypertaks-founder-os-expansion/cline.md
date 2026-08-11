# Ticket #8: Resumable RESEARCH Vertical Slice

Contract: `HT-20260811-FOS`

Original role assignment: Cline. Actual executor: Codex, after the Boss explicitly
directed Codex to take over `cline.md` and complete the Cline brief. This report
does not attribute execution to Cline.

## Current-State Findings

1. The five required dependency reports exist and contain all ten mandatory
   sections: `agy.md`, `hermes.md`, `pi.md`, `kilo.md`, and `command-code.md`.
   Their smallest local test suites were rerun before this ticket started.
2. Fresh dependency evidence is green:
   - Agy: 6/6 groups passed, including 13-document validation, containment,
     secret rejection, atomic reconciliation, contradiction retention, and
     cycle rejection.
   - Hermes: 10/10 adversarial cases passed fail-closed.
   - Pi: 9/9 context compiler fixtures passed.
   - Kilo: TypeScript typecheck passed and the offline compiled suite reported
     47 passed, 0 failed.
   - Command Code: 31 assertions passed with 0 failures.
3. The coordinator checkout is `main` at
   `f6a02bda04438fc0a3b5d764f474a360651dd78e`. It was not clean when this
   takeover began. Four older specification files were already recorded as
   deleted, and the current expansion specification and prototype trees were
   untracked. No pre-existing deletion was restored or modified by Ticket #8.
4. The Pi report describes schema, secret, and path validation, but its runnable
   `compiler.mjs` validates only abstention and empty selection. The Cline slice
   therefore screens injection-shaped and secret-shaped input before calling
   Pi. This wrapper is a prototype guard, not a claim that Pi itself implements
   those checks.
5. The Command Code facade checks capability effect and permission but does not
   check the requested operation against `ToolDescriptor.operations`. The Cline
   slice performs that membership check before `prepare`. Its disk-backed
   `EffectLedger` also initializes an empty in-memory map instead of hydrating
   prior journal entries, so the Cline slice uses its own serializable workflow
   journal to demonstrate cross-process resume semantics.
6. Retrieval classification is `small_corpus` and the route is
   `direct_local_scan`. No web or multi-engine request was needed or permitted.
   The trading-market `data-routing` skill has no applicable source category for
   this software-repository task and was deliberately recorded as not
   applicable instead of being forced into the workflow.

## Assumptions

1. The Boss message that explicitly assigned the Cline and Codex briefs to
   Codex is the authorization source for these local prototype and report files.
2. Ticket #8 may use `PERM_READ_LOCAL`, `PERM_FILE_WRITE`, and `PERM_EXECUTE`
   only inside the stated repository scope. Network, external communication,
   Git mutation, commit, merge, push, deploy, publish, spend, delete, and
   on-chain effects remain denied.
3. The supplied dependency reports have unresolved design questions, but none
   prevents composition of a non-production, local-only RESEARCH slice.
4. The fixed Git state in deterministic fixtures models the observed base
   commit. Real resume still requires a fresh host Git probe before any step.
5. A serializable in-memory snapshot is sufficient to prove deterministic
   restart behavior in isolation. It is not production durability.
6. The methodology fixture represents Kilo's accepted shape and policy. The
   slice does not execute Kilo TypeScript directly at runtime and does not copy
   Kilo's catalog.

## Proposed Interfaces

### WorkflowDefinition

The prototype preserves the candidate fields from Ticket #1:

```text
WorkflowDefinition {
  workflowId,
  name,
  steps[] { stepIndex, name, requiredCapabilities[], proofCriteria }
}
```

The exact RESEARCH flow is:

```text
VALIDATE_COMMAND
-> COMPILE_CONTEXT
-> SELECT_METHODOLOGY
-> SELECT_CAPABILITIES
-> READ_ONLY_RESEARCH
-> BUILD_DELIVERABLE
-> CHECKPOINT
-> RECONCILE_GIT
-> BUILD_HANDOFF
-> VERIFY_DONE
```

Failure recovery is an orthogonal transition. A crash before commit repeats the
uncommitted step. A timeout after commit replays the journaled result and does
not duplicate the commit. Missing evidence, rejected methodology, or unresolved
contradictions produce `PARTIAL`. Contract, authorization, continuation, or Git
mismatch produces `BLOCKED`.

### WorkflowCheckpoint

The candidate fields remain present: `checkpointId`, `contractId`, `stepIndex`,
`completedDeliverables`, `pendingTasks`, `lastEventId`, and `brainPointer`.
The slice adds `workflowId`, `commandDigest`, `authorizationFingerprint`,
`gitState`, `evidenceRefs`, and `verified`. These additions bind a checkpoint to
the command, authorization, repository, and evidence state it can resume.

### FounderCommand

The candidate fields remain present: `commandId`, `commandType`, `contractId`,
`isResumable`, and `activeCheckpointId`. The slice adds `objective`, `query`,
`approvedRoot`, `permissions`, `networkAllowed`, `expectedGitState`, and
`outputRef`. `commandType` is a literal `RESEARCH`; every other command fails
closed. `networkAllowed` must be `false`.

### ContinuationContract

The candidate fields remain present: `continuationId`, `parentSessionId`,
`targetAgent`, `activeContractId`, `handoffSummary`, `openBlockers`, and
`verifiedCheckpoints`. The slice adds `gitCommit`, `workflowId`, `commandDigest`,
`checkpointDigest`, `authorizationFingerprint`, `allowedPermissions`, and
`forbiddenEffects`.

Internal JavaScript uses camelCase to align with Ticket #1. A future serialized
host adapter may map Hermes names such as `parent_session_id` and `git_commit`,
but it must use one schema-owned mapping rather than parallel contracts.

### Evidence, deliverable, and proof rules

- Retrieved text is data. Injection-shaped sources are quarantined and logged.
- The internal capability is `hypertaks_retrieve` with operation
  `direct_search`, declared effect `none`, and no mutation.
- The research brief is committed before checkpoint, handoff, or completion
  prose.
- Fewer than two evidence references, any unresolved contradiction, or a
  methodology without an output shape forces `PARTIAL` and `NOT_DONE`.
- `VERIFY_DONE` checks deliverable presence and status, evidence sufficiency,
  contradiction state, methodology validity, read-only effects, Git match,
  handoff redaction, and prior step commits.

## Isolated Prototype

Path: `prototypes/founder-os-expansion/cline/`

| File | Purpose |
| --- | --- |
| `contracts.mjs` | Runtime definitions and fail-closed validators for the four required contracts. |
| `fixtures.mjs` | Deterministic Git, corpus, methodology, contradiction, injection, and redaction fixtures. |
| `workflow.mjs` | Serializable journal, state machine, Pi compiler composition, Command Code facade composition, checkpoint, resume, handoff, and proof logic. |
| `run-tests.mjs` | Fourteen deterministic scenarios with 65 assertions. |
| `demo.mjs` | Observable checkpoint, snapshot, cross-process-style restore, resume, and state trace. |
| `README.md` | Local execution instructions and non-production boundary. |

The prototype imports `compileContext` from the Pi prototype and
`ToolRegistry`, `ExecutionEnvelope`, and `NativeToolFacade` from Command Code.
It does not modify or expose a new public skill, MCP tool, runtime route,
manifest, package, roadmap entry, or remote service.

## Tests and Exit Codes

### Start-condition verification

Commands were executed locally with Node.js v24.15.0.

| Command | Working directory | Observed result |
| --- | --- | --- |
| `node validator.mjs all` | `prototypes/founder-os-expansion/agy` | exit 0, all 6 groups passed |
| `node harness.mjs` | `prototypes/founder-os-expansion/hermes` | exit 0, 10/10 passed |
| `node compiler.mjs` | `prototypes/founder-os-expansion/pi` | exit 0, 9/9 passed |
| `node node_modules/typescript/bin/tsc --noEmit -p prototypes/founder-os-expansion/kilo/tsconfig.json` | repository root | exit 0 |
| `node node_modules/typescript/bin/tsc --noEmit false --declaration false --outDir C:\Users\abrur\AppData\Local\Temp\hypertaks-kilo-c4X6uh -p prototypes/founder-os-expansion/kilo/tsconfig.json` | repository root | exit 0 |
| `node C:\Users\abrur\AppData\Local\Temp\hypertaks-kilo-c4X6uh\prototypes\founder-os-expansion\kilo\check.js` | repository root | exit 0, 47 passed, 0 failed |
| `node run-tests.mjs` | `prototypes/founder-os-expansion/command-code` | exit 0, 31 assertions, 0 failures |

`ts-node` was not installed in the repository. A no-install runner attempt was
not used as evidence; it was stopped rather than allowing package resolution to
reach the network. Kilo was instead compiled and run entirely offline as shown
above.

### Ticket #8 suite

Command:

```text
node run-tests.mjs
```

Working directory: `prototypes/founder-os-expansion/cline`

Observed exit code: `0`

Observed summary:

```json
{"kind":"summary","assertions":65,"failures":0}
```

Passing scenarios:

1. Contract shapes and RESEARCH-only state machine.
2. Happy path with deliverable before handoff and proof `DONE`.
3. Checkpoint, serialized snapshot, restore, and deterministic resume.
4. Crash before research commit, followed by exactly one commit on resume.
5. Timeout after research commit, followed by journal replay with commit count 1.
6. Stale Git blocking before any resumed step commits.
7. Missing evidence remaining `PARTIAL` and `NOT_DONE`.
8. Injection attempt quarantined as inert data.
9. Continuation mismatch failing closed before new commits.
10. Methodology without output shape remaining `PARTIAL`.
11. Contradictory evidence retained as `UNRESOLVED` and remaining `PARTIAL`.
12. Unsupported command and permission expansion blocked.
13. Secret-shaped handoff input redacted.
14. Read-only capability, no network, no external writes, and exactly four
    public MCP tools.

### Checkpoint and resume trace

Command:

```text
node demo.mjs
```

Observed exit code: `0`

Observed summary:

```text
firstRunStatus=PAUSED
checkpointId=CP-e2a7260b27e5f58c
checkpointStep=4
resumedStatus=COMPLETE
deliverableStatus=COMPLETE
proofStatus=DONE
researchCommitCount=1
```

The observed state sequence was:

```text
VALIDATE_COMMAND commit
COMPILE_CONTEXT commit -> checkpoint
SELECT_METHODOLOGY commit
SELECT_CAPABILITIES commit
READ_ONLY_RESEARCH commit -> checkpoint -> pause
restore -> resume
BUILD_DELIVERABLE commit
CHECKPOINT commit -> checkpoint
RECONCILE_GIT commit -> checkpoint
BUILD_HANDOFF commit -> checkpoint
VERIFY_DONE commit -> checkpoint
WORKFLOW_FINISHED COMPLETE
```

### Git and text checks

| Command | Observed result |
| --- | --- |
| `git rev-parse HEAD` | exit 0, `f6a02bda04438fc0a3b5d764f474a360651dd78e` |
| `git branch --show-current` | exit 0, `main` |
| `git diff --check` | exit 0 |

`git diff --check` does not inspect untracked files. Ticket #8 therefore also
uses a direct scan of its report and prototype for U+2014, trailing whitespace,
and secret-shaped literals before acceptance.

## Risks

1. This is explicitly non-production. `WorkflowStore` proves serialized state
   transfer but does not provide atomic disk persistence, process locking,
   multi-host concurrency, or crash-safe fsync behavior.
2. Git state is a deterministic fixture inside the prototype. Production use
   must invoke a fresh, contained Git probe and bind the observed result to the
   checkpoint.
3. The Pi and Command Code guard gaps described above remain upstream issues.
   The Cline wrappers prevent those gaps from invalidating this slice but do not
   repair the upstream prototypes or runtime.
4. Command Code invocation IDs use randomness. The Cline workflow therefore
   keys continuity on deterministic command and step digests, not invocation
   IDs.
5. The checkout is shared and already dirty. Provenance now records that state,
   and future integration must continue separating pre-existing changes from
   accepted ticket artifacts.
6. The internal `fixture://shape-check` evidence is deterministic prototype
   evidence. Only the outer `run-tests.mjs` exit code is empirical execution
   evidence for this ticket.

## Second-Order Effects

1. Binding continuation to command, checkpoint, authorization, and Git digests
   prevents a handoff from silently widening permissions or resuming another
   contract.
2. Deliverable-first ordering makes partial evidence visible before status prose
   and prevents a fluent handoff from becoming false proof of completion.
3. A separate journal idempotency key allows timeout reconciliation without
   relying on a checkpoint that may lag the committed step.
4. Quarantining injection-shaped text before context compilation narrows the
   trust boundary, but it also means every future compiler adapter must expose a
   consistent pre-validation hook or accept only screened candidates.
5. Exact Git binding increases safety but makes legitimate branch or base-commit
   movement an explicit reconciliation event rather than an automatic resume.
6. Keeping `hypertaks_retrieve` internal preserves the existing four-tool
   read-only MCP surface and the exact five public skills.

## Unresolved Decisions

1. Select the production persistence owner for checkpoints and journals. It must
   use approved-root containment, schema validation, secret scanning, atomic
   write, read-after-write reconciliation, and an authorized transaction.
2. Decide the canonical checkpoint cadence. The prototype checkpoints bounded
   evidence, research, handoff, Git, and proof states and also creates a forced
   checkpoint for an explicit pause.
3. Define a schema-owned camelCase to snake_case serialization mapping for
   continuation fields required by different hosts.
4. Decide whether Command Code should hydrate its effect ledger from journaled
   entries or delegate all cross-process reconciliation to the continuity
   owner.
5. Expand empirical proof evidence beyond a deterministic shape check when a
   later implementation contract modifies runtime behavior.

None of these decisions blocks acceptance of the isolated Ticket #8 prototype.

## Provenance

- Actual executor: Codex, executing the Cline assignment by explicit Boss
  takeover instruction.
- Original assigned role: Cline. Cline did not produce this report or prototype.
- Contract: `HT-20260811-FOS`.
- Date: 2026-08-11.
- Repository: `C:\Users\abrur\Documents\hypertaks-agent`.
- Base branch and commit: `main` at
  `f6a02bda04438fc0a3b5d764f474a360651dd78e`.
- Primary local evidence:
  - `briefs/08-cline.md`
  - `claude-code.md` and `prototypes/founder-os-expansion/claude-code/interfaces.ts`
  - `agy.md` and its validator
  - `hermes.md` and its adversarial harness
  - `pi.md` and `compiler.mjs`
  - `kilo.md`, `schema.ts`, `engine.ts`, and `check.ts`
  - `command-code.md`, `tool-registry.mjs`, and `run-tests.mjs`
  - `skills/hypertaks/SKILL.md` and its security, state, retrieval, execution,
    engineering, and token-discipline references
- No network source, external message, credential, commit, merge, push, deploy,
  publish, spend, delete, or on-chain action was used.

## Recommendation

Accept Ticket #8 as complete in isolation. The prototype satisfies its stated
definition of done: deterministic resume, commit-once recovery, honest partial
and blocked states, preserved authorization, redacted handoff, deliverable-first
ordering, proof gating, local-only execution, and an unchanged public surface.

Do not treat it as production-ready or integrate it directly into runtime. Pass
the report and prototype to Ticket #9 for cross-ticket interface reconciliation,
scope review, and decision-map updates.
