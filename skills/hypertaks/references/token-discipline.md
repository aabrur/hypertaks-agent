# Token Discipline - Budget, Waste, Recovery, Fail-Loud

Hypertaks spends tokens like a founder spends cash: against a stated budget, with
checkpoints, and with an honest post-mortem when it overruns. This reference is
consulted at Phase 0 (set the budget) and Phase 5 (account for it in the
compliance footer). It also arms the fail-loud rule that runs on every output.

## 1. Token budget per tier

Each tier carries a soft token budget. **These figures are working heuristics,
not measurements**: the skill cannot meter the harness, and no benchmark sits
behind the numbers. They are order-of-magnitude estimates of what each tier's
ceremony plus production typically costs, chosen so that the ratios between
tiers are right even where the absolute numbers are not. Use them as a
planning target and a checkpoint trigger - a founder's budget line: aim to
land under it, and when a checkpoint shows an overrun coming, stop and decide.
If a harness exposes real token counts, prefer those and say so in the footer.

| Tier | Token budget | Checkpoint | On 80% before Phase 5 |
|------|-------------|------------|------------------------|
| **Nano** | ~500 | none (single pass) | n/a - answer or escalate |
| **Lite** | ~3,000 | at Phase 5 | finish tight or restate as Standard |
| **Standard** | ~10,000 | every phase boundary | stop, summarize, ask to continue or narrow |
| **Prime** | ~25,000 | every phase boundary | stop, summarize, ask; offer rollback to P3 (re-equip) |
| **Hyper** | ~60,000 | every phase + per workstream | stop, summarize, ask; offer rollback to P1 (re-frame) |
| **Omega** | ~120,000 | every phase + human check-in | stop, escalate to Boss for a go/no-go |

Allocation guide within a task (rough): Intake 5% · Frame 5% · Roles 5% ·
Equip 10% · Produce 60% · Integrate 15%. Produce is where budget goes; keep the
ceremony phases lean.

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

Rollback target by tier: Lite -> restart lean · Standard -> back to Phase 2
(re-pick roles) · Prime -> back to Phase 3 (re-equip) · Hyper -> back to Phase 1
(re-frame).

The same stop-and-roll-back response applies to **contract violations** of any
kind (wrong tier, skipped phase, scope drift, ungranted access), with one
addition: after rolling back, re-present the adjusted contract and wait for a
new approval. See `references/intake-protocol.md`, Step 5.

## 4. Fail-loud rule (confidence scoring)

Every material output carries an honest confidence read. Do not paper over
uncertainty to sound finished. The percentage thresholds below are **rules of
thumb, not calibrated measurements** - they exist to force two distinct
behaviors ("say what you are unsure of" vs "stop and ask"), and the exact
cutoffs are judgment lines, not statistics:

- **Confidence < ~70%** (noticeably unsure) - surface the uncertainty
  explicitly in the deliverable; state what would raise it.
- **Confidence < ~50%** (a coin flip or worse) - stop and ask for
  clarification before delivering.
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
