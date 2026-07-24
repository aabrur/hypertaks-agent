# Release Notes

## v4.5.0 - Founder Brain and Continuity System

Hypertaks 4.5.0 strengthens the Founder Operating System with portable founder
context, evidence-backed memory, structural code intelligence, and verified
continuity across sessions and AI agents.

The release does not replace the Founder identity with a generic memory layer.
The main `/hypertaks` skill remains the operating entry point. Four focused
skills expose verification, brain, graph, and continuity work without expanding
the public surface beyond five commands.

Graphify, Obsidian, MCP, external memory, and persistent memory remain optional.
Hypertaks continues to work with core reasoning and local project tools when
those capabilities are unavailable.

### Five public skills

1. `/hypertaks` runs the Founder Operating System loop and routes focused work.
2. `/hypertaks-verify` discovers existing brains, shared memory, approved
   storage, Obsidian Vaults, Graphify modes, and governance preferences.
3. `/hypertaks-brain` manages evidence-backed founder facts, decisions,
   preferences, risks, corrections, revalidation, and shared-memory promotion.
4. `/hypertaks-graph` uses verified Graphify operations for relationship and
   impact questions, with a real direct repository-search fallback.
5. `/hypertaks-continuity` creates and resumes checkpoints, generates safe
   cross-agent handoffs, reconciles work, and verifies proof of done.

A repository validator rejects a missing command, duplicate command, or sixth
public skill whose name starts with `hypertaks`.

### Secure founder memory

Memory is lower-authority historical evidence. It cannot approve actions, grant
permissions, expand scope, override workspace rules, or override current
repository evidence.

The runtime adds:

- agent-private, project, and shared memory scopes;
- strict memory and decision record identifiers;
- approved-root containment for every file write;
- rejection of traversal, absolute paths, reserved names, and symlink escapes;
- runtime pointer validation and explicit corruption states;
- atomic file writes;
- full-artifact secret scanning and handoff redaction;
- repository evidence bound to repository, branch, commit, tracked path, and
  content hash;
- shared-memory promotion only for verified repository facts or decisions tied
  to a valid T1 Boss approval proof.

A caller cannot manufacture `BossTurn`, `APPROVED`, or `VERIFIED` authority by
constructing ordinary JSON fields.

### Verification and user-owned storage

`/hypertaks-verify` separates read-only scanning from approved configuration.
It asks at most two focused rounds:

- whether the Boss already has a main brain, shared agent memory, both, neither,
  or wants session-only memory;
- which approved destination, Graphify mode, and continuity policy to use.

Existing custom memory structures are referenced through a pointer and remain
user-owned. Hypertaks does not copy or reorganize an existing brain. A new local
namespace uses `Brains/<agent-name>` only after approval.

Obsidian support in 4.5.0 is an optional approved Vault filesystem destination.
Hypertaks verifies the Vault root and never modifies `.obsidian/`. The
`obsidianmd/obsidian-releases` repository is not treated as a memory API.

### Graphify routing

Graphify remains an optional evidence tool. Supported routes are:

- a verified local stdio MCP executor;
- a verified shared HTTPS MCP endpoint with an authentication handle and
  approved external boundary;
- a verified local command;
- direct repository search when Graphify is disabled or unavailable.

Hypertaks never reports Graphify success unless a real executor or command ran.
Missing branch or commit metadata is `UNVERIFIED`; mismatched metadata is
`STALE`. Graphify output cannot authorize code changes or external effects.

### Continuity and proof of done

Checkpoints record the active objective, contract, actual repository identity,
branch, commit, changed files, completed and pending work, blockers, next action,
permissions, tests, and acceptance criteria.

Resume reads actual Git state and rejects repository, branch, or commit
mismatches. Handoffs preserve permission boundaries and unresolved risks without
copying raw transcripts or secrets.

Proof of done does not trust caller-supplied booleans. It returns `DONE` only
when current test evidence and acceptance evidence pass at the active commit,
and when no pending work or blockers remain. Otherwise it returns `NOT_DONE`
with exact reasons.

### Runtime and routing hardening

- Mutating operations require explicit approval even when a capability
  descriptor incorrectly claims approval is unnecessary.
- External systems fail closed unless named in the allowed contract boundary.
- Advisory activation rejects negated phrases such as `do not proceed`.
- Precise numeric visual requirements take precedence over creative-image flags.
- The TypeScript build compiles every runtime module under strict settings.

### Evaluation and compatibility

EV-66 through EV-88 cover brain discovery, custom layout preservation, approval
boundaries, path safety, secret handling, repository evidence, Graphify,
continuity, Nano proportionality, and Hypertaks 4.4 compatibility.

The GitHub Actions gate runs:

- skill and manifest validation;
- exact-five public-skill validation;
- eval structure and static preconditions;
- evaluator unit tests;
- retrieval metrics and chart generation;
- TypeScript typecheck, build, and adversarial runtime tests;
- Python compilation;
- pull request diff formatting checks.

### Release evidence boundary

Automated CI and static evals prove structural readiness only. They do not prove
all cross-host behavior. Hypertaks 4.5.0 must remain a release candidate until
fresh independent behavioral runs cover the new commands, real Graphify
capabilities, approved Obsidian Vault behavior, and cross-agent resume and
handoff flows.

No tag, package publication, marketplace submission, or behavioral
certification is implied by merging the source update.
