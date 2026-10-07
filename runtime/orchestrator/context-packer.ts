import { TaskNode } from "./types";

export interface PackedContext {
  readonly nodeId: string;
  readonly role: string;
  readonly brief: string;
  readonly permissions: readonly string[];
  readonly relevantFiles: readonly string[];
  readonly livingDocSnippets: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly tokenBudgetEstimate: number;
}

export function packContextForNode(
  node: TaskNode,
  options?: {
    readonly relevantFiles?: readonly string[];
    readonly livingDocSnippets?: readonly string[];
    readonly acceptanceCriteria?: readonly string[];
  },
): PackedContext {
  const relevantFiles = options?.relevantFiles ?? node.inputs;
  const livingDocSnippets = options?.livingDocSnippets ?? [];
  const acceptanceCriteria = options?.acceptanceCriteria ?? node.expectedOutputs;

  const brief = `Role: ${node.role}
Task Node: ${node.id}
Assigned Inputs: ${node.inputs.join(", ") || "(none)"}
Expected Deliverables: ${node.expectedOutputs.join(", ")}
Permission Boundary: ${node.permissions.join(", ")}
`;

  // Estimate tokens (~4 characters per token)
  const fullText = `${brief} ${relevantFiles.join(" ")} ${livingDocSnippets.join(" ")} ${acceptanceCriteria.join(" ")}`;
  const tokenBudgetEstimate = Math.ceil(fullText.length / 4);

  return {
    nodeId: node.id,
    role: node.role,
    brief,
    permissions: node.permissions,
    relevantFiles,
    livingDocSnippets,
    acceptanceCriteria,
    tokenBudgetEstimate,
  };
}
