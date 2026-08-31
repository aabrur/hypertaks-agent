#!/usr/bin/env node

/**
 * Project Operating Context (POC) Bootstrap CLI
 *
 * Thin, authorization-required wrapper around the canonical runtime generator
 * in runtime/founder-brain.ts (compiled to .build/runtime/router.js).
 * This script performs no independent filesystem writes or templating: every
 * mutation goes through the runtime's authorized bootstrap path, which requires:
 *
 *   1. a valid T1 Boss approval (canonical APPROVE <contract-id> signature);
 *   2. the approved contract to explicitly grant PERM_FILE_WRITE;
 *   3. an approved, contained project root revalidated at write time;
 *   4. a valid project id and successful containment.
 *
 * The 13 context documents are rendered by the single canonical template in
 * runtime/founder-brain.ts, ensuring this CLI and runtime cannot drift.
 *
 * Usage:
 *   node scripts/bootstrap-project-context.js \
 *     --project-root <root> --project-id <id> --contract-id HT-<id> \
 *     --permissions PERM_FILE_WRITE --approval "APPROVE HT-<id>"
 *
 * Required context documents:
 *   - Vision.ctx.md
 *   - Requirements.ctx.md
 *   - U-Experience.ctx.md
 *   - architecture.ctx.md
 *   - law.ctx.md
 *   - database.ctx.md
 *   - design.ctx.md
 *   - api.ctx.md
 *   - coding-rules.ctx.md
 *   - roadmap.ctx.md
 *   - preference.ctx.md
 *   - prompt-build-continunity-prompt.ctx.md
 *   - security.ctx.md
 *
 * Each generated context document functions as a domain-universal living document
 * with standardized sections:
 *   - Facts vs Assumptions: verifiable primary evidence vs working hypotheses.
 *   - Requirements vs Preferences: core non-negotiables vs flexible options.
 *   - Constraints vs Recommendations: hard invariants vs best practices.
 *   - Evidence vs Interpretation: primary data vs analytical synthesis.
 *   - Dependencies & Context Bindings
 *   - Unresolved Issues & Historical Decisions
 */

'use strict';

const path = require('path');

let router;
try {
  router = require(path.join(__dirname, '..', '.build', 'runtime', 'router.js'));
} catch {
  console.error('bootstrap-project-context: compiled runtime not found.');
  console.error('Run `npm run build:runtime` first, then retry.');
  process.exit(2);
}

const CONTEXT_FILES = router.PROJECT_OPERATING_CONTEXT_FILES || [
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

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!String(key).startsWith('--') || i + 1 >= argv.length) {
      throw new Error(`INVALID_ARGUMENTS: expected --key value pairs, saw ${String(key)}`);
    }
    args[key.slice(2)] = argv[i + 1];
  }
  return args;
}

function runBootstrap(argv) {
  const args = parseArgs(argv);
  const required = ['project-root', 'project-id', 'contract-id', 'permissions', 'approval'];
  const missing = required.filter((key) => !String(args[key] || '').trim());
  if (missing.length > 0) {
    throw new Error(`INVALID_ARGUMENTS: missing required options: ${missing.join(', ')}`);
  }
  const permissions = String(args['permissions']).split(',').map((item) => item.trim());
  if (!permissions.includes('PERM_FILE_WRITE')) {
    throw new Error('PERMISSION_DENIED: --permissions must include PERM_FILE_WRITE for Project Operating Context creation.');
  }

  // The operator running this CLI is the T1 authority for the invocation; the
  // approval argument must still carry the canonical contract-ID signature,
  // exactly like an in-conversation T1 approval of a mutation contract.
  const activation = router.activateContract({
    contractId: String(args['contract-id']),
    bossMessage: String(args['approval']),
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: String(args['project-root']),
    contractPermissions: permissions,
  });

  if (!activation.active) {
    throw new Error(`ACTIVATION_DENIED: ${activation.reason}`);
  }
  if (activation.bootstrapStatus !== 'SUCCESS') {
    throw new Error(`${activation.bootstrapStatus}: ${activation.bootstrapReason || 'workspace bootstrap did not succeed.'}`);
  }
  return {
    projectId: String(args['project-id']),
    bootstrapStatus: activation.bootstrapStatus,
    evidence: activation.evidence,
  };
}

module.exports = {
  CONTEXT_FILES,
  runBootstrap,
};

if (require.main === module) {
  try {
    const result = runBootstrap(process.argv.slice(2));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
