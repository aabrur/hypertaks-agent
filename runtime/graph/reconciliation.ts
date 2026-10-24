import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryScanResult } from "../repository-intelligence/scanner";
import { RepoIdentity } from "../repo-identity";
import { LocalGraph, GraphMeta } from "./graph-service";
import {
  evaluateGraphFreshness,
  loadHashesCache,
  saveHashesCache,
  readGraphMeta,
  GraphFreshnessStatus,
} from "./freshness";
import {
  buildLocalGraph,
  saveLocalGraph,
  loadLocalGraphFromDisk,
} from "./local-graph-provider";
import { safeContextGitState, ContextGitState } from "../founder-brain";

export interface ReconciledIntelligence {
  readonly graphStatus: "FRESH" | "STALE" | "REBUILT" | "REUSED" | "UNVERIFIED";
  readonly wasRebuilt: boolean;
  readonly graph: LocalGraph;
  readonly meta: GraphMeta | null;
  readonly changedFiles: readonly string[];
  readonly gitState: ContextGitState;
  readonly brainFactsCount: number;
  readonly brainDecisions: readonly string[];
}

/**
 * Reconciles the local graph and brain memory before context enrichment.
 * Validates repository identity, git state, and file freshness.
 * If the graph is already fresh, reuses it without unnecessary rebuilds.
 */
export function reconcileGraphAndBrain(
  canonicalRoot: string,
  identity: RepoIdentity,
  scan: RepositoryScanResult,
): ReconciledIntelligence {
  const gitState = safeContextGitState(canonicalRoot);
  const currentFileHashes: Record<string, string> = {};
  for (const f of scan.files) {
    currentFileHashes[f.relativePath] = f.sha256;
  }

  const freshness = evaluateGraphFreshness(canonicalRoot, currentFileHashes);
  const existingMeta = readGraphMeta(canonicalRoot);

  let graph: LocalGraph;
  let status: "FRESH" | "STALE" | "REBUILT" | "REUSED" | "UNVERIFIED" = freshness.state;
  let wasRebuilt = false;

  if (freshness.state === "FRESH") {
    const loaded = loadLocalGraphFromDisk(canonicalRoot);
    if (loaded && loaded.getNodes().length > 0) {
      graph = loaded;
      status = "REUSED";
      wasRebuilt = false;
    } else {
      graph = buildLocalGraph(canonicalRoot, scan);
      saveLocalGraph(canonicalRoot, identity.repo_id, graph);
      saveHashesCache(canonicalRoot, currentFileHashes);
      status = "REBUILT";
      wasRebuilt = true;
    }
  } else {
    // STALE or UNVERIFIED
    graph = buildLocalGraph(canonicalRoot, scan);
    saveLocalGraph(canonicalRoot, identity.repo_id, graph);
    saveHashesCache(canonicalRoot, currentFileHashes);
    wasRebuilt = true;
  }

  // Inspect Brain facts if .hypertaks/brain exists
  let brainFactsCount = 0;
  const brainDecisions: string[] = [];
  const brainDir = path.join(canonicalRoot, ".hypertaks", "brain");
  if (fs.existsSync(brainDir)) {
    try {
      const entries = fs.readdirSync(brainDir);
      brainFactsCount = entries.filter((e) => e.endsWith(".json") || e.endsWith(".md")).length;
    } catch {
      brainFactsCount = 0;
    }
  }

  const updatedMeta = readGraphMeta(canonicalRoot) ?? existingMeta;

  return {
    graphStatus: status,
    wasRebuilt,
    graph,
    meta: updatedMeta,
    changedFiles: freshness.changedFiles,
    gitState,
    brainFactsCount,
    brainDecisions,
  };
}
