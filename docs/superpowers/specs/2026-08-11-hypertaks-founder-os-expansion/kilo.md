# Ticket #6 Report: Knowledge Library And Methodology Engine

Contract: `HT-20260811-FOS`
Agent: Kilo
Mode: EXECUTOR (`hypertaks_depth: 1`)
Date: 2026-08-11
Deliverables: this report and `prototypes/founder-os-expansion/kilo/`

## Current-State Findings

### 1. Observed K1 Knowledge Routing Kernel baseline

The existing K1 kernel is defined in `docs/HYPERTAKS-ROADMAP.md` (section 5.2) and
governs:

- deterministic knowledge selection;
- domain classification;
- methodology selection;
- domain-pack ownership;
- execution-profile selection;
- capability-category binding;
- evidence and volatility classification;
- strict loading limits;
- explicit fallback for unsupported domains and unavailable tools.

K1 default loading policy (verbatim from roadmap):

```
Standard and below: at most 1 domain pack
Prime and Hyper: at most 2 domain packs
At most 1 primary methodology
At most 1 supporting methodology when materially justified
At most 1 primary execution profile
At most 1 supporting tool unless independent validation or a different deliverable requires it
```

### 2. Observed knowledge catalog baseline

The repository already contains the materials that Kilo must route through, not replace:

- **Domain packs**: 12 canonical packs under `skills/hypertaks/references/domains/`
  (`D1-quant-core` through `D12-soft-skills`) governed by `INDEX.md`.
  Each pack carries arithmetic, formulas, symbols, units, traps, and a volatility
  flag (`LOW`, `MEDIUM`, `HIGH`).
- **Core frameworks with applied how-tos**: `skills/hypertaks/references/frameworks.md`
  defines the Output-Shape Law and Computation Shape Law, plus applied how-tos for
  Porter's Five Forces, SWOT/TOWS, Pareto, Fishbone, Blue Ocean, Red Apples,
  Bottleneck/Theory of Constraints, SCOR, Supply Chain Finance, ERP, Smart Contracts,
  and IoT.
- **Extended knowledge catalog**: `skills/hypertaks/references/knowledge-base.md`
  contains 1,400+ theories, methods, frameworks, and workflows across business,
  learning, science, and technology. It is explicitly flagged as too large to load
  whole; the routing contract is to grep by keyword or domain and read at most 2 packs.
- **Execution profiles**: `skills/hypertaks/references/03-professional-execution.md`
  and `skills/hypertaks/references/engineering.md` define professional execution
  profile binding for Python, Matplotlib, TypeScript, UI/UX, and image generation.
- **Token discipline**: `skills/hypertaks/references/token-discipline.md` assigns
  tier budgets (Nano ~500, Lite ~3,000, Standard ~10,000, Prime ~25,000, Hyper
  ~60,000) and restricts reference loading by tier.

### 3. Gap analysis

| Capability | Existing | Gap |
|---|---|---|
| Module manifest structure | Ad-hoc domain pack headers | No stable manifest with provenance, authority, volatility, freshness, license, attribution, and loading budget |
| Methodology selection binding | Framework names in briefs | No declared preconditions, output shape, or validation method; label-only use is possible |
| Deterministic lazy-load route | Grep-by-keyword convention | No formal route resolver that binds index format to query class |
| Domain composition and conflicts | None | No precedence, conflict list, or unsupported-domain fallback |
| Fail-closed on unsafe modules | Implicit (skip missing) | No explicit rejection reason or state for stale, conflicting, unlicensed, or over-budget modules |
| Loading limit enforcement | Tier guidance in prose | No programmatic budget check against K1 defaults |

### 4. Existing internal interface skeleton (Ticket #1)

`prototypes/founder-os-expansion/claude-code/interfaces.ts` defines candidate
`KnowledgeModuleManifest` and `MethodologySelection` interfaces. These are
insufficient for Kilo requirements: they lack provenance, authority, evidence
class, volatility, freshness, review date, license, attribution, usage constraints,
index format, deterministic lazy-loading route, domain composition, conflicts,
precedence, unsupported-domain fallback, method preconditions, selection rationale,
primary and supporting roles, expected output shape, validation method, and
loading/context limits.

## Assumptions

1. The 12 canonical domain packs in `skills/hypertaks/references/domains/` are the
   primary knowledge modules. The extended catalog in `knowledge-base.md` is a
   lookup surface, not a load target.
2. Frameworks in `frameworks.md` are methodologies that must bind to an output shape
   under the Output-Shape Law and Computation Shape Law.
3. Execution profiles are bound to artifacts, not to modules or methodologies
   directly. The `LoadingBudget` carries a profile slot count, not profile content.
4. Evidence class and authority rank follow the existing T0-T6 and
   `boss_decision|contract|workspace_standard|repo_evidence|memory|graph|web`
   taxonomies already present in `grok.md` and `founder-brain.ts`.
5. No hosted library, mandatory database, silent package installation, or background
   indexing daemon will be introduced. Lazy loading is deterministic route resolution,
   not async pre-fetching.
6. Selection must fail closed or fall back explicitly for unsupported, stale,
   conflicting, unlicensed, and over-budget cases.
7. The prototype does not modify `decision-map.md` or any production runtime, skill,
   manifest, or package file.

## Proposed Interfaces

### 1. KnowledgeModuleManifest

Extends the candidate interface from Ticket #1. Every module carries:

```typescript
interface KnowledgeModuleManifest {
  readonly moduleId: string;
  readonly version: string;
  readonly domain: string;
  readonly purpose: string;
  readonly source: string;
  readonly owner: string;
  readonly status: ModuleStatus; // supported | unsupported | stale | deprecated | conflicted | unlicensed | experimental
  readonly provenance: ModuleProvenance;
  readonly authority: AuthorityRank;
  readonly evidenceClass: EvidenceClass;
  readonly volatility: Volatility; // LOW | MEDIUM | HIGH
  readonly freshness: ModuleFreshness;
  readonly license: ModuleLicense;
  readonly attribution: string;
  readonly indexFormat: IndexFormat; // direct | keyword | hybrid | none
  readonly lazyLoadRoute: string; // deterministic route key
  readonly domainComposition: readonly string[]; // composed domain pack IDs
  readonly conflicts: readonly string[]; // module IDs that conflict
  readonly precedence: readonly string[]; // ordered module IDs; first wins
  readonly unsupportedDomainFallback: string; // fallback module ID or "none"
  readonly loadingBudget: LoadingBudget;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

**Provenance fields**: `sourceId`, `locator`, `retrievedAt`, `versionOrCommit`,
`etag`, `reviewDate`, `publicationDate`, `title`, `sourceType`, `httpStatus`,
`authorityRank`, `evidenceClass`.

**Freshness fields**: `state` (`FRESH|STALE|UNVERIFIED|DEPRECATED`), `policyId`,
`reason`, `freshnessWindow`.

**License fields**: `spdxId`, `licenseName`, `attributionRequired`, `commercialUse`,
`modification`, `distribution`, `usageConstraints`.

### 2. Methodology

Extends the candidate interface from Ticket #1. Every methodology binds to an output
shape:

```typescript
interface Methodology {
  readonly methodId: string;
  readonly name: string;
  readonly version: string;
  readonly domain: string;
  readonly purpose: string;
  readonly source: string;
  readonly owner: string;
  readonly status: ModuleStatus;
  readonly provenance: ModuleProvenance;
  readonly authority: AuthorityRank;
  readonly evidenceClass: EvidenceClass;
  readonly volatility: Volatility;
  readonly freshness: ModuleFreshness;
  readonly license: ModuleLicense;
  readonly attribution: string;
  readonly preconditions: MethodPreconditions;
  readonly selectionRationale: string;
  readonly primaryRole: string;
  readonly supportingRoles: readonly string[];
  readonly expectedOutputShape: ExpectedOutputShape;
  readonly validationMethod: string;
  readonly loadingBudget: LoadingBudget;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

**MethodPreconditions**: `requiredInputs`, `requiredEvidenceClasses`,
`requiredDomains`, `requiredTier`, `minAgentCount`, `allowExternalCorpus`,
`allowSideEffects`.

**ExpectedOutputShape**: `shapeId`, `shapeName`, `requiredFields`,
`optionalFields`, `validationMethod` (`schema|shape_check|computation_block|manual_review`),
`validationRef`.

### 3. LoadingBudget (K1 defaults)

```typescript
interface LoadingBudget {
  readonly maxDomainPacks: number;
  readonly maxPrimaryMethodologies: number;
  readonly maxSupportingMethodologies: number;
  readonly maxPrimaryExecutionProfiles: number;
  readonly maxSupportingTools: number;
  readonly contextTokenLimit: number;
  readonly hardTokenBudget: number;
  readonly softTokenBudget: number;
}
```

K1 default values by tier:

| Tier | maxDomainPacks | maxPrimaryMethod | maxSupportingMethod | maxPrimaryProfile | maxSupportingTool | contextTokenLimit |
|---|---|---|---|---|---|---|
| Nano | 0 | 0 | 0 | 0 | 0 | 500 |
| Lite | 1 | 1 | 0 | 1 | 0 | 3,000 |
| Standard | 1 | 1 | 1 | 1 | 1 | 10,000 |
| Prime | 2 | 1 | 1 | 1 | 1 | 25,000 |
| Hyper | 2 | 1 | 1 | 1 | 1 | 60,000 |

### 4. MethodologySelection

Deterministic selection result:

```typescript
interface MethodologySelection {
  readonly selectionId: string;
  readonly contractId: string;
  readonly taskId: string;
  readonly executionTier: ExecutionTier;
  readonly selectedModules: readonly string[];
  readonly selectedMethodologies: readonly SelectedMethodology[];
  readonly rejectedModules: readonly ModuleRejection[];
  readonly rejectedMethodologies: readonly MethodologyRejection[];
  readonly appliedBudget: LoadingBudget;
  readonly budgetExceeded: boolean;
  readonly fallbackUsed: boolean;
  readonly fallbackReason?: string;
  readonly evidencePackRef: string;
  readonly selectedAt: string;
}
```

### 5. Mapping to canonical domain packs, frameworks, execution profiles, and knowledge-base catalog

The prototype does not embed the full catalog. The mapping is expressed as
deterministic route rules in `engine.ts`:

- **Domain pack resolution**: A module with `domain: "quant-core"` maps to
  `D1-quant-core` under `skills/hypertaks/references/domains/`. The `lazyLoadRoute`
  field carries a `keyword://` or `direct://` URI that the retrieval layer resolves
  without loading the full catalog.
- **Framework resolution**: A methodology with `domain: "operations-quality"` and
  `name: "Economic Order Quantity"` maps to the EOQ entry in
  `skills/hypertaks/references/domains/D6-operations-quality.md` and the Computation
  Shape Law in `frameworks.md`. The `expectedOutputShape.validationRef` points to
  `frameworks.md#computation-shape-law`.
- **Execution profile binding**: The `LoadingBudget.maxPrimaryExecutionProfiles` slot
  is reserved for the artifact type (Python, TypeScript, UI/UX, image generation)
  per `engineering.md` "Professional execution profile binding". The profile content
  itself is resolved by the artifact owner, not by Kilo.
- **Knowledge-base catalog**: Entries in `knowledge-base.md` are treated as
  secondary sources with `sourceType: "secondary"` and `evidenceClass: "T5_EXTERNAL_DATA"`
  unless they are core frameworks in `frameworks.md`, which are `T4_REPO_EVIDENCE`.
- **Volatility flag**: Domain packs in `INDEX.md` already carry volatility flags
  (`LOW|MEDIUM|HIGH`). Kilo reads the same classification and enforces that `HIGH`
  volatility modules require `versionOrCommit` or `reviewDate` before they are
  loadable.

### 6. Selection algorithm

1. Compute `LoadingBudget` from `executionTier`.
2. Filter modules: reject unsupported, stale, deprecated, conflicted, unlicensed,
   experimental (unless Hyper), freshness-state STALE/DEPRECATED/UNVERIFIED,
   commercial-use-denied, and HIGH-volatility without version/commit.
3. Sort remaining modules by `precedence` then `moduleId` (deterministic).
4. Select up to `maxDomainPacks`, checking `conflicts` against already-selected IDs.
5. Filter methodologies: same status/freshness/license/volatility gates, plus
   reject methodologies without `expectedOutputShape` or with empty required fields.
6. Check `preconditions` against the request (tier, evidence classes, side effects,
   external corpus permission).
7. Select up to `maxPrimaryMethodologies` and `maxSupportingMethodologies`.
8. If zero modules and zero methodologies are selected, set `fallbackUsed = true`
   with reason `no_loadable_modules_or_methodologies`.
9. Return `MethodologySelection` with explicit rejections for every excluded item.

### 7. Lazy-load route resolution

`resolveLazyLoadRoute(module, queryClass)` returns a deterministic
`RetrievalRoute`:

| module.indexFormat | queryClass exact | queryClass semantic | queryClass mixed/structured |
|---|---|---|---|
| direct | direct | direct | direct |
| keyword | keyword | keyword | keyword |
| hybrid | keyword | vector | hybrid |
| none | none | none | none |

This aligns with the existing `classifyRetrieval` function in `runtime/router.ts`
and the K1 retrieval policy.

## Isolated Prototype

Path: `prototypes/founder-os-expansion/kilo/`

```
prototypes/founder-os-expansion/kilo/
  ├── tsconfig.json
  ├── schema.ts
  ├── engine.ts
  ├── check.ts
  └── fixtures/
      └── index.ts
```

- `schema.ts`: Defines `KnowledgeModuleManifest`, `Methodology`,
  `MethodologySelection`, `LoadingBudget`, provenance, freshness, license,
  preconditions, and output-shape interfaces. Extends the candidate interfaces
  from `prototypes/founder-os-expansion/claude-code/interfaces.ts` without
  modifying them.
- `engine.ts`: Implements `selectKnowledge(request)` and
  `resolveLazyLoadRoute(module, queryClass)`. No external dependencies beyond
  the local schema.
- `check.ts`: Runs 11 test groups covering supported, unsupported, stale,
  conflicted, unlicensed, over-budget, no-output-shape, loading-budget-by-tier,
  lazy-load-route, precondition-rejection, and determinism.
- `fixtures/index.ts`: Contains fixture data for all required cases.

## Tests and Exit Codes

Commands run from repository root on 2026-08-11:

```powershell
npx tsc --noEmit -p prototypes/founder-os-expansion/kilo/tsconfig.json
# observed: exit 0

npx ts-node prototypes/founder-os-expansion/kilo/check.ts
# observed: exit 0
# output: 47 passed, 0 failed, ALL TESTS PASSED

git diff --check
# observed: exit 0
```

### Test coverage

| Fixture case | Test group | Outcome |
|---|---|---|
| Supported module + methodology | test-supported-module-selection | 11 assertions PASS |
| Unsupported module | test-unsupported-module-excluded | selected=0, rejection reason=status_unsupported |
| Stale module | test-stale-module-excluded | selected=0, rejection reason=freshness_state_stale |
| Conflicting modules (A vs B) | test-conflicting-modules-excluded | at most 1 selected, 1 rejected with conflict reason |
| Unlicensed module (commercial_use=false) | test-unlicensed-module-excluded | selected=0, rejection reason=license_commercial_use_denied |
| Over-budget (3 modules, Standard tier) | test-over-budget-modules-fail-closed | selected=1, rejections include domain_pack_budget_exceeded |
| Methodology without output shape | test-no-output-shape-methodology-rejected | selected=0, rejection reason=missing_expected_output_shape |
| Loading budget by tier | test-loading-budget-by-tier | 9 assertions PASS across Nano/Lite/Standard/Prime/Hyper |
| Lazy-load route resolution | test-lazy-load-route-resolution | 6 assertions PASS for direct/keyword/hybrid/none |
| Methodology precondition tier mismatch | test-methodology-preconditions-reject-tier | Prime method rejected in Lite |
| Selection determinism | test-selection-determinism | 2 assertions PASS (identical results for identical input) |

### Loading counts observed in tests

- Standard tier: `maxDomainPacks=1`, `maxPrimaryMethodologies=1`,
  `maxSupportingMethodologies=1`, `maxPrimaryExecutionProfiles=1`,
  `maxSupportingTools=1`, `contextTokenLimit=10000`
- Over-budget test: 3 candidates submitted, 1 selected, 2 rejected with
  `domain_pack_budget_exceeded`

## Risks

1. **Catalog drift**: Domain packs and knowledge-base entries may diverge from the
   manifest metadata. Mitigation: provenance fields carry `versionOrCommit` and
   `reviewDate`; stale detection triggers explicit rejection.
2. **Over-constraining output shapes**: A methodology's declared shape may not fit
   every task variant. Mitigation: `validationMethod` supports `manual_review` for
   edge cases; required fields are minimal and shape-specific.
3. **Experimental module gate**: Experimental modules are restricted to Hyper tier.
   If a task genuinely needs an experimental module at a lower tier, selection
   fails closed. Mitigation: explicit `experimental_tier_restricted` rejection
   reason surfaces the cause.
4. **Volatility enforcement cost**: HIGH volatility modules require version/commit or
   review date, which may not exist for all entries. Mitigation: modules without
   provenance metadata are rejected with `high_volatility_missing_version`.
5. **License metadata incompleteness**: Not all existing domain packs carry SPDX
   identifiers. Mitigation: prototype rejects modules with `commercialUse: false`;
   incomplete license fields default to restrictive in the fixture schema.

## Second-Order Effects

1. **Wave 2 dependency satisfied**: Kilo provides the validated module and
   methodology selection contract for Pi (#5 Context Compiler), Command Code (#7
   Tool Registry), and Cline (#8 RESEARCH command).
2. **Audit trail**: Every selection carries `selectedAt`, `evidencePackRef`, and
   explicit rejections, enabling later audit without a hosted service.
3. **Token discipline alignment**: Loading budgets match K1 tier budgets exactly,
   ensuring that knowledge loading cannot exceed the tier's token allocation.
4. **Fail-closed safety**: Unsafe modules (unsupported, stale, conflicted, unlicensed,
   over-budget) produce explicit rejection records rather than silent omission,
   enabling deterministic fallback routing.
5. **No additional infrastructure**: The prototype adds zero runtime dependencies,
   databases, or background processes.

## Unresolved Decisions

1. **Execution profile content**: The `LoadingBudget` reserves slots for execution
   profiles but does not define profile content. Profile definitions remain in
   `engineering.md` and `03-professional-execution.md`; Kilo only enforces slot
   limits.
2. **Extended catalog indexing**: The 1,400+ entry `knowledge-base.md` is not
   pre-indexed in the prototype. The decision of whether to produce a separate
   index file or resolve routes on-demand via grep is deferred to implementation.
3. **Conflict resolution policy**: When two selected modules have overlapping
   domains, precedence order wins. Whether cross-domain synergy should be allowed
   under explicit contract is unresolved.
4. **Experimental module promotion**: Criteria for promoting an experimental module
   to `supported` status (required tests, review date threshold, evidence class)
   are not defined in this prototype.
5. **License field population**: SPDX identifiers and commercial-use flags are not
   yet populated for all 12 domain packs. Population is a data-entry task, not a
   prototype task.

## Provenance

- **Repository:** `C:\Users\abrur\Documents\hypertaks-agent`
- **Execution checkout:** shared coordinator checkout; Git registered no separate Kilo worktree
- **Observed base:** branch `main` at commit `f6a02bda04438fc0a3b5d764f474a360651dd78e`
- **Artifact state:** report and prototype were untracked at execution time; no Kilo branch or commit is claimed

| Artifact | Origin |
|---|---|
| K1 loading policy | `docs/HYPERTAKS-ROADMAP.md` section 5.2 |
| Domain packs | `skills/hypertaks/references/domains/INDEX.md` and D1-D12 |
| Core frameworks | `skills/hypertaks/references/frameworks.md` |
| Extended catalog | `skills/hypertaks/references/knowledge-base.md` |
| Execution profiles | `skills/hypertaks/references/engineering.md`, `03-professional-execution.md` |
| Token discipline | `skills/hypertaks/references/token-discipline.md` |
| Evidence classes | `skills/hypertaks/references/02-retrieval-and-evidence.md` |
| Authority ranks | `runtime/founder-brain.ts` and `grok.md` Ticket #2 |
| Candidate interfaces | `prototypes/founder-os-expansion/claude-code/interfaces.ts` |
| Requirements | `briefs/06-kilo.md` and `grok.md` R6.1-R6.5 |

No credentials or secret values were used or written. No U+2014 characters appear
in this report.

## Recommendation

1. **Approve the Kilo interfaces and engine**: `schema.ts` and `engine.ts` satisfy
   all R6.1-R6.5 requirements from `grok.md`. Module manifests include provenance,
   authority, volatility, freshness/review, license, and attribution. Selection is
   deterministic, loading limits are enforced, and unsafe modules fail closed with
   explicit rejection reasons. Every selected methodology declares an output shape.
2. **Accept the 47-test validation suite**: All tests pass with exit code 0.
   Loading budgets match K1 defaults exactly. The suite covers supported,
   unsupported, stale, conflicted, unlicensed, over-budget, no-output-shape,
   precondition-rejection, lazy-load-route, and determinism cases.
3. **Map canonical catalogs by route, not by embedding**: Domain packs, frameworks,
   execution profiles, and the extended knowledge-base catalog remain in their
   canonical locations. Kilo references them via `lazyLoadRoute`, `provenance.locator`,
   and `validationRef` rather than copying content into the prototype.
4. **Pass Kilo deliverable to Wave 2**: Supply `kilo.md` and the
   `prototypes/founder-os-expansion/kilo/` directory to dependent tickets Pi (#5),
   Command Code (#7), and Cline (#8) as the validated Knowledge Library and
   Methodology Engine contract.
