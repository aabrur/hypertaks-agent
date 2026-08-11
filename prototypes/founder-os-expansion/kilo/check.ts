import { selectKnowledge, resolveLazyLoadRoute } from "./engine";
import {
  KnowledgeModuleManifest,
  Methodology,
  EvidenceClass,
  ModuleStatus,
  ExecutionTier,
  LoadingBudget,
  loadingBudgetForTier,
  SideEffect,
} from "./schema";
import {
  SELECTION_FIXTURE,
  SUPPORTED_MODULE,
  SUPPORTED_METHODOLOGY,
  UNSUPPORTED_MODULE,
  STALE_MODULE,
  CONFLICTING_MODULE,
  CONFLICTING_MODULE_B,
  UNLICENSED_MODULE,
  OVER_BUDGET_MODULES,
  NO_OUTPUT_SHAPE_METHODOLOGY,
  NOW,
} from "./fixtures";

// ============================================================================
// Helpers
// ============================================================================

let failures = 0;
let passes = 0;

function assertEqual(
  label: string,
  actual: unknown,
  expected: unknown
): void {
  if (actual === expected) {
    passes++;
    console.log(`  PASS: ${label}`);
  } else {
    failures++;
    console.log(`  FAIL: ${label}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
  }
}

function assertTrue(label: string, value: boolean): void {
  if (value) {
    passes++;
    console.log(`  PASS: ${label}`);
  } else {
    failures++;
    console.log(`  FAIL: ${label}`);
  }
}

function assertFalse(label: string, value: boolean): void {
  assertTrue(`${label} (should be false)`, !value);
}

// ============================================================================
// Test cases
// ============================================================================

function testSupportedModuleSelection(): void {
  console.log("\n[test-supported-module-selection]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [SUPPORTED_MODULE],
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("selectionId format", result.selectionId.startsWith("sel-"), true);
  assertEqual("contractId matches", result.contractId, SELECTION_FIXTURE.contractId);
  assertEqual("taskId matches", result.taskId, SELECTION_FIXTURE.taskId);
  assertEqual("tier matches", result.executionTier, "Standard");
  assertEqual("selectedModules contains supported module", result.selectedModules.includes(SUPPORTED_MODULE.moduleId), true);
  assertEqual("selectedMethodologies contains supported methodology", result.selectedMethodologies.some((m) => m.methodId === SUPPORTED_METHODOLOGY.methodId), true);
  assertEqual("no rejected modules for supported input", result.rejectedModules.length, 0);
  assertEqual("no rejected methodologies for supported input", result.rejectedMethodologies.length, 0);
  assertEqual("budget not exceeded", result.budgetExceeded, false);
  assertEqual("fallback not used", result.fallbackUsed, false);
  assertEqual("fallbackReason absent", result.fallbackReason, undefined);
}

function testUnsupportedModuleExcluded(): void {
  console.log("\n[test-unsupported-module-excluded]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [UNSUPPORTED_MODULE],
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("unsupported module not selected", result.selectedModules.includes(UNSUPPORTED_MODULE.moduleId), false);
  const unsupportedRejection = result.rejectedModules.find(
    (r) => r.moduleId === UNSUPPORTED_MODULE.moduleId
  );
  assertTrue("unsupported module has rejection reason", !!unsupportedRejection);
  if (unsupportedRejection) {
    assertEqual("unsupported rejection reason", unsupportedRejection.reason, "status_unsupported");
  }
}

function testStaleModuleExcluded(): void {
  console.log("\n[test-stale-module-excluded]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [STALE_MODULE],
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("stale module not selected", result.selectedModules.includes(STALE_MODULE.moduleId), false);
  const staleRejection = result.rejectedModules.find(
    (r) => r.moduleId === STALE_MODULE.moduleId
  );
  assertTrue("stale module has rejection reason", !!staleRejection);
  if (staleRejection) {
    assertEqual("stale rejection reason", staleRejection.reason, "freshness_state_stale");
  }
}

function testConflictingModulesExcluded(): void {
  console.log("\n[test-conflicting-modules-excluded]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [CONFLICTING_MODULE, CONFLICTING_MODULE_B],
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertTrue("only one conflicting module selected", result.selectedModules.length <= 1);
  const conflictingA = result.rejectedModules.find(
    (r) => r.moduleId === CONFLICTING_MODULE.moduleId
  );
  const conflictingB = result.rejectedModules.find(
    (r) => r.moduleId === CONFLICTING_MODULE_B.moduleId
  );
  assertTrue("at least one conflicting module rejected", !!conflictingA || !!conflictingB);
  if (conflictingA) {
    assertTrue("conflicting A reason mentions conflict", conflictingA.reason.includes("conflict"));
  }
}

function testUnlicensedModuleExcluded(): void {
  console.log("\n[test-unlicensed-module-excluded]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [UNLICENSED_MODULE],
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("unlicensed module not selected", result.selectedModules.includes(UNLICENSED_MODULE.moduleId), false);
  const unlicensedRejection = result.rejectedModules.find(
    (r) => r.moduleId === UNLICENSED_MODULE.moduleId
  );
  assertTrue("unlicensed module has rejection reason", !!unlicensedRejection);
  if (unlicensedRejection) {
    assertEqual("unlicensed rejection reason", unlicensedRejection.reason, "license_commercial_use_denied");
  }
}

function testOverBudgetModulesFailClosed(): void {
  console.log("\n[test-over-budget-modules-fail-closed]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: OVER_BUDGET_MODULES,
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("selectedModules within budget", result.selectedModules.length, 1);
  assertTrue("rejected modules present", result.rejectedModules.length > 0);
  assertTrue("at least one rejection mentions budget", result.rejectedModules.some((r) => r.reason.includes("budget_exceeded")));
}

function testNoOutputShapeMethodologyRejected(): void {
  console.log("\n[test-no-output-shape-methodology-rejected]");
  const result = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: [SUPPORTED_MODULE],
    availableMethodologies: [NO_OUTPUT_SHAPE_METHODOLOGY],
  });

  assertEqual("methodology without output shape rejected", result.selectedMethodologies.length, 0);
  const noShapeRejection = result.rejectedMethodologies.find(
    (r) => r.methodId === NO_OUTPUT_SHAPE_METHODOLOGY.methodId
  );
  assertTrue("no-shape methodology has rejection reason", !!noShapeRejection);
  if (noShapeRejection) {
    assertEqual("no-shape rejection reason", noShapeRejection.reason, "missing_expected_output_shape");
  }
}

function testLoadingBudgetByTier(): void {
  console.log("\n[test-loading-budget-by-tier]");
  const nano = loadingBudgetForTier("Nano");
  assertEqual("Nano maxDomainPacks", nano.maxDomainPacks, 0);
  assertEqual("Nano maxPrimaryMethodologies", nano.maxPrimaryMethodologies, 0);

  const lite = loadingBudgetForTier("Lite");
  assertEqual("Lite maxDomainPacks", lite.maxDomainPacks, 1);
  assertEqual("Lite maxPrimaryMethodologies", lite.maxPrimaryMethodologies, 1);

  const standard = loadingBudgetForTier("Standard");
  assertEqual("Standard maxDomainPacks", standard.maxDomainPacks, 1);
  assertEqual("Standard maxSupportingMethodologies", standard.maxSupportingMethodologies, 1);

  const prime = loadingBudgetForTier("Prime");
  assertEqual("Prime maxDomainPacks", prime.maxDomainPacks, 2);

  const hyper = loadingBudgetForTier("Hyper");
  assertEqual("Hyper maxDomainPacks", hyper.maxDomainPacks, 2);
  assertEqual("Hyper contextTokenLimit", hyper.contextTokenLimit, 60000);
}

function testLazyLoadRouteResolution(): void {
  console.log("\n[test-lazy-load-route-resolution]");
  assertEqual("direct index -> direct route", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "direct" }, "exact"), "direct");
  assertEqual("keyword index -> keyword route", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "keyword" }, "exact"), "keyword");
  assertEqual("hybrid index, exact query -> keyword", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "hybrid" }, "exact"), "keyword");
  assertEqual("hybrid index, semantic query -> vector", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "hybrid" }, "semantic"), "vector");
  assertEqual("hybrid index, mixed query -> hybrid", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "hybrid" }, "mixed"), "hybrid");
  assertEqual("none index -> none", resolveLazyLoadRoute({ ...SUPPORTED_MODULE, indexFormat: "none" }, "mixed"), "none");
}

function testMethodologyPreconditionsRejectTier(): void {
  console.log("\n[test-methodology-preconditions-reject-tier]");
  const primeMethod = {
    ...SUPPORTED_METHODOLOGY,
    preconditions: {
      ...SUPPORTED_METHODOLOGY.preconditions,
      requiredTier: "Prime" as ExecutionTier,
    },
  };

  const liteResult = selectKnowledge({
    ...SELECTION_FIXTURE,
    executionTier: "Lite",
    availableModules: [SUPPORTED_MODULE],
    availableMethodologies: [primeMethod],
  });

  assertEqual("Prime methodology rejected in Lite", liteResult.selectedMethodologies.length, 0);
  assertTrue("Prime methodology rejection reason is preconditions_not_met", liteResult.rejectedMethodologies.some((r) => r.reason === "preconditions_not_met"));
}

function testSelectionDeterminism(): void {
  console.log("\n[test-selection-determinism]");
  const r1 = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: OVER_BUDGET_MODULES,
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });
  const r2 = selectKnowledge({
    ...SELECTION_FIXTURE,
    availableModules: OVER_BUDGET_MODULES,
    availableMethodologies: [SUPPORTED_METHODOLOGY],
  });

  assertEqual("deterministic selectedModules", r1.selectedModules.join(","), r2.selectedModules.join(","));
  assertEqual("deterministic rejectedModules count", r1.rejectedModules.length, r2.rejectedModules.length);
}

// ============================================================================
// Run all tests
// ============================================================================

console.log("Running Kilo prototype tests\n");

testSupportedModuleSelection();
testUnsupportedModuleExcluded();
testStaleModuleExcluded();
testConflictingModulesExcluded();
testUnlicensedModuleExcluded();
testOverBudgetModulesFailClosed();
testNoOutputShapeMethodologyRejected();
testLoadingBudgetByTier();
testLazyLoadRouteResolution();
testMethodologyPreconditionsRejectTier();
testSelectionDeterminism();

console.log(`\nResults: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log("ALL TESTS PASSED\n");
  process.exit(0);
}
