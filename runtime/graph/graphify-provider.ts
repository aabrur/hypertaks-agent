import { LocalGraph } from "./graph-service";
import { queryGraphifyOrFallback, GraphQueryOptions, GraphQueryResult } from "../founder-brain";

export interface GraphProvider {
  readonly name: string;
  isAvailable(): boolean;
  query(queryStr: string): Promise<GraphQueryResult>;
}

export class GraphifyProviderV2 implements GraphProvider {
  public readonly name = "graphify-v2";

  constructor(
    private readonly repositoryRoot: string,
    private readonly localGraph: LocalGraph,
    private readonly options?: {
      readonly endpoint?: string | null;
      readonly authTokenEnv?: string | null;
      readonly approvalProof?: any;
    },
  ) {}

  public isAvailable(): boolean {
    if (!this.options?.endpoint) return false;
    if (!this.options.endpoint.startsWith("https://")) return false;
    return !!this.options?.approvalProof;
  }

  public async query(queryStr: string): Promise<GraphQueryResult> {
    if (!this.isAvailable()) {
      // Local graph search fallback
      const matches = this.localGraph
        .getNodes()
        .filter((n) => n.label.toLowerCase().includes(queryStr.toLowerCase()));
      return {
        success: true,
        modeUsed: "direct_search",
        data: matches,
        message: `Local graph matched ${matches.length} nodes for '${queryStr}'.`,
      };
    }

    const queryOpts: GraphQueryOptions = {
      mode: "http_mcp",
      operation: "query",
      query: queryStr,
      repositoryRoot: this.repositoryRoot,
      endpoint: this.options?.endpoint ?? null,
      authTokenEnv: this.options?.authTokenEnv ?? null,
      localCommand: null,
      executor: null,
      approvalProof: this.options?.approvalProof ?? null,
    };

    return queryGraphifyOrFallback(queryOpts);
  }
}
