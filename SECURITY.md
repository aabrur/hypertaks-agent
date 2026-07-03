# Security Policy

## Supported Versions

Hypertaks is a cross-agent **skill** (markdown instructions for AI coding
agents) plus one Python validator script — it has no runtime service component.

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| 2.x     | :white_check_mark: (security fixes only) |
| < 2.0   | :x:                |

## Scope

This policy covers the contents of this repository only:

- `skills/hypertaks/**` — the skill markdown and reference files.
- `scripts/validate_skill.py` — the only executable code shipped here.
- Plugin manifests under `.claude-plugin/`, `.codex-plugin/`,
  `.cursor-plugin/`, `.kimi-plugin/`, `.agents/`, `.pi/`.

It does **not** cover the behavior of any AI agent that loads the skill, nor
any third-party framework, plugin, or MCP connector the skill names or invokes.
Those have their own security policies.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.** Please report
privately so a fix can ship before details are disclosed:

- **Preferred:** GitHub Private Vulnerability Reporting —
  [Report a vulnerability](https://github.com/aabrur/hypertaks-agent/security/advisories/new).
- **Alternative:** email the maintainer at **abrur_nic@yahoo.com** with
  `[hypertaks-security]` in the subject line.

When reporting, please include:

1. The affected file(s) and commit/ version.
2. A concrete reproduction (for the validator script) or the exact payload/
   instruction sequence (for skill content).
3. The impact you observed or expect.

### What to expect

| Step | Target |
|------|--------|
| Acknowledgement of receipt | within **3 business days** |
| Initial assessment (valid / needs info / declined) | within **7 days** |
| Fix or mitigation for an accepted report | within **30 days**, sooner for high-severity |
| Coordinate disclosure timing | agreed with you before any public advisory is published |

A report may be **declined** if it concerns intended skill behavior (e.g. the
skill correctly invokes a tool the user authorized), behavior of a downstream
agent we do not control, or an out-of-scope version. If declined, you will be
told why and pointed at the responsible party where possible.

## Threat Model (honest, given this is a skill repo)

- **Prompt-injection in reference content** — the reference files are trusted
  authoring, not user input. If you find instructions that could mislead an
  agent into exfiltrating data or running destructive commands, that is in
  scope; report it.
- **Supply-chain via marketplace install** — install only from
  `aabrur/hypertaks-agent` or the official marketplace entry. A third party
  republishing the skill under a similar name is not something this repo can
  prevent.
- **The validator script** — it only reads local files and parses JSON/YAML
  frontmatter; it makes no network calls. If you find it does anything else,
  report it.
