const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { runCli } = require("../.build/runtime/cli.js");

async function capture(fn) {
  const out = [];
  const err = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...parts) => out.push(parts.join(" "));
  console.error = (...parts) => err.push(parts.join(" "));
  let code;
  try {
    code = await fn();
  } finally {
    console.log = origLog;
    console.error = origErr;
  }
  return { code, out: out.join("\n"), err: err.join("\n") };
}

function makeTempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ht-scan-"));
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents);
  }
  return dir;
}

test("scan read-only screens a target repo and writes nothing", async () => {
  const dir = makeTempRepo({ "main.ts": "export const x = 1;", "app.py": "print('hi')" });
  const { code, out } = await capture(() => runCli(["scan", "--repo", dir]));
  assert.equal(code, 0);
  assert.match(out, /READ-ONLY/);
  assert.match(out, /Files: 2 scanned/);
  assert.ok(!fs.existsSync(path.join(dir, ".hypertaks")), "read-only scan must not create .hypertaks");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("scan --json emits machine-readable read-only output", async () => {
  const dir = makeTempRepo({ "index.js": "module.exports = {};" });
  const { code, out } = await capture(() => runCli(["scan", "--repo", dir, "--json"]));
  assert.equal(code, 0);
  const parsed = JSON.parse(out);
  assert.equal(parsed.read_only, true);
  assert.equal(parsed.filesScanned, 1);
  assert.ok(Array.isArray(parsed.plan) && parsed.plan.length > 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("scan --write-context without --approve fails closed with no write", async () => {
  const dir = makeTempRepo({ "a.ts": "const a = 1;" });
  const { code, err } = await capture(() => runCli(["scan", "--repo", dir, "--write-context"]));
  assert.equal(code, 2);
  assert.match(err, /APPROVAL_REQUIRED/);
  assert.ok(!fs.existsSync(path.join(dir, ".hypertaks")), "no vault without approval");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("scan with an unresolvable --repo path returns exit 1", async () => {
  const { code, err } = await capture(() => runCli(["scan", "--repo", path.join(os.tmpdir(), "ht-missing-xyz-987")]));
  assert.equal(code, 1);
  assert.match(err, /INVALID_TARGET/);
});

test("scan --deep flag is reflected in read-only output without extra writes", async () => {
  const dir = makeTempRepo({ "x.ts": "const x = 1;" });
  const { code, out } = await capture(() => runCli(["scan", "--repo", dir, "--deep"]));
  assert.equal(code, 0);
  assert.match(out, /\(deep\)/);
  assert.ok(!fs.existsSync(path.join(dir, ".hypertaks")));
  fs.rmSync(dir, { recursive: true, force: true });
});

test("scan --depth deep --json reflects deep flag in read-only mode", async () => {
  const dir = makeTempRepo({ "service.ts": "export class Service {}" });
  const { code, out } = await capture(() => runCli(["scan", "--repo", dir, "--depth", "deep", "--json"]));
  assert.equal(code, 0);
  const parsed = JSON.parse(out);
  assert.equal(parsed.read_only, true);
  assert.equal(parsed.deep, true);
  assert.ok(!fs.existsSync(path.join(dir, ".hypertaks")));
  fs.rmSync(dir, { recursive: true, force: true });
});

test("authorized scan creates .hypertaks with 13 enriched context documents and context verify passes", async () => {
  const dir = makeTempRepo({
    "server.ts": "export function handleRequest() { return 200; }",
    "package.json": JSON.stringify({ name: "fixture-service", version: "1.0.0" }),
  });

  const { code, out } = await capture(() =>
    runCli([
      "scan",
      "--repo",
      dir,
      "--depth",
      "deep",
      "--write-context",
      "--contract-id",
      "HT-REPO-001",
      "--approval",
      "APPROVE HT-REPO-001",
      "--json",
    ]),
  );

  assert.equal(code, 0);
  const result = JSON.parse(out);
  assert.equal(result.outcome, "written");
  assert.ok(result.createdFiles > 0);

  // Run context verify
  const verifyRes = await capture(() => runCli(["context", "verify", "--repo", dir, "--json"]));
  assert.equal(verifyRes.code, 0);
  const verifyParsed = JSON.parse(verifyRes.out);
  assert.equal(verifyParsed.verified, 13);
  assert.equal(verifyParsed.missing, 0);

  // Verify architecture.ctx.md contains evidence-backed content
  const archFile = path.join(dir, ".hypertaks", "projects", result.repoId, "architecture.ctx.md");
  assert.ok(fs.existsSync(archFile));
  const archContent = fs.readFileSync(archFile, "utf8");
  assert.match(archContent, /Master Architectural Overview/);
  assert.match(archContent, /Quantitative Repository Metrics/);
  assert.doesNotMatch(archContent, /Universal living context document for architecture adaptively serving software/);

  // Idempotence: rescan should preserve existing context documents without churn
  const rescan = await capture(() =>
    runCli([
      "scan",
      "--repo",
      dir,
      "--write-context",
      "--contract-id",
      "HT-REPO-001",
      "--approval",
      "APPROVE HT-REPO-001",
      "--json",
    ]),
  );
  assert.equal(rescan.code, 0);
  const rescanParsed = JSON.parse(rescan.out);
  assert.equal(rescanParsed.outcome, "written");
  assert.ok(rescanParsed.preservedFiles >= 13);

  fs.rmSync(dir, { recursive: true, force: true });
});
