# Hypertaks Founder OS External-Agent Prototype Decision Map

Contract: `HT-20260811-FOS`

Status: `EXPERIMENTAL PACKAGE ACCEPTED - PRODUCTION INTEGRATION HOLD`

Integration audit observed on 2026-08-11: branch `main`, HEAD
`f6a02bda04438fc0a3b5d764f474a360651dd78e`, and local `main` at `0/0`
against the existing `origin/main` tracking reference. No network fetch was
authorized, so the remote server state was not refreshed. The working tree is
not clean: four older tracked specification files are deleted and the Founder
OS reports and prototypes are untracked. Git registers only the coordinator
checkout, not separate agent worktrees.

Release acceptance repair on 2026-08-11 corrected the report contract, shared
checkout provenance, authority enums, credential-shaped fixtures, and trailing
whitespace. A later direct Boss instruction explicitly authorized packaging
these reports and prototypes in v4.5.2, commit, push to `origin/main`, tag, and
GitHub Release. That approval does not authorize copying prototype code into the
production runtime or public skills.

## Program boundary

- Preserve exactly five public Hypertaks skills and four read-only remote MCP
  tools.
- Treat proposed native tools as internal capabilities and host-adapter
  contracts, not new public MCP tools.
- Package prototypes and evidence reports as an explicitly non-production lab.
  Do not copy or wire prototype code into `runtime/` or the public skills.
- Keep Graphify, Obsidian, embeddings, vector databases, hosted services, and
  daemons optional.
- Permit automatic Project Operating Context creation only after an approved
  contract grants `PERM_FILE_WRITE`. Keep maintenance inside the approved root.
- Treat zero-context-loss as a measured objective, not an absolute guarantee.
- Preserve `prompt-build-continunity-prompt.ctx.md` during prototyping.
- Reconcile the existing roadmap instead of replacing it wholesale.
- Commit, push, tag, and GitHub Release require a direct Boss approval that names
  those effects. No approval for deployment, marketplace publication, spend,
  deletion, or billable external-agent invocation is implied.

## Canonical artifacts

Reports land beside this file:

- [Claude Code report](claude-code.md)
- [Grok report](grok.md)
- [Agy report](agy.md)
- [Hermes report](hermes.md)
- [Pi report](pi.md)
- [Kilo report](kilo.md)
- [Command Code report](command-code.md)
- [Cline report](cline.md)
- [Codex synthesis](codex.md)

Agent prompts are in [`briefs/`](briefs/). In the observed checkout, prototype
code is under `prototypes/founder-os-expansion/<ticket>/`; no separate agent
worktrees are registered. Prototype source remains non-production evidence and
must not be copied into runtime by this synthesis.

## Locked internal contract families

- `ProjectContextManifest`, `ContextDocument`,
  `ContextCompilationRequest`, `ContextCompilationResult`
- `OntologyEvent`, `ProjectEntity`, `ProjectRelation`, graph query contracts
- `KnowledgeModuleManifest`, `MethodologySelection`
- `ToolDescriptor`, `ToolInvocation`, `ToolResult`, `ActionTransaction`
- `WorkflowDefinition`, `WorkflowCheckpoint`, `FounderCommand`
- `ContinuationContract`, proof-of-done evidence

These remain internal contracts. This program does not change a public API.
The integration audit resolves the following cross-ticket rules:

- Internal TypeScript uses camelCase. Persisted JSON may use snake_case only
  through one schema-owned adapter.
- Existing `QueryClass` and `RetrievalRoute` in `runtime/router.ts` are
  canonical. Parallel route enums are rejected.
- Authority follows `00-security-kernel.md`: T0 system, T1 Boss turn, T2
  workspace standard, T3 approved contract, T4 repository/tool evidence, T5
  external data, and T6 generated or derived data. Conflicting ticket enums
  must be revised before implementation.
- Kilo's extended knowledge and methodology shapes supersede Claude's minimal
  placeholders, subject to canonical authority and evidence fields.
- Command Code's detailed effect kind is additive. Existing broad
  `side_effect` remains for backward compatibility and is derived from the
  detailed effect kind.
- Transaction states are `PREPARE`, `PREVIEW`, `APPROVAL`, `COMMIT`,
  `RECONCILE`, and pre-commit `ABORTED`; COMMIT ONCE is an invariant.
- Cline's digest-bound checkpoint and continuation extensions are accepted for
  the `RESEARCH` command only.

## Wave and action ledger

| Wave | Tickets | State | Launch action IDs |
|---|---|---|---|
| Bootstrap | map and briefs | COMPLETE | `HT-20260811-FOS-B01` |
| 1 | #1, #2, #3, #4 | PACKAGE HYGIENE REPAIRED; DESIGN REVISIONS RECORDED | `A01` Claude, `A02` Grok, `A03` Agy, `A04` Hermes |
| 2 | #5, #6, #7 | PACKAGE HYGIENE REPAIRED; IMPLEMENTATION GAPS RECORDED | `A05` Pi, `A06` Kilo, `A07` Command Code |
| 3 | #8 | COMPLETE IN ISOLATION | `A08` Cline assignment executed by Codex on Boss takeover |
| Integration | #9 | EXPERIMENTAL PACKAGE GO; PRODUCTION HOLD | local Codex integration |

The action IDs above are reserved identifiers, not approvals. Before each
external invocation, verify CWD, branch, HEAD, worktree, CLI availability,
authentication without exposing credentials, selected model, incremental cost,
headless readiness, prompt, and report destination. Preview the exact action
and obtain fresh T1 approval when it may be billable.

## Required report contract

Every report must contain these headings:

1. Current-State Findings
2. Assumptions
3. Proposed Interfaces
4. Isolated Prototype
5. Tests and Exit Codes
6. Risks
7. Second-Order Effects
8. Unresolved Decisions
9. Provenance
10. Recommendation

Claims must distinguish observed evidence from inference. Tests must include the
exact command and observed exit code. Citations must be verified. Reports must
contain no credentials, secret values, U+2014, or unsupported host claims.

## #1: Target Architecture And Migration Boundary

Blocked by: none

Type: Prototype

Agent: Claude Code

Brief: [01-claude-code.md](briefs/01-claude-code.md)

### Question

How should the existing roadmap, router, founder brain, and five focused skills
map to the requested Founder OS capabilities without changing the public
boundary?

### Answer

REVISE. The architecture boundary and six internal contract families are useful
and its isolated typecheck and compiled structural check pass. Do not accept
the interfaces verbatim: the minimal knowledge and transaction shapes are
superseded downstream, and three extra files in the Claude prototype are absent
from its report inventory and duplicate context, retrieval, and ontology
taxonomies. Two cited historical specifications exist at HEAD but are deleted
from the current working tree. No separate Claude worktree is registered.

## #2: Evidence-Grounded Context And Retrieval Research

Blocked by: none

Type: Research

Agent: Grok

Brief: [02-grok.md](briefs/02-grok.md)

### Question

Which primary-source findings should govern context engineering, hybrid RAG,
evidence binding, freshness, tool protocols, and retrieval evaluation?

### Answer

PROVENANCE REPAIRED, RESEARCH CONSTRAINTS ACCEPTED. The evidence-pack validator
passes with eight selected sources, `evaluation_status=UNVERIFIED`, and no
absolute zero-context-loss claim. Direct/keyword default, exact-identifier
boost, measured retention, explicit drops, freshness, and optional hybrid
retrieval are accepted. The report now binds its execution to the shared
coordinator checkout, branch, and base commit. External links were not refreshed
because Ticket #9 had no network authorization. Multi-engine search remains
discovery only.

## #3: Project Operating Context And Typed Ontology

Blocked by: none

Type: Prototype

Agent: Agy

Brief: [03-agy.md](briefs/03-agy.md)

### Question

What exact thirteen-file Project Operating Context and append-only typed graph
can preserve provenance, contradictions, root safety, and atomic persistence?

### Answer

GO AS A PACKAGED PROTOTYPE. The exact thirteen-file set,
preserved `prompt-build-continunity-prompt.ctx.md`, append-only events,
contradiction retention, cycle rejection, containment, secret rejection, and
atomic reconciliation pass. The persisted snake_case schema requires one
camelCase adapter. The release repair aligns T2/T3/T5/T6 labels with the
security kernel, marks generated context as T6 data, and records the shared
coordinator checkout rather than claiming a separate worktree.

## #4: Security And Continuity Red-Team

Blocked by: none

Type: Prototype

Agent: Hermes

Brief: [04-hermes.md](briefs/04-hermes.md)

### Question

Which adversarial cases can break authorization, project isolation, evidence
freshness, transaction reconciliation, and cross-host continuity?

### Answer

GO AS THE PACKAGED ADVERSARIAL GATE. All 10 adversarial
cases pass. Approval spoofing, permission escalation, prompt injection, path
escape, secret propagation, timeout ambiguity, Git drift, false proof of done,
descriptor remapping, and unauthorized file creation remain mandatory tests.
Tracked fixtures now use non-secret handles; credential-shaped negative inputs
are assembled only at runtime. Provenance records the shared coordinator
checkout and does not claim a separate Hermes worktree.

## #5: Context Compiler And Optional RAG Pipeline

Blocked by: #1, #2, #3

Dependency state: `SATISFIED FOR PROTOTYPE AUDIT; IMPLEMENTATION HOLD`

Type: Prototype

Agent: Pi

Brief: [05-pi.md](briefs/05-pi.md)

### Question

How should retrieve, rank, compress, validate, inject, and execute extend the
current retrieval router with bounded context and deterministic fallback?

### Answer

REVISE. The nine fixtures pass and the retrieve, rank, compress, validate,
inject pipeline is useful. The executable does not implement several report
claims: no schema, secret, injection, or path validation; no hard-token-limit
enforcement; required-field retention is hard-coded to 100; and document-count
retention is labeled citation retention. The TypeScript types, TypeScript
compiler, and runnable MJS surface also diverge in casing and shape. Use the
existing router enums and add measured validators before implementation.

## #6: Knowledge Library And Methodology Engine

Blocked by: #1, #2

Dependency state: `SATISFIED FOR PROTOTYPE AUDIT; IMPLEMENTATION HOLD`

Type: Prototype

Agent: Kilo

Brief: [06-kilo.md](briefs/06-kilo.md)

### Question

How should knowledge manifests, indexes, lazy loading, domain composition,
method selection, freshness, licensing, and loading limits extend K1?

### Answer

GO WITH IMPLEMENTATION REVISIONS AND DEFERRED CATALOG WORK. Typecheck and 47 fixture assertions
pass. Kilo's extended manifest, provenance, freshness, license, loading budget,
method preconditions, output shape, rejection reasons, and deterministic
selection supersede Claude's placeholders. Full catalog population, license
data entry, optional vector adapters, and conflict-policy expansion remain
deferred. The report now records branch, base commit, and shared-checkout
provenance, and its authority classes match the security kernel.

## #7: Internal Tool Registry And Native-Tool Facade

Blocked by: #1, #4

Dependency state: `SATISFIED FOR PROTOTYPE AUDIT; IMPLEMENTATION HOLD`

Type: Prototype

Agent: Command Code

Brief: [07-command-code.md](briefs/07-command-code.md)

### Question

How should internal capability descriptors, permission mapping, execution
envelopes, evidence, fallbacks, host compatibility, and transaction semantics
work while the four-tool remote MCP boundary remains unchanged?

### Answer

REVISE BEFORE PRODUCTION IMPLEMENTATION. All 31 assertions pass and the effect-based,
approval, redaction, timeout, and idempotency concepts are accepted. The report
now follows the exact ten-section contract. The facade still does not check
requested operations against descriptor operations, does not enforce
`exactRoot`, and its ledger does not hydrate prior journal entries; invocation
IDs are also random despite a deterministic-test claim. Preserve the four-tool
public surface and repair these internal boundaries in a later contract.

## #8: Resumable RESEARCH Founder Command Thin Slice

Blocked by: #3, #4, #5, #6, #7

Dependency state: `SATISFIED FOR ISOLATED TICKET #8 EXECUTION`

Type: Prototype

Agent: Cline

Brief: [08-cline.md](briefs/08-cline.md)

### Question

Can the candidate contracts compose into one resumable, deliverable-first
`RESEARCH` command with safe checkpoint, recovery, and handoff behavior?

### Answer

GO AS A NON-PRODUCTION VERTICAL SLICE. Codex executed the Cline assignment after
the Boss explicitly took it over. The slice passes 65 assertions across happy,
pause/resume, crash-before-commit, timeout-after-commit, stale Git, missing
evidence, injection, continuation mismatch, invalid methodology,
contradiction, authorization, redaction, and public-boundary cases. The demo
resumes to `DONE` with one research commit. Production persistence, locking,
and fresh host Git probing remain unimplemented.

## #9: Integration And Go/No-Go Synthesis

Blocked by: #1, #2, #3, #4, #5, #6, #7, #8

Dependency state: `PACKAGE ACCEPTANCE REPAIRED; PRODUCTION GAPS RECORDED`

Type: Prototype

Agent: Codex Founder/Integrator

Brief: [09-codex.md](briefs/09-codex.md)

### Question

Which prototype decisions survive independent diff inspection and rerun tests,
and what staged implementation plan is safe to approve next?

### Answer

EXPERIMENTAL PACKAGE GO, PRODUCTION IMPLEMENTATION HOLD. Eight of eight smallest
prototype tests pass. Release acceptance repair makes every report follow the
exact heading contract, completes shared-checkout provenance, aligns authority
classes, replaces stored credential-shaped fixture values with handles and
runtime generation, and removes trailing whitespace. Four pre-existing deleted
specifications remain outside the release stage. `codex.md` records accepted
contracts, mandatory production revisions, staged implementation, migration,
ownership, acceptance tests, and explicit no-go boundaries. The lab is
publishable as experimental evidence; it is not production-ready runtime code.

## Acceptance gate

- PASS: all eight agent-named reports exist. `codex.md` is produced by Ticket
  #9 beside this map.
- PASS: all eight reports use the exact ten-section list. Command Code's
  start-condition note is subordinate to the required current-state section.
- PASS WITH LIMITATION: Codex inspected the only registered worktree, every
  report and prototype tree, and reran the smallest relevant test for all eight
  tickets. No separate agent worktrees exist to inspect.
- PASS: release packaging changes README, live 4.5.2 product records, release
  notes, and prototype evidence only. Four older tracked documentation deletions
  remain excluded from staging.
- PASS: direct scans cover the full candidate tree, including previously
  untracked files; trailing whitespace and U+2014 findings are zero.
- PASS: tracked negative fixtures contain handles only. Credential-shaped test
  values are assembled at runtime, and scanner diagnostics reproduce no match.
- PASS: every report identifies the shared coordinator checkout or explicitly
  states that no separate agent worktree or commit is claimed.
- PASS: this map records every ticket verdict and retains implementation and
  provenance revisions explicitly.
- PASS: `codex.md` contains staged implementation, migration, final interface
  decisions, ownership, acceptance tests, and explicit go/no-go findings.
- PASS FOR PACKAGE: the v4.5.2 release runs the full applicable repository,
  distribution, prototype, compilation, text, and staged-diff gates.
- HOLD FOR PRODUCTION: Pi validation gaps, Command Code operation/root/durable
  reconciliation gaps, and production persistence remain deferred to a later
  implementation contract.

Overall gate: `GO FOR v4.5.2 EXPERIMENTAL PACKAGE`; `HOLD FOR DIRECT RUNTIME OR
PRODUCTION INTEGRATION`.
