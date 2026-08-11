export interface CompilationSource {
  readonly kind: "code" | "document" | "checkpoint" | "memory";
  readonly path: string;
  readonly contentSha256?: string;
}

export interface CompilationChunk {
  readonly source: CompilationSource;
  readonly excerpt: string;
  readonly startOffset: number;
  readonly endOffset: number;
}

export interface RetrievalQuery {
  readonly text: string;
  readonly corpus: "project" | "knowledge" | "memory";
  readonly maxResults: number;
  readonly filters?: Readonly<Record<string, string>>;
}

export interface RetrievalHit {
  readonly source: CompilationSource;
  readonly score: number;
  readonly excerpt: string;
}

export interface RetrievalResult {
  readonly query: string;
  readonly hits: readonly RetrievalHit[];
  readonly total: number;
  readonly route: "direct" | "keyword" | "vector" | "hybrid" | "fallback";
}

export interface ContextCompiler {
  compileSources(sources: readonly CompilationSource[]): Promise<readonly CompilationChunk[]>;
  retrieve(query: RetrievalQuery): Promise<RetrievalResult>;
}
