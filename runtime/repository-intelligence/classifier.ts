import * as path from "node:path";
import * as fs from "node:fs";

export type FileCategory =
  | "source"
  | "test"
  | "configuration"
  | "documentation"
  | "asset"
  | "schema"
  | "ignored";

export interface WorkspaceInfo {
  readonly isMonorepo: boolean;
  readonly primaryLanguage: "TypeScript" | "JavaScript" | "Python" | "Mixed" | "Unknown";
  readonly packageManager: "npm" | "pnpm" | "yarn" | "bun" | "poetry" | "uv" | "pip" | "unknown";
  readonly frameworks: readonly string[];
}

export const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "out",
  ".cache",
  "coverage",
  ".venv",
  "venv",
  "__pycache__",
]);

export const ASSET_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".mp4",
  ".mp3",
  ".wasm",
]);

export function isIgnoredPath(relativeFilePath: string): boolean {
  const normalized = relativeFilePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (IGNORED_DIRECTORIES.has(seg)) {
      return true;
    }
  }
  // Exclude .env files from inspection content
  const basename = path.basename(normalized);
  if (basename.startsWith(".env") && !basename.endsWith(".example")) {
    return true;
  }
  return false;
}

export function classifyFile(relativeFilePath: string): FileCategory {
  if (isIgnoredPath(relativeFilePath)) {
    return "ignored";
  }

  const ext = path.extname(relativeFilePath).toLowerCase();
  const basename = path.basename(relativeFilePath).toLowerCase();

  if (ASSET_EXTENSIONS.has(ext)) {
    return "asset";
  }

  if (
    basename.includes(".test.") ||
    basename.includes(".spec.") ||
    basename.startsWith("test_") ||
    basename.endsWith("_test.py") ||
    relativeFilePath.includes("/tests/") ||
    relativeFilePath.includes("/__tests__/")
  ) {
    return "test";
  }

  if (ext === ".md" || ext === ".mdx" || ext === ".txt" || ext === ".rst") {
    return "documentation";
  }

  if (
    ext === ".sql" ||
    basename.endsWith(".prisma") ||
    basename.endsWith(".graphql") ||
    basename.endsWith(".gql")
  ) {
    return "schema";
  }

  if (
    ext === ".json" ||
    ext === ".yaml" ||
    ext === ".yml" ||
    ext === ".toml" ||
    basename.startsWith("tsconfig") ||
    basename.startsWith("package") ||
    basename.startsWith(".eslintrc")
  ) {
    return "configuration";
  }

  if (
    ext === ".ts" ||
    ext === ".tsx" ||
    ext === ".js" ||
    ext === ".jsx" ||
    ext === ".mjs" ||
    ext === ".cjs" ||
    ext === ".py" ||
    ext === ".go" ||
    ext === ".rs"
  ) {
    return "source";
  }

  return "configuration";
}

export function detectWorkspaceInfo(canonicalRoot: string): WorkspaceInfo {
  let isMonorepo = false;
  let packageManager: WorkspaceInfo["packageManager"] = "unknown";
  const frameworks: string[] = [];

  const pkgJsonPath = path.join(canonicalRoot, "package.json");
  let hasNode = false;
  let hasPython = false;

  if (fs.existsSync(pkgJsonPath)) {
    hasNode = true;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as Record<string, unknown>;
      if (pkg.workspaces) {
        isMonorepo = true;
      }
      const deps = {
        ...((pkg.dependencies as Record<string, string>) || {}),
        ...((pkg.devDependencies as Record<string, string>) || {}),
      };
      if (deps["next"]) frameworks.push("Next.js");
      if (deps["react"]) frameworks.push("React");
      if (deps["express"]) frameworks.push("Express");
      if (deps["vue"]) frameworks.push("Vue");
      if (deps["@nestjs/core"]) frameworks.push("NestJS");
      if (deps["prisma"]) frameworks.push("Prisma");
      if (deps["drizzle-orm"]) frameworks.push("Drizzle");
    } catch {
      // Ignore parse failure
    }
  }

  if (fs.existsSync(path.join(canonicalRoot, "pnpm-lock.yaml"))) packageManager = "pnpm";
  else if (fs.existsSync(path.join(canonicalRoot, "yarn.lock"))) packageManager = "yarn";
  else if (fs.existsSync(path.join(canonicalRoot, "package-lock.json"))) packageManager = "npm";
  else if (fs.existsSync(path.join(canonicalRoot, "bun.lockb"))) packageManager = "bun";

  if (
    fs.existsSync(path.join(canonicalRoot, "pyproject.toml")) ||
    fs.existsSync(path.join(canonicalRoot, "requirements.txt"))
  ) {
    hasPython = true;
    if (fs.existsSync(path.join(canonicalRoot, "poetry.lock"))) packageManager = "poetry";
    else if (fs.existsSync(path.join(canonicalRoot, "uv.lock"))) packageManager = "uv";
    else if (packageManager === "unknown") packageManager = "pip";
  }

  let primaryLanguage: WorkspaceInfo["primaryLanguage"] = "Unknown";
  if (hasNode && hasPython) primaryLanguage = "Mixed";
  else if (hasNode) primaryLanguage = "TypeScript";
  else if (hasPython) primaryLanguage = "Python";

  return {
    isMonorepo,
    primaryLanguage,
    packageManager,
    frameworks,
  };
}
