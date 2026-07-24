const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const compiledPath = process.argv[2];
if (!compiledPath) throw new Error('compiled router path is required');
const router = require(path.resolve(compiledPath));

function runGit(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
}

const exact = router.classifyRetrieval({
  externalCorpusRequired: true,
  corpusAvailable: true,
  corpusDocumentCount: 100,
  hasExactIdentifier: true,
  hasQuotedPhrase: false,
  semanticIntent: false,
  structuredFilters: false,
});
assert.equal(exact.queryClass, 'exact');
assert.equal(exact.route, 'keyword');

const mixed = router.classifyRetrieval({
  externalCorpusRequired: true,
  corpusAvailable: true,
  corpusDocumentCount: 100,
  hasExactIdentifier: true,
  hasQuotedPhrase: false,
  semanticIntent: true,
  structuredFilters: false,
});
assert.equal(mixed.route, 'hybrid');
assert.equal(mixed.requiresFusion, true);
assert.equal(mixed.requiresExactBoost, true);

const small = router.classifyRetrieval({
  externalCorpusRequired: true,
  corpusAvailable: true,
  corpusDocumentCount: 4,
  hasExactIdentifier: false,
  hasQuotedPhrase: false,
  semanticIntent: true,
  structuredFilters: false,
});
assert.equal(small.route, 'direct');

const visual = router.selectVisual({
  exactValues: false,
  categoricalComparison: false,
  orderedTrend: true,
  distribution: false,
  numericRelationship: false,
  processFlow: false,
  systemTopology: false,
  entityRelationships: false,
  temporalDependencies: false,
  branchingDecisionLogic: false,
  interactionDesign: false,
  creativeImageNative: true,
  textCreatesMaterialAmbiguity: true,
  visualImprovesComprehension: true,
});
assert.equal(visual.status, 'required');
assert.equal(visual.type, 'chart');

const exactVisual = router.selectVisual({
  exactValues: true,
  categoricalComparison: false,
  orderedTrend: false,
  distribution: false,
  numericRelationship: false,
  processFlow: false,
  systemTopology: false,
  entityRelationships: false,
  temporalDependencies: false,
  branchingDecisionLogic: false,
  interactionDesign: false,
  creativeImageNative: true,
  textCreatesMaterialAmbiguity: false,
  visualImprovesComprehension: true,
});
assert.equal(exactVisual.type, 'table');

const approvedActivation = router.activateContract({
  contractId: 'HT-20260725-BRN',
  bossMessage: 'APPROVE HT-20260725-BRN',
  isBossTurn: true,
  requiresMutationOrExternalEffect: true,
});
assert.equal(approvedActivation.active, true);
assert.equal(router.activateContract({
  contractId: 'HT-20260725-BRN',
  bossMessage: 'DO NOT APPROVE HT-20260725-BRN',
  isBossTurn: true,
  requiresMutationOrExternalEffect: true,
}).active, false);
assert.equal(router.activateContract({
  contractId: 'HT-ADVISORY',
  bossMessage: 'do not proceed',
  isBossTurn: true,
  requiresMutationOrExternalEffect: false,
}).active, false);

const capabilities = [{
  capability_id: 'focused-read',
  kind: 'native_tool',
  categories: ['keyword-search'],
  operations: ['read'],
  side_effect: 'none',
  approval_required: false,
  authentication: 'none',
  external_system: null,
  context_cost: 'low',
  availability: 'verified',
}];
assert.equal(router.bindCapabilities(
  [{ category: 'keyword-search', operation: 'read', allowSideEffects: false }],
  capabilities,
)[0].capability_id, 'focused-read');

const externalRead = {
  capability_id: 'remote-read',
  kind: 'connector',
  categories: ['keyword-search'],
  operations: ['read'],
  side_effect: 'none',
  approval_required: false,
  authentication: 'present',
  external_system: 'remote-search',
  context_cost: 'low',
  availability: 'verified',
};
assert.equal(router.bindCapabilities(
  [{ category: 'keyword-search', operation: 'read', allowSideEffects: false }],
  [externalRead],
).length, 0);
assert.equal(router.bindCapabilities(
  [{ category: 'keyword-search', operation: 'read', allowSideEffects: false, allowedExternalSystems: ['remote-search'] }],
  [externalRead],
).length, 1);

const mislabeledMutation = {
  capability_id: 'unsafe-write',
  kind: 'mcp_tool',
  categories: ['memory'],
  operations: ['update'],
  side_effect: 'irreversible',
  approval_required: false,
  authentication: 'none',
  external_system: null,
  context_cost: 'low',
  availability: 'verified',
};
assert.equal(router.bindCapabilities(
  [{ category: 'memory', operation: 'update', allowSideEffects: true, approvalGranted: false }],
  [mislabeledMutation],
).length, 0);

assert.equal(router.sanitizeAgentName('Claude Code'), 'Claude-Code');
assert.throws(() => router.sanitizeAgentName('../escape'), /INVALID_AGENT_NAME/);
assert.throws(() => router.sanitizeAgentName('CON'), /INVALID_AGENT_NAME/);
assert.throws(() => router.validateRecordId('../../escape'), /INVALID_RECORD_ID/);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hypertaks-root-'));
fs.mkdirSync(path.join(root, 'safe'), { recursive: true });
assert.throws(() => router.resolveWithinApprovedRoot(root, '../escape.json', true), /PATH_OUTSIDE_APPROVED_ROOT/);

const fakeProof = Object.freeze({ contractId: 'HT-20260725-BRN', messageId: 'msg-fake', approvedAt: new Date().toISOString() });
assert.throws(() => router.assertValidApprovalProof(fakeProof), /APPROVAL_REQUIRED/);
const proof = router.mintBossApprovalProof(approvedActivation, 'msg-001');
router.assertValidApprovalProof(proof, 'HT-20260725-BRN');

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'hypertaks-repo-'));
runGit(repo, 'init');
runGit(repo, 'config', 'user.email', 'test@example.com');
runGit(repo, 'config', 'user.name', 'Hypertaks Test');
fs.writeFileSync(path.join(repo, 'tracked.txt'), 'verified fact\n', 'utf8');
runGit(repo, 'add', 'tracked.txt');
runGit(repo, 'commit', '-m', 'test fixture');
const evidence = router.createRepositoryEvidence(repo, 'tracked.txt');
assert.equal(router.verifyRepositoryEvidence(repo, evidence), true);
assert.throws(() => router.createRepositoryEvidence(repo, 'missing.txt'), /EVIDENCE_NOT_FOUND/);
fs.writeFileSync(path.join(repo, 'tracked.txt'), 'changed fact\n', 'utf8');
assert.equal(router.verifyRepositoryEvidence(repo, evidence), false);
runGit(repo, 'checkout', '--', 'tracked.txt');

const pointer = {
  schemaVersion: '4.5.0',
  projectId: 'hypertaks-agent',
  agentName: 'Codex',
  destinationType: 'ProjectLocal',
  rootPath: root,
  agentRelativePath: 'Brains/Codex',
  sharedRelativePath: 'Shared',
  graphify: { mode: 'disabled', endpoint: null, authTokenEnv: null, outputRelativePath: null },
  governance: { conflictPolicy: 'RepositoryThenBoss', autoPromotion: false, secretScanning: 'strict' },
  verifiedAt: new Date().toISOString(),
};
const verifiedEvidence = router.createRepositoryEvidence(repo, 'tracked.txt');
const record = router.createMemoryRecord({
  id: 'fact-001',
  type: 'Fact',
  scope: 'Shared',
  content: 'The tracked fixture is authoritative for this commit.',
  evidence: verifiedEvidence,
  createdByAgent: 'Codex',
  sourceRepository: 'hypertaks-agent',
  repoRoot: repo,
  inferred: false,
});
assert.equal(record.status, 'VERIFIED');
const memoryPath = router.writeMemoryRecord(root, pointer, record);
assert.equal(fs.existsSync(memoryPath), true);
assert.throws(() => router.writeMemoryRecord(root, pointer, { ...record, id: '../../../../escape' }), /INVALID_RECORD_ID/);

const decision = {
  schemaVersion: '4.5.0',
  id: 'decision-001',
  title: 'Use five public commands',
  decision: 'Expose exactly five public Hypertaks skills.',
  status: 'APPROVED',
  bossEvidence: { sourceType: 'BossTurn', messageId: 'msg-001', contractId: 'HT-20260725-BRN' },
  createdAt: new Date().toISOString(),
};
assert.throws(() => router.promoteDecisionToShared({ root, pointer, decision, proof: fakeProof }), /APPROVAL_REQUIRED/);
assert.equal(fs.existsSync(router.promoteDecisionToShared({ root, pointer, decision, proof })), true);

const plan = router.buildVerifyPlan({
  projectRoot: repo,
  projectId: 'hypertaks-agent',
  agentName: 'Codex',
  destinationType: 'ProjectLocal',
  rootPath: root,
  existingBrain: true,
  sharedMemory: true,
  graphifyMode: 'disabled',
  graphifyEndpoint: null,
  graphifyAuthTokenEnv: null,
});
assert.throws(() => router.applyVerifyPlan(plan, null), /APPROVAL_REQUIRED/);
const pointerFile = router.applyVerifyPlan(plan, proof);
assert.equal(fs.existsSync(pointerFile), true);

const gitState = router.readGitState(repo);
const checkpoint = router.createCheckpoint({
  repositoryRoot: repo,
  id: 'checkpoint-001',
  objective: 'Validate founder continuity',
  contractId: 'HT-20260725-BRN',
  completed: ['Runtime implemented'],
  pending: [],
  blockers: [],
  nextAction: 'Run the full validation suite.',
  permissions: ['PERM_READ_LOCAL', 'PERM_FILE_WRITE'],
  tests: [{ command: 'node runtime/router.test.cjs', exitCode: 0, timestamp: new Date().toISOString(), commit: gitState.commit }],
  acceptanceCriteria: [{ id: 'AC-1', description: 'Adversarial runtime checks pass.', status: 'PASS', evidence: 'router.test.cjs' }],
});
assert.equal(router.resumeCheckpoint(repo, checkpoint).id, 'checkpoint-001');
assert.equal(router.verifyProofOfDone(repo, checkpoint).status, 'DONE');
assert.throws(() => router.createCheckpoint({
  repositoryRoot: repo,
  id: 'checkpoint-secret',
  objective: 'Persist sk-abcdefghijklmnopqrstuvwxyz123456',
  contractId: 'HT-20260725-BRN',
  completed: [], pending: [], blockers: [], nextAction: 'none', permissions: [], tests: [], acceptanceCriteria: [],
}), /SECURITY_VIOLATION/);
assert.equal(router.generateHandoff({ ...checkpoint, objective: 'Bearer abcdefghijklmnopqrstuvwxyz123456' }).includes('REDACTED_SECRET'), true);

assert.equal(router.checkGraphFreshness(null, null, gitState).state, 'UNVERIFIED');
assert.equal(router.checkGraphFreshness(gitState.commit, gitState.branch, gitState).state, 'FRESH');

(async () => {
  await assert.rejects(
    router.queryGraphifyOrFallback({
      mode: 'http_mcp',
      operation: 'query_graph',
      query: 'tracked fixture',
      repositoryRoot: repo,
      endpoint: null,
      authTokenEnv: null,
      localCommand: null,
      executor: null,
      approvalProof: null,
    }),
    /APPROVAL_REQUIRED/,
  );
  const fallback = await router.queryGraphifyOrFallback({
    mode: 'disabled',
    operation: 'query_graph',
    query: 'verified fact',
    repositoryRoot: repo,
    endpoint: null,
    authTokenEnv: null,
    localCommand: null,
    executor: null,
    approvalProof: null,
  });
  assert.equal(fallback.modeUsed, 'direct_search');
  assert.equal(fallback.success, true);
  console.log('runtime router tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
