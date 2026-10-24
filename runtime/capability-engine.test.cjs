const test = require("node:test");
const assert = require("node:assert/strict");

const engineModule = require("../.build/runtime/capability-engine.js");
const router = require("../.build/runtime/router.js");

const {
  createReaCapabilitySource,
  createSuperpowersCapabilitySource,
  createHostNativeCapabilitySource,
  createMcpCapabilitySource,
  createHypertaksNativeCapabilitySource,
  createDefaultCapabilityEngine,
  UnifiedCapabilityEngine,
  inferNeedsFromIntent,
} = engineModule;

const byId = (list, id) => list.find((descriptor) => descriptor.capability_id === id);

/** Build a minimal but complete UnifiedCapabilityDescriptor for binding tests. */
function baseDesc(id, category, operation, over = {}) {
  return {
    capability_id: id,
    kind: "native_tool",
    categories: [category],
    operations: [operation],
    side_effect: "none",
    approval_required: false,
    authentication: "none",
    external_system: null,
    context_cost: "low",
    availability: "verified",
    capability_type: "unknown",
    provider: "test",
    provider_operation: null,
    public_name: id,
    io_contract: "",
    platform: [],
    permissions: [],
    session_model: "stateless",
    evidence: { kind: "TEST", provenanceFields: [] },
    fallback: "",
    error_model: "",
    ...over,
  };
}

test("rea adapter maps discovered tools to branded Hypertaks investigation capabilities", async () => {
  const source = createReaCapabilitySource({
    available: true,
    tools: ["analyze_function", "batch_decompile", "binary_overview", "search_strings", "annotate_native_function", "observe_native_calls"],
    auth: "none",
  });
  const desc = await source.discover({});

  const investigation = byId(desc, "hypertaks-investigation");
  assert.ok(investigation, "investigation capability present");
  assert.equal(investigation.availability, "verified");
  assert.equal(investigation.provider, "rea");
  assert.equal(investigation.public_name, "Hypertaks Static Investigation");
  assert.ok(investigation.operations.includes("read"));
  assert.equal(investigation.side_effect, "none");
  assert.equal(investigation.approval_required, false);
  assert.ok(investigation.evidence.kind === "REA_EVIDENCE");
  assert.ok(investigation.provider_operation.includes("analyze_function"));

  const binary = byId(desc, "hypertaks-binary-intelligence");
  assert.ok(binary, "binary intelligence capability present");
  assert.equal(binary.public_name, "Hypertaks Binary Intelligence");

  const annotation = byId(desc, "hypertaks-investigation-annotation");
  assert.ok(annotation, "annotation capability present (mutating ops grouped)");
  assert.equal(annotation.approval_required, true);
  assert.notEqual(annotation.side_effect, "none");
  assert.ok(annotation.provider_operation.includes("annotate_native_function"));
  assert.ok(annotation.provider_operation.includes("observe_native_calls"));
});

test("rea unavailable reports unavailable and is never bound", async () => {
  const source = createReaCapabilitySource({ available: false, tools: ["analyze_function"] });
  const desc = await source.discover({});
  assert.ok(desc.length > 0, "descriptors still emitted with unavailable availability");
  for (const item of desc) assert.equal(item.availability, "unavailable");

  const engine = new UnifiedCapabilityEngine([source]);
  const sel = await engine.select(
    { needs: [{ category: "binary_intelligence", operation: "read", allowSideEffects: false, allowedExternalSystems: ["rea"] }] },
    {},
  );
  assert.equal(sel.selected.length, 0);
  assert.equal(sel.unmet.length, 1);
});

test("invasive rea annotation binds only with Founder approval and side effects allowed", async () => {
  const source = createReaCapabilitySource({ available: true, tools: ["annotate_native_function", "set_comment"], auth: "none" });
  const engine = new UnifiedCapabilityEngine([source]);
  const need = { category: "annotation", operation: "update", allowSideEffects: false, allowedExternalSystems: ["rea"] };

  const gated = await engine.select({ needs: [need] }, {});
  assert.ok(!gated.selected.some((item) => item.capability_id === "hypertaks-investigation-annotation"));

  const granted = await engine.select({ needs: [{ ...need, approvalGranted: true, allowSideEffects: true }] }, {});
  assert.ok(granted.selected.some((item) => item.capability_id === "hypertaks-investigation-annotation"));
});

test("unknown rea tools are surfaced fail-closed, never silently bindable", async () => {
  const source = createReaCapabilitySource({ available: true, tools: ["some_future_rea_op"], auth: "none" });
  const desc = await source.discover({});
  const generic = desc.find((item) => item.approval_required && item.side_effect === "unknown");
  assert.ok(generic, "unknown op surfaced as approval-required unknown side effect");
});

test("superpowers adapter verifies installed workflows and marks absent ones unavailable", async () => {
  const source = createSuperpowersCapabilitySource();
  const desc = await source.discover({ hostSkills: ["systematic-debugging", "test-driven-development"] });

  const debugging = byId(desc, "hypertaks-debugging-workflow");
  assert.equal(debugging.availability, "verified");
  assert.equal(debugging.provider, "superpowers");
  assert.equal(debugging.provider_operation, "systematic-debugging");
  assert.equal(debugging.capability_type, "workflow");

  const tdd = byId(desc, "hypertaks-tdd-workflow");
  assert.equal(tdd.availability, "verified");

  const planning = byId(desc, "hypertaks-planning-workflow");
  assert.equal(planning.availability, "unavailable");
  assert.equal(planning.provider, "superpowers-absent");
  assert.equal(planning.provider_operation, null);
});

test("engine only queries sources relevant to the needed categories (need before discovery)", async () => {
  const queried = [];
  const spy = {
    sourceId: "spy",
    categories: ["binary_intelligence"],
    discover: async () => {
      queried.push("spy");
      return [];
    },
  };
  const irrelevant = {
    sourceId: "irrelevant",
    categories: ["cooking", "gardening"],
    discover: async () => {
      queried.push("irrelevant");
      return [];
    },
  };
  const engine = new UnifiedCapabilityEngine([spy, irrelevant]);
  await engine.select({ needs: [{ category: "binary_intelligence", operation: "read", allowSideEffects: false }] }, {});
  assert.deepEqual(queried, ["spy"]);
});

test("engine binds the lowest-context-cost verified candidate", async () => {
  const high = {
    sourceId: "high",
    categories: ["search"],
    discover: async () => [baseDesc("cap-high", "search", "read", { context_cost: "high" })],
  };
  const low = {
    sourceId: "low",
    categories: ["search"],
    discover: async () => [baseDesc("cap-low", "search", "read", { context_cost: "low" })],
  };
  const engine = new UnifiedCapabilityEngine([high, low]);
  const sel = await engine.select({ needs: [{ category: "search", operation: "read", allowSideEffects: false }] }, {});
  assert.equal(sel.selected.length, 1);
  assert.equal(sel.selected[0].capability_id, "cap-low");
});

test("engine reports unmet needs without fabricating a capability", async () => {
  const engine = new UnifiedCapabilityEngine([]);
  const sel = await engine.select({ needs: [{ category: "onchain", operation: "execute", allowSideEffects: true }] }, {});
  assert.equal(sel.selected.length, 0);
  assert.equal(sel.discovered.length, 0);
  assert.equal(sel.unmet.length, 1);
  assert.match(sel.notes.join(" "), /Falling back to core reasoning/);
});

test("host-native and mcp sources describe live tools with provider attribution", async () => {
  const host = await createHostNativeCapabilitySource().discover({ hostTools: ["browser", "grep"], platform: "windows" });
  assert.equal(host.length, 2);
  assert.equal(host[0].provider, "host-native");
  assert.equal(host[0].provider_operation, "browser");
  assert.deepEqual(host[0].platform, ["windows"]);

  const mcp = await createMcpCapabilitySource().discover({
    mcpServers: [{ name: "github", tools: ["list_issues", "create_issue"], authenticated: true }],
  });
  assert.equal(mcp.length, 2);
  assert.equal(mcp[0].provider, "mcp:github");
  assert.equal(mcp[0].authentication, "present");
  assert.equal(mcp[0].external_system, "github");
});

test("default engine includes REA only when a discovery hint is provided", () => {
  const withRea = createDefaultCapabilityEngine({ available: true, tools: ["analyze_function"], auth: "none" });
  assert.ok(withRea.listSources().includes("rea"));
  const without = createDefaultCapabilityEngine();
  assert.ok(!without.listSources().includes("rea"));
  assert.ok(without.listSources().includes("superpowers"));
});

test("router re-exports the engine and bindCapabilities stays compatible with extended descriptors", () => {
  assert.equal(typeof router.UnifiedCapabilityEngine, "function");
  assert.equal(typeof router.bindCapabilities, "function");
  const need = [{ category: "search", operation: "read", allowSideEffects: false, allowedExternalSystems: ["x"] }];
  const desc = [baseDesc("cap-x", "search", "read", { context_cost: "low", external_system: "x" })];
  const bound = router.bindCapabilities(need, desc);
  assert.equal(bound.length, 1);
  assert.equal(bound[0].capability_id, "cap-x");
});

test("end-to-end: REA-backed investigation binds for a reverse-engineering need only when available", async () => {
  const rea = createReaCapabilitySource({ available: true, tools: ["analyze_function", "get_call_graph"], auth: "none" });
  const engine = new UnifiedCapabilityEngine([rea, createSuperpowersCapabilitySource()]);
  const sel = await engine.select(
    { needs: [{ category: "binary_intelligence", operation: "read", allowSideEffects: false, allowedExternalSystems: ["rea"] }] },
    {},
  );
  assert.equal(sel.selected.length, 1);
  assert.equal(sel.selected[0].provider, "rea");
  assert.equal(sel.selected[0].public_name, "Hypertaks Static Investigation");
  assert.equal(sel.unmet.length, 0);
  assert.match(sel.notes.join(" "), /Hypertaks capability routing/);
});

test("hypertaks native source discovers first-party capabilities", async () => {
  const nativeSource = createHypertaksNativeCapabilitySource();
  const desc = await nativeSource.discover({});
  const repoIntel = byId(desc, "hypertaks-repository-intelligence");
  assert.ok(repoIntel, "hypertaks-repository-intelligence present");
  assert.equal(repoIntel.provider, "hypertaks-native");
  assert.equal(repoIntel.availability, "verified");

  const graphIntel = byId(desc, "hypertaks-graph-intelligence");
  assert.ok(graphIntel, "hypertaks-graph-intelligence present");
  assert.equal(graphIntel.provider, "hypertaks-native");

  const brainIntel = byId(desc, "hypertaks-brain-continuity");
  assert.ok(brainIntel, "hypertaks-brain-continuity present");
  assert.equal(brainIntel.provider, "hypertaks-native");

  const engVerif = byId(desc, "hypertaks-engineering-verification");
  assert.ok(engVerif, "hypertaks-engineering-verification present");
  assert.equal(engVerif.provider, "hypertaks-native");
});

test("inferNeedsFromIntent classifies user prompts without brand names", () => {
  assert.equal(inferNeedsFromIntent("fix a TypeScript bug in router.ts")[0].category, "debugging");
  assert.equal(inferNeedsFromIntent("inspect an executable Mach-O binary")[0].category, "binary_intelligence");
  assert.equal(inferNeedsFromIntent("show dependency relationships and blast radius")[0].category, "dependency_analysis");
  assert.equal(inferNeedsFromIntent("continue a previous project from checkpoint")[0].category, "continuity");
  assert.equal(inferNeedsFromIntent("screen repository architecture and boundaries")[0].category, "repository_intelligence");
  assert.equal(inferNeedsFromIntent("brainstorm new feature design")[0].category, "planning");
  assert.equal(inferNeedsFromIntent("apply test-driven development")[0].category, "tdd");
});

test("selectForIntent binds minimum sufficient capability for user intent", async () => {
  const defaultEngine = createDefaultCapabilityEngine();

  // 1. Repository architecture intent
  const repoSel = await defaultEngine.selectForIntent("screen repository architecture");
  assert.equal(repoSel.selected.length, 1);
  assert.equal(repoSel.selected[0].capability_id, "hypertaks-repository-intelligence");
  assert.equal(repoSel.selected[0].provider, "hypertaks-native");

  // 2. Dependency relationships intent
  const graphSel = await defaultEngine.selectForIntent("analyze dependency relationships");
  assert.equal(graphSel.selected.length, 1);
  assert.equal(graphSel.selected[0].capability_id, "hypertaks-graph-intelligence");

  // 3. Continue previous project intent
  const contSel = await defaultEngine.selectForIntent("continue a previous project run");
  assert.equal(contSel.selected.length, 1);
  assert.equal(contSel.selected[0].capability_id, "hypertaks-brain-continuity");

  // 4. Executable inspection without REA hint degrades and reports truthful fallback
  const execSel = await defaultEngine.selectForIntent("inspect an executable binary");
  assert.equal(execSel.selected.length, 0);
  assert.equal(execSel.unmet.length, 1);
  assert.match(execSel.notes.join(" "), /Falling back to core reasoning/);
});

test("CRITICAL 1: operational execution dispatches native, mcp, and handles REA states", async () => {
  const engine = createDefaultCapabilityEngine({ available: true, tools: ["analyze_function"] });

  // 1. Native execution
  const nativeRes = await engine.execute("hypertaks-repository-intelligence", { root: process.cwd() });
  assert.equal(nativeRes.success, true);
  assert.equal(nativeRes.provider, "hypertaks-native");
  assert.equal(nativeRes.status, "executed");
  assert.ok(nativeRes.evidence);

  // 2. REA execution with mock invoker
  const reaMockRes = await engine.execute(
    "hypertaks-investigation",
    { function: "main" },
    {
      reaInvoker: async (tool, args) => ({ decompileResult: "int main() { return 0; }", tool }),
    },
  );
  assert.equal(reaMockRes.success, true);
  assert.equal(reaMockRes.status, "executed");
  assert.equal(reaMockRes.provider, "rea");
  assert.ok(reaMockRes.evidence);

  // 3. REA execution when no invoker / live endpoint is configured fails closed
  const reaNoInvokerRes = await engine.execute("hypertaks-investigation", { function: "main" });
  assert.equal(reaNoInvokerRes.success, false);
  assert.equal(reaNoInvokerRes.status, "unverified");
  assert.match(reaNoInvokerRes.error, /REA MCP provider is unavailable/);

  // 4. Approval gating
  const gatedEngine = new UnifiedCapabilityEngine([
    {
      sourceId: "mock",
      categories: ["danger"],
      discover: async () => [
        baseDesc("cap-danger", "danger", "execute", {
          approval_required: true,
          side_effect: "irreversible",
          provider: "host-native",
        }),
      ],
    },
  ]);
  const deniedRes = await gatedEngine.execute("cap-danger", {}, { approvalGranted: false });
  assert.equal(deniedRes.success, false);
  assert.equal(deniedRes.status, "denied");

  const approvedRes = await gatedEngine.execute("cap-danger", {}, { approvalGranted: true });
  assert.equal(approvedRes.success, true);
  assert.equal(approvedRes.status, "executed");
});

test("CRITICAL 2: Indonesian intent routing and multi-intent matching", () => {
  // Indonesian intent
  const idDebug = inferNeedsFromIntent("tolong perbaiki masalah dan bug di router");
  assert.equal(idDebug.some((n) => n.category === "debugging"), true);

  const idBinary = inferNeedsFromIntent("analisis biner executable dan dekompilasi");
  assert.equal(idBinary.some((n) => n.category === "binary_intelligence"), true);

  const idGraph = inferNeedsFromIntent("lihat relasi dependensi dan graf proyek");
  assert.equal(idGraph.some((n) => n.category === "dependency_analysis"), true);

  // Multi-intent simultaneously
  const multi = inferNeedsFromIntent("perbaiki bug dan telaah arsitektur kode");
  assert.ok(multi.length >= 2);
  assert.equal(multi.some((n) => n.category === "debugging"), true);
  assert.equal(multi.some((n) => n.category === "repository_intelligence"), true);
});

test("CRITICAL 7: fail-closed effect classification", () => {
  const { classifyEffect } = engineModule;
  assert.equal(classifyEffect("read"), "none");
  assert.equal(classifyEffect("query"), "none");
  assert.equal(classifyEffect("update"), "reversible");
  assert.equal(classifyEffect("edit"), "reversible");
  assert.equal(classifyEffect("delete"), "irreversible");
  assert.equal(classifyEffect("execute"), "irreversible");
  assert.equal(classifyEffect("unknown_dangerous_op"), "unknown");
});
