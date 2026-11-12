import * as fs from "node:fs";
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

  // Estimate tokens (~4 characters per token, including on-disk file byte length up to 256 KB per file)
  let fileChars = 0;
  for (const fileRef of relevantFiles) {
    try {
      if (fs.existsSync(fileRef)) {
        const stat = fs.statSync(fileRef);
        if (stat.isFile()) {
          fileChars += Math.min(stat.size, 256 * 1024) + fileRef.length;
          continue;
        }
      }
    } catch {
      // Fall back to path string length when virtual or unreadable
    }
    fileChars += fileRef.length;
  }
  const metadataText = `${brief} ${livingDocSnippets.join(" ")} ${acceptanceCriteria.join(" ")}`;
  const tokenBudgetEstimate = Math.ceil((metadataText.length + fileChars) / 4);

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
