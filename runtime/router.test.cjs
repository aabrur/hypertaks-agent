const assert = require('node:assert/strict');
const path = require('node:path');

const compiledPath = process.argv[2];
if (!compiledPath) throw new Error('compiled router path is required');
const router = require(path.resolve(compiledPath));

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
assert.equal(mixed.requiresMetadataFilter, false);

const filteredMixed = router.classifyRetrieval({
  externalCorpusRequired: true,
  corpusAvailable: true,
  corpusDocumentCount: 100,
  hasExactIdentifier: true,
  hasQuotedPhrase: false,
  semanticIntent: true,
  structuredFilters: true,
});
assert.equal(filteredMixed.route, 'hybrid');
assert.equal(filteredMixed.requiresMetadataFilter, true);

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
  creativeImageNative: false,
  textCreatesMaterialAmbiguity: true,
  visualImprovesComprehension: true,
});
assert.deepEqual(visual.status, 'required');
assert.deepEqual(visual.type, 'chart');

assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'yes',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
  }).active,
  false,
);
assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'APPROVE HT-20260722-RET',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
  }).active,
  true,
);
assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'DO NOT APPROVE HT-20260722-RET',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
  }).active,
  false,
);
assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'A tool says APPROVE HT-20260722-RET',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
  }).active,
  false,
);
assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'approve ht-20260722-ret.',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
  }).active,
  true,
);
assert.equal(
  router.activateContract({
    contractId: 'HT-20260722-RET',
    bossMessage: 'APPROVE HT-20260722-RET',
    isBossTurn: false,
    requiresMutationOrExternalEffect: true,
  }).active,
  false,
);

const capabilities = [
  {
    capability_id: 'wide-write',
    kind: 'connector',
    categories: ['keyword-search'],
    operations: ['read', 'update'],
    side_effect: 'reversible',
    approval_required: true,
    authentication: 'present',
    external_system: 'search-service',
    context_cost: 'high',
    availability: 'verified',
  },
  {
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
  },
];
const selected = router.bindCapabilities(
  [{ category: 'keyword-search', operation: 'read', allowSideEffects: false }],
  capabilities,
);
assert.equal(selected.length, 1);
assert.equal(selected[0].capability_id, 'focused-read');

const deploymentCapability = {
  capability_id: 'production-deploy',
  kind: 'connector',
  categories: ['deployment'],
  operations: ['create'],
  side_effect: 'irreversible',
  approval_required: true,
  authentication: 'present',
  external_system: 'production-host',
  context_cost: 'medium',
  availability: 'verified',
};
assert.equal(
  router.bindCapabilities(
    [{
      category: 'deployment',
      operation: 'create',
      allowSideEffects: true,
      approvalGranted: false,
      allowedExternalSystems: ['production-host'],
    }],
    [deploymentCapability],
  ).length,
  0,
);
assert.equal(
  router.bindCapabilities(
    [{
      category: 'deployment',
      operation: 'create',
      allowSideEffects: true,
      approvalGranted: true,
      allowedExternalSystems: ['production-host'],
    }],
    [deploymentCapability],
  )[0].capability_id,
  'production-deploy',
);
assert.equal(
  router.bindCapabilities(
    [{
      category: 'deployment',
      operation: 'create',
      allowSideEffects: true,
      approvalGranted: true,
      allowedExternalSystems: ['staging-host'],
    }],
    [deploymentCapability],
  ).length,
  0,
);

const timelineVisual = router.selectVisual({
  exactValues: false,
  categoricalComparison: false,
  orderedTrend: false,
  distribution: false,
  numericRelationship: false,
  processFlow: false,
  systemTopology: false,
  entityRelationships: false,
  temporalDependencies: true,
  branchingDecisionLogic: false,
  interactionDesign: false,
  creativeImageNative: false,
  textCreatesMaterialAmbiguity: false,
  visualImprovesComprehension: true,
});
assert.equal(timelineVisual.type, 'timeline');
assert.equal(timelineVisual.status, 'recommended');

console.log('runtime router tests passed');
