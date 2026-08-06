#!/usr/bin/env python3
"""Unit tests for universal Hypertaks installer."""

import argparse
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from scripts.installer import (
    cmd_doctor,
    cmd_install,
    cmd_list_hosts,
    cmd_status,
    cmd_uninstall,
    cmd_update,
    cmd_verify,
    validate_owned_relative_path,
)

ROOT = Path(__file__).resolve().parent.parent


def _ns(**overrides) -> argparse.Namespace:
    base = {"host": "antigravity", "scope": "project", "dry_run": False, "json": True, "yes": True}
    base.update(overrides)
    return argparse.Namespace(**base)


class InstallerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.mkdtemp(prefix="hypertaks-installer-test-")
        self.test_root = Path(self.temp_dir)
        self.target = self.test_root / ".agents" / "plugins" / "hypertaks"
        self.manifest = self.target / ".hypertaks-manifest.json"

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _install(self, **overrides) -> int:
        return cmd_install(_ns(**overrides), project_root=self.test_root)

    def _uninstall(self, **overrides) -> int:
        return cmd_uninstall(_ns(**overrides), project_root=self.test_root)

    def _verify(self, **overrides) -> int:
        return cmd_verify(_ns(**overrides), project_root=self.test_root)

    def _update(self, **overrides) -> int:
        return cmd_update(_ns(**overrides), project_root=self.test_root)

    def test_doctor_command(self) -> None:
        self.assertEqual(cmd_doctor(argparse.Namespace(json=True)), 0)

    def test_list_hosts_command(self) -> None:
        self.assertEqual(cmd_list_hosts(argparse.Namespace(json=True)), 0)

    def test_fresh_install_verify_update_uninstall_lifecycle(self) -> None:
        self.assertEqual(self._install(), 0)
        self.assertEqual(self._verify(), 0)
        self.assertEqual(self._update(), 0)
        self.assertEqual(self._uninstall(), 0)
        self.assertNotEqual(self._verify(), 0)

    def test_unsupported_and_missing_host(self) -> None:
        self.assertNotEqual(self._install(host="nonexistent-host"), 0)

    def test_corrupted_package_detection(self) -> None:
        self.assertEqual(self._install(), 0)
        data = json.loads(self.manifest.read_text(encoding="utf-8"))
        first_file = self.target / data["files"][0]["path"]
        first_file.write_text("CORRUPTED CONTENT\n", encoding="utf-8")
        self.assertNotEqual(self._verify(), 0)

    def test_uninstall_preserves_unknown_files(self) -> None:
        self.assertEqual(self._install(), 0)
        unknown = self.target / "skills" / "UNKNOWN.md"
        unknown.parent.mkdir(parents=True, exist_ok=True)
        unknown.write_text("user-owned file\n", encoding="utf-8")
        self.assertEqual(self._uninstall(), 0)
        self.assertFalse(self.manifest.is_file())
        self.assertTrue(unknown.is_file())

    def test_unmanaged_collision_rejected_without_deletion(self) -> None:
        self.assertEqual(self._install(), 0)
        unknown = self.target / "skills" / "UNKNOWN.md"
        unknown.parent.mkdir(parents=True, exist_ok=True)
        unknown.write_text("user-owned file\n", encoding="utf-8")
        with mock.patch.object(sys.stdin, "isatty", return_value=False):
            rc = self._install(yes=False)
        self.assertNotEqual(rc, 0)
        self.assertTrue(self.manifest.is_file())
        self.assertTrue(unknown.is_file())

    def test_dry_run_install_leaves_nothing(self) -> None:
        rc = self._install(dry_run=True)
        self.assertEqual(rc, 0)
        self.assertFalse(self.target.exists())

    def test_update_recalculates_hashes_and_verify_passes(self) -> None:
        self.assertEqual(self._install(), 0)
        data = json.loads(self.manifest.read_text(encoding="utf-8"))
        first_file = self.target / data["files"][0]["path"]
        first_file.write_text("CORRUPTED CONTENT\n", encoding="utf-8")
        self.assertNotEqual(self._verify(), 0)
        self.assertEqual(self._update(), 0)
        self.assertEqual(self._verify(), 0)

    def test_malformed_manifest_rejected_without_deletion(self) -> None:
        self.assertEqual(self._install(), 0)
        self.manifest.write_text("not-json{", encoding="utf-8")
        rc = self._install(yes=True)
        self.assertNotEqual(rc, 0)
        sample_skill = self.target / "skills" / "hypertaks" / "SKILL.md"
        self.assertTrue(sample_skill.is_file())

    def test_traversal_manifest_uninstall_rejected_without_deletion(self) -> None:
        self.assertEqual(self._install(), 0)
        traversal_manifest = {
            "product": "hypertaks",
            "version": "4.5.1",
            "host": "antigravity",
            "scope": "project",
            "files": [{"path": "../escape.txt", "sha256": "00"}],
        }
        self.manifest.write_text(json.dumps(traversal_manifest), encoding="utf-8")
        rc = self._uninstall(yes=True)
        self.assertNotEqual(rc, 0)
        self.assertTrue(self.manifest.is_file())
        sample_skill = self.target / "skills" / "hypertaks" / "SKILL.md"
        self.assertTrue(sample_skill.is_file())

    def test_reinstall_is_idempotent(self) -> None:
        self.assertEqual(self._install(), 0)
        unknown = self.target / "skills" / "UNKNOWN.md"
        unknown.parent.mkdir(parents=True, exist_ok=True)
        unknown.write_text("user-owned file\n", encoding="utf-8")
        self.assertEqual(self._install(yes=True), 0)
        self.assertEqual(self._verify(), 0)
        self.assertTrue(unknown.is_file())

    def test_noninteractive_without_yes_errors_and_changes_nothing(self) -> None:
        self.assertEqual(self._install(), 0)
        with mock.patch.object(sys.stdin, "isatty", return_value=False):
            rc_reinstall = self._install(yes=False)
            self.assertNotEqual(rc_reinstall, 0)
            self.assertTrue(self.manifest.is_file())
            rc_uninstall = self._uninstall(yes=False)
            self.assertNotEqual(rc_uninstall, 0)
            self.assertTrue(self.manifest.is_file())

    def test_missing_installation_returns_non_destructive_result(self) -> None:
        rc = self._uninstall()
        self.assertEqual(rc, 0)
        self.assertFalse(self.target.exists())

    def test_validate_owned_relative_path_rejects_unsafe(self) -> None:
        base = Path(self.temp_dir) / "target"
        base.mkdir()
        with self.assertRaises(ValueError):
            validate_owned_relative_path(base, "../escape.txt")
        with self.assertRaises(ValueError):
            validate_owned_relative_path(base, str(Path("/absolute/path").resolve()))
        resolved = validate_owned_relative_path(base, "skills/hypertaks/SKILL.md")
        self.assertTrue(resolved.is_relative_to(base.resolve()))


if __name__ == "__main__":
    unittest.main()
