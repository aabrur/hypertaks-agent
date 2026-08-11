# Command Code prototype (Ticket #7)

Internal Tool Registry and native-tool facade prototype for contract
`HT-20260811-FOS` (Hypertaks Founder OS Expansion).

- `tool-registry.mjs` - contracts (ToolDescriptor, ToolInvocation, ToolResult,
  ActionTransaction), canonical registry, deny-by-default permission mapping,
  approval registry, secret redaction, deterministic fakes.
- `run-tests.mjs` - harness with assertions; writes evidence/ transcripts.
- `demo-state.mjs` - state-transition evidence trace.
- `fixtures/*.json` - eight adversarial and edge scenarios.
- `README.md` - this file.

Run without installing anything (Node standard library only):

```
node run-tests.mjs   # exit 0
node demo-state.mjs  # exit 0, writes evidence/state-transition.log
```
