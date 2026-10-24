const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.resolve(__dirname, "cli.ts");
const TS_NODE_PROJECT = path.resolve(__dirname, "..", "tsconfig.json");

function runCliCmd(args, cwd) {
  // Use ts-node/register via node -r or run compiled .build/runtime/cli.js
  const compiledCli = path.resolve(__dirname, "..", ".build", "runtime", "cli.js");
  const res = spawnSync(process.execPath, [compiledCli, ...args], {
    cwd: cwd || process.cwd(),
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  return {
    code: res.status ?? 1,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

test("Universal Context & Layered Verification End-to-End Test", async (t) => {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-universal-"));
  const fixtureDir = path.join(tmpBase, "sample-microservice");
  fs.mkdirSync(fixtureDir, { recursive: true });

  // 1. Create a realistic non-Hypertaks repository fixture
  fs.writeFileSync(
    path.join(fixtureDir, "package.json"),
    JSON.stringify(
      {
        name: "sample-microservice",
        version: "1.2.0",
        description: "Payment and Checkout Processing Service for Online Retail",
        license: "Apache-2.0",
        main: "src/index.ts",
        dependencies: {
          express: "^4.19.0",
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(
    path.join(fixtureDir, "README.md"),
    "# Sample Microservice\n\nHigh-throughput checkout and payment ledger microservice.",
    "utf8",
  );

  fs.writeFileSync(
    path.join(fixtureDir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { target: "es2022", module: "commonjs" } }, null, 2),
    "utf8",
  );

  const srcDir = path.join(fixtureDir, "src");
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(
    path.join(srcDir, "index.ts"),
    `import express from "express";
const app = express();

export function calculateTax(amount: number): number {
  return amount * 0.1;
}

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.post("/api/checkout", (req, res) => {
  res.json({ success: true });
});
`,
    "utf8",
  );

  const migrationsDir = path.join(fixtureDir, "migrations");
  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.writeFileSync(
    path.join(migrationsDir, "001_orders.sql"),
    `CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  amount DECIMAL(10, 2),
  customer_id VARCHAR(36),
  created_at TIMESTAMP
);`,
    "utf8",
  );

  // Initialize git repository
  spawnSync("git", ["init"], { cwd: fixtureDir });
  spawnSync("git", ["config", "user.email", "dev@example.com"], { cwd: fixtureDir });
  spawnSync("git", ["config", "user.name", "Dev"], { cwd: fixtureDir });
  spawnSync("git", ["add", "."], { cwd: fixtureDir });
  spawnSync("git", ["commit", "-m", "initial commit"], { cwd: fixtureDir });

  await t.test("CRITICAL 3: shallow vs deep screening profiles have observable differences", () => {
    const shallowRes = runCliCmd(["scan", "--repo", fixtureDir, "--depth", "shallow", "--json"]);
    assert.equal(shallowRes.code, 0);
    const shallowData = JSON.parse(shallowRes.stdout);
    assert.equal(shallowData.coverage.depth, "shallow");

    const deepRes = runCliCmd(["scan", "--repo", fixtureDir, "--depth", "deep", "--json"]);
    assert.equal(deepRes.code, 0);
    const deepData = JSON.parse(deepRes.stdout);
    assert.equal(deepData.coverage.depth, "deep");
    assert.ok(deepData.coverage.totalParsed > 0);
    assert.ok(deepData.dependencies.external.includes("express"));
  });

  await t.test("CRITICAL 7: write-context without approval fails closed", () => {
    const denied = runCliCmd(["scan", "--repo", fixtureDir, "--write-context"]);
    assert.equal(denied.code, 2);
    assert.match(denied.stderr, /APPROVAL_REQUIRED/);
  });

  await t.test("CRITICAL 5: authorized scan generates universal, repository-agnostic context", () => {
    const writeRes = runCliCmd([
      "scan",
      "--repo",
      fixtureDir,
      "--depth",
      "deep",
      "--write-context",
      "--contract-id",
      "HT-SAMPLE-001",
      "--approval",
      "APPROVE HT-SAMPLE-001",
      "--json",
    ]);
    assert.equal(writeRes.code, 0);
    const writeData = JSON.parse(writeRes.stdout);
    assert.equal(writeData.outcome, "written");

    const repoId = writeData.repoId;
    const projectDir = path.join(fixtureDir, ".hypertaks", "projects", repoId);
    assert.ok(fs.existsSync(projectDir));

    // Verify Vision.ctx.md does NOT claim to be Hypertaks Founder
    const vision = fs.readFileSync(path.join(projectDir, "Vision.ctx.md"), "utf8");
    assert.match(vision, /sample-microservice/);
    assert.match(vision, /Payment and Checkout Processing Service for Online Retail/);
    assert.doesNotMatch(vision, /Hypertaks Founder Operating System/);
    assert.doesNotMatch(vision, /CEO-grade cross-agent operating system/);
    assert.match(vision, /UNKNOWN \(requires founder intake\)/);

    // Verify architecture.ctx.md reflects target repo subsystems
    const arch = fs.readFileSync(path.join(projectDir, "architecture.ctx.md"), "utf8");
    assert.match(arch, /src\//);
    assert.match(arch, /migrations\//);
    assert.doesNotMatch(arch, /runtime\/founder-brain\.ts/);
    assert.doesNotMatch(arch, /runtime\/repository-intelligence\//);

    // Verify database.ctx.md reflects detected table 'orders'
    const db = fs.readFileSync(path.join(projectDir, "database.ctx.md"), "utf8");
    assert.match(db, /Table: `orders`/);
    assert.match(db, /amount/);
    assert.doesNotMatch(db, /\.hypertaks\/repo\.json/);

    // Verify api.ctx.md reflects routes /health and /api/checkout
    const api = fs.readFileSync(path.join(projectDir, "api.ctx.md"), "utf8");
    assert.match(api, /\/health/);
    assert.match(api, /\/api\/checkout/);
    assert.doesNotMatch(api, /hypertaks_manifest/);

    // Verify law.ctx.md reflects Apache-2.0
    const law = fs.readFileSync(path.join(projectDir, "law.ctx.md"), "utf8");
    assert.match(law, /Apache-2\.0/);

    // Verify security.ctx.md has no false absolute guarantees
    const sec = fs.readFileSync(path.join(projectDir, "security.ctx.md"), "utf8");
    assert.match(sec, /Static scanning is not exhaustive/);
    assert.doesNotMatch(sec, /Zero production credentials leaked/);
  });

  await t.test("CRITICAL 6: layered context verify passes across all 5 layers", () => {
    const verifyRes = runCliCmd(["context", "verify", "--repo", fixtureDir, "--json"]);
    assert.equal(verifyRes.code, 0);
    const report = JSON.parse(verifyRes.stdout);
    assert.equal(report.passed, true);
    assert.equal(report.layers.length, 5);

    const layerNames = report.layers.map((l) => l.layer);
    assert.deepEqual(layerNames, ["STRUCTURAL", "EVIDENCE", "FRESHNESS", "INTEGRITY", "CONSISTENCY"]);
    for (const layer of report.layers) {
      assert.equal(layer.passed, true);
    }
  });

  await t.test("CRITICAL 4: safe rescan preserves context documents and reuses fresh graph", () => {
    const rescan = runCliCmd([
      "scan",
      "--repo",
      fixtureDir,
      "--depth",
      "deep",
      "--write-context",
      "--contract-id",
      "HT-SAMPLE-001",
      "--approval",
      "APPROVE HT-SAMPLE-001",
      "--json",
    ]);
    assert.equal(rescan.code, 0);
    const data = JSON.parse(rescan.stdout);
    // Preserved documents should be at least 13
    assert.ok(data.preservedFiles >= 13);
  });

  // Cleanup
  fs.rmSync(tmpBase, { recursive: true, force: true });
});
