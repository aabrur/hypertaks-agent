#!/usr/bin/env python3
"""Unit tests for official native plugin compatibility validation."""

from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts.validate_plugin_compatibility import validate

ROOT = Path(__file__).resolve().parent.parent


class PluginCompatibilityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = Path(tempfile.mkdtemp(prefix="hypertaks-plugin-compat-"))
        shutil.copytree(ROOT, self.temp_dir / "repo", dirs_exist_ok=True, ignore=shutil.ignore_patterns("dist", ".git", "__pycache__", "node_modules", ".build"))
        self.root = self.temp_dir / "repo"
        self.catalog = self.root / "distribution" / "plugin-compatibility.json"
        self.readme = self.root / "README.md"

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def run_validation(self) -> int:
        return validate(self.catalog, self.readme, self.root)

    def test_repository_catalog_passes(self) -> None:
        self.assertEqual(self.run_validation(), 0)

    def test_missing_host_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"] = data["hosts"][:-1]
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self.run_validation(), 0)

    def test_non_pass_host_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"][0]["compatibilityStatus"] = "PARTIAL"
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self.run_validation(), 0)

    def test_missing_adapter_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"][0]["adapterPath"] = "missing/plugin.json"
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self.run_validation(), 0)

    def test_readme_python_instruction_fails(self) -> None:
        self.readme.write_text(self.readme.read_text(encoding="utf-8") + "\nPython installer\n", encoding="utf-8")
        self.assertNotEqual(self.run_validation(), 0)


if __name__ == "__main__":
    unittest.main()
