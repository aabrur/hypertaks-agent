#!/usr/bin/env python3
"""Unit tests for the Wave 2 coding-agent catalog validator."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_coding_agents import EXPECTED_HOSTS, EXPECTED_SKILLS, validate


class ValidateCodingAgentsTests(unittest.TestCase):
    def _write_json(self, path: Path, payload: dict) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload), encoding="utf-8")

    def _build_fixture(self, root: Path) -> tuple[Path, Path, Path]:
        checklist = "evals/coding-agents/LIVE-CERTIFICATION.md"
        (root / checklist).parent.mkdir(parents=True, exist_ok=True)
        (root / checklist).write_text("checklist", encoding="utf-8")
        for path in (
            ".claude-plugin/plugin.json",
            ".codex-plugin/plugin.json",
            ".cursor-plugin/plugin.json",
            ".kimi-plugin/plugin.json",
            ".opencode/INSTALL.md",
            ".pi/extensions/hypertaks.ts",
            ".openclaw/INSTALL.md",
            ".hermes/INSTALL.md",
        ):
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            if path.endswith("INSTALL.md"):
                target.write_text(
                    ".opencode/skills .agents/skills " + " ".join(EXPECTED_SKILLS),
                    encoding="utf-8",
                )
            else:
                target.write_text("{}", encoding="utf-8")

        adapter_by_host = {
            "claude-code": ".claude-plugin/plugin.json",
            "codex": ".codex-plugin/plugin.json",
            "cursor": ".cursor-plugin/plugin.json",
            "kimi-code": ".kimi-plugin/plugin.json",
            "opencode": ".opencode/INSTALL.md",
            "pi": ".pi/extensions/hypertaks.ts",
            "openclaw": ".openclaw/INSTALL.md",
            "hermes": ".hermes/INSTALL.md",
        }
        hosts = []
        registry_hosts = []
        for host_id in sorted(EXPECTED_HOSTS):
            hosts.append(
                {
                    "id": host_id,
                    "displayName": host_id,
                    "classification": "NATIVE_SKILL",
                    "adapterPath": adapter_by_host[host_id],
                    "installationMode": "native-skill",
                    "discoveryMechanism": "host discovery",
                    "invocationMechanism": "natural language",
                    "updateMechanism": "host or installer update",
                    "uninstallMechanism": "ownership-aware uninstall",
                    "officialDocs": [f"https://example.com/{host_id}"],
                    "canonicalSkills": EXPECTED_SKILLS,
                    "liveChecklist": checklist,
                    "evidenceStatus": "PARTIAL",
                    "evidenceType": "static-package",
                    "evidenceNote": "structural only",
                }
            )
            registry_hosts.append(
                {"id": host_id, "wave": 2, "liveChecklist": checklist}
            )

        catalog = root / "distribution/coding-agents.json"
        registry = root / "distribution/registry.json"
        package = root / "package.json"
        self._write_json(
            catalog,
            {
                "schemaVersion": 1,
                "wave": 2,
                "canonicalSkills": EXPECTED_SKILLS,
                "hosts": hosts,
            },
        )
        self._write_json(registry, {"hosts": registry_hosts})
        self._write_json(
            package,
            {
                "pi": {
                    "extensions": [".pi/extensions/hypertaks.ts"],
                    "skills": ["skills/"],
                }
            },
        )
        return catalog, registry, package

    def test_valid_partial_catalog_passes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            paths = self._build_fixture(root)
            self.assertEqual(validate(*paths, root=root), 0)

    def test_pass_requires_real_host_lifecycle(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            catalog, registry, package = self._build_fixture(root)
            payload = json.loads(catalog.read_text(encoding="utf-8"))
            payload["hosts"][0]["evidenceStatus"] = "PASS"
            payload["hosts"][0]["evidenceType"] = "static-package"
            self._write_json(catalog, payload)
            self.assertNotEqual(validate(catalog, registry, package, root=root), 0)

    def test_missing_wave_host_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            catalog, registry, package = self._build_fixture(root)
            payload = json.loads(catalog.read_text(encoding="utf-8"))
            payload["hosts"].pop()
            self._write_json(catalog, payload)
            self.assertNotEqual(validate(catalog, registry, package, root=root), 0)

    def test_escaping_adapter_path_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            catalog, registry, package = self._build_fixture(root)
            payload = json.loads(catalog.read_text(encoding="utf-8"))
            payload["hosts"][0]["adapterPath"] = "../outside.json"
            self._write_json(catalog, payload)
            self.assertNotEqual(validate(catalog, registry, package, root=root), 0)

    def test_wrong_skill_set_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            catalog, registry, package = self._build_fixture(root)
            payload = json.loads(catalog.read_text(encoding="utf-8"))
            payload["hosts"][0]["canonicalSkills"] = EXPECTED_SKILLS[:-1]
            self._write_json(catalog, payload)
            self.assertNotEqual(validate(catalog, registry, package, root=root), 0)


if __name__ == "__main__":
    unittest.main()
