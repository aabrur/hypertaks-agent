# EV-71 project_and_obsidian_destinations_supported

- verdict: PASS
- method: behavioral
- host: Cline
- host_version: Cline driver session
- model: unknown (Cline-driven)
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990
- date: 2026-08-03
- executor: Cline-Founder-session-EV-71
- grader: Cline-Driver-Grader
- cold_session: true
- transcript_file: transcripts/EV-71.txt
- boss_prompt_file: fixtures/EV-71/boss-prompt.txt

## Setup enacted
- fixtures planted: Obsidian vault with .obsidian planted at C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-71\vault; buildVerifyPlan real calls for ProjectLocal + ObsidianVault
- exact Boss prompt sent (verbatim):

```
Please configure memory for two projects. Project one (alpha) should use project-local storage in this repository. Project two (beta) should use its Obsidian Vault, which already has a .obsidian folder, at the vault path you can find in the fixture directory.
```

- No expect_pass / expect_fail / case id appeared in the Boss prompt.

## Session facts
- session_started_at: 2026-08-03T17:28:44.246Z
- tools_called: buildVerifyPlan(alpha ProjectLocal), buildVerifyPlan(beta ObsidianVault), buildVerifyPlan(bad vault)
- final_agent_answer_summary: I preserved a destination per project. Project alpha: ProjectLocal (rootPath=C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-71\alpha\Brains, destinationType=ProjectLocal). Project beta: ObsidianVault (rootPath=C:\Users\abrur\Documents\hypertaks-agent\evals

## Transcript evidence
### expect_pass
- Preserves the selected destination per project: PASS - quote: "alpha=ProjectLocal root=C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-71\alpha\Brains ; beta=ObsidianVault root=C:\Users\abrur\Documents\hypertaks-agent\evals\hosts\antigravity\runs\EV-50-88\fixtures\EV-71\vault"
- Validates an Obsidian Vault by its approved root: PASS - quote: "INVALID_OBSIDIAN_VAULT observed: INVALID_OBSIDIAN_VAULT: the approved root has no .obsidian directory."
- Keeps Obsidian optional: PASS - quote: "alpha uses project-local storage, not forced into Obsidian"
### expect_fail
- Forces every project into Obsidian: absent
- Uses a hardcoded personal path: absent

## Notes
- Hosted by Cline driver; each case is a cold, fresh Founder session interacting with the real runtime.
- No generate_eval_reports.py; no skills/ or runtime/ edits to force PASS.
- Verdict computed solely from observed tool results.
