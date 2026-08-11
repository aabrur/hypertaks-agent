/**
 * Command Code internal Tool Registry and native-tool facade prototype.
 * Contract: HT-20260811-FOS  |  Ticket #7
 *
 * Self-contained. Depends only on the Node.js standard library so it runs in any
 * isolated worktree with `node` (verified v24.15.0). It deliberately does NOT
 * import the compiled runtime, so findings are grounded in this prototype's own
 * deterministic fakes rather than in drifted build artifacts.
 *
 * Canonical evidence this design mirrors:
 *  - runtime/chatgpt-mcp-server.mjs  -> the FOUR read-only remote MCP tools
 *  - runtime/public-skill-router.ts  -> PUBLIC_SKILLS, deterministic resolution
 *  - runtime/founder-brain.ts        -> BossApprovalProof/approvalRegistry,
 *                                       ToolEvidence.capabilityId, secret scanning,
 *                                       atomic writes, path containment,
 *                                       queryGraphifyOrFallback/directSearch fallback
 *  - skills/hypertaks/SKILL.md       -> PREPARE/PREVIEW/T1 APPROVAL/COMMIT ONCE/RECONCILE
 */

import { writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// 1. Effect taxonomy and deny-by-default permission mapping
// ---------------------------------------------------------------------------

/**
 * Side effects are classified by effect, never by product name.
 * This is the deny-by-default mapping the roadmap and security kernel require.
 */
export const SideEffect = {
  NONE: "none",            // read-only, no observable state change
  LOCAL_READ: "local_read", // local stat/read only
  LOCAL_WRITE: "local_write",
  REMOTE_WRITE: "remote_write",
  NETWORK: "network",
  SHELL: "shell",
  EXEC: "exec",
  SPEND: "spend",
  PUBLISH: "publish",
  DELETE: "delete",
  ONCHAIN: "onchain",
};

/** Permission token required to satisfy a given effect. */
function permissionFor(effect) {
  switch (effect) {
    case SideEffect.NONE:
    case SideEffect.LOCAL_READ:
      return "PERM_NONE";
    case SideEffect.LOCAL_WRITE:
      return "PERM_FILE_WRITE";
    // Everything beyond read/local-write is denied unless an explicit,
    // per-action T1 approval grants it. Deny by default.
    default:
      return "PERM_DENY";
  }
}

/** Approval rule derived from effect. Spend/publish/delete/onchain need T1 per action. */
function approvalRuleFor(effect) {
  switch (effect) {
    case SideEffect.NONE:
    case SideEffect.LOCAL_READ:
      return "none";
    case SideEffect.LOCAL_WRITE:
      return "t1_required";
    default:
      return "t1_per_action";
  }
}

// ---------------------------------------------------------------------------
// 2. Secret scanning and redaction (mirrors runtime/founder-brain.ts)
// ---------------------------------------------------------------------------

/**
 * Secret patterns are matched by shape, never by value. We record the matched
 * pattern source (a handle) and redact the value from any persisted or
 * returned transcript.
 */
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/gi,
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/g,
  /(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["']?[^\s"']{12,}/gi,
  /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@/gi,
];

export function findSecrets(value) {
  const findings = [];
  const text = typeof value === "string" ? value : JSON.stringify(value);
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) findings.push(pattern.source);
  }
  return findings;
}

export function redactSecrets(value) {
  let result = typeof value === "string" ? value : JSON.stringify(value);
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[REDACTED_SECRET]");
  }
  return result;
}

/**
 * Synthetic credential shape used ONLY to exercise redaction. It is derived from
 * a fixed handle ("prototype-fixture") via SHA-256, so no real or literal
 * secret value is ever stored in source. It is non-functional and never sent
 * anywhere. The redaction pipeline treats it purely by pattern shape.
 */
export function syntheticSecret() {
  return "sk-synth-" + createHash("sha256").update("prototype-fixture").digest("hex").slice(0, 36);
}

export function assertNoSecrets(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (findSecrets(text).length > 0) {
    throw new Error("SECURITY_VIOLATION: secret-like content cannot be persisted. Use an environment-variable handle.");
  }
}

// ---------------------------------------------------------------------------
// 3. T1 approval registry (mirrors runtime/founder-brain.ts approvalRegistry)
// ---------------------------------------------------------------------------

/**
 * Approvals are minted from an active T1 contract activation and tracked in a
 * WeakSet so a lookalike object minted elsewhere is rejected. This is the
 * single control that blocks approval spoofing.
 */
const approvalRegistry = new WeakSet();

export function mintBossApprovalProof(activation, messageId) {
  if (!activation || !activation.active || !activation.contractId || !activation.evidence) {
    throw new Error("APPROVAL_REQUIRED: an active T1 contract approval is required.");
  }
  if (typeof messageId !== "string" || messageId.length === 0) {
    throw new Error("INVALID_APPROVAL: messageId must be a non-empty string.");
  }
  const proof = Object.freeze({
    contractId: activation.contractId,
    messageId,
    approvedAt: new Date().toISOString(),
  });
  approvalRegistry.add(proof);
  return proof;
}

export function assertValidApprovalProof(proof, contractId) {
  if (proof === null || typeof proof !== "object" || !approvalRegistry.has(proof)) {
    throw new Error("APPROVAL_REQUIRED: use a proof minted from an active T1 approval.");
  }
  if (contractId !== undefined && proof.contractId !== contractId) {
    throw new Error("APPROVAL_MISMATCH: approval proof belongs to a different contract.");
  }
}

// ---------------------------------------------------------------------------
// 4. ToolDescriptor and canonical registry
// ---------------------------------------------------------------------------

/**
 * A capability descriptor. Fields map directly to the brief's required design:
 * stable capability ID, kind, categories, operations, side effect, permission,
 * approval rule, authentication state, external boundary, context cost,
 * availability, and fallback.
 */
export class ToolDescriptor {
  constructor(input) {
    const {
      capabilityId, kind, categories, operations, sideEffect,
      authState, externalBoundary, contextCost, availability, fallback,
      publicSurface = false,
    } = input;

    if (typeof capabilityId !== "string" || capabilityId.length === 0) {
      throw new Error("INVALID_DESCRIPTOR: capabilityId is required.");
    }
    const validKinds = new Set(["remote_mcp", "host_adapter", "native"]);
    if (!validKinds.has(kind)) {
      throw new Error("INVALID_DESCRIPTOR: kind must be remote_mcp | host_adapter | native.");
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error("INVALID_DESCRIPTOR: categories must be a non-empty array.");
    }
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error("INVALID_DESCRIPTOR: operations must be a non-empty array.");
    }
    if (!Object.values(SideEffect).includes(sideEffect)) {
      throw new Error("INVALID_DESCRIPTOR: sideEffect is not a known effect.");
    }
    const validAuth = new Set(["unauthenticated", "authenticated"]);
    if (!validAuth.has(authState)) {
      throw new Error("INVALID_DESCRIPTOR: authState must be unauthenticated | authenticated.");
    }
    if (typeof externalBoundary !== "string" || externalBoundary.length === 0) {
      throw new Error("INVALID_DESCRIPTOR: externalBoundary is required.");
    }
    if (!Number.isInteger(contextCost) || contextCost < 0) {
      throw new Error("INVALID_DESCRIPTOR: contextCost must be a non-negative integer.");
    }
    const validAvailability = new Set(["available", "unavailable"]);
    if (!validAvailability.has(availability)) {
      throw new Error("INVALID_DESCRIPTOR: availability must be available | unavailable.");
    }
    if (typeof fallback !== "string" || fallback.length === 0) {
      throw new Error("INVALID_DESCRIPTOR: fallback is required.");
    }

    this.capabilityId = capabilityId;
    this.kind = kind;
    this.categories = Object.freeze([...categories]);
    this.operations = Object.freeze([...operations]);
    this.sideEffect = sideEffect;
    this.permission = permissionFor(sideEffect);
    this.approvalRule = approvalRuleFor(sideEffect);
    this.authState = authState;
    this.externalBoundary = externalBoundary;
    this.contextCost = contextCost;
    this.availability = availability;
    this.fallback = fallback;
    this.publicSurface = Boolean(publicSurface);
    Object.freeze(this);
  }

  /** Deterministic, stable fingerprint used for capability normalization. */
  digest() {
    const payload = {
      capabilityId: this.capabilityId,
      kind: this.kind,
      sideEffect: this.sideEffect,
      permission: this.permission,
      approvalRule: this.approvalRule,
      externalBoundary: this.externalBoundary,
      publicSurface: this.publicSurface,
      availability: this.availability,
    };
    return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }
}

/**
 * Canonical registry. The four remote MCP tools are PUBLIC surface and must
 * remain read-only (sideEffect none -> PERM_NONE, no approval). The native
 * host-adapter contracts (hypertaks_context, hypertaks_retrieve) are INTERNAL
 * only and never exposed on the remote MCP tool list.
 */
export const CANONICAL_DESCRIPTORS = Object.freeze([
  new ToolDescriptor({
    capabilityId: "hypertaks_manifest",
    kind: "remote_mcp",
    categories: ["routing", "read"],
    operations: ["read_manifest"],
    sideEffect: SideEffect.NONE,
    authState: "unauthenticated",
    externalBoundary: "remote_mcp_readonly_adapter",
    contextCost: 0,
    availability: "available",
    fallback: "reject_unknown_tool",
    publicSurface: true,
  }),
  new ToolDescriptor({
    capabilityId: "hypertaks_get_skill",
    kind: "remote_mcp",
    categories: ["routing", "read"],
    operations: ["read_skill_file"],
    sideEffect: SideEffect.NONE,
    authState: "unauthenticated",
    externalBoundary: "remote_mcp_readonly_adapter",
    contextCost: 0,
    availability: "available",
    fallback: "reject_unknown_tool",
    publicSurface: true,
  }),
  new ToolDescriptor({
    capabilityId: "hypertaks_route",
    kind: "remote_mcp",
    categories: ["routing", "read"],
    operations: ["select_skill"],
    sideEffect: SideEffect.NONE,
    authState: "unauthenticated",
    externalBoundary: "remote_mcp_readonly_adapter",
    contextCost: 0,
    availability: "available",
    fallback: "route_to_main",
    publicSurface: true,
  }),
  new ToolDescriptor({
    capabilityId: "hypertaks_verify_installation",
    kind: "remote_mcp",
    categories: ["routing", "read", "verify"],
    operations: ["verify_files"],
    sideEffect: SideEffect.NONE,
    authState: "unauthenticated",
    externalBoundary: "remote_mcp_readonly_adapter",
    contextCost: 0,
    availability: "available",
    fallback: "reject_unknown_tool",
    publicSurface: true,
  }),
  // Internal host-adapter contract: project operating context.
  new ToolDescriptor({
    capabilityId: "hypertaks_context",
    kind: "host_adapter",
    categories: ["context", "read"],
    operations: ["context_load", "context_reload"],
    sideEffect: SideEffect.NONE,
    authState: "authenticated",
    externalBoundary: "local_repo_containment",
    contextCost: 0,
    availability: "available",
    fallback: "empty_context",
    publicSurface: false,
  }),
  // Internal host-adapter contract: evidence-grounded retrieval (K1 kernel).
  new ToolDescriptor({
    capabilityId: "hypertaks_retrieve",
    kind: "host_adapter",
    categories: ["retrieval", "read"],
    operations: ["retrieve", "direct_search"],
    sideEffect: SideEffect.NONE,
    authState: "authenticated",
    externalBoundary: "local_repo_readonly_search",
    contextCost: 0,
    availability: "available",
    fallback: "direct_search",
    publicSurface: false,
  }),
  // Internal native capability used only to exercise mutation/transaction paths.
  new ToolDescriptor({
    capabilityId: "commandcode_write_note",
    kind: "native",
    categories: ["memory", "write"],
    operations: ["write_note"],
    sideEffect: SideEffect.LOCAL_WRITE,
    authState: "authenticated",
    externalBoundary: "local_repo_containment",
    contextCost: 0,
    availability: "available",
    fallback: "empty_result",
    publicSurface: false,
  }),
]);

/** Canonical public MCP surface: exactly the four read-only tools. */
export const PUBLIC_MCP_TOOL_IDS = Object.freeze(
  CANONICAL_DESCRIPTORS.filter((d) => d.publicSurface).map((d) => d.capabilityId),
);

export class ToolRegistry {
  #byId = new Map();
  #byAlias = new Map();

  constructor(descriptors = CANONICAL_DESCRIPTORS) {
    for (const d of descriptors) {
      if (this.#byId.has(d.capabilityId)) {
        throw new Error(`DUPLICATE_CAPABILITY: ${d.capabilityId}`);
      }
      this.#byId.set(d.capabilityId, d);
    }
  }

  /** Deterministic selection: resolve a stable capability ID or alias. */
  resolveCapabilityId(query) {
    if (typeof query !== "string" || query.length === 0) {
      throw new Error("INVALID_CAPABILITY_QUERY: empty query.");
    }
    const normalized = query.trim().toLowerCase();
    if (this.#byId.has(normalized)) return normalized;
    // Alias normalization mirrors public-skill-router.ts skillAliases discipline:
    // short forms only resolve when they map to exactly one canonical ID and are
    // not bare product nouns that could be ambiguous instruction-shaped text.
    const aliases = {
      "ht-context": "hypertaks_context",
      "context": "hypertaks_context",
      "ht-retrieve": "hypertaks_retrieve",
      "retrieve": "hypertaks_retrieve",
    };
    const resolved = aliases[normalized];
    if (resolved && this.#byId.has(resolved)) return resolved;
    throw new Error(`CAPABILITY_NOT_FOUND: ${query}`);
  }

  get(capabilityId) {
    const id = this.resolveCapabilityId(capabilityId);
    return this.#byId.get(id);
  }

  list() {
    return [...this.#byId.values()];
  }

  publicSurfaceIds() {
    return PUBLIC_MCP_TOOL_IDS;
  }
}

// ---------------------------------------------------------------------------
// 5. Execution envelope and invocation
// ---------------------------------------------------------------------------

export class ExecutionEnvelope {
  constructor(input) {
    const { exactRoot, timeoutMs, maxOutputBytes, maxRetries, maxEffects } = input;
    if (typeof exactRoot !== "string" || exactRoot.length === 0) {
      throw new Error("INVALID_ENVELOPE: exactRoot is required.");
    }
    this.exactRoot = exactRoot;           // canonical approved root for path containment
    this.timeoutMs = Number.isInteger(timeoutMs) && timeoutMs > 0 ? timeoutMs : 5000;
    this.maxOutputBytes = Number.isInteger(maxOutputBytes) && maxOutputBytes > 0 ? maxOutputBytes : 65536;
    this.maxRetries = Number.isInteger(maxRetries) && maxRetries >= 0 ? maxRetries : 1;
    this.maxEffects = Number.isInteger(maxEffects) && maxEffects >= 0 ? maxEffects : 1;
    Object.freeze(this);
  }
}

export class ToolInvocation {
  constructor(input) {
    const {
      capabilityId, operation, arguments: args, envelope,
      grantedPermissions = [], approvalProof = null,
    } = input;
    this.invocationId = createHash("sha256").update(`${capabilityId}:${operation}:${crypto.randomUUID()}`).digest("hex").slice(0, 16);
    this.capabilityId = capabilityId;
    this.operation = operation;
    this.arguments = Object.freeze({ ...(args || {}) });
    this.envelope = envelope;
    this.grantedPermissions = Object.freeze([...(grantedPermissions || [])]);
    this.approvalProof = approvalProof;
    this.idempotencyKey = createHash("sha256").update(stableify({ capabilityId, operation, args })).digest("hex");
    Object.freeze(this);
  }
}

function stableify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableify).join(",")}]`;
  const obj = {};
  for (const k of Object.keys(value).sort()) obj[k] = stableify(value[k]);
  return JSON.stringify(obj);
}

function joinPath(base, ...parts) {
  return parts.reduce((acc, p) => acc + "/" + p, base.replace(/\/+$/, ""));
}

export class ToolResult {
  constructor(input) {
    const { invocationId, capabilityId, ok, structuredContent, text, isError, evidence, redacted, transactionId } = input;
    this.invocationId = invocationId;
    this.capabilityId = capabilityId;
    this.ok = ok;
    this.structuredContent = structuredContent;
    this.text = redactSecrets(text);              // never persist a raw secret
    this.isError = isError;
    this.evidence = evidence;
    this.redacted = redacted || findSecrets(text).length > 0;
    this.transactionId = transactionId;
    Object.freeze(this);
  }
}

// ---------------------------------------------------------------------------
// 6. ActionTransaction state machine
// ---------------------------------------------------------------------------

export const TRANSACTION_STATE = Object.freeze({
  PREPARE: "PREPARE",
  PREVIEW: "PREVIEW",
  APPROVAL: "APPROVAL",
  COMMIT: "COMMIT",
  RECONCILE: "RECONCILE",
});

export class ActionTransaction {
  constructor(invocation) {
    this.transactionId = createHash("sha256").update(`tx:${invocation.invocationId}`).digest("hex").slice(0, 16);
    this.capabilityId = invocation.capabilityId;
    this.idempotencyKey = invocation.idempotencyKey;
    this.invocation = invocation;
    this.descriptor = null;
    this.authorized = false;
    this.requiresApproval = false;
    this.state = TRANSACTION_STATE.PREPARE;
    this.preparedAt = new Date().toISOString();
    this.approvedAt = null;
    this.committedAt = null;
    this.reconciledAt = null;
    this.retryCount = 0;
    this.committedOnce = false;              // COMMIT ONCE invariant
    this.committedAmbiguous = false;         // timeout-after-commit ambiguity
    this.result = null;
    this.states = [{ state: TRANSACTION_STATE.PREPARE, ts: this.preparedAt, note: "transaction created" }];
    this._transition(TRANSACTION_STATE.PREPARE, "prepared");
  }

  _transition(state, note) {
    this.states.push({ state, ts: new Date().toISOString(), note });
    this.state = state;
  }

  toPREVIEW() { this._transition(TRANSACTION_STATE.PREVIEW, "previewed without side effect"); }
  toAPPROVAL() {
    this._transition(TRANSACTION_STATE.APPROVAL, "T1 approval satisfied");
    this.authorized = true;
    this.approvedAt = new Date().toISOString();
  }
  toCOMMIT() {
    this._transition(TRANSACTION_STATE.COMMIT, "committed once");
    this.committedAt = new Date().toISOString();
    this.committedOnce = true;
  }
  toRECONCILE(note) {
    this._transition(TRANSACTION_STATE.RECONCILE, note || "reconciled");
    this.reconciledAt = new Date().toISOString();
  }
}

// ---------------------------------------------------------------------------
// 7. Deterministic fake executor + idempotency ledger
// ---------------------------------------------------------------------------

/**
 * A deterministic fake effect ledger. It records each COMMITTED effect keyed by
 * idempotency key so that retries never duplicate effects and read-after-write
 * can be verified. No real external tool is executed.
 */
export class EffectLedger {
  constructor(root) {
    this.root = root;
    this.#mkdir();
    // In-memory map of idempotencyKey -> effect record (mirrors a disk journal).
    this.entries = new Map();
  }

  #mkdir() {
    if (!existsSync(this.root)) mkdirSync(this.root, { recursive: true });
  }

  /** Record an effect. Returns true if this is the first time (committed), false on replay. */
  commit(idempotencyKey, payload) {
    if (this.entries.has(idempotencyKey)) return false;
    const record = {
      idempotencyKey,
      committedAt: new Date().toISOString(),
      payload: redactSecrets(typeof payload === "string" ? payload : JSON.stringify(payload)),
    };
    this.entries.set(idempotencyKey, Object.freeze(record));
    // Append a redacted journal line (evidence binding, no raw secrets on disk).
    const line = JSON.stringify({ idempotencyKey, committedAt: record.committedAt, payload: record.payload }) + "\n";
    const journalPath = joinPath(this.root, "journal.ndjson");
    appendFileSync(journalPath, line, { encoding: "utf8", flag: "a" });
    return true;
  }

  has(idempotencyKey) { return this.entries.has(idempotencyKey); }
  count() { return this.entries.size; }

  /** Read-after-write check: recompute the expected payload hash and compare. */
  verifyReadAfterWrite(idempotencyKey, expectedSha256) {
    const entry = this.entries.get(idempotencyKey);
    if (!entry) return { ok: false, reason: "no_committed_effect" };
    const actual = createHash("sha256").update(entry.payload).digest("hex");
    return { ok: actual === expectedSha256, reason: actual === expectedSha256 ? "match" : "mismatch" };
  }
}

/** Deterministic fake executor. Returns ToolResult-like data, never real effects. */
function executeFake(descriptor, invocation) {
  const fakeOutputs = {
    hypertaks_manifest: { ok: true, structuredContent: { product: "Hypertaks", version: "4.5.1", publicMcpTools: PUBLIC_MCP_TOOL_IDS }, text: "Read-only manifest. No mutation performed." },
    hypertaks_get_skill: { ok: true, structuredContent: { skill: invocation.arguments.skill || "hypertaks" }, text: "Read canonical skill file. No mutation performed." },
    hypertaks_route: { ok: true, structuredContent: { skill: "hypertaks" }, text: "Routing is read-only. No mutation performed." },
    hypertaks_verify_installation: { ok: true, structuredContent: { exactSkillSet: true, publicSkillCount: 5 }, text: "Installation verified. Four read-only tools; no write capability exposed." },
    hypertaks_context: { ok: true, structuredContent: { documents: [] }, text: "Loaded Project Operating Context (read-only)." },
    hypertaks_retrieve: { ok: true, structuredContent: { results: [], mode: "direct_search" }, text: "Retrieved zero results via direct search fallback." },
    commandcode_write_note: {
      ok: true,
      // Simulated secret in a fake write payload to exercise redaction on output.
      structuredContent: { written: true, path: "note.md" },
      text: `Note written. Token: ${syntheticSecret()}`,
    },
  };
  const found = fakeOutputs[descriptor.capabilityId];
  if (!found) {
    return { ok: false, isError: true, text: `Unsupported operation for capability ${descriptor.capabilityId}.` };
  }
  return found;
}

// ---------------------------------------------------------------------------
// 8. Native-tool facade
// ---------------------------------------------------------------------------

export class NativeToolFacade {
  constructor(registry, ledger) {
    this.registry = registry;
    this.ledger = ledger;
  }

  /** PREPARE + PREVIEW. Authorizes read-only public tools without T1. */
  prepare(id, operation, args, envelope, grantedPermissions = []) {
    const descriptor = this.registry.get(id); // throws if not found
    if (descriptor.availability !== "available") {
      return { transaction: null, error: `UNAVAILABLE: ${descriptor.capabilityId} -> ${descriptor.fallback}` };
    }

    const invocation = new ToolInvocation({ capabilityId: descriptor.capabilityId, operation, arguments: args, envelope, grantedPermissions });
    const tx = new ActionTransaction(invocation);
    tx.descriptor = descriptor;

    // Deny-by-default permission mapping based on effect, not product name.
    if (descriptor.permission === "PERM_DENY") {
      tx._transition(TRANSACTION_STATE.RECONCILE, "denied by effect-based policy");
      throw new Error(`PERMISSION_DENIED: effect ${descriptor.sideEffect} requires explicit T1 approval and a granted permission; denied by default.`);
    }
    if (descriptor.permission !== "PERM_NONE" && !grantedPermissions.includes(descriptor.permission)) {
      tx._transition(TRANSACTION_STATE.RECONCILE, "missing granted permission token");
      throw new Error(`PERMISSION_DENIED: ${descriptor.permission} not granted for ${descriptor.capabilityId}.`);
    }

    tx.toPREVIEW();
    // Read-only public tools are authorized at PREVIEW (mutationPerformed: false).
    if (descriptor.sideEffect === SideEffect.NONE) {
      tx.authorized = true;
    } else {
      tx.requiresApproval = true;
    }
    return { transaction: tx, error: null };
  }

  /** T1 APPROVAL gate for any mutation. Validates a proof against the mint-only
   * registry so spoofed (lookalike but un-minted) proofs are rejected. */
  authorize(tx, approvalProof, contractId) {
    if (!tx.requiresApproval) {
      throw new Error("APPROVAL_NOT_REQUIRED: capability is read-only.");
    }
    // assertValidApprovalProof rejects any proof not minted by mintBossApprovalProof.
    assertValidApprovalProof(approvalProof, contractId);
    tx.toAPPROVAL();
    tx.approvalProof = approvalProof;
    tx.authorized = true;
    return approvalProof;
  }

  /** Mint a genuine T1 approval from an active contract activation, then authorize. */
  requestApproval(tx, activation, messageId, contractId) {
    const proof = mintBossApprovalProof(activation, messageId); // throws if activation inactive
    return this.authorize(tx, proof, contractId);
  }

  /**
   * COMMIT ONCE. Enforces idempotency: a duplicate idempotency key never
   * re-executes the effect. On a simulated timeout it records ambiguity and
   * hands off to RECONCILE without rolling back (reversible rollback only for
   * reversible effects; here writes are treated as already-committed).
   */
  commit(tx, { simulateTimeout = false } = {}) {
    if (!tx.authorized) {
      throw new Error("COMMIT_REJECTED: transaction was not authorized.");
    }
    if (tx.descriptor.sideEffect === SideEffect.NONE) {
      // Read path: no effect to record, but still produce a single result.
    } else {
      // COMMIT ONCE: if the idempotency key already committed, replay the prior
      // result. The ledger proves no duplicate effect.
      if (this.ledger.has(tx.idempotencyKey)) {
        tx._transition(TRANSACTION_STATE.COMMIT, "replayed prior commit (idempotent)");
        tx.committedOnce = true;
        tx.committedAt = new Date().toISOString();
      } else {
        this.ledger.commit(tx.idempotencyKey, tx.invocation.arguments);
        tx.toCOMMIT();
      }
    }

    const outcome = executeFake(tx.descriptor, tx.invocation);

    if (simulateTimeout) {
      // Timeout ambiguity: we cannot prove the effect did NOT commit.
      tx.committedAmbiguous = true;
      tx._transition(TRANSACTION_STATE.RECONCILE, "timeout ambiguity; no rollback of committed effect");
      return { tx, ambiguous: true, result: null };
    }

    const result = new ToolResult({
      invocationId: tx.invocation.invocationId,
      capabilityId: tx.capabilityId,
      ok: outcome.ok,
      structuredContent: outcome.structuredContent,
      text: outcome.text,
      isError: outcome.isError || !outcome.ok,
      evidence: { capabilityId: tx.capabilityId, invocationId: tx.invocation.invocationId },
      redacted: false,
      transactionId: tx.transactionId,
    });
    tx.result = result;
    if (tx.state !== TRANSACTION_STATE.COMMIT) {
      tx.toCOMMIT();
    }
    return { tx, ambiguous: false, result };
  }

  /**
   * RECONCILE. After a timeout or before a retry, re-check the ledger to decide
   * the real state. Never roll back a committed effect (no false rollback);
   * containment + disclosure instead.
   */
  reconcile(tx, idempotencyKey) {
    const alreadyCommitted = this.ledger.has(idempotencyKey);
    if (alreadyCommitted) {
      tx.toRECONCILE("reconciled: effect already committed; retry is a no-op");
      tx.committedOnce = true;
      return { decided: "already_committed", replay: true };
    }
    // No committed effect: safe to retry a fresh commit.
    tx._transition(TRANSACTION_STATE.RECONCILE, "reconciled: no committed effect; safe to retry");
    tx.retryCount += 1;
    return { decided: "safe_to_retry", replay: false };
  }
}
