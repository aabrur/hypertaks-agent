import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  FileCategory,
  WorkspaceInfo,
  classifyFile,
  detectWorkspaceInfo,
  isIgnoredPath,
} from "./classifier";
import { ParsedFileResult } from "./parsers/types";
import { parseTypeScriptFile } from "./parsers/ts-parser";
import { parsePythonFile } from "./parsers/python-parser";
import { parseSqlFile } from "./parsers/sql-parser";
import { parseFallbackFile } from "./parsers/fallback-parser";
import { findSecrets, redactSecrets } from "../founder-brain";

export interface FileScanEntry {
  readonly relativePath: string;
  readonly category: FileCategory;
  readonly sizeBytes: number;
  readonly sha256: string;
}

export interface AssetScanEntry {
  readonly relativePath: string;
  readonly extension: string;
  readonly sizeBytes: number;
  readonly sha256: string;
}

export interface SecretWarning {
  readonly relativePath: string;
  readonly pattern: string;
}

export type ScanDepth = "shallow" | "deep";

export interface ScanOptions {
  readonly depth?: ScanDepth;
}

export interface ScanCoverage {
  readonly depth: ScanDepth;
  readonly totalScanned: number;
  readonly totalParsed: number;
  readonly totalSkipped: number;
  readonly totalUnsupported: number;
  readonly unresolvedImports: readonly string[];
  readonly coverageRatio: number;
}

export interface DependencyTrace {
  readonly internal: readonly string[];
  readonly external: readonly string[];
  readonly unresolved: readonly string[];
}

export interface RepositoryScanResult {
  readonly root: string;
  readonly scannedAt: string;
  readonly workspaceInfo: WorkspaceInfo;
  readonly files: readonly FileScanEntry[];
  readonly parsedFiles: readonly ParsedFileResult[];
  readonly assets: readonly AssetScanEntry[];
  readonly secretWarnings: readonly SecretWarning[];
  readonly depth: ScanDepth;
  readonly coverage: ScanCoverage;
  readonly dependencies: DependencyTrace;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function isShallowCandidate(relPath: string): boolean {
  const base = path.basename(relPath).toLowerCase();
  if (
    base === "package.json" ||
    base === "tsconfig.json" ||
    base === "pyproject.toml" ||
    base === "setup.py" ||
    base === "requirements.txt" ||
    base === "cargo.toml" ||
    base === "go.mod" ||
    base === "gemini-extension.json" ||
    base === "plugin.json"
  ) {
    return true;
  }
  if (
    base === "index.ts" ||
    base === "index.js" ||
    base === "main.ts" ||
    base === "main.js" ||
    base === "main.py" ||
    base === "app.ts" ||
    base === "app.js" ||
    base === "app.py" ||
    base === "cli.ts" ||
    base === "cli.js"
  ) {
    return true;
  }
  return false;
}

export function scanRepository(canonicalRoot: string, options?: ScanOptions): RepositoryScanResult {
  const depth: ScanDepth = options?.depth ?? "deep";
  const workspaceInfo = detectWorkspaceInfo(canonicalRoot);
  const files: FileScanEntry[] = [];
  const parsedFiles: ParsedFileResult[] = [];
  const assets: AssetScanEntry[] = [];
  const secretWarnings: SecretWarning[] = [];
  let skippedCount = 0;

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(canonicalRoot, fullPath).replace(/\\/g, "/");

      // Skip operating vault directory and ignore list
      if (entry.name === ".hypertaks" || isIgnoredPath(relPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const category = classifyFile(relPath);
        if (category === "ignored") {
          skippedCount++;
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.size > MAX_FILE_SIZE_BYTES) {
          skippedCount++;
          continue;
        }

        const buffer = fs.readFileSync(fullPath);
        const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

        files.push({
          relativePath: relPath,
          category,
          sizeBytes: stat.size,
          sha256,
        });

        if (category === "asset") {
          assets.push({
            relativePath: relPath,
            extension: path.extname(relPath).toLowerCase(),
            sizeBytes: stat.size,
            sha256,
          });
          continue;
        }

        // In shallow mode, parse only entry points and configuration files
        if (depth === "shallow" && !isShallowCandidate(relPath)) {
          continue;
        }

        // Parse text-based files
        const text = buffer.toString("utf8");
        const foundSecrets = findSecrets(text);
        if (foundSecrets.length > 0) {
          for (const pattern of foundSecrets) {
            secretWarnings.push({ relativePath: relPath, pattern });
          }
        }

        const safeText = foundSecrets.length > 0 ? redactSecrets(text) : text;
        const ext = path.extname(relPath).toLowerCase();

        let parsed: ParsedFileResult | null = null;
        if (
          ext === ".ts" ||
          ext === ".tsx" ||
          ext === ".js" ||
          ext === ".jsx" ||
          ext === ".mjs" ||
          ext === ".cjs"
        ) {
          parsed = parseTypeScriptFile(relPath, safeText);
        } else if (ext === ".py") {
          parsed = parsePythonFile(relPath, safeText);
        } else if (ext === ".sql") {
          parsed = parseSqlFile(relPath, safeText);
        } else if (ext === ".go" || ext === ".rs") {
          parsed = parseFallbackFile(relPath, safeText);
        }

        if (parsed) {
          parsedFiles.push(parsed);
        }
      }
    }
  }

  walk(canonicalRoot);

  // Trace dependencies across parsed files
  const internalDeps = new Set<string>();
  const externalDeps = new Set<string>();
  const unresolvedDeps = new Set<string>();

  for (const pf of parsedFiles) {
    for (const imp of pf.imports) {
      const spec = imp.moduleSpecifier;
      if (spec.startsWith(".") || spec.startsWith("/")) {
        internalDeps.add(spec);
      } else if (spec.startsWith("node:") || !spec.includes("/")) {
        externalDeps.add(spec);
      } else if (spec.startsWith("@")) {
        externalDeps.add(spec);
      } else {
        unresolvedDeps.add(spec);
      }
    }
  }

  const supportedExts = new Set([
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sql", ".go", ".rs"
  ]);
  const unsupportedCount = files.filter(
    (f) => !supportedExts.has(path.extname(f.relativePath).toLowerCase())
  ).length;

  const coverage: ScanCoverage = {
    depth,
    totalScanned: files.length,
    totalParsed: parsedFiles.length,
    totalSkipped: skippedCount,
    totalUnsupported: unsupportedCount,
    unresolvedImports: Array.from(unresolvedDeps),
    coverageRatio: files.length > 0 ? parsedFiles.length / files.length : 0,
  };

  const dependencies: DependencyTrace = {
    internal: Array.from(internalDeps),
    external: Array.from(externalDeps),
    unresolved: Array.from(unresolvedDeps),
  };

  return {
    root: canonicalRoot,
    scannedAt: new Date().toISOString(),
    workspaceInfo,
    files,
    parsedFiles,
    assets,
    secretWarnings,
    depth,
    coverage,
    dependencies,
  };
}
