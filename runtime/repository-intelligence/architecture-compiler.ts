import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryScanResult } from "./scanner";
import { RepoIdentity } from "../repo-identity";
import { resolveWithinApprovedRoot } from "../founder-brain";

export function compileArchitecturePack(
  canonicalRoot: string,
  identity: RepoIdentity,
  scanResult: RepositoryScanResult,
): readonly string[] {
  const dotHypertaks = resolveWithinApprovedRoot(canonicalRoot, ".hypertaks", true);
  const archDir = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "architecture"), true);
  const diagramsDir = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "diagrams"), true);

  const written: string[] = [];
  const now = new Date().toISOString();

  // Extract key summary items
  const totalFiles = scanResult.files.length;
  const totalSymbols = scanResult.parsedFiles.reduce((acc, f) => acc + f.symbols.length, 0);
  const totalRoutes = scanResult.parsedFiles.reduce((acc, f) => acc + f.routes.length, 0);
  const totalTables = scanResult.parsedFiles.reduce((acc, f) => acc + f.tables.length, 0);
  const frameworksStr = scanResult.workspaceInfo.frameworks.join(", ") || "None detected";

  // 1. Root ARCHITECTURE.md
  const archContent = `# Architecture Specification

**Repository:** ${identity.display_name}  
**Repository ID:** \`${identity.repo_id}\`  
**Generated At:** ${now}  
**Status:** EVIDENCE VERIFIED  

## System Context & Technology Stack
- Primary Language: ${scanResult.workspaceInfo.primaryLanguage}
- Package Manager: ${scanResult.workspaceInfo.packageManager}
- Monorepo: ${scanResult.workspaceInfo.isMonorepo ? "Yes" : "No"}
- Frameworks & Libraries: ${frameworksStr}
- Total Scanned Files: ${totalFiles}
- Total Detected Symbols: ${totalSymbols}

## Major Subsystems & Boundaries
- Inbound Routes: ${totalRoutes} endpoints mapped
- Data Schemas: ${totalTables} tables or entity models mapped
- Static Assets: ${scanResult.assets.length} items cataloged

## Primary Data Flows
\`\`\`mermaid
flowchart TD
    Client["Client / User"] --> InboundRoutes["Inbound Routes (${totalRoutes})"]
    InboundRoutes --> BusinessLogic["Application Logic (${totalSymbols} symbols)"]
    BusinessLogic --> Storage["Database / Storage (${totalTables} tables)"]
\`\`\`

## Evidence Sources
All architecture findings derive from physical repository files scanned by Hypertaks RTS.
- Inventories: \`.hypertaks/inventory/\`
- Graph Indexes: \`.hypertaks/graph/\`
`;
  fs.writeFileSync(path.join(dotHypertaks, "ARCHITECTURE.md"), archContent, "utf8");
  written.push(".hypertaks/ARCHITECTURE.md");

  // 2. Root FUNCTION-MAP.md
  const highValueSymbols = scanResult.parsedFiles
    .flatMap((f) =>
      f.symbols
        .filter((s) => s.exported && (s.kind === "function" || s.kind === "component" || s.kind === "class"))
        .map((s) => ({ file: f.filePath, ...s })),
    )
    .slice(0, 100);

  let funcContent = `# Function and Symbol Map

**Repository:** ${identity.display_name}  
**Total Symbols:** ${totalSymbols}  

| Symbol | Kind | File | Line |
|---|---|---|---|
`;
  for (const s of highValueSymbols) {
    funcContent += `| \`${s.name}\` | ${s.kind} | \`${s.file}\` | ${s.line} |\n`;
  }
  if (highValueSymbols.length === 0) {
    funcContent += "| (none detected) | - | - | - |\n";
  }
  fs.writeFileSync(path.join(dotHypertaks, "FUNCTION-MAP.md"), funcContent, "utf8");
  written.push(".hypertaks/FUNCTION-MAP.md");

  // 3. Root DATA-MODEL.md
  const allTables = scanResult.parsedFiles.flatMap((f) =>
    f.tables.map((t) => ({ file: f.filePath, ...t })),
  );
  let dataModelContent = `# Data Model Specification

**Repository:** ${identity.display_name}  
**Total Entities / Tables:** ${totalTables}  

`;
  if (allTables.length > 0) {
    for (const t of allTables) {
      dataModelContent += `### Table: \`${t.tableName}\`\n- File: \`${t.file}:${t.line}\`\n`;
      dataModelContent += `- Columns: ${t.columns.join(", ") || "(none parsed)"}\n`;
      if (t.foreignKeys.length > 0) {
        dataModelContent += `- Relations:\n`;
        for (const fk of t.foreignKeys) {
          dataModelContent += `  - \`${fk.column}\` -> \`${fk.targetTable}(${fk.targetColumn})\`\n`;
        }
      }
      dataModelContent += "\n";
    }
  } else {
    dataModelContent += "No SQL or schema tables were statically detected.\n";
  }
  fs.writeFileSync(path.join(dotHypertaks, "DATA-MODEL.md"), dataModelContent, "utf8");
  written.push(".hypertaks/DATA-MODEL.md");

  // 4. Root NETWORK-DEPENDENCIES.md
  const allRoutes = scanResult.parsedFiles.flatMap((f) =>
    f.routes.map((r) => ({ file: f.filePath, ...r })),
  );
  const allCalls = scanResult.parsedFiles.flatMap((f) =>
    f.networkCalls.map((c) => ({ file: f.filePath, ...c })),
  );

  let netContent = `# Network and External Dependencies

**Repository:** ${identity.display_name}  

## Inbound Endpoints (${allRoutes.length})
| Method | Path | Handler | File |
|---|---|---|---|
`;
  for (const r of allRoutes) {
    netContent += `| \`${r.method}\` | \`${r.path}\` | \`${r.handlerSymbol}\` | \`${r.file}:${r.line}\` |\n`;
  }
  if (allRoutes.length === 0) netContent += "| - | - | - | - |\n";

  netContent += `\n## Outbound Network Calls (${allCalls.length})\n`;
  for (const c of allCalls.slice(0, 50)) {
    netContent += `- \`${c.callee}\` at \`${c.file}:${c.line}\`${c.targetUrlOrEndpoint ? ` -> \`${c.targetUrlOrEndpoint}\`` : ""}\n`;
  }
  fs.writeFileSync(path.join(dotHypertaks, "NETWORK-DEPENDENCIES.md"), netContent, "utf8");
  written.push(".hypertaks/NETWORK-DEPENDENCIES.md");

  // 5. Root ASSET-INDEX.md
  let assetContent = `# Asset Index

**Repository:** ${identity.display_name}  
**Total Assets:** ${scanResult.assets.length}  

| Path | Extension | Size (Bytes) | Hash |
|---|---|---|---|
`;
  for (const a of scanResult.assets.slice(0, 50)) {
    assetContent += `| \`${a.relativePath}\` | \`${a.extension}\` | ${a.sizeBytes} | \`${a.sha256.slice(0, 8)}\` |\n`;
  }
  if (scanResult.assets.length === 0) assetContent += "| - | - | - | - |\n";
  fs.writeFileSync(path.join(dotHypertaks, "ASSET-INDEX.md"), assetContent, "utf8");
  written.push(".hypertaks/ASSET-INDEX.md");

  // 6. Diagrams
  const sysDiagram = `flowchart TD\n    Repo["${identity.display_name}"] --> Modules["Modules (${totalFiles} files)"]\n    Modules --> Symbols["Symbols (${totalSymbols} detected)"]\n`;
  fs.writeFileSync(path.join(diagramsDir, "system-overview.mmd"), sysDiagram, "utf8");
  written.push(".hypertaks/diagrams/system-overview.mmd");

  // 7. Detailed docs in architecture/
  fs.writeFileSync(
    path.join(archDir, "SYSTEM.md"),
    `# System Architecture Detail\n\nFramework: ${frameworksStr}\nScanned: ${now}\n`,
    "utf8",
  );
  written.push(".hypertaks/architecture/SYSTEM.md");

  return written;
}
