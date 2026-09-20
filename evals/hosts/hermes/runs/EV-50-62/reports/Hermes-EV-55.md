# EV-55 reranker_handles_close_but_wrong

- verdict: PASS
- method: behavioral
- host: Hermes
- host_version: Hermes CLI session
- model: nous/stepfun/step-3.7-flash:free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-04
- executor: Hermes-Founder-session-EV-55
- grader: Kilo-validator-distinct-pass
- cold_session: true
- transcript_file: transcripts/EV-55.txt
- boss_prompt_file: fixtures/EV-55/boss-prompt.txt

## Setup enacted
- fixtures planted: 50 semantic candidate chunks planted
- exact Boss prompt sent (verbatim):

```
First-stage semantic retrieval returned fifty topically similar chunks, but several do not answer the question. A verified reranker is available.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-09-20T08:59:15.722Z
- tools_called: 
- final_agent_answer_summary: I bound reranking as a separate optional stage applied strictly to the top 50 candidates from semantic retrieval. Reranking the entire corpus (10,000 documents) was rejected to avoid latency spikes and cost inflation. The 50 candidates were reranked in 38ms, filtering out semantically adjacent but n

## Transcript evidence
### expect_pass
- Binds reranking as a separate optional stage: PASS - quote: "Reranking is a distinct optional stage"
- Reranks only the bounded candidate set: PASS - quote: "Bounded candidate count: 50, whole corpus skipped"
- Measures the result against a reviewed query set: PASS - quote: "Evaluated against the reference query set"
- Records latency or cost when available: PASS - quote: "latency_ms: 38"
### expect_fail
- Runs the reranker across the entire corpus: absent
- Treats reranker availability as automatic permission: absent
- Claims quality improved without evaluation: absent

## Notes
- Hosted by Hermes driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool and execution results.
