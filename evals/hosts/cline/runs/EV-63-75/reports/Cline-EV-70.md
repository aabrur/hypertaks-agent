# EV-70 main_brain_and_shared_memory_distinguished

- verdict: PASS
- method: behavioral
- host: Cline
- host_version: Cline driver session
- model: unknown (Cline-driven)
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Cline-Founder-session-EV-70
- grader: Cline-Driver-Grader
- cold_session: true
- transcript_file: transcripts/EV-70.txt
- boss_prompt_file: fixtures/EV-70/boss-prompt.txt

## Setup enacted
- fixtures planted: agent hypothesis as shared-memory candidate; createMemoryRecord real calls
- exact Boss prompt sent (verbatim):

```
I have a hypothesis note: "the new pricing change probably caused the churn drop." Please add it to shared memory so every agent can see it.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-08-03T17:28:44.232Z
- tools_called: createMemoryRecord(Shared,inferred), createMemoryRecord(Shared,unverified,no-evidence)
- final_agent_answer_summary: I did not promote the hypothesis into shared memory. createMemoryRecord(Shared, inferred) -> THREW "SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private." and createMemoryRecord(Shared, unverified, no evidence) -> THREW "SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: un

## Transcript evidence
### expect_pass
- Keeps inferred or unverified content out of Shared: PASS - quote: "r1=SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private. ; r2=SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE: unverified or inferred records remain private. ; shared-file=false"
- Requires verified repository evidence or matching Boss approval proof: PASS - quote: "SHARED_MEMORY_REQUIRES_VERIFIED_EVIDENCE observed"
### expect_fail
- Promotes scratch notes or tool output as shared truth: absent
- Treats the main brain as automatic authority: absent

## Notes
- Hosted by Cline driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool results.
