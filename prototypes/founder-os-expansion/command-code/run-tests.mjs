/**
 * Test harness for the Ticket #7 prototype.
 * Runs the eight fixtures plus invariant checks and writes a
 * state-transition evidence transcript under evidence/.
 *
 * Run:  node run-tests.mjs
 * Exit: 0 if every assertion holds, 1 otherwise.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ToolDescriptor, ToolRegistry, NativeToolFacade, EffectLedger,
  ExecutionEnvelope, mintBossApprovalProof,
  findSecrets, redactSecrets, syntheticSecret, SideEffect, TRANSACTION_STATE,
  PUBLIC_MCP_TOOL_IDS, CANONICAL_DESCRIPTORS,
} from "./tool-registry.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url)).replace(/\\/g, "/").replace(/\/+$/, "");
const FIX = join(ROOT, "fixtures");
const EVIDENCE = join(ROOT, "evidence");

const log = [];
function emit(event) {
  const entry = { t: new Date().toISOString(), ...event };
  log.push(entry);
  console.log(JSON.stringify(entry));
}

const PROOF = {
  contractId: "HT-20260811-FOS",
  messageId: "boss-turn-001",
  approvedAt: "2026-08-11T00:00:00.000Z",
};

let failures = 0;
function check(name, condition, detail) {
  const ok = Boolean(condition);
  emit({ kind: "assertion", name, ok, detail: ok ? undefined : String(detail) });
  if (!ok) failures++;
  return ok;
}

async function loadFixture(name) {
  const raw = await readFile(join(FIX, name), "utf8");
  return JSON.parse(raw);
}

function sharedEnvelope() {
  return new ExecutionEnvelope({ exactRoot: ROOT, timeoutMs: 1000, maxOutputBytes: 65536, maxRetries: 2, maxEffects: 1 });
}

function facade_for_read(registry) {
  return new NativeToolFacade(registry, new EffectLedger(join(EVIDENCE.replace(/\/$/, "") + "/read-ledg")));
}

async function main() {
  await mkdir(EVIDENCE, { recursive: true });
  emit({ kind: "start", prototype: "command-code", contract: "HT-20260811-FOS", node: process.version });

  const registry = new ToolRegistry();

  // --- 1. Registry integrity: the public MCP surface stays four read-only tools ---
  const expected = ["hypertaks_manifest", "hypertaks_get_skill", "hypertaks_route", "hypertaks_verify_installation"].sort();
  check("public_mcp_surface_is_four_readonly_tools",
    PUBLIC_MCP_TOOL_IDS.length === 4 && JSON.stringify([...PUBLIC_MCP_TOOL_IDS].sort()) === JSON.stringify(expected),
    `got ${JSON.stringify(PUBLIC_MCP_TOOL_IDS)}`);
  const allPublicReadOnly = CANONICAL_DESCRIPTORS
    .filter((d) => d.publicSurface)
    .every((d) => d.sideEffect === SideEffect.NONE && d.permission === "PERM_NONE" && d.approvalRule === "none");
  check("public_tools_are_readonly_by_effect", allPublicReadOnly);
  const noPublicNative = CANONICAL_DESCRIPTORS.filter((d) => d.publicSurface).every((d) => d.kind === "remote_mcp");
  check("no_public_native_capability", noPublicNative);

  // --- 2. Malformed descriptor rejected (fail closed) ---
  const malformed = await loadFixture("malformed-descriptor.json");
  let threw = false;
  try {
    new ToolDescriptor(malformed.invalidDescriptor);
  } catch (e) {
    threw = true;
    emit({ kind: "reject", scenario: "malformed-descriptor", error: e.message });
  }
  check("malformed_descriptor_rejected", threw, "constructor did not throw");

  // --- 3. Capability normalization / deterministic selection ---
  check("resolve_canonical_id", registry.resolveCapabilityId("hypertaks_context") === "hypertaks_context");
  check("resolve_alias_context", registry.resolveCapabilityId("context") === "hypertaks_context");
  check("resolve_alias_retrieve", registry.resolveCapabilityId("retrieve") === "hypertaks_retrieve");
  let unknownThrew = false;
  try { registry.resolveCapabilityId("does-not-exist"); } catch { unknownThrew = true; }
  check("resolve_unknown_rejected", unknownThrew);

  // --- 4. Permission denied by effect, no effect recorded ---
  const denyFixture = await loadFixture("permission-denied.json");
  const denyRegistry = new ToolRegistry([
    ...CANONICAL_DESCRIPTORS,
    new ToolDescriptor(denyFixture.descriptorOverride),
  ]);
  const denyLedger = new EffectLedger(join(EVIDENCE, "deny-ledger"));
  const denyFacade = new NativeToolFacade(denyRegistry, denyLedger);
  let denied = false;
  let preparedTxDeny = null;
  try {
    preparedTxDeny = denyFacade.prepare(
      "commandcode_shell_exec", "run_shell", { cmd: "echo hi" },
      sharedEnvelope(), denyFixture.grantedPermissions,
    ).transaction;
  } catch (e) {
    denied = /PERMISSION_DENIED/.test(e.message);
    emit({ kind: "deny", scenario: "permission-denied", error: e.message });
  }
  check("permission_denied_by_effect", denied, "expected PERMISSION_DENIED");
  check("denied_records_no_effect", denyLedger.count() === 0);
  if (preparedTxDeny) {
    check("denied_tx_reconciled", preparedTxDeny.state === TRANSACTION_STATE.RECONCILE);
  }

  // --- 5. Approval spoofing rejected, genuine proof accepted ---
  const spoofFixture = await loadFixture("approval-spoofed.json");
  const writeLedger = new EffectLedger(join(EVIDENCE, "write-ledger"));
  const writeFacade = new NativeToolFacade(registry, writeLedger);
  const env = sharedEnvelope();
  const preparedWrite = writeFacade.prepare("commandcode_write_note", "write_note", { path: "spoof-case.md", content: "spoof" }, env, ["PERM_FILE_WRITE"]);
  check("write_tx_requires_approval", preparedWrite.transaction.requiresApproval === true);

  let spoofedRejected = false;
  try {
    const fakeProof = Object.freeze({ ...spoofFixture.spoofedProof });
    writeFacade.authorize(preparedWrite.transaction, fakeProof, "HT-20260811-FOS");
  } catch (e) {
    spoofedRejected = /APPROVAL_REQUIRED/.test(e.message);
    emit({ kind: "deny", scenario: "approval-spoofed", error: e.message });
  }
  check("spoofed_proof_rejected", spoofedRejected, "expected APPROVAL_REQUIRED");

  const genuineProof = mintBossApprovalProof(
    { active: true, contractId: "HT-20260811-FOS", evidence: "boss-turn-001" },
    "genuine-message",
  );
  let authorizedOk = false;
  try {
    writeFacade.authorize(preparedWrite.transaction, genuineProof, "HT-20260811-FOS");
    authorizedOk = preparedWrite.transaction.state === TRANSACTION_STATE.APPROVAL && preparedWrite.transaction.authorized === true;
  } catch (e) {
    emit({ kind: "error", scenario: "approval-genuine", error: e.message });
  }
  check("genuine_proof_accepted", authorizedOk, "state/proof mismatch");

  // --- 6. Duplicate invocation: COMMIT ONCE ---
  const dupFixture = await loadFixture("duplicate-invocation.json");
  const dupLedger = new EffectLedger(join(EVIDENCE, "dup-ledger"));
  const dupFacade = new NativeToolFacade(registry, dupLedger);
  const dupEnv = sharedEnvelope();
  const dupTx = dupFacade.prepare(dupFixture.capabilityId, "write_note", dupFixture.arguments, dupEnv, ["PERM_FILE_WRITE"]);
  dupFacade.requestApproval(dupTx.transaction, { active: true, contractId: "HT-20260811-FOS", evidence: "boss" }, "dup-msg-1", "HT-20260811-FOS");
  dupFacade.commit(dupTx.transaction);
  const dupTx2 = dupFacade.prepare(dupFixture.capabilityId, "write_note", dupFixture.arguments, dupEnv, ["PERM_FILE_WRITE"]);
  check("duplicate_idempotency_key", dupTx.transaction.idempotencyKey === dupTx2.transaction.idempotencyKey);
  dupFacade.requestApproval(dupTx2.transaction, { active: true, contractId: "HT-20260811-FOS", evidence: "boss" }, "dup-msg-2", "HT-20260811-FOS");
  const second = dupFacade.commit(dupTx2.transaction);
  check("commit_once_one_effect", dupLedger.count() === dupFixture.expectedLedgerCount, `ledger count=${dupLedger.count()}`);
  check("second_commit_replayed", second.tx.state === TRANSACTION_STATE.COMMIT && second.tx.committedOnce === true);

  // --- 7. Timeout reconciliation: no false rollback, no duplicate ---
  const toFixture = await loadFixture("timeout-reconcile.json");
  const toLedger = new EffectLedger(join(EVIDENCE, "to-ledger"));
  const toFacade = new NativeToolFacade(registry, toLedger);
  const toTx = toFacade.prepare(toFixture.capabilityId, "write_note", toFixture.arguments, sharedEnvelope(), ["PERM_FILE_WRITE"]);
  toFacade.requestApproval(toTx.transaction, { active: true, contractId: "HT-20260811-FOS", evidence: "boss" }, "to-msg", "HT-20260811-FOS");
  const toOutcome = toFacade.commit(toTx.transaction, { simulateTimeout: true });
  check("timeout_enters_reconcile", toTx.transaction.state === TRANSACTION_STATE.RECONCILE);
  check("timeout_marked_ambiguous", toTx.transaction.committedAmbiguous === true);
  check("timeout_committed_effect_recorded", toLedger.count() === 1);
  const reconciled = toFacade.reconcile(toTx.transaction, toTx.transaction.idempotencyKey);
  check("timeout_reconcile_already_committed", reconciled.decided === toFixture.expectedReconcileDecision);
  const retry = toFacade.commit(toTx.transaction);
  check("timeout_retry_no_duplicate", toLedger.count() === 1 && retry.tx.committedOnce === true);

  // --- 8. Secret-bearing output is redacted (detected by shape, never by value) ---
  const secLedger = new EffectLedger(join(EVIDENCE, "sec-ledger"));
  const secFacade = new NativeToolFacade(registry, secLedger);
  const secTx = secFacade.prepare("commandcode_write_note", "write_note", { path: "sec.md", content: "sec" }, sharedEnvelope(), ["PERM_FILE_WRITE"]);
  secFacade.requestApproval(secTx.transaction, { active: true, contractId: "HT-20260811-FOS", evidence: "boss" }, "sec-msg", "HT-20260811-FOS");
  const secOutcome = secFacade.commit(secTx.transaction);
  const secResult = secOutcome.result;
  const secFixture = await loadFixture("secret-bearing-output.json");
  const synth = syntheticSecret();
  check("secret_detected_by_shape", findSecrets(secResult.text).length > 0 === false,
    "raw result text must already be redacted");
  check("secret_redacted_from_result_text", secResult.text.includes("[REDACTED_SECRET]"),
    "expected redaction marker in result text");
  check("redaction_marker_present_in_source_fixture", secFixture.redactedMarker === "[REDACTED_SECRET]");
  check("synthetic_handle_matches_pattern", findSecrets(synth).length > 0,
    "synthetic secret must match a redactable pattern");
  check("synthetic_value_not_echoed", !secResult.text.includes(synth),
    "raw synthetic value must not appear in returned result text");
  const journal = await readFile(join(EVIDENCE, "sec-ledger", "journal.ndjson"), "utf8").catch(() => "");
  check("secret_not_persisted", !journal.includes(synth), "raw synthetic value must not appear in persisted journal");

  // --- 9. Safe fallback (host compatibility) ---
  const fbFixture = await loadFixture("safe-fallback.json");
  const retrieveDesc = registry.get(fbFixture.capabilityId);
  check("retrieve_declared_fallback", retrieveDesc.fallback === fbFixture.fallbackMode);
  const fbLedger = new EffectLedger(join(EVIDENCE, "fb-ledger"));
  const fbFacade = new NativeToolFacade(registry, fbLedger);
  const fbTx = fbFacade.prepare(fbFixture.capabilityId, "direct_search", { query: "prototype" }, sharedEnvelope());
  const fbOutcome = fbFacade.commit(fbTx.transaction);
  check("fallback_executes_safely", fbOutcome.result.ok === true && fbOutcome.result.structuredContent.mode === "direct_search");
  check("fallback_no_external_effect", fbLedger.count() === 0);

  // --- 10. Read-only public tool: mutationPerformed false in evidence ---
  const rFacade = facade_for_read(registry);
  const routeTx = rFacade.prepare("hypertaks_route", "select_skill", { request: "verify setup" }, sharedEnvelope());
  const routeOut = rFacade.commit(routeTx.transaction);
  check("public_tool_mutation_performed_false",
    routeOut.result.text.includes("No mutation performed."));

  // --- Summary ---
  emit({ kind: "summary", failures, total: log.filter((e) => e.kind === "assertion").length });
  await writeFile(join(EVIDENCE, "transcript.ndjson"), log.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
  if (failures > 0) {
    console.error(`FAIL: ${failures} assertion(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("PASS: all assertions hold");
  }
}

main().catch((err) => {
  console.error("HARNESS_ERROR", err);
  process.exit(1);
});
