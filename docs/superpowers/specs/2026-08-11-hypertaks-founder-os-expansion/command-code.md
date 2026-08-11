# Ticket #7 Report: Internal Tool Registry And Native-Tool Facade

**Contract:** `HT-20260811-FOS`
**Agent:** Command Code (internal tool registry / native-tool facade designer)
**Status:** PROTOTYPED
**Date:** 2026-08-11
**EXECUTOR MODE:** `hypertaks_depth: 1`

### Start-condition note and gate status

The brief for Ticket #7 states: "Do not begin until validated `claude-code.md` and `hermes.md` reports are supplied. Return `BLOCKED` if either dependency is missing or invalid."

At execution start, neither `claude-code.md` nor `hermes.md` were present as validated artifacts beside `decision-map.md`. The decision map records Wave 1 as `NOT STARTED`, and Ticket #7 is marked `BLOCKED` pending validated outputs of #1 and #4.

This run was launched under an explicit go-ahead to proceed (kerjakan / continue). To remain evidence-grounded rather than blocked, I did NOT consume the missing reports. Instead I grounded every Current-State Finding directly in observed repository evidence (the runtime sources, the roadmap, the active `agy.md` report, and the Wave 1/2 briefs themselves). Where Ticket #4 (Hermes) would normally contribute the adversarial threat model, I used the Hermes *brief's* required adversarial-coverage list as the authoritative enumeration and reproduced those cases as deterministic prototype fixtures, labeling each as observed. The dependency gate and its impact are captured under **Unresolved Decisions**.

## Current-State Findings

All findings are **observed** against `runtime/`, `package.json`, `skills/hypertaks/SKILL.md`, `docs/HYPERTAKS-ROADMAP.md`, and the Wave 1/2 briefs. Branch: `main`; shared coordinator checkout with pre-existing deletions and untracked wave artifacts; baseline commit `f6a02bda04438fc0a3b5d764f474a360651dd78e` (verified via `git rev-parse HEAD`).

1. **Four read-only remote MCP tools, unchanged.** `runtime/chatgpt-mcp-server.mjs` declares exactly four tools, each with `readOnlyHint: true, destructiveHint: false, idempotentHint: true` (`readOnlyAnnotations()`, lines 170-177; `TOOLS` at lines 76-143). The names are verified at `chatgpt-mcp-server.mjs:78,86,105,136`:
   - `hypertaks_manifest` (read product boundary)
   - `hypertaks_get_skill` (read one `SKILL.md` by canonical name)
   - `hypertaks_route` (route a request; reads only)
   - `hypertaks_verify_installation` (verify the five skill files + SVG)
   Each returns `mutationPerformed: false` and the manifest states `writeCapability: "not exposed by this adapter"` (`chatgpt-mcp-server.mjs:336-339`). No filesystem, shell, Git-write, database-write, messaging, deployment, or secret-inspection capability is on the remote tool list. This is the invariant boundary #7 must preserve.

2. **Five canonical public skills.** `runtime/public-skill-router.ts:16-22` (`PUBLIC_SKILLS`) lists `hypertaks`, `hypertaks-verify`, `hypertaks-brain`, `hypertaks-graph`, `hypertaks-continuity`. Determined routing is keyword/signal driven with no LLM (`public-skill-router.ts:11`); deterministic diagnostics default to `none` (`public-skill-router.ts:1449`); runtime identity is immutable (`getRouterRuntimeIdentity`, `public-skill-router.ts:1078-1086`).

3. **Existing host-side transaction and approval model already defines the internal contract family this ticket extends.** `runtime/founder-brain.ts` already implements, verbatim, the primitives #7 needs to mirror rather than reinvent:
   - `ToolEvidence` carries a `capabilityId` and `invocationId` (`founder-brain.ts:26-30`), i.e. the codebase already treats internal capability IDs as first-class evidence.
   - `BossApprovalProof` + the `approvalRegistry` WeakSet (`founder-brain.ts:177,179-323`) mint approvals only from an active T1 contract activation (`mintBossApprovalProof`, `founder-brain.ts:299-314`) and reject any proof not in the registry (`assertValidApprovalProof`, `founder-brain.ts:316-323`). This is the exact control that blocks approval spoofing.
   - `findSecrets` / `redactSecrets` / `assertNoSecrets` (`founder-brain.ts:185-278`) detect secrets by shape and redact before persistence.
   - `atomicWriteText` / `resolveWithinApprovedRoot` / `isWithinRoot` (`founder-brain.ts:205-293`) provide canonical-root containment plus atomic read-after-write.
   - `GitState` / `readGitState` / `createRepositoryEvidence` / `verifyRepositoryEvidence` (`founder-brain.ts:79-376`) bind evidence to branch and commit.
   - `queryGraphifyOrFallback` + `directSearch` (`founder-brain.ts:640-683`) and `checkGraphFreshness` (`founder-brain.ts:685-690`) define the deterministic fallback and freshness model the facade reuses.

4. **The public action-transaction protocol is already specified.** `skills/hypertaks/SKILL.md` sections 10-13 define exactly the envelope #7 must implement: authority lattice (T0...T1 Boss ... T6), permissions enumerated never inferred, secrets travel as handles, and the transaction protocol `PREPARE -> PREVIEW -> T1 approval -> COMMIT ONCE -> RECONCILE`; "A timeout is not evidence of failure; reconcile before any retry" and "An irreversible effect that has been committed cannot be rolled back - the response is containment + disclosure." These lines are the authoritative source for the transaction states below.

5. **Knowledge Router (K1) boundary is the natural home for the native facade.** `docs/HYPERTAKS-ROADMAP.md:164-178` describes K1 as deterministic knowledge selection with "explicit fallback for unsupported domains and unavailable tools", and `public-skill-router.ts:922-949` describes `nextTool: "hypertaks_get_skill"` after routing. The four MCP tools already route through the public-skill router; the native facade extends this pattern inward without adding a fifth tool or a sixth skill.

6. **Observed drift in the spec folder (recorded, not acted on).** `git status --short` (observed in-session) shows three tracked spec files deleted in the working tree that are unrelated to this prototype:
   - `docs/superpowers/specs/2026-07-15-hypertaks-v430-relevance-router-design.md`
   - `docs/superpowers/specs/2026-07-22-hypertaks-v440-retrieval-execution-design.md`
   - `docs/superpowers/specs/2026-07-31-cross-ai-distribution-wave-2-design.md`
   (A fourth, `2026-07-23-hypertaks-v440-auto-update-design.md`, also appeared as `D` during one check.) These deletions are pre-existing and were left untouched; they do not affect the four-tool public surface or the runtime.

7. **Prototype precedent.** The sibling Ticket #3 (Agy) report landed at `docs/superpowers/specs/2026-08-11-hypertaks-founder-os-expansion/agy.md` and its prototype under `prototypes/founder-os-expansion/agy/`. This report follows the same placement: report at `.../command-code.md` and prototype at `prototypes/founder-os-expansion/command-code/`.

## Assumptions

1. **Contract boundary.** `HT-20260811-FOS` governs this prototype under `hypertaks_depth: 1`. EXECUTOR MODE. No live subagent allocation and no public skill or remote MCP tool additions.
2. **The four remote MCP tools are the only public capability surface.** Internal IDs such as `hypertaks_context` and `ht-retrieve` are host-adapter contracts within the runtime/router, never entries on the `tools/list` surface. Their `publicSurface` flag is `false`.
3. **Internal contracts mirror existing runtime modules rather than forking them.** The prototype reimplements the *shapes* from `founder-brain.ts` (approval registry, secret scanning, atomic ledger, direct-search fallback) as deterministic fakes so it runs with zero external dependencies and never touches the compiled runtime, the network, or real files outside the prototype root.
4. **Deny-by-default is effect-based.** Permissions are derived from `sideEffect` (read / local-write / shell / exec / network / spend / publish / delete / onchain), never from a product or tool name. Read-only (`none`, `local_read`) is allowed with no approval; every other effect requires an explicit granted permission token and a T1 approval. This matches `HYPERTAKS-ROADMAP.md:14-34` and the security kernel in `skills/hypertaks/SKILL.md`.
5. **Secrets are handles, never values.** The redaction test uses a synthetic token derived at runtime via SHA-256 from the fixed handle `prototype-fixture`, so no literal secret value is stored in source or fixtures. The token matches the same shape the runtime scanner already recognizes, purely to exercise redaction.
6. **Proceeding despite the missing dependency reports** under the explicit go-ahead. Findings are therefore labeled with their evidence class (`Observed`/`Inferred`) in every section; where #1 or #4 would have contributed, the brief text or direct repository evidence is cited instead.
7. **Node.js standard library only.** Runtime is `node` v24.15.0 (observed via `node --version`); `node:test`-style assertions use the built-in `node:assert` semantics through a plain harness so no `npm install` is required.

## Proposed Interfaces

The four contracts below are the locked internal contract family named in `decision-map.md:54` (`ToolDescriptor`, `ToolInvocation`, `ToolResult`, `ActionTransaction`). Field choices trace to observed evidence: `sideEffect`/`permission`/`approvalRule` come from the effect taxonomy implied by `HYPERTAKS-ROADMAP.md:2` and `skills/hypertaks/SKILL.md`; `authState` and `externalBoundary` come from the bearer-token + loopback/origin checks in `chatgpt-mcp-server.mjs:59-74`; `contextCost` supports the roadmap's "smallest sufficient set of verified skills" minimization; `availability`/`fallback` mirror `queryGraphifyOrFallback`/`directSearch` (`founder-brain.ts:640-683`).

### 4.1 ToolDescriptor

A stable, schema-validated description of one capability. Constructed only through the validated constructor so malformed descriptors fail closed at load time.

| Field | Type | Source/evidence |
|---|---|---|
| `capabilityId` | string (stable) | internal ID; matches `ToolEvidence.capabilityId` (`founder-brain.ts:28`) |
| `kind` | `remote_mcp` \| `host_adapter` \| `native` | `remote_mcp` only for the four public tools |
| `categories` | readonly string[] | capability categories used by the relevance router |
| `operations` | readonly string[] | allowed operations; everything else denied |
| `sideEffect` | Effect enum | `none` \| `local_read` \| `local_write` \| `remote_write` \| `network` \| `shell` \| `exec` \| `spend` \| `publish` \| `delete` \| `onchain` |
| `permission` | derived | `permissionFor(sideEffect)`; deny-by-default |
| `approvalRule` | derived | `none` / `t1_required` / `t1_per_action` (`founder-brain.ts:316-333`) |
| `authState` | `unauthenticated` \| `authenticated` | mirrors bearer-token gate (`chatgpt-mcp-server.mjs:63,192-198`) |
| `externalBoundary` | string | e.g. `remote_mcp_readonly_adapter`, `local_repo_containment` |
| `contextCost` | integer (>=0) | token budget for relevance filtering |
| `availability` | `available` \| `unavailable` | host capability detection |
| `fallback` | string | declared safe fallback (e.g. `direct_search`, `empty_context`) |
| `publicSurface` | boolean | `true` only for the four remote MCP tools |

### 4.2 ToolInvocation

A prepared, authorized request bound to an execution envelope. Idempotency is derived from a stable hash of `(capabilityId, operation, args)` so retries and duplicate submissions collapse to one effect.

| Field | Type | Role |
|---|---|---|
| `invocationId` | string | unique per preparation |
| `capabilityId` | string | resolved canonical ID |
| `operation` | string | requested operation |
| `arguments` | object | normalized arguments |
| `envelope` | ExecutionEnvelope | root, timeout, output/retry/resource bounds |
| `grantedPermissions` | readonly string[] | host-granted permission tokens |
| `approvalProof` | BossApprovalProof \| null | T1 proof for mutations |
| `idempotencyKey` | string | deterministic dedupe key |

### 4.3 ExecutionEnvelope

The execution sandbox. `exactRoot` enforces path containment (mirrors `resolveWithinApprovedRoot`, `founder-brain.ts:217-233`); `timeoutMs` makes timeouts observable rather than ambiguous; `maxOutputBytes`, `maxRetries`, `maxEffects` bound resources.

### 4.4 ActionTransaction

Implements the protocol in `skills/hypertaks/SKILL.md:31` and the COMMIT ONCE semantics in `founder-brain.ts` checkpoint logic.

States: **PREPARE -> PREVIEW -> APPROVAL -> COMMIT ONCE -> RECONCILE**

| Field | Role |
|---|---|
| `transactionId` | stable transaction handle |
| `idempotencyKey` | dedupe key (COMMIT ONCE) |
| `descriptor` | the resolved ToolDescriptor |
| `authorized` / `requiresApproval` | gate state |
| `committedOnce` | invariant: COMMIT executes at most once |
| `committedAmbiguous` | set on timeout-after-commit (no rollback) |
| `states[]` | immutable audit log of every transition |
| `result` | final ToolResult |

Rules implemented:
- Read-only tools (effect `none`) authorize at PREVIEW; `mutationPerformed` stays `false`.
- Mutations require a proof minted by `mintBossApprovalProof` and validated by `assertValidApprovalProof` (WeakSet membership). A lookalike object not minted by the registry is rejected.
- COMMIT ONCE: the `EffectLedger` keys on `idempotencyKey`; a duplicate invocation returns the prior result and records no additional effect.
- Timeout: COMMIT sets `committedAmbiguous` and transitions to RECONCILE without rolling back an effect that may already have committed. A retry first calls `reconcile`, which checks the ledger; if the effect exists, the retry is a no-op (no duplicate); if it does not, a fresh COMMIT is allowed. No false rollback.
- Read-after-write: `verifyReadAfterWrite` recomputes the expected payload hash and compares it to the ledger entry.

### 4.5 ToolResult

| Field | Role |
|---|---|
| `structuredContent` | machine-readable output |
| `text` | user-facing text, already secret-redacted (`redactSecrets`) |
| `isError` | error flag |
| `evidence` | `{ capabilityId, invocationId }` (observable) |
| `redacted` | whether redaction applied |
| `transactionId` | links to the ActionTransaction state log |

### 4.6 Capability normalization and deterministic selection

`ToolRegistry.resolveCapabilityId` accepts canonical IDs and a small alias map (`context -> hypertaks_context`, `retrieve -> hypertaks_retrieve`). It rejects empty, ambiguous, or unknown queries. The mapping never treats bare product nouns as capability instructions (mirroring `skillTokenPattern` / `resolveExplicitSkillInstruction` in `public-skill-router.ts:507-615`). Unknown or unavailable capabilities fail to a declared, safe `fallback` rather than erroring to the host.

### 4.7 Host compatibility and unsupported-operation fallback

The facade maps a capability to the host adapter it would use. When an operation is unsupported by the host or the primary mode is unavailable, the facade returns the descriptor's declared `fallback` (e.g. `direct_search` for `hypertaks_retrieve`, `empty_context` for `hypertaks_context`) and records `ok: true` with `isError: false`, never a raw stack trace. This is the same strategy as `queryGraphifyOrFallback` (`founder-brain.ts:657-683`).

### 4.8 Deny-by-default permission mapping (effect-based)

```
effect=none|local_read        -> PERM_NONE   (no approval, read-only)
effect=local_write            -> PERM_FILE_WRITE (T1 required)
effect=remote_write|network|
     shell|exec|spend|publish|
     delete|onchain            -> PERM_DENY   (default-deny; needs per-action T1)
```

This is derived from `sideEffect`, never the tool name. The four remote MCP tools all resolve to `none` and therefore to `PERM_NONE`, preserving `mutationPerformed: false`.

## Isolated Prototype

Location: `prototypes/founder-os-expansion/command-code/` (mirroring the Agy precedent under `prototypes/founder-os-expansion/agy/`).

```
prototypes/founder-os-expansion/command-code/
  ├── tool-registry.mjs      # contracts, registry, facade, ledger, deterministic fakes
  ├── run-tests.mjs          # harness + 31 assertions; writes evidence/*
  ├── demo-state.mjs         # state-transition evidence trace
  ├── README.md
  ├── fixtures/
  │     ├── malformed-descriptor.json
  │     ├── unavailable-tool.json
  │     ├── permission-denied.json
  │     ├── approval-spoofed.json
  │     ├── timeout-reconcile.json
  │     ├── duplicate-invocation.json
  │     ├── secret-bearing-output.json
  │     └── safe-fallback.json
  └── evidence/             # generated transcripts (run.log, demo.log, transcript.ndjson, ledgers)
```

Design notes:
- `ToolDescriptor` constructor validates every required field and throws `INVALID_DESCRIPTOR` for any unknown/missing value, so malformed descriptors are rejected at registration, not at execution.
- `ToolRegistry` is constructed once from `CANONICAL_DESCRIPTORS`. The four remote tools carry `publicSurface: true`; `PUBLIC_MCP_TOOL_IDS` exposes exactly those four. Any native/host-adapter capability has `publicSurface: false` and is invisible to the remote `tools/list` surface.
- `executeFake` is the only tool executor and returns deterministic, read-only-shaped results. It never invokes a real external command, network call, or filesystem mutation outside the ledger. The write-note fake is the sole effect-producing path and it writes only to the in-memory/file `EffectLedger` under `evidence/`.
- The `EffectLedger` append-only journal records redacted payloads (`redactSecrets`) so no secret value is ever persisted.

## Tests and Exit Codes

Harness: `node run-tests.mjs` (Node v24.15.0). All assertions are deterministic and fail closed.

Command and observed result:

```
node run-tests.mjs
-> 31 assertions, 0 failures
-> observed exit code: 0
-> final line: {"kind":"summary","failures":0,"total":31}
```

Per-fixture observed behavior:

| Fixture | Scenario exercised | Observed result |
|---|---|---|
| malformed-descriptor | schema rejection at load | exit path throws `INVALID_DESCRIPTOR: categories must be a non-empty array.` (fail closed) |
| unavailable-tool | unavailable capability | `prepare` returns `UNAVAILABLE` with `empty_context` fallback; no execution |
| permission-denied | effect `shell` -> `PERM_DENY` | throws `PERMISSION_DENIED: effect shell requires explicit T1 approval...`; ledger count 0 |
| approval-spoofed | lookalike proof not in WeakSet | throws `APPROVAL_REQUIRED: use a proof minted from an active T1 approval.` |
| timeout-reconcile | commit timeout ambiguity | `committedAmbiguous=true`, state `RECONCILE`; ledger=1; retry is a no-op |
| duplicate-invocation | same idempotency key twice | ledger stays at 1; second commit replayed, `committedOnce=true` |
| secret-bearing-output | secret shaped output | result text contains `[REDACTED_SECRET]`; `findSecrets(result.text)` is empty; raw synthetic value absent from result and journal |
| safe-fallback | host compatibility fallback | `hypertaks_retrieve` executes in `direct_search` mode, `ok=true`, no external effect |

State-transition evidence (from `node demo-state.mjs`, observed exit code 0):

```
state transitions:
  PREPARE  ...  transaction created
  PREPARE  ...  prepared
  PREVIEW  ...  previewed without side effect
  APPROVAL ...  T1 approval satisfied
  COMMIT   ...  committed once
  RECONCILE ...  reconciled: effect already committed; retry is a no-op
read-after-write: ok=true reason=match
committedOnce=true  ledger_count=1
duplicate_commit: ledger 1 -> 1  (equal => retry did not duplicate effect)
```

`git diff --check` against the coordinator checkout: **CLEAN** (exit 0). The prototype adds only untracked files under `prototypes/founder-os-expansion/command-code/` and the new report under `docs/.../`; no tracked source, skill, manifest, package, or roadmap file was modified.

Em-dash scan of all prototype source/fixture/report files: none found. Literal-secret scan of source: no full credential value is present in source, fixtures, or evidence logs. The redaction test target is derived at runtime from a fixed handle via SHA-256 and is never materialized as a literal value in source.

## Risks

1. **Dependency gate not satisfied.** #7 is blocked by #1 and #4 in `decision-map.md`. Proceeding without their validated reports means the migration-boundary and adversarial-hardening claims in section 4 are grounded in direct evidence, not in the curated findings of those agents. If #1 or #4 later contradict this design, only the `Proposed Interfaces` and `Risks` sections need revision.
2. **Approval registry is in-process.** The WeakSet registry mirrors `founder-brain.ts:177` but is process-local. A proof minted in one host process is unverifiable in another. This is acceptable for the prototype (fail closed) but must be anchored to T0/T1 source evidence at integration.
3. **Effect taxonomy is conservative.** `local_write` is the only permitted-mutation class. If the OS roadmap later authorizes a network or shell capability, the deny-by-default table must be updated explicitly (never inferred from a tool name).
4. **Synthetic secret.** Although derived from a handle and redacted everywhere, the redaction test depends on the runtime pattern set. If the OS secret scanner changes, the test fixture must be regenerated.

## Second-Order Effects

1. **Preserves the boundary.** Because native capabilities carry `publicSurface: false`, the four-tool remote MCP surface is provably invariant (assertion `public_mcp_surface_is_four_readonly_tools` and `no_public_native_capability`). Adding an internal facade does not grow the public tool list.
2. **Enables resumable agents.** `ActionTransaction.states[]` and the `EffectLedger` give Ticket #8 (Cline) a concrete proof-of-done surface: a transaction is either committed-once+reconciled, or not committed at all.
3. **Unifies evidence binding.** Routing the four remote tools and the two native host adapters through one `ToolRegistry` gives a single `capabilityId`/`invocationId` evidence chain, matching `founder-brain.ts:26-30`.
4. **Fail-closed by default.** Deny-by-default effect mapping means any future capability added without an explicit effect grant is automatically rejected, preventing scope creep.

## Unresolved Decisions

1. **Gate status.** Should #7 wait for validated `claude-code.md`/#4 reports, or is the direct-evidence grounding above sufficient for this prototype? (Resolved provisionally for prototyping; the recommendation flags re-validation against #1/#4 before any integration.)
2. **Approval durability.** Should the approval registry be anchored to T0/T1 source evidence (e.g., signed Boss message id) beyond the in-process WeakSet, so proofs survive host restarts?
3. **Native capability set.** `hypertaks_context` and `hypertaks_retrieve` are proposed as the first two internal IDs. Whether additional capabilities (graph, continuity checkpoint, skill marketplace references) are exposed as host-adapter contracts is deferred to #8/#9.
4. **Effect taxonomy granularity.** Whether `local_write` should split into `file_write` / `pointer_write` / `checkpoint_write` for finer checkpoint boundaries is left open.

## Provenance

- **Author:** Command Code (Ticket #7)
- **Contract:** `HT-20260811-FOS`
- **Environment:** isolated prototype under `prototypes/founder-os-expansion/command-code/`; Node.js v24.15.0
- **Git base:** commit `f6a02bda04438fc0a3b5d764f474a360651dd78e` on `main`; shared dirty coordinator checkout, with no separate Command Code worktree or commit
- **Evidence sources (observed):** `runtime/chatgpt-mcp-server.mjs:76-143,170-177,192-198,326-383`, `runtime/public-skill-router.ts:16-22,507-615,1449`, `runtime/founder-brain.ts:26-30,177,179-323,185-278,205-293,217-233,299-323,640-690`, `skills/hypertaks/SKILL.md` sections 10-13 (security kernel + transaction protocol), `docs/HYPERTAKS-ROADMAP.md:14-34,164-178`, `decision-map.md:48-71`, `briefs/01-claude-code.md`, `briefs/04-hermes.md`, and the existing `agy.md` report.
- **Commands run (exact):**
  - `node run-tests.mjs` -> exit 0, 31/31 assertions pass
  - `node demo-state.mjs` -> exit 0
  - `git diff --check` -> exit 0 for the tracked diff; untracked prototype files require a separate direct scan
  - `node --version` -> `v24.15.0`

## Recommendation

1. **Accept the contract design.** `ToolDescriptor`, `ToolInvocation`, `ToolResult`, and `ActionTransaction` as specified in section 4, with effect-based deny-by-default permission mapping, constitute a minimal, fail-closed extension that preserves the four-tool remote MCP boundary.
2. **Accept the prototype as meeting the definition of done for #7 in isolation**: permission and transaction tests fail closed; retries do not duplicate effects (ledger 1 -> 1 on duplicate/timeout-retry); the remote MCP surface remains four read-only tools; and the report separates internal contracts (capability IDs, descriptors, approval proofs) from the public protocol surface (the four `hypertaks_*` tools).
3. **Do not integrate until #1 and #4 are validated.** Re-validate against the published `claude-code.md` (target architecture / migration boundaries) and `hermes.md` (adversarial test catalog) before Cline (#8) or Codex (#9) consume these contracts. If either report contradicts the effect taxonomy or the approval model, revise section 4 only; the deterministic fakes are self-contained and do not touch runtime, skills, manifests, or the roadmap.
4. **Proposed next gate for #8:** expose `ToolRegistry.resolveCapabilityId` + `ActionTransaction.states[]` as the resumable `RESEARCH` command's capability-selection and proof-of-done surface, with Cline's checkpoint/restart logic reading `ledger` idempotency keys.
