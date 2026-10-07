const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const { loadReleaseVersion, FALLBACK_RELEASE_VERSION } = require("../.build/runtime/version.js");

test("version SSOT: loads release/version.json correctly", () => {
  const root = path.resolve(__dirname, "..");
  const versionInfo = loadReleaseVersion(root);

  assert.equal(versionInfo.productVersion, "0.0.4.5.9");
  assert.equal(versionInfo.displayVersion, "v0.0.4.5.9");
  assert.equal(versionInfo.semverCompatibilityVersion, "0.0.4-5.9");
  assert.equal(versionInfo.previousHistoricalVersion, "4.5.8");
});

test("version SSOT: falls back safely when release/version.json is missing", () => {
  const versionInfo = loadReleaseVersion("/nonexistent/directory");
  assert.equal(versionInfo.productVersion, FALLBACK_RELEASE_VERSION.productVersion);
  assert.equal(versionInfo.displayVersion, FALLBACK_RELEASE_VERSION.displayVersion);
  assert.equal(versionInfo.semverCompatibilityVersion, FALLBACK_RELEASE_VERSION.semverCompatibilityVersion);
});
