# Cross-Host Behavioral Conformance Summary

- **Total Test Cases**: 5
- **Passed Cases**: 0
- **Failed Cases**: 0
- **Partial Cases**: 5
- **Overall Verdict**: `PARTIAL`
- **Tested Commit**: `d845cea`
- **Timestamp**: `2026-07-31T01:15:00+07:00`

## Conformance Results Table

| Case ID | Host | Invariant Tested | Evidence Type | Verdict |
|---|---|---|---|---|
| `CH-01` | Google Antigravity | `INV-04` (Nano/Lite Tiering) | `static-package` | `PARTIAL` |
| `CH-02` | Google Antigravity | `INV-01` (Exact 5 Public Skills) | `static-package` | `PARTIAL` |
| `CH-03` | Claude Code | `INV-12` (Boundary Security) | `static-package` | `PARTIAL` |
| `CH-04` | Codex | `INV-15` (Memory Evidence) | `static-package` | `PARTIAL` |
| `CH-05` | ChatGPT | `INV-03` (MCP Host Transport) | `static-package` | `PARTIAL` |

## Evidence status

All five cases are spec-derived expectation checks. Each case records the invariant from
`CONFORMANCE-SPEC.md`, the raw prompt, the expected invariant, and an honest limitation, but
none were observed in a live host session. They carry `evidenceType: static-package` and
`verdict: PARTIAL`, which is the strongest status permitted without `real-host-lifecycle`
evidence.

## Specification coverage vs behavioral certification

Conformance specification coverage and behavioral certification are separate facts. The
conformance specification defines seven invariant groups across product identity, intake,
execution, capability, security, memory, and lifecycle. These cases confirm that each
invariant has a defined expectation, but they do not certify that a host behaved as expected.
A host `PASS` requires `evidenceType: real-host-lifecycle` and is only permitted after a
verified live invocation. Until a live host session occurs, the aggregate remains `PARTIAL`.
