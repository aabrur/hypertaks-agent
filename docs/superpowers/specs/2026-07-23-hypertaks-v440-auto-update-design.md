# Hypertaks 4.4.0 Automatic Update Design

**Contract:** `HT-20260723-AUT`

**Status:** Boss-approved design

**Scope:** Automatic delivery of Hypertaks updates to supported plugin and
managed-skill installations, plus synchronized release documentation and
figures.

## Objective and evidence boundary

Users who install Hypertaks through a host marketplace or a managed Git checkout
should receive future compatible releases without repeating a manual update
command. The repository must not claim that an unmanaged copied directory can
update itself: an older copy has no executable channel through which new updater
logic can reach it.

The implementation must distinguish three installation classes:

| Installation class | Automatic path | Honest boundary |
|---|---|---|
| Host marketplace or plugin manager | Host-native update detection and application | Availability and default state are controlled by the host |
| Managed Git checkout exposed through a symlink or junction | Fast-forward-only updater runs against the canonical checkout | The initial managed installation or one-time migration is required |
| Archive or copied skill directory | None | Reinstall or migrate once to a managed checkout |

## Selected architecture

Use a hybrid distribution model:

1. Keep every plugin manifest on strict semantic version `4.4.0` so hosts that
   use manifest versions can detect this release.
2. Configure the Claude marketplace entry as a GitHub-backed source that follows
   the repository's default branch. Claude Code performs the actual background
   update only when its marketplace auto-update setting or managed policy allows
   it.
3. Add one cross-platform updater with no package dependencies. It operates only
   on a clean Git checkout of this repository, fetches `origin/main`, verifies
   that the update is a fast-forward, and then advances the checkout. A dirty,
   diverged, detached, or wrong-remote checkout fails closed without changing
   files.
4. Make scanned-skill installation instructions use a symlink or junction to
   that managed checkout. The updater changes the canonical checkout; every
   linked agent sees the same release after restart or reload.
5. Do not add a self-modifying skill instruction, background daemon, credential,
   force reset, local-change overwrite, or host-specific hard dependency.

## Components

### Update utility

The updater has one responsibility: reconcile a verified managed checkout with
`origin/main`.

Inputs:

- repository path, defaulting to the updater's own repository;
- canonical remote URL and branch;
- optional check-only mode for validation and diagnostics.

Flow:

1. Resolve the repository root and Git executable.
2. Verify the checkout identity and canonical `origin` URL.
3. Verify branch `main`, a clean worktree, and no detached HEAD.
4. Fetch `origin/main`.
5. Report `current`, `available`, or `blocked`.
6. If an update exists, require `HEAD` to be an ancestor of `origin/main`.
7. Advance with `git merge --ff-only origin/main`.
8. Re-read `HEAD` and report the reconciled commit.

No retry follows an ambiguous failure. The utility never deletes files, changes
remotes, checks out another branch, resets history, or stashes user work.

### Host integration

Host-native marketplace managers remain the primary update channel. Manifests
carry synchronized versions and canonical repository metadata. Documentation
states which automatic behavior is verified by official host documentation and
which behavior remains host-controlled or unavailable.

The managed-checkout updater is the fallback for scanned skill directories and
hosts without a documented marketplace update contract. It is not injected into
unrelated Hypertaks tasks and does not run from `SKILL.md`.

### Documentation and figures

README, release notes, changelog, and platform installation guides describe the
same installation matrix and evidence boundary. `scripts/generate_figures.py`
remains the source for all four figures. Figure 1 adds distribution/update
inventory, while the other figures retain their evidence-based purposes unless
repository facts require regeneration.

## Failure handling

- Network failure: leave the checkout unchanged and report `blocked`.
- Dirty worktree: leave user changes untouched and report `blocked`.
- Diverged history: leave both histories untouched and report `blocked`.
- Wrong remote or branch: do not fetch or mutate; report the mismatch.
- Host disables marketplace updates: document the host setting; do not bypass
  it from plugin code.
- Copied legacy installation: report that one-time migration is required; do
  not claim automatic reachability.

## Verification strategy

The release is acceptable only when:

1. Updater unit/integration tests prove current, fast-forward, dirty, diverged,
   detached, and wrong-remote outcomes in temporary repositories.
2. A RED-GREEN check demonstrates that the new tests fail before the updater
   implementation and pass afterward.
3. Manifest/version validation passes at `4.4.0`.
4. Static evals, runtime tests, Python tests, compilation, and figure generation
   pass using the repository's established validation sequence.
5. Generated figures are inspected after regeneration.
6. README and release notes make no universal auto-update claim for unsupported
   hosts or unreachable legacy copies.
7. The final commit is pushed normally to `origin/main`, then local and remote
   commits are reconciled.

## Explicit non-goals

- Silently overwriting local changes.
- Installing a resident service or scheduled task.
- Auto-updating the current running session in place.
- Guaranteeing behavior that a third-party host disables or does not expose.
- Reclassifying static coverage as behavioral certification.
