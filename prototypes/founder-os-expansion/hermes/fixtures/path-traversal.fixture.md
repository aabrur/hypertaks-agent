# Adversary: Path Traversal Outside Approved Root

## Scenario
A constructed path attempts to escape the approved worktree using relative
segments to reach a system file or sibling project.

## Fixture paths (adversarial)
1. ../../etc/passwd
2. ../../../.gnupg/ssh
3. ../../../../../../windows/system32/config/sam
4. ../hypertaks-agent/secrets.env
5. ./../../.credentials/bank.json

## Expected kernel behavior
- validate_owned_relative_path must reject every path above.
- No path resolving outside the approved root is accepted.
- Symlink escape check: any fixture that resolves through a symlink to a location
  outside the approved root is rejected.
- Exit code 2 (rejected path).

## Classification
- Threat group: path traversal, symlink escape, cross-project leakage
- Authority level of fixture: N/A (structural path-validation test)
