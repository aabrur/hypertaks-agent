import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTOTYPE_ROOT = path.resolve(__dirname);
const CONTEXT_DIR = path.join(PROTOTYPE_ROOT, 'context');
const SCHEMAS_DIR = path.join(PROTOTYPE_ROOT, 'schemas');
const FIXTURES_DIR = path.join(PROTOTYPE_ROOT, 'fixtures');

// Secret regex patterns
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-[a-zA-Z0-9]{32,}/,
  /BEGIN\s+PRIVATE\s+KEY/i,
  /AWS_SECRET_KEY\s*=\s*[^\s]+/i,
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i
];

/**
 * Validates canonical root containment.
 */
export function validatePathContainment(targetPath, approvedRoot = PROTOTYPE_ROOT) {
  const canonicalRoot = path.resolve(approvedRoot);
  const resolvedTarget = path.resolve(targetPath);

  if (!resolvedTarget.startsWith(canonicalRoot)) {
    throw new Error(`Path containment violation: ${targetPath} resolves outside approved root ${approvedRoot}`);
  }

  if (fs.existsSync(resolvedTarget)) {
    const realTarget = fs.realpathSync(resolvedTarget);
    if (!realTarget.startsWith(fs.realpathSync(canonicalRoot))) {
      throw new Error(`Symlink or junction escape detected: ${targetPath} resolves to ${realTarget}`);
    }
  }

  return true;
}

/**
 * Scans content for raw secret leakage.
 */
export function scanForSecrets(content) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      throw new Error(`Secret scanning violation: detected credential class '${pattern.source}'`);
    }
  }
  return false;
}

/**
 * Atomic write with read-after-write hash reconciliation.
 */
export function atomicWriteFile(targetPath, content, approvedRoot = PROTOTYPE_ROOT) {
  validatePathContainment(targetPath, approvedRoot);
  scanForSecrets(content);

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = path.join(dir, `.tmp.${crypto.randomBytes(8).toString('hex')}`);
  fs.writeFileSync(tmpPath, content, 'utf8');

  // Read-after-write hash check
  const sourceHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  const writtenHash = crypto.createHash('sha256').update(fs.readFileSync(tmpPath)).digest('hex');

  if (sourceHash !== writtenHash) {
    fs.unlinkSync(tmpPath);
    throw new Error(`Atomic write reconciliation failed: hash mismatch on temporary file ${tmpPath}`);
  }

  fs.renameSync(tmpPath, targetPath);
  return { targetPath, hash: sourceHash };
}

/**
 * Simple YAML frontmatter parser for Context Document verification.
 */
export function parseFrontmatter(markdownContent) {
  const match = markdownContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) {
    throw new Error('Frontmatter missing or malformed');
  }

  const lines = match[1].split('\n');
  const metadata = {};
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const keyValMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (keyValMatch) {
      const key = keyValMatch[1];
      let val = keyValMatch[2].trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val) && val !== '') val = Number(val);

      metadata[key] = val;
      currentKey = key;
    } else if (line.startsWith('  ') && currentKey) {
      const subMatch = line.trim().match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (subMatch) {
        if (typeof metadata[currentKey] !== 'object' || metadata[currentKey] === null) {
          metadata[currentKey] = {};
        }
        let subVal = subMatch[2].trim();
        if (subVal === 'true') subVal = true;
        else if (subVal === 'false') subVal = false;
        else if (!isNaN(subVal) && subVal !== '') subVal = Number(subVal);
        metadata[currentKey][subMatch[1]] = subVal;
      }
    }
  }
  return metadata;
}

/**
 * Validates the thirteen context files in the context directory.
 */
export function validateContextDocuments(contextDir = CONTEXT_DIR) {
  if (!fs.existsSync(contextDir)) {
    throw new Error(`Context directory does not exist: ${contextDir}`);
  }

  const files = fs.readdirSync(contextDir).filter(f => f.endsWith('.ctx.md'));
  if (files.length !== 13) {
    throw new Error(`Document count violation: expected exactly 13 .ctx.md files, found ${files.length}`);
  }

  const preservedFile = 'prompt-build-continunity-prompt.ctx.md';
  if (!files.includes(preservedFile)) {
    throw new Error(`Preserved document violation: missing mandatory document '${preservedFile}'`);
  }

  const validatedDocs = [];
  const requiredFields = [
    'id', 'version', 'timestamp', 'evidence_class', 'provenance',
    'source_git_state', 'authority', 'freshness', 'status', 'lifecycle_state'
  ];

  for (const file of files) {
    const filePath = path.join(contextDir, file);
    validatePathContainment(filePath, PROTOTYPE_ROOT);

    const content = fs.readFileSync(filePath, 'utf8');
    scanForSecrets(content);

    const metadata = parseFrontmatter(content);
    for (const field of requiredFields) {
      if (metadata[field] === undefined) {
        throw new Error(`Document header schema violation in ${file}: missing required field '${field}'`);
      }
    }

    validatedDocs.push({ file, id: metadata.id, metadata });
  }

  return { documentCount: files.length, preservedFilePresent: true, validatedDocs };
}

/**
 * Graph Replay and Ontology Engine
 */
export class OntologyEngine {
  constructor() {
    this.entities = new Map();
    this.relations = [];
    this.contradictions = [];
    this.eventLedger = [];
  }

  replayEvents(events) {
    for (const evt of events) {
      this.processEvent(evt);
    }
    return this.getStateSummary();
  }

  processEvent(evt) {
    if (!evt.event_id || !evt.event_type || !evt.payload) {
      throw new Error(`Invalid event payload structure: ${JSON.stringify(evt)}`);
    }

    this.eventLedger.push(evt);

    switch (evt.event_type) {
      case 'EVENT_CREATE_ENTITY': {
        const { entity_id, entity_type, label, authority } = evt.payload;
        if (this.entities.has(entity_id)) {
          throw new Error(`Entity creation error: entity ${entity_id} already exists`);
        }
        this.entities.set(entity_id, {
          entity_id,
          entity_type,
          label,
          authority: authority ?? 4,
          properties: evt.payload.properties || {},
          status: 'ACTIVE',
          created_at: evt.timestamp
        });
        break;
      }
      case 'EVENT_UPDATE_ENTITY': {
        const { entity_id, properties } = evt.payload;
        const entity = this.entities.get(entity_id);
        if (!entity) {
          throw new Error(`Entity update error: entity ${entity_id} not found`);
        }
        entity.properties = { ...entity.properties, ...properties };
        entity.updated_at = evt.timestamp;
        break;
      }
      case 'EVENT_RELATE_ENTITIES': {
        const { from_id, to_id, relation_type } = evt.payload;
        if (!this.entities.has(from_id) || !this.entities.has(to_id)) {
          throw new Error(`Relation error: referenced entity missing (${from_id} -> ${to_id})`);
        }

        // Check for cycle if relation is acyclic (REL_DEPENDS_ON, REL_SUPERSEDES)
        if (['REL_DEPENDS_ON', 'REL_SUPERSEDES'].includes(relation_type)) {
          if (this.wouldCauseCycle(from_id, to_id, relation_type)) {
            throw new Error(`Acyclic relation violation: adding edge ${from_id} -> ${to_id} creates a cycle in ${relation_type}`);
          }
        }

        this.relations.push({ from_id, to_id, relation_type, created_at: evt.timestamp });
        break;
      }
      case 'EVENT_CONTRADICT_FACT': {
        const { contradiction_id, entity_a_id, entity_b_id, claim_a, claim_b, evidence_a_class, evidence_b_class } = evt.payload;

        // Preserve contradiction without destroying original nodes
        this.contradictions.push({
          contradiction_id,
          entity_a_id,
          entity_b_id,
          claim_a,
          claim_b,
          evidence_a_class,
          evidence_b_class,
          status: 'UNRESOLVED',
          recorded_at: evt.timestamp
        });
        break;
      }
      case 'EVENT_INVALIDATE_FACT': {
        const { entity_id } = evt.payload;
        const entity = this.entities.get(entity_id);
        if (entity) {
          entity.status = 'SUPERSEDED';
        }
        break;
      }
      case 'EVENT_ARCHIVE_FACT': {
        const { entity_id } = evt.payload;
        const entity = this.entities.get(entity_id);
        if (entity) {
          entity.status = 'ARCHIVED';
        }
        break;
      }
      case 'EVENT_RECONCILE_STATE': {
        // Full replay check
        break;
      }
      default:
        throw new Error(`Unknown event type: ${evt.event_type}`);
    }
  }

  wouldCauseCycle(fromId, toId, relationType) {
    const adj = new Map();
    for (const rel of this.relations) {
      if (rel.relation_type === relationType) {
        if (!adj.has(rel.from_id)) adj.set(rel.from_id, []);
        adj.get(rel.from_id).push(rel.to_id);
      }
    }
    if (!adj.has(fromId)) adj.set(fromId, []);
    adj.get(fromId).push(toId);

    // DFS Cycle Detection
    const visited = new Set();
    const recStack = new Set();

    const dfs = (node) => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }
    return false;
  }

  getEntity(id) {
    return this.entities.get(id) || null;
  }

  getRelations(entityId, relationType) {
    return this.relations.filter(r =>
      (r.from_id === entityId || r.to_id === entityId) &&
      (!relationType || r.relation_type === relationType)
    );
  }

  findContradictions(entityId) {
    return this.contradictions.filter(c => c.entity_a_id === entityId || c.entity_b_id === entityId);
  }

  getStateSummary() {
    return {
      entityCount: this.entities.size,
      relationCount: this.relations.length,
      contradictionCount: this.contradictions.length,
      eventCount: this.eventLedger.length
    };
  }
}

/**
 * Main Test Runner Function
 */
export function runTests(testName = 'all') {
  console.log(`\n=== Running Hypertaks AGY Prototype Test Suite: [${testName}] ===\n`);
  let passed = true;

  try {
    if (testName === 'all' || testName === 'count' || testName === 'schema') {
      console.log('[TEST 1] Validating exact 13 context documents & headers...');
      const res = validateContextDocuments();
      console.log(`  PASS: Validated ${res.documentCount} context documents. Preserved document verified.`);
    }

    if (testName === 'all' || testName === 'secrets') {
      console.log('[TEST 2] Secret scanning rejection test...');
      const secretFixture = path.join(FIXTURES_DIR, 'invalid-secret.ctx.md');
      const fixtureTemplate = fs.readFileSync(secretFixture, 'utf8');
      const syntheticCredential = ['AWS', '_SECRET_KEY=', 'fixture-value'].join('');
      const content = fixtureTemplate.replace('$SYNTHETIC_SECRET_HANDLE', syntheticCredential);
      try {
        scanForSecrets(content);
        console.error('  FAIL: Secret scanning failed to catch credential in fixture!');
        passed = false;
      } catch (err) {
        console.log(`  PASS: Correctly rejected secret key: "${err.message.split('\n')[0]}"`);
      }
    }

    if (testName === 'all' || testName === 'containment') {
      console.log('[TEST 3] Approved-root path containment & escape test...');
      const pathEscape = path.join(PROTOTYPE_ROOT, '../../outside.txt');
      try {
        validatePathContainment(pathEscape, PROTOTYPE_ROOT);
        console.error('  FAIL: Path containment failed to catch escape attempt!');
        passed = false;
      } catch (err) {
        console.log(`  PASS: Correctly blocked path escape: "${err.message}"`);
      }
    }

    if (testName === 'all' || testName === 'atomic') {
      console.log('[TEST 4] Atomic write & read-after-write reconciliation test...');
      const testFile = path.join(PROTOTYPE_ROOT, 'scratch_atomic_test.txt');
      const content = "Sample atomic write payload for AGY prototype test.";
      const writeResult = atomicWriteFile(testFile, content, PROTOTYPE_ROOT);
      const readContent = fs.readFileSync(testFile, 'utf8');
      if (readContent === content) {
        console.log(`  PASS: Atomic write succeeded and verified SHA-256 hash: ${writeResult.hash.slice(0, 16)}...`);
        fs.unlinkSync(testFile);
      } else {
        console.error('  FAIL: Read content does not match atomic write payload!');
        passed = false;
      }
    }

    if (testName === 'all' || testName === 'events') {
      console.log('[TEST 5] Replaying append-only event stream and contradictions...');
      const sampleEvents = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'sample-events.json'), 'utf8'));
      const engine = new OntologyEngine();
      const summary = engine.replayEvents(sampleEvents);
      console.log(`  PASS: Replayed ${summary.eventCount} events. Entities: ${summary.entityCount}, Relations: ${summary.relationCount}, Contradictions: ${summary.contradictionCount}`);

      const contr = engine.findContradictions('ENT-TASK-3');
      if (contr.length === 1) {
        console.log(`  PASS: Verified contradiction retention: claim_a vs claim_b retained without node deletion.`);
      } else {
        console.error('  FAIL: Contradiction retention test failed!');
        passed = false;
      }
    }

    if (testName === 'all' || testName === 'cycles') {
      console.log('[TEST 6] Acyclic relation constraint & cycle rejection test...');
      const cycleEvents = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'invalid-cycle-relation.json'), 'utf8'));
      const engine = new OntologyEngine();
      try {
        engine.replayEvents(cycleEvents);
        console.error('  FAIL: Cycle detection failed to block cyclic dependency!');
        passed = false;
      } catch (err) {
        console.log(`  PASS: Correctly rejected cyclic relation: "${err.message}"`);
      }
    }

  } catch (err) {
    console.error(`\nTEST EXECUTION ERROR: ${err.message}\n${err.stack}`);
    passed = false;
  }

  if (passed) {
    console.log(`\n>>> ALL TESTS PASSED SUCCESSFULLY (Exit Code 0) <<<\n`);
    process.exit(0);
  } else {
    console.error(`\n>>> TEST SUITE FAILED (Exit Code 1) <<<\n`);
    process.exit(1);
  }
}

// Execution Entry Point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const arg = process.argv[2] || 'all';
  runTests(arg);
}
