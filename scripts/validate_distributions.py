#!/usr/bin/env python3
"""Validate the cross-host Hypertaks distribution registry and templates."""

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


def read_json(path: Path) -> Mapping[str, Any]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return raw


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    try:
        registry = read_json(REGISTRY_PATH)
        package = read_json(ROOT / "package.json")
        catalog = read_json(ROOT / ".agents" / "plugins" / "hypertaks.json")
        antigravity = read_json(
            ROOT / "distribution" / "antigravity" / "plugin.json"
        )
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Distribution validation failed: {exc}", file=sys.stderr)
        return 1

    if registry.get("schemaVersion") != 1:
        errors.append("distribution registry schemaVersion must be 1")

    product = registry.get("product")
    if not isinstance(product, Mapping):
        errors.append("distribution registry product must be an object")
        product = {}

    version = product.get("version")
    versions = {
        "distribution/registry.json": version,
        "package.json": package.get("version"),
        ".agents/plugins/hypertaks.json": catalog.get("version"),
    }
    if any(
        not isinstance(value, str) or not re.fullmatch(r"\d+\.\d+\.\d+", value)
        for value in versions.values()
    ):
        errors.append(f"distribution versions must use strict semver: {versions}")
    if len(set(versions.values())) != 1:
        errors.append(f"distribution versions are out of sync: {versions}")

    if product.get("canonicalSkillsRoot") != "skills":
        errors.append("canonicalSkillsRoot must remain skills")
    if product.get("architecture") != "plugin-plus-skills":
        errors.append("product architecture must remain plugin-plus-skills")
    if product.get("mcpPolicy") != "optional-external-capability-only":
        errors.append("MCP policy must remain optional-external-capability-only")

    skills = product.get("canonicalPublicSkills")
    if skills != EXPECTED_SKILLS:
        errors.append(f"canonical public skills must be exactly {EXPECTED_SKILLS}")
    for skill_name in EXPECTED_SKILLS:
        if not (ROOT / "skills" / skill_name / "SKILL.md").is_file():
            errors.append(f"canonical skill missing: skills/{skill_name}/SKILL.md")

    hosts = registry.get("hosts")
    if not isinstance(hosts, list):
        errors.append("distribution registry hosts must be a list")
        hosts = []
    host_ids = [host.get("id") for host in hosts if isinstance(host, Mapping)]
    if len(host_ids) != len(set(host_ids)):
        errors.append("distribution registry contains duplicate host ids")
    supported_agents = catalog.get("supportedAgents")
    if not isinstance(supported_agents, list):
        errors.append(".agents/plugins/hypertaks.json supportedAgents must be a list")
    elif len(supported_agents) != len(set(supported_agents)):
        errors.append(
            ".agents/plugins/hypertaks.json contains duplicate supported agents"
        )
    elif set(supported_agents) != set(host_ids):
        errors.append(
            "catalog supportedAgents and distribution registry hosts differ: "
            f"catalog={sorted(supported_agents)}, registry={sorted(host_ids)}"
        )

    allowed_statuses = {
        "present-needs-live-verification",
        "buildable-needs-live-verification",
        "planned",
    }
    for host in hosts:
        if not isinstance(host, Mapping):
            errors.append("distribution registry host entry must be an object")
            continue
        host_id = host.get("id")
        if host.get("adapterStatus") not in allowed_statuses:
            errors.append(f"host {host_id} has an invalid adapterStatus")
        if not isinstance(host.get("distributionType"), str):
            errors.append(f"host {host_id} has no distributionType")
        for field in (
            "manifest",
            "marketplace",
            "installGuide",
            "adapter",
            "template",
        ):
            relative = host.get(field)
            if relative is not None and (
                not isinstance(relative, str) or not (ROOT / relative).is_file()
            ):
                errors.append(f"host {host_id} references a missing {field}: {relative}")
    if "antigravity" not in host_ids:
        errors.append("Antigravity host entry is missing")
    if "chatgpt" not in host_ids:
        errors.append("ChatGPT host entry is missing")
    if "gemini-cli" in host_ids:
        errors.append("Gemini CLI must not remain an active host target")

    antigravity_host = next(
        (
            host
            for host in hosts
            if isinstance(host, Mapping) and host.get("id") == "antigravity"
        ),
        None,
    )
    if not isinstance(antigravity_host, Mapping):
        errors.append("Antigravity host entry is invalid")
    else:
        components = antigravity_host.get("bundledComponents")
        if not isinstance(components, Mapping):
            errors.append("Antigravity bundledComponents must be an object")
        else:
            if components.get("skills") is not True:
                errors.append("Antigravity package must bundle canonical skills")
            if components.get("mcpServers") is not False:
                errors.append(
                    "Antigravity package must not bundle MCP servers by default"
                )
            if components.get("hooks") is not False:
                errors.append("Antigravity package must not bundle hooks by default")

    if antigravity != {"name": "hypertaks"}:
        errors.append(
            "Antigravity plugin.json must be the minimal documented manifest"
        )

    chatgpt_host = next(
        (
            host
            for host in hosts
            if isinstance(host, Mapping) and host.get("id") == "chatgpt"
        ),
        None,
    )
    if not isinstance(chatgpt_host, Mapping):
        errors.append("ChatGPT host entry is invalid")
    else:
        expected_chatgpt_files = {
            "manifest": ".chatgpt/plugin.json",
            "installGuide": ".chatgpt/INSTALL.md",
            "runtime": "runtime/chatgpt-mcp-server.mjs",
            "runtimeTest": "runtime/chatgpt-mcp-server.test.cjs",
        }
        for field, expected in expected_chatgpt_files.items():
            if chatgpt_host.get(field) != expected:
                errors.append(
                    f"ChatGPT {field} must reference {expected}: "
                    f"{chatgpt_host.get(field)}"
                )
            elif not (ROOT / expected).is_file():
                errors.append(f"ChatGPT {field} is missing: {expected}")
        if chatgpt_host.get("testCommand") != "npm run test:chatgpt":
            errors.append("ChatGPT testCommand must be npm run test:chatgpt")
        components = chatgpt_host.get("bundledComponents")
        if not isinstance(components, Mapping):
            errors.append("ChatGPT bundledComponents must be an object")
        else:
            if components.get("canonicalSkills") is not True:
                errors.append("ChatGPT adapter must preserve canonical skills")
            if components.get("mcpTransport") is not True:
                errors.append("ChatGPT adapter must declare MCP as host transport")
            if components.get("writeTools") is not False:
                errors.append("ChatGPT Wave 1 adapter must expose no write tools")

    try:
        chatgpt_manifest = read_json(ROOT / ".chatgpt" / "plugin.json")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f"ChatGPT manifest is invalid: {exc}")
        chatgpt_manifest = {}
    if chatgpt_manifest.get("canonicalSkills") != EXPECTED_SKILLS:
        errors.append("ChatGPT manifest must declare exactly five canonical skills")
    if chatgpt_manifest.get("transport") != "streamable-http":
        errors.append("ChatGPT manifest must declare MCP Streamable HTTP transport")
    if chatgpt_manifest.get("readOnlyByDefault") is not True:
        errors.append("ChatGPT Wave 1 runtime must be read-only by default")
    if chatgpt_manifest.get("writeToolsExposed") is not False:
        errors.append("ChatGPT Wave 1 runtime must expose no write actions")
    exposed_tools = chatgpt_manifest.get("tools")
    expected_tools = [
        "hypertaks_manifest",
        "hypertaks_get_skill",
        "hypertaks_route",
        "hypertaks_verify_installation",
    ]
    if exposed_tools != expected_tools:
        errors.append(f"ChatGPT exposed tools must be exactly {expected_tools}")

    brand = product.get("brand")
    if not isinstance(brand, Mapping):
        errors.append("product.brand must be an object")
    else:
        canonical_svg = brand.get("canonicalSvg")
        if canonical_svg is None:
            warnings.append(
                "canonical Hypertaks SVG is not yet bound to a tracked repository path"
            )
        elif not isinstance(canonical_svg, str) or not canonical_svg.strip():
            errors.append("product.brand.canonicalSvg must be null or a non-empty path")
        else:
            logo_path = ROOT / canonical_svg
            if not logo_path.is_file() or logo_path.suffix.lower() != ".svg":
                errors.append(f"canonical SVG does not exist: {canonical_svg}")

    if not (ROOT / "scripts" / "build_distributions.py").is_file():
        errors.append("scripts/build_distributions.py is missing")

    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        print("DISTRIBUTION VALIDATION FAILED:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print("Distribution validation: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
