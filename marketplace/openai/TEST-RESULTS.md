# Verification results

Latest results were observed after the implementation repairs. Certain: statuses below come from executed commands and stored output, not predicted outcomes.

## Local gate

| Check | Result | Evidence under `.build/openai-remediation/` |
| --- | --- | --- |
| Skill validation and five-skill surface | PASS | `skill-validation.txt`, `public-skills.txt` |
| Eval integrity | PASS: 90 definitions | `eval-integrity.txt` |
| Static eval preconditions | 90/90 GREEN; no behavioral certification | `static-evals.txt` |
| Python unit/integration/distribution tests | PASS: 96 tests | `python-tests.txt` |
| TypeScript typecheck and build | PASS | `npm-test-all.txt` |
| Router and project-context assertion suites | PASS | `npm-test-all.txt` |
| MCP integration and input-schema tests | PASS: 12 tests | `npm-test-all.txt`, `focused-mcp.txt` |
| V2 runtime integration/security | PASS: 44 tests | `npm-test-all.txt` |
| Stress | PASS: 10 tests | `npm-test-all.txt` |
| Security | PASS: 15 tests | `npm-test-all.txt`, `focused-security.txt` |
| Skill integrity | PASS: 16 tests | `npm-test-all.txt` |
| Router edge cases | PASS: 22 tests | `npm-test-all.txt` |
| Complete distribution gate | PASS | `distribution-checks.txt` |
| Conformance and host-capability validators | PASS: static/evidence-record validation | Outputs observed; this does not establish live host behavior |
| Retrieval fixture utility and plot generation | PASS; JSON, PNG, SVG produced | `retrieval.json`, `retrieval-quality.png`, `retrieval-quality.svg` |
| Python compilation, Node syntax, diff formatting | PASS | `validation-exits.json` and associated logs |
| Actual public archive checks | PASS: format/content restrictions and source consistency | `archive-evidence.json` |

The final `npm run test:all` and full Python run exited 0. Node TAP suites report 119 passing tests in total, plus the separate router/project-context assertion scripts. Static catalog labels such as 22/22 describe repository compatibility records, not newly executed tests in 22 hosts.

## Eight review scenarios

These PASS/FAIL values cover direct JSON-RPC probes associated with the scenarios. They do not test natural-language model selection, workflow completion, or ChatGPT display behavior.

| Case | Scenario | Local protocol | Production protocol | ChatGPT web | ChatGPT mobile |
| --- | --- | --- | --- | --- | --- |
| P1 | Route a founder business diagnosis request to the main Hypertaks skill. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| P2 | Verify the Hypertaks installation and exact five public skills. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| P3 | Retrieve one canonical Hypertaks skill by exact name. | PASS | FAIL | NOT VERIFIED | NOT VERIFIED |
| P4 | Route a founder-shaped request when the user has not named a specific skill. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| P5 | Route a founder memory request through the supported MCP interface. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| N1 | Remote deletion is unsupported. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| N2 | Remote shell execution is unsupported. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| N3 | Only canonical skill names can be retrieved. | PASS | PASS | NOT VERIFIED | NOT VERIFIED |

Local: 8/8 protocol probes PASS. Production: 7/8 PASS. The production P3 failure is the text-only skill-content assertion: the hosted response says the skill was loaded while its text projection omits the body. The corrected local server returns that body in text and structuredContent. Production was intentionally not deployed.

Negative deletion/shell probes call nonexistent tool names and observe -32601; the missing-skill probe observes isError true. These prove the protocol boundaries only. They do not prove that ChatGPT refuses the corresponding natural-language requests.

Saved review materials were checked against the implementation. The manifest's prompts and expected behavior match the existing review export exactly. Tool discovery still exposes four tools, and all have readOnlyHint true, openWorldHint false, destructiveHint false, and idempotentHint true.

Raw tool requests, HTTP statuses, responses and assertion outcomes are in `local-review.json` and `production-review.json`. Both files explicitly mark ChatGPT web/mobile NOT VERIFIED. The public candidate has not been uploaded, its saved MCP configuration is unavailable, and mobile execution access was not provided.

## Initial failures and repairs

- First static run: 89/90 because EV-03 searched for old unconditional override wording. Its precondition was updated to check scoped authority below system/developer policy; behavioral criteria were preserved. The associated three evaluator-test failures then passed.
- First public build: the base Agent Plugins MCP schema rejected OpenAI's documented auth extension. Validation now checks the base portable core and the exact supported OpenAI extension separately; unknown extension fields remain rejected.
- Two MCP regression groups expected invalid preferredSkill fallback. They now require external schema rejection while retaining unit-helper fallback assertions.
- A later security test expected the legacy canonical-skill error wording. That message was preserved in the new validation path; the full gate then passed.

These initial failures were not counted as successful runs. The source fixes were completed before the verification reruns. Production's remaining failure is still open, as are every ChatGPT web/mobile scenario, policy compliance, recording, saved scans and marketplace approval.
