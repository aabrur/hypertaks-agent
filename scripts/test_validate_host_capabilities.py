#!/usr/bin/env python3
"""Unit tests for host capability evidence validator."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_host_capabilities import validate


class ValidateHostCapabilitiesTests(unittest.TestCase):
    def _write(self, directory: Path, name: str, payload: dict) -> Path:
        path = directory / name
        path.write_text(json.dumps(payload), encoding="utf-8")
        return path

    def _registry(self, directory: Path, host_ids: list[str]) -> Path:
        return self._write(directory, "registry.json", {
            "schemaVersion": 1,
            "hosts": [{"id": host_id} for host_id in host_ids],
        })

    def _capabilities(self, directory: Path, hosts: list[dict]) -> Path:
        return self._write(directory, "capabilities.json", {
            "schemaVersion": 2,
            "retrievalDate": "2026-07-31",
            "hosts": hosts,
        })

    def _capability(self, directory: Path, host: dict) -> Path:
        return self._capabilities(directory, [host])

    def _base_host(self, **overrides) -> dict:
        record = {
            "id": "antigravity",
            "docUrl": "https://example.com/antigravity",
            "retrievalDate": "2026-07-31",
            "classification": "PLUGIN_AND_SKILL",
            "evidenceStatus": "PARTIAL",
            "evidenceType": "static-package",
            "evidencePath": "evals/hosts/antigravity/REPORT.md",
            "evidenceNote": "structural package evidence only",
        }
        record.update(overrides)
        return record

    def test_pass_requires_real_host_lifecycle(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capability(
                directory,
                self._base_host(evidenceStatus="PASS", evidenceType="static-package"),
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_valid_partial_static_package(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capability(directory, self._base_host())
            rc = validate(capabilities, registry)
            self.assertEqual(rc, 0)

    def test_valid_partial_runtime_lifecycle(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["chatgpt"])
            capabilities = self._capability(
                directory,
                self._base_host(
                    id="chatgpt",
                    classification="CHATGPT_APP_ADAPTER",
                    evidenceType="runtime-lifecycle",
                ),
            )
            rc = validate(capabilities, registry)
            self.assertEqual(rc, 0)

    def test_runtime_lifecycle_cannot_claim_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["chatgpt"])
            capabilities = self._capability(
                directory,
                self._base_host(
                    id="chatgpt",
                    classification="CHATGPT_APP_ADAPTER",
                    evidenceStatus="PASS",
                    evidenceType="runtime-lifecycle",
                ),
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_duplicate_host_ids_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capabilities(
                directory,
                [self._base_host(), self._base_host()],
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_capability_host_missing_from_registry_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capability(
                directory,
                self._base_host(id="codex"),
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_registry_host_missing_from_capabilities_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity", "codex"])
            capabilities = self._capability(directory, self._base_host())
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_unsupported_classification_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capability(
                directory,
                self._base_host(classification="BOGUS"),
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_missing_official_url_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            host = self._base_host()
            host["docUrl"] = ""
            capabilities = self._capability(directory, host)
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)

    def test_escaping_evidence_path_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            registry = self._registry(directory, ["antigravity"])
            capabilities = self._capability(
                directory,
                self._base_host(evidencePath="../outside.txt"),
            )
            rc = validate(capabilities, registry)
            self.assertNotEqual(rc, 0)


if __name__ == "__main__":
    unittest.main()
