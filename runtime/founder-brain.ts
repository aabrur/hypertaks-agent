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
  readonly schemaVersion: "4.5.0";
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
  readonly schemaVersion: "4.5.0";
  readonly id: string;
  readonly title: string;
  readonly decision: string;
  readonly status: "PROPOSED" | "APPROVED" | "REJECTED" | "SUPERSEDED";
  readonly bossEvidence: BossEvidence | null;
  readonly createdAt: string;
}

export interface BrainPointerConfig {
  readonly schemaVersion: "4.5.0";
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
  readonly schemaVersion: "4.5.0";
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
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes("\u0000")) {
    throw new Error("PATH_OUTSIDE_APPROVED_ROOT: an absolute, empty, or null-containing path is not allowed.");
  }
  const canonicalRoot = normalizeRoot(root, false);
  const candidate = path.resolve(canonicalRoot, relativePath);
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

export function atomicWriteText(root: string, relativePath: string, content: string): string {
  assertNoSecrets(content);
  const target = resolveWithinApprovedRoot(root, relativePath, true);
  const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, content, { encoding: "utf8", flag: "wx", mode: 0o600 });
  try {
    fs.renameSync(temporary, target);
  } catch (error) {
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
    fs.renameSync(temporary, target);
    if (error instanceof Error && !fs.existsSync(target)) throw error;
  }
  return target;
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
    schemaVersion: "4.5.0",
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
    schemaVersion: "4.5.0",
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
  if (value.schemaVersion !== "4.5.0") throw new Error("UNSUPPORTED_POINTER_VERSION.");
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
    schemaVersion: "4.5.0",
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
    schemaVersion: "4.5.0",
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
  if (!isObject(parsed) || parsed.schemaVersion !== "4.5.0") throw new Error("INVALID_CHECKPOINT.");
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
