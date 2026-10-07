const test = require("node:test");
const assert = require("node:assert/strict");

const { ProviderRegistry } = require("../.build/runtime/providers/provider-registry.js");
const { AgencyAgentsProvider } = require("../.build/runtime/providers/agency-agents-provider.js");

test("provider-registry: registers and finds workers across providers", async () => {
  const registry = new ProviderRegistry();
  const agency = new AgencyAgentsProvider();
  registry.register(agency);

  const found = await registry.findWorker("backend-architect");
  assert.ok(found);
  assert.equal(found.provider.providerId, "agency-agents");
  assert.equal(found.capability.roleSlug, "backend-architect");

  const notFound = await registry.findWorker("nonexistent-role");
  assert.equal(notFound, null);
});
