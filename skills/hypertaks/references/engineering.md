# Engineering Playbook - Full-Spectrum Coding + Web3

Hypertaks builds real software across the stack, with deep Web3/Solidity as the
flagship capability. Assign the relevant slices to the engineering agents (roles
5, 6, 7, 11 in `agent-roles.md`). Reuse existing coding skills when they are
present in the environment rather than reinventing them.

## General stacks

- **Web / frontend** - React/Next.js, Vue, Svelte, plain HTML/CSS/TS. Reuse
  any frontend-design or framework best-practices skills present in the
  session. QA in-browser via the session's browser/dev-tools category.
- **Backend / APIs** - Node/TypeScript, Python (FastAPI/Django), Go, Java,
  Rust; REST and GraphQL; auth, rate limiting, and API-readiness. Reuse an
  MCP-builder skill for MCP servers when one is present.
- **Mobile** - React Native, Flutter, native iOS/Android. Reuse mobile
  best-practices skills when present.
- **Data / ML & analytics** - Python (pandas, scikit-learn, PyTorch), SQL,
  notebooks; cohort/experiment analysis. Pair with spreadsheet and
  financial-data tooling for reporting.
- **Scripting / automation / infra** - Bash/PowerShell, CI/CD, Docker, cloud
  deploy targets - use whatever container, deployment, and
  workflow-automation skills the session provides.
- **Quality discipline** - apply `tdd` / `test-driven-development`,
  `systematic-debugging`, `karpathy-guidelines`, and `verification-before-completion`.
  Match surrounding code style; make surgical changes; surface assumptions.

## Web3 / Solidity deep dive (flagship)

Use for smart contracts, tokenomics, and any on-chain deliverable. When an
on-chain execution tool (wallets, swaps, deployment, monitoring) is present in
the session, route on-chain execution through it; otherwise deliver contracts,
tests, and deployment scripts for the Boss to execute.

### Languages & platforms
- **Solidity** (EVM: Ethereum, Base, Arbitrum, Optimism, Polygon, BSC, Avalanche,
  Linea, Scroll), **Vyper** where preferred, **Rust** (Solana/Anchor, NEAR),
  **Move** (Sui/Aptos). Default to Solidity unless the target chain dictates
  otherwise.

### Standards
- **ERC-20** (fungible), **ERC-721** (NFT), **ERC-1155** (multi-token),
  **ERC-4626** (tokenized vaults), **ERC-2612 / permit** (gasless approvals),
  **EIP-712** (typed signatures), **ERC-1967 / UUPS / Transparent** proxies for
  upgradeability. Prefer audited **OpenZeppelin** implementations as a base.

### Security patterns (audit-first mindset)
- **Reentrancy** - checks-effects-interactions ordering; `nonReentrant` guards.
- **Access control** - `Ownable` / `AccessControl` roles; guard privileged
  functions; avoid `tx.origin` auth.
- **Arithmetic** - Solidity ≥0.8 checked math; be explicit with `unchecked`.
- **Oracle risk** - use time-weighted / multi-source feeds (e.g. Chainlink);
  never trust spot AMM prices for critical logic.
- **External calls** - validate return values; beware of untrusted callbacks,
  gas griefing, and DoS via unbounded loops.
- **Upgradeability** - storage-layout safety, initializer guards, admin-key
  custody.
- **Front-running / MEV** - commit-reveal, slippage limits, deadlines.
- **Signature safety** - nonce/replay protection, chainId binding, EIP-1271 for
  contract signers.

### Tokenomics (pair with the Finance agent)
- Supply schedule (fixed/inflationary/deflationary), emission and vesting,
  utility and sinks, fee routing and treasury, governance rights. Model the
  numbers in spreadsheet tooling before hardcoding constants.

### Testing & deployment tooling
- **Foundry** (`forge test`, fuzzing, invariant tests, `forge script` deploys) -
  default for Solidity. **Hardhat** (TS tests, plugins) as an alternative.
- Coverage, gas snapshots, fork tests against mainnet state, and testnet dry-runs
  before mainnet. Verify source on the block explorer post-deploy.

### Audit checklist (run before "done")
1. All external/public functions have explicit access control.
2. No reentrancy on state-changing external calls (CEI + guards).
3. Arithmetic cannot over/underflow; `unchecked` blocks justified.
4. Oracles/price sources are manipulation-resistant.
5. No unbounded loops over user-controlled arrays.
6. Upgrade path (if any) preserves storage layout and secures admin keys.
7. Events emitted for all state changes; NatSpec documented.
8. Full test suite + fuzz/invariant tests pass; gas within the agreed ceiling.
9. Testnet deployment verified end-to-end before mainnet.

## Quality gate (hard - applies to all engineering)

No engineering agent reports "done" until every line below holds. This is a
gate, not a suggestion - an output that skips it goes back to the agent, and
the deliverable's compliance footer must reflect what actually ran.

1. **Test evidence** - tests exist and pass, test-first where a TDD skill
   (`tdd` / `test-driven-development`) is present. Attach the output.
2. **Systematic debugging** - failures are diagnosed via root cause
   (`systematic-debugging` / `diagnosing-bugs`), never patched by
   trial-and-error.
3. **Verification before completion** - run it, observe it work, report results
   faithfully (`verification-before-completion`). Never claim done without
   evidence.
4. **Web3 additionally:** the audit checklist above passes in full before any
   deployment claim; testnet before mainnet, always.
5. Match the surrounding code's style, naming, and structure; make surgical
   changes; surface assumptions and unknowns explicitly rather than guessing
   silently (`karpathy-guidelines`).

## TDD - RED-GREEN-REFACTOR (the iron law)

When a TDD skill (`tdd` / `test-driven-development`) is present, **no production
code ships without a failing test written first.** Run the cycle and log each
step so the compliance footer can cite it:

- **RED** - write the failing test; run it; confirm it fails for the *right*
  reason. Log: "RED: [test] -> expected fail, got [message]."
- **GREEN** - write the minimum code to pass; run it; confirm green. Log:
  "GREEN: [test] -> pass."
- **REFACTOR** - clean up with tests still green; confirm no regression. Log:
  "REFACTOR: [change] -> all pass."
- **COMMIT** - `type(scope): description`.

Skipping a phase, or writing code before the test, sends the deliverable back.
For a genuine spike where the Boss waived tests, that waiver is announced in the
contract - never assumed.

## Systematic debugging - 4-phase protocol

Bugs are diagnosed to root cause, never patched by trial-and-error
(`systematic-debugging`):

1. **Reproduce** - a test that triggers the bug 100% of the time. Can't
   reproduce -> stop and revisit assumptions before touching code.
2. **Isolate** - narrow to the minimal code that triggers it (binary search:
   halve, test, repeat). Log the file:line and a root-cause hypothesis.
3. **Hypothesize & instrument** - state "bug caused by X because Y"; add
   logging/instrumentation to confirm before changing behavior.
4. **Fix & regression-test** - apply the fix, watch the reproduce-test pass, and
   keep it as a regression test so the bug cannot silently return.

## Verification before completion

Before any "done" claim, run the thing and observe it (`verification-before-completion`).

- **Forbidden (auto-flag) phrases:** "should work", "it compiles", "tests should
  pass", "looks correct", "probably fine".
- **Required form:** "Verified: [test] passes - output [result]" / "Deployed:
  [URL] - checked [evidence]" / "Tested: [scenario] -> [observed behavior]".

## 4-layer validation stack

Every engineering deliverable clears these layers in order; any failure sends it
back to the agent (max 2 rejection cycles per layer, then escalate to the Boss):

1. **Self-validation** (the building agent) - output-shape law met, changes
   surgical, TDD cycle logged, within token budget.
2. **Cross-agent** (the Integrator) - outputs reconcile, no contradictions,
   every named framework actually applied, compliance footer accurate.
3. **External** (tools/MCP) - tests run and pass, code compiles/deploys, lint /
   type-check / security scan clean; Web3 testnet verified before any mainnet
   claim.
4. **Human** (the Boss) - deliverable matches the contract, decision is
   actionable, risks and assumptions are transparent.
