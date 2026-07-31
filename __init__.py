"""Hypertaks plugin registration for Hermes."""

from pathlib import Path


def register(ctx):
    plugin_root = Path(__file__).resolve().parent
    skills_root = plugin_root / "skills"
    for name in (
        "hypertaks",
        "hypertaks-verify",
        "hypertaks-brain",
        "hypertaks-graph",
        "hypertaks-continuity",
    ):
        ctx.register_skill(name, skills_root / name)
