#!/usr/bin/env python3
"""Validate the Hypertaks distribution registry and tracked plugin adapters."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "distribution" / "registry.json"
EXPECTED_SKILLS = [
    "hypertaks",
    "hypertaks-verify",
    "hypertaks-brain",
    "hypertaks-graph",
    "hypertaks-continuity",
]
EXPECTED_HOST_COUNT = 22
EXPECTED_ADAPTER_STATUS = "native-compatibility-pass"


def read_json(path: Path) -> Mapping[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, Mapping):
        raise ValueError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return value


def safe_repository_path(relative: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        raise ValueError(f"absolute repository path is not allowed: {relative}")
    resolved = (ROOT / candidate).resolve()
    if not resolved.is_relative_to(ROOT.resolve()):
        raise ValueError(f"repository path escapes root: {relative}")
    return resolved


def main() -> int:
    errors: list[str] = []
    try:
        registry = read_json(REGISTRY_PATH)
        package = read_json(ROOT / "package.json")
        catalog = read_json(ROOT / ".agents" / "plugins" / "hypertaks.json")
        compatibility = read_json(ROOT / "distribution" / "plugin-compatibility.json")
        antigravity = read_json(ROOT / "distribution" / "antigravity" / "plugin.json")
        chatgpt_manifest = read_json(ROOT / ".chatgpt" / "plugin.json")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Distribution validation failed: {exc}", file=sys.stderr)
        return 1

    if registry.get("schemaVersion") != 1:
        errors.append("distribution registry schemaVersion must be 1")

    product = registry.get("product")
    if not isinstance(product, Mapping):
        errors.append("distribution registry product must be an object")
        product = {}

    versions = {
        "registry": product.get("version"),
        "package": package.get("version"),
        "catalog": catalog.get("version"),
        "compatibility": compatibility.get("version"),
    }
    if any(not isinstance(value, str) or not re.fullmatch(r"\d+\.\d+\.\d+", value) for value in versions.values()):
        errors.append(f"distribution versions must use strict semver: {versions}")
    if len(set(versions.values())) != 1:
        errors.append(f"distribution versions are out of sync: {versions}")

    if product.get("canonicalSkillsRoot") != "skills":
        errors.append("canonicalSkillsRoot must remain skills")
    if product.get("canonicalPublicSkills") != EXPECTED_SKILLS:
        errors.append(f"canonical public skills must be exactly {EXPECTED_SKILLS}")
    if product.get("architecture") != "plugin-plus-skills":
        errors.append("product architecture must remain plugin-plus-skills")
    if product.get("mcpPolicy") != "optional-external-capability-only":
        errors.append("MCP policy must remain optional-external-capability-only")
    if product.get("nativeCompatibilityStatus") != "PASS":
        errors.append("product nativeCompatibilityStatus must be PASS")
    if product.get("nativeCompatibleHosts") != EXPECTED_HOST_COUNT:
        errors.append("product nativeCompatibleHosts must be 22")

    for skill_name in EXPECTED_SKILLS:
        if not (ROOT / "skills" / skill_name / "SKILL.md").is_file():
            errors.append(f"canonical skill missing: skills/{skill_name}/SKILL.md")

    hosts = registry.get("hosts")
    if not isinstance(hosts, list):
        errors.append("distribution registry hosts must be a list")
        hosts = []
    host_ids = [host.get("id") for host in hosts if isinstance(host, Mapping)]
    if len(host_ids) != EXPECTED_HOST_COUNT or len(host_ids) != len(set(host_ids)):
        errors.append("distribution registry must contain exactly 22 unique hosts")

    supported_agents = catalog.get("supportedAgents")
    if not isinstance(supported_agents, list) or set(supported_agents) != set(host_ids):
        errors.append("catalog supportedAgents must match distribution registry hosts")

    compatibility_hosts = compatibility.get("hosts")
    compatibility_ids = {
        host.get("id")
        for host in compatibility_hosts
        if isinstance(compatibility_hosts, list) and isinstance(host, Mapping)
    }
    if compatibility.get("status") != "PASS" or compatibility.get("passedHosts") != EXPECTED_HOST_COUNT:
        errors.append("plugin compatibility catalog must report PASS for 22 hosts")
    if compatibility_ids != set(host_ids):
        errors.append("plugin compatibility catalog host ids must match registry")

    for host in hosts:
        if not isinstance(host, Mapping):
            errors.append("distribution registry host entry must be an object")
            continue
        host_id = host.get("id")
        if host.get("adapterStatus") != EXPECTED_ADAPTER_STATUS:
            errors.append(f"host {host_id} adapterStatus must be {EXPECTED_ADAPTER_STATUS}")
        if host.get("compatibilityStatus") != "PASS":
            errors.append(f"host {host_id} compatibilityStatus must be PASS")
        if not isinstance(host.get("distributionType"), str):
            errors.append(f"host {host_id} has no distributionType")
        if host.get("compatibilityCatalog") != "distribution/plugin-compatibility.json":
            errors.append(f"host {host_id} must reference the unified compatibility catalog")
        for field in ("manifest", "marketplace", "installGuide", "adapter", "template"):
            relative = host.get(field)
            if relative is None:
                continue
            if not isinstance(relative, str):
                errors.append(f"host {host_id} has invalid {field}")
                continue
            try:
                resolved = safe_repository_path(relative)
            except ValueError as exc:
                errors.append(f"host {host_id} {field}: {exc}")
                continue
            if not resolved.is_file():
                errors.append(f"host {host_id} references a missing {field}: {relative}")

    if "antigravity" not in host_ids or "chatgpt" not in host_ids:
        errors.append("Antigravity and ChatGPT host entries are required")
    if "gemini-cli" in host_ids:
        errors.append("Gemini CLI must not be an active host target")

    antigravity_host = next((h for h in hosts if isinstance(h, Mapping) and h.get("id") == "antigravity"), {})
    components = antigravity_host.get("bundledComponents") if isinstance(antigravity_host, Mapping) else None
    if not isinstance(components, Mapping) or components.get("skills") is not True or components.get("mcpServers") is not False or components.get("hooks") is not False:
        errors.append("Antigravity bundled components must preserve skills and exclude MCP servers and hooks")
    if antigravity != {"name": "hypertaks"}:
        errors.append("Antigravity plugin.json must remain the minimal documented manifest")

    chatgpt_host = next((h for h in hosts if isinstance(h, Mapping) and h.get("id") == "chatgpt"), {})
    expected_chatgpt_files = {
        "manifest": ".chatgpt/plugin.json",
        "installGuide": ".chatgpt/INSTALL.md",
        "runtime": "runtime/chatgpt-mcp-server.mjs",
        "runtimeTest": "runtime/chatgpt-mcp-server.test.cjs",
    }
    for field, expected in expected_chatgpt_files.items():
        if chatgpt_host.get(field) != expected or not (ROOT / expected).is_file():
            errors.append(f"ChatGPT {field} must reference existing {expected}")
    if chatgpt_host.get("testCommand") != "npm run test:chatgpt":
        errors.append("ChatGPT testCommand must be npm run test:chatgpt")
    if chatgpt_manifest.get("canonicalSkills") != EXPECTED_SKILLS:
        errors.append("ChatGPT manifest must declare exactly five canonical skills")
    if chatgpt_manifest.get("transport") != "streamable-http":
        errors.append("ChatGPT manifest must declare streamable-http transport")
    if chatgpt_manifest.get("readOnlyByDefault") is not True or chatgpt_manifest.get("writeToolsExposed") is not False:
        errors.append("ChatGPT adapter must remain read-only")

    brand = product.get("brand")
    canonical_svg = brand.get("canonicalSvg") if isinstance(brand, Mapping) else None
    if not isinstance(canonical_svg, str) or not (ROOT / canonical_svg).is_file() or Path(canonical_svg).suffix.lower() != ".svg":
        errors.append("canonical Hypertaks SVG must reference an existing SVG file")

    if errors:
        print("DISTRIBUTION VALIDATION FAILED:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print("Distribution validation: PASS (22/22 native compatibility)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
