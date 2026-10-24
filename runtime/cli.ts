import * as fs from "node:fs";
import * as path from "node:path";
import { resolveCanonicalRoot, readRepoIdentity } from "./repo-identity";
import { readStoredGrant, mintBootstrapProof, verifyBootstrapGrant } from "./repo-bootstrap";
import { runPreflight, autoInitializeOrSync } from "./repo-lifecycle";
import { resolveWithinApprovedRoot, PROJECT_OPERATING_CONTEXT_FILES } from "./founder-brain";
import { scanRepository } from "./repository-intelligence/scanner";
import { writeInventories } from "./repository-intelligence/inventory-writer";
import { compileArchitecturePack } from "./repository-intelligence/architecture-compiler";
import { enrichProjectOperatingContext } from "./repository-intelligence/context-enricher";
import { verifyProjectOperatingContext } from "./repository-intelligence/context-verifier";
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
      enrichProjectOperatingContext(canonicalRoot, identity, scan);
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

    case "scan": {
      const repoIdx = args.indexOf("--repo");
      const depthIdx = args.indexOf("--depth");
      const deep = args.includes("--deep") || (depthIdx !== -1 && args[depthIdx + 1] === "deep");
      const writeContext = args.includes("--write-context");
      const json = args.includes("--json");
      const targetRaw = repoIdx !== -1 && args[repoIdx + 1] ? args[repoIdx + 1] : cwd;

      let scanRoot: string;
      let preflight: ReturnType<typeof runPreflight>;
      let scan: ReturnType<typeof scanRepository>;
      try {
        scanRoot = resolveCanonicalRoot(String(targetRaw));
        preflight = runPreflight(scanRoot);
        scan = scanRepository(scanRoot, { depth: deep ? "deep" : "shallow" });
      } catch (error) {
        console.error(`INVALID_TARGET: cannot screen repository root '${String(targetRaw)}'. ${error instanceof Error ? error.message : String(error)}`);
        return 1;
      }

      if (writeContext) {
        let contractId: string | undefined;
        let approval: string | undefined;

        const contractIdIdx = args.indexOf("--contract-id");
        if (contractIdIdx !== -1 && args[contractIdIdx + 1]) {
          contractId = args[contractIdIdx + 1];
        }

        const approvalIdx = args.indexOf("--approval");
        if (approvalIdx !== -1 && args[approvalIdx + 1]) {
          approval = args[approvalIdx + 1];
        }

        const approveIdx = args.indexOf("--approve");
        if (approveIdx !== -1 && args[approveIdx + 1]) {
          contractId = contractId ?? args[approveIdx + 1];
          approval = approval ?? `APPROVE ${args[approveIdx + 1]}`;
        }

        if (!contractId || !approval) {
          console.error("APPROVAL_REQUIRED: --write-context requires --contract-id <id> --approval 'APPROVE <id>' (or --approve <id>) to authorize .hypertaks creation.");
          return 2;
        }

        if (!approval.startsWith("APPROVE") || !approval.includes(contractId)) {
          console.error(`APPROVAL_INVALID: Approval '${approval}' does not match contract '${contractId}'.`);
          return 2;
        }

        const proof = mintBootstrapProof(contractId, {
          operatorType: "LOCAL_OPERATOR_CLI",
          approvalSignature: approval,
          messageId: `operator-cli:${contractId}`,
        });
        const result = await autoInitializeOrSync(scanRoot, { proof, contractId, forceRescan: true });
        if (result.success) {
          const bootstrapCreated = result.bootstrapResult?.createdFiles.length ?? 0;
          const bootstrapPreserved = result.bootstrapResult?.preservedFiles.length ?? 0;
          const enrichCreated = result.enrichmentResult?.writtenFiles.length ?? 0;
          const enrichPreserved = result.enrichmentResult?.preservedFiles.length ?? 0;
          const created = bootstrapCreated + enrichCreated;
          const preserved = bootstrapPreserved + enrichPreserved;
          if (json) {
            console.log(JSON.stringify({ outcome: "written", repoId: result.preflight.repoId, filesScanned: scan.files.length, createdFiles: created, preservedFiles: preserved, message: result.message }, null, 2));
          } else {
            console.log(`Hypertaks screened ${scan.files.length} files and created/updated the operating vault for ${result.preflight.repoId}.`);
            console.log(`Created ${created} file(s), preserved ${preserved} file(s).`);
            console.log(result.message);
          }
          return 0;
        }
        if (json) console.error(JSON.stringify({ outcome: "failed", error: result.error ?? result.message }, null, 2));
        else console.error(`Scan write failed: ${result.error ?? result.message}`);
        return 1;
      }

      // Read-only path: print findings and a concise execution plan, no writes.
      if (json) {
        console.log(JSON.stringify({
          read_only: true,
          deep,
          repoId: preflight.repoId,
          canonicalRoot: scanRoot,
          gitRepository: preflight.isGitRepo,
          vaultState: preflight.state,
          filesScanned: scan.files.length,
          filesParsed: scan.parsedFiles.length,
          assets: scan.assets.length,
          secretWarnings: scan.secretWarnings.length,
          coverage: scan.coverage,
          dependencies: scan.dependencies,
          stack: summarizeScan(scan),
          plan: scanExecutionPlan(preflight, scan, false)
        }, null, 2));
      } else {
        console.log(`Hypertaks Repository Screening${deep ? " (deep)" : " (shallow)"} - READ-ONLY`);
        console.log(`Repository: ${preflight.repoId}`);
        console.log(`Canonical Root: ${scanRoot}`);
        console.log(`Git Repository: ${preflight.isGitRepo}`);
        console.log(`Vault State: ${preflight.state}`);
        console.log(`Files: ${scan.files.length} scanned, ${scan.parsedFiles.length} parsed; assets ${scan.assets.length}; secret warnings ${scan.secretWarnings.length}`);
        console.log(`Coverage: ${scan.coverage.totalParsed}/${scan.coverage.totalScanned} parsed (${(scan.coverage.coverageRatio * 100).toFixed(1)}%), ${scan.coverage.unresolvedImports.length} unresolved imports`);
        console.log(`Stack: ${summarizeScan(scan)}`);
        console.log("");
        console.log(`Execution plan:`);
        for (const line of scanExecutionPlan(preflight, scan, false)) console.log(`  - ${line}`);
        console.log("");
        console.log("No writes performed. Approve context creation with 'hypertaks scan --repo <path> --depth deep --write-context --contract-id <id> --approval \"APPROVE <id>\"'.");
      }
      return 0;
    }

    case "context": {
      const sub = args[1] || "verify";
      if (sub === "verify") {
        const repoIdx = args.indexOf("--repo");
        const targetRaw = repoIdx !== -1 && args[repoIdx + 1] ? args[repoIdx + 1] : cwd;
        let targetRoot: string;
        try {
          targetRoot = resolveCanonicalRoot(String(targetRaw));
        } catch {
          console.error(`INVALID_TARGET: cannot resolve repository root '${String(targetRaw)}'.`);
          return 1;
        }

        const identity = readRepoIdentity(targetRoot);
        if (!identity) {
          console.error("CONTEXT_VERIFY_FAILED: Repository vault is NOT_INITIALIZED.");
          return 1;
        }

        const report = verifyProjectOperatingContext(targetRoot, identity);

        if (args.includes("--json")) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          console.log(`Hypertaks Layered Context Verification for ${identity.repo_id}`);
          console.log(`Overall Status: ${report.passed ? "PASSED" : "FAILED"}`);
          console.log(`Documents: ${report.verifiedDocuments} verified, ${report.partiallyVerifiedDocuments} partially verified, ${report.draftDocuments} draft, ${report.missingDocuments.length} missing.`);
          for (const layer of report.layers) {
            console.log(`  - Layer ${layer.layer}: ${layer.passed ? "PASS" : "FAIL"} (${layer.message})`);
            for (const w of layer.warnings) console.log(`      [WARN] ${w}`);
            for (const d of layer.details) console.log(`      [ERR]  ${d}`);
          }
          if (report.passed) {
            console.log("All 13 canonical Project Operating Context documents verified across all layers.");
          }
        }
        return report.passed ? 0 : 1;
      }
      console.log("Usage: hypertaks context verify [--repo <path>] [--json]");
      return 0;
    }

    default: {
      console.log(`Hypertaks CLI`);
      console.log("Commands: preflight, init, auto-init, status, sync, architecture, graph, scan, context verify");
      console.log("scan: hypertaks scan [--repo <path>] [--depth deep] [--write-context --contract-id <id> --approval <sig>] [--json]");
      console.log("context: hypertaks context verify [--repo <path>] [--json]");
      return 0;
    }
  }
}

function summarizeScan(scan: ReturnType<typeof scanRepository>): string {
  const counts = new Map<string, number>();
  for (const file of scan.files) {
    const key = String(file.category);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([category, count]) => `${category}=${count}`);
  return top.join(", ") || "none";
}

function scanExecutionPlan(
  preflight: ReturnType<typeof runPreflight>,
  scan: ReturnType<typeof scanRepository>,
  writeContext: boolean,
): string[] {
  const lines: string[] = [];
  lines.push(`Screened ${scan.files.length} files; ${scan.parsedFiles.length} passed static parsing.`);
  if (scan.secretWarnings.length > 0) {
    lines.push(`Security: ${scan.secretWarnings.length} potential secret(s) detected; review before any write.`);
  }
  if (preflight.isGitRepo) {
    lines.push(`Version control present; screening is confined to the canonical root.`);
  } else {
    lines.push(`No Git repository detected at the target; relationships will be filesystem-derived.`);
  }
  if (preflight.state === "HEALTHY" && preflight.staleIndexes.length === 0) {
    lines.push(`Operating vault already healthy; a write-context run would update only affected evidence.`);
  } else {
    lines.push(`Operating vault state: ${preflight.state}.`);
  }
  if (writeContext) {
    lines.push(`Authorized write scope: .hypertaks/** only (create/update); source writes, deploy, spend, and publish are forbidden by the grant.`);
  } else {
    lines.push(`Next (optional): approve with --write-context --approve <contractId> to create the .hypertaks workspace and 13 context documents.`);
  }
  return lines;
}

if (require.main === module) {
  runCli(process.argv.slice(2)).then((exitCode: number) => {
    process.exitCode = exitCode;
  });
}
