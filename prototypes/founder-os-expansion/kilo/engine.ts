import {
  KnowledgeModuleManifest,
  Methodology,
  MethodologySelection,
  ModuleRejection,
  MethodologyRejection,
  SelectedMethodology,
  LoadingBudget,
  EvidenceClass,
  ModuleStatus,
  Volatility,
  FreshnessState,
  AuthorityRank,
  ExecutionTier,
  SideEffect,
  RetrievalRoute,
  loadingBudgetForTier,
} from "./schema";

// ============================================================================
// Selection preconditions
// ============================================================================

export interface SelectionRequest {
  readonly contractId: string;
  readonly taskId: string;
  readonly executionTier: "Nano" | "Lite" | "Standard" | "Prime" | "Hyper";
  readonly requiredDomains: readonly string[];
  readonly requiredEvidenceClasses: readonly EvidenceClass[];
  readonly allowExternalCorpus: boolean;
  readonly allowSideEffects: "none" | "reversible" | "irreversible" | "unknown";
  readonly availableModules: readonly KnowledgeModuleManifest[];
  readonly availableMethodologies: readonly Methodology[];
  readonly evidencePackRef: string;
}

// ============================================================================
// Deterministic module selector
// ============================================================================

function isModuleLoadable(
  module: KnowledgeModuleManifest,
  tier: "Nano" | "Lite" | "Standard" | "Prime" | "Hyper"
): { loadable: boolean; reason?: string } {
  if (module.status === "unsupported") {
    return { loadable: false, reason: "status_unsupported" };
  }
  if (module.status === "unlicensed") {
    return { loadable: false, reason: "license_commercial_use_denied" };
  }
  if (module.status === "stale" || module.status === "deprecated") {
    return { loadable: false, reason: "freshness_state_stale" };
  }
  if (module.status === "conflicted") {
    return { loadable: false, reason: "status_conflicted" };
  }
  if (module.status === "experimental") {
    if (tier !== "Hyper") {
      return { loadable: false, reason: "experimental_tier_restricted" };
    }
  }

  const fresh = module.freshness.state;
  if (fresh === "STALE" || fresh === "DEPRECATED" || fresh === "UNVERIFIED") {
    return { loadable: false, reason: `freshness_state_${fresh.toLowerCase()}` };
  }

  if (module.license.commercialUse === false) {
    return { loadable: false, reason: "license_commercial_use_denied" };
  }

  if (
    module.volatility === "HIGH" &&
    !module.provenance.versionOrCommit &&
    !module.provenance.reviewDate
  ) {
    return { loadable: false, reason: "high_volatility_missing_version" };
  }

  return { loadable: true };
}

function moduleConflictDetected(
  module: KnowledgeModuleManifest,
  selectedIds: readonly string[],
  allModules: readonly KnowledgeModuleManifest[]
): boolean {
  for (const conflictId of module.conflicts) {
    if (selectedIds.includes(conflictId)) {
      return true;
    }
  }
  for (const selectedId of selectedIds) {
    const selected = allModules.find((m) => m.moduleId === selectedId);
    if (selected && selected.conflicts.includes(module.moduleId)) {
      return true;
    }
  }
  return false;
}

function selectModules(request: SelectionRequest): {
  selected: readonly string[];
  rejected: readonly ModuleRejection[];
} {
  const budget = loadingBudgetForTier(request.executionTier);
  const selected: string[] = [];
  const rejected: ModuleRejection[] = [];

  const candidates = request.availableModules
    .map((m) => ({ module: m, loadable: isModuleLoadable(m, request.executionTier) }))
    .sort((a, b) => {
      const aIdx = a.module.precedence.length > 0 ? a.module.precedence.indexOf(a.module.moduleId) : -1;
      const bIdx = b.module.precedence.length > 0 ? b.module.precedence.indexOf(b.module.moduleId) : -1;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.module.moduleId.localeCompare(b.module.moduleId);
    });

  for (const { module, loadable } of candidates) {
    if (!loadable.loadable) {
      rejected.push({
        moduleId: module.moduleId,
        reason: loadable.reason ?? "not_loadable",
      });
      continue;
    }
    if (selected.length >= budget.maxDomainPacks) {
      rejected.push({
        moduleId: module.moduleId,
        reason: `domain_pack_budget_exceeded: max ${budget.maxDomainPacks}`,
      });
      continue;
    }
    if (moduleConflictDetected(module, selected, request.availableModules)) {
      rejected.push({
        moduleId: module.moduleId,
        reason: `conflict_with_selected: ${selected.join(", ")}`,
      });
      continue;
    }
    selected.push(module.moduleId);
  }

  return { selected, rejected };
}

// ============================================================================
// Deterministic methodology selector
// ============================================================================

function isMethodologyLoadable(
  method: Methodology,
  tier: "Nano" | "Lite" | "Standard" | "Prime" | "Hyper"
): { loadable: boolean; reason?: string } {
  if (method.status === "unsupported" || method.status === "unlicensed") {
    return { loadable: false, reason: "status_unsupported" };
  }
  if (method.status === "stale" || method.status === "deprecated") {
    return { loadable: false, reason: "freshness_state_stale" };
  }
  if (method.status === "conflicted") {
    return { loadable: false, reason: "status_conflicted" };
  }
  if (method.status === "experimental") {
    if (tier !== "Hyper") {
      return { loadable: false, reason: "experimental_tier_restricted" };
    }
  }

  const fresh = method.freshness.state;
  if (fresh === "STALE" || fresh === "DEPRECATED" || fresh === "UNVERIFIED") {
    return { loadable: false, reason: `freshness_state_${fresh.toLowerCase()}` };
  }

  if (method.license.commercialUse === false) {
    return { loadable: false, reason: "license_commercial_use_denied" };
  }

  if (
    method.volatility === "HIGH" &&
    !method.provenance.versionOrCommit &&
    !method.provenance.reviewDate
  ) {
    return { loadable: false, reason: "high_volatility_missing_version" };
  }

  if (method.expectedOutputShape.shapeId === "" || method.expectedOutputShape.shapeName === "") {
    return { loadable: false, reason: "missing_expected_output_shape" };
  }

  if (method.expectedOutputShape.requiredFields.length === 0) {
    return { loadable: false, reason: "missing_expected_output_shape" };
  }

  return { loadable: true };
}

function methodPreconditionsMet(
  method: Methodology,
  request: SelectionRequest
): boolean {
  if (method.preconditions.requiredTier === "Nano" && request.executionTier !== "Nano") {
    return true;
  }
  const tierOrder = ["Nano", "Lite", "Standard", "Prime", "Hyper"];
  const requiredIdx = tierOrder.indexOf(method.preconditions.requiredTier);
  const actualIdx = tierOrder.indexOf(request.executionTier);
  if (actualIdx < requiredIdx) {
    return false;
  }

  for (const cls of method.preconditions.requiredEvidenceClasses) {
    if (!request.requiredEvidenceClasses.includes(cls)) {
      return false;
    }
  }

  if (
    method.preconditions.allowExternalCorpus === false &&
    request.allowExternalCorpus
  ) {
    return false;
  }

  if (
    method.preconditions.allowSideEffects === "none" &&
    request.allowSideEffects !== "none"
  ) {
    return false;
  }

  return true;
}

function selectMethodologies(
  request: SelectionRequest
): {
  selected: readonly SelectedMethodology[];
  rejected: readonly MethodologyRejection[];
} {
  const budget = loadingBudgetForTier(request.executionTier);
  const selected: SelectedMethodology[] = [];
  const rejected: MethodologyRejection[] = [];

  const candidates = request.availableMethodologies
    .map((m) => ({ method: m, loadable: isMethodologyLoadable(m, request.executionTier) }))
    .sort((a, b) => a.method.methodId.localeCompare(b.method.methodId));

  let primarySlots = 0;
  let supportingSlots = 0;

  for (const { method, loadable } of candidates) {
    if (!loadable.loadable) {
      rejected.push({
        methodId: method.methodId,
        reason: loadable.reason ?? "not_loadable",
      });
      continue;
    }

    if (!methodPreconditionsMet(method, request)) {
      rejected.push({
        methodId: method.methodId,
        reason: "preconditions_not_met",
      });
      continue;
    }

    const isPrimary = method.primaryRole === "primary";
    if (isPrimary && primarySlots >= budget.maxPrimaryMethodologies) {
      rejected.push({
        methodId: method.methodId,
        reason: `primary_methodology_budget_exceeded: max ${budget.maxPrimaryMethodologies}`,
      });
      continue;
    }
    if (!isPrimary && supportingSlots >= budget.maxSupportingMethodologies) {
      rejected.push({
        methodId: method.methodId,
        reason: `supporting_methodology_budget_exceeded: max ${budget.maxSupportingMethodologies}`,
      });
      continue;
    }

    const role: "primary" | "supporting" = isPrimary ? "primary" : "supporting";
    selected.push({ methodId: method.methodId, role });
    if (isPrimary) {
      primarySlots++;
    } else {
      supportingSlots++;
    }
  }

  return { selected, rejected };
}

// ============================================================================
// Public API: deterministic selection
// ============================================================================

export function selectKnowledge(
  request: SelectionRequest
): MethodologySelection {
  const budget = loadingBudgetForTier(request.executionTier);
  const { selected: modules, rejected: moduleRejections } = selectModules(request);
  const { selected: methodologies, rejected: methodRejections } =
    selectMethodologies(request);

  const fallbackUsed =
    modules.length === 0 && methodologies.length === 0;

  return {
    selectionId: `sel-${request.contractId}-${request.taskId}`,
    contractId: request.contractId,
    taskId: request.taskId,
    executionTier: request.executionTier,
    selectedModules: modules,
    selectedMethodologies: methodologies,
    rejectedModules: moduleRejections,
    rejectedMethodologies: methodRejections,
    appliedBudget: budget,
    budgetExceeded: false,
    fallbackUsed,
    fallbackReason: fallbackUsed
      ? "no_loadable_modules_or_methodologies"
      : undefined,
    evidencePackRef: request.evidencePackRef,
    selectedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Lazy-load route resolution (deterministic)
// ============================================================================

export function resolveLazyLoadRoute(
  module: KnowledgeModuleManifest,
  queryClass: "exact" | "semantic" | "mixed" | "structured" | "small_corpus" | "none" | "unavailable"
): RetrievalRoute {
  if (module.indexFormat === "none") {
    return "none";
  }
  if (module.indexFormat === "direct") {
    return "direct";
  }
  if (module.indexFormat === "keyword") {
    return "keyword";
  }
  if (module.indexFormat === "hybrid") {
    if (queryClass === "exact") {
      return "keyword";
    }
    if (queryClass === "semantic") {
      return "vector";
    }
    return "hybrid";
  }
  return "fallback";
}
