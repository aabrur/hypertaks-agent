const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const {
  issueBootstrapGrant,
  verifyBootstrapGrant,
  bootstrapRepoVault,
  revokeStoredGrant,
  readStoredGrant,
  mintBootstrapProof,
} = require("../.build/runtime/repo-bootstrap.js");
const { resolveCanonicalRoot, loadOrInitRepoIdentity } = require("../.build/runtime/repo-identity.js");

test("repo-bootstrap: issue and verify bootstrap grant", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-grant-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const { identity } = loadOrInitRepoIdentity(canonical);
    const proof = mintBootstrapProof("HT-TEST-001");
    const grant = issueBootstrapGrant(canonical, identity.repo_id, "HT-TEST-001", { proof });

    assert.equal(grant.grant_kind, "hypertaks.repo-bootstrap.v1");
    assert.equal(grant.allowed_path, ".hypertaks/**");
    assert.equal(grant.revoked, false);

    // Verify valid grant
    const checkValid = verifyBootstrapGrant(canonical, identity.repo_id, grant);
    assert.equal(checkValid.valid, true);

    // Tampered grant signature fails closed
    const tampered = { ...grant, signature: "forged-signature-value" };
    const checkTampered = verifyBootstrapGrant(canonical, identity.repo_id, tampered);
    assert.equal(checkTampered.valid, false);

    // Grant for another repo fails closed
    const checkWrongRepo = verifyBootstrapGrant(canonical, "other-repo-id-123456", grant);
    assert.equal(checkWrongRepo.valid, false);

    // Grant on another directory fails closed
    const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-other-dir-"));
    try {
      const checkWrongDir = verifyBootstrapGrant(otherDir, identity.repo_id, grant);
      assert.equal(checkWrongDir.valid, false);
    } finally {
      fs.rmSync(otherDir, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("repo-bootstrap: bootstrapRepoVault initializes vault and preserves existing files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hypertaks-vault-test-"));
  try {
    const canonical = resolveCanonicalRoot(tempDir);
    const { identity } = loadOrInitRepoIdentity(canonical);
    const proof2 = mintBootstrapProof("HT-TEST-002");
    const grant = issueBootstrapGrant(canonical, identity.repo_id, "HT-TEST-002", { proof: proof2 });

    // First initialization
    const result1 = bootstrapRepoVault(canonical, grant);
    assert.equal(result1.success, true);
    assert.ok(result1.createdFiles.length > 15);

    // Verify root files exist
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "VERSION")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "README.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "ARCHITECTURE.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "FUNCTION-MAP.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "DATA-MODEL.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "NETWORK-DEPENDENCIES.md")));
    assert.ok(fs.existsSync(path.join(canonical, ".hypertaks", "ASSET-INDEX.md")));

    // Verify 13 POC files exist in projects/<repo_id>
    const visionFile = path.join(canonical, ".hypertaks", "projects", identity.repo_id, "Vision.ctx.md");
    assert.ok(fs.existsSync(visionFile));

    // Modify Vision.ctx.md to simulate user edits
    const customContent = "# My Custom Vision Document\nDo not overwrite me!";
    fs.writeFileSync(visionFile, customContent, "utf8");

    // Second initialization must be idempotent and preserve custom files
    const result2 = bootstrapRepoVault(canonical, grant);
    assert.equal(result2.success, true);
    assert.ok(result2.preservedFiles.includes(`.hypertaks/projects/${identity.repo_id}/Vision.ctx.md`));

    // Confirm custom content was untouched
    assert.equal(fs.readFileSync(visionFile, "utf8"), customContent);

    // Verify stored grant in state
    const stored = readStoredGrant(canonical);
    assert.ok(stored);
    assert.equal(stored.repo_id, identity.repo_id);
    assert.equal(stored.revoked, false);

    // Revocation check
    const revoked = revokeStoredGrant(canonical);
    assert.equal(revoked, true);
    const storedAfterRevoke = readStoredGrant(canonical);
    assert.equal(storedAfterRevoke.revoked, true);

    // Bootstrap with revoked grant fails closed
    const result3 = bootstrapRepoVault(canonical, storedAfterRevoke);
    assert.equal(result3.success, false);
    assert.ok(result3.error.includes("revoked"));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
