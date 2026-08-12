#!/usr/bin/env node

/**
 * Project Operating Context (POC) Bootstrap Module
 * 
 * Automatically creates and maintains the 13-file Project Operating Context
 * for substantial projects when a contract with PERM_FILE_WRITE is approved.
 * 
 * This is the runtime implementation of the "Hidden Deliverable Foundation"
 * mechanism referenced in the Hypertaks Founder OS Expansion (v4.5.2).
 * 
 * Files are created under: .hypertaks/projects/<projectId>/
 */

const fs = require('fs');
const path = require('path');

// The exact 13 required context files for Hidden Deliverable Foundation
const CONTEXT_FILES = [
  'Vision.ctx.md',
  'Requirements.ctx.md',
  'U-Experience.ctx.md',
  'architecture.ctx.md',
  'law.ctx.md',
  'database.ctx.md',
  'design.ctx.md',
  'api.ctx.md',
  'coding-rules.ctx.md',
  'roadmap.ctx.md',
  'preference.ctx.md',
  'prompt-build-continunity-prompt.ctx.md',
  'security.ctx.md',
];

const FILE_DESCRIPTIONS = {
  'Vision.ctx.md': 'Core project vision, strategic alignment, executive mission, and business impact.',
  'Requirements.ctx.md': 'Functional, non-functional, operational, and domain requirements.',
  'U-Experience.ctx.md': 'User, developer, and operational experience design, journeys, and interaction models.',
  'architecture.ctx.md': 'System, software, organizational, financial, or operational system architecture.',
  'law.ctx.md': 'Governance rules, regulatory boundaries, compliance constraints, and legal policies.',
  'database.ctx.md': 'Information models, schemas, entities, operational datasets, storage systems, and corpora.',
  'design.ctx.md': 'Design system, visual standards, component specifications, and domain modeling paradigms.',
  'api.ctx.md': 'Interface contracts, service boundaries, protocols, and integration touchpoints.',
  'coding-rules.ctx.md': 'Engineering standards, code quality rules, Karpathy guidelines, and development conventions.',
  'roadmap.ctx.md': 'Strategic milestones, execution phases, release schedules, and future initiatives.',
  'preference.ctx.md': 'Stakeholder preferences, optional enhancements, style choices, and priorities.',
  'prompt-build-continunity-prompt.ctx.md': 'Preserved prompt specification for prompt continuity, agent handoffs, and AI context persistence.',
  'security.ctx.md': 'Security kernel, access boundaries, secret handling, authorization policies, and risk mitigation.',
};

// Git info helper
function getGitState(repoRoot) {
  try {
    const { execSync } = require('child_process');
    const commit = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const clean = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' }).trim() === '';
    return { commit, branch, clean };
  } catch {
    return { commit: 'unknown', branch: 'unknown', clean: false };
  }
}

// Generate frontmatter and living document template
function generateContextDocument(filename, projectId, projectRoot, agentId = 'Hypertaks-Founder') {
  const gitState = getGitState(projectRoot);
  const timestamp = new Date().toISOString();
  const title = filename.replace('.ctx.md', '');
  const description = FILE_DESCRIPTIONS[filename] || 'Project Operating Context living document.';

  const content = `---
id: ${title}
version: 1.0.0
timestamp: ${timestamp}
evidence_class: T6_GENERATED
provenance:
  agent_id: ${agentId}
  source_file: .hypertaks/projects/${projectId}/${filename}
  contract_id: HT-${projectId}
source_git_state:
  commit_sha: ${gitState.commit}
  branch: ${gitState.branch}
  clean_tree: ${gitState.clean}
authority: 6
freshness: FRESH
status: ACTIVE
lifecycle_state: VERIFIED
---

# ${title} - Project Operating Context

## Domain Adaptation & Purpose
${description}
This context document adapts universally to the project domain (software, business, ops, research, finance, healthcare, or governance).

## Current State & Evolution
- **Status**: Active Living Document
- **Lifecycle**: Evolves continuously as work progresses
- **Last Verified**: ${timestamp}

## Decisions & Rationale

### Facts vs Assumptions
- **Facts**: Verified primary evidence from repository and active Boss turns.
- **Assumptions**: Working hypotheses subject to verification.

### Requirements vs Preferences
- **Requirements**: Hard non-negotiables, contract bounds, and explicit Boss directives.
- **Preferences**: Flexible choices, aesthetic directions, and optional enhancements.

### Constraints vs Recommendations
- **Constraints**: Security, legal, architectural, and financial invariants.
- **Recommendations**: Performance guidance, operational best practices, and guidelines.

### Evidence vs Interpretation
- **Evidence**: Measured runtime data, test outputs, and source code.
- **Interpretation**: Analytical conclusions and strategic synthesis.

## Dependencies & Context Bindings
- Inter-file links to sibling *.ctx.md context documents within .hypertaks/projects/${projectId}/.

## Unresolved Issues & Historical Decisions
- **Historical Decisions**: Initialized workspace structure.
- **Unresolved Issues**: None pending at initialization.

## Future Implications & Directives
- Guides participating agents and human operators throughout execution and continuation.
`;
  return content;
}

function bootstrapProjectContext(projectRoot, projectId = 'default', agentId = 'Hypertaks-Founder') {
  const projectDir = path.join(projectRoot, '.hypertaks', 'projects', projectId);
  fs.mkdirSync(projectDir, { recursive: true });

  const createdFiles = [];
  for (const filename of CONTEXT_FILES) {
    const filePath = path.join(projectDir, filename);
    if (!fs.existsSync(filePath)) {
      const content = generateContextDocument(filename, projectId, projectRoot, agentId);
      fs.writeFileSync(filePath, content, 'utf8');
      createdFiles.push(filePath);
    }
  }

  return {
    projectId,
    projectDir,
    filesCount: CONTEXT_FILES.length,
    createdFiles,
    contextFiles: CONTEXT_FILES,
  };
}

module.exports = {
  CONTEXT_FILES,
  FILE_DESCRIPTIONS,
  bootstrapProjectContext,
};

if (require.main === module) {
  const targetRoot = process.cwd();
  const projectId = process.argv[2] || 'default';
  const result = bootstrapProjectContext(targetRoot, projectId);
  console.log(JSON.stringify(result, null, 2));
}
