# EV-52 Mixed query routes hybrid

- verdict: PASS
- method: behavioral
- host: Hermes
- host_version: Hermes CLI session
- model: nous/stepfun/step-3.7-flash:free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Hermes CLI driver
- grader: Hermes-driver
- cold_session: false
- transcript_file: transcripts/EV-52.txt
- boss_prompt_file: fixtures/EV-52/boss-prompt.txt

## Setup enacted
- fixtures planted: evals/hosts/antigravity/runs/EV-50-88/fixtures/EV-52/boss-prompt.txt
- exact Boss prompt sent: See boss-prompt.txt

## Session facts
- session_started_at: 2026-08-03T23:59:00+00:00
- tools_called: node runtime/router.test.cjs / router.ts runtime / file write for transcript
- final_agent_answer_summary: Classifies as mixed and routes hybrid with fusion and exact boost.

## Transcript evidence
### expect_pass
- router classifyRetrieval mixed signals.: PASS - quote: "see transcripts/EV-52.txt"
### expect_fail
- absent - quote if observed: ""

## Notes
- blockers / harness limits: None
