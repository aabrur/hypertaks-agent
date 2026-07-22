# Hypertaks 4.4.0 Retrieval and Execution Design

**Date:** 2026-07-22
**Status:** Approved for implementation
**Owner:** Hypertaks Founder / Integrator

## Objective

Release a portable Hypertaks update that improves retrieval quality, contract
clarity, capability selection, professional code execution, and visual delivery
without turning the plugin into a bundled application runtime.

## Product boundary

Hypertaks remains a cross-agent operating protocol. It does not bundle a vector
database, embedding model, reranker, remote service, MCP server, credential, or
background daemon. It detects verified host capabilities and applies the smallest
sufficient route. Core reasoning and local file operations remain valid fallbacks.

## Required outcomes

1. Classify retrieval needs before selecting keyword, vector, hybrid, metadata,
   exact-match, fusion, or reranking operations.
2. Separate the Boss's request, objective, proposed method, supplied evidence,
   constraints, process, deliverable, and acceptance evidence in the contract.
3. Require explicit contract activation before build work and fresh approval for
   external side effects.
4. Bind only relevant verified skills, native tools, MCP tools, and connectors.
5. Define professional Python, Matplotlib, TypeScript, UI/UX, and image-generation
   execution standards.
6. Decide whether a visual is required, recommended, optional, or unnecessary.
7. Preserve proportional token use through tier-specific retrieval and
   verification budgets.
8. Add runnable utilities, structural evals, validators, release documentation,
   and publish-readiness evidence.

## Architecture

### Retrieval Intelligence Router

Stages:

1. **Need:** identify the information gap and query class.
2. **Scope:** constrain corpus, tenant, date, language, document type, and trust
   boundary before scoring.
3. **Route:** choose direct scan, keyword, vector, hybrid, or unavailable.
4. **Retrieve:** obtain the smallest useful candidate set.
5. **Fuse:** combine independent rankings only when more than one route ran.
6. **Boost:** apply exact-match and metadata rules that were declared before
   inspecting final results.
7. **Rerank:** use a verified reranker only when candidate ambiguity justifies
   its cost and latency.
8. **Evaluate:** measure retrieval independently from generation.
9. **Pack evidence:** retain source identity, rank, score where meaningful, and
   retrieval reason.
10. **Fallback:** use core tools or stop the unsupported claim honestly.

Keyword retrieval is preferred for identifiers, codes, quoted phrases, proper
names, filenames, and exact vocabulary. Vector retrieval is preferred for
paraphrase, conceptual similarity, multilingual meaning, and vocabulary
mismatch. Hybrid retrieval is preferred for genuinely mixed query populations,
not as a universal default.

### Contract Integrity Gate

A build contract records:

- original request;
- desired outcome;
- proposed idea or method;
- supplied inputs and supporting evidence;
- missing critical data;
- objective and definition of done;
- scope and exclusions;
- planned process;
- deliverables and destination;
- retrieval and visual strategy;
- capabilities and permissions;
- assumptions, risks, and alternatives;
- success criteria and required validation evidence.

The contract is active only after a T1 Boss approval tied to the contract ID.
Ambiguous delegation may permit conservative analysis, but never file mutation,
publish, deployment, spending, messaging, deletion, or on-chain execution.

### Capability and execution routing

The existing Capability Relevance Router remains canonical. New execution
profiles refine how verified capabilities are used:

- Python for analysis, parsing, computation, validation, optimization, and
  reproducible artifact generation.
- Matplotlib for data-backed charts where exact values, units, and source
  reconciliation matter.
- TypeScript for strict plugin adapters, state machines, routing logic, and
  production application code.
- UI/UX methods for hierarchy, layout, accessibility, interaction states, and
  delivery-context review.
- Image generation for concept art, creative direction, or illustrative media,
  never as a substitute for precise charts, tables, or technical diagrams.

### Visual Necessity Router

Every potential visual receives one status:

- **Required:** text alone creates material ambiguity or decision risk.
- **Recommended:** the visual materially improves speed or accuracy of
  comprehension.
- **Optional:** the visual is primarily presentational.
- **Not needed:** text or a table communicates more directly.

The router then selects chart, table, process diagram, architecture diagram,
ERD, timeline, decision tree, UI mockup, or generated image by information
structure rather than decoration.

## Token policy

Task budgets are divided into gate, retrieval, production, and verification.
Nano skips external capability and retrieval discovery unless the task itself
requires it. Lite uses direct context or one focused route. Standard may use one
primary retrieval route and focused verification. Prime and Hyper may use
hybrid retrieval and reranking when the contract justifies the cost. Evidence
packs are reused across roles; raw tool output is not copied repeatedly.

## Validation

The release adds:

- structural evals for retrieval routing, contract activation, Python evidence,
  TypeScript strictness, visual necessity, and token proportionality;
- a pure-Python retrieval metric utility;
- a Matplotlib reporting utility;
- a strict TypeScript reference router with executable tests;
- validator checks for synchronized retrieval, contract, visual, and execution
  fields;
- release and publish-readiness reports.

## Completion criteria

The implementation is complete only when all existing validation commands and
new runtime checks pass, every live manifest declares 4.4.0, documentation is
synchronized, no credential or host-specific dependency is bundled, generated
artifacts are reproducible, and the final report distinguishes structural
readiness from behavioral certification.
