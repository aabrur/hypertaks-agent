# Token Discipline - Budget, Waste, Recovery, Fail-Loud

Hypertaks spends tokens like a founder spends cash: against a stated budget, with
checkpoints, and with an honest post-mortem when it overruns. This reference is
consulted at Phase 0 (set the budget) and Phase 5 (account for it in the
compliance footer). It also arms the fail-loud rule that runs on every output.

## 1. Budget - overhead vs production

Mixing these two made the old numbers meaningless. A "~500 token" Nano tier that
must first load a ~5,000-token skill was not a tight budget; it was arithmetic
that could never be satisfied. They are now separate.

**Overhead (fixed, not reducible by discipline):**

| Item | ~tokens |
|---|---|
| SKILL.md | ~5,000 |
| 00-security-kernel.md (mandatory, every tier) | ~1,200 |
| 01-state-and-transactions.md (mandatory from Standard up) | ~1,400 |
| each additional reference read | ~1,500-2,500 |

**Production budget (what the tier actually governs):**

| Tier | Production | References permitted | Checkpoint |
|---|---|---|---|
| **Nano** | ~500 | security-kernel only | none |
| **Lite** | ~3,000 | security-kernel only | Phase 5 |
| **Standard** | ~10,000 | + state-and-transactions, frameworks | phase boundaries |
| **Prime** | ~25,000 | + agent-roles, plugins-and-mcp | phase boundaries |
| **Hyper** | ~60,000 | + engineering, domain packs | + per workstream |
| **Omega** | ~120,000 | as needed, logged | + human check-in |

Allocation within the production budget (rough): Intake 5% · Frame 5% · Roles
5% · Equip 10% · Produce 60% · Integrate 15%. Produce is where it goes; keep
the ceremony phases lean.

**Conditional reference reading - replaces "never equip from memory".**
The mandate to read references applies **from Prime up**. At Standard and below,
reading costs more than it returns: equip from memory **and declare it**:

> `References read this session: none (Lite - equipped from memory; output
> shapes still mandatory).`

This is a *declared* downgrade, which the skill's own third hard rule permits.
The violation was never choosing the cheap path - it was choosing it silently.

**Token accounting honesty.** Do not report a token count you cannot measure.
The compliance footer reports the **budget target + a qualitative read**
(`well under` / `near budget` / `exceeded`), or a real number **only** if the
harness exposes one. A fabricated number is a fabricated statistic.

## 2. Waste patterns - auto-detect and flag

Watch for these while producing. Each is a signal to stop and cut, not to keep
going:

- **Circular reasoning** - the same point restated more than twice.
- **Over-explaining** - output several times longer than the deliverable needs.
- **Wrong framework** - a framework named but its output shape never produced
  (this also violates the output-shape law).
- **Scope creep** - work added that is not in the task contract.
- **Redundant validation** - the same check repeated with no new information.
- **Context pollution** - a reference or KB section loaded that the task did not
  need (e.g. loading the whole knowledge-base instead of grepping).

## 3. Recovery protocol - when waste is detected

1. **Stop** the current line of work the moment the pattern is named.
2. **Name it** explicitly - which pattern, roughly how many tokens it cost.
3. **Log it** in the compliance footer's Token Accounting block.
4. **Roll back** to the last clean phase boundary rather than patching forward.
5. **Re-execute** with the counter-measure (tighter brief, narrower scope,
   grep instead of full-load).
6. **Report** net effect in the footer: "Waste ~X tokens (pattern Y); recovered
   by Z."

Rollback targets and the full violation response are **canonical in
`references/01-state-and-transactions.md` §7**. Reasoning rolls back; a
committed irreversible effect never does - that gets containment + disclosure.

## 4. Fail-loud rule - evidence class (replaces confidence percentages)

An LLM cannot read its own calibration. The percentages this section used to
carry were pseudo-precision: a number invented to sound like a measurement.
Every material claim now carries an **evidence class** instead - a property of
the *claim's source*, which is checkable:

| Class | Meaning | Required action |
|---|---|---|
| **VERIFIED** | Backed by tool output, a test run, a cited source, or Boss-supplied data present in this session | Cite it |
| **INFERRED** | Derived by reasoning from VERIFIED inputs | Show the derivation |
| **ASSUMED** | No input; taken as a working premise | List in Assumptions; state what would confirm it |
| **UNKNOWN** | Needed but unavailable | Never fill it in. Say UNKNOWN. |

**Anti-hallucination clause (closes the output-shape pressure trap).**
The output-shape law obliges the *shape*, never the *content*. If the inputs for
a shape do not exist, return the shape **empty**, with each missing cell marked
`DATA UNAVAILABLE`. Filling a Five Forces table or a Pareto chart with invented
numbers to satisfy the shape is a **worse** violation than not using the
framework at all.

- A partial result reported as complete is a failure, not a rounding error:
  - "Migration complete" while N% was skipped -> report the skip, not "done".
  - "Tests pass" while some were excluded -> name the excluded ones.
  - "Feature works" while an edge case was never exercised -> say it is unverified.

This rule pairs with `verification-before-completion` in `engineering.md`: claims
of "done" need evidence, and honest confidence is part of that evidence.

## 5. Model / cost routing - advisory only

The skill cannot pick the harness model or read a dollar meter, so routing here
is **guidance for whoever drives Hypertaks**, not an enforced control:

- Cheap/fast model is fine for the intake gate, framework pattern-matching, and
  the compliance footer template.
- Reserve the strongest model for deep analysis, code generation, and Phase 5
  integration/QA.
- If a task looks like it will blow past its tier budget, the honest move is to
  say so and let the Boss decide on more budget or a narrower scope - never
  silently burn through it.
