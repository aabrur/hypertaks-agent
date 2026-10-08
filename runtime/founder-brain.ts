import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

export type MemoryScope = "AgentPrivate" | "Project" | "Shared";
export type MemoryStatus = "UNVERIFIED" | "INFERRED" | "VERIFIED" | "STALE" | "INVALIDATED" | "ARCHIVED";
export type EvidenceSourceType = "RepositoryCode" | "BossTurn" | "ToolResult";
export type BrainDestinationType = "ProjectLocal" | "ExternalLocal" | "ObsidianVault" | "SeparateGit" | "McpMemory" | "Ephemeral";
export type GraphifyMode = "disabled" | "stdio_mcp" | "http_mcp" | "local_cli";

export interface RepositoryEvidence {
  readonly sourceType: "RepositoryCode";
  readonly filePath: string;
  readonly branchName: string;
  readonly commitHash: string;
  readonly contentSha256: string;
}

export interface BossEvidence {
  readonly sourceType: "BossTurn";
  readonly messageId: string;
  readonly contractId: string;
}

export interface ToolEvidence {
  readonly sourceType: "ToolResult";
  readonly capabilityId: string;
  readonly invocationId: string;
}

export type EvidenceSource = RepositoryEvidence | BossEvidence | ToolEvidence;

export interface MemoryRecord {
  readonly schemaVersion: "4.5.1";
  readonly id: string;
  readonly type: "Fact" | "Decision" | "Preference" | "Risk" | "CheckpointNote";
  readonly scope: MemoryScope;
  readonly status: MemoryStatus;
  readonly content: string;
  readonly evidence: EvidenceSource | null;
  readonly createdAt: string;
  readonly createdByAgent: string;
  readonly sourceRepository: string;
}

export interface DecisionRecord {
  readonly schemaVersion: "4.5.1";
  readonly id: string;
  readonly title: string;
  readonly decision: string;
  readonly status: "PROPOSED" | "APPROVED" | "REJECTED" | "SUPERSEDED";
  readonly bossEvidence: BossEvidence | null;
  readonly createdAt: string;
}

export interface BrainPointerConfig {
  readonly schemaVersion: "4.5.1";
  readonly projectId: string;
  readonly agentName: string;
  readonly destinationType: BrainDestinationType;
  readonly rootPath: string | null;
  readonly agentRelativePath: string;
  readonly sharedRelativePath: string | null;
  readonly graphify: {
    readonly mode: GraphifyMode;
    readonly endpoint: string | null;
    readonly authTokenEnv: string | null;
    readonly outputRelativePath: string | null;
  };
  readonly governance: {
    readonly conflictPolicy: "BossThenRepository" | "RepositoryThenBoss" | "AskBoss";
    readonly autoPromotion: false;
    readonly secretScanning: "strict";
  };
  readonly verifiedAt: string;
}

export interface GitState {
  readonly repositoryRoot: string;
  readonly repositoryId: string;
  readonly branch: string;
  readonly commit: string;
  readonly changedFiles: readonly string[];
}

export interface TestEvidence {
  readonly command: string;
  readonly exitCode: number;
  readonly timestamp: string;
  readonly commit: string;
}

export interface AcceptanceCriterion {
  readonly id: string;
  readonly description: string;
  readonly status: "PASS" | "FAIL" | "NOT_RUN";
  readonly evidence: string;
}

export interface TaskCheckpoint {
  readonly schemaVersion: "4.5.1";
  readonly id: string;
  readonly createdAt: string;
  readonly objective: string;
  readonly contractId: string;
  readonly repository: GitState;
  readonly completed: readonly string[];
  readonly pending: readonly string[];
  readonly blockers: readonly string[];
  readonly nextAction: string;
  readonly permissions: readonly string[];
  readonly tests: readonly TestEvidence[];
  readonly acceptanceCriteria: readonly AcceptanceCriterion[];
}

export interface ProofOfDoneResult {
  readonly verified: boolean;
  readonly status: "DONE" | "NOT_DONE";
  readonly reasons: readonly string[];
}

export interface ApprovalActivation {
  readonly active: boolean;
  readonly contractId: string;
  readonly evidence: string;
  readonly bootstrapStatus?: "SUCCESS" | "DEGRADED" | "SKIPPED";
  readonly bootstrapReason?: string;
}

export interface VerifyPlanInput {
  readonly projectRoot: string;
  readonly projectId: string;
  readonly agentName: string;
  readonly destinationType: BrainDestinationType;
  readonly rootPath: string | null;
  readonly existingBrain: boolean;
  readonly sharedMemory: boolean;
  readonly graphifyMode: GraphifyMode;
  readonly graphifyEndpoint: string | null;
  readonly graphifyAuthTokenEnv: string | null;
}

export interface VerifyPlan {
  readonly pointer: BrainPointerConfig;
  readonly projectRoot: string;
  readonly actions: readonly string[];
  readonly requiresWriteApproval: true;
}

export interface GraphifyExecutor {
  execute(operation: string, payload: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface GraphQueryOptions {
  readonly mode: GraphifyMode;
  readonly operation: string;
  readonly query: string;
  readonly repositoryRoot: string;
  readonly endpoint: string | null;
  readonly authTokenEnv: string | null;
  readonly localCommand: readonly string[] | null;
  readonly executor: GraphifyExecutor | null;
  readonly approvalProof: BossApprovalProof | null;
}

export interface GraphQueryResult {
  readonly success: boolean;
  readonly modeUsed: GraphifyMode | "direct_search";
  readonly data: unknown;
  readonly message: string;
}

export interface GraphFreshness {
  readonly state: "FRESH" | "STALE" | "UNVERIFIED";
  readonly reason: string;
}

const approvalRegistry = new WeakSet<object>();

export interface BossApprovalProof {
  readonly contractId: string;
  readonly messageId: string;
  readonly approvedAt: string;
}

const SECRET_PATTERNS: readonly RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/gu,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/gu,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/gu,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/giu,
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/gu,
  /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["']?[^\s"']{12,}/giu,
  /\b(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@/giu,
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`INVALID_SCHEMA: ${field} must be a non-empty string.`);
  }
}

function normalizeRoot(root: string, create: boolean): string {
  const resolved = path.resolve(root);
  if (create) fs.mkdirSync(resolved, { recursive: true });
  if (!fs.existsSync(resolved)) throw new Error(`ROOT_NOT_FOUND: ${resolved}`);
  return fs.realpathSync(resolved);
}

function isWithinRoot(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export function resolveWithinApprovedRoot(root: string, relativePath: string, createParent = false): string {
  if (
    !relativePath ||
    path.isAbsolute(relativePath) ||
    /^[A-Za-z]:/u.test(relativePath) ||
    relativePath.startsWith("\\\\") ||
    relativePath.startsWith("//") ||
    relativePath.includes("\u0000")
  ) {
    throw new Error("PATH_OUTSIDE_APPROVED_ROOT: an absolute, empty, or null-containing path is not allowed.");
  }
  const normalizedRelative = relativePath.replace(/\\/gu, "/");
  if (path.posix.isAbsolute(normalizedRelative)) {
    throw new Error("PATH_OUTSIDE_APPROVED_ROOT: an absolute, empty, or null-containing path is not allowed.");
  }
  const canonicalRoot = normalizeRoot(root, false);
  const candidate = path.resolve(canonicalRoot, normalizedRelative);
  if (!isWithinRoot(canonicalRoot, candidate)) {
    throw new Error("PATH_OUTSIDE_APPROVED_ROOT: traversal is not allowed.");
  }
  const parent = path.dirname(candidate);
  if (createParent) fs.mkdirSync(parent, { recursive: true });
  const existingParent = fs.existsSync(parent) ? fs.realpathSync(parent) : path.resolve(parent);
  if (!isWithinRoot(canonicalRoot, existingParent)) {
    throw new Error("PATH_OUTSIDE_APPROVED_ROOT: symlink escape is not allowed.");
  }
  return candidate;
}

export function validateRecordId(value: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(value)) {
    throw new Error("INVALID_RECORD_ID: use 1-128 letters, digits, dot, underscore, or hyphen.");
  }
  if (/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/iu.test(value)) {
    throw new Error("INVALID_RECORD_ID: reserved operating-system name.");
  }
  return value;
}

export function sanitizeAgentName(input: string): string {
  const normalized = input.normalize("NFKC").trim();
  if (!normalized || normalized.includes("..") || /[\\/:\u0000-\u001F\u007F]/u.test(normalized)) {
    throw new Error("INVALID_AGENT_NAME: path syntax and control characters are not allowed.");
  }
  const slug = normalized.replace(/\s+/gu, "-").replace(/[^A-Za-z0-9_-]/gu, "");
  if (!slug || slug.length > 64) throw new Error("INVALID_AGENT_NAME: the sanitized name is empty or too long.");
  if (/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/iu.test(slug)) {
    throw new Error("INVALID_AGENT_NAME: reserved operating-system name.");
  }
  return slug;
}

export function findSecrets(value: string): readonly string[] {
  const findings: string[] = [];
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(value)) findings.push(pattern.source);
  }
  return findings;
}

export function assertNoSecrets(value: unknown): void {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (findSecrets(serialized).length > 0) {
    throw new Error("SECURITY_VIOLATION: secret-like content cannot be persisted. Use an environment-variable handle.");
  }
}

export function redactSecrets(value: string): string {
  let result = value;
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[REDACTED_SECRET]");
  }
  return result;
}

export interface AtomicFsOperations {
  readonly writeFileSync?: typeof fs.writeFileSync;
  readonly renameSync?: typeof fs.renameSync;
  readonly rmSync?: typeof fs.rmSync;
  readonly existsSync?: typeof fs.existsSync;
}

export function atomicWriteText(
  root: string,
  relativePath: string,
  content: string,
  fsOps?: AtomicFsOperations
): string {
  assertNoSecrets(content);
  const target = resolveWithinApprovedRoot(root, relativePath, true);
  const writeFileSync = fsOps?.writeFileSync ?? fs.writeFileSync;
  const renameSync = fsOps?.renameSync ?? fs.renameSync;
  const rmSync = fsOps?.rmSync ?? fs.rmSync;
  const existsSync = fsOps?.existsSync ?? fs.existsSync;

  const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
  writeFileSync(temporary, content, { encoding: "utf8", flag: "wx", mode: 0o600 });

  try {
    if (!existsSync(target)) {
      try {
        renameSync(temporary, target);
        return target;
      } catch (err) {
        if (existsSync(temporary)) {
          try { rmSync(temporary, { force: true }); } catch { /* ignore */ }
        }
        throw err;
      }
    }

    try {
      renameSync(temporary, target);
      return target;
    } catch (initialRenameError) {
      const backup = `${target}.${process.pid}.${crypto.randomUUID()}.bak`;
      try {
        renameSync(target, backup);
      } catch (backupError) {
        if (existsSync(temporary)) {
          try { rmSync(temporary, { force: true }); } catch { /* ignore */ }
        }
        throw backupError;
      }

      try {
        renameSync(temporary, target);
        try { rmSync(backup, { force: true }); } catch { /* ignore */ }
        return target;
      } catch (replacementError) {
        try {
          if (existsSync(backup) && !existsSync(target)) {
            renameSync(backup, target);
          }
        } catch {
          // preserve backup if restore rename also encounters an issue
        }
        if (existsSync(temporary)) {
          try { rmSync(temporary, { force: true }); } catch { /* ignore */ }
        }
        throw replacementError;
      }
    }
  } catch (outerError) {
    if (existsSync(temporary)) {
      try { rmSync(temporary, { force: true }); } catch { /* ignore */ }
    }
    throw outerError;
  }
}

export function atomicWriteJson(root: string, relativePath: string, value: unknown): string {
  return atomicWriteText(root, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function mintBossApprovalProof(
  activation: ApprovalActivation,
  messageId: string,
): BossApprovalProof {
  if (!activation.active || !activation.contractId || !activation.evidence) {
    throw new Error("APPROVAL_REQUIRED: an active T1 contract approval is required.");
  }
  assertString(messageId, "messageId");
  const proof: BossApprovalProof = Object.freeze({
    contractId: activation.contractId,
    messageId,
    approvedAt: new Date().toISOString(),
  });
  approvalRegistry.add(proof);
  return proof;
}

export function assertValidApprovalProof(proof: BossApprovalProof | null, contractId?: string): asserts proof is BossApprovalProof {
  if (proof === null || !approvalRegistry.has(proof)) {
    throw new Error("APPROVAL_REQUIRED: use a proof minted from an active T1 approval.");
  }
  if (contractId !== undefined && proof.contractId !== contractId) {
    throw new Error("APPROVAL_MISMATCH: approval proof belongs to a different contract.");
  }
}

/**
 * Effect-based authorization capability for Project Operating Context creation.
 * Grants are minted only from an authentic T1 contract activation whose approved
 * permission list explicitly includes PERM_FILE_WRITE, and are registered in a
 * process-local WeakSet so forged, fabricated, or lookalike grant objects are
 * rejected at the filesystem mutation boundary.
 */
export interface WorkspaceWriteGrant {
  readonly grantKind: "hypertaks.workspace-write.v1";
  readonly contractId: string;
  readonly projectId: string;
  readonly approvedRoot: string;
  readonly permission: "PERM_FILE_WRITE";
  readonly evidence: string;
  readonly mintedAt: string;
}

export interface ContractActivationInput {
  readonly contractId: string;
  readonly bossMessage: string;
  readonly isBossTurn: boolean;
  readonly requiresMutationOrExternalEffect: boolean;
  readonly projectRoot?: string;
  readonly contractPermissions?: readonly string[];
  readonly grantedPermissions?: readonly string[];
}

export type ContractActivation =
  | {
      readonly active: true;
      readonly evidence: string;
      readonly contractId: string;
      readonly contractPermissions?: readonly string[] | undefined;
      readonly projectRoot?: string | undefined;
      readonly bootstrapStatus?: "SUCCESS" | "DEGRADED" | "SKIPPED" | "DENIED" | undefined;
      readonly bootstrapReason?: string | undefined;
    }
  | { readonly active: false; readonly reason: string; readonly contractId: string };

const workspaceWriteGrantRegistry = new WeakSet<object>();
const approvedActivationRegistry = new WeakSet<object>();

export function activateContract(input: ContractActivationInput): ContractActivation {
  if (!input.isBossTurn) {
    return { active: false, reason: "Approval did not originate in a T1 Boss turn.", contractId: input.contractId };
  }
  const normalized = input.bossMessage.trim();
  if (!normalized) {
    return { active: false, reason: "Approval message is empty.", contractId: input.contractId };
  }
  const lower = normalized.toLowerCase();
  if (/\b(?:not approved|do not proceed|don't proceed|never proceed|not authorized|reject(?:ed)?)\b/u.test(lower)) {
    return { active: false, reason: "The Boss message contains explicit negation or rejection.", contractId: input.contractId };
  }

  const permissions = input.contractPermissions ?? input.grantedPermissions;

  let result: ContractActivation = { active: false, reason: "The Boss message is not an explicit standalone affirmative.", contractId: input.contractId };
  if (input.requiresMutationOrExternalEffect) {
    const expected = `APPROVE ${input.contractId}`.toUpperCase();
    const signature = normalized.match(/^APPROVE\s+([A-Z0-9-]+)\s*[.!]?$/iu);
    if (!signature || signature[1]?.toUpperCase() !== input.contractId.toUpperCase()) {
      return {
        active: false,
        reason: "Build or external-effect approval must be the canonical contract-ID signature.",
        contractId: input.contractId,
      };
    }
    result = {
      active: true,
      evidence: expected,
      contractId: input.contractId,
      contractPermissions: permissions,
      projectRoot: input.projectRoot,
    };
  } else if (/^(?:yes|approved|approve|go|proceed)(?:[.!])?$/iu.test(normalized)) {
    result = {
      active: true,
      evidence: normalized,
      contractId: input.contractId,
      contractPermissions: permissions,
      projectRoot: input.projectRoot,
    };
  }

  if (result.active) {
    approvedActivationRegistry.add(result);

    if (input.projectRoot) {
      const cleanProjectId = input.contractId.replace(/^HT-/iu, "") || input.contractId;
      // Effect-based permission law: Project Operating Context creation is a
      // filesystem mutation and requires PERM_FILE_WRITE to be explicitly
      // granted by the approved contract. Authorization is enforced here AND
      // re-proven at the mutation boundary via a registered grant, so a caller
      // cannot bypass it by supplying projectRoot alone.
      if (!permissions?.includes("PERM_FILE_WRITE")) {
        result = {
          ...result,
          bootstrapStatus: "DENIED",
          bootstrapReason: "PERMISSION_DENIED: the approved contract does not grant PERM_FILE_WRITE; no Project Operating Context files were created.",
        };
      } else {
        try {
          const grant = mintWorkspaceWriteGrant(result, cleanProjectId, input.projectRoot);
          bootstrapProjectWorkspace(input.projectRoot, cleanProjectId, grant);
          result = { ...result, bootstrapStatus: "SUCCESS" };
        } catch (error) {
          result = {
            ...result,
            bootstrapStatus: "DEGRADED",
            bootstrapReason: error instanceof Error ? error.message : "Workspace bootstrap failed.",
          };
        }
      }
    } else {
      result = { ...result, bootstrapStatus: "SKIPPED" };
    }
    approvedActivationRegistry.add(result);
  }

  return result;
}

export function mintWorkspaceWriteGrant(
  activation: ContractActivation,
  projectId: string,
  projectRoot: string,
): WorkspaceWriteGrant {
  if (!approvedActivationRegistry.has(activation)) {
    throw new Error(
      "PERMISSION_DENIED: Workspace write grant requires an authentic T1 contract activation produced by activateContract."
    );
  }
  if (!activation.active || !activation.contractId || !activation.evidence) {
    throw new Error(
      "PERMISSION_DENIED: Workspace creation requires an active T1 contract approval."
    );
  }
  if (!activation.contractPermissions?.includes("PERM_FILE_WRITE")) {
    throw new Error(
      "PERMISSION_DENIED: The approved contract does not grant PERM_FILE_WRITE."
    );
  }
  validateRecordId(projectId);
  const canonicalRoot = normalizeRoot(projectRoot, false);
  const grant: WorkspaceWriteGrant = Object.freeze({
    grantKind: "hypertaks.workspace-write.v1",
    contractId: activation.contractId,
    projectId,
    approvedRoot: canonicalRoot,
    permission: "PERM_FILE_WRITE",
    evidence: activation.evidence,
    mintedAt: new Date().toISOString(),
  });
  workspaceWriteGrantRegistry.add(grant);
  return grant;
}

export function assertWorkspaceWriteGrant(
  grant: WorkspaceWriteGrant | null | undefined,
  projectId: string,
  projectRoot?: string,
): asserts grant is WorkspaceWriteGrant {
  if (grant === null || grant === undefined || typeof grant !== "object" || !workspaceWriteGrantRegistry.has(grant)) {
    throw new Error(
      "PERMISSION_DENIED: Project Operating Context creation requires a trusted workspace-write grant minted from an active contract that grants PERM_FILE_WRITE."
    );
  }
  if (grant.grantKind !== "hypertaks.workspace-write.v1" || grant.permission !== "PERM_FILE_WRITE") {
    throw new Error("PERMISSION_DENIED: The workspace-write grant does not carry PERM_FILE_WRITE.");
  }
  if (grant.projectId !== projectId) {
    throw new Error("PERMISSION_DENIED: The workspace-write grant does not cover this project id.");
  }
  if (projectRoot !== undefined) {
    const canonicalRoot = normalizeRoot(projectRoot, false);
    if (grant.approvedRoot !== canonicalRoot) {
      throw new Error("PERMISSION_DENIED: The workspace-write grant is bound to a different project root.");
    }
  }
}

function git(repoRoot: string, args: readonly string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function readGitState(repoRoot: string): GitState {
  const root = git(repoRoot, ["rev-parse", "--show-toplevel"]);
  const canonicalRoot = fs.realpathSync(root);
  const branch = git(canonicalRoot, ["branch", "--show-current"]);
  const commit = git(canonicalRoot, ["rev-parse", "HEAD"]);
  if (!branch) throw new Error("GIT_STATE_INVALID: detached HEAD is not supported for continuity.");
  const changedFiles = git(canonicalRoot, ["status", "--porcelain=v1"])
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => line.slice(3));
  const repositoryId = crypto.createHash("sha256").update(canonicalRoot).digest("hex");
  return { repositoryRoot: canonicalRoot, repositoryId, branch, commit, changedFiles };
}

export function createRepositoryEvidence(repoRoot: string, filePath: string): RepositoryEvidence {
  const state = readGitState(repoRoot);
  const target = resolveWithinApprovedRoot(state.repositoryRoot, filePath, false);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw new Error("EVIDENCE_NOT_FOUND: repository evidence file does not exist.");
  }
  const tracked = git(state.repositoryRoot, ["ls-files", "--error-unmatch", path.relative(state.repositoryRoot, target)]);
  if (!tracked) throw new Error("EVIDENCE_UNTRACKED: repository evidence must be tracked by Git.");
  const contentSha256 = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
  return {
    sourceType: "RepositoryCode",
    filePath: path.relative(state.repositoryRoot, target).split(path.sep).join("/"),
    branchName: state.branch,
    commitHash: state.commit,
    contentSha256,
  };
}

export function verifyRepositoryEvidence(repoRoot: string, evidence: RepositoryEvidence): boolean {
  try {
    const current = readGitState(repoRoot);
    if (current.branch !== evidence.branchName || current.commit !== evidence.commitHash) return false;
    const target = resolveWithinApprovedRoot(current.repositoryRoot, evidence.filePath, false);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return false;
    git(current.repositoryRoot, ["ls-files", "--error-unmatch", evidence.filePath]);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
    return hash === evidence.contentSha256;
  } catch {
    return false;
  }
}

export function createMemoryRecord(input: {
  readonly id: string;
  readonly type: MemoryRecord["type"];
  readonly scope: MemoryScope;
  readonly content: string;
  readonly evidence: EvidenceSource | null;
  readonly createdByAgent: string;
  readonly sourceRepository: string;
  readonly repoRoot: string;
  readonly inferred: boolean;
}): MemoryRecord {
  validateRecordId(input.id);
  assertNoSecrets(input);
  let status: MemoryStatus = input.inferred ? "INFERRED" : "UNVERIFIED";
  if (input.evidence?.sourceType === "RepositoryCode" && verifyRepositoryEvidence(input.repoRoot, input.evidence)) {
    status = "VERIFIED";
  }
  if (input.scope === "Shared" && status !== "VERIFIED") {
    throw new Error("SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private.");
  }
  return {
    schemaVersion: "4.5.1",
    id: input.id,
    type: input.type,
    scope: input.scope,
    status,
    content: input.content,
    evidence: input.evidence,
    createdAt: new Date().toISOString(),
    createdByAgent: sanitizeAgentName(input.createdByAgent),
    sourceRepository: input.sourceRepository,
  };
}

function scopePath(pointer: BrainPointerConfig, scope: MemoryScope): string {
  if (scope === "AgentPrivate") return pointer.agentRelativePath;
  if (scope === "Shared") {
    if (pointer.sharedRelativePath === null) throw new Error("SHARED_MEMORY_DISABLED: no shared destination is configured.");
    return pointer.sharedRelativePath;
  }
  return path.posix.join("Projects", pointer.projectId);
}

export function writeMemoryRecord(root: string, pointer: BrainPointerConfig, record: MemoryRecord): string {
  validateRecordId(record.id);
  validatePointer(pointer);
  if (record.scope === "Shared" && record.status !== "VERIFIED") {
    throw new Error("SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE.");
  }
  const relative = path.posix.join(scopePath(pointer, record.scope), `${record.id}.json`);
  return atomicWriteJson(root, relative, record);
}

export function promoteDecisionToShared(input: {
  readonly root: string;
  readonly pointer: BrainPointerConfig;
  readonly decision: DecisionRecord;
  readonly proof: BossApprovalProof | null;
}): string {
  assertValidApprovalProof(input.proof);
  if (input.decision.status !== "APPROVED" || input.decision.bossEvidence === null) {
    throw new Error("DECISION_NOT_APPROVED: only an approved Boss decision can enter shared memory.");
  }
  if (input.decision.bossEvidence.messageId !== input.proof.messageId || input.decision.bossEvidence.contractId !== input.proof.contractId) {
    throw new Error("APPROVAL_MISMATCH: decision evidence does not match the T1 proof.");
  }
  const record: MemoryRecord = {
    schemaVersion: "4.5.1",
    id: validateRecordId(input.decision.id),
    type: "Decision",
    scope: "Shared",
    status: "VERIFIED",
    content: input.decision.decision,
    evidence: input.decision.bossEvidence,
    createdAt: input.decision.createdAt,
    createdByAgent: input.pointer.agentName,
    sourceRepository: input.pointer.projectId,
  };
  return writeMemoryRecord(input.root, input.pointer, record);
}

export function validatePointer(value: unknown): asserts value is BrainPointerConfig {
  if (!isObject(value)) throw new Error("INVALID_POINTER: expected an object.");
  if (value.schemaVersion !== "4.5.1") throw new Error("UNSUPPORTED_POINTER_VERSION.");
  assertString(value.projectId, "projectId");
  assertString(value.agentName, "agentName");
  sanitizeAgentName(value.agentName);
  const destinationTypes: readonly BrainDestinationType[] = ["ProjectLocal", "ExternalLocal", "ObsidianVault", "SeparateGit", "McpMemory", "Ephemeral"];
  if (!destinationTypes.includes(value.destinationType as BrainDestinationType)) throw new Error("INVALID_POINTER: destinationType.");
  if (value.rootPath !== null && typeof value.rootPath !== "string") throw new Error("INVALID_POINTER: rootPath.");
  assertString(value.agentRelativePath, "agentRelativePath");
  if (value.sharedRelativePath !== null && typeof value.sharedRelativePath !== "string") throw new Error("INVALID_POINTER: sharedRelativePath.");
  if (!isObject(value.graphify) || !isObject(value.governance)) throw new Error("INVALID_POINTER: graphify or governance.");
}

export function readPointer(projectRoot: string): { readonly status: "FOUND"; readonly pointer: BrainPointerConfig } | { readonly status: "NOT_FOUND" | "INVALID"; readonly reason: string } {
  const file = path.join(projectRoot, ".hypertaks", "pointer.json");
  if (!fs.existsSync(file)) return { status: "NOT_FOUND", reason: "No pointer is configured." };
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
    validatePointer(parsed);
    return { status: "FOUND", pointer: parsed };
  } catch (error) {
    return { status: "INVALID", reason: error instanceof Error ? error.message : "Pointer cannot be parsed." };
  }
}

export function buildVerifyPlan(input: VerifyPlanInput): VerifyPlan {
  const projectRoot = normalizeRoot(input.projectRoot, false);
  const agentName = sanitizeAgentName(input.agentName);
  let rootPath: string | null = input.rootPath;
  if (input.destinationType !== "Ephemeral" && input.destinationType !== "McpMemory") {
    if (rootPath === null) {
      rootPath = input.destinationType === "ProjectLocal" ? path.join(projectRoot, "Brains") : null;
    }
    if (rootPath === null) throw new Error("DESTINATION_REQUIRED: provide an explicit approved root.");
    if (input.existingBrain && !fs.existsSync(rootPath)) throw new Error("EXISTING_BRAIN_NOT_FOUND.");
    if (input.destinationType === "ObsidianVault" && (!fs.existsSync(path.join(rootPath, ".obsidian")) || !fs.statSync(path.join(rootPath, ".obsidian")).isDirectory())) {
      throw new Error("INVALID_OBSIDIAN_VAULT: the approved root has no .obsidian directory.");
    }
  }
  if (input.graphifyMode === "http_mcp") {
    if (input.graphifyEndpoint === null || !input.graphifyEndpoint.startsWith("https://")) throw new Error("GRAPHIFY_HTTP_REQUIRES_HTTPS_ENDPOINT.");
    if (input.graphifyAuthTokenEnv === null || !/^[A-Z_][A-Z0-9_]*$/u.test(input.graphifyAuthTokenEnv)) throw new Error("GRAPHIFY_HTTP_REQUIRES_AUTH_HANDLE.");
  }
  const pointer: BrainPointerConfig = {
    schemaVersion: "4.5.1",
    projectId: input.projectId,
    agentName,
    destinationType: input.destinationType,
    rootPath,
    agentRelativePath: path.posix.join("Brains", agentName),
    sharedRelativePath: input.sharedMemory ? "Shared" : null,
    graphify: {
      mode: input.graphifyMode,
      endpoint: input.graphifyEndpoint,
      authTokenEnv: input.graphifyAuthTokenEnv,
      outputRelativePath: input.graphifyMode === "disabled" ? null : "graphify-out",
    },
    governance: {
      conflictPolicy: "RepositoryThenBoss",
      autoPromotion: false,
      secretScanning: "strict",
    },
    verifiedAt: new Date().toISOString(),
  };
  return {
    pointer,
    projectRoot,
    actions: [
      "Write .hypertaks/pointer.json.",
      input.existingBrain ? "Reuse the existing brain without restructuring it." : "Create only the approved agent namespace when first written.",
    ],
    requiresWriteApproval: true,
  };
}

export function applyVerifyPlan(plan: VerifyPlan, proof: BossApprovalProof | null): string {
  assertValidApprovalProof(proof);
  validatePointer(plan.pointer);
  if (plan.pointer.rootPath !== null && !fs.existsSync(plan.pointer.rootPath)) fs.mkdirSync(plan.pointer.rootPath, { recursive: true });
  return atomicWriteJson(plan.projectRoot, path.posix.join(".hypertaks", "pointer.json"), plan.pointer);
}

export function createCheckpoint(input: {
  readonly repositoryRoot: string;
  readonly id: string;
  readonly objective: string;
  readonly contractId: string;
  readonly completed: readonly string[];
  readonly pending: readonly string[];
  readonly blockers: readonly string[];
  readonly nextAction: string;
  readonly permissions: readonly string[];
  readonly tests: readonly TestEvidence[];
  readonly acceptanceCriteria: readonly AcceptanceCriterion[];
}): TaskCheckpoint {
  validateRecordId(input.id);
  const repository = readGitState(input.repositoryRoot);
  const checkpoint: TaskCheckpoint = {
    schemaVersion: "4.5.1",
    id: input.id,
    createdAt: new Date().toISOString(),
    objective: input.objective,
    contractId: input.contractId,
    repository,
    completed: [...input.completed],
    pending: [...input.pending],
    blockers: [...input.blockers],
    nextAction: input.nextAction,
    permissions: [...input.permissions],
    tests: [...input.tests],
    acceptanceCriteria: [...input.acceptanceCriteria],
  };
  assertNoSecrets(checkpoint);
  return checkpoint;
}

export function writeCheckpoint(root: string, relativePath: string, checkpoint: TaskCheckpoint): string {
  return atomicWriteJson(root, relativePath, checkpoint);
}

export function readCheckpoint(root: string, relativePath: string): TaskCheckpoint {
  const file = resolveWithinApprovedRoot(root, relativePath, false);
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!isObject(parsed) || parsed.schemaVersion !== "4.5.1") throw new Error("INVALID_CHECKPOINT.");
  assertString(parsed.id, "checkpoint.id");
  if (!isObject(parsed.repository)) throw new Error("INVALID_CHECKPOINT: repository state missing.");
  return parsed as unknown as TaskCheckpoint;
}

export function resumeCheckpoint(repositoryRoot: string, checkpoint: TaskCheckpoint): TaskCheckpoint {
  const actual = readGitState(repositoryRoot);
  if (actual.repositoryId !== checkpoint.repository.repositoryId) throw new Error("CHECKPOINT_REPOSITORY_MISMATCH.");
  if (actual.branch !== checkpoint.repository.branch) throw new Error("CHECKPOINT_BRANCH_MISMATCH.");
  if (actual.commit !== checkpoint.repository.commit) throw new Error("CHECKPOINT_COMMIT_MISMATCH.");
  return checkpoint;
}

export function verifyProofOfDone(repositoryRoot: string, checkpoint: TaskCheckpoint): ProofOfDoneResult {
  const reasons: string[] = [];
  const current = readGitState(repositoryRoot);
  if (current.commit !== checkpoint.repository.commit) reasons.push("Checkpoint commit does not match current HEAD.");
  if (checkpoint.tests.length === 0) reasons.push("No test evidence was recorded.");
  for (const test of checkpoint.tests) {
    if (test.exitCode !== 0) reasons.push(`Test failed: ${test.command}`);
    if (test.commit !== current.commit) reasons.push(`Test evidence is stale: ${test.command}`);
  }
  for (const criterion of checkpoint.acceptanceCriteria) {
    if (criterion.status !== "PASS" || !criterion.evidence) reasons.push(`Acceptance criterion not proven: ${criterion.id}`);
  }
  if (checkpoint.pending.length > 0) reasons.push("Pending work remains.");
  if (checkpoint.blockers.length > 0) reasons.push("Unresolved blockers remain.");
  return { verified: reasons.length === 0, status: reasons.length === 0 ? "DONE" : "NOT_DONE", reasons };
}

export function generateHandoff(checkpoint: TaskCheckpoint): string {
  const lines = [
    "# Hypertaks Agent Handoff",
    "",
    `Checkpoint: ${checkpoint.id}`,
    `Objective: ${checkpoint.objective}`,
    `Contract: ${checkpoint.contractId}`,
    `Branch: ${checkpoint.repository.branch}`,
    `Commit: ${checkpoint.repository.commit}`,
    `Permissions: ${checkpoint.permissions.join(", ") || "none"}`,
    "",
    "## Completed",
    ...checkpoint.completed.map((item) => `- ${item}`),
    "",
    "## Pending",
    ...checkpoint.pending.map((item) => `- ${item}`),
    "",
    "## Blockers",
    ...checkpoint.blockers.map((item) => `- ${item}`),
    "",
    "## Next action",
    checkpoint.nextAction,
  ];
  return redactSecrets(lines.join("\n"));
}

function directSearch(repositoryRoot: string, query: string): GraphQueryResult {
  const commands: readonly (readonly string[])[] = [
    ["rg", "--line-number", "--fixed-strings", "--glob", "!graphify-out/**", query, repositoryRoot],
    ["grep", "-R", "-n", "-F", "--exclude-dir=.git", "--exclude-dir=graphify-out", query, repositoryRoot],
  ];
  for (const command of commands) {
    try {
      const output = execFileSync(command[0] as string, command.slice(1) as string[], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      return { success: true, modeUsed: "direct_search", data: output.split(/\r?\n/u).filter(Boolean), message: "Graphify unavailable or disabled. Direct repository search executed." };
    } catch (error) {
      const status = isObject(error) && typeof error.status === "number" ? error.status : null;
      if (status === 1) return { success: true, modeUsed: "direct_search", data: [], message: "Direct repository search executed with no matches." };
    }
  }
  return { success: false, modeUsed: "direct_search", data: null, message: "Neither Graphify nor a direct search executable is available." };
}

export async function queryGraphifyOrFallback(options: GraphQueryOptions): Promise<GraphQueryResult> {
  if (options.mode === "disabled") return directSearch(options.repositoryRoot, options.query);
  if (options.mode === "http_mcp") {
    assertValidApprovalProof(options.approvalProof);
    if (options.endpoint === null || !options.endpoint.startsWith("https://")) return { success: false, modeUsed: "http_mcp", data: null, message: "Shared Graphify requires an explicit HTTPS endpoint." };
    if (options.authTokenEnv === null || !process.env[options.authTokenEnv]) return { success: false, modeUsed: "http_mcp", data: null, message: "Shared Graphify authentication handle is missing." };
  }
  if ((options.mode === "stdio_mcp" || options.mode === "http_mcp") && options.executor !== null) {
    try {
      const data = await options.executor.execute(options.operation, { query: options.query, endpoint: options.endpoint });
      return { success: true, modeUsed: options.mode, data, message: `Graphify ${options.mode} operation completed.` };
    } catch (error) {
      return { success: false, modeUsed: options.mode, data: null, message: error instanceof Error ? error.message : "Graphify operation failed." };
    }
  }
  if (options.mode === "local_cli" && options.localCommand !== null && options.localCommand.length > 0) {
    try {
      const [command, ...args] = options.localCommand;
      if (command === undefined) throw new Error("Graphify command is missing.");
      const output = execFileSync(command, [...args, options.query], { cwd: options.repositoryRoot, encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });
      return { success: true, modeUsed: "local_cli", data: output, message: "Verified local Graphify command completed." };
    } catch (error) {
      return { success: false, modeUsed: "local_cli", data: null, message: error instanceof Error ? error.message : "Local Graphify command failed." };
    }
  }
  return directSearch(options.repositoryRoot, options.query);
}

export function checkGraphFreshness(sourceCommit: string | null, sourceBranch: string | null, current: GitState): GraphFreshness {
  if (sourceCommit === null || sourceBranch === null) return { state: "UNVERIFIED", reason: "Graph metadata does not identify a source branch and commit." };
  if (sourceBranch !== current.branch) return { state: "STALE", reason: "Graph branch does not match the active branch." };
  if (sourceCommit !== current.commit) return { state: "STALE", reason: "Graph commit does not match current HEAD." };
  return { state: "FRESH", reason: "Graph branch and commit match current repository state." };
}

export const PROJECT_OPERATING_CONTEXT_FILES: readonly string[] = [
  "Vision.ctx.md",
  "Requirements.ctx.md",
  "U-Experience.ctx.md",
  "architecture.ctx.md",
  "law.ctx.md",
  "database.ctx.md",
  "design.ctx.md",
  "api.ctx.md",
  "coding-rules.ctx.md",
  "roadmap.ctx.md",
  "preference.ctx.md",
  "prompt-build-continunity-prompt.ctx.md",
  "security.ctx.md",
];

export interface ContextGitState {
  readonly commit: string;
  readonly branch: string;
  readonly clean: boolean;
}

export function safeContextGitState(projectRoot: string): ContextGitState {
  try {
    return {
      commit: git(projectRoot, ["rev-parse", "HEAD"]),
      branch: git(projectRoot, ["rev-parse", "--abbrev-ref", "HEAD"]),
      clean: git(projectRoot, ["status", "--porcelain"]).length === 0,
    };
  } catch {
    return { commit: "unknown", branch: "unknown", clean: false };
  }
}

/**
 * Canonical single source of truth for generated Project Operating Context
 * documents. Both the runtime bootstrap and the standalone CLI script render
 * through this function so the two generation paths cannot drift.
 *
 * Generated documents are unverified scaffolding: they begin as DRAFT, never
 * claim verified evidence, and never claim that no unresolved issues exist.
 */
export function generateProjectContextDocument(
  filename: string,
  projectId: string,
  agentName: string,
  gitState: ContextGitState,
): string {
  const title = filename.replace(".ctx.md", "");
  const timestamp = new Date().toISOString();
  return `---
id: ${title}
version: 1.0.0
timestamp: ${timestamp}
evidence_class: T6_GENERATED
provenance:
  agent_id: ${agentName}
  source_file: .hypertaks/projects/${projectId}/${filename}
  contract_id: HT-${projectId}
source_git_state:
  commit_sha: ${gitState.commit}
  branch: ${gitState.branch}
  clean_tree: ${gitState.clean}
authority: 6
freshness: FRESH
status: ACTIVE
lifecycle_state: DRAFT
verification: UNVERIFIED
---

# ${title} - Project Operating Context

## Domain Adaptation & Purpose
Universal living context document for ${title} adaptively serving software, business, operational, healthcare, financial, research, or governance domains.

## Current State & Evolution
- Status: Active living document (generated scaffold, not yet verified)
- Generated At: ${timestamp}
- Verification: UNVERIFIED - no project-specific evidence has been assessed yet. The freshness timestamp describes generation time only, not evidentiary verification.

## Decisions & Rationale
### Facts vs Assumptions
- Facts: Verified primary evidence from repository and active Boss turns.
- Assumptions: Working hypotheses subject to empirical verification.

### Requirements vs Preferences
- Requirements: Core non-negotiables, contract bounds, and explicit Boss directives.
- Preferences: Flexible choices and aesthetic directions.

### Constraints vs Recommendations
- Constraints: Hard security, legal, architectural, and financial invariants.
- Recommendations: Operational guidance and best practices.

### Evidence vs Interpretation
- Evidence: Verifiable primary source data.
- Interpretation: Analytical conclusions and strategic synthesis.

## Dependencies & Context Bindings
- Inter-file links to sibling *.ctx.md context documents within .hypertaks/projects/${projectId}/.

## Unresolved Issues & Historical Decisions
- Historical Decisions: Workspace initialized from a generated scaffold.
- Unresolved Issues: Not yet assessed. This document was generated without project-specific evidence; assessment is required before any issue can be declared resolved or none pending.

## Evidence Promotion
- lifecycle_state advances from DRAFT to VERIFIED only when actual project evidence or explicit Boss review is recorded in this document. Generated scaffolding never self-promotes.

## Future Implications & Directives
- Persistent foundation for human operators and participating agents.
`;
}

export function bootstrapProjectWorkspace(
  projectRoot: string,
  projectId: string,
  grant: WorkspaceWriteGrant | null | undefined,
  agentName: string = "Hypertaks-Founder",
  fsOps?: AtomicFsOperations,
): readonly string[] {
  // Authorization first: no filesystem effect may occur without a trusted grant
  // minted from an authentic T1 contract activation that grants PERM_FILE_WRITE.
  // This closes direct call bypass at the actual mutation boundary.
  assertWorkspaceWriteGrant(grant, projectId, projectRoot);
  validateRecordId(projectId);
  const sanitizedAgent = sanitizeAgentName(agentName);
  const targetDir = path.posix.join(".hypertaks", "projects", projectId);
  const canonicalRoot = normalizeRoot(projectRoot, false);
  const gitState = safeContextGitState(canonicalRoot);
  const created: string[] = [];

  for (const filename of PROJECT_OPERATING_CONTEXT_FILES) {
    const relativePath = path.posix.join(targetDir, filename);
    const fullPath = resolveWithinApprovedRoot(canonicalRoot, relativePath, true);
    if (!fs.existsSync(fullPath)) {
      const content = generateProjectContextDocument(filename, projectId, sanitizedAgent, gitState);
      atomicWriteText(canonicalRoot, relativePath, content, fsOps);
      created.push(fullPath);
    }
  }

  return created;
}

