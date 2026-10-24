import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryScanResult } from "./scanner";
import { RepoIdentity } from "../repo-identity";
import {
  PROJECT_OPERATING_CONTEXT_FILES,
  safeContextGitState,
  ContextGitState,
  resolveWithinApprovedRoot,
  atomicWriteText,
} from "../founder-brain";

export interface ContextEnrichmentResult {
  readonly repoId: string;
  readonly projectDir: string;
  readonly writtenFiles: readonly string[];
  readonly preservedFiles: readonly string[];
}

/**
 * Extracts sections from an existing context document to preserve user-authored
 * edits and historical decisions across rescans.
 */
export function extractExistingSections(existingContent: string): Map<string, string> {
  const sections = new Map<string, string>();
  const parts = existingContent.split(/\n(?=## )/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("## ")) {
      const newlineIdx = trimmed.indexOf("\n");
      if (newlineIdx !== -1) {
        const heading = trimmed.slice(3, newlineIdx).trim();
        const body = trimmed.slice(newlineIdx + 1).trim();
        if (heading.length > 0) {
          sections.set(heading, body);
        }
      }
    }
  }
  return sections;
}

interface TargetRepoMeta {
  readonly description: string | null;
  readonly license: string | null;
  readonly readmeSnippet: string | null;
  readonly topLevelDirs: readonly { readonly name: string; readonly fileCount: number }[];
  readonly detectedLinters: readonly string[];
}

function extractTargetRepoMeta(canonicalRoot: string, scan: RepositoryScanResult): TargetRepoMeta {
  let description: string | null = null;
  let license: string | null = null;

  // 1. package.json
  const pkgPath = path.join(canonicalRoot, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (typeof pkg.description === "string" && pkg.description.trim()) {
        description = pkg.description.trim();
      }
      if (typeof pkg.license === "string" && pkg.license.trim()) {
        license = pkg.license.trim();
      }
    } catch {}
  }

  // 2. README snippet
  let readmeSnippet: string | null = null;
  for (const name of ["README.md", "readme.md", "README"]) {
    const p = path.join(canonicalRoot, name);
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, "utf8");
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.startsWith("#"));
        if (lines.length > 0) {
          readmeSnippet = lines.slice(0, 3).join(" ").trim();
        }
      } catch {}
      break;
    }
  }

  // 3. LICENSE file
  if (!license) {
    for (const name of ["LICENSE", "LICENSE.md", "LICENSE.txt"]) {
      const p = path.join(canonicalRoot, name);
      if (fs.existsSync(p)) {
        try {
          const firstLine = fs.readFileSync(p, "utf8").split("\n")[0]?.trim();
          if (firstLine) license = firstLine;
        } catch {}
        break;
      }
    }
  }

  // 4. Top-level directories
  const dirCounts = new Map<string, number>();
  for (const f of scan.files) {
    const seg = f.relativePath.split("/")[0];
    if (seg && seg !== ".hypertaks") {
      dirCounts.set(seg, (dirCounts.get(seg) ?? 0) + 1);
    }
  }
  const topLevelDirs = Array.from(dirCounts.entries()).map(([name, fileCount]) => ({ name, fileCount }));

  // 5. Linters and tooling
  const detectedLinters: string[] = [];
  if (fs.existsSync(path.join(canonicalRoot, "tsconfig.json"))) detectedLinters.push("TypeScript");
  if (
    fs.existsSync(path.join(canonicalRoot, ".eslintrc.json")) ||
    fs.existsSync(path.join(canonicalRoot, ".eslintrc.js")) ||
    fs.existsSync(path.join(canonicalRoot, "eslint.config.js")) ||
    fs.existsSync(path.join(canonicalRoot, "eslint.config.mjs"))
  ) {
    detectedLinters.push("ESLint");
  }
  if (
    fs.existsSync(path.join(canonicalRoot, ".prettierrc")) ||
    fs.existsSync(path.join(canonicalRoot, ".prettierrc.json"))
  ) {
    detectedLinters.push("Prettier");
  }
  if (fs.existsSync(path.join(canonicalRoot, "biome.json"))) detectedLinters.push("Biome");
  if (
    fs.existsSync(path.join(canonicalRoot, "ruff.toml")) ||
    fs.existsSync(path.join(canonicalRoot, ".ruff.toml"))
  ) {
    detectedLinters.push("Ruff");
  }

  return {
    description,
    license,
    readmeSnippet,
    topLevelDirs,
    detectedLinters,
  };
}

/**
 * Enriches and writes the 13 canonical Project Operating Context living documents
 * inside .hypertaks/projects/<repoId>/ using static screening evidence.
 */
export function enrichProjectOperatingContext(
  canonicalRoot: string,
  identity: RepoIdentity,
  scanResult: RepositoryScanResult,
  options?: {
    readonly agentName?: string;
    readonly gitState?: ContextGitState;
  },
): ContextEnrichmentResult {
  const repoId = identity.repo_id;
  const projectDir = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "projects", repoId), true);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const agentName = options?.agentName ?? "Hypertaks-Founder";
  const gitState = options?.gitState ?? safeContextGitState(canonicalRoot);
  const now = new Date().toISOString();

  const writtenFiles: string[] = [];
  const preservedFiles: string[] = [];

  for (const filename of PROJECT_OPERATING_CONTEXT_FILES) {
    const filePath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "projects", repoId, filename), true);
    const relPath = `.hypertaks/projects/${repoId}/${filename}`;

    let existingContent: string | null = null;
    let existingSections = new Map<string, string>();
    let docTimestamp = now;
    if (fs.existsSync(filePath)) {
      try {
        existingContent = fs.readFileSync(filePath, "utf8");
        existingSections = extractExistingSections(existingContent);
        const existingTimestampMatch = existingContent.match(/timestamp:\s*([^\n]+)/);
        if (existingTimestampMatch && existingTimestampMatch[1]) {
          docTimestamp = existingTimestampMatch[1].trim();
        }
      } catch {
        existingContent = null;
      }
    }

    if (existingContent && !existingContent.trim().startsWith("---")) {
      preservedFiles.push(relPath);
      continue;
    }

    const generatedContent = buildDocumentContent(
      filename,
      identity,
      scanResult,
      agentName,
      gitState,
      docTimestamp,
      existingSections,
      canonicalRoot,
    );

    if (existingContent === generatedContent) {
      preservedFiles.push(relPath);
      continue;
    }

    atomicWriteText(canonicalRoot, relPath, generatedContent);
    writtenFiles.push(relPath);
  }

  return {
    repoId,
    projectDir,
    writtenFiles,
    preservedFiles,
  };
}

function renderFrontmatter(
  title: string,
  repoId: string,
  agentName: string,
  gitState: ContextGitState,
  timestamp: string,
  hasUnknowns: boolean,
): string {
  const lifecycle = hasUnknowns ? "PARTIALLY_VERIFIED" : "EVIDENCE_VERIFIED";
  return `---
id: ${title}
version: 1.0.0
timestamp: ${timestamp}
evidence_class: T4_EVIDENCE
provenance:
  agent_id: ${agentName}
  source_file: .hypertaks/projects/${repoId}/${title}.ctx.md
  contract_id: HT-${repoId}
source_git_state:
  commit_sha: ${gitState.commit}
  branch: ${gitState.branch}
  clean_tree: ${gitState.clean}
authority: 4
freshness: FRESH
status: ACTIVE
lifecycle_state: ${lifecycle}
verification: ${lifecycle}
---
`;
}

export function buildDocumentContent(
  filename: string,
  identity: RepoIdentity,
  scanResult: RepositoryScanResult,
  agentName: string,
  gitState: ContextGitState,
  timestamp: string,
  existingSections: Map<string, string>,
  canonicalRoot?: string,
): string {
  const root = canonicalRoot ?? scanResult.root;
  const meta = extractTargetRepoMeta(root, scanResult);
  const title = filename.replace(".ctx.md", "");

  let body = "";
  switch (filename) {
    case "Vision.ctx.md":
      body = buildVisionDoc(identity, scanResult, meta, existingSections);
      break;
    case "Requirements.ctx.md":
      body = buildRequirementsDoc(identity, scanResult, meta, existingSections);
      break;
    case "U-Experience.ctx.md":
      body = buildUserExperienceDoc(identity, scanResult, meta, existingSections);
      break;
    case "architecture.ctx.md":
      body = buildArchitectureDoc(identity, scanResult, meta, existingSections);
      break;
    case "law.ctx.md":
      body = buildLawDoc(identity, scanResult, meta, existingSections);
      break;
    case "database.ctx.md":
      body = buildDatabaseDoc(identity, scanResult, meta, existingSections);
      break;
    case "design.ctx.md":
      body = buildDesignDoc(identity, scanResult, meta, existingSections);
      break;
    case "api.ctx.md":
      body = buildApiDoc(identity, scanResult, meta, existingSections);
      break;
    case "coding-rules.ctx.md":
      body = buildCodingRulesDoc(identity, scanResult, meta, existingSections);
      break;
    case "roadmap.ctx.md":
      body = buildRoadmapDoc(identity, scanResult, meta, existingSections);
      break;
    case "preference.ctx.md":
      body = buildPreferenceDoc(identity, scanResult, meta, existingSections);
      break;
    case "prompt-build-continunity-prompt.ctx.md":
      body = buildContinuityDoc(identity, scanResult, gitState, existingSections);
      break;
    case "security.ctx.md":
      body = buildSecurityDoc(identity, scanResult, meta, existingSections);
      break;
    default:
      body = `# ${title} - Project Operating Context\n\nLiving context document for ${title}.\n`;
  }

  const hasUnknowns = body.includes("UNKNOWN (requires");
  const frontmatter = renderFrontmatter(title, identity.repo_id, agentName, gitState, timestamp, hasUnknowns);
  return frontmatter + body;
}

// ---------------------------------------------------------------------------
// Universal Document Builders (Evidence-Backed, Repository-Agnostic)
// ---------------------------------------------------------------------------

function buildVisionDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const customDecisions = existing.get("Decisions & Rationale");
  const customHistory = existing.get("Unresolved Issues & Historical Decisions");

  const purpose = meta.description || meta.readmeSnippet || "UNKNOWN (requires founder intake)";

  return `# Vision - Project Operating Context

## Domain Adaptation & Purpose
**Product:** ${identity.display_name} (\`${identity.repo_id}\`)
**Purpose & Domain:** ${purpose}

## Core Value Proposition & Positioning
- **Primary Value:** UNKNOWN (requires founder intake)
- **Positioning Boundary:** UNKNOWN (requires founder intake)

## Decisions & Rationale
${customDecisions && !customDecisions.includes("Universal living context") ? customDecisions : `### Facts vs Assumptions
- **Facts (Verified):** Repository contains ${scan.files.length} scanned files across ${scan.workspaceInfo.primaryLanguage} with ${scan.workspaceInfo.packageManager} package management.
- **Assumptions:** Host environments provide compatible runtime execution capabilities.

### Requirements vs Preferences
- **Requirements:** UNKNOWN (requires founder intake)
- **Preferences:** UNKNOWN (requires founder intake)`}

## Dependencies & Context Bindings
- Sibling Living Context: [architecture.ctx.md](architecture.ctx.md), [Requirements.ctx.md](Requirements.ctx.md), [security.ctx.md](security.ctx.md)

## Unresolved Issues & Historical Decisions
${customHistory && !customHistory.includes("Workspace initialized from a generated scaffold") ? customHistory : `- **Historical Decisions:** Established deterministic repository identity (\`${identity.repo_id}\`) and 13 canonical living context documents.
- **Unresolved Issues:** UNKNOWN (requires founder intake)`}
`;
}

function buildRequirementsDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const totalRoutes = scan.parsedFiles.reduce((acc, f) => acc + f.routes.length, 0);
  const totalSymbols = scan.parsedFiles.reduce((acc, f) => acc + f.symbols.length, 0);

  const customNonFunc = existing.get("Non-Functional Requirements & Invariants");

  return `# Requirements - Project Operating Context

## Domain Adaptation & Purpose
Living requirements ledger for ${identity.display_name}. Distinguishes statically verified implemented capabilities from in-progress requirements and planned features.

## Implemented & Verified Capabilities
- **Primary Technology Stack:** ${scan.workspaceInfo.primaryLanguage} (${scan.workspaceInfo.packageManager})
- **Frameworks Detected:** ${scan.workspaceInfo.frameworks.join(", ") || "None statically detected"}
- **Inbound Routes:** ${totalRoutes} route(s) detected
- **Mapped Code Symbols:** ${totalSymbols} function/class/interface symbol(s) detected
- **Monorepo Architecture:** ${scan.workspaceInfo.isMonorepo ? "Yes" : "No"}

## Non-Functional Requirements & Invariants
${customNonFunc ? customNonFunc : `- Performance, security, and scalability invariants: UNKNOWN (requires founder intake)`}

## Decisions & Rationale
### Implemented vs Speculative
- Implemented: Statically verified capabilities discovered across ${scan.parsedFiles.length} parsed source files.
- Speculative / Future: UNKNOWN (requires founder intake)

## Dependencies & Context Bindings
- Cross-references: [architecture.ctx.md](architecture.ctx.md), [api.ctx.md](api.ctx.md), [security.ctx.md](security.ctx.md)

## Unresolved Issues & Historical Decisions
- Unresolved issues: UNKNOWN (requires founder intake)
`;
}

function buildUserExperienceDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const totalRoutes = scan.parsedFiles.reduce((acc, f) => acc + f.routes.length, 0);
  const hasCli = scan.files.some((f) => f.relativePath.includes("cli") || f.relativePath.includes("bin/"));

  return `# U-Experience - Project Operating Context

## Domain Adaptation & Purpose
User experience specification for ${identity.display_name}. Defines the interaction surfaces and interface guidelines.

## Interaction Surfaces
### 1. Terminal / CLI Interface
${hasCli ? `- Statically identified CLI entry points in repository files.` : `- No dedicated terminal CLI entry points statically detected.`}

### 2. HTTP / API Interface
${totalRoutes > 0 ? `- Exposes ${totalRoutes} inbound route(s) across parsed files.` : `- No inbound HTTP or RPC route definitions statically detected.`}

### 3. User Experience Guidelines
- Interaction patterns and design guidelines: UNKNOWN (requires founder intake)

## Dependencies & Context Bindings
- Sibling Context: [coding-rules.ctx.md](coding-rules.ctx.md), [preference.ctx.md](preference.ctx.md)

## Unresolved Issues & Historical Decisions
- Unresolved UX items: UNKNOWN (requires founder intake)
`;
}

function buildArchitectureDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const totalFiles = scan.files.length;
  const totalSymbols = scan.parsedFiles.reduce((acc, f) => acc + f.symbols.length, 0);
  const totalRoutes = scan.parsedFiles.reduce((acc, f) => acc + f.routes.length, 0);
  const totalTables = scan.parsedFiles.reduce((acc, f) => acc + f.tables.length, 0);
  const frameworksStr = scan.workspaceInfo.frameworks.join(", ") || "None statically detected";

  let subsystems = "";
  if (meta.topLevelDirs.length > 0) {
    subsystems = meta.topLevelDirs
      .map((d, idx) => `${idx + 1}. **\`${d.name}/\`**: Contains ${d.fileCount} scanned file(s).`)
      .join("\n");
  } else {
    subsystems = "Single-level repository structure.";
  }

  return `# architecture - Project Operating Context

## Master Architectural Overview
**Repository:** ${identity.display_name} (\`${identity.repo_id}\`)
**Primary Technology Stack:** ${scan.workspaceInfo.primaryLanguage} (${scan.workspaceInfo.packageManager})
**Monorepo Structure:** ${scan.workspaceInfo.isMonorepo ? "Yes" : "No"}
**Detected Frameworks & Tools:** ${frameworksStr}

## Quantitative Repository Metrics
- Total Files Scanned: ${totalFiles}
- Parsed Source Files: ${scan.parsedFiles.length}
- Mapped Symbols (Functions, Classes, Types): ${totalSymbols}
- Inbound API Routes: ${totalRoutes}
- Relational Database Tables: ${totalTables}
- Static Assets Cataloged: ${scan.assets.length}
- Potential Secret Warnings Redacted: ${scan.secretWarnings.length}

## Subsystem Decomposition
${subsystems}

## Subsystem Relationship Diagram
\`\`\`mermaid
flowchart TD
    Client["Client / Invoker"] --> Root["${identity.display_name}"]
    Root --> Subsystems["Repository Modules"]
\`\`\`

## Living Context Map & Cross-References
- [Vision.ctx.md](Vision.ctx.md): Core purpose and domain
- [Requirements.ctx.md](Requirements.ctx.md): Implemented vs planned requirements
- [U-Experience.ctx.md](U-Experience.ctx.md): CLI and API surfaces
- [api.ctx.md](api.ctx.md): Endpoint and handler catalogue
- [database.ctx.md](database.ctx.md): Schema and persistence specification
- [security.ctx.md](security.ctx.md): Trust boundaries and secret handling
- [coding-rules.ctx.md](coding-rules.ctx.md): Tooling and conventions
`;
}

function buildLawDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const license = meta.license || "No explicit license detected in repository root; legal terms UNKNOWN.";

  return `# law - Project Operating Context

## Domain Adaptation & Purpose
Legal, compliance, licensing, and attribution specification for ${identity.display_name}.

## Licensing & Intellectual Property Boundaries
- **Repository License:** ${license}
- **Intellectual Property Boundaries:** UNKNOWN (requires compliance intake)

## Compliance Invariants
- Compliance requirements and regulatory constraints: UNKNOWN (requires compliance intake)

## Dependencies & Context Bindings
- Sibling Context: [security.ctx.md](security.ctx.md), [Vision.ctx.md](Vision.ctx.md)
`;
}

function buildDatabaseDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const allTables = scan.parsedFiles.flatMap((f) => f.tables.map((t) => ({ file: f.filePath, ...t })));

  let content = `# database - Project Operating Context

## Domain Adaptation & Purpose
Data storage, schema definitions, and persistence boundaries for ${identity.display_name}.

## Statically Detected Relational Schemas
`;

  if (allTables.length > 0) {
    content += `**Total Entities / Tables Detected:** ${allTables.length}\n\n`;
    for (const t of allTables) {
      content += `### Table: \`${t.tableName}\`\n- File: \`${t.file}:${t.line}\`\n- Columns: ${t.columns.join(", ") || "(none parsed)"}\n\n`;
    }
  } else {
    content += `**Status:** No relational database schema files (.sql) statically detected in this repository.\n`;
    content += `- Persistence model: UNKNOWN (or external / file-based).\n`;
  }

  content += `\n## Data Integrity & Persistence Architecture\n`;
  content += `- Integrity constraints and transaction model: UNKNOWN (requires founder intake)\n`;

  return content;
}

function buildDesignDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  return `# design - Project Operating Context

## Domain Adaptation & Purpose
System design principles, module boundaries, and architectural patterns for ${identity.display_name}.

## Design & Media Assets
- Static assets cataloged: ${scan.assets.length} file(s).

## Core Design Principles
- System design principles: UNKNOWN (requires founder intake)

## Dependencies & Context Bindings
- Sibling Context: [architecture.ctx.md](architecture.ctx.md), [coding-rules.ctx.md](coding-rules.ctx.md)
`;
}

function buildApiDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const allRoutes = scan.parsedFiles.flatMap((f) => f.routes.map((r) => ({ file: f.filePath, ...r })));

  let content = `# api - Project Operating Context

## Domain Adaptation & Purpose
API specification, route catalogue, and network interfaces for ${identity.display_name}.

## Inbound API Routes
`;

  if (allRoutes.length > 0) {
    content += `| Method | Path | Handler | Source File |\n`;
    content += `|---|---|---|---|\n`;
    for (const r of allRoutes) {
      content += `| \`${r.method}\` | \`${r.path}\` | \`${r.handlerSymbol}\` | \`${r.file}:${r.line}\` |\n`;
    }
  } else {
    content += `No inbound HTTP or RPC route definitions statically detected in this repository.\n`;
  }

  content += `\n## External API Integrations\n`;
  content += `- External services and network endpoints: UNKNOWN (requires founder intake)\n`;

  return content;
}

function buildCodingRulesDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  const linters = meta.detectedLinters.join(", ") || "No standard linter or formatter configuration statically detected.";

  return `# coding-rules - Project Operating Context

## Domain Adaptation & Purpose
Engineering rules, conventions, and style constraints for ${identity.display_name}.

## Detected Tooling & Linting
- **Active Tools & Linters:** ${linters}
- **Primary Language:** ${scan.workspaceInfo.primaryLanguage}

## Code Formatting Rules
- Formatting rules and coding standards: UNKNOWN (requires founder intake)

## Dependencies & Context Bindings
- Sibling Context: [design.ctx.md](design.ctx.md), [preference.ctx.md](preference.ctx.md)
`;
}

function buildRoadmapDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  return `# roadmap - Project Operating Context

## Domain Adaptation & Purpose
Product roadmap, milestone tracking, and development phases for ${identity.display_name}.

## Active Milestones
- Development milestones: UNKNOWN (requires founder intake)

## Current Phase
- Phase 0: Discovery & Repository Screening
`;
}

function buildPreferenceDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  return `# preference - Project Operating Context

## Domain Adaptation & Purpose
Operator and architectural preferences for ${identity.display_name}.

## Operator Preferences
- Team and operator preferences: UNKNOWN (requires founder intake)

## Architectural Preferences
- Architecture preferences: UNKNOWN (requires founder intake)
`;
}

function buildContinuityDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  gitState: ContextGitState,
  existing: Map<string, string>,
): string {
  return `# prompt-build-continunity-prompt - Project Operating Context

## Domain Adaptation & Purpose
Session continuity prompt and context handoff state for ${identity.display_name}.

## Continuity Context
- **Repository ID:** \`${identity.repo_id}\`
- **Primary Stack:** ${scan.workspaceInfo.primaryLanguage} (${scan.workspaceInfo.packageManager})
- **Active Branch:** \`${gitState.branch}\`
- **Current Commit:** \`${gitState.commit}\`
- **Working Tree State:** ${gitState.clean ? "clean" : "dirty"}
`;
}

function buildSecurityDoc(
  identity: RepoIdentity,
  scan: RepositoryScanResult,
  meta: TargetRepoMeta,
  existing: Map<string, string>,
): string {
  let secretNote = "";
  if (scan.secretWarnings.length === 0) {
    secretNote = "Static scan identified 0 obvious secrets matching static heuristics. Note: Static scanning is not exhaustive; dynamic and out-of-band secret auditing is still required.";
  } else {
    secretNote = `Static scanner flagged ${scan.secretWarnings.length} potential secret pattern(s) across source files (automatically redacted). Manual review is required to verify whether these are synthetic test fixtures or live credentials.`;
  }

  return `# security - Project Operating Context

## Domain Adaptation & Purpose
Security invariants, trust boundaries, and secret governance for ${identity.display_name}.

## Secret Detection & Governance
- **Static Secret Audit Status:** ${secretNote}

## Trust Boundaries & Security Invariants
- Security boundaries: UNKNOWN (requires security intake)
`;
}
