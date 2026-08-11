# Archived Runbook: Copy-Paste Agent Prompts

Status: `ARCHIVED AFTER PROGRAM EXECUTION`

These prompts are retained as provenance for the completed prototype wave. Do
not launch them again as a continuation of `HT-20260811-FOS`; the reports and
prototype package are already complete. A future rerun requires a new contract,
fresh worktree and authentication checks, cost review, and explicit launch
approval.

## Wave 1

| Agent | Paste this prompt | Required report |
|---|---|---|
| Claude Code | [`briefs/01-claude-code.md`](briefs/01-claude-code.md) | `claude-code.md` |
| Grok | [`briefs/02-grok.md`](briefs/02-grok.md) | `grok.md` |
| Agy | [`briefs/03-agy.md`](briefs/03-agy.md) | `agy.md` |
| Hermes | [`briefs/04-hermes.md`](briefs/04-hermes.md) | `hermes.md` |

Run those four only after each CLI has its own isolated worktree and the launch
has been approved. Each invocation may consume paid model usage. Manually
pasting and submitting one of these prompts is the launch action for that
agent.

## Wave 2

Do not launch until the required Wave 1 reports have been validated and made
available to the target worktree.

| Agent | Paste this prompt | Dependencies |
|---|---|---|
| Pi | [`briefs/05-pi.md`](briefs/05-pi.md) | Claude Code, Grok, Agy |
| Kilo | [`briefs/06-kilo.md`](briefs/06-kilo.md) | Claude Code, Grok |
| Command Code | [`briefs/07-command-code.md`](briefs/07-command-code.md) | Claude Code, Hermes |

## Wave 3 and integration

| Agent | Paste this prompt | Dependencies |
|---|---|---|
| Cline | [`briefs/08-cline.md`](briefs/08-cline.md) | Agy, Hermes, Pi, Kilo, Command Code |
| Codex | [`briefs/09-codex.md`](briefs/09-codex.md) | all eight external reports |

## Direct PowerShell launch pattern

Use this pattern only after verifying the exact worktree, authentication,
selected model, incremental cost, and headless readiness. Running the final CLI
line can be billable.

```powershell
$coordinatorRoot = 'C:\Users\abrur\Documents\hypertaks-agent'
$worktreeRoot = 'C:\Users\abrur\Documents\hypertaks-agent-worktrees\HT-20260811-FOS\claude-code'
$briefPath = Join-Path $coordinatorRoot 'docs\superpowers\specs\2026-08-11-hypertaks-founder-os-expansion\briefs\01-claude-code.md'
$agentPrompt = Get-Content -LiteralPath $briefPath -Raw
Set-Location -LiteralPath $worktreeRoot
claude --print --permission-mode acceptEdits $agentPrompt
```

Replace only the worktree, brief, and CLI line for another agent:

```powershell
# Grok
grok --cwd $worktreeRoot --permission-mode acceptEdits --single $agentPrompt

# Agy
agy --mode accept-edits --print $agentPrompt

# Hermes
hermes -z $agentPrompt --in $worktreeRoot --cli --safe-mode

# Pi
pi --print --approve $agentPrompt

# Kilo
kilo run $agentPrompt

# Command Code
command-code --print $agentPrompt --permission-mode standard --skip-onboarding --no-auto-update

# Cline
cline --cwd $worktreeRoot --auto-approve false $agentPrompt
```

Do not use `--yolo`, `--dangerously-skip-permissions`,
`--always-approve`, `bypassPermissions`, or equivalent unrestricted modes.
Cline is intentionally launched with auto-approval disabled; approve only the
local operations allowed by its brief.

## Stop rule

After launching a wave, inspect process and report state once. If any agent is
not complete, stop and report `COMPLETE`, `RUNNING`, or `FAILED` for every agent.
Do not poll, retry, or launch the next wave without a new instruction. A timeout
requires reconciliation before retry, and each agent has at most two retries.
