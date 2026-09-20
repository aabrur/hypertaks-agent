#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(__dirname, 'mcp-server.mjs');

const compiledPath = process.argv[2] || path.join(__dirname, '..', '.build', 'runtime', 'router.js');
let router;
try {
  router = require(path.resolve(compiledPath));
} catch (err) {
  // Fallback to public-skill-router.js if router.js doesn't exist
  router = require(path.join(__dirname, '..', '.build', 'runtime', 'public-skill-router.js'));
}

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

function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

const sampleInputs = [
  "founder business + engineering + evidence",
  "verifikasi konfigurasi instalasi",
  "simpan dan ambil memori founder",
  "dependency change impact",
  "checkpoint + proof-of-done",
  "jangan route ke verify",
  "ambiguous multi-domain strategy request"
];

async function runBenchmark() {
  const results = {};

  // 7. Memory footprint before
  const memBefore = process.memoryUsage().rss;

  // 1. Router throughput
  let start = Date.now();
  for (let i = 0; i < 10000; i++) {
    router.routePublicSkill(sampleInputs[i % sampleInputs.length]);
  }
  let duration = Date.now() - start;
  results.routerOpsPerSec = Math.round(10000 / (duration / 1000));

  // 7. Memory footprint after
  const memAfter = process.memoryUsage().rss;
  results.memoryBeforeRss = memBefore;
  results.memoryAfterRss = memAfter;
  results.memoryDeltaMb = Math.round(((memAfter - memBefore) / 1024 / 1024) * 100) / 100;

  // 2. Diagnostics throughput
  start = Date.now();
  for (let i = 0; i < 5000; i++) {
    if (router.diagnosePublicSkillRoute) {
      router.diagnosePublicSkillRoute(sampleInputs[i % sampleInputs.length]);
    } else {
      router.routePublicSkill(sampleInputs[i % sampleInputs.length], undefined, 'full');
    }
  }
  duration = Date.now() - start;
  results.diagnosticsOpsPerSec = Math.round(5000 / (duration / 1000));

  // 3. Router rules digest computation
  start = Date.now();
  for (let i = 0; i < 10000; i++) {
    router.getRouterRulesDigest();
  }
  duration = Date.now() - start;
  results.digestOpsPerSec = Math.round(10000 / (duration / 1000));

  // 4. MCP server startup time
  start = Date.now();
  const server = await startServer();
  const healthRes = await fetch(`${server.baseUrl}/healthz`);
  await healthRes.json();
  results.mcpStartupMs = Date.now() - start;

  // 5. MCP round-trip latency
  const latencies = [];
  for (let i = 0; i < 1000; i++) {
    const rpcStart = Date.now();
    await rpc(server.baseUrl, {
      jsonrpc: "2.0",
      id: `route-${i}`,
      method: "tools/call",
      params: { name: "hypertaks_route", arguments: { request: sampleInputs[i % sampleInputs.length] } }
    });
    latencies.push(Date.now() - rpcStart);
  }
  latencies.sort((a, b) => a - b);
  results.mcpLatencyP50Ms = percentile(latencies, 50);
  results.mcpLatencyP95Ms = percentile(latencies, 95);
  results.mcpLatencyP99Ms = percentile(latencies, 99);

  // 6. MCP concurrent throughput
  for (const concurrency of [25, 50, 100]) {
    const reqs = 1000;
    start = Date.now();
    for (let i = 0; i < reqs; i += concurrency) {
      const batch = [];
      const batchSize = Math.min(concurrency, reqs - i);
      for (let j = 0; j < batchSize; j++) {
        batch.push(rpc(server.baseUrl, {
          jsonrpc: "2.0",
          id: `batch-${i}-${j}`,
          method: "tools/call",
          params: { name: "hypertaks_route", arguments: { request: sampleInputs[(i + j) % sampleInputs.length] } }
        }));
      }
      await Promise.all(batch);
    }
    const conDur = Date.now() - start;
    results[`mcpThroughput${concurrency}`] = Math.round(reqs / (conDur / 1000));
  }

  // Clean up
  await server.stop();

  const outJson = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    benchmarks: results
  };

  const outDir = path.join(root, '.hypertaks', 'continuity');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'HT-benchmark-results.json'), JSON.stringify(outJson, null, 2), 'utf8');

  console.log('--- Hypertaks Benchmark Results ---');
  console.log(`Router throughput:      ${results.routerOpsPerSec.toLocaleString()} ops/sec (10,000 iterations)`);
  console.log(`Diagnostics throughput: ${results.diagnosticsOpsPerSec.toLocaleString()} ops/sec (5,000 iterations)`);
  console.log(`Digest computation:     ${results.digestOpsPerSec.toLocaleString()} ops/sec (10,000 iterations)`);
  console.log(`MCP startup time:       ${results.mcpStartupMs.toLocaleString()} ms`);
  console.log(`MCP latency (p50):      ${results.mcpLatencyP50Ms.toLocaleString()} ms`);
  console.log(`MCP latency (p95):      ${results.mcpLatencyP95Ms.toLocaleString()} ms`);
  console.log(`MCP latency (p99):      ${results.mcpLatencyP99Ms.toLocaleString()} ms`);
  console.log(`MCP throughput (c=25):  ${results.mcpThroughput25.toLocaleString()} reqs/sec`);
  console.log(`MCP throughput (c=50):  ${results.mcpThroughput50.toLocaleString()} reqs/sec`);
  console.log(`MCP throughput (c=100): ${results.mcpThroughput100.toLocaleString()} reqs/sec`);
  console.log(`Memory before RSS:      ${Math.round(results.memoryBeforeRss / 1024 / 1024).toLocaleString()} MB`);
  console.log(`Memory after RSS:       ${Math.round(results.memoryAfterRss / 1024 / 1024).toLocaleString()} MB`);
  console.log(`Memory delta:           ${results.memoryDeltaMb.toLocaleString()} MB`);
}

runBenchmark().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
