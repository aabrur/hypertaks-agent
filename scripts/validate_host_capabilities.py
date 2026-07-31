#!/usr/bin/env python3
"""Validate host capability evidence against the distribution registry."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CAPABILITIES = ROOT / "distribution" / "host-capabilities.json"
DEFAULT_REGISTRY = ROOT / "distribution" / "registry.json"

ALLOWED_EVIDENCE_STATUSES = {
    "PASS",
    "PARTIAL",
    "FAIL",
    "BLOCKED",
    "NOT_SUPPORTED",
    "NEEDS_ACCOUNT",
    "NEEDS_PAID_PLAN",
    "NEEDS_MANUAL_HOST_TEST",
}
ALLOWED_EVIDENCE_TYPES = {
    "official-documentation",
    "static-package",
    "installer-lifecycle",
    "real-host-lifecycle",
}
ALLOWED_CLASSIFICATIONS = {
    "NATIVE_PLUGIN",
    "PLUGIN_AND_SKILL",
    "HOST_EXTENSION",
    "NATIVE_SKILL",
    "CHATGPT_APP_ADAPTER",
    "MANAGED_INSTALL",
    "PROJECT_INSTRUCTIONS",
    "CUSTOM_ASSISTANT",
}
PASS_EVIDENCE_TYPE = "real-host-lifecycle"
REQUIRED_SOURCE_FIELDS = ("docUrl", "retrievalDate")
REQUIRED_CAPABILITY_FIELDS = (
    "classification",
    "evidenceStatus",
    "evidenceType",
    "evidencePath",
)


def read_json(path: Path) -> Mapping[str, Any]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError(f"{path} must contain a JSON object")
    return raw


def validate(capabilities_path: Path, registry_path: Path) -> int:
    errors: list[str] = []

    try:
        capabilities = read_json(capabilities_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Host capabilities validation failed: {exc}", file=sys.stderr)
        return 1
    try:
        registry = read_json(registry_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Host capabilities validation failed: {exc}", file=sys.stderr)
        return 1

    if capabilities.get("schemaVersion") != 2:
        errors.append("host-capabilities schemaVersion must be 2")

    cap_hosts = capabilities.get("hosts")
    if not isinstance(cap_hosts, list):
        errors.append("host-capabilities hosts must be a list")
        cap_hosts = []

    reg_hosts = registry.get("hosts")
    if not isinstance(reg_hosts, list):
        errors.append("distribution registry hosts must be a list")
        reg_hosts = []

    cap_ids = [h.get("id") for h in cap_hosts if isinstance(h, Mapping)]
    reg_ids = [h.get("id") for h in reg_hosts if isinstance(h, Mapping)]

    if len(cap_ids) != len(set(cap_ids)):
        errors.append("host-capabilities contains duplicate host ids")
    if set(cap_ids) != set(reg_ids):
        errors.append(
            "host-capabilities ids must exactly match distribution registry ids: "
            f"capabilities={sorted(cap_ids)}, registry={sorted(reg_ids)}"
        )

    root_resolved = ROOT.resolve()
    for host in cap_hosts:
        if not isinstance(host, Mapping):
            errors.append("host-capabilities entry must be an object")
            continue
        host_id = host.get("id")
        for field in REQUIRED_SOURCE_FIELDS:
            value = host.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"host {host_id} missing required source field: {field}")
        for field in REQUIRED_CAPABILITY_FIELDS:
            if field not in host:
                errors.append(f"host {host_id} missing required capability field: {field}")
        classification = host.get("classification")
        if classification not in ALLOWED_CLASSIFICATIONS:
            errors.append(
                f"host {host_id} has unsupported classification: {classification}"
            )
        evidence_status = host.get("evidenceStatus")
        if evidence_status not in ALLOWED_EVIDENCE_STATUSES:
            errors.append(
                f"host {host_id} has unsupported evidenceStatus: {evidence_status}"
            )
        evidence_type = host.get("evidenceType")
        if evidence_type not in ALLOWED_EVIDENCE_TYPES:
            errors.append(
                f"host {host_id} has unsupported evidenceType: {evidence_type}"
            )
        if evidence_status == "PASS" and evidence_type != PASS_EVIDENCE_TYPE:
            errors.append(
                f"host {host_id} evidenceStatus PASS requires evidenceType "
                f"{PASS_EVIDENCE_TYPE}; only real-host-lifecycle supports a host PASS"
            )
        evidence_path = host.get("evidencePath")
        if isinstance(evidence_path, str) and evidence_path:
            resolved = (ROOT / evidence_path).resolve()
            if not resolved.is_relative_to(root_resolved):
                errors.append(
                    f"host {host_id} evidencePath escapes repository root: {evidence_path}"
                )

    if errors:
        print("Host capabilities validation FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Host capabilities validation: PASS")
    return 0


def main() -> int:
    return validate(DEFAULT_CAPABILITIES, DEFAULT_REGISTRY)


if __name__ == "__main__":
    raise SystemExit(main())
