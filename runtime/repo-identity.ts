import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { loadReleaseVersion } from "./version";
import { resolveWithinApprovedRoot } from "./founder-brain";

export interface RepoIdentity {
  readonly schema: "hypertaks.repo.v1";
  readonly repo_id: string;
  readonly display_name: string;
  readonly root_fingerprint: string;
  readonly remote_fingerprint: string;
  readonly created_at: string;
  readonly last_seen_at: string;
  readonly hypertaks_product_version: string;
}

export function stripGitCredentials(remoteUrl: string): string {
  if (!remoteUrl) return "";
  const trimmed = remoteUrl.trim();
  // Strip http/https user:pass or token credentials
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      parsed.username = "";
      parsed.password = "";
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, fallback to regex
  }
  // Regex to strip http(s)://user:token@... or https://token@...
  return trimmed.replace(/^(https?:\/\/)[^/@]+@/, "$1");
}

export function resolveCanonicalRoot(inputPath: string): string {
  const resolved = path.resolve(inputPath);
  try {
    return fs.realpathSync.native(resolved);
  } catch {
    return resolved;
  }
}

export function getGitRemoteUrl(canonicalRoot: string): string | null {
  try {
    const raw = execFileSync("git", ["config", "--get", "remote.origin.url"], {
      cwd: canonicalRoot,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return raw.trim() || null;
  } catch {
    return null;
  }
}

export function computeRootFingerprint(canonicalRoot: string): string {
  return crypto.createHash("sha256").update(canonicalRoot).digest("hex");
}

export function computeRemoteFingerprint(sanitizedRemoteUrl: string | null): string {
  if (!sanitizedRemoteUrl) {
    return "local-only";
  }
  return crypto.createHash("sha256").update(sanitizedRemoteUrl).digest("hex");
}

export function sanitizeSlug(input: string): string {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "repo";
}

export function generateRepoId(canonicalRoot: string, sanitizedRemoteUrl: string | null): string {
  let baseName = path.basename(canonicalRoot);
  if (sanitizedRemoteUrl) {
    const match = sanitizedRemoteUrl.match(/\/([^/]+?)(?:\.git)?$/);
    if (match && match[1]) {
      baseName = match[1];
    }
  }
  const slug = sanitizeSlug(baseName).slice(0, 24);
  const hashPayload = `${canonicalRoot}|${sanitizedRemoteUrl ?? "none"}`;
  const shortHash = crypto.createHash("sha256").update(hashPayload).digest("hex").slice(0, 6);
  return `${slug}-${shortHash}`;
}

export function createRepoIdentity(
  canonicalRoot: string,
  options?: {
    readonly customRemoteUrl?: string | null;
    readonly productVersion?: string;
    readonly displayName?: string;
  },
): RepoIdentity {
  const rawRemote = options?.customRemoteUrl !== undefined ? options.customRemoteUrl : getGitRemoteUrl(canonicalRoot);
  const sanitizedRemote = rawRemote ? stripGitCredentials(rawRemote) : null;
  const rootFingerprint = computeRootFingerprint(canonicalRoot);
  const remoteFingerprint = computeRemoteFingerprint(sanitizedRemote);
  const repoId = generateRepoId(canonicalRoot, sanitizedRemote);
  const versionInfo = loadReleaseVersion(canonicalRoot);
  const productVersion = options?.productVersion ?? versionInfo.productVersion;
  const now = new Date().toISOString();

  let displayName = options?.displayName;
  if (!displayName) {
    displayName = path.basename(canonicalRoot);
    if (sanitizedRemote) {
      const match = sanitizedRemote.match(/\/([^/]+?)(?:\.git)?$/);
      if (match && match[1]) {
        displayName = match[1];
      }
    }
  }

  return {
    schema: "hypertaks.repo.v1",
    repo_id: repoId,
    display_name: displayName,
    root_fingerprint: rootFingerprint,
    remote_fingerprint: remoteFingerprint,
    created_at: now,
    last_seen_at: now,
    hypertaks_product_version: productVersion,
  };
}

export function readRepoIdentity(canonicalRoot: string): RepoIdentity | null {
  try {
    const repoJsonPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "repo.json"), false);
    if (!fs.existsSync(repoJsonPath)) {
      return null;
    }
    const content = fs.readFileSync(repoJsonPath, "utf8");
    const parsed = JSON.parse(content) as RepoIdentity;
    if (parsed.schema === "hypertaks.repo.v1" && typeof parsed.repo_id === "string") {
      return parsed;
    }
  } catch {
    // Malformed repo.json, uninitialized, or symlink traversal blocked
  }
  return null;
}

export function saveRepoIdentity(canonicalRoot: string, identity: RepoIdentity): void {
  const repoJsonPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "repo.json"), true);
  const tempPath = `${repoJsonPath}.tmp.${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tempPath, JSON.stringify(identity, null, 2) + "\n", "utf8");
  fs.renameSync(tempPath, repoJsonPath);
}

export function loadOrInitRepoIdentity(
  canonicalRoot: string,
  options?: {
    readonly customRemoteUrl?: string | null;
    readonly productVersion?: string;
    readonly displayName?: string;
  },
): { readonly identity: RepoIdentity; readonly created: boolean; readonly rebindDetected: boolean } {
  const existing = readRepoIdentity(canonicalRoot);
  const currentRootFingerprint = computeRootFingerprint(canonicalRoot);

  if (existing) {
    const rebindDetected = existing.root_fingerprint !== currentRootFingerprint;
    const updated: RepoIdentity = {
      ...existing,
      last_seen_at: new Date().toISOString(),
      hypertaks_product_version: options?.productVersion ?? existing.hypertaks_product_version,
    };
    saveRepoIdentity(canonicalRoot, updated);
    return { identity: updated, created: false, rebindDetected };
  }

  const fresh = createRepoIdentity(canonicalRoot, options);
  saveRepoIdentity(canonicalRoot, fresh);
  return { identity: fresh, created: true, rebindDetected: false };
}
