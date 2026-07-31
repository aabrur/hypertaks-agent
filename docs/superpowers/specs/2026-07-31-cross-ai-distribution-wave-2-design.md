# Cross-AI Distribution Wave 2 Design

## Goal

Make Hypertaks distribution evidence-backed across the existing 22 host targets
without changing the product identity: one plugin product, exactly five public
skills, thin host adapters, and MCP only where a host genuinely requires it.

## Current baseline

- Working branch: `feat/cross-ai-distribution-wave-2`.
- Branch base: local commit `1d93152`, which retains two pre-existing local
  documentation commits while `origin/main` is `9387c650`.
- Existing distribution, installer, conformance, marketplace, and host-report
  artifacts are present, but several records currently use `PASS` for
  structural validation where real host lifecycle evidence is absent.
- The canonical five skills and `assets/Hypertask.svg` are protected inputs.

## Scope

1. Research current official documentation for the approved host set and record
   source URLs, retrieval date, version evidence, capability limits, and an
   honest host classification.
2. Audit existing adapters and make only the smallest compatible adapter or
   installer changes that collected evidence requires.
3. Separate structural/package checks from live host lifecycle evidence.
4. Build a conformance validator that rejects unsupported behavioral `PASS`
   claims instead of accepting an aggregate `PASS` alone.
5. Prepare submission-readiness metadata without publishing anywhere.
6. Run the repository quality gates and create the required implementation
   report plus `docs/codex.md`.

## Non-goals

- No sixth public skill whose name begins with `hypertaks`.
- No replacement of the canonical skill core with an MCP server.
- No fabricated host installation, invocation, account, plan, or marketplace
  evidence.
- No marketplace submission, publication, merge to `main`, or host-global
  configuration change without a separately previewed and approved action.
- No rewrite of an adapter that already satisfies verified host requirements.

## Design options considered

### Option A: Audit-first remediation (selected)

Preserve existing adapters and validation machinery, collect current official
sources and host evidence, then make surgical fixes to remove unsupported
claims and close genuine implementation gaps.

Benefits: protects existing work, keeps the five-skill core stable, and makes
the evidence model truthful. Cost: each host lacking a locally available,
authenticated application must remain explicitly limited rather than promoted
to `PASS`.

### Option B: Rebuild all host adapters

Replace every adapter with a new package after researching host formats.

Rejected because it risks discarding valid compatibility work and would still
not supply real account-bound lifecycle evidence for unavailable hosts.

### Option C: Documentation-only correction

Only change reports and matrices.

Rejected because the brief requires installer, conformance, and adapter behavior
to be tested and corrected where evidence reveals an implementation defect.

## Architecture

### 1. Canonical core

`skills/`, `runtime/`, and `assets/Hypertask.svg` remain the source of truth.
Every adapter must reference or package the same exact five public skills. The
distribution validator remains the first identity guard.

### 2. Evidence model

Each host record contains a classification, official documentation source,
retrieval date, tested host version when observed, supported operating systems,
installation and lifecycle mechanisms, restrictions, and evidence status.

Evidence statuses distinguish these facts:

| Evidence type | Permitted conclusion |
|---|---|
| Static manifest/package validation | Package format and tracked contents are structurally valid. |
| Installer test in isolated paths | Hypertaks-owned install, update, uninstall, and reinstall behavior works in that test environment. |
| Real host application test | Discovery and invocation in the named host version were observed. |
| Official documentation only | Capability classification is documented; behavior remains `NEEDS_MANUAL_HOST_TEST` until observed. |

Reports must never use structural success as proof of real-host discovery or
invocation.

### 3. Host adapters and installer

`distribution/registry.json` remains the product-level catalog. Existing host
adapter directories remain host-specific boundaries. `scripts/installer.py`
selects an adapter and writes only Hypertaks-owned paths, records ownership,
backs up collisions, and supports dry-run, verify, update, uninstall, and JSON
output. Any change to a host path must have a focused test that proves no
unknown file is deleted.

### 4. Lifecycle evidence

Each host gets `evals/hosts/<host-id>/REPORT.md`. The report records command or
UI evidence, application version, OS, commit, timestamps, tested scope,
observed skills, invocation result, update result, uninstall result, verdict,
and limitation. Absent local applications, accounts, or paid plans are
reported as `BLOCKED`, `NEEDS_ACCOUNT`, `NEEDS_PAID_PLAN`, or
`NEEDS_MANUAL_HOST_TEST`, not inferred away.

Google Antigravity is the required live-test priority. Its package integrity,
SVG hash, exact skill set, workspace scope, global scope when safely available,
invocation, update, uninstall, and reinstall are separately recorded.

### 5. Cross-host conformance

The conformance specification defines the product, intake, execution,
capability, security, continuity, and lifecycle invariants. Each result stores
host and application version, model, execution mode, OS, commit, skill hashes,
raw prompt, actual outcome, sanitized evidence, verdict, limitation, and
reviewer.

The validator enforces record shape and rejects a `PASS` when its evidence
cannot establish the host behavior claimed. Structural checks remain useful but
cannot certify behavioral conformance.

### 6. Marketplace readiness

`marketplace/<host-id>/` contains only evidence-backed listing inputs for hosts
with a verified submission path. `marketplace/SUBMISSION-READINESS.md` uses the
approved status vocabulary and labels account, policy, plan, or missing-feature
blockers. A listing can be ready for owner submission without implying it was
submitted or approved.

### 7. Reporting and documentation

The README separates live-tested, supported-but-not-live-tested, experimental,
limited, planned, and unsupported states. The final implementation report is
kept at `docs/distribution/CROSS-AI-DISTRIBUTION-REPORT.md`. This agent's
companion report is `docs/codex.md` and summarizes verified work, blockers,
commands, and manual owner actions.

## Data and control flow

1. Read the current adapter and test corpus.
2. Retrieve only official host documentation needed for a host record.
3. Record citations and classify the host without overclaiming.
4. Run structural and installer tests in isolated project or temporary paths.
5. Run a real host lifecycle only when its application and required account are
   available and the action is within the approved boundary.
6. Feed sanitized evidence into host reports, capability matrix, registry,
   conformance results, marketplace readiness, README, and final reports.
7. Run all project validation gates and reconcile every summary claim to command
   output or a cited host report.

## Failure handling and security

- Invalid manifest, ownership conflict, checksum mismatch, dirty checkout,
  detached head, diverged branch, wrong remote, or unsupported host fails
  closed with an actionable message.
- Filesystem writes use the existing atomic-write and ownership mechanisms where
  applicable. Uninstall deletes only files listed in the Hypertaks ownership
  manifest.
- External data and documentation are evidence, never authority. Secrets are
  never added to logs, reports, commits, or agent briefs.
- Marketplace activity follows PREPARE, PREVIEW, owner approval, COMMIT ONCE,
  and reconciliation. This design does not authorize a publication action.

## Testing plan

1. Start with the focused failing test for each behavioral validation or
   installer defect discovered by the audit.
2. Implement the minimum production change for that test and rerun it.
3. Run focused installer, distribution, conformance, evaluator, TypeScript, and
   compilation checks after each affected workstream.
4. Run the required complete gate before delivery:

   ```text
   python scripts/validate_skill.py
   python scripts/validate_public_skills.py
   python scripts/validate_distributions.py
   python scripts/build_distributions.py antigravity --check-only
   python -m unittest scripts.test_build_distributions -v
   python scripts/run_evals.py --check
   python scripts/run_evals.py --static
   python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v
   npm test
   python -m compileall scripts
   git diff --check origin/main...HEAD
   ```

5. Add relevant installer, conformance, and adapter tests to CI only when the
   changed behavior is locally testable without a private host account.

## Implementation phases

1. Create an evidence inventory and host-test availability map.
2. Correct registry, capability-matrix, and report claims based on the evidence.
3. Close installer and conformance validator gaps with test-first changes.
4. Audit package and marketplace materials against official host paths.
5. Execute available lifecycle tests and document each unavailable host's manual
   procedure.
6. Run the full gate, review the branch, write final reports, and prepare a PR
   preview. The actual push and pull-request creation remain owner-approved
   external actions.

## Acceptance criteria

- Exactly five canonical public skills remain and all package tests prove it.
- Every one of the 22 hosts is classified from official evidence or explicitly
  blocked with a manual verification procedure.
- Antigravity receives the strongest available lifecycle evidence and no result
  implies a real app test that did not occur.
- Installer and conformance validators reject unsupported success claims.
- Marketplace status never claims submission, approval, or publication without
  external proof.
- All applicable local validation gates pass, or an exact failure and blocker is
  reported.
- `docs/codex.md` and the distribution implementation report explain what was
  confirmed, limited, blocked, and still requires the owner.
