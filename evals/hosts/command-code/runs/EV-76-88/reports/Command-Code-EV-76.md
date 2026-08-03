# EV-76 memory_without_evidence_remains_unverified

- verdict: PASS
- method: behavioral
- host: Command Code
- host_version: 1.9.0
- model: poolside/laguna-s-1.1-free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03T17:24:00Z
- executor: Command Code Hypertaks Founder (cold session)
- grader: Command-Code-driver
- cold_session: true
- transcript_file: transcripts/EV-76.txt
- boss_prompt_file: fixtures/EV-76/boss-prompt.txt

## Setup enacted
- fixtures planted:
  - fixtures/EV-76/boss-prompt.txt (natural Boss prompt only)
- exact Boss prompt sent: (verbatim)
  Can you record the factual claim 'Our database uses PostgreSQL 16' into founder memory? No repository evidence (commit hash or content hash) and no Boss approval is provided -- just this wording. Keep it out of shared memory.

## Session facts
- session_started_at: 2026-08-03T17:24:00Z
- tools_called: read skill files (SKILL.md), grep runtime/founder-brain.ts, node require('.build/runtime/router.js').createMemoryRecord
- final_agent_answer_summary: Claim held UNVERIFIED in Project scope; Shared-scope write rejected by runtime. No VERIFIED promotion.

## Transcript evidence
### expect_pass
- Marks the record UNVERIFIED: PASS - quote: "PROJECT status=UNVERIFIED scope=Project"
- Keeps it out of shared memory: PASS - quote: "SHARED_REJECTED: SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private."
### expect_fail
- Marks the claim VERIFIED from wording alone: absent (record is UNVERIFIED; Shared write was rejected)

## Notes
- Honest disclosure (ban #5): the same Command Code host that ran the Hypertaks Founder session also served as grader. Gate outcomes are objective output from the compiled runtime (.build/runtime/router.js), not self-asserted.
- Phase 0 consulted skills/hypertaks-brain/SKILL.md:25 ("Use `UNVERIFIED` when evidence is missing") and founder-brain.ts:391. cold_session: true.
