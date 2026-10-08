const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const { scanRepository } = require("../.build/runtime/repository-intelligence/scanner.js");
const { writeInventories } = require("../.build/runtime/repository-intelligence/inventory-writer.js");
const { compileArchitecturePack } = require("../.build/runtime/repository-intelligence/architecture-compiler.js");
const { resolveCanonicalRoot, loadOrInitRepoIdentity } = require("../.build/runtime/repo-identity.js");
const { issueBootstrapGrant, bootstrapRepoVault, mintBootstrapProof } = require("../.build/runtime/repo-bootstrap.js");

test("repository-intelligence: scans multi-language fixture and generates architecture pack", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-rts-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);

    // Setup dummy files
    fs.mkdirSync(path.join(canonical, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(canonical, "package.json"),
      JSON.stringify({ name: "fixture-app", dependencies: { express: "4.18.2" } }),
      "utf8"
    );

    // TS file with route and export
    fs.writeFileSync(
      path.join(canonical, "src", "server.ts"),
      `import express from 'express';
export function startServer() {
  const app = express();
  app.get('/api/health', (req, res) => res.send('ok'));
}
`,
      "utf8"
    );

    // Python file
    fs.writeFileSync(
      path.join(canonical, "src", "worker.py"),
      `def process_queue(item):
    return item * 2
`,
      "utf8"
    );

    // SQL file
    fs.writeFileSync(
      path.join(canonical, "src", "schema.sql"),
      `CREATE TABLE users (
  id INT,
  email VARCHAR(255)
);
`,
      "utf8"
    );

    // Bootstrap vault first
    const { identity } = loadOrInitRepoIdentity(canonical);
    const grant = issueBootstrapGrant(canonical, identity.repo_id, "HT-RTS-01", {
      proof: mintBootstrapProof("HT-RTS-01"),
    });
    bootstrapRepoVault(canonical, grant);

    // Scan
    const scan = scanRepository(canonical);
    assert.equal(scan.workspaceInfo.frameworks.includes("Express"), true);
    assert.ok(scan.files.length >= 4);

    // Check parsed symbols
    const allSymbols = scan.parsedFiles.flatMap((f) => f.symbols);
    assert.ok(allSymbols.some((s) => s.name === "startServer"));
    assert.ok(allSymbols.some((s) => s.name === "process_queue"));

    // Check parsed tables
    const allTables = scan.parsedFiles.flatMap((f) => f.tables);
    assert.ok(allTables.some((t) => t.tableName === "users"));

    // Check parsed routes
    const allRoutes = scan.parsedFiles.flatMap((f) => f.routes);
    assert.ok(allRoutes.some((r) => r.path === "/api/health"));

    // Write inventories
    const writtenInv = writeInventories(canonical, scan);
    assert.ok(writtenInv.includes(".hypertaks/inventory/files.jsonl"));
    assert.ok(writtenInv.includes(".hypertaks/inventory/symbols.jsonl"));
    assert.ok(writtenInv.includes(".hypertaks/inventory/routes.json"));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "inventory", "routes.json")));

    // Compile architecture pack
    const writtenArch = compileArchitecturePack(canonical, identity, scan);
    assert.ok(writtenArch.includes(".hypertaks/ARCHITECTURE.md"));
    assert.ok(writtenArch.includes(".hypertaks/FUNCTION-MAP.md"));
    assert.ok(writtenArch.includes(".hypertaks/DATA-MODEL.md"));
    assert.ok(writtenArch.includes(".hypertaks/NETWORK-DEPENDENCIES.md"));

    const archText = fs.readFileSync(path.join(canonical, ".hypertaks", "ARCHITECTURE.md"), "utf8");
    assert.ok(archText.includes("Express"));
    assert.ok(!archText.includes("\u2014"));

    const funcText = fs.readFileSync(path.join(canonical, ".hypertaks", "FUNCTION-MAP.md"), "utf8");
    assert.ok(funcText.includes("startServer"));
    assert.ok(!funcText.includes("\u2014"));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
