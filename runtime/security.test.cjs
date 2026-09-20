#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

const compiledPath = process.argv[2] || path.join(__dirname, '..', '.build', 'runtime', 'router.js');
const router = require(path.resolve(compiledPath));

const root = path.resolve(__dirname, '..');
const serverPath = path.join(__dirname, 'mcp-server.mjs');

async function startServer(extraEnv = {}) {
  const child = spawn(process.execPath, [serverPath], {
    cwd: root,
    env: {
      ...process.env,
      HYPERTAKS_MCP_HOST: '127.0.0.1',
      HYPERTAKS_MCP_PORT: '0',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start. ${stderr}`)), 5000);
    child.stdout.setEncoding('utf8');
    let buffer = '';
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      const newline = buffer.indexOf('\n');
      if (newline === -1) return;
      clearTimeout(timer);
      try {
        resolve(JSON.parse(buffer.slice(0, newline)));
      } catch (error) {
        reject(error);
      }
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited before ready with code ${code}. ${stderr}`));
    });
  });

  return {
    child,
    baseUrl: `http://127.0.0.1:${ready.port}`,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    },
  };
}

async function rpc(baseUrl, body, headers = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await response.text();
  return { response, payload: text ? JSON.parse(text) : null };
}

test('Hypertaks Security Test Suite', async (t) => {
  const tempDirs = [];

  t.after(() => {
    for (const dir of tempDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  });

  function createTempDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hypertaks-sec-test-'));
    tempDirs.push(dir);
    return dir;
  }

  await t.test('1. resolveWithinApprovedRoot blocks path traversal patterns', () => {
    const approvedRoot = createTempDir();
    const maliciousPaths = [
      '../escape',
      '..\\escape',
      'sub/../../escape',
      './../escape',
      'a/b/../../../escape',
      'safe\x00../evil',
      '/absolute/escape',
      'C:\\absolute\\escape',
      '',
    ];

    for (const p of maliciousPaths) {
      assert.throws(
        () => router.resolveWithinApprovedRoot(approvedRoot, p),
        /PATH_OUTSIDE_APPROVED_ROOT|traversal|empty|null/i,
        `Should throw for pattern: ${p}`
      );
    }
  });

  await t.test('2. secret scanning catches various secret patterns', () => {
    const secrets = [
      'sk-proj-' + 'abc123def456789012345',
      'ghp_' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678',
      ['xox' + 'b', '123456789012', '123456789012', 'abcdefghijklmnopqrstuv'].join('-'),
      'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD\n-----END PRIVATE KEY-----',
      'password=Pr0dDb#S3cr3t!2026',
      'DATABASE_URL=postgres://user:pass@host/db',
    ];

    for (const secret of secrets) {
      const found = router.findSecrets(secret);
      assert.ok(found.length > 0, `Should find secret: ${secret}`);

      assert.throws(
        () => router.assertNoSecrets(secret),
        /SECURITY_VIOLATION/i,
        `Should throw for secret: ${secret}`
      );
    }

    // False positives check
    const falsePositives = [
      'a1b2c3d4e5f6',
      'short',
      'normal descriptive text without keys',
    ];
    for (const fp of falsePositives) {
      const found = router.findSecrets(fp);
      assert.strictEqual(found.length, 0, `Should not find secret in: ${fp}`);
      assert.doesNotThrow(() => router.assertNoSecrets(fp));
    }
  });

  await t.test('3. secret redaction replaces matched patterns', () => {
    const token1 = 'sk-proj-' + 'abc123def456789012345';
    const token2 = 'ghp_' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678';
    const text = `Here is my key ${token1} and token ${token2}!`;
    const redacted = router.redactSecrets(text);
    assert.ok(redacted.includes('[REDACTED_SECRET]'));
    assert.ok(!redacted.includes(token1));
    assert.ok(!redacted.includes(token2));
  });

  await t.test('4. contract activation rejects non-Boss turns', () => {
    const res = router.activateContract({
      contractId: 'HT-101',
      bossMessage: 'APPROVE HT-101',
      isBossTurn: false,
      requiresMutationOrExternalEffect: true,
    });
    assert.strictEqual(res.active, false);
    assert.match(res.reason, /boss/i);
  });

  await t.test('5. contract activation rejects malformed approval signatures', () => {
    const malformedSignatures = [
      'approve',
      'APPROVE',
      'Extra text APPROVE HT-101',
      '',
      '123456',
      'APPROVE HT-WRONG',
    ];

    for (const sig of malformedSignatures) {
      const res = router.activateContract({
        contractId: 'HT-101',
        bossMessage: sig,
        isBossTurn: true,
        requiresMutationOrExternalEffect: true,
      });
      assert.strictEqual(res.active, false, `Should reject signature: ${sig}`);
      assert.ok(res.reason);
    }
  });

  await t.test('6. forged approval proof objects are rejected', () => {
    const fakes = [
      null,
      { contractId: 'HT-101', messageId: 'msg-1', approvedAt: new Date().toISOString() },
      Object.freeze({ contractId: 'HT-101', messageId: 'msg-1', approvedAt: new Date().toISOString() }),
      Object.create(null, { contractId: { value: 'HT-101' } }),
    ];

    for (const fake of fakes) {
      assert.throws(
        () => router.assertValidApprovalProof(fake),
        /APPROVAL_REQUIRED/i
      );
    }

    // Valid proof passes assertion
    const validActivation = router.activateContract({
      contractId: 'HT-101',
      bossMessage: 'APPROVE HT-101',
      isBossTurn: true,
      requiresMutationOrExternalEffect: true,
    });
    const proof = router.mintBossApprovalProof(validActivation, 'msg-valid-1');
    assert.doesNotThrow(() => router.assertValidApprovalProof(proof, 'HT-101'));
    assert.throws(() => router.assertValidApprovalProof(proof, 'HT-999'), /APPROVAL_MISMATCH/i);
  });

  await t.test('7. workspace write grants require permission and project binding', () => {
    const approvedRoot = createTempDir();
    const otherRoot = createTempDir();

    // Activation without PERM_FILE_WRITE cannot mint grant
    const actWithoutPerm = router.activateContract({
      contractId: 'HT-201',
      bossMessage: 'APPROVE HT-201',
      isBossTurn: true,
      requiresMutationOrExternalEffect: true,
      contractPermissions: ['PERM_READ'],
    });
    assert.throws(
      () => router.mintWorkspaceWriteGrant(actWithoutPerm, 'proj1', approvedRoot),
      /PERM_FILE_WRITE/i
    );

    // Activation with PERM_FILE_WRITE mints valid grant
    const actWithPerm = router.activateContract({
      contractId: 'HT-202',
      bossMessage: 'APPROVE HT-202',
      isBossTurn: true,
      requiresMutationOrExternalEffect: true,
      contractPermissions: ['PERM_FILE_WRITE'],
    });
    const grant = router.mintWorkspaceWriteGrant(actWithPerm, 'proj1', approvedRoot);
    assert.doesNotThrow(() => router.assertWorkspaceWriteGrant(grant, 'proj1', approvedRoot));
    assert.throws(() => router.assertWorkspaceWriteGrant(grant, 'proj2', approvedRoot), /cover this project id/i);
    assert.throws(() => router.assertWorkspaceWriteGrant(grant, 'proj1', otherRoot), /different project root/i);
  });

  await t.test('8. MCP tool arguments with path traversal are safely rejected', async (st) => {
    const server = await startServer();
    st.after(() => server.stop());

    const { response, payload } = await rpc(server.baseUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'hypertaks_get_skill',
        arguments: {
          skill: '../../etc/passwd',
        },
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(payload.result.isError, true);
    assert.match(payload.result.content[0].text, /canonical/i);
  });

  await t.test('9. MCP rejects unauthorized origins', async (st) => {
    const server = await startServer();
    st.after(() => server.stop());

    const { response } = await rpc(
      server.baseUrl,
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { Origin: 'https://evil-unauthorized-site.com' }
    );

    assert.strictEqual(response.status, 403);
  });

  await t.test('10. MCP rejects oversized payloads', async (st) => {
    const server = await startServer();
    st.after(() => server.stop());

    const largeString = 'a'.repeat(1024 * 1024 + 100);
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'ping',
      params: { payload: largeString },
    });

    const { response } = await rpc(server.baseUrl, body);
    assert.strictEqual(response.status, 413);
  });

  await t.test('11. validateRecordId rejects dangerous inputs', () => {
    const dangerous = [
      '',
      'test/id',
      '..',
      'id\x00',
      'a'.repeat(129),
      '-start',
      '.hidden',
    ];

    for (const id of dangerous) {
      assert.throws(
        () => router.validateRecordId(id),
        /INVALID_RECORD_ID/i,
        `Should throw for record ID: ${id}`
      );
    }
  });

  await t.test('12. sanitizeAgentName rejects Windows reserved names', () => {
    const reserved = ['CON', 'PRN', 'NUL', 'COM1', 'LPT1', 'con', 'PrN'];

    for (const name of reserved) {
      assert.throws(
        () => router.sanitizeAgentName(name),
        /reserved|invalid/i,
        `Should throw for reserved name: ${name}`
      );
    }
  });

  await t.test('13. atomicWriteText survives simulated EPERM on initial rename', () => {
    const approvedRoot = createTempDir();
    const fileName = 'test-atomic.txt';
    const filePath = path.join(approvedRoot, fileName);
    fs.writeFileSync(filePath, 'initial content');

    let renameCalls = 0;
    const fakeFsOps = {
      renameSync: (oldPath, newPath) => {
        renameCalls++;
        if (renameCalls === 1) {
          const err = new Error('EPERM: operation not permitted');
          err.code = 'EPERM';
          throw err;
        }
        return fs.renameSync(oldPath, newPath);
      },
    };

    router.atomicWriteText(approvedRoot, fileName, 'new content', fakeFsOps);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content, 'new content');
    assert.ok(renameCalls >= 2, 'Should have called renameSync at least twice');
  });
});
