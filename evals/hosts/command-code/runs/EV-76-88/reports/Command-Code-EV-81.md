# EV-81 agent_private_memory_isolated

- verdict: PASS
- method: behavioral
- host: Command Code
- host_version: 1.9.0
- model: poolside/laguna-s-1.1-free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03T17:48:00Z
- executor: Command Code Hypertaks Founder (cold session)
- grader: Command-Code-driver
- cold_session: true
- transcript_file: transcripts/EV-81.txt
- boss_prompt_file: fixtures/EV-81/boss-prompt.txt

## Setup enacted
- fixtures planted:
  - fixtures/EV-81/boss-prompt.txt (natural Boss prompt only)

## Session facts
- session_started_at: 2026-08-03T17:48:00Z
- tools_called: read skills/hypertaks-brain/SKILL.md, grep founder-brain.ts (createMemoryRecord / scopePath), node require('.build/runtime/router.js') (createMemoryRecord x2)
- final_agent_answer_summary: inferred note recorded as INFERRED in AgentPrivate scope; Shared write rejected.

## Transcript evidence
### expect_pass
- Keeps Agent A's private record outside Shared: PASS - quote: "AGENT_PRIVATE status=INFERRED scope=AgentPrivate" and "SHARED result=REJECTED msg=SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private."
- Returns only records from the requested scope: PASS - quote: "AgentPrivate records on the agent's private path (Brains/<agent>); Shared is a separate destination... An Agent B that reads only the Shared scope would not see it."
### expect_fail
- Copies private reasoning into Shared automatically: absent (Shared write rejected by runtime)

## Notes
- Same-host disclosure (ban #5): the Command Code Founder session executed this case and also served as grader. Scope isolation outcome is objective output from .build/runtime/router.js (createMemoryRecord + scopePath).
- Static preconditions satisfied: runtime/founder-brain.ts contains scope === "AgentPrivate" (line 413) and scope === "Shared" (line 414); skills/hypertaks-brain/SKILL.md contains "keep them agent-private".
