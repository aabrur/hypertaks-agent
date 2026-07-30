#!/usr/bin/env python3
"""Universal Hypertaks Installer and Lifecycle Manager."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
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


def cmd_install(args: argparse.Namespace) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        err = f"error: unknown host '{args.host}'. Run 'hypertaks list-hosts' to view available hosts."
        if args.json:
            print(json.dumps({"error": err, "status": "FAIL"}))
        else:
            print(err, file=sys.stderr)
        return 1

    host_info = hosts[args.host]
    target_dir = resolve_install_target(args.host, args.scope)

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

    target_dir.parent.mkdir(parents=True, exist_ok=True)
    skills_src = ROOT / "skills"
    installed_files = []

    if target_dir.exists():
        backup_dir = target_dir.with_suffix(".bak")
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        shutil.copytree(target_dir, backup_dir)

    target_dir.mkdir(parents=True, exist_ok=True)
    target_skills = target_dir / "skills"
    if target_skills.exists():
        shutil.rmtree(target_skills)
    shutil.copytree(skills_src, target_skills)

    for path in target_skills.rglob("*"):
        if path.is_file():
            rel = path.relative_to(target_dir).as_posix()
            installed_files.append({"path": rel, "sha256": sha256_file(path)})

    manifest = {
        "product": "hypertaks",
        "version": registry["product"]["version"],
        "host": args.host,
        "scope": args.scope,
        "files": installed_files,
    }
    (target_dir / MANIFEST_NAME).write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

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


def cmd_status(args: argparse.Namespace) -> int:
    registry = load_registry()
    hosts = registry.get("hosts", [])
    status_list = []

    for host in hosts:
        host_id = host["id"]
        proj_target = resolve_install_target(host_id, "project")
        user_target = resolve_install_target(host_id, "user")

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


def cmd_update(args: argparse.Namespace) -> int:
    registry = load_registry()
    host_filter = getattr(args, "host", None)

    if host_filter:
        hosts_to_update = [h for h in registry.get("hosts", []) if h["id"] == host_filter]
    else:
        hosts_to_update = registry.get("hosts", [])

    results = []
    for host in hosts_to_update:
        host_id = host["id"]
        for scope in ("project", "user"):
            target = resolve_install_target(host_id, scope)
            manifest_file = target / MANIFEST_NAME
            if manifest_file.is_file():
                if args.dry_run:
                    results.append({"host": host_id, "scope": scope, "status": "WOULD_UPDATE"})
                else:
                    skills_src = ROOT / "skills"
                    target_skills = target / "skills"
                    if target_skills.exists():
                        shutil.rmtree(target_skills)
                    shutil.copytree(skills_src, target_skills)
                    results.append({"host": host_id, "scope": scope, "status": "UPDATED"})

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if not results:
            print("No active Hypertaks installations found to update.")
        for r in results:
            print(f"Updated Hypertaks for {r['host']} ({r['scope']}): {r['status']}")
    return 0


def cmd_uninstall(args: argparse.Namespace) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        err = f"error: unknown host '{args.host}'."
        if args.json:
            print(json.dumps({"error": err, "status": "FAIL"}))
        else:
            print(err, file=sys.stderr)
        return 1

    target_dir = resolve_install_target(args.host, args.scope)
    manifest_file = target_dir / MANIFEST_NAME

    if not manifest_file.is_file():
        msg = f"No Hypertaks installation manifest found at: {target_dir}"
        if args.json:
            print(json.dumps({"status": "NOT_FOUND", "targetDirectory": str(target_dir)}))
        else:
            print(msg)
        return 0

    if args.dry_run:
        if args.json:
            print(json.dumps({"action": "uninstall", "host": args.host, "targetDirectory": str(target_dir), "dryRun": True}))
        else:
            print(f"[DRY-RUN] Would uninstall Hypertaks from: {target_dir}")
        return 0

    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    for file_record in manifest.get("files", []):
        file_path = target_dir / file_record["path"]
        if file_path.is_file():
            file_path.unlink()

    if (target_dir / "skills").is_dir():
        shutil.rmtree(target_dir / "skills", ignore_errors=True)
    manifest_file.unlink()

    res = {"status": "UNINSTALLED", "host": args.host, "targetDirectory": str(target_dir)}
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print(f"Successfully uninstalled Hypertaks from {target_dir}")
    return 0


def cmd_verify(args: argparse.Namespace) -> int:
    registry = load_registry()
    hosts = {h["id"]: h for h in registry.get("hosts", [])}
    if args.host not in hosts:
        err = f"error: unknown host '{args.host}'."
        if args.json:
            print(json.dumps({"error": err, "status": "FAIL"}))
        else:
            print(err, file=sys.stderr)
        return 1

    target_dir = resolve_install_target(args.host, args.scope)
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
        file_path = target_dir / file_record["path"]
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
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    parser.add_argument("--dry-run", action="store_true", help="Preview action without making changes")
    parser.add_argument("--yes", "-y", action="store_true", help="Bypass interactive prompts")

    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    subparsers.add_parser("doctor", help="Run system and environment diagnostic check")
    subparsers.add_parser("list-hosts", help="List all registered target host adapters")

    p_install = subparsers.add_parser("install", help="Install Hypertaks for a target host")
    p_install.add_argument("host", help="Host identifier (e.g., antigravity, claude-code, codex, etc.)")
    p_install.add_argument("--scope", choices=("project", "user"), default="project", help="Installation scope")

    subparsers.add_parser("status", help="Show installation status across all target hosts")

    p_update = subparsers.add_parser("update", help="Update Hypertaks installations")
    p_update.add_argument("host", nargs="?", help="Optional target host identifier")

    p_uninst = subparsers.add_parser("uninstall", help="Uninstall Hypertaks from a target host")
    p_uninst.add_argument("host", help="Host identifier")
    p_uninst.add_argument("--scope", choices=("project", "user"), default="project", help="Installation scope")

    p_verify = subparsers.add_parser("verify", help="Verify installation integrity for a target host")
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
