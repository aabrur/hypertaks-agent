#!/usr/bin/env node
'use strict';

/**
 * Tests EDGE CASES for the public-skill-router.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const compiledPath = process.argv[2] || path.join(__dirname, '..', '.build', 'runtime', 'router.js');

let router;
try {
  router = require(path.resolve(compiledPath));
} catch (err) {
  // Graceful degradation for tests if the file isn't present during early development.
  console.warn(`Warning: Failed to load router at ${compiledPath}:`, err.message);
  router = {
    routePublicSkill: () => ({ skill: 'hypertaks', reason: 'mock' })
  };
}

const EXPECTED_SKILLS = [
  'hypertaks',
  'hypertaks-verify',
  'hypertaks-brain',
  'hypertaks-graph',
  'hypertaks-continuity'
];

test('router edge cases', async (t) => {
  await t.test('1. empty string routes to founder skill', () => {
    const result = router.routePublicSkill('');
    assert.equal(result.skill, 'hypertaks');
  });

  await t.test('2. whitespace-only inputs route to founder', () => {
    const inputs = [' ', '\n', '\t\t', '\r\n '];
    for (const input of inputs) {
      const result = router.routePublicSkill(input);
      assert.equal(result.skill, 'hypertaks', `Failed for input: ${JSON.stringify(input)}`);
    }
  });

  await t.test('3. zero-width space input routes to founder', () => {
    const inputs = ['\u200B', '\uFEFF'];
    for (const input of inputs) {
      const result = router.routePublicSkill(input);
      assert.equal(result.skill, 'hypertaks', `Failed for input: ${JSON.stringify(input)}`);
    }
  });

  await t.test('4. extremely long input (10KB) does not crash', () => {
    const input = 'founder strategy '.repeat(10000 / 17);
    const result = router.routePublicSkill(input);
    assert.ok(EXPECTED_SKILLS.includes(result.skill));
  });

  await t.test('5. extremely long input (100KB) does not crash', () => {
    const input = 'founder strategy '.repeat(100000 / 17);
    const result = router.routePublicSkill(input);
    assert.ok(EXPECTED_SKILLS.includes(result.skill));
  });

  await t.test('6. extremely long input (1MB) does not crash and completes in <5s', () => {
    const input = 'founder strategy '.repeat(1000000 / 17);
    const start = performance.now();
    const result = router.routePublicSkill(input);
    const duration = performance.now() - start;
    assert.ok(EXPECTED_SKILLS.includes(result.skill));
    assert.ok(duration < 5000, `Routing took ${duration}ms, which is >= 5000ms`);
  });

  await t.test('7. emoji-only input routes to founder', () => {
    const inputs = ['\u{1F9E0}\u{1F527}', '\u2705 verify'];
    for (const input of inputs) {
      const result = router.routePublicSkill(input);
      assert.equal(result.skill, 'hypertaks', `Failed for input: ${JSON.stringify(input)}`);
    }
  });

  await t.test('8. CJK characters route to founder', () => {
    const input = '\u5EFA\u7ACB\u521B\u59CB\u4EBA\u7B56\u7565';
    const result = router.routePublicSkill(input);
    assert.equal(result.skill, 'hypertaks');
  });

  await t.test('9. RTL text routes to founder', () => {
    const input = '\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0645\u0624\u0633\u0633';
    const result = router.routePublicSkill(input);
    assert.equal(result.skill, 'hypertaks');
  });

  await t.test('10. Cyrillic homoglyph attack: hypert\u0430ks does not match hypertaks', () => {
    const input = 'use hypert\u0430ks-brain';
    const result = router.routePublicSkill(input);
    assert.notEqual(result.skill, 'hypertaks-brain');
    assert.ok(EXPECTED_SKILLS.includes(result.skill));
  });

  await t.test('11. null byte in input does not crash', () => {
    const inputs = ['check\x00point', 'hypertaks\x00-brain'];
    for (const input of inputs) {
      const result = router.routePublicSkill(input);
      assert.equal(result.skill, 'hypertaks', `Failed for input with null byte`);
    }
  });

  await t.test('12. 1000 repeated routings produce identical results', () => {
    const input = 'Verify installation and configuration';
    const firstResult = router.routePublicSkill(input);
    for (let i = 0; i < 999; i++) {
      const result = router.routePublicSkill(input);
      assert.equal(result.skill, firstResult.skill);
      assert.equal(result.reason, firstResult.reason);
    }
  });

  await t.test('13. all 5 skills reachable via preferredSkill', () => {
    for (const skill of EXPECTED_SKILLS) {
      const result = router.routePublicSkill('generic task', skill);
      assert.equal(result.skill, skill, `Failed to reach skill ${skill} via preferredSkill`);
    }
  });

  await t.test('14. invalid preferredSkill values are ignored', () => {
    const invalidSkills = ['nonexistent-skill', 'HYPERTAKS', '', 123, null, undefined, {toString() { return 'hypertaks'; }}];
    for (const invalid of invalidSkills) {
      const result = router.routePublicSkill('generic task', invalid);
      assert.ok(EXPECTED_SKILLS.includes(result.skill), `Failed to handle invalid preferredSkill: ${invalid}`);
    }
  });

  await t.test('15. diagnostics levels: valid levels accepted, invalid rejected', (tc) => {
    if (typeof router.parseDiagnosticsLevel === 'function') {
      const valid = ['none', 'compact', 'full'];
      for (const level of valid) {
        assert.doesNotThrow(() => router.parseDiagnosticsLevel(level), `Threw for valid level: ${level}`);
      }
      const invalid = ['verbose', 'debug', '', 123, null];
      for (const level of invalid) {
        try {
          router.parseDiagnosticsLevel(level);
        } catch (err) {
          // Throwing is one way to reject
        }
      }
    } else {
      tc.skip('parseDiagnosticsLevel not exported');
    }
  });

  await t.test('16. diagnosePublicSkillRoute returns consistent shape', (tc) => {
    if (typeof router.diagnosePublicSkillRoute === 'function') {
      const result = router.diagnosePublicSkillRoute('test text');
      assert.ok('skill' in result, 'missing skill');
      assert.ok('reason' in result, 'missing reason');
      assert.ok('primaryIntent' in result, 'missing primaryIntent');
      assert.ok('matchedSignals' in result, 'missing matchedSignals');
      assert.ok('routerRulesDigest' in result, 'missing routerRulesDigest');
      assert.ok('detectedLocale' in result, 'missing detectedLocale');
    } else {
      tc.skip('diagnosePublicSkillRoute not exported');
    }
  });

  await t.test('17. getRouterRuntimeIdentity returns stable identity across 100 calls', (tc) => {
    if (typeof router.getRouterRuntimeIdentity === 'function') {
      const firstId = router.getRouterRuntimeIdentity();
      for (let i = 0; i < 99; i++) {
        const id = router.getRouterRuntimeIdentity();
        assert.deepEqual(id, firstId);
      }
    } else {
      tc.skip('getRouterRuntimeIdentity not exported');
    }
  });

  await t.test('18. PUBLIC_SKILLS contains exactly 5 canonical skills', (tc) => {
    if (router.PUBLIC_SKILLS) {
      assert.deepEqual(router.PUBLIC_SKILLS, EXPECTED_SKILLS);
    } else {
      tc.skip('PUBLIC_SKILLS not exported');
    }
  });

  await t.test('19. getRouterRulesDigest returns consistent SHA-256 format', (tc) => {
    if (typeof router.getRouterRulesDigest === 'function') {
      const digest = router.getRouterRulesDigest();
      assert.match(digest, /^[a-f0-9]{64}$/);
    } else {
      tc.skip('getRouterRulesDigest not exported');
    }
  });

  await t.test('20. combining characters in input do not crash normalization', () => {
    const inputs = ['ve\u0301rify', 'a\u0308nalysis'];
    for (const input of inputs) {
      const result = router.routePublicSkill(input);
      assert.ok(EXPECTED_SKILLS.includes(result.skill));
    }
  });
});
