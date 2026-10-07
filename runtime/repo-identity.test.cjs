const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const {
  stripGitCredentials,
  resolveCanonicalRoot,
  computeRootFingerprint,
  computeRemoteFingerprint,
  generateRepoId,
  createRepoIdentity,
  readRepoIdentity,
  saveRepoIdentity,
  loadOrInitRepoIdentity,
} = require("../.build/runtime/repo-identity.js");

test("repo-identity: stripGitCredentials removes credentials from URLs", () => {
  assert.equal(
    stripGitCredentials("https://user:secret123@github.com/org/repo.git"),
    "https://github.com/org/repo.git"
  );
  assert.equal(
    stripGitCredentials("https://ghp_token123456@github.com/owner/project.git"),
    "https://github.com/owner/project.git"
  );
  assert.equal(
    stripGitCredentials("git@github.com:org/repo.git"),
    "git@github.com:org/repo.git"
  );
  assert.equal(
    stripGitCredentials("https://github.com/org/repo.git"),
    "https://github.com/org/repo.git"
  );
});

test("repo-identity: generateRepoId produces deterministic identity without secrets", () => {
  const root = "C:/projects/demo-repo";
  const remote = "https://github.com/example/demo-repo.git";
  const id1 = generateRepoId(root, remote);
  const id2 = generateRepoId(root, remote);

  assert.equal(id1, id2);
  assert.match(id1, /^demo-repo-[a-f0-9]{6}$/);
});

test("repo-identity: loadOrInitRepoIdentity creates and preserves repo.json", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-repo-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const { identity: id1, created: created1 } = loadOrInitRepoIdentity(canonical, {
      customRemoteUrl: "https://user:token@github.com/test-org/my-app.git",
      displayName: "My Test App",
    });

    assert.equal(created1, true);
    assert.equal(id1.schema, "hypertaks.repo.v1");
    assert.equal(id1.display_name, "My Test App");
    assert.equal(id1.hypertaks_product_version, "0.0.4.5.9");
    // Verify no secret in fingerprints or id
    assert.ok(!JSON.stringify(id1).includes("token"));
    assert.ok(!JSON.stringify(id1).includes("user:"));

    // Reloading identity should be idempotent
    const { identity: id2, created: created2 } = loadOrInitRepoIdentity(canonical);
    assert.equal(created2, false);
    assert.equal(id2.repo_id, id1.repo_id);
    assert.equal(id2.created_at, id1.created_at);

    // Verify file on disk
    const onDisk = readRepoIdentity(canonical);
    assert.ok(onDisk);
    assert.equal(onDisk.repo_id, id1.repo_id);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("repo-identity: detects rebind if repository root moved", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-rebind-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const { identity } = loadOrInitRepoIdentity(canonical, { displayName: "Rebind Test" });

    // Artificially change root_fingerprint to simulate moved directory
    const tampered = {
      ...identity,
      root_fingerprint: "old-fingerprint-mismatch",
    };
    saveRepoIdentity(canonical, tampered);

    const reloaded = loadOrInitRepoIdentity(canonical);
    assert.equal(reloaded.rebindDetected, true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
