# Cross-AI Distribution Wave 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development`
> or `executing-plans` to implement this plan task-by-task. Steps use checkbox
> syntax for tracking.

**Goal:** Make the existing 22-host Hypertaks distribution truthful, safe to
install and remove, and backed by explicit structural or real-host evidence.

**Architecture:** Preserve `skills/` and `runtime/` as the canonical core. Host
records and reports carry evidence status separately from adapter format.
`scripts/installer.py` owns only files named in its ownership manifest, while
the conformance validator rejects behavioral success without sufficient evidence.

**Tech Stack:** Python 3.12 standard library, TypeScript runtime checks, JSON,
Markdown, GitHub Actions, native host applications only when already available.

## Global Constraints

- Keep exactly five public skills and do not change `assets/Hypertask.svg`.
- All tracked prose is English and contains no U+2014 em dash.
- Use official first-party documentation only for host capability claims.
- A package, manifest, or installer test is structural evidence, not host-live
  invocation evidence.
- Do not install software, create host accounts, modify persistent user-host
  configuration, publish to a marketplace, push, or create a pull request
  without the separately required preview and owner approval.
- New production behavior follows one-test-at-a-time RED, GREEN, REFACTOR.
- Preserve unrelated changes already present on the feature branch.

---

### Task 1: Establish an isolated, reproducible baseline and evidence inventory

**Files:**
- Modify: none before the baseline is recorded.
- Inspect: `distribution/registry.json`, `distribution/host-capabilities.json`,
  `distribution/HOST-CAPABILITY-MATRIX.md`, `evals/hosts/*/REPORT.md`,
  `evals/cross-host/*`, `marketplace/`, `scripts/installer.py`.
- Create: `docs/codex.md` only after all final evidence is available.

**Interfaces:**
- Consumes: the approved design and the current feature-branch commit.
- Produces: a host-by-host evidence ledger used by every later task.

- [ ] **Step 1: Use the worktree procedure before code execution.**

  Run the worktree detection commands from `using-git-worktrees`. If the current
  checkout is not already a linked worktree, request owner consent before
  creating `.worktrees/feat-cross-ai-distribution-wave-2`, verify the directory
  is ignored, and continue in that worktree. Do not create a nested worktree.

- [ ] **Step 2: Capture the source and baseline state.**

  Run:

  ```powershell
  git status --short --branch
  git rev-parse HEAD
  git rev-parse origin/main
  python scripts/validate_skill.py
  python scripts/validate_public_skills.py
  python scripts/validate_distributions.py
  python scripts/build_distributions.py antigravity --check-only
  python -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance -v
  npm test
  ```

  Record each command, exit code, commit, OS, Python version, Node version, and
  any baseline failure. A failure is a blocker to be diagnosed before changing
  the matching subsystem.

- [ ] **Step 3: Build the evidence ledger.**

  For each registry host, map the current adapter path, report path, official
  source URL, currently observed application version, evidence type, and
  allowed verdict. The allowed evidence types are `official-documentation`,
  `static-package`, `installer-lifecycle`, and `real-host-lifecycle`.

  A host with no observed application session cannot have a `PASS` real-host
  verdict. It remains `NEEDS_MANUAL_HOST_TEST`, `NEEDS_ACCOUNT`,
  `NEEDS_PAID_PLAN`, `BLOCKED`, or `PARTIAL` when structural evidence exists.

- [ ] **Step 4: Commit the baseline-only artifact if any tracked evidence file
  changes.**

  Use a focused message such as `docs: record distribution evidence baseline`.
  Do not commit generated `dist/`, host account data, caches, logs, or temporary
  installations.

### Task 2: Make host-capability records evidence-aware and validate them

**Files:**
- Create: `scripts/validate_host_capabilities.py`.
- Create: `scripts/test_validate_host_capabilities.py`.
- Modify: `distribution/host-capabilities.json`.
- Modify: `distribution/HOST-CAPABILITY-MATRIX.md`.
- Modify: `.github/workflows/validate-distributions.yml`.

**Interfaces:**
- Consumes: the Task 1 host evidence ledger and `distribution/registry.json`.
- Produces: a validated one-to-one capability record for each registered host.

- [ ] **Step 1: Write the first failing validator test.**

  Add a temporary JSON fixture with a single host marked `PASS` but with
  `evidenceType: "static-package"`. Assert `validate_host_capabilities` returns
  a nonzero exit code and reports that only `real-host-lifecycle` supports a
  host `PASS`.

  The test fixture shape is:

  ```json
  {
    "schemaVersion": 2,
    "hosts": [{
      "id": "antigravity",
      "classification": "PLUGIN_AND_SKILL",
      "evidenceStatus": "PASS",
      "evidenceType": "static-package",
      "evidencePath": "evals/hosts/antigravity/REPORT.md"
    }]
  }
  ```

  Run:

  ```powershell
  python -m unittest scripts.test_validate_host_capabilities.ValidateHostCapabilitiesTests.test_pass_requires_real_host_lifecycle -v
  ```

  Expected result before implementation: `FAIL` because the validator does not
  yet exist.

- [ ] **Step 2: Implement the minimum validator.**

  `scripts/validate_host_capabilities.py` accepts a capability path and registry
  path so tests can use fixtures. It requires exactly the registry host IDs,
  required source and capability fields, an allowed classification, an allowed
  evidence verdict, and a repository-relative `evidencePath`.

  Use these constants:

  ```python
  ALLOWED_EVIDENCE_STATUSES = {
      "PASS", "PARTIAL", "FAIL", "BLOCKED", "NOT_SUPPORTED",
      "NEEDS_ACCOUNT", "NEEDS_PAID_PLAN", "NEEDS_MANUAL_HOST_TEST",
  }
  PASS_EVIDENCE_TYPE = "real-host-lifecycle"
  ```

  Reject a `PASS` unless `evidenceType == PASS_EVIDENCE_TYPE`, and reject an
  absolute or escaping `evidencePath` using `Path.resolve().is_relative_to`.

- [ ] **Step 3: Complete focused negative tests.**

  Add tests for duplicate host IDs, missing registry host, unknown host,
  unsupported classification, missing official URL, an escaping evidence path,
  and a valid `PARTIAL` static-package record. Run the test module and confirm
  every case passes.

- [ ] **Step 4: Update the 22 records and rendered matrix.**

  Upgrade `host-capabilities.json` to schema version 2. Add `evidenceType`,
  `evidencePath`, and `evidenceNote` to each record. Reconcile every host from
  official-source evidence and Task 1 observations. Update the matrix to show
  both classification and evidence verdict, never a bare `PASS` without its
  evidence type.

- [ ] **Step 5: Run validation and commit.**

  Run:

  ```powershell
  python scripts/validate_host_capabilities.py
  python -m unittest scripts.test_validate_host_capabilities -v
  python scripts/validate_distributions.py
  ```

  Commit with `feat: validate host distribution evidence`.

### Task 3: Harden the universal installer with ownership and transaction safety

**Files:**
- Modify: `scripts/installer.py`.
- Modify: `scripts/test_installer.py`.

**Interfaces:**
- Consumes: host adapter metadata from `distribution/registry.json`.
- Produces: an ownership manifest that can be verified, updated, and uninstalled
  without deleting unknown files.

- [ ] **Step 1: Write the first ownership-safety test.**

  In a temporary install target, create a valid Hypertaks manifest and an
  unrelated file under `skills/`. Call `cmd_uninstall` with `dry_run=False`.
  Assert the listed Hypertaks files and manifest are removed while the unrelated
  file remains.

  Run:

  ```powershell
  python -m unittest scripts.test_installer.InstallerTests.test_uninstall_preserves_unknown_files -v
  ```

  Expected result before implementation: `FAIL` because the current code removes
  the entire `skills` directory.

- [ ] **Step 2: Implement manifest validation and safe pruning.**

  Add `validate_owned_relative_path(target_dir, relative_path)` and reject a
  manifest path unless it resolves beneath `target_dir`. Replace unconditional
  `shutil.rmtree(target_dir / "skills")` with deletion of only validated manifest
  files followed by bottom-up removal of empty directories.

  The pruning rule is:

  ```python
  for directory in sorted(owned_directories, key=lambda item: len(item.parts), reverse=True):
      if directory.is_dir() and not any(directory.iterdir()):
          directory.rmdir()
  ```

- [ ] **Step 3: Write and pass transaction tests one behavior at a time.**

  Add isolated temporary-target tests for:

  - an unmanaged collision is rejected without deletion;
  - dry-run leaves no directory or manifest behind;
  - update recalculates the ownership hashes and `cmd_verify` passes afterward;
  - a malformed or traversal manifest is rejected without deletion;
  - reinstall is idempotent;
  - corrupt content is detected;
  - an unknown host returns nonzero;
  - a missing installation returns the documented non-destructive result.

  Patch `resolve_install_target` in the tests or provide a `project_root`
  parameter so test calls never touch the repository's actual `.agents/` or a
  user home directory.

- [ ] **Step 4: Enforce preview and confirmation semantics.**

  `--dry-run` remains a preview. Destructive install replacement, update, and
  uninstall must either receive `--yes` or obtain an interactive confirmation
  from a TTY. A noninteractive call without `--yes` returns an actionable error
  and changes nothing. Keep `--json` output valid for every branch.

- [ ] **Step 5: Run installer gates and commit.**

  Run:

  ```powershell
  python -m unittest scripts.test_installer -v
  python scripts/installer.py doctor --json
  python scripts/installer.py list-hosts --json
  ```

  Commit with `feat: harden installer ownership lifecycle`.

### Task 4: Make cross-host conformance results evidence-backed

**Files:**
- Modify: `scripts/validate_conformance.py`.
- Modify: `scripts/test_validate_conformance.py`.
- Modify: `evals/cross-host/cases.jsonl`.
- Modify: `evals/cross-host/results.json`.
- Modify: `evals/cross-host/SUMMARY.md`.
- Modify: `evals/cross-host/CONFORMANCE-SPEC.md`.

**Interfaces:**
- Consumes: validated host evidence paths and the conformance case records.
- Produces: aggregate conformance result derived from individual evidence-backed
  cases rather than a hand-authored aggregate verdict.

- [ ] **Step 1: Add the RED tests for evidence requirements.**

  Refactor `main` to accept optional spec, cases, and results paths. Create
  temporary cases and results fixtures. Add tests that reject a case missing
  `evidenceType`, `evidencePath`, `actualResult`, `limitations`, or `reviewer`,
  and reject a `PASS` case whose evidence type is not `real-host-lifecycle`.

- [ ] **Step 2: Implement record validation and aggregate reconciliation.**

  Add these required case keys:

  ```python
  REQUIRED_CASE_KEYS = {
      "caseId", "host", "hostVersion", "model", "executionMode", "os",
      "repositoryCommit", "rawPrompt", "expectedInvariant", "actualResult",
      "evidenceType", "evidencePath", "verdict", "limitations", "reviewer",
  }
  ```

  Validate repository-relative evidence paths. Derive `totalCases`, verdict
  counts, and aggregate verdict from the cases. The aggregate may be `PARTIAL`
  when structural cases pass but no real host lifecycle proves the claimed
  behavior. Reject a results file whose totals or aggregate verdict disagrees
  with the cases.

- [ ] **Step 3: Correct the existing conformance data.**

  Convert existing structural or installer cases to `PARTIAL` where real-host
  invocation was not observed. Add an evidence path and honest limitation to
  every case. The summary explains that conformance specification coverage and
  behavioral certification are separate facts.

- [ ] **Step 4: Run conformance gates and commit.**

  Run:

  ```powershell
  python -m unittest scripts.test_validate_conformance -v
  python scripts/validate_conformance.py
  ```

  Commit with `feat: require conformance evidence for host verdicts`.

### Task 5: Audit adapters, official sources, and Antigravity lifecycle evidence

**Files:**
- Modify: `distribution/registry.json` only when collected evidence changes an
  adapter status or verified adapter path.
- Modify or create: `evals/hosts/<host-id>/REPORT.md` for all 22 targets.
- Modify: `distribution/EXISTING-ADAPTER-AUDIT.md`.
- Modify: `distribution/antigravity/INSTALL.md` when build or lifecycle steps
  differ from observed behavior.
- Modify: host adapter files only when an official source proves a defect.

**Interfaces:**
- Consumes: Task 1 inventory, Task 2 schema, and official documentation.
- Produces: one sanitized report per host and no unsupported adapter claim.

- [ ] **Step 1: Retrieve official documentation in host bundles.**

  Use first-party documentation for the 22 hosts. For each host capture the
  exact documentation URL, retrieval date, application or CLI version observed
  locally if available, install scopes, invocation, update, uninstall, tool
  mapping, subagents, memory, filesystem, command execution, account or plan,
  MCP requirement, restrictions, and classification.

- [ ] **Step 2: Audit the eight existing adapters.**

  For Claude Code, Codex, Cursor, Kimi Code, OpenCode, Pi, OpenClaw, and Hermes,
  inspect the adapter and its package lifecycle. Run a real application test
  only where the application is already installed and the account boundary is
  available. Otherwise record the exact manual procedure and honest verdict.

- [ ] **Step 3: Prioritize Antigravity.**

  From a clean temporary clone or isolated worktree, run distribution validation,
  build, integrity validation, SVG hash check, exact-five-skill check, workspace
  installer lifecycle, update, uninstall, and reinstall. Do not write a global
  host profile unless a safe isolated profile is available. If the real
  Antigravity application cannot be used, retain `PARTIAL` and record why.

- [ ] **Step 4: Validate each new adapter boundary.**

  For ChatGPT, GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Aider,
  Goose, OpenHands, Claude.ai, Gemini App, Open WebUI, and LibreChat, verify the
  smallest official integration path. An unverified host receives a limited
  adapter or documentation-only classification, never a fabricated native
  plugin. Do not add an MCP server except where documented as host transport.

- [ ] **Step 5: Run adapter tests and commit.**

  Run:

  ```powershell
  python scripts/validate_distributions.py
  python scripts/build_distributions.py antigravity --check-only
  python -m unittest scripts.test_build_distributions -v
  ```

  Commit with `docs: reconcile host adapter lifecycle evidence` unless a focused
  adapter code fix warrants its own `fix:` or `feat:` commit.

### Task 6: Reconcile public documentation, marketplace readiness, CI, and reports

**Files:**
- Modify: `README.md`.
- Modify: `marketplace/SUBMISSION-READINESS.md`.
- Modify or create: `marketplace/<host-id>/` only for an officially verified
  submission mechanism.
- Modify: `.github/workflows/validate-distributions.yml`.
- Modify: `docs/distribution/CROSS-AI-DISTRIBUTION-REPORT.md`.
- Create: `docs/codex.md`.

**Interfaces:**
- Consumes: all validation output and sanitized host reports.
- Produces: one public support matrix and two final evidence-backed reports.

- [ ] **Step 1: Update user-facing support claims.**

  Make the README distinguish live-tested, supported but not live-tested,
  experimental, limited adapter, planned, and unsupported hosts. Keep Gemini
  App separate from Google Antigravity and remove any active Gemini CLI claim.

- [ ] **Step 2: Reconcile marketplace readiness.**

  Retain only approved status values. Use `READY_FOR_HUMAN_SUBMISSION` only
  when the package, policy, and required metadata are verified. Use account,
  paid-plan, policy, or feature blockers when any prerequisite is absent. Do not
  use `SUBMITTED`, `APPROVED`, or `PUBLISHED` without external proof.

- [ ] **Step 3: Run the complete validation gate.**

  Run:

  ```powershell
  python scripts/validate_skill.py
  python scripts/validate_public_skills.py
  python scripts/validate_distributions.py
  python scripts/validate_host_capabilities.py
  python scripts/build_distributions.py antigravity --check-only
  python -m unittest scripts.test_build_distributions scripts.test_installer scripts.test_validate_conformance scripts.test_validate_host_capabilities -v
  python scripts/run_evals.py --check
  python scripts/run_evals.py --static
  python -m unittest scripts.test_run_evals scripts.test_retrieval_eval -v
  npm test
  python -m compileall scripts
  git diff --check origin/main...HEAD
  ```

  Add new validator and unit-test commands to the distribution workflow.

- [ ] **Step 4: Write the reports.**

  Update the distribution report with executive summary, tested commit, changed
  files, official source list, host and lifecycle matrices, marketplace matrix,
  conformance results, security findings, blockers, manual actions, and an
  exact next step. Label every conclusion `CONFIRMED`, `FAIRLY_CONFIDENT`,
  `NEEDS_VERIFICATION`, `BLOCKED`, or `NOT_SUPPORTED`.

  Write `docs/codex.md` in English with this agent's independent evidence log:
  scope, branch, commands and exit codes, changed files, host outcomes,
  unresolved blockers, and confirmation that no marketplace publication
  occurred.

- [ ] **Step 5: Commit documentation and prepare review.**

  Commit with `docs: finalize cross-ai distribution evidence report`. Generate a
  review package against the branch merge base and request a final whole-branch
  review. Fix any Critical or Important finding and repeat the review.

### Task 7: Preview the external handoff without performing it

**Files:**
- Modify: none unless a final review identifies a focused defect.

**Interfaces:**
- Consumes: clean final review and complete local validation output.
- Produces: a pull-request preview and owner action list.

- [ ] **Step 1: Reconcile the branch.**

  Run:

  ```powershell
  git status --short --branch
  git log --oneline origin/main..HEAD
  git diff --check origin/main...HEAD
  ```

- [ ] **Step 2: Prepare the push and pull-request preview.**

  Show the exact branch, commits, test output, proposed PR title, and proposed
  PR body to the owner. Do not push or create the PR until the owner gives a
  fresh approval for that external action.

- [ ] **Step 3: Deliver the final local result.**

  Report the branch name, tested commit, completed and blocked hosts, every test
  command with exit code, marketplace readiness, manual owner actions, and the
  fact that no unauthorized marketplace publication occurred.
