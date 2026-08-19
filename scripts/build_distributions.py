#!/usr/bin/env python3
"""Build host-native Hypertaks packages from canonical, Git-tracked skills."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import zipfile
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


def git_tracked_files() -> set[str]:
    result = subprocess.run(
        [
            "git",
            "-c",
            f"safe.directory={ROOT}",
            "-C",
            str(ROOT),
            "ls-files",
            "-z",
        ],
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(
            "distribution builds require a canonical Git checkout"
            + (f": {message}" if message else "")
        )
    return {
        item.decode("utf-8")
        for item in result.stdout.split(b"\0")
        if item
    }


def require_tracked_file(path: Path, tracked: set[str]) -> str:
    repository_root = ROOT.resolve()
    resolved = path.resolve()
    if resolved != repository_root and repository_root not in resolved.parents:
        raise ValueError(f"distribution source escapes the repository: {path}")
    try:
        relative = path.relative_to(ROOT).as_posix()
    except ValueError as exc:
        raise ValueError(f"distribution source is outside the repository: {path}") from exc
    if relative not in tracked:
        raise ValueError(f"distribution source is not Git-tracked: {relative}")
    if path.is_symlink():
        raise ValueError(f"distribution source must not be a symlink: {relative}")
    if not path.is_file():
        raise FileNotFoundError(f"distribution source is missing: {relative}")
    return relative


def copy_tracked_tree(source_root: Path, destination_root: Path, tracked: set[str]) -> None:
    repository_root = ROOT.resolve()
    source_root_resolved = source_root.resolve()
    if source_root_resolved != repository_root and repository_root not in source_root_resolved.parents:
        raise ValueError(f"canonical source tree escapes the repository: {source_root}")
    relative_root = source_root.relative_to(ROOT).as_posix()
    prefix = relative_root + "/"
    selected = sorted(item for item in tracked if item.startswith(prefix))
    if not selected:
        raise ValueError(f"canonical source tree contains no tracked files: {relative_root}")

    for relative in selected:
        source = ROOT / relative
        if source.is_symlink():
            raise ValueError(f"tracked distribution source must not be a symlink: {relative}")
        if not source.is_file():
            raise FileNotFoundError(f"tracked distribution source is missing: {relative}")
        resolved = source.resolve()
        if resolved != source_root_resolved and source_root_resolved not in resolved.parents:
            raise ValueError(f"tracked distribution source escapes its root: {relative}")
        destination = destination_root / source.relative_to(source_root)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


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
    if target.is_symlink():
        raise ValueError(f"distribution target must not be a symlink: {target}")
    if target.exists():
        shutil.rmtree(target)
    source.replace(target)


def build_antigravity(output_root: Path = DEFAULT_OUTPUT_ROOT) -> Path:
    registry = load_registry()
    product = registry["product"]
    canonical_root = ROOT / str(product["canonicalSkillsRoot"])
    public_skills = [str(item) for item in product["canonicalPublicSkills"]]
    tracked = git_tracked_files()

    for skill_name in public_skills:
        skill_root = canonical_root / skill_name
        require_tracked_file(skill_root / "SKILL.md", tracked)
    require_tracked_file(ANTIGRAVITY_TEMPLATE, tracked)

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
            copy_tracked_tree(
                canonical_root / skill_name,
                skills_output / skill_name,
                tracked,
            )

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
                source_relative = require_tracked_file(source_logo, tracked)
                if source_logo.suffix.lower() != ".svg":
                    raise ValueError(f"canonical brand asset must be SVG: {source_relative}")
                assets_output = staging / "assets"
                assets_output.mkdir()
                destination = assets_output / "hypertaks.svg"
                shutil.copy2(source_logo, destination)
                logo_record = {
                    "included": True,
                    "source": source_relative,
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
    generated_skills = sorted(
        item.name for item in (package_root / "skills").iterdir() if item.is_dir()
    )
    if generated_skills != sorted(expected_skills):
        raise ValueError(f"generated Antigravity skill directories differ: {generated_skills}")
    for skill_name in skills:
        if not (package_root / "skills" / str(skill_name) / "SKILL.md").is_file():
            raise FileNotFoundError(f"generated skill missing SKILL.md: {skill_name}")
    if (package_root / "mcp_config.json").exists():
        raise ValueError("Antigravity package must not bundle an MCP server by default")
    if (package_root / "hooks.json").exists():
        raise ValueError("Antigravity package must not bundle hooks by default")

    records = manifest.get("files")
    if not isinstance(records, list) or not records:
        raise ValueError("generated Antigravity package manifest has no file records")
    for record in records:
        if not isinstance(record, Mapping):
            raise ValueError("generated Antigravity file record must be an object")
        relative = record.get("path")
        if not isinstance(relative, str) or not relative:
            raise ValueError("generated Antigravity file record has no path")
        path = package_root / relative
        if not path.is_file():
            raise FileNotFoundError(f"generated manifest file is missing: {relative}")
        if record.get("bytes") != path.stat().st_size:
            raise ValueError(f"generated manifest byte count differs: {relative}")
        if record.get("sha256") != sha256(path):
            raise ValueError(f"generated manifest hash differs: {relative}")


CANONICAL_SKILLS = (
    "hypertaks",
    "hypertaks-verify",
    "hypertaks-brain",
    "hypertaks-graph",
    "hypertaks-continuity",
)
OPENAI_OUTPUT_ROOT = ROOT / ".build" / "plugins" / "openai"
SKILL_PACKAGE_FOLDERS = ("references", "scripts", "assets", "agents")
FORBIDDEN_SKILL_PACKAGE_NAMES = {
    "AGENTS.md",
    "RELEASE-NOTES.md",
    "hypertaks-skill-card.md",
    "SKILL-core.md",
    "package.json",
}
FRONTMATTER_NAME_RE = re.compile(
    r"^---\n.*?\nname:\s*([a-z0-9-]+)\s*$",
    re.DOTALL | re.MULTILINE,
)


def iter_skill_package_files(skill_name: str) -> list[Path]:
    skill_root = ROOT / "skills" / skill_name
    skill_md = skill_root / "SKILL.md"
    if not skill_md.is_file():
        raise FileNotFoundError(f"missing SKILL.md for {skill_name}")
    files = [skill_md]
    for folder in SKILL_PACKAGE_FOLDERS:
        directory = skill_root / folder
        if not directory.is_dir():
            continue
        for path in sorted(directory.rglob("*")):
            if path.is_file() and not path.name.startswith("."):
                files.append(path)
    openai_yaml = skill_root / "agents" / "openai.yaml"
    if openai_yaml not in files:
        raise FileNotFoundError(f"missing agents/openai.yaml for {skill_name}")
    return files


def build_openai_skill_zips(output_root: Path | None = None) -> Path:
    destination = (output_root or OPENAI_OUTPUT_ROOT).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    for skill_name in CANONICAL_SKILLS:
        files = iter_skill_package_files(skill_name)
        zip_path = destination / f"{skill_name}.zip"
        if zip_path.exists():
            zip_path.unlink()
        skill_root = ROOT / "skills" / skill_name
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for path in files:
                arcname = Path(skill_name) / path.relative_to(skill_root)
                archive.write(path, arcname.as_posix())
        validate_openai_skill_zip(zip_path, skill_name)
    return destination


def validate_openai_skill_zip(zip_path: Path, skill_name: str) -> None:
    with zipfile.ZipFile(zip_path) as archive:
        names = [
            name
            for name in archive.namelist()
            if name and not name.endswith("/") and not name.startswith("__MACOSX")
        ]
        texts = {
            name: archive.read(name).decode("utf-8")
            for name in names
            if name.endswith(".md")
        }
    if not names:
        raise ValueError(f"empty OpenAI skill zip: {zip_path.name}")
    tops = {name.split("/")[0] for name in names}
    if tops != {skill_name}:
        raise ValueError(
            f"{zip_path.name} must contain exactly one skill root "
            f"{skill_name}/, got {sorted(tops)}"
        )
    required = {f"{skill_name}/SKILL.md", f"{skill_name}/agents/openai.yaml"}
    missing = sorted(required - set(names))
    if missing:
        raise ValueError(f"{zip_path.name} missing {', '.join(missing)}")
    forbidden: list[str] = []
    for name in names:
        base = Path(name).name
        if base in FORBIDDEN_SKILL_PACKAGE_NAMES:
            forbidden.append(name)
        if "/marketplace/" in name or "/.git/" in name or "/node_modules/" in name:
            forbidden.append(name)
        if name.endswith(".md"):
            match = FRONTMATTER_NAME_RE.search(texts[name])
            if match:
                found_name = match.group(1)
                if found_name.startswith("hypertaks") and found_name != skill_name:
                    raise ValueError(
                        f"{zip_path.name} contains a second public skill name: "
                        f"{found_name} in {name}"
                    )
    if forbidden:
        raise ValueError(
            f"{zip_path.name} contains forbidden package paths: {forbidden}"
        )


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("host", choices=("antigravity", "openai"))
    parser.add_argument("--output-root", type=Path, default=None)
    parser.add_argument("--check-only", action="store_true")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    if args.host == "openai":
        output_root = args.output_root or OPENAI_OUTPUT_ROOT
        if args.check_only:
            with tempfile.TemporaryDirectory(prefix="hypertaks-openai-check-") as temp_dir:
                package = build_openai_skill_zips(Path(temp_dir))
                print("OpenAI skill package check: PASS")
                print(package)
            return 0
        package = build_openai_skill_zips(output_root)
        print(package)
        return 0

    if args.check_only:
        with tempfile.TemporaryDirectory(
            prefix="hypertaks-distribution-check-"
        ) as temp_dir:
            package = build_antigravity(Path(temp_dir))
            validate_antigravity_package(package)
            print("Antigravity distribution check: PASS")
        return 0
    package = build_antigravity(args.output_root or DEFAULT_OUTPUT_ROOT)
    validate_antigravity_package(package)
    print(package)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
