const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const {
  detectRepositoryRoot,
  runPreflight,
  autoInitializeOrSync,
  acquireLifecycleLock,
} = require("../.build/runtime/repo-lifecycle.js");
const {
  mintBootstrapProof,
  readStoredGrant,
  verifyBootstrapGrant,
  rotateBootstrapKey,
} = require("../.build/runtime/repo-bootstrap.js");
const { resolveCanonicalRoot } = require("../.build/runtime/repo-identity.js");
const { DagBuilder } = require("../.build/runtime/orchestrator/dag-builder.js");
const { OrchestratorEngine } = require("../.build/runtime/orchestrator/orchestrator.js");
const { AgencyAgentsProvider } = require("../.build/runtime/providers/agency-agents-provider.js");

test("lifecycle: read-only preflight on uninitialized repo causes zero filesystem mutations", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-preflight-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const preflight = runPreflight(canonical);

    assert.equal(preflight.state, "UNINITIALIZED");
    assert.equal(preflight.requiresApproval, true);
    assert.equal(preflight.existingVault, false);
    assert.ok(preflight.plannedActions.length > 0);

    // Verify zero filesystem mutations
    assert.equal(fs.existsSync(path.join(canonical, ".hypertaks")), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: autoInitializeOrSync without authentic Boss proof fails closed with zero mutations", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-no-proof-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const result = await autoInitializeOrSync(canonical, {});

    assert.equal(result.success, false);
    assert.equal(result.status, "AWAITING_APPROVAL");
    assert.ok(result.message.includes("APPROVAL_REQUIRED"));

    // Verify zero writes occurred
    assert.equal(fs.existsSync(path.join(canonical, ".hypertaks")), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: autoInitializeOrSync with authentic Boss proof initializes complete operating vault", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-autoinit-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);

    // Create a dummy source file
    fs.mkdirSync(path.join(canonical, "src"), { recursive: true });
    fs.writeFileSync(path.join(canonical, "src", "index.ts"), "export const VERSION = '1.0.0';\n", "utf8");

    const proof = mintBootstrapProof("HT-AUTO-001");
    const result = await autoInitializeOrSync(canonical, {
      proof,
      contractId: "HT-AUTO-001",
    });

    assert.equal(result.success, true);
    assert.equal(result.status, "READY");
    assert.ok(result.bootstrapResult);
    assert.ok(result.bootstrapResult.createdFiles.length > 10);

    // Critical vault files exist
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "repo.json")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "VERSION")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "ARCHITECTURE.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "state", "bootstrap.key")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "state", "bootstrap-grant.json")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "graph", "graph.json")));

    // Re-running preflight reports HEALTHY
    const postPreflight = runPreflight(canonical);
    assert.equal(postPreflight.state, "HEALTHY");
    assert.equal(postPreflight.requiresApproval, false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: persistent vault key survives process restarts and key rotation", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-key-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const proof = mintBootstrapProof("HT-KEY-001");
    await autoInitializeOrSync(canonical, { proof, contractId: "HT-KEY-001" });

    // Verify stored grant verifies cleanly against persistent key
    const identity = JSON.parse(fs.readFileSync(path.join(canonical, ".hypertaks", "repo.json"), "utf8"));
    const storedGrant = readStoredGrant(canonical);
    assert.ok(storedGrant);

    const check1 = verifyBootstrapGrant(canonical, identity.repo_id, storedGrant);
    assert.equal(check1.valid, true);

    // Rotate key
    const rotated = rotateBootstrapKey(canonical);
    assert.equal(rotated, true);

    // Verification with rotated key succeeds
    const storedAfterRotate = readStoredGrant(canonical);
    assert.ok(storedAfterRotate);
    const check2 = verifyBootstrapGrant(canonical, identity.repo_id, storedAfterRotate);
    assert.equal(check2.valid, true);

    // Corrupted key fails closed
    const keyPath = path.join(canonical, ".hypertaks", "state", "bootstrap.key");
    fs.writeFileSync(keyPath, "corrupted-key-data\n", "utf8");
    const checkCorrupted = verifyBootstrapGrant(canonical, identity.repo_id, storedAfterRotate);
    assert.equal(checkCorrupted.valid, false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: concurrency locking blocks parallel writes and recovers stale lock", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-lock-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    fs.mkdirSync(path.join(canonical, ".hypertaks"), { recursive: true });

    // 1. Acquire lock
    const release = acquireLifecycleLock(canonical);
    assert.ok(typeof release === "function");

    // 2. Second acquire fails
    assert.throws(() => {
      acquireLifecycleLock(canonical);
    }, /CONCURRENCY_LOCK_ACTIVE/);

    // 3. Release lock
    release();

    // 4. Stale lock recovery
    const lockPath = path.join(canonical, ".hypertaks", ".lifecycle.lock");
    const staleData = {
      pid: 9999999,
      timestamp: Date.now() - 35000, // 35 seconds ago (timeout is 30s)
      expiresAt: Date.now() - 5000,
    };
    fs.writeFileSync(lockPath, JSON.stringify(staleData), "utf8");

    // Acquiring stale lock succeeds via recovery
    const releaseRecovered = acquireLifecycleLock(canonical);
    assert.ok(typeof releaseRecovered === "function");
    releaseRecovered();
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: orchestrator proof-of-done enforces real physical deliverables on disk", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-pod-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const builder = new DagBuilder();

    builder.addNode({
      id: "node-deliverable",
      role: "Backend Engineer",
      provider: "host-native",
      dependencies: [],
      inputs: [],
      expectedOutputs: ["dist/output.json"],
      permissions: ["PERM_FILE_WRITE"],
      retryLimit: 1,
      status: "PENDING",
    });

    const dag = builder.build("RUN-POD-001", "repo-pod", "HT-POD-01", "Prime");
    const engine = new OrchestratorEngine(canonical, "RUN-POD-001");
    engine.initRun(dag);

    // Case A: Worker claims success with verifiedEvidence but file was NOT written to disk
    const metaFailMissing = await engine.executeWaveSchedule(dag, async (node) => {
      return {
        success: true,
        output: "Generated payload",
        verifiedEvidence: true,
      };
    });
    assert.equal(metaFailMissing.status, "FAILED");

    // Case B: Worker writes 0-byte empty file to disk
    fs.mkdirSync(path.join(canonical, "dist"), { recursive: true });
    fs.writeFileSync(path.join(canonical, "dist", "output.json"), "", "utf8");

    const metaFailEmpty = await engine.executeWaveSchedule(dag, async (node) => {
      return {
        success: true,
        output: "Generated empty payload",
        verifiedEvidence: true,
      };
    });
    assert.equal(metaFailEmpty.status, "FAILED");

    // Case C: Worker writes real non-empty file to disk and provides verifiedEvidence
    fs.writeFileSync(path.join(canonical, "dist", "output.json"), '{"status":"ok"}\n', "utf8");

    const metaSuccess = await engine.executeWaveSchedule(dag, async (node) => {
      return {
        success: true,
        output: "Generated real deliverable",
        verifiedEvidence: true,
      };
    });
    assert.equal(metaSuccess.status, "COMPLETED");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("lifecycle: AgencyAgentsProvider real mode returns UNAVAILABLE when transport is unconfigured", async () => {
  const provider = new AgencyAgentsProvider({ mode: "real" });
  assert.equal(provider.mode, "real");

  const result = await provider.executeTask("backend-architect", "Implement user schema", ["PERM_FILE_WRITE"]);
  assert.equal(result.success, false);
  assert.equal(result.status, "UNAVAILABLE");
  assert.ok(result.output.includes("PROVIDER_UNAVAILABLE"));
});
