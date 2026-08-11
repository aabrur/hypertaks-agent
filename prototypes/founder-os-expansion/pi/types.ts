export type QueryClass =
  | "none"
  | "exact"
  | "semantic"
  | "mixed"
  | "structured"
  | "small_corpus"
  | "unavailable";

export type RetrievalRoute =
  | "none"
  | "direct"
  | "keyword"
  | "vector"
  | "hybrid"
  | "fallback";

export type EvidenceClass =
  | "T0_SYSTEM"
  | "T1_BOSS_DECISION"
  | "T2_WORKSPACE_STANDARD"
  | "T3_CONTRACT"
  | "T4_REPO_EVIDENCE"
  | "T5_EXTERNAL_DATA"
  | "T6_GENERATED";

export type FreshnessState = "FRESH" | "STALE" | "DEPRECATED" | "HISTORICAL" | "UNVERIFIED";

export type RetrievalAdapter =
  | "keyword"
  | "structured"
  | "vector"
  | "hybrid"
  | "rerank"
  | "direct";

export interface Provenance {
  readonly source_id: string;
  readonly locator: string;
  readonly retrieved_at: string;
  readonly version_or_commit?: string;
  readonly etag?: string;
  readonly review_date?: string;
}

export interface CorpusScope {
  readonly collections: readonly string[];
  readonly filters: Record<string, unknown>;
  readonly freshness_window_days?: number;
  readonly trust_boundary: string;
}

export interface GitState {
  readonly commit_sha: string;
  readonly branch: string;
  readonly clean_tree: boolean;
}

export interface ExactMatchToken {
  readonly token: string;
  readonly type: "id" | "code" | "filename" | "quoted_phrase" | "proper_name" | "error_code";
  readonly required: boolean;
}

export interface ContextCompilationRequest {
  readonly request_id: string;
  readonly project_root: string;
  readonly approved_roots: readonly string[];
  readonly query: string;
  readonly query_class: QueryClass;
  readonly route_preference: RetrievalRoute;
  readonly corpus_scope: CorpusScope;
  readonly authority_order: readonly EvidenceClass[];
  readonly exact_match_tokens: readonly ExactMatchToken[];
  readonly hard_budget: number;
  readonly soft_budget: number;
  readonly freshness_window_days?: number;
  readonly adapters_available: {
    readonly keyword: boolean;
    readonly structured: boolean;
    readonly vector: boolean;
    readonly hybrid: boolean;
    readonly rerank: boolean;
    readonly direct: boolean;
  };
  readonly git_state: GitState;
}

export interface CandidateEvidence {
  readonly source_id: string;
  readonly content: string;
  readonly rank: number;
  readonly score?: number;
  readonly retrieval_route: RetrievalRoute;
  readonly evidence_class: EvidenceClass;
  readonly provenance: Provenance;
  readonly freshness: FreshnessState;
  readonly exact_matches: readonly string[];
}

export interface SelectedEvidence {
  readonly source_id: string;
  readonly content: string;
  readonly citation_id: string;
  readonly evidence_class: EvidenceClass;
  readonly provenance: Provenance;
  readonly exact_matches: readonly string[];
  readonly reason: string;
}

export interface DropRecord {
  readonly source_id: string;
  readonly reason: "budget" | "stale" | "contradicted" | "low_relevance" | "duplicate";
  readonly original_rank: number;
}

export interface RetentionMetrics {
  readonly required_field_retention: number;
  readonly citation_retention: number;
  readonly exact_token_retention: number;
  readonly total_candidates: number;
  readonly selected_count: number;
  readonly dropped_count: number;
}

export interface RetrievalMetrics {
  readonly recall_at_k?: number;
  readonly hit_rate_at_k?: number;
  readonly mrr?: number;
  readonly ndcg_at_k?: number;
  readonly exact_match_at_k?: number;
  readonly latency_ms: number;
  readonly cost?: number;
  readonly evaluation_status: "MEASURED" | "UNVERIFIED";
}

export interface ContextCompilationResult {
  readonly request_id: string;
  readonly evidence_pack: {
    readonly query_id: string;
    readonly retrieval_need: QueryClass;
    readonly corpus_scope: CorpusScope;
    readonly retrieval_route: RetrievalRoute;
    readonly candidates: readonly CandidateEvidence[];
    readonly fusion: "none" | "rank_fusion" | "score_fusion";
    readonly reranker: string | null;
    readonly selected_evidence: readonly SelectedEvidence[];
    readonly retrieval_metrics: RetrievalMetrics;
    readonly limitations: readonly string[];
    readonly retrieval_fallback: string;
  };
  readonly assembled_blocks: readonly string[];
  readonly retention_metrics: RetentionMetrics;
  readonly drops: readonly DropRecord[];
  readonly unknowns: readonly string[];
  readonly route_used: RetrievalRoute;
  readonly fallback_used: boolean;
  readonly validation_errors: readonly string[];
}

export interface RetrievalFixture {
  readonly name: string;
  readonly description: string;
  readonly query: string;
  readonly query_class: QueryClass;
  readonly corpus: readonly CorpusDocument[];
  readonly expected_route: RetrievalRoute;
  readonly expected_selected_ids: readonly string[];
  readonly required_tokens: readonly string[];
  readonly hard_budget: number;
  readonly soft_budget: number;
}

export interface CorpusDocument {
  readonly id: string;
  readonly content: string;
  readonly evidence_class: EvidenceClass;
  readonly metadata: Record<string, unknown>;
  readonly git_commit?: string;
  readonly review_date?: string;
}
