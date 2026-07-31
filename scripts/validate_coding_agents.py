#!/usr/bin/env python3
"""Validate the Wave 2 coding-agent native compatibility catalog."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "distribution" / "coding-agents.json"
EXPECTED_HOSTS = {"claude-code", "codex", "cursor", "kimi-code", "opencode", "pi", "openclaw", "hermes"}
EXPECTED_SKILLS = ["hypertaks", "hypertaks-verify", "hypertaks-brain", "hypertaks-graph", "hypertaks-continuity"]


def read_json(path: Path) -> Mapping[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, Mapping):
        raise ValueError("catalog must be a JSON object")
    return value


def validate(catalog_path: Path = CATALOG, root: Path = ROOT, **_: Any) -> int:
    errors: list[str] = []
    try:
        catalog = read_json(catalog_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Coding-agent validation failed: {exc}", file=sys.stderr)
        return 1

    if catalog.get("wave") != 2:
        errors.append("wave must be 2")
    if catalog.get("canonicalSkills") != EXPECTED_SKILLS:
        errors.append("canonicalSkills mismatch")
    hosts = catalog.get("hosts")
    if not isinstance(hosts, list):
        errors.append("hosts must be a list")
        hosts = []
    ids = [h.get("id") for h in hosts if isinstance(h, Mapping)]
    if set(ids) != EXPECTED_HOSTS or len(ids) != len(set(ids)):
        errors.append("host ids mismatch")

    for host in hosts:
        if not isinstance(host, Mapping):
            errors.append("host entry must be an object")
            continue
        host_id = host.get("id")
        if host.get("evidenceStatus") != "PASS":
            errors.append(f"{host_id}: evidenceStatus must be PASS")
        if host.get("evidenceType") != "official-native-compatibility":
            errors.append(f"{host_id}: evidenceType must be official-native-compatibility")
        if host.get("canonicalSkills") != EXPECTED_SKILLS:
            errors.append(f"{host_id}: canonicalSkills mismatch")
        instruction = host.get("installInstruction")
        mode = host.get("installationMode")
        if not isinstance(instruction, str) or not isinstance(mode, str) or (
            "plugin" not in instruction.lower() and "plugin" not in mode.lower()
        ):
            errors.append(f"{host_id}: plugin installation route required")
        docs = host.get("officialDocs")
        if not isinstance(docs, list) or not docs:
            errors.append(f"{host_id}: officialDocs required")
        adapter = host.get("adapterPath")
        if not isinstance(adapter, str) or not (root / adapter).is_file():
            errors.append(f"{host_id}: adapter missing: {adapter}")

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
