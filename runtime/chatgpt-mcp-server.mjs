#!/usr/bin/env node

import { createHash, timingSafeEqual } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import canonicalPublicSkillRouter from "../.build/runtime/public-skill-router.js";

const PRODUCT_NAME = "Hypertaks";
const PRODUCT_VERSION = "4.5.2";
const SERVER_NAME = "hypertaks-mcp-adapter";
const SERVER_TITLE = "Hypertaks MCP Adapter";
const SERVER_DESCRIPTION =
  "Read-only remote MCP transport for the five canonical Hypertaks skills.";
const MCP_ROLE = "remote transport for MCP-compatible clients";
const MCP_COMPATIBILITY =
  "Compatible with AI agents and clients that support standard MCP Streamable HTTP.";
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
]);
const MAX_BODY_BYTES = 1024 * 1024;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8787;

const __filename = fileURLToPath(import.meta.url);
const RUNTIME_DIR = path.dirname(__filename);
const REPOSITORY_ROOT = path.resolve(RUNTIME_DIR, "..");
const SKILLS_ROOT = path.join(REPOSITORY_ROOT, "skills");
const LOGO_PATH = path.join(REPOSITORY_ROOT, "assets", "Hypertask.svg");

const {
  PUBLIC_SKILLS: CANONICAL_PUBLIC_SKILLS,
  routePublicSkill,
  diagnosePublicSkillRoute,
  presentRouteDiagnostics,
  parseDiagnosticsLevel,
  getRouterRuntimeIdentity,
  getRouterRulesDigest,
  ROUTE_POLICY_VERSION,
  PUBLIC_SKILL_ROUTER_MODULE,
} = canonicalPublicSkillRouter;

if (
  !Array.isArray(CANONICAL_PUBLIC_SKILLS) ||
  typeof routePublicSkill !== "function" ||
  typeof diagnosePublicSkillRoute !== "function" ||
  typeof presentRouteDiagnostics !== "function" ||
  typeof getRouterRuntimeIdentity !== "function" ||
  PUBLIC_SKILL_ROUTER_MODULE !== "public-skill-router"
) {
  throw new Error(
    "Compiled public-skill router is incomplete. Rebuild with `npm run build:runtime`.",
  );
}
const PUBLIC_SKILLS = Object.freeze([...CANONICAL_PUBLIC_SKILLS]);

const host = process.env.HYPERTAKS_MCP_HOST?.trim() || DEFAULT_HOST;
const port = parsePort(process.env.HYPERTAKS_MCP_PORT);
const bearerToken = process.env.HYPERTAKS_MCP_BEARER_TOKEN?.trim() || "";
const allowInsecureRemote = process.env.HYPERTAKS_ALLOW_INSECURE_REMOTE === "1";
const configuredOrigins = parseConfiguredOrigins(
  process.env.HYPERTAKS_ALLOWED_ORIGINS,
);

if (!isLoopbackHost(host) && !bearerToken && !allowInsecureRemote) {
  throw new Error(
    "Refusing to bind a remote interface without HYPERTAKS_MCP_BEARER_TOKEN. " +
      "Set HYPERTAKS_ALLOW_INSECURE_REMOTE=1 only inside an isolated test network.",
  );
}

const TOOLS = Object.freeze([
  {
    name: "hypertaks_manifest",
    title: "Read Hypertaks Manifest",
    description:
      "Return the Hypertaks product boundary, version, canonical public skill list, and remote MCP adapter limitations.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: readOnlyAnnotations(),
  },
  {
    name: "hypertaks_get_skill",
    title: "Read a Hypertaks Skill",
    description:
      "Read one canonical Hypertaks SKILL.md file by its exact public skill name.",
    inputSchema: {
      type: "object",
      properties: {
        skill: {
          type: "string",
          enum: PUBLIC_SKILLS,
          description: "Exact canonical Hypertaks public skill name.",
        },
      },
      required: ["skill"],
      additionalProperties: false,
    },
    annotations: readOnlyAnnotations(),
  },
  {
    name: "hypertaks_route",
    title: "Route a Hypertaks Request",
    description:
      "Select the smallest canonical Hypertaks skill entry point for a request. This tool only routes and does not mutate files or external systems.",
    inputSchema: {
      type: "object",
      properties: {
        request: {
          type: "string",
          minLength: 1,
          maxLength: 12000,
          description: "The user's task or requested Hypertaks command.",
        },
        preferredSkill: {
          type: "string",
          enum: PUBLIC_SKILLS,
          description: "Optional explicit skill override supplied by the user.",
        },
        diagnostics: {
          type: "string",
          enum: ["none", "compact", "full"],
          description:
            "Optional route diagnostics level. Default none returns the smallest backward-compatible response. compact adds primaryIntent and locale fields. full adds matchedSignals, secondaryIntents, and routerRulesDigest.",
        },
      },
      required: ["request"],
      additionalProperties: false,
    },
    annotations: readOnlyAnnotations(),
  },
  {
    name: "hypertaks_verify_installation",
    title: "Verify Hypertaks Runtime Files",
    description:
      "Verify the exact five canonical skill entry files and canonical SVG present in this server checkout, including SHA-256 evidence.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: readOnlyAnnotations(),
  },
]);

function parsePort(value) {
  if (value === undefined || value.trim() === "") return DEFAULT_PORT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65535) {
    throw new Error("HYPERTAKS_MCP_PORT must be an integer from 0 through 65535.");
  }
  return parsed;
}

function parseConfiguredOrigins(value) {
  if (!value?.trim()) return new Set();
  const origins = new Set();
  for (const raw of value.split(",")) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const parsed = new URL(trimmed);
    origins.add(parsed.origin);
  }
  return origins;
}

function isLoopbackHost(value) {
  return value === "127.0.0.1" || value === "localhost" || value === "::1";
}

function readOnlyAnnotations() {
  return {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (configuredOrigins.has(parsed.origin)) return true;
  if (parsed.protocol === "http:" && isLoopbackHost(parsed.hostname)) return true;
  return false;
}

function tokenMatches(headerValue) {
  if (!bearerToken) return true;
  if (!headerValue?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(headerValue.slice(7), "utf8");
  const expected = Buffer.from(bearerToken, "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id: id ?? null, error };
}

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    ...headers,
  });
  response.end(body);
}

function sendEmpty(response, statusCode, headers = {}) {
  response.writeHead(statusCode, { "cache-control": "no-store", ...headers });
  response.end();
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body exceeds 1 MiB.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) throw new SyntaxError("Request body is empty.");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateProtocolHeader(request) {
  const protocolVersion = request.headers["mcp-protocol-version"];
  if (!protocolVersion) return true;
  return SUPPORTED_PROTOCOL_VERSIONS.has(String(protocolVersion));
}

function negotiateProtocolVersion(requested) {
  if (typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.has(requested)) {
    return requested;
  }
  return DEFAULT_PROTOCOL_VERSION;
}

function routeRequest(requestText, preferredSkill, diagnosticsLevel = "none") {
  // Narrow wrapper: all policy lives in the canonical public-skill router.
  const diagnosed = diagnosePublicSkillRoute(requestText, preferredSkill);
  return presentRouteDiagnostics(diagnosed, diagnosticsLevel);
}

function runtimeIdentityFields() {
  const identity = getRouterRuntimeIdentity();
  return {
    routePolicyVersion: identity.routePolicyVersion,
    routerRulesDigest: identity.routerRulesDigest,
    buildRevision: identity.buildRevision,
    buildTimestamp: identity.buildTimestamp,
    supportedLocales: identity.supportedLocales,
  };
}

function buildPublicManifest() {
  const identity = runtimeIdentityFields();
  return {
    schema: "hypertaks.public-manifest.v1",
    product: PRODUCT_NAME,
    version: PRODUCT_VERSION,
    releaseTag: `v${PRODUCT_VERSION}`,
    releaseUrl: `https://github.com/aabrur/hypertaks-agent/releases/tag/v${PRODUCT_VERSION}`,
    repositoryUrl: "https://github.com/aabrur/hypertaks-agent",
    architecture: "plugin-plus-five-canonical-skills",
    positioning: "Founder Operating System for AI agents",
    publicSkills: [...PUBLIC_SKILLS],
    skillCommands: PUBLIC_SKILLS.map((skill) => `/${skill}`),
    mcp: {
      role: MCP_ROLE,
      compatibility: MCP_COMPATIBILITY,
      transport: "streamable-http",
      readOnly: true,
      writeCapability: "not exposed by this adapter",
      limitation:
        "This remote MCP adapter cannot access or mutate a user's local repository. Use a coding-agent host or separately authorized connector for file changes.",
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        readOnly: true,
      })),
      endpoints: {
        mcp: "/mcp",
        healthz: "/healthz",
        manifest: "/manifest",
      },
    },
    packageStatus: {
      publicProduct: "Five canonical Hypertaks skills",
      remoteMcpSurface: "Four read-only tools; no mutating remote tool is exposed",
      founderRuntime: "Existing runtime behavior with synchronized release metadata",
      expansionLab: "Non-production research, prototypes, fixtures, and evidence",
      behavioralCertification:
        "Documented host routes are compatibility records, not universal live host certification",
    },
    documentedHostRoutes: 22,
    license: "MIT",
    website: {
      preferredHealthUrl: "https://hypertaks.crimsonriftstudio.com/healthz",
      preferredManifestUrl: "https://hypertaks.crimsonriftstudio.com/manifest",
      preferredMcpUrl: "https://hypertaks.crimsonriftstudio.com/mcp",
    },
    ...identity,
  };
}

async function sha256File(filePath) {
  const data = await readFile(filePath);
  return {
    sha256: createHash("sha256").update(data).digest("hex"),
    bytes: data.length,
  };
}

async function verifyInstallation() {
  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  const discovered = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("hypertaks"))
    .map((entry) => entry.name)
    .sort();
  const expected = [...PUBLIC_SKILLS].sort();
  const files = [];
  for (const skill of PUBLIC_SKILLS) {
    const skillPath = path.join(SKILLS_ROOT, skill, "SKILL.md");
    const metadata = await stat(skillPath);
    if (!metadata.isFile()) throw new Error(`${skillPath} is not a regular file.`);
    files.push({ skill, path: path.relative(REPOSITORY_ROOT, skillPath), ...(await sha256File(skillPath)) });
  }
  const logo = await sha256File(LOGO_PATH);
  const exactSkillSet = JSON.stringify(discovered) === JSON.stringify(expected);
  return {
    product: PRODUCT_NAME,
    version: PRODUCT_VERSION,
    exactSkillSet,
    expectedSkills: expected,
    discoveredSkills: discovered,
    publicSkillCount: discovered.length,
    files,
    logo: { path: path.relative(REPOSITORY_ROOT, LOGO_PATH), ...logo },
    mcpRole: MCP_ROLE,
    ...runtimeIdentityFields(),
  };
}

function toolSuccess(structuredContent, text) {
  return {
    content: [{ type: "text", text }],
    structuredContent,
    isError: false,
  };
}

function toolFailure(message) {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: { error: message },
    isError: true,
  };
}

async function callTool(name, args) {
  if (name === "hypertaks_manifest") {
    const publicManifest = buildPublicManifest();
    const manifest = {
      product: publicManifest.product,
      version: publicManifest.version,
      architecture: publicManifest.architecture,
      publicSkills: publicManifest.publicSkills,
      mcpRole: publicManifest.mcp.role,
      compatibility: publicManifest.mcp.compatibility,
      capabilities: ["manifest", "skill-read", "request-routing", "installation-verification"],
      writeCapability: publicManifest.mcp.writeCapability,
      limitation: publicManifest.mcp.limitation,
      routePolicyVersion: publicManifest.routePolicyVersion,
      routerRulesDigest: publicManifest.routerRulesDigest,
      buildRevision: publicManifest.buildRevision,
      buildTimestamp: publicManifest.buildTimestamp,
      supportedLocales: publicManifest.supportedLocales,
    };
    return toolSuccess(manifest, JSON.stringify(manifest, null, 2));
  }

  if (name === "hypertaks_get_skill") {
    const skill = args?.skill;
    if (!PUBLIC_SKILLS.includes(skill)) {
      return toolFailure("skill must be one of the five canonical Hypertaks public skills.");
    }
    const filePath = path.join(SKILLS_ROOT, skill, "SKILL.md");
    const content = await readFile(filePath, "utf8");
    const digest = createHash("sha256").update(content).digest("hex");
    const result = { skill, path: path.relative(REPOSITORY_ROOT, filePath), sha256: digest, content };
    return toolSuccess(result, `Loaded ${skill} from the canonical repository skill file.`);
  }

  if (name === "hypertaks_route") {
    if (typeof args?.request !== "string" || args.request.trim() === "") {
      return toolFailure("request must be a non-empty string.");
    }
    if (args.request.length > 12000) return toolFailure("request exceeds 12000 characters.");
    let diagnosticsLevel;
    try {
      diagnosticsLevel = parseDiagnosticsLevel(args?.diagnostics);
    } catch (error) {
      return toolFailure(error instanceof Error ? error.message : String(error));
    }
    const result = routeRequest(args.request, args.preferredSkill, diagnosticsLevel);
    return toolSuccess(result, `Route the request through ${result.skill}. ${result.reason}`);
  }

  if (name === "hypertaks_verify_installation") {
    const result = await verifyInstallation();
    return toolSuccess(
      result,
      result.exactSkillSet
        ? "Hypertaks runtime verification passed with exactly five canonical public skills."
        : "Hypertaks runtime verification found an unexpected public skill set.",
    );
  }

  throw Object.assign(new Error(`Unknown tool: ${name}`), { rpcCode: -32601 });
}

async function handleRpc(message) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return jsonRpcError(null, -32600, "Invalid Request");
  }
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return jsonRpcError(message.id, -32600, "Invalid Request");
  }

  const hasId = Object.prototype.hasOwnProperty.call(message, "id");
  if (!hasId) return null;
  if (message.id === null || !["string", "number"].includes(typeof message.id)) {
    return jsonRpcError(null, -32600, "Request id must be a string or number.");
  }

  if (message.method === "initialize") {
    return jsonRpcResult(message.id, {
      protocolVersion: negotiateProtocolVersion(message.params?.protocolVersion),
      capabilities: { tools: { listChanged: false } },
      serverInfo: {
        name: SERVER_NAME,
        title: SERVER_TITLE,
        version: PRODUCT_VERSION,
        description: SERVER_DESCRIPTION,
      },
      instructions:
        "Use hypertaks_route first for ambiguous requests, then hypertaks_get_skill. Do not claim local filesystem mutation from this remote adapter.",
    });
  }

  if (message.method === "ping") return jsonRpcResult(message.id, {});
  if (message.method === "tools/list") return jsonRpcResult(message.id, { tools: TOOLS });
  if (message.method === "tools/call") {
    const name = message.params?.name;
    if (typeof name !== "string") {
      return jsonRpcError(message.id, -32602, "tools/call requires params.name.");
    }
    try {
      return jsonRpcResult(message.id, await callTool(name, message.params?.arguments ?? {}));
    } catch (error) {
      if (error?.rpcCode) return jsonRpcError(message.id, error.rpcCode, error.message);
      return jsonRpcResult(message.id, toolFailure("Tool execution failed without changing external state."));
    }
  }
  return jsonRpcError(message.id, -32601, `Method not found: ${message.method}`);
}

function normalizePathname(pathname) {
  if (pathname === "/api/mcp") return "/mcp";
  if (pathname === "/api/healthz") return "/healthz";
  if (pathname === "/api/manifest") return "/manifest";
  return pathname;
}

export async function requestListener(request, response) {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = normalizePathname(requestUrl.pathname);

  if (pathname === "/healthz") {
    return sendJson(response, 200, {
      status: "ok",
      name: SERVER_NAME,
      version: PRODUCT_VERSION,
      endpoint: "/mcp",
      manifestEndpoint: "/manifest",
      readOnly: true,
    });
  }

  if (pathname === "/manifest") {
    if (request.method === "OPTIONS") {
      return sendEmpty(response, 204, {
        allow: "GET, HEAD, OPTIONS",
        "access-control-allow-methods": "GET, HEAD, OPTIONS",
        "access-control-allow-headers": "content-type, accept",
        "access-control-allow-origin": "*",
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return sendEmpty(response, 405, { allow: "GET, HEAD, OPTIONS" });
    }
    return sendJson(
      response,
      200,
      buildPublicManifest(),
      {
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=60",
      },
    );
  }

  if (pathname === "/") {
    return sendJson(response, 200, {
      name: SERVER_NAME,
      version: PRODUCT_VERSION,
      mcpEndpoint: "/mcp",
      healthEndpoint: "/healthz",
      manifestEndpoint: "/manifest",
    });
  }

  if (pathname !== "/mcp") {
    return sendJson(response, 404, { error: "Not found" });
  }

  const origin = request.headers.origin;
  if (!isAllowedOrigin(origin)) {
    return sendJson(response, 403, jsonRpcError(null, -32000, "Origin not allowed."));
  }

  if (!tokenMatches(request.headers.authorization)) {
    return sendJson(
      response,
      401,
      jsonRpcError(null, -32001, "Authentication required."),
      { "www-authenticate": "Bearer" },
    );
  }

  if (request.method === "OPTIONS") {
    const headers = {
      allow: "POST, GET, DELETE, OPTIONS",
      "access-control-allow-methods": "POST, GET, DELETE, OPTIONS",
      "access-control-allow-headers": "authorization, content-type, mcp-protocol-version",
    };
    if (origin && isAllowedOrigin(origin)) headers["access-control-allow-origin"] = origin;
    return sendEmpty(response, 204, headers);
  }

  if (request.method === "GET" || request.method === "DELETE") {
    return sendEmpty(response, 405, { allow: "POST" });
  }

  if (request.method !== "POST") {
    return sendEmpty(response, 405, { allow: "POST" });
  }

  if (!validateProtocolHeader(request)) {
    return sendJson(response, 400, jsonRpcError(null, -32600, "Unsupported MCP protocol version."));
  }

  try {
    const message = await readJsonBody(request);
    const rpcResponse = await handleRpc(message);
    if (rpcResponse === null) return sendEmpty(response, 202);
    return sendJson(response, 200, rpcResponse);
  } catch (error) {
    const statusCode = error?.statusCode || (error instanceof SyntaxError ? 400 : 500);
    const code = error instanceof SyntaxError ? -32700 : -32603;
    return sendJson(response, statusCode, jsonRpcError(null, code, error.message || "Internal error"));
  }
}

function isDirectExecution() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === __filename;
}

function startStandaloneServer() {
  const server = createServer(requestListener);

  server.on("clientError", (_error, socket) => {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
  });

  server.listen(port, host, () => {
    const address = server.address();
    const listeningPort = typeof address === "object" && address ? address.port : port;
    process.stdout.write(
      JSON.stringify({
        event: "ready",
        name: SERVER_NAME,
        version: PRODUCT_VERSION,
        host,
        port: listeningPort,
        mcpUrl: `http://${host}:${listeningPort}/mcp`,
        readOnly: true,
      }) + "\n",
    );
  });

  function shutdown(signal) {
    server.close((error) => {
      if (error) {
        process.stderr.write(`${signal} shutdown failed: ${error.message}\n`);
        process.exitCode = 1;
      }
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

if (isDirectExecution()) startStandaloneServer();
