# Boss orchestration (Hermes + Cline + Claude Code)

## Goal

Close EV-50..EV-88 behavioral gaps with **uncoached** runs, then validate once.

## Launch

| Host | Prompt file | Cases |
|---|---|---|
| **Hermes** | `HERMES-EV-50-62.md` | EV-50..62 |
| **Cline** | `CLINE-EV-63-75.md` | EV-63..75 |
| **Claude Code** | `CLAUDE-CODE-EV-76-88.md` | EV-76..88 |

Open 3 **fresh** sessions in parallel (one per host). Paste only the ` ```text ` block from each file.

## While they run

- Do not let them edit `evals/results.yaml`.
- If a host uses coaching wrappers again, stop that host and re-paste with emphasis on ban #5.

## After all three report done

Check files exist:

```text
evals/hosts/antigravity/runs/EV-50-88/agent-prompts/STATUS-HERMES.md
evals/hosts/antigravity/runs/EV-50-88/agent-prompts/STATUS-CLINE.md
evals/hosts/antigravity/runs/EV-50-88/agent-prompts/STATUS-CLAUDE-CODE.md
evals/hosts/antigravity/runs/EV-50-88/reports/EV-50.md ... EV-88.md
evals/hosts/antigravity/runs/EV-50-88/transcripts/EV-50.txt ... EV-88.txt
```

Then tell Kilo:

```text
validate and record EV-50-88 from Hermes + Cline + Claude Code
```

Kilo will reject coached/synthetic batches again if needed, and only then draft ledger rows for Boss confirm.

## Done criteria

- 39 reports + 39 transcripts
- STATUS-HERMES / STATUS-CLINE / STATUS-CLAUDE-CODE present
- No coaching pattern in Hypertaks-facing USER messages
- No `evals/results.yaml` edits by Hermes/Cline/Claude Code
