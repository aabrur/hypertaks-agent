import { SAFE_CORPUS, makeCommand } from "./fixtures.mjs";
import { WorkflowStore, runFounderResearch } from "./workflow.mjs";

const command = makeCommand();
const firstStore = new WorkflowStore();
const paused = runFounderResearch({
  command,
  store: firstStore,
  corpus: SAFE_CORPUS,
  pauseAfterStep: "READ_ONLY_RESEARCH",
});

const restoredStore = WorkflowStore.fromSnapshot(firstStore.snapshot());
const resumed = runFounderResearch({
  command: Object.freeze({ ...command, activeCheckpointId: paused.checkpoint.checkpointId }),
  store: restoredStore,
  continuation: paused.continuation,
  corpus: SAFE_CORPUS,
});

console.log(JSON.stringify({
  firstRunStatus: paused.status,
  checkpointId: paused.checkpoint.checkpointId,
  checkpointStep: paused.checkpoint.stepIndex,
  resumedStatus: resumed.status,
  deliverableStatus: resumed.deliverable.status,
  proofStatus: resumed.proof.status,
  researchCommitCount: restoredStore.countStepCommits(command.commandId, "READ_ONLY_RESEARCH"),
  stateTrace: resumed.trace.map((event) => ({ eventId: event.eventId, kind: event.kind, stepName: event.details.stepName ?? null })),
}, null, 2));
