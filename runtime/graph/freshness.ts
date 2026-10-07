import * as fs from "node:fs";
import * as path from "node:path";
import { safeContextGitState } from "../founder-brain";
import { GraphMeta } from "./graph-service";

export interface GraphFreshnessStatus {
  readonly state: "FRESH" | "STALE" | "UNVERIFIED";
  readonly reason: string;
  readonly changedFiles: readonly string[];
}

export function readGraphMeta(canonicalRoot: string): GraphMeta | null {
  const metaPath = path.join(canonicalRoot, ".hypertaks", "graph", "graph.meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf8")) as GraphMeta;
  } catch {
    return null;
  }
}

export function loadHashesCache(canonicalRoot: string): Record<string, string> {
  const cachePath = path.join(canonicalRoot, ".hypertaks", "cache", "hashes.json");
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveHashesCache(canonicalRoot: string, hashes: Record<string, string>): void {
  const cacheDir = path.join(canonicalRoot, ".hypertaks", "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, "hashes.json"), JSON.stringify(hashes, null, 2) + "\n", "utf8");
}

export function evaluateGraphFreshness(
  canonicalRoot: string,
  currentFileHashes: Record<string, string>,
): GraphFreshnessStatus {
  const meta = readGraphMeta(canonicalRoot);
  if (!meta) {
    return {
      state: "UNVERIFIED",
      reason: "No graph metadata exists on disk.",
      changedFiles: Object.keys(currentFileHashes),
    };
  }

  const gitState = safeContextGitState(canonicalRoot);
  if (gitState.branch !== "unknown" && meta.branch !== gitState.branch) {
    return {
      state: "STALE",
      reason: `Graph branch (${meta.branch}) does not match current branch (${gitState.branch}).`,
      changedFiles: [],
    };
  }

  const cachedHashes = loadHashesCache(canonicalRoot);
  const changed: string[] = [];

  // Check changed or added files
  for (const [file, hash] of Object.entries(currentFileHashes)) {
    if (cachedHashes[file] !== hash) {
      changed.push(file);
    }
  }

  // Check deleted files
  for (const file of Object.keys(cachedHashes)) {
    if (!(file in currentFileHashes)) {
      changed.push(file);
    }
  }

  if (changed.length > 0) {
    return {
      state: "STALE",
      reason: `${changed.length} file(s) changed since last graph build.`,
      changedFiles: changed,
    };
  }

  return {
    state: "FRESH",
    reason: "Repository source files and git state match the recorded graph.",
    changedFiles: [],
  };
}
