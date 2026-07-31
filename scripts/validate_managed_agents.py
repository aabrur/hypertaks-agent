#!/usr/bin/env python3
"""Validate the Wave 3 managed-agent adapter catalog."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = ROOT / "distribution" / "managed-agents.json"
DEFAULT_REGISTRY = ROOT / "distribution" / "registry.json"

EXPECTED_HOSTS = {
    "github-copilot",
    "windsurf",
    "cline",
    "roo-code",
    "kilo-code",
    "aider",
    "goose",
    "openhands",
}
EXPECTED_SKILLS = [
    "hypertaks",
    "hypertaks-verify",
    "hypertaks-brain",
    "hypertaks-graph",
    "hypertaks-continuity",
]
ALLOWED_EVIDENCE_STATUSES = {
    "PASS",
    "PARTIAL",
    "FAIL",
    "BLOCKED",
    "NEEDS_ACCOUNT",
    "NEEDS_MANUAL_HOST_TEST",
}
ALLOWED_EVIDENCE_TYPES = {
    "official-documentation",
    "static-package",
    "installer-lifecycle",
    "real-host-lifecycle",
}
REQUIRED_FIELDS = {
    "id",
    "displayName",
    "classification",
    "adapterPath",
    "installationMode",
    "projectSkillRoot",
    "userSkillRoot",
    "discoveryMechanism",
    "invocationMechanism",
    "updateMechanism",
    "uninstallMechanism",
    "officialDocs",
    "canonicalSkills",
    "liveChecklist",
    "evidenceStatus",
    "evidenceType",
    "evidenceNote",
}


def read_json(path: Path) -> Mapping[str, Any]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError(f"{path} must contain a JSON object")
    return raw


def safe_repository_path(root: Path, relative: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        raise ValueError(f"absolute repository path is not allowed: {relative}")
    resolved_root = root.resolve()
    resolved = (root / candidate).resolve()
    if not resolved.is_relative_to(resolved_root):
        raise ValueError(f"repository path escapes root: {relative}")
    return resolved


def validate(
    catalog_path: Path = DEFAULT_CATALOG,
    registry_path: Path = DEFAULT_REGISTRY,
    root: Path = ROOT,
) -> int:
    errors: list[str] = []

    try:
        catalog = read_json(catalog_path)
        registry = read_json(registry_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Managed-agent validation failed: {exc}", file=sys.stderr)
        return 1

    if catalog.get("schemaVersion") != 1:
        errors.append("managed-agents schemaVersion must be 1")
    if catalog.get("wave") != 3:
        errors.append("managed-agents wave must be 3")
    if catalog.get("canonicalSkills") != EXPECTED_SKILLS:
        errors.append(f"canonicalSkills must be exactly {EXPECTED_SKILLS}")

    hosts = catalog.get("hosts")
    if not isinstance(hosts, list):
        errors.append("managed-agents hosts must be a list")
        hosts = []

    ids = [host.get("id") for host in hosts if isinstance(host, Mapping)]
    if len(ids) != len(set(ids)):
        errors.append("managed-agents contains duplicate host ids")
    if set(ids) != EXPECTED_HOSTS:
        errors.append(
            "managed-agents host ids must match Wave 3 exactly: "
            f"actual={sorted(ids)}, expected={sorted(EXPECTED_HOSTS)}"
        )

    registry_hosts = registry.get("hosts")
    if not isinstance(registry_hosts, list):
        errors.append("distribution registry hosts must be a list")
        registry_hosts = []
    registry_by_id = {
        host.get("id"): host
        for host in registry_hosts
        if isinstance(host, Mapping) and isinstance(host.get("id"), str)
    }

    for host in hosts:
        if not isinstance(host, Mapping):
            errors.append("managed-agents host entry must be an object")
            continue
        host_id = host.get("id")
        missing = sorted(REQUIRED_FIELDS - set(host))
        if missing:
            errors.append(f"host {host_id} missing fields: {missing}")

        if host.get("canonicalSkills") != EXPECTED_SKILLS:
            errors.append(f"host {host_id} must reference exactly five canonical skills")

        docs = host.get("officialDocs")
        if not isinstance(docs, list) or not docs or not all(
            isinstance(url, str) and url.startswith("https://") for url in docs
        ):
            errors.append(f"host {host_id} officialDocs must be non-empty HTTPS URLs")

        for field in ("projectSkillRoot", "userSkillRoot"):
            value = host.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"host {host_id} {field} must be a non-empty string")

        evidence_status = host.get("evidenceStatus")
        evidence_type = host.get("evidenceType")
        if evidence_status not in ALLOWED_EVIDENCE_STATUSES:
            errors.append(f"host {host_id} has invalid evidenceStatus: {evidence_status}")
        if evidence_type not in ALLOWED_EVIDENCE_TYPES:
            errors.append(f"host {host_id} has invalid evidenceType: {evidence_type}")
        if evidence_status == "PASS" and evidence_type != "real-host-lifecycle":
            errors.append(f"host {host_id} PASS requires real-host-lifecycle evidence")

        for field in ("adapterPath", "liveChecklist"):
            value = host.get(field)
            if not isinstance(value, str) or not value:
                errors.append(f"host {host_id} {field} must be a non-empty path")
                continue
            try:
                resolved = safe_repository_path(root, value)
            except ValueError as exc:
                errors.append(f"host {host_id} {field}: {exc}")
                continue
            if not resolved.is_file():
                errors.append(f"host {host_id} {field} does not exist: {value}")

        registry_host = registry_by_id.get(host_id)
        if not isinstance(registry_host, Mapping):
            errors.append(f"host {host_id} is missing from distribution registry")
        else:
            if registry_host.get("wave") != 3:
                errors.append(f"host {host_id} registry wave must be 3")
            if registry_host.get("liveChecklist") != host.get("liveChecklist"):
                errors.append(f"host {host_id} registry liveChecklist must match Wave 3 catalog")

    guide_expectations = {
        ".windsurf/INSTALL.md": [".windsurf/skills", "~/.codeium/windsurf/skills", "@hypertaks"],
        ".cline/INSTALL.md": [".cline/skills", "~/.cline/skills", "Enable Skills"],
        ".roo/INSTALL.md": [".roo/skills", "~/.roo/skills", ".agents/skills"],
        ".kilo/INSTALL.md": [".kilo/skills", "~/.kilo/skills", "/reload"],
        ".aider/INSTALL.md": ["--read", ".aider.conf.yml", "no native Agent Skills"],
        ".goose/INSTALL.md": ["skills", "recipe", "PARTIAL"],
        ".openhands/INSTALL.md": [".agents/skills", "microagents", "deprecated"],
        ".github-copilot/INSTALL.md": ["copilot plugin install", "/skills list", ".github/skills"],
    }
    for relative, required_fragments in guide_expectations.items():
        path = root / relative
        if not path.is_file():
            errors.append(f"missing Wave 3 install guide: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        for fragment in required_fragments:
            if fragment not in text:
                errors.append(f"{relative} must contain {fragment!r}")

    copilot_manifest_path = root / ".github-copilot" / "plugin.json"
    if copilot_manifest_path.is_file():
        try:
            copilot_manifest = read_json(copilot_manifest_path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append(f"Copilot plugin manifest is invalid: {exc}")
        else:
            if copilot_manifest.get("name") != "hypertaks":
                errors.append("Copilot plugin name must be hypertaks")
            if copilot_manifest.get("skills") != ["./skills/"]:
                errors.append("Copilot plugin skills must be ['./skills/']")

    if errors:
        print("MANAGED-AGENT VALIDATION FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Managed-agent validation: PASS")
    return 0


def main() -> int:
    return validate()


if __name__ == "__main__":
    raise SystemExit(main())
