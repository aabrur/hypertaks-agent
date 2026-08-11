import {
  KnowledgeModuleManifest,
  Methodology,
  EvidenceClass,
  ModuleStatus,
  Volatility,
  FreshnessState,
  AuthorityRank,
  ExecutionTier,
  LoadingBudget,
  loadingBudgetForTier,
} from "../schema";

export const NOW = "2026-08-11T19:00:00Z";

function budget(tier: ExecutionTier): LoadingBudget {
  return loadingBudgetForTier(tier);
}

export const SUPPORTED_MODULE: KnowledgeModuleManifest = {
  moduleId: "mod-supported-d1",
  version: "1.0.0",
  domain: "quant-core",
  purpose: "Canonical quantitative core domain pack",
  source: "skills/hypertaks/references/domains/D1-quant-core.md",
  owner: "hypertaks",
  status: "supported",
  provenance: {
    sourceId: "D1-quant-core",
    locator: "skills/hypertaks/references/domains/D1-quant-core.md",
    retrievedAt: NOW,
    versionOrCommit: "f6a02bda04438fc0a3b5d764f474a360651dd78e",
    reviewDate: "2026-08-11",
    sourceType: "local_skill",
    authorityRank: "repo_evidence",
    evidenceClass: "T4_REPO_EVIDENCE",
  },
  authority: "repo_evidence",
  evidenceClass: "T4_REPO_EVIDENCE",
  volatility: "LOW",
  freshness: { state: "FRESH", policyId: "K1-FRESH", freshnessWindow: "P30D" },
  license: {
    spdxId: "MIT",
    licenseName: "MIT",
    attributionRequired: true,
    commercialUse: true,
    modification: true,
    distribution: true,
    usageConstraints: [],
  },
  attribution: "Hypertaks Founder OS",
  indexFormat: "keyword",
  lazyLoadRoute: "keyword://domains/D1-quant-core.md",
  domainComposition: ["quant-core"],
  conflicts: [],
  precedence: [],
  unsupportedDomainFallback: "none",
  loadingBudget: budget("Standard"),
  createdAt: NOW,
  updatedAt: NOW,
};

export const SUPPORTED_METHODOLOGY: Methodology = {
  methodId: "mth-supported-eoq",
  name: "Economic Order Quantity",
  version: "1.0.0",
  domain: "operations-quality",
  purpose: "Compute optimal order quantity minimizing total inventory cost",
  source: "skills/hypertaks/references/domains/D6-operations-quality.md",
  owner: "hypertaks",
  status: "supported",
  provenance: {
    sourceId: "D6-operations-quality",
    locator: "skills/hypertaks/references/domains/D6-operations-quality.md",
    retrievedAt: NOW,
    versionOrCommit: "f6a02bda04438fc0a3b5d764f474a360651dd78e",
    reviewDate: "2026-08-11",
    sourceType: "local_skill",
    authorityRank: "repo_evidence",
    evidenceClass: "T4_REPO_EVIDENCE",
  },
  authority: "repo_evidence",
  evidenceClass: "T4_REPO_EVIDENCE",
  volatility: "LOW",
  freshness: { state: "FRESH", policyId: "K1-FRESH", freshnessWindow: "P30D" },
  license: {
    spdxId: "MIT",
    licenseName: "MIT",
    attributionRequired: true,
    commercialUse: true,
    modification: true,
    distribution: true,
    usageConstraints: [],
  },
  attribution: "Hypertaks Founder OS",
  preconditions: {
    requiredInputs: ["demand", "order_cost", "holding_cost"],
    requiredEvidenceClasses: ["T4_REPO_EVIDENCE"],
    requiredDomains: ["operations-quality", "quant-core"],
    requiredTier: "Lite",
    minAgentCount: 1,
    allowExternalCorpus: false,
    allowSideEffects: "none",
  },
  selectionRationale: "Standard deterministic EOQ computation with substitution shown",
  primaryRole: "primary",
  supportingRoles: [],
  expectedOutputShape: {
    shapeId: "eoq-computation-block",
    shapeName: "EOQ Computation Block",
    requiredFields: ["METHOD", "INPUTS", "FORMULA", "SUBSTITUTION", "RESULT", "INTERPRETATION", "ASSUMPTIONS"],
    optionalFields: ["SENSITIVITY"],
    validationMethod: "shape_check",
    validationRef: "references/frameworks.md#computation-shape-law",
  },
  validationMethod: "shape_check against Computation Shape Law",
  loadingBudget: budget("Lite"),
  createdAt: NOW,
  updatedAt: NOW,
};

export const UNSUPPORTED_MODULE: KnowledgeModuleManifest = {
  ...SUPPORTED_MODULE,
  moduleId: "mod-unsupported-unknown",
  status: "unsupported",
  purpose: "Domain outside approved catalog",
  domain: "unknown-domain",
  loadingBudget: budget("Standard"),
};

export const STALE_MODULE: KnowledgeModuleManifest = {
  ...SUPPORTED_MODULE,
  moduleId: "mod-stale-d8",
  status: "supported",
  freshness: { state: "STALE", policyId: "K1-FRESH", reason: "review_date_passed" },
  domain: "business-finance",
  loadingBudget: budget("Standard"),
};

export const CONFLICTING_MODULE: KnowledgeModuleManifest = {
  ...SUPPORTED_MODULE,
  moduleId: "mod-conflicting-a",
  status: "supported",
  conflicts: ["mod-conflicting-b"],
  loadingBudget: budget("Standard"),
};

export const CONFLICTING_MODULE_B: KnowledgeModuleManifest = {
  ...SUPPORTED_MODULE,
  moduleId: "mod-conflicting-b",
  status: "supported",
  conflicts: ["mod-conflicting-a"],
  loadingBudget: budget("Standard"),
};

export const UNLICENSED_MODULE: KnowledgeModuleManifest = {
  ...SUPPORTED_MODULE,
  moduleId: "mod-unlicensed-custom",
  status: "supported",
  license: {
    spdxId: "UNLICENSED",
    licenseName: "Proprietary",
    attributionRequired: true,
    commercialUse: false,
    modification: false,
    distribution: false,
    usageConstraints: ["no_commercial_use", "no_modification"],
  },
  loadingBudget: budget("Standard"),
};

export const OVER_BUDGET_MODULES: KnowledgeModuleManifest[] = [
  SUPPORTED_MODULE,
  {
    ...SUPPORTED_MODULE,
    moduleId: "mod-over-budget-2",
    domain: "economics",
    loadingBudget: budget("Standard"),
  },
  {
    ...SUPPORTED_MODULE,
    moduleId: "mod-over-budget-3",
    domain: "data-tools",
    loadingBudget: budget("Standard"),
  },
];

export const NO_OUTPUT_SHAPE_METHODOLOGY: Methodology = {
  ...SUPPORTED_METHODOLOGY,
  methodId: "mth-no-shape",
  expectedOutputShape: {
    shapeId: "",
    shapeName: "",
    requiredFields: [],
    optionalFields: [],
    validationMethod: "manual_review",
    validationRef: "",
  },
};

export const SELECTION_FIXTURE = {
  contractId: "HT-20260811-FOS",
  taskId: "tkt-06-kilo",
  executionTier: "Standard" as ExecutionTier,
  requiredDomains: ["quant-core", "operations-quality"],
  requiredEvidenceClasses: ["T4_REPO_EVIDENCE"] as readonly EvidenceClass[],
  allowExternalCorpus: false,
  allowSideEffects: "none" as const,
  availableModules: [SUPPORTED_MODULE],
  availableMethodologies: [SUPPORTED_METHODOLOGY],
  evidencePackRef: "epack-ht-20260811-fos",
} as const;
