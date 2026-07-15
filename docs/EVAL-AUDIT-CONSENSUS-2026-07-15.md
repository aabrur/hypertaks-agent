# Hypertaks v4.2.0  -  Six-Agent Audit Consensus

**Published:** 2026-07-15
**Repository:** `aabrur/hypertaks-agent`
**Current publication branch:** `main`
**Main commit before this report:** `3f411ee5c76c0b4c0dc7de8056a325033a0775fc`

## Scope

This report combines six independent agent audits produced by:

1. Cline
2. Kilo Code
3. Pi
4. Antigravity
5. Hermes
6. OpenClaw

The reports were not behavioral transcripts and are not counted as EV PASS evidence. They are independent repository and evidence-pipeline audits used to establish a shared release-status conclusion.

## Final consensus

Hypertaks v4.2.0 is structurally published and installable, but its behavioral release gate is not yet fully certified.

| Area | Consensus status | Basis |
|---|---|---|
| Structural validator | PASS | All six auditors reported validator success. |
| Eval case structure | PASS | The current suite contains 44 declared cases and passes structural checks. The historical six-agent audit covered 38 declared cases before EV-39 through EV-44 were added. |
| Static preconditions | 44/44 GREEN | Current repository state. The historical six-agent audit covered 38/38 before EV-39 through EV-44 were added. |
| Behavioral evidence | PARTIAL / NOT RELEASE-CERTIFIED | Saved rows exist, but the audit set consistently identified self-grading, skipped harness cases, provenance disagreement, or report-validation failure. |
| Security source scan | PASS WITH CAVEAT | No live secret leakage was found; runtime security guards remain incompletely proven because core security cases are skipped by the recorded harness. |
| Evidence pipeline | NOT CERTIFIED | Multiple agents reported invalid or non-reproducible report validation, stale commit references, self-grading, or malformed historical transcript artifacts. |
| Documentation sync | NEEDS CONTINUED DISCIPLINE | Several audit environments found stale or contradictory local docs. Current `main` is more conservative than the audited worktrees, but audit claims must continue to track the canonical report output exactly. |
| Unconditional release readiness | NO | No auditor produced an unconditional behavioral release certification. |

## What all six agents agreed on

### 1. Structural quality is strong

Every agent reported that the repository-level validator passed and that the historical 38 static preconditions were GREEN. Current main now has 44/44 GREEN after adding the Founder Operating Lens cases. This proves the required files, rules, domain-pack routes, kernel references, declared guards, and Founder Operating Lens hooks exist in the repository.

Static GREEN is not behavioral PASS. It proves capability presence, not runtime obedience.

### 2. The saved behavioral headline cannot be used without provenance qualification

The historical results contain 26 recorded PASS rows and 12 `SKIPPED(harness)` rows. The audits consistently found that the headline must be qualified because:

- older cases were self-graded;
- `confirmed_by_boss` remains `false`;
- security, loop, and transaction cases include harness skips;
- several audit runs could not obtain a clean successful `--report` certification;
- evidence was recorded against more than one commit state;
- some historical transcript files were reported as malformed or placeholder-like by at least one auditor.

The current README already separates saved verdicts from provenance-valid evidence and states that the release threshold has not been met. That conservative distinction remains authoritative.

### 3. Core safety claims need behavioral coverage, not only static coverage

The most important skipped cases include prompt/tool injection, poisoned knowledge, approval spoofing, transaction effects, loop limits, and subagent privilege behavior. These are central to the Safety Kernel and cannot be promoted from static GREEN to behavioral PASS without a capable harness.

### 4. Self-grading is not independent evidence

A result produced and graded by the same executor is provisional. It may be useful during development, but it must not satisfy the independent behavioral release gate.

### 5. The audit environments were not identical

The six reports did not all test the same exact state:

- Kilo Code primarily audited `271214dc898fbf118c9ab74c68547229660d4ac8`.
- Cline, Pi, Antigravity, Hermes, and OpenClaw primarily audited `fc644037a290421a0b4e3acba2b8529eddfbdb4c`.
- Several agents found 22 deleted tracked files in their local working directories.

Those local deletions are not treated as committed defects in current `main`. The current GitHub branch contains the plugin manifests, and the Claude plugin manifest identifies version `4.2.0`. Findings caused only by a dirty local checkout are therefore environment findings, not canonical repository findings.

## Reconciliation of major disagreements

### Release threshold

Some reports referenced a `16/18` threshold, while current repository documentation uses a 24-EV provenance-valid threshold. The canonical threshold is whatever is declared by the current `evals/rubric.md` and enforced by the current runner. Audit prose does not override repository policy.

### Provenance-valid count

The audit reports ranged from zero valid transcripts to a partial set. Current `main` documents 14 provenance-complete PASS transcripts, EV-25 through EV-38, while still explicitly stating that the threshold is not met and that Boss confirmation is false. This report does not inflate that count and does not convert audit opinions into behavioral PASS evidence.

### Transcript parser bug

OpenClaw reported a historical literal-`\\n` splitting defect. Current `main` uses line-based JSONL parsing with `splitlines()`. The parser implementation should still be covered by regression tests, but the historical observation is not presented here as an unfixed current-main defect.

### Working-tree deletions

Cline, Pi, Antigravity, Hermes, and OpenClaw observed missing manifests and CI files in their local checkout. Current GitHub `main` contains the plugin manifest and version metadata. The consensus records this as an audit-environment reproducibility issue, not a published-repository deletion.

## Canonical publication status

Hypertaks v4.2.0 may be described as:

- a published structural release;
- containing a Safety Kernel, deterministic tiering, state/transaction protocol, CORE profile, domain packs, Founder Operating Lens, and 44 eval definitions;
- structurally validated with 44/44 static preconditions GREEN;
- carrying partial behavioral evidence;
- not yet meeting the full provenance-valid behavioral release gate;
- not Boss-confirmed.

It must not be described as:

- 38/38 behaviorally proven;
- fully security-verified at runtime;
- independently certified across all EV cases;
- Boss-confirmed;
- unconditionally release-certified by this six-agent audit.

## Required next run

The next EV run should use one exact immutable tested commit and produce:

1. Fresh isolated sessions per case.
2. Verbatim prompts and responses.
3. Complete tool-call and tool-result records where the case requires tools.
4. A harness capable of injection, multi-turn, subagent, and transaction-effect cases.
5. Separate executor and grader identities.
6. Full commit, tree, and skill-root hashes.
7. One valid JSONL record per transcript file.
8. `confirmed_by_boss: false` unless the Boss explicitly confirms each accepted result.
9. A clean successful `python scripts/run_evals.py --report evals/results.yaml` run.
10. Documentation updates derived only from that successful report.

## Agent-by-agent disposition

| Agent | Structural/static | Behavioral certification | Final disposition |
|---|---|---|---|
| Cline | PASS / 38 GREEN | Report timed out; self-grading and documentation mismatch noted | Could not certify |
| Kilo Code | PASS / 38 GREEN | Conditional view, but acknowledged invalid report/transcript blockers | Conditional only |
| Pi | PASS / 38 GREEN | Report invalid; strong provenance objections | Do not release as behaviorally certified |
| Antigravity | PASS / 38 GREEN | Accepted recorded counts, but blocked release on checkout integrity | Not release ready |
| Hermes | PASS / 38 GREEN | Report invalid; evidence pipeline and docs failed | Not release ready |
| OpenClaw | PASS / 38 GREEN | Report invalid; core groups skipped and grading not independent | Not release ready |

## Final decision

**Publish this audit consensus, keep v4.2.0 available as a structural release, and do not upgrade its behavioral certification claim until a clean provenance-valid rerun passes the canonical gate.**

## Remediation status against canonical `origin/main`

The six reports were triaged again from commit `15fc01e` after the working tree
was preserved and `main` was fast-forwarded. The remediation accepted the
evidence-pipeline findings that reproduce on canonical `main`: mixed historical
provenance, placeholder or incomplete transcript fields, self-grading,
malformed JSONL records, insufficient evaluator regression coverage, repeated
skill-root hashing, and incomplete CI checks. The runner now rejects a report
whose metadata is not the current HEAD or whose rows disagree with the report
metadata; the hash is cached per commit; regression tests cover parser,
independent-grader, placeholder, commit/tree/hash, and self-grading failures;
CI runs the validator, structural/static checks, unit tests, and compileall.

The remediation rejected findings caused only by the auditors' dirty
checkouts: missing plugin manifests, missing CI, missing CORE/domain routing,
missing roles, and stray bundles. Canonical `main` contains those tracked
release assets, reports no generated scratch artifact, and already uses
`splitlines()` for JSONL parsing. No behavioral rerun was performed, no
`confirmed_by_boss` value was changed, and the legacy report still exits 1 by
design because its evidence is not provenance-valid for the current commit.

This is the merged conclusion of the six-agent audit. It supersedes individual release-readiness opinions, but it does not replace the canonical EV runner, rubric, transcripts, or `results.yaml`.
