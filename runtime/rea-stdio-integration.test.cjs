const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const engineModule = require("../.build/runtime/capability-engine.js");

const {
  probeLocalReaTools,
  resolveLocalReaConfig,
  executeReaViaStdio,
  createReaStdioInvoker,
  createDefaultCapabilityEngine,
  createReaCapabilitySource,
  inferNeedsFromIntent,
} = engineModule;

const WHOAMI_TARGET = "C:\\Users\\abrur\\tools\\test-targets\\whoami.exe";

test("REA Stdio Step 1: probe and verify local REA installation and tools/list", async () => {
  const config = resolveLocalReaConfig();
  assert.equal(config.exists, true, "Local REA script must exist on disk");
  assert.match(config.scriptPath, /rea\.mjs$/, "Script path must point to rea.mjs");

  const probe = await probeLocalReaTools(15000);
  assert.equal(probe.available, true, "REA stdio probe must succeed");
  assert.ok(probe.tools.length >= 100, `Expected at least 100 tools, got ${probe.tools.length}`);
  assert.ok(probe.tools.includes("inspect_pe_resources"), "inspect_pe_resources must be exposed");
  assert.ok(probe.tools.includes("open_binary"), "open_binary must be exposed");
  assert.ok(probe.tools.includes("binary_overview"), "binary_overview must be exposed");
  assert.equal(probe.version, "6.7.0", "REA server version must match 6.7.0");
});

test("REA Stdio Step 2: direct tools/call execution on whoami.exe returns verified evidence", async () => {
  const rawResult = await executeReaViaStdio("inspect_pe_resources", {
    path: WHOAMI_TARGET,
  });

  assert.ok(rawResult, "REA execution must return a result object");
  const result = rawResult;
  assert.ok(result.content, "Result must have content");
  assert.equal(Array.isArray(result.content), true);
  assert.ok(result.content.length > 0);

  const textPayload = result.content[0].text;
  assert.ok(textPayload, "Text payload must not be empty");

  const parsed = JSON.parse(textPayload);
  assert.ok(parsed.evidence_id, "Evidence must contain evidence_id");
  assert.equal(parsed.operation, "inspect_pe_resources");
  assert.equal(parsed.provider.id, "rea-pe-resources");
  assert.equal(parsed.normalized_result.format, "pe32-plus");
  assert.equal(parsed.normalized_result.artifact.bytes, 98304);
  assert.equal(parsed.normalized_result.coverage.status, "complete");
  assert.ok(parsed.normalized_result.resources.length >= 3, "whoami.exe must have at least 3 PE resources");
});

test("REA Stdio Step 3: End-to-End Hypertaks Founder flow (Prompt -> Intake -> Binding -> Stdio REA -> Evidence -> Result)", async () => {
  const userPrompt = "Hypertaks, analisis biner executable whoami.exe dan periksa resources di dalamnya";

  // 1. Intake Gate: infer needs from prompt (bilingual ID/EN support)
  const inferredNeeds = inferNeedsFromIntent(userPrompt);
  assert.ok(inferredNeeds.length > 0, "Intake gate must infer needs");
  const binaryNeed = inferredNeeds.find((n) => n.category === "binary_intelligence");
  assert.ok(binaryNeed, "Intake gate must infer binary_intelligence need");
  assert.equal(binaryNeed.operation, "read");
  assert.equal(binaryNeed.allowSideEffects, false);

  // 2. Capability Selection: compose engine with live discovered REA tools
  const probe = await probeLocalReaTools();
  const engine = createDefaultCapabilityEngine({
    available: true,
    tools: probe.tools,
    auth: "none",
    endpoint: "stdio",
  });

  const selection = await engine.selectForIntent(userPrompt, {
    allowedExternalSystems: ["rea"],
    allowSideEffects: false,
  });

  assert.ok(selection.selected.length > 0, "Capability selection must find matching capability");
  const boundCap = selection.selected.find((c) => c.provider === "rea");
  assert.ok(boundCap, "REA capability must be bound");
  assert.equal(boundCap.availability, "verified");
  assert.equal(boundCap.side_effect, "none");
  assert.equal(boundCap.approval_required, false);

  // 3. Execution: dispatch via Hypertaks Capability Engine with on-demand stdio
  const execResult = await engine.execute(
    boundCap.capability_id,
    {
      tool: "inspect_pe_resources",
      path: WHOAMI_TARGET,
    },
    {
      useLocalStdioRea: true,
      approvalGranted: false, // Read-only op requires no mutation approval
    },
  );

  assert.equal(execResult.success, true);
  assert.equal(execResult.status, "executed");
  assert.equal(execResult.provider, "rea");
  assert.ok(execResult.evidence, "Hypertaks evidence must be generated");
  assert.equal(execResult.evidence.kind, "REA_EVIDENCE");
  assert.equal(execResult.evidence.provenance.transport, "stdio");

  // Verify normalized content from the tool
  const output = execResult.output;
  assert.ok(output.content && output.content[0].text);
  const evidenceData = JSON.parse(output.content[0].text);
  assert.equal(evidenceData.subject.name, "whoami.exe");
  assert.equal(evidenceData.subject.format, "pe");
  assert.equal(evidenceData.normalized_result.machine, 34404); // x86_64
});

test("REA Stdio Step 4: Non-REA prompt does NOT bind or spawn REA", async () => {
  const codePrompt = "Tolong telaah arsitektur kode dan petakan relasi dependensi file";

  // 1. Intake Gate
  const needs = inferNeedsFromIntent(codePrompt);
  assert.equal(needs.some((n) => n.category === "binary_intelligence"), false, "Must NOT infer binary_intelligence");
  assert.ok(needs.some((n) => n.category === "repository_intelligence" || n.category === "dependency_analysis"));

  // 2. Capability Selection
  const probe = await probeLocalReaTools();
  const engine = createDefaultCapabilityEngine({
    available: true,
    tools: probe.tools,
    auth: "none",
  });

  const selection = await engine.selectForIntent(codePrompt, {
    allowedExternalSystems: ["rea"],
    allowSideEffects: false,
  });

  // Verify REA is NOT selected
  const reaSelected = selection.selected.some((c) => c.provider === "rea");
  assert.equal(reaSelected, false, "REA must NOT be selected for pure repo intelligence prompt");

  // Verify first-party native tool IS selected
  const nativeSelected = selection.selected.some((c) => c.provider === "hypertaks-native");
  assert.equal(nativeSelected, true, "Hypertaks native capability must be selected");
});

test("REA Stdio Step 5: Permission gating and error handling fail closed", async () => {
  const probe = await probeLocalReaTools();
  const engine = createDefaultCapabilityEngine({
    available: true,
    tools: probe.tools,
    auth: "none",
  });

  // 1. Mutating REA annotation without approval is denied
  const mutatingRes = await engine.execute(
    "hypertaks-investigation-annotation",
    { tool: "annotate_native_function" },
    { approvalGranted: false, useLocalStdioRea: true },
  );
  assert.equal(mutatingRes.success, false);
  assert.equal(mutatingRes.status, "denied");
  assert.match(mutatingRes.error, /requires explicit Boss approval/);

  // 2. Target file not found returns clean error via stdio
  const nonExistentTarget = "C:\\Users\\abrur\\tools\\test-targets\\non_existent_binary.exe";
  const missingTargetRes = await engine.execute(
    "hypertaks-investigation",
    {
      tool: "inspect_pe_resources",
      path: nonExistentTarget,
    },
    { useLocalStdioRea: true },
  );
  assert.equal(missingTargetRes.success, true); // MCP returns tool failure inside content envelope
  const envelope = missingTargetRes.output;
  assert.equal(envelope.isError, true);
  assert.match(envelope.content[0].text, /Target file not found|ENOENT|does not exist/i);
});
