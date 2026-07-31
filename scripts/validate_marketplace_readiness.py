#!/usr/bin/env python3
"""Validate Wave 5 plugin-directory and marketplace package readiness."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Mapping

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "distribution" / "marketplace-readiness.json"


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
