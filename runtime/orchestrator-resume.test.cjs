const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const { DagBuilder } = require("../.build/runtime/orchestrator/dag-builder.js");
const { OrchestratorEngine } = require("../.build/runtime/orchestrator/orchestrator.js");
const { resolveCanonicalRoot } = require("../.build/runtime/repo-identity.js");

test("orchestrator-resume: resumes interrupted run without re-running completed nodes", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-resume-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const builder = new DagBuilder();

    builder.addNode({
      id: "node-1",
      role: "Architect",
      provider: "native",
      dependencies: [],
      inputs: [],
      expectedOutputs: ["spec"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    builder.addNode({
      id: "node-2",
      role: "Implementer",
      provider: "native",
      dependencies: ["node-1"],
      inputs: ["spec"],
      expectedOutputs: ["code"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    const dag = builder.build("RUN-RESUME-001", "repo-res", "HT-RES-01", "Prime");
    const engine1 = new OrchestratorEngine(canonical, "RUN-RESUME-001");
    engine1.initRun(dag);

    let node1ExecutionCount = 0;
    let node2ExecutionCount = 0;

    // First attempt: node-1 succeeds, node-2 fails
    await engine1.executeWaveSchedule(dag, async (node) => {
      if (node.id === "node-1") {
        node1ExecutionCount++;
        return { success: true, output: "Node 1 done", verifiedEvidence: true };
      }
      if (node.id === "node-2") {
        node2ExecutionCount++;
        return { success: false, output: "Simulated failure" };
      }
      return { success: true, output: "" };
    });

    assert.equal(node1ExecutionCount, 1);
    assert.equal(node2ExecutionCount, 1);

    // Verify checkpoint recorded node-1
    const chk = engine1.loadCheckpoint();
    assert.ok(chk);
    assert.deepEqual(chk.completedNodeIds, ["node-1"]);

    // Second attempt (Resume): instantiate new engine on same run
    const engine2 = new OrchestratorEngine(canonical, "RUN-RESUME-001");
    const finalMeta = await engine2.executeWaveSchedule(dag, async (node) => {
      if (node.id === "node-1") {
        node1ExecutionCount++;
        return { success: true, output: "Node 1 done", verifiedEvidence: true };
      }
      if (node.id === "node-2") {
        node2ExecutionCount++;
        return { success: true, output: "Node 2 recovered", verifiedEvidence: true };
      }
      return { success: true, output: "" };
    });

    // Node 1 was NOT re-executed! It stayed completed.
    assert.equal(node1ExecutionCount, 1);
    // Node 2 executed again and succeeded.
    assert.equal(node2ExecutionCount, 2);
    assert.equal(finalMeta.status, "COMPLETED");
    assert.deepEqual(finalMeta.completedNodes.sort(), ["node-1", "node-2"]);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
