# Superpowers -> Hypertaks Phase Map

When the Superpowers plugin (or an equivalent process-skill set) is present in
the environment, use its skills at the phase where each one earns its keep. This
map tells the Founder *which* process skill fires *where* and *why*. Skills that
are not installed this session are simply skipped - never fabricate a skill call.

| Superpowers skill | Hypertaks phase | Fires when |
|-------------------|-----------------|------------|
| `brainstorming` | P1 - Frame | Any creative/build task, before committing to an approach |
| `writing-plans` | P3 - Equip | Turning the contract into per-agent briefs / a multi-step plan |
| `subagent-driven-development` | P4 - Produce | Orchestrated mode, parallel independent subtasks |
| `dispatching-parallel-agents` | P4 - Produce | Hyper/Omega only, multi-workstream fan-out |
| `executing-plans` | P4 - Produce | Sequential build with review checkpoints |
| `test-driven-development` / `tdd` | P4 - Produce (engineering) | Any production code - RED-GREEN-REFACTOR |
| `systematic-debugging` | P4 - Produce (engineering) | Any bug, test failure, or unexpected behavior |
| `using-git-worktrees` | P4 - Produce (engineering) | Parallel branches need isolation |
| `verification-before-completion` | P5 - Integrate | Hard gate before any "done" claim |
| `requesting-code-review` | P5 - Integrate | Pre-delivery review of a code artifact |
| `receiving-code-review` | P5 - Integrate | Applying review feedback |
| `finishing-a-development-branch` | P5 - Integrate | Final merge/PR/cleanup decision |

## Process-skill priority

When more than one applies, run process skills before implementation skills:

1. **Process first** - `brainstorming` (creative) or `systematic-debugging`
   (bug) decides *how* to approach the task.
2. **Implementation second** - domain skills and the engineering references
   execute inside that approach.

"Let's build X" -> brainstorm, then build. "Fix this bug" -> debug protocol,
then patch. See `engineering.md` for the RED-GREEN-REFACTOR and 4-phase debug
protocols in detail.

## Instruction priority (unchanged)

The Boss's explicit instructions (this repo's `CLAUDE.md`, direct requests)
outrank any process skill. A skill that says "always TDD" yields to a Boss who
says "no tests for this spike" - but the downgrade is announced, never silent.
