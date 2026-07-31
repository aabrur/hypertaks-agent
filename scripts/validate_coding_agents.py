#!/usr/bin/env python3
"""Validate the Wave 2 coding-agent adapter catalog."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = ROOT / "distribution" / "coding-agents.json"
DEFAULT_REGISTRY = ROOT / "distribution" / "registry.json"
DEFAULT_PACKAGE = ROOT / "package.json"

EXPECTED_HOSTS = {
    "claude-code",
    "codex",
    "cursor",
    "kimi-code",
    "opencode",
    "pi",
    "openclaw",
    "hermes",
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
PASS_EVIDENCE_TYPE = "real-host-lifecycle"
REQUIRED_HOST_FIELDS = {
    "id",
    "displayName",
    "classification",
    "adapterPath",
    "installationMode",
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
    package_path: Path = DEFAULT_PACKAGE,
    root: Path = ROOT,
) -> int:
    errors: list[str] = []

    try:
        catalog = read_json(catalog_path)
        registry = read_json(registry_path)
        package = read_json(package_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Coding-agent validation failed: {exc}", file=sys.stderr)
        return 1

    if catalog.get("schemaVersion") != 1:
        errors.append("coding-agents schemaVersion must be 1")
    if catalog.get("wave") != 2:
        errors.append("coding-agents wave must be 2")
    if catalog.get("canonicalSkills") != EXPECTED_SKILLS:
        errors.append(f"canonicalSkills must be exactly {EXPECTED_SKILLS}")

    hosts = catalog.get("hosts")
    if not isinstance(hosts, list):
        errors.append("coding-agents hosts must be a list")
        hosts = []

    ids = [host.get("id") for host in hosts if isinstance(host, Mapping)]
    if len(ids) != len(set(ids)):
        errors.append("coding-agents contains duplicate host ids")
    if set(ids) != EXPECTED_HOSTS:
        errors.append(
            "coding-agents host ids must match Wave 2 exactly: "
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
            errors.append("coding-agents host entry must be an object")
            continue
        host_id = host.get("id")
        missing = sorted(REQUIRED_HOST_FIELDS - set(host))
        if missing:
            errors.append(f"host {host_id} missing fields: {missing}")

        if host.get("canonicalSkills") != EXPECTED_SKILLS:
            errors.append(f"host {host_id} must reference exactly five canonical skills")

        docs = host.get("officialDocs")
        if not isinstance(docs, list) or not docs or not all(
            isinstance(url, str) and url.startswith("https://") for url in docs
        ):
            errors.append(f"host {host_id} officialDocs must be non-empty HTTPS URLs")

        evidence_status = host.get("evidenceStatus")
        evidence_type = host.get("evidenceType")
        if evidence_status not in ALLOWED_EVIDENCE_STATUSES:
            errors.append(f"host {host_id} has invalid evidenceStatus: {evidence_status}")
        if evidence_type not in ALLOWED_EVIDENCE_TYPES:
            errors.append(f"host {host_id} has invalid evidenceType: {evidence_type}")
        if evidence_status == "PASS" and evidence_type != PASS_EVIDENCE_TYPE:
            errors.append(
                f"host {host_id} PASS requires evidenceType {PASS_EVIDENCE_TYPE}"
            )

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
            if registry_host.get("liveChecklist") != host.get("liveChecklist"):
                errors.append(
                    f"host {host_id} registry liveChecklist must match coding catalog"
                )
            if registry_host.get("wave") != 2:
                errors.append(f"host {host_id} registry wave must be 2")

    pi_config = package.get("pi")
    if not isinstance(pi_config, Mapping):
        errors.append("package.json must declare pi package resources")
    else:
        if pi_config.get("extensions") != [".pi/extensions/hypertaks.ts"]:
            errors.append("package.json pi.extensions must expose Hypertaks extension")
        if pi_config.get("skills") != ["skills/"]:
            errors.append("package.json pi.skills must expose canonical skills")

    opencode_guide = root / ".opencode" / "INSTALL.md"
    if opencode_guide.is_file():
        text = opencode_guide.read_text(encoding="utf-8")
        if "hypertaks@git+" in text:
            errors.append("OpenCode guide must not advertise an unverified npm-style Git plugin spec")
        if ".opencode/skills" not in text or ".agents/skills" not in text:
            errors.append("OpenCode guide must document native skill discovery paths")

    for host_id, guide_path in (
        ("openclaw", root / ".openclaw" / "INSTALL.md"),
        ("hermes", root / ".hermes" / "INSTALL.md"),
    ):
        if guide_path.is_file():
            text = guide_path.read_text(encoding="utf-8")
            for skill in EXPECTED_SKILLS:
                if skill not in text:
                    errors.append(f"{host_id} guide must name canonical skill {skill}")

    if errors:
        print("CODING-AGENT VALIDATION FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Coding-agent validation: PASS")
    return 0


def main() -> int:
    return validate()


if __name__ == "__main__":
    raise SystemExit(main())
