# Hypertaks 4.4.0 Automatic Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Hypertaks 4.4.0 discoverable through the repository's native marketplace surfaces and provide a safe fast-forward updater for managed skill checkouts, while documenting the exact host-controlled limits.

**Architecture:** Marketplace/plugin managers remain the primary delivery path. A dependency-free Python utility updates only a canonical, clean `main` checkout by fetching and fast-forwarding `origin/main`; scanned skill folders point to that checkout through a symlink or junction. Copied legacy folders require one migration because no new code can reach an inert copy.

**Tech Stack:** Python 3 standard library, `unittest`, Git CLI, JSON plugin manifests, Pillow-based repository figure generator.

## Global Constraints

- Keep every live manifest and `package.json` at strict semantic version `4.4.0`.
- Keep the skill self-contained and all repository prose in English.
- Do not install a daemon, force-reset, stash, delete, change remotes, switch branches, or overwrite a dirty checkout.
- Permit host-native background updates and explicitly opted-in managed-checkout automation; do not claim unsupported hosts update automatically.
- Treat an archive or copied skill directory as unreachable until a one-time marketplace install or managed-checkout migration.
- Keep `skills/hypertaks/references/plugins-and-mcp.md` as the canonical update-policy location.
- Generate figures only through `scripts/generate_figures.py`.
- Land this release work item as one commit after the full verification gate.

---

### Task 1: Marketplace delivery, managed updater, release documentation, and figures

**Files:**

- Create: `.agents/plugins/marketplace.json`
- Create: `scripts/update_hypertaks.py`
- Create: `scripts/test_update_hypertaks.py`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `scripts/validate_skill.py`
- Modify: `skills/hypertaks/references/plugins-and-mcp.md`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `skills/hypertaks/RELEASE-NOTES.md`
- Modify: `.openclaw/INSTALL.md`
- Modify: `.hermes/INSTALL.md`
- Modify: `.opencode/INSTALL.md`
- Modify: `scripts/generate_figures.py`
- Regenerate: `Figure_1.png`, `Figure_2.png`, `Figure_3.png`, `Figure_4.png`

**Interfaces:**

- Consumes: a Git checkout, the canonical remote URL, branch `main`, and optional `--check-only`.
- Produces: one JSON object on stdout with `status`, stable `reason`,
  `current`, `available`, `updated`, and `resulting`; exit `0` for `current`,
  `available`, or `updated`, and exit `2` for a safely blocked update.
- Produces: a Codex-native repository marketplace entry whose Git-backed source is the repository root on `main`.
- Produces: documentation that separates Claude/Cursor host-native automatic delivery, Codex/Kimi refresh behavior, and the managed-checkout fallback.

- [ ] **Step 1: Write the updater tests before production code**

  Add `scripts/test_update_hypertaks.py` with temporary bare remotes and clones. Cover these behaviors with real Git repositories:

  Use exactly these test names: `test_reports_current_without_mutation`,
  `test_check_only_reports_available_without_advancing_head`,
  `test_fast_forwards_clean_main_checkout`,
  `test_blocks_dirty_checkout_without_fetch_or_mutation`,
  `test_blocks_diverged_checkout_without_mutation`,
  `test_blocks_detached_head_without_mutation`, and
  `test_blocks_wrong_remote_without_fetch_or_mutation`.

  Invoke the script as a subprocess so the public CLI, exit status, JSON output, and Git state are tested together.

- [ ] **Step 2: Run RED and record the expected failure**

  Run:

  ```powershell
  python -m unittest scripts.test_update_hypertaks -v
  ```

  Expected: fail because `scripts/update_hypertaks.py` does not exist.

- [ ] **Step 3: Implement the minimum safe updater**

  Implement five focused functions in `scripts/update_hypertaks.py`:
  `run_git(repo: Path, *args: str, check: bool = True) -> str`,
  `normalize_remote(value: str) -> str`,
  `inspect_checkout(repo: Path, remote_url: str, branch: str) -> UpdateResult`,
  `reconcile(repo: Path, remote_url: str, branch: str, check_only: bool) -> UpdateResult`,
  and `main(argv: list[str] | None = None) -> int`.

  Validation order must be remote identity, attached `main`, clean worktree,
  explicit branch fetch, ancestry, and only then `git merge --ff-only` against
  the captured target SHA with hooks disabled. Do not retry an ambiguous
  failure. Emit only the result JSON to stdout and use bounded reason codes
  rather than raw Git errors that may contain credentials.

- [ ] **Step 4: Run GREEN and refactor with tests green**

  Run:

  ```powershell
  python -m unittest scripts.test_update_hypertaks -v
  ```

  Expected: seven tests pass. Simplify duplicated fixture setup only after the first green run, then rerun the same command.

- [ ] **Step 5: Add native marketplace metadata and validation**

  Change the Claude marketplace plugin source to:

  ```json
  {
    "source": "github",
    "repo": "aabrur/hypertaks-agent",
    "ref": "main"
  }
  ```

  Add `.agents/plugins/marketplace.json` with marketplace name `hypertaks-marketplace`, display name `Hypertaks Marketplace`, a Git URL source for the repository root on `main`, `AVAILABLE` installation policy, `ON_INSTALL` authentication, and category `Coding`.

  Extend `scripts/validate_skill.py` to require and parse this Codex marketplace, validate its name/source/ref/policy/category, and continue enforcing version `4.4.0` across the live strict-semver records.

- [ ] **Step 6: Replace the blanket update prohibition with a bounded automatic-update contract**

  In `skills/hypertaks/references/plugins-and-mcp.md`, replace the rule that forbids all background updating with:

  - trusted marketplace updates may run automatically when the host/user policy enables them;
  - a managed checkout updater may run unattended only after installation-time opt-in;
  - it may update only a clean canonical checkout by fast-forward;
  - it must fail closed for dirty, diverged, detached, wrong-remote, or unreachable states;
  - copied directories are never overwritten and require one migration.

  Keep this policy canonical and refer to it from user-facing docs rather than duplicating its full internal rule set.

- [ ] **Step 7: Update README, release notes, changelog, and install guides**

  Add a concise update matrix and explain:

  - Claude Code can auto-update a configured marketplace when auto-update is enabled; version `4.4.0` is the release key.
  - Cursor marketplace delivery is host-controlled and automatic only on supported public/team refresh paths.
  - Codex uses Git-backed marketplace snapshots and a versioned plugin cache; current public documentation exposes marketplace refresh, not a universal background-update guarantee.
  - Kimi surfaces marketplace updates but currently applies them through its plugin manager.
  - OpenCode, Pi, OpenClaw, Hermes, and generic scanned-skill installations use their host manager where documented or the managed checkout plus symlink/junction fallback.
  - Existing copied skills need one migration; after migration, users no longer copy each release manually.

  Add the updater command and `--check-only` diagnostic. Do not promise that an already-running session reloads code in place.

- [ ] **Step 8: Update the repository inventory figure source and regenerate all figures**

  Extend Figure 1 with derived counts for marketplace catalogs and updater test scenarios. Keep the other three figures evidence-driven and regenerate all four:

  ```powershell
  python scripts/generate_figures.py
  ```

  Open every generated PNG and inspect titles, labels, counts, clipping, and readability.

- [ ] **Step 9: Run the complete verification gate**

  Run:

  ```powershell
  python scripts/validate_skill.py
  python scripts/run_evals.py --check
  python scripts/run_evals.py --static
  python -m unittest scripts.test_run_evals scripts.test_retrieval_eval scripts.test_update_hypertaks -v
  python scripts/retrieval_eval.py evals/fixtures/retrieval-sample.jsonl --output "$env:TEMP\hypertaks-retrieval-report.json"
  python scripts/plot_retrieval_eval.py "$env:TEMP\hypertaks-retrieval-report.json" "$env:TEMP\hypertaks-retrieval-quality"
  npm test
  python -m compileall scripts
  git diff --check
  ```

  Confirm the retrieval PNG and SVG exist and are non-empty. Re-read the spec and this plan line by line, then inspect `git diff --stat` and `git diff`.

- [ ] **Step 10: Review, commit once, push once, and reconcile**

  Request a cold code review against the design and this plan. Fix every Critical or Important finding and rerun affected tests plus the full verification gate.

  Commit the complete work item:

  ```powershell
  git add .agents/plugins/marketplace.json .claude-plugin/marketplace.json scripts/update_hypertaks.py scripts/test_update_hypertaks.py scripts/validate_skill.py skills/hypertaks/references/plugins-and-mcp.md README.md CHANGELOG.md skills/hypertaks/RELEASE-NOTES.md .openclaw/INSTALL.md .hermes/INSTALL.md .opencode/INSTALL.md scripts/generate_figures.py Figure_1.png Figure_2.png Figure_3.png Figure_4.png docs/superpowers/plans/2026-07-23-hypertaks-v440-auto-update.md
  git commit -m "feat: add safe automatic update delivery"
  git push origin main
  ```

  Reconcile with `git fetch origin`, verify `HEAD == origin/main`, and confirm the worktree is clean.
