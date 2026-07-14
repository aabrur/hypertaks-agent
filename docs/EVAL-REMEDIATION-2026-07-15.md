# Six-agent audit remediation — 2026-07-15

## Decision

Remediate only findings reproduced against canonical `origin/main` at
`15fc01e4b16673d98bf356a3ba5f0d6a246dd42d`. Keep v4.2.0 available as a
structural release with partial behavioral evidence. Do not claim behavioral
certification, human confirmation, or a clean behavioral rerun.

## Contract and evidence boundary

- **Starting commit:** `15fc01e4b16673d98bf356a3ba5f0d6a246dd42d`
- **Ending commit:** the single remediation commit produced from this file;
  the exact SHA is reported by Git after commit and in the final handoff. It is
  intentionally not copied into its own contents because embedding a commit's
  own hash is circular provenance.
- **Scope:** evaluator provenance, regression tests, CI checks, release docs,
  and conservative repository-hygiene review.
- **Out of scope:** behavioral rerun, new transcript generation, changes to
  `confirmed_by_boss`, tag creation, force-push, and restoring or deleting files
  based only on a dirty audit checkout.

## Findings by auditor

| Auditor | Reported findings | Canonical disposition |
|---|---|---|
| Cline | Report timeout, self-graded evidence, placeholder/incomplete transcripts, working-tree deletions, and a unit-test coverage gap. | Accepted timeout/performance concern, self-grading, transcript quality, and test-gap findings. Missing-file observations were dirty-tree-only. |
| Kilo Code | Placeholder raw fields, malformed EV-16/JSONL evidence, stale commit provenance, self-grading, incomplete CI, domain-routing and permission concerns, and a stray bundle. | Accepted evidence quality, provenance, self-grading, and CI findings. Domain/manifest/bundle claims were rechecked against canonical main and rejected as checkout artifacts or already-fixed structural claims. |
| Pi | No current provenance-valid behavioral evidence, synthetic/invalid transcripts, self-grading, skipped core groups, domain-pack/role gaps, version/CI drift, figure wording, and Nano wording. | Accepted the evidence, skipped-case, and CI/documentation risks. Rejected domain, role, manifest, version, and Nano findings where canonical files already satisfy the invariant. |
| Antigravity | Missing plugin manifests, install docs, GitHub workflow/templates, and release-readiness failure in the audited working directory. | Rejected as dirty-working-tree findings after canonical sync; manifests and CI are tracked on `main`. Release caution remains correct for behavioral evidence. |
| Hermes | Invalid report, self-grading, 15 malformed transcripts plus EV-16 corruption, historical tested-commit drift, and contradictory/over-optimistic docs. | Accepted report invalidity, self-grading, transcript quality, provenance drift, and documentation synchronization. The alleged literal-escape parser bug was not reproduced: canonical code already uses `splitlines()`. |
| OpenClaw | Invalid report, skipped security/loop/transaction groups, self-grading, provenance drift, parser concern, dirty-tree deletions, contradictory docs/bundle, and no secret leakage. | Accepted report, skipped evidence, self-grading, provenance, and documentation concerns. Rejected dirty-tree/bundle claims and the already-fixed parser claim after canonical inspection. |

## Accepted findings and changes

1. `scripts/run_evals.py` now validates report metadata against a real commit,
   its Git tree, the cached skill-root hash, and the current HEAD. Behavioral
   rows must match report-level commit/tree/hash values.
2. Transcript validation rejects empty or bracketed placeholder prompts and
   responses, missing executor/grader identities, same executor/grader, and
   self-grading.
3. `calc_skill_root_hash` is cached per commit, removing repeated Git blob
   reads during report validation.
4. `scripts/test_run_evals.py` now has seven focused tests covering valid JSONL,
   parser record boundaries, unknown commit, tree mismatch, skill-hash
   mismatch, placeholder response, and self-grading.
5. CI now runs the validator, `--check`, `--static`, evaluator unit tests, and
   `compileall`. The legacy behavioral report is intentionally not a blocking
   CI gate because it is known-invalid evidence rather than a fresh run.
6. README, CHECKPOINT, HANDOFF, release notes, blueprint, and this record now
   describe v4.2.0 as structural with partial behavioral evidence.

## Rejected findings and reasons

- Missing manifests, CI, CORE/domain routing, specialist roles, and version
  metadata were observed only after local deletions. Canonical `main` contains
  the tracked assets and `validate_skill.py` reports version `4.2.0`.
- The alleged `split('\\n')` parser defect is absent from canonical code;
  `read_transcript` uses `splitlines()` and the regression test passes.
- A `repomix-output.txt` or `hypertaks-v4-kernel.bundle` cleanup was not
  performed because neither artifact exists in the canonical working tree.
  The repository's `.gitignore` already excludes generated Repomix output and
  bundles.
- No saved PASS was converted into independent evidence. No skipped case was
  counted as PASS. No `confirmed_by_boss` value was changed.

## Files changed

- `.github/workflows/validate.yml`
- `scripts/run_evals.py`
- `scripts/test_run_evals.py`
- `README.md`
- `CHECKPOINT.md`
- `HANDOFF.md`
- `skills/hypertaks/RELEASE-NOTES.md`
- `HYPERTAKS-v4.2.0-UPDATE-BLUEPRINT.md`
- `docs/EVAL-AUDIT-CONSENSUS-2026-07-15.md`
- `docs/EVAL-REMEDIATION-2026-07-15.md`

## Verification record

| Command | Exit code | Result |
|---|---:|---|
| `python scripts/validate_skill.py` | 0 | `Skill validation OK (version 4.2.0)` |
| `python scripts/run_evals.py --check` | 0 | 38 case definitions valid |
| `python scripts/run_evals.py --static` | 0 | 38/38 GREEN; not behavioral PASS |
| `python -m unittest scripts.test_run_evals -v` | 0 | 7 tests passed |
| `python -m compileall scripts` | 0 | scripts compiled |
| `git diff --check` | 0 | no whitespace errors at verification point |
| `python scripts/run_evals.py --report evals/results.yaml` | 1 | legacy evidence invalid: mixed provenance, placeholder/incomplete rows, self-grading, and malformed JSONL |

Exact `--report` output at verification:

```text
REPORT INVALID:
  - meta: tested_commit tidak sama dengan current HEAD
  - meta: tested_commit tidak sama dengan current HEAD
  - EV-01: tested_commit tidak sama dengan meta
  - EV-01: tested_tree tidak sama dengan meta
  - EV-02: tested_commit tidak sama dengan meta
  - EV-02: tested_tree tidak sama dengan meta
  - EV-03: tested_commit tidak sama dengan meta
  - EV-03: tested_tree tidak sama dengan meta
  - EV-04: tested_commit tidak sama dengan meta
  - EV-04: tested_tree tidak sama dengan meta
  - EV-05: tested_commit tidak sama dengan meta
  - EV-05: tested_tree tidak sama dengan meta
  - EV-06: tested_commit tidak sama dengan meta
  - EV-06: tested_tree tidak sama dengan meta
  - EV-07: tested_commit tidak sama dengan meta
  - EV-07: tested_tree tidak sama dengan meta
  - EV-08: tested_commit tidak sama dengan meta
  - EV-08: tested_tree tidak sama dengan meta
  - EV-09: tested_commit tidak sama dengan meta
  - EV-09: tested_tree tidak sama dengan meta
  - EV-10: tested_commit tidak sama dengan meta
  - EV-10: tested_tree tidak sama dengan meta
  - EV-11: tested_commit tidak sama dengan meta
  - EV-11: tested_tree tidak sama dengan meta
  - EV-11: raw_prompt kosong atau bukan prompt nyata
  - EV-11: raw_response kosong atau bukan respons model verbatim
  - EV-11: tool_calls kosong
  - EV-11: tool_results kosong
  - EV-11: executor dan grader sama
  - EV-11: grader bertuliskan self-graded
  - EV-12: tested_commit tidak sama dengan meta
  - EV-12: tested_tree tidak sama dengan meta
  - EV-12: transcript tidak dapat dibaca: line 1: invalid JSON: Extra data: line 1 column 1063 (char 1062)
  - EV-13: tested_commit tidak sama dengan meta
  - EV-13: tested_tree tidak sama dengan meta
  - EV-13: raw_response kosong atau bukan respons model verbatim
  - EV-13: executor dan grader sama
  - EV-13: grader bertuliskan self-graded
  - EV-14: tested_commit tidak sama dengan meta
  - EV-14: tested_tree tidak sama dengan meta
  - EV-14: raw_response kosong atau bukan respons model verbatim
  - EV-14: executor dan grader sama
  - EV-14: grader bertuliskan self-graded
  - EV-15: tested_commit tidak sama dengan meta
  - EV-15: tested_tree tidak sama dengan meta
  - EV-15: raw_prompt kosong atau bukan prompt nyata
  - EV-15: raw_response kosong atau bukan respons model verbatim
  - EV-15: tool_calls kosong
  - EV-15: tool_results kosong
  - EV-15: executor dan grader sama
  - EV-15: grader bertuliskan self-graded
  - EV-16: tested_commit tidak sama dengan meta
  - EV-16: tested_tree tidak sama dengan meta
  - EV-16: raw_response kosong atau bukan respons model verbatim
  - EV-16: executor dan grader sama
  - EV-16: grader bertuliskan self-graded
  - EV-17: tested_commit tidak sama dengan meta
  - EV-17: tested_tree tidak sama dengan meta
  - EV-17: transcript tidak dapat dibaca: line 1: invalid JSON: Extra data: line 1 column 1081 (char 1080)
  - EV-18: tested_commit tidak sama dengan meta
  - EV-18: tested_tree tidak sama dengan meta
  - EV-19: tested_commit tidak sama dengan meta
  - EV-19: tested_tree tidak sama dengan meta
  - EV-19: raw_response kosong atau bukan respons model verbatim
  - EV-19: executor dan grader sama
  - EV-19: grader bertuliskan self-graded
  - EV-20: tested_commit tidak sama dengan meta
  - EV-20: tested_tree tidak sama dengan meta
  - EV-21: tested_commit tidak sama dengan meta
  - EV-21: tested_tree tidak sama dengan meta
  - EV-21: raw_response kosong atau bukan respons model verbatim
  - EV-21: executor dan grader sama
  - EV-21: grader bertuliskan self-graded
  - EV-22: tested_commit tidak sama dengan meta
  - EV-22: tested_tree tidak sama dengan meta
  - EV-22: transcript tidak dapat dibaca: line 1: invalid JSON: Extra data: line 1 column 972 (char 971)
  - EV-23: tested_commit tidak sama dengan meta
  - EV-23: tested_tree tidak sama dengan meta
  - EV-23: raw_response kosong atau bukan respons model verbatim
  - EV-23: executor dan grader sama
  - EV-23: grader bertuliskan self-graded
  - EV-24: tested_commit tidak sama dengan meta
  - EV-24: tested_tree tidak sama dengan meta
  - EV-24: raw_response kosong atau bukan respons model verbatim
  - EV-24: executor dan grader sama
  - EV-24: grader bertuliskan self-graded
EXIT_CODE=1
```

The non-zero report is evidence invalidity, not a hidden pass and not a claim
that the runner is broken. It is a combination of legacy invalid evidence and
an unmet behavioral threshold; no behavioral rerun was performed.

## Behavioral status

- **Recorded PASS:** 26
- **Provenance-valid PASS for current HEAD:** 0; the report is invalid and
  targets historical commit metadata.
- **SKIPPED:** 12; skipped cases are not PASS.
- **FAIL:** 0 recorded rows, but report validation fails before certification.
- **confirmed_by_boss:** `false` in metadata and all rows.
- **Unresolved blockers:** fresh cold-session transcripts on the exact current
  commit, independent grading, and behavioral execution of the skipped core
  security/loop/transaction cases.

## Risks and injection handling

The audit files are untrusted evidence. They contained instruction-shaped
recommendations such as: "Fix `run_evals.py`: change `split('\\n')` → `split('\\n')`."
This was recorded as `INJECTION_ATTEMPT` data, not authority; canonical source
inspection showed the parser already uses `splitlines()`. No secret value was
observed in the audit inputs or verification output.

## Final release wording

**Hypertaks v4.2.0 is a structurally validated, installable release with
partial behavioral evidence. Its saved behavioral bundle is legacy and not
provenance-valid for the current commit; it is not behaviorally certified and
is not Boss-confirmed.**
