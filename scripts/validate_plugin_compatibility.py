#!/usr/bin/env python3
"""Validate official native plugin compatibility for all registered Hypertaks hosts."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "distribution" / "plugin-compatibility.json"
README = ROOT / "README.md"

EXPECTED_HOSTS = {
    "antigravity", "claude-code", "codex", "cursor", "kimi-code", "opencode",
    "pi", "openclaw", "hermes", "chatgpt", "github-copilot", "windsurf",
    "cline", "roo-code", "kilo-code", "aider", "goose", "openhands",
    "claude-ai", "gemini-app", "open-webui", "librechat",
}
EXPECTED_STATUS = "PASS"
EXPECTED_EVIDENCE = "official-native-compatibility"


def read_json(path: Path) -> Mapping[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, Mapping):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def safe_path(root: Path, relative: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        raise ValueError(f"absolute adapter path is not allowed: {relative}")
    resolved = (root / candidate).resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError(f"adapter path escapes repository root: {relative}")
    return resolved


def validate(catalog_path: Path = CATALOG, readme_path: Path = README, root: Path = ROOT) -> int:
    errors: list[str] = []
    try:
        catalog = read_json(catalog_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Plugin compatibility validation failed: {exc}", file=sys.stderr)
        return 1

    if catalog.get("schemaVersion") != 1:
        errors.append("schemaVersion must be 1")
    if catalog.get("status") != EXPECTED_STATUS:
        errors.append("catalog status must be PASS")
    if catalog.get("certificationModel") != EXPECTED_EVIDENCE:
        errors.append("certificationModel must be official-native-compatibility")

    hosts = catalog.get("hosts")
    if not isinstance(hosts, list):
        errors.append("hosts must be a list")
        hosts = []

    ids = [host.get("id") for host in hosts if isinstance(host, Mapping)]
    if len(ids) != len(set(ids)):
        errors.append("duplicate host ids")
    if set(ids) != EXPECTED_HOSTS:
        errors.append(f"host ids mismatch: actual={sorted(ids)} expected={sorted(EXPECTED_HOSTS)}")
    if catalog.get("totalHosts") != len(EXPECTED_HOSTS):
        errors.append("totalHosts must be 22")
    if catalog.get("passedHosts") != len(EXPECTED_HOSTS):
        errors.append("passedHosts must be 22")

    for host in hosts:
        if not isinstance(host, Mapping):
            errors.append("host entry must be an object")
            continue
        host_id = host.get("id")
        if host.get("compatibilityStatus") != EXPECTED_STATUS:
            errors.append(f"{host_id}: compatibilityStatus must be PASS")
        if host.get("evidenceType") != EXPECTED_EVIDENCE:
            errors.append(f"{host_id}: evidenceType must be official-native-compatibility")
        if host.get("wave") not in {1, 2, 3, 4}:
            errors.append(f"{host_id}: wave must be 1, 2, 3, or 4")
        if host.get("availability") not in {"ACTIVE", "ARCHIVED"}:
            errors.append(f"{host_id}: invalid availability")
        instruction = host.get("installInstruction")
        route = host.get("route")
        plugin_route = (
            isinstance(instruction, str)
            and isinstance(route, str)
            and ("plugin" in instruction.lower() or "plugin" in route.lower())
        )
        if not plugin_route:
            errors.append(f"{host_id}: installInstruction or route must describe the plugin lifecycle")
        sources = host.get("officialSources")
        if not isinstance(sources, list) or not sources or not all(
            isinstance(url, str) and url.startswith("https://") for url in sources
        ):
            errors.append(f"{host_id}: officialSources must contain HTTPS URLs")
        adapter = host.get("adapterPath")
        if not isinstance(adapter, str) or not adapter:
            errors.append(f"{host_id}: adapterPath is required")
        else:
            try:
                path = safe_path(root, adapter)
            except ValueError as exc:
                errors.append(f"{host_id}: {exc}")
            else:
                if not path.is_file():
                    errors.append(f"{host_id}: adapter does not exist: {adapter}")

    roo = next((host for host in hosts if isinstance(host, Mapping) and host.get("id") == "roo-code"), None)
    if not roo or roo.get("availability") != "ARCHIVED":
        errors.append("roo-code must be marked ARCHIVED")

    try:
        readme = readme_path.read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"README cannot be read: {exc}")
    else:
        if "python" in readme.lower():
            errors.append("README must not contain Python installation instructions")
        compatibility_marker = f"{catalog.get('passedHosts')}/{catalog.get('totalHosts')}"
        for marker in (compatibility_marker, "Package status", "Host compatibility"):
            if marker not in readme:
                errors.append(f"README missing marker: {marker}")

    if errors:
        print("PLUGIN COMPATIBILITY VALIDATION FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Plugin compatibility validation: PASS (22/22)")
    return 0


def main() -> int:
    return validate()


if __name__ == "__main__":
    raise SystemExit(main())
