# Hypertaks for Kilo Code

Kilo Code supports native Agent Skills and compatible cross-agent skill directories.

## Workspace installation

The native project root is:

```text
.kilo/skills/
```

Copy the five canonical Hypertaks skill directories from `skills/` into that root. Do not use the legacy `.kilo-code/skills/` path as proof of Kilo discovery.

Kilo also discovers compatible project skills under `.agents/skills/`.

## Global installation

Place the five skill folders under:

```text
~/.kilo/skills/
```

## Verify

Start a new Kilo session or run:

```text
/reload
```

Confirm all five skill IDs are present and explicitly request `hypertaks` for a repository review task.

## Update and uninstall

Refresh only the Hypertaks-owned skill directories. Run `/reload` or start a new session after update. Remove only those five directories during uninstall and preserve unrelated Kilo configuration.

## Certification

Run the Kilo Code section in `evals/managed-agents/LIVE-CERTIFICATION.md`. Keep the verdict `PARTIAL` until a named Kilo version proves discovery, invocation, update, uninstall, and reinstall.
