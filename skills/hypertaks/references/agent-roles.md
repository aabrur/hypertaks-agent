# Agent Roles, Tier-Based Selection & Plugin/MCP Auto-Detection

Phase 2 (pick the roles) and Phase 3 (equip each) draw on this file. The rule:
**the tier announced in the task contract fixes the agent count** (Lite 1,
Standard 3, Prime 5, Hyper 6–10+ - see `SKILL.md`), chosen dynamically, no
duplicates, and never shrunk silently.

## The role pool (N)

Select from this pool. Each role has a professional lens, the frameworks it
leans on, and the kinds of plugins/MCP connectors it typically wants.

| # | Role | Professional lens | Typical frameworks | Typical tools/skills (verify at runtime) |
|---|------|-------------------|--------------------|------------------------------------------|
| 1 | **Strategy / Business Analyst** | Market, competition, positioning | Porter's Five Forces, SWOT/TOWS, Blue Ocean, Pareto | `market-research`, `brainstorming`, WebSearch, `obsidian` |
| 2 | **Finance & Unit-Economics** | P&L, margins, pricing, modeling | Unit economics, Pareto, break-even, DCF | `excel-xlsx`, `financial-datasets`, `stock-analysis` |
| 3 | **Marketing & Growth** | Acquisition, retention, funnels | AARRR, Pareto, A/B testing | `market-research`, `competitive-ads-extractor`, `seo-geo-claude-skills`, Higgsfield |
| 4 | **Copywriting & Brand** | Messaging, voice, narrative | AIDA, PAS, brand guidelines | `content-research-writer`, `humanizer`, `writing-skills`, `brand-guidelines` |
| 5 | **Full-Stack / Software Engineer** | Web, backend, mobile, data | TDD, systematic debugging | `tdd`, `react-best-practices`, `systematic-debugging`, `frontend-design`, Chrome |
| 6 | **Smart-Contract / Web3 Engineer** | On-chain, Solidity, tokenomics | Security patterns, audit checklist | `hermes-crypto-agent`, `engineering.md` Web3 section |
| 7 | **Data / ML & Analytics** | Metrics, models, experiments | Statistics, cohort analysis, Pareto | `excel-xlsx`, `financial-datasets`, data scripts |
| 8 | **Supply Chain & Operations** | Flow, throughput, logistics | Theory of Constraints, SCOR, Fishbone | `automation-workflows`, `obsidian` |
| 9 | **Supply Chain Finance** | Working capital, trade finance | Factoring, reverse factoring, dynamic discounting | `excel-xlsx`, `financial-datasets` |
| 10 | **ERP / Process Architect** | End-to-end business processes | Process mapping, ERP module view | `automation-workflows`, `excel-xlsx` |
| 11 | **IoT / Embedded** | Sensors, edge, connectivity | Edge→cloud architecture | engineering skills, Firebase MCP |
| 12 | **Legal / Compliance / Ethics** | Risk, regulation, integrity | Red Apples & Bad Barrels, compliance review | WebSearch, `microsoft-docs` |
| 13 | **UX / UI & Product Design** | Interfaces, flows, usability | Design heuristics, journey mapping | `frontend-design`, `superdesign`, Figma, Canva, Adobe |
| 14 | **Founder / Integrator** | Synthesis, decision, trade-offs | Systems Thinking, Cynefin, decision matrices, all frameworks | `obsidian` (logs the decision) |
| 15 | **QA / Red-Team / Verifier** | Break it before the Boss does | Verification-before-completion, audit checklists, adversarial review | `webapp-testing`, `qa`, `verification-before-completion`, Chrome |

## Pick the tier's count - heuristics

1. **Start from the tier + task shape** (both fixed in the intake contract):
   - **Lite (1)** - the Founder acts alone, wearing the single most relevant
     lens from the pool. Still picks frameworks in Phase 3; still delivers the
     work log.
   - **Standard (3)** - the 2 most load-bearing specialists for the task +
     **Founder/Integrator**. Example: Engineer + Copywriting + Integrator for a
     small landing tweak with copy.
   - **Prime (5)** - the classic lineup. Analysis/strategy → bias toward roles
     1, 2, 3, 8, 12 + Integrator. Execution/build → bias toward 5, 6, 4, 13
     plus one domain specialist (2, 9, 10, 11). Both → blend: 1–2 analysis,
     2–3 build, + Integrator.
   - **Hyper (6–10+)** - count the distinct workstreams that each need their
     own deliverable; assign one specialist per workstream, **split** heavy
     roles (frontend vs. backend engineer, per-chain Web3 engineers, per-market
     growth), add **QA/Red-Team (15)**, and keep exactly one
     **Founder/Integrator (14)** at the top. Every agent must have a distinct
     deliverable - padding to look thorough is forbidden.
2. **No duplicate roles** - each agent covers a distinct professional angle. In
   Hyper, split roles differ by their slice ("Frontend Engineer - dashboard"
   vs. "Backend Engineer - payments API"), never by name alone.
3. **Founder/Integrator (14) is mandatory at 3+ agents** - it reconciles the
   outputs into one decision and owns the work log.
4. **Match specialists to the actual work** - do not add an IoT or Web3 agent to
   a pure copywriting task. Relevance over coverage.
5. **Land on the announced count.** More roles seem relevant than the tier
   allows → merge the weakest two or escalate the tier via a re-stated contract
   (never silently). Fewer seem needed → the tier was assessed too high; that is
   also a contract re-statement, not a silent shrink.

## Plugin / skill / MCP auto-detection method

> The concrete, installed inventory of connectors and plugins lives in
> `references/plugins-and-mcp.md` - use it as the default map. The steps below are
> how to confirm what is actually loaded this session.

Do **not** invent skills or connectors. Detect what actually exists, then match.

0. **Detect the production mode first.** Check whether an agent/task-spawning
   tool is present (e.g. Claude Code's `Agent` tool). If yes, run Phase 4 in
   orchestrated mode. If no such tool exists in this environment (claude.ai
   chat, most other assistants, bare API access), run Phase 4 in synthesized
   mode - see **Environment modes** in `SKILL.md`. This does not change how
   many roles get picked or equipped, only how they get produced.
1. **Enumerate availability at runtime.** Read the environment's available-skills
   list and the MCP tool list surfaced in the session (system reminders, the tool
   registry, `ToolSearch` for deferred tools). This is the source of truth. On
   surfaces with no such registry to read, treat step 2 below as "no typical
   tools available" and equip every role with core reasoning + its frameworks
   only.
2. **Match each agent to relevant, present tools** using the table above as a
   starting map. If a "typical" tool is absent, pick the closest available one
   or fall back to core tools (WebSearch, Bash, Read/Write/Edit).
3. **Wire MCP connectors by role need**, only if present:
   - Notes / knowledge / logging → **Obsidian** MCP (vault).
   - Design / visuals → **Adobe**, **Canva**, **Figma**, `frontend-design`.
   - Comms & docs → **Gmail**, **Google Calendar**, **Google Drive**.
   - Web interaction / scraping / QA → **Chrome** (claude-in-chrome),
     **chrome-devtools**.
   - Media generation → **Higgsfield**.
   - Backend / hosting → **Firebase**.
   - Docs / reference → **microsoft-docs** (microsoft-learn).
4. **State the equip list in each agent brief** so the spawned agent knows exactly
   which skills to invoke and which MCP connectors to use - see
   `assets/agent-brief-template.md`.
5. **Verify before relying.** Availability changes per session; confirm a tool is
   loadable (via `ToolSearch` for deferred tools) before instructing an agent to
   depend on it.

## Worked example - Lite: "Fix the headline typo on the landing page"

Tier: Lite (1), Express gate. Continuation or trivial single-domain task.

1. **Founder (solo, Copywriting lens)** - fix the typo, verify in context,
   deliver with the one-line work log. Announced as: *"Lite tier, Express gate -
   Founder solo."* No spawn, no team - but the gate, announcement, and log all
   still happen.

## Worked example - Standard: "Add a pricing table to the site and write its copy"

Tier: Standard (3), Express gate. Two domains + integration.

1. **Full-Stack Engineer** - build the pricing-table component; QA in Chrome.
2. **Copywriting & Brand** - tier names, feature bullets, CTA copy (AIDA).
3. **Founder / Integrator** - merge copy into component, verify rendering,
   deliver + log.

## Worked example - Prime: "Hypertaks, why is churn high?"

Tier: Prime (5), Deep gate. Task shape: analysis.

1. **Strategy / Business Analyst** - Porter + SWOT on competitive switching costs
   and substitutes; tools: `market-research`, WebSearch.
2. **Finance & Unit-Economics** - LTV/CAC, payback, cohort revenue decay; tools:
   `excel-xlsx`, `financial-datasets`.
3. **Marketing & Growth** - funnel & retention-curve teardown, Pareto of churn
   reasons; tools: `competitive-ads-extractor`, `market-research`.
4. **Supply Chain & Operations / Product** - Fishbone on service failures and
   fulfillment/experience bottlenecks (Theory of Constraints).
5. **Founder / Integrator** - reconcile the four into a ranked root-cause list
   with recommended interventions; logs the decision to the vault via Obsidian.

## Worked example - Hyper: "Launch the new product: smart contract + app + GTM + legal"

Tier: Hyper (9), Deep gate. Four workstreams, real money on-chain → high
stakes, so the QA/Red-Team slot is mandatory (not folded into the Integrator).

1. **Smart-Contract / Web3 Engineer** - token contract + tests + testnet deploy.
2. **Backend Engineer** - API, indexing, wallet integration.
3. **Frontend Engineer** - app UI.
4. **UX / UI & Product Design** - flows and interface design feeding #3.
5. **Marketing & Growth** - go-to-market plan, channel mix (AARRR).
6. **Finance / Tokenomics** - supply schedule, fee routing, unit economics.
7. **Legal / Compliance** - jurisdiction and offering-risk review.
8. **QA / Red-Team / Verifier** - adversarial review: audit checklist on the
   contract, end-to-end app QA in Chrome, launch-readiness verification.
9. **Founder / Integrator** - reconcile all workstreams into the launch
   decision; owns the vault log.
