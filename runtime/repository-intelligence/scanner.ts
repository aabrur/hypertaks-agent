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

export interface RepositoryScanResult {
  readonly root: string;
  readonly scannedAt: string;
  readonly workspaceInfo: WorkspaceInfo;
  readonly files: readonly FileScanEntry[];
  readonly parsedFiles: readonly ParsedFileResult[];
  readonly assets: readonly AssetScanEntry[];
  readonly secretWarnings: readonly SecretWarning[];
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function scanRepository(canonicalRoot: string): RepositoryScanResult {
  const workspaceInfo = detectWorkspaceInfo(canonicalRoot);
  const files: FileScanEntry[] = [];
  const parsedFiles: ParsedFileResult[] = [];
  const assets: AssetScanEntry[] = [];
  const secretWarnings: SecretWarning[] = [];

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
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.size > MAX_FILE_SIZE_BYTES) {
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

  return {
    root: canonicalRoot,
    scannedAt: new Date().toISOString(),
    workspaceInfo,
    files,
    parsedFiles,
    assets,
    secretWarnings,
  };
}
