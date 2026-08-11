import { createHash } from "node:crypto";

export const CONTRACT_ID = "HT-20260811-FOS";

export const ALLOWED_PERMISSIONS = Object.freeze([
  "PERM_EXECUTE",
  "PERM_FILE_WRITE",
  "PERM_READ_LOCAL",
]);

export const FORBIDDEN_EFFECTS = Object.freeze([
  "network",
  "spend",
  "publish",
  "deploy",
  "third_party_communication",
  "delete",
  "onchain",
  "commit",
  "merge",
  "cherry_pick",
  "push",
]);

export const WORKFLOW_STEPS = Object.freeze([
  Object.freeze({ stepIndex: 0, name: "VALIDATE_COMMAND", requiredCapabilities: [], proofCriteria: "Command is RESEARCH and bound to the active contract and authorization." }),
  Object.freeze({ stepIndex: 1, name: "COMPILE_CONTEXT", requiredCapabilities: ["hypertaks_context"], proofCriteria: "Local corpus is screened and compiled within the token budget." }),
  Object.freeze({ stepIndex: 2, name: "SELECT_METHODOLOGY", requiredCapabilities: [], proofCriteria: "A fresh, supported methodology with an output shape is selected." }),
  Object.freeze({ stepIndex: 3, name: "SELECT_CAPABILITIES", requiredCapabilities: ["hypertaks_retrieve"], proofCriteria: "Only an available read-only internal capability is selected." }),
  Object.freeze({ stepIndex: 4, name: "READ_ONLY_RESEARCH", requiredCapabilities: ["hypertaks_retrieve"], proofCriteria: "Research produces evidence references without external effects." }),
  Object.freeze({ stepIndex: 5, name: "BUILD_DELIVERABLE", requiredCapabilities: [], proofCriteria: "The requested deliverable is materialized before status or handoff prose." }),
  Object.freeze({ stepIndex: 6, name: "CHECKPOINT", requiredCapabilities: [], proofCriteria: "A verified checkpoint binds the deliverable, evidence, authorization, and Git state." }),
  Object.freeze({ stepIndex: 7, name: "RECONCILE_GIT", requiredCapabilities: [], proofCriteria: "Repository root, branch, and commit match the command contract." }),
  Object.freeze({ stepIndex: 8, name: "BUILD_HANDOFF", requiredCapabilities: [], proofCriteria: "Cross-host handoff is redacted and bound to a verified checkpoint." }),
  Object.freeze({ stepIndex: 9, name: "VERIFY_DONE", requiredCapabilities: [], proofCriteria: "Completion is true only when every required criterion has current evidence." }),
]);

/**
 * @typedef {object} WorkflowDefinition
 * @property {string} workflowId
 * @property {string} name
 * @property {readonly {stepIndex:number,name:string,requiredCapabilities:readonly string[],proofCriteria:string}[]} steps
 */

/**
 * @typedef {object} WorkflowCheckpoint
 * @property {string} checkpointId
 * @property {string} contractId
 * @property {number} stepIndex
 * @property {readonly string[]} completedDeliverables
 * @property {readonly string[]} pendingTasks
 * @property {string} lastEventId
 * @property {object} brainPointer
 * @property {string} workflowId
 * @property {string} commandDigest
 * @property {string} authorizationFingerprint
 * @property {object} gitState
 * @property {readonly string[]} evidenceRefs
 * @property {boolean} verified
 */

/**
 * @typedef {object} FounderCommand
 * @property {string} commandId
 * @property {"RESEARCH"} commandType
 * @property {string} contractId
 * @property {boolean} isResumable
 * @property {string|null} activeCheckpointId
 * @property {string} objective
 * @property {string} query
 * @property {string} approvedRoot
 * @property {readonly string[]} permissions
 * @property {false} networkAllowed
 * @property {object} expectedGitState
 * @property {string} outputRef
 */

/**
 * @typedef {object} ContinuationContract
 * @property {string} continuationId
 * @property {string} parentSessionId
 * @property {string} targetAgent
 * @property {string} activeContractId
 * @property {string} handoffSummary
 * @property {readonly string[]} openBlockers
 * @property {readonly WorkflowCheckpoint[]} verifiedCheckpoints
 * @property {string} gitCommit
 * @property {string} workflowId
 * @property {string} commandDigest
 * @property {string} checkpointDigest
 * @property {string} authorizationFingerprint
 * @property {readonly string[]} allowedPermissions
 * @property {readonly string[]} forbiddenEffects
 */

export const WORKFLOW_DEFINITION = Object.freeze({
  workflowId: "founder-research-v1",
  name: "Resumable local-only Founder RESEARCH",
  steps: WORKFLOW_STEPS,
});

export function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}
export function digest(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`INVALID_${label}: expected an object.`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`INVALID_${label}: expected a non-empty string.`);
  }
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new Error(`INVALID_${label}: expected an array of non-empty strings.`);
  }
}

export function authorizationFingerprint(command) {
  return digest({
    approvedRoot: command.approvedRoot,
    contractId: command.contractId,
    permissions: [...command.permissions].sort(),
  });
}

export function commandDigest(command) {
  return digest({
    commandId: command.commandId,
    commandType: command.commandType,
    contractId: command.contractId,
    objective: command.objective,
    query: command.query,
    approvedRoot: command.approvedRoot,
    permissions: [...command.permissions].sort(),
    networkAllowed: command.networkAllowed,
    expectedGitState: command.expectedGitState,
    outputRef: command.outputRef,
  });
}

export function validateWorkflowDefinition(definition = WORKFLOW_DEFINITION) {
  requireObject(definition, "WORKFLOW_DEFINITION");
  requireString(definition.workflowId, "WORKFLOW_ID");
  requireString(definition.name, "WORKFLOW_NAME");
  if (!Array.isArray(definition.steps) || definition.steps.length !== WORKFLOW_STEPS.length) {
    throw new Error("INVALID_WORKFLOW_STEPS: exact RESEARCH step set is required.");
  }
  definition.steps.forEach((step, index) => {
    requireObject(step, "WORKFLOW_STEP");
    if (step.stepIndex !== index || step.name !== WORKFLOW_STEPS[index].name) {
      throw new Error(`INVALID_WORKFLOW_STEP: expected ${WORKFLOW_STEPS[index].name} at index ${index}.`);
    }
    requireStringArray(step.requiredCapabilities, "REQUIRED_CAPABILITIES");
    requireString(step.proofCriteria, "PROOF_CRITERIA");
  });
  return definition;
}

export function validateGitState(gitState, label = "GIT_STATE") {
  requireObject(gitState, label);
  for (const field of ["repositoryRoot", "repositoryId", "branch", "commit"]) {
    requireString(gitState[field], `${label}_${field.toUpperCase()}`);
  }
  requireStringArray(gitState.changedFiles, `${label}_CHANGED_FILES`);
  return gitState;
}

export function validateFounderCommand(command) {
  requireObject(command, "FOUNDER_COMMAND");
  for (const field of ["commandId", "contractId", "objective", "query", "approvedRoot", "outputRef"]) {
    requireString(command[field], `COMMAND_${field.toUpperCase()}`);
  }
  if (command.commandType !== "RESEARCH") {
    throw new Error("UNSUPPORTED_COMMAND: this vertical slice accepts RESEARCH only.");
  }
  if (command.contractId !== CONTRACT_ID) {
    throw new Error(`CONTRACT_MISMATCH: expected ${CONTRACT_ID}.`);
  }
  if (command.isResumable !== true) {
    throw new Error("INVALID_COMMAND: RESEARCH must be resumable.");
  }
  if (command.activeCheckpointId !== null && typeof command.activeCheckpointId !== "string") {
    throw new Error("INVALID_COMMAND: activeCheckpointId must be null or a string.");
  }
  if (command.networkAllowed !== false) {
    throw new Error("NETWORK_DENIED: this vertical slice is local-only.");
  }
  if (!command.outputRef.startsWith("deliverable://") || command.outputRef.includes("..")) {
    throw new Error("INVALID_OUTPUT_REF: output must use a contained deliverable reference.");
  }
  requireStringArray(command.permissions, "COMMAND_PERMISSIONS");
  const unknown = command.permissions.filter((permission) => !ALLOWED_PERMISSIONS.includes(permission));
  if (unknown.length > 0) {
    throw new Error(`PERMISSION_ESCALATION: ${unknown.join(", ")} is outside the approved contract.`);
  }
  if (!command.permissions.includes("PERM_READ_LOCAL")) {
    throw new Error("PERMISSION_DENIED: PERM_READ_LOCAL is required.");
  }
  validateGitState(command.expectedGitState, "EXPECTED_GIT_STATE");
  return command;
}

export function validateCheckpoint(checkpoint, command) {
  requireObject(checkpoint, "WORKFLOW_CHECKPOINT");
  for (const field of ["checkpointId", "contractId", "lastEventId", "workflowId", "commandDigest", "authorizationFingerprint"]) {
    requireString(checkpoint[field], `CHECKPOINT_${field.toUpperCase()}`);
  }
  if (!Number.isInteger(checkpoint.stepIndex) || checkpoint.stepIndex < 0 || checkpoint.stepIndex >= WORKFLOW_STEPS.length) {
    throw new Error("INVALID_CHECKPOINT: stepIndex is outside the workflow.");
  }
  requireStringArray(checkpoint.completedDeliverables, "CHECKPOINT_COMPLETED_DELIVERABLES");
  requireStringArray(checkpoint.pendingTasks, "CHECKPOINT_PENDING_TASKS");
  requireStringArray(checkpoint.evidenceRefs, "CHECKPOINT_EVIDENCE_REFS");
  requireObject(checkpoint.brainPointer, "CHECKPOINT_BRAIN_POINTER");
  validateGitState(checkpoint.gitState, "CHECKPOINT_GIT_STATE");
  if (checkpoint.verified !== true) throw new Error("INVALID_CHECKPOINT: checkpoint is not verified.");
  if (checkpoint.contractId !== command.contractId) throw new Error("CHECKPOINT_MISMATCH: contract differs.");
  if (checkpoint.workflowId !== WORKFLOW_DEFINITION.workflowId) throw new Error("CHECKPOINT_MISMATCH: workflow differs.");
  if (checkpoint.commandDigest !== commandDigest(command)) throw new Error("CHECKPOINT_MISMATCH: command digest differs.");
  if (checkpoint.authorizationFingerprint !== authorizationFingerprint(command)) {
    throw new Error("CHECKPOINT_MISMATCH: authorization differs.");
  }
  return checkpoint;
}

export function validateContinuationContract(continuation, command) {
  requireObject(continuation, "CONTINUATION_CONTRACT");
  for (const field of [
    "continuationId", "parentSessionId", "targetAgent", "activeContractId",
    "handoffSummary", "gitCommit", "workflowId", "commandDigest",
    "checkpointDigest", "authorizationFingerprint",
  ]) requireString(continuation[field], `CONTINUATION_${field.toUpperCase()}`);
  requireStringArray(continuation.openBlockers, "CONTINUATION_OPEN_BLOCKERS");
  requireStringArray(continuation.allowedPermissions, "CONTINUATION_ALLOWED_PERMISSIONS");
  requireStringArray(continuation.forbiddenEffects, "CONTINUATION_FORBIDDEN_EFFECTS");
  if (!Array.isArray(continuation.verifiedCheckpoints) || continuation.verifiedCheckpoints.length !== 1) {
    throw new Error("CONTINUATION_MISMATCH: exactly one verified checkpoint is required.");
  }
  if (continuation.activeContractId !== command.contractId) throw new Error("CONTINUATION_MISMATCH: contract differs.");
  if (continuation.workflowId !== WORKFLOW_DEFINITION.workflowId) throw new Error("CONTINUATION_MISMATCH: workflow differs.");
  if (continuation.commandDigest !== commandDigest(command)) throw new Error("CONTINUATION_MISMATCH: command differs.");
  if (continuation.authorizationFingerprint !== authorizationFingerprint(command)) {
    throw new Error("CONTINUATION_MISMATCH: authorization differs.");
  }
  if (stableStringify([...continuation.allowedPermissions].sort()) !== stableStringify([...command.permissions].sort())) {
    throw new Error("CONTINUATION_MISMATCH: permissions differ.");
  }
  if (continuation.gitCommit !== command.expectedGitState.commit) throw new Error("CONTINUATION_MISMATCH: Git commit differs.");
  const checkpoint = validateCheckpoint(continuation.verifiedCheckpoints[0], command);
  if (continuation.checkpointDigest !== digest(checkpoint)) throw new Error("CONTINUATION_MISMATCH: checkpoint digest differs.");
  return continuation;
}
