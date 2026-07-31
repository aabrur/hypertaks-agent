#!/usr/bin/env python3
"""Validate the plugin-first Wave 3 managed-agent catalog."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = ROOT / "distribution" / "managed-agents.json"
DEFAULT_REGISTRY = ROOT / "distribution" / "registry.json"
DEFAULT_PACKAGE = ROOT / "package.json"

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
EXPECTED_PLUGIN_SUPPORT = {
    "github-copilot": "SUPPORTED",
    "windsurf": "UNAVAILABLE",
    "cline": "SUPPORTED_CLI_SDK",
    "roo-code": "UNAVAILABLE",
    "kilo-code": "SUPPORTED_LOCAL_UNPUBLISHED",
    "aider": "UNAVAILABLE",
    "goose": "UNAVAILABLE",
    "openhands": "SUPPORTED",
}
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
ALLOWED_PLUGIN_SUPPORT = set(EXPECTED_PLUGIN_SUPPORT.values())
REQUIRED_FIELDS = {
    "id",
    "displayName",
    "classification",
    "adapterPath",
    "installationMode",
    "pluginSupport",
    "pluginInstallCommand",
    "slashInstallCommand",
    "fallbackInstallation",
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
FORBIDDEN_INSTALL_TEXT = "python scripts/installer.py"


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

        plugin_support = host.get("pluginSupport")
        if plugin_support not in ALLOWED_PLUGIN_SUPPORT:
            errors.append(f"host {host_id} has invalid pluginSupport: {plugin_support}")
        elif EXPECTED_PLUGIN_SUPPORT.get(host_id) != plugin_support:
            errors.append(
                f"host {host_id} pluginSupport must be {EXPECTED_PLUGIN_SUPPORT.get(host_id)}"
            )

        plugin_command = host.get("pluginInstallCommand")
        slash_command = host.get("slashInstallCommand")
        for field, command in (
            ("pluginInstallCommand", plugin_command),
            ("slashInstallCommand", slash_command),
        ):
            if command is not None and not isinstance(command, str):
                errors.append(f"host {host_id} {field} must be a string or null")
            if isinstance(command, str):
                lowered = command.lower()
                if "plugin" not in lowered:
                    errors.append(f"host {host_id} {field} must be a plugin command")
                if FORBIDDEN_INSTALL_TEXT in lowered:
                    errors.append(f"host {host_id} {field} must not use the Python installer")

        if plugin_support == "SUPPORTED" and not (plugin_command or slash_command):
            errors.append(f"host {host_id} supported plugin lifecycle needs an install command")
        if plugin_support == "UNAVAILABLE" and (plugin_command or slash_command):
            errors.append(f"host {host_id} must not invent a plugin command")

        fallback = host.get("fallbackInstallation")
        if not isinstance(fallback, str) or not fallback.strip():
            errors.append(f"host {host_id} fallbackInstallation must be non-empty")
        elif FORBIDDEN_INSTALL_TEXT in fallback.lower():
            errors.append(f"host {host_id} fallbackInstallation must not use Python installer")

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
        ".github-copilot/INSTALL.md": [
            "copilot plugin install aabrur/hypertaks-agent",
            "/plugin install aabrur/hypertaks-agent",
            "/skills list",
        ],
        ".cline/INSTALL.md": [
            "cline plugin install --git",
            "plugins/cline/hypertaks.ts",
            "/hypertaks",
        ],
        ".kilo/INSTALL.md": [
            "plugins/kilo/hypertaks.ts",
            "plugin",
            "npm package has actually been published",
        ],
        ".openhands/INSTALL.md": [
            "/plugin install github:aabrur/hypertaks-agent",
            "/plugin uninstall hypertaks",
            ".plugin/plugin.json",
        ],
        ".windsurf/INSTALL.md": [
            "does not expose a custom `/plugin install`",
            "Customizations",
            "@hypertaks",
        ],
        ".roo/INSTALL.md": [
            "does not expose a documented custom `/plugin install`",
            ".roo/skills",
            ".agents/skills",
        ],
        ".aider/INSTALL.md": [
            "no native Agent Skills plugin loader",
            "--read",
            ".aider.conf.yml",
        ],
        ".goose/INSTALL.md": [
            "Skills Marketplace",
            "recipe",
            "does not expose",
        ],
    }
    for relative, required_fragments in guide_expectations.items():
        path = root / relative
        if not path.is_file():
            errors.append(f"missing Wave 3 install guide: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        if FORBIDDEN_INSTALL_TEXT in text.lower():
            errors.append(f"{relative} must not recommend the Python installer")
        for fragment in required_fragments:
            if fragment not in text:
                errors.append(f"{relative} must contain {fragment!r}")

    open_plugin_path = root / ".plugin" / "plugin.json"
    if not open_plugin_path.is_file():
        errors.append("missing universal .plugin/plugin.json")
    else:
        try:
            open_plugin = read_json(open_plugin_path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append(f"Open Plugin manifest is invalid: {exc}")
        else:
            if open_plugin.get("name") != "hypertaks":
                errors.append("Open Plugin manifest name must be hypertaks")

    cline_config = package.get("cline")
    expected_cline = {
        "plugins": [
            {
                "paths": ["./plugins/cline/hypertaks.ts"],
                "capabilities": ["rules", "commands"],
            }
        ]
    }
    if cline_config != expected_cline:
        errors.append("package.json must expose the exact Cline Hypertaks plugin entrypoint")

    cline_plugin_path = root / "plugins" / "cline" / "hypertaks.ts"
    if cline_plugin_path.is_file():
        cline_text = cline_plugin_path.read_text(encoding="utf-8")
        for fragment in ("registerRule", "registerCommand", 'name: "hypertaks"'):
            if fragment not in cline_text:
                errors.append(f"Cline plugin must contain {fragment!r}")
    else:
        errors.append("missing executable Cline plugin")

    kilo_plugin_path = root / "plugins" / "kilo" / "hypertaks.ts"
    if kilo_plugin_path.is_file():
        kilo_text = kilo_plugin_path.read_text(encoding="utf-8")
        for fragment in ("experimental.chat.system.transform", 'id: "hypertaks"'):
            if fragment not in kilo_text:
                errors.append(f"Kilo plugin must contain {fragment!r}")
    else:
        errors.append("missing Kilo plugin module")

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
