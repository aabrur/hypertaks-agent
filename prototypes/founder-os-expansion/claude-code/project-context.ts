export interface ProjectContextManifest {
  readonly manifestVersion: "1.0.0";
  readonly contractId: "HT-20260811-FOS";
  readonly documentInventory: readonly string[];
  readonly approvedRoot: string;
  readonly securityPolicy: {
    readonly secretScanning: "strict";
    readonly pathContainment: "strict";
    readonly atomicWrite: true;
  };
}

export interface ContextDocument {
  readonly id: string;
  readonly version: string;
  readonly timestamp: string;
  readonly evidenceClass: "T0_SYSTEM" | "T1_BOSS" | "T2_SPECIALIST" | "T3_CODE" | "T4_TEST" | "T5_DOC" | "T6_EXTERNAL";
  readonly provenance: {
    readonly agentId: string;
    readonly sourceFile: string;
    readonly contractId: string;
  };
  readonly authority: number;
  readonly freshness: "FRESH" | "STALE" | "DEPRECATED" | "HISTORICAL";
  readonly status: "ACTIVE" | "CONTRADICTED" | "SUPERSEDED" | "ARCHIVED";
  readonly lifecycleState: "DRAFT" | "PROPOSED" | "VERIFIED" | "COMMITTED" | "RETIRED";
}

export interface ContextCompilationRequest {
  readonly projectRoot: string;
  readonly scopeFilter?: readonly string[];
  readonly maxDocuments?: number;
  readonly includeContradictions?: boolean;
}

export interface ContextCompilationResult {
  readonly success: boolean;
  readonly compiledAt: string;
  readonly manifest: ProjectContextManifest;
  readonly documents: readonly ContextDocument[];
  readonly totalTokenEstimate: number;
}
