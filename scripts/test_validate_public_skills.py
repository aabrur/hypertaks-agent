"""Regression tests for the public Hypertaks skill surface."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts.validate_public_skills import (
    EXPECTED,
    collect_frontmatter_skill_names,
    validate_public_skills,
)


class PublicSkillSurfaceTests(unittest.TestCase):
    def test_repository_has_exactly_five_frontmatter_skill_names(self) -> None:
        found, errors = collect_frontmatter_skill_names()
        self.assertEqual(set(found), EXPECTED, errors)
        self.assertEqual(errors, [])

    def test_extra_frontmatter_skill_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skills = root / "skills"
            for name in sorted(EXPECTED):
                skill_dir = skills / name
                skill_dir.mkdir(parents=True)
                (skill_dir / "SKILL.md").write_text(
                    f"---\nname: {name}\ndescription: \"Use {name}.\"\n---\n# {name}\n",
                    encoding="utf-8",
                )
            rogue = skills / "hypertaks" / "SKILL-core.md"
            rogue.write_text(
                "---\nname: hypertaks-core\ndescription: \"Use when context is tight.\"\n---\n# core\n",
                encoding="utf-8",
            )
            found, errors = collect_frontmatter_skill_names(skills)
            self.assertIn("hypertaks-core", found)
            joined = "\n".join(errors)
            self.assertIn("Unexpected public Hypertaks skills: hypertaks-core", joined)

    def test_validate_public_skills_passes_current_repository(self) -> None:
        self.assertEqual(validate_public_skills(), 0)


if __name__ == "__main__":
    unittest.main()
