# Security remediation report

Scope: targeted review of the remote MCP boundary, public skill authority instructions, persistence guidance, public packaging, and existing security regression coverage. This is not a scanner clearance or a universal codebase security certification.

## Confirmed findings and treatment

| Finding | Remediation | Calibration and proof |
| --- | --- | --- |
| Tool arguments bypassed declared enums/types/additionalProperties | Apply schema-driven type, enum, required-field, size and property validation before executing any tool. Null/array arguments are rejected; valid arguments are preserved. | Certain: live invalid-input probes reproduced the old issue; local MCP tests cover the corrected boundary. |
| Text-only clients could receive no readable skill body | Include complete result data in text alongside structuredContent. | Certain: local retrieval assertion passes and current production assertion fails. This fixes interoperability, not a demonstrated exploit. |
| Skill/kernel precedence wording was overly broad | State that conflict resolution is within Hypertaks and below host policy, explicit Boss instructions and applicable workspace standards. | Certain: inspected diff and 90 static preconditions. Actual host conduct remains to be tested. |
| Automatic context-creation wording contradicted authorization rules | Require approved PERM_FILE_WRITE, contained project root, canonical authorized bootstrap, and honest conversational fallback when local writes are unavailable. | Certain: source diff and existing project-context/permission security tests. No remote write capability was added. |
| Advisory contract permission names differed from the kernel | Replace PERM_SHELL/PERM_SEND_MESSAGE with PERM_EXECUTE/PERM_SEND_3P. | Certain: exact enum comparison; this removes instruction-level ambiguity. |
| Public package path was incomplete and could include untracked skill debris | Add an explicit complete public-package path, tracked canonical skill filtering, containment/symlink checks, secret-like content scanning, private-binding exclusion, and validation before atomic archive replacement. | Certain: successful archive inspection and tampering/untracked-debris regression tests. Pattern scanning is not proof that every possible secret format is detected. |

## Boundary review

Fairly certain, based on inspected handler/router code and executed discovery: the remote service exposes only manifest reading, canonical skill reading, routing and server-file integrity checks. It has no shell, user-repository, database-write or deletion tool. Skill file names are allowlisted; traversal requests are rejected. Read-only annotations match the observed tool behavior. Existing origin, bearer-token option, protocol/header handling, request-size limit and local bind protections remain in place.

The local Founder runtime remains a separate trusted host surface. Existing tests exercise approval-source/signature handling, forged proofs, permission grants, root/path containment, secret scanning, external-boundary rules and atomic-write failure recovery. No optional Graphify/Obsidian installation, background daemon, credential bundle or hosted service was added. This audit does not infer that arbitrary third-party hosts or connectors enforce the same permissions.

Instructions, tool results, retrieved files and graph/memory output retain their defined trust boundaries. The skill cannot grant itself authority to execute, publish, spend, delete or send data. Optional integrations and host actions still require their approved scope and permissions.

## Existing scanner finding

Uncertain: the saved rejected release's generic finding does not disclose the triggering rule or line. The dashboard identifies a pack-index skill named hypertaks; it does not establish a finding against the current canonical SKILL.md bytes. Broad precedence and automatic-creation wording are plausible triggers and were made precise because they were genuine instruction conflicts, not because a specific scanner rule was proved.

Required follow-up: after a separately authorized upload/deployment, verify that all five canonical skills are imported, run the required scans, inspect actual new findings and correlate them with the exact saved files/tool definitions. Do not claim the finding is cleared from local tests alone.

## Verification and limits

Certain: the full local npm gate passed, including 15 security tests, 44 V2 integration/security tests, 16 skill-integrity tests, and 12 MCP tests. Public-package tampering tests reject private bindings, secret-like content, path escape, version drift, missing canonical skills and nonempty server headers.

Production still uses the previous response/input-validation code. Its schema violations observed during the audit and its text-only retrieval failure remain unresolved until authorized deployment and retesting. ChatGPT web and mobile natural-language behavior is NOT VERIFIED. No approval or marketplace-security certification is claimed.

Evidence: `TEST-RESULTS.md`, `.build/openai-remediation/npm-test-all.txt`, `focused-security.txt`, `python-tests.txt`, `local-review.json`, `production-review.json`, and `archive-evidence.json`.
