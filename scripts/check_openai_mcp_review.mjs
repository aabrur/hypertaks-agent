#!/usr/bin/env node

// Protocol evidence is separate from natural-language ChatGPT web/mobile review.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile, rename, unlink, realpath } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const submission = JSON.parse(await readFile(new URL("marketplace/openai/chatgpt-app-submission.json", root), "utf8"));
const argv = process.argv.slice(2);
const option = (name) => {
  const index = argv.indexOf(name);
  return index < 0 ? undefined : argv[index + 1];
};
let endpoint = option("--url");
let server;
if (!endpoint) {
  const { requestListener } = await import("../runtime/mcp-server.mjs");
  server = createServer(requestListener);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  endpoint = `http://127.0.0.1:${server.address().port}/mcp`;
}
const evidence = {
  runAt: new Date().toISOString(),
  endpoint,
  sourceVersion: submission.version,
  evidenceType: "direct MCP protocol checks; no ChatGPT natural-language invocation",
  chatgptWeb: "NOT VERIFIED",
  chatgptMobile: "NOT VERIFIED",
  discovery: {},
  cases: [],
};
let id = 0;
async function rpc(method, params) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
    signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, payload: await response.json() };
}
async function check(description, request, verify, expected) {
  let response;
  try {
    response = await rpc("tools/call", request);
    assert.equal(response.status, 200);
    verify(response.payload);
    evidence.cases.push({ description, expected, request, response, status: "PASS" });
  } catch (error) {
    evidence.cases.push({ description, expected, request, response, status: "FAIL", error: error.message });
  }
}
try {
  evidence.discovery.initialize = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "hypertaks-review-check", version: "1.0.0" } });
  evidence.discovery.tools = await rpc("tools/list", {});
  const tools = evidence.discovery.tools.payload.result.tools;
  assert.deepEqual(tools.map((tool) => tool.name).sort(), ["hypertaks_manifest", "hypertaks_get_skill", "hypertaks_route", "hypertaks_verify_installation"].sort());
  for (const tool of tools) {
    assert.deepEqual(tool.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
  const routeSkills = ["hypertaks", null, null, "hypertaks-continuity", "hypertaks-brain"];
  for (const [index, c] of submission.test_cases.entries()) {
    const name = c.tools_triggered;
    const args = name === "hypertaks_route" ? { request: c.user_prompt } : name === "hypertaks_get_skill" ? { skill: "hypertaks-verify" } : {};
    await check(`positive-${index + 1}: ${c.description}`, { name, arguments: args }, (payload) => {
      assert.equal(payload.result.isError, false);
      const result = payload.result.structuredContent;
      if (name === "hypertaks_route") {
        assert.equal(result.skill, routeSkills[index]);
        assert.equal(result.nextTool, "hypertaks_get_skill");
        assert.equal(result.mutationPerformed, false);
      } else if (name === "hypertaks_get_skill") {
        assert.equal(result.skill, "hypertaks-verify");
        assert.match(result.sha256, /^[a-f0-9]{64}$/);
        assert.match(result.content, /##/);
        // A host consuming text alone must receive the skill, not just "Loaded".
        assert.match(payload.result.content[0].text, /##/);
      } else {
        assert.equal(result.exactSkillSet, true);
        assert.equal(result.publicSkillCount, 5);
        assert.equal(result.version, submission.version);
        assert.equal(result.files.length, 5);
        for (const file of [...result.files, result.logo]) assert.match(file.sha256, /^[a-f0-9]{64}$/);
      }
    }, c.expected_output);
  }
  const negatives = [
    { name: "hypertaks_delete_database", arguments: {} },
    { name: "hypertaks_execute_shell", arguments: {} },
    { name: "hypertaks_get_skill", arguments: { skill: "hypertaks-unknown-skill" } },
  ];
  for (const [index, request] of negatives.entries()) {
    const c = submission.negative_test_cases[index];
    await check(`negative-${index + 1}: ${c.description}`, request, (payload) => {
      if (index < 2) assert.equal(payload.error.code, -32601);
      else assert.equal(payload.result.isError, true);
    }, `${c.expected_output} This probe checks the protocol boundary only.`);
  }
  evidence.summary = { passed: evidence.cases.filter((c) => c.status === "PASS").length, failed: evidence.cases.filter((c) => c.status === "FAIL").length };
} catch (error) {
  evidence.discoveryFailure = error.message;
  process.exitCode = 1;
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  const output = option("--output");
  if (output) {
    const approvedRoot = path.resolve(fileURLToPath(root), ".build/openai-remediation");
    const target = fileURLToPath(new URL(output, root));
    assert.equal(path.dirname(target), approvedRoot, "Evidence output must stay in .build/openai-remediation");
    assert.equal(await realpath(approvedRoot), approvedRoot, "Evidence parent must not redirect through a symlink");
    const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
    assert.doesNotMatch(serialized, /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._~+/=-]{20,})\b|-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/i, "Secret-like evidence must not be persisted");
    const temporary = path.join(approvedRoot, `${path.basename(target)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, serialized, { mode: 0o600, flag: "wx" });
      assert.equal(await realpath(approvedRoot), approvedRoot);
      await rename(temporary, target);
    } finally {
      await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; });
    }
  }
  console.log(JSON.stringify({ endpoint, summary: evidence.summary, discoveryFailure: evidence.discoveryFailure, chatgptWeb: evidence.chatgptWeb, chatgptMobile: evidence.chatgptMobile }, null, 2));
  if (evidence.summary?.failed) process.exitCode = 1;
}
