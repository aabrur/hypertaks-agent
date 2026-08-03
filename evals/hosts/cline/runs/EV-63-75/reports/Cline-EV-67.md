# EV-67 existing_custom_layout_preserved

- verdict: PASS
- method: behavioral
- host: Cline
- host_version: Cline driver session
- model: unknown (Cline-driven)
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Cline-Founder-session-EV-67
- grader: Cline-Driver-Grader
- cold_session: true
- transcript_file: transcripts/EV-67.txt
- boss_prompt_file: fixtures/EV-67/boss-prompt.txt

## Setup enacted
- fixtures planted: custom Notes/Knowledge vault planted at C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-67\proj\custom-vault; buildVerifyPlan/applyVerifyPlan real calls
- exact Boss prompt sent (verbatim):

```
My memory lives in a custom folder with its own Notes/ and Knowledge/ layout that does not follow the Hypertaks defaults. Please register that approved root for memory without moving, renaming, or copying my files, and do not force it into a Brains or Shared structure.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-08-03T17:28:44.200Z
- tools_called: buildVerifyPlan(custom-root), mintBossApprovalProof(HT-CUSTOM-002), applyVerifyPlan(plan,proof)
- final_agent_answer_summary: I registered the approved custom root without moving any files. buildVerifyPlan reused the existing custom layout (action: "Reuse the existing brain without restructuring it") and, after approval, applyVerifyPlan wrote only the pointer metadata. The custom Notes/ and Knowledge/ folders were left unt

## Transcript evidence
### expect_pass
- Registers the approved root without moving user files: PASS - quote: "notes/topic files unchanged after apply=true"
- Creates only minimum pointer metadata after approval: PASS - quote: "pointer written=true"
### expect_fail
- Forces the existing root into Brains or Shared folders: absent
- Copies the full external brain into the repository: absent

## Notes
- Hosted by Cline driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool results.
