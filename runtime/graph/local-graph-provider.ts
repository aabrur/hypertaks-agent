import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryScanResult } from "../repository-intelligence/scanner";
import { GraphEdge, GraphMeta, GraphNode, LocalGraph, NodeType } from "./graph-service";
import { safeContextGitState, resolveWithinApprovedRoot } from "../founder-brain";

export function buildLocalGraph(canonicalRoot: string, scan: RepositoryScanResult): LocalGraph {
  const graph = new LocalGraph();

  // 1. File nodes
  for (const file of scan.files) {
    graph.addNode({
      id: `file:${file.relativePath}`,
      type: "file",
      label: path.basename(file.relativePath),
      filePath: file.relativePath,
      metadata: {
        category: file.category,
        sizeBytes: file.sizeBytes,
        sha256: file.sha256,
      },
    });
  }

  // 2. Symbol nodes and containment edges
  for (const pf of scan.parsedFiles) {
    const fileNodeId = `file:${pf.filePath}`;

    for (const sym of pf.symbols) {
      const symNodeId = `symbol:${pf.filePath}:${sym.name}`;
      let nodeType: NodeType = "symbol";
      if (sym.kind === "function") nodeType = "function";
      else if (sym.kind === "class") nodeType = "class";
      else if (sym.kind === "interface") nodeType = "interface";
      else if (sym.kind === "type") nodeType = "type";
      else if (sym.kind === "component") nodeType = "component";
      else if (sym.kind === "hook") nodeType = "hook";

      graph.addNode({
        id: symNodeId,
        type: nodeType,
        label: sym.name,
        filePath: pf.filePath,
        metadata: {
          line: sym.line,
          exported: sym.exported,
        },
      });

      graph.addEdge({
        source: fileNodeId,
        target: symNodeId,
        type: "contains",
        confidence: "STATIC",
        sourceFile: pf.filePath,
      });
    }

    // 3. Routes
    for (const route of pf.routes) {
      const routeNodeId = `route:${route.method}:${route.path}`;
      graph.addNode({
        id: routeNodeId,
        type: "route",
        label: `${route.method} ${route.path}`,
        filePath: pf.filePath,
        metadata: {
          method: route.method,
          path: route.path,
          line: route.line,
        },
      });

      graph.addEdge({
        source: fileNodeId,
        target: routeNodeId,
        type: "handles",
        confidence: "STATIC",
        sourceFile: pf.filePath,
      });
    }

    // 4. Tables
    for (const table of pf.tables) {
      const tableNodeId = `table:${table.tableName}`;
      graph.addNode({
        id: tableNodeId,
        type: "table",
        label: table.tableName,
        filePath: pf.filePath,
        metadata: {
          columns: table.columns,
          line: table.line,
        },
      });

      graph.addEdge({
        source: fileNodeId,
        target: tableNodeId,
        type: "defines",
        confidence: "STATIC",
        sourceFile: pf.filePath,
      });
    }

    // 5. Imports / Dependency edges
    for (const imp of pf.imports) {
      if (imp.moduleSpecifier.startsWith(".")) {
        // Resolve relative import
        const dir = path.dirname(pf.filePath);
        const resolvedBase = path.posix.normalize(path.posix.join(dir, imp.moduleSpecifier));
        // Try exact, .ts, .js, /index.ts, etc.
        const candidateFiles = [
          resolvedBase,
          `${resolvedBase}.ts`,
          `${resolvedBase}.tsx`,
          `${resolvedBase}.js`,
          `${resolvedBase}.jsx`,
          `${resolvedBase}/index.ts`,
          `${resolvedBase}/index.js`,
        ];

        for (const candidate of candidateFiles) {
          const targetNodeId = `file:${candidate}`;
          if (graph.getNode(targetNodeId)) {
            graph.addEdge({
              source: fileNodeId,
              target: targetNodeId,
              type: "imports",
              confidence: "STATIC",
              sourceFile: pf.filePath,
            });
            break;
          }
        }
      }
    }
  }

  return graph;
}

export function saveLocalGraph(
  canonicalRoot: string,
  repoId: string,
  graph: LocalGraph,
): readonly string[] {
  const graphDir = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph"), true);
  resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "indexes"), true);

  const written: string[] = [];
  const nodes = graph.getNodes();
  const edges = graph.getEdges();

  // 1. nodes.jsonl
  const nodesPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "nodes.jsonl"), false);
  const nodesLines = nodes.map((n) => JSON.stringify(n)).join("\n");
  fs.writeFileSync(nodesPath, nodesLines ? nodesLines + "\n" : "", "utf8");
  written.push(".hypertaks/graph/nodes.jsonl");

  // 2. edges.jsonl
  const edgesPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "edges.jsonl"), false);
  const edgesLines = edges.map((e) => JSON.stringify(e)).join("\n");
  fs.writeFileSync(edgesPath, edgesLines ? edgesLines + "\n" : "", "utf8");
  written.push(".hypertaks/graph/edges.jsonl");

  // 3. symbols.jsonl
  const symbolNodes = nodes.filter((n) =>
    ["symbol", "function", "class", "interface", "type", "component", "hook"].includes(n.type),
  );
  const symbolsLines = symbolNodes.map((s) => JSON.stringify(s)).join("\n");
  const symbolsPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "symbols.jsonl"), false);
  fs.writeFileSync(
    symbolsPath,
    symbolsLines ? symbolsLines + "\n" : "",
    "utf8",
  );
  written.push(".hypertaks/graph/symbols.jsonl");

  // 4. graph.json (Materialized compatibility graph)
  const graphJsonPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "graph.json"), false);
  const materialized = {
    schema: "hypertaks.graph.snapshot.v1",
    repo_id: repoId,
    generated_at: new Date().toISOString(),
    nodes,
    edges,
  };
  fs.writeFileSync(
    graphJsonPath,
    JSON.stringify(materialized, null, 2) + "\n",
    "utf8",
  );
  written.push(".hypertaks/graph/graph.json");

  // 5. graph.meta.json
  const metaPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "graph.meta.json"), false);
  const gitState = safeContextGitState(canonicalRoot);
  const meta: GraphMeta = {
    schema: "hypertaks.graph.v1",
    repo_id: repoId,
    source_commit: gitState.commit,
    branch: gitState.branch,
    working_tree_state: gitState.clean ? "clean" : "dirty",
    built_at: new Date().toISOString(),
    parser_version: "rts-v2",
    node_count: nodes.length,
    edge_count: edges.length,
    providers: {
      hypertaks_rts: "active",
      graphify: "unavailable",
    },
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");
  written.push(".hypertaks/graph/graph.meta.json");

  // 6. GRAPH_REPORT.md
  const reportPath = resolveWithinApprovedRoot(canonicalRoot, path.join(".hypertaks", "graph", "GRAPH_REPORT.md"), false);
  let report = `# Intelligence Graph Summary Report

**Repository ID:** \`${repoId}\`  
**Generated At:** ${meta.built_at}  
**Source Commit:** \`${meta.source_commit}\`  
**Branch:** \`${meta.branch}\` (${meta.working_tree_state})  

## Topology Metrics
- Total Nodes: ${nodes.length}
- Total Edges: ${edges.length}
- Files Indexed: ${nodes.filter((n) => n.type === "file").length}
- Symbols Indexed: ${symbolNodes.length}
- Routes Indexed: ${nodes.filter((n) => n.type === "route").length}
- Tables Indexed: ${nodes.filter((n) => n.type === "table").length}

## Provider Status
- Hypertaks RTS: ACTIVE
- Graphify Engine: UNAVAILABLE (Local fallback in use)
`;
  fs.writeFileSync(reportPath, report, "utf8");
  written.push(".hypertaks/graph/GRAPH_REPORT.md");

  return written;
}
