# Hypertaks v4.5.0 Publish Readiness Report

**Date:** 2026-07-25
**Decision:** MERGE PENDING FINAL CI
**Release channel after merge:** Release Candidate
**Stable behavioral certification:** PENDING INDEPENDENT BEHAVIORAL RUNS
**Tag, package, deployment, or marketplace publication performed:** No

## Decision

Hypertaks v4.5.0 may be merged into `main` only after the complete GitHub Actions
workflow passes on the exact final candidate commit. After a green merge gate,
the source is suitable for the `Release Candidate` label. It is not suitable for
stable behavioral certification because the new v4.5 behaviors do not yet have
fresh independent cold-session evidence across supported hosts.

Static GREEN proves that required structures and code references exist. Python
and TypeScript tests prove the included local utilities execute as asserted.
Neither type of evidence alone proves every AI host will discover, route, and
apply all five skills identically.

## Merge gates

| Gate | Required result | Current evidence boundary |
|---|---|---|
| Version synchronization | PASS | Live package and inspected plugin records use 4.5.0 |
| Main skill preservation | PASS | `/hypertaks` remains the Founder Operating System entry point |
| Public skill boundary | PASS | Exactly five public Hypertaks skills are validated |
| Skill structure | PASS | Repository validator must complete successfully |
| Eval inventory | PASS | 88 definitions must validate |
| Static preconditions | PASS | 88/88 GREEN required |
| Python evaluator tests | PASS | Existing report provenance tests plus v4.5 inventory checks |
| Retrieval utilities | PASS | JSON report and non-empty PNG and SVG artifacts |
| TypeScript strict typecheck | PASS | Every runtime module under `runtime/**/*.ts` |
| TypeScript build | PASS | Compiled runtime output generated successfully |
| Runtime adversarial behavior | PASS | Path, authority, secret, Git, graph, and proof probes |
| Python compilation | PASS | `scripts/` compiles without syntax errors |
| Pull request diff integrity | PASS | `git diff --check origin/main...HEAD` |
| Historical behavioral evidence | PASS WITH SCOPE | 43/49 v4.3 cases passed, 6 harness skips |
| New independent behavioral evidence | PENDING | EV-50 through EV-88 require current cold-session runs |
| External publication | NOT PERFORMED | No tag, release, package, deployment, or marketplace submission |

## Security blockers closed by the candidate

The final candidate must continue to prove all of the following:

- memory record IDs cannot escape the approved root;
- pointer, Vault, checkpoint, memory, and graph output paths fail closed;
- shared decisions require a valid Boss approval proof;
- repository facts require current reproducible evidence;
- secrets are blocked from persistence and redacted from handoffs;
- Graphify cannot claim success without a real execution or direct search;
- shared Graphify HTTP requires HTTPS, authentication, and approved external
  access;
- resume reads actual Git state;
- proof of done derives from tests and acceptance evidence;
- exactly five public Hypertaks skills are discoverable.

## Release label requirements

After final CI passes, public source status may use language equivalent to:

```text
Hypertaks v4.5.0 Release Candidate
Static suite: 88/88 GREEN
Local Python and TypeScript verification: PASS
Five public Hypertaks skills: VERIFIED
Independent behavioral certification for EV-50 through EV-88: pending
```

It must not use:

```text
Behaviorally Certified 4.5.0
All 88 behaviors proven across hosts
Graphify verified on every host
Obsidian application integration
Stable cross-agent continuity certification
```

## Packaging boundary

Any later package must contain tracked plugin and skill source only. Exclude:

- `.build/`;
- `node_modules/`;
- `.hypertaks/` local pointers and state;
- generated Graphify output;
- Python caches;
- credentials and environment files;
- local agent state;
- temporary retrieval reports;
- local archives, bundles, copied repositories, and scratch directories.

## Merge sequence

1. Wait for the complete workflow on the exact final PR head.
2. Confirm every required step is green.
3. Review PR changed files and head SHA.
4. Squash-merge PR #12 into `main` to preserve one release work item on the
   release branch.
5. Verify the resulting `main` commit and run the workflow on `main`.
6. Do not create a tag, release, package, or marketplace submission without a
   separate Boss instruction.
7. Run fresh independent behavioral cases before any stable certification.

## Remaining risk

The principal remaining risk is cross-host behavioral portability. The local
runtime and static contract can be strongly verified, but host skill discovery,
MCP exposure, Graphify tool interfaces, Obsidian access, model compliance, and
cross-agent handoff behavior may differ. Those differences require real
behavioral transcripts rather than inferred confidence.

## Final status

**MERGE PENDING FINAL CI**

**RELEASE CANDIDATE AFTER GREEN MERGE GATE**

**NOT READY TO CLAIM STABLE BEHAVIORAL CERTIFICATION**
