#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts.validate_managed_agents import validate

ROOT = Path(__file__).resolve().parent.parent


class ManagedAgentCatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = Path(tempfile.mkdtemp(prefix="hypertaks-wave3-"))
        shutil.copytree(ROOT, self.temp / "repo", dirs_exist_ok=True, ignore=shutil.ignore_patterns("dist", ".git", "__pycache__", "node_modules", ".build"))
        self.root = self.temp / "repo"
        self.catalog = self.root / "distribution" / "managed-agents.json"

    def tearDown(self) -> None:
        shutil.rmtree(self.temp, ignore_errors=True)

    def test_repository_catalog_passes(self) -> None:
        self.assertEqual(validate(self.catalog, root=self.root), 0)

    def test_non_pass_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"][0]["evidenceStatus"] = "PARTIAL"
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(validate(self.catalog, root=self.root), 0)

    def test_missing_adapter_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"][0]["adapterPath"] = "missing/plugin.json"
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(validate(self.catalog, root=self.root), 0)


if __name__ == "__main__":
    unittest.main()
