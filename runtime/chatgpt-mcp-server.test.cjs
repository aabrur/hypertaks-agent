#!/usr/bin/env node

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const serverPath = path.join(__dirname, "chatgpt-mcp-server.mjs");

async function startServer(extraEnv = {}) {
  const child = spawn(process.execPath, [serverPath], {
    cwd: root,
    env: {
      ...process.env,
      HYPERTAKS_MCP_HOST: "127.0.0.1",
      HYPERTAKS_MCP_PORT: "0",
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start. ${stderr}`)), 5000);
    child.stdout.setEncoding("utf8");
    let buffer = "";
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      const newline = buffer.indexOf("\n");
      if (newline === -1) return;
      clearTimeout(timer);
      try {
        resolve(JSON.parse(buffer.slice(0, newline)));
      } catch (error) {
        reject(error);
      }
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited before ready with code ${code}. ${stderr}`));
    });
  });

  return {
    child,
    baseUrl: `http://127.0.0.1:${ready.port}`,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    },
  };
}

async function rpc(baseUrl, body, headers = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return { response, payload: text ? JSON.parse(text) : null };
}

async function route(baseUrl, request, preferredSkill, diagnostics) {
  const arguments_ = { request };
  if (preferredSkill !== undefined) arguments_.preferredSkill = preferredSkill;
  if (diagnostics !== undefined) arguments_.diagnostics = diagnostics;
  const routed = await rpc(baseUrl, {
    jsonrpc: "2.0",
    id: `route-${Math.random().toString(16).slice(2)}`,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: arguments_ },
  });
  assert.equal(routed.response.status, 200);
  assert.equal(routed.payload.result.isError, false);
  return routed.payload.result.structuredContent;
}

test("health endpoint and MCP initialization are generic", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const health = await fetch(`${server.baseUrl}/healthz`);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.readOnly, true);
  assert.equal(healthBody.name, "hypertaks-mcp-adapter");
  assert.equal(healthBody.endpoint, "/mcp");

  for (const protocolVersion of ["2025-03-26", "2025-06-18", "2025-11-25"]) {
    const initialized = await rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: protocolVersion,
      method: "initialize",
      params: {
        protocolVersion,
        capabilities: {},
        clientInfo: { name: "hypertaks-test", version: "1.0.0" },
      },
    });
    assert.equal(initialized.response.status, 200);
    assert.equal(initialized.payload.result.protocolVersion, protocolVersion);
    assert.equal(initialized.payload.result.serverInfo.name, "hypertaks-mcp-adapter");
    assert.equal(initialized.payload.result.serverInfo.title, "Hypertaks MCP Adapter");
    assert.match(
      initialized.payload.result.serverInfo.description,
      /Read-only remote MCP transport for the five canonical Hypertaks skills/,
    );
    assert.doesNotMatch(JSON.stringify(initialized.payload.result), /ChatGPT/i);
  }
});

test("tool discovery is deterministic and read-only", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());
  const listed = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  const names = listed.payload.result.tools.map((tool) => tool.name);
  assert.deepEqual(names, [
    "hypertaks_manifest",
    "hypertaks_get_skill",
    "hypertaks_route",
    "hypertaks_verify_installation",
  ]);
  assert.equal(names.length, 4);
  for (const tool of listed.payload.result.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
  }
});

test("manifest and installation verification preserve five-skill identity", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const manifest = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "hypertaks_manifest", arguments: {} },
  });
  const content = manifest.payload.result.structuredContent;
  assert.equal(content.publicSkills.length, 5);
  assert.equal(content.writeCapability, "not exposed by this adapter");
  assert.match(content.mcpRole, /remote transport for MCP-compatible clients/i);
  assert.match(content.compatibility, /Compatible with AI agents and clients that support standard MCP Streamable HTTP/);
  assert.doesNotMatch(JSON.stringify(content), /ChatGPT/i);
  assert.equal(typeof content.routePolicyVersion, "string");
  assert.match(content.routerRulesDigest, /^[a-f0-9]{64}$/);
  assert.match(String(content.buildRevision), /^(unknown|[0-9a-f]{7,64})$/i);
  assert.ok(Array.isArray(content.supportedLocales));

  const verified = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "hypertaks_verify_installation", arguments: {} },
  });
  assert.equal(verified.payload.result.structuredContent.exactSkillSet, true);
  assert.equal(verified.payload.result.structuredContent.publicSkillCount, 5);
  assert.equal(verified.payload.result.structuredContent.files.length, 5);
  assert.match(
    verified.payload.result.structuredContent.mcpRole,
    /remote transport for MCP-compatible clients/i,
  );
  assert.equal(
    verified.payload.result.structuredContent.routePolicyVersion,
    content.routePolicyVersion,
  );
  assert.equal(
    verified.payload.result.structuredContent.routerRulesDigest,
    content.routerRulesDigest,
  );
});

test("automatic router uses focused vocabulary, bilingual terms, and negation", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const cases = [
    ["founder business + engineering + evidence", "hypertaks"],
    ["verifikasi konfigurasi instalasi", "hypertaks-verify"],
    ["simpan dan ambil memori founder", "hypertaks-brain"],
    ["dependency change impact", "hypertaks-graph"],
    ["checkpoint + proof-of-done", "hypertaks-continuity"],
    ["jangan route ke verify", "hypertaks"],
    ["do not route to verify even if setup looks relevant", "hypertaks"],
    ["bukan konfigurasi, ini strategi founder", "hypertaks"],
    ["tidak perlu memory, lanjut engineering plan", "hypertaks"],
    ["install setup configuration checksum runtime verification", "hypertaks-verify"],
    ["save retrieve correct durable memory", "hypertaks-brain"],
    ["callers imports blast radius", "hypertaks-graph"],
    ["resume handoff reconcile", "hypertaks-continuity"],
    ["audit validate decision context status impact permission evidence", "hypertaks"],
    ["ambiguous multi-domain strategy request", "hypertaks"],
    ["Create a founder strategy covering business and engineering.", "hypertaks"],
    ["Verifikasi konfigurasi dan instalasi Hypertaks.", "hypertaks-verify"],
    ["Simpan dan ambil memori founder ini.", "hypertaks-brain"],
    ["Analyze dependency change impact and blast radius.", "hypertaks-graph"],
    ["Create a checkpoint, handoff, and proof-of-done.", "hypertaks-continuity"],
    ["Jangan route ke verify. Ini strategi founder.", "hypertaks"],
    ["Founder strategy with checkpoint and proof-of-done across business and engineering.", "hypertaks"],
    ["Scan-only Hypertaks installation verification.", "hypertaks-verify"],
    ["Build an MCP host that launches five servers.", "hypertaks"],
    ["Configure a new MCP server.", "hypertaks"],
    ["Verify the deployed Hypertaks MCP adapter.", "hypertaks-verify"],
    ["Install Python dependencies for the application.", "hypertaks"],
    ["Repair the Hypertaks memory pointer configuration.", "hypertaks-verify"],
    ["Inspect founder memory records.", "hypertaks-brain"],
    ["Fix a Node.js memory leak.", "hypertaks"],
    ["Store this approved product decision.", "hypertaks-brain"],
    ["Import customer records from CSV.", "hypertaks"],
    ["Trace module imports and dependency blast radius.", "hypertaks-graph"],
    ["Create a graph chart of monthly revenue.", "hypertaks"],
    ["Check graph freshness against the current commit.", "hypertaks-graph"],
    ["Create a checkpoint for the API implementation.", "hypertaks-continuity"],
    ["Design the API implementation with checkpoint requirements.", "hypertaks"],
    ["Verify proof-of-done evidence.", "hypertaks-continuity"],
    ["Founder strategy with dependency analysis and a project checkpoint.", "hypertaks"],
    ["Do not save memory. Analyze the founder plan.", "hypertaks"],
    ["Use hypertaks-brain to inspect the current memory target.", "hypertaks-brain"],
    ["Verify installation without writing files.", "hypertaks-verify"],
    ["Do not verify the installation. Create a founder plan instead.", "hypertaks"],
  ];

  const compiledRouter = require(path.join(root, ".build", "runtime", "public-skill-router.js"));
  assert.equal(compiledRouter.PUBLIC_SKILL_ROUTER_MODULE, "public-skill-router");
  assert.equal(compiledRouter.PUBLIC_SKILLS.length, 5);

  for (const [request, expected] of cases) {
    const routed = await route(server.baseUrl, request);
    const unit = compiledRouter.routePublicSkill(request);
    assert.equal(routed.skill, expected, `request=${request}`);
    assert.equal(unit.skill, expected, `unit request=${request}`);
    assert.equal(routed.skill, unit.skill, `mcp/unit skill parity request=${request}`);
    assert.equal(routed.reason, unit.reason, `mcp/unit reason parity request=${request}`);
    assert.equal(routed.mutationPerformed, false);
    assert.equal(routed.approvalRequiredForExternalMutation, true);
  }

  const preferred = await route(
    server.baseUrl,
    "install setup configuration checksum",
    "hypertaks-continuity",
  );
  const preferredUnit = compiledRouter.routePublicSkill(
    "install setup configuration checksum",
    "hypertaks-continuity",
  );
  assert.equal(preferred.skill, "hypertaks-continuity");
  assert.equal(preferred.skill, preferredUnit.skill);
  assert.equal(preferred.reason, preferredUnit.reason);
  assert.match(preferred.reason, /override|preferred|explicit/i);

  const invalidPreferred = await route(
    server.baseUrl,
    "install setup configuration checksum",
    "hypertaks-sixth",
  );
  const invalidPreferredUnit = compiledRouter.routePublicSkill(
    "install setup configuration checksum",
    "hypertaks-sixth",
  );
  assert.equal(invalidPreferred.skill, "hypertaks-verify");
  assert.equal(invalidPreferred.skill, invalidPreferredUnit.skill);
  assert.equal(invalidPreferred.reason, invalidPreferredUnit.reason);
});

test("token-safe route diagnostics default to none and expose identity only when requested", async (t) => {
  const secret = "test-secret-should-never-appear";
  const server = await startServer({
    HYPERTAKS_MCP_BEARER_TOKEN: secret,
  });
  t.after(() => server.stop());

  async function authedRoute(request, preferredSkill, diagnostics) {
    const arguments_ = { request };
    if (preferredSkill !== undefined) arguments_.preferredSkill = preferredSkill;
    if (diagnostics !== undefined) arguments_.diagnostics = diagnostics;
    const routed = await rpc(
      server.baseUrl,
      {
        jsonrpc: "2.0",
        id: `route-${Math.random().toString(16).slice(2)}`,
        method: "tools/call",
        params: { name: "hypertaks_route", arguments: arguments_ },
      },
      { authorization: `Bearer ${secret}` },
    );
    assert.equal(routed.response.status, 200);
    assert.equal(routed.payload.result.isError, false);
    return routed.payload.result.structuredContent;
  }

  async function authedCall(name, args = {}) {
    const response = await rpc(
      server.baseUrl,
      {
        jsonrpc: "2.0",
        id: `tool-${Math.random().toString(16).slice(2)}`,
        method: "tools/call",
        params: { name, arguments: args },
      },
      { authorization: `Bearer ${secret}` },
    );
    assert.equal(response.response.status, 200);
    assert.equal(response.payload.result.isError, false);
    return response.payload.result.structuredContent;
  }

  const request = "Jangan route ke verify. Ini strategi founder.";
  const compiledRouter = require(path.join(root, ".build", "runtime", "public-skill-router.js"));

  const defaultRoute = await authedRoute(request);
  assert.equal(defaultRoute.skill, "hypertaks");
  assert.equal(defaultRoute.mutationPerformed, false);
  assert.equal(Object.prototype.hasOwnProperty.call(defaultRoute, "routerRulesDigest"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(defaultRoute, "matchedSignals"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(defaultRoute, "primaryIntent"), false);

  const compact = await authedRoute(request, undefined, "compact");
  assert.equal(compact.skill, "hypertaks");
  assert.equal(compact.primaryIntent, "founder_strategy");
  assert.ok(
    compact.suppressedSkills.some(
      (item) => item.skill === "hypertaks-verify" && item.reason === "explicit_negation",
    ),
  );
  assert.equal(Object.prototype.hasOwnProperty.call(compact, "routerRulesDigest"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(compact, "matchedSignals"), false);

  const fullA = await authedRoute(request, undefined, "full");
  const fullB = await authedRoute(request, undefined, "full");
  assert.deepEqual(fullA, fullB);
  assert.equal(fullA.primaryIntent, "founder_strategy");
  assert.ok(Array.isArray(fullA.matchedSignals));
  assert.ok(Array.isArray(fullA.secondaryIntents));
  assert.match(fullA.routerRulesDigest, /^[a-f0-9]{64}$/);
  assert.equal(fullA.routerRulesDigest, compiledRouter.getRouterRulesDigest());

  const founderCheckpoint = await authedRoute(
    "Founder strategy with checkpoint and proof-of-done across business and engineering.",
    undefined,
    "compact",
  );
  assert.equal(founderCheckpoint.skill, "hypertaks");
  assert.equal(founderCheckpoint.primaryIntent, "founder_strategy");

  const manifest = await authedCall("hypertaks_manifest");
  const verified = await authedCall("hypertaks_verify_installation");
  assert.equal(manifest.routerRulesDigest, verified.routerRulesDigest);
  assert.equal(manifest.routePolicyVersion, verified.routePolicyVersion);

  const serialized = JSON.stringify({
    defaultRoute,
    compact,
    fullA,
    fullB,
    founderCheckpoint,
    manifest,
    verified,
  });
  assert.equal(serialized.includes(secret), false);
  assert.doesNotMatch(serialized, /HYPERTAKS_MCP_BEARER_TOKEN/);
});

test("canonical focused-policy definition exists only once in runtime sources", () => {
  const runtimeDir = path.join(root, "runtime");
  const sourceFiles = fs.readdirSync(runtimeDir)
    .filter((name) => /\.(ts|mjs|cjs)$/.test(name) && !name.endsWith(".test.cjs"))
    .map((name) => path.join(runtimeDir, name));
  const hits = [];
  for (const filePath of sourceFiles) {
    const text = fs.readFileSync(filePath, "utf8");
    const count = (text.match(/const FOCUSED_SKILL_RULES\b/g) || []).length;
    if (count > 0) hits.push({ file: path.basename(filePath), count });
  }
  assert.deepEqual(hits, [{ file: "public-skill-router.ts", count: 1 }]);
  assert.equal(
    fs.existsSync(path.join(root, ".build", "runtime", "public-skill-router.js")),
    true,
  );
});

test("focused route and canonical skill read work", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const routed = await route(server.baseUrl, "verifikasi konfigurasi instalasi checksum");
  assert.equal(routed.skill, "hypertaks-verify");
  assert.equal(routed.mutationPerformed, false);

  const skill = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "hypertaks_get_skill",
      arguments: { skill: "hypertaks-verify" },
    },
  });
  assert.equal(skill.payload.result.isError, false);
  assert.match(skill.payload.result.structuredContent.content, /hypertaks-verify/i);
  assert.match(skill.payload.result.structuredContent.sha256, /^[a-f0-9]{64}$/);
});

test("invalid skill, oversized body, and unauthorized origin fail closed", async (t) => {
  const server = await startServer({
    HYPERTAKS_MCP_BEARER_TOKEN: "test-secret",
    HYPERTAKS_ALLOWED_ORIGINS: "https://allowed.example",
  });
  t.after(() => server.stop());

  const badOrigin = await rpc(
    server.baseUrl,
    { jsonrpc: "2.0", id: 7, method: "ping" },
    { origin: "https://attacker.example", authorization: "Bearer test-secret" },
  );
  assert.equal(badOrigin.response.status, 403);

  const chatgptOrigin = await rpc(
    server.baseUrl,
    { jsonrpc: "2.0", id: "cgpt", method: "ping" },
    { origin: "https://chatgpt.com", authorization: "Bearer test-secret" },
  );
  assert.equal(chatgptOrigin.response.status, 403);

  const allowedOrigin = await rpc(
    server.baseUrl,
    { jsonrpc: "2.0", id: "ok-origin", method: "ping" },
    { origin: "https://allowed.example", authorization: "Bearer test-secret" },
  );
  assert.equal(allowedOrigin.response.status, 200);

  const unauthenticated = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 8,
    method: "ping",
  });
  assert.equal(unauthenticated.response.status, 401);

  const authenticated = await rpc(
    server.baseUrl,
    { jsonrpc: "2.0", id: 9, method: "ping" },
    { authorization: "Bearer test-secret" },
  );
  assert.equal(authenticated.response.status, 200);
  assert.deepEqual(authenticated.payload.result, {});

  const invalidSkill = await rpc(
    server.baseUrl,
    {
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "hypertaks_get_skill",
        arguments: { skill: "hypertaks-sixth" },
      },
    },
    { authorization: "Bearer test-secret" },
  );
  assert.equal(invalidSkill.response.status, 200);
  assert.equal(invalidSkill.payload.result.isError, true);

  const oversized = await fetch(`${server.baseUrl}/mcp`, {
    method: "POST",
    headers: {
      authorization: "Bearer test-secret",
      "content-type": "application/json",
      accept: "application/json",
    },
    body: "x".repeat(1024 * 1024 + 32),
  });
  assert.equal(oversized.status, 413);
});

test("notifications receive HTTP 202 and unsupported GET receives 405", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const notification = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  });
  assert.equal(notification.response.status, 202);
  assert.equal(notification.payload, null);

  const getResponse = await fetch(`${server.baseUrl}/mcp`, {
    headers: { accept: "text/event-stream" },
  });
  assert.equal(getResponse.status, 405);
  assert.equal(getResponse.headers.get("allow"), "POST");
});

test("25 concurrent local requests complete without error", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const jobs = Array.from({ length: 25 }, (_, index) =>
    rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: index + 100,
      method: "tools/call",
      params: {
        name: "hypertaks_route",
        arguments: { request: `founder strategy request ${index}` },
      },
    }),
  );
  const results = await Promise.all(jobs);
  for (const result of results) {
    assert.equal(result.response.status, 200);
    assert.equal(result.payload.result.isError, false);
    assert.equal(result.payload.result.structuredContent.skill, "hypertaks");
  }
});

test("A4 router regression matrix, determinism, concurrency, and tool boundary", async (t) => {
  const matrix = require(path.join(__dirname, "fixtures", "public-skill-route-matrix.cjs"));
  const compiledRouter = require(path.join(root, ".build", "runtime", "public-skill-router.js"));
  const server = await startServer();
  t.after(() => server.stop());

  // Tool boundary: exactly four read-only tools and five skills.
  const listed = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: "a4-tools",
    method: "tools/list",
    params: {},
  });
  const toolNames = listed.payload.result.tools.map((tool) => tool.name);
  assert.deepEqual(toolNames, [...matrix.MCP_TOOLS]);
  assert.equal(toolNames.length, 4);
  for (const tool of listed.payload.result.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
  }
  assert.deepEqual([...compiledRouter.PUBLIC_SKILLS], [...matrix.PUBLIC_SKILLS]);
  assert.equal(compiledRouter.PUBLIC_SKILLS.length, 5);

  // Manifest publishes machine-readable supported locales + stable identity.
  const manifest = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: "a4-manifest",
    method: "tools/call",
    params: { name: "hypertaks_manifest", arguments: {} },
  });
  const verified = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: "a4-verify",
    method: "tools/call",
    params: { name: "hypertaks_verify_installation", arguments: {} },
  });
  const manifestBody = manifest.payload.result.structuredContent;
  const verifyBody = verified.payload.result.structuredContent;
  assert.deepEqual(manifestBody.supportedLocales, [...matrix.SUPPORTED_LOCALES]);
  assert.deepEqual(verifyBody.supportedLocales, [...matrix.SUPPORTED_LOCALES]);
  assert.equal(manifestBody.routePolicyVersion, verifyBody.routePolicyVersion);
  assert.equal(manifestBody.routerRulesDigest, verifyBody.routerRulesDigest);
  assert.equal(manifestBody.routerRulesDigest, compiledRouter.getRouterRulesDigest());
  assert.equal(manifestBody.publicSkills.length, 5);

  // Full matrix through local MCP with unit parity.
  let mcpCalls = 0;
  let mcpPass = 0;
  const failures = [];
  const distribution = Object.create(null);
  for (const item of matrix.ROUTE_MATRIX) {
    const routed = await route(server.baseUrl, item.request);
    const unit = compiledRouter.routePublicSkill(item.request);
    mcpCalls += 1;
    distribution[routed.skill] = (distribution[routed.skill] || 0) + 1;
    const ok =
      routed.skill === item.expected &&
      unit.skill === item.expected &&
      routed.skill === unit.skill &&
      routed.reason === unit.reason &&
      routed.mutationPerformed === false &&
      routed.approvalRequiredForExternalMutation === true &&
      Object.prototype.hasOwnProperty.call(routed, "routerRulesDigest") === false;
    if (ok) mcpPass += 1;
    else {
      failures.push({
        id: item.id,
        request: item.request,
        expected: item.expected,
        mcp: routed.skill,
        unit: unit.skill,
      });
    }
  }

  for (const item of matrix.PREFERRED_SKILL_CASES) {
    const routed = await route(server.baseUrl, item.request, item.preferredSkill);
    const unit = compiledRouter.routePublicSkill(item.request, item.preferredSkill);
    mcpCalls += 1;
    distribution[routed.skill] = (distribution[routed.skill] || 0) + 1;
    if (routed.skill === item.expected && unit.skill === item.expected) mcpPass += 1;
    else failures.push({ id: item.id, expected: item.expected, mcp: routed.skill, unit: unit.skill });
  }

  for (const item of matrix.INVALID_PREFERRED_CASES) {
    const routed = await route(server.baseUrl, item.request, item.preferredSkill);
    const unit = compiledRouter.routePublicSkill(item.request, item.preferredSkill);
    mcpCalls += 1;
    distribution[routed.skill] = (distribution[routed.skill] || 0) + 1;
    if (routed.skill === item.expected && unit.skill === item.expected) mcpPass += 1;
    else failures.push({ id: item.id, expected: item.expected, mcp: routed.skill, unit: unit.skill });
  }

  assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 5)));
  assert.equal(mcpPass, mcpCalls);

  // Determinism: five identical full diagnostics responses per sample.
  const sample = matrix.ROUTE_MATRIX.filter((item) =>
    ["negation", "en_focused", "id_focused", "exclusion", "supporting_vs_primary"].includes(
      item.category,
    ),
  ).slice(0, 12);
  for (const item of sample) {
    const responses = [];
    for (let i = 0; i < matrix.DETERMINISM_REPEATS; i += 1) {
      responses.push(await route(server.baseUrl, item.request, undefined, "full"));
      mcpCalls += 1;
    }
    for (let i = 1; i < responses.length; i += 1) {
      assert.deepEqual(responses[i], responses[0], `determinism failed for ${item.id}`);
    }
    assert.equal(responses[0].mutationPerformed, false);
    assert.equal(responses[0].routerRulesDigest, compiledRouter.getRouterRulesDigest());
  }

  // Concurrency stress: >=25 lightweight route calls, no mutation, no cross-call contamination.
  const concurrentRequests = matrix.ROUTE_MATRIX.slice(0, matrix.MCP_CONCURRENCY).map(
    (item, index) => ({
      ...item,
      index,
    }),
  );
  while (concurrentRequests.length < matrix.MCP_CONCURRENCY) {
    concurrentRequests.push({
      id: `pad-${concurrentRequests.length}`,
      request: `founder strategy request pad ${concurrentRequests.length}`,
      expected: "hypertaks",
      category: "concurrency_pad",
      index: concurrentRequests.length,
    });
  }
  const concurrentJobs = concurrentRequests.map((item) =>
    route(server.baseUrl, item.request).then((routed) => {
      mcpCalls += 1;
      return { item, routed };
    }),
  );
  const concurrentResults = await Promise.all(concurrentJobs);
  for (const { item, routed } of concurrentResults) {
    assert.equal(routed.mutationPerformed, false);
    assert.equal(routed.approvalRequiredForExternalMutation, true);
    if (item.expected) {
      assert.equal(routed.skill, item.expected, item.id || item.request);
    }
    // No diagnostics leakage in default mode.
    assert.equal(Object.prototype.hasOwnProperty.call(routed, "matchedSignals"), false);
  }

  // Locale coverage checklist for fully supported packs.
  const coverage = matrix.localeCoverageChecklist();
  assert.deepEqual(coverage.missingCategories, []);
  assert.deepEqual(coverage.supportedLocales, manifestBody.supportedLocales);

  // Persist MCP side of the A4 report summary.
  const summaryPath = path.join(root, ".hypertaks", "continuity", "HT-20260804-A4-mcp-stress-summary.json");
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(
    summaryPath,
    `${JSON.stringify(
      {
        phase: "A4-mcp",
        totalCalls: mcpCalls,
        passCount: mcpPass + concurrentResults.length + sample.length * matrix.DETERMINISM_REPEATS,
        failCount: failures.length,
        exactFailures: failures,
        routeDistribution: distribution,
        routerRulesDigest: manifestBody.routerRulesDigest,
        routePolicyVersion: manifestBody.routePolicyVersion,
        supportedLocales: manifestBody.supportedLocales,
        toolCount: toolNames.length,
        publicSkillCount: 5,
        mutationVerification: "all_false",
        concurrency: matrix.MCP_CONCURRENCY,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
