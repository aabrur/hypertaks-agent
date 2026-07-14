# Hypertaks v4.2.0 — release handoff

This handoff is the reviewer entry point for the three-phase finalization on
`v4-kernel`. Historical implementation detail remains available in Git history;
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
`confirmed_by_boss: false` for every case. Only EV-25 through EV-38 currently
carry the complete independent record fields required by the tightened
provenance validator: 14 PASS cases. The required 24-EV threshold is therefore
not met. Static GREEN means the capability text exists; it is not a behavioral
PASS.

The behavioral suite was not rerun during this finalization. A future evidence
remediation would need at least 10 additional provenance-valid behavioral PASS
cases to meet the threshold, but that work is explicitly outside this scope.

## Repository facts

- Release branch: `v4-kernel`
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

The release commit is allowed only after these commands return exit zero:

```text
python scripts/validate_skill.py
python scripts/run_evals.py --check
python scripts/run_evals.py --static
python -m compileall scripts
git diff --check
```

The focused parser/provenance unit test is an additional check. Before
integration, local `main` must be synchronized with `origin/main`, then
`v4-kernel` is merged normally. The fetched histories diverge, so an ordinary
merge commit on `main` is expected. No force-push or tag is part of the handoff.

Fresh pre-commit results on 2026-07-14: validator exit 0 (`4.2.0`), case check
38 OK, static 38/38 GREEN (not behavioral PASS), compileall exit 0, diff check
exit 0, and 3/3 focused unit tests OK.

## Review boundary

This handoff supports code integration and an honest repository snapshot. It
does not certify the 24-EV behavioral gate, human confirmation, secret-history
cleanliness, or full runtime behavior.
