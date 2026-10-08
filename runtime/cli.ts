import * as path from "node:path";
import { resolveCanonicalRoot, loadOrInitRepoIdentity, readRepoIdentity } from "./repo-identity";
import { issueBootstrapGrant, bootstrapRepoVault, readStoredGrant } from "./repo-bootstrap";
import { scanRepository } from "./repository-intelligence/scanner";
import { writeInventories } from "./repository-intelligence/inventory-writer";
import { compileArchitecturePack } from "./repository-intelligence/architecture-compiler";
import { buildLocalGraph, saveLocalGraph } from "./graph/local-graph-provider";
import { evaluateGraphFreshness, saveHashesCache } from "./graph/freshness";
import { analyzeImpact } from "./graph/impact-analyzer";

export async function runCli(args: string[]): Promise<number> {
  const command = args[0] || "status";
  const cwd = process.cwd();
  const canonicalRoot = resolveCanonicalRoot(cwd);

  switch (command) {
    case "init": {
      const { identity } = loadOrInitRepoIdentity(canonicalRoot);
      const grant = issueBootstrapGrant(canonicalRoot, identity.repo_id, "HT-CLI-INIT");
      const result = bootstrapRepoVault(canonicalRoot, grant);
      if (result.success) {
        console.log(`Repository Operating Vault initialized for ${identity.repo_id}`);
        console.log(`Created ${result.createdFiles.length} files, preserved ${result.preservedFiles.length} files.`);
        return 0;
      }
      console.error(`Init failed: ${result.error}`);
      return 1;
    }

    case "status": {
      const identity = readRepoIdentity(canonicalRoot);
      if (!identity) {
        console.log("Hypertaks Repository Operating Vault: NOT_INITIALIZED");
        console.log("Run 'hypertaks init' to initialize repository vault.");
        return 0;
      }
      const grant = readStoredGrant(canonicalRoot);
      console.log(`Hypertaks Repository Operating Vault`);
      console.log(`Repository: ${identity.display_name} (${identity.repo_id})`);
      console.log(`Version: ${identity.hypertaks_product_version}`);
      console.log(`Grant: ${grant && !grant.revoked ? "VALID" : "REVOKED / MISSING"}`);
      return 0;
    }

    case "sync":
    case "architecture": {
      const { identity } = loadOrInitRepoIdentity(canonicalRoot);
      const scan = scanRepository(canonicalRoot);
      writeInventories(canonicalRoot, scan);
      compileArchitecturePack(canonicalRoot, identity, scan);
      const graph = buildLocalGraph(canonicalRoot, scan);
      saveLocalGraph(canonicalRoot, identity.repo_id, graph);
      const hashes: Record<string, string> = {};
      for (const f of scan.files) hashes[f.relativePath] = f.sha256;
      saveHashesCache(canonicalRoot, hashes);
      console.log(`Sync completed: ${scan.files.length} files, ${scan.parsedFiles.length} parsed.`);
      return 0;
    }

    case "graph": {
      const sub = args[1] || "status";
      const { identity } = loadOrInitRepoIdentity(canonicalRoot);
      const scan = scanRepository(canonicalRoot);
      const graph = buildLocalGraph(canonicalRoot, scan);

      if (sub === "impact") {
        const target = args[2];
        if (!target) {
          console.error("Usage: hypertaks graph impact <nodeId>");
          return 1;
        }
        const impact = analyzeImpact(target, graph);
        console.log(`Impact for ${target}:`);
        console.log(`Direct dependents: ${impact.directDependents.join(", ") || "(none)"}`);
        console.log(`Blast radius: ${impact.blastRadiusCount}`);
        return 0;
      }

      if (sub === "freshness") {
        const hashes: Record<string, string> = {};
        for (const f of scan.files) hashes[f.relativePath] = f.sha256;
        const fresh = evaluateGraphFreshness(canonicalRoot, hashes);
        console.log(`Graph freshness: ${fresh.state} (${fresh.reason})`);
        return 0;
      }

      saveLocalGraph(canonicalRoot, identity.repo_id, graph);
      const hashes: Record<string, string> = {};
      for (const f of scan.files) hashes[f.relativePath] = f.sha256;
      saveHashesCache(canonicalRoot, hashes);
      console.log(`Local graph generated: ${graph.getNodes().length} nodes, ${graph.getEdges().length} edges.`);
      return 0;
    }

    default:
      console.log(`Unknown command: ${command}`);
      console.log("Available commands: init, status, sync, architecture, graph [impact|freshness]");
      return 1;
  }
}

if (require.main === module) {
  runCli(process.argv.slice(2)).then((code) => process.exit(code));
}
