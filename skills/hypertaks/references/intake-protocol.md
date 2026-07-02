# Intake & Verification Protocol (Phase 0 - Hard Gate, Sized)

This protocol runs on **every** Hypertaks task before any framing, agent
selection, or spawning. No work begins until the request is unambiguous and the
Boss has confirmed the task contract. The gate is never skipped - it is
**sized**: Express for light tasks, Deep for heavy ones.

## Guiding principle

A founder does not burn an agent team on a fuzzy request - and does not burn a
30-minute interrogation on a typo fix. Convert the Boss's raw ask into a
precise, testable **task contract** at the smallest gate that still removes
ambiguity. Ambiguity resolved here costs one message; ambiguity discovered
after spawning costs a team of cold agents.

## Step 1 - Assess the tier

Score the task before asking anything. This decides both the gate mode and the
agent count (see the tier table in `SKILL.md`).

| Signal | Points toward |
|--------|---------------|
| Single domain, single artifact, reversible | **Lite** (1 agent, Express gate) |
| Continuation inside an already-confirmed contract | **Lite** - see Follow-ups below |
| 2–3 domains touched, one clear deliverable | **Standard** (3 agents, Express gate) |
| Cross-domain, founder-shaped, needs a reconciled decision | **Prime** (5 agents, Deep gate) |
| Multiple workstreams, multiple deliverables, high stakes (mainnet, money, legal) | **Hyper** (6–10+ agents, Deep gate) |

Rules:

- When in doubt between two tiers, pick the **higher** one.
- High-stakes constraints (mainnet deploys, spending real money, legal exposure,
  irreversible actions) force at least **Prime**, whatever the task size. This
  is a **floor, not a cap** - if the workstream count says Hyper, high stakes
  never argue it back down to Prime.
- Hyper's count is set by counting distinct workstreams that each need their own
  deliverable, then adding the Founder/Integrator and a QA/Red-Team slot. The
  QA/Red-Team agent is **mandatory whenever high-stakes constraints apply**
  (mainnet, real money, legal exposure); it may be folded into the Integrator
  only on low-stakes Hyper tasks, and that fold must be stated in the contract.
  Scale by splitting roles, never by padding.
- The tier is announced in the task contract and locked. If scope grows mid-task
  past the tier, stop, re-state the contract at the new tier, and get a
  go-ahead.

## Step 2 - Run the gate in the assessed mode

### Express gate (Lite / Standard)

Resolve only the 3 highest-leverage dimensions:

1. **Objective / definition of done** - the single sentence that, if true at the
   end, means the task is complete.
2. **Task shape** - analysis / strategy, execution / build, or both.
3. **Deliverable format & destination** - what shape the output takes and where
   it lands.

For every other dimension, state an explicit assumption instead of asking
(e.g. "assuming current stack, no budget cap, no legal constraints"). Batch
into **one** question round at most. Contract is **one line**.

### Deep gate (Prime / Hyper)

Resolve every dimension below. If the Boss already answered one in the request,
do not re-ask it - restate it and move on.

1. **Objective / definition of done** - What outcome counts as success? What is
   the single sentence that, if true at the end, means the task is complete?
2. **Scope & explicit out-of-scope** - What is included; what is deliberately
   excluded. Name the boundaries so agents do not drift.
3. **Constraints** - Budget, tech stack, brand/voice rules, legal/compliance,
   regulatory jurisdiction, on-chain network (mainnet/testnet/L2), data
   sensitivity, timeline hard limits.
4. **Success criteria / KPIs** - How results are measured (e.g. conversion %,
   gas cost ceiling, churn delta, gross margin, lead-time reduction). Quantify
   where possible.
5. **Deliverable format & destination** - Report, code repo, deployed artifact,
   slide deck, spreadsheet, contract address, vault note. Where it must land.
6. **Deadline & priority** - When it is needed and how it ranks against other
   work. Distinguish "explore" from "ship today".
7. **Task shape** - Classify as **analysis / strategy**, **execution / build**,
   or **both**. This drives the role mix in Phase 2.
8. **Existing assets / context to reuse** - Prior work, data sources, repos,
   brand kits, wallets, credentials, or vault notes to build on rather than
   recreate.

## How to ask

- Use the `AskUserQuestion` tool where available; on surfaces without it, ask
  the same batched dimensions as plain numbered chat questions. Batch dimensions
  into **1–3 calls** (Deep) or **1 call** (Express), max **4 questions per
  call**. Do not overwhelm the Boss with one giant wall of prompts.
- Lead each question with the **recommended option first** (labeled
  "(Recommended)") when a sensible default exists.
- Prefer concrete, mutually exclusive options over open-ended prompts; the Boss
  can always choose "Other".
- Ask the highest-leverage questions first (objective, task shape, deliverable);
  follow up on secondary details only if still unresolved.

## Step 3 - Confirm the contract

Echo back the **task contract** - one line (Express) or one paragraph (Deep) -
always including **tier + gate mode**. Then get an explicit go-ahead before
proceeding to Phase 1.

Deep contract template:

> **Task contract [Prime tier, Deep gate]:** Hypertaks will [objective] within
> [scope], excluding [out-of-scope], under [constraints]. Success =
> [criteria/KPIs]. Deliverable = [format] delivered to [destination] by
> [deadline]. Task shape = [analysis / execution / both]. Reusing [existing
> assets]. Confirm to proceed.

Express contract template:

> **Task contract [Lite tier, Express gate]:** Hypertaks will [objective];
> deliverable = [format]; shape = [shape]. Assumptions: [list]. Confirm to
> proceed.

## Edge handling

- **"Just go" / "you decide":** Do not skip the gate silently. Record the
  assumptions you are making for each unresolved dimension, state them
  explicitly as assumptions in the task contract (with tier + gate mode), and
  proceed. Flag them again in the final deliverable so the Boss can correct
  course. **Urgency is not "just go":** "quick", "ASAP", or "I'm about to demo"
  selects the Express gate - it does not waive confirmation. Only an explicit
  delegation of the decision ("just go", "you decide", "no questions") lets
  the contract proceed unconfirmed with stated assumptions.
- **Follow-ups / continuations:** a message that refines, reformats, or extends
  work **inside** the confirmed contract is a continuation - handle it in the
  existing contract (usually Lite) and announce it in one line: *"Continuing
  contract [X] in Lite mode."* A message with a new objective, new domain, or
  expanded scope is a **new task**: re-run this protocol at the assessed tier.
  Never reclassify silently - the announcement is the compliance.
- **Scope creep mid-task:** if the Boss expands the request, re-run only the
  affected intake dimensions, re-assess the tier, and update the task contract
  before continuing.
