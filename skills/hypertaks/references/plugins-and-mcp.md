# Tool Categories & Runtime Binding

Phase 3 (equip) maps each agent to **categories of function**, then binds each
category to whatever tool is actually installed in the running session. This
file names no specific product as a requirement. Whoever installs this skill,
with whatever tool mix their environment has, can run every role: a matching
tool improves the output, a missing tool degrades it gracefully, and the agent
says which of the two happened.

## Ground rules

1. **Detect, never assume.** Enumerate what the session actually exposes: the
   available-skills list, the MCP/tool registry, and any deferred-tool search
   the host provides. That live list is the only source of truth; nothing in
   this file overrides it.
2. **Category first, brand never.** Agent briefs name the category and the
   session's matching tool. No brief may depend on a tool that was not
   verified present this session.
3. **Degrade gracefully and say so.** When a category has no match, the role
   runs on core reasoning, its frameworks, and whatever generic tools exist
   (file operations, shell, web search). The brief records "core tools only"
   and the deliverable's risks section carries the limitation.
4. **Never fabricate.** No invented tool names, no pretended tool calls, no
   fabricated tool output. This extends the synthesized-mode rule in
   `SKILL.md`.

## Function categories

| Category | What it covers | Roles that want it | If absent |
|----------|----------------|--------------------|-----------|
| **Notes & knowledge base** | Note-taking apps, vaults, wikis, memory stores | Founder/Integrator (work log), all roles | Include the work log inline in the deliverable |
| **Visual design & creative** | Design, prototyping, image-editing, whiteboard tools | UX/UI, Marketing, Copywriting/Brand | Apply design heuristics in text and state the limitation |
| **Scheduling & calendar** | Calendar and scheduling services | Founder/Integrator, Ops | Propose the schedule as text for the Boss to enter |
| **Communication & messaging** | Email, chat, team-messaging connectors | Founder/Integrator, Marketing, Legal | Draft the messages; the Boss sends them |
| **Document & file storage** | Cloud drives, shared document stores | Finance, Ops, Founder/Integrator | Deliver files in the local workspace or inline |
| **Web browsing & testing** | Browser automation, dev-tools, site QA | Engineer, UX/UI, QA/Red-Team, Marketing | Reason from static analysis; mark browser-dependent claims as unverified |
| **Code hosting & version control** | Git hosting, PR/issue tooling | Engineer, Founder/Integrator | Work locally; note that push/PR needs a manual step |
| **Spreadsheets & financial modeling** | Workbook/spreadsheet skills, financial data sources | Finance, Supply Chain Finance, Data | Deliver markdown tables with formulas stated |
| **Presentations & formal documents** | Slide, document, and PDF generation | Any role with a formal deliverable | Deliver structured markdown instead |
| **Media generation** | Image, audio, video generation services | Marketing, UX/UI, Copywriting/Brand | Skip media output and state the limitation |
| **Data & analytics execution** | Code execution, notebooks, query engines | Data/ML, Engineer, Finance | Reason analytically; no computed charts (see the visual-capability check in `SKILL.md`) |
| **Deployment & hosting** | Cloud deploy, serverless, app hosting | Engineer, IoT | Hand over a runnable artifact plus deploy instructions |
| **Secrets & credentials** | Secret managers, credential vaults | Engineer, Legal/Compliance | Never handle raw secrets inline; ask the Boss for a safe channel |
| **On-chain execution** | Wallets, contract deploys, chain monitoring | Smart-Contract/Web3 Engineer | Produce contracts + tests + deployment scripts; the Boss executes on-chain steps |

## Binding procedure (run in Phase 3)

1. **Enumerate** the session's skills, tools, and connectors.
2. **Match** each agent's categories against that list; pick the closest
   present tool per category, whatever its brand.
3. **Record** the binding in the agent brief (`assets/agent-brief-template.md`):
   category, then the actual tool name found this session.
4. **Fallback**: for categories with no match, write "core tools only" in the
   brief and carry the limitation into the deliverable's risks section.
5. **Verify before relying.** Availability changes per session; confirm a tool
   is loadable before instructing an agent to depend on it.

## Workspace standards (conditional)

If the running workspace carries its own standards file (a `CLAUDE.md`,
`AGENTS.md`, or an equivalent the host agent surfaces), follow it for logging
locations, folder conventions, and anything it regulates. If no such file
exists, skip this entirely: assume no path, no vault, and no naming convention,
and use the inline work-log fallback from Phase 5 of `SKILL.md`.
