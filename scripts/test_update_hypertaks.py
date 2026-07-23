"""Integration tests for the managed Hypertaks checkout updater."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UPDATER = ROOT / "scripts" / "update_hypertaks.py"


def git(cwd: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


class ManagedCheckout:
    def __init__(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.remote = self.root / "remote.git"
        self.seed = self.root / "seed"
        self.checkout = self.root / "checkout"

        git(self.root, "init", "--bare", "--initial-branch=main", str(self.remote))
        git(self.root, "init", "--initial-branch=main", str(self.seed))
        git(self.seed, "config", "user.email", "hypertaks-tests@example.invalid")
        git(self.seed, "config", "user.name", "Hypertaks Tests")
        self.commit_remote("initial")
        git(self.seed, "remote", "add", "origin", str(self.remote))
        git(self.seed, "push", "--set-upstream", "origin", "main")
        git(self.root, "clone", str(self.remote), str(self.checkout))
        git(self.checkout, "config", "user.email", "hypertaks-tests@example.invalid")
        git(self.checkout, "config", "user.name", "Hypertaks Tests")

    def close(self) -> None:
        self.temp.cleanup()

    def commit_remote(self, value: str) -> str:
        marker = self.seed / "release.txt"
        marker.write_text(value + "\n", encoding="utf-8")
        git(self.seed, "add", "release.txt")
        git(self.seed, "commit", "-m", value)
        return git(self.seed, "rev-parse", "HEAD")

    def push_remote(self, value: str) -> str:
        commit = self.commit_remote(value)
        git(self.seed, "push", "origin", "main")
        return commit

    def run_updater(self, *extra: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(UPDATER),
                "--repo",
                str(self.checkout),
                "--remote-url",
                str(self.remote),
                *extra,
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )


class UpdateHypertaksTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repo = ManagedCheckout()

    def tearDown(self) -> None:
        self.repo.close()

    def result(self, completed: subprocess.CompletedProcess[str]) -> dict[str, object]:
        self.assertTrue(
            completed.stdout.strip(),
            msg=f"missing JSON output; stderr={completed.stderr!r}",
        )
        return json.loads(completed.stdout)

    def test_reports_current_without_mutation(self) -> None:
        before = git(self.repo.checkout, "rev-parse", "HEAD")

        completed = self.repo.run_updater()

        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertEqual(self.result(completed)["status"], "current")
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)

    def test_check_only_reports_available_without_advancing_head(self) -> None:
        before = git(self.repo.checkout, "rev-parse", "HEAD")
        available = self.repo.push_remote("available")

        completed = self.repo.run_updater("--check-only")

        self.assertEqual(completed.returncode, 0, completed.stderr)
        payload = self.result(completed)
        self.assertEqual(payload["status"], "available")
        self.assertEqual(payload["available"], available)
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)

    def test_fast_forwards_clean_main_checkout(self) -> None:
        available = self.repo.push_remote("fast-forward")

        completed = self.repo.run_updater()

        self.assertEqual(completed.returncode, 0, completed.stderr)
        payload = self.result(completed)
        self.assertEqual(payload["status"], "updated")
        self.assertTrue(payload["updated"])
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), available)

    def test_blocks_dirty_checkout_without_fetch_or_mutation(self) -> None:
        before = git(self.repo.checkout, "rev-parse", "HEAD")
        tracked_remote_before = git(
            self.repo.checkout, "rev-parse", "refs/remotes/origin/main"
        )
        self.repo.push_remote("dirty-remote")
        (self.repo.checkout / "release.txt").write_text("local edit\n", encoding="utf-8")

        completed = self.repo.run_updater()

        self.assertEqual(completed.returncode, 2)
        self.assertEqual(self.result(completed)["status"], "blocked")
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)
        self.assertEqual(
            git(self.repo.checkout, "rev-parse", "refs/remotes/origin/main"),
            tracked_remote_before,
        )

    def test_blocks_diverged_checkout_without_mutation(self) -> None:
        (self.repo.checkout / "local.txt").write_text("local\n", encoding="utf-8")
        git(self.repo.checkout, "add", "local.txt")
        git(self.repo.checkout, "commit", "-m", "local")
        before = git(self.repo.checkout, "rev-parse", "HEAD")
        self.repo.push_remote("remote-divergence")

        completed = self.repo.run_updater()

        self.assertEqual(completed.returncode, 2)
        payload = self.result(completed)
        self.assertEqual(payload["status"], "blocked")
        self.assertIn("diverged", str(payload["reason"]).lower())
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)

    def test_blocks_detached_head_without_mutation(self) -> None:
        before = git(self.repo.checkout, "rev-parse", "HEAD")
        git(self.repo.checkout, "checkout", "--detach")

        completed = self.repo.run_updater()

        self.assertEqual(completed.returncode, 2)
        payload = self.result(completed)
        self.assertEqual(payload["status"], "blocked")
        self.assertIn("detached", str(payload["reason"]).lower())
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)

    def test_blocks_wrong_remote_without_fetch_or_mutation(self) -> None:
        expected_remote = self.repo.root / "expected.git"
        git(self.repo.root, "init", "--bare", "--initial-branch=main", str(expected_remote))
        before = git(self.repo.checkout, "rev-parse", "HEAD")
        tracked_remote_before = git(
            self.repo.checkout, "rev-parse", "refs/remotes/origin/main"
        )
        self.repo.push_remote("wrong-remote-must-not-fetch")

        completed = subprocess.run(
            [
                sys.executable,
                str(UPDATER),
                "--repo",
                str(self.repo.checkout),
                "--remote-url",
                str(expected_remote),
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )

        self.assertEqual(completed.returncode, 2)
        payload = self.result(completed)
        self.assertEqual(payload["status"], "blocked")
        self.assertIn("remote", str(payload["reason"]).lower())
        self.assertEqual(git(self.repo.checkout, "rev-parse", "HEAD"), before)
        self.assertEqual(
            git(self.repo.checkout, "rev-parse", "refs/remotes/origin/main"),
            tracked_remote_before,
        )


if __name__ == "__main__":
    unittest.main()
