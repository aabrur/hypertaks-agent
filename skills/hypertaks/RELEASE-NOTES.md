# Release Notes

## v4.4.0 - Retrieval Intelligence and Professional Execution

Hypertaks 4.4.0 strengthens the Founder Operating System in four connected
areas: retrieval quality, contract activation, targeted capability use, and
professional artifact delivery. The plugin remains portable and does not bundle
a vector database, embedding model, reranker, MCP server, credential, or
resident daemon. Update delivery uses host marketplaces where supported and a
separate opt-in managed-checkout utility for linked skill installations.

### Added

- Added `references/02-retrieval-and-evidence.md` with the deterministic
  Retrieval Intelligence Router: Need, Scope, Route, Retrieve, Fuse, Boost,
  Rerank, Evaluate, Evidence Pack, and Fallback.
- Added exact, semantic, mixed, structured, small-corpus, and unavailable query
  classes with direct, keyword, vector, hybrid, and fallback routes.
- Added metadata boundary rules, exact-match protection, rank-fusion guidance,
  reranking criteria, independent retrieval metrics, and evidence-pack output.
- Added `references/03-professional-execution.md` with Python, Matplotlib,
  TypeScript, UI/UX, and image-generation execution profiles.
- Added `references/04-visual-delivery.md` with required, recommended, optional,
  and not-needed visual status plus medium selection and artifact validation.
- Added a strict TypeScript reference router under `runtime/router.ts` with
  executable branch tests.
- Added `scripts/retrieval_eval.py`, a standard-library evaluator for Recall@k,
  HitRate@k, MRR, nDCG@k, ExactMatch@k, latency, and cost.
- Added `scripts/plot_retrieval_eval.py` for reproducible PNG and SVG quality
  charts.
- Added EV-50 through EV-65 for retrieval, contract, execution, visual, plugin,
  and token-proportionality behavior.
- Added native Claude and Codex marketplace records that track the canonical
  repository and `main` release branch.
- Added `scripts/update_hypertaks.py` with integration coverage for current,
  check-only available, fast-forward, dirty, diverged, detached, and
  wrong-remote checkout states.

### Changed

- Expanded the task contract to preserve the original request, desired outcome,
  proposed method, supplied evidence, missing data, planned process,
  destination, validation evidence, retrieval strategy, execution profiles,
  visual delivery, and approval mode.
- Build work, file mutation, and external effects now require a T1 Boss approval
  that identifies the contract ID. Vague delegation permits only conservative
  advisory analysis with zero mutation permissions.
- Capability routing now follows retrieval classification when external
  knowledge is required, so the tool set is derived from the route rather than
  from an inventory.
- Token accounting now separates gate, retrieval, production, and verification
  envelopes while preserving proportional Nano and Lite behavior.
- Agent briefs and integrated deliverables now carry retrieval evidence,
  execution evidence, and visual validation.
- CI now validates Python retrieval utilities, Matplotlib exports, TypeScript
  type-checking, runtime branch behavior, and the expanded eval suite.

### Update delivery and boundaries

| Installation | Delivery path | Boundary |
|---|---|---|
| Host marketplace or plugin manager | Host-native compatible update when enabled by host and user or team policy | Reload or start a new session when required by the host |
| Managed canonical Git checkout | `scripts/update_hypertaks.py` fetches and fast-forwards `origin/main` | Unattended execution requires installation-time opt-in and a clean attached checkout |
| Copied or archived skill directory | One-time migration to a marketplace or managed checkout | The copied folder is never overwritten |

Use `python scripts/update_hypertaks.py --check-only` for diagnostics and
`python scripts/update_hypertaks.py` to reconcile a managed checkout. Dirty,
diverged, detached, wrong-remote, unreachable, or unreconciled states fail
closed. The updater never resets, stashes, deletes, switches branches, changes
remotes, or changes the already-running agent session in place.
Every later release must bump all synchronized strict-semver manifest fields;
version-keyed hosts may retain a cached plugin when only repository commits
change.

Claude Code can apply marketplace updates automatically after its third-party
marketplace auto-update setting is enabled. Cursor behavior depends on its
supported public or team marketplace refresh path. Codex documents marketplace
snapshot refresh and versioned plugin caching, not a universal background
replacement guarantee. Kimi Code discovers marketplace updates and applies
them through its plugin manager.

### Precision boundaries

- Hybrid retrieval is not a universal default.
- Reranking is optional and must be bounded, permitted, and evaluated.
- Retrieval quality remains `UNVERIFIED` when no labeled or reviewed query set
  exists.
- Image generation is not used for precise charts, tables, or technical
  topology.
- A successful tool call, compiler run, or file export is not completion
  evidence without reconciliation and artifact inspection.

### Release evidence status

The 4.3.0 behavioral ledger remains historical evidence for its exact certified
commit: 43/49 Behavioral PASS, 6 documented non-PASS, and 49/49 Static GREEN.
This release adds behavior and 16 new cases, so it requires fresh independent
behavioral runs before it may inherit the repository's Behaviorally Certified
label.

The 4.4.0 release candidate may be published with this limitation disclosed,
but must not claim 65/65 behavioral PASS or reuse the 4.3.0 certification as if
it covered the new behavior.
