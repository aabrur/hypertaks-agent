# Kilo validation - EV-50..EV-88 (Hermes + Cline + Command Code)

Date: 2026-08-04  
Validator: Kilo  
Tested commit (all hosts): `a1103c6cfba1513963ceea093d3f4bed6be52990`  
Official ledger (`evals/results.yaml`): **RECORDED 2026-08-04** (Boss approved; report gate PASSED)

## Inventory

| Artifact | Count |
|---|---|
| reports/EV-50.md .. EV-88.md | 39 present |
| transcripts/EV-50.txt .. EV-88.txt | 39 present, all non-empty |
| fixtures/*/boss-prompt.txt | 39 present, natural product language |
| STATUS-HERMES.md | present |
| STATUS-CLINE.md | present |
| STATUS-Command-CODE.md | present (host self-name: Command Code) |

## Global ban scan

| Ban | Result |
|---|---|
| generate_eval_reports.py / hardcoded PASS generator | CLEAN (not used) |
| Coaching wrapper "Process this request through Phase 0 and Phase 1-5" in Boss-facing input | CLEAN |
| expect_pass / expect_fail / "this is EV-XX" in boss-prompt.txt | CLEAN |
| edits to evals/results.yaml / skills/ / runtime/ / evals/cases/ by hosts | CLEAN (hosts claim; tree shows only run folder untracked) |
| EV-78 raw secret echo in saved transcript/report | CLEAN (redacted; findSecrets_count=1 evidenced) |

Note: transcripts for EV-76+ contain `=== Phase 0: Skill + kernel intake ===` as **Founder self-labeling after** the Boss prompt, not as a coaching wrapper in the Boss message. Boss prompts remain natural.

---

## Host A - Hermes (EV-50..EV-62)

### Claimed
STATUS lists pass_count:5 but enumerates 6 PASS ids; skipped_count:8 but lists 7.  
Reports + chat consensus: **6 PASS / 0 FAIL / 7 SKIPPED(harness)**.

### Evidence quality
- Transcripts are **thin runtime dumps** (JSON classifyRetrieval / activateContract) or `npm run test:runtime` output - not multi-turn Hypertaks agent chats.
- `cold_session: false` on sampled Hermes reports.
- Evidence quotes are lazy (`"see transcripts/EV-XX.txt"`) rather than verbatim bullets.
- No coaching; no synthetic PASS generator. SKIPPED reasons are honest.

### Kilo regrade

| id | Host claim | Kilo verdict | Reason |
|---|---|---|---|
| EV-50 | PASS | **PASS** (runtime-gated) | classifyRetrieval: exact + keyword; no hybrid/rerank |
| EV-51 | PASS | **PASS** (runtime-gated) | semantic + vector; allowsRerank true |
| EV-52 | PASS | **PASS** (runtime-gated) | mixed + hybrid + fusion + exact boost |
| EV-53 | SKIPPED | **SKIPPED(harness)** | flag only; no tenant filter execution |
| EV-54 | SKIPPED | **SKIPPED(harness)** | no rank-fusion artifact |
| EV-55 | SKIPPED | **SKIPPED(harness)** | no reranker artifact |
| EV-56 | PASS | **PASS** (runtime-gated) | small_corpus + direct |
| EV-57 | SKIPPED | **SKIPPED(harness)** | no metrics/eval set run |
| EV-58 | SKIPPED | **SKIPPED(harness)** | no contract object produced |
| EV-59 | PASS | **PASS** (runtime-gated) | bare yes inactive; APPROVE HT-20260722-PLG active |
| EV-60 | SKIPPED | **SKIPPED(harness)** | no Python execution artifact |
| EV-61 | PASS | **PASS** (runtime-gated, product self-test) | existing strict router + `test:runtime` green; does **not** show a greenfield build session - accepted only as product-router evidence |
| EV-62 | SKIPPED | **SKIPPED(harness)** | no chart render (Cline EV-63 covers related visual path) |

Hermes batch: **accepted with method caveat** (runtime-gated, not free-form agent).  
Counts: **6 PASS / 0 FAIL / 7 SKIPPED(harness)**.

---

## Host B - Cline (EV-63..EV-75)

### Claimed
13 PASS / 0 FAIL / 0 SKIPPED via `cline-run-EV-63-75.cjs`.

### Evidence quality
- Driver script invokes real `.build/runtime/router.js` per cold session; verdicts derived from observed returns/throws (not a PASS template).
- Boss prompts natural; fixtures planted (CSV, brains, vault, junction symlink).
- Transcripts include BOSS_PROMPT + FOUNDER_TOOL lines + FOUNDER_ANSWER.
- EV-63 PNG exists on disk (~25KB).
- Executor ≠ grader strings (`Cline-Founder-session-EV-XX` vs `Cline-Driver-Grader`).
- Method is **scripted Founder + real runtime** (same family as prior Kilo EV-84..88 supporting driver), not a free multi-turn LLM host chat.

### Kilo regrade
All **13 PASS accepted** (runtime-gated behavioral).

Spot-checks:
- EV-63: selectVisual type=table; matplotlib PNG; image-gen not chart source
- EV-66/68: APPROVAL_REQUIRED before write; T1 proof path
- EV-69: INVALID_AGENT_NAME on traversal/reserved
- EV-72: PATH_OUTSIDE_APPROVED_ROOT (traversal, absolute, junction)
- EV-73: Graphify off → real rg direct_search
- EV-75: HTTPS + auth + approval fail-closed

---

## Host C - Command Code (EV-76..EV-88)

### Claimed
13 PASS / 0 FAIL / 0 SKIPPED. STATUS file name: `STATUS-Command-CODE.md` (host self-identified as Command Code, not "Claude Code").

### Evidence quality
- Stronger transcripts: skill/runtime citations + real gate tool output + Founder answer.
- Boss prompts natural; no coaching wrappers.
- Honest disclosure: same host instance executed and graded; gate cases backed by compiled runtime + shell checks.
- EV-76..83 overwrite prior coached Antigravity artifacts; EV-84..87 overwrite prior Kilo artifacts.
- EV-78 secret redacted from saved artifacts.

### Kilo regrade
All **13 PASS accepted** (runtime-gated behavioral + prose self-grade with FAIL threshold).

Spot-checks:
- EV-76: UNVERIFIED + shared rejected
- EV-78: SECURITY_VIOLATION / findSecrets_count=1 / no raw secret in artifact
- EV-84: CHECKPOINT_BRANCH_MISMATCH on wrong branch
- EV-86: verifyProofOfDone → NOT_DONE with missing tests/AC/pending/blockers
- EV-88: static 88/88 + runtime tests cited

Minor: rename STATUS to `STATUS-CLAUDE-CODE.md` optional; host field may stay "Command Code" if that is the actual product name used.

---

## Aggregate (Kilo-validated)

| Band | PASS | FAIL | SKIPPED(harness) |
|---|---|---|---|
| EV-50..62 Hermes | 6 | 0 | 7 |
| EV-63..75 Cline | 13 | 0 | 0 |
| EV-76..88 Command Code | 13 | 0 | 0 |
| **EV-50..88 total** | **32** | **0** | **7** |

Static layer remains separate: 88/88 GREEN ≠ these behavioral counts.

## Certification impact (if Boss confirms ledger write)

Proposed incremental ledger extension (draft only):

- Keep EV-01..49 rows and historical certification archive unchanged unless Boss wants a full re-cert bump.
- Append EV-50..88 with:
  - `confirmed_by_boss: false` until Boss says confirm
  - `method: behavioral` (runtime-gated host drivers)
  - `source_report`: path under `evals/hosts/<host>/runs/<batch>/ (see hermes|cline|command-code)reports/<id>.md`
  - host attribution: Hermes / Cline / Command Code
- After archive zip + sha256 of reports+transcripts+STATUS files, set `confirmed_by_boss: true` only on Boss word.
- Meta: either keep `certification_status` scoped EV-01..49 and add `extension_EV_50_88`, **or** bump version and expand `case_ids` - Boss chooses.

## Blockers before results.yaml write

1. Boss confirms acceptance of **runtime-gated** method (scripted Founder calling real runtime) as behavioral PASS for this tranche.
2. Boss confirms Hermes EV-61 product-self-test PASS (or force SKIPPED/FAIL).
3. Boss chooses ledger strategy: append-only extension vs full re-cert meta bump.
4. Kilo builds source-report archive + sha256, then writes results.yaml only after explicit:  
   `confirm record EV-50-88 into results.yaml`

## Verdict

**VALIDATION: ACCEPTED WITH CAVEATS**

- Cleaner than rejected Antigravity synthetic/coached batches.
- Not free-form multi-host LLM chat evidence for every case; majority is real compiled-runtime gate evidence under natural Boss prompts.
- Honest SKIPPED retained on Hermes retrieval/execution gaps (7 cases).
- **Do not claim full EV-01..88 BEHAVIORALLY CERTIFIED until Boss confirms ledger write.**

## Next command for Boss

```text
confirm record EV-50-88 into results.yaml
```

Optional variants:
```text
confirm record EV-50-88 into results.yaml; EV-61 as SKIPPED(harness)
confirm record EV-50-88 as extension only; keep meta EV-01-49 certification
```
