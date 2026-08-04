/**
 * Shared public-skill route regression matrix for Router Integrity A4.
 * Categories cover English/Indonesian, punctuation, preferredSkill, negation,
 * supporting vs primary intent, multi-focused, generic tech nouns, exclusions,
 * mixed-language, and unsupported-locale fallback.
 *
 * Do not change routing policy from this file. Tests only.
 */

'use strict';

/** @typedef {{ id: string, request: string, expected: string, category: string, locale?: string }} RouteCase */

/** @type {RouteCase[]} */
const ROUTE_MATRIX = [
  // --- English positive focused + founder ---
  { id: 'en-founder-1', request: 'Create a founder strategy covering business and engineering.', expected: 'hypertaks', category: 'en_founder', locale: 'en' },
  { id: 'en-verify-1', request: 'Verify Hypertaks installation configuration checksum.', expected: 'hypertaks-verify', category: 'en_focused', locale: 'en' },
  { id: 'en-brain-1', request: 'Save and retrieve founder durable memory records.', expected: 'hypertaks-brain', category: 'en_focused', locale: 'en' },
  { id: 'en-graph-1', request: 'Analyze dependency change impact and blast radius.', expected: 'hypertaks-graph', category: 'en_focused', locale: 'en' },
  { id: 'en-cont-1', request: 'Create a checkpoint, handoff, and proof-of-done.', expected: 'hypertaks-continuity', category: 'en_focused', locale: 'en' },

  // --- Indonesian positive focused + founder ---
  { id: 'id-founder-1', request: 'Buat strategi founder lintas bisnis dan engineering.', expected: 'hypertaks', category: 'id_founder', locale: 'id' },
  { id: 'id-verify-1', request: 'Verifikasi konfigurasi dan instalasi Hypertaks.', expected: 'hypertaks-verify', category: 'id_focused', locale: 'id' },
  { id: 'id-brain-1', request: 'Simpan dan ambil memori founder ini.', expected: 'hypertaks-brain', category: 'id_focused', locale: 'id' },
  { id: 'id-graph-1', request: 'Analisis dependensi dan dampak perubahan modul.', expected: 'hypertaks-graph', category: 'id_focused', locale: 'id' },
  { id: 'id-cont-1', request: 'Buat checkpoint, handoff, dan bukti selesai.', expected: 'hypertaks-continuity', category: 'id_focused', locale: 'id' },

  // --- Baseline bag / bilingual ---
  { id: 'base-1', request: 'founder business + engineering + evidence', expected: 'hypertaks', category: 'baseline' },
  { id: 'base-2', request: 'verifikasi konfigurasi instalasi', expected: 'hypertaks-verify', category: 'baseline', locale: 'id' },
  { id: 'base-3', request: 'simpan dan ambil memori founder', expected: 'hypertaks-brain', category: 'baseline', locale: 'id' },
  { id: 'base-4', request: 'dependency change impact', expected: 'hypertaks-graph', category: 'baseline', locale: 'en' },
  { id: 'base-5', request: 'checkpoint + proof-of-done', expected: 'hypertaks-continuity', category: 'baseline', locale: 'en' },
  { id: 'base-6', request: 'install setup configuration checksum runtime verification', expected: 'hypertaks-verify', category: 'baseline', locale: 'en' },
  { id: 'base-7', request: 'save retrieve correct durable memory', expected: 'hypertaks-brain', category: 'baseline', locale: 'en' },
  { id: 'base-8', request: 'callers imports blast radius', expected: 'hypertaks-graph', category: 'baseline', locale: 'en' },
  { id: 'base-9', request: 'resume handoff reconcile', expected: 'hypertaks-continuity', category: 'baseline', locale: 'en' },
  { id: 'base-10', request: 'audit validate decision context status impact permission evidence', expected: 'hypertaks', category: 'baseline' },
  { id: 'base-11', request: 'ambiguous multi-domain strategy request', expected: 'hypertaks', category: 'baseline' },

  // --- Explicit skill selection ---
  { id: 'explicit-en-1', request: 'Use hypertaks-brain to inspect the current memory target.', expected: 'hypertaks-brain', category: 'explicit_skill', locale: 'en' },
  { id: 'explicit-en-2', request: 'Route this to hypertaks-graph for dependency analysis.', expected: 'hypertaks-graph', category: 'explicit_skill', locale: 'en' },
  { id: 'explicit-id-1', request: 'Pakai hypertaks-verify untuk cek instalasi.', expected: 'hypertaks-verify', category: 'explicit_skill', locale: 'id' },

  // --- Scoped negation ---
  { id: 'neg-1', request: 'jangan route ke verify', expected: 'hypertaks', category: 'negation', locale: 'id' },
  { id: 'neg-2', request: 'do not route to verify even if setup looks relevant', expected: 'hypertaks', category: 'negation', locale: 'en' },
  { id: 'neg-3', request: 'bukan konfigurasi, ini strategi founder', expected: 'hypertaks', category: 'negation', locale: 'id' },
  { id: 'neg-4', request: 'tidak perlu memory, lanjut engineering plan', expected: 'hypertaks', category: 'negation', locale: 'id' },
  { id: 'neg-5', request: 'Jangan route ke verify. Ini strategi founder.', expected: 'hypertaks', category: 'negation', locale: 'id' },
  { id: 'neg-6', request: 'Do not save memory. Analyze the founder plan.', expected: 'hypertaks', category: 'negation', locale: 'en' },
  { id: 'neg-7', request: 'Do not verify the installation. Create a founder plan instead.', expected: 'hypertaks', category: 'negation', locale: 'en' },

  // --- Supporting vs primary intent ---
  { id: 'support-1', request: 'Founder strategy with checkpoint and proof-of-done across business and engineering.', expected: 'hypertaks', category: 'supporting_vs_primary', locale: 'en' },
  { id: 'support-2', request: 'Design the API implementation with checkpoint requirements.', expected: 'hypertaks', category: 'supporting_vs_primary', locale: 'en' },
  { id: 'support-3', request: 'Founder strategy with dependency analysis and a project checkpoint.', expected: 'hypertaks', category: 'supporting_vs_primary', locale: 'en' },
  { id: 'support-4', request: 'Create a checkpoint for the API implementation.', expected: 'hypertaks-continuity', category: 'supporting_vs_primary', locale: 'en' },
  { id: 'support-5', request: 'Verify proof-of-done evidence.', expected: 'hypertaks-continuity', category: 'supporting_vs_primary', locale: 'en' },

  // --- Multiple focused intents ---
  { id: 'multi-1', request: 'Save founder memory and also create a checkpoint with dependency blast radius analysis.', expected: 'hypertaks', category: 'multi_focused', locale: 'en' },
  { id: 'multi-2', request: 'Verifikasi instalasi Hypertaks lalu simpan memori founder dan buat checkpoint.', expected: 'hypertaks', category: 'multi_focused', locale: 'id' },

  // --- Generic technology nouns stay main skill ---
  { id: 'generic-1', request: 'Build an MCP host that launches five servers.', expected: 'hypertaks', category: 'generic_tech', locale: 'en' },
  { id: 'generic-2', request: 'Configure a new MCP server.', expected: 'hypertaks', category: 'generic_tech', locale: 'en' },
  { id: 'generic-3', request: 'Install Python dependencies for the application.', expected: 'hypertaks', category: 'generic_tech', locale: 'en' },
  { id: 'generic-4', request: 'Setup the API schema and runtime host configuration.', expected: 'hypertaks', category: 'generic_tech', locale: 'en' },
  { id: 'generic-5', request: 'Konfigurasi server API aplikasi baru.', expected: 'hypertaks', category: 'generic_tech', locale: 'id' },

  // --- False-positive exclusions ---
  { id: 'excl-1', request: 'Fix a Node.js memory leak.', expected: 'hypertaks', category: 'exclusion', locale: 'en' },
  { id: 'excl-2', request: 'Debug heap memory and OOM on the worker.', expected: 'hypertaks', category: 'exclusion', locale: 'en' },
  { id: 'excl-3', request: 'Import customer records from CSV.', expected: 'hypertaks', category: 'exclusion', locale: 'en' },
  { id: 'excl-4', request: 'Create a graph chart of monthly revenue.', expected: 'hypertaks', category: 'exclusion', locale: 'en' },
  { id: 'excl-5', request: 'Buat grafik batang pendapatan bulanan.', expected: 'hypertaks', category: 'exclusion', locale: 'id' },
  { id: 'excl-6', request: 'npm install dependencies for the CLI tool.', expected: 'hypertaks', category: 'exclusion', locale: 'en' },

  // --- True positives near exclusions ---
  { id: 'near-1', request: 'Inspect founder memory records.', expected: 'hypertaks-brain', category: 'near_exclusion', locale: 'en' },
  { id: 'near-2', request: 'Store this approved product decision.', expected: 'hypertaks-brain', category: 'near_exclusion', locale: 'en' },
  { id: 'near-3', request: 'Trace module imports and dependency blast radius.', expected: 'hypertaks-graph', category: 'near_exclusion', locale: 'en' },
  { id: 'near-4', request: 'Check graph freshness against the current commit.', expected: 'hypertaks-graph', category: 'near_exclusion', locale: 'en' },
  { id: 'near-5', request: 'Verify the deployed Hypertaks MCP adapter.', expected: 'hypertaks-verify', category: 'near_exclusion', locale: 'en' },
  { id: 'near-6', request: 'Repair the Hypertaks memory pointer configuration.', expected: 'hypertaks-verify', category: 'near_exclusion', locale: 'en' },
  { id: 'near-7', request: 'Scan-only Hypertaks installation verification.', expected: 'hypertaks-verify', category: 'near_exclusion', locale: 'en' },
  { id: 'near-8', request: 'Verify installation without writing files.', expected: 'hypertaks-verify', category: 'near_exclusion', locale: 'en' },

  // --- Punctuation and casing ---
  { id: 'punct-1', request: 'VERIFY Installation!!!', expected: 'hypertaks-verify', category: 'punctuation_casing', locale: 'en' },
  { id: 'punct-2', request: '  simpan, ambil, memori founder... ', expected: 'hypertaks-brain', category: 'punctuation_casing', locale: 'id' },
  { id: 'punct-3', request: 'Dependency Change Impact - Blast Radius', expected: 'hypertaks-graph', category: 'punctuation_casing', locale: 'en' },
  { id: 'punct-4', request: 'CREATE a Checkpoint + Handoff + Proof-Of-Done', expected: 'hypertaks-continuity', category: 'punctuation_casing', locale: 'en' },
  { id: 'punct-5', request: '*** Verifikasi Konfigurasi Instalasi Hypertaks ***', expected: 'hypertaks-verify', category: 'punctuation_casing', locale: 'id' },

  // --- Mixed-language ---
  { id: 'mix-1', request: 'Please verifikasi konfigurasi instalasi Hypertaks now.', expected: 'hypertaks-verify', category: 'mixed_language' },
  { id: 'mix-2', request: 'Tolong create a founder strategy for business and engineering.', expected: 'hypertaks', category: 'mixed_language' },
  { id: 'mix-3', request: 'Do not save memory. Analisis rencana founder dulu.', expected: 'hypertaks', category: 'mixed_language' },

  // --- Unsupported locale conservative fallback (no explicit skill) ---
  { id: 'unsup-1', request: '请创建一个商业战略计划', expected: 'hypertaks', category: 'unsupported_locale' },
  { id: 'unsup-2', request: 'ストラテジーを作成してください', expected: 'hypertaks', category: 'unsupported_locale' },
];

/** PreferredSkill override cases: [request, preferred, expected] */
const PREFERRED_SKILL_CASES = [
  {
    id: 'pref-1',
    request: 'install setup configuration checksum',
    preferredSkill: 'hypertaks-continuity',
    expected: 'hypertaks-continuity',
    category: 'preferred_override',
  },
  {
    id: 'pref-2',
    request: 'Create a founder strategy covering business and engineering.',
    preferredSkill: 'hypertaks-brain',
    expected: 'hypertaks-brain',
    category: 'preferred_override',
  },
  {
    id: 'pref-3',
    request: 'verifikasi konfigurasi instalasi',
    preferredSkill: 'hypertaks',
    expected: 'hypertaks',
    category: 'preferred_override',
  },
];

/** Invalid preferredSkill must be ignored (fall through to normal routing). */
const INVALID_PREFERRED_CASES = [
  {
    id: 'inv-pref-1',
    request: 'install setup configuration checksum runtime verification',
    preferredSkill: 'hypertaks-sixth',
    expected: 'hypertaks-verify',
    category: 'invalid_preferred',
  },
  {
    id: 'inv-pref-2',
    request: 'Create a founder strategy covering business and engineering.',
    preferredSkill: 'not-a-skill',
    expected: 'hypertaks',
    category: 'invalid_preferred',
  },
];

const DETERMINISM_REPEATS = 5;
const MCP_CONCURRENCY = 25;

const PUBLIC_SKILLS = Object.freeze([
  'hypertaks',
  'hypertaks-verify',
  'hypertaks-brain',
  'hypertaks-graph',
  'hypertaks-continuity',
]);

const MCP_TOOLS = Object.freeze([
  'hypertaks_manifest',
  'hypertaks_get_skill',
  'hypertaks_route',
  'hypertaks_verify_installation',
]);

const SUPPORTED_LOCALES = Object.freeze(['en', 'id']);

/**
 * Run the full unit matrix against a route function.
 * @param {(request: string, preferred?: string) => { skill: string, reason?: string }} routeFn
 */
function runUnitRouteMatrix(routeFn) {
  /** @type {{ id: string, request: string, expected: string, actual: string, category: string, pass: boolean }[]} */
  const results = [];
  const distribution = Object.create(null);

  for (const item of ROUTE_MATRIX) {
    const actual = routeFn(item.request).skill;
    distribution[actual] = (distribution[actual] || 0) + 1;
    results.push({
      id: item.id,
      request: item.request,
      expected: item.expected,
      actual,
      category: item.category,
      pass: actual === item.expected,
    });
  }

  for (const item of PREFERRED_SKILL_CASES) {
    const actual = routeFn(item.request, item.preferredSkill).skill;
    distribution[actual] = (distribution[actual] || 0) + 1;
    results.push({
      id: item.id,
      request: item.request,
      expected: item.expected,
      actual,
      category: item.category,
      pass: actual === item.expected,
    });
  }

  for (const item of INVALID_PREFERRED_CASES) {
    const actual = routeFn(item.request, item.preferredSkill).skill;
    distribution[actual] = (distribution[actual] || 0) + 1;
    results.push({
      id: item.id,
      request: item.request,
      expected: item.expected,
      actual,
      category: item.category,
      pass: actual === item.expected,
    });
  }

  const failures = results.filter((row) => !row.pass);
  return {
    total: results.length,
    passCount: results.length - failures.length,
    failCount: failures.length,
    failures,
    distribution,
    results,
  };
}

/**
 * Determinism: repeat each fixed case N times; skill/intent/digest/suppressed must match.
 * @param {(request: string) => any} diagnoseFn
 */
function runDeterminismSuite(diagnoseFn, repeats = DETERMINISM_REPEATS) {
  const sample = ROUTE_MATRIX.filter((_, index) => index % 2 === 0).concat(
    ROUTE_MATRIX.filter((item) => item.category === 'negation'),
  );
  /** @type {{ id: string, pass: boolean, detail?: string }[]} */
  const rows = [];
  for (const item of sample) {
    const first = diagnoseFn(item.request);
    let pass = true;
    let detail;
    for (let i = 1; i < repeats; i += 1) {
      const next = diagnoseFn(item.request);
      if (
        next.skill !== first.skill ||
        next.primaryIntent !== first.primaryIntent ||
        next.routerRulesDigest !== first.routerRulesDigest ||
        JSON.stringify(next.suppressedSkills) !== JSON.stringify(first.suppressedSkills) ||
        JSON.stringify(next.matchedSignals) !== JSON.stringify(first.matchedSignals)
      ) {
        pass = false;
        detail = `mismatch on repeat ${i + 1}`;
        break;
      }
    }
    rows.push({ id: item.id, pass, detail });
  }
  return {
    total: rows.length,
    repeats,
    passCount: rows.filter((row) => row.pass).length,
    failCount: rows.filter((row) => !row.pass).length,
    failures: rows.filter((row) => !row.pass),
  };
}

/**
 * Required per fully-supported locale: one positive per focused skill, founder,
 * explicit, negation, supporting vs primary, generic tech, exclusion.
 */
function localeCoverageChecklist() {
  const required = [
    'en_focused',
    'en_founder',
    'id_focused',
    'id_founder',
    'explicit_skill',
    'negation',
    'supporting_vs_primary',
    'generic_tech',
    'exclusion',
    'punctuation_casing',
    'mixed_language',
    'unsupported_locale',
  ];
  const present = new Set(ROUTE_MATRIX.map((item) => item.category));
  const missing = required.filter((name) => !present.has(name));
  const enFocused = ROUTE_MATRIX.filter((item) => item.locale === 'en' && item.category === 'en_focused');
  const idFocused = ROUTE_MATRIX.filter((item) => item.locale === 'id' && item.category === 'id_focused');
  return {
    requiredCategories: required,
    missingCategories: missing,
    enFocusedSkills: [...new Set(enFocused.map((item) => item.expected))].sort(),
    idFocusedSkills: [...new Set(idFocused.map((item) => item.expected))].sort(),
    supportedLocales: [...SUPPORTED_LOCALES],
  };
}

module.exports = {
  ROUTE_MATRIX,
  PREFERRED_SKILL_CASES,
  INVALID_PREFERRED_CASES,
  DETERMINISM_REPEATS,
  MCP_CONCURRENCY,
  PUBLIC_SKILLS,
  MCP_TOOLS,
  SUPPORTED_LOCALES,
  runUnitRouteMatrix,
  runDeterminismSuite,
  localeCoverageChecklist,
};
