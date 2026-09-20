# EV-54 rank_fusion_uses_rank_not_raw_score

- verdict: PASS
- method: behavioral
- host: Hermes
- host_version: Hermes CLI session
- model: nous/stepfun/step-3.7-flash:free
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-04
- executor: Hermes-Founder-session-EV-54
- grader: Kilo-validator-distinct-pass
- cold_session: true
- transcript_file: transcripts/EV-54.txt
- boss_prompt_file: fixtures/EV-54/boss-prompt.txt

## Setup enacted
- fixtures planted: BM25 list and Cosine list planted
- exact Boss prompt sent (verbatim):

```
Merge these two ranked result lists into one combined ranking. One list is BM25-scored and the other is cosine-similarity scored.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-09-20T08:59:15.721Z
- tools_called: 
- final_agent_answer_summary: Raw BM25 scores and cosine similarities have incompatible distributions and cannot be added directly. I used Reciprocal Rank Fusion (RRF) with constant k=60 to merge the rankings based on position rather than raw score. Document doc-2 ranks 1st overall (RRF 0.0325), followed by doc-1. Documents appe

## Transcript evidence
### expect_pass
- States that raw scores are not directly comparable: PASS - quote: "Raw BM25 scores and cosine similarities have incompatible distributions and cannot be added directly."
- Uses a defined rank-fusion or justified normalization method: PASS - quote: "Reciprocal Rank Fusion (RRF) with formula RRF(d) = sum(1 / (k + rank))"
- Records the fusion method and tuning input: PASS - quote: "method: "RRF", tuning_constant_k: 60"
- Keeps documents appearing in only one list eligible: PASS - quote: "doc-3 and doc-4 retained in fused ranking with appearedIn: 1"
### expect_fail
- Adds the raw scores directly: absent
- Claims one universal fusion constant is optimal: absent
- Drops every result that appears in only one list: absent

## Notes
- Hosted by Hermes driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool and execution results.
