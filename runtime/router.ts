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

export type VisualStatus = "required" | "recommended" | "optional" | "not_needed";

export type VisualType =
  | "none"
  | "table"
  | "chart"
  | "process_diagram"
  | "architecture_diagram"
  | "erd"
  | "timeline"
  | "decision_tree"
  | "ui_mockup"
  | "generated_image";

export type CapabilityKind = "skill" | "native_tool" | "mcp_tool" | "connector";
export type Operation = "read" | "create" | "update" | "delete" | "execute" | "communicate";
export type SideEffect = "none" | "reversible" | "irreversible" | "unknown";
export type Availability = "verified" | "unavailable" | "unknown";

export interface QuerySignals {
  readonly externalCorpusRequired: boolean;
  readonly corpusAvailable: boolean;
  readonly corpusDocumentCount?: number;
  readonly hasExactIdentifier: boolean;
  readonly hasQuotedPhrase: boolean;
  readonly semanticIntent: boolean;
  readonly structuredFilters: boolean;
}

export interface RetrievalDecision {
  readonly queryClass: QueryClass;
  readonly route: RetrievalRoute;
  readonly requiresMetadataFilter: boolean;
  readonly requiresFusion: boolean;
  readonly requiresExactBoost: boolean;
  readonly allowsRerank: boolean;
  readonly reason: string;
}

export interface VisualSignals {
  readonly exactValues: boolean;
  readonly categoricalComparison: boolean;
  readonly orderedTrend: boolean;
  readonly distribution: boolean;
  readonly numericRelationship: boolean;
  readonly processFlow: boolean;
  readonly systemTopology: boolean;
  readonly entityRelationships: boolean;
  readonly temporalDependencies: boolean;
  readonly branchingDecisionLogic: boolean;
  readonly interactionDesign: boolean;
  readonly creativeImageNative: boolean;
  readonly textCreatesMaterialAmbiguity: boolean;
  readonly visualImprovesComprehension: boolean;
}

export interface VisualDecision {
  readonly status: VisualStatus;
  readonly type: VisualType;
  readonly reason: string;
}

export interface CapabilityDescriptor {
  readonly capability_id: string;
  readonly kind: CapabilityKind;
  readonly categories: readonly string[];
  readonly operations: readonly Operation[];
  readonly side_effect: SideEffect;
  readonly approval_required: boolean;
  readonly authentication: "none" | "present" | "missing" | "unknown";
  readonly external_system: string | null;
  readonly context_cost: "low" | "medium" | "high" | "unknown";
  readonly availability: Availability;
}

export interface CapabilityNeed {
  readonly category: string;
  readonly operation: Operation;
  readonly allowSideEffects: boolean;
  readonly approvalGranted?: boolean;
  readonly allowedExternalSystems?: readonly string[];
}

export interface ContractActivationInput {
  readonly contractId: string;
  readonly bossMessage: string;
  readonly isBossTurn: boolean;
  readonly requiresMutationOrExternalEffect: boolean;
}

export type ContractActivation =
  | { readonly active: true; readonly evidence: string }
  | { readonly active: false; readonly reason: string };

function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${String(value)}`);
}

export function classifyRetrieval(signals: QuerySignals): RetrievalDecision {
  if (!signals.externalCorpusRequired) {
    return {
      queryClass: "none",
      route: "none",
      requiresMetadataFilter: false,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: false,
      reason: "Supplied context is sufficient.",
    };
  }
  if (!signals.corpusAvailable) {
    return {
      queryClass: "unavailable",
      route: "fallback",
      requiresMetadataFilter: signals.structuredFilters,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: false,
      reason: "The required corpus or access is unavailable.",
    };
  }
  if ((signals.corpusDocumentCount ?? Number.POSITIVE_INFINITY) <= 8) {
    return {
      queryClass: "small_corpus",
      route: "direct",
      requiresMetadataFilter: signals.structuredFilters,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: false,
      reason: "Direct reading is cheaper and sufficient for the small corpus.",
    };
  }
  if (signals.structuredFilters && !signals.semanticIntent) {
    return {
      queryClass: "structured",
      route: signals.hasExactIdentifier || signals.hasQuotedPhrase ? "keyword" : "direct",
      requiresMetadataFilter: true,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: false,
      reason: "Structured filters constrain the corpus before ranking.",
    };
  }
  const exact = signals.hasExactIdentifier || signals.hasQuotedPhrase;
  if (exact && signals.semanticIntent) {
    return {
      queryClass: "mixed",
      route: "hybrid",
      requiresMetadataFilter: signals.structuredFilters,
      requiresFusion: true,
      requiresExactBoost: true,
      allowsRerank: true,
      reason: "Exact and semantic signals both matter.",
    };
  }
  if (exact) {
    return {
      queryClass: "exact",
      route: "keyword",
      requiresMetadataFilter: signals.structuredFilters,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: false,
      reason: "Token identity must be preserved.",
    };
  }
  if (signals.semanticIntent) {
    return {
      queryClass: "semantic",
      route: "vector",
      requiresMetadataFilter: signals.structuredFilters,
      requiresFusion: false,
      requiresExactBoost: false,
      allowsRerank: true,
      reason: "Meaning and vocabulary mismatch dominate.",
    };
  }
  return {
    queryClass: "exact",
    route: "keyword",
    requiresMetadataFilter: signals.structuredFilters,
    requiresFusion: false,
    requiresExactBoost: false,
    allowsRerank: false,
    reason: "Keyword retrieval is the lower-cost default for an unspecified lexical query.",
  };
}

export function selectVisual(signals: VisualSignals): VisualDecision {
  let type: VisualType = "none";
  if (signals.creativeImageNative) type = "generated_image";
  else if (signals.interactionDesign) type = "ui_mockup";
  else if (signals.entityRelationships) type = "erd";
  else if (signals.temporalDependencies) type = "timeline";
  else if (signals.branchingDecisionLogic) type = "decision_tree";
  else if (signals.systemTopology) type = "architecture_diagram";
  else if (signals.processFlow) type = "process_diagram";
  else if (signals.orderedTrend || signals.distribution || signals.numericRelationship || signals.categoricalComparison) type = "chart";
  else if (signals.exactValues) type = "table";

  if (type === "none") {
    return { status: "not_needed", type, reason: "Text or code is clearer than a visual." };
  }
  if (signals.textCreatesMaterialAmbiguity) {
    return { status: "required", type, reason: "Text alone creates material ambiguity or decision risk." };
  }
  if (signals.visualImprovesComprehension) {
    return { status: "recommended", type, reason: "The visual materially improves comprehension." };
  }
  return { status: "optional", type, reason: "The visual is primarily presentational." };
}

export function bindCapabilities(
  needs: readonly CapabilityNeed[],
  capabilities: readonly CapabilityDescriptor[],
): readonly CapabilityDescriptor[] {
  const selected: CapabilityDescriptor[] = [];
  for (const need of needs) {
    const candidates = capabilities.filter((candidate) => {
      if (candidate.availability !== "verified") return false;
      if (!candidate.categories.includes(need.category)) return false;
      if (!candidate.operations.includes(need.operation)) return false;
      if (!need.allowSideEffects && candidate.side_effect !== "none") return false;
      if (candidate.approval_required && need.approvalGranted !== true) return false;
      if (candidate.authentication === "missing") return false;
      if (
        candidate.external_system !== null &&
        need.allowedExternalSystems !== undefined &&
        !need.allowedExternalSystems.includes(candidate.external_system)
      ) return false;
      return true;
    });
    candidates.sort((left, right) => {
      const contextRank = { low: 0, medium: 1, high: 2, unknown: 3 } as const;
      const sideRank = { none: 0, reversible: 1, irreversible: 2, unknown: 3 } as const;
      return (
        contextRank[left.context_cost] - contextRank[right.context_cost] ||
        sideRank[left.side_effect] - sideRank[right.side_effect] ||
        left.capability_id.localeCompare(right.capability_id)
      );
    });
    const best = candidates[0];
    if (best && !selected.some((item) => item.capability_id === best.capability_id)) {
      selected.push(best);
    }
  }
  return selected;
}

export function activateContract(input: ContractActivationInput): ContractActivation {
  if (!input.isBossTurn) {
    return { active: false, reason: "Approval did not originate in a T1 Boss turn." };
  }
  const normalized = input.bossMessage.trim();
  if (!normalized) {
    return { active: false, reason: "Approval message is empty." };
  }
  if (input.requiresMutationOrExternalEffect) {
    const expected = `APPROVE ${input.contractId}`.toUpperCase();
    const signature = normalized.match(/^APPROVE\s+([A-Z0-9-]+)\s*[.!]?$/iu);
    if (!signature || signature[1]?.toUpperCase() !== input.contractId.toUpperCase()) {
      return {
        active: false,
        reason: "Build or external-effect approval must be the canonical contract-ID signature.",
      };
    }
    return { active: true, evidence: expected };
  }
  const advisoryWords = new Set(["yes", "approved", "approve", "go", "proceed"]);
  const tokens = normalized.toLowerCase().split(/\s+/u);
  if (tokens.some((token) => advisoryWords.has(token))) {
    return { active: true, evidence: normalized };
  }
  return { active: false, reason: "The Boss message is not an explicit affirmative." };
}

export function describeRoute(route: RetrievalRoute): string {
  switch (route) {
    case "none": return "No retrieval";
    case "direct": return "Direct corpus read";
    case "keyword": return "Keyword or exact retrieval";
    case "vector": return "Semantic vector retrieval";
    case "hybrid": return "Keyword and vector retrieval with defined fusion";
    case "fallback": return "Core reasoning or safe fallback";
    default: return assertNever(route);
  }
}
