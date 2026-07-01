# Agent Roles, 5-of-N Selection & Plugin/MCP Auto-Detection

Phase 2 (pick 5 roles) and Phase 3 (equip each) draw on this file. The rule is
absolute: **exactly 5 agents per task, chosen dynamically, no duplicates, no
exceptions.**

## The role pool (N)

Select 5 from this pool. Each role has a professional lens, the frameworks it
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
| 14 | **Founder / Integrator** | Synthesis, decision, trade-offs | Decision matrices, all frameworks | `obsidian` (logs the decision) |

## Pick exactly 5 of N — heuristics

1. **Start from task shape** (from the intake contract):
   - **Analysis / strategy** → bias toward roles 1, 2, 3, 8, 12 and reserve the
     Founder/Integrator (14) slot for synthesis.
   - **Execution / build** → bias toward roles 5, 6, 4, 13 plus one domain
     specialist (2, 9, 10, or 11) relevant to what is being built.
   - **Both** → blend: 1–2 analysis roles, 2–3 build roles, and the Integrator.
2. **No duplicate roles** — each of the 5 must cover a distinct professional
   angle. If two candidate roles overlap heavily, drop one and add breadth.
3. **Reserve one Founder/Integrator (14) slot** whenever the task needs a single
   reconciled decision (most tasks). Skip it only when all 5 build-parts are
   independent and integration is trivial — then use a 5th specialist instead.
4. **Match specialists to the actual work** — do not add an IoT or Web3 agent to
   a pure copywriting task. Relevance over coverage.
5. **Always land on exactly 5.** If more than 5 seem relevant, merge the weakest
   two into one broader role or defer the extra to a follow-up. If fewer than 5
   seem needed, add depth (e.g. split engineering into frontend + backend, or add
   a QA/verification agent) — never spawn fewer than 5.

## Plugin / skill / MCP auto-detection method

> The concrete, installed inventory of connectors and plugins lives in
> `references/plugins-and-mcp.md` — use it as the default map. The steps below are
> how to confirm what is actually loaded this session.

Do **not** invent skills or connectors. Detect what actually exists, then match.

0. **Detect the production mode first.** Check whether an agent/task-spawning
   tool is present (e.g. Claude Code's `Agent` tool). If yes, run Phase 4 in
   orchestrated mode. If no such tool exists in this environment (claude.ai
   chat, most other assistants, bare API access), run Phase 4 in synthesized
   mode — see **Environment modes** in `SKILL.md`. This does not change how
   many roles get picked or equipped, only how they get produced.
1. **Enumerate availability at runtime.** Read the environment's available-skills
   list and the MCP tool list surfaced in the session (system reminders, the tool
   registry, `ToolSearch` for deferred tools). This is the source of truth. On
   surfaces with no such registry to read, treat step 2 below as "no typical
   tools available" and equip every role with core reasoning + its frameworks
   only.
2. **Match each of the 5 agents to relevant, present tools** using the table
   above as a starting map. If a "typical" tool is absent, pick the closest
   available one or fall back to core tools (WebSearch, Bash, Read/Write/Edit).
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
   which skills to invoke and which MCP connectors to use — see
   `assets/agent-brief-template.md`.
5. **Verify before relying.** Availability changes per session; confirm a tool is
   loadable (via `ToolSearch` for deferred tools) before instructing an agent to
   depend on it.

## Worked example A — Analysis: "Hypertaks, why is churn high?"

Task shape: analysis. After the intake gate confirms the contract:

1. **Strategy / Business Analyst** — Porter + SWOT on competitive switching costs
   and substitutes; tools: `market-research`, WebSearch.
2. **Finance & Unit-Economics** — LTV/CAC, payback, cohort revenue decay; tools:
   `excel-xlsx`, `financial-datasets`.
3. **Marketing & Growth** — funnel & retention-curve teardown, Pareto of churn
   reasons; tools: `competitive-ads-extractor`, `market-research`.
4. **Supply Chain & Operations / Product** — Fishbone on service failures and
   fulfillment/experience bottlenecks (Theory of Constraints).
5. **Founder / Integrator** — reconcile the four into a ranked root-cause list
   with recommended interventions; logs the decision to the vault via Obsidian.

## Worked example B — Execution: "Landing page + smart contract for a new product"

Task shape: execution/build. After the intake gate confirms the contract:

1. **Full-Stack / Software Engineer** — build the landing page; tools:
   `frontend-design`, `react-best-practices`, `tdd`, Chrome for QA.
2. **Smart-Contract / Web3 Engineer** — write, test, and prepare deployment of the
   contract (see `engineering.md` Web3 section); tools: `hermes-crypto-agent`.
3. **Copywriting & Brand** — headline, value prop, CTA copy; tools:
   `content-research-writer`, `humanizer`, `brand-guidelines`.
4. **Finance / Tokenomics** — pricing and token model, supply schedule, fee logic;
   tools: `excel-xlsx`.
5. **Founder / Integrator** — assemble page + contract + copy into one shippable
   artifact, run the verification checklist, and log to the vault.
