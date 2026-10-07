import { TaskDag, TaskNode } from "./types";

export class DagBuilder {
  private readonly nodes = new Map<string, TaskNode>();

  public addNode(node: TaskNode): this {
    this.nodes.set(node.id, { ...node });
    return this;
  }

  public computeWaves(): readonly (readonly string[])[] {
    // 1. Build adjacency (parent -> children) and inDegree counts
    const adjacency = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    for (const id of this.nodes.keys()) {
      adjacency.set(id, new Set());
      inDegree.set(id, 0);
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.dependencies) {
        if (this.nodes.has(dep)) {
          const children = adjacency.get(dep)!;
          if (!children.has(node.id)) {
            children.add(node.id);
            inDegree.set(node.id, inDegree.get(node.id)! + 1);
          }
        }
      }
    }

    // 2. Kahn's algorithm by wave level
    const waves: string[][] = [];
    let remaining = this.nodes.size;
    const processed = new Set<string>();

    while (remaining > 0) {
      const currentWave: string[] = [];

      for (const [id, deg] of inDegree.entries()) {
        if (deg === 0 && !processed.has(id)) {
          currentWave.push(id);
        }
      }

      if (currentWave.length === 0) {
        throw new Error("CYCLIC_DEPENDENCY_DETECTED: DAG contains an unresolvable cycle.");
      }

      for (const id of currentWave) {
        processed.add(id);
        const children = adjacency.get(id);
        if (children) {
          for (const child of children) {
            inDegree.set(child, inDegree.get(child)! - 1);
          }
        }
      }

      waves.push(currentWave);
      remaining -= currentWave.length;
    }

    return waves;
  }

  public build(runId: string, repoId: string, contractId: string, tier: TaskDag["tier"]): TaskDag {
    // Validate acyclic by computing waves
    this.computeWaves();
    return {
      runId,
      repoId,
      contractId,
      tier,
      nodes: Array.from(this.nodes.values()),
    };
  }
}
