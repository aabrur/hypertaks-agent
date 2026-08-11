#!/usr/bin/env node
/**
 * Dependency-free validator for Ticket #2 evidence pack fixture.
 * Validates structure against evidence-pack.schema.json without AJV.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "evidence-pack.schema.json");
const fixturePath = join(__dirname, "evidence-pack.fixture.json");

function fail(message) {
  console.error(`INVALID: ${message}`);
  process.exit(1);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertEnum(value, allowed, path) {
  if (!allowed.includes(value)) {
    fail(`${path} must be one of ${allowed.join("|")}, got ${JSON.stringify(value)}`);
  }
}

function assertString(value, path, { minLength = 0, allowNull = false } = {}) {
  if (value === null && allowNull) return;
  if (typeof value !== "string") fail(`${path} must be string`);
  if (value.length < minLength) fail(`${path} minLength ${minLength}`);
}

function assertInteger(value, path, { minimum = null, allowNull = false } = {}) {
  if (value === null && allowNull) return;
  if (!Number.isInteger(value)) fail(`${path} must be integer`);
  if (minimum !== null && value < minimum) fail(`${path} must be >= ${minimum}`);
}

function main() {
  let schema;
  let fixture;
  try {
    schema = JSON.parse(readFileSync(schemaPath, "utf8"));
    fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  } catch (error) {
    fail(`JSON parse error: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isObject(fixture)) fail("fixture root must be object");
  if (fixture.schema_version !== schema.properties.schema_version.const) {
    fail(`schema_version must be ${schema.properties.schema_version.const}`);
  }

  for (const key of schema.required) {
    if (!(key in fixture)) fail(`missing required field ${key}`);
  }

  for (const key of Object.keys(fixture)) {
    if (!(key in schema.properties)) fail(`unexpected field ${key}`);
  }

  assertString(fixture.query_id, "query_id", { minLength: 1 });
  assertEnum(fixture.retrieval_need, schema.properties.retrieval_need.enum, "retrieval_need");
  assertEnum(fixture.retrieval_route, schema.properties.retrieval_route.enum, "retrieval_route");
  assertEnum(fixture.fusion, schema.properties.fusion.enum, "fusion");
  assertEnum(fixture.evaluation_status, schema.properties.evaluation_status.enum, "evaluation_status");

  if (fixture.reranker !== null && typeof fixture.reranker !== "string") {
    fail("reranker must be string or null");
  }

  if (!isObject(fixture.corpus_scope)) fail("corpus_scope must be object");
  for (const key of ["collections", "filters", "freshness_window", "trust_boundary"]) {
    if (!(key in fixture.corpus_scope)) fail(`corpus_scope missing ${key}`);
  }
  if (!Array.isArray(fixture.corpus_scope.collections)) fail("corpus_scope.collections must be array");
  if (!Array.isArray(fixture.corpus_scope.filters)) fail("corpus_scope.filters must be array");
  assertString(fixture.corpus_scope.trust_boundary, "corpus_scope.trust_boundary", { minLength: 1 });

  if (!Array.isArray(fixture.candidates)) fail("candidates must be array");
  for (const [i, c] of fixture.candidates.entries()) {
    if (!isObject(c)) fail(`candidates[${i}] must be object`);
    assertString(c.source_id, `candidates[${i}].source_id`);
    assertInteger(c.rank, `candidates[${i}].rank`, { minimum: 1 });
  }

  if (!Array.isArray(fixture.selected_evidence)) fail("selected_evidence must be array");
  const authority = schema.properties.selected_evidence.items.properties.authority_rank.enum;
  const freshnessStates = schema.properties.selected_evidence.items.properties.freshness.properties.state.enum;
  for (const [i, e] of fixture.selected_evidence.entries()) {
    if (!isObject(e)) fail(`selected_evidence[${i}] must be object`);
    assertString(e.source_id, `selected_evidence[${i}].source_id`);
    assertString(e.why, `selected_evidence[${i}].why`, { minLength: 1 });
    assertEnum(e.authority_rank, authority, `selected_evidence[${i}].authority_rank`);
    if (!isObject(e.provenance)) fail(`selected_evidence[${i}].provenance must be object`);
    assertString(e.provenance.source_id, `selected_evidence[${i}].provenance.source_id`);
    assertString(e.provenance.locator, `selected_evidence[${i}].provenance.locator`);
    assertString(e.provenance.retrieved_at, `selected_evidence[${i}].provenance.retrieved_at`);
    if (!isObject(e.freshness)) fail(`selected_evidence[${i}].freshness must be object`);
    assertEnum(e.freshness.state, freshnessStates, `selected_evidence[${i}].freshness.state`);
  }

  if (!Array.isArray(fixture.limitations)) fail("limitations must be array");
  assertString(fixture.retrieval_fallback, "retrieval_fallback", { minLength: 1 });

  if (fixture.retrieval_metrics !== "UNVERIFIED" && !isObject(fixture.retrieval_metrics)) {
    fail("retrieval_metrics must be UNVERIFIED or object");
  }

  if (fixture.zero_context_loss_claim !== "not_claimed") {
    fail("zero_context_loss_claim must be not_claimed");
  }

  if (!isObject(fixture.candidate_requirements)) {
    fail("candidate_requirements must be object when present");
  }
  for (const ticket of ["ticket_5_pi", "ticket_6_kilo", "ticket_7_command_code"]) {
    if (!Array.isArray(fixture.candidate_requirements[ticket])) {
      fail(`candidate_requirements.${ticket} must be array`);
    }
    if (fixture.candidate_requirements[ticket].length < 1) {
      fail(`candidate_requirements.${ticket} must be non-empty`);
    }
  }

  // Authority ordering invariant: local standards/repo evidence should outrank pure secondary claims.
  const ranks = fixture.selected_evidence.map((e) => e.authority_rank);
  if (!ranks.includes("workspace_standard") || !ranks.includes("repo_evidence")) {
    fail("fixture must include workspace_standard and repo_evidence selections");
  }

  console.log("VALID");
  console.log(`sources_selected=${fixture.selected_evidence.length}`);
  console.log(`evaluation_status=${fixture.evaluation_status}`);
  console.log(`zero_context_loss_claim=${fixture.zero_context_loss_claim}`);
  process.exit(0);
}

main();
