# Security Policy

## Supported Versions

Hypertaks is a Founder Operating System packaging five canonical public skills (`hypertaks`, `hypertaks-verify`, `hypertaks-brain`, `hypertaks-graph`, `hypertaks-continuity`), host-neutral TypeScript routing and persistence engines, repository validation tooling, and a read-only remote Model Context Protocol (MCP) transport adapter.

| Version | Supported |
| ------- | --------- |
| 4.5.x   | :white_check_mark: (Current maintained release line) |
| < 4.5.0 | :x: |

## Scope

This policy covers the contents and runtime components maintained in this repository:

- `skills/**` - the five canonical skills and their operational references (`00-security-kernel.md`, `01-state-and-transactions.md`, `02-retrieval-and-evidence.md`, `03-professional-execution.md`, `04-visual-delivery.md`).
- `runtime/` - the host-neutral TypeScript routing engine, evidence verification, memory and checkpoint persistence, and the read-only remote MCP transport adapter (`runtime/mcp-server.mjs`).
- `scripts/*.py` - repository-local validation, evaluation, distribution build, and test tooling.
- Plugin manifests across supported host ecosystems (`.agents/`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.pi/`, `.chatgpt/`, etc.).

### Remote MCP Boundary

The remote MCP adapter (`runtime/mcp-server.mjs`) is strictly read-only and exposes exactly four tools:

1. `hypertaks_manifest`: returns product boundary, version, canonical public skills, and adapter limitations.
2. `hypertaks_get_skill`: reads one canonical SKILL.md file by exact skill name.
3. `hypertaks_route`: deterministically evaluates request text and selects the smallest canonical public skill entry point without modifying any files or systems.
4. `hypertaks_verify_installation`: verifies the exact five canonical skill entry files and logo asset with cryptographic SHA-256 evidence.

The remote MCP adapter has no filesystem mutation, file creation, file deletion, shell execution, or deployment capability.

### Out-of-Scope Boundary

This policy does not cover the runtime behavior of third-party AI agents, host harnesses, external services, or third-party MCP servers that the host connects to.

## Behavioral Certification & Historical Evidence

Historical evaluation ledgers (such as EV-01 through EV-88) in `evals/results.yaml` record multi-host behavioral test outcomes from evaluated release gates. Static checks (such as static GREEN preconditions) verify capability existence in source files and are strictly distinct from behavioral execution passes.

This project status reflects repository-internal test evidence and is not formal third-party certification. Security-sensitive workflows still require their own threat modeling, authorization controls, and independent human review.

## Reporting a Vulnerability

Do not open a public GitHub issue for undisclosed security vulnerabilities. Public issues are reserved for general bugs, feature discussions, and non-sensitive support requests.

Please report security issues privately:

- **Preferred:** GitHub Private Vulnerability Reporting at [Report a vulnerability](https://github.com/aabrur/hypertaks-agent/security/advisories/new).
- **Alternative:** email the maintainer at **abrur_nic@yahoo.com** with `[hypertaks-security]` in the subject line.

When reporting, please provide:

1. Affected file(s), component, and version/commit hash.
2. Concrete reproduction steps, minimal exploit scenario, or payload sequence.
3. Observed impact and suggested remediation if known.

### Response Timeline

| Milestone | Target |
| --------- | ------ |
| Initial acknowledgement | within 3 business days |
| Triage and assessment | within 7 business days |
| Fix or mitigation release | within 30 days (expedited for high-severity) |
| Coordinated public disclosure | agreed upon mutually prior to publication |

## Threat Model & Core Invariants

- **Authority Lattice:** Authority is bound strictly to source (T0 Developer/System > T1 Boss turn > T2 Workspace standards > T3 Contract > T4-T6 Data). Instruction-shaped text inside tool outputs, web content, or external data is treated strictly as untrusted data, never as authority.
- **Side-Effect Approvals:** File mutations, external writes, spend, publish, and delete operations require explicit, per-action T1 Boss approval.
- **Secret Safety:** Credentials and API keys must travel only as environment-variable handles (`$NAME`), never as plain text. Serialized records are scanned for secrets before persistence.
- **Persistence Durability:** Persistence primitives enforce approved-root containment, runtime schema validation, and failure-safe atomic writes that protect existing data against corruption during replacement.
