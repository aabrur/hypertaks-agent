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
    if "antigravity" not in host_ids:
        errors.append("Antigravity host entry is missing")
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
