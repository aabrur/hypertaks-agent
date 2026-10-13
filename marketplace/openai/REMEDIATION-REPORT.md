# Hypertaks OpenAI rejection remediation

Finalized October 14, 2026, Asia/Jakarta. Audit began October 13. Base checkout: `main` at `b549b2274054aa239f85e2504aa83776c37673c8`. This report records the remediation evidence before Git delivery was subsequently authorized.

## Outcome and completion boundary

Certain, based on local validation and archive inspection: the requested local remediation and a package-format-validated draft ZIP are prepared. The five canonical skills, four MCP tools, product namespace, existing endpoint, and Founder Operating System architecture are preserved.

Resubmission remains blocked by owner privacy decisions/publication, authorized deployment, review recording, saved MCP setup/scans, and ChatGPT web/mobile testing. At the remediation handoff, the dashboard's actual state was Not published / Changes required. No deployment, upload, submission, publication, App creation, commit, or push had been performed at that point.

The subsequent Git-only delivery uses `git.deploymentEnabled.main: false` in `vercel.json` to hold automatic Vercel deployment from `main`. Enable or bypass that hold only when deployment is explicitly authorized. This setting follows [Vercel's Git configuration](https://vercel.com/docs/project-configuration/git-configuration) and leaves the public ZIP unchanged.

## Rejection evidence and root causes

| Finding | Evidence and causal limit | Calibration |
| --- | --- | --- |
| Incorrect review outcomes | The September 1 rejection email identifies inconsistent test results. Historical repository guidance expected business analysis, environment setup, repository graph searches, and proof of done that the four remote tools do not themselves perform. No reviewer execution transcript identifies the exact failed case. | Certain about the feedback and capability mismatch; fairly certain this contributed to rejection. |
| Incomplete privacy disclosure | The live August 25 policy omits precise current inputs/outputs, account-specific retention, clear recipients, and user controls. It uses infrastructure-policy language without establishing actual settings. | Certain from live policy inspection; owner practices still need verification. |
| Saved skill discovery | The rejected v4.5.2 dashboard displays one `hypertaks` skill whose description identifies it as a pack index pointing into five folders. The five canonical entries are not shown as separate imported skills. The historic author-upload ZIP was not downloaded or byte-inspected. | Certain about the displayed skill inventory; the exact importer failure mechanism is uncertain. |
| Saved MCP discovery | The existing App shows Endpoint unavailable, authentication/domain verification unavailable, no MCP key, and disabled Rescan. In contrast, production `/healthz`, `/manifest`, initialization, and tools/list returned HTTP 200 and the four tools. | Certain: incomplete saved setup is distinct from an endpoint outage. |
| Current public upload path | The prior OpenAI builder emitted five standalone skill ZIPs. Root `plugin.json` lacked its portable schema and `mcp.json` was absent. The Codex overlay lacked its MCP pointer, three legal/support URL fields and icons, and had a 50-character subtitle against the documented 30-character limit. The saved dashboard already contains listing URLs; source omissions do not prove those fields were absent from the historical submission. | Certain from source inspection and current documentation. |
| Schema enforcement | Production accepted invalid preferred skills, null diagnostics, and extra argument properties despite its published enums/types and additionalProperties false. | Certain: direct live probes reproduced this contract defect. |
| Text-only skill retrieval | Production returned only a loaded message in content text, with the actual skill in structuredContent. A client consuming text alone cannot read the returned instructions. The corrected case fails this assertion against current production. | Certain at the protocol boundary; its effect in a particular ChatGPT client needs verification. |
| Version/readiness records | Repository/runtime records currently use 0.0.4.5.9, while the submission guide still said 4.5.2 and the website JSON-LD showed 4.5.8. The old source status described an account blocker despite accessible dashboard inspection. | Certain: source guide/status corrected; separate website and saved old release are unchanged. |
| Security finding | The saved pack index has a generic potential security-risk finding. Its details give no rule or affected line. Authorization wording in current canonical sources had genuine conflicts, but these are not proof of what triggered that scanner. | Security-scanner cause uncertain. |

## Surgical changes

- Root portable manifest and remote MCP configuration now declare the existing HTTPS endpoint, OpenAI no-auth extension, complete listing URLs, existing PNG icons, release notes, and the eight review cases. The compatibility overlay is synchronized.
- Public building now creates one complete plugin ZIP. Standalone skill exports remain available through `openai-skills`. The new path excludes the pack index, private bindings, untracked skill debris, dependencies, and unrelated files; it checks contained sources and validates the temporary archive before atomic replacement.
- Tool calls now enforce the four advertised input schemas. Existing valid routing behavior is retained; invalid external overrides are rejected. Local router helper fallback behavior is unchanged.
- Tool results include serialized data in text for clients that do not consume structuredContent.
- Skill/kernel precedence is explicitly below system/developer policy and explicit user instructions. Project context creation requires an approved contained root and PERM_FILE_WRITE. Contract permission tokens now match the kernel.
- Review expectations describe routing and server integrity, without claiming local access or business execution. Negative cases cover unsupported remote deletion/shell execution and nonexistent skills. The contradictory generic-coding exclusion was replaced with supported boundary tests.
- Version validation now includes root plugin metadata, the review export, and the current submission guide. The existing five-part update version is preserved; the Agent Plugins schema accepts a string, but dashboard acceptance is NOT VERIFIED. Record schema versions such as 4.5.1 are persistence formats, not release-version drift.
- Eval EV-03's structural precondition now checks the scoped authority wording without changing its behavioral pass/fail criteria. Regression tests were updated to require schema rejection of invalid MCP overrides rather than silent fallback.

## Package and evidence

- Archive: `.build/plugins/openai/hypertaks-plugin-0.0.4.5.9.zip`
- Size: 584618 bytes; 46 files.
- SHA-256: `90ebeab67aa090659ebbafcac3d992440ee57ad5b43969723eb0212360b2ea3f`.
- Exactly five skills, one remote MCP server, five positive and three negative review cases.
- Included public source bytes and review metadata match the working source. Detailed inventory: `.build/openai-remediation/archive-evidence.json`.
- No private App binding is included. Existing submission identity is retained in preparation notes and must be preserved in the dashboard update flow.

The pinned Agent Plugins schemas were retrieved from their declared schema URLs. OpenAI documents a per-server authentication extension not present in the base MCP schema. Validation therefore checks the portable MCP core against that schema and separately requires exactly the documented no-auth OpenAI extension. This distinction is explicit; no general unknown-field exemption is applied.

See [test results](TEST-RESULTS.md), [security remediation](SECURITY-REMEDIATION.md), [privacy gaps](PRIVACY-GAPS.md), and [owner-review policy draft](PRIVACY-POLICY-DRAFT.md).

## Outstanding owner and manual steps

1. Confirm actual hosting logs, all processors, retention/deletion practices, support-data handling, and privacy-request controls, then complete and separately authorize publication of the corrected policy.
2. Separately authorize deployment of the MCP corrections. Re-run the eight production protocol checks and invalid-input checks against the deployed candidate.
3. Record and host a real demonstration of the review cases. Verify playback and reviewer access. No recording URL was invented or inserted.
4. Confirm the verified publisher identity, countries and commerce settings already saved in the dashboard. The observed organization is Crimson Rift Studio and developer display name is MOHAMAD ABRUR ALAINA; display text alone does not verify identity-verification status.
5. When authorized, use the existing rejected submission `asdk_app_6a851e5881dc81919fd10e98f7e19b80` for the complete ZIP update. Confirm the imported skill inventory, endpoint, version scheme and associated App ID. Stop if the flow proposes a duplicate App or an endpoint change. Do not update the separate personal plugin as a substitute.
6. Complete the exact dashboard domain challenge, no-auth MCP connection and tool discovery. Re-run required metadata, skill and tool scans. Read any specific new security findings.
7. Run all five positive and three negative prompts in ChatGPT web and mobile against the saved candidate. Capture actual tool choices, arguments and user-visible responses. Direct protocol checks do not replace this.
8. Have the owner complete policy attestations and explicitly authorize submission. Publication remains a later action requiring approval and authorization.

Sources: [OpenAI package format](https://developers.openai.com/plugins/build/plugins), [submission fields and lifecycle](https://developers.openai.com/plugins/deploy/submission), [skill instruction review](https://developers.openai.com/plugins/build/skills#review-instruction-following), and [security/privacy requirements](https://developers.openai.com/plugins/guides/security-privacy). Dashboard observations and supplied email are evidence, not a guarantee of the next review outcome.
