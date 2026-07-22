# Retrieval Intelligence and Evidence

Use this reference when a deliverable depends on finding information across
files, repositories, knowledge bases, databases, web sources, or connected
systems. Retrieval is a capability choice, not a synonym for vector search.
Choose the smallest route that can answer the approved question.

Stages: **Need -> Scope -> Route -> Retrieve -> Fuse -> Boost -> Rerank ->
Evaluate -> Evidence Pack -> Fallback.**

## 1. Need and query classification

Classify the query before discovering tools:

| Query class | Signals | Preferred route |
|---|---|---|
| **Exact** | IDs, SKUs, filenames, symbols, error codes, quoted phrases, proper names | Keyword, literal, regex, or indexed exact match |
| **Semantic** | Paraphrase, synonyms, concepts, natural-language intent, multilingual meaning | Vector or semantic search |
| **Mixed** | Exact identifiers plus descriptive intent, or a corpus with both query types | Hybrid keyword plus vector |
| **Structured** | Known fields, date ranges, tenant IDs, status, language, document type | Metadata or database filter before ranking |
| **Small corpus** | A few short files that fit a direct read or focused grep | Direct scan; avoid embedding overhead |
| **Unavailable** | No verified route or no access to the required corpus | Core reasoning on supplied inputs plus an explicit gap |

Do not choose hybrid merely because two retrievers are available. Mixed need,
measured quality, or a known mirror-image failure mode must justify it.

## 2. Scope before scoring

Constrain the candidate universe before retrieval whenever the contract provides
reliable metadata:

- tenant or customer boundary;
- repository, folder, collection, or database;
- date or freshness window;
- language;
- document type;
- access classification;
- product, project, or business unit;
- trusted source class.

Metadata filters are security and relevance controls. They are not optional
ranking decoration. A multi-tenant system must filter tenant identity before
retrieval so ranking cannot leak another tenant's content.

## 3. Keyword retrieval

Use keyword retrieval when token identity matters. It is strongest for exact
terms, rare words, IDs, codes, names, and jargon. Acceptable implementations
include focused grep, full-text indexes, inverted indexes, and BM25-style
ranking.

When a configurable BM25 implementation is verified, treat the following as
measured tuning inputs rather than folklore:

- term-frequency saturation;
- document-length normalization;
- analyzer and tokenization behavior;
- stemming or lemmatization;
- stop-word policy;
- field boosts;
- top-k candidate count.

Analyzer behavior must match at index time and query time. Record the exact
configuration when it affects a material result.

## 4. Vector retrieval

Use vector retrieval when meaning matters more than exact token overlap. It is
strongest for paraphrase, synonyms, conceptual questions, typo tolerance, and
multilingual meaning when the verified model supports the languages involved.

Before relying on vector results, record where available:

- embedding capability identifier;
- vector dimension and normalization behavior;
- similarity metric;
- index type;
- search-effort parameter;
- top-k candidate count;
- chunk identity and source metadata;
- model or index version supplied by the host.

Do not invent model names, dimensions, index parameters, or accuracy. Treat
close-but-wrong semantic matches as a known failure mode.

## 5. Hybrid retrieval and fusion

Hybrid retrieval runs independent keyword and vector routes, then combines the
ranked candidates. Raw keyword and vector scores often live on incompatible
scales. Do not add them directly without an explicit normalization method.

Prefer rank fusion when score calibration is unknown. Reciprocal Rank Fusion
uses rank position rather than raw score:

`RRF(document) = sum over lists [1 / (k + rank_i(document))]`

The constant `k` is a tuning input. Do not claim a universal optimum. Record the
value and evaluate it against the task's query set.

Score fusion is acceptable only when normalization is defined, outliers are
handled, and the blend weight is tuned against evidence. Record the formula and
weight.

## 6. Exact-match boosting

When a query contains an ID, code, filename, quoted phrase, or other exact token,
apply a declared exact-match rule before final ranking. Options include:

- route exact-only queries directly to keyword search;
- boost exact lexical matches in the fused list;
- pin a verified exact match above semantic candidates;
- require an exact field filter for identifiers.

Never let a semantically similar but different identifier outrank a verified
exact identifier without a contract-specific reason.

## 7. Reranking

Use reranking when the first-stage retriever returns enough plausible candidates
that topical similarity may hide answer relevance. A reranker must be verified
available and permitted. It reads the query and each candidate together and
returns a new relevance order.

Reranking is justified when:

- candidate ambiguity is material;
- retrieval quality has a close-but-wrong failure pattern;
- the candidate set is bounded;
- latency and cost fit the contract;
- the reranker can be evaluated independently.

Do not rerank a tiny exact-match result set, every document in a large corpus,
or a query whose correct answer is already uniquely identified.

## 8. Retrieval evaluation

Evaluate retrieval separately from generation. A fluent answer cannot prove the
right evidence was retrieved.

Minimum metric shapes:

| Metric | Meaning | Required inputs |
|---|---|---|
| `Recall@k` | share of relevant items found in the first k results | relevant item set and ranked results |
| `HitRate@k` | whether at least one relevant item appears in the first k | relevant item set and ranked results |
| `MRR` | reciprocal rank of the first relevant result, averaged across queries | first relevant rank per query |
| `nDCG@k` | gain from relevant items weighted by rank and optional graded relevance | relevance grades and ranked results |
| `ExactMatch@k` | whether a required exact identifier appears in the first k | expected exact item and ranked results |
| `Latency` | retrieval and reranking duration | measured timestamps |
| `Cost` | attributable query cost when the host exposes it | measured or sourced billing data |

Never invent a relevance set. When no labeled or reviewed query set exists,
state that retrieval quality is `UNVERIFIED` and propose a minimal evaluation
set. Do not replace evaluation with anecdotes.

## 9. Evidence pack output shape

Each material retrieval route returns an evidence pack:

| Field | Required content |
|---|---|
| `query_id` | stable identifier for the evaluation or user query |
| `retrieval_need` | exact, semantic, mixed, structured, small-corpus, or unavailable |
| `corpus_scope` | collection, filters, freshness window, and trust boundary |
| `retrieval_route` | direct, keyword, vector, hybrid, or fallback |
| `candidates` | source identity, rank, and score only when comparable and supplied |
| `fusion` | none, rank fusion, or defined score fusion |
| `reranker` | verified capability identifier or none |
| `selected_evidence` | source identity and why it answers the question |
| `retrieval_metrics` | measured values or `UNVERIFIED` |
| `limitations` | access, freshness, labeling, latency, cost, or model limitations |
| `retrieval_fallback` | core route or exact next input when the preferred route fails |

The final answer cites selected evidence. Candidate volume is not evidence
quality.

## 10. Capability binding

Use `references/plugins-and-mcp.md` after the route is known. Bind only the
verified capability categories needed by that route, such as local text search,
structured query, embedding search, reranking, or web retrieval. A preferred
route that is unavailable becomes a fallback, not an invented tool.

## 11. Token discipline

- **Nano:** direct answer or direct supplied-context lookup only. No corpus scan,
  embedding, reranking, or retrieval evaluation unless the request explicitly
  requires it.
- **Lite:** one focused direct or keyword route. Use vector only when semantic
  mismatch is the actual problem.
- **Standard:** one primary route plus focused validation; hybrid only for mixed
  need.
- **Prime and Hyper:** hybrid, reranking, and evaluation are allowed when the
  contract names the quality, latency, and evidence need.
- Reuse one evidence pack across roles. Do not paste raw retrieved documents into
  every brief.
- Retrieve candidate chunks, not entire corpora, unless direct reading is the
  selected small-corpus route.

## 12. Failure and fallback

If retrieval fails:

1. Preserve the exact error or missing capability.
2. Try one lower-cost route that can still answer the same approved question.
3. Do not silently broaden scope or query a different trust boundary.
4. Mark unsupported claims `UNKNOWN`.
5. State the minimum data, access, or labeled set needed to complete the task.
6. Never fabricate a source, record, result, score, metric, or citation.
