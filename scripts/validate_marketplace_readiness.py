#!/usr/bin/env python3
"""Validate Wave 5 plugin-directory and marketplace package readiness."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Mapping

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "distribution" / "marketplace-readiness.json"
SSOT = ROOT / "marketplace" / "common" / "metadata.json"
MCP_REGISTRY = ROOT / "marketplace" / "mcp-registry" / "server.json"
GEMINI_CLI = ROOT / "gemini-extension.json"


def validate(catalog_path: Path = CATALOG, root: Path = ROOT) -> int:
    errors: list[str] = []
    try:
        data = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Marketplace readiness validation failed: {exc}", file=sys.stderr)
        return 1

    if not isinstance(data, Mapping):
        errors.append("catalog must be an object")
        data = {}

    if data.get("wave") != 5:
        errors.append("wave must be 5")
    if data.get("status") != "PASS":
        errors.append("status must be PASS")

    surfaces = data.get("surfaces")
    if not isinstance(surfaces, list) or not surfaces:
        errors.append("surfaces must be a non-empty list")
        surfaces = []

    for surface in surfaces:
        if not isinstance(surface, Mapping):
            errors.append("surface must be an object")
            continue
        name = surface.get("displayName")
        if surface.get("readinessStatus") != "PASS":
            errors.append(f"{name}: readinessStatus must be PASS")
        path = surface.get("packagePath")
        if not isinstance(path, str) or not (root / path).is_file():
            errors.append(f"{name}: package path missing: {path}")

    # Validate SSOT metadata
    if not SSOT.is_file():
        errors.append("SSOT missing: marketplace/common/metadata.json")
    else:
        try:
            ssot_data = json.loads(SSOT.read_text(encoding="utf-8"))
            if ssot_data.get("publisher") != "Crimson Rift Studio":
                errors.append("SSOT publisher must be Crimson Rift Studio")
            if ssot_data.get("version") != data.get("version"):
                errors.append(f"SSOT version ({ssot_data.get('version')}) out of sync with catalog ({data.get('version')})")
            if ssot_data.get("mcpUrl") != "https://hypertaks.crimsonriftstudio.com/mcp":
                errors.append("SSOT mcpUrl must be https://hypertaks.crimsonriftstudio.com/mcp")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"SSOT invalid: {exc}")

    # Validate official MCP registry manifest
    if not MCP_REGISTRY.is_file():
        errors.append("MCP registry manifest missing: marketplace/mcp-registry/server.json")
    else:
        try:
            mcp_data = json.loads(MCP_REGISTRY.read_text(encoding="utf-8"))
            if mcp_data.get("name") != "com.crimsonriftstudio/hypertaks":
                errors.append("MCP registry name must be com.crimsonriftstudio/hypertaks")
            if mcp_data.get("publisher") != "Crimson Rift Studio":
                errors.append("MCP registry publisher must be Crimson Rift Studio")
            if mcp_data.get("transport") != "streamable-http":
                errors.append("MCP registry transport must be streamable-http")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"MCP registry manifest invalid: {exc}")

    # Validate Gemini CLI extension manifest
    if not GEMINI_CLI.is_file():
        errors.append("Gemini CLI extension manifest missing: gemini-extension.json")
    else:
        try:
            gem_data = json.loads(GEMINI_CLI.read_text(encoding="utf-8"))
            if gem_data.get("publisher") != "Crimson Rift Studio":
                errors.append("Gemini CLI publisher must be Crimson Rift Studio")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"Gemini CLI manifest invalid: {exc}")

    # Validate host metadata directory entries
    marketplace_dir = root / "marketplace"
    if marketplace_dir.is_dir():
        for host_dir in marketplace_dir.iterdir():
            if host_dir.is_dir() and host_dir.name not in ("common", "mcp-registry"):
                meta_file = host_dir / "metadata.json"
                if not meta_file.is_file():
                    errors.append(f"Missing host metadata: {meta_file.relative_to(root)}")
                else:
                    try:
                        h_meta = json.loads(meta_file.read_text(encoding="utf-8"))
                        if h_meta.get("publisher") != "Crimson Rift Studio":
                            errors.append(f"{host_dir.name} metadata publisher must be Crimson Rift Studio")
                        if h_meta.get("version") != data.get("version"):
                            errors.append(f"{host_dir.name} metadata version out of sync")
                    except (OSError, json.JSONDecodeError) as exc:
                        errors.append(f"{host_dir.name} metadata invalid: {exc}")

    if errors:
        print("MARKETPLACE READINESS VALIDATION FAILED:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Marketplace readiness validation: PASS")
    return 0


def main() -> int:
    return validate()


if __name__ == "__main__":
    raise SystemExit(main())
