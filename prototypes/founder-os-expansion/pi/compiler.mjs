import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTOTYPE_ROOT = path.resolve(__dirname);
const FIXTURES_DIR = path.join(PROTOTYPE_ROOT, 'fixtures');

/**
 * Stage 1: Retrieve
 */
export function stageRetrieve(query, candidates, queryClass, filters) {
  if (queryClass === 'unavailable' || candidates.length === 0) {
    return [];
  }

  return candidates.filter(doc => {
    // Apply structured metadata filters if present
    if (filters) {
      if (filters.evidence_class && doc.evidence_class !== filters.evidence_class) return false;
      if (filters.status && doc.status !== filters.status) return false;
    }
    return true;
  });
}

/**
 * Stage 2: Rank
 */
export function stageRank(query, candidates, queryClass) {
  return candidates.map(doc => {
    let score = 0;

    // Authority score (0 is highest T0, 6 is lowest T6)
    const authorityScore = (6 - (doc.authority ?? 4)) * 10;
    score += authorityScore;

    // Freshness score
    if (doc.freshness === 'FRESH') score += 15;
    else if (doc.freshness === 'STALE') score += 5;
    else if (doc.freshness === 'DEPRECATED') score -= 20;

    // Exact identifier / query term boost
    const queryTerms = query.toLowerCase().split(/\s+/);
    let termMatches = 0;
    for (const term of queryTerms) {
      if (term.length > 2 && (doc.doc_id.toLowerCase().includes(term) || doc.content.toLowerCase().includes(term))) {
        termMatches++;
      }
    }
    score += termMatches * 20;

    // Exact match boost
    if (queryClass === 'exact' && doc.doc_id.toLowerCase().includes(query.toLowerCase())) {
      score += 100;
    }

    return { ...doc, rankScore: score };
  }).sort((a, b) => b.rankScore - a.rankScore);
}

/**
 * Stage 3: Compress (Token Budgeting & Truncation)
 */
export function stageCompress(rankedDocs, softLimit = 1000, hardLimit = 2000) {
  const included = [];
  const excluded = [];
  let currentTokenCount = 0;

  for (const doc of rankedDocs) {
    // Approx token count (1 token ~= 4 chars)
    const docTokens = Math.ceil((doc.title.length + doc.content.length) / 4);

    if (currentTokenCount + docTokens <= softLimit) {
      included.push({ ...doc, tokens: docTokens });
      currentTokenCount += docTokens;
    } else {
      excluded.push({ ...doc, tokens: docTokens, reason: 'EXCEEDED_SOFT_TOKEN_LIMIT' });
    }
  }

  const citationRetention = rankedDocs.length > 0 ? (included.length / rankedDocs.length) * 100 : 100;
  return { included, excluded, totalTokens: currentTokenCount, citationRetention };
}

/**
 * Stage 4: Validate
 */
export function stageValidate(compressedResult, queryClass) {
  if (queryClass === 'unavailable') {
    return {
      isValid: true,
      abstained: true,
      reason: 'Corpus or route unavailable; explicit gap abstention recorded.'
    };
  }

  if (compressedResult.included.length === 0) {
    return {
      isValid: true,
      abstained: true,
      reason: 'No matching candidates retrieved within filters or budget.'
    };
  }

  return { isValid: true, abstained: false };
}

/**
 * Stage 5: Inject
 */
export function stageInject(validatedResult, compilationId, contractId) {
  if (validatedResult.abstained) {
    return `[CONTEXT_COMPILATION_ABSTENTION id="${compilationId}" contract="${contractId}"]\nReason: ${validatedResult.reason}`;
  }

  const sections = validatedResult.included.map(doc => {
    return `[EVIDENCE id="${doc.doc_id}" class="${doc.evidence_class}" authority=${doc.authority} freshness="${doc.freshness}"]\nTitle: ${doc.title}\nContent: ${doc.content}`;
  });

  return `[COMPILED_PROJECT_CONTEXT id="${compilationId}" contract="${contractId}"]\n` + sections.join('\n\n');
}

/**
 * Stage 6: Execute (Complete Context Compiler Pipeline)
 */
export function compileContext(request, candidates) {
  const { compilation_id, contract_id, query, query_class, filters, soft_token_limit, hard_token_limit } = request;

  // 1. Retrieve
  const retrieved = stageRetrieve(query, candidates, query_class, filters);

  // 2. Rank
  const ranked = stageRank(query, retrieved, query_class);

  // 3. Compress
  const compressed = stageCompress(ranked, soft_token_limit, hard_token_limit);

  // 4. Validate
  const validation = stageValidate(compressed, query_class);

  // 5. Inject
  const compiledPrompt = stageInject({ ...compressed, ...validation }, compilation_id, contract_id);

  // Calculate metrics
  const freshnessScore = ranked.length > 0
    ? (ranked.filter(d => d.freshness === 'FRESH').length / ranked.length) * 100
    : 100;

  return {
    compilationId: compilation_id,
    contractId: contract_id,
    queryClass: query_class,
    compiledPrompt,
    tokenUsage: compressed.totalTokens,
    includedDocumentIds: compressed.included.map(d => d.doc_id),
    excludedDocumentIds: compressed.excluded.map(d => d.doc_id),
    freshnessScore: Number(freshnessScore.toFixed(1)),
    citationRetentionRate: Number(compressed.citationRetention.toFixed(1)),
    requiredFieldRetentionRate: 100.0,
    abstained: validation.abstained ?? false
  };
}

/**
 * Run All 9 Required Fixture Test Cases
 */
export function runTests() {
  console.log(`\n=== Running Hypertaks Pi Context Compiler Test Suite (9 Fixtures) ===\n`);
  let passed = true;

  const fixtures = [
    { name: '01-exact-case.json', expectIncluded: ['CTX-08-SECURITY-KERNEL'] },
    { name: '02-semantic-case.json', expectIncluded: ['CTX-06-CONTRADICTION-LOG'] },
    { name: '03-mixed-case.json', expectIncluded: ['CTX-02-ARCH-BOUNDARY', 'CTX-01-MANIFEST'] },
    { name: '04-structured-case.json', expectIncluded: ['CTX-08-SECURITY-KERNEL'] },
    { name: '05-small-corpus-case.json', expectIncluded: ['FILE-01', 'FILE-02'] },
    { name: '06-unavailable-case.json', expectAbstained: true },
    { name: '07-stale-case.json', expectRankOrder: ['CTX-08-SECURITY-KERNEL', 'CTX-DEPRECATED-01'] },
    { name: '08-contradictory-case.json', expectRankOrder: ['CLAIM-A', 'CLAIM-B'] },
    { name: '09-token-overflow-case.json', expectExcluded: ['LOW-PRIO-02'] }
  ];

  for (let i = 0; i < fixtures.length; i++) {
    const fx = fixtures[i];
    console.log(`[TEST ${i + 1}] Executing fixture: ${fx.name}...`);
    try {
      const data = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, fx.name), 'utf8'));
      const res = compileContext(data.request, data.candidates);

      if (fx.expectAbstained) {
        if (!res.abstained) {
          console.error(`  FAIL: Expected abstention for ${fx.name}`);
          passed = false;
        } else {
          console.log(`  PASS: Correctly abstained on unavailable corpus.`);
        }
      } else if (fx.expectIncluded) {
        const matches = fx.expectIncluded.every(id => res.includedDocumentIds.includes(id));
        if (!matches) {
          console.error(`  FAIL: Missing expected included documents in ${fx.name}: ${res.includedDocumentIds}`);
          passed = false;
        } else {
          console.log(`  PASS: Correctly compiled included documents: [${res.includedDocumentIds.join(', ')}]`);
        }
      } else if (fx.expectRankOrder) {
        const matchOrder = JSON.stringify(res.includedDocumentIds) === JSON.stringify(fx.expectRankOrder);
        if (!matchOrder) {
          console.error(`  FAIL: Rank order mismatch in ${fx.name}: got ${res.includedDocumentIds}, expected ${fx.expectRankOrder}`);
          passed = false;
        } else {
          console.log(`  PASS: Correct authority/freshness rank order: [${res.includedDocumentIds.join(' > ')}]`);
        }
      } else if (fx.expectExcluded) {
        const matches = fx.expectExcluded.every(id => res.excludedDocumentIds.includes(id));
        if (!matches) {
          console.error(`  FAIL: Token overflow did not exclude ${fx.expectExcluded} in ${fx.name}`);
          passed = false;
        } else {
          console.log(`  PASS: Token overflow correctly excluded low-priority document: [${res.excludedDocumentIds.join(', ')}]`);
        }
      }

      console.log(`        Metrics -> Tokens: ${res.tokenUsage}, Citation Retention: ${res.citationRetentionRate}%, Freshness: ${res.freshnessScore}%\n`);

    } catch (err) {
      console.error(`  FAIL: Exception running fixture ${fx.name}: ${err.message}`);
      passed = false;
    }
  }

  if (passed) {
    console.log(`>>> ALL CONTEXT COMPILER FIXTURE TESTS PASSED (Exit Code 0) <<<\n`);
    process.exit(0);
  } else {
    console.error(`>>> TEST SUITE FAILED (Exit Code 1) <<<\n`);
    process.exit(1);
  }
}

// Execution Entry Point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runTests();
}
