#!/usr/bin/env python3
"""Validate the actual author-supplied public ZIP, not marketplace approval."""

from __future__ import annotations

import argparse
import io
import json
import re
import stat
import zipfile
from pathlib import Path, PurePosixPath
from typing import Mapping
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SKILLS = {"hypertaks", "hypertaks-verify", "hypertaks-brain", "hypertaks-graph", "hypertaks-continuity"}
ENDPOINT = "https://hypertaks.crimsonriftstudio.com/mcp"
SECRET_PATTERNS = (
    r"\bsk-[A-Za-z0-9_-]{20,}\b",
    r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
    r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b",
    r"\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b",
    r"-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----",
    r"\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*[\"']?[^\s\"']{12,}",
    r"\b(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def https_url(value: object) -> bool:
    if not isinstance(value, str) or not value or len(value) > 1024:
        return False
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and parsed.username is None and parsed.password is None


def validate_files(files: Mapping[str, bytes], expected_version: str) -> dict[str, object]:
    for name, data in files.items():
        parts = PurePosixPath(name).parts
        require(not name.startswith("/") and "\\" not in name and ".." not in parts, "unsafe archive path")
        require(parts and not any(part.startswith(".") for part in parts), f"private path in public upload: {name}")
        require(parts[0] in {"plugin.json", "mcp.json", "skills", "assets", "LICENSE"}, f"unrelated public upload path: {name}")
        require(b"asdk_app_" not in data, f"private App binding in public upload: {name}")
        if Path(name).suffix in {".md", ".json", ".yaml", ".yml", ".js", ".py", ".txt", ".svg"}:
            text = data.decode("utf-8")
            require("\u2014" not in text, f"forbidden U+2014 in {name}")
            require(not any(re.search(pattern, text, re.IGNORECASE) for pattern in SECRET_PATTERNS), f"secret-like content in {name}")

    require("plugin.json" in files and "mcp.json" in files, "plugin.json and mcp.json are required")
    plugin = json.loads(files["plugin.json"])
    mcp = json.loads(files["mcp.json"])
    for label, instance in (("plugin", plugin), ("mcp", mcp)):
        if label == "mcp":
            # OpenAI documents per-server auth extensions beyond the base schema.
            # Validate the portable core here and the exact supported extension below.
            instance = {**mcp, "mcpServers": {name: {key: value for key, value in server.items() if key != "extensions"} for name, server in mcp.get("mcpServers", {}).items()}}
        schema = json.loads((ROOT / "marketplace/openai/schemas" / f"{label}.schema.json").read_text(encoding="utf-8"))
        errors = list(Draft202012Validator(schema).iter_errors(instance))
        require(not errors, f"{label}.json does not match its pinned Agent Plugins schema")
    require(plugin.get("name") == "hypertaks", "public package name must remain hypertaks")
    require(plugin.get("version") == expected_version, "public package version differs from package.json")
    manifests = [plugin] + [json.loads(data) for name, data in files.items() if name.endswith("/plugin.json")]
    for manifest in manifests:
        require(manifest.get("apps") is None, "public upload must not declare apps")
        require(manifest.get("extensions", {}).get("com.openai", {}).get("apps") is None, "public upload must not declare OpenAI apps")

    extension = plugin.get("extensions", {}).get("com.openai", {})
    interface = extension.get("interface", {})
    for key, limit in (("displayName", 30), ("shortDescription", 30), ("longDescription", 4000), ("developerName", 80)):
        value = interface.get(key)
        require(isinstance(value, str) and bool(value.strip()) and len(value) <= limit, f"invalid listing {key}")
    require(interface.get("category") == "Developer Tools", "category must match the observed dashboard category")
    for key in ("websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"):
        require(https_url(interface.get(key)), f"invalid listing {key}")
    prompts = interface.get("defaultPrompt", [])
    if isinstance(prompts, str):
        prompts = [prompts]
    require(isinstance(prompts, list) and len(prompts) <= 3, "invalid starter prompt count")
    require(all(isinstance(p, str) and p.strip() and len(p) <= 128 and "\n" not in p and "@" not in p for p in prompts), "invalid starter prompt")
    require(len({" ".join(p.split()) for p in prompts}) == len(prompts), "duplicate starter prompt")
    for key, minimum in (("logo", 256), ("composerIcon", 48)):
        relative = interface.get(key)
        require(isinstance(relative, str) and relative.startswith("./"), f"invalid {key} path")
        name = relative[2:]
        require(name in files and len(files[name]) <= 5 * 1024 * 1024, f"missing or oversized {key}")
        with Image.open(io.BytesIO(files[name])) as icon:
            require(icon.format == "PNG" and minimum <= icon.width == icon.height <= 4096, f"invalid {key} image")
            icon.verify()

    servers = mcp.get("mcpServers", {})
    require(set(servers) == {"hypertaks"}, "exactly one existing Hypertaks MCP server is required")
    server = servers["hypertaks"]
    require(server.get("type") == "streamable-http" and server.get("url") == ENDPOINT, "MCP endpoint or transport changed")
    require(not server.get("headers"), "public upload must not contain nonempty MCP headers")
    require(server.get("extensions") == {"com.openai": {"auth": {"type": "none"}}}, "OpenAI authentication extension must match the verified public endpoint")
    require("review" not in server.get("extensions", {}).get("com.openai", {}), "do not mix per-server and plugin-level review cases")

    entries = {name.split("/")[1] for name in files if re.fullmatch(r"skills/[^/]+/SKILL\.md", name)}
    require(entries == SKILLS, "public upload must contain exactly five canonical skill entry files")
    require("skills/SKILL.md" not in files, "pack index must not replace the five skill roots")
    for name, data in files.items():
        if name.startswith("skills/"):
            require(len(PurePosixPath(name).parts) >= 3 and name.split("/")[1] in SKILLS, "unexpected skill root")
        if re.fullmatch(r"skills/[^/]+/SKILL\.md", name):
            match = re.search(r"^name:\s*([a-z0-9-]+)\s*$", data.decode("utf-8"), re.MULTILINE)
            require(bool(match) and match.group(1) == name.split("/")[1], f"skill name mismatch in {name}")

    review = extension.get("review", {})
    require("test_credentials" not in review and "reviewer_instructions" not in review, "reviewer access must stay outside the ZIP")
    cases = review.get("test_cases", {})
    for group, count in (("positive", 5), ("negative", 3)):
        values = cases.get(group)
        require(isinstance(values, list) and len(values) == count, f"review requires {count} {group} cases")
        for case in values:
            for field in ("description", "prompt", "expected_behavior") + (("tools_triggered",) if group == "positive" else ()):
                require(isinstance(case.get(field), str) and bool(case[field].strip()), f"missing {group} review field: {field}")
    require(bool(extension.get("publication", {}).get("release_notes")), "release notes are required for this package")
    return {"packageFormat": "Agent Plugins 1.0", "version": expected_version, "publicSkillCount": 5, "mcpServerCount": 1, "positiveCases": 5, "negativeCases": 3, "fileCount": len(files), "submissionReadiness": "NOT VERIFIED"}


def validate_zip(archive_path: Path, expected_version: str | None = None) -> dict[str, object]:
    version = expected_version or json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    files: dict[str, bytes] = {}
    with zipfile.ZipFile(archive_path) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            require(entry.filename.startswith("hypertaks/"), "archive must contain one hypertaks/ plugin root")
            require(not stat.S_ISLNK(entry.external_attr >> 16), "archive must not contain symlinks")
            name = entry.filename[len("hypertaks/"):]
            require(name not in files, "duplicate archive member")
            files[name] = archive.read(entry)
    return validate_files(files, version)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(validate_zip(args.archive), indent=2))
    except (OSError, ValueError, zipfile.BadZipFile) as exc:
        parser.exit(1, f"OpenAI public package validation failed: {exc}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
