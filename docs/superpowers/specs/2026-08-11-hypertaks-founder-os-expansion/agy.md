# Ticket #3 Report: Project Operating Context and Typed Ontology (Agy)

Contract: `HT-20260811-FOS`
Agent: Agy
Status: PROTOTYPED
Date: 2026-08-11

## Current-State Findings

Based on inspection of the codebase (`runtime/founder-brain.ts`, `runtime/public-skill-router.ts`, `skills/hypertaks/`, `skills/hypertaks-brain/`, `skills/hypertaks-continuity/`, `skills/hypertaks-graph/`, and `skills/hypertaks-verify/`):

1. **Memory & Continuity Architecture**: The current system manages founder memory via `founder-brain.ts` and skill-level state files in `.agents/` or Obsidian vaults. Session state and handoffs are managed by `hypertaks-continuity`.
2. **Missing Operating Context Formalism**: Existing memory stores lack a typed, multi-document Project Operating Context specification that enforces a fixed document inventory, schema validation, graph relation constraints, and non-destructive contradiction retention.
3. **Security & Persistence Boundary**: File persistence paths currently rely on ad-hoc file writes without a unified security kernel that guarantees canonical root containment, secret scanning, and atomic read-after-write reconciliation.

## Assumptions

1. **Contract Boundary**: Contract `HT-20260811-FOS` governs this prototype under EXECUTOR MODE with `hypertaks_depth: 1`. No live subagent allocation or public skill additions are permitted.
2. **Preserved Document Requirement**: The file `prompt-build-continunity-prompt.ctx.md` is an immutable specification requirement and must serve as Document 13 of the exact 13 context documents without renaming or aliasing.
3. **Thirteen-File Count Scope**: The exact thirteen-file constraint applies strictly to the Project Operating Context documents (`*.ctx.md` in `context/`). Validator code, JSON schemas, fixtures, and reports are supporting prototype assets.
4. **Standalone Runtime**: Node.js (v24.15.0) and Python (3.11.15) standard libraries provide all required runtime capabilities. No external npm or pip dependencies are required.

## Proposed Interfaces

### 1. ProjectContextManifest Schema (`manifest.schema.json`)
Declares the master contract `HT-20260811-FOS`, document inventory (13 documents), approved root path, and security policy requirements.

### 2. ContextDocument Header Schema (`context-doc.schema.json`)
Enforces mandatory YAML frontmatter attributes for every `.ctx.md` document:
- `id`: Canonical identifier (`CTX-[NAME]`)
- `version`: Semantic version string
- `timestamp`: ISO 8601 creation/update timestamp
- `evidence_class`: Canonical authority classification (`T0_SYSTEM` through `T6_GENERATED`)
- `provenance`: Object containing `agent_id`, `source_file`, `contract_id`
- `source_git_state`: Object containing `commit_sha`, `branch`, `clean_tree`
- `authority`: Integer authority rank (0 to 6)
- `freshness`: Lifecycle classification (`FRESH`, `STALE`, `DEPRECATED`, `HISTORICAL`)
- `status`: Active state (`ACTIVE`, `CONTRADICTED`, `SUPERSEDED`, `ARCHIVED`)
- `lifecycle_state`: Workflow state (`DRAFT`, `PROPOSED`, `VERIFIED`, `COMMITTED`, `RETIRED`)

### 3. OntologyEvent Schema (`event.schema.json`)
Defines append-only mutation events for typed graph state:
- `EVENT_CREATE_ENTITY`: Registers new `ProjectEntity` (`ENT_BOSS`, `ENT_SPECIALIST`, `ENT_CONTRACT`, `ENT_TASK`, `ENT_ARTIFACT`, `ENT_EVIDENCE_RECORD`, `ENT_CONTRADICTION`, `ENT_CHECKPOINT`).
- `EVENT_UPDATE_ENTITY`: Appends attribute deltas without destructive overwrite.
- `EVENT_RELATE_ENTITIES`: Adds directed edges (`REL_AUTHORIZES`, `REL_EXECUTES`, `REL_PRODUCES`, `REL_DEPENDS_ON`, `REL_VERIFIES`, `REL_CONTRADICTS`, `REL_SUPERSEDES`).
- `EVENT_CONTRADICT_FACT`: Records conflicts into `06-contradiction-log.ctx.md` without node deletion.
- `EVENT_INVALIDATE_FACT`: Marks superseded facts.
- `EVENT_ARCHIVE_FACT`: Moves retired nodes to historical status.
- `EVENT_RECONCILE_STATE`: Replays event ledger sequentially to build graph state.

### 4. Graph Query Engine Interface
- `get_entity(id)`: Resolves entity state and active attributes.
- `get_relations(entity_id, relation_type)`: Fetches incoming and outgoing edges.
- `find_contradictions(entity_id)`: Retrieves active and historical contradiction records.
- `trace_provenance(entity_id)`: Traverses provenance links back to source evidence.

### 5. Security Kernel Interface
- `validatePathContainment(targetPath, approvedRoot)`: Enforces realpath root containment.
- `scanForSecrets(content)`: Rejects credentials matching forbidden patterns.
- `atomicWriteFile(targetPath, content, approvedRoot)`: Performs atomic write with SHA-256 hash reconciliation.

## Isolated Prototype

The prototype is located entirely within `prototypes/founder-os-expansion/agy/`:

```
prototypes/founder-os-expansion/agy/
  ├── context/
  │     ├── 01-manifest.ctx.md
  │     ├── 02-architecture-boundary.ctx.md
  │     ├── 03-domain-ontology.ctx.md
  │     ├── 04-relation-constraints.ctx.md
  │     ├── 05-event-ledger.ctx.md
  │     ├── 06-contradiction-log.ctx.md
  │     ├── 07-evidence-binding.ctx.md
  │     ├── 08-security-kernel.ctx.md
  │     ├── 09-retrieval-router.ctx.md
  │     ├── 10-founder-brain-state.ctx.md
  │     ├── 11-verification-checkpoints.ctx.md
  │     ├── 12-execution-profiles.ctx.md
  │     └── prompt-build-continunity-prompt.ctx.md
  ├── schemas/
  │     ├── manifest.schema.json
  │     ├── context-doc.schema.json
  │     └── event.schema.json
  ├── fixtures/
  │     ├── invalid-secret.ctx.md
  │     ├── invalid-cycle-relation.json
  │     └── sample-events.json
  └── validator.mjs
```

### Exact Thirteen-File Context Document Justifications

1. `01-manifest.ctx.md`: ProjectContextManifest inventory, document listing, and security policy declaration.
2. `02-architecture-boundary.ctx.md`: Public skill surface (5 skills) and remote MCP tool definitions.
3. `03-domain-ontology.ctx.md`: Core domain entity schemas and property constraints.
4. `04-relation-constraints.ctx.md`: Relation types, cardinality rules, and acyclic dependency invariants.
5. `05-event-ledger.ctx.md`: Append-only event stream specification for graph mutations.
6. `06-contradiction-log.ctx.md`: Non-destructive contradiction retention protocol.
7. `07-evidence-binding.ctx.md`: Evidence class hierarchy (`T0` to `T6`) and authority ranking.
8. `08-security-kernel.ctx.md`: Path containment, secret scanning, and atomic write specifications.
9. `09-retrieval-router.ctx.md`: Retrieval query execution and freshness decay algorithms.
10. `10-founder-brain-state.ctx.md`: Founder memory lifecycle states and integration rules.
11. `11-verification-checkpoints.ctx.md`: Resumable checkpoint schema and proof-of-done criteria.
12. `12-execution-profiles.ctx.md`: Specialist agent allocation profiles and tier execution bounds.
13. `prompt-build-continunity-prompt.ctx.md`: Preserved prompt specification document for project context continuity.

## Tests and Exit Codes

All tests were executed against `prototypes/founder-os-expansion/agy/validator.mjs`:

1. **Full Suite Execution**:
   - Command: `node validator.mjs all`
   - Observed Exit Code: `0`
   - Output: Validated 13 context documents, secret rejection, path containment, atomic write hash reconciliation, event replay (6 events), contradiction retention (1 record), and cycle rejection.

2. **Thirteen-File Count & Schema Test**:
   - Command: `node validator.mjs count`
   - Observed Exit Code: `0`
   - Output: Verified exact 13 `.ctx.md` files and frontmatter schemas.

3. **Secret Scanning Rejection Test**:
   - Command: `node validator.mjs secrets`
   - Observed Exit Code: `0`
   - Output: Correctly caught and rejected AWS credential in `fixtures/invalid-secret.ctx.md`.

4. **Path Containment & Escape Test**:
   - Command: `node validator.mjs containment`
   - Observed Exit Code: `0`
   - Output: Correctly blocked path traversal attempt escaping prototype root.

5. **Atomic Write & Reconciliation Test**:
   - Command: `node validator.mjs atomic`
   - Observed Exit Code: `0`
   - Output: Verified atomic temporary write, SHA-256 hash match, and atomic rename.

6. **Event Replay & Contradiction Test**:
   - Command: `node validator.mjs events`
   - Observed Exit Code: `0`
   - Output: Replayed 6 append-only events, verified entity/relation graph, and retained contradiction without node deletion.

7. **Acyclic Relation Constraint Test**:
   - Command: `node validator.mjs cycles`
   - Observed Exit Code: `0`
   - Output: Correctly detected and rejected cycle in `REL_DEPENDS_ON` relation stream.

8. **Git Check**:
   - Command: `git diff --check`
   - Observed Exit Code: `0`
   - Output: Clean execution, no whitespace or line ending issues.

## Risks

1. **Schema Evolution Risk**: Future updates to domain entities may require schema migrations. Mitigation: Versioned frontmatter (`version: 1.0.0`) and schema validation on load.
2. **Path Traversal on Windows Junctions**: Complex symlinks or junctions could bypass basic path checks. Mitigation: Enforced `realpathSync` resolution against the canonical approved root.
3. **Event Ledger Growth**: Large event ledgers can slow replay performance. Mitigation: Periodic state snapshots recorded at verification checkpoints (`11-verification-checkpoints.ctx.md`).

## Second-Order Effects

1. **Improved Handoff Integrity**: Standardizing context on 13 typed documents guarantees consistent context structure across external agent waves (Pi, Cline, Codex).
2. **Zero Loss of Conflicting Evidence**: Preserving contradictions explicitly in `06-contradiction-log.ctx.md` prevents silent overwrites during multi-agent consensus building.
3. **Strict Containment**: Security kernel rules ensure external agent work remains strictly contained within approved project roots.

## Unresolved Decisions

1. **Snapshot Frequency**: Defining the exact event threshold (e.g. 50 events vs 100 events) for generating state snapshots during long-running tasks.
2. **Custom Property Validation**: Determining whether domain-specific entity properties should require strict JSON schemas or permit open-ended key-value pairs under strict type tags.

## Provenance

- **Author**: Agent Agy (Ticket #3)
- **Contract**: `HT-20260811-FOS`
- **Environment**: Shared coordinator checkout `C:\Users\abrur\Documents\hypertaks-agent`; Git registered no separate Agy worktree
- **Git Commit**: `f6a02bda04438fc0a3b5d764f474a360651dd78e` on `main`
- **Execution Date**: 2026-08-11

## Recommendation

1. **Approve Prototype**: Accept the 13-file Project Operating Context design and `validator.mjs` test runner as meeting all requirements for Ticket #3.
2. **Supply Outputs to Wave 2**: Make `agy.md` available to downstream dependent tickets (Pi #5, Cline #8, Codex #9).
