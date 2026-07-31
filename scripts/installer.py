#!/usr/bin/env python3
"""Universal Hypertaks Installer and Lifecycle Manager."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "distribution" / "registry.json"
MANIFEST_NAME = ".hypertaks-manifest.json"


def load_registry(path: Path = REGISTRY_PATH) -> Mapping[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"registry not found: {path}")
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, Mapping):
        raise ValueError("invalid registry format")
    return raw


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_install_target(host_id: str, scope: str, project_root: Path = ROOT) -> Path:
    user_home = Path.home()
    if host_id == "antigravity":
        if scope == "user":
            return user_home / ".gemini" / "config" / "plugins" / "hypertaks"
        return project_root / ".agents" / "plugins" / "hypertaks"
    elif host_id == "claude-code":
        if scope == "user":
            return user_home / ".claude" / "plugins" / "hypertaks"
        return project_root / ".claude-plugin"
    elif host_id == "codex":
        if scope == "user":
            return user_home / ".codex" / "plugins" / "hypertaks"
        return project_root / ".codex-plugin"
    elif host_id == "cursor":
        if scope == "user":
            return user_home / ".cursor" / "plugins" / "hypertaks"
        return project_root / ".cursor-plugin"
    elif host_id == "kimi-code":
        if scope == "user":
            return user_home / ".kimi" / "plugins" / "hypertaks"
        return project_root / ".kimi-plugin"
    elif host_id == "opencode":
        if scope == "user":
            return user_home / ".opencode" / "plugins" / "hypertaks"
        return project_root / ".opencode"
    elif host_id == "pi":
        if scope == "user":
            return user_home / ".pi" / "extensions" / "hypertaks"
        return project_root / ".pi" / "extensions"
    elif host_id == "openclaw":
        if scope == "user":
            return user_home / ".openclaw" / "skills" / "hypertaks"
        return project_root / ".openclaw"
    elif host_id == "hermes":
        if scope == "user":
            return user_home / ".hermes" / "skills" / "hypertaks"
        return project_root / ".hermes"
    else:
        if scope == "user":
            return user_home / f".{host_id}" / "hypertaks"
        return project_root / f".{host_id}"


def validate_owned_relative_path(target_dir: Path, relative_path: str) -> Path:
    """Return the resolved path for a manifest-owned relative path.

    Rejects absolute or traversal paths that escape target_dir.
    """
    rel = Path(relative_path)
    if rel.is_absolute():
        raise ValueError(f"manifest path is absolute: {relative_path}")
    resolved = (target_dir / rel).resolve()
    if not resolved.is_relative_to(target_dir.resolve()):
        raise ValueError(f"manifest path escapes target directory: {relative_path}")
    return resolved


def _prune_empty_dirs(directories: set[Path]) -> None:
    for directory in sorted(directories, key=lambda item: len(item.parts), reverse=True):
        if directory.is_dir() and not any(directory.iterdir()):
            directory.rmdir()


def _manifest_file_paths(
    target_dir: Path, file_records: Sequence[Mapping[str, Any]]
) -> list[Path]:
    """Validate and resolve every manifest file record before any deletion.

    Raises ValueError on any missing or escaping path. Validation runs before
    deletion so an unsafe manifest is rejected without removing files.
    """
    resolved: list[Path] = []
    for record in file_records:
        rel = record.get("path")
        if not isinstance(rel, str) or not rel:
            raise ValueError("manifest file record missing path")
        resolved.append(validate_owned_relative_path(target_dir, rel))
    return resolved


def _remove_owned_files(target_dir: Path, file_records: Sequence[Mapping[str, Any]]) -> None:
    resolved = _manifest_file_paths(target_dir, file_records)
    owned_dirs: set[Path] = {file_path.parent for file_path in resolved}
    for file_path in resolved:
        if file_path.is_file():
            file_path.unlink()
    _prune_empty_dirs(owned_dirs)


def _build_manifest_files(skills_src: Path, target_skills: Path) -> list[Mapping[str, Any]]:
    installed_files: list[Mapping[str, Any]] = []
    for path in sorted(skills_src.rglob("*")):
        if path.is_file():
            rel = path.relative_to(skills_src).as_posix()
            installed_files.append(
                {"path": f"skills/{rel}", "sha256": sha256_file(target_skills / rel)}
            )
    return installed_files


def _write_manifest(
    target_dir: Path, registry: Mapping[str, Any], host: str, scope: str, files: list[Mapping[str, Any]]
) -> None:
    manifest = {
        "product": "hypertaks",
        "version": registry["product"]["version"],
        "host": host,
        "scope": scope,
        "files": files,
    }
    (target_dir / MANIFEST_NAME).write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )


def _confirmed(args: argparse.Namespace, action: str) -> tuple[bool, str]:
    if getattr(args, "yes", False):
        return True, ""
    if sys.stdin.isatty():
        try:
            answer = input(f"{action} requires confirmation. Proceed? [y/N] ")
        except EOFError:
            answer = ""
        if answer.strip().lower() in ("y", "yes"):
            return True, ""
        return False, f"{action} cancelled by user"
    return False, f"{action} requires --yes in non-interactive mode"


def _emit_error(args: argparse.Namespace, message: str) -> int:
    if getattr(args, "json", False):
        print(json.dumps({"error": message, "status": "FAIL"}))
    else:
        print(message, file=sys.stderr)
    return 1


def cmd_doctor(args: argparse.Namespace) -> int:
    registry = load_registry()
    product = registry["product"]
    hosts = registry.get("hosts", [])

    results = {
        "status": "healthy",
        "product": product["displayName"],
        "version": product["version"],
        "canonicalSkills": product["canonicalPublicSkills"],
        "pythonVersion": sys.version.split()[0],
        "platform": sys.platform,
        "totalHostsRegistered": len(hosts),
    }

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(f"Hypertaks Doctor ({product['displayName']} v{product['version']})")
        print(f"  Python: {sys.version.split()[0]} ({sys.platform})")
        print(f"  Canonical Skills: {', '.join(product['canonicalPublicSkills'])}")
        print(f"  Registered Host Adapters: {len(hosts)}")
        print("  Status: HEALTHY")
    return 0


def cmd_list_hosts(args: argparse.Namespace) -> int:
    registry = load_registry()
    hosts = registry.get("hosts", [])

    if args.json:
        print(json.dumps(hosts, indent=2))
        return 0

    print("Registered Hypertaks Hosts:")
    for host in hosts:
        print(f"  - {host['id']} ({host['displayName']}): {host['distributionType']} [{host['adapterStatus']}]")
    return 0


def cmd_install(args: argparse.Namespace, project_root: Path = ROOT) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        return _emit_error(
            args, f"error: unknown host '{args.host}'. Run 'hypertaks list-hosts' to view available hosts."
        )

    host_info = hosts[args.host]
    target_dir = resolve_install_target(args.host, args.scope, project_root)
    skills_src = ROOT / "skills"
    target_skills = target_dir / "skills"

    if args.dry_run:
        preview = {
            "action": "install",
            "host": args.host,
            "scope": args.scope,
            "targetDirectory": str(target_dir),
            "dryRun": True,
        }
        if args.json:
            print(json.dumps(preview, indent=2))
        else:
            print(f"[DRY-RUN] Would install Hypertaks for {host_info['displayName']} ({args.scope}) to: {target_dir}")
        return 0

    replacing = target_dir.exists() and (target_skills.exists() or (target_dir / MANIFEST_NAME).is_file())
    if replacing:
        ok, reason = _confirmed(args, f"replace existing Hypertaks installation for {args.host}")
        if not ok:
            return _emit_error(args, f"error: {reason}")

        manifest_file = target_dir / MANIFEST_NAME
        old_files: list[Mapping[str, Any]] = []
        if manifest_file.is_file():
            try:
                old_manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
                old_files = list(old_manifest.get("files", []))
                _manifest_file_paths(target_dir, old_files)
            except (json.JSONDecodeError, ValueError) as exc:
                return _emit_error(
                    args,
                    f"error: existing manifest at {manifest_file} is malformed or unsafe ({exc}); refusing to replace",
                )

        backup_dir = target_dir.with_suffix(".bak")
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        shutil.copytree(target_dir, backup_dir)
        _remove_owned_files(target_dir, old_files)

    target_dir.mkdir(parents=True, exist_ok=True)
    shutil.copytree(skills_src, target_skills, dirs_exist_ok=True)
    installed_files = _build_manifest_files(skills_src, target_skills)
    _write_manifest(target_dir, registry, args.host, args.scope, installed_files)

    res = {
        "status": "PASS",
        "host": args.host,
        "scope": args.scope,
        "targetDirectory": str(target_dir),
        "filesInstalled": len(installed_files),
    }

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print(f"Successfully installed Hypertaks for {host_info['displayName']} ({args.scope}) to: {target_dir}")
    return 0


def cmd_status(args: argparse.Namespace, project_root: Path = ROOT) -> int:
    registry = load_registry()
    hosts = registry.get("hosts", [])
    status_list = []

    for host in hosts:
        host_id = host["id"]
        proj_target = resolve_install_target(host_id, "project", project_root)
        user_target = resolve_install_target(host_id, "user", project_root)

        proj_installed = (proj_target / MANIFEST_NAME).is_file()
        user_installed = (user_target / MANIFEST_NAME).is_file()

        status_list.append({
            "host": host_id,
            "displayName": host["displayName"],
            "projectInstall": proj_installed,
            "userInstall": user_installed,
        })

    if args.json:
        print(json.dumps(status_list, indent=2))
    else:
        print("Hypertaks Installation Status:")
        for s in status_list:
            proj_str = "Installed" if s["projectInstall"] else "Not Installed"
            user_str = "Installed" if s["userInstall"] else "Not Installed"
            print(f"  - {s['displayName']} ({s['host']}): Project={proj_str}, User={user_str}")
    return 0


def cmd_update(args: argparse.Namespace, project_root: Path = ROOT) -> int:
    registry = load_registry()
    host_filter = getattr(args, "host", None)

    if host_filter:
        hosts_to_update = [h for h in registry.get("hosts", []) if h["id"] == host_filter]
    else:
        hosts_to_update = registry.get("hosts", [])

    targets: list[tuple[str, str, Path]] = []
    for host in hosts_to_update:
        host_id = host["id"]
        for scope in ("project", "user"):
            target = resolve_install_target(host_id, scope, project_root)
            if (target / MANIFEST_NAME).is_file():
                targets.append((host_id, scope, target))

    if not targets:
        if args.json:
            print(json.dumps([], indent=2))
        else:
            print("No active Hypertaks installations found to update.")
        return 0

    if args.dry_run:
        results = [{"host": h, "scope": s, "status": "WOULD_UPDATE"} for h, s, _ in targets]
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for r in results:
                print(f"[DRY-RUN] Would update Hypertaks for {r['host']} ({r['scope']})")
        return 0

    ok, reason = _confirmed(args, "update Hypertaks installations")
    if not ok:
        return _emit_error(args, f"error: {reason}")

    skills_src = ROOT / "skills"
    results = []
    for host_id, scope, target in targets:
        manifest_file = target / MANIFEST_NAME
        try:
            manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
            _remove_owned_files(target, manifest.get("files", []))
        except (json.JSONDecodeError, ValueError) as exc:
            results.append({"host": host_id, "scope": scope, "status": "SKIPPED", "reason": f"malformed or unsafe manifest: {exc}"})
            continue
        target_skills = target / "skills"
        shutil.copytree(skills_src, target_skills, dirs_exist_ok=True)
        installed_files = _build_manifest_files(skills_src, target_skills)
        _write_manifest(target, registry, host_id, scope, installed_files)
        results.append({"host": host_id, "scope": scope, "status": "UPDATED"})

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            print(f"Updated Hypertaks for {r['host']} ({r['scope']}): {r['status']}")
    return 0


def cmd_uninstall(args: argparse.Namespace, project_root: Path = ROOT) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        return _emit_error(args, f"error: unknown host '{args.host}'.")

    target_dir = resolve_install_target(args.host, args.scope, project_root)
    manifest_file = target_dir / MANIFEST_NAME

    if not manifest_file.is_file():
        res = {"status": "NOT_FOUND", "targetDirectory": str(target_dir)}
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print(f"No Hypertaks installation manifest found at: {target_dir}")
        return 0

    if args.dry_run:
        preview = {
            "action": "uninstall",
            "host": args.host,
            "targetDirectory": str(target_dir),
            "dryRun": True,
        }
        if args.json:
            print(json.dumps(preview, indent=2))
        else:
            print(f"[DRY-RUN] Would uninstall Hypertaks from: {target_dir}")
        return 0

    ok, reason = _confirmed(args, f"uninstall Hypertaks for {args.host}")
    if not ok:
        return _emit_error(args, f"error: {reason}")

    try:
        manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
        _remove_owned_files(target_dir, manifest.get("files", []))
    except (json.JSONDecodeError, ValueError) as exc:
        return _emit_error(
            args,
            f"error: manifest at {manifest_file} is malformed or unsafe ({exc}); refusing to uninstall",
        )

    manifest_file.unlink()

    res = {"status": "UNINSTALLED", "host": args.host, "targetDirectory": str(target_dir)}
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print(f"Successfully uninstalled Hypertaks from {target_dir}")
    return 0


def cmd_verify(args: argparse.Namespace, project_root: Path = ROOT) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        return _emit_error(args, f"error: unknown host '{args.host}'.")

    target_dir = resolve_install_target(args.host, args.scope, project_root)
    manifest_file = target_dir / MANIFEST_NAME

    if not manifest_file.is_file():
        res = {"status": "NOT_INSTALLED", "host": args.host, "scope": args.scope}
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print(f"Hypertaks is not installed for {args.host} ({args.scope})")
        return 1

    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    errors = []

    for file_record in manifest.get("files", []):
        try:
            file_path = validate_owned_relative_path(target_dir, file_record["path"])
        except (KeyError, ValueError) as exc:
            errors.append(f"Invalid manifest path: {exc}")
            continue
        if not file_path.is_file():
            errors.append(f"Missing file: {file_record['path']}")
        elif sha256_file(file_path) != file_record["sha256"]:
            errors.append(f"Checksum mismatch: {file_record['path']}")

    status = "PASS" if not errors else "CORRUPTED"
    res = {"status": status, "host": args.host, "scope": args.scope, "errors": errors}

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if status == "PASS":
            print(f"Verification PASS: Hypertaks installation for {args.host} is intact.")
        else:
            print(f"Verification FAIL for {args.host}: {len(errors)} issues found.")
            for e in errors:
                print(f"  - {e}")
    return 0 if status == "PASS" else 1


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="hypertaks", description="Universal Hypertaks Installer and CLI Manager")

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    common.add_argument("--dry-run", action="store_true", help="Preview action without making changes")
    common.add_argument("--yes", "-y", action="store_true", help="Bypass interactive prompts")

    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    subparsers.add_parser("doctor", parents=[common], help="Run system and environment diagnostic check")
    subparsers.add_parser("list-hosts", parents=[common], help="List all registered target host adapters")

    p_install = subparsers.add_parser("install", parents=[common], help="Install Hypertaks for a target host")
    p_install.add_argument("host", help="Host identifier (e.g., antigravity, claude-code, codex, etc.)")
    p_install.add_argument("--scope", choices=("project", "user"), default="project", help="Installation scope")

    subparsers.add_parser("status", parents=[common], help="Show installation status across all target hosts")

    p_update = subparsers.add_parser("update", parents=[common], help="Update Hypertaks installations")
    p_update.add_argument("host", nargs="?", help="Optional target host identifier")

    p_uninst = subparsers.add_parser("uninstall", parents=[common], help="Uninstall Hypertaks from a target host")
    p_uninst.add_argument("host", help="Host identifier")
    p_uninst.add_argument("--scope", choices=("project", "user"), default="project", help="Installation scope")

    p_verify = subparsers.add_parser("verify", parents=[common], help="Verify installation integrity for a target host")
    p_verify.add_argument("host", help="Host identifier")
    p_verify.add_argument("--scope", choices=("project", "user"), default="project", help="Installation scope")

    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 0

    if args.command == "doctor":
        return cmd_doctor(args)
    elif args.command == "list-hosts":
        return cmd_list_hosts(args)
    elif args.command == "install":
        return cmd_install(args)
    elif args.command == "status":
        return cmd_status(args)
    elif args.command == "update":
        return cmd_update(args)
    elif args.command == "uninstall":
        return cmd_uninstall(args)
    elif args.command == "verify":
        return cmd_verify(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
