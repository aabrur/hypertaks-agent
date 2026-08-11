# Ticket #2 Report: Evidence-Grounded Context And Retrieval Research

Contract: `HT-20260811-FOS`
Agent: Grok
Mode: EXECUTOR (`hypertaks_depth: 1`)
Access date: 2026-08-11
Deliverables: this report and `prototypes/founder-os-expansion/grok/`

## Current-State Findings

### Repository baseline (primary, local)

Hypertaks already defines a provider-neutral retrieval classification and evidence-pack model. The following are observed in tracked files, not proposed replacements.

From `skills/hypertaks/references/02-retrieval-and-evidence.md` and `runtime/router.ts`:

| Concept | Canonical values |
|---|---|
| Query class (`retrieval_need`) | `none`, `exact`, `semantic`, `mixed`, `structured`, `small_corpus`, `unavailable` |
| Route (`retrieval_route`) | `none`, `direct`, `keyword`, `vector`, `hybrid`, `fallback` |
| Pipeline stages | Need -> Scope -> Route -> Retrieve -> Fuse -> Boost -> Rerank -> Evaluate -> Evidence Pack -> Fallback |
| Fusion default posture | Prefer rank fusion (RRF-style) when score scales are incomparable; do not add raw scores without declared normalization |
| Exact-match rule | Exact IDs, codes, filenames, quoted phrases must not be outranked by close semantic neighbors without contract reason |
| Metrics named in skill | `Recall@k`, `HitRate@k`, `MRR`, `nDCG@k`, `ExactMatch@k`, latency, cost; label `UNVERIFIED` when unlabeled |
| Evidence pack fields | `query_id`, `retrieval_need`, `corpus_scope`, `retrieval_route`, `candidates`, `fusion`, `reranker`, `selected_evidence`, `retrieval_metrics`, `limitations`, `retrieval_fallback` |
| Tier discipline | Nano/Lite avoid hybrid and vector by default; hybrid requires mixed need or measured failure |

From `skills/hypertaks/references/01-state-and-transactions.md`:

- External side effects use action transactions: `PREPARE -> PREVIEW -> T1 APPROVAL -> COMMIT ONCE -> RECONCILE`.
- Timeouts are not failures; retries require read-after-write against `idempotency_key`.
- Irreversible effects cannot be rolled back; response is containment plus disclosure.
- State capsule carries `retrieval_need`, `retrieval_route`, `corpus_scope`, `retrieval_metrics`, `retrieval_fallback`.

From decision-map program boundary:

- Zero context loss is a measured objective, not an absolute guarantee.
- Graphify, Obsidian, embeddings, vector databases, hosted services, and daemons remain optional.
- Locked candidate contract families include context compilation, tool descriptors, and action transactions.

### External primary evidence (inspected 2026-08-11)

| ID | Source | Type | Pub. date | Authority | Claim supported | Material limitation |
|---|---|---|---|---|---|---|
| P1 | Liu et al., *Lost in the Middle: How Language Models Use Long Contexts*, arXiv:2307.03172; TACL 2023 | Research paper (abstract + metadata via arXiv abs + Atom API) | 2023-07-06 (v3 2023-11-20) | Peer-reviewed long-context evaluation (Stanford et al.) | Performance often peaks when relevant info is at beginning or end of context and degrades in the middle, even for long-context models | Full PDF body not fully transcribed here; position-bias magnitude is model- and task-dependent |
| P2 | Thakur et al., *BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models*, arXiv:2104.08663; NeurIPS 2021 Datasets | Research paper (abstract + metadata via arXiv abs + Atom API; page HTTP 200) | 2021-04-17 (v4 2021-10-21) | Standard zero-shot IR benchmark | BM25 is a robust zero-shot baseline; re-ranking and late-interaction often best average zero-shot but costly; dense/sparse often weaker OOD | Domain mix is fixed by BEIR datasets; does not prove project-specific ranking |
| P3 | Es et al., *Ragas: Automated Evaluation of Retrieval Augmented Generation*, arXiv:2309.15217 | Research paper (abstract + metadata; HTML page HTTP 200) | 2023-09-26 (v2 2025-04-28) | Widely used RAG evaluation framing | Separate dimensions: retrieval of relevant/focused passages, faithful use of passages, generation quality; reference-free metrics suite | LLM-as-judge bias and cost; not a substitute for labeled ExactMatch sets when identifiers matter |
| P4 | MCP Tools specification (Model Context Protocol, server tools page) | Vendor/open protocol docs | Spec rev 2025-11-25 | De facto portable tool protocol across hosts | Tools page reachable (HTTP 200 on link-check); portable tool surface is name/description/input schema over host messaging | Full normative body not fully transcribed in this run; line-level method claims remain `NEEDS VERIFICATION` for Ticket #7 if needed |
| P5 | JSON-RPC 2.0 Specification | Open standard | Historical (jsonrpc.org) | Portable RPC envelope | Spec URL HTTP 200; request/response/error identity supports host-neutral tool call envelopes | Not agent-specific; no approval or side-effect semantics |
| P6 | RFC 9111 HTTP Caching | IETF standard | Current HTTP caching RFC | Freshness and revalidation semantics | Spec URL HTTP 200; freshness lifetime, stale reuse, validators (ETag / Last-Modified) define portable invalidation patterns | HTTP cache model is analogous, not identical, to local evidence corpora |
| P7 | Cormack, Clarke, Buettcher, *Reciprocal Rank Fusion outperforms Condorcet and Individual Rank Learning Methods*, SIGIR 2009 | Research paper | 2009 | Foundational rank-fusion method | Author PDF URL HTTP 200; RRF combines rank lists without calibrated scores | PDF body not fully transcribed here; RRF recommendation also rests on local skill text; do not hardcode a universal `k` without measurement |

### Secondary discovery leads (not firm conclusions alone)

- Ragas docs (docs.ragas.io) expand faithfulness as supported-claims over total claims; treat as secondary documentation of the P3 metric family.
- ACM DOI for RRF (10.1145/1571941.1572114) and author PDF URL are discovery routes to P7.
- Blog and vendor pages about hybrid search were used only for URL discovery.

### Answers to research questions

#### 1. Context assembly patterns that preserve provenance and authority under token budgets

**Primary-backed:**

- Long contexts are not uniformly utilized (P1). Packing more tokens is not the same as preserving decision-critical facts. Position matters: critical authority, contract constraints, and exact identifiers should not be buried mid-window by bulk candidates.
- Hypertaks already separates evidence packs from raw candidate dumps and reuses one pack across roles. That is the right budget posture: retrieve candidates, select bound evidence, inject citations, not full corpora (local baseline).

**Patterns that extend the baseline without replacing it:**

1. **Authority-first assembly order.** Place Boss decisions, approved contract fields, workspace standards, and Git/state anchors before lower-authority memory or graph evidence. Local policy already ranks those above memory/graph.
2. **Provenance-bound chunks.** Every injected span carries source identity, retrieval route, rank, and optional score only when comparable. The evidence pack remains the machine-readable spine.
3. **Hard vs soft budget.** Hard budget: required fields (contract ID, permissions, exact IDs, selected citations) never drop silently. Soft budget: lower-rank candidates truncate with explicit drop records.
4. **Compress with citation retention.** Summarize supporting prose; keep exact tokens for identifiers and quoted constraints. Measure retention (`ExactMatch` for required tokens; citation ID retention), not "felt completeness."
5. **Abstention over hallucination.** When selected evidence cannot support a claim, mark `UNKNOWN` / abstain rather than filling from parametric memory.

**Inference (not primary):** Rehydrate the state capsule at phase boundaries under Hyper/Omega is already local protocol and remains the continuity pattern when windows compact.

#### 2. When routes outperform each other and deterministic fallback

| Need | Prefer | Outperforms when | Weak when |
|---|---|---|---|
| Exact IDs, codes, names, error strings | `keyword` / indexed exact | Token identity is the answer (local baseline; BM25 robustness in P2) | Paraphrase-only questions |
| Paraphrase / concept | `vector` (optional) | Synonymy and intent without shared tokens | Rare IDs, near-duplicate wrong symbols |
| Exact + semantic | `hybrid` + fusion + exact boost | Mixed queries (local baseline) | Score fusion without normalization |
| Known fields / filters | `structured` then rank | Tenant, date, type, status constraints (local baseline) | Filters applied after leaky rank |
| Few short files | `direct` | Corpus tiny; embedding overhead unjustified | Large repos |
| No access | `fallback` + explicit gap | Honest core reasoning (local baseline) | Silent invention of sources |

**Fusion:** Prefer reciprocal rank fusion when keyword and vector scores are incomparable (local skill + P7 discovery). Do not treat a specific `k` (often cited as 60) as universal without measurement.

**Deterministic fallback ladder (candidate requirement for Ticket #5):**

1. Preferred verified route for the classified need.
2. If optional vector/hybrid/rerank unavailable: keyword or direct with same `corpus_scope` and trust boundary.
3. If keyword fails and corpus is small enough: direct scan.
4. If corpus unavailable: `fallback` with `retrieval_metrics: UNVERIFIED` and explicit missing capability.
5. Never silently broaden tenant/trust scope or invent scores.

Fallback must be a pure function of `(query_class, availability_map, corpus_scope)`, not model whim.

#### 3. Evaluation methods covering relevance, faithfulness, freshness, exact-match retention, abstention

| Dimension | Method | Evidence |
|---|---|---|
| Retrieval relevance | Offline `Recall@k`, `HitRate@k`, `MRR`, `nDCG@k` on labeled sets; zero-shot suites such as BEIR for method comparison | Local skill metrics; P2 |
| Faithfulness | Claim decomposition vs retrieved context (RAGAS-style faithfulness) | P3 |
| Answer / context relevance | Separate answer-relevance and context-relevance proxies (RAGAS framing) | P3 |
| Exact-match retention | `ExactMatch@k` and post-compression required-token retention for IDs, contract fields, citation IDs | Local skill; extends P3 (RAGAS does not replace identifier checks) |
| Freshness | Corpus freshness window at scope time; record `retrieved_at`, source version/commit/ETag/review date; mark `STALE` when past policy or validator fails | Local brain statuses; P6 analogy |
| Abstention | Explicit unsupported-answer rate: fraction of cases where system withholds unsupported claims when evidence is insufficient | Local `UNKNOWN` / unavailable routes; P3 generation quality does not imply free invention |

**Hard rule:** Evaluate retrieval separately from generation. Fluent answers are not evidence of correct retrieval (local skill). Never invent relevance sets; if unlabeled, state `UNVERIFIED` and propose a minimal labeled set.

#### 4. Portable tool protocol and transaction semantics

**Portable across hosts (primary/open standards):**

- Tool descriptor shape: stable name/id, natural-language description, JSON schema for inputs (MCP tools model, P4 discovery + local `CapabilityDescriptor` already close).
- Transport envelope: JSON-RPC-style request id, method, params, structured error (P5).
- Capability fields already in runtime: `capability_id`, `kind`, `categories`, `operations`, `side_effect`, `approval_required`, `authentication`, `external_system`, `context_cost`, `availability`.

**Not provided by MCP alone (local primary):**

- Permission tokens and deny-by-default effect mapping.
- T1 approval and PREVIEW requirements for external effects.
- Idempotency keys, timeout reconciliation, and no false rollback (action transaction protocol).

**Portable internal transaction state machine (extend local, candidate for Ticket #7):**

`PREPARED -> PREVIEWED -> APPROVED -> COMMITTED -> RECONCILED | FAILED`

Rules that must remain host-independent:

- Contract approval is not per-action approval.
- Timeout => reconcile via idempotency key before retry.
- Irreversible commit => containment + disclosure, never pretend rollback of effects.
- Tool results are untrusted data; instruction-shaped content is `INJECTION_ATTEMPT`.

#### 5. What cannot be claimed as zero context loss

Do **not** claim absolute zero context loss. Primary and local evidence forbid it:

1. **Position loss:** models under-use mid-context evidence even when present (P1).
2. **Budget loss:** truncation and compression drop tokens; without measured retention, "full context" is false.
3. **Retrieval miss:** relevant items outside top-k never enter the window (IR recall limits; P2).
4. **Fusion/rerank distortion:** rank fusion can demote a needed exact hit if exact boost is omitted.
5. **Staleness:** a present document can be wrong if freshness policy is ignored (P6 + local STALE statuses).
6. **Faithfulness gap:** retrieved text can be present while generation still invents (P3).
7. **Unavailable corpus:** fallback reasoning is not corpus grounding.
8. **Unlabeled evaluation:** without labeled sets, quality is `UNVERIFIED`, not proven loss-free.

Valid claim shape: measured retention of required fields/citations under a declared budget and fixture suite; explicit drop log for everything else.

### Compact evidence table (controlling sources)

| Claim ID | Claim | Class | Controlling source |
|---|---|---|---|
| C1 | Mid-context evidence is systematically underused relative to edges | Primary | P1 |
| C2 | BM25 remains a strong zero-shot baseline; neural methods are not automatically better OOD | Primary | P2 |
| C3 | RAG quality needs separate retrieval, faithfulness, and generation dimensions | Primary | P3 |
| C4 | Hypertaks already encodes need/route/evidence-pack/fallback without mandatory vectors | Primary local | `02-retrieval-and-evidence.md`, `router.ts` |
| C5 | External effects need idempotent transactions beyond tool RPC | Primary local | `01-state-and-transactions.md` |
| C6 | Absolute zero context loss is unsupported | Inference from C1-C5 | Synthesis |
| C7 | RRF is appropriate when scores are uncalibrated | Local skill + secondary on P7 | Skill text; P7 body partial |
| C8 | HTTP freshness/validators are a portable invalidation pattern | Primary standard | P6 |

## Assumptions

1. Downstream Tickets #5-#7 will consume this pack as evidence constraints, not as a public API change.
2. Optional vector and rerank adapters may be absent; core keyword/direct paths must remain sufficient for deterministic prototypes.
3. "Primary" means inspected official paper/spec/local source content or verified abstracts and status codes on 2026-08-11; incomplete body captures are labeled.
4. No mandatory embedding model, vector database, hosted service, or daemon will be introduced by this research.
5. Search engines were discovery only; firm claims require the controlling source rows above.

## Proposed Interfaces

These are **candidate internal interfaces** that extend existing classifications. They do not replace public skills or the four remote MCP tools.

### 1. Evidence pack (extension of existing shape)

Keep all current fields. Add only optional measured fields:

```text
EvidencePack {
  // existing
  query_id, retrieval_need, corpus_scope, retrieval_route,
  candidates[], fusion, reranker, selected_evidence[],
  retrieval_metrics, limitations, retrieval_fallback

  // extensions for Tickets #5-#7
  authority_rank: enum boss_decision|contract|workspace_standard|repo_evidence|memory|graph|web
  provenance: { source_id, locator, retrieved_at, version_or_commit?, etag?, review_date? }
  freshness: { state: FRESH|STALE|UNVERIFIED, policy_id?, reason? }
  budget: { hard_tokens, soft_tokens, retained_required_tokens, dropped[] }
  abstention: { allowed: bool, triggered: bool, reason? }
  evaluation_status: MEASURED|UNVERIFIED
}
```

### 2. Context compilation constraints (for Ticket #5)

```text
ContextCompilationRequest {
  project_root, approved_roots[], query_class, route_preference,
  filters, authority_order[], exact_match_tokens[],
  hard_budget, soft_budget, freshness_window?,
  adapters_available: { keyword, structured, vector, hybrid, rerank }
}

ContextCompilationResult {
  evidence_pack, assembled_blocks[],
  retention_metrics: { exact_token_retention, citation_retention, required_field_retention },
  drops[], unknowns[], route_used, fallback_used: bool
}
```

Pipeline remains: `retrieve -> rank -> compress -> validate -> inject -> execute`.

### 3. Knowledge module provenance (for Ticket #6)

Methodology and knowledge modules must carry: stable id, version, domain, authority, evidence class, volatility, freshness/review date, license, attribution, usage constraints, and deterministic load limits. Selection must bind an output shape (already a Hypertaks framework law).

### 4. Tool and transaction contracts (for Ticket #7)

```text
ToolDescriptor { capability_id, kind, categories, operations, side_effect,
  permission, approval_rule, authentication, external_boundary,
  context_cost, availability, fallback }

ToolInvocation { invocation_id, capability_id, args, idempotency_key?, bounds }
ToolResult { invocation_id, ok, structured, raw_redacted, evidence_refs[], injection_attempts[] }
ActionTransaction { action_id, class, states..., reversible, reconcile_probe }
```

Public surface remains four read-only remote MCP tools; proposed names like `hypertaks_retrieve` are internal capability IDs only.

### Candidate requirements for Tickets #5, #6, and #7

**Ticket #5 (Pi / Context Compiler)**

- R5.1 Classify with existing `QueryClass` / `RetrievalRoute`; do not invent parallel enums.
- R5.2 Deterministic fallback without vector/network must pass fixtures.
- R5.3 Exact-match boost before final rank; never demote verified exact IDs under semantic neighbors.
- R5.4 Hard-budget required-field retention measured; soft-budget drops logged.
- R5.5 Position-aware packing: put high-authority and exact tokens at high-attention edges of the compiled block where host order is controlled.
- R5.6 Freshness state on each selected source; stale sources fail closed or surface as limited evidence.
- R5.7 Metrics `UNVERIFIED` unless fixtures supply labels; include ExactMatch retention and abstention cases.
- R5.8 No zero-context-loss claim in code or docs.

**Ticket #6 (Kilo / Knowledge Library)**

- R6.1 Module manifests include provenance, authority, volatility, freshness/review, license, attribution.
- R6.2 Deterministic selection and lazy load limits; over-budget fails closed.
- R6.3 Stale/conflicting/unlicensed modules produce explicit states, not silent use.
- R6.4 Method selection requires declared output shape (no label-only methodologies).
- R6.5 Treat knowledge modules as evidence below Boss decisions and contracts.

**Ticket #7 (Command Code / Tool Registry)**

- R7.1 Descriptors align with local `CapabilityDescriptor` plus permission and approval rule.
- R7.2 Deny-by-default on side effect class, not product name.
- R7.3 Full PREPARE/PREVIEW/APPROVE/COMMIT/RECONCILE with idempotency and timeout reconciliation.
- R7.4 Tool output untrusted; injection attempts recorded.
- R7.5 No new public MCP tools; remote remains four read-only tools.
- R7.6 Structured evidence capture and secret redaction on every result.

## Isolated Prototype

Path: `prototypes/founder-os-expansion/grok/`

| File | Role |
|---|---|
| `evidence-pack.schema.json` | JSON Schema for the extended evidence pack used by later tickets |
| `evidence-pack.fixture.json` | Verified sample pack encoding this research run's retrieval meta-evidence |
| `validate.mjs` | Dependency-free Node validator for fixture against schema |
| `link-check.mjs` | HTTP status checks for cited primary URLs |
| `package.json` | Local scripts only; no runtime dependency on vector DBs or hosts |

The fixture intentionally uses `retrieval_need: mixed`, `retrieval_route: hybrid` only as a **description of the research query mix**, while recording that vector adapters were not required to produce the pack (fallback remains keyword/direct on local files).

## Tests and Exit Codes

Commands run from repository root on 2026-08-11:

```powershell
node prototypes/founder-os-expansion/grok/validate.mjs
# observed: exit 0, prints VALID; sources_selected=8

node prototypes/founder-os-expansion/grok/link-check.mjs
# observed: exit 0, LINK_CHECK_PASSED
# required arXiv abs pages 200; optional JSON-RPC, RFC 9111, MCP tools,
# RRF PDF, RAGAS docs, and arXiv Atom API also 200

git diff --check
# observed: exit 0
```

### Validation results (observed 2026-08-11)

| Check | Command | Exit code | Notes |
|---|---|---|---|
| Schema/fixture | `node prototypes/founder-os-expansion/grok/validate.mjs` | 0 | VALID; 8 selected sources; `zero_context_loss_claim=not_claimed` |
| Link check | `node prototypes/founder-os-expansion/grok/link-check.mjs` | 0 | All required and optional URLs HTTP 200 |
| Diff whitespace | `git diff --check` | 0 | No whitespace errors |

## Risks

1. **Over-generalizing BEIR.** Zero-shot IR averages do not prove Hypertaks project-query ranking.
2. **LLM-as-judge eval.** RAGAS-style metrics can hide bias and still miss exact-ID failures.
3. **Protocol drift.** MCP revisions change; internal contracts must version descriptors.
4. **False zero-loss marketing.** Measuring retention is easy to overclaim as lossless context.
5. **Score fusion misuse.** Adding unnormalized keyword and vector scores silently corrupts ranks.
6. **Incomplete body captures.** Where PDF/spec body was not fully retrieved, conclusions stay within verified abstracts/local text.

## Second-Order Effects

1. Ticket #5 can ship a deterministic compiler without embeddings, reducing host coupling.
2. Ticket #6 provenance fields enable later audit and license hygiene without a hosted knowledge service.
3. Ticket #7 transaction rigor reduces duplicate external effects across multi-agent handoffs.
4. Explicit abstention and STALE states may lower answer fluency while raising Boss trust.
5. Position-aware packing may change prompt templates and evaluation fixtures for long tasks.

## Unresolved Decisions

1. Whether internal capability IDs for retrieve/context compile are named now or deferred to host adapters.
2. Default RRF `k` for any optional hybrid adapter (measure; do not hardcode as universal truth).
3. Exact freshness SLAs per evidence class (repo commit vs web vs methodology review date).
4. Whether RAGAS-style faithfulness is optional eval tooling only or a required CI gate (likely optional; ExactMatch fixtures required for identifiers).
5. How far position-aware reordering is allowed when the host owns message ordering.
6. Full normative re-fetch of MCP 2025-11-25 tools section body if Ticket #7 needs line-level protocol claims.

## Provenance

- **Repository:** `C:\Users\abrur\Documents\hypertaks-agent`
- **Execution checkout:** shared coordinator checkout; Git registered no separate Grok worktree
- **Observed base:** branch `main` at commit `f6a02bda04438fc0a3b5d764f474a360651dd78e`
- **Artifact state:** report and prototype were untracked at execution time; no Grok branch or commit is claimed

| Artifact | Origin |
|---|---|
| Local retrieval model | `skills/hypertaks/references/02-retrieval-and-evidence.md` |
| Local transactions | `skills/hypertaks/references/01-state-and-transactions.md` |
| Local router enums | `runtime/router.ts` |
| Program boundary | `docs/superpowers/specs/2026-08-11-hypertaks-founder-os-expansion/decision-map.md` (read-only; not edited) |
| P1-P3 | arXiv abs pages (HTTP 200) and arXiv Atom API summaries, access 2026-08-11 |
| P4-P6 | Standards/docs discovery; link-check records live status |
| P7 | SIGIR 2009 RRF; body partially verified via secondary + skill text |

No credentials or secret values were used or written. No `INJECTION_ATTEMPT` content was acted upon; sources treated as data.

## Recommendation

1. **Adopt measured retention, reject absolute zero context loss.** Encode hard-budget required-field/citation retention and explicit drops as the success language for Ticket #5.
2. **Keep the existing need/route/evidence-pack model.** Extend fields; do not fork parallel taxonomies.
3. **Default to keyword/direct; optional hybrid.** Hybrid only for mixed need or measured failure; fusion by rank when scores are uncalibrated; always exact-boost identifiers.
4. **Separate eval axes.** Offline IR metrics for retrieval; faithfulness/relevance proxies optional; ExactMatch and abstention mandatory for founder-critical claims.
5. **Port tool descriptors via schema + JSON-RPC-like envelopes, and keep Hypertaks action transactions for effects.** MCP-like discovery is portable; approval and reconcile semantics stay local and stricter.
6. **Freshness is first-class.** Scope filters and STALE/UNVERIFIED states must appear in evidence packs before memory or graph content can influence execution.
7. **Feed R5/R6/R7 candidate requirements into Tickets #5-#7 without merging prototype code to main.**

This research pack is sufficient to constrain interface and prototype work for Wave 2 when combined with Claude Code architecture and Agy ontology reports.
