# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.0] - 2026-07-14

### Added
- **Safety Kernel (P0)**: Introduced `references/00-security-kernel.md` for absolute authority binding (T0 > T1 > T2 > T3 > T4=T5=T6) and approval-source binding to close approval spoofing.
- **State and Transactions**: Introduced `references/01-state-and-transactions.md` enforcing idempotency keys for external actions and PREPARE → PREVIEW → APPROVAL → COMMIT loop.
- **Domain Packs (Quantitative expansion)**: Added 9 quantitative domain packs (`D1` through `D9`) expanding Hypertaks into exact formulas and computations, overriding vague ambiguity/speed rules with exact Output Shape Laws.
- **CORE Execution Profile**: Added `SKILL-core.md` (≤70 lines) to support execution on smaller LLMs, loading only deterministic and security logic.
- **Behavioral Evals**: Introduced 16 new test cases verifying behavior (EV-23 to EV-38) with explicit testing of missing input ("DATA UNAVAILABLE") conditions.
- **Validation**: Added `scripts/run_evals.py --check` and `PyYAML` to GitHub Actions CI workflow to catch regressions early.

### Changed
- **Budget Model**: Split overhead and production budgets. Reference reading is now conditional per tier. Nano and Lite equip from memory natively and declare it.
- **Tier Scoring**: Tier assignment is now strictly deterministic based on 7 factors (Domain count, Deliverables, Reversibility, Side effects, Ambiguity, Dependency depth, Evidence required).
- **Evidence Class**: Replaced confidence percentages (pseudo-precision) with strict evidence classes: VERIFIED, INFERRED, ASSUMED, and UNKNOWN.
- **Role Interfaces**: Added 5 new specialists (Quant, Freight/Customs, Quality/Lean, Research, Asset/Maintenance) for precise routing, avoiding repetitive generic analysis.
- **README Claims Audit**: Adjusted design intent claims, updated versions, matched verification EV-IDs (e.g. EV-07, EV-08 for mandatory rollback), and removed fabricated metric numbers.

### Fixed
- Fixed recursion loop (executor mode) causing fork bombs. Subagents at `hypertaks_depth >= 1` now bypass the intake gate and compliance ceremony entirely.
- Resolved contradiction in Prime tier count rule, enforcing exactly 4 specialists + 1 Founder.
- Addressed known-deviation: Budget (W3) and Runtime (W4) commits were temporarily squashed together during integration, leading to combined tracking for conditionally-loaded reference mechanics.

## [4.0.0] - 2026-07-10
*(See previous release notes)*
