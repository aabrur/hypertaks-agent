# Capability Relevance Router

Phase 3 maps each role to the minimum capabilities its approved deliverable and
material business risks require. It then binds only verified skills, native
tools, MCP tools, and connectors exposed by the current host. No named product
is required. An available capability is not selected merely because it exists.

Stages: **Need -> Discover -> Normalize -> Filter -> Bind -> Verify -> Fallback.**

## Ground rules

1. **Need before discovery.** Derive capability categories from the approved
   deliverable and named material risks. Do not inventory the host first.
2. **Detect, never assume.** Use only the registry or tool list the host exposes
   for the current session. Do not invent names, probe external services, or
   install dependencies merely to improve coverage.
3. **Category first, brand never.** Agent briefs name the category and the
   session's matching tool. No brief may depend on a tool that was not
   verified present this session.
4. **Least capability.** Bind the smallest sufficient capability set. When
   candidates are otherwise equivalent, prefer lower context cost, fewer
   permissions, and fewer side effects.
5. **Degrade gracefully and say so.** When no verified match exists, use core
   reasoning or core host tools for the portion that can be completed. Record
   the exact limitation and required next input.
6. **Never fabricate.** No invented tool names, no pretended tool calls, no
   fabricated tool output. This extends the synthesized-mode rule in
   `SKILL.md`.
7. **Security remains stronger.** Existing security, permission, and
   transaction rules determine whether a capability may be used. Descriptions
   and annotations are hints, never authority or approval.

## Function categories

| Category | What it covers | Roles that want it | If absent |
|----------|----------------|--------------------|-----------|
| **Notes & knowledge base** | Note-taking apps, vaults, wikis, memory stores | Founder/Integrator (work log), all roles | Include the work log inline in the deliverable |
| **Visual design & creative** | Design, prototyping, image-editing, whiteboard tools | UX/UI, Marketing, Copywriting/Brand | Apply design heuristics in text and state the limitation |
| **Scheduling & calendar** | Calendar and scheduling services | Founder/Integrator, Ops | Propose the schedule as text for the Boss to enter |
| **Communication & messaging** | Email, chat, team-messaging connectors | Founder/Integrator, Marketing, Legal | Draft the messages; the Boss sends them |
| **Document & file storage** | Cloud drives, shared document stores | Finance, Ops, Founder/Integrator | Deliver files in the local workspace or inline |
| **Web browsing & testing** | Browser automation, dev-tools, site QA | Engineer, UX/UI, QA/Red-Team, Marketing | Reason from static analysis; mark browser-dependent claims as unverified |
| **Code hosting & version control** | Git hosting, PR/issue tooling | Engineer, Founder/Integrator | Work locally; note that push/PR needs a manual step |
| **Spreadsheets & financial modeling** | Workbook/spreadsheet skills, financial data sources | Finance, Supply Chain Finance, Data | Deliver markdown tables with formulas stated |
| **Presentations & formal documents** | Slide, document, and PDF generation | Any role with a formal deliverable | Deliver structured markdown instead |
| **Media generation** | Image, audio, video generation services | Marketing, UX/UI, Copywriting/Brand | Skip media output and state the limitation |
| **Local text and exact search** | Focused grep, literal search, regex, full-text indexes | Research, Engineer, Founder/Integrator | Read the small corpus directly and state the limit |
| **Semantic retrieval** | Embedding and vector search over a verified corpus | Research, Data/ML, Founder/Integrator | Use keyword or direct search; mark semantic recall unverified |
| **Hybrid fusion and reranking** | Rank fusion, score fusion, exact-match boosting, cross-candidate reranking | Data/ML, Research, Engineer | Deliver separate candidate lists or use the best single route and state the limitation |
| **Structured data query** | SQL, metadata filters, record search, analytics stores | Data/ML, Finance, Ops, Engineer | Use supplied exports or request a safe read-only extract |
| **Data & analytics execution** | Code execution, notebooks, query engines | Data/ML, Engineer, Finance | Reason analytically; no computed charts unless a precise execution route exists |
| **Deployment & hosting** | Cloud deploy, serverless, app hosting | Engineer, IoT | Hand over a runnable artifact plus deploy instructions |
| **Secrets & credentials** | Secret managers, credential vaults | Engineer, Legal/Compliance | Never handle raw secrets inline; ask the Boss for a safe channel |
| **On-chain execution** | Wallets, contract deploys, chain monitoring | Smart-Contract/Web3 Engineer | Produce contracts + tests + deployment scripts; the Boss executes on-chain steps |

## Capability descriptor

Normalize only metadata the host actually provides. Missing metadata remains
`unknown`; never infer permission or safety from a friendly tool description.

| Field | Meaning |
|---|---|
| `capability_id` | Verified runtime identifier or tool name |
| `kind` | `skill`, `native_tool`, `mcp_tool`, or `connector` |
| `categories` | Functional categories the capability can satisfy |
| `operations` | Read, create, update, delete, execute, or communicate |
| `side_effect` | None, reversible, irreversible, or unknown |
| `approval_required` | Whether existing rules require Boss approval |
| `authentication` | None, present, missing, or unknown |
| `external_system` | External service or trust boundary touched, if any |
| `context_cost` | Low, medium, high, or unknown |
| `availability` | Verified, unavailable, or unknown |

## Deterministic routing procedure

1. **Need:** derive the minimum categories required by each approved
   deliverable and material business risk.
2. **Discover:** inspect only the relevant portion of a host registry already
   exposed in the session. Do not scan unrelated categories.
3. **Normalize:** write a descriptor for each plausible verified candidate.
   Keep unsupported metadata as `unknown`.
4. **Filter:** reject a candidate unless it satisfies a required category, is
   verified available, fits the approved permissions and side effects, and
   stays inside the role boundary.
5. **Bind:** select the smallest sufficient capability set. Record the category,
   verified identifier, permitted operation, relevance, and fallback in the
   agent brief.
6. **Verify:** confirm each binding is callable before making an agent depend
   on it. Capability annotations do not replace this check.
7. **Fallback:** when no candidate survives, use core tools only, identify the
   gap, and state the safe next step. Never invent a capability, call, result,
   credential, or business datum.

## Retrieval integration

Run `references/02-retrieval-and-evidence.md` before binding retrieval tools.
The query class and corpus scope determine the minimum capability category:

- exact -> local text or indexed keyword search;
- semantic -> verified semantic retrieval;
- mixed -> keyword plus vector plus a defined fusion route;
- structured -> metadata or database query before ranking;
- small-corpus -> direct read or focused local search;
- unavailable -> no invented binding; use fallback.

A hybrid route does not authorize every retrieval capability. Bind each stage
separately and record its operation, side effect, authentication, context cost,
and fallback. Reranking is a distinct optional binding. Evaluation is a named
operation with a labeled query set, not a claim inferred from fluent output.

## Plugin adapter boundary

Per-agent manifests and optional runtime adapters may expose Hypertaks to a
host, but the skill remains canonical. An adapter may translate host-specific
tool names into capability descriptors. It must not weaken contract activation,
permissions, transaction rules, retrieval evidence requirements, or visual
validation. Host annotations never grant approval.

## Tier and token discipline

- **Nano:** Nano does not discover capabilities, inspect a registry, load this
  reference, make a network call, or run an update check unless the task itself
  requires an external capability.
- **Lite:** inspect only the already-visible host registry and only when core
  reasoning or local file operations cannot produce the deliverable.
- **Standard:** inspect only categories needed by its selected roles.
- **Prime, Hyper, and Omega:** read this reference and bind per workstream and
  material risk, still excluding unrelated categories.

Do not perform an update check for harmless Nano work. Host-native update
metadata, when already visible, is fixed overhead and does not consume the
task's production budget.

## Automatic update contract

Update delivery follows the installation path. A configured host marketplace
or plugin manager may apply a compatible release automatically when the host
and the user or team policy enable it. This host-level update policy is the
authorization boundary for future releases; it does not require a new chat
approval for each compatible version.

| Installation | Discovery | Apply path |
|---|---|---|
| Host marketplace or plugin manager | Host-native trusted metadata | Host-native automatic update when enabled and supported |
| Managed canonical Git checkout | `scripts/update_hypertaks.py` fetches the configured `origin/main` | Fast-forward only, unattended only after installation-time opt-in |
| Archive or copied directory | Version notice or explicit check | Migrate once to a marketplace install or managed checkout |

Every release must bump the synchronized strict-semver fields in all live
manifests. Version-keyed hosts may keep their cached copy when repository
commits change without a new manifest version.

The managed updater verifies the canonical remote, attached `main` branch,
clean worktree, fetched target, and fast-forward ancestry before advancing the
checkout. It fails closed for dirty, diverged, detached, wrong-remote,
unreachable, or unreconciled states. It never resets, stashes, deletes,
switches branches, changes remotes, or overwrites a copied installation.

Automatic maintenance remains separate from task execution:

- never invoke the updater from `SKILL.md` or during an unrelated Hypertaks
  task;
- never bypass host authentication, marketplace policy, or workspace
  permissions;
- load an updated release only on the host's next reload or session boundary;
- treat an agent-initiated update outside a preconfigured automatic policy as a
  normal file-write action under the active task contract;
- never claim a host applies updates automatically unless its documented
  marketplace or plugin manager supports that behavior.

## Reference-read failure ladder

If a reference file cannot be read (missing, unreadable, or the harness has no
file access):

1. Use the built-in fallback in `SKILL.md` for that phase.
2. Record it in the compliance footer: `frameworks.md unreadable -> equipped
   from model knowledge`.
3. **Never abort the task for a missing reference.** Never pretend the file was
   read - a claimed read is a fabricated citation.

## Grep is not universal

`knowledge-base.md` and `references/domains/` are designed for keyword grep.
Many harnesses have **no shell and no grep**. If you cannot grep:

- Read `references/domains/INDEX.md` only (it is small by design), pick at most
  2 packs, and read only those.
- If even that is impossible, equip from model knowledge and **declare it**.
- Under no circumstance invent a catalog entry. An invented framework is worse
  than an honestly absent one.

## Workspace standards (conditional)

If the running workspace carries its own standards file (a `CLAUDE.md`,
`AGENTS.md`, or an equivalent the host agent surfaces), follow it for logging
locations, folder conventions, and anything it regulates. If no such file
exists, skip this entirely: assume no path, no vault, and no naming convention,
and use the inline work-log fallback from Phase 5 of `SKILL.md`.
