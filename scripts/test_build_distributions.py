from __future__ import annotations

import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from scripts.build_distributions import (
    ROOT,
    build_antigravity,
    build_openai_skill_zips,
    build_openai_plugin_zip,
    validate_antigravity_package,
    validate_openai_skill_zip,
)
from scripts.validate_openai_submission import validate_files, validate_zip


class DistributionBuildTests(unittest.TestCase):
    def test_antigravity_package_contains_exactly_five_canonical_skills(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            package = build_antigravity(Path(temp_dir))
            validate_antigravity_package(package)
            manifest = json.loads(
                (package / "BUILD-MANIFEST.json").read_text(encoding="utf-8")
            )
            self.assertEqual(len(manifest["canonicalSkills"]), 5)
            self.assertFalse(manifest["mcpBundled"])
            self.assertFalse(manifest["hooksBundled"])
            self.assertFalse((package / "mcp_config.json").exists())
            self.assertFalse((package / "hooks.json").exists())

    def test_antigravity_package_includes_canonical_svg(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            package = build_antigravity(Path(temp_dir))
            manifest = json.loads(
                (package / "BUILD-MANIFEST.json").read_text(encoding="utf-8")
            )
            brand = manifest["brand"]
            self.assertTrue(brand["included"])
            self.assertEqual(brand["source"], "assets/Hypertask.svg")
            self.assertEqual(brand["output"], "assets/hypertaks.svg")
            self.assertTrue((package / "assets" / "hypertaks.svg").is_file())
            self.assertRegex(brand["sha256"], r"^[0-9a-f]{64}$")

    def test_antigravity_package_excludes_untracked_skill_files(self) -> None:
        probe = ROOT / "skills" / "hypertaks" / ".distribution-untracked-probe"
        self.assertFalse(probe.exists())
        probe.write_text("must not ship\n", encoding="utf-8")
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                package = build_antigravity(Path(temp_dir))
                self.assertFalse(
                    (package / "skills" / "hypertaks" / probe.name).exists()
                )
        finally:
            probe.unlink(missing_ok=True)


class OpenAISkillPackageTests(unittest.TestCase):
    def test_each_openai_zip_has_exactly_one_skill_root(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = build_openai_skill_zips(Path(temp_dir))
            expected = {
                "hypertaks",
                "hypertaks-verify",
                "hypertaks-brain",
                "hypertaks-graph",
                "hypertaks-continuity",
            }
            zips = {path.stem: path for path in output.glob("*.zip")}
            self.assertEqual(set(zips), expected)
            for skill_name, zip_path in zips.items():
                validate_openai_skill_zip(zip_path, skill_name)
                with zipfile.ZipFile(zip_path) as archive:
                    names = [name for name in archive.namelist() if name and not name.endswith("/")]
                tops = {name.split("/")[0] for name in names}
                self.assertEqual(tops, {skill_name})
                self.assertIn(f"{skill_name}/SKILL.md", names)
                self.assertIn(f"{skill_name}/agents/openai.yaml", names)
                self.assertNotIn(f"{skill_name}/SKILL-core.md", names)
                self.assertNotIn(f"{skill_name}/AGENTS.md", names)
                self.assertNotIn(f"{skill_name}/RELEASE-NOTES.md", names)
                self.assertNotIn("package.json", names)

    def test_openai_zip_rejects_second_skill_root(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = Path(temp_dir) / "hypertaks.zip"
            with zipfile.ZipFile(zip_path, "w") as archive:
                archive.writestr("hypertaks/SKILL.md", "---\nname: hypertaks\ndescription: \"x\"\n---\n")
                archive.writestr("hypertaks/agents/openai.yaml", "interface:\n  display_name: \"Hypertaks\"\n")
                archive.writestr(
                    "hypertaks-core/SKILL.md",
                    "---\nname: hypertaks-core\ndescription: \"x\"\n---\n",
                )
            with self.assertRaises(ValueError) as raised:
                validate_openai_skill_zip(zip_path, "hypertaks")
            self.assertIn("exactly one skill root", str(raised.exception))

    def test_openai_zip_rejects_second_frontmatter_skill(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = Path(temp_dir) / "hypertaks.zip"
            with zipfile.ZipFile(zip_path, "w") as archive:
                archive.writestr("hypertaks/SKILL.md", "---\nname: hypertaks\ndescription: \"x\"\n---\n")
                archive.writestr("hypertaks/agents/openai.yaml", "interface:\n  display_name: \"Hypertaks\"\n")
                archive.writestr(
                    "hypertaks/SKILL-core.md",
                    "---\nname: hypertaks-core\ndescription: \"x\"\n---\n",
                )
            with self.assertRaises(ValueError) as raised:
                validate_openai_skill_zip(zip_path, "hypertaks")
            message = str(raised.exception)
            self.assertTrue(
                "second public skill name" in message or "forbidden package paths" in message
            )


class OpenAIPublicPluginTests(unittest.TestCase):
    def test_public_zip_contains_five_skills_and_existing_remote_server(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            archive_path = build_openai_plugin_zip(Path(temporary))
            result = validate_zip(archive_path)
            self.assertEqual(result["publicSkillCount"], 5)
            self.assertEqual(result["mcpServerCount"], 1)
            self.assertEqual(result["submissionReadiness"], "NOT VERIFIED")
            first = archive_path.read_bytes()
            self.assertEqual(build_openai_plugin_zip(Path(temporary)).read_bytes(), first)
            with zipfile.ZipFile(archive_path) as archive:
                manifest = json.loads(archive.read("hypertaks/plugin.json"))
                metadata = json.loads((ROOT / "marketplace/openai/metadata.json").read_text(encoding="utf-8"))
                self.assertEqual(manifest["name"], "app-6a851e5881dc81919fd10e98f7e19b80")
                self.assertEqual(manifest["version"], metadata["packageVersion"])
                self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")
                source = json.loads((ROOT / "plugin.json").read_text(encoding="utf-8"))
                self.assertEqual(source["name"], "hypertaks")
                self.assertEqual(source["version"], json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"])
                self.assertEqual({**source, "name": manifest["name"], "version": manifest["version"]}, manifest)
                self.assertEqual(archive.read("hypertaks/mcp.json"), (ROOT / "mcp.json").read_bytes())
                self.assertNotIn("hypertaks/skills/SKILL.md", archive.namelist())
                self.assertNotIn("hypertaks/.app.json", archive.namelist())
                self.assertEqual(archive.read("hypertaks/skills/hypertaks/SKILL.md"), (ROOT / "skills/hypertaks/SKILL.md").read_bytes())

    def test_public_validation_rejects_bindings_secrets_and_incomplete_skills(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            with zipfile.ZipFile(build_openai_plugin_zip(Path(temporary))) as archive:
                files = {name[len("hypertaks/"):]: archive.read(name) for name in archive.namelist()}
            version = json.loads(files["plugin.json"])["version"]
            for name, value in ((".app.json", b"{}"), ("../private.txt", b"x"), ("skills/SKILL.md", b"pack index"), ("skills/hypertaks/references/leak.txt", b"sk-" + b"x" * 30)):
                with self.subTest(name=name), self.assertRaises(ValueError):
                    validate_files({**files, name: value}, version)
            for mutate in ("apps", "headers", "version", "non-semver", "identity", "yaml", "missing-skill"):
                with self.subTest(mutate=mutate), self.assertRaises(ValueError):
                    changed = dict(files)
                    if mutate == "missing-skill":
                        del changed["skills/hypertaks-brain/SKILL.md"]
                    elif mutate == "yaml":
                        changed["skills/hypertaks/SKILL.md"] = b'---\nname: hypertaks\ndescription: "Bad "quotes"."\n---\n'
                    else:
                        name = "mcp.json" if mutate == "headers" else "plugin.json"
                        manifest = json.loads(changed[name])
                        if mutate == "headers":
                            manifest["mcpServers"]["hypertaks"]["headers"] = {"authorization": "private"}
                        elif mutate == "version":
                            manifest["version"] = "4.5.2"
                        elif mutate == "non-semver":
                            manifest["version"] = "0.0.4.5.10"
                        elif mutate == "identity":
                            manifest["name"] = "hypertaks"
                        else:
                            manifest["extensions"]["com.openai"]["apps"] = "./.app.json"
                        changed[name] = json.dumps(manifest).encode()
                    validate_files(changed, version)

    def test_untracked_skill_reference_is_excluded(self) -> None:
        probe = ROOT / "skills/hypertaks/references/public-upload-probe.txt"
        self.assertFalse(probe.exists())
        try:
            probe.write_text("untracked private data", encoding="utf-8")
            with tempfile.TemporaryDirectory() as temporary:
                with zipfile.ZipFile(build_openai_plugin_zip(Path(temporary))) as archive:
                    self.assertNotIn("hypertaks/skills/hypertaks/references/public-upload-probe.txt", archive.namelist())
        finally:
            probe.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
