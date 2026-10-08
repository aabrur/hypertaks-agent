import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export type NodeType =
  | "repository"
  | "workspace"
  | "package"
  | "directory"
  | "module"
  | "file"
  | "symbol"
  | "function"
  | "method"
  | "class"
  | "interface"
  | "type"
  | "component"
  | "hook"
  | "route"
  | "page"
  | "api_endpoint"
  | "middleware"
  | "database"
  | "table"
  | "column"
  | "query"
  | "migration"
  | "event"
  | "queue"
  | "job"
  | "environment_variable"
  | "configuration"
  | "external_service"
  | "network_endpoint"
  | "document"
  | "image"
  | "asset"
  | "test"
  | "workflow"
  | "agent"
  | "skill"
  | "artifact";

export type EdgeType =
  | "contains"
  | "imports"
  | "exports"
  | "calls"
  | "instantiates"
  | "extends"
  | "implements"
  | "renders"
  | "routes_to"
  | "handles"
  | "reads"
  | "writes"
  | "queries"
  | "mutates"
  | "publishes"
  | "subscribes"
  | "sends_to"
  | "receives_from"
  | "authenticates_with"
  | "uses_env"
  | "configured_by"
  | "depends_on"
  | "tests"
  | "documents"
  | "generates"
  | "generated_from"
  | "references"
  | "owns"
  | "protects"
  | "defines"
  | "deploys_to"
  | "communicates_with";

export interface GraphNode {
  readonly id: string;
  readonly type: NodeType;
  readonly label: string;
  readonly filePath?: string | undefined;
  readonly metadata?: Readonly<Record<string, unknown>> | undefined;
}

export interface GraphEdge {
  readonly source: string;
  readonly target: string;
  readonly type: EdgeType;
  readonly confidence: "STATIC" | "VERIFIED" | "INFERRED";
  readonly sourceFile: string;
}

export interface GraphMeta {
  readonly schema: "hypertaks.graph.v1";
  readonly repo_id: string;
  readonly source_commit: string;
  readonly branch: string;
  readonly working_tree_state: "clean" | "dirty";
  readonly built_at: string;
  readonly parser_version: string;
  readonly node_count: number;
  readonly edge_count: number;
  readonly providers: {
    readonly hypertaks_rts: "active" | "inactive";
    readonly graphify: "active" | "unavailable";
  };
}

export class LocalGraph {
  private readonly nodesMap = new Map<string, GraphNode>();
  private readonly edgesList: GraphEdge[] = [];
  private readonly outgoing = new Map<string, GraphEdge[]>();
  private readonly incoming = new Map<string, GraphEdge[]>();

  public addNode(node: GraphNode): void {
    this.nodesMap.set(node.id, node);
  }

  public addEdge(edge: GraphEdge): void {
    this.edgesList.push(edge);

    if (!this.outgoing.has(edge.source)) this.outgoing.set(edge.source, []);
    this.outgoing.get(edge.source)!.push(edge);

    if (!this.incoming.has(edge.target)) this.incoming.set(edge.target, []);
    this.incoming.get(edge.target)!.push(edge);
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodesMap.get(id);
  }

  public getNodes(): readonly GraphNode[] {
    return Array.from(this.nodesMap.values());
  }

  public getEdges(): readonly GraphEdge[] {
    return this.edgesList;
  }

  public getOutgoingEdges(nodeId: string): readonly GraphEdge[] {
    return this.outgoing.get(nodeId) || [];
  }

  public getIncomingEdges(nodeId: string): readonly GraphEdge[] {
    return this.incoming.get(nodeId) || [];
  }

  public clear(): void {
    this.nodesMap.clear();
    this.edgesList.length = 0;
    this.outgoing.clear();
    this.incoming.clear();
  }
}
