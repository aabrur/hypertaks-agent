#!/usr/bin/env python3
"""Unit tests for universal Hypertaks installer."""

import argparse
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts.installer import (
    cmd_doctor,
    cmd_install,
    cmd_list_hosts,
    cmd_status,
    cmd_uninstall,
    cmd_update,
    cmd_verify,
)

ROOT = Path(__file__).resolve().parent.parent


class InstallerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.mkdtemp(prefix="hypertaks-installer-test-")
        self.test_root = Path(self.temp_dir)

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_doctor_command(self) -> None:
        args = argparse.Namespace(json=True)
        rc = cmd_doctor(args)
        self.assertEqual(rc, 0)

    def test_list_hosts_command(self) -> None:
        args = argparse.Namespace(json=True)
        rc = cmd_list_hosts(args)
        self.assertEqual(rc, 0)

    def test_fresh_install_verify_update_uninstall_lifecycle(self) -> None:
        args_install = argparse.Namespace(
            host="antigravity",
            scope="project",
            dry_run=False,
            json=True,
            yes=True,
        )
        rc_inst = cmd_install(args_install)
        self.assertEqual(rc_inst, 0)

        args_verify = argparse.Namespace(
            host="antigravity",
            scope="project",
            json=True,
        )
        rc_ver = cmd_verify(args_verify)
        self.assertEqual(rc_ver, 0)

        args_update = argparse.Namespace(
            host="antigravity",
            dry_run=False,
            json=True,
        )
        rc_upd = cmd_update(args_update)
        self.assertEqual(rc_upd, 0)

        args_uninst = argparse.Namespace(
            host="antigravity",
            scope="project",
            dry_run=False,
            json=True,
        )
        rc_un = cmd_uninstall(args_uninst)
        self.assertEqual(rc_un, 0)

        rc_rever = cmd_verify(args_verify)
        self.assertNotEqual(rc_rever, 0)

    def test_unsupported_and_missing_host(self) -> None:
        args = argparse.Namespace(
            host="nonexistent-host",
            scope="project",
            dry_run=False,
            json=True,
        )
        rc = cmd_install(args)
        self.assertNotEqual(rc, 0)

    def test_corrupted_package_detection(self) -> None:
        args_install = argparse.Namespace(
            host="antigravity",
            scope="project",
            dry_run=False,
            json=True,
            yes=True,
        )
        cmd_install(args_install)

        target_manifest = ROOT / ".agents" / "plugins" / "hypertaks" / ".hypertaks-manifest.json"
        if target_manifest.is_file():
            data = json.loads(target_manifest.read_text(encoding="utf-8"))
            if data.get("files"):
                first_file = ROOT / ".agents" / "plugins" / "hypertaks" / data["files"][0]["path"]
                if first_file.is_file():
                    first_file.write_text("CORRUPTED CONTENT\n", encoding="utf-8")

        args_verify = argparse.Namespace(
            host="antigravity",
            scope="project",
            json=True,
        )
        rc_ver = cmd_verify(args_verify)
        self.assertNotEqual(rc_ver, 0)


if __name__ == "__main__":
    unittest.main()
