import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  computeRootFingerprint,
  loadOrInitRepoIdentity,
  resolveCanonicalRoot,
  RepoIdentity,
} from "./repo-identity";
import { loadReleaseVersion } from "./version";
import {
  PROJECT_OPERATING_CONTEXT_FILES,
  generateProjectContextDocument,
  safeContextGitState,
} from "./founder-brain";

export interface RepoBootstrapGrant {
  readonly grant_kind: "hypertaks.repo-bootstrap.v1";
  readonly repo_id: string;
  readonly canonical_root_fingerprint: string;
  readonly allowed_path: ".hypertaks/**";
  readonly allowed_operations: readonly ("create" | "update")[];
  readonly forbidden_operations: readonly (
    | "source_write"
    | "external_publish"
    | "deploy"
    | "spend"
    | "arbitrary_delete"
    | "network_egress"
  )[];
  readonly issued_from_t1_contract: string;
  readonly issued_at: string;
  readonly signature: string;
  readonly revoked: boolean;
}

const DEFAULT_SIGNING_SALT = "hypertaks-salt-v2-secure";

export function computeGrantSignature(
  repoId: string,
  rootFingerprint: string,
  contractId: string,
  issuedAt: string,
  salt: string = DEFAULT_SIGNING_SALT,
): string {
  const payload = `${repoId}:${rootFingerprint}:${contractId}:${issuedAt}:${salt}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function issueBootstrapGrant(
  canonicalRoot: string,
  repoId: string,
  contractId: string,
  salt?: string,
): RepoBootstrapGrant {
  const rootFingerprint = computeRootFingerprint(canonicalRoot);
  const issuedAt = new Date().toISOString();
  const signature = computeGrantSignature(repoId, rootFingerprint, contractId, issuedAt, salt);

  return {
    grant_kind: "hypertaks.repo-bootstrap.v1",
    repo_id: repoId,
    canonical_root_fingerprint: rootFingerprint,
    allowed_path: ".hypertaks/**",
    allowed_operations: ["create", "update"],
    forbidden_operations: [
      "source_write",
      "external_publish",
      "deploy",
      "spend",
      "arbitrary_delete",
      "network_egress",
    ],
    issued_from_t1_contract: contractId,
    issued_at: issuedAt,
    signature,
    revoked: false,
  };
}

export function verifyBootstrapGrant(
  canonicalRoot: string,
  repoId: string,
  grant: RepoBootstrapGrant | null | undefined,
  salt?: string,
): { readonly valid: boolean; readonly reason?: string } {
  if (!grant) {
    return { valid: false, reason: "Missing bootstrap grant" };
  }
  if (grant.grant_kind !== "hypertaks.repo-bootstrap.v1") {
    return { valid: false, reason: "Invalid grant kind" };
  }
  if (grant.revoked) {
    return { valid: false, reason: "Bootstrap grant has been revoked" };
  }
  if (grant.repo_id !== repoId) {
    return { valid: false, reason: "Grant repo_id does not match target repository" };
  }
  const rootFingerprint = computeRootFingerprint(canonicalRoot);
  if (grant.canonical_root_fingerprint !== rootFingerprint) {
    return { valid: false, reason: "Grant root fingerprint does not match canonical root" };
  }
  if (grant.allowed_path !== ".hypertaks/**") {
    return { valid: false, reason: "Grant allowed path must strictly be .hypertaks/**" };
  }
  const expectedSignature = computeGrantSignature(
    grant.repo_id,
    grant.canonical_root_fingerprint,
    grant.issued_from_t1_contract,
    grant.issued_at,
    salt,
  );
  if (grant.signature !== expectedSignature) {
    return { valid: false, reason: "Grant signature verification failed (tampered grant)" };
  }

  return { valid: true };
}

export function readStoredGrant(canonicalRoot: string): RepoBootstrapGrant | null {
  const grantPath = path.join(canonicalRoot, ".hypertaks", "state", "bootstrap-grant.json");
  if (!fs.existsSync(grantPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(grantPath, "utf8");
    const parsed = JSON.parse(raw) as RepoBootstrapGrant;
    if (parsed.grant_kind === "hypertaks.repo-bootstrap.v1") {
      return parsed;
    }
  } catch {
    // Malformed grant
  }
  return null;
}

export function saveStoredGrant(canonicalRoot: string, grant: RepoBootstrapGrant): void {
  const stateDir = path.join(canonicalRoot, ".hypertaks", "state");
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }
  const grantPath = path.join(stateDir, "bootstrap-grant.json");
  const tempPath = `${grantPath}.tmp.${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tempPath, JSON.stringify(grant, null, 2) + "\n", "utf8");
  fs.renameSync(tempPath, grantPath);
}

export function revokeStoredGrant(canonicalRoot: string): boolean {
  const existing = readStoredGrant(canonicalRoot);
  if (!existing) {
    return false;
  }
  const revoked: RepoBootstrapGrant = {
    ...existing,
    revoked: true,
  };
  saveStoredGrant(canonicalRoot, revoked);
  return true;
}

export interface BootstrapResult {
  readonly success: boolean;
  readonly repoId: string;
  readonly createdFiles: readonly string[];
  readonly preservedFiles: readonly string[];
  readonly error?: string;
}

const VAULT_DIRECTORIES = [
  "",
  "architecture",
  "diagrams",
  "docs",
  "inventory",
  "graph",
  "graph/indexes",
  "state",
  "evidence",
  "runs",
  "snapshots/critical-text",
  "snapshots/manifests",
  "cache",
];

export function bootstrapRepoVault(
  projectRoot: string,
  grant: RepoBootstrapGrant,
  options?: {
    readonly agentName?: string;
    readonly salt?: string;
  },
): BootstrapResult {
  const canonicalRoot = resolveCanonicalRoot(projectRoot);
  const { identity } = loadOrInitRepoIdentity(canonicalRoot);
  const repoId = identity.repo_id;

  const verification = verifyBootstrapGrant(canonicalRoot, repoId, grant, options?.salt);
  if (!verification.valid) {
    return {
      success: false,
      repoId,
      createdFiles: [],
      preservedFiles: [],
      error: verification.reason ?? "Grant verification failed",
    };
  }

  // Ensure all vault directories exist
  const dotHypertaks = path.join(canonicalRoot, ".hypertaks");
  for (const subDir of VAULT_DIRECTORIES) {
    const fullDir = path.join(dotHypertaks, subDir);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }
  }

  const projectDir = path.join(dotHypertaks, "projects", repoId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const createdFiles: string[] = [];
  const preservedFiles: string[] = [];
  const agentName = options?.agentName ?? "Hypertaks-Founder";
  const gitState = safeContextGitState(canonicalRoot);
  const versionInfo = loadReleaseVersion(canonicalRoot);

  // 1. VERSION
  const versionPath = path.join(dotHypertaks, "VERSION");
  if (!fs.existsSync(versionPath)) {
    fs.writeFileSync(versionPath, `${versionInfo.productVersion}\n`, "utf8");
    createdFiles.push(".hypertaks/VERSION");
  } else {
    preservedFiles.push(".hypertaks/VERSION");
  }

  // 2. README.md
  const readmePath = path.join(dotHypertaks, "README.md");
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# Hypertaks Repository Operating Vault

Version: ${versionInfo.productVersion}
Repository ID: ${repoId}

This folder is the persistent operating surface for Hypertaks:
- Machine-readable evidence ledger and inventories
- First-party local intelligence graph
- Architecture and boundary specifications
- Project Operating Context living documents
- Run checkpoints, handoffs, and verification logs

Do not commit sensitive keys, passwords, or personal credentials into this folder.
`;
    fs.writeFileSync(readmePath, readmeContent, "utf8");
    createdFiles.push(".hypertaks/README.md");
  } else {
    preservedFiles.push(".hypertaks/README.md");
  }

  // 3. bootstrap.json
  const bootstrapMetaPath = path.join(dotHypertaks, "bootstrap.json");
  const bootstrapMeta = {
    schema: "hypertaks.bootstrap.v1",
    repo_id: repoId,
    bootstrapped_at: new Date().toISOString(),
    product_version: versionInfo.productVersion,
    git_state: gitState,
    grant_contract: grant.issued_from_t1_contract,
  };
  fs.writeFileSync(bootstrapMetaPath, JSON.stringify(bootstrapMeta, null, 2) + "\n", "utf8");
  createdFiles.push(".hypertaks/bootstrap.json");

  // 4. status.json
  const statusPath = path.join(dotHypertaks, "status.json");
  const statusMeta = {
    schema: "hypertaks.status.v1",
    repo_id: repoId,
    last_sync: new Date().toISOString(),
    status: "HEALTHY",
    graph_freshness: "UNKNOWN",
    active_runs: 0,
  };
  fs.writeFileSync(statusPath, JSON.stringify(statusMeta, null, 2) + "\n", "utf8");
  createdFiles.push(".hypertaks/status.json");

  // 5. Store valid grant in state
  saveStoredGrant(canonicalRoot, grant);

  // 6. Preserve and initialize 13 Project Operating Context files
  for (const filename of PROJECT_OPERATING_CONTEXT_FILES) {
    const filePath = path.join(projectDir, filename);
    const relPath = `.hypertaks/projects/${repoId}/${filename}`;
    if (!fs.existsSync(filePath)) {
      const content = generateProjectContextDocument(filename, repoId, agentName, gitState);
      fs.writeFileSync(filePath, content, "utf8");
      createdFiles.push(relPath);
    } else {
      preservedFiles.push(relPath);
    }
  }

  // 7. Initialize root architecture pack templates if absent
  const rootPackFiles: Record<string, string> = {
    "ARCHITECTURE.md": `# Repository Architecture Overview\n\nRepository: ${identity.display_name}\nID: ${repoId}\nStatus: INITIALIZED\n\nRun Hypertaks RTS to compile full evidence-backed architecture.\n`,
    "FUNCTION-MAP.md": `# Function and Symbol Map\n\nRepository: ${identity.display_name}\n\nHigh-value entrypoints, handlers, and services will be mapped by RTS.\n`,
    "DATA-MODEL.md": `# Data Model and Schemas\n\nRepository: ${identity.display_name}\n\nEntity relationships, database tables, and migrations will be mapped by RTS.\n`,
    "NETWORK-DEPENDENCIES.md": `# Network and External Dependencies\n\nRepository: ${identity.display_name}\n\nInbound routes, external API endpoints, and integrations will be mapped by RTS.\n`,
    "ASSET-INDEX.md": `# Asset and Static Resources Index\n\nRepository: ${identity.display_name}\n\nStatic assets, design tokens, and documentation resources will be indexed by RTS.\n`,
  };

  for (const [filename, template] of Object.entries(rootPackFiles)) {
    const fullPath = path.join(dotHypertaks, filename);
    const relPath = `.hypertaks/${filename}`;
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, template, "utf8");
      createdFiles.push(relPath);
    } else {
      preservedFiles.push(relPath);
    }
  }

  return {
    success: true,
    repoId,
    createdFiles,
    preservedFiles,
  };
}
