# Hypertaks v4.2.0 — remediation handoff

This handoff is the reviewer entry point for the six-agent audit remediation on
`main`. Historical implementation detail remains available in Git history;
this file reports only the current state.

## Outcome being integrated

- JSONL transcript parsing uses `splitlines()`.
- Empty `pass` test bodies were removed and replaced by a small parser and
  provenance regression set.
- Transcript validation remains limited to behavioral PASS rows; skipped rows
  are not forced through PASS provenance rules.
- `confirmed_by_boss` was not changed.
- Generated Repomix output and local bundles/caches are treated as scratch, not
  release assets.
- `.gitignore` covers common caches, clones, bundles, Repomix output, local
  environments, IDE state, and local agent state.
- README, changelog, release notes, checkpoint, and blueprint now use the same
  evidence boundary.
- `Figure_1.png` through `Figure_4.png` are generated from repository facts by
  `scripts/generate_figures.py`; subjective scores and token/time estimates were
  removed.

## Evidence status

`evals/results.yaml` records 26 PASS and 12 SKIPPED(harness), with
`confirmed_by_boss: false` for every case. The canonical `--report` rejects the
legacy bundle because rows target historical commits, some transcripts are
placeholders or malformed JSONL, and several graders are self-grading. The
current-release provenance-valid PASS count is therefore 0. Static GREEN means
the capability text exists; it is not a behavioral PASS.

The behavioral suite was not rerun during this remediation. A future evidence
run must target the exact current commit with verbatim JSONL, independent
grading, and a clean report before any behavioral release claim is upgraded.

## Repository facts

- Release branch: `main`
- Base branch: `main`
- Release commit subject: `release: finalize Hypertaks v4.2.0`
- Version: `4.2.0` in package and plugin manifests
- Runtime loop: six phases, Phase 0–5
- Domain packs: 12 (`D1`–`D12`)
- Specialist roles: 20
- Eval definitions: 38 across seven groups
- CORE profile: 40 lines

Resolve the final commit and branch heads from Git rather than copying a hash
into this file; embedding a commit's own hash in that commit would be circular.

## Verification contract

The remediation commit is allowed only after these commands return exit zero:

```text
python scripts/validate_skill.py
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python -m compileall scripts
git diff --check
```

The focused parser/provenance unit test is an additional check. Local `main` was
synchronized with `origin/main` before remediation. No merge, force-push, or tag
is part of this handoff.

Fresh remediation results on 2026-07-15: validator exit 0 (`4.2.0`), case check
38 OK, static 38/38 GREEN (not behavioral PASS), compileall exit 0, diff check
exit 0, and 7/7 focused unit tests OK. The diagnostic report exits 1 with
legacy evidence errors; this is recorded rather than hidden.

## Review boundary

This handoff supports code integration and an honest repository snapshot. It
does not certify the 24-EV behavioral gate, human confirmation, secret-history
cleanliness, or full runtime behavior. The ending commit is the single
remediation commit reported by Git after commit; it is intentionally not copied
into its own contents because that would create circular provenance.
