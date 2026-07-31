#!/usr/bin/env python3
"""Unit tests for the Wave 3 managed-agent validator."""

from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts.validate_managed_agents import validate

ROOT = Path(__file__).resolve().parent.parent


class ManagedAgentValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.mkdtemp(prefix="hypertaks-wave3-validator-")
        self.root = Path(self.temp_dir)
        self.catalog = self.root / "distribution" / "managed-agents.json"
        self.registry = self.root / "distribution" / "registry.json"

        paths = [
            "distribution/managed-agents.json",
            "distribution/registry.json",
            "evals/managed-agents/LIVE-CERTIFICATION.md",
            ".github-copilot/plugin.json",
            ".github-copilot/INSTALL.md",
            ".windsurf/INSTALL.md",
            ".cline/INSTALL.md",
            ".roo/INSTALL.md",
            ".kilo/INSTALL.md",
            ".aider/INSTALL.md",
            ".goose/INSTALL.md",
            ".openhands/INSTALL.md",
        ]
        for relative in paths:
            source = ROOT / relative
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _validate(self) -> int:
        return validate(
            catalog_path=self.catalog,
            registry_path=self.registry,
            root=self.root,
        )

    def test_repository_fixture_passes(self) -> None:
        self.assertEqual(self._validate(), 0)

    def test_pass_requires_real_host_lifecycle(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"][0]["evidenceStatus"] = "PASS"
        data["hosts"][0]["evidenceType"] = "static-package"
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self._validate(), 0)

    def test_missing_wave_host_fails(self) -> None:
        data = json.loads(self.catalog.read_text(encoding="utf-8"))
        data["hosts"] = data["hosts"][:-1]
        self.catalog.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self._validate(), 0)

    def test_registry_wave_mismatch_fails(self) -> None:
        data = json.loads(self.registry.read_text(encoding="utf-8"))
        for host in data["hosts"]:
            if host.get("id") == "windsurf":
                host["wave"] = 2
                break
        self.registry.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.assertNotEqual(self._validate(), 0)

    def test_deprecated_openhands_guidance_must_be_explicit(self) -> None:
        path = self.root / ".openhands" / "INSTALL.md"
        text = path.read_text(encoding="utf-8").replace("deprecated", "legacy")
        path.write_text(text, encoding="utf-8")
        self.assertNotEqual(self._validate(), 0)


if __name__ == "__main__":
    unittest.main()
