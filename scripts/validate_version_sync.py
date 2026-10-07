#!/usr/bin/env python3
"""Validate synchronization of the current product version across all manifests, adapters, registries, and docs."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Mapping

ROOT = Path(__file__).resolve().parent.parent


def read_json(path: Path) -> Mapping[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def get_expected_version() -> str:
    package = read_json(ROOT / "package.json")
    version = package.get("version")
    if not isinstance(version, str) or not re.fullmatch(r"\d+\.\d+\.\d+(\.\d+\.\d+)?", version):
        raise ValueError(f"Invalid package.json version: {version}")
    return version


def validate_version_sync() -> int:
    errors: list[str] = []
    try:
        version = get_expected_version()
    except Exception as exc:
        print(f"VERSION SYNC VALIDATION FAILED: {exc}", file=sys.stderr)
        return 1

    # 1. plugin.yaml
    plugin_yaml = ROOT / "plugin.yaml"
    if not plugin_yaml.is_file():
        errors.append("Missing plugin.yaml")
    else:
        text = plugin_yaml.read_text(encoding="utf-8")
        match = re.search(r'^version:\s*["\']?([^"\'\s]+)["\']?', text, re.MULTILINE)
        if not match or match.group(1) != version:
            errors.append(f"plugin.yaml version ({match.group(1) if match else 'None'}) != {version}")

    # 2. .agents/plugins/hypertaks.json
    agent_plugin = ROOT / ".agents" / "plugins" / "hypertaks.json"
    if agent_plugin.is_file():
        data = read_json(agent_plugin)
        if data.get("version") != version:
            errors.append(f".agents/plugins/hypertaks.json version ({data.get('version')}) != {version}")

    # 3. distribution/*.json
    dist_files = [
        ROOT / "distribution" / "registry.json",
        ROOT / "distribution" / "plugin-compatibility.json",
        ROOT / "distribution" / "chat-selfhosted-agents.json",
        ROOT / "distribution" / "coding-agents.json",
        ROOT / "distribution" / "managed-agents.json",
        ROOT / "distribution" / "marketplace-readiness.json",
        ROOT / "distribution" / "mcp-registry.json",
    ]
    for dist_file in dist_files:
        if dist_file.is_file():
            data = read_json(dist_file)
            if dist_file.name == "registry.json":
                v = data.get("product", {}).get("version")
            else:
                v = data.get("version")
            if v != version:
                errors.append(f"{dist_file.relative_to(ROOT)} version ({v}) != {version}")

    # 4. gemini-extension.json
    gemini_ext = ROOT / "gemini-extension.json"
    if gemini_ext.is_file():
        data = read_json(gemini_ext)
        if data.get("version") != version:
            errors.append(f"gemini-extension.json version ({data.get('version')}) != {version}")

    # 5. adapter plugin.json files
    for p in sorted(ROOT.glob(".*/plugin.json")):
        data = read_json(p)
        if data.get("version") != version:
            errors.append(f"{p.relative_to(ROOT)} version ({data.get('version')}) != {version}")

    # 6. marketplace manifests
    marketplace_common = ROOT / "marketplace" / "common" / "metadata.json"
    if marketplace_common.is_file():
        data = read_json(marketplace_common)
        if data.get("version") != version:
            errors.append(f"marketplace/common/metadata.json version ({data.get('version')}) != {version}")

    for p in sorted(ROOT.glob("marketplace/*/metadata.json")):
        data = read_json(p)
        if data.get("version") != version:
            errors.append(f"{p.relative_to(ROOT)} version ({data.get('version')}) != {version}")

    # 7. runtime/mcp-server.mjs
    mcp_server = ROOT / "runtime" / "mcp-server.mjs"
    if mcp_server.is_file():
        text = mcp_server.read_text(encoding="utf-8")
        match = re.search(r'const\s+PRODUCT_VERSION\s*=\s*["\']([^"\']+)["\'];', text)
        if not match or match.group(1) != version:
            errors.append(f"runtime/mcp-server.mjs PRODUCT_VERSION ({match.group(1) if match else 'None'}) != {version}")

    # 8. docs/hypertaks-skill-card.md
    skill_card = ROOT / "docs" / "hypertaks-skill-card.md"
    if skill_card.is_file():
        text = skill_card.read_text(encoding="utf-8")
        match = re.search(r'\*\*Version:\*\*\s*([0-9.]+)', text)
        if not match or match.group(1) != version:
            errors.append(f"docs/hypertaks-skill-card.md version ({match.group(1) if match else 'None'}) != {version}")

    # 9. README.md release badge
    readme = ROOT / "README.md"
    if readme.is_file():
        text = readme.read_text(encoding="utf-8")
        badge_match = re.search(r'badge/release-v([0-9.]+)', text)
        if not badge_match or badge_match.group(1) != version:
            errors.append(f"README.md release badge ({badge_match.group(1) if badge_match else 'None'}) != v{version}")

    # 10. CHANGELOG.md current release heading
    changelog = ROOT / "CHANGELOG.md"
    if changelog.is_file():
        text = changelog.read_text(encoding="utf-8")
        if f"## [{version}]" not in text:
            errors.append(f"CHANGELOG.md missing current release section: ## [{version}]")

    # 11. docs/RELEASE-NOTES.md current release heading
    rel_notes = ROOT / "docs" / "RELEASE-NOTES.md"
    if rel_notes.is_file():
        text = rel_notes.read_text(encoding="utf-8")
        if f"## v{version}" not in text:
            errors.append(f"docs/RELEASE-NOTES.md missing current release section: ## v{version}")

    # 12. Invariant: Exact public MCP tool count = 4
    if mcp_server.is_file():
        text = mcp_server.read_text(encoding="utf-8")
        tools_match = re.findall(r'name:\s*["\'](hypertaks_[a-z0-9_]+)["\']', text)
        unique_tools = sorted(set(tools_match))
        if len(unique_tools) != 4:
            errors.append(f"MCP server declares {len(unique_tools)} tools (expected exactly 4): {unique_tools}")

    # 13. Invariant: Exact canonical public skill count = 5
    from validate_public_skills import EXPECTED as EXPECTED_SKILLS
    if len(EXPECTED_SKILLS) != 5:
        errors.append(f"Canonical public skills count is {len(EXPECTED_SKILLS)} (expected exactly 5)")

    if errors:
        print("VERSION SYNC VALIDATION FAILED:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print(f"Version synchronization OK: all surfaces synchronized on v{version} (4 tools, 5 public skills)")
    return 0


if __name__ == "__main__":
    sys.exit(validate_version_sync())
