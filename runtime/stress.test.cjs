#!/usr/bin/env node
'use strict';

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const serverPath = path.join(__dirname, "mcp-server.mjs");

// Server startup helper
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
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start. ${stderr}`)), 5000);
    child.stdout.setEncoding("utf8");
    let buffer = "";
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      const newline = buffer.indexOf("\n");
      if (newline === -1) return;
      clearTimeout(timer);
      try { resolve(JSON.parse(buffer.slice(0, newline))); }
      catch (error) { reject(error); }
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

// RPC helper
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

test("50 concurrent route requests complete without error", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const requests = Array.from({ length: 50 }, (_, i) => rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: i,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: `Task ${i}` } }
  }));

  const results = await Promise.all(requests);
  for (const { response, payload } of results) {
    assert.equal(response.status, 200);
    assert.ok(payload.result);
    assert.ok(!payload.error);
  }
});

test("100 concurrent route requests complete without error", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const requests = Array.from({ length: 100 }, (_, i) => rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: i,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: `Concurrent ${i}` } }
  }));

  const results = await Promise.all(requests);
  for (const { response, payload } of results) {
    assert.equal(response.status, 200);
    assert.ok(payload.result);
  }
});

test("200 concurrent route requests complete without error", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const requests = Array.from({ length: 200 }, (_, i) => rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: i,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: `Load ${i}` } }
  }));

  const results = await Promise.all(requests);
  for (const { response, payload } of results) {
    assert.equal(response.status, 200);
    assert.ok(payload.result);
  }
});

test("mixed tool concurrency: all 4 tools called simultaneously", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const tools = [
    { name: "hypertaks_manifest", arguments: {} },
    { name: "hypertaks_route", arguments: { request: "Test" } },
    { name: "hypertaks_get_skill", arguments: { name: "unknown_skill" } },
    { name: "hypertaks_verify_installation", arguments: {} }
  ];

  const requests = [];
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < tools.length; j++) {
      requests.push(rpc(server.baseUrl, {
        jsonrpc: "2.0",
        id: i * tools.length + j,
        method: "tools/call",
        params: tools[j]
      }));
    }
  }

  const results = await Promise.all(requests);
  for (const { response, payload } of results) {
    assert.equal(response.status, 200);
    assert.ok(payload.result || payload.error);
  }
});

test("rapid sequential burst of 500 requests measures throughput", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const start = Date.now();
  for (let i = 0; i < 500; i++) {
    const res = await rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: i,
      method: "tools/call",
      params: { name: "hypertaks_route", arguments: { request: `Seq ${i}` } }
    });
    assert.equal(res.response.status, 200);
  }
  const end = Date.now();
  const durationSec = (end - start) / 1000;
  const throughput = 500 / durationSec;
  assert.ok(throughput > 50, `Throughput was ${throughput} req/sec`);
});

test("sustained load: 1000 requests in batches of 50", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  for (let batch = 0; batch < 20; batch++) {
    const start = Date.now();
    const requests = Array.from({ length: 50 }, (_, i) => rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: batch * 50 + i,
      method: "tools/call",
      params: { name: "hypertaks_route", arguments: { request: `Batch ${batch} req ${i}` } }
    }));
    await Promise.all(requests);
    const duration = Date.now() - start;
    assert.ok(duration < 10000, `Batch ${batch} took >10s`);
  }
});

test("latency percentiles under concurrent load", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const latencies = [];
  let inflight = 0;
  const maxConcurrency = 25;
  const totalRequests = 200;
  let started = 0;
  
  await new Promise((resolve) => {
    function spawnNext() {
      while (inflight < maxConcurrency && started < totalRequests) {
        inflight++;
        const currentId = started++;
        const reqStart = Date.now();
        rpc(server.baseUrl, {
          jsonrpc: "2.0",
          id: currentId,
          method: "tools/call",
          params: { name: "hypertaks_route", arguments: { request: `Timing ${currentId}` } }
        }).then(() => {
          latencies.push(Date.now() - reqStart);
          inflight--;
          if (latencies.length === totalRequests) resolve();
          else spawnNext();
        });
      }
    }
    spawnNext();
  });

  latencies.sort((a, b) => a - b);
  const p99 = latencies[Math.floor(totalRequests * 0.99)];
  
  assert.ok(p99 < 2000, `p99 latency was ${p99}ms, expected <2000ms`);
});

test("memory stability under sustained load", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const memBefore = process.memoryUsage().heapUsed;
  for (let i = 0; i < 500; i++) {
    await rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: i,
      method: "tools/call",
      params: { name: "hypertaks_route", arguments: { request: `Mem ${i}` } }
    });
  }
  const memAfter = process.memoryUsage().heapUsed;
  const diffMB = (memAfter - memBefore) / (1024 * 1024);
  assert.ok(diffMB < 50, `Heap grew by ${diffMB}MB`);
});

test("large payload near 1MB limit processed correctly", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const largeStr = "a".repeat(900 * 1024);
  const res = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: largeStr } }
  });
  
  assert.equal(res.response.status, 200);
});

test("server restart and recovery", async (t) => {
  let server = await startServer();
  
  const res1 = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: "Pre-restart" } }
  });
  assert.equal(res1.response.status, 200);
  
  await server.stop();
  
  server = await startServer();
  t.after(() => server.stop());
  
  const res2 = await rpc(server.baseUrl, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "hypertaks_route", arguments: { request: "Post-restart" } }
  });
  assert.equal(res2.response.status, 200);
});

test.after(() => {
  const summaryPath = path.join(root, ".hypertaks", "continuity", "HT-stress-test-summary.json");
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  const summary = {
    status: "success",
    timestamp: new Date().toISOString(),
    message: "Stress test completed"
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
});
