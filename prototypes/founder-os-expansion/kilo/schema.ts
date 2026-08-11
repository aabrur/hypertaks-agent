import {
  QueryClass,
  Availability,
  CapabilityDescriptor,
} from "../../../runtime/router";

// ============================================================================
// Shared literals
// ============================================================================

export type ModuleStatus =
  | "supported"
  | "unsupported"
  | "stale"
  | "deprecated"
  | "conflicted"
  | "unlicensed"
  | "experimental";

export type EvidenceClass =
  | "T0_SYSTEM"
  | "T1_BOSS_DECISION"
  | "T2_WORKSPACE_STANDARD"
  | "T3_CONTRACT"
  | "T4_REPO_EVIDENCE"
  | "T5_EXTERNAL_DATA"
  | "T6_GENERATED";

export type Volatility = "LOW" | "MEDIUM" | "HIGH";

export type FreshnessState = "FRESH" | "STALE" | "UNVERIFIED" | "DEPRECATED";

export type AuthorityRank =
  | "system"
  | "boss_decision"
  | "workspace_standard"
  | "contract"
  | "repo_evidence"
  | "external_data"
  | "generated";

export type IndexFormat = "direct" | "keyword" | "hybrid" | "none";

export type ExecutionTier = "Nano" | "Lite" | "Standard" | "Prime" | "Hyper";

export type MethodRole = "primary" | "supporting";

export type SideEffect = "none" | "reversible" | "irreversible" | "unknown";

export type RetrievalRoute = "none" | "direct" | "keyword" | "vector" | "hybrid" | "fallback";

// ============================================================================
// Loading budget (K1 defaults)
// ============================================================================

export interface LoadingBudget {
  readonly maxDomainPacks: number;
  readonly maxPrimaryMethodologies: number;
  readonly maxSupportingMethodologies: number;
  readonly maxPrimaryExecutionProfiles: number;
  readonly maxSupportingTools: number;
  readonly contextTokenLimit: number;
  readonly hardTokenBudget: number;
  readonly softTokenBudget: number;
}

export function loadingBudgetForTier(tier: ExecutionTier): LoadingBudget {
  switch (tier) {
    case "Nano":
      return {
        maxDomainPacks: 0,
        maxPrimaryMethodologies: 0,
        maxSupportingMethodologies: 0,
        maxPrimaryExecutionProfiles: 0,
        maxSupportingTools: 0,
        contextTokenLimit: 500,
        hardTokenBudget: 500,
        softTokenBudget: 500,
      };
    case "Lite":
      return {
        maxDomainPacks: 1,
        maxPrimaryMethodologies: 1,
        maxSupportingMethodologies: 0,
        maxPrimaryExecutionProfiles: 1,
        maxSupportingTools: 0,
        contextTokenLimit: 3000,
        hardTokenBudget: 3000,
        softTokenBudget: 3000,
      };
    case "Standard":
      return {
        maxDomainPacks: 1,
        maxPrimaryMethodologies: 1,
        maxSupportingMethodologies: 1,
        maxPrimaryExecutionProfiles: 1,
        maxSupportingTools: 1,
        contextTokenLimit: 10000,
        hardTokenBudget: 10000,
        softTokenBudget: 10000,
      };
    case "Prime":
      return {
        maxDomainPacks: 2,
        maxPrimaryMethodologies: 1,
        maxSupportingMethodologies: 1,
        maxPrimaryExecutionProfiles: 1,
        maxSupportingTools: 1,
        contextTokenLimit: 25000,
        hardTokenBudget: 25000,
        softTokenBudget: 25000,
      };
    case "Hyper":
      return {
        maxDomainPacks: 2,
        maxPrimaryMethodologies: 1,
        maxSupportingMethodologies: 1,
        maxPrimaryExecutionProfiles: 1,
        maxSupportingTools: 1,
        contextTokenLimit: 60000,
        hardTokenBudget: 60000,
        softTokenBudget: 60000,
      };
  }
}

// ============================================================================
// Provenance
// ============================================================================

export interface ModuleProvenance {
  readonly sourceId: string;
  readonly locator: string;
  readonly retrievedAt: string;
  readonly versionOrCommit?: string;
  readonly etag?: string;
  readonly reviewDate?: string;
  readonly publicationDate?: string;
  readonly title?: string;
  readonly sourceType:
    | "local_skill"
    | "local_runtime"
    | "paper"
    | "standard"
    | "protocol_doc"
    | "secondary"
    | "domain_pack"
    | "framework";
  readonly httpStatus?: number;
  readonly authorityRank: AuthorityRank;
  readonly evidenceClass: EvidenceClass;
}

// ============================================================================
// Freshness
// ============================================================================

export interface ModuleFreshness {
  readonly state: FreshnessState;
  readonly policyId?: string;
  readonly reason?: string;
  readonly freshnessWindow?: string;
}

// ============================================================================
// License
// ============================================================================

export interface ModuleLicense {
  readonly spdxId: string;
  readonly licenseName: string;
  readonly attributionRequired: boolean;
  readonly commercialUse: boolean;
  readonly modification: boolean;
  readonly distribution: boolean;
  readonly usageConstraints: readonly string[];
}

// ============================================================================
// KnowledgeModuleManifest
// ============================================================================

export interface KnowledgeModuleManifest {
  readonly moduleId: string;
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
  readonly indexFormat: IndexFormat;
  readonly lazyLoadRoute: string;
  readonly domainComposition: readonly string[];
  readonly conflicts: readonly string[];
  readonly precedence: readonly string[];
  readonly unsupportedDomainFallback: string;
  readonly loadingBudget: LoadingBudget;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ============================================================================
// Methodology
// ============================================================================

export interface MethodPreconditions {
  readonly requiredInputs: readonly string[];
  readonly requiredEvidenceClasses: readonly EvidenceClass[];
  readonly requiredDomains: readonly string[];
  readonly requiredTier: ExecutionTier;
  readonly minAgentCount: number;
  readonly allowExternalCorpus: boolean;
  readonly allowSideEffects: SideEffect;
}

export interface ExpectedOutputShape {
  readonly shapeId: string;
  readonly shapeName: string;
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly validationMethod: "schema" | "shape_check" | "computation_block" | "manual_review";
  readonly validationRef: string;
}

export interface Methodology {
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

// ============================================================================
// Selection result
// ============================================================================

export interface ModuleRejection {
  readonly moduleId: string;
  readonly reason: string;
}

export interface MethodologyRejection {
  readonly methodId: string;
  readonly reason: string;
}

export interface SelectedMethodology {
  readonly methodId: string;
  readonly role: MethodRole;
}

export interface MethodologySelection {
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
  readonly fallbackReason?: string | undefined;
  readonly evidencePackRef: string;
  readonly selectedAt: string;
}
