# Hypertaks Skill Card

**Version:** 0.0.4.5.13

## Release status

**Public release (`v0.0.4.5.13`) - repository behavioral ledger `EV-01`..`EV-88` Boss-confirmed PASS; static and runtime engineering gates green.**

- Structural eval definitions: `90` (`EV-01` through `EV-90`, `90/90` static `GREEN`)
- Boss-confirmed behavioral ledger (`evals/results.yaml`): `88/88` Behavioral `PASS` across `EV-01` through `EV-88` (release threshold `80`, margin `+8`, `0` documented non-PASS)
- V2 runtime and architectural eval assertions (`npm run test:v2`): `EV-91` through `EV-112` automated `PASS` (`94/94` subtests across 18 suites)
- Static `GREEN` (`EV-89`, `EV-90`) and CI runtime checks remain structural and engineering evidence distinct from live multi-host behavioral transcripts.

This status does not claim formal third-party certification, absolute security,
or guaranteed outcomes.

## Description

Hypertaks is a Founder Operating System that turns the host AI into an
accountable operator and integrator for founder-shaped work across business,
engineering, marketing, finance, ERP, supply chain, smart contracts, data, and
IoT. The Boss remains the final human authority. The Founder owns framing,
contract integrity, specialist coordination, capability relevance, continuity,
evidence, risk awareness, and final result quality.

The mandatory loop is Intake and Verify, Frame, Pick Roles, Equip, Produce, and
Integrate and Deliver. Tiered allocation scales from Nano through Omega. The
system separates the Boss's objective from the proposed method, protects
business health, remembers verified founder context, and fails loud when
evidence or capability is missing.

## Public skill surface

Hypertaks exposes exactly five public skills:

1. `hypertaks`
2. `hypertaks-verify`
3. `hypertaks-brain`
4. `hypertaks-graph`
5. `hypertaks-continuity`

The main skill remains the default Founder Operating System entry point. The
four focused skills handle setup, durable memory, structural code intelligence,
and session continuity.

## Core systems

- **Safety Kernel:** source-bound authority, enumerated permissions, secret
  handling, action transactions, idempotency, and containment.
- **Contract Integrity Gate:** original request, desired outcome, proposed
  method, evidence, missing data, process, destination, validation evidence,
  permissions, and explicit activation.
- **Founder Brain:** evidence-backed agent-private, project, and shared memory
  with repository and Boss-approval provenance.
- **Verification Engine:** discovers an existing main brain or shared memory,
  previews approved destinations, and validates optional Obsidian and Graphify
  capability boundaries.
- **Continuity Engine:** Git-aware checkpoint, resume, handoff, reconciliation,
  and proof of done.
- **Graph Intelligence Router:** optional verified Graphify stdio MCP, shared
  HTTPS MCP, or local command, with direct repository search fallback.
- **Retrieval Intelligence Router:** exact, semantic, mixed, structured,
  small-corpus, and unavailable need classes with direct, keyword, vector,
  hybrid, fusion, reranking, evaluation, evidence packs, and fallback.
- **Capability Relevance Router:** smallest sufficient verified skills, native
  tools, MCP tools, and connectors inside approved permissions.
- **Professional Execution Profiles:** Python, Matplotlib, TypeScript, UI/UX,
  and image generation with run and artifact evidence.
- **Visual Necessity Router:** required, recommended, optional, or not-needed
  visual status and precision-aware medium selection.
- **Token Discipline:** separate gate, retrieval, production, and verification
  budgets with proportional Nano and Lite behavior, plus conditional Phase 2/3 reading.
- **Public Skill Router (`a2.3`):** deterministic EN/ID bilingual routing with
  cross-locale negation isolation (`CROSS_LINGUAL_TECH_PHRASES`), brain idiom
  exclusions (`BRAIN_IDIOM_EXCLUSIONS`), and decision record disambiguation
  (`DECISION_RECORD_NOUNS`).
- **14-File Project Operating Context & Verification (`context verify`):** `<namefile>ctx.md`
  project context architecture (including `verificationctx.md`) with 5-layer
  validation (`STRUCTURAL`, `EVIDENCE`, `FRESHNESS`, `INTEGRITY`, `CONSISTENCY`).
- **Local Structural Graph Engine:** `runtime/repository-intelligence/local-graph.ts`,
  `deep-scanner.ts`, and `incremental-refresh.ts` for offline AST/symbol/import
  blast-radius analysis and hash-based staleness tracking.
- **Orchestrator V2 & Capability Engine:** persistent DAG wave execution with
  `resumeWaveExecution()` and `BLOCKED` propagation (`runtime/orchestrator-v2/`),
  paired with `runtime/capability-engine.ts`, live REA stdio MCP client
  (`runtime/mcp-stdio-client.ts`), and 6-tier binary fallback chain.

## Requirements and dependencies

- No mandatory external integration.
- No bundled vector database, embedding model, reranker, MCP server,
  credential, hosted memory service, or resident daemon.
- Graphify, Obsidian, MCP, and persistent memory are optional.
- Optional host capabilities are discovered only when the approved task needs
  them.
- TypeScript and Node type definitions are development dependencies for the
  reference runtime; the skills remain file-based and portable.
- Matplotlib is used by the optional retrieval report utility.

## Authority and storage boundaries

- Active system policy and Boss decisions outrank memory and graph output.
- Current repository evidence invalidates stale branch, commit, path, or hash
  references.
- Shared memory accepts only verified repository facts or decisions tied to a
  valid T1 Boss approval proof.
- Every persisted path is resolved inside an approved root.
- Raw credentials, private keys, bearer tokens, connection strings, and secret
  values are blocked or redacted.
- Existing custom brains remain user-owned and are referenced rather than
  copied or reorganized.
- Obsidian support is approved Vault filesystem storage. Hypertaks never
  modifies `.obsidian/`.

## Key risks and mitigations

- **Memory injection:** classify memory as evidence below active authority.
- **Arbitrary file writes:** validate identifiers and enforce canonical
  approved-root containment before every write.
- **Fabricated Boss approval:** accept only approval proofs minted from an active
  T1 contract activation.
- **Stale memory:** bind repository evidence to repository, branch, commit,
  tracked path, and content hash.
- **Secret leakage:** scan full serialized artifacts and redact handoffs.
- **False Graphify success:** return success only after a real executor, local
  command, or direct search runs.
- **False completion:** require current test and acceptance evidence for proof of
  done.
- **Retrieval over-engineering:** classify the query and use direct search for a
  small corpus; hybrid and reranking require evidence.
- **Tool and plugin sprawl:** derive need before discovery and reject unrelated
  capabilities.
- **Token bloat:** create no brain, checkpoint, or graph work for harmless Nano
  requests.

## Canonical references

- `references/00-security-kernel.md`
- `references/01-state-and-transactions.md`
- `references/02-retrieval-and-evidence.md`
- `references/03-professional-execution.md`
- `references/04-visual-delivery.md`
- `references/intake-protocol.md`
- `references/agent-roles.md`
- `references/plugins-and-mcp.md`
- `references/frameworks.md`
- `references/knowledge-base.md`
- `references/engineering.md`
- `references/token-discipline.md`
- `../hypertaks-verify/SKILL.md`
- `../hypertaks-brain/SKILL.md`
- `../hypertaks-graph/SKILL.md`
- `../hypertaks-continuity/SKILL.md`
- `assets/agent-brief-template.md`
- `assets/contract-schema.yaml`
- `assets/deliverable-template.md`

## Output

- One contract-bound founder-grade deliverable.
- Verified founder context when durable memory is appropriate.
- Framework output shapes when applicable.
- Retrieval and graph evidence with honest mode and freshness status.
- Checkpoints and handoffs that preserve Git state, permissions, blockers, and
  next action.
- Proof-of-done status derived from current tests and acceptance evidence.
- Validated tables, charts, diagrams, UI artifacts, or generated images when
  required by the contract.
- Compliance footer and work log.

## Work log

`2026-11-13 | Hypertaks v0.0.4.5.13: repository cleanup removing 154 obsolete reports, briefs, audits, plans, and superseded prototypes; repaired stale skill-card, eval evidence, and README links; synchronized 22-host metadata.`
`2026-11-13 | Hypertaks v0.0.4.5.12: router a2.3 cross-locale negation isolation, 14-file <namefile>ctx.md operating context + 5-layer verification, local structural graph, Orchestrator V2 DAG resume, live REA stdio integration, and synchronized 5-part version metadata.`
`2026-09-08 | Hypertaks v4.5.7 maintenance release: canonical naming guidance and synchronized active release metadata with the legacy logo filename retained for compatibility.`
`2026-08-31 | Hypertaks v4.5.6 patch release: private authorization registry encapsulation and removal of public activation injection APIs.`
`2026-08-31 | Hypertaks v4.5.5 patch release: trusted workspace write capability provenance, direct bootstrap bypass closure, and dedicated POC regression suite.`
`2026-08-31 | Hypertaks v4.5.4 public release: hardened authorization, POC evidence truthfulness, intake protocol consistency, and release metadata synchronization.`
`2026-08-11 | Hypertaks v4.5.2 public release: founder-grade README, synchronized live product records, and a non-production Founder OS expansion lab with audited prototypes, canonical authority classes, resumable RESEARCH evidence, and explicit production no-go boundaries.`

`2026-07-25 | Hypertaks v4.5.1 release candidate: exactly five public skills, secure founder memory, optional Graphify and Obsidian integration, Git-aware continuity, proof of done, runtime hardening, and EV-66 through EV-88.`
