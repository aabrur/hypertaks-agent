# Cross-Host Hypertaks Behavioral Conformance Specification

This specification defines the host-independent behavioral invariants required across all supported Hypertaks AI agent targets.

## Invariant Groups

### 1. Product Identity & Skill Routing
- **INV-01**: Exactly five canonical public skills exist (`hypertaks`, `hypertaks-verify`, `hypertaks-brain`, `hypertaks-graph`, `hypertaks-continuity`).
- **INV-02**: No sixth public skill beginning with `hypertaks` is exposed.
- **INV-03**: MCP remains an optional external capability except on host-mandated transports (such as ChatGPT Apps).

### 2. Intake & Contract-Bound Tiering
- **INV-04**: Small, harmless tasks select Nano or Lite tier without subagent overhead.
- **INV-05**: High-stakes, multi-file architectural tasks select Standard, Prime, or Hyper tier.
- **INV-06**: Incomplete requests surface missing input prerequisites before attempting execution.

### 3. Execution & Handoff Integrity
- **INV-07**: Real subagents are spawned on hosts supporting subagent delegation; synthesized multi-role execution is used on single-agent hosts.
- **INV-08**: No fabricated agent responses, fake tool calls, or false completions.

### 4. Capability Relevance & Tool Security
- **INV-09**: Only the smallest required tool set is selected.
- **INV-10**: Mutating actions require explicit user confirmation.
- **INV-11**: External capability failures fail closed.

### 5. Security & Boundary Enforcement
- **INV-12**: Rejects path traversal escaping workspace or approved Obsidian vault boundaries.
- **INV-13**: Blocks prompt injection and approval spoofing.
- **INV-14**: Masks API keys, tokens, and credentials in logs.

### 6. Memory & Continuity Invariants
- **INV-15**: Unverified memory remains unverified until backed by commit/repository evidence.
- **INV-16**: Stale branch memory is invalidated upon checkout of a main branch.
- **INV-17**: Handoff checkpoints preserve open work, risk state, and required next steps.

### 7. Lifecycle Integrity
- **INV-18**: Installation, discovery, invocation, fast-forward update, uninstall, and clean re-install operate idempotently without data loss.
