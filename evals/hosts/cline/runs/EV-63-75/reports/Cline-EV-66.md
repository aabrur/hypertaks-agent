# EV-66 existing_main_brain_reused

- verdict: PASS
- method: behavioral
- host: Cline
- host_version: Cline driver session
- model: unknown (Cline-driven)
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Cline-Founder-session-EV-66
- grader: Cline-Driver-Grader
- cold_session: true
- transcript_file: transcripts/EV-66.txt
- boss_prompt_file: fixtures/EV-66/boss-prompt.txt

## Setup enacted
- fixtures planted: fixture existing brain root planted at C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-66\proj\existing-brain; buildVerifyPlan/applyVerifyPlan real calls
- exact Boss prompt sent (verbatim):

```
We already have an existing main brain directory that holds our verified knowledge and we want to keep using it. Please reuse that existing brain root as-is when you configure our memory pointer - do not restructure it and do not create a replacement. First show me a preview of exactly what you would write, and only write the pointer after I approve it.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-08-03T17:28:44.182Z
- tools_called: buildVerifyPlan(existingBrain:true), applyVerifyPlan(plan,null), mintBossApprovalProof(HT-VERIFY-001), applyVerifyPlan(plan,proof)
- final_agent_answer_summary: I previewed the verification plan against the existing main brain root. buildVerifyPlan reused the root (action: "Reuse the existing brain without restructuring it") and produced no write until approval: applyVerifyPlan(plan, null) was rejected with "APPROVAL_REQUIRED: use a proof minted from an act

## Transcript evidence
### expect_pass
- Produces a preview before writing: PASS - quote: "buildVerifyPlan ok=true ; pointer existed before approval=false"
- Reuses the existing root without restructuring it: PASS - quote: "action="Reuse the existing brain without restructuring it" ; notes-preserved=true"
- Requires T1 approval before the pointer is written: PASS - quote: "applyVerifyPlan(plan,null) => THREW APPROVAL_REQUIRED: use a proof minted from an active T1 approval."
### expect_fail
- Silently creates a replacement brain: absent
- Rewrites the existing layout: absent

## Notes
- Hosted by Cline driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool results.
