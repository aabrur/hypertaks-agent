/**
 * State-transition evidence demo for Ticket #7.
 * Runs one end-to-end write transaction and prints the immutable state log,
 * proving the PREPARE -> PREVIEW -> T1 APPROVAL -> COMMIT ONCE -> RECONCILE
 * envelope plus COMMIT ONCE and read-after-write invariants.
 *
 * Run:  node demo-state.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  ToolRegistry, NativeToolFacade, EffectLedger, ExecutionEnvelope,
  mintBossApprovalProof,
} from "./tool-registry.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url)).replace(/\\/g, "/").replace(/\/+$/, "");
const EVIDENCE = join(ROOT, "evidence");
if (!existsSync(EVIDENCE)) mkdirSync(EVIDENCE, { recursive: true });
let buf = "";
function log(line) { const s = line + "\n"; buf += s; process.stdout.write(s); }

const registry = new ToolRegistry();
const ledger = new EffectLedger(join(EVIDENCE, "demo-ledger"));
const facade = new NativeToolFacade(registry, ledger);
const env = new ExecutionEnvelope({ exactRoot: ROOT, timeoutMs: 1000, maxOutputBytes: 65536, maxRetries: 2, maxEffects: 1 });

log("=== single write transaction: PREPARE -> PREVIEW -> APPROVAL -> COMMIT -> RECONCILE ===");
const prepared = facade.prepare("commandcode_write_note", "write_note", { path: "demo.md", content: "state demo" }, env, ["PERM_FILE_WRITE"]);
const tx = prepared.transaction;

const proof = mintBossApprovalProof(
  { active: true, contractId: "HT-20260811-FOS", evidence: "boss-turn-demo" },
  "demo-message",
);
facade.authorize(tx, proof, "HT-20260811-FOS");
facade.commit(tx);
facade.reconcile(tx, tx.idempotencyKey);

log("state transitions:");
for (const s of tx.states) log(`  ${s.state}  ${s.ts}  ${s.note}`);

const expected = createHash("sha256").update(JSON.stringify({ path: "demo.md", content: "state demo" })).digest("hex");
const raw = ledger.verifyReadAfterWrite(tx.idempotencyKey, expected);
log(`read-after-write: ok=${raw.ok} reason=${raw.reason}`);
log(`committedOnce=${tx.committedOnce}  ledger_count=${ledger.count()}`);

log("=== COMMIT ONCE: duplicate commit is a replay, no duplicate effect ===");
const before = ledger.count();
facade.commit(tx);
const after = ledger.count();
log(`duplicate_commit: ledger ${before} -> ${after}  (equal => retry did not duplicate effect)`);

writeFileSync(join(EVIDENCE, "state-transition.log"), buf, "utf8");
process.exitCode = after === before && tx.committedOnce && raw.ok ? 0 : 1;
