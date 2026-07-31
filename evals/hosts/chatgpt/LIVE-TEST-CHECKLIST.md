# ChatGPT Live Host Certification Checklist

Use this checklist only in an eligible ChatGPT workspace with Developer mode and Plugins access. Local MCP tests are not live-host certification.

## Evidence header

Record before testing:

- Date and timezone
- ChatGPT plan and workspace type
- Browser and operating system
- Hypertaks repository commit
- Deployed MCP endpoint commit
- Endpoint URL with secrets removed
- Tester and reviewer

## Connection

1. Deploy or tunnel the Hypertaks MCP endpoint over HTTPS.
2. Add the endpoint ending in `/mcp` through ChatGPT Developer mode.
3. Confirm the tool scan discovers exactly these four read-only tools:
   - `hypertaks_manifest`
   - `hypertaks_get_skill`
   - `hypertaks_route`
   - `hypertaks_verify_installation`
4. Confirm no write, delete, update, deploy, publish, shell, or filesystem mutation tool appears.

## Invocation

Run and capture sanitized evidence for:

1. `hypertaks_manifest`
2. `hypertaks_verify_installation`
3. `hypertaks_get_skill` for each of the five canonical skills
4. `hypertaks_route` with:
   - a normal founder task
   - a verification request
   - a memory or decision request
   - a dependency-impact request
   - a checkpoint or handoff request
5. A malformed skill name and an oversized or invalid request

## Security

Verify:

- unapproved origins are rejected;
- an invalid bearer token is rejected when authentication is enabled;
- errors do not expose filesystem paths, tokens, stack traces, or secrets;
- all tool annotations remain read-only and non-destructive;
- the runtime cannot mutate the user's local repository from ChatGPT.

## Lifecycle

1. Refresh the app and confirm tool definitions remain correct.
2. Update the deployed endpoint to a new commit and repeat discovery after the required ChatGPT refresh or review step.
3. Remove or disable the draft app.
4. Confirm Hypertaks tools are no longer available.

## Verdict

Use only one verdict:

- `PASS`: all required behavior was observed in ChatGPT and evidence is attached.
- `PARTIAL`: connection or some calls worked, but certification is incomplete.
- `BLOCKED`: account, workspace policy, endpoint, or platform access prevented testing.
- `FAIL`: observed behavior violated the expected contract.

Store sanitized evidence in `evals/hosts/chatgpt/REPORT.md`. Do not mark ChatGPT `PASS` from local runtime tests alone.
