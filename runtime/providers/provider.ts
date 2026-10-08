export interface WorkerCapability {
  readonly id: string;
  readonly roleSlug: string;
  readonly displayName: string;
  readonly description: string;
  readonly provider: string;
}

export interface WorkerExecutionResult {
  readonly success: boolean;
  readonly output: string;
  readonly evidenceClass: "T6_GENERATED" | "T2_VERIFIED";
  readonly attemptedEscalations: readonly string[];
  readonly contained: boolean;
  readonly status?: "COMPLETED" | "UNAVAILABLE" | "CONTAINED" | "FAILED";
}

export interface AgentWorkerProvider {
  readonly providerId: string;
  discoverWorkers(): Promise<readonly WorkerCapability[]>;
  executeTask(
    roleSlug: string,
    brief: string,
    allowedPermissions: readonly string[],
  ): Promise<WorkerExecutionResult>;
}
