# Codex Execution Evidence Log - Cross-AI Distribution Wave 2

- **Agent**: codex (worktree `cross-ai-distribution-wave-2-execution`)
- **Branch**: `feat/cross-ai-distribution-wave-2` / `codex/cross-ai-distribution-wave-2-execution`
- **Commit**: `688508a` (base) -> `ef21e50` (Task 5 tip), Task 6 pending
- **Date**: `2026-07-31`
- **Product Version**: `4.5.0`
- **Product Self-Reference**: Canonical five public skills; canonical SVG `assets/Hypertask.svg`.

## 1. Baseline Snapshot

Captured before any changes. All green:

- `python scripts/validate_skill.py` -> exit 0
- `python scripts/validate_public_skills.py` -> exit 0 (exactly five skills)
- `python scripts/validate_distributions.py` -> exit 0
- `python scripts/build_distributions.py antigravity --check-only` -> exit 0
- `python -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance` -> 9 tests, OK
- `npm test` (typecheck + build + router) -> PASS

Known gaps pre-wave-2: no host-capability evidence validator; no installer test fixture isolation;
conformance validator accepted structural `PASS` without evidence; only 9 of 22 host reports.

## 2. TDD Evidence (RED -> GREEN per task)

### Task 2 - Host capability evidence validator

- `test_validate_host_capabilities.ValidateHostCapabilitiesTests.test_pass_requires_real_host_lifecycle` -> RED (`ModuleNotFoundError`), then GREEN after `validate_host_capabilities.py`.
- Negative cases added: duplicate host IDs, capability/host set mismatch, unsupported classification,
  missing official URL, escaping evidence path. Valid `PARTIAL` (static-package) positive case added.
- Final: `python -m unittest scripts.test_validate_host_capabilities` -> 8 tests, OK.
- `python scripts/validate_host_capabilities.py` -> exit 0 on schema-v2 records.

### Task 3 - Installer ownership lifecycle

- `test_uninstall_preserves_unknown_files` -> RED (unknown file deleted), then GREEN after safe ownership deletion + `project_root` isolation.
- Transaction set added: unmanaged collision rejected without user files; dry-run leaves nothing;
  update recalculates hashes and `cmd_verify` passes; malformed/traversal manifest rejected without deletion;
  reinstall idempotent; corrupt content detected; unknown host nonzero; missing installation non-destructive;
  noninteractive without `--yes` errors and changes nothing.
- Final: `python -m unittest scripts.test_installer` -> 15 tests, OK.
- Tests install into a temporary project root; the repository's own `.agents/` is never touched.

### Task 4 - Evidence-backed conformance validator

- Fixture-based RED tests -> RED (`ImportError`), then GREEN after `validate()`.
- Negative cases: case missing evidenceType/evidencePath/actualResult/limitations/reviewer;
  `PASS` case not `real-host-lifecycle`; results totals disagree; results aggregate disagrees.
- Positive cases: valid `real-host-lifecycle` PASS + matching results; valid `PARTIAL` + matching results.
- Final: `python -m unittest scripts.test_validate_conformance` -> 11 tests, OK.
- `python scripts/validate_conformance.py` -> exit 0 on corrected data.

## 3. Validator and Gate Results (final)

| Command | Exit |
|---|---|
| `python scripts/validate_skill.py` | 0 |
| `python scripts/validate_public_skills.py` | 0 |
| `python scripts/validate_distributions.py` | 0 |
| `python scripts/validate_host_capabilities.py` | 0 |
| `python scripts/validate_conformance.py` | 0 |
| `python scripts/build_distributions.py antigravity --check-only` | 0 |
| `python -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance scripts.test_validate_host_capabilities` | 0 (37 tests) |
| `npm test` | 0 |

- Retrieval eval `python scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output _retrieval-report.json` -> exit 0 (score report generated).
- `python scripts/plot_retrieval_eval.py` -> BLOCKED in this environment (matplotlib not installed; not a code defect).

## 4. Commits

| Commit | Scope | Summary |
|---|---|---|
| `3de8c94` | Task 2 | feat: validate host distribution evidence |
| `d845cea` | Task 3 | feat: harden installer ownership lifecycle + project_root isolation |
| `2113218` | Task 4 | feat: evidence-backed conformance validator + corrected cases |
| `ef21e50` | Task 5 | docs: reconcile host adapter lifecycle evidence (22 reports, audit) |
| (this commit) | Task 6 | docs: wave-2 honest report, codex evidence log, README/marketplace + EOF cleanup |

## 5. Honest Verdict

- Structural identity, adapters, build, installer lifecycle, and validators: CONFIRMED.
- Live host skill discovery, invocation, tool mapping, and behavioral execution: NOT_SUPPORTED
  (no host account/plan authenticated; no live host application exercised).
- Behavioral certification and marketplace publication remain owner-performed, owner-approved gates.
