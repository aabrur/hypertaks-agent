<div align="center">

# Hypertaks

### Founder Operating System for AI coding agents

**Hypertaks turns an AI agent into a founder-grade operating partner that
frames the real objective, challenges harmful methods, coordinates specialist
work, preserves verified founder context, and proves whether the work is done.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-4.5.0-blue)
![Adapter Targets](https://img.shields.io/badge/adapter%20targets-22-brightgreen)
![Live Certified](https://img.shields.io/badge/live%20certified-0%2F22-lightgrey)
![Status](https://img.shields.io/badge/status-Production%20Rollout%20Wave%201-f3a712)

**Execution profiles:** [CORE](skills/hypertaks/SKILL-core.md) for smaller
models and FULL through [SKILL.md](skills/hypertaks/SKILL.md) for frontier
agents.

</div>

---

## What Hypertaks is

Hypertaks is a portable operating protocol for founder-shaped work across
business strategy, software engineering, marketing, finance, ERP, supply chain,
smart contracts, data, design, and IoT.

The Boss remains the final human authority. The Hypertaks Founder owns task
framing, contract integrity, specialist coordination, capability relevance,
evidence quality, founder continuity, risk disclosure, and final integration.

Hypertaks is not a hosted model, autonomous legal entity, mandatory memory
service, or bundled agent runtime. It runs inside the AI agent and tools the user
already selected.

## Production rollout status

Hypertaks currently has **22 adapter targets**, not 22 behaviorally certified
hosts. Structural packages, validators, and the universal installer are ready.
Real host certification remains evidence-gated.

| Area | Current evidence | Status |
|---|---|---|
| Canonical five-skill core | Structural validation and 88 static evals | Confirmed |
| Universal installer | Isolated install, verify, update, uninstall, reinstall tests | Confirmed |
| Google Antigravity | Package build and installer lifecycle | Partial, live app test pending |
| ChatGPT | Executable read-only MCP runtime and local HTTP lifecycle | Partial, live app test pending |
| Other 20 targets | Adapter structure and evidence records | Partial, live app tests pending |
| Marketplace publication | Metadata preparation only | Not submitted |

`PASS` is reserved for evidence from a real host lifecycle. A manifest, package,
local server, or installer test cannot independently certify discovery and
invocation inside the target AI application.

## Why v4.5.0 matters

Version 4.5.0 adds the **Founder Brain and Continuity System**.

A useful founder-grade agent must do more than answer one prompt well. It should
remember approved decisions, preserve why they were made, distinguish facts
from inference, resume from real repository state, pass work to another agent,
and reject unsupported claims of completion.

Hypertaks 4.5.0 adds that capability without replacing its Founder Operating
System identity with a generic memory layer.

### Major additions

- exactly five public Hypertaks skills;
- discovery and reuse of an existing main brain or shared agent memory;
- evidence-backed agent-private, project, and shared memory;
- optional Obsidian Vault storage owned by the user;
- optional Graphify relationship and impact analysis;
- Git-aware checkpoint, resume, and cross-agent handoff;
- proof of done based on current tests and acceptance evidence;
- approved-root path containment, atomic writes, and secret protection;
- EV-66 through EV-88 for founder brain and continuity behavior.

---

## Five public skills

Hypertaks exposes exactly five public entry points.

| Skill | Purpose |
|---|---|
| `/hypertaks` | Main Founder Operating System flow for normal work |
| `/hypertaks-verify` | Verify project, brain, shared memory, storage, Graphify, and Obsidian configuration |
| `/hypertaks-brain` | Inspect, record, revalidate, correct, promote, demote, or archive founder memory |
| `/hypertaks-graph` | Query code relationships and impact through verified Graphify capabilities or direct search |
| `/hypertaks-continuity` | Checkpoint, resume, handoff, reconcile, status, and proof of done |

The main `/hypertaks` skill remains the default entry point. Users do not need
to memorize the other four commands. They can invoke them directly when focused
control is useful.

A repository validator rejects a missing command, duplicate command, or sixth
public Hypertaks skill.

---

## Founder Operating System loop

Every meaningful task follows the same six-phase operating loop:

```text
Phase 0  Intake and verify
Phase 1  Frame the objective and feasibility
Phase 2  Pick the required specialist roles
Phase 3  Equip the smallest relevant capability set
Phase 4  Produce the work
Phase 5  Integrate, verify, and deliver
```

The loop scales by task complexity:

| Tier | Agents | Typical work |
|---|---:|---|
| Nano | 0 | One factual answer with no build, decision, or durable state |
| Lite | 1 | Small focused correction or follow-up |
| Standard | 3 | Bounded multi-discipline deliverable |
| Prime | 5 | Founder-shaped cross-domain work |
| Hyper | 6-10+ | Multi-workstream program |
| Omega | 10+ | Long-running program with human go or no-go gates |

Harmless Nano work creates no brain, pointer, checkpoint, graph job, registry
scan, or update check.

---

## Founder judgment

Hypertaks separates the Boss's objective from the proposed method.

It protects customer value, trust, cash flow, runway, margin, product quality,
operational capacity, team health, compliance, reputation, strategy, and
long-term growth. When the proposed method materially damages the objective,
Hypertaks states the conflict, explains the consequence, and proposes a safer
path.

The Boss remains the final authority unless system policy, permission, legal,
security, or irreversible-action rules block execution.

---

## Founder Brain

Founder memory is structured evidence, not hidden authority.

### Memory scopes

```text
AgentPrivate  Temporary or agent-specific context
Project       Verified project facts, decisions, risks, and preferences
Shared        Cross-agent facts or Boss-approved decisions
```

Shared memory accepts only:

1. a repository fact verified against the active repository, branch, commit,
   tracked path, and content hash; or
2. a Boss-approved decision whose message and contract match a valid T1
   approval proof.

Model inference remains `INFERRED`. Missing evidence remains `UNVERIFIED`.
Changed repository evidence becomes stale or invalidated rather than silently
remaining true.

Memory and Graphify output cannot approve actions, expand scope, grant
permissions, or override current repository evidence.

### User-owned destinations

`/hypertaks-verify` can configure:

- project-local storage;
- an explicit external local folder;
- an existing Obsidian Vault;
- a separate local Git repository;
- a verified MCP memory capability;
- session-only memory with no persistence.

Existing custom brains remain user-owned. Hypertaks references them through a
project pointer and does not copy or reorganize the existing structure.

A new default namespace uses:

```text
Brains/<agent-name>/
```

Creation occurs only after an explicit preview and approval.

---

## Obsidian integration

Obsidian is optional.

Hypertaks 4.5.0 supports an approved Obsidian Vault as a user-owned filesystem
destination. It validates the Vault root, respects the selected folder, and
never modifies `.obsidian/`.

This is not a claim of Obsidian application-level integration. The
`obsidianmd/obsidian-releases` repository is a future distribution path for an
optional visual plugin, not a memory API.

---

## Graphify integration

Graphify is optional and is used only when relationships, architecture,
dependencies, centrality, or change impact materially help the task.

Supported routes are:

1. a verified local stdio MCP executor;
2. a verified shared HTTPS MCP endpoint with an authentication handle and
   approved external boundary;
3. a verified local command;
4. direct repository search when Graphify is disabled or unavailable.

Hypertaks never reports Graphify success unless a real executor, command, or
direct search ran. Missing source metadata is `UNVERIFIED`. A branch or commit
mismatch is `STALE`.

Graphify results are evidence below the active Boss turn, workspace standards,
approved contract, and current repository state.

---

## Continuity and proof of done

A checkpoint records:

- objective and active contract;
- actual repository identity, branch, and commit;
- changed files;
- completed and pending work;
- blockers and exact next action;
- granted permissions;
- tests with command, exit code, timestamp, and tested commit;
- acceptance criteria with evidence.

Resume reads Git state internally and rejects repository, branch, or commit
mismatches.

A handoff carries the smallest verified state another agent needs. It preserves
permissions, blockers, risks, test status, and next action without dumping the
raw transcript or raw secrets.

Proof of done returns `DONE` only when current tests and acceptance evidence
pass and no pending work or blocker remains. Otherwise it returns `NOT_DONE`
with exact reasons.

---

## Security boundaries

Hypertaks 4.5.0 enforces:

- source-bound authority;
- explicit permissions and contract activation;
- fail-closed external-system capability binding;
- canonical approved-root path containment;
- strict agent names and record identifiers;
- traversal, absolute-path, reserved-name, and symlink-escape rejection;
- runtime pointer and checkpoint validation;
- atomic persistence;
- full-artifact secret scanning;
- handoff redaction;
- real Git-state verification;
- no silent Graphify installation, server start, or remote upload.

External side effects follow:

```text
PREPARE -> PREVIEW -> T1 APPROVAL -> COMMIT ONCE -> RECONCILE
```

A timeout is not proof of failure. Hypertaks reconciles before retrying.

---

## Retrieval, capability, and visual routing

Hypertaks still includes the v4.4 systems:

- Retrieval Intelligence Router for exact, semantic, mixed, structured,
  small-corpus, and unavailable queries;
- Capability Relevance Router for the smallest sufficient verified skill, tool,
  MCP capability, or connector;
- professional Python, Matplotlib, TypeScript, UI/UX, and image-generation
  execution profiles;
- Visual Necessity Router for required, recommended, optional, or unnecessary
  visuals.

Precise numbers use tables or charts before creative image generation. External
systems fail closed unless the approved contract names the allowed boundary.
Mutating operations require approval even when capability metadata is wrong.

---

## Universal Installer & Distribution

Hypertaks provides a unified CLI installer to manage host adapters across supported AI environments.

```bash
python scripts/installer.py doctor
python scripts/installer.py list-hosts
python scripts/installer.py install <host> [--scope project|user]
python scripts/installer.py status
python scripts/installer.py update [host]
python scripts/installer.py verify <host> [--scope project|user]
python scripts/installer.py uninstall <host> [--scope project|user]
python scripts/installer.py install <host> [--dry-run] [--yes]
python scripts/installer.py update [host] [--json]
python scripts/installer.py uninstall <host> [--json]
```

`--dry-run` previews every mutating operation as a JSON plan and changes nothing.
`--yes` confirms a destructive operation non-interactively; without `--yes` or an
interactive TTY, install-replacement, update, and uninstall return an actionable error
and change nothing. `--json` emits structured results on every branch.

### Target Host Adapter Classifications

All hosts below have an adapter record in the Hypertaks catalog. No host is yet
behaviorally certified in a live session. Each requires real host verification
through `evals/hosts/<host-id>/REPORT.md` and
`distribution/HOST-CAPABILITY-MATRIX.md`. Google Antigravity has
installer-lifecycle evidence. ChatGPT has executable local MCP runtime evidence;
live ChatGPT evidence is still pending.

| Host | Classification | Install Scope | MCP Support | Evidence |
|---|---|---|---|---|
| **Google Antigravity** | `PLUGIN_AND_SKILL` | Project / User | Optional | Partial (installer lifecycle) |
| **Claude Code** | `NATIVE_PLUGIN` | Project / User | Optional | Partial (structural adapter) |
| **Codex** | `NATIVE_PLUGIN` | Project / User | Optional | Partial (structural adapter) |
| **Cursor** | `NATIVE_PLUGIN` | Project / User | Optional | Partial (structural adapter) |
| **Kimi Code** | `NATIVE_PLUGIN` | Project / User | Optional | Partial (structural adapter) |
| **OpenCode** | `PLUGIN_AND_SKILL` | Project / User | Optional | Partial (structural adapter) |
| **Pi** | `HOST_EXTENSION` | Project / User | Optional | Partial (structural adapter) |
| **OpenClaw** | `NATIVE_SKILL` | Project / User | Optional | Partial (structural adapter) |
| **Hermes** | `NATIVE_SKILL` | Project / User | Optional | Partial (structural adapter) |
| **ChatGPT** | `CHATGPT_APP_ADAPTER` | Global / Apps SDK | Required (Transport) | Partial (local runtime tested) |
| **GitHub Copilot** | `NATIVE_PLUGIN` | Project / User | Optional | Partial (structural adapter) |
| **Windsurf** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **Cline** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **Roo Code** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **Kilo Code** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **Aider** | `PROJECT_INSTRUCTIONS` | Project / User | Unavailable | Partial (structural adapter) |
| **Goose** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **OpenHands** | `MANAGED_INSTALL` | Project / User | Optional | Partial (structural adapter) |
| **Claude.ai** | `PROJECT_INSTRUCTIONS` | Project Knowledge | Unavailable | Partial (structural adapter) |
| **Gemini App** | `CUSTOM_ASSISTANT` | Custom Gem | Unavailable | Partial (structural adapter) |
| **Open WebUI** | `HOST_EXTENSION` | Project / User | Optional | Partial (structural adapter) |
| **LibreChat** | `HOST_EXTENSION` | Project / User | Optional | Partial (structural adapter) |

### ChatGPT runtime quick start

The ChatGPT adapter now includes an executable read-only MCP transport. It does
not expose write, delete, shell, deploy, publish, or user-filesystem tools.

```bash
npm install --ignore-scripts
npm run test:chatgpt
npm run start:chatgpt
```

Local health endpoint:

```text
http://127.0.0.1:8787/healthz
```

Local MCP endpoint:

```text
http://127.0.0.1:8787/mcp
```

A real ChatGPT test requires an eligible workspace plus a remote HTTPS endpoint
or an approved secure tunnel. ChatGPT cannot connect directly to an arbitrary
local MCP process. See [the ChatGPT adapter guide](.chatgpt/INSTALL.md) and
[live certification checklist](evals/hosts/chatgpt/LIVE-TEST-CHECKLIST.md).

---

## Usage

```text
Hypertaks, verify this project and connect my existing main brain.

/hypertaks-brain inspect

/hypertaks-graph impact runtime/router.ts

/hypertaks-continuity checkpoint

Hypertaks, resume the project and prove what remains unfinished.
```

Normal work can still begin with plain language:

```text
Hypertaks, fix this bug.
Hypertaks, review this product decision.
Hypertaks, build the feature after the contract is approved.
Hypertaks, explain why the release is not done yet.
```

---

## Validation

The GitHub Actions gate runs:

```text
python3 scripts/validate_skill.py
python3 scripts/validate_public_skills.py
python3 scripts/validate_distributions.py
python3 scripts/validate_host_capabilities.py
python3 scripts/validate_conformance.py
python3 scripts/build_distributions.py antigravity --check-only
python3 scripts/run_evals.py --check
python3 scripts/run_evals.py --static
python3 -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v
python3 scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output <report>
python3 scripts/plot_retrieval_eval.py <report> <output-base>
python3 -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance scripts.test_validate_host_capabilities -v
npm run test:chatgpt
npm test
python3 -m compileall scripts
git diff --check origin/main...HEAD
```

The structural inventory contains 88 eval definitions. Static GREEN and local
runtime success are not behavioral certification.

---

## Release status

Hypertaks 4.5.0 is a **Release Candidate** after the final merge gate passes.

The historical 4.3.0 ledger remains 43/49 Behavioral PASS with 6 documented
non-PASS harness cases. That evidence does not certify the changed v4.4 or v4.5
behavior.

Fresh independent behavioral runs are still required for EV-50 through EV-88,
including real host skill discovery, Graphify capability behavior, approved
Obsidian Vault behavior, and cross-agent continuity.

No tag, package publication, marketplace submission, deployment, guaranteed
security claim, or stable behavioral certification is implied by the source
merge.

---

## Repository layout

```text
hypertaks-agent/
├── skills/hypertaks/             # Main Founder Operating System
├── skills/hypertaks-verify/      # Environment and brain verification
├── skills/hypertaks-brain/       # Evidence-backed founder memory
├── skills/hypertaks-graph/       # Graphify and direct-search routing
├── skills/hypertaks-continuity/  # Checkpoint, resume, handoff, proof of done
├── runtime/                      # Strict TypeScript reference runtime and ChatGPT adapter
├── evals/                        # EV-01 through EV-88 plus host evidence
├── scripts/                      # Validators, evaluators, reports, updater
├── .chatgpt/
├── .claude-plugin/
├── .codex-plugin/
├── .cursor-plugin/
├── .kimi-plugin/
├── .agents/
└── LICENSE
```

---

## License

[MIT](LICENSE) © abrur
