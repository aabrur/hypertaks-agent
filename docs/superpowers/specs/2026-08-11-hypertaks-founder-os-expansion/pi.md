# Ticket #5 Report: Context Compiler and Optional RAG Pipeline (Pi)

Contract: `HT-20260811-FOS`
Agent: Pi Context Compiler
Status: PROTOTYPED
Date: 2026-08-11

## Current-State Findings

### 1. Verification of Required Dependency Reports (Start Condition)
The start conditions specified in `05-pi.md` require validated dependency reports from Wave 1:
- `claude-code.md` (Ticket #1): Verified present at `docs/superpowers/specs/2026-08-11-hypertaks-founder-os-expansion/claude-code.md`. Provides candidate internal interfaces and baseline target architecture.
- `grok.md` (Ticket #2): Verified present at `docs/superpowers/specs/2026-08-11-hypertaks-founder-os-expansion/grok.md`. Provides evidence-grounded context, retrieval research, and primary-source findings.
- `agy.md` (Ticket #3): Verified present at `docs/superpowers/specs/2026-08-11-hypertaks-founder-os-expansion/agy.md`. Provides 13-file Project Operating Context specification and append-only typed ontology.

All required dependencies exist and pass section checklist validation.

### 2. Context Retrieval Baseline Analysis
Based on inspection of `skills/hypertaks/references/02-retrieval-and-evidence.md` and `runtime/router.ts`:
- Current retrieval logic in `router.ts` classifies query signals (`QuerySignals`) into routes (`direct`, `keyword`, `vector`, `hybrid`, `fallback`).
- Missing: A provider-neutral Context Compiler engine that executes a unified 6-stage pipeline (`retrieve` -> `rank` -> `compress` -> `validate` -> `inject` -> `execute`), manages soft/hard token budgets, handles stale evidence and contradictions based on authority ranking (`T0` to `T6`), and produces structured `ContextCompilationResult` evidence packs.

## Assumptions

1. **Provider-Neutral & Local Baseline**: The primary compilation engine must execute deterministically using standard Node.js logic with zero mandatory vector databases, external embedding APIs, or network dependencies.
2. **Complementary to Router**: The Context Compiler extends canonical retrieval definitions in `02-retrieval-and-evidence.md` without creating a competing public router or modifying `runtime/router.ts`.
3. **Contract Isolation**: Execution operates under contract `HT-20260811-FOS` in EXECUTOR MODE (`hypertaks_depth: 1`).
4. **Measurable Context Retention**: Zero context loss is treated as a measurable coverage objective rather than an absolute guarantee. Required field retention, citation retention, and explicit drops are recorded.

## Proposed Interfaces

### 1. `ContextCompilationRequest` Interface
```typescript
export interface ContextCompilationRequest {
  readonly compilationId: string;
  readonly contractId: string;
  readonly query: string;
  readonly queryClass: "exact" | "semantic" | "mixed" | "structured" | "small_corpus" | "unavailable" | "none";
  readonly approvedRoot: string;
  readonly filters?: {
    readonly evidence_class?: string;
    readonly status?: string;
    readonly date_range?: { start: string; end: string };
  };
  readonly softTokenLimit: number;
  readonly hardTokenLimit: number;
  readonly allowOptionalAdapters: boolean;
}
```

### 2. `ContextCompilationResult` Interface
```typescript
export interface ContextCompilationResult {
  readonly compilationId: string;
  readonly contractId: string;
  readonly queryClass: string;
  readonly compiledPrompt: string;
  readonly tokenUsage: number;
  readonly includedDocumentIds: readonly string[];
  readonly excludedDocumentIds: readonly string[];
  readonly freshnessScore: number;
  readonly citationRetentionRate: number;
  readonly requiredFieldRetentionRate: number;
  readonly abstained: boolean;
}
```

### 3. Six-Stage Compilation Pipeline Architecture

1. `retrieve`: Filters candidate documents by project scope, approved root, and metadata filters (`evidence_class`, `status`).
2. `rank`: Computes composite ranking scores based on:
   - Authority Rank (`T0=0` highest to `T6=6` lowest)
   - Freshness (`FRESH` > `STALE` > `DEPRECATED`)
   - Term Frequency and Exact Identifier Match Boost
   - Contradiction Handling (Contract `T3` evidence ranks higher than external `T6` claims)
3. `compress`: Enforces soft and hard token limits. Includes high-ranked documents until soft limit is reached; excludes low-ranking documents with explicit drop reasons while preserving citation linkage.
4. `validate`: Performs schema checks, secret scanning, path containment, and gap detection. Rejects invalid formats and abstains when corpus is unavailable.
5. `inject`: Formats validated evidence sections into a structured prompt context capsule with citation tags.
6. `execute`: Emits `ContextCompilationResult` containing compiled text and performance metrics.

## Isolated Prototype

The prototype is located in `prototypes/founder-os-expansion/pi/`:

```
prototypes/founder-os-expansion/pi/
  ├── fixtures/
  │     ├── 01-exact-case.json
  │     ├── 02-semantic-case.json
  │     ├── 03-mixed-case.json
  │     ├── 04-structured-case.json
  │     ├── 05-small-corpus-case.json
  │     ├── 06-unavailable-case.json
  │     ├── 07-stale-case.json
  │     ├── 08-contradictory-case.json
  │     └── 09-token-overflow-case.json
  └── compiler.mjs
```

`compiler.mjs` is a standalone Node.js engine and test suite that processes all 9 fixture test cases without external dependencies.

## Tests and Exit Codes

All 9 fixture cases were tested using `node compiler.mjs`:

1. **Context Compiler Suite Execution**:
   - Command: `node compiler.mjs`
   - Observed Exit Code: `0`
   - Output: 9/9 fixture test cases passed.

2. **Git Check**:
   - Command: `git diff --check`
   - Observed Exit Code: `0`
   - Output: Clean execution, no whitespace or line ending issues.

### Measured Fixture Test Results

| Test Case | Scenario / Query Class | Key Observed Behavior | Tokens | Citation Retention | Freshness Score | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Exact Identifier Match | Matched exact document `CTX-08-SECURITY-KERNEL` | 43 | 100.0% | 100.0% | PASS |
| 2 | Semantic Intent Match | Keyword concept fallback matched `CTX-06-CONTRADICTION-LOG` | 57 | 100.0% | 100.0% | PASS |
| 3 | Mixed Identifier + Concept | Hybrid rank included boundary & manifest docs | 47 | 100.0% | 100.0% | PASS |
| 4 | Structured Filter | Metadata filter correctly isolated `T0_SYSTEM` docs | 12 | 100.0% | 100.0% | PASS |
| 5 | Small Corpus Direct Scan | Scanned 2 short files directly without search index | 18 | 100.0% | 100.0% | PASS |
| 6 | Unavailable Corpus | Explicit gap abstention recorded (`abstained: true`) | 0 | 100.0% | 100.0% | PASS |
| 7 | Stale Evidence Decay | Ranked active security kernel above deprecated spec | 27 | 100.0% | 50.0% | PASS |
| 8 | Contradictory Evidence | Authority boost ranked `T3` contract above `T6` external claim | 51 | 100.0% | 100.0% | PASS |
| 9 | Token Overflow Budget | Soft token budget (60 tokens) excluded `LOW-PRIO-02` | 35 | 50.0% | 50.0% | PASS |

## Risks

1. **Token Estimation Drift**: Character-to-token ratio heuristics (1 token ~= 4 chars) can vary across different tokenizer models. Mitigation: Configurable safety margins on soft token limits.
2. **Loss of Niche Context during Truncation**: Truncating low-ranking documents under tight token budgets might drop secondary context. Mitigation: Explicit drop reasons logged in `excludedDocumentIds` metadata.

## Second-Order Effects

1. **Deterministic Context Compilation**: Establishes predictable prompt assembly across external agent waves without relying on unverified network APIs.
2. **Zero Vector-Store Hard Dependency**: Allows Hypertaks to operate effectively in minimal local environments while remaining compatible with optional vector adapters.

## Unresolved Decisions

1. **Adaptive Token Margins**: Adjusting soft token budgets dynamically based on active LLM context window size.
2. **Vector Adapter Interface Binding**: Defining formal plugin hooks for optional external vector search engines when available.

## Provenance

- **Author**: Agent Pi (Ticket #5)
- **Contract**: `HT-20260811-FOS`
- **Environment**: Shared coordinator checkout `C:\Users\abrur\Documents\hypertaks-agent`; Git registered no separate Pi worktree
- **Git Commit**: `f6a02bda04438fc0a3b5d764f474a360651dd78e` on `main`
- **Execution Date**: 2026-08-11

## Recommendation

1. **Approve Context Compiler Prototype**: Accept `pi.md` and `compiler.mjs` as completing all requirements for Ticket #5.
2. **Supply Outputs to Downstream Wave 2/3**: Make `pi.md` available to dependent tickets (Cline #8, Codex #9).
