#!/usr/bin/env python3
"""Build host-native Hypertaks packages from the canonical skill directories."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path
from typing import Any, Mapping, Sequence

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "distribution" / "registry.json"
ANTIGRAVITY_TEMPLATE = ROOT / "distribution" / "antigravity" / "plugin.json"
DEFAULT_OUTPUT_ROOT = ROOT / "dist"


def load_registry(path: Path = REGISTRY_PATH) -> Mapping[str, Any]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError("distribution registry must be a JSON object")
    product = raw.get("product")
    if not isinstance(product, Mapping):
        raise ValueError("distribution registry product must be an object")
    skills = product.get("canonicalPublicSkills")
    if not isinstance(skills, list) or len(skills) != 5:
        raise ValueError("distribution registry must declare exactly five public skills")
    if len(set(str(item) for item in skills)) != len(skills):
        raise ValueError("canonical public skill names must be unique")
    return raw


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_manifest(root: Path) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for path in sorted(
        item
        for item in root.rglob("*")
        if item.is_file() and item.name != "BUILD-MANIFEST.json"
    ):
        records.append(
            {
                "path": path.relative_to(root).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
        )
    return records


def replace_directory(source: Path, target: Path) -> None:
    target_parent = target.parent.resolve()
    resolved_target = target.resolve(strict=False)
    if resolved_target == target_parent or target_parent not in resolved_target.parents:
        raise ValueError(f"unsafe distribution target: {target}")
    if target.exists():
        shutil.rmtree(target)
    source.replace(target)


def build_antigravity(output_root: Path = DEFAULT_OUTPUT_ROOT) -> Path:
    registry = load_registry()
    product = registry["product"]
    canonical_root = ROOT / str(product["canonicalSkillsRoot"])
    public_skills = [str(item) for item in product["canonicalPublicSkills"]]

    for skill_name in public_skills:
        skill_root = canonical_root / skill_name
        if not (skill_root / "SKILL.md").is_file():
            raise FileNotFoundError(f"canonical skill missing SKILL.md: {skill_root}")
    if not ANTIGRAVITY_TEMPLATE.is_file():
        raise FileNotFoundError(
            f"Antigravity plugin template missing: {ANTIGRAVITY_TEMPLATE}"
        )

    output_root = output_root.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    target = output_root / "antigravity" / "hypertaks"
    target.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(
        prefix="hypertaks-antigravity-", dir=target.parent
    ) as temp_dir:
        staging = Path(temp_dir) / "hypertaks"
        staging.mkdir(parents=True)
        shutil.copy2(ANTIGRAVITY_TEMPLATE, staging / "plugin.json")

        skills_output = staging / "skills"
        skills_output.mkdir()
        for skill_name in public_skills:
            shutil.copytree(canonical_root / skill_name, skills_output / skill_name)

        brand = product.get("brand")
        logo_record: dict[str, object] = {"included": False, "source": None}
        if isinstance(brand, Mapping):
            source_value = brand.get("canonicalSvg")
            if source_value is not None:
                if not isinstance(source_value, str) or not source_value.strip():
                    raise ValueError(
                        "product.brand.canonicalSvg must be null or a non-empty path"
                    )
                source_logo = ROOT / source_value
                if not source_logo.is_file() or source_logo.suffix.lower() != ".svg":
                    raise FileNotFoundError(
                        f"canonical SVG missing or invalid: {source_logo}"
                    )
                assets_output = staging / "assets"
                assets_output.mkdir()
                destination = assets_output / "hypertaks.svg"
                shutil.copy2(source_logo, destination)
                logo_record = {
                    "included": True,
                    "source": source_logo.relative_to(ROOT).as_posix(),
                    "output": destination.relative_to(staging).as_posix(),
                    "sha256": sha256(destination),
                }

        manifest = {
            "schemaVersion": 1,
            "product": str(product["id"]),
            "version": str(product["version"]),
            "host": "antigravity",
            "canonicalSkills": public_skills,
            "mcpBundled": False,
            "hooksBundled": False,
            "brand": logo_record,
        }
        manifest_path = staging / "BUILD-MANIFEST.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )
        manifest["files"] = file_manifest(staging)
        manifest_path.write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )

        replace_directory(staging, target)

    return target


def validate_antigravity_package(package_root: Path) -> None:
    plugin = json.loads((package_root / "plugin.json").read_text(encoding="utf-8"))
    if plugin != {"name": "hypertaks"}:
        raise ValueError(
            "Antigravity plugin.json must remain the minimal documented manifest"
        )
    manifest = json.loads(
        (package_root / "BUILD-MANIFEST.json").read_text(encoding="utf-8")
    )
    skills = manifest.get("canonicalSkills")
    expected_skills = [
        "hypertaks",
        "hypertaks-verify",
        "hypertaks-brain",
        "hypertaks-graph",
        "hypertaks-continuity",
    ]
    if skills != expected_skills:
        raise ValueError(
            "generated Antigravity package does not contain the exact canonical skill set"
        )
    for skill_name in skills:
        if not (package_root / "skills" / str(skill_name) / "SKILL.md").is_file():
            raise FileNotFoundError(f"generated skill missing SKILL.md: {skill_name}")
    if (package_root / "mcp_config.json").exists():
        raise ValueError("Antigravity package must not bundle an MCP server by default")
    if (package_root / "hooks.json").exists():
        raise ValueError("Antigravity package must not bundle hooks by default")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("host", choices=("antigravity",))
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--check-only", action="store_true")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    if args.check_only:
        with tempfile.TemporaryDirectory(
            prefix="hypertaks-distribution-check-"
        ) as temp_dir:
            package = build_antigravity(Path(temp_dir))
            validate_antigravity_package(package)
            print("Antigravity distribution check: PASS")
        return 0
    package = build_antigravity(args.output_root)
    validate_antigravity_package(package)
    print(package)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
