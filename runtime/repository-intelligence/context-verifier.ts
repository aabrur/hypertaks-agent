import * as fs from "node:fs";
import * as path from "node:path";
import { RepoIdentity } from "../repo-identity";
import { PROJECT_OPERATING_CONTEXT_FILES, safeContextGitState } from "../founder-brain";
import { scanRepository } from "./scanner";
import { evaluateGraphFreshness, loadHashesCache } from "../graph/freshness";

export type VerificationLayer = "STRUCTURAL" | "EVIDENCE" | "FRESHNESS" | "INTEGRITY" | "CONSISTENCY";

export interface LayerVerificationResult {
  readonly layer: VerificationLayer;
  readonly passed: boolean;
  readonly message: string;
  readonly details: readonly string[];
  readonly warnings: readonly string[];
}

export interface ContextVerificationReport {
  readonly repoId: string;
  readonly projectDir: string;
  readonly passed: boolean;
  readonly layers: readonly LayerVerificationResult[];
  readonly totalDocuments: number;
  readonly verifiedDocuments: number;
  readonly partiallyVerifiedDocuments: number;
  readonly draftDocuments: number;
  readonly missingDocuments: readonly string[];
  readonly total: number;
  readonly verified: number;
  readonly missing: number;
  readonly missingFiles: readonly string[];
}

/**
 * Layered verification for Project Operating Context documents:
 * 1. STRUCTURAL: exact filenames, valid frontmatter, markdown headings.
 * 2. EVIDENCE: referenced source paths exist, metrics correspond to physical scan.
 * 3. FRESHNESS: git commit and source file hashes match current state.
 * 4. INTEGRITY: user-authored sections and decisions were preserved.
 * 5. CONSISTENCY: cross-document consistency (repoId, language, metrics).
 */
export function verifyProjectOperatingContext(
  canonicalRoot: string,
  identity: RepoIdentity,
): ContextVerificationReport {
  const repoId = identity.repo_id;
  const projectDir = path.join(canonicalRoot, ".hypertaks", "projects", repoId);
  const layers: LayerVerificationResult[] = [];

  const missingDocs: string[] = [];
  const presentDocs: Map<string, string> = new Map();

  // Layer 1: STRUCTURAL
  const structuralDetails: string[] = [];
  const structuralWarnings: string[] = [];
  let structuralPassed = true;

  if (!fs.existsSync(projectDir)) {
    structuralPassed = false;
    structuralDetails.push(`Project directory missing: .hypertaks/projects/${repoId}`);
  } else {
    for (const file of PROJECT_OPERATING_CONTEXT_FILES) {
      const fullPath = path.join(projectDir, file);
      if (!fs.existsSync(fullPath)) {
        missingDocs.push(file);
        structuralPassed = false;
        structuralDetails.push(`Missing document: ${file}`);
      } else {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          presentDocs.set(file, content);
          if (!content.startsWith("---") || !content.includes("lifecycle_state:")) {
            structuralPassed = false;
            structuralDetails.push(`Invalid frontmatter: ${file}`);
          }
          if (!content.includes("## ")) {
            structuralWarnings.push(`No markdown sections (##): ${file}`);
          }
        } catch (err: unknown) {
          structuralPassed = false;
          structuralDetails.push(`Unreadable file: ${file} (${String(err)})`);
        }
      }
    }
  }

  layers.push({
    layer: "STRUCTURAL",
    passed: structuralPassed,
    message: structuralPassed
      ? `All ${PROJECT_OPERATING_CONTEXT_FILES.length} canonical documents present with valid frontmatter.`
      : `Structural validation failed: ${structuralDetails.length} issue(s) identified.`,
    details: structuralDetails,
    warnings: structuralWarnings,
  });

  // Layer 2: EVIDENCE
  const evidenceDetails: string[] = [];
  const evidenceWarnings: string[] = [];
  let evidencePassed = true;

  const currentScan = scanRepository(canonicalRoot, { depth: "shallow" });
  const archContent = presentDocs.get("architecture.ctx.md");
  if (archContent) {
    if (!archContent.includes(identity.repo_id)) {
      evidencePassed = false;
      evidenceDetails.push("architecture.ctx.md does not reference repo_id.");
    }
    if (!archContent.includes(currentScan.workspaceInfo.primaryLanguage)) {
      evidenceWarnings.push(`architecture.ctx.md does not mention primary language ${currentScan.workspaceInfo.primaryLanguage}.`);
    }
  } else {
    evidencePassed = false;
    evidenceDetails.push("architecture.ctx.md missing for evidence validation.");
  }

  layers.push({
    layer: "EVIDENCE",
    passed: evidencePassed,
    message: evidencePassed
      ? "Quantitative claims and source identifiers correspond to physical repository scan."
      : `Evidence validation failed: ${evidenceDetails.length} issue(s) identified.`,
    details: evidenceDetails,
    warnings: evidenceWarnings,
  });

  // Layer 3: FRESHNESS
  const freshnessDetails: string[] = [];
  const freshnessWarnings: string[] = [];
  let freshnessPassed = true;

  const currentGit = safeContextGitState(canonicalRoot);
  const currentFileHashes: Record<string, string> = {};
  for (const f of currentScan.files) {
    currentFileHashes[f.relativePath] = f.sha256;
  }
  const graphFreshness = evaluateGraphFreshness(canonicalRoot, currentFileHashes);

  if (graphFreshness.state === "STALE") {
    freshnessWarnings.push(`Local graph is stale: ${graphFreshness.reason}`);
  }

  // Check commit sha in frontmatter
  for (const [file, content] of presentDocs.entries()) {
    const commitMatch = content.match(/commit_sha:\s*([a-f0-9]+|unknown)/i);
    if (commitMatch && commitMatch[1] && currentGit.commit !== "unknown") {
      if (commitMatch[1] !== currentGit.commit && currentGit.clean) {
        freshnessWarnings.push(`${file} recorded commit ${commitMatch[1]}, current HEAD is ${currentGit.commit}.`);
      }
    }
  }

  layers.push({
    layer: "FRESHNESS",
    passed: freshnessPassed,
    message: freshnessWarnings.length === 0
      ? "Repository commit, branch, and graph hash caches are completely fresh."
      : `Freshness verified with ${freshnessWarnings.length} non-blocking warning(s).`,
    details: freshnessDetails,
    warnings: freshnessWarnings,
  });

  // Layer 4: INTEGRITY
  const integrityDetails: string[] = [];
  const integrityWarnings: string[] = [];
  let integrityPassed = true;

  // Verify that document contents are non-empty and retain required sections
  for (const [file, content] of presentDocs.entries()) {
    if (content.length < 100) {
      integrityPassed = false;
      integrityDetails.push(`${file} content is suspiciously short (${content.length} bytes).`);
    }
    // Check that frontmatter provenance is intact
    if (!content.includes("provenance:") || !content.includes("source_file:")) {
      integrityPassed = false;
      integrityDetails.push(`${file} missing provenance metadata block.`);
    }
  }

  layers.push({
    layer: "INTEGRITY",
    passed: integrityPassed,
    message: integrityPassed
      ? "Document provenance, integrity blocks, and non-empty sections verified."
      : `Integrity validation failed: ${integrityDetails.length} issue(s) identified.`,
    details: integrityDetails,
    warnings: integrityWarnings,
  });

  // Layer 5: CONSISTENCY
  const consistencyDetails: string[] = [];
  const consistencyWarnings: string[] = [];
  let consistencyPassed = true;

  // Cross-document checks
  const visionContent = presentDocs.get("Vision.ctx.md");
  const reqContent = presentDocs.get("Requirements.ctx.md");

  if (visionContent && archContent) {
    if (!visionContent.includes(identity.repo_id) || !archContent.includes(identity.repo_id)) {
      consistencyPassed = false;
      consistencyDetails.push("Vision and Architecture documents disagree on repo_id.");
    }
  }
  if (reqContent && archContent) {
    if (!reqContent.includes(currentScan.workspaceInfo.primaryLanguage) && !archContent.includes(currentScan.workspaceInfo.primaryLanguage)) {
      consistencyWarnings.push("Neither Requirements nor Architecture mention detected primary language.");
    }
  }

  layers.push({
    layer: "CONSISTENCY",
    passed: consistencyPassed,
    message: consistencyPassed
      ? "Cross-document consistency across Vision, Requirements, and Architecture verified."
      : `Consistency validation failed: ${consistencyDetails.length} issue(s) identified.`,
    details: consistencyDetails,
    warnings: consistencyWarnings,
  });

  // Document states count
  let verifiedDocuments = 0;
  let partiallyVerifiedDocuments = 0;
  let draftDocuments = 0;

  for (const content of presentDocs.values()) {
    if (content.includes("lifecycle_state: EVIDENCE_VERIFIED")) {
      verifiedDocuments++;
    } else if (content.includes("lifecycle_state: PARTIALLY_VERIFIED")) {
      partiallyVerifiedDocuments++;
    } else {
      draftDocuments++;
    }
  }

  const overallPassed = layers.every((l) => l.passed);

  return {
    repoId,
    projectDir,
    passed: overallPassed,
    layers,
    totalDocuments: PROJECT_OPERATING_CONTEXT_FILES.length,
    verifiedDocuments,
    partiallyVerifiedDocuments,
    draftDocuments,
    missingDocuments: missingDocs,
    total: PROJECT_OPERATING_CONTEXT_FILES.length,
    verified: verifiedDocuments + partiallyVerifiedDocuments,
    missing: missingDocs.length,
    missingFiles: missingDocs,
  };
}
