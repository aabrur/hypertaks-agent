# Intake & Verification Protocol (Phase 0 — Hard Gate)

This protocol runs on **every** Hypertaks task before any framing, agent
selection, or spawning. No work begins until the request is unambiguous and the
Boss has confirmed the task contract. Treat this as a gate, not a suggestion.

## Guiding principle

A founder does not burn a 5-agent team on a fuzzy request. Convert the Boss's
raw ask into a precise, testable **task contract** first. Ambiguity resolved here
costs one message; ambiguity discovered after spawning costs five cold agents.

## Core intake dimensions

Resolve every dimension below. If the Boss already answered one in the request,
do not re-ask it — restate it and move on.

1. **Objective / definition of done** — What outcome counts as success? What is
   the single sentence that, if true at the end, means the task is complete?
2. **Scope & explicit out-of-scope** — What is included; what is deliberately
   excluded. Name the boundaries so agents do not drift.
3. **Constraints** — Budget, tech stack, brand/voice rules, legal/compliance,
   regulatory jurisdiction, on-chain network (mainnet/testnet/L2), data
   sensitivity, timeline hard limits.
4. **Success criteria / KPIs** — How results are measured (e.g. conversion %,
   gas cost ceiling, churn delta, gross margin, lead-time reduction). Quantify
   where possible.
5. **Deliverable format & destination** — Report, code repo, deployed artifact,
   slide deck, spreadsheet, contract address, vault note. Where it must land.
6. **Deadline & priority** — When it is needed and how it ranks against other
   work. Distinguish "explore" from "ship today".
7. **Task shape** — Classify as **analysis / strategy**, **execution / build**,
   or **both**. This drives the 5-role mix in Phase 2.
8. **Existing assets / context to reuse** — Prior work, data sources, repos,
   brand kits, wallets, credentials, or vault notes to build on rather than
   recreate.

## How to ask

- Use the `AskUserQuestion` tool. Batch dimensions into **1–3 calls**, max **4
  questions per call**. Do not overwhelm the Boss with one giant wall of prompts.
- Lead each question with the **recommended option first** (labeled
  "(Recommended)") when a sensible default exists.
- Prefer concrete, mutually exclusive options over open-ended prompts; the Boss
  can always choose "Other".
- Ask the highest-leverage questions first (objective, task shape, deliverable);
  follow up on secondary details only if still unresolved.

## Confirmation step

After answers are collected, echo back a **one-paragraph task contract** in plain
English covering: objective, scope, key constraints, success criteria,
deliverable + destination, deadline, and task shape. Then get an explicit go-ahead
before proceeding to Phase 1.

Task-contract template:

> **Task contract:** Hypertaks will [objective] within [scope], excluding
> [out-of-scope], under [constraints]. Success = [criteria/KPIs]. Deliverable =
> [format] delivered to [destination] by [deadline]. Task shape = [analysis /
> execution / both]. Reusing [existing assets]. Confirm to proceed.

## Edge handling

- **"Just go" / "you decide":** Do not skip the gate silently. Record the
  assumptions you are making for each unresolved dimension, state them explicitly
  as assumptions in the task contract, and proceed. Flag them again in the final
  deliverable so the Boss can correct course.
- **Genuinely trivial follow-ups** inside an already-confirmed contract (e.g.
  "make the headline bigger") do not need a fresh full intake — confirm scope in
  one line and continue within the existing contract.
- **Scope creep mid-task:** if the Boss expands the request, re-run only the
  affected intake dimensions and update the task contract before continuing.
