import { AgentWorkerProvider, WorkerCapability, WorkerExecutionResult } from "./provider";

export class AgencyAgentsProvider implements AgentWorkerProvider {
  public readonly providerId = "agency-agents";

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
      };
    }

    // Simulate worker execution & injection containment check
    const escalations: string[] = [];

    // Check if brief or simulated worker attempts to bypass T1 authority
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
      };
    }

    return {
      success: true,
      output: `Executed ${worker.displayName} within permissions: [${allowedPermissions.join(", ")}]. Deliverables prepared as T6 evidence.`,
      evidenceClass: "T6_GENERATED",
      attemptedEscalations: [],
      contained: true,
    };
  }
}
