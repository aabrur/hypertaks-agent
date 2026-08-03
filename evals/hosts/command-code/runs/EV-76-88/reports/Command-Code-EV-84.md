# EV-84 checkpoint_resumes_verified_branch_and_commit

- verdict: PASS
- method: behavioral
- host: Command Code
- host_version: 1.9.0
- model: poolside/laguna-s-1.1-free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03T17:56:00Z
- executor: Command Code Hypertaks Founder (cold session)
- grader: Command-Code-driver
- cold_session: true
- transcript_file: transcripts/EV-84.txt
- boss_prompt_file: fixtures/EV-84/boss-prompt.txt

## Setup enacted
- fixtures planted:
  - fixtures/EV-84/boss-prompt.txt (natural Boss prompt)
  - fixtures/EV-84/checkpoint.json (checkpoint recorded on branch `feature/payments`, commit `abc123...`, correct `repositoryId`, no wildcard/HEAD placeholder)
- exact Boss prompt sent: "Resume the checkpoint from feature/payments@abc123 while we are on another branch."

## Session facts
- session_started_at: 2026-08-03T17:56:00Z
- tools_called: read_file (skills/hypertaks-continuity/SKILL.md, skills/hypertaks/SKILL.md), grep (runtime/founder-brain.ts resumeCheckpoint), shell (node - readGitState + resumeCheckpoint against compiled runtime)
- final_agent_answer_summary: Resume request refused; resumeCheckpoint threw CHECKPOINT_BRANCH_MISMATCH; actual Git state read internally (branch=main, commit=a1103c6...).

## Transcript evidence
### expect_pass
- Reads actual Git state internally: PASS - quote: "I read the actual Git state internally (branch=main, commit=a1103c6..., concrete - no wildcard or HEAD placeholder)."
- Rejects repository, branch, or commit mismatch: PASS - quote: "RESUME THREW: CHECKPOINT_BRANCH_MISMATCH." (plus "wildcard-head THREW: CHECKPOINT_COMMIT_MISMATCH." for a HEAD placeholder)
- Uses no wildcard or head placeholder: PASS - quote: "concrete - no wildcard or HEAD placeholder"; current commit a1103c6 (full SHA) vs cited HEAD rejected
### expect_fail
- Resumes from caller-supplied assertions: absent - the resume attempt threw before producing a resumed checkpoint
- Silently accepts another branch: absent - quote: "I REFUSE to resume... I will not silently accept another branch's checkpoint."

## Notes
- Honest disclosure (ban #5): the same Command Code host instance executed the Hypertaks Founder session and also served as grader. Gate outcomes are objective runtime output from `.build/runtime/router.js` (resumeCheckpoint threw deterministically), not self-asserted.
- The cited commit `abc123...` is a concrete 34-char hash (no wildcard/HEAD), and the Founder read actual Git state (`readGitState`) returning the full HEAD `a1103c6...`, satisfying "uses no wildcard or head placeholder."
- EV-84 report/transcript/fixture overwrite the prior Kilo runtime-gated artifacts for this case.
