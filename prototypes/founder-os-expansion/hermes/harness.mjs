import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTOTYPE_ROOT = path.resolve(__dirname);
const FIXTURES_DIR = path.join(PROTOTYPE_ROOT, 'fixtures');

// Secret Scanner Patterns
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-[a-zA-Z0-9]{32,}/,
  /BEGIN\s+PRIVATE\s+KEY/i
];

// Instruction Injection Patterns
const INJECTION_PATTERNS = [
  /ignore\s+all\s+previous\s+instructions/i,
  /you\s+are\s+now\s+operating\s+in\s+unrestricted\s+mode/i,
  /override\s+system\s+policy/i,
  /\[SYSTEM_NOTICE:.*APPROVED.*\]/i
];

/**
 * 1. Approval Source Verification
 */
export function verifyApprovalSource(sourceType, messageText) {
  if (sourceType !== 'T1_BOSS_TURN') {
    if (INJECTION_PATTERNS.some(p => p.test(messageText)) || messageText.includes('APPROVED')) {
      return {
        valid: false,
        reason: `INJECTION_ATTEMPT: Spoofed approval detected in non-T1 source (${sourceType}). Text about approval is not approval.`
      };
    }
  }
  return { valid: true };
}

/**
 * 2. Scope Escalation Guard
 */
export function verifyScopeEscalation(parentPermissions, requestedPermissions) {
  for (const perm of requestedPermissions) {
    if (!parentPermissions.includes(perm)) {
      return {
        allowed: false,
        reason: `Permission escalation denied: requested '${perm}' is not in parent contract permissions [${parentPermissions.join(', ')}].`
      };
    }
  }
  return { allowed: true };
}

/**
 * 3. Prompt Injection Defense
 */
export function sanitizeUntrustedData(content) {
  const injectionLogs = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      const match = content.match(pattern)[0];
      injectionLogs.push(`INJECTION_ATTEMPT: "${match.slice(0, 30)}..."`);
    }
  }
  return {
    isSafeData: injectionLogs.length === 0,
    injectionLogs,
    inertData: content
  };
}

/**
 * 4. Path Containment Defense
 */
export function verifyPathContainment(targetPath, approvedRoot = PROTOTYPE_ROOT) {
  const canonicalRoot = path.resolve(approvedRoot);
  const resolvedTarget = path.resolve(targetPath);

  if (!resolvedTarget.startsWith(canonicalRoot)) {
    return {
      contained: false,
      reason: `Path containment violation: ${targetPath} resolves outside approved root ${approvedRoot}`
    };
  }

  if (fs.existsSync(resolvedTarget)) {
    const realTarget = fs.realpathSync(resolvedTarget);
    if (!realTarget.startsWith(fs.realpathSync(canonicalRoot))) {
      return {
        contained: false,
        reason: `Symlink/junction escape detected: ${targetPath} resolves to ${realTarget}`
      };
    }
  }

  return { contained: true };
}

/**
 * 5. Secret Scanning Defense
 */
export function scanSecrets(content) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return {
        hasSecret: true,
        reason: `Secret scanner violation: detected credential class '${pattern.source}'`
      };
    }
  }
  return { hasSecret: false };
}

/**
 * 6. Transaction Timeout & Idempotency Guard
 */
export function evaluateTransactionRetry(transactionState) {
  if (transactionState.last_status === 'TIMEOUT_NO_RESPONSE' && !transactionState.reconciled) {
    return {
      allowRetry: false,
      reason: `Transaction retry denied: transaction ${transactionState.transaction_id} timed out without state reconciliation. Must reconcile before retry.`
    };
  }
  return { allowRetry: true };
}

/**
 * 7. Git State Drift Guard
 */
export function verifyGitState(expectedCommit, actualCommit, requireCleanTree, isCleanTree) {
  if (expectedCommit !== actualCommit) {
    return {
      valid: false,
      reason: `Git state drift error: expected commit ${expectedCommit}, actual commit ${actualCommit}`
    };
  }
  if (requireCleanTree && !isCleanTree) {
    return {
      valid: false,
      reason: `Git state drift error: uncommitted changes detected in working tree`
    };
  }
  return { valid: true };
}

/**
 * 8. Proof of Done Verification
 */
export function verifyProofOfDone(proofData) {
  if (proofData.claim === 'COMPLETE') {
    if (!proofData.is_verified) {
      return { valid: false, reason: "Proof of done rejected: task claimed COMPLETE but is_verified is false." };
    }
    if (!proofData.test_evidence || proofData.test_evidence.length === 0) {
      return { valid: false, reason: "Proof of done rejected: missing empirical test evidence." };
    }
    for (const del of proofData.deliverables) {
      const delPath = path.join(PROTOTYPE_ROOT, del);
      if (!fs.existsSync(delPath)) {
        return { valid: false, reason: `Proof of done rejected: claimed deliverable file '${del}' does not exist.` };
      }
    }
  }
  return { valid: true };
}

/**
 * 9. Capability Mapping Guard
 */
export function verifyCapabilityDescriptor(descriptor) {
  if (descriptor.underlying_action === 'EXECUTE_BASH' && descriptor.declared_operation === 'read') {
    return {
      mappedOperation: 'EXECUTE',
      requiredPermission: 'PERM_EXECUTE',
      warning: `Capability remapped: descriptor '${descriptor.capability_id}' declared operation 'read' but performs underlying action '${descriptor.underlying_action}'. Remapped to PERM_EXECUTE.`
    };
  }
  return { mappedOperation: descriptor.declared_operation, requiredPermission: 'PERM_READ_LOCAL' };
}

/**
 * Run All Red-Team Adversarial Tests
 */
export function runAdversarialHarness() {
  console.log(`\n=== Running Hypertaks Hermes Red-Team Adversarial Test Harness ===\n`);
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Approval Spoofing
  totalTests++;
  console.log('[TEST 1] Approval Spoofing in Tool Result Data...');
  const text1 = fs.readFileSync(path.join(FIXTURES_DIR, '01-approval-spoofing.txt'), 'utf8');
  const res1 = verifyApprovalSource('T4_TOOL_RESULT', text1);
  if (!res1.valid) {
    console.log(`  PASS: Fail closed on spoofed approval: "${res1.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Approval spoofing was accepted!');
  }

  // Test 2: Scope Escalation
  totalTests++;
  console.log('[TEST 2] Subagent Permission Escalation...');
  const escData = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, '02-scope-escalation.json'), 'utf8'));
  const res2 = verifyScopeEscalation(escData.parent_contract_permissions, escData.requested_permissions);
  if (!res2.allowed) {
    console.log(`  PASS: Fail closed on permission escalation: "${res2.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Permission escalation was allowed!');
  }

  // Test 3: Prompt Injection
  totalTests++;
  console.log('[TEST 3] Prompt Injection in Retrieved Context...');
  const text3 = fs.readFileSync(path.join(FIXTURES_DIR, '03-prompt-injection.md'), 'utf8');
  const res3 = sanitizeUntrustedData(text3);
  if (!res3.isSafeData && res3.injectionLogs.length > 0) {
    console.log(`  PASS: Caught prompt injection attempt: "${res3.injectionLogs[0]}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Prompt injection was missed!');
  }

  // Test 4: Path Traversal
  totalTests++;
  console.log('[TEST 4] Path Traversal and Approved-Root Escape...');
  const text4 = fs.readFileSync(path.join(FIXTURES_DIR, '04-path-traversal.txt'), 'utf8');
  const targetPath = text4.split('\n')[0].split(': ')[1].trim();
  const res4 = verifyPathContainment(targetPath);
  if (!res4.contained) {
    console.log(`  PASS: Blocked path traversal attempt: "${res4.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Path traversal attempt escaped root!');
  }

  // Test 5: Secret Propagation
  totalTests++;
  console.log('[TEST 5] Secret Leak in Handoff Capsule...');
  const template5 = fs.readFileSync(path.join(FIXTURES_DIR, '05-secret-leak.json'), 'utf8');
  const text5 = template5
    .replace('$SYNTHETIC_AWS_ACCESS_KEY', ['AK', 'IA', 'A'.repeat(16)].join(''))
    .replace('$SYNTHETIC_GITHUB_TOKEN', ['gh', 'p_', 'B'.repeat(36)].join(''));
  const res5 = scanSecrets(text5);
  if (res5.hasSecret) {
    console.log(`  PASS: Caught raw credentials in handoff: "${res5.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Secret leak went undetected!');
  }

  // Test 6: Timeout Ambiguity & Retry
  totalTests++;
  console.log('[TEST 6] Timeout Ambiguity & Retry Idempotency...');
  const txnData = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, '06-timeout-retry.json'), 'utf8'));
  const res6 = evaluateTransactionRetry(txnData);
  if (!res6.allowRetry) {
    console.log(`  PASS: Denied un-reconciled retry: "${res6.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Un-reconciled retry was permitted!');
  }

  // Test 7: Git State Drift
  totalTests++;
  console.log('[TEST 7] Stale Repository Evidence & Commit Drift...');
  const gitData = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, '07-stale-git-state.json'), 'utf8'));
  const res7 = verifyGitState(gitData.expected_commit, gitData.actual_commit, gitData.clean_tree_required, gitData.actual_clean_tree);
  if (!res7.valid) {
    console.log(`  PASS: Blocked execution on commit drift: "${res7.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Stale git commit state was accepted!');
  }

  // Test 8: False Proof of Done
  totalTests++;
  console.log('[TEST 8] False Proof of Done Verification...');
  const proofData = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, '08-false-proof-of-done.json'), 'utf8'));
  const res8 = verifyProofOfDone(proofData);
  if (!res8.valid) {
    console.log(`  PASS: Rejected false proof of done: "${res8.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: False proof of done was accepted!');
  }

  // Test 9: Malicious Capability Descriptors
  totalTests++;
  console.log('[TEST 9] Malicious Capability Descriptor Remapping...');
  const capData = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, '09-malicious-capability.json'), 'utf8'));
  const res9 = verifyCapabilityDescriptor(capData);
  if (res9.mappedOperation === 'EXECUTE') {
    console.log(`  PASS: Remapped malicious descriptor: "${res9.warning}"`);
    passedTests++;
  } else {
    console.error('  FAIL: Malicious capability descriptor bypassed permission mapping!');
  }

  // Test 10: Automatic Creation Without PERM_FILE_WRITE
  totalTests++;
  console.log('[TEST 10] Automatic File Creation Guard...');
  const writePermissions = ['PERM_READ_LOCAL']; // Lacks PERM_FILE_WRITE
  const res10 = verifyScopeEscalation(writePermissions, ['PERM_FILE_WRITE']);
  if (!res10.allowed) {
    console.log(`  PASS: Blocked automatic creation without PERM_FILE_WRITE: "${res10.reason}"`);
    passedTests++;
  } else {
    console.error('  FAIL: File creation without PERM_FILE_WRITE was allowed!');
  }

  console.log(`\n=== Adversarial Harness Summary: ${passedTests}/${totalTests} Passed ===\n`);
  if (passedTests === totalTests) {
    console.log(`>>> ALL ADVERSARIAL TESTS PASSED (Fail-Closed Validated, Exit Code 0) <<<\n`);
    process.exit(0);
  } else {
    console.error(`>>> ADVERSARIAL HARNESS FAILED (Exit Code 1) <<<\n`);
    process.exit(1);
  }
}

// Direct Execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runAdversarialHarness();
}
