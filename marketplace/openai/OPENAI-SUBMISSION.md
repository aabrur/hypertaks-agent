# OpenAI public submission preparation

## Product and existing identity

- **Canonical Version:** 0.0.4.5.9
- Product: Hypertaks Founder Operating System.
- Existing rejected submission: `asdk_app_6a851e5881dc81919fd10e98f7e19b80`.
- Saved rejected package version: `4.5.2`.
- Observed organization: Crimson Rift Studio.
- Observed developer display name: MOHAMAD ABRUR ALAINA.
- Separate personal plugin: `asdk_app_6a7232a7695c8191bef1761c87c2b2d8`. Updating it does not remediate the rejected submission.

Keep App identifiers in preparation notes and the existing dashboard record. The author-supplied public ZIP contains no private App binding. Upload to the existing submission only when Boss authorizes that action.

## Package format and build

The public upload is one Agent Plugins 1.0 package containing root `plugin.json`, root `mcp.json`, exactly five canonical directories under `skills/`, and referenced assets. It excludes the old pack index `skills/SKILL.md`, personal bindings, host-local configuration, runtime databases, dependency folders, and unrelated source files. Root `extensions.com.openai` supplies listing and review metadata; it takes precedence over the compatibility overlay.

```sh
python scripts/build_distributions.py openai
python scripts/validate_openai_submission.py .build/plugins/openai/hypertaks-plugin-0.0.4.5.9.zip
```

The build validates the actual archive before atomically replacing the output. Skill files are copied byte-for-byte from tracked canonical sources. New, explicitly named public manifests are included without staging unrelated files. The five-part product version is retained from the existing update scheme. Agent Plugins' schema accepts a version string; dashboard acceptance of this version scheme still requires verification.

For standalone skill exports only, retain the separate compatibility command:

```sh
python scripts/build_distributions.py openai-skills
```

Those five skill ZIPs are not a complete public plugin submission.

## Supported integration

- MCP endpoint: https://hypertaks.crimsonriftstudio.com/mcp
- Health: https://hypertaks.crimsonriftstudio.com/healthz
- Manifest: https://hypertaks.crimsonriftstudio.com/manifest
- Transport: Streamable HTTP.
- Authentication: no authentication on the presently verified public read-only endpoint.
- Exactly four tools: `hypertaks_manifest`, `hypertaks_get_skill`, `hypertaks_route`, `hypertaks_verify_installation`.

The adapter routes requests, reads public skill text, reports product limits, and hashes its server deployment. It cannot access a user device, execute commands, write memory, inspect private repositories, delete records, or prove completed business work. A capable local host or separately authorized connector is required for those workflows.

## Listing and review metadata

All four listing URLs, actual PNG icons, five positive cases, three negative cases, and release notes are declared in `plugin.json`. The cases are also mirrored in the existing review export `marketplace/openai/chatgpt-app-submission.json`; that legacy export is not a public-package manifest.

- Website: https://hypertaks.crimsonriftstudio.com
- Support: https://hypertaks.crimsonriftstudio.com/support
- Privacy: https://hypertaks.crimsonriftstudio.com/privacy
- Terms: https://hypertaks.crimsonriftstudio.com/terms

The published privacy page is accessible but needs correction. A URL returning HTTP 200 does not establish compliance. See `PRIVACY-GAPS.md` and `PRIVACY-POLICY-DRAFT.md`.

Do not invent a demo URL, country targeting, commerce declaration, reviewer credentials, or policy attestations. Omitted review scalar values and publication targeting preserve saved values under the documented import behavior. Verify those values in the existing dashboard before submission.

## Validation boundaries

`validate_openai_submission.py` validates archive paths, pinned Agent Plugins schemas, metadata lengths, PNGs, exact skills, review fields, version synchronization, secret-like content, and absence of private bindings. It is a package-format and content check. It does not certify ChatGPT tool selection, mobile behavior, legal compliance, a cloud deployment, or marketplace approval.

`check_openai_mcp_review.mjs` performs direct protocol probes associated with the eight review scenarios. It explicitly marks ChatGPT web and mobile behavior NOT VERIFIED. Remote deletion and shell probes verify absence of those capabilities; they do not prove how a model answers the natural-language prompt.

## Remaining owner and dashboard work

1. Review the local remediation and test evidence.
2. Confirm the hosting/logging/retention and user-control facts in `PRIVACY-GAPS.md`, then separately authorize publication of the complete policy.
3. Deploy the MCP corrections only with explicit authorization, then repeat production checks.
4. Record and host a real walkthrough showing the eight cases, verify playback and access, and set the recording URL. A script is not a recording.
5. Confirm existing country availability and commerce settings. Use the observed organization and verified developer identity.
6. When authorized, upload the complete ZIP to the existing rejected submission, confirm the imported five skills, unchanged MCP URL, and associated App ID, complete domain verification and connection, and run required skill/tool scans. Do not create a duplicate App.
7. Run all eight cases in ChatGPT web and mobile against the saved candidate and record actual tool choices, arguments, and visible results.
8. Read the new security findings. The existing scanner provided only a generic warning, not a rule or affected line.
9. Have the authorized owner complete the attestations. Submission and publication remain separately authorized actions.

References: [package format](https://developers.openai.com/plugins/build/plugins), [submission and field mappings](https://developers.openai.com/plugins/deploy/submission), [skill instruction review](https://developers.openai.com/plugins/build/skills#review-instruction-following), and [security and privacy](https://developers.openai.com/plugins/guides/security-privacy).
