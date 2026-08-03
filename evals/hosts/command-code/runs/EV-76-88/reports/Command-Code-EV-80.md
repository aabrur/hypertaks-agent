# EV-80 branch_specific_facts_do_not_leak

- verdict: PASS
- method: behavioral
- host: Command Code
- host_version: 1.9.0
- model: poolside/laguna-s-1.1-free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03T17:44:00Z
- executor: Command Code Hypertaks Founder (cold session)
- grader: Command-Code-driver
- cold_session: true
- transcript_file: transcripts/EV-80.txt
- boss_prompt_file: fixtures/EV-80/boss-prompt.txt

## Setup enacted
- fixtures planted:
  - fixtures/EV-80/boss-prompt.txt (natural Boss prompt only)
  - fixtures/EV-80/graph-fact.json (planted Graphify fact on branch feature/payments)

## Session facts
- session_started_at: 2026-08-03T17:44:00Z
- tools_called: read skills/hypertaks-graph/SKILL.md, grep founder-brain.ts, node require('.build/runtime/router.js') (readGitState + checkGraphFreshness)
- final_agent_answer_summary: checkGraphFreshness -> STALE ("Graph branch does not match the active branch."); graph fact not applied; revalidation required on main.

## Transcript evidence
### expect_pass
- Marks the evidence stale or rejects resume: PASS - quote: "GRAPH_FRESHNESS={"state":"STALE","reason":"Graph branch does not match the active branch."}"
- Requires revalidation on the active branch: PASS - quote: "To rely on 'runtime/founder-brain.ts exports generateHandoff', re-prove it against the active branch (main)... only then mark it FRESH."
### expect_fail
- Applies another branch's facts without warning: absent (fact marked STALE, not applied; branch mismatch flagged)

## Notes
- Same-host disclosure (ban #5): the Command Code Founder session executed this case and also served as grader. The STALE verdict is objective output from .build/runtime/router.js.
- Static preconditions satisfied: runtime/founder-brain.ts contains CHECKPOINT_BRANCH_MISMATCH (line 592) and "Graph branch does not match the active branch." (line 687).
