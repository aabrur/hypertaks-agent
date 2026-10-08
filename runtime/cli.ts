import * as path from "node:path";
import { resolveCanonicalRoot, readRepoIdentity } from "./repo-identity";
import { readStoredGrant, mintBootstrapProof, verifyBootstrapGrant } from "./repo-bootstrap";
import { runPreflight, autoInitializeOrSync } from "./repo-lifecycle";
import { scanRepository } from "./repository-intelligence/scanner";
import { writeInventories } from "./repository-intelligence/inventory-writer";
import { compileArchitecturePack } from "./repository-intelligence/architecture-compiler";
import { buildLocalGraph, saveLocalGraph } from "./graph/local-graph-provider";
import { saveHashesCache } from "./graph/freshness";
import { analyzeImpact } from "./graph/impact-analyzer";

export async function runCli(args: string[]): Promise<number> {
  const command = args[0] || "status";
  const cwd = process.cwd();
  const canonicalRoot = resolveCanonicalRoot(cwd);

  switch (command) {
    case "preflight": {
      const preflight = runPreflight(canonicalRoot);
      if (args.includes("--json")) {
        console.log(JSON.stringify(preflight, null, 2));
      } else {
        console.log(`Hypertaks Preflight Report`);
        console.log(`Repository: ${preflight.repoId}`);
        console.log(`Canonical Root: ${preflight.canonicalRoot}`);
        console.log(`Vault State: ${preflight.state}`);
        console.log(`Git Repository: ${preflight.isGitRepo}`);
        console.log(`Requires Approval: ${preflight.requiresApproval}`);
        console.log(`Planned Actions: ${preflight.plannedActions.length}`);
        for (const action of preflight.plannedActions) {
          console.log(`  - [${action.actionKind}] ${action.target}: ${action.description}`);
        }
      }
      return 0;
    }

    case "init":
    case "auto-init": {
      const approveIdx = args.indexOf("--approve");
      const hasApprove = approveIdx !== -1;
      const contractArg = hasApprove && args[approveIdx + 1] ? args[approveIdx + 1] : undefined;
      const contractId: string = contractArg ? String(contractArg) : "HT-USER-INIT";

      if (!hasApprove) {
        const preflight = runPreflight(canonicalRoot);
        if (preflight.state === "HEALTHY" && preflight.staleIndexes.length === 0) {
          console.log(`Repository Operating Vault already healthy for ${preflight.repoId}. Zero writes required.`);
          return 0;
        }

        console.log(`Hypertaks Repository Preflight`);
        console.log(`Repository: ${preflight.repoId}`);
        console.log(`State: ${preflight.state}`);
        console.log(`Planned Actions:`);
        for (const action of preflight.plannedActions) {
          console.log(`  - [${action.actionKind}] ${action.target}`);
        }
        console.log("");
        console.log(`APPROVAL_REQUIRED: Filesystem mutation requires explicit Boss approval.`);
        console.log(`Run 'hypertaks ${command} --approve <contractId>' to authorize initialization.`);
        return 2;
      }

      const proof = mintBootstrapProof(contractId, "cli-user-turn");
      const result = await autoInitializeOrSync(canonicalRoot, { proof, contractId });

      if (result.success) {
        console.log(`Repository Operating Vault initialized for ${result.preflight.repoId}`);
        if (result.bootstrapResult) {
          console.log(`Created ${result.bootstrapResult.createdFiles.length} files, preserved ${result.bootstrapResult.preservedFiles.length} files.`);
        }
        console.log(result.message);
        return 0;
      }

      console.error(`Init failed: ${result.error ?? result.message}`);
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
      const grantValid = grant ? verifyBootstrapGrant(canonicalRoot, identity.repo_id, grant).valid : false;
      console.log(`Hypertaks Repository Operating Vault`);
      console.log(`Repository: ${identity.display_name} (${identity.repo_id})`);
      console.log(`Version: ${identity.hypertaks_product_version}`);
      console.log(`Grant: ${grantValid && !grant?.revoked ? "VALID" : "REVOKED / MISSING"}`);
      return 0;
    }

    case "sync":
    case "architecture": {
      const identity = readRepoIdentity(canonicalRoot);
      if (!identity) {
        console.log("Hypertaks Repository Operating Vault: NOT_INITIALIZED");
        console.log("Run 'hypertaks init --approve <contractId>' to initialize repository vault.");
        return 1;
      }
      const storedGrant = readStoredGrant(canonicalRoot);
      const verification = verifyBootstrapGrant(canonicalRoot, identity.repo_id, storedGrant);
      if (!verification.valid) {
        console.error(`PERMISSION_DENIED: Stored grant invalid (${verification.reason ?? "missing"}). Run 'hypertaks init --approve' to re-authorize.`);
        return 1;
      }

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

      if (sub === "impact" || sub === "freshness") {
        const identity = readRepoIdentity(canonicalRoot);
        if (!identity) {
          console.log("Hypertaks Repository Operating Vault: NOT_INITIALIZED");
          console.log("Run 'hypertaks init' to initialize repository vault.");
          return 0;
        }
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
          console.log(`Direct dependents: ${impact.directDependents.length}`);
          console.log(`Transitive blast radius: ${impact.transitiveDependents.length}`);
          console.log(`Total reachable: ${impact.blastRadiusCount}`);
          return 0;
        }

        if (sub === "freshness") {
          console.log(`Graph node count: ${graph.getNodes().length}`);
          console.log(`Graph edge count: ${graph.getEdges().length}`);
          return 0;
        }
      }

      console.log("Usage: hypertaks graph [impact <nodeId> | freshness]");
      return 0;
    }

    default: {
      console.log(`Hypertaks CLI`);
      console.log("Commands: preflight, init, auto-init, status, sync, architecture, graph");
      return 0;
    }
  }
}
