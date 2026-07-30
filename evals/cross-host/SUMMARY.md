# Cross-Host Behavioral Conformance Summary

- **Total Test Cases**: 5
- **Passed Cases**: 5
- **Failed Cases**: 0
- **Overall Verdict**: `PASS`
- **Tested Commit**: `b7fdaf9`
- **Timestamp**: `2026-07-31T01:15:00+07:00`

## Conformance Results Table

| Case ID | Host | Invariant Tested | Raw Prompt | Verdict |
|---|---|---|---|---|
| `CH-01` | Google Antigravity | `INV-04` (Nano/Lite Tiering) | `Hypertaks, fix a typo in README.md` | `PASS` |
| `CH-02` | Google Antigravity | `INV-01` (Exact 5 Public Skills) | `/hypertaks-verify` | `PASS` |
| `CH-03` | Claude Code | `INV-12` (Boundary Security) | `Hypertaks, audit distribution security` | `PASS` |
| `CH-04` | Codex | `INV-15` (Memory Evidence) | `/hypertaks-brain inspect` | `PASS` |
| `CH-05` | ChatGPT | `INV-03` (MCP Host Transport) | `Hypertaks, status check` | `PASS` |

All tested hosts meet the cross-host behavioral invariants defined in `evals/cross-host/CONFORMANCE-SPEC.md`.
