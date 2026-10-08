import { AgentWorkerProvider, WorkerCapability, WorkerExecutionResult } from "./provider";

export type AgencyWorkerMode = "real" | "simulation";

export type WorkerTransport = (
  roleSlug: string,
  brief: string,
  allowedPermissions: readonly string[]
) => Promise<string>;

export interface AgencyAgentsProviderOptions {
  readonly mode?: AgencyWorkerMode;
  readonly transport?: WorkerTransport;
}

export class AgencyAgentsProvider implements AgentWorkerProvider {
  public readonly providerId = "agency-agents";
  public readonly mode: AgencyWorkerMode;
  private readonly transport: WorkerTransport | undefined;

  private readonly catalog = new Map<string, WorkerCapability>([
    [
      "backend-architect",
      {
        id: "agency:engineering:backend-architect",
        roleSlug: "backend-architect",
        displayName: "Agency Backend Architect",
        description: "Designs system APIs, database schemas, and microservice topologies.",
        provider: "agency-agents",
      },
    ],
    [
      "frontend-specialist",
      {
        id: "agency:engineering:frontend-specialist",
        roleSlug: "frontend-specialist",
        displayName: "Agency Frontend Specialist",
        description: "Implements responsive UI components and state management.",
        provider: "agency-agents",
      },
    ],
    [
      "security-auditor",
      {
        id: "agency:security:security-auditor",
        roleSlug: "security-auditor",
        displayName: "Agency Security Auditor",
        description: "Audits permission boundaries and scans for vulnerabilities.",
        provider: "agency-agents",
      },
    ],
  ]);

  constructor(options?: AgencyAgentsProviderOptions) {
    this.mode =
      options?.mode ??
      (process.env.HYPERTAKS_PROVIDER_MODE === "simulation" ? "simulation" : "real");
    this.transport = options?.transport;
  }

  public async discoverWorkers(): Promise<readonly WorkerCapability[]> {
    return Array.from(this.catalog.values());
  }

  public async executeTask(
    roleSlug: string,
    brief: string,
    allowedPermissions: readonly string[],
  ): Promise<WorkerExecutionResult> {
    const worker = this.catalog.get(roleSlug);
    if (!worker) {
      return {
        success: false,
        output: `Worker '${roleSlug}' not found in Agency Agents catalog.`,
        evidenceClass: "T6_GENERATED",
        attemptedEscalations: [],
        contained: true,
        status: "FAILED",
      };
    }

    // 1. Mandatory injection containment check on brief & intent
    const escalations: string[] = [];
    if (/Boss already approved/i.test(brief) || /deploy now/i.test(brief)) {
      escalations.push("UNAUTHORIZED_T1_AUTHORITY_SPOOF");
    }

    if (escalations.length > 0) {
      return {
        success: true,
        output: `[GOVERNANCE INTERCEPT]: Specialist output contained. Attempted escalations blocked: ${escalations.join(", ")}. Technical evidence extracted safely.`,
        evidenceClass: "T6_GENERATED",
        attemptedEscalations: escalations,
        contained: true,
        status: "CONTAINED",
      };
    }

    // 2. Real vs Simulation execution boundary
    if (this.mode === "real") {
      if (!this.transport) {
        return {
          success: false,
          output: `PROVIDER_UNAVAILABLE: Agency Agents real execution transport is not configured for ${worker.displayName}.`,
          evidenceClass: "T6_GENERATED",
          attemptedEscalations: [],
          contained: true,
          status: "UNAVAILABLE",
        };
      }

      try {
        const rawOutput = await this.transport(roleSlug, brief, allowedPermissions);
        return {
          success: true,
          output: rawOutput,
          evidenceClass: "T6_GENERATED",
          attemptedEscalations: [],
          contained: true,
          status: "COMPLETED",
        };
      } catch (err: any) {
        return {
          success: false,
          output: `Worker execution failed: ${err?.message ?? String(err)}`,
          evidenceClass: "T6_GENERATED",
          attemptedEscalations: [],
          contained: true,
          status: "FAILED",
        };
      }
    }

    // 3. Isolated test simulation mode
    return {
      success: true,
      output: `[SIMULATION]: Executed ${worker.displayName} within permissions: [${allowedPermissions.join(", ")}]. Deliverables prepared as T6 evidence.`,
      evidenceClass: "T6_GENERATED",
      attemptedEscalations: [],
      contained: true,
      status: "COMPLETED",
    };
  }
}
