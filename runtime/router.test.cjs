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

const routeCases = [
  // Baseline bilingual / negation matrix (A0/A1)
  ['founder business + engineering + evidence', 'hypertaks'],
  ['verifikasi konfigurasi instalasi', 'hypertaks-verify'],
  ['simpan dan ambil memori founder', 'hypertaks-brain'],
  ['dependency change impact', 'hypertaks-graph'],
  ['checkpoint + proof-of-done', 'hypertaks-continuity'],
  ['jangan route ke verify', 'hypertaks'],
  ['do not route to verify even if setup looks relevant', 'hypertaks'],
  ['bukan konfigurasi, ini strategi founder', 'hypertaks'],
  ['tidak perlu memory, lanjut engineering plan', 'hypertaks'],
  ['install setup configuration checksum runtime verification', 'hypertaks-verify'],
  ['save retrieve correct durable memory', 'hypertaks-brain'],
  ['callers imports blast radius', 'hypertaks-graph'],
  ['resume handoff reconcile', 'hypertaks-continuity'],
  ['audit validate decision context status impact permission evidence', 'hypertaks'],
  ['ambiguous multi-domain strategy request', 'hypertaks'],
  // Phase A2 required exact cases
  ['Create a founder strategy covering business and engineering.', 'hypertaks'],
  ['Verifikasi konfigurasi dan instalasi Hypertaks.', 'hypertaks-verify'],
  ['Simpan dan ambil memori founder ini.', 'hypertaks-brain'],
  ['Analyze dependency change impact and blast radius.', 'hypertaks-graph'],
  ['Create a checkpoint, handoff, and proof-of-done.', 'hypertaks-continuity'],
  ['Jangan route ke verify. Ini strategi founder.', 'hypertaks'],
  ['Founder strategy with checkpoint and proof-of-done across business and engineering.', 'hypertaks'],
  ['Scan-only Hypertaks installation verification.', 'hypertaks-verify'],
  ['Build an MCP host that launches five servers.', 'hypertaks'],
  ['Configure a new MCP server.', 'hypertaks'],
  ['Verify the deployed Hypertaks MCP adapter.', 'hypertaks-verify'],
  ['Install Python dependencies for the application.', 'hypertaks'],
  ['Repair the Hypertaks memory pointer configuration.', 'hypertaks-verify'],
  ['Inspect founder memory records.', 'hypertaks-brain'],
  ['Fix a Node.js memory leak.', 'hypertaks'],
  ['Store this approved product decision.', 'hypertaks-brain'],
  ['Import customer records from CSV.', 'hypertaks'],
  ['Trace module imports and dependency blast radius.', 'hypertaks-graph'],
  ['Create a graph chart of monthly revenue.', 'hypertaks'],
  ['Check graph freshness against the current commit.', 'hypertaks-graph'],
  ['Create a checkpoint for the API implementation.', 'hypertaks-continuity'],
  ['Design the API implementation with checkpoint requirements.', 'hypertaks'],
  ['Verify proof-of-done evidence.', 'hypertaks-continuity'],
  ['Founder strategy with dependency analysis and a project checkpoint.', 'hypertaks'],
  ['Do not save memory. Analyze the founder plan.', 'hypertaks'],
  ['Use hypertaks-brain to inspect the current memory target.', 'hypertaks-brain'],
  ['Verify installation without writing files.', 'hypertaks-verify'],
  ['Do not verify the installation. Create a founder plan instead.', 'hypertaks'],
  // Punctuation / casing / bilingual variants
  ['VERIFY Installation!!!', 'hypertaks-verify'],
  ['  simpan, ambil, memori founder... ', 'hypertaks-brain'],
  ['Dependency Change Impact - Blast Radius', 'hypertaks-graph'],
  ['CREATE a Checkpoint + Handoff + Proof-Of-Done', 'hypertaks-continuity'],
];
for (const [request, expected] of routeCases) {
  assert.equal(router.routePublicSkill(request).skill, expected, request);
}
assert.equal(
  router.routePublicSkill('install setup configuration checksum', 'hypertaks-continuity').skill,
  'hypertaks-continuity',
);
assert.equal(router.PUBLIC_SKILL_ROUTER_MODULE, 'public-skill-router');
assert.equal(router.ROUTE_POLICY_VERSION, 'a2.1');
assert.deepEqual([...router.SUPPORTED_LOCALES], ['en', 'id']);
assert.equal(router.normalizeRequestText('Proof of Done!!!').includes('proof-of-done'), true);
assert.deepEqual([...router.PUBLIC_SKILLS], [
  'hypertaks',
  'hypertaks-verify',
  'hypertaks-brain',
  'hypertaks-graph',
  'hypertaks-continuity',
]);

// Phase A3: diagnostics determinism, negation suppression, founder primary, identity.
{
  const request = 'Jangan route ke verify. Ini strategi founder.';
  const a = router.diagnosePublicSkillRoute(request);
  const b = router.diagnosePublicSkillRoute(request);
  assert.deepEqual(a, b);
  assert.equal(a.skill, 'hypertaks');
  assert.equal(a.primaryIntent, 'founder_strategy');
  assert.ok(a.suppressedSkills.some((item) => item.skill === 'hypertaks-verify' && item.reason === 'explicit_negation'));
  assert.equal(a.routePolicyVersion, router.ROUTE_POLICY_VERSION);
  assert.match(a.routerRulesDigest, /^[a-f0-9]{64}$/);
  assert.equal(a.mutationPerformed, false);
  assert.equal(a.approvalRequiredForExternalMutation, true);
  assert.equal(a.nextTool, 'hypertaks_get_skill');

  const founderCheckpoint = router.diagnosePublicSkillRoute(
    'Founder strategy with checkpoint and proof-of-done across business and engineering.',
  );
  assert.equal(founderCheckpoint.skill, 'hypertaks');
  assert.equal(founderCheckpoint.primaryIntent, 'founder_strategy');

  const noneShape = router.presentRouteDiagnostics(a, 'none');
  assert.deepEqual(Object.keys(noneShape).sort(), [
    'approvalRequiredForExternalMutation',
    'mutationPerformed',
    'nextTool',
    'reason',
    'skill',
  ]);
  assert.equal(Object.prototype.hasOwnProperty.call(noneShape, 'routerRulesDigest'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(noneShape, 'matchedSignals'), false);

  const compactShape = router.presentRouteDiagnostics(a, 'compact');
  assert.equal(compactShape.primaryIntent, 'founder_strategy');
  assert.equal(Object.prototype.hasOwnProperty.call(compactShape, 'routerRulesDigest'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(compactShape, 'matchedSignals'), false);

  const fullShape = router.presentRouteDiagnostics(a, 'full');
  assert.ok(Array.isArray(fullShape.matchedSignals));
  assert.ok(Array.isArray(fullShape.secondaryIntents));
  assert.equal(fullShape.routerRulesDigest, a.routerRulesDigest);

  const identity = router.getRouterRuntimeIdentity();
  assert.equal(identity.routePolicyVersion, router.ROUTE_POLICY_VERSION);
  assert.equal(identity.routerRulesDigest, router.getRouterRulesDigest());
  assert.equal(identity.routerRulesDigest, router.computeRouterRulesDigest());
  assert.match(identity.buildRevision, /^(unknown|[0-9a-f]{7,64})$/);
  assert.match(identity.buildTimestamp, /^(unknown|\d{4}-\d{2}-\d{2}T)/);
  assert.deepEqual([...identity.supportedLocales], ['en', 'id']);

  // Secret-like env values must never appear in diagnostics/identity payloads.
  const previousToken = process.env.HYPERTAKS_MCP_BEARER_TOKEN;
  process.env.HYPERTAKS_MCP_BEARER_TOKEN = 'super-secret-token-value-should-not-leak';
  try {
    const leakedProbe = JSON.stringify({
      route: router.diagnosePublicSkillRoute(request),
      presented: router.presentRouteDiagnostics(router.diagnosePublicSkillRoute(request), 'full'),
      identity: router.getRouterRuntimeIdentity(),
    });
    assert.equal(leakedProbe.includes('super-secret-token-value-should-not-leak'), false);
  } finally {
    if (previousToken === undefined) delete process.env.HYPERTAKS_MCP_BEARER_TOKEN;
    else process.env.HYPERTAKS_MCP_BEARER_TOKEN = previousToken;
  }
}

// Canonical focused-policy must exist exactly once under runtime/*.ts|*.mjs|*.cjs
// (compiled .build output is excluded; tests are excluded).
{
  const runtimeDir = path.resolve(__dirname);
  const sourceFiles = fs.readdirSync(runtimeDir)
    .filter((name) => /\.(ts|mjs|cjs)$/.test(name) && !name.endsWith('.test.cjs'))
    .map((name) => path.join(runtimeDir, name));
  const definitionHits = [];
  for (const filePath of sourceFiles) {
    const text = fs.readFileSync(filePath, 'utf8');
    const matches = text.match(/const FOCUSED_SKILL_RULES\b/g) || [];
    for (let i = 0; i < matches.length; i += 1) {
      definitionHits.push(path.basename(filePath));
    }
  }
  assert.deepEqual(
    definitionHits,
    ['public-skill-router.ts'],
    `expected one FOCUSED_SKILL_RULES definition, found: ${definitionHits.join(',') || '(none)'}`,
  );
  const canonical = path.join(runtimeDir, 'public-skill-router.ts');
  assert.equal(fs.existsSync(canonical), true);
  assert.match(
    fs.readFileSync(canonical, 'utf8'),
    /export function routePublicSkill/,
  );
}

// Direct canonical module and router re-export must be the same function identity path.
{
  const canonicalModule = require(path.resolve(__dirname, '..', '.build', 'runtime', 'public-skill-router.js'));
  assert.equal(canonicalModule.PUBLIC_SKILL_ROUTER_MODULE, 'public-skill-router');
  assert.equal(router.routePublicSkill, canonicalModule.routePublicSkill);
  for (const [request, expected] of routeCases) {
    const fromCanonical = canonicalModule.routePublicSkill(request);
    const fromRouter = router.routePublicSkill(request);
    assert.deepEqual(fromRouter, fromCanonical, `parity failed for: ${request}`);
    assert.equal(fromCanonical.skill, expected, request);
  }
}

// Phase A4: complete regression matrix, determinism, locale coverage, identity.
{
  const matrix = require(path.join(__dirname, 'fixtures', 'public-skill-route-matrix.cjs'));
  const unitReport = matrix.runUnitRouteMatrix((request, preferred) =>
    router.routePublicSkill(request, preferred),
  );
  assert.equal(
    unitReport.failCount,
    0,
    unitReport.failures
      .map((row) => `${row.id}:${row.expected}->${row.actual}`)
      .join('; ') || 'matrix failures',
  );
  assert.ok(unitReport.total >= 60, `expected broad matrix, got ${unitReport.total}`);

  const detReport = matrix.runDeterminismSuite(
    (request) => router.diagnosePublicSkillRoute(request),
    matrix.DETERMINISM_REPEATS,
  );
  assert.equal(detReport.failCount, 0, JSON.stringify(detReport.failures));
  assert.equal(detReport.repeats, 5);

  const coverage = matrix.localeCoverageChecklist();
  assert.deepEqual(coverage.missingCategories, []);
  assert.deepEqual(coverage.supportedLocales, ['en', 'id']);
  for (const skill of [
    'hypertaks-verify',
    'hypertaks-brain',
    'hypertaks-graph',
    'hypertaks-continuity',
  ]) {
    assert.ok(coverage.enFocusedSkills.includes(skill), `en missing ${skill}`);
    assert.ok(coverage.idFocusedSkills.includes(skill), `id missing ${skill}`);
  }

  assert.deepEqual([...router.PUBLIC_SKILLS], [...matrix.PUBLIC_SKILLS]);
  assert.deepEqual([...router.SUPPORTED_LOCALES], [...matrix.SUPPORTED_LOCALES]);
  const identity = router.getRouterRuntimeIdentity();
  assert.equal(identity.routePolicyVersion, router.ROUTE_POLICY_VERSION);
  assert.match(identity.routerRulesDigest, /^[a-f0-9]{64}$/);
  // Manifest-equivalent identity fields must be stable across repeated reads.
  assert.deepEqual(router.getRouterRuntimeIdentity(), identity);

  // Machine-readable A4 summary for the phase report (written next to continuity).
  const summary = {
    phase: 'A4',
    totalCalls: unitReport.total + detReport.total * detReport.repeats,
    matrixTotal: unitReport.total,
    matrixPass: unitReport.passCount,
    matrixFail: unitReport.failCount,
    determinismCases: detReport.total,
    determinismRepeats: detReport.repeats,
    determinismPass: detReport.passCount,
    routeDistribution: unitReport.distribution,
    routerRulesDigest: identity.routerRulesDigest,
    routePolicyVersion: identity.routePolicyVersion,
    supportedLocales: identity.supportedLocales,
    publicSkillCount: router.PUBLIC_SKILLS.length,
    mutationPerformedAlwaysFalse: true,
  };
  const outDir = path.join(__dirname, '..', '.hypertaks', 'continuity');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'HT-20260804-A4-regression-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
}

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
