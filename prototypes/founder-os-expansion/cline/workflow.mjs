import { compileContext } from "../pi/compiler.mjs";
import {
  ExecutionEnvelope,
  NativeToolFacade,
  ToolRegistry,
  findSecrets,
  redactSecrets,
} from "../command-code/tool-registry.mjs";
import {
  FORBIDDEN_EFFECTS,
  WORKFLOW_DEFINITION,
  WORKFLOW_STEPS,
  authorizationFingerprint,
  commandDigest,
  digest,
  stableStringify,
  validateContinuationContract,
  validateFounderCommand,
  validateWorkflowDefinition,
} from "./contracts.mjs";
import { BRAIN_POINTER, SUPPORTED_METHODOLOGY } from "./fixtures.mjs";

const BASE_TIME = Date.parse("2026-08-11T00:00:00.000Z");
const CHECKPOINT_BOUNDARIES = new Set([
  "COMPILE_CONTEXT",
  "READ_ONLY_RESEARCH",
  "CHECKPOINT",
  "RECONCILE_GIT",
  "BUILD_HANDOFF",
  "VERIFY_DONE",
]);

const INJECTION_PATTERNS = Object.freeze([
  /ignore (all |the )?(previous|prior) instructions?/i,
  /mark (the )?task complete without evidence/i,
  /\[system approved\]/i,
  /reveal (a |the )?(secret|credential|token)/i,
  /execute (this |the )?(command|instruction)/i,
]);

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}
function redactValue(value) {
  return JSON.parse(redactSecrets(JSON.stringify(value)));
}

function reconcileGit(expected, actual) {
  const mismatches = [];
  for (const field of ["repositoryRoot", "repositoryId", "branch", "commit"]) {
    if (expected[field] !== actual[field]) mismatches.push(field);
  }
  return Object.freeze({ matched: mismatches.length === 0, mismatches: Object.freeze(mismatches) });
}

function screenCorpus(corpus) {
  const safeDocuments = [];
  const injectionAttempts = [];
  let redactedSourceCount = 0;

  for (const source of corpus) {
    const rawText = `${source.title}\n${source.content}`;
    const matchedPattern = INJECTION_PATTERNS.find((pattern) => pattern.test(rawText));
    if (matchedPattern) {
      injectionAttempts.push(Object.freeze({
        sourceId: source.doc_id,
        kind: "INJECTION_ATTEMPT",
        disposition: "QUARANTINED_AS_DATA",
      }));
      continue;
    }

    const hadSecret = findSecrets(rawText).length > 0;
    const sanitized = redactValue(source);
    if (hadSecret) redactedSourceCount += 1;
    safeDocuments.push(Object.freeze(sanitized));
  }

  return Object.freeze({
    safeDocuments: Object.freeze(safeDocuments),
    injectionAttempts: Object.freeze(injectionAttempts),
    redactedSourceCount,
  });
}

function detectContradictions(corpus) {
  const byFact = new Map();
  for (const source of corpus) {
    if (!source.fact_key || source.fact_value === undefined) continue;
    const entries = byFact.get(source.fact_key) ?? [];
    entries.push(source);
    byFact.set(source.fact_key, entries);
  }

  const contradictions = [];
  for (const [factKey, entries] of byFact.entries()) {
    const values = [...new Set(entries.map((entry) => stableStringify(entry.fact_value)))];
    if (values.length > 1) {
      contradictions.push(Object.freeze({
        factKey,
        sourceIds: Object.freeze(entries.map((entry) => entry.doc_id).sort()),
        values: Object.freeze(values.sort()),
        status: "UNRESOLVED",
      }));
    }
  }
  return Object.freeze(contradictions);
}

function selectMethodology(candidate = SUPPORTED_METHODOLOGY) {
  const rejectionReasons = [];
  if (!candidate || candidate.status !== "supported") rejectionReasons.push("status_not_supported");
  if (!candidate?.freshness || candidate.freshness.state !== "FRESH") rejectionReasons.push("freshness_not_fresh");
  if (!candidate?.license || candidate.license.commercialUse !== true) rejectionReasons.push("license_not_usable");
  if (!candidate?.expectedOutputShape || !Array.isArray(candidate.expectedOutputShape.requiredFields)) {
    rejectionReasons.push("missing_expected_output_shape");
  }
  if (candidate?.preconditions?.allowExternalCorpus !== false) rejectionReasons.push("external_corpus_not_denied");
  if (candidate?.preconditions?.allowSideEffects !== false) rejectionReasons.push("side_effects_not_denied");
  return Object.freeze({
    selected: rejectionReasons.length === 0,
    methodId: rejectionReasons.length === 0 ? candidate.methodId : null,
    outputShape: rejectionReasons.length === 0 ? candidate.expectedOutputShape : null,
    rejectionReasons: Object.freeze(rejectionReasons),
  });
}

class InMemoryEffectLedger {
  constructor() { this.entries = new Map(); }
  has(key) { return this.entries.has(key); }
  commit(key, payload) {
    if (this.entries.has(key)) return false;
    this.entries.set(key, redactValue(payload));
    return true;
  }
  count() { return this.entries.size; }
}

function executeReadOnlyCapability(command, query) {
  const registry = new ToolRegistry();
  const descriptor = registry.get("hypertaks_retrieve");
  const operation = "direct_search";

  if (!descriptor.operations.includes(operation)) {
    throw new Error(`OPERATION_DENIED: ${operation} is not declared by ${descriptor.capabilityId}.`);
  }
  if (descriptor.sideEffect !== "none") {
    throw new Error(`SIDE_EFFECT_DENIED: ${descriptor.capabilityId} is not read-only.`);
  }
  if (registry.publicSurfaceIds().length !== 4) {
    throw new Error("PUBLIC_SURFACE_DRIFT: expected exactly four read-only MCP tools.");
  }

  const ledger = new InMemoryEffectLedger();
  const facade = new NativeToolFacade(registry, ledger);
  const envelope = new ExecutionEnvelope({
    exactRoot: command.approvedRoot,
    timeoutMs: 1000,
    maxOutputBytes: 16384,
    maxRetries: 1,
    maxEffects: 0,
  });
  const prepared = facade.prepare(descriptor.capabilityId, operation, { query }, envelope, []);
  if (prepared.error || !prepared.transaction) throw new Error(prepared.error ?? "CAPABILITY_PREPARE_FAILED");
  const committed = facade.commit(prepared.transaction);
  if (!committed.result || committed.result.isError) throw new Error("CAPABILITY_EXECUTION_FAILED");

  return Object.freeze({
    capabilityId: descriptor.capabilityId,
    operation,
    sideEffect: descriptor.sideEffect,
    mutationPerformed: false,
    idempotencyKey: prepared.transaction.idempotencyKey,
    transactionStates: Object.freeze(prepared.transaction.states.map((entry) => entry.state)),
    fallbackMode: committed.result.structuredContent.mode,
    publicSurfaceCount: registry.publicSurfaceIds().length,
  });
}

export class WorkflowStore {
  constructor(snapshot = null) {
    this.sequence = snapshot?.sequence ?? 0;
    this.events = copy(snapshot?.events ?? []);
    this.commits = new Map(copy(snapshot?.commits ?? []));
    this.commitCounts = new Map(copy(snapshot?.commitCounts ?? []));
    this.checkpoints = new Map(copy(snapshot?.checkpoints ?? []));
    this.deliverables = new Map(copy(snapshot?.deliverables ?? []));
  }

  now() {
    return new Date(BASE_TIME + this.sequence * 1000).toISOString();
  }

  recordEvent(kind, details = {}) {
    this.sequence += 1;
    const event = Object.freeze({
      eventId: `EVT-${String(this.sequence).padStart(4, "0")}`,
      timestamp: this.now(),
      kind,
      details: Object.freeze(redactValue(details)),
    });
    this.events.push(event);
    return event;
  }

  stepKey(commandId, stepName) {
    return digest({ commandId, stepName });
  }

  hasStep(commandId, stepName) {
    return this.commits.has(this.stepKey(commandId, stepName));
  }

  getStepResult(commandId, stepName) {
    return this.commits.get(this.stepKey(commandId, stepName))?.result ?? null;
  }

  commitStep(commandId, stepName, result) {
    const key = this.stepKey(commandId, stepName);
    const existing = this.commits.get(key);
    if (existing) {
      this.recordEvent("STEP_REPLAY", { commandId, stepName, idempotencyKey: key });
      return Object.freeze({ record: existing, replayed: true });
    }
    const safeResult = redactValue(result);
    const record = Object.freeze({
      commandId,
      stepName,
      idempotencyKey: key,
      result: Object.freeze(safeResult),
      resultDigest: digest(safeResult),
    });
    this.commits.set(key, record);
    this.commitCounts.set(key, (this.commitCounts.get(key) ?? 0) + 1);
    if (stepName === "BUILD_DELIVERABLE") this.deliverables.set(commandId, record.result);
    this.recordEvent("STEP_COMMIT", { commandId, stepName, idempotencyKey: key, resultDigest: record.resultDigest });
    return Object.freeze({ record, replayed: false });
  }

  countStepCommits(commandId, stepName) {
    return this.commitCounts.get(this.stepKey(commandId, stepName)) ?? 0;
  }

  saveCheckpoint(command, step, currentGit) {
    const research = this.getStepResult(command.commandId, "READ_ONLY_RESEARCH");
    const deliverable = this.deliverables.get(command.commandId) ?? null;
    const lastEvent = this.events.at(-1);
    const seed = {
      commandId: command.commandId,
      stepIndex: step.stepIndex,
      lastEventId: lastEvent.eventId,
      commandDigest: commandDigest(command),
      authorizationFingerprint: authorizationFingerprint(command),
    };
    const checkpoint = Object.freeze({
      checkpointId: `CP-${digest(seed).slice(0, 16)}`,
      contractId: command.contractId,
      stepIndex: step.stepIndex,
      completedDeliverables: Object.freeze(deliverable ? [command.outputRef] : []),
      pendingTasks: Object.freeze(WORKFLOW_STEPS.slice(step.stepIndex + 1).map((entry) => entry.name)),
      lastEventId: lastEvent.eventId,
      brainPointer: BRAIN_POINTER,
      workflowId: WORKFLOW_DEFINITION.workflowId,
      commandDigest: commandDigest(command),
      authorizationFingerprint: authorizationFingerprint(command),
      gitState: Object.freeze(copy(currentGit)),
      evidenceRefs: Object.freeze(research?.evidenceRefs ?? []),
      verified: true,
    });
    this.checkpoints.set(checkpoint.checkpointId, checkpoint);
    this.recordEvent("CHECKPOINT_SAVED", { checkpointId: checkpoint.checkpointId, stepIndex: step.stepIndex });
    return checkpoint;
  }

  latestCheckpoint(commandId) {
    const candidates = [...this.checkpoints.values()]
      .filter((checkpoint) => this.commits.has(this.stepKey(commandId, WORKFLOW_STEPS[checkpoint.stepIndex].name)))
      .sort((a, b) => b.stepIndex - a.stepIndex || b.lastEventId.localeCompare(a.lastEventId));
    return candidates[0] ?? null;
  }

  snapshot() {
    return copy({
      sequence: this.sequence,
      events: this.events,
      commits: [...this.commits.entries()],
      commitCounts: [...this.commitCounts.entries()],
      checkpoints: [...this.checkpoints.entries()],
      deliverables: [...this.deliverables.entries()],
    });
  }

  static fromSnapshot(snapshot) {
    return new WorkflowStore(snapshot);
  }
}

function makeContinuation(command, checkpoint, store, blockers = [], handoffNote = "") {
  const handoffSummary = redactSecrets(
    `Resume ${command.commandType} ${command.commandId} after checkpoint ${checkpoint.checkpointId}. ${handoffNote}`.trim(),
  );
  const continuation = Object.freeze({
    continuationId: `CONT-${digest({ commandId: command.commandId, checkpointId: checkpoint.checkpointId }).slice(0, 16)}`,
    parentSessionId: `SESSION-${command.commandId}`,
    targetAgent: "compatible-local-host",
    activeContractId: command.contractId,
    handoffSummary,
    openBlockers: Object.freeze(blockers.map((entry) => redactSecrets(entry))),
    verifiedCheckpoints: Object.freeze([checkpoint]),
    gitCommit: command.expectedGitState.commit,
    workflowId: WORKFLOW_DEFINITION.workflowId,
    commandDigest: commandDigest(command),
    checkpointDigest: digest(checkpoint),
    authorizationFingerprint: authorizationFingerprint(command),
    allowedPermissions: Object.freeze([...command.permissions].sort()),
    forbiddenEffects: FORBIDDEN_EFFECTS,
    createdAt: store.now(),
  });
  return continuation;
}

function makeEmergencyHandoff(command, store, reason) {
  const checkpoint = store.latestCheckpoint(command.commandId);
  if (!checkpoint) return null;
  return makeContinuation(command, checkpoint, store, [redactSecrets(reason)]);
}

function buildDeliverable(command, corpus, methodology) {
  const screened = screenCorpus(corpus);
  const contradictions = detectContradictions(screened.safeDocuments);
  const research = screened.safeDocuments.map((source) => Object.freeze({
    finding: source.content,
    evidenceRef: source.doc_id,
    authority: source.authority,
    freshness: source.freshness,
  }));
  const evidenceRefs = Object.freeze(research.map((entry) => entry.evidenceRef));
  const limitations = [];
  if (evidenceRefs.length < 2) limitations.push("Insufficient independent evidence for completion.");
  if (contradictions.length > 0) limitations.push("Unresolved contradictory evidence remains.");
  if (!methodology.selected) limitations.push(`Methodology rejected: ${methodology.rejectionReasons.join(", ")}.`);
  const status = evidenceRefs.length === 0
    ? "BLOCKED"
    : limitations.length > 0 ? "PARTIAL" : "COMPLETE";

  return Object.freeze({
    deliverableRef: command.outputRef,
    kind: "research_brief",
    status,
    answer: status === "COMPLETE"
      ? "Local evidence supports a resumable workflow that checkpoints explicit boundaries, reconciles Git before resume, and requires evidence-backed proof of done."
      : "The bounded corpus supports only a partial research answer; the listed limitations must be resolved before completion.",
    findings: Object.freeze(research),
    evidenceRefs,
    limitations: Object.freeze(limitations),
    contradictions,
    injectionAttempts: screened.injectionAttempts,
    methodologyId: methodology.methodId,
    networkUsed: false,
    externalWrites: 0,
  });
}

function buildHandoff(command, store, note) {
  const checkpoint = store.latestCheckpoint(command.commandId);
  const deliverable = store.deliverables.get(command.commandId);
  const handoff = {
    contractId: command.contractId,
    commandId: command.commandId,
    commandType: command.commandType,
    checkpointId: checkpoint?.checkpointId ?? null,
    gitCommit: command.expectedGitState.commit,
    authorizationFingerprint: authorizationFingerprint(command),
    permissions: [...command.permissions].sort(),
    deliverableRef: deliverable?.deliverableRef ?? null,
    deliverableStatus: deliverable?.status ?? "MISSING",
    evidenceRefs: deliverable?.evidenceRefs ?? [],
    openBlockers: deliverable?.limitations ?? [],
    summary: note,
    rawSecretsIncluded: false,
  };
  return Object.freeze(redactValue(handoff));
}

function verifyProof(command, store, currentGit) {
  const deliverable = store.deliverables.get(command.commandId);
  const research = store.getStepResult(command.commandId, "READ_ONLY_RESEARCH");
  const methodology = store.getStepResult(command.commandId, "SELECT_METHODOLOGY");
  const handoff = store.getStepResult(command.commandId, "BUILD_HANDOFF");
  const git = reconcileGit(command.expectedGitState, currentGit);
  const priorStepsCommitted = WORKFLOW_STEPS.slice(0, 9).every((step) => store.hasStep(command.commandId, step.name));
  const criteria = [
    { id: "DELIVERABLE_PRESENT", pass: Boolean(deliverable), evidence: deliverable?.deliverableRef ?? "missing" },
    { id: "DELIVERABLE_COMPLETE", pass: deliverable?.status === "COMPLETE", evidence: deliverable?.status ?? "missing" },
    { id: "EVIDENCE_SUFFICIENT", pass: (deliverable?.evidenceRefs.length ?? 0) >= 2, evidence: `${deliverable?.evidenceRefs.length ?? 0} evidence references` },
    { id: "NO_UNRESOLVED_CONTRADICTION", pass: (deliverable?.contradictions.length ?? 0) === 0, evidence: `${deliverable?.contradictions.length ?? 0} unresolved contradictions` },
    { id: "METHODOLOGY_VALID", pass: methodology?.selected === true, evidence: methodology?.methodId ?? "rejected" },
    { id: "READ_ONLY_EFFECTS", pass: research?.capability?.mutationPerformed === false && research?.capability?.sideEffect === "none", evidence: "mutationPerformed=false" },
    { id: "GIT_RECONCILED", pass: git.matched, evidence: git.matched ? currentGit.commit : git.mismatches.join(",") },
    { id: "HANDOFF_REDACTED", pass: Boolean(handoff) && findSecrets(JSON.stringify(handoff)).length === 0, evidence: "secret scan" },
    { id: "WORKFLOW_STEPS_COMMITTED", pass: priorStepsCommitted, evidence: priorStepsCommitted ? "steps 0-8 committed" : "missing committed step" },
  ].map((criterion) => Object.freeze({
    id: criterion.id,
    description: criterion.id.toLowerCase().replaceAll("_", " "),
    status: criterion.pass ? "PASS" : "FAIL",
    evidence: criterion.evidence,
  }));
  const isComplete = criteria.every((criterion) => criterion.status === "PASS");
  return Object.freeze({
    contractId: command.contractId,
    taskId: command.commandId,
    testEvidence: Object.freeze([Object.freeze({
      command: "fixture://shape-check/research-brief-v1",
      exitCode: isComplete ? 0 : 1,
      timestamp: store.now(),
      commit: currentGit.commit,
    })]),
    acceptanceCriteria: Object.freeze(criteria),
    gitState: Object.freeze(copy(currentGit)),
    verifiedAt: store.now(),
    isComplete,
    status: isComplete ? "DONE" : "NOT_DONE",
    reasons: Object.freeze(criteria.filter((criterion) => criterion.status !== "PASS").map((criterion) => criterion.id)),
  });
}

function executeStep(step, command, store, options) {
  const { corpus, methodologyCandidate, currentGit, handoffNote } = options;
  switch (step.name) {
    case "VALIDATE_COMMAND":
      return Object.freeze({
        commandId: command.commandId,
        commandType: command.commandType,
        contractId: command.contractId,
        commandDigest: commandDigest(command),
        authorizationFingerprint: authorizationFingerprint(command),
      });
    case "COMPILE_CONTEXT": {
      const screened = screenCorpus(corpus);
      const compilation = compileContext({
        compilation_id: `COMP-${command.commandId}`,
        contract_id: command.contractId,
        query: command.query,
        query_class: screened.safeDocuments.length === 0 ? "unavailable" : "small_corpus",
        filters: { status: "ACTIVE" },
        soft_token_limit: 800,
        hard_token_limit: 1200,
      }, screened.safeDocuments);
      return Object.freeze({
        ...compilation,
        routeUsed: "direct_local_scan",
        networkUsed: false,
        injectionAttempts: screened.injectionAttempts,
        redactedSourceCount: screened.redactedSourceCount,
      });
    }
    case "SELECT_METHODOLOGY":
      return selectMethodology(methodologyCandidate);
    case "SELECT_CAPABILITIES": {
      const registry = new ToolRegistry();
      const descriptor = registry.get("hypertaks_retrieve");
      if (!descriptor.operations.includes("direct_search")) throw new Error("OPERATION_DENIED: direct_search is undeclared.");
      if (descriptor.sideEffect !== "none") throw new Error("SIDE_EFFECT_DENIED: research capability is not read-only.");
      return Object.freeze({
        capabilityIds: Object.freeze([descriptor.capabilityId]),
        operation: "direct_search",
        sideEffect: descriptor.sideEffect,
        publicSurfaceCount: registry.publicSurfaceIds().length,
        fallback: descriptor.fallback,
      });
    }
    case "READ_ONLY_RESEARCH": {
      const screened = screenCorpus(corpus);
      const capability = executeReadOnlyCapability(command, command.query);
      return Object.freeze({
        findings: Object.freeze(screened.safeDocuments.map((source) => Object.freeze({
          finding: source.content,
          evidenceRef: source.doc_id,
        }))),
        evidenceRefs: Object.freeze(screened.safeDocuments.map((source) => source.doc_id)),
        injectionAttempts: screened.injectionAttempts,
        capability,
      });
    }
    case "BUILD_DELIVERABLE": {
      const methodology = store.getStepResult(command.commandId, "SELECT_METHODOLOGY");
      return buildDeliverable(command, corpus, methodology);
    }
    case "CHECKPOINT": {
      const deliverable = store.deliverables.get(command.commandId);
      return Object.freeze({
        boundary: "deliverable_committed",
        deliverableRef: deliverable?.deliverableRef ?? null,
        deliverableDigest: deliverable ? digest(deliverable) : null,
      });
    }
    case "RECONCILE_GIT":
      return reconcileGit(command.expectedGitState, currentGit);
    case "BUILD_HANDOFF":
      return buildHandoff(command, store, handoffNote);
    case "VERIFY_DONE":
      return verifyProof(command, store, currentGit);
    default:
      throw new Error(`UNKNOWN_WORKFLOW_STEP: ${step.name}`);
  }
}

function blockedResult(command, store, reason) {
  const safeReason = redactSecrets(reason);
  store.recordEvent("WORKFLOW_BLOCKED", { commandId: command?.commandId ?? "unknown", reason: safeReason });
  return Object.freeze({
    status: "BLOCKED",
    reason: safeReason,
    deliverable: command ? store.deliverables.get(command.commandId) ?? null : null,
    proof: null,
    checkpoint: command ? store.latestCheckpoint(command.commandId) : null,
    continuation: command ? makeEmergencyHandoff(command, store, safeReason) : null,
    handoff: command ? makeEmergencyHandoff(command, store, safeReason) : null,
    trace: Object.freeze(copy(store.events)),
  });
}

function interruptionResult(kind, command, store, step, reason, handoffNote) {
  const checkpoint = store.latestCheckpoint(command.commandId);
  if (!checkpoint) return blockedResult(command, store, `NO_CHECKPOINT_AVAILABLE: ${reason}`);
  store.recordEvent(kind, { commandId: command.commandId, stepName: step.name, reason });
  const continuation = makeContinuation(command, checkpoint, store, [reason], handoffNote);
  return Object.freeze({
    status: kind === "WORKFLOW_PAUSED" ? "PAUSED" : "INTERRUPTED",
    reason,
    deliverable: store.deliverables.get(command.commandId) ?? null,
    proof: null,
    checkpoint,
    continuation,
    handoff: continuation,
    trace: Object.freeze(copy(store.events)),
  });
}

export function runFounderResearch({
  command,
  store = new WorkflowStore(),
  continuation = null,
  corpus = [],
  methodologyCandidate = SUPPORTED_METHODOLOGY,
  currentGit = command?.expectedGitState,
  fault = null,
  pauseAfterStep = null,
  handoffNote = "",
}) {
  try {
    validateWorkflowDefinition();
    validateFounderCommand(command);
    if (!currentGit) throw new Error("GIT_STATE_MISSING: current Git state is required.");
  } catch (error) {
    return blockedResult(command, store, error.message);
  }

  let startIndex = 0;
  if (continuation) {
    try {
      validateContinuationContract(continuation, command);
      const checkpoint = continuation.verifiedCheckpoints[0];
      if (command.activeCheckpointId !== checkpoint.checkpointId) {
        throw new Error("CONTINUATION_MISMATCH: active checkpoint differs.");
      }
      const latest = store.latestCheckpoint(command.commandId);
      if (!latest || latest.checkpointId !== checkpoint.checkpointId) {
        throw new Error("CONTINUATION_MISMATCH: checkpoint is absent from restored state.");
      }
      const git = reconcileGit(command.expectedGitState, currentGit);
      if (!git.matched) throw new Error(`GIT_STATE_STALE: ${git.mismatches.join(", ")}.`);
      startIndex = checkpoint.stepIndex + 1;
      store.recordEvent("WORKFLOW_RESUMED", { commandId: command.commandId, checkpointId: checkpoint.checkpointId, startIndex });
    } catch (error) {
      return blockedResult(command, store, error.message);
    }
  }

  for (let index = startIndex; index < WORKFLOW_STEPS.length; index += 1) {
    const step = WORKFLOW_STEPS[index];
    store.recordEvent("STEP_START", { commandId: command.commandId, stepIndex: step.stepIndex, stepName: step.name });

    if (fault?.kind === "crash_before_commit" && fault.stepName === step.name) {
      return interruptionResult("WORKFLOW_INTERRUPTED", command, store, step, `CRASH_BEFORE_COMMIT: ${step.name}`, handoffNote);
    }

    let result;
    try {
      const existing = store.getStepResult(command.commandId, step.name);
      result = existing ?? executeStep(step, command, store, { corpus, methodologyCandidate, currentGit, handoffNote });
      const commit = store.commitStep(command.commandId, step.name, result);
      result = commit.record.result;

      if (!commit.replayed && fault?.kind === "timeout_after_commit" && fault.stepName === step.name) {
        return interruptionResult("WORKFLOW_INTERRUPTED", command, store, step, `TIMEOUT_AFTER_COMMIT: ${step.name}`, handoffNote);
      }
    } catch (error) {
      return blockedResult(command, store, `STEP_FAILED ${step.name}: ${error.message}`);
    }

    if (CHECKPOINT_BOUNDARIES.has(step.name) || pauseAfterStep === step.name) {
      store.saveCheckpoint(command, step, currentGit);
    }

    if (step.name === "RECONCILE_GIT" && result.matched !== true) {
      return blockedResult(command, store, `GIT_STATE_STALE: ${result.mismatches.join(", ")}.`);
    }

    if (pauseAfterStep === step.name) {
      return interruptionResult("WORKFLOW_PAUSED", command, store, step, `PAUSED_AFTER_STEP: ${step.name}`, handoffNote);
    }
  }

  const deliverable = store.deliverables.get(command.commandId) ?? null;
  const proof = store.getStepResult(command.commandId, "VERIFY_DONE");
  const handoff = store.getStepResult(command.commandId, "BUILD_HANDOFF");
  const checkpoint = store.latestCheckpoint(command.commandId);
  const status = proof?.isComplete === true ? "COMPLETE" : deliverable?.status === "PARTIAL" ? "PARTIAL" : "BLOCKED";
  store.recordEvent("WORKFLOW_FINISHED", { commandId: command.commandId, status, proofStatus: proof?.status ?? "MISSING" });
  return Object.freeze({
    status,
    reason: status === "COMPLETE" ? null : `PROOF_${proof?.status ?? "MISSING"}`,
    deliverable,
    proof,
    checkpoint,
    continuation: null,
    handoff,
    trace: Object.freeze(copy(store.events)),
  });
}
