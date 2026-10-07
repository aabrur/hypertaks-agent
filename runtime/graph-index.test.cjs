const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const { buildLocalGraph, saveLocalGraph } = require("../.build/runtime/graph/local-graph-provider.js");
const { scanRepository } = require("../.build/runtime/repository-intelligence/scanner.js");
const { resolveCanonicalRoot, loadOrInitRepoIdentity } = require("../.build/runtime/repo-identity.js");
const { issueBootstrapGrant, bootstrapRepoVault } = require("../.build/runtime/repo-bootstrap.js");

test("graph-index: builds local graph nodes and edges from repository scan", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-graph-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);

    fs.mkdirSync(path.join(canonical, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(canonical, "src", "client.ts"),
      `export function fetchUser(id: string) { return id; }\n`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(canonical, "src", "app.ts"),
      `import { fetchUser } from './client';\nexport function main() { return fetchUser('123'); }\n`,
      "utf8"
    );

    const { identity } = loadOrInitRepoIdentity(canonical);
    const grant = issueBootstrapGrant(canonical, identity.repo_id, "HT-GRAPH-01");
    bootstrapRepoVault(canonical, grant);

    const scan = scanRepository(canonical);
    const graph = buildLocalGraph(canonical, scan);

    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    assert.ok(nodes.some((n) => n.id === "file:src/client.ts"));
    assert.ok(nodes.some((n) => n.id === "file:src/app.ts"));
    assert.ok(nodes.some((n) => n.id === "symbol:src/client.ts:fetchUser"));
    assert.ok(nodes.some((n) => n.id === "symbol:src/app.ts:main"));

    // Check imports edge from app.ts to client.ts
    const importEdge = edges.find((e) => e.type === "imports" && e.source === "file:src/app.ts");
    assert.ok(importEdge);
    assert.equal(importEdge.target, "file:src/client.ts");

    // Save graph
    const written = saveLocalGraph(canonical, identity.repo_id, graph);
    assert.ok(written.includes(".hypertaks/graph/nodes.jsonl"));
    assert.ok(written.includes(".hypertaks/graph/edges.jsonl"));
    assert.ok(written.includes(".hypertaks/graph/graph.json"));
    assert.ok(written.includes(".hypertaks/graph/graph.meta.json"));
    assert.ok(written.includes(".hypertaks/graph/GRAPH_REPORT.md"));

    const report = fs.readFileSync(path.join(canonical, ".hypertaks", "graph", "GRAPH_REPORT.md"), "utf8");
    assert.ok(report.includes("Hypertaks RTS: ACTIVE"));
    assert.ok(!report.includes("\u2014"));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
