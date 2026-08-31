#!/usr/bin/env node
/**
 * Project Operating Context (POC) boundary and metadata tests.
 * Requires the compiled runtime: node runtime/poc.test.cjs .build/runtime/router.js
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const compiledPath = process.argv[2];
if (!compiledPath) throw new Error('compiled router path is required');
const router = require(path.resolve(compiledPath));

function runGit(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'hypertaks-poc-'));
  runGit(repo, 'init');
  runGit(repo, 'config', 'user.email', 'test@example.com');
  runGit(repo, 'config', 'user.name', 'Hypertaks Test');
  fs.writeFileSync(path.join(repo, 'tracked.txt'), 'seed\n', 'utf8');
  runGit(repo, 'add', 'tracked.txt');
  runGit(repo, 'commit', '-m', 'seed');
  return repo;
}

const AUTHORIZED = ['PERM_FILE_WRITE'];
const pocDir = (repo, projectId) => path.join(repo, '.hypertaks', 'projects', projectId);

// A: approved contract + PERM_FILE_WRITE + approved root -> POC may be created
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-A',
    bossMessage: 'APPROVE HT-POC-A',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: AUTHORIZED,
  });
  assert.equal(activation.active, true, 'A: activation must be active');
  assert.equal(activation.bootstrapStatus, 'SUCCESS', 'A: bootstrap must succeed');
  assert.equal(fs.readdirSync(pocDir(repo, 'POC-A')).length, 13, 'A: exactly 13 files');
}

// B: approved contract without PERM_FILE_WRITE -> no filesystem mutation
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-B',
    bossMessage: 'APPROVE HT-POC-B',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: ['PERM_READ_LOCAL'],
  });
  assert.equal(activation.active, true, 'B: read-only contract still activates');
  assert.equal(activation.bootstrapStatus, 'DENIED', 'B: bootstrap must be denied');
  assert.match(String(activation.bootstrapReason), /PERM_FILE_WRITE/);
  assert.equal(fs.existsSync(pocDir(repo, 'POC-B')), false, 'B: no POC directory may be created');
  assert.equal(fs.existsSync(path.join(repo, '.hypertaks')), false, 'B: no .hypertaks tree may be created');
}

// C: projectRoot supplied without permission -> denied; direct call bypass closed
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-C',
    bossMessage: 'APPROVE HT-POC-C',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
  });
  assert.equal(activation.bootstrapStatus, 'DENIED', 'C: missing permissions must be denied');
  assert.equal(fs.existsSync(path.join(repo, '.hypertaks')), false, 'C: no mutation without permission');
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-C', null),
    /PERMISSION_DENIED/,
    'C: direct bootstrap without a grant must throw',
  );
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-C', { grantKind: 'hypertaks.workspace-write.v1', contractId: 'HT-POC-C', projectId: 'POC-C', approvedRoot: repo, permission: 'PERM_FILE_WRITE', evidence: 'APPROVE HT-POC-C' }),
    /PERMISSION_DENIED/,
    'C: a forged grant object must be rejected by the registry',
  );
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-C', { allowFileWrite: true }),
    /PERMISSION_DENIED/,
    'C: boolean flag bypass must throw',
  );
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-C', { permissions: ['PERM_FILE_WRITE'] }),
    /PERMISSION_DENIED/,
    'C: caller permissions array alone must throw',
  );
}

// D: registerApprovedContractActivation is not exported; forged activation object rejected
{
  const repo = makeRepo();
  assert.equal(
    router.registerApprovedContractActivation,
    undefined,
    'D: registerApprovedContractActivation must not be exposed on public router API',
  );
  const founderBrain = require(path.resolve(path.dirname(compiledPath), 'founder-brain.js'));
  assert.equal(
    founderBrain.registerApprovedContractActivation,
    undefined,
    'D: registerApprovedContractActivation must not be exposed on founder-brain module',
  );
  assert.throws(
    () => router.mintWorkspaceWriteGrant({ active: true, contractId: 'HT-FORGED', evidence: 'APPROVE HT-FORGED', contractPermissions: ['PERM_FILE_WRITE'] }, 'FORGED', repo),
    /PERMISSION_DENIED/,
    'D: fabricated activation object must be rejected',
  );
}

// E: non-Boss activation -> denied
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-D',
    bossMessage: 'APPROVE HT-POC-D',
    isBossTurn: false,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: AUTHORIZED,
  });
  assert.equal(activation.active, false, 'E: non-Boss turn must not activate');
  assert.equal(fs.existsSync(path.join(repo, '.hypertaks')), false, 'E: no mutation');
}

console.log('poc boundary tests (part 1) passed');

// F: malformed approval -> denied
{
  const repo = makeRepo();
  for (const bossMessage of ['approved', 'APPROVE HT-POC-E extra', 'please APPROVE HT-POC-E']) {
    const activation = router.activateContract({
      contractId: 'HT-POC-E',
      bossMessage,
      isBossTurn: true,
      requiresMutationOrExternalEffect: true,
      projectRoot: repo,
      contractPermissions: AUTHORIZED,
    });
    assert.equal(activation.active, false, `F: "${bossMessage}" must not activate a mutation contract`);
  }
  assert.equal(fs.existsSync(path.join(repo, '.hypertaks')), false, 'F: no mutation');
}

// G: traversal project id -> denied
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-F',
    bossMessage: 'APPROVE HT-POC-F',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: AUTHORIZED,
  });
  assert.equal(activation.bootstrapStatus, 'SUCCESS');
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-F', repo);
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, '../escape', grant),
    /INVALID_RECORD_ID|PERMISSION_DENIED/,
    'G: direct call with traversal id must throw',
  );
  assert.equal(fs.existsSync(path.join(repo, 'escape')), false, 'G: nothing written outside');
  assert.throws(
    () => router.mintWorkspaceWriteGrant(activation, '../escape', repo),
    /INVALID_RECORD_ID/,
    'G: minting a grant for a traversal id must throw',
  );
}

// H: root escape (symlinked project directory pointing outside the root) -> denied
{
  const repo = makeRepo();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'hypertaks-outside-'));
  fs.mkdirSync(path.join(repo, '.hypertaks', 'projects'), { recursive: true });
  fs.symlinkSync(outside, path.join(repo, '.hypertaks', 'projects', 'POC-G'), 'junction');
  const activation = router.activateContract({
    contractId: 'HT-POC-G',
    bossMessage: 'APPROVE HT-POC-G',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    contractPermissions: AUTHORIZED,
  });
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-G', repo);
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-G', grant),
    /PATH_OUTSIDE_APPROVED_ROOT/,
    'H: symlink escape must be refused',
  );
  assert.equal(fs.readdirSync(outside).length, 0, 'H: nothing may be written outside the root');
}

// I: existing context documents are preserved, not overwritten
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-H',
    bossMessage: 'APPROVE HT-POC-H',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    contractPermissions: AUTHORIZED,
  });
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-H', repo);
  fs.mkdirSync(pocDir(repo, 'POC-H'), { recursive: true });
  const existing = path.join(pocDir(repo, 'POC-H'), 'Vision.ctx.md');
  fs.writeFileSync(existing, '---\nid: Vision\n---\nBoss-authored vision content.\n', 'utf8');
  const created = router.bootstrapProjectWorkspace(repo, 'POC-H', grant);
  assert.equal(created.length, 12, 'I: only the 12 missing files may be created');
  assert.equal(
    fs.readFileSync(existing, 'utf8'),
    '---\nid: Vision\n---\nBoss-authored vision content.\n',
    'I: existing document must be preserved verbatim',
  );
}

console.log('poc boundary tests (part 2) passed');

// J: partial write failure -> fail loud and report degraded state truthfully
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-I',
    bossMessage: 'APPROVE HT-POC-I',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    contractPermissions: AUTHORIZED,
  });
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-I', repo);
  const failingOps = {
    writeFileSync(target, content, options) {
      if (String(target).includes('architecture.ctx.md')) {
        throw new Error('EIO: injected disk failure');
      }
      return fs.writeFileSync(target, content, options);
    },
  };
  assert.throws(
    () => router.bootstrapProjectWorkspace(repo, 'POC-I', grant, undefined, failingOps),
    /EIO/,
    'J: partial failure must fail loud, not report success',
  );
  const partial = fs.readdirSync(pocDir(repo, 'POC-I'));
  assert.ok(partial.length > 0 && partial.length < 13, 'J: partial state exists and must not be hidden');
}

// J2: a bootstrap failure through activation surfaces as DEGRADED with a reason
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-I2',
    bossMessage: 'APPROVE HT-POC-I2',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: path.join(repo, 'missing-root-no-create'),
    contractPermissions: AUTHORIZED,
  });
  assert.equal(activation.active, true);
  assert.equal(activation.bootstrapStatus, 'DEGRADED', 'J2: failure surfaces as DEGRADED');
  assert.ok(activation.bootstrapReason && activation.bootstrapReason.length > 0, 'J2: reason reported truthfully');
}

// K: COMMIT ONCE / idempotency: replaying bootstrap never rewrites existing documents
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-J',
    bossMessage: 'APPROVE HT-POC-J',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: AUTHORIZED,
  });
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-J', repo);
  const first = router.bootstrapProjectWorkspace(repo, 'POC-J', grant);
  assert.equal(first.length, 0, 'already created during activateContract');
  const before = fs.readFileSync(path.join(pocDir(repo, 'POC-J'), 'security.ctx.md'), 'utf8');
  const second = router.bootstrapProjectWorkspace(repo, 'POC-J', grant);
  assert.equal(second.length, 0, 'replay must create nothing');
  assert.equal(fs.readFileSync(path.join(pocDir(repo, 'POC-J'), 'security.ctx.md'), 'utf8'), before);
}

// L: generated metadata must not masquerade as verified evidence
{
  const repo = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-K',
    bossMessage: 'APPROVE HT-POC-K',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo,
    contractPermissions: AUTHORIZED,
  });
  const grant = router.mintWorkspaceWriteGrant(activation, 'POC-K', repo);
  for (const filename of router.PROJECT_OPERATING_CONTEXT_FILES) {
    const text = fs.readFileSync(path.join(pocDir(repo, 'POC-K'), filename), 'utf8');
    assert.match(text, /evidence_class: T6_GENERATED/, `${filename}: honest generated origin`);
    assert.match(text, /lifecycle_state: DRAFT/, `${filename}: draft lifecycle state`);
    assert.doesNotMatch(text, /lifecycle_state: VERIFIED/, `${filename}: must not claim verified`);
    assert.match(text, /verification: UNVERIFIED/, `${filename}: unverified marker required`);
    assert.doesNotMatch(text, /Unresolved Issues: (?:None|No unresolved)/i, `${filename}: must not claim no unresolved issues`);
    assert.match(text, /Not yet assessed/, `${filename}: unresolved issues must be marked unassessed`);
  }
}

console.log('poc boundary tests (part 3) passed');

// M: the standalone script delegates to the canonical runtime generator
{
  const repo = makeRepo();
  const script = path.join(__dirname, '..', 'scripts', 'bootstrap-project-context.js');
  const out = execFileSync(process.execPath, [
    script,
    '--project-root', repo,
    '--project-id', 'POC-L',
    '--contract-id', 'HT-POC-L',
    '--permissions', 'PERM_FILE_WRITE',
    '--approval', 'APPROVE HT-POC-L',
  ], { encoding: 'utf8' });
  assert.match(out, /SUCCESS/);
  assert.equal(fs.readdirSync(pocDir(repo, 'POC-L')).length, 13, 'script creates the 13 files');

  // Unauthorized script invocation is refused.
  const repo2 = makeRepo();
  assert.throws(() => {
    execFileSync(process.execPath, [
      script,
      '--project-root', repo2,
      '--project-id', 'POC-L',
      '--contract-id', 'HT-POC-L',
      '--permissions', 'PERM_READ_LOCAL',
      '--approval', 'APPROVE HT-POC-L',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  }, /PERM_FILE_WRITE/, 'script without PERM_FILE_WRITE must fail');
}

// N: equivalence modulo timestamps between script and runtime output
{
  const repo3 = makeRepo();
  const activation = router.activateContract({
    contractId: 'HT-POC-L',
    bossMessage: 'APPROVE HT-POC-L',
    isBossTurn: true,
    requiresMutationOrExternalEffect: true,
    projectRoot: repo3,
    contractPermissions: AUTHORIZED,
  });
  const repo = makeRepo();
  const script = path.join(__dirname, '..', 'scripts', 'bootstrap-project-context.js');
  execFileSync(process.execPath, [
    script,
    '--project-root', repo,
    '--project-id', 'POC-L',
    '--contract-id', 'HT-POC-L',
    '--permissions', 'PERM_FILE_WRITE',
    '--approval', 'APPROVE HT-POC-L',
  ], { encoding: 'utf8' });
  const normalize = (text) => text
    .replace(/timestamp: .*/g, 'timestamp: X')
    .replace(/Generated At: .*/g, 'Generated At: X')
    .replace(/commit_sha: .*/g, 'commit_sha: X')
    .replace(/branch: .*/g, 'branch: X')
    .replace(/clean_tree: .*/g, 'clean_tree: X')
    .replace(/source_file: .*/g, 'source_file: X')
    .replace(/contract_id: .*/g, 'contract_id: X');
  for (const filename of router.PROJECT_OPERATING_CONTEXT_FILES) {
    const viaScript = fs.readFileSync(path.join(pocDir(repo, 'POC-L'), filename), 'utf8');
    const viaRuntime = fs.readFileSync(path.join(pocDir(repo3, 'POC-L'), filename), 'utf8');
    assert.equal(
      normalize(viaScript),
      normalize(viaRuntime),
      `equivalence failed for ${filename}`,
    );
  }
}

console.log('all poc boundary tests passed');
