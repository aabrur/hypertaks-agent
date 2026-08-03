#!/usr/bin/env node

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
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

async function route(baseUrl, request, preferredSkill) {
  const arguments_ = preferredSkill === undefined ? { request } : { request, preferredSkill };
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
  ];

  for (const [request, expected] of cases) {
    const routed = await route(server.baseUrl, request);
    assert.equal(routed.skill, expected, `request=${request}`);
    assert.equal(routed.mutationPerformed, false);
  }

  const preferred = await route(
    server.baseUrl,
    "install setup configuration checksum",
    "hypertaks-continuity",
  );
  assert.equal(preferred.skill, "hypertaks-continuity");
  assert.match(preferred.reason, /override|preferred|explicit/i);
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
