/**
 * Candidate Internal Interfaces for Hypertaks Founder OS Expansion
 * Contract: HT-20260811-FOS (Ticket #1 Architecture Audit)
 *
 * Note: These candidate interfaces extend the internal Founder OS capabilities
 * without modifying the 5 public skills or 4 remote MCP tools.
 */

import {
  QuerySignals,
  RetrievalDecision,
  VisualSignals,
  VisualDecision,
  CapabilityDescriptor,
  CapabilityNeed,
  ContractActivation
} from "../../../runtime/router";

import {
  MemoryScope,
  MemoryStatus,
  EvidenceSource,
  MemoryRecord,
  DecisionRecord,
  BrainPointerConfig,
  GitState,
  TestEvidence,
  AcceptanceCriterion
} from "../../../runtime/founder-brain";

// ============================================================================
// Family 1: Project Operating Context & Compilation
// ============================================================================

export interface ProjectContextManifest {
  readonly manifestId: string;
  readonly contractId: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly documentCount: 13;
  readonly documentIds: readonly string[];
  readonly approvedRoot: string;
}

export interface ContextDocumentHeader {
  readonly id: string;
  readonly version: string;
  readonly timestamp: string;
  readonly evidenceClass: "T0_SYSTEM" | "T1_BOSS_DECISION" | "T2_WORKSPACE_STANDARD" | "T3_CONTRACT" | "T4_REPO_EVIDENCE" | "T5_EXTERNAL_DATA" | "T6_GENERATED";
  readonly provenance: {
    readonly agentId: string;
    readonly sourceFile: string;
    readonly contractId: string;
  };
  readonly sourceGitState: GitState;
  readonly authority: number;
  readonly freshness: "FRESH" | "STALE" | "DEPRECATED" | "HISTORICAL";
  readonly status: "ACTIVE" | "CONTRADICTED" | "SUPERSEDED" | "ARCHIVED";
  readonly lifecycleState: "DRAFT" | "PROPOSED" | "VERIFIED" | "COMMITTED" | "RETIRED";
}

export interface ContextDocument {
  readonly header: ContextDocumentHeader;
  readonly content: string;
}

export interface ContextCompilationRequest {
  readonly contractId: string;
  readonly bossIntent: string;
  readonly activeTask: string;
  readonly tokenBudget: number;
  readonly requiredEvidenceClasses: readonly string[];
}

export interface ContextCompilationResult {
  readonly compilationId: string;
  readonly compiledPrompt: string;
  readonly tokenUsage: number;
  readonly includedDocumentIds: readonly string[];
  readonly excludedDocumentIds: readonly string[];
  readonly freshnessScore: number;
}

// ============================================================================
// Family 2: Typed Graph Ontology
// ============================================================================

export type EntityType =
  | "ENT_BOSS"
  | "ENT_SPECIALIST"
  | "ENT_CONTRACT"
  | "ENT_TASK"
  | "ENT_ARTIFACT"
  | "ENT_EVIDENCE_RECORD"
  | "ENT_CONTRADICTION"
  | "ENT_CHECKPOINT";

export interface ProjectEntity {
  readonly entityId: string;
  readonly entityType: EntityType;
  readonly label: string;
  readonly authority: number;
  readonly properties: Record<string, unknown>;
  readonly createdAt: string;
}

export type RelationType =
  | "REL_AUTHORIZES"
  | "REL_EXECUTES"
  | "REL_PRODUCES"
  | "REL_DEPENDS_ON"
  | "REL_VERIFIES"
  | "REL_CONTRADICTS"
  | "REL_SUPERSEDES";

export interface ProjectRelation {
  readonly fromId: string;
  readonly toId: string;
  readonly relationType: RelationType;
  readonly createdAt: string;
}

export type EventType =
  | "EVENT_CREATE_ENTITY"
  | "EVENT_UPDATE_ENTITY"
  | "EVENT_RELATE_ENTITIES"
  | "EVENT_CONTRADICT_FACT"
  | "EVENT_INVALIDATE_FACT"
  | "EVENT_ARCHIVE_FACT"
  | "EVENT_RECONCILE_STATE";

export interface OntologyEvent {
  readonly eventId: string;
  readonly eventType: EventType;
  readonly timestamp: string;
  readonly agentId: string;
  readonly contractId: string;
  readonly payload: Record<string, unknown>;
}

// ============================================================================
// Family 3: Knowledge Library & Methodology Engine
// ============================================================================

export interface KnowledgeModuleManifest {
  readonly moduleId: string;
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly dependencies: readonly string[];
  readonly lazyLoad: boolean;
}

export interface MethodologySelection {
  readonly selectionId: string;
  readonly taskId: string;
  readonly primaryFramework: string;
  readonly supportingFrameworks: readonly string[];
  readonly executionTier: "Nano" | "Lite" | "Standard" | "Prime" | "Hyper";
  readonly agentCount: number;
}

// ============================================================================
// Family 4: Internal Capability Facade & Action Transactions
// ============================================================================

export interface ActionTransaction {
  readonly transactionId: string;
  readonly actionType: string;
  readonly state: "PREPARE" | "PREVIEW" | "APPROVED" | "COMMITTED" | "RECONCILED" | "ABORTED";
  readonly capabilityId: string;
  readonly payload: Record<string, unknown>;
  readonly approvalEvidence: string | null;
  readonly preparedAt: string;
  readonly committedAt: string | null;
}

// ============================================================================
// Family 5: Workflows, Checkpoints & Founder Commands
// ============================================================================

export interface WorkflowDefinition {
  readonly workflowId: string;
  readonly name: string;
  readonly steps: readonly {
    readonly stepIndex: number;
    readonly name: string;
    readonly requiredCapabilities: readonly string[];
    readonly proofCriteria: string;
  }[];
}

export interface WorkflowCheckpoint {
  readonly checkpointId: string;
  readonly contractId: string;
  readonly stepIndex: number;
  readonly completedDeliverables: readonly string[];
  readonly pendingTasks: readonly string[];
  readonly lastEventId: string;
  readonly brainPointer: BrainPointerConfig;
}

export interface FounderCommand {
  readonly commandId: string;
  readonly commandType: "RESEARCH" | "STRATEGY" | "EXECUTE" | "AUDIT" | "RECONCILE";
  readonly contractId: string;
  readonly isResumable: boolean;
  readonly activeCheckpointId: string | null;
}

// ============================================================================
// Family 6: Continuity Contracts & Proof of Done
// ============================================================================

export interface ContinuationContract {
  readonly continuationId: string;
  readonly parentSessionId: string;
  readonly targetAgent: string;
  readonly activeContractId: string;
  readonly handoffSummary: string;
  readonly openBlockers: readonly string[];
  readonly verifiedCheckpoints: readonly WorkflowCheckpoint[];
}

export interface ProofOfDoneEvidence {
  readonly contractId: string;
  readonly taskId: string;
  readonly testEvidence: readonly TestEvidence[];
  readonly acceptanceCriteria: readonly AcceptanceCriterion[];
  readonly gitState: GitState;
  readonly verifiedAt: string;
  readonly isComplete: boolean;
}
