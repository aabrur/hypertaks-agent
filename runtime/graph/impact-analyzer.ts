import { LocalGraph, GraphNode } from "./graph-service";

export interface ImpactAnalysisResult {
  readonly targetNodeId: string;
  readonly directDependents: readonly string[];
  readonly transitiveDependents: readonly string[];
  readonly affectedRoutes: readonly string[];
  readonly affectedTables: readonly string[];
  readonly blastRadiusCount: number;
  readonly isHighCentralityRisk: boolean;
}

export function analyzeImpact(targetNodeId: string, graph: LocalGraph): ImpactAnalysisResult {
  const visited = new Set<string>();
  const directDependents: string[] = [];
  const affectedRoutes = new Set<string>();
  const affectedTables = new Set<string>();

  // Direct incoming edges
  const immediateIncoming = graph.getIncomingEdges(targetNodeId);
  for (const edge of immediateIncoming) {
    directDependents.push(edge.source);
  }

  // BFS for transitive reachability
  const queue = [...directDependents];
  for (const id of directDependents) visited.add(id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = graph.getNode(current);
    if (node) {
      if (node.type === "route") affectedRoutes.add(node.id);
      if (node.type === "table") affectedTables.add(node.id);
    }

    const incoming = graph.getIncomingEdges(current);
    for (const edge of incoming) {
      if (!visited.has(edge.source)) {
        visited.add(edge.source);
        queue.push(edge.source);
      }
    }
  }

  const blastRadiusCount = visited.size;
  const isHighCentralityRisk = blastRadiusCount > 10;

  return {
    targetNodeId,
    directDependents,
    transitiveDependents: Array.from(visited),
    affectedRoutes: Array.from(affectedRoutes),
    affectedTables: Array.from(affectedTables),
    blastRadiusCount,
    isHighCentralityRisk,
  };
}
