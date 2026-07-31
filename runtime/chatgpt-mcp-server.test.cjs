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

test("health endpoint and MCP initialization are executable", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const health = await fetch(`${server.baseUrl}/healthz`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).readOnly, true);

  const initialized = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "hypertaks-test", version: "1.0.0" },
    },
  });
  assert.equal(initialized.response.status, 200);
  assert.equal(initialized.payload.result.protocolVersion, "2025-06-18");
  assert.equal(initialized.payload.result.serverInfo.name, "hypertaks-chatgpt-adapter");
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
  assert.equal(manifest.payload.result.structuredContent.publicSkills.length, 5);
  assert.equal(manifest.payload.result.structuredContent.writeCapability, "not exposed by this adapter");

  const verified = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "hypertaks_verify_installation", arguments: {} },
  });
  assert.equal(verified.payload.result.structuredContent.exactSkillSet, true);
  assert.equal(verified.payload.result.structuredContent.publicSkillCount, 5);
  assert.equal(verified.payload.result.structuredContent.files.length, 5);
});

test("focused route and canonical skill read work", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const routed = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "hypertaks_route",
      arguments: { request: "Audit the evidence and verify this release." },
    },
  });
  assert.equal(routed.payload.result.structuredContent.skill, "hypertaks-verify");
  assert.equal(routed.payload.result.structuredContent.mutationPerformed, false);

  const skill = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "hypertaks_get_skill",
      arguments: { skill: "hypertaks-verify" },
    },
  });
  assert.match(skill.payload.result.structuredContent.content, /hypertaks-verify/i);
  assert.match(skill.payload.result.structuredContent.sha256, /^[a-f0-9]{64}$/);
});

test("invalid origin and missing configured bearer token fail closed", async (t) => {
  const server = await startServer({ HYPERTAKS_MCP_BEARER_TOKEN: "test-secret" });
  t.after(() => server.stop());

  const badOrigin = await rpc(
    server.baseUrl,
    { jsonrpc: "2.0", id: 7, method: "ping" },
    { origin: "https://attacker.example", authorization: "Bearer test-secret" },
  );
  assert.equal(badOrigin.response.status, 403);

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
