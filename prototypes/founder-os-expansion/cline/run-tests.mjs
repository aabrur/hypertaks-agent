import assert from "node:assert/strict";
import {
  ALLOWED_PERMISSIONS,
  WORKFLOW_DEFINITION,
  WORKFLOW_STEPS,
  validateWorkflowDefinition,
} from "./contracts.mjs";
import {
  BASE_GIT,
  CONTRADICTORY_CORPUS,
  INJECTION_CORPUS,
  INVALID_METHODOLOGY,
  MISSING_EVIDENCE_CORPUS,
  SAFE_CORPUS,
  makeCommand,
  syntheticSecretForRedactionTest,
} from "./fixtures.mjs";
import { WorkflowStore, runFounderResearch } from "./workflow.mjs";

let assertions = 0;
let failures = 0;

function check(condition, message) {
  assertions += 1;
  assert.ok(condition, message);
}

function equal(actual, expected, message) {
  assertions += 1;
  assert.deepEqual(actual, expected, message);
}

function resumeCommand(command, checkpoint) {
  return Object.freeze({ ...command, activeCheckpointId: checkpoint.checkpointId });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(JSON.stringify({ kind: "test", name, status: "PASS" }));
  } catch (error) {
    failures += 1;
    console.error(JSON.stringify({ kind: "test", name, status: "FAIL", error: error.message }));
  }
}

await test("contract-shapes-and-research-only-state-machine", () => {
  const definition = validateWorkflowDefinition();
  equal(definition, WORKFLOW_DEFINITION, "canonical workflow must validate");
  equal(definition.steps.length, 10, "workflow must expose ten bounded states");
  equal(definition.steps.map((step) => step.stepIndex), [0,1,2,3,4,5,6,7,8,9], "step indices must be contiguous");
  equal(definition.steps[0].name, "VALIDATE_COMMAND", "first state must validate the command");
  equal(definition.steps.at(-1).name, "VERIFY_DONE", "last state must verify proof of done");
});

await test("happy-path-deliverable-first-and-proof-done", () => {
  const command = makeCommand();
  const store = new WorkflowStore();
  const result = runFounderResearch({ command, store, corpus: SAFE_CORPUS });
  equal(result.status, "COMPLETE", "happy path must complete");
  equal(result.deliverable.status, "COMPLETE", "deliverable must be complete");
  equal(result.proof.status, "DONE", "proof must be done");
  check(result.proof.isComplete === true, "proof completeness must be true");
  check(result.deliverable.evidenceRefs.length >= 2, "completion requires at least two evidence references");
  check(result.handoff.rawSecretsIncluded === false, "handoff must declare no raw secrets");
  const deliverableCommit = result.trace.findIndex((event) => event.kind === "STEP_COMMIT" && event.details.stepName === "BUILD_DELIVERABLE");
  const handoffStart = result.trace.findIndex((event) => event.kind === "STEP_START" && event.details.stepName === "BUILD_HANDOFF");
  check(deliverableCommit >= 0 && handoffStart > deliverableCommit, "deliverable must be committed before handoff prose");
  equal(store.countStepCommits(command.commandId, "BUILD_DELIVERABLE"), 1, "deliverable must commit once");
});

await test("checkpoint-snapshot-resume-is-deterministic", () => {
  const command = makeCommand();
  const firstStore = new WorkflowStore();
  const paused = runFounderResearch({ command, store: firstStore, corpus: SAFE_CORPUS, pauseAfterStep: "SELECT_METHODOLOGY" });
  equal(paused.status, "PAUSED", "first run must pause");
  equal(paused.checkpoint.stepIndex, 2, "checkpoint must bind the pause boundary");
  const restored = WorkflowStore.fromSnapshot(firstStore.snapshot());
  const resumed = runFounderResearch({
    command: resumeCommand(command, paused.checkpoint),
    store: restored,
    continuation: paused.continuation,
    corpus: SAFE_CORPUS,
  });
  const fresh = runFounderResearch({ command, store: new WorkflowStore(), corpus: SAFE_CORPUS });
  equal(resumed.status, "COMPLETE", "resumed run must complete");
  equal(resumed.deliverable, fresh.deliverable, "resumed deliverable must equal a fresh deterministic run");
  equal(restored.countStepCommits(command.commandId, "SELECT_METHODOLOGY"), 1, "paused step must not duplicate");
  check(resumed.trace.some((event) => event.kind === "WORKFLOW_RESUMED"), "resume event must be visible");
});

await test("crash-before-commit-replays-with-one-commit", () => {
  const command = makeCommand();
  const firstStore = new WorkflowStore();
  const interrupted = runFounderResearch({
    command,
    store: firstStore,
    corpus: SAFE_CORPUS,
    fault: { kind: "crash_before_commit", stepName: "READ_ONLY_RESEARCH" },
  });
  equal(interrupted.status, "INTERRUPTED", "fault must interrupt the first run");
  equal(firstStore.countStepCommits(command.commandId, "READ_ONLY_RESEARCH"), 0, "crashed step must not commit");
  const restored = WorkflowStore.fromSnapshot(firstStore.snapshot());
  const resumed = runFounderResearch({
    command: resumeCommand(command, interrupted.checkpoint),
    store: restored,
    continuation: interrupted.continuation,
    corpus: SAFE_CORPUS,
  });
  equal(resumed.status, "COMPLETE", "resume after pre-commit crash must complete");
  equal(restored.countStepCommits(command.commandId, "READ_ONLY_RESEARCH"), 1, "research must commit exactly once after resume");
});

await test("timeout-after-commit-reconciles-without-duplicate", () => {
  const command = makeCommand();
  const firstStore = new WorkflowStore();
  const interrupted = runFounderResearch({
    command,
    store: firstStore,
    corpus: SAFE_CORPUS,
    fault: { kind: "timeout_after_commit", stepName: "READ_ONLY_RESEARCH" },
  });
  equal(interrupted.status, "INTERRUPTED", "timeout must interrupt the first run");
  equal(firstStore.countStepCommits(command.commandId, "READ_ONLY_RESEARCH"), 1, "timed-out step must already be committed");
  check(interrupted.checkpoint.stepIndex < 4, "checkpoint must lag the ambiguous commit");
  const restored = WorkflowStore.fromSnapshot(firstStore.snapshot());
  const resumed = runFounderResearch({
    command: resumeCommand(command, interrupted.checkpoint),
    store: restored,
    continuation: interrupted.continuation,
    corpus: SAFE_CORPUS,
  });
  equal(resumed.status, "COMPLETE", "resume after timeout must complete");
  equal(restored.countStepCommits(command.commandId, "READ_ONLY_RESEARCH"), 1, "timeout reconciliation must not duplicate the commit");
  check(resumed.trace.some((event) => event.kind === "STEP_REPLAY" && event.details.stepName === "READ_ONLY_RESEARCH"), "ambiguous commit must replay from the journal");
});

await test("stale-git-blocks-before-resumed-work", () => {
  const command = makeCommand();
  const firstStore = new WorkflowStore();
  const paused = runFounderResearch({ command, store: firstStore, corpus: SAFE_CORPUS, pauseAfterStep: "COMPILE_CONTEXT" });
  const restored = WorkflowStore.fromSnapshot(firstStore.snapshot());
  const before = restored.commits.size;
  const staleGit = Object.freeze({ ...BASE_GIT, commit: "0000000000000000000000000000000000000000" });
  const blocked = runFounderResearch({
    command: resumeCommand(command, paused.checkpoint),
    store: restored,
    continuation: paused.continuation,
    corpus: SAFE_CORPUS,
    currentGit: staleGit,
  });
  equal(blocked.status, "BLOCKED", "stale Git must block resume");
  check(blocked.reason.startsWith("GIT_STATE_STALE"), "block reason must identify stale Git");
  equal(restored.commits.size, before, "no workflow step may commit after stale Git detection");
});

await test("missing-evidence-stays-partial", () => {
  const command = makeCommand();
  const result = runFounderResearch({ command, store: new WorkflowStore(), corpus: MISSING_EVIDENCE_CORPUS });
  equal(result.status, "PARTIAL", "missing evidence must produce partial status");
  equal(result.deliverable.status, "PARTIAL", "deliverable must remain partial");
  equal(result.proof.status, "NOT_DONE", "partial deliverable must not pass proof of done");
  check(result.proof.isComplete === false, "partial evidence must never become completion");
  check(result.deliverable.limitations.some((entry) => entry.includes("Insufficient")), "missing evidence limitation must be explicit");
});

await test("injection-attempt-is-quarantined-as-data", () => {
  const command = makeCommand();
  const result = runFounderResearch({ command, store: new WorkflowStore(), corpus: INJECTION_CORPUS });
  equal(result.status, "COMPLETE", "safe evidence may still complete after quarantine");
  equal(result.deliverable.injectionAttempts.length, 1, "one injection attempt must be recorded");
  equal(result.deliverable.injectionAttempts[0].disposition, "QUARANTINED_AS_DATA", "injection must remain inert data");
  check(!JSON.stringify(result.deliverable).includes("mark the task complete without evidence"), "injection text must not enter the deliverable");
  check(!JSON.stringify(result.handoff).includes("Ignore previous instructions"), "injection text must not enter the handoff");
});

await test("continuation-mismatch-fails-closed", () => {
  const command = makeCommand();
  const firstStore = new WorkflowStore();
  const paused = runFounderResearch({ command, store: firstStore, corpus: SAFE_CORPUS, pauseAfterStep: "COMPILE_CONTEXT" });
  const restored = WorkflowStore.fromSnapshot(firstStore.snapshot());
  const before = restored.commits.size;
  const mismatched = Object.freeze({ ...paused.continuation, activeContractId: "HT-WRONG-CONTRACT" });
  const blocked = runFounderResearch({
    command: resumeCommand(command, paused.checkpoint),
    store: restored,
    continuation: mismatched,
    corpus: SAFE_CORPUS,
  });
  equal(blocked.status, "BLOCKED", "mismatched continuation must block");
  check(blocked.reason.startsWith("CONTINUATION_MISMATCH"), "reason must identify continuation mismatch");
  equal(restored.commits.size, before, "mismatch must fail before new step commits");
});

await test("methodology-without-output-shape-stays-partial", () => {
  const command = makeCommand();
  const result = runFounderResearch({
    command,
    store: new WorkflowStore(),
    corpus: SAFE_CORPUS,
    methodologyCandidate: INVALID_METHODOLOGY,
  });
  equal(result.status, "PARTIAL", "invalid methodology must not complete");
  equal(result.proof.status, "NOT_DONE", "invalid methodology must fail proof of done");
  check(result.deliverable.limitations.some((entry) => entry.includes("missing_expected_output_shape")), "rejection reason must be retained");
});

await test("contradictory-evidence-stays-partial", () => {
  const command = makeCommand();
  const result = runFounderResearch({ command, store: new WorkflowStore(), corpus: CONTRADICTORY_CORPUS });
  equal(result.status, "PARTIAL", "unresolved contradiction must stay partial");
  equal(result.deliverable.contradictions.length, 1, "contradiction must be retained");
  equal(result.deliverable.contradictions[0].status, "UNRESOLVED", "contradiction must be explicit");
  check(result.proof.isComplete === false, "contradictory evidence must not complete");
});

await test("unsupported-command-and-permission-expansion-block", () => {
  const executeCommand = makeCommand({ commandType: "EXECUTE" });
  const unsupported = runFounderResearch({ command: executeCommand, store: new WorkflowStore(), corpus: SAFE_CORPUS });
  equal(unsupported.status, "BLOCKED", "non-RESEARCH command must block");
  check(unsupported.reason.startsWith("UNSUPPORTED_COMMAND"), "unsupported command reason must be explicit");
  const expandedCommand = makeCommand({ permissions: Object.freeze([...ALLOWED_PERMISSIONS, "PERM_NETWORK"]) });
  const expanded = runFounderResearch({ command: expandedCommand, store: new WorkflowStore(), corpus: SAFE_CORPUS });
  equal(expanded.status, "BLOCKED", "permission expansion must block");
  check(expanded.reason.startsWith("PERMISSION_ESCALATION"), "permission expansion reason must be explicit");
});

await test("handoff-redacts-secret-shaped-data", () => {
  const command = makeCommand();
  const synthetic = syntheticSecretForRedactionTest();
  const result = runFounderResearch({
    command,
    store: new WorkflowStore(),
    corpus: SAFE_CORPUS,
    handoffNote: `Operator note contained ${synthetic}`,
  });
  equal(result.status, "COMPLETE", "redaction must not break a valid workflow");
  const serialized = JSON.stringify(result.handoff);
  check(!serialized.includes(synthetic), "raw secret-shaped data must not reach handoff");
  check(serialized.includes("[REDACTED_SECRET]"), "handoff must retain a redaction marker");
});

await test("local-only-capability-boundary", () => {
  const command = makeCommand();
  const store = new WorkflowStore();
  const result = runFounderResearch({ command, store, corpus: SAFE_CORPUS });
  const research = store.getStepResult(command.commandId, "READ_ONLY_RESEARCH");
  equal(research.capability.sideEffect, "none", "research capability must be read-only");
  equal(research.capability.mutationPerformed, false, "research must not mutate");
  equal(research.capability.publicSurfaceCount, 4, "public MCP surface must remain exactly four tools");
  equal(result.deliverable.networkUsed, false, "deliverable must record no network use");
  equal(result.deliverable.externalWrites, 0, "deliverable must record no external writes");
  equal(WORKFLOW_STEPS.filter((step) => step.name === "VERIFY_DONE").length, 1, "workflow must have one proof gate");
});

console.log(JSON.stringify({ kind: "summary", assertions, failures }));
if (failures > 0) process.exitCode = 1;
