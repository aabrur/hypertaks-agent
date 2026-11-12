const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const { DagBuilder } = require("../.build/runtime/orchestrator/dag-builder.js");
const { OrchestratorEngine } = require("../.build/runtime/orchestrator/orchestrator.js");
const { packContextForNode } = require("../.build/runtime/orchestrator/context-packer.js");
const { resolveCanonicalRoot } = require("../.build/runtime/repo-identity.js");

test("orchestrator-v2: computes execution waves and executes DAG in order", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-orch-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const builder = new DagBuilder();

    // Node 1: Schema (Root)
    builder.addNode({
      id: "node-schema",
      role: "Database Architect",
      provider: "host-native",
      dependencies: [],
      inputs: ["schema.sql"],
      expectedOutputs: ["schema-migration"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    // Node 2: Backend API (Depends on Schema)
    builder.addNode({
      id: "node-backend",
      role: "Backend Engineer",
      provider: "host-native",
      dependencies: ["node-schema"],
      inputs: ["server.ts"],
      expectedOutputs: ["api-routes"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    // Node 3: Documentation (Independent root, can run alongside Schema)
    builder.addNode({
      id: "node-docs",
      role: "Technical Writer",
      provider: "host-native",
      dependencies: [],
      inputs: ["README.md"],
      expectedOutputs: ["docs"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    const waves = builder.computeWaves();
    assert.equal(waves.length, 2);
    // Wave 0 contains independent roots: schema and docs
    assert.ok(waves[0].includes("node-schema"));
    assert.ok(waves[0].includes("node-docs"));
    // Wave 1 contains backend
    assert.deepEqual(waves[1], ["node-backend"]);

    const dag = builder.build("RUN-TEST-001", "repo-123", "HT-CONTRACT-001", "Prime");
    const engine = new OrchestratorEngine(canonical, "RUN-TEST-001");
    engine.initRun(dag);

    const executedOrder = [];
    const meta = await engine.executeWaveSchedule(dag, async (node) => {
      executedOrder.push(node.id);
      return { success: true, output: `Result of ${node.id}`, verifiedEvidence: true };
    });

    assert.equal(meta.status, "COMPLETED");
    assert.equal(meta.completedNodes.length, 3);
    // Schema and docs ran before backend
    assert.ok(executedOrder.indexOf("node-schema") < executedOrder.indexOf("node-backend"));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "runs", "RUN-TEST-001", "checkpoint.json")));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("orchestrator-v2: detects cyclic dependencies and throws error", () => {
  const builder = new DagBuilder();
  builder.addNode({ id: "a", role: "r1", provider: "p", dependencies: ["b"], inputs: [], expectedOutputs: [], permissions: [], retryLimit: 1, status: "PENDING" });
  builder.addNode({ id: "b", role: "r2", provider: "p", dependencies: ["a"], inputs: [], expectedOutputs: [], permissions: [], retryLimit: 1, status: "PENDING" });

  assert.throws(() => {
    builder.computeWaves();
  }, /CYCLIC_DEPENDENCY_DETECTED/);
});

test("orchestrator-v2: detects missing dependency and throws error", () => {
  const builder = new DagBuilder();
  builder.addNode({ id: "a", role: "r1", provider: "p", dependencies: ["non-existent-node"], inputs: [], expectedOutputs: [], permissions: [], retryLimit: 1, status: "PENDING" });

  assert.throws(() => {
    builder.computeWaves();
  }, /MISSING_DEPENDENCY/);
});

test("orchestrator-v2: propagates BLOCKED status to downstream nodes on failure and estimates file tokens", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-orch-block-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const sampleFile = path.join(canonical, "input.txt");
    fs.writeFileSync(sampleFile, "A".repeat(400), "utf8");

    const node1 = {
      id: "node-1",
      role: "Worker 1",
      provider: "host-native",
      dependencies: [],
      inputs: [sampleFile],
      expectedOutputs: ["out-1"],
      permissions: ["PERM_READ"],
      retryLimit: 1,
      status: "PENDING",
    };
    const packed = packContextForNode(node1);
    assert.ok(packed.tokenBudgetEstimate >= 100);

    const builder = new DagBuilder();
    builder.addNode(node1);
    builder.addNode({
      id: "node-2",
      role: "Worker 2",
      provider: "host-native",
      dependencies: ["node-1"],
      inputs: [],
      expectedOutputs: ["out-2"],
      permissions: ["PERM_READ"],
      retryLimit: 1,
      status: "PENDING",
    });

    const dag = builder.build("RUN-BLOCK-001", "repo-123", "HT-CONTRACT-002", "Prime");
    const engine = new OrchestratorEngine(canonical, "RUN-BLOCK-001");
    engine.initRun(dag);

    const meta = await engine.executeWaveSchedule(dag, async () => {
      return { success: false, output: "Simulated failure" };
    });

    assert.equal(meta.status, "FAILED");
    const downstream = dag.nodes.find((n) => n.id === "node-2");
    assert.equal(downstream.status, "BLOCKED");
    assert.ok(meta.failedNodes.includes("node-2"));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
