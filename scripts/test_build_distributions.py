from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.build_distributions import (
    ROOT,
    build_antigravity,
    validate_antigravity_package,
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


if __name__ == "__main__":
    unittest.main()
