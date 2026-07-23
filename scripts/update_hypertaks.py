"""Safely reconcile a managed Hypertaks checkout with origin/main."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import urlsplit


DEFAULT_REMOTE = "https://github.com/aabrur/hypertaks-agent.git"
DEFAULT_BRANCH = "main"


class GitError(RuntimeError):
    """A Git command failed without exposing its raw output."""


@dataclass(frozen=True)
class UpdateResult:
    status: str
    reason: str
    current: str | None = None
    available: str | None = None
    updated: bool = False
    resulting: str | None = None


def git_environment() -> dict[str, str]:
    environment = os.environ.copy()
    environment["GIT_TERMINAL_PROMPT"] = "0"
    environment["GCM_INTERACTIVE"] = "Never"
    return environment


def run_git(repo: Path, *args: str, check: bool = True) -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=repo,
            check=False,
            capture_output=True,
            text=True,
            env=git_environment(),
        )
    except OSError as exc:
        raise GitError("Git is unavailable") from exc
    if check and result.returncode != 0:
        raise GitError(f"git {args[0]} failed")
    return result.stdout.strip()


def git_status(repo: Path, *args: str) -> int:
    try:
        return subprocess.run(
            ["git", *args],
            cwd=repo,
            check=False,
            capture_output=True,
            text=True,
            env=git_environment(),
        ).returncode
    except OSError as exc:
        raise GitError("Git is unavailable") from exc


def normalize_remote(value: str) -> str:
    remote = value.strip().replace("\\", "/")
    ssh_match = re.fullmatch(r"git@([^:]+):(.+)", remote)
    if ssh_match:
        remote = f"{ssh_match.group(1).lower()}/{ssh_match.group(2)}"
    elif "://" in remote:
        parsed = urlsplit(remote)
        host = (parsed.hostname or "").lower()
        if parsed.port:
            host = f"{host}:{parsed.port}"
        remote = f"{host}{parsed.path}"
    else:
        remote = Path(remote).expanduser().resolve().as_posix()
        if os.name == "nt":
            remote = remote.casefold()
    remote = remote.rstrip("/")
    if remote.lower().endswith(".git"):
        remote = remote[:-4]
    return remote.lower()


def blocked(
    reason: str,
    current: str | None = None,
    available: str | None = None,
) -> UpdateResult:
    return UpdateResult(
        status="blocked",
        reason=reason,
        current=current,
        available=available,
    )


def inspect_checkout(repo: Path, remote_url: str, branch: str) -> UpdateResult:
    try:
        root = Path(run_git(repo, "rev-parse", "--show-toplevel")).resolve()
    except (GitError, OSError):
        return blocked("repository path is not a Git checkout")

    try:
        remote_lines = [
            line
            for line in run_git(
                root, "config", "--get-all", "remote.origin.url"
            ).splitlines()
            if line
        ]
    except GitError:
        return blocked("origin remote is missing")
    if len(remote_lines) != 1:
        return blocked("WRONG_REMOTE")
    actual_remote = remote_lines[0]
    try:
        remote_matches = (
            normalize_remote(actual_remote) == normalize_remote(remote_url)
        )
    except (OSError, ValueError):
        remote_matches = False
    if not remote_matches:
        return blocked("WRONG_REMOTE")

    try:
        actual_branch = run_git(root, "symbolic-ref", "--short", "-q", "HEAD")
    except GitError:
        actual_branch = ""
    if not actual_branch:
        return blocked("DETACHED_HEAD")
    if actual_branch != branch:
        return blocked("WRONG_BRANCH")

    try:
        current = run_git(root, "rev-parse", "HEAD")
        dirty = run_git(root, "status", "--porcelain", "--untracked-files=normal")
    except GitError:
        return blocked("INVALID_CHECKOUT")
    if dirty:
        return blocked("DIRTY_WORKTREE", current=current)

    return UpdateResult(
        status="ready",
        reason="READY",
        current=current,
        resulting=current,
    )


def reconcile(
    repo: Path,
    remote_url: str,
    branch: str,
    check_only: bool,
) -> UpdateResult:
    inspected = inspect_checkout(repo, remote_url, branch)
    if inspected.status == "blocked":
        return inspected

    root = Path(run_git(repo, "rev-parse", "--show-toplevel")).resolve()
    current = inspected.current
    try:
        run_git(
            root,
            "fetch",
            "--quiet",
            "origin",
            f"refs/heads/{branch}:refs/remotes/origin/{branch}",
        )
        available = run_git(root, "rev-parse", f"refs/remotes/origin/{branch}")
    except GitError:
        return blocked("FETCH_FAILED", current=current)

    if current == available:
        return UpdateResult(
            status="current",
            reason="CURRENT",
            current=current,
            available=available,
            resulting=current,
        )

    ancestry_status = git_status(root, "merge-base", "--is-ancestor", current, available)
    if ancestry_status == 1:
        return blocked(
            "DIVERGED",
            current=current,
            available=available,
        )
    if ancestry_status != 0:
        return blocked(
            "ANCESTRY_UNVERIFIED",
            current=current,
            available=available,
        )

    if check_only:
        return UpdateResult(
            status="available",
            reason="UPDATE_AVAILABLE",
            current=current,
            available=available,
            resulting=current,
        )

    try:
        with tempfile.TemporaryDirectory(prefix="hypertaks-empty-hooks-") as hooks:
            run_git(
                root,
                "-c",
                f"core.hooksPath={hooks}",
                "merge",
                "--ff-only",
                "--quiet",
                available,
            )
        reconciled = run_git(root, "rev-parse", "HEAD")
    except GitError:
        return blocked(
            "MERGE_FAILED",
            current=current,
            available=available,
        )
    if reconciled != available:
        return blocked(
            "RECONCILE_FAILED",
            current=current,
            available=available,
        )
    return UpdateResult(
        status="updated",
        reason="UPDATED",
        current=current,
        available=available,
        updated=True,
        resulting=reconciled,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fast-forward a clean managed Hypertaks checkout.",
    )
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="managed Hypertaks repository path",
    )
    parser.add_argument(
        "--remote-url",
        default=DEFAULT_REMOTE,
        help="canonical origin URL",
    )
    parser.add_argument("--branch", default=DEFAULT_BRANCH)
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="fetch and report without advancing the checkout",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = reconcile(
            args.repo.resolve(),
            args.remote_url,
            args.branch,
            args.check_only,
        )
    except (GitError, OSError):
        result = blocked("update inspection failed")
    print(json.dumps(asdict(result), sort_keys=True))
    return 2 if result.status == "blocked" else 0


if __name__ == "__main__":
    raise SystemExit(main())
