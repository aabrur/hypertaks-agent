const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const {
  saveHashesCache,
  loadHashesCache,
  evaluateGraphFreshness,
} = require("../.build/runtime/graph/freshness.js");
const { buildLocalGraph, saveLocalGraph } = require("../.build/runtime/graph/local-graph-provider.js");
const { scanRepository } = require("../.build/runtime/repository-intelligence/scanner.js");
const { resolveCanonicalRoot, loadOrInitRepoIdentity } = require("../.build/runtime/repo-identity.js");
const { issueBootstrapGrant, bootstrapRepoVault, mintBootstrapProof } = require("../.build/runtime/repo-bootstrap.js");

test("graph-incremental: evaluates graph freshness against cached hashes", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-freshness-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);

    fs.mkdirSync(path.join(canonical, "src"), { recursive: true });
    fs.writeFileSync(path.join(canonical, "src", "file1.ts"), "export const a = 1;\n", "utf8");

    const { identity } = loadOrInitRepoIdentity(canonical);
    const grant = issueBootstrapGrant(canonical, identity.repo_id, "HT-FRESH-01", {
      proof: mintBootstrapProof("HT-FRESH-01"),
    });
    bootstrapRepoVault(canonical, grant);

    const scan = scanRepository(canonical);
    const graph = buildLocalGraph(canonical, scan);
    saveLocalGraph(canonical, identity.repo_id, graph);

    // Initial cache
    const initialHashes = { "src/file1.ts": "hash123" };
    saveHashesCache(canonical, initialHashes);

    // Freshness check with matching hash
    const freshStatus = evaluateGraphFreshness(canonical, { "src/file1.ts": "hash123" });
    assert.equal(freshStatus.state, "FRESH");

    // Freshness check with modified file
    const staleStatus = evaluateGraphFreshness(canonical, { "src/file1.ts": "hash999_changed" });
    assert.equal(staleStatus.state, "STALE");
    assert.ok(staleStatus.changedFiles.includes("src/file1.ts"));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
