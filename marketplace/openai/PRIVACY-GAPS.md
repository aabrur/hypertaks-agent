# Privacy policy gaps and owner decisions

Status: corrections drafted locally; published policy remains unchanged and incomplete.

## Verified processing and evidence

| Area | Finding | Calibration and basis |
| --- | --- | --- |
| Public service | Website and MCP responses are hosted through Vercel. The site configuration rewrites `/mcp`, `/healthz`, and `/manifest` to `hypertaks-agent.vercel.app`. | Certain: live response headers, accessible pages, and the separately inspected website rewrite configuration. |
| Remote inputs | JSON-RPC IDs, method names, initialization client metadata, a canonical skill name, and routing text with optional preferred skill and diagnostics are accepted. Routing text can contain information the client or user includes. | Certain: `runtime/mcp-server.mjs` input definitions and live discovery. |
| Purpose | Inputs support protocol negotiation, public skill retrieval, deterministic routing, and server installation integrity checks. | Certain: four tool implementations and observed responses. |
| Remote outputs | Product/version limits, route/next-tool guidance, public skill text, file paths relative to the server repository, and SHA-256 integrity evidence are returned to the requesting client. | Certain: implementation and live responses. |
| Application persistence | The inspected remote handler and canonical public router expose no user database, request-content file writer, or request-content logger. Request data is handled in memory while forming a response. | Fairly certain: inspected source matches the production build revision; cloud settings were not inspected. This does not establish infrastructure retention. |
| Recipients | Vercel receives traffic needed to host and proxy the service. The requesting MCP client receives responses; ChatGPT/OpenAI receives them when used through ChatGPT. Optional local hosts and explicitly connected services have their own processing. | Certain for the observed service path; additional recipients need owner confirmation. |
| Local data | The local runtime can persist approved project context, pointers, memory, checkpoints, and evidence in project storage or an approved external local brain/vault. Optional Graphify/MCP integrations can send authorized data to their configured services. | Certain: `runtime/founder-brain.ts`, public skills, and optional executor boundaries. Local operation is not a universal promise that the host/model keeps data offline. |
| Public policy | `/privacy` returns the policy dated August 25, 2026. It mentions local storage, remote memory processing, generic infrastructure logs, and a maintainer contact. | Certain: live content inspection. |

## Gaps in the published policy

- It does not enumerate current tool inputs and outputs, including free-form routing text and initialization metadata.
- Hosting/log retention is described only as being managed under provider policies. No actual duration, applicable setting, deletion process, or exceptions are established.
- It lacks clear user controls for disconnecting the client, managing local retained records, and requesting privacy assistance. Disconnecting does not prove deletion of provider logs or client conversation history.
- Recipients and their purposes need a clear service-by-service explanation, including the hosting/proxy path and the requesting ChatGPT client.
- Claims about logs not being sold, linked to profiles, or retained elsewhere require owner confirmation. Source inspection cannot prove contractual or organization-wide practices.
- The local-only wording does not adequately distinguish Hypertaks persistence from host/model processing, optional external connectors, user-enabled sync, or support-channel data.

## Required owner confirmations

1. Identify the actual Vercel projects and plans serving the website and adapter, access/runtime log products, analytics, log drains, observability settings, backups, and anyone with access to those records.
2. Confirm exactly which HTTP fields or bodies are logged, every applicable retention period, deletion mechanisms and exceptions, processing regions, and any additional processors. Do not substitute a provider's generic default for this account's settings.
3. Confirm the purposes and retention of email/GitHub support correspondence and the process for privacy/access/deletion requests, identity verification, and any response commitments.
4. Confirm controller/publisher details, contact ownership, data sale/sharing practices, secondary uses, model-training uses, and legal/security retention obligations. No such business-policy guarantees are inferred from absence of database code.
5. Confirm whether analytics, cookies, marketing pixels, optional sync, or other integrations are enabled in the deployed website or infrastructure. Inspected code alone cannot exclude deployment-level features.

The separate website repository was read for evidence only. Publishing the corrected policy and changing its pages require separate authorization. No owner decisions above have been fabricated or silently inserted into the public package.

The draft's factual sections are ready for owner review. Its unresolved decisions must be completed before it becomes a complete, publishable policy. An accessible existing URL and a local draft do not resolve the rejection.

Reference: [OpenAI Security and Privacy](https://developers.openai.com/plugins/guides/security-privacy) and [MCP review requirements](https://developers.openai.com/plugins/deploy/app-review).
