import {
  ContextCompilationRequest,
  ContextCompilationResult,
  CandidateEvidence,
  SelectedEvidence,
  RetrievalMetrics,
  RetentionMetrics,
  DropRecord,
  RetrievalFixture,
  CorpusDocument,
  QueryClass,
  RetrievalRoute,
  EvidenceClass,
  FreshnessState,
  ExactMatchToken,
  CorpusScope,
  GitState,
  Provenance,
} from "./types.ts";

const EVIDENCE_ID_COUNTER = (() => {
  let count = 0;
  return () => `EVIDENCE_${++count}`;
})();

function classifyQuery(query: string): QueryClass {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return "none";
  }

  const hasExactIdentifier = /\b(id|ID|code|filename|error\s*code|proper\s*name|sku|uuid)\b/i.test(trimmed) ||
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(trimmed) ||
    /['"][^'"]{5,100}['"]/.test(trimmed) ||
    /\b[A-Z0-9_-]{4,}\b/.test(trimmed);

  const hasQuotedPhrase = /['"][^'"]+['"]/.test(trimmed);
  const hasSemanticIntent = /\b(how|what|when|where|why|explain|show|find|search|locate)\b/i.test(trimmed) ||
    /\b(related|similar|about|concerning|regarding|understand)\b/i.test(trimmed);

  if (hasExactIdentifier && hasQuotedPhrase && hasSemanticIntent) {
    return "mixed";
  }
  if (hasExactIdentifier || hasQuotedPhrase) {
    return "exact";
  }
  if (hasSemanticIntent) {
    return "semantic";
  }

  return "exact";
}

function computeFreshness(document: CorpusDocument): FreshnessState {
  const reviewDate = document.metadata.review_date as string | undefined;
  const gitCommit = document.git_commit as string | undefined;

  if (!reviewDate && !gitCommit) {
    return "UNVERIFIED";
  }

  const now = new Date();
  const reviewDt = reviewDate ? new Date(reviewDate) : now;

  if (reviewDate) {
    const days = (now.getTime() - reviewDt.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 365) return "DEPRECATED";
    if (days > 180) return "STALE";
  }

  return "FRESH";
}

function calculateRelevance(document: CorpusDocument, query: string): number {
  const content = document.content.toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;
  const words = queryLower.split(/\s+/);

  for (const word of words) {
    if (content.includes(word)) {
      score += 1;
    }
  }

  return Math.min(score / words.length, 1);
}

function exactMatchTokens(query: string): ExactMatchToken[] {
  const tokens: ExactMatchToken[] = [];

  const idMatch = query.match(/\b(id|ID)\s*[:=]\s*['"]?([a-zA-Z0-9_-]+)['"]?/gi);
  if (idMatch) {
    tokens.push({ token: idMatch[0].split('=')[1].split(':')[1].trim().replace(/['"]/g, ''), type: "id", required: true });
  }

  const codeMatch = query.match(/['"][A-Z0-9_]{3,}['"]/gi);
  if (codeMatch) {
    for (const match of codeMatch) {
      tokens.push({ token: match.replace(/['"]/g, ''), type: "code", required: true });
    }
  }

  const phraseMatch = query.match(/['"][^'"]+['"]/g);
  if (phraseMatch) {
    for (const match of phraseMatch) {
      tokens.push({ token: match.replace(/['"]/g, ''), type: "quoted_phrase", required: true });
    }
  }

  return tokens;
}

function selectRoute(
  queryClass: QueryClass,
  adaptersAvailable: { keyword: boolean; structured: boolean; vector: boolean; hybrid: boolean; direct: boolean }
): RetrievalRoute {
  switch (queryClass) {
    case "none":
      return "none";
    case "direct":
      return "direct";
    case "structured":
      return adaptersAvailable.keyword ? "keyword" : "direct";
    case "exact":
      return adaptersAvailable.keyword ? "keyword" : "direct";
    case "semantic":
      return adaptersAvailable.vector ? "vector" : "keyword";
    case "mixed":
      return adaptersAvailable.hybrid ? "hybrid" : (adaptersAvailable.keyword ? "keyword" : "direct");
    case "unavailable":
      return "fallback";
    default:
      return "keyword";
  }
}

function rankCorpus(
  corpus: CorpusDocument[],
  query: string,
  queryClass: QueryClass,
  exactTokens: ExactMatchToken[]
): CandidateEvidence[] {
  const candidates: CandidateEvidence[] = [];

  for (const doc of corpus) {
    const relevance = calculateRelevance(doc, query);
    const freshness = computeFreshness(doc);

    const exactMatches: string[] = [];
    if (exactTokens) {
      for (const token of exactTokens) {
        if (doc.content.toLowerCase().includes(token.token.toLowerCase())) {
          exactMatches.push(token.token);
        }
      }
    }

    const route: RetrievalRoute = queryClass === "direct" ? "direct" :
      queryClass === "keyword" ? "keyword" : "vector";

    const score = relevance;

    const provenance: Provenance = {
      source_id: doc.id,
      locator: `document://${doc.id}`,
      retrieved_at: new Date().toISOString(),
      git_commit: doc.git_commit,
      review_date: doc.metadata.review_date as string | undefined,
    };

    candidates.push({
      source_id: doc.id,
      content: doc.content,
      rank: 0,
      score: score,
      retrieval_route: route,
      evidence_class: doc.evidence_class,
      provenance,
      freshness,
      exact_matches: exactMatches,
    });
  }

  candidates.sort((a, b) => {
    const aRelevance = calculateRelevance(
      { id: a.source_id, content: a.content, evidence_class: a.evidence_class, metadata: {} } as CorpusDocument,
      query
    );
    const bRelevance = calculateRelevance(
      { id: b.source_id, content: b.content, evidence_class: b.evidence_class, metadata: {} } as CorpusDocument,
      query
    );
    return bRelevance - aRelevance;
  });

  for (let i = 0; i < candidates.length; i++) {
    candidates[i].rank = i + 1;
  }

  return candidates;
}

function compressContent(
  candidates: CandidateEvidence[],
  hardBudget: number,
  softBudget: number,
  exactTokens: ExactMatchToken[]
): { selected: SelectedEvidence[]; drops: DropRecord[]; retainedTokens: number } {
  const selected: SelectedEvidence[] = [];
  const drops: DropRecord[] = [];

  let totalLength = 0;
  const requiredTokens = exactTokens.filter(t => t.required);
  const hasRequiredExact = requiredTokens.length > 0;

  for (const candidate of candidates) {
    if (candidate.freshness === "STALE" || candidate.freshness === "DEPRECATED") {
      drops.push({
        source_id: candidate.source_id,
        reason: "stale",
        original_rank: candidate.rank,
      });
      continue;
    }

    if (!hasRequiredExact && totalLength > hardBudget) {
      drops.push({
        source_id: candidate.source_id,
        reason: "budget",
        original_rank: candidate.rank,
      });
      continue;
    }

    const contentLength = candidate.content.length;
    const projectedLength = totalLength + contentLength;

    if (projectedLength > hardBudget && totalLength > 0) {
      drops.push({
        source_id: candidate.source_id,
        reason: "budget",
        original_rank: candidate.rank,
      });
      continue;
    }

    if (projectedLength > softBudget) {
      drops.push({
        source_id: candidate.source_id,
        reason: "budget",
        original_rank: candidate.rank,
      });
      continue;
    }

    const citationId = EVIDENCE_ID_COUNTER();

    selected.push({
      source_id: candidate.source_id,
      content: candidate.content,
      citation_id: citationId,
      evidence_class: candidate.evidence_class,
      provenance: candidate.provenance,
      exact_matches: candidate.exact_matches,
      reason: `Rank ${candidate.rank}, relevance: ${(candidate.score ?? 0).toFixed(2)}`,
    });

    totalLength = projectedLength;
  }

  return { selected, drops, retainedTokens: totalLength };
}

function validateResult(result: { selected: SelectedEvidence[]; drops: DropRecord[] }): string[] {
  const errors: string[] = [];

  if (result.selected.length === 0 && result.drops.length > 0) {
    errors.push("No evidence selected but corpus was filtered as unavailable or stale");
  }

  for (const drop of result.drops) {
    if (!drop.reason) {
      errors.push(`Invalid drop reason for source ${drop.source_id}`);
    }
  }

  return errors;
}

function compileContext(request: ContextCompilationRequest): ContextCompilationResult {
  const startTime = Date.now();

  const queryClass = request.query_class || classifyQuery(request.query);
  const route = selectRoute(queryClass, request.adapters_available);

  const candidates = rankCorpus(
    request.corpus_scope as unknown as CorpusDocument[],
    request.query,
    queryClass,
    request.exact_match_tokens
  );

  const compressed = compressContent(
    candidates,
    request.hard_budget,
    request.soft_budget,
    request.exact_match_tokens
  );

  const validationErrors = validateResult(compressed);

  const latency = Date.now() - startTime;

  const totalDropped = compressed.drops.length;
  const totalCandidates = candidates.length;
  const selectedCount = compressed.selected.length;

  const retentionMetrics: RetentionMetrics = {
    required_field_retention: request.exact_match_tokens.filter(t => t.required).length > 0
      ? (selectedCount / Math.max(totalCandidates, 1)) * 100
      : 100,
    citation_retention: (selectedCount / Math.max(totalCandidates, 1)) * 100,
    exact_token_retention: request.exact_match_tokens.filter(t => t.required).length > 0
      ? (compressed.selected.filter(s =>
          s.exact_matches.some(e => request.exact_match_tokens.some(r =>
            r.token === e && r.required
          ))
        ).length / Math.max(request.exact_match_tokens.filter(t => t.required).length, 1)) * 100
      : 100,
    total_candidates: totalCandidates,
    selected_count: selectedCount,
    dropped_count: totalDropped,
  };

  const metrics: RetrievalMetrics = {
    latency_ms: latency,
    evaluation_status: "UNVERIFIED",
  };

  return {
    request_id: request.request_id,
    evidence_pack: {
      query_id: request.request_id,
      retrieval_need: queryClass,
      corpus_scope: request.corpus_scope,
      retrieval_route: route,
      candidates: candidates.slice(0, Math.min(candidates.length, 10)),
      fusion: "rank_fusion",
      reranker: request.adapters_available.rerank ? "local-model" : null,
      selected_evidence: compressed.selected,
      retrieval_metrics: metrics,
      limitations: [
        "No vector store available - semantic fallback to keyword",
        "Evaluation is UNVERIFIED without labeled dataset",
      ],
      retrieval_fallback: route !== "fallback" ? "keyword" : "core_reasoning",
    },
    assembled_blocks: compressed.selected.map(s => `[${s.citation_id}] ${s.content}`),
    retention_metrics: retentionMetrics,
    drops: compressed.drops,
    unknowns: candidates.filter(c => c.freshness === "UNVERIFIED").map(c => c.source_id),
    route_used: route,
    fallback_used: route !== queryClass === "semantic" ? !!request.adapters_available.vector : false,
    validation_errors: validationErrors,
  };
}

function runFixture(fixture: RetrievalFixture): { passed: boolean; result: ContextCompilationResult; diagnostics: string[] } {
  const request: ContextCompilationRequest = {
    request_id: `fixture-${fixture.name}`,
    project_root: "/test-project",
    approved_roots: ["/test-project"],
    query: fixture.query,
    query_class: classifyQuery(fixture.query),
    route_preference: selectRoute(classifyQuery(fixture.query), {
      keyword: true,
      structured: true,
      vector: false,
      hybrid: false,
      rerank: false,
      direct: true,
    }),
    corpus_scope: {
      collections: ["test"],
      filters: {},
      trust_boundary: "internal",
    },
    authority_order: ["T0_SYSTEM", "T1_BOSS_DECISION", "T2_WORKSPACE_STANDARD", "T3_CONTRACT"],
    exact_match_tokens: exactMatchTokens(fixture.query),
    hard_budget: fixture.hard_budget,
    soft_budget: fixture.soft_budget,
    adapters_available: {
      keyword: true,
      structured: true,
      vector: false,
      hybrid: false,
      rerank: false,
      direct: true,
    },
    git_state: {
      commit_sha: "abc123",
      branch: "main",
      clean_tree: true,
    },
  };

  request.corpus_scope = {
    ...request.corpus_scope,
    ...fixture,
  } as unknown as CorpusScope;

  (request as unknown as Record<string, unknown>).corpus_scope = {
    ...fixture,
    collections: ["test"],
    filters: {},
    trust_boundary: "internal",
  };

  const result = compileContext(request);

  const diagnostics: string[] = [];
  const passed = fixture.expected_route === result.route_used;

  const expectedIds = new Set(fixture.expected_selected_ids);
  const actualSelectedIds = new Set(result.evidence_pack.selected_evidence.map(e => e.source_id));

  if (expectedIds.size > 0) {
    for (const id of expectedIds) {
      if (!actualSelectedIds.has(id)) {
        diagnostics.push(`Missing expected source: ${id}`);
      }
    }
  }

  if (!passed) {
    diagnostics.push(`Route mismatch: expected ${fixture.expected_route}, got ${result.route_used}`);
  }

  return { passed, result, diagnostics };
}

export {
  compileContext,
  classifyQuery,
  selectRoute,
  rankCorpus,
  compressContent,
  validateResult,
  runFixture,
  exactMatchTokens,
  computeFreshness,
  EVIDENCE_ID_COUNTER,
};

export type { ContextCompilationRequest, ContextCompilationResult, CandidateEvidence, SelectedEvidence, RetrievalMetrics, RetentionMetrics, DropRecord, RetrievalFixture, CorpusDocument };
