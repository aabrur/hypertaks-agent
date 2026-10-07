import * as fs from "node:fs";
import * as path from "node:path";

export interface ReleaseVersionInfo {
  readonly schema: string;
  readonly productVersion: string;
  readonly displayVersion: string;
  readonly semverCompatibilityVersion: string;
  readonly previousHistoricalVersion: string;
  readonly previousProductAlias: string;
  readonly previousSemverCompatibilityVersion: string;
}

export const FALLBACK_RELEASE_VERSION: ReleaseVersionInfo = {
  schema: "hypertaks.release.v2",
  productVersion: "0.0.4.5.9",
  displayVersion: "v0.0.4.5.9",
  semverCompatibilityVersion: "0.0.4-5.9",
  previousHistoricalVersion: "4.5.8",
  previousProductAlias: "0.0.4.5.9",
  previousSemverCompatibilityVersion: "0.0.4-5.9",
};

export function loadReleaseVersion(customRoot?: string): ReleaseVersionInfo {
  const root = customRoot ?? process.cwd();
  const target = path.join(root, "release", "version.json");
  if (!fs.existsSync(target)) {
    return FALLBACK_RELEASE_VERSION;
  }
  try {
    const raw = fs.readFileSync(target, "utf8");
    const parsed = JSON.parse(raw) as Partial<ReleaseVersionInfo>;
    if (
      typeof parsed.productVersion === "string" &&
      typeof parsed.displayVersion === "string" &&
      typeof parsed.semverCompatibilityVersion === "string"
    ) {
      return {
        schema: parsed.schema ?? "hypertaks.release.v2",
        productVersion: parsed.productVersion,
        displayVersion: parsed.displayVersion,
        semverCompatibilityVersion: parsed.semverCompatibilityVersion,
        previousHistoricalVersion: parsed.previousHistoricalVersion ?? "4.5.8",
        previousProductAlias: parsed.previousProductAlias ?? "0.0.4.5.9",
        previousSemverCompatibilityVersion: parsed.previousSemverCompatibilityVersion ?? "0.0.4-5.9",
      };
    }
  } catch {
    // Return fallback if reading or parsing fails
  }
  return FALLBACK_RELEASE_VERSION;
}
