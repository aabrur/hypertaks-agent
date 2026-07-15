# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.3.0] - 2026-07-15

### Added
- **Founder Operating Lens**: Defines Hypertaks as a Founder Operating System,
  an operating protocol that makes the host AI act as accountable founder of the
  work and leader of specialist agents without claiming consciousness, emotion,
  literal ownership, or autonomous legal authority.
- **Founder contract fields**: Adds optional business-health fields for material
  tasks: business impact, strategic fit, short-term benefit, long-term cost,
  stakeholders affected, Founder concern, and safer path.
- **Founder evals**: Adds EV-39 through EV-44 for margin-destroying discounts,
  runway-constrained expansion, competitor-copy features, deceptive growth
  tactics, safe Boss override, and small-task proportionality.
- **Language gates**: Repository validation now rejects U+2014 in tracked text
  files and flags high-confidence Indonesian residue in tracked prose files.
- **Capability Relevance Router**: Adds deterministic Need, Discover,
  Normalize, Filter, Bind, Verify, and Fallback stages for host skills, native
  tools, MCP tools, and connectors.
- **Capability evals**: Adds EV-45 through EV-49 for relevant selection,
  irrelevant rejection, permission-gated mutation, honest fallback, and Nano
  proportionality.
- **Safe update policy**: Allows trusted host-native update discovery while
  requiring explicit approval before installed code changes.

### Changed
- Wires Founder judgment into Phases 0 through 5, agent briefs, deliverables,
  state capsule fields, role selection, CORE profile, documentation, and eval
  documentation while preserving deterministic tier selection and Nano/Lite
  proportionality.
- Binds the smallest sufficient verified capability set and keeps every
  capability inside the approved role, permission, side-effect, and context
  boundaries.
- Extends version synchronization checks to package metadata, the cross-agent
  catalog, all tracked plugin manifests, and both Claude marketplace records.

### Certification
- Passed the project behavioral release gate with 43/49 Behavioral PASS and 6
  documented non-PASS cases. The threshold is 24, for a margin of +19.
- Recorded 49/49 Static GREEN separately from behavioral results and set
  canonical `confirmed_by_boss` metadata to `true`.
- Designated v4.3.0 as **Behaviorally Certified** under the repository's own
  evaluation policy. This is not formal third-party certification and does not
  guarantee security or outcomes.

## [4.2.0] - 2026-07-14

### Added
- **Safety Kernel (P0)**: Introduced `references/00-security-kernel.md` for absolute authority binding (T0 > T1 > T2 > T3 > T4=T5=T6) and approval-source binding to close approval spoofing.
- **State and Transactions**: Introduced `references/01-state-and-transactions.md` enforcing idempotency keys for external actions and PREPARE → PREVIEW → APPROVAL → COMMIT loop.
- **Domain Packs (Quantitative expansion)**: Added 12 routed domain packs (`D1` through `D12`) covering quantitative methods, economics, data, research, logistics, operations, trade, finance, software engineering, design/UX, engineering economy, and soft skills.
- **CORE Execution Profile**: Added the 40-line `SKILL-core.md`, a reduced profile intended for smaller context windows.
- **Behavioral Evals**: Expanded the suite to 38 case definitions, including missing-input (`DATA UNAVAILABLE`) complements.
- **Validation**: Added `scripts/run_evals.py --check` and `PyYAML` to GitHub Actions CI workflow to catch regressions early.

### Changed
- **Budget Model**: Split overhead and production budgets. Reference reading is now conditional per tier. Nano and Lite equip from memory natively and declare it.
- **Tier Scoring**: Tier assignment is now strictly deterministic based on 7 factors (Domain count, Deliverables, Reversibility, Side effects, Ambiguity, Dependency depth, Evidence required).
- **Evidence Class**: Replaced confidence percentages (pseudo-precision) with strict evidence classes: VERIFIED, INFERRED, ASSUMED, and UNKNOWN.
- **Role Interfaces**: Added 5 new specialists (Quant, Freight/Customs, Quality/Lean, Research, Asset/Maintenance) for precise routing, avoiding repetitive generic analysis.
- **Evidence Reporting**: Separated structural GREEN, saved behavioral verdicts, provenance-valid records, and Boss confirmation.

### Fixed
- Fixed recursion loop (executor mode) causing fork bombs. Subagents at `hypertaks_depth >= 1` now bypass the intake gate and compliance ceremony entirely.
- Resolved contradiction in Prime tier count rule, enforcing exactly 4 specialists + 1 Founder.
- Addressed known-deviation: Budget (W3) and Runtime (W4) commits were temporarily squashed together during integration, leading to combined tracking for conditionally-loaded reference mechanics.

### Verification boundary

- `evals/results.yaml` records 26 PASS and 12 SKIPPED(harness), all with `confirmed_by_boss: false`.
- EV-25 through EV-38 provide 14 PASS records with the complete independent provenance fields required by the tightened validator.
- The 24-EV behavioral release threshold is not met. Static GREEN and skipped cases do not count as behavioral PASS.
- The finalization does not rerun the 38-case behavioral suite.

## [4.0.0] - 2026-07-10
*(See previous release notes)*
