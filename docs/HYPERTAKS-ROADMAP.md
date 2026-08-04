# Hypertaks Implementation Roadmap

**Document:** `HYPERTAKS-ROADMAP.md`
**Status:** Execution-ready plan
**Canonical repository language:** English
**Public architecture preserved:** five canonical skills and four read-only MCP tools

## 1. Purpose

This document defines the approved execution order for strengthening Hypertaks. It consolidates the router repair, governance hardening, knowledge routing, domain and methodology expansion, professional tool usage, quantitative rigor, multilingual output, human-quality delivery, and governed founder learning.

The roadmap is intentionally staged. The phases must not be collapsed into one large change because each layer has a different failure surface, ownership boundary, and deployment gate.

## 2. Non-negotiable architecture constraints

Every phase must preserve the following invariants:

1. Exactly five canonical public skills:
   - `hypertaks`
   - `hypertaks-verify`
   - `hypertaks-brain`
   - `hypertaks-graph`
   - `hypertaks-continuity`
2. Exactly four read-only remote MCP tools.
3. No remote filesystem, shell, Git write, database write, messaging, deployment, or other mutation tool is added to the MCP adapter.
4. `preferredSkill` override and invalid-skill rejection remain intact.
5. `mutationPerformed: false` remains true for the remote adapter.
6. Repository prose, source comments, schemas, reason codes, canonical labels, and knowledge entries remain English.
7. User-facing output follows the user's language when possible.
8. No U+2014 character is introduced.
9. No embedded LLM, translation service, embeddings, vector search, or network dependency is added to deterministic internal routing.
10. Knowledge, methodology, playbooks, evidence, and memory are loaded lazily and only when relevant.

## 3. Final execution order

The approved sequence is:

```text
Release A: Router Integrity
A0 -> A1 -> A2 -> A3 -> A4 -> A5

Knowledge Foundation
K1

Release B: Governance Hardening
B1 -> B2 -> B3 -> B4 -> B5

Knowledge and Capability Expansion
K8 -> K4 -> K5 -> K6 -> K7 -> K2 -> K3 -> K9

Release C: Founder Learning and Decision System
C1 -> C2 -> C3 -> C4
```

Condensed order:

```text
A -> K1 -> B -> K8 -> K4 -> K5 -> K6 -> K7 -> K2 -> K3 -> K9 -> C
```

## 4. Why this order is mandatory

### 4.1 Router Integrity is first

The public-skill router determines which canonical skill is selected. Live failures have already shown false negatives, false positives, and primary-intent errors. Knowledge or governance additions must not be layered on top of an unstable skill-selection boundary.

Release A therefore repairs:

- duplicated routing logic;
- primary-intent resolution;
- action-object matching;
- scoped negation;
- focused-skill exclusions;
- multilingual locale handling;
- deterministic diagnostics;
- immutable runtime identity;
- local regression and stress coverage.

### 4.2 K1 follows the router

The public-skill router and the knowledge router solve different problems:

```text
User request
  -> Public Skill Router
  -> Canonical Skill
  -> Knowledge Router
  -> Domain Pack
  -> Methodology
  -> Execution Profile
  -> Verified Capability
  -> Evidence and Output Shape
```

K1 must exist before domain expansion. Without it, new knowledge becomes a large catalog that is difficult to select precisely and expensive to load.

### 4.3 Governance precedes high-risk domain growth

Release B establishes machine-checkable contract enforcement, categorical proof, proportional review, and continuity reconciliation. These controls must exist before expanding legal, quantitative, advanced tool, deployment, or AI-orchestration capabilities.

### 4.4 Human-quality and multilingual delivery is an early cross-cutting layer

K8 is deployed before the large domain packs so every later capability inherits:

- user-language following;
- English canonical repository content;
- natural and specific writing;
- reduced generic filler;
- domain-appropriate terminology;
- explicit uncertainty;
- no detector-evasion behavior.

### 4.5 Technology, tools, quantitative reasoning, and verification form one capability chain

```text
K4 Architecture and AI engineering
  -> K5 Professional execution tools
  -> K6 Quantitative science and economics
  -> K7 Verification, regression, and performance
```

Each phase remains separate so failures can be localized.

### 4.6 Lean, leadership, and law are added after the core execution system

K2 benefits from the knowledge router, human-quality profile, quantitative methods, and verification standards. K3 is intentionally late because current law is volatile, jurisdiction-sensitive, and dependent on authoritative sources and strong governance.

### 4.7 Governed learning is last

Learning candidates, founder playbooks, and experiment tracking must not be introduced while routing, evidence, domain ownership, and governance are still changing. Release C begins only after the previous layers are stable.

## 5. Release and deployment model

### 5.1 Release A: Router Integrity Hotfix

Recommended branch:

```text
fix/router-integrity
```

Deployment boundary: after A5 only.

| Phase | Purpose | Mutation | Deployment |
|---|---|---:|---:|
| A0 | Baseline and provenance audit | No | No |
| A1 | Canonical single-source router | Yes | No |
| A2 | Deterministic intent policy and locale packs | Yes | No |
| A3 | Token-safe diagnostics and runtime identity | Yes | No |
| A4 | Complete router regression and local MCP stress suite | Tests only unless defect found | No |
| A5 | Release reconciliation, versioning, full affected-surface validation | Yes | Yes, if documented target is verified |

Acceptance gate:

- one canonical router implementation;
- required routing matrix passes;
- English and Indonesian are fully tested locale packs;
- unsupported locale safely falls back to `hypertaks`;
- diagnostics default to `none`;
- manifest and installation verification expose matching policy identity;
- exact five-skill and four-tool boundaries remain intact;
- no mutation capability is added.

### 5.2 K1: Knowledge Routing Kernel

Deployment boundary: K1 can be deployed independently after its delta tests and invariant smoke gate pass.

K1 introduces:

- deterministic knowledge selection;
- domain classification;
- methodology selection;
- domain-pack ownership;
- execution-profile selection;
- capability-category binding;
- evidence and volatility classification;
- strict loading limits;
- explicit fallback for unsupported domains and unavailable tools.

Default loading policy:

```text
Standard and below: at most 1 domain pack
Prime and Hyper: at most 2 domain packs
At most 1 primary methodology
At most 1 supporting methodology when materially justified
At most 1 primary execution profile
At most 1 supporting tool unless independent validation or a different deliverable requires it
```

### 5.3 Release B: Governance Hardening

Recommended branch:

```text
feat/governance-hardening
```

Deployment boundary: after B5 only.

| Phase | Purpose |
|---|---|
| B1 | Typed contract violation codes, transition guard, fail-closed state validation |
| B2 | Auditable categorical Proof Package |
| B3 | Risk-based Review Gate with the smallest justified reviewer set |
| B4 | Proportional checkpoint, resume, and handoff hardening |
| B5 | Integrated governance certification and adversarial validation |

Required governance decisions:

- no numeric Contract Score;
- no numeric evidence tier 1-5 system;
- categorical verdicts such as `COMPLIANT`, `BLOCKED`, `VIOLATION`, `UNVERIFIED`, and `ABORTED`;
- full Proof Packages remain structured artifacts and are not repeated in normal answers;
- Review Gate bypasses Nano and harmless Lite work;
- reviewers reference one shared evidence pack;
- checkpoints are required only at meaningful material boundaries.

### 5.4 K8: Human-Quality and Multilingual Delivery

Deployment boundary: deploy independently after delta tests.

Language policy:

```text
Canonical repository language: English
Canonical intent labels and reason codes: English
User input: Unicode and multilingual
User-facing output: follow the user's language
Explicit language request: highest priority
Uncertain or unsupported locale: conservative English or main-skill fallback
Technical terms: preserve canonical terms when translation reduces precision
```

The phase improves specificity, audience fit, natural flow, evidence use, and editorial quality. It does not attempt to evade AI detectors and must not add deliberate errors or fabricated human experiences.

### 5.5 K4: Technology, Programming, AI Agents, and Orchestration

Deployment boundary: deploy independently after delta tests.

Coverage includes:

- programming-language selection and tradeoffs;
- architecture decision records;
- API, data, concurrency, memory, security, testing, and deployment considerations;
- LLM application architecture;
- prompt and context architecture;
- structured outputs and tool calling;
- RAG and retrieval evaluation;
- memory governance;
- agent loops and state-machine orchestration;
- single-agent versus multi-agent selection;
- MCP host, server, tool, skill, and agent boundaries;
- human approval, observability, latency, cost, idempotency, and rollback.

This phase must remain provider-neutral and framework-neutral.

### 5.6 K5: Professional Tool Execution

Deployment boundary: deploy independently after delta tests.

The phase defines precise execution profiles for:

- Python;
- Matplotlib;
- SPSS;
- SQL and database query tools;
- Excel, Power Query, and DAX;
- Word and PowerPoint;
- PDF and spreadsheet artifacts;
- diagram, design, and prototyping tools;
- image and video generation;
- document and presentation generation.

Tool policy:

> Use the most precise primary tool. Add a second tool only for independent validation, a materially different deliverable, or a verified fallback.

Any tool that was not executed must be labeled `NOT RUN`.

### 5.7 K6: Quantitative Science and Economics

Deployment boundary: deploy independently after delta tests.

Coverage includes:

- simple and multiple linear regression;
- logistic and nonlinear regression;
- residual diagnostics, heteroscedasticity, multicollinearity, and interactions;
- time-series regression and model comparison;
- linear algebra, optimization, numerical stability, sensitivity, and uncertainty;
- econometrics, elasticity, demand, cost, productivity, inflation, and scenarios;
- physics: dimensional analysis, mechanics, fluids, thermodynamics, heat, circuits, waves, and optics;
- chemistry: stoichiometry, concentration, dilution, gas laws, pH, equilibrium, kinetics, thermochemistry, electrochemistry, and balances.

Every material quantitative method must produce:

```text
METHOD
INPUTS WITH SOURCE AND UNIT
FORMULA
SUBSTITUTION
RESULT WITH UNIT
DIMENSIONAL CHECK
BOUNDARY CHECK
INDEPENDENT VALIDATION
SENSITIVITY OR UNCERTAINTY
ASSUMPTIONS
LIMITATIONS
STATUS
```

### 5.8 K7: Verification, Regression, and Performance

Deployment boundary: deploy independently after delta tests.

The phase distinguishes:

- software regression;
- API and contract regression;
- visual regression;
- data and schema regression;
- statistical regression;
- latency, throughput, load, stress, spike, and soak testing;
- dependency and blast-radius analysis;
- linearity testing;
- numerical invariants;
- benchmark design and reproducibility.

Latency evidence must distinguish client, network, server, dependency, queueing, and cold-start components and report percentile distributions where relevant.

### 5.9 K2: Lean Industrial and Leadership

Deployment boundary: deploy independently after delta tests.

Lean coverage includes TPS, Gemba, Kaizen, 5S, VSM, takt, flow, pull, Kanban, JIT, Heijunka, Jidoka, Poka-Yoke, SMED, TPM, OEE, Standard Work, A3, PDCA, DMAIC, TOC, line balancing, SPC, capability, FMEA, and waste analysis.

Leadership coverage includes Situational, Transformational, Servant, and Adaptive Leadership; delegation; RACI, RAPID, and DACI; GROW; SBI; psychological safety; conflict resolution; stakeholder alignment; Kotter; ADKAR; and team-health analysis.

Methods must produce observable decisions, behaviors, output shapes, tradeoffs, and evidence requirements rather than personality labels or generic advice.

### 5.10 K3: Law and Governance

Deployment boundary: deploy independently after delta tests.

The domain pack includes issue spotting, IRAC, CREAC, authority hierarchy, jurisdiction and effective-date controls, contract review, clause-risk matrices, IP, software licensing, privacy, employment, consumer protection, corporate governance, procurement, compliance, AI governance, evidence preservation, and policy-to-control mapping.

Current legal claims require current authoritative sources. Missing jurisdiction or effective date returns `NEEDS_VERIFICATION`. The system must never fabricate statutes, cases, clauses, quotations, thresholds, or regulator positions.

### 5.11 K9: Integrated Knowledge Release

Deployment boundary: integrated release after the complete knowledge validation suite passes.

K9 adds no new capability. It verifies ownership, indexes, output shapes, formulas, volatility rules, tool profiles, multilingual policy, human-quality rules, knowledge-loading limits, public skill identity, MCP tool identity, and distribution integrity.

### 5.12 Release C: Founder Learning and Decision System

Recommended branch:

```text
feat/founder-learning-system
```

Deployment boundary: after C4 only.

| Phase | Purpose |
|---|---|
| C1 | Governed learning candidates with evidence, scope, conflict, and promotion controls |
| C2 | Internal founder decision playbooks, not new public skills |
| C3 | Contract-bound hypothesis and experiment tracker |
| C4 | Integrated authority, memory, playbook, experiment, review, continuity, and proof evaluation |

Learning rules:

- no failure or correction becomes a permanent rule automatically;
- model inference remains private and unverified;
- shared promotion requires verified repository evidence or direct Boss approval evidence;
- unrelated, stale, rejected, or archived records are not loaded;
- only active, in-scope promoted records may influence execution;
- one playbook is loaded by default;
- active hypotheses are loaded only when they match the contract and decision scope.

## 6. Grok recommendation evaluation

| Recommendation | Decision | Approved form |
|---|---|---|
| Hard Contract Law | Partially already present | Add typed violation codes, transition guard, violation ledger, and fail-closed state checks |
| Numeric Contract Score | Reject | Use categorical compliance verdicts with evidence |
| Fixed Agent Council | Modify | Risk-based Review Gate with the smallest justified reviewer set |
| Recursive permanent learning | Reject | Governed learning candidates with scope, evidence, conflict, approval, and revalidation |
| Evidence tiers 1-5 | Reject | Preserve advisory, measured, audit-grade plus VERIFIED, INFERRED, ASSUMED, UNKNOWN |
| Proof standard | Approve | Add a structured Proof Package and compact default summary |
| Founder playbooks | Approve | Internal references routed through `hypertaks`, never a sixth skill |
| Maximum three hypotheses | Reject as universal law | Contract-defined WIP based on capacity, cost, dependencies, and risk |
| More permanent specialist roles | Defer | Add roles only when evaluation proves a real gap |
| Mandatory checkpoint for every task | Reject | Require checkpoints only at meaningful material boundaries |
| Dashboard | Defer | Build only after correctness and governance are stable |
| Internal skill marketplace | Reject for current roadmap | Extend through internal references or domain packs, not public skills |
| Versioned memory | Partial | Extend existing provenance and supersession later if needed |

## 7. Token-efficiency policy

The roadmap does not require high token usage when implemented correctly.

Low-overhead components:

- single-source router;
- deterministic intent routing;
- scoped negation;
- locale packs;
- runtime policy identity;
- contract transition guard.

Components requiring explicit token controls:

- diagnostics default to `none`;
- full route diagnostics are opt-in;
- router digest is not repeated in normal responses;
- full Proof Packages are loaded only for audit, resume, handoff, reconciliation, or disputed completion;
- Review Gate is risk-gated and uses the smallest reviewer set;
- reviewer outputs reference one shared evidence pack;
- learning, playbooks, hypotheses, and domain packs use lazy loading;
- archived, rejected, stale, unrelated, or out-of-scope records are not loaded.

## 8. Test policy

Previously successful unrelated tests remain the accepted baseline.

```text
TEST_POLICY: DELTA_ONLY
```

Rules:

1. Test every new or changed behavior in the active phase.
2. Rerun an existing test only when its implementation or shared dependency changed.
3. Retain a regression test for every fixed defect or new policy boundary.
4. Run an invariant smoke gate before each deployment.
5. Run the full repository suite only at release or integration boundaries: A5, B5, K9, and C4.
6. Do not claim PASS when a test was not run.
7. Do not repeat historical full-suite testing after every isolated knowledge addition.

Invariant smoke gate:

- exactly five canonical public skills;
- exactly four read-only MCP tools;
- no new remote write capability;
- indexes parse successfully;
- no duplicate section headers or conflicting ownership;
- one positive and one exclusion lookup for the new phase;
- no whole knowledge-base loading;
- no fabricated execution claim;
- no U+2014 character.

## 9. Deployment policy

1. Use only the repository's documented deployment target and command.
2. Do not invent credentials, environment variables, targets, or commands.
3. Deploy only after the phase or release delta tests and smoke gate pass.
4. Perform one minimal endpoint or package smoke check after deployment.
5. If deployment cannot be verified, return `DEPLOY_READY` instead of claiming success.
6. Release A deploys after A5.
7. K1 deploys independently.
8. Release B deploys after B5.
9. K8, K4, K5, K6, K7, K2, and K3 may deploy independently.
10. K9 performs integrated knowledge release.
11. Release C deploys after C4.

## 10. Deferred or rejected work

The active roadmap does not include:

- a sixth public skill;
- a fixed permanent reviewer council;
- a numeric Contract Score;
- a numeric evidence tier 1-5 system;
- automatic permanent learning;
- checkpoints for every task;
- a dashboard;
- an internal public-skill marketplace;
- a vector database or HNSW system for public-skill routing;
- an embedded LLM or translator in the MCP adapter;
- extra MCP servers for the five skills;
- remote filesystem, shell, Git write, notes write, or deployment tools;
- fake SPSS, Office, Python, SQL, or design execution;
- generated images as evidence for precise data;
- AI-detector evasion or deliberate human-like errors;
- hazardous chemistry synthesis instructions;
- current law or economic indicators sourced from memory.

## 11. Phase handoff rule

A single agent may work through multiple phases in one local session, but it must receive one phase prompt at a time and stop after each phase report. The next phase begins only after the previous report is accepted and its gate is satisfied.

The companion file `HYPERTAKS-AGENT-PROMPTS.md` contains the exact execution prompts in the approved order.
