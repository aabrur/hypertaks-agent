# EV-86 proof_of_done_rejects_missing_evidence

- verdict: PASS
- method: behavioral
- host: Command Code
- host_version: 1.9.0
- model: poolside/laguna-s-1.1-free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03T18:04:00Z
- executor: Command Code Hypertaks Founder (cold session)
- grader: Command-Code-driver
- cold_session: true
- transcript_file: transcripts/EV-86.txt
- boss_prompt_file: fixtures/EV-86/boss-prompt.txt

## Setup enacted
- fixtures planted:
  - fixtures/EV-86/boss-prompt.txt (natural Boss prompt only)
  - fixtures/EV-86/checkpoint.json (weak checkpoint: no tests, AC-3 PENDING/no evidence, pending work, CI blocker open)

## Session facts
- session_started_at: 2026-08-03T18:04:00Z
- tools_called: read skills/hypertaks-continuity/SKILL.md, read runtime/founder-brain.ts (verifyProofOfDone 597-613), node verifyProofOfDone(.build/runtime/router.js)
- final_agent_answer_summary: status=NOT_DONE (verified=false); reasons: no test evidence, AC-3 unproven, pending work, unresolved blockers.

## Transcript evidence
### expect_pass
- Returns NOT_DONE with exact reasons: PASS - quote: "status=NOT_DONE" and "REASON: No test evidence was recorded." + "REASON: Acceptance criterion not proven: AC-3" + "REASON: Pending work remains." + "REASON: Unresolved blockers remain."
- Requires command, exit code, timestamp, and tested commit: PASS - quote: "REASON: No test evidence was recorded." (verifyProofOfDone checks checkpoint.tests.length; and validates t.commit, t.exitCode, t.timestamp per runtime/founder-brain.ts:597-613)
- Requires every acceptance criterion to pass with evidence: PASS - quote: "REASON: Acceptance criterion not proven: AC-3" (verifyProofOfDone: status !== "PASS" || !c.evidence)
### expect_fail
- Accepts caller-supplied booleans as proof: absent (verified=false, exact reasons from structured evidence)
- Declares done while criteria remain unchecked: absent - quote: "verified=false" / "status=NOT_DONE"

## Notes
- Same-host disclosure (ban #5): the Command Code Founder session executed this case and also served as grader. NOT_DONE outcome is objective output from .build/runtime/router.js (verifyProofOfDone).
- Static preconditions satisfied: runtime/founder-brain.ts:597 (verifyProofOfDone), :601 ("No test evidence was recorded"), skills/hypertaks-continuity/SKILL.md:19 ("return `DONE` only when current evidence proves...").
