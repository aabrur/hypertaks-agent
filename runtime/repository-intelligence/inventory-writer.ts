import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryScanResult } from "./scanner";
import { resolveWithinApprovedRoot } from "../founder-brain";

export function writeInventories(
  canonicalRoot: string,
  scanResult: RepositoryScanResult,
): readonly string[] {
  const inventoryDir = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "inventory"), true);

  const writtenFiles: string[] = [];

  // 1. files.jsonl
  const filesJsonlPath = path.join(inventoryDir, "files.jsonl");
  const filesLines = scanResult.files.map((f) => JSON.stringify(f)).join("\n");
  fs.writeFileSync(filesJsonlPath, filesLines ? filesLines + "\n" : "", "utf8");
  writtenFiles.push(".hypertaks/inventory/files.jsonl");

  // 2. symbols.jsonl
  const symbolsJsonlPath = path.join(inventoryDir, "symbols.jsonl");
  const symbolRecords: Array<{
    readonly file: string;
    readonly name: string;
    readonly kind: string;
    readonly line: number;
    readonly exported: boolean;
  }> = [];

  for (const pf of scanResult.parsedFiles) {
    for (const sym of pf.symbols) {
      symbolRecords.push({
        file: pf.filePath,
        name: sym.name,
        kind: sym.kind,
        line: sym.line,
        exported: sym.exported,
      });
    }
  }
  const symbolsLines = symbolRecords.map((s) => JSON.stringify(s)).join("\n");
  fs.writeFileSync(symbolsJsonlPath, symbolsLines ? symbolsLines + "\n" : "", "utf8");
  writtenFiles.push(".hypertaks/inventory/symbols.jsonl");

  // 3. routes.json
  const routesJsonPath = path.join(inventoryDir, "routes.json");
  const allRoutes: Array<{
    readonly file: string;
    readonly method: string;
    readonly path: string;
    readonly handler: string;
    readonly line: number;
  }> = [];

  for (const pf of scanResult.parsedFiles) {
    for (const r of pf.routes) {
      allRoutes.push({
        file: pf.filePath,
        method: r.method,
        path: r.path,
        handler: r.handlerSymbol,
        line: r.line,
      });
    }
  }
  fs.writeFileSync(routesJsonPath, JSON.stringify(allRoutes, null, 2) + "\n", "utf8");
  writtenFiles.push(".hypertaks/inventory/routes.json");

  // 4. endpoints.json (Network calls / outgoing endpoints)
  const endpointsJsonPath = path.join(inventoryDir, "endpoints.json");
  const allEndpoints: Array<{
    readonly file: string;
    readonly callee: string;
    readonly endpoint?: string | undefined;
    readonly line: number;
  }> = [];

  for (const pf of scanResult.parsedFiles) {
    for (const nc of pf.networkCalls) {
      allEndpoints.push({
        file: pf.filePath,
        callee: nc.callee,
        endpoint: nc.targetUrlOrEndpoint,
        line: nc.line,
      });
    }
  }
  fs.writeFileSync(endpointsJsonPath, JSON.stringify(allEndpoints, null, 2) + "\n", "utf8");
  writtenFiles.push(".hypertaks/inventory/endpoints.json");

  // 5. dependencies.json (Imports / intra-project links)
  const depsJsonPath = path.join(inventoryDir, "dependencies.json");
  const allDependencies: Array<{
    readonly file: string;
    readonly moduleSpecifier: string;
    readonly symbols: readonly string[];
  }> = [];

  for (const pf of scanResult.parsedFiles) {
    for (const imp of pf.imports) {
      allDependencies.push({
        file: pf.filePath,
        moduleSpecifier: imp.moduleSpecifier,
        symbols: imp.symbols,
      });
    }
  }
  fs.writeFileSync(depsJsonPath, JSON.stringify(allDependencies, null, 2) + "\n", "utf8");
  writtenFiles.push(".hypertaks/inventory/dependencies.json");

  // 6. packages.json (Workspace info)
  const packagesJsonPath = path.join(inventoryDir, "packages.json");
  fs.writeFileSync(
    packagesJsonPath,
    JSON.stringify(scanResult.workspaceInfo, null, 2) + "\n",
    "utf8",
  );
  writtenFiles.push(".hypertaks/inventory/packages.json");

  // 7. assets.json
  const assetsJsonPath = path.join(inventoryDir, "assets.json");
  fs.writeFileSync(assetsJsonPath, JSON.stringify(scanResult.assets, null, 2) + "\n", "utf8");
  writtenFiles.push(".hypertaks/inventory/assets.json");

  // 8. environment.json (Observed environment variable names, NEVER secrets)
  const envJsonPath = path.join(inventoryDir, "environment.json");
  const envVars = new Set<string>();
  for (const pf of scanResult.parsedFiles) {
    const raw = fs.readFileSync(path.join(canonicalRoot, pf.filePath), "utf8");
    const matches = raw.matchAll(/process\.env\.([A-Z0-9_]+)/g);
    for (const m of matches) {
      if (m[1]) envVars.add(m[1]);
    }
  }
  const envData = {
    detectedVariables: Array.from(envVars).sort(),
    secretWarnings: scanResult.secretWarnings.map((w) => w.relativePath),
  };
  fs.writeFileSync(envJsonPath, JSON.stringify(envData, null, 2) + "\n", "utf8");
  writtenFiles.push(".hypertaks/inventory/environment.json");

  return writtenFiles;
}
