export type ContractTier = "Nano" | "Lite" | "Standard" | "Prime" | "Hyper" | "Omega";

export type TaskNodeStatus =
  | "PENDING"
  | "BLOCKED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export interface TaskNode {
  readonly id: string;
  readonly role: string;
  readonly provider: string;
  readonly dependencies: readonly string[];
  readonly inputs: readonly string[];
  readonly expectedOutputs: readonly string[];
  readonly permissions: readonly string[];
  readonly retryLimit: number;
  status: TaskNodeStatus;
  outputResult?: string | undefined;
  error?: string | undefined;
}

export interface TaskDag {
  readonly runId: string;
  readonly repoId: string;
  readonly contractId: string;
  readonly tier: ContractTier;
  readonly nodes: readonly TaskNode[];
}

export interface OrchestratorRunMeta {
  readonly runId: string;
  readonly repoId: string;
  readonly contractId: string;
  readonly tier: ContractTier;
  readonly status: "INITIALIZED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "PAUSED";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedNodes: readonly string[];
  readonly failedNodes: readonly string[];
}

export interface CheckpointData {
  readonly runId: string;
  readonly contractId: string;
  readonly timestamp: string;
  readonly completedNodeIds: readonly string[];
  readonly currentWaveIndex: number;
  readonly repoFingerprint: string;
}

export interface AgentHandoff {
  readonly fromAgent: string;
  readonly toAgent: string;
  readonly deliverable: string;
  readonly decisions: readonly string[];
  readonly evidence: readonly string[];
  readonly unresolved: readonly string[];
  readonly changedFiles: readonly string[];
  readonly timestamp: string;
}
