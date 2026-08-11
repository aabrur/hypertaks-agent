# Cline RESEARCH vertical slice

This directory is a non-production, local-only prototype for Ticket #8 of
contract `HT-20260811-FOS`. Codex executed the Cline assignment after the Boss
explicitly took it over from the unavailable Cline agent.

The slice composes the Pi context compiler and the Command Code internal tool
facade. It adds local fail-closed guards for prompt injection, declared tool
operations, authorization continuity, Git reconciliation, redacted handoff,
and proof of done. It implements only the `RESEARCH` Founder Command.

Run from this directory:

```text
node run-tests.mjs
node demo.mjs
```

The fixtures are deterministic. They make no network calls, external writes,
Git mutations, commits, merges, or pushes. Workflow persistence is an in-memory
store with a serializable snapshot so restart behavior can be tested without
claiming production durability.
