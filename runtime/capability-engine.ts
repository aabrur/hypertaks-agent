/**
 * Unified Capability Engine
 *
 * Hypertaks Founder remains the decision-maker. This engine is one of its
 * instruments: it discovers, describes, selects, binds, verifies, and falls
 * back on the minimum sufficient capability set for an approved task, drawing
 * from native Hypertaks runtime services, Hypertaks skills, MCP tools,
 * host-native tools, plugins, and integrated external engines (REA investigation,
 * Superpowers process workflows).
 *
 * Design invariants (see skills/hypertaks/references/plugins-and-mcp.md):
 *   - Need before discovery. Only sources that can serve a needed category are
 *     queried. The host is never fully inventoried up front.
 *   - Detect, never assume. Availability comes from a real provider hint for the
 *     current session. An installed capability is not "verified" unless the hint
 *     says so. Nothing is fabricated.
 *   - One identity. Every descriptor carries a stable Hypertaks capability id and
 *     public name while retaining the underlying provider and operation id for
 *     dispatch, attribution, and provenance.
 *   - Least capability. bindCapabilities() already prefers lower context cost,
 *     fewer side effects, and alphabetical tie-break; this engine preserves that.
 *   - Founder authority. Mutating or invasive capabilities require explicit
 *     approval and are excluded from ordinary read-only screening.
 *
 * This module extends the routing model in router.ts (CapabilityDescriptor,
 * CapabilityNeed, bindCapabilities). It does not rebuild it.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as child_process from "node:child_process";
import {
  bindCapabilities,
  type Availability,
  type CapabilityDescriptor,
  type CapabilityKind,
  type CapabilityNeed,
  type Operation,
  type SideEffect,
} from "./router";
import { scanRepository } from "./repository-intelligence/scanner";
import { buildLocalGraph, loadLocalGraphFromDisk } from "./graph/local-graph-provider";
import { analyzeImpact } from "./graph/impact-analyzer";
import { readPointer, redactSecrets } from "./founder-brain";
import { readRepoIdentity } from "./repo-identity";
import { verifyProjectOperatingContext } from "./repository-intelligence/context-verifier";

// ---------------------------------------------------------------------------
// Unified descriptor
// ---------------------------------------------------------------------------

/**
 * Broader capability type than the routing `CapabilityKind`. `kind` stays the
 * transport class (skill / native_tool / mcp_tool / connector); `capability_type`
 * is the functional family the Founder reasons about (investigation, workflow, ...).
 */
export type CapabilityType =
  | "investigation"
  | "binary_intelligence"
  | "workflow"
  | "retrieval"
  | "visual"
  | "search"
  | "onchain"
  | "knowledge"
  | "unknown";

export type SessionModel = "stateless" | "stateful" | "exclusive";

export interface EvidenceModel {
  /** How results from this capability are recorded for provenance. */
  readonly kind: string;
  /** Fields that carry source provenance into a Hypertaks evidence record. */
  readonly provenanceFields: readonly string[];
}

/**
 * A capability descriptor the Founder can route on. Extends the canonical
 * routing descriptor with provider attribution, I/O contract, platform,
 * permissions, session lifecycle, evidence model, fallback, and error behavior.
 * All base routing fields remain present so bindCapabilities() works unchanged.
 */
export interface UnifiedCapabilityDescriptor extends CapabilityDescriptor {
  readonly capability_type: CapabilityType;
  /** Underlying provider: "hypertaks-native", "rea", "superpowers", "mcp:<server>", "host-native". */
  readonly provider: string;
  /** Underlying provider operation id (REA tool name, host tool name, ...), if any. */
  readonly provider_operation: string | null;
  /** Hypertaks-branded public name shown to the Boss and written into briefs. */
  readonly public_name: string;
  /** Short input/output contract. */
  readonly io_contract: string;
  /** Supported platforms. Empty means "unknown / not asserted". */
  readonly platform: readonly string[];
  /** Permissions the capability needs to actually run. */
  readonly permissions: readonly string[];
  /** Session lifecycle and concurrency class. */
  readonly session_model: SessionModel;
  /** Provenance / evidence model. */
  readonly evidence: EvidenceModel;
  /** What to do when this capability is absent or fails. */
  readonly fallback: string;
  /** Error and timeout behavior. */
  readonly error_model: string;
}

// ---------------------------------------------------------------------------
// Discovery context and sources
// ---------------------------------------------------------------------------

export interface McpServerHint {
  readonly name: string;
  /** Tool names the server actually exposed this session, if discovered. */
  readonly tools?: readonly string[];
  readonly authenticated?: boolean;
}

export interface ReaEndpointHint {
  /** True only when a REA provider was actually discovered/reachable this session. */
  readonly available: boolean;
  readonly endpoint?: string;
  /** Real REA tool names from live discovery. Do not fabricate. */
  readonly tools?: readonly string[];
  readonly auth?: "none" | "present" | "missing" | "unknown";
}

export interface CapabilityDiscoveryContext {
  /** Live host tool names already exposed in the session, if any. */
  readonly hostTools?: readonly string[];
  /** Installed host process skills (e.g. Superpowers skills), if enumerated. */
  readonly hostSkills?: readonly string[];
  /** Discovered MCP servers and the tools they exposed. */
  readonly mcpServers?: readonly McpServerHint[];
  /** REA investigation provider availability and discovered tools. */
  readonly rea?: ReaEndpointHint;
  readonly platform?: string;
  /** True when the session already owns a stateful provider session. */
  readonly statefulSession?: boolean;
}

export interface CapabilitySource {
  readonly sourceId: string;
  /** Categories this source can plausibly serve; used for need-before-discovery filtering. */
  readonly categories: readonly string[];
  discover(ctx: CapabilityDiscoveryContext): Promise<readonly UnifiedCapabilityDescriptor[]>;
}

// ---------------------------------------------------------------------------
// REA provider adapter
// ---------------------------------------------------------------------------

/**
 * REA (Reverse Engineer Anything) is an external investigation engine exposed
 * through its own MCP mode. It is integrated as Hypertaks investigation
 * capabilities, never as the operating identity. The adapter maps REA's real,
 * dynamically-discovered tool names onto stable Hypertaks capability ids and
 * classifies side effects honestly: pure reads are free; annotation, bookmark,
 * and instrumentation ops are treated as invasive and require approval.
 *
 * Upstream: https://github.com/morluto/rea
 */
export interface ReaCapabilitySource extends CapabilitySource {
  readonly sourceId: "rea";
}

type ReaGroup = "investigation" | "binary_intelligence" | "ui_investigation" | "investigation-annotation";

interface ReaToolClass {
  readonly group: ReaGroup;
  /** True for ops that mutate the target or attach instrumentation. */
  readonly mutating: boolean;
}

const REA_STATIC_READ: ReadonlySet<string> = new Set([
  "analyze_javascript_application",
  "analyze_function",
  "analyze_swift_types",
  "batch_decompile",
  "read_function_instructions",
  "trace_feature",
  "search_strings",
  "search_procedures",
  "search_bytes",
  "list_documents",
  "list_procedures",
  "list_names",
  "list_segments",
  "list_strings",
  "xrefs",
  "find_xrefs_to_name",
  "trace_call_path",
  "trace_native_values",
  "resolve_native_call_targets",
  "get_call_graph",
  "procedure_callers",
  "procedure_callees",
  "procedure_references",
  "address_name",
  "goto_address",
  "next_address",
  "prev_address",
  "current_address",
  "current_procedure",
  "current_document",
  "procedure_address",
  "procedure_assembly",
  "procedure_pseudo_code",
  "resolve_containing_procedure",
  "address_to_file_offset",
  "list_bookmarks",
]);

const REA_BINARY_READ: ReadonlySet<string> = new Set([
  "binary_overview",
  "inspect_macho",
  "inspect_pe_resources",
  "inspect_signature",
  "inspect_native_api",
  "inspect_native_data_type",
  "inspect_native_instruction",
  "inspect_native_load_image",
  "inspect_dispatch_metadata",
  "get_objc_classes",
  "get_objc_protocols",
]);

const REA_UI_READ: ReadonlySet<string> = new Set([
  "observe_native_ui",
  "trace_native_ui_action",
  "capture_native_ui_scenario",
]);

const REA_INSTRUMENT_OR_MUTATE: ReadonlySet<string> = new Set([
  // Mutates the target binary/source.
  "annotate_native_function",
  "comment",
  "inline_comment",
  "set_comment",
  "set_inline_comment",
  "unset_comment",
  "set_bookmark",
  // Attaches live instrumentation; invasive.
  "observe_native_calls",
]);

function classifyReaTool(tool: string): ReaToolClass | null {
  if (REA_STATIC_READ.has(tool)) return { group: "investigation", mutating: false };
  if (REA_BINARY_READ.has(tool)) return { group: "binary_intelligence", mutating: false };
  if (REA_UI_READ.has(tool)) return { group: "ui_investigation", mutating: false };
  if (REA_INSTRUMENT_OR_MUTATE.has(tool)) return { group: "investigation-annotation", mutating: true };
  return null;
}

const REA_GROUP_PUBLIC: Record<ReaGroup, string> = {
  investigation: "Hypertaks Static Investigation",
  binary_intelligence: "Hypertaks Binary Intelligence",
  ui_investigation: "Hypertaks Native-UI Investigation",
  "investigation-annotation": "Hypertaks Investigation Annotation",
};

const REA_GROUP_TYPE: Record<ReaGroup, CapabilityType> = {
  investigation: "investigation",
  binary_intelligence: "binary_intelligence",
  ui_investigation: "investigation",
  "investigation-annotation": "investigation",
};

const REA_GROUP_CATEGORIES: Record<ReaGroup, readonly string[]> = {
  investigation: ["binary_intelligence", "static_analysis", "code_understanding", "dependency_analysis"],
  binary_intelligence: ["binary_intelligence", "native_analysis", "code_understanding"],
  ui_investigation: ["ui_analysis", "behavioral_analysis", "code_understanding"],
  "investigation-annotation": ["annotation", "documentation"],
};

const REA_GROUP_OPERATIONS: Record<ReaGroup, readonly Operation[]> = {
  investigation: ["read"],
  binary_intelligence: ["read"],
  ui_investigation: ["read"],
  "investigation-annotation": ["update"],
};

const REA_GROUP_FALLBACK: Record<ReaGroup, string> = {
  investigation: "Reason from supplied source or static model; mark reverse-engineering claims unverified.",
  binary_intelligence: "Request the caller supply the binary or a static dump; do not attach an instrumented backend.",
  ui_investigation: "Describe expected UI behavior from documentation; mark runtime UI claims unverified.",
  "investigation-annotation": "Deliver annotations as a Hypertaks evidence list for the Boss to apply.",
};

/**
 * Every functional category the REA source can serve across its groups. This is
 * the union used for need-before-discovery source filtering, so a need for any
 * one of these (including "annotation") still queries the REA source.
 */
const REA_SOURCE_CATEGORIES: readonly string[] = [
  ...new Set((Object.values(REA_GROUP_CATEGORIES) as readonly (readonly string[])[]).flat()),
];

/**
 * Builds a REA capability source from a real discovery hint. When REA was not
 * actually discovered, every descriptor is reported "unavailable" so the binder
 * never selects it. This is the anti-fabrication boundary for REA.
 */
export function createReaCapabilitySource(hint: ReaEndpointHint): ReaCapabilitySource {
  const discovered = hint.tools ?? [];
  const availability: Availability = hint.available ? "verified" : "unavailable";
  const authentication: "none" | "present" | "missing" | "unknown" = hint.auth ?? "unknown";

  const grouped = new Map<ReaGroup, Set<string>>();
  const unmapped: string[] = [];
  for (const tool of discovered) {
    const cls = classifyReaTool(tool);
    if (!cls) {
      unmapped.push(tool);
      continue;
    }
    let set = grouped.get(cls.group);
    if (!set) {
      set = new Set();
      grouped.set(cls.group, set);
    }
    set.add(tool);
  }

  const descriptors = (): UnifiedCapabilityDescriptor[] => {
    const out: UnifiedCapabilityDescriptor[] = [];
    for (const [group, ops] of grouped) {
      const sortedOps = [...ops].sort();
      const mutating = sortedOps.some((op) => REA_INSTRUMENT_OR_MUTATE.has(op));
      out.push(buildReaDescriptor(group, sortedOps, availability, authentication, mutating, false));
    }
    // Unknown REA ops are surfaced fail-closed: available but requiring approval
    // and flagged unknown, never silently bound during ordinary screening.
    if (unmapped.length > 0) {
      out.push(
        buildReaDescriptor(
          "investigation",
          [...unmapped].sort(),
          availability,
          authentication,
          true,
          true,
        ),
      );
    }
    return out;
  };

  return {
    sourceId: "rea" as const,
    categories: REA_SOURCE_CATEGORIES,
    async discover() {
      return descriptors();
    },
  };
}

function buildReaDescriptor(
  group: ReaGroup,
  reaOperations: readonly string[],
  availability: Availability,
  authentication: "none" | "present" | "missing" | "unknown",
  invasive: boolean,
  unknownOps: boolean,
): UnifiedCapabilityDescriptor {
  const mutating = invasive || unknownOps;
  const operations = mutating ? REA_GROUP_OPERATIONS["investigation-annotation"] : REA_GROUP_OPERATIONS[group];
  const side_effect: SideEffect = !mutating ? "none" : unknownOps ? "unknown" : "reversible";
  const groupOperations = reaOperations;
  return {
    capability_id: `hypertaks-${group.replace(/_/g, "-")}`,
    kind: "mcp_tool" as CapabilityKind,
    categories: REA_GROUP_CATEGORIES[group],
    operations,
    side_effect,
    approval_required: mutating,
    authentication,
    external_system: "rea",
    context_cost: "high",
    availability,
    capability_type: REA_GROUP_TYPE[group],
    provider: "rea",
    provider_operation: groupOperations.length > 0 ? groupOperations.join(",") : null,
    public_name: REA_GROUP_PUBLIC[group],
    io_contract: unknownOps
      ? "Discovered REA op(s) with no verified contract; inspect before use."
      : `REA ${group} op(s): ${groupOperations.join(", ") || "n/a"}.`,
    platform: ["darwin", "linux", "windows"],
    permissions: invasive ? ["binary-investigation", "instrumentation"] : ["read"],
    session_model: "stateful",
    evidence: {
      kind: "REA_EVIDENCE",
      provenanceFields: ["rea_operation", "address", "target", "coverage", "unknowns"],
    },
    fallback: REA_GROUP_FALLBACK[group],
    error_model: "Fail closed on ambiguous timeout; never auto-attach an invasive backend during screening.",
  };
}

// ---------------------------------------------------------------------------
// REA stdio transport and local discovery
// ---------------------------------------------------------------------------

export interface ReaStdioConfig {
  readonly nodeBin: string;
  readonly scriptPath: string;
  readonly env: Record<string, string>;
  readonly exists: boolean;
}

/**
 * Resolves local REA configuration from user mcp_config.json or npm global install.
 */
export function resolveLocalReaConfig(): ReaStdioConfig {
  const userProfile = process.env.USERPROFILE || process.env.HOME || "";
  const appData = process.env.APPDATA || path.join(userProfile, "AppData", "Roaming");
  const mcpConfigFile = path.join(userProfile, ".gemini", "config", "mcp_config.json");

  let env: Record<string, string> = { ...(process.env as Record<string, string>) };
  let scriptPath = path.join(appData, "npm", "node_modules", "rea-agents", "scripts", "rea.mjs");
  let nodeBin = "node";

  if (fs.existsSync(mcpConfigFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(mcpConfigFile, "utf8")) as {
        mcpServers?: {
          rea?: {
            command?: string;
            args?: string[];
            env?: Record<string, string>;
          };
        };
      };
      const reaCfg = parsed.mcpServers?.rea;
      if (reaCfg) {
        if (reaCfg.command) nodeBin = reaCfg.command;
        if (reaCfg.args && reaCfg.args[0]) scriptPath = reaCfg.args[0];
        if (reaCfg.env) env = { ...env, ...reaCfg.env };
      }
    } catch {
      // Fall back to standard paths
    }
  }

  const exists = fs.existsSync(scriptPath);
  return { nodeBin, scriptPath, env, exists };
}

/**
 * Executes a single REA tool invocation through stdio transport on demand.
 * Spawns the REA MCP server child process, initializes protocol, invokes the tool,
 * and terminates cleanly without requiring a standing background HTTP daemon.
 */
export function executeReaViaStdio(
  tool: string,
  args: Record<string, unknown>,
  timeoutMs = 20000,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const config = resolveLocalReaConfig();
    if (!config.exists) {
      return reject(new Error(`REA script not found at '${config.scriptPath}'.`));
    }

    const proc = child_process.spawn(config.nodeBin, [config.scriptPath, "--mcp"], {
      env: config.env,
      stdio: ["pipe", "pipe", "inherit"],
    });

    let buffer = "";
    let msgId = 1;
    const pending = new Map<number, { resolve: (val: unknown) => void; reject: (err: Error) => void }>();

    proc.stdout.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as {
            id?: number;
            error?: { message?: string; code?: number };
            result?: unknown;
          };
          if (typeof msg.id === "number" && pending.has(msg.id)) {
            const entry = pending.get(msg.id)!;
            pending.delete(msg.id);
            if (msg.error) {
              entry.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            } else {
              entry.resolve(msg.result);
            }
          }
        } catch {
          // Ignore non-JSON log lines
        }
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn REA process: ${err.message}`));
    });

    const send = (method: string, params: Record<string, unknown> = {}): Promise<unknown> => {
      const id = msgId++;
      return new Promise((res, rej) => {
        pending.set(id, { resolve: res, reject: rej });
        proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
      });
    };

    let timer: NodeJS.Timeout | null = null;
    timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`REA stdio call '${tool}' timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    (async () => {
      try {
        await send("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "hypertaks-founder", version: "0.0.4.5.11" },
        });
        const result = await send("tools/call", { name: tool, arguments: args });
        if (timer) clearTimeout(timer);
        resolve(result);
      } catch (err: unknown) {
        if (timer) clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      } finally {
        proc.kill();
      }
    })();
  });
}

/**
 * Creates an invoker function for REA operations over on-demand stdio transport.
 */
export function createReaStdioInvoker(): (tool: string, args: Record<string, unknown>) => Promise<unknown> {
  return (tool: string, args: Record<string, unknown>) => executeReaViaStdio(tool, args);
}

/**
 * Discovers live local REA capabilities by querying tools/list over stdio.
 */
export async function probeLocalReaTools(timeoutMs = 10000): Promise<{
  readonly available: boolean;
  readonly tools: readonly string[];
  readonly version?: string;
}> {
  const config = resolveLocalReaConfig();
  if (!config.exists) {
    return { available: false, tools: [] };
  }

  return new Promise((resolve) => {
    let timer: NodeJS.Timeout | null = null;
    const proc = child_process.spawn(config.nodeBin, [config.scriptPath, "--mcp"], {
      env: config.env,
      stdio: ["pipe", "pipe", "inherit"],
    });

    let buffer = "";
    let msgId = 1;
    const pending = new Map<number, (res: any) => void>();

    proc.stdout.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as { id?: number; result?: any };
          if (typeof msg.id === "number" && pending.has(msg.id)) {
            const cb = pending.get(msg.id)!;
            pending.delete(msg.id);
            cb(msg.result);
          }
        } catch {}
      }
    });

    const send = (method: string, params: Record<string, unknown> = {}): Promise<any> => {
      const id = msgId++;
      return new Promise((res) => {
        pending.set(id, res);
        proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
      });
    };

    timer = setTimeout(() => {
      proc.kill();
      resolve({ available: false, tools: [] });
    }, timeoutMs);

    (async () => {
      try {
        const initRes = await send("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "hypertaks-founder", version: "0.0.4.5.11" },
        });
        const toolsRes = await send("tools/list", {});
        if (timer) clearTimeout(timer);
        proc.kill();
        const toolsList = Array.isArray(toolsRes?.tools) ? toolsRes.tools.map((t: any) => t.name) : [];
        resolve({
          available: true,
          tools: toolsList,
          version: initRes?.serverInfo?.version ?? "6.7.0",
        });
      } catch {
        if (timer) clearTimeout(timer);
        proc.kill();
        resolve({ available: false, tools: [] });
      }
    })();
  });
}

// ---------------------------------------------------------------------------
// Superpowers workflow adapter
// ---------------------------------------------------------------------------

/**
 * Superpowers process skills are absorbed as Hypertaks workflow capabilities.
 * A workflow fires only when its source skill is actually installed this session;
 * otherwise it is reported unavailable and skipped. This preserves the map in
 * skills/hypertaks/references/superpowers-map.md and the Founder's Phase 0-5 loop.
 */
export interface SuperpowersCapabilitySource extends CapabilitySource {
  readonly sourceId: "superpowers";
}

interface SuperpowersWorkflow {
  readonly skill: string;
  readonly capability_id: string;
  readonly public_name: string;
  readonly phase: string;
  readonly categories: readonly string[];
  readonly firesWhen: string;
}

const SUPERPOWERS_WORKFLOWS: readonly SuperpowersWorkflow[] = [
  {
    skill: "brainstorming",
    capability_id: "hypertaks-planning-workflow",
    public_name: "Hypertaks Planning Workflow",
    phase: "P1",
    categories: ["planning", "framing"],
    firesWhen: "Any creative or build task, before committing to an approach.",
  },
  {
    skill: "writing-plans",
    capability_id: "hypertaks-planning-workflow",
    public_name: "Hypertaks Planning Workflow",
    phase: "P3",
    categories: ["planning"],
    firesWhen: "Turning the approved contract into per-agent briefs or a multi-step plan.",
  },
  {
    skill: "systematic-debugging",
    capability_id: "hypertaks-debugging-workflow",
    public_name: "Hypertaks Debugging Workflow",
    phase: "P4",
    categories: ["debugging", "engineering"],
    firesWhen: "Any bug, test failure, or unexpected behavior.",
  },
  {
    skill: "test-driven-development",
    capability_id: "hypertaks-tdd-workflow",
    public_name: "Hypertaks TDD Workflow",
    phase: "P4",
    categories: ["tdd", "engineering"],
    firesWhen: "Any production code where RED-GREEN-REFACTOR earns its keep.",
  },
  {
    skill: "tdd",
    capability_id: "hypertaks-tdd-workflow",
    public_name: "Hypertaks TDD Workflow",
    phase: "P4",
    categories: ["tdd", "engineering"],
    firesWhen: "Any production code where RED-GREEN-REFACTOR earns its keep.",
  },
  {
    skill: "executing-plans",
    capability_id: "hypertaks-implementation-workflow",
    public_name: "Hypertaks Implementation Workflow",
    phase: "P4",
    categories: ["implementation", "engineering"],
    firesWhen: "Sequential build with review checkpoints.",
  },
  {
    skill: "subagent-driven-development",
    capability_id: "hypertaks-implementation-workflow",
    public_name: "Hypertaks Implementation Workflow",
    phase: "P4",
    categories: ["implementation", "orchestration"],
    firesWhen: "Orchestrated mode with parallel independent subtasks.",
  },
  {
    skill: "dispatching-parallel-agents",
    capability_id: "hypertaks-implementation-workflow",
    public_name: "Hypertaks Implementation Workflow",
    phase: "P4",
    categories: ["implementation", "orchestration"],
    firesWhen: "Hyper/Omega tiers with multi-workstream fan-out.",
  },
  {
    skill: "using-git-worktrees",
    capability_id: "hypertaks-implementation-workflow",
    public_name: "Hypertaks Implementation Workflow",
    phase: "P4",
    categories: ["implementation", "isolation"],
    firesWhen: "Parallel branches need isolation.",
  },
  {
    skill: "verification-before-completion",
    capability_id: "hypertaks-verification-workflow",
    public_name: "Hypertaks Verification Workflow",
    phase: "P5",
    categories: ["verification", "quality"],
    firesWhen: "Hard gate before any completion claim.",
  },
  {
    skill: "requesting-code-review",
    capability_id: "hypertaks-review-workflow",
    public_name: "Hypertaks Code Review Workflow",
    phase: "P5",
    categories: ["review", "quality"],
    firesWhen: "Pre-delivery review of a code artifact.",
  },
  {
    skill: "receiving-code-review",
    capability_id: "hypertaks-review-workflow",
    public_name: "Hypertaks Code Review Workflow",
    phase: "P5",
    categories: ["review", "quality"],
    firesWhen: "Applying received review feedback.",
  },
  {
    skill: "finishing-a-development-branch",
    capability_id: "hypertaks-handoff-workflow",
    public_name: "Hypertaks Branch Handoff Workflow",
    phase: "P5",
    categories: ["handoff", "version_control"],
    firesWhen: "Final merge, PR, or cleanup decision.",
  },
];

export function createSuperpowersCapabilitySource(): SuperpowersCapabilitySource {
  return {
    sourceId: "superpowers" as const,
    categories: ["planning", "debugging", "tdd", "implementation", "verification", "review", "handoff"],
    async discover(ctx: CapabilityDiscoveryContext) {
      const installed = new Set(ctx.hostSkills ?? []);
      const out: UnifiedCapabilityDescriptor[] = [];
      const emitted = new Set<string>();
      for (const workflow of SUPERPOWERS_WORKFLOWS) {
        if (emitted.has(workflow.capability_id)) continue;
        emitted.add(workflow.capability_id);
        const available = installed.has(workflow.skill);
        out.push({
          capability_id: workflow.capability_id,
          kind: "skill" as CapabilityKind,
          categories: workflow.categories,
          operations: ["execute"],
          side_effect: "reversible",
          approval_required: false,
          authentication: "none",
          external_system: available ? "superpowers" : null,
          context_cost: "medium",
          availability: available ? "verified" : "unavailable",
          capability_type: "workflow",
          provider: available ? "superpowers" : "superpowers-absent",
          provider_operation: available ? workflow.skill : null,
          public_name: workflow.public_name,
          io_contract: `Fires at Hypertaks ${workflow.phase}. ${workflow.firesWhen}`,
          platform: [],
          permissions: ["execute-workflow"],
          session_model: "stateless",
          evidence: { kind: "WORKFLOW_TRACE", provenanceFields: ["phase", "skill", "decision"] },
          fallback: "Use the equivalent first-party Hypertaks engineering reference for this phase.",
          error_model: "Skip when the source skill is absent; never fabricate a workflow step.",
        });
      }
      return out;
    },
  };
}

// ---------------------------------------------------------------------------
// Host-native and MCP sources
// ---------------------------------------------------------------------------

/**
 * Describes live host-native tools already exposed in the session. Each becomes
 * a Hypertaks native-tool capability. Metadata that the host does not assert is
 * reported unknown; permission and safety are never inferred from a friendly
 * description.
 */
export interface HostNativeCapabilitySource extends CapabilitySource {
  readonly sourceId: "host-native";
}

export function createHostNativeCapabilitySource(): HostNativeCapabilitySource {
  return {
    sourceId: "host-native" as const,
    categories: ["local_text_search", "web_browsing", "file_storage", "communication", "execution"],
    async discover(ctx: CapabilityDiscoveryContext) {
      const tools = ctx.hostTools ?? [];
      return tools.map((tool) => ({
        capability_id: `host:${tool}`,
        kind: "native_tool" as CapabilityKind,
        categories: ["unknown"],
        operations: ["execute"] as readonly Operation[],
        side_effect: "unknown" as SideEffect,
        approval_required: true,
        authentication: "unknown" as const,
        external_system: null,
        context_cost: "unknown" as const,
        availability: "verified" as Availability,
        capability_type: "unknown" as CapabilityType,
        provider: "host-native",
        provider_operation: tool,
        public_name: `Hypertaks Host Tool: ${tool}`,
        io_contract: "Contract provided by the host tool list; not asserted here.",
        platform: ctx.platform ? [ctx.platform] : [],
        permissions: [],
        session_model: "stateless" as SessionModel,
        evidence: { kind: "HOST_TOOL", provenanceFields: ["tool", "host"] },
        fallback: "Fall back to core reasoning; do not depend on an unasserted host tool.",
        error_model: "Verify callability before binding; degrade and report the gap.",
      }));
    },
  };
}

export interface McpCapabilitySource extends CapabilitySource {
  readonly sourceId: "mcp";
}

export function createMcpCapabilitySource(): McpCapabilitySource {
  return {
    sourceId: "mcp" as const,
    categories: ["unknown"],
    async discover(ctx: CapabilityDiscoveryContext) {
      const out: UnifiedCapabilityDescriptor[] = [];
      for (const server of ctx.mcpServers ?? []) {
        for (const tool of server.tools ?? []) {
          out.push({
            capability_id: `mcp:${server.name}:${tool}`,
            kind: "mcp_tool" as CapabilityKind,
            categories: ["unknown"],
            operations: ["execute"] as readonly Operation[],
            side_effect: "unknown" as SideEffect,
            approval_required: true,
            authentication: server.authenticated ? "present" : "unknown",
            external_system: server.name,
            context_cost: "unknown" as const,
            availability: "verified" as Availability,
            capability_type: "unknown" as CapabilityType,
            provider: `mcp:${server.name}`,
            provider_operation: tool,
            public_name: `Hypertaks MCP Capability: ${server.name}/${tool}`,
            io_contract: "Contract defined by the MCP server schema; not asserted here.",
            platform: [],
            permissions: [],
            session_model: "stateful" as SessionModel,
            evidence: { kind: "MCP_TOOL", provenanceFields: ["server", "tool"] },
            fallback: "Use a first-party Hypertaks capability or core reasoning for this need.",
            error_model: "Preserve read-only remote semantics; never upgrade a read-only remote op to a local mutation.",
          });
        }
      }
      return out;
    },
  };
}

// ---------------------------------------------------------------------------
// Hypertaks Native Capability Source
// ---------------------------------------------------------------------------

export interface HypertaksNativeCapabilitySource extends CapabilitySource {
  readonly sourceId: "hypertaks-native";
}

export function createHypertaksNativeCapabilitySource(): HypertaksNativeCapabilitySource {
  return {
    sourceId: "hypertaks-native" as const,
    categories: [
      "repository_intelligence",
      "architecture_analysis",
      "static_analysis",
      "dependency_analysis",
      "graph_intelligence",
      "continuity",
      "founder_brain",
      "state_reconciliation",
      "engineering",
      "verification",
      "debugging",
      "planning",
    ],
    async discover() {
      return [
        {
          capability_id: "hypertaks-repository-intelligence",
          kind: "native_tool" as CapabilityKind,
          categories: ["repository_intelligence", "architecture_analysis", "static_analysis"],
          operations: ["read"] as readonly Operation[],
          side_effect: "none" as SideEffect,
          approval_required: false,
          authentication: "none" as const,
          external_system: null,
          context_cost: "low" as const,
          availability: "verified" as Availability,
          capability_type: "investigation" as CapabilityType,
          provider: "hypertaks-native",
          provider_operation: "scanRepository",
          public_name: "Hypertaks Repository Intelligence",
          io_contract: "Read-only repository scanning and topological analysis.",
          platform: ["darwin", "linux", "windows"],
          permissions: ["read"],
          session_model: "stateless" as SessionModel,
          evidence: { kind: "SCAN_EVIDENCE", provenanceFields: ["canonicalRoot", "sha256"] },
          fallback: "Inspect repository files manually.",
          error_model: "Fails gracefully with diagnostic message if root cannot be read.",
        },
        {
          capability_id: "hypertaks-graph-intelligence",
          kind: "native_tool" as CapabilityKind,
          categories: ["dependency_analysis", "graph_intelligence"],
          operations: ["read"] as readonly Operation[],
          side_effect: "none" as SideEffect,
          approval_required: false,
          authentication: "none" as const,
          external_system: null,
          context_cost: "low" as const,
          availability: "verified" as Availability,
          capability_type: "retrieval" as CapabilityType,
          provider: "hypertaks-native",
          provider_operation: "localGraph",
          public_name: "Hypertaks Graph Intelligence",
          io_contract: "Dependency, impact, and blast-radius graph query service.",
          platform: ["darwin", "linux", "windows"],
          permissions: ["read"],
          session_model: "stateless" as SessionModel,
          evidence: { kind: "GRAPH_EVIDENCE", provenanceFields: ["nodeId", "reachability"] },
          fallback: "Inspect imports and callers directly in source files.",
          error_model: "Returns empty set if target node is missing from graph.",
        },
        {
          capability_id: "hypertaks-brain-continuity",
          kind: "native_tool" as CapabilityKind,
          categories: ["continuity", "founder_brain", "state_reconciliation"],
          operations: ["read", "update"] as readonly Operation[],
          side_effect: "none" as SideEffect,
          approval_required: false,
          authentication: "none" as const,
          external_system: null,
          context_cost: "low" as const,
          availability: "verified" as Availability,
          capability_type: "knowledge" as CapabilityType,
          provider: "hypertaks-native",
          provider_operation: "founderBrain",
          public_name: "Hypertaks Brain & Continuity",
          io_contract: "Evidence-backed founder memory and task checkpoint management.",
          platform: ["darwin", "linux", "windows"],
          permissions: ["read", "write"],
          session_model: "stateless" as SessionModel,
          evidence: { kind: "BRAIN_EVIDENCE", provenanceFields: ["recordId", "freshness"] },
          fallback: "Rely on current conversation context without persistent memory.",
          error_model: "Fail closed if memory record contradicts established facts.",
        },
        {
          capability_id: "hypertaks-engineering-verification",
          kind: "native_tool" as CapabilityKind,
          categories: ["engineering", "verification"],
          operations: ["execute"] as readonly Operation[],
          side_effect: "none" as SideEffect,
          approval_required: false,
          authentication: "none" as const,
          external_system: null,
          context_cost: "low" as const,
          availability: "verified" as Availability,
          capability_type: "workflow" as CapabilityType,
          provider: "hypertaks-native",
          provider_operation: "verify",
          public_name: "Hypertaks Engineering Verification",
          io_contract: "Verification before completion: run build, typecheck, tests, and diff checks.",
          platform: ["darwin", "linux", "windows"],
          permissions: ["execute"],
          session_model: "stateless" as SessionModel,
          evidence: { kind: "TEST_EVIDENCE", provenanceFields: ["exitCode", "testCount"] },
          fallback: "Manual inspection of build and test outputs.",
          error_model: "Reports failure if verification checks do not pass.",
        },
      ];
    },
  };
}

// ---------------------------------------------------------------------------
// Intent Inference
// ---------------------------------------------------------------------------

export function inferNeedsFromIntent(intent: string): readonly CapabilityNeed[] {
  const lower = intent.toLowerCase();
  const needs: CapabilityNeed[] = [];

  // 1. Debugging & Error resolution (EN & ID)
  if (
    lower.includes("bug") ||
    lower.includes("fix") ||
    lower.includes("error") ||
    lower.includes("failing test") ||
    lower.includes("debug") ||
    lower.includes("crash") ||
    lower.includes("exception") ||
    lower.includes("perbaiki") ||
    lower.includes("rusak") ||
    lower.includes("benerin") ||
    lower.includes("masalah") ||
    lower.includes("kendala") ||
    lower.includes("kesalahan") ||
    lower.includes("eror")
  ) {
    needs.push({
      category: "debugging",
      operation: "execute",
      allowSideEffects: true,
    });
  }

  // 2. Binary intelligence & Reverse engineering (EN & ID)
  if (
    lower.includes("executable") ||
    lower.includes("binary") ||
    lower.includes("mach-o") ||
    lower.includes("macho") ||
    /\bpe\b/.test(lower) ||
    lower.includes("decompile") ||
    lower.includes("reverse engineer") ||
    lower.includes("disassemble") ||
    lower.includes("biner") ||
    lower.includes("dekompilasi") ||
    lower.includes("rekayasa balik")
  ) {
    needs.push({
      category: "binary_intelligence",
      operation: "read",
      allowSideEffects: false,
      allowedExternalSystems: ["rea"],
    });
  }

  // 3. Dependency & Graph analysis (EN & ID)
  if (
    lower.includes("dependency") ||
    lower.includes("blast radius") ||
    lower.includes("impact analysis") ||
    lower.includes("call graph") ||
    lower.includes("graph intelligence") ||
    lower.includes("relationship") ||
    lower.includes("dependensi") ||
    lower.includes("ketergantungan") ||
    lower.includes("relasi") ||
    lower.includes("graf") ||
    lower.includes("radius dampak")
  ) {
    needs.push({
      category: "dependency_analysis",
      operation: "read",
      allowSideEffects: false,
    });
  }

  // 4. Continuity & Memory (EN & ID)
  if (
    lower.includes("continue") ||
    lower.includes("resume") ||
    lower.includes("checkpoint") ||
    lower.includes("memory") ||
    lower.includes("continuity") ||
    lower.includes("previous project") ||
    lower.includes("lanjutkan") ||
    lower.includes("ingatan") ||
    lower.includes("memori") ||
    lower.includes("riwayat") ||
    lower.includes("proyek sebelumnya")
  ) {
    needs.push({
      category: "continuity",
      operation: "read",
      allowSideEffects: false,
    });
  }

  // 5. Repository screening & Architecture (EN & ID)
  if (
    lower.includes("repository architecture") ||
    lower.includes("repo architecture") ||
    lower.includes("codebase structure") ||
    lower.includes("scan repo") ||
    lower.includes("screening") ||
    lower.includes("screen repository") ||
    lower.includes("arsitektur") ||
    lower.includes("struktur kode") ||
    lower.includes("pindai") ||
    lower.includes("bedah kode") ||
    lower.includes("telaah")
  ) {
    needs.push({
      category: "repository_intelligence",
      operation: "read",
      allowSideEffects: false,
    });
  }

  // 6. TDD & Engineering verification (EN & ID)
  if (
    lower.includes("tdd") ||
    lower.includes("test-driven") ||
    lower.includes("red-green") ||
    lower.includes("unit test") ||
    lower.includes("uji") ||
    lower.includes("pengujian") ||
    lower.includes("verifikasi")
  ) {
    needs.push({
      category: "tdd",
      operation: "execute",
      allowSideEffects: true,
    });
  }

  // 7. Planning & Discovery (EN & ID)
  if (
    lower.includes("plan") ||
    lower.includes("brainstorm") ||
    lower.includes("design") ||
    lower.includes("feature") ||
    lower.includes("rencana") ||
    lower.includes("rancang") ||
    lower.includes("fitur")
  ) {
    needs.push({
      category: "planning",
      operation: "execute",
      allowSideEffects: false,
    });
  }

  if (needs.length === 0) {
    needs.push({
      category: "static_analysis",
      operation: "read",
      allowSideEffects: false,
    });
  }

  return needs;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export interface UnmetNeed {
  readonly category: string;
  readonly operation: Operation;
  readonly reason: string;
}

export interface CapabilitySelection {
  /** The minimum verified capability set the Founder may bind. */
  readonly selected: readonly UnifiedCapabilityDescriptor[];
  /** All discovered descriptors across the queried sources. */
  readonly discovered: readonly UnifiedCapabilityDescriptor[];
  /** Needs that no discovered capability could satisfy. */
  readonly unmet: readonly UnmetNeed[];
  /** Human-readable routing notes, branded Hypertaks, for the agent brief. */
  readonly notes: readonly string[];
}

export interface SelectArguments {
  readonly needs: readonly CapabilityNeed[];
  /** Allow mutating side effects for this task. Screening defaults to false. */
  readonly allowSideEffects?: boolean;
  /** External systems the task may touch (e.g. "rea"). */
  readonly allowedExternalSystems?: readonly string[];
  /** Approval already granted by the Founder for contract activation. */
  readonly approvalGranted?: boolean;
}

export interface CapabilityExecutionContext {
  readonly canonicalRoot?: string;
  readonly approvalGranted?: boolean;
  /** Required in addition to approval before a mutating, instrumenting, or unknown-effect tool may run. */
  readonly allowSideEffects?: boolean;
  readonly contractId?: string;
  readonly mcpInvoker?: (server: string, tool: string, args: Record<string, unknown>) => Promise<unknown>;
  readonly hostInvoker?: (tool: string, args: Record<string, unknown>) => Promise<unknown>;
  readonly reaInvoker?: (tool: string, args: Record<string, unknown>) => Promise<unknown>;
  readonly useLocalStdioRea?: boolean;
  /**
   * Trusted session hints for this execution. Host and MCP descriptors are
   * rediscovered from this context. Omitting it discovers no session tools.
   * Arguments in `input` are never treated as discovery hints.
   */
  readonly discovery?: CapabilityDiscoveryContext;
}

export interface CapabilityExecutionResult {
  readonly success: boolean;
  readonly capability_id: string;
  readonly provider: string;
  readonly status: "executed" | "unverified" | "unavailable" | "denied" | "failed";
  readonly output: unknown;
  readonly evidence?: {
    readonly kind: string;
    readonly timestamp: string;
    readonly provenance: Record<string, unknown>;
  };
  readonly error?: string;
  readonly reconciliation?: string;
}

/**
 * Classify the side effect of an operation and target fail-closed.
 * Reads are "none". Safe edits are "reversible". Deletions, process executions,
 * and device instrumentation are "irreversible". Unknown operations fail closed as "unknown".
 */
export function classifyEffect(operation: string, targetType?: string): SideEffect {
  const op = operation.toLowerCase();
  const target = targetType?.toLowerCase();

  if (op === "read" || op === "query" || op === "scan" || op === "inspect") {
    return "none";
  }
  if (op === "create" || op === "update" || op === "edit" || op === "annotate" || op === "comment") {
    if (target === "device" || target === "instrumentation") return "irreversible";
    return "reversible";
  }
  if (op === "delete" || op === "drop" || op === "overwrite" || op === "instrument" || op === "execute" || op === "spawn") {
    return "irreversible";
  }
  if (target === "memory") {
    return "reversible";
  }
  if (target === "instrumentation" || target === "device") {
    return "irreversible";
  }
  return "unknown";
}

/**
 * The unified capability engine. It ties together lazy discovery, normalization,
 * filtering, binding, verification, execution, and fallback. It reuses bindCapabilities()
 * from router.ts for the actual filter/bind decision and adds need-before-
 * discovery source selection plus fallback reporting.
 */
function readableDirectory(root: string): string | null {
  try {
    const resolved = path.resolve(root);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) return null;
    return resolved;
  } catch {
    return null;
  }
}

function nonSuccess(
  desc: { capability_id: string; provider: string },
  status: "unverified" | "unavailable" | "denied" | "failed",
  error: string,
  reconciliation: string,
  output: unknown = null,
): CapabilityExecutionResult {
  return {
    success: false,
    capability_id: desc.capability_id,
    provider: desc.provider,
    status,
    output,
    error,
    reconciliation,
  };
}

function providerFailureText(output: unknown): string | null {
  if (!output || typeof output !== "object" || Array.isArray(output)) return null;
  const record = output as Record<string, unknown>;
  if (record.isError !== true) return null;
  const parts: string[] = [];
  if (Array.isArray(record.content)) {
    for (const item of record.content) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const text = (item as Record<string, unknown>).text;
      if (typeof text === "string" && text.length > 0) parts.push(text);
    }
  }
  return redactSecrets(parts.join("\n") || "MCP tool result reported isError: true.");
}

function redactFailedProviderOutput(output: unknown): unknown {
  if (!output || typeof output !== "object" || Array.isArray(output)) return output;
  const record = output as Record<string, unknown>;
  if (!Array.isArray(record.content)) return output;
  return {
    ...record,
    content: record.content.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;
      const entry = item as Record<string, unknown>;
      if (typeof entry.text !== "string") return item;
      return { ...entry, text: redactSecrets(entry.text) };
    }),
  };
}

function fromProviderResult(
  desc: UnifiedCapabilityDescriptor,
  provider: string,
  timestamp: string,
  output: unknown,
  provenance: Record<string, unknown>,
): CapabilityExecutionResult {
  const failure = providerFailureText(output);
  if (failure) {
    return {
      success: false,
      capability_id: desc.capability_id,
      provider,
      status: "failed",
      output: redactFailedProviderOutput(output),
      error: failure,
      reconciliation: "Provider reported a tool error. The original error content is preserved with secrets redacted.",
    };
  }
  return {
    success: true,
    capability_id: desc.capability_id,
    provider,
    status: "executed",
    output,
    evidence: {
      kind: desc.evidence.kind,
      timestamp,
      provenance,
    },
  };
}

function authorizeReaTool(
  desc: UnifiedCapabilityDescriptor,
  input: Record<string, unknown>,
  ctx: CapabilityExecutionContext,
): { ok: true; tool: string; toolArgs: Record<string, unknown> } | { ok: false; result: CapabilityExecutionResult } {
  const authorized = (desc.provider_operation ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const requested = typeof input.tool === "string" ? input.tool.trim() : "";
  const only = authorized.length === 1 ? authorized[0] : undefined;
  const tool = requested || only || "";
  if (!tool || !authorized.includes(tool)) {
    return {
      ok: false,
      result: nonSuccess(
        desc,
        "denied",
        `REA tool '${tool || "(missing)"}' is not an authorized operation of capability '${desc.capability_id}'.`,
        "Request a tool that belongs to this capability's discovered operation set.",
      ),
    };
  }
  const classification = classifyReaTool(tool);
  if (classification === null || classification.mutating) {
    const sideEffectAuthorized = ctx.allowSideEffects === true && desc.side_effect !== "none";
    if (ctx.approvalGranted !== true || !sideEffectAuthorized) {
      return {
        ok: false,
        result: nonSuccess(
          desc,
          "denied",
          `REA tool '${tool}' was not executed: side effect authorization is missing.`,
          "Grant Founder approval and explicit side effect permission before invoking a mutating, instrumenting, or unknown-effect REA tool.",
        ),
      };
    }
  }
  const toolArgs: Record<string, unknown> = { ...input };
  delete toolArgs.tool;
  return { ok: true, tool, toolArgs };
}

export class UnifiedCapabilityEngine {
  private readonly sources: readonly CapabilitySource[];

  constructor(sources: readonly CapabilitySource[]) {
    this.sources = [...sources];
  }

  /**
   * Select the minimum sufficient capability set for the approved needs.
   * Only sources that can serve a needed category are queried.
   */
  public async select(args: SelectArguments, ctx: CapabilityDiscoveryContext): Promise<CapabilitySelection> {
    const rawNeeds = args.needs;
    // Propagate args-level permissions and external systems to each need so bindCapabilities
    // receives them without false-negative gating.
    const effectiveNeeds: CapabilityNeed[] = rawNeeds.map((need) => {
      const allowedExt = need.allowedExternalSystems ?? args.allowedExternalSystems;
      const effective: {
        category: string;
        operation: Operation;
        allowSideEffects: boolean;
        approvalGranted: boolean;
        allowedExternalSystems?: readonly string[];
      } = {
        category: need.category,
        operation: need.operation,
        allowSideEffects: need.allowSideEffects ?? args.allowSideEffects ?? false,
        approvalGranted: need.approvalGranted ?? args.approvalGranted ?? false,
      };
      if (allowedExt !== undefined) {
        effective.allowedExternalSystems = allowedExt;
      }
      return effective;
    });

    const neededCategories = new Set<string>();
    for (const need of effectiveNeeds) neededCategories.add(need.category);

    const queried: CapabilitySource[] = [];
    const discoveredRaw: UnifiedCapabilityDescriptor[] = [];
    for (const source of this.sources) {
      if (!source.categories.some((category) => neededCategories.has(category))) continue;
      queried.push(source);
      discoveredRaw.push(...(await source.discover(ctx)));
    }

    // Deduplicate discovered descriptors by capability_id, preferring verified availability
    // and lower context cost.
    const discoveredMap = new Map<string, UnifiedCapabilityDescriptor>();
    for (const desc of discoveredRaw) {
      const existing = discoveredMap.get(desc.capability_id);
      if (!existing) {
        discoveredMap.set(desc.capability_id, desc);
      } else if (existing.availability !== "verified" && desc.availability === "verified") {
        discoveredMap.set(desc.capability_id, desc);
      }
    }
    const discovered = Array.from(discoveredMap.values());

    // bindCapabilities enforces availability, category, operation, side-effect,
    // approval, and external-system gates, then picks the lowest-cost survivor.
    const selected = bindCapabilities(effectiveNeeds, discovered) as readonly UnifiedCapabilityDescriptor[];

    // Unmet needs: check whether each effective need was satisfied by at least one selected capability
    const unmet: UnmetNeed[] = [];
    for (const need of effectiveNeeds) {
      const isSatisfied = selected.some(
        (survivor) =>
          survivor.categories.includes(need.category) &&
          survivor.operations.includes(need.operation),
      );
      if (!isSatisfied) {
        unmet.push({
          category: need.category,
          operation: need.operation,
          reason: noBindingReason(need, discovered),
        });
      }
    }

    const notes = buildNotes(selected, unmet, queried);
    return { selected, discovered, unmet, notes };
  }

  /**
   * Execute an operational capability. Dispatches to the underlying provider adapter,
   * verifies permissions, captures evidence, and normalizes output.
   */
  public async execute(
    capabilityId: string,
    input: Record<string, unknown> = {},
    ctx: CapabilityExecutionContext = {},
  ): Promise<CapabilityExecutionResult> {
    const discoveryCtx: CapabilityDiscoveryContext = ctx.discovery ?? {};
    const allDiscovered: UnifiedCapabilityDescriptor[] = [];
    for (const source of this.sources) {
      allDiscovered.push(...(await source.discover(discoveryCtx)));
    }
    const descriptor = allDiscovered.find((d) => d.capability_id === capabilityId);
    if (!descriptor) {
      return {
        success: false,
        capability_id: capabilityId,
        provider: "unknown",
        status: "unavailable",
        output: null,
        error: `Capability '${capabilityId}' is not registered or discovered in this session.`,
        reconciliation: "Verify provider discovery hints or check capability id spelling.",
      };
    }

    // Secure binding & approval check
    if (descriptor.approval_required && ctx.approvalGranted !== true) {
      return {
        success: false,
        capability_id: capabilityId,
        provider: descriptor.provider,
        status: "denied",
        output: null,
        error: `Execution denied: capability '${descriptor.public_name}' requires explicit Boss approval.`,
        reconciliation: `Obtain contract approval for contract '${ctx.contractId || "HT-CONTRACT"}' before execution.`,
      };
    }

    const now = new Date().toISOString();
    try {
      if (descriptor.provider === "hypertaks-native") {
        return await this.executeNative(descriptor, input, ctx, now);
      }
      if (descriptor.provider === "rea") {
        return await this.executeRea(descriptor, input, ctx, now);
      }
      if (descriptor.provider.startsWith("mcp:")) {
        const serverName = descriptor.provider.slice(4);
        return await this.executeMcp(serverName, descriptor, input, ctx, now);
      }
      if (descriptor.provider === "host-native") {
        return await this.executeHost(descriptor, input, ctx, now);
      }
      if (descriptor.provider === "superpowers") {
        return await this.executeSuperpowers(descriptor, input, ctx, now);
      }

      return {
        success: false,
        capability_id: capabilityId,
        provider: descriptor.provider,
        status: "unverified",
        output: null,
        error: `Unsupported provider execution path for '${descriptor.provider}'.`,
        reconciliation: "Register a provider adapter with an operational execution handler.",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        capability_id: capabilityId,
        provider: descriptor.provider,
        status: "failed",
        output: null,
        error: `Execution failed: ${redactSecrets(message)}`,
        reconciliation: "Inspect error log and check provider connection.",
      };
    }
  }

  private async executeNative(
    desc: UnifiedCapabilityDescriptor,
    input: Record<string, unknown>,
    ctx: CapabilityExecutionContext,
    timestamp: string,
  ): Promise<CapabilityExecutionResult> {
    const op = desc.provider_operation ?? "";
    const rootInput = ctx.canonicalRoot ?? (typeof input.root === "string" ? input.root : "");
    if (!rootInput) {
      return nonSuccess(
        desc,
        "unverified",
        `Native operation '${op || "unknown"}' was not executed: no repository root was provided.`,
        "Pass a readable repository root.",
      );
    }
    const root = readableDirectory(rootInput);
    if (!root) {
      return nonSuccess(
        desc,
        "failed",
        `Native operation '${op || "unknown"}' was not executed: root '${rootInput}' is not a readable directory.`,
        "Provide an existing repository directory.",
      );
    }

    try {
      if (op === "scanRepository") {
        const depth = input.depth === "shallow" || input.depth === "deep" ? input.depth : undefined;
        const scan = depth ? scanRepository(root, { depth }) : scanRepository(root);
        return {
          success: true,
          capability_id: desc.capability_id,
          provider: "hypertaks-native",
          status: "executed",
          output: scan,
          evidence: {
            kind: desc.evidence.kind,
            timestamp,
            provenance: {
              provider: "hypertaks-native",
              operation: op,
              root,
              fileCount: scan.files.length,
            },
          },
        };
      }

      if (op === "localGraph") {
        const loaded = loadLocalGraphFromDisk(root);
        const graph = loaded ?? buildLocalGraph(root, scanRepository(root));
        const nodeId = typeof input.nodeId === "string" ? input.nodeId : "";
        const output: Record<string, unknown> = {
          root,
          source: loaded ? "disk" : "built",
          nodeCount: graph.getNodes().length,
          edgeCount: graph.getEdges().length,
        };
        if (nodeId) output.impact = analyzeImpact(nodeId, graph);
        return {
          success: true,
          capability_id: desc.capability_id,
          provider: "hypertaks-native",
          status: "executed",
          output,
          evidence: {
            kind: desc.evidence.kind,
            timestamp,
            provenance: {
              provider: "hypertaks-native",
              operation: op,
              root,
              source: output.source,
              nodeCount: output.nodeCount,
            },
          },
        };
      }

      if (op === "founderBrain") {
        const action = typeof input.action === "string" ? input.action : "read";
        if (action !== "read") {
          return nonSuccess(
            desc,
            "unverified",
            `founderBrain action '${action}' was not executed: no write handler is bound.`,
            "readPointer is the established read contract. A write was not performed.",
          );
        }
        const pointer = readPointer(root);
        return {
          success: true,
          capability_id: desc.capability_id,
          provider: "hypertaks-native",
          status: "executed",
          output: pointer,
          evidence: {
            kind: desc.evidence.kind,
            timestamp,
            provenance: {
              provider: "hypertaks-native",
              operation: op,
              root,
              pointerStatus: pointer.status,
            },
          },
        };
      }

      if (op === "verify") {
        const identity = readRepoIdentity(root);
        if (!identity) {
          return nonSuccess(
            desc,
            "unverified",
            `Verification was not executed: no repo identity was found under '${root}'.`,
            "Initialize the repository vault before requesting verification.",
          );
        }
        const report = verifyProjectOperatingContext(root, identity);
        if (!report.passed) {
          return {
            success: false,
            capability_id: desc.capability_id,
            provider: "hypertaks-native",
            status: "failed",
            output: report,
            error: "Verification checks did not pass.",
            reconciliation: "Inspect the verification report. A failed check is not execution success.",
          };
        }
        return {
          success: true,
          capability_id: desc.capability_id,
          provider: "hypertaks-native",
          status: "executed",
          output: report,
          evidence: {
            kind: desc.evidence.kind,
            timestamp,
            provenance: { provider: "hypertaks-native", operation: op, root, passed: true },
          },
        };
      }

      return nonSuccess(
        desc,
        "unverified",
        `Native operation '${op || "unknown"}' has no execution handler.`,
        "Supported native operations are scanRepository, localGraph, founderBrain, and verify.",
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return nonSuccess(
        desc,
        "failed",
        `Native operation '${op || "unknown"}' failed: ${redactSecrets(message)}`,
        "Inspect the diagnostic. The operation was not reported as successful.",
      );
    }
  }

  private async executeRea(
    desc: UnifiedCapabilityDescriptor,
    input: Record<string, unknown>,
    ctx: CapabilityExecutionContext,
    timestamp: string,
  ): Promise<CapabilityExecutionResult> {
    const auth = authorizeReaTool(desc, input, ctx);
    if (!auth.ok) return auth.result;
    const { tool, toolArgs } = auth;
    const provenance: Record<string, unknown> = { provider: "rea", operation: tool, input: toolArgs };

    if (ctx.reaInvoker) {
      const output = await ctx.reaInvoker(tool, toolArgs);
      return fromProviderResult(desc, "rea", timestamp, output, provenance);
    }

    if (ctx.mcpInvoker) {
      const output = await ctx.mcpInvoker("rea", tool, toolArgs);
      return fromProviderResult(desc, "rea", timestamp, output, provenance);
    }

    if (ctx.useLocalStdioRea) {
      try {
        const output = await executeReaViaStdio(tool, toolArgs);
        return fromProviderResult(desc, "rea", timestamp, output, { ...provenance, transport: "stdio" });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return nonSuccess(
          desc,
          "failed",
          `REA stdio execution failed: ${redactSecrets(message)}`,
          "Verify local REA installation and arguments.",
        );
      }
    }

    return nonSuccess(
      desc,
      "unverified",
      "REA MCP provider is unavailable or unreachable in the current session.",
      "Connect a live REA MCP endpoint or set useLocalStdioRea before executing binary investigation operations.",
    );
  }

  private async executeMcp(
    server: string,
    desc: UnifiedCapabilityDescriptor,
    input: Record<string, unknown>,
    ctx: CapabilityExecutionContext,
    timestamp: string,
  ): Promise<CapabilityExecutionResult> {
    const tool = desc.provider_operation ?? desc.capability_id;
    if (!ctx.mcpInvoker) {
      return nonSuccess(
        desc,
        "unverified",
        `MCP server '${server}' invoker is not configured in this session.`,
        "Provide a valid MCP transport or invoker function.",
      );
    }

    const output = await ctx.mcpInvoker(server, tool, input);
    return fromProviderResult(desc, desc.provider, timestamp, output, { server, tool, input });
  }

  private async executeHost(
    desc: UnifiedCapabilityDescriptor,
    input: Record<string, unknown>,
    ctx: CapabilityExecutionContext,
    timestamp: string,
  ): Promise<CapabilityExecutionResult> {
    const tool = desc.provider_operation ?? desc.capability_id;
    if (!ctx.hostInvoker) {
      return nonSuccess(
        desc,
        "unverified",
        `Host-native capability '${desc.public_name}' was not executed: no host invoker is configured.`,
        "Provide a callable host invoker before execution.",
      );
    }
    const output = await ctx.hostInvoker(tool, input);
    return fromProviderResult(desc, "host-native", timestamp, output, { provider: "host-native", tool });
  }

  private async executeSuperpowers(
    desc: UnifiedCapabilityDescriptor,
    _input: Record<string, unknown>,
    _ctx: CapabilityExecutionContext,
    _timestamp: string,
  ): Promise<CapabilityExecutionResult> {
    const workflow = desc.provider_operation ?? desc.capability_id;
    return nonSuccess(
      desc,
      "unverified",
      `Superpowers workflow '${workflow}' is guidance only; no workflow executor was invoked.`,
      "Use the workflow as guidance. A descriptor is not completed execution.",
    );
  }

  /**
   * Select capabilities inferred directly from user intent.
   * Maps intent to minimal sufficient needs, queries sources, and binds survivors.
   */
  public async selectForIntent(
    intent: string,
    args?: Partial<SelectArguments>,
    ctx: CapabilityDiscoveryContext = {},
  ): Promise<CapabilitySelection> {
    const inferred = inferNeedsFromIntent(intent);
    const needs = args?.needs && args.needs.length > 0 ? args.needs : inferred;
    const selectArgs: {
      needs: readonly CapabilityNeed[];
      allowSideEffects?: boolean;
      allowedExternalSystems?: readonly string[];
      approvalGranted?: boolean;
    } = { needs };

    const allowSide = args?.allowSideEffects ?? inferred[0]?.allowSideEffects;
    if (allowSide !== undefined) {
      selectArgs.allowSideEffects = allowSide;
    }
    const allowedExt = args?.allowedExternalSystems ?? inferred[0]?.allowedExternalSystems;
    if (allowedExt !== undefined) {
      selectArgs.allowedExternalSystems = allowedExt;
    }
    if (args?.approvalGranted !== undefined) {
      selectArgs.approvalGranted = args.approvalGranted;
    }

    return this.select(selectArgs as SelectArguments, ctx);
  }

  /** List the capability sources registered with this engine. */
  public listSources(): readonly string[] {
    return this.sources.map((source) => source.sourceId);
  }
}

function noBindingReason(need: CapabilityNeed, discovered: readonly UnifiedCapabilityDescriptor[]): string {
  const candidates = discovered.filter(
    (descriptor) => descriptor.categories.includes(need.category) && descriptor.operations.includes(need.operation),
  );
  if (candidates.length === 0) {
    return "No discovered capability serves this category and operation.";
  }
  const reasons = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.availability !== "verified") {
      reasons.add(`available only as ${candidate.availability} (${candidate.provider})`);
    } else if (need.allowSideEffects === false && candidate.side_effect !== "none") {
      reasons.add(`requires disallowed side effect ${candidate.side_effect}`);
    } else if (candidate.approval_required && need.approvalGranted !== true) {
      reasons.add("requires Founder approval");
    } else if (candidate.authentication === "missing") {
      reasons.add("authentication missing");
    }
  }
  return reasons.size > 0 ? `candidates exist but gated: ${[...reasons].join("; ")}.` : "no surviving candidate.";
}

function buildNotes(
  selected: readonly UnifiedCapabilityDescriptor[],
  unmet: readonly UnmetNeed[],
  queried: readonly CapabilitySource[],
): string[] {
  const notes: string[] = [];
  notes.push(
    `Hypertaks capability routing queried ${queried.length} source(s): ${queried
      .map((source) => source.sourceId)
      .join(", ") || "none"}.`,
  );
  for (const item of selected) {
    notes.push(
      `Bound ${item.public_name} (${item.capability_id}) via ${item.provider}` +
        (item.provider_operation ? ` [${item.provider_operation}]` : "") +
        ` as ${item.side_effect === "none" ? "read-only" : item.side_effect}${
          item.approval_required ? "; approval required" : ""
        }.`,
    );
  }
  for (const gap of unmet) {
    notes.push(`Unmet ${gap.category}/${gap.operation}: ${gap.reason} Falling back to core reasoning.`);
  }
  return notes;
}

/**
 * Default engine for a Founder session. Composes the first-party sources with
 * the REA and Superpowers adapters. REA is only wired when a real discovery
 * hint is supplied by the caller; otherwise its capabilities report unavailable.
 */
export function createDefaultCapabilityEngine(reaHint?: ReaEndpointHint): UnifiedCapabilityEngine {
  const sources: CapabilitySource[] = [
    createHypertaksNativeCapabilitySource(),
    createSuperpowersCapabilitySource(),
    createHostNativeCapabilitySource(),
    createMcpCapabilitySource(),
  ];
  if (reaHint) sources.push(createReaCapabilitySource(reaHint));
  return new UnifiedCapabilityEngine(sources);
}
