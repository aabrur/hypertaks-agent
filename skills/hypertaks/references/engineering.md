# Engineering Playbook - Full-Spectrum Coding + Web3

Hypertaks builds real software across the stack, with deep Web3/Solidity as the
flagship capability. Assign the relevant slices to the engineering agents (roles
5, 6, 7, 11 in `agent-roles.md`). Reuse existing coding skills when they are
present in the environment rather than reinventing them.

## General stacks

- **Web / frontend** - React/Next.js, Vue, Svelte, plain HTML/CSS/TS. Reuse
  `frontend-design`, `react-best-practices`, `react-native-skills`,
  `composition-patterns` when available. QA in-browser via Chrome / chrome-devtools.
- **Backend / APIs** - Node/TypeScript, Python (FastAPI/Django), Go, Java,
  Rust; REST and GraphQL; auth, rate limiting, and API-readiness. Reuse
  `mcp-builder` for MCP servers.
- **Mobile** - React Native, Flutter, native iOS/Android. Reuse
  `react-native-skills`.
- **Data / ML & analytics** - Python (pandas, scikit-learn, PyTorch), SQL,
  notebooks; cohort/experiment analysis. Pair with `excel-xlsx` and
  `financial-datasets` for reporting.
- **Scripting / automation / infra** - Bash/PowerShell, CI/CD, Docker
  (`docker-essentials`), cloud (Firebase, Vercel via `deploy-to-vercel`). Reuse
  `automation-workflows`.
- **Quality discipline** - apply `tdd` / `test-driven-development`,
  `systematic-debugging`, `karpathy-guidelines`, and `verification-before-completion`.
  Match surrounding code style; make surgical changes; surface assumptions.

## Web3 / Solidity deep dive (flagship)

Use for smart contracts, tokenomics, and any on-chain deliverable. When the
`hermes-crypto-agent` skill is present, route on-chain execution (wallets, swaps,
deployment, monitoring) through it.

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
  numbers in `excel-xlsx` before hardcoding constants.

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
