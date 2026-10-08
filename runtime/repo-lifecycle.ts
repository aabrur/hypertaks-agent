import * as fs from "node:fs";
import * as path from "node:path";
import {
  resolveCanonicalRoot,
  readRepoIdentity,
  createRepoIdentity,
  computeRootFingerprint,
} from "./repo-identity";
import {
  readStoredGrant,
  verifyBootstrapGrant,
  issueBootstrapGrant,
  bootstrapRepoVault,
  BootstrapResult,
} from "./repo-bootstrap";
import {
  resolveWithinApprovedRoot,
  BossApprovalProof,
  PROJECT_OPERATING_CONTEXT_FILES,
} from "./founder-brain";
import { scanRepository } from "./repository-intelligence/scanner";
import { compileArchitecturePack } from "./repository-intelligence/architecture-compiler";
import { writeInventories } from "./repository-intelligence/inventory-writer";
import { buildLocalGraph, saveLocalGraph } from "./graph/local-graph-provider";
import { evaluateGraphFreshness, saveHashesCache, loadHashesCache } from "./graph/freshness";

export type VaultState =
  | "UNINITIALIZED"
  | "HEALTHY"
  | "STALE_INDEXES"
  | "CORRUPTED_OR_PARTIAL"
  | "REBIND_DETECTED"
  | "READ_ONLY_REPO";

export interface PlannedAction {
  readonly actionKind:
    | "create_vault_directory"
    | "create_file"
    | "preserve_file"
    | "build_graph_and_architecture"
    | "rebind_repo_identity"
    | "require_t1_approval";
  readonly target: string;
  readonly description: string;
}

export interface PreflightReport {
  readonly repoId: string;
  readonly canonicalRoot: string;
  readonly state: VaultState;
  readonly isGitRepo: boolean;
  readonly existingVault: boolean;
  readonly existingGrant: boolean;
  readonly missingRequiredFiles: readonly string[];
  readonly staleIndexes: readonly string[];
  readonly plannedActions: readonly PlannedAction[];
  readonly requiresApproval: boolean;
  readonly approvalPrompt: string;
}

export interface AutoInitOptions {
  readonly proof?: BossApprovalProof | null | undefined;
  readonly agentName?: string | undefined;
  readonly contractId?: string | undefined;
  readonly forceRescan?: boolean | undefined;
}

export interface LifecycleResult {
  readonly success: boolean;
  readonly status: "READY" | "AWAITING_APPROVAL" | "DEGRADED" | "ERROR";
  readonly preflight: PreflightReport;
  readonly bootstrapResult?: BootstrapResult | undefined;
  readonly message: string;
  readonly error?: string | undefined;
}

const CRITICAL_VAULT_FILES = [
  "repo.json",
  "VERSION",
  "README.md",
  "bootstrap.json",
  "status.json",
  "state/bootstrap-grant.json",
  "ARCHITECTURE.md",
  "FUNCTION-MAP.md",
  "DATA-MODEL.md",
  "NETWORK-DEPENDENCIES.md",
  "ASSET-INDEX.md",
];

const LOCK_FILE_NAME = ".lifecycle.lock";
const LOCK_TIMEOUT_MS = 30_000;

export function detectRepositoryRoot(startPath: string): {
  canonicalRoot: string;
  isGit: boolean;
} {
  const canonicalRoot = resolveCanonicalRoot(startPath);
  const gitDir = path.join(canonicalRoot, ".git");
  const isGit = fs.existsSync(gitDir);
  return { canonicalRoot, isGit };
}

export function runPreflight(projectRoot: string): PreflightReport {
  const { canonicalRoot, isGit } = detectRepositoryRoot(projectRoot);
  const dotHypertaksPath = path.join(canonicalRoot, ".hypertaks");
  const existingVault = fs.existsSync(dotHypertaksPath);

  const existingIdentity = readRepoIdentity(canonicalRoot);
  const effectiveIdentity = existingIdentity ?? createRepoIdentity(canonicalRoot);
  const repoId = effectiveIdentity.repo_id;

  if (!existingVault) {
    const plannedActions: PlannedAction[] = [
      {
        actionKind: "create_vault_directory",
        target: ".hypertaks",
        description: "Initialize Repository Operating Vault root directory",
      },
      {
        actionKind: "require_t1_approval",
        target: "T1_BOSS_TURN",
        description: "Authentic Boss approval proof is required for filesystem writes",
      },
    ];

    for (const f of CRITICAL_VAULT_FILES) {
      plannedActions.push({
        actionKind: "create_file",
        target: `.hypertaks/${f}`,
        description: `Bootstrap critical vault artifact: ${f}`,
      });
    }

    for (const poc of PROJECT_OPERATING_CONTEXT_FILES) {
      plannedActions.push({
        actionKind: "create_file",
        target: `.hypertaks/projects/${repoId}/${poc}`,
        description: `Create initial Project Operating Context living document: ${poc}`,
      });
    }

    plannedActions.push({
      actionKind: "build_graph_and_architecture",
      target: ".hypertaks/graph",
      description: "Scan code topological structures and build offline local graph",
    });

    return {
      repoId,
      canonicalRoot,
      state: "UNINITIALIZED",
      isGitRepo: isGit,
      existingVault: false,
      existingGrant: false,
      missingRequiredFiles: CRITICAL_VAULT_FILES.map((f) => `.hypertaks/${f}`),
      staleIndexes: ["graph", "architecture", "inventory"],
      plannedActions,
      requiresApproval: true,
      approvalPrompt: `Initialize Hypertaks Repository Operating Vault for ${effectiveIdentity.display_name} (${repoId})? Respond with APPROVE <contractId>.`,
    };
  }

  // Check for rebind
  const currentFingerprint = computeRootFingerprint(canonicalRoot);
  if (existingIdentity && existingIdentity.root_fingerprint !== currentFingerprint) {
    return {
      repoId,
      canonicalRoot,
      state: "REBIND_DETECTED",
      isGitRepo: isGit,
      existingVault: true,
      existingGrant: false,
      missingRequiredFiles: [],
      staleIndexes: ["graph", "architecture"],
      plannedActions: [
        {
          actionKind: "rebind_repo_identity",
          target: ".hypertaks/repo.json",
          description: "Update canonical root fingerprint to reflect moved repository directory",
        },
        {
          actionKind: "require_t1_approval",
          target: "T1_BOSS_TURN",
          description: "Rebind requires authentic Boss approval",
        },
      ],
      requiresApproval: true,
      approvalPrompt: `Repository directory moved. Rebind vault identity for ${repoId}? Respond with APPROVE <contractId>.`,
    };
  }

  // Check missing critical vault files
  const missingFiles: string[] = [];
  for (const rel of CRITICAL_VAULT_FILES) {
    const full = path.join(canonicalRoot, ".hypertaks", rel);
    if (!fs.existsSync(full)) {
      missingFiles.push(`.hypertaks/${rel}`);
    }
  }

  // Check POC files
  const projectDir = path.join(canonicalRoot, ".hypertaks", "projects", repoId);
  for (const poc of PROJECT_OPERATING_CONTEXT_FILES) {
    const full = path.join(projectDir, poc);
    if (!fs.existsSync(full)) {
      missingFiles.push(`.hypertaks/projects/${repoId}/${poc}`);
    }
  }

  // Check grant
  const storedGrant = readStoredGrant(canonicalRoot);
  const grantVerification = storedGrant
    ? verifyBootstrapGrant(canonicalRoot, repoId, storedGrant)
    : { valid: false, reason: "No grant file" };

  // Check graph freshness
  const graphStatus = evaluateGraphFreshness(canonicalRoot, loadHashesCache(canonicalRoot));
  const staleIndexes: string[] = [];
  if (graphStatus.state !== "FRESH") {
    staleIndexes.push("graph");
  }

  const plannedActions: PlannedAction[] = [];
  let state: VaultState = "HEALTHY";

  if (missingFiles.length > 0 || !grantVerification.valid) {
    state = "CORRUPTED_OR_PARTIAL";
    for (const m of missingFiles) {
      plannedActions.push({
        actionKind: "create_file",
        target: m,
        description: `Repair missing vault artifact: ${m}`,
      });
    }
    if (!grantVerification.valid) {
      plannedActions.push({
        actionKind: "require_t1_approval",
        target: ".hypertaks/state/bootstrap-grant.json",
        description: `Re-issue valid bootstrap grant (${grantVerification.reason ?? "invalid grant"})`,
      });
    }
  } else if (staleIndexes.length > 0) {
    state = "STALE_INDEXES";
    plannedActions.push({
      actionKind: "build_graph_and_architecture",
      target: ".hypertaks/graph",
      description: "Re-index modified source files and synchronize local graph",
    });
  }

  const requiresApproval = state === "CORRUPTED_OR_PARTIAL" || !grantVerification.valid;

  return {
    repoId,
    canonicalRoot,
    state,
    isGitRepo: isGit,
    existingVault: true,
    existingGrant: grantVerification.valid,
    missingRequiredFiles: missingFiles,
    staleIndexes,
    plannedActions,
    requiresApproval,
    approvalPrompt: requiresApproval
      ? `Repair partial Hypertaks Operating Vault for ${repoId}? Respond with APPROVE <contractId>.`
      : "Vault is healthy.",
  };
}

export function acquireLifecycleLock(canonicalRoot: string): () => void {
  const dotHypertaks = path.join(canonicalRoot, ".hypertaks");
  if (!fs.existsSync(dotHypertaks)) {
    fs.mkdirSync(dotHypertaks, { recursive: true });
  }
  const lockPath = path.join(dotHypertaks, LOCK_FILE_NAME);

  if (fs.existsSync(lockPath)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      const lockAge = Date.now() - (lockData.timestamp ?? 0);
      if (lockAge < LOCK_TIMEOUT_MS) {
        throw new Error(
          `CONCURRENCY_LOCK_ACTIVE: Another Hypertaks operation is active (pid: ${lockData.pid}, age: ${Math.round(lockAge / 1000)}s).`
        );
      }
      // Stale lock recovery
      fs.rmSync(lockPath, { force: true });
    } catch (err: any) {
      if (err?.message?.includes("CONCURRENCY_LOCK_ACTIVE")) {
        throw err;
      }
      fs.rmSync(lockPath, { force: true });
    }
  }

  const lockContent = JSON.stringify({
    pid: process.pid,
    timestamp: Date.now(),
    created: new Date().toISOString(),
  });
  fs.writeFileSync(lockPath, lockContent + "\n", "utf8");

  return () => {
    try {
      if (fs.existsSync(lockPath)) {
        fs.rmSync(lockPath, { force: true });
      }
    } catch {
      // Ignore lock removal error on exit
    }
  };
}

export async function autoInitializeOrSync(
  projectRoot: string,
  options: AutoInitOptions = {}
): Promise<LifecycleResult> {
  const preflight = runPreflight(projectRoot);

  if (preflight.state === "HEALTHY" && preflight.staleIndexes.length === 0 && !options.forceRescan) {
    return {
      success: true,
      status: "READY",
      preflight,
      message: `Repository Operating Vault is healthy for ${preflight.repoId}. Zero writes required.`,
    };
  }

  if (preflight.requiresApproval && !options.proof) {
    return {
      success: false,
      status: "AWAITING_APPROVAL",
      preflight,
      message: `APPROVAL_REQUIRED: ${preflight.approvalPrompt}`,
      error: "APPROVAL_REQUIRED",
    };
  }

  // Authentic Boss approval is present or state is STALE_INDEXES with existing valid grant
  let releaseLock: (() => void) | null = null;
  try {
    releaseLock = acquireLifecycleLock(preflight.canonicalRoot);

    const contractId = options.contractId ?? options.proof?.contractId ?? "HT-AUTO-INIT";
    let bootstrapResult: BootstrapResult | undefined;

    // Bootstrap or repair vault if not already healthy
    if (preflight.state === "UNINITIALIZED" || preflight.state === "CORRUPTED_OR_PARTIAL" || preflight.state === "REBIND_DETECTED") {
      if (!options.proof) {
        throw new Error("APPROVAL_REQUIRED: Cannot mutate repository vault without authentic Boss approval proof.");
      }

      const grant = issueBootstrapGrant(
        preflight.canonicalRoot,
        preflight.repoId,
        contractId,
        { proof: options.proof }
      );

      const bootstrapOpts: { readonly agentName?: string } = options.agentName
        ? { agentName: options.agentName }
        : {};
      bootstrapResult = bootstrapRepoVault(preflight.canonicalRoot, grant, bootstrapOpts);

      if (!bootstrapResult.success) {
        return {
          success: false,
          status: "DEGRADED",
          preflight,
          bootstrapResult,
          message: `Vault bootstrap failed: ${bootstrapResult.error}`,
          error: bootstrapResult.error,
        };
      }
    }

    // Run repository scanner & build local intelligence indexes
    const scan = scanRepository(preflight.canonicalRoot);
    writeInventories(preflight.canonicalRoot, scan);
    
    const identity = readRepoIdentity(preflight.canonicalRoot);
    if (identity) {
      compileArchitecturePack(preflight.canonicalRoot, identity, scan);
      const graph = buildLocalGraph(preflight.canonicalRoot, scan);
      saveLocalGraph(preflight.canonicalRoot, identity.repo_id, graph);
      
      const hashes: Record<string, string> = {};
      for (const f of scan.files) hashes[f.relativePath] = f.sha256;
      saveHashesCache(preflight.canonicalRoot, hashes);
    }

    const postPreflight = runPreflight(preflight.canonicalRoot);

    return {
      success: true,
      status: "READY",
      preflight: postPreflight,
      bootstrapResult,
      message: `Hypertaks Operating Vault is fully initialized and synchronized for ${preflight.repoId}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      status: "ERROR",
      preflight,
      message: `Lifecycle execution failed: ${err?.message ?? String(err)}`,
      error: err?.message ?? String(err),
    };
  } finally {
    if (releaseLock) {
      releaseLock();
    }
  }
}
