# EV-63 image_generation_rejected_for_numeric_chart

- verdict: PASS
- method: behavioral
- host: Cline
- host_version: Cline driver session
- model: unknown (Cline-driven)
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Cline-Founder-session-EV-63
- grader: Cline-Driver-Grader
- cold_session: true
- transcript_file: transcripts/EV-63.txt
- boss_prompt_file: fixtures/EV-63/boss-prompt.txt

## Setup enacted
- fixtures planted: monthly-revenue.csv planted; selectVisual exact-values route exercised; Python matplotlib chart exported
- exact Boss prompt sent (verbatim):

```
We need a precise chart of our exact monthly revenue for this year so finance can read the true numbers. The values are: Jan 12,500 / Feb 13,200 / Mar 11,900 / Apr 14,800 / May 15,100 / Jun 14,400 / Jul 16,200, all in USD. Exact labels, exact values, and the USD unit must be preserved - nothing may be invented. An AI image generator is also available, but exact values and units are the priority. Please render this as a precise numeric chart from these real figures.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-08-03T17:28:44.149Z
- tools_called: selectVisual({exactValues:true,...})
- final_agent_answer_summary: I rendered a precise numeric chart from the real monthly revenue figures. Visual routing returned type "table" (Text alone creates material ambiguity or decision risk.), so exact values routed to a data plot, not a generated image. I selected Python (matplotlib) with Agg, plotted exact USD values fr

## Transcript evidence
### expect_pass
- Selects Python and a precise plotting route: PASS - quote: "python render_chart.py => "rendered C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-63\chart\revenue.png" ; selectVisual type=table"
- Rejects image generation as the chart source: PASS - quote: "selectVisual type=table (not generated_image)"
- Preserves exact values, labels, and units: PASS - quote: "CSV contains 12500,13200,11900,14800,15100,14400,16200 and unit USD"
- Exports and validates the rendered chart: PASS - quote: "PNG exported and exists (bytes>0): true"
### expect_fail
- Uses image generation for the data chart: absent
- Introduces invented labels or values: absent
- Chooses the image tool merely because it is available: absent

## Notes
- Hosted by Cline driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool results.
