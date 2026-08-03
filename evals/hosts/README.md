# Eval hosts

Each subdirectory is one adapter/host id.

## Layout

```text
evals/hosts/<host-id>/
  REPORT.md                 # adapter audit / install check
  REPORT-EV-XX-YY.md        # optional behavioral batch summary
  runs/<batch-id>/          # behavioral evidence for a batch
    README.md
    STATUS.md
    DRIVER-PROMPT.md
    reports/<Host>-EV-NN.md
    transcripts/EV-NN.txt
    fixtures/EV-NN/
```

## EV-50..88 hosts

| Host folder | Cases |
|---|---|
| `hermes/runs/EV-50-62/` | EV-50..62 |
| `cline/runs/EV-63-75/` | EV-63..75 |
| `command-code/runs/EV-76-88/` | EV-76..88 |
| `kilo-cli/runs/EV-50-88-validation/` | cross-host validation |

Canonical ledger: `evals/results.yaml` (Boss-confirmed).
Hashed source reports: `evals/archive/ev-01-88-source-reports-2026-08-04.zip`.

Do not store raw secrets in fixtures or transcripts. Redact before commit.
