# Plugins & MCP Connectors — Live Inventory

Concrete catalog of what is installed in this workspace, so Phase 3 (equip) maps
each of the 5 agents to real tools instead of guessing. **Availability still
varies per session** — confirm a tool/connector is actually loaded before an agent
depends on it (deferred MCP tools must be loaded via `ToolSearch` first). Treat
this as the default map; the live session list overrides it.

---

## A. MCP connectors (servers)

| Connector | Tool prefix | Use it for | Best-fit roles |
|-----------|-------------|-----------|----------------|
| **Chrome (Claude-in-Chrome)** | `mcp__claude-in-chrome__*` | Browse, fill forms, screenshot, read console/network, QA web apps, GIF capture | Engineer, UX/UI, Marketing, Data |
| **Chrome DevTools** | `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` | Performance traces, Lighthouse audits, network/console inspection, heap snapshots | Engineer, UX/UI |
| **Adobe (for creativity)** | `mcp__claude_ai_Adobe_for_creativity__*` | Image editing, vector, InDesign/Express, document render, fonts, video | UX/UI, Copywriting/Brand, Marketing |
| **Canva** | `mcp__claude_ai_Canva__*` | Designs from templates/brand kits, export, resize, brand templates | UX/UI, Marketing, Copywriting/Brand |
| **Figma** | `mcp__claude_ai_Figma__*` | Design↔code, design systems, FigJam diagrams, Code Connect | UX/UI, Engineer |
| **Higgsfield** | `mcp__claude_ai_Higgsfield__*` | Generate image/video/3D/audio, ads (Marketing Studio), virality predictor | Marketing, Copywriting/Brand, UX/UI |
| **Gmail** | `mcp__claude_ai_Gmail__*` | Search threads, drafts, labels, send comms | Founder/Integrator, Marketing, Legal |
| **Google Calendar** | `mcp__claude_ai_Google_Calendar__*` | Events, scheduling, suggest times | Founder/Integrator, Ops |
| **Google Drive** | `mcp__claude_ai_Google_Drive__*` | Read/create/search files, share docs | Founder/Integrator, Finance, Ops |
| **Slack** | `mcp__claude_ai_Slack__*` | Team comms / notifications (auth required) | Founder/Integrator, Marketing |
| **Obsidian** | `mcp__obsidian__*` | Shared vault: notes, search, daily log, wikilinks | Founder/Integrator (always — Phase 5 logging), all |
| **Firebase** | `mcp__plugin_firebase_firebase__*` | App/project setup, deploy, security rules, SDK config, hosting | Engineer, IoT, Founder/Integrator |
| **Microsoft Learn** | `mcp__plugin_microsoft-docs_microsoft-learn__*` | Official MS/Azure docs search, code samples, full-page fetch | Engineer, Legal/Compliance, Data |

## B. Plugins (namespaced skills & agents)

| Plugin | Provides | Best-fit roles |
|--------|----------|----------------|
| **frontend-design** | `frontend-design:frontend-design` — distinctive production UI | Engineer, UX/UI |
| **higgsfield** | `higgsfield-generate`, `higgsfield-product-photoshoot`, `higgsfield-marketplace-cards`, `higgsfield-soul-id` | Marketing, Copywriting/Brand, UX/UI |
| **chrome-devtools-mcp** | `a11y-debugging`, `debug-optimize-lcp`, `memory-leak-debugging`, `chrome-devtools`, `troubleshooting` | Engineer, UX/UI |
| **postman** | API Readiness Analyzer agent + `generate-spec`, `mock`, `run-collection`, `security`, `send-request`, `test`, `sync` | Engineer, Data |
| **firebase** | Firebase MCP tools + developer-knowledge docs | Engineer, IoT |
| **microsoft-docs** | `microsoft-docs`, `microsoft-code-reference`, `microsoft-skill-creator` | Engineer, Legal/Compliance |
| **agent-sdk-dev** | `new-sdk-app` + Python/TS SDK verifier agents | Engineer |
| **mcp-apps** | `create-mcp-app`, `add-app-to-server`, `convert-web-app`, `migrate-oai-app` | Engineer |
| **claude-md-management** | `revise-claude-md`, `claude-md-improver` | Founder/Integrator, Engineer |
| **claude-code-setup** | `claude-automation-recommender` | Founder/Integrator |
| **telegram** | `access`, `configure` — Telegram comms | Marketing, Founder/Integrator |

## C. High-value warehouse skills by role

Only skills confirmed present this session should be invoked. Common picks:

- **Strategy / Business Analyst** → `market-research`, `brainstorming`, `admapix`,
  `competitive-ads-extractor`, `grilling`.
- **Finance & Unit-Economics / Supply Chain Finance** → `excel-xlsx`,
  `financial-datasets`, `stock-analysis`, `portfolio-risk`, `execution-cost`.
- **Marketing & Growth** → `seo-geo-claude-skills`, `competitive-ads-extractor`,
  `twitter-algorithm-optimizer`, `ckm-banner-design`, `automation-workflows`.
- **Copywriting & Brand** → `content-research-writer`, `humanizer`,
  `writing-skills`, `brand-guidelines`, `brandkit`, `theme-factory`.
- **Full-Stack / Software Engineer** → `tdd` / `test-driven-development`,
  `react-best-practices`, `react-native-skills`, `systematic-debugging`,
  `diagnosing-bugs`, `frontend-design`, `karpathy-guidelines`,
  `verification-before-completion`, `webapp-testing`, `deploy-to-vercel`,
  `docker-essentials`, `mcp-builder`.
- **Smart-Contract / Web3 Engineer** → `hermes-crypto-agent` (multi-chain
  wallets, swaps, deploy, monitoring), plus `engineering.md` Web3 section.
- **Data / ML & Analytics** → `excel-xlsx`, `financial-datasets`,
  `langsmith-fetch`, `stock-analysis`.
- **Supply Chain & Operations / ERP** → `automation-workflows`, `obsidian`,
  `excel-xlsx`, `file-organizer`.
- **IoT / Embedded** → Firebase MCP, `microsoft-docs`, engineering skills.
- **Legal / Compliance / Ethics** → `microsoft-docs`, WebSearch, `1password`
  (secrets handling).
- **UX / UI & Product Design** → `frontend-design`, `superdesign`, `taste-skill`,
  `ui-ux-pro-max`, `redesign-skill`, Figma/Canva/Adobe MCP.
- **Founder / Integrator** → `obsidian` (vault logging), `doc-coauthoring`,
  `internal-comms`, `dispatching-parallel-agents`, Gmail/Calendar/Drive MCP.

## D. Delivery / distribution skills (any role, as needed)

`pptx` / `powerpoint-pptx` (decks), `word-docx` (docs), `pdf`, `slides-generator`,
`canvas-design`, `markdown-converter`, `deploy-to-vercel`, `vercel-cli-with-tokens`.

## How to use this inventory

1. In Phase 3, for each of the 5 agents, pick tools from sections A–D by the
   agent's role column.
2. Confirm the tool/connector is loaded this session (load deferred MCP tools with
   `ToolSearch` using `select:<tool_name>`; check the available-skills list for
   skills). If absent, fall back to the nearest available option or core tools.
3. List the chosen skills + MCP connectors explicitly in each agent brief
   (`assets/agent-brief-template.md`) so the spawned agent knows exactly what to
   invoke.
