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
    validate_antigravity_package,
    validate_openai_skill_zip,
)


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


if __name__ == "__main__":
    unittest.main()
