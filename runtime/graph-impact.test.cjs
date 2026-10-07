const test = require("node:test");
const assert = require("node:assert/strict");

const { LocalGraph } = require("../.build/runtime/graph/graph-service.js");
const { analyzeImpact } = require("../.build/runtime/graph/impact-analyzer.js");

test("graph-impact: analyzes direct and transitive reachability blast radius", () => {
  const graph = new LocalGraph();

  // Nodes: A (core lib) -> B (service) -> C (controller) -> Route /api/test
  graph.addNode({ id: "file:src/core.ts", type: "file", label: "core.ts" });
  graph.addNode({ id: "file:src/service.ts", type: "file", label: "service.ts" });
  graph.addNode({ id: "file:src/controller.ts", type: "file", label: "controller.ts" });
  graph.addNode({ id: "route:GET:/api/test", type: "route", label: "GET /api/test" });

  // Dependencies: service imports core, controller imports service, route handled by controller
  graph.addEdge({
    source: "file:src/service.ts",
    target: "file:src/core.ts",
    type: "imports",
    confidence: "STATIC",
    sourceFile: "src/service.ts",
  });
  graph.addEdge({
    source: "file:src/controller.ts",
    target: "file:src/service.ts",
    type: "imports",
    confidence: "STATIC",
    sourceFile: "src/controller.ts",
  });
  graph.addEdge({
    source: "route:GET:/api/test",
    target: "file:src/controller.ts",
    type: "routes_to",
    confidence: "STATIC",
    sourceFile: "src/controller.ts",
  });

  const impact = analyzeImpact("file:src/core.ts", graph);

  assert.equal(impact.targetNodeId, "file:src/core.ts");
  assert.ok(impact.directDependents.includes("file:src/service.ts"));
  assert.ok(impact.transitiveDependents.includes("file:src/controller.ts"));
  assert.ok(impact.affectedRoutes.includes("route:GET:/api/test"));
  assert.equal(impact.blastRadiusCount, 3);
});
