import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  TaskDag,
  TaskNode,
  OrchestratorRunMeta,
  CheckpointData,
  AgentHandoff,
} from "./types";
import { DagBuilder } from "./dag-builder";
import { computeRootFingerprint } from "../repo-identity";

export class OrchestratorEngine {
  private readonly runDir: string;

  constructor(
    private readonly canonicalRoot: string,
    private readonly runId: string,
  ) {
    this.runDir = path.join(canonicalRoot, ".hypertaks", "runs", runId);
  }

  public initRun(dag: TaskDag): OrchestratorRunMeta {
    if (!fs.existsSync(this.runDir)) {
      fs.mkdirSync(this.runDir, { recursive: true });
      fs.mkdirSync(path.join(this.runDir, "agents"), { recursive: true });
      fs.mkdirSync(path.join(this.runDir, "handoffs"), { recursive: true });
      fs.mkdirSync(path.join(this.runDir, "artifacts"), { recursive: true });
      fs.mkdirSync(path.join(this.runDir, "verification"), { recursive: true });
    }

    const now = new Date().toISOString();
    const meta: OrchestratorRunMeta = {
      runId: this.runId,
      repoId: dag.repoId,
      contractId: dag.contractId,
      tier: dag.tier,
      status: "INITIALIZED",
      createdAt: now,
      updatedAt: now,
      completedNodes: [],
      failedNodes: [],
    };

    fs.writeFileSync(path.join(this.runDir, "run.json"), JSON.stringify(meta, null, 2) + "\n", "utf8");
    fs.writeFileSync(path.join(this.runDir, "dag.json"), JSON.stringify(dag, null, 2) + "\n", "utf8");
    this.logEvent("RUN_INITIALIZED", { runId: this.runId, tier: dag.tier });

    return meta;
  }

  public logEvent(eventType: string, payload: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      type: eventType,
      payload,
    };
    fs.appendFileSync(
      path.join(this.runDir, "events.jsonl"),
      JSON.stringify(entry) + "\n",
      "utf8",
    );
  }

  public recordCheckpoint(
    contractId: string,
    completedNodeIds: readonly string[],
    currentWaveIndex: number,
  ): CheckpointData {
    const checkpoint: CheckpointData = {
      runId: this.runId,
      contractId,
      timestamp: new Date().toISOString(),
      completedNodeIds,
      currentWaveIndex,
      repoFingerprint: computeRootFingerprint(this.canonicalRoot),
    };
    fs.writeFileSync(
      path.join(this.runDir, "checkpoint.json"),
      JSON.stringify(checkpoint, null, 2) + "\n",
      "utf8",
    );
    this.logEvent("CHECKPOINT_SAVED", { completedCount: completedNodeIds.length, wave: currentWaveIndex });
    return checkpoint;
  }

  public loadCheckpoint(): CheckpointData | null {
    const chkPath = path.join(this.runDir, "checkpoint.json");
    if (!fs.existsSync(chkPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(chkPath, "utf8")) as CheckpointData;
    } catch {
      return null;
    }
  }

  public recordHandoff(handoff: AgentHandoff): void {
    const handoffPath = path.join(
      this.runDir,
      "handoffs",
      `${handoff.fromAgent}-to-${handoff.toAgent}.json`,
    );
    fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2) + "\n", "utf8");
    this.logEvent("AGENT_HANDOFF", { from: handoff.fromAgent, to: handoff.toAgent });
  }

  public executeWaveSchedule(
    dag: TaskDag,
    executor: (node: TaskNode) => Promise<{ success: boolean; output: string }>,
  ): Promise<OrchestratorRunMeta> {
    const builder = new DagBuilder();
    for (const node of dag.nodes) {
      builder.addNode(node);
    }
    const waves = builder.computeWaves();

    const checkpoint = this.loadCheckpoint();
    const completedSet = new Set<string>(checkpoint?.completedNodeIds || []);
    const failedSet = new Set<string>();

    return (async () => {
      for (let waveIdx = 0; waveIdx < waves.length; waveIdx++) {
        const wave = waves[waveIdx]!;
        const pendingInWave = wave.filter((id) => !completedSet.has(id));

        if (pendingInWave.length === 0) {
          continue; // Wave already completed in prior run
        }

        this.logEvent("WAVE_STARTED", { waveIndex: waveIdx, nodes: pendingInWave });

        // Run independent nodes in parallel
        await Promise.all(
          pendingInWave.map(async (nodeId) => {
            const node = dag.nodes.find((n) => n.id === nodeId);
            if (!node) return;

            // Check if any dependencies failed
            const hasFailedDep = node.dependencies.some((d) => failedSet.has(d));
            if (hasFailedDep) {
              node.status = "BLOCKED";
              failedSet.add(node.id);
              this.logEvent("NODE_BLOCKED", { nodeId: node.id });
              return;
            }

            node.status = "RUNNING";
            try {
              const res = await executor(node);
              // Proof-of-done gate: reject completion if evidence verification explicitly failed
              if (res.success && (res as any).verifiedEvidence !== false) {
                node.status = "COMPLETED";
                node.outputResult = res.output;
                completedSet.add(node.id);
                this.logEvent("NODE_COMPLETED", { nodeId: node.id });
              } else {
                node.status = "FAILED";
                node.error = (res as any).verifiedEvidence === false
                  ? "PROOF_OF_DONE_REJECTED: Worker claimed success without verified evidence"
                  : res.output;
                failedSet.add(node.id);
                this.logEvent("NODE_FAILED", { nodeId: node.id, error: node.error });
              }
            } catch (err) {
              node.status = "FAILED";
              node.error = err instanceof Error ? err.message : String(err);
              failedSet.add(node.id);
              this.logEvent("NODE_FAILED", { nodeId: node.id, error: node.error });
            }
          }),
        );

        this.recordCheckpoint(dag.contractId, Array.from(completedSet), waveIdx);

        if (failedSet.size > 0) {
          break; // Stop wave execution on failure
        }
      }

      const now = new Date().toISOString();
      const finalStatus: OrchestratorRunMeta["status"] =
        failedSet.size > 0 ? "FAILED" : "COMPLETED";

      const finalMeta: OrchestratorRunMeta = {
        runId: this.runId,
        repoId: dag.repoId,
        contractId: dag.contractId,
        tier: dag.tier,
        status: finalStatus,
        createdAt: now,
        updatedAt: now,
        completedNodes: Array.from(completedSet),
        failedNodes: Array.from(failedSet),
      };

      fs.writeFileSync(
        path.join(this.runDir, "run.json"),
        JSON.stringify(finalMeta, null, 2) + "\n",
        "utf8",
      );
      this.logEvent("RUN_FINISHED", { status: finalStatus });

      return finalMeta;
    })();
  }
}
