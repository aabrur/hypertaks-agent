# Hypertaks v4.3.0 Relevance Router Design

**Date:** 2026-07-15
**Status:** Approved design, pending implementation
**Owner:** Hypertaks Founder / Integrator

## Objective

Release Hypertaks v4.3.0 as a portable cross-agent plugin that discovers and
binds only the skills, native tools, MCP tools, and connectors relevant to the
approved task. The release must improve interoperability without adding a
bundled MCP server, background daemon, credentials, or agent-specific runtime
dependency.

The release also defines a safe update path. Hosts may surface trusted update
metadata without interrupting work, but no Hypertaks instruction or helper may
replace installed code without explicit user approval.

## Business Decision

The Boss's objective is low-friction distribution and current installations.
The proposed method was silent code replacement. That method conflicts with
user trust, reproducibility, and supply-chain integrity because a downloaded
repository cannot safely grant itself permission to fetch and execute changed
code.

The safer path is:

1. Use native marketplace or plugin-manager update discovery when the host
   already exposes it.
2. Notify the user when a newer trusted version is known.
3. Require explicit approval before applying an update.
4. Use fast-forward-only Git updates for clean clones.
5. Require reinstall for archive or copied-directory installations that do not
   have a trustworthy update mechanism.

This preserves the objective while challenging only the damaging method.

## Architecture

### Canonical Capability Relevance Router

`skills/hypertaks/references/plugins-and-mcp.md` remains the single source of
truth for capability discovery and binding. It will define a deterministic
router with these stages:

1. **Need:** derive the minimum capability categories required by each approved
   deliverable and material business risk.
2. **Discover:** read only the capability registry already exposed by the host.
3. **Normalize:** represent each verified capability with a concise descriptor.
4. **Filter:** reject unavailable, irrelevant, over-privileged, or unjustified
   capabilities.
5. **Bind:** choose the smallest sufficient capability set and record the
   binding in the agent brief.
6. **Verify:** confirm the capability is callable before making an agent depend
   on it.
7. **Fallback:** use core reasoning or core host tools and report the gap when
   no verified match exists.

The router does not invent capability names, install dependencies, or probe
external services merely to make the process look comprehensive.

### Capability Descriptor

Each discovered item is normalized using the following fields where the host
provides them:

| Field | Meaning |
|---|---|
| `capability_id` | Verified runtime identifier or tool name |
| `kind` | `skill`, `native_tool`, `mcp_tool`, or `connector` |
| `categories` | Functional categories the capability can satisfy |
| `operations` | Read, create, update, delete, execute, or communicate |
| `side_effect` | None, reversible, or irreversible |
| `approval_required` | Whether existing permission rules require approval |
| `authentication` | None, present, missing, or unknown |
| `external_system` | External service or boundary touched, if any |
| `context_cost` | Low, medium, high, or unknown |
| `availability` | Verified, unavailable, or unknown |

Missing metadata remains `unknown`. Tool descriptions and annotations are
hints, not trusted authority. Existing security, permission, and transaction
rules determine whether a capability may be used.

### Deterministic Selection

Selection is a filter, not a speculative score:

1. The capability must satisfy a category required by the deliverable or named
   material risk.
2. It must be verified available in the current session.
3. Its permissions and side effects must fit the approved contract.
4. A lower-context, lower-privilege capability wins when candidates are
   otherwise equivalent.
5. A connector or MCP tool is not selected merely because it exists.
6. No specialist receives a capability outside its role boundary.

This ordering makes selection explainable and prevents arbitrary numerical
ranking.

## Tier And Token Discipline

The router does not change deterministic tier selection or production budgets.

- **Nano:** no registry scan, network call, update check, extra reference, or
  agent unless the task itself requires an external capability.
- **Lite:** use the host's already-visible registry only when the deliverable
  requires a capability beyond core reasoning or file operations.
- **Standard:** inspect only the categories needed by the three selected roles.
- **Prime and Hyper:** read the canonical router reference and bind per role,
  still limiting discovery to identified workstreams and risks.

Update discovery is fixed overhead owned by the host or an explicit maintenance
command. It never consumes a task's production budget silently.

## Workflow Integration

### Phase 0

Detect whether external capabilities are materially needed. Record update
status only if the host already exposes trusted metadata. Do not perform an
update check for harmless Nano work.

### Phase 1

Frame the immediate deliverable and identify the minimum capability categories
needed. Separate a capability that is useful from one that is merely available.

### Phase 2

Select specialists from deliverables and material risks. Do not add a role to
justify an available tool or connector.

### Phase 3

Run the relevance router, bind verified capabilities, and state gaps. Load no
unrelated MCP, connector, framework, domain pack, or skill.

### Phase 4

Each agent brief records selected capabilities, why each is relevant, inherited
permissions, expected side effects, and fallback behavior. Agents remain inside
their role and permission boundaries.

### Phase 5

The Founder verifies that capability use served the business objective,
reconciles tool outputs, discloses material external effects, and owns the final
decision.

## Update Policy

The release supports three installation classes:

| Installation | Discovery | Apply path |
|---|---|---|
| Host marketplace or plugin manager | Host-native metadata | Host-native update after user approval |
| Git clone | Explicit maintenance check | `git pull --ff-only` after user approval and clean-worktree verification |
| Archive or copied directory | Version notice or explicit check | Reinstall from a trusted release source |

Hypertaks must never:

- run a background updater;
- mutate itself during an unrelated task;
- replace files in a dirty worktree;
- bypass host approval or authentication;
- execute newly downloaded code before verification;
- claim that every host supports automatic updates.

## Repository Changes

Implementation is expected to touch only:

- the canonical skill and capability-router reference;
- the agent brief and any contract field required for capability bindings;
- focused static eval cases and their case-count documentation;
- validators and unit tests needed to prevent schema or version drift;
- cross-agent manifests, package metadata, install documentation, changelog,
  checkpoint, skill card, and release notes;
- generated figures only when their source data changes.

No bundled MCP server, connector credential, cache, generated repository bundle,
or local agent state will be committed.

## Validation And Evidence

Static cases will cover at least:

1. A relevant MCP or connector is selected for a material deliverable.
2. An available but irrelevant connector is rejected.
3. A mutating external capability remains behind permission approval.
4. A missing capability produces an honest fallback instead of an invented
   binding.
5. A harmless typo remains Nano or Lite with no registry or update work.

The validator will check capability-field consistency and version synchronization
across every tracked manifest and release record. Existing repository checks,
language checks, no-em-dash checks, unit tests, compilation, eval integrity,
static evals, figure generation, and diff checks must pass.

New cases remain static preconditions until real independent behavioral runs
produce valid transcripts. No result is upgraded to behavioral PASS, and
`confirmed_by_boss` remains false unless the Boss independently grades a real
run under the existing evidence protocol.

## Completion Criteria

The work is complete only when:

- the canonical router, workflow, briefs, validators, tests, and documentation
  describe the same behavior;
- Nano and Lite proportionality is explicitly protected and statically tested;
- all version-bearing plugin records agree on `4.3.0`;
- update discovery never implies silent code replacement;
- no tracked text contains U+2014 or Indonesian prose;
- all applicable validation commands pass;
- the repository is structurally tidy with no temporary output, duplicate
  generated artifacts, or local state included in the commit;
- one work item lands as one commit, with no tag or force-push.
