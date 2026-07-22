# Hypertaks v4.4.0 Publish Readiness Report

**Date:** 2026-07-22
**Decision:** READY TO PUBLISH AS A RELEASE CANDIDATE
**Stable certification:** PENDING INDEPENDENT BEHAVIORAL RUNS
**External publication performed:** No

## Decision

Hypertaks v4.4.0 is ready to be packaged and published with the explicit
`Release Candidate` label. It is not ready to claim stable behavioral
certification because the sixteen new v4.4 cases do not yet have independent
cold-session behavioral transcripts.

This distinction is material. Static GREEN proves that the required structures
exist. Python and TypeScript tests prove the included local utilities execute as
claimed. Neither type of evidence alone proves the full skill will exhibit each
new behavior across independent hosts and models.

## Publish gates

| Gate | Result | Evidence |
|---|---|---|
| Version synchronization | PASS | Live manifests and package metadata use 4.4.0 |
| Skill structure | PASS | Validator completed successfully |
| Eval inventory | PASS | 65 definitions validated |
| Static behavior preconditions | PASS | 65/65 GREEN |
| Python tests | PASS | 24/24 unit tests |
| Retrieval evaluation utility | PASS | JSON report generated from fixture |
| Matplotlib artifact generation | PASS | Non-empty PNG and SVG outputs |
| TypeScript strict type-check | PASS | `tsc --noEmit` |
| TypeScript build | PASS | Runtime compiled successfully |
| TypeScript runtime behavior | PASS | Router tests completed successfully |
| Repository figures | PASS | Figure 1 through Figure 4 regenerated |
| Patch integrity | PASS | `git diff --check` |
| Historical behavioral evidence | PASS WITH SCOPE | 43/49 v4.3 cases passed, 6 harness skips |
| New independent behavioral evidence | PENDING | EV-50 through EV-65 require cold-session runs |
| External side effects | NOT PERFORMED | No push, tag, release, marketplace submission, or deployment |

## Release label requirements

The public release must use language equivalent to:

```text
Hypertaks v4.4.0 Release Candidate
Static suite: 65/65 GREEN
Local Python and TypeScript verification: PASS
Independent behavioral certification for EV-50 through EV-65: pending
```

It must not use:

```text
Behaviorally Certified 4.4.0
All 65 behaviors proven across hosts
Production-certified hybrid RAG
Automatic MCP integration on every host
```

## Packaging requirements

Before publication, package only tracked source and generated release figures.
Exclude:

- `.build/`
- `node_modules/`
- Python caches
- credentials and environment files
- local agent state
- temporary retrieval reports
- local archives and bundles
- copied repositories or scratch directories

## Publication sequence

1. Review the final committed diff.
2. Create the source archive, patch, and Git bundle from the committed tree.
3. Verify each artifact hash and open the source archive listing.
4. Publish with the Release Candidate disclosure.
5. Run EV-50 through EV-65 in independent cold sessions.
6. Grade with preserved transcripts and provenance.
7. Promote to stable only after the behavioral gate passes.

## Risk statement

The principal remaining risk is behavioral portability, not missing structure
or local build failure. The new routers and rules are present and locally
verified, but host capability descriptions, model compliance, and connector
behavior can vary. The release correctly falls back when capabilities are
unavailable, but that behavior still requires independent end-to-end evidence.

## Final status

**READY TO PUBLISH AS A RELEASE CANDIDATE**

**NOT READY TO CLAIM BEHAVIORAL CERTIFICATION**
