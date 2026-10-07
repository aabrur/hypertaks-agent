export type SymbolKind =
  | "function"
  | "class"
  | "interface"
  | "type"
  | "component"
  | "hook"
  | "variable";

export interface ParsedSymbol {
  readonly name: string;
  readonly kind: SymbolKind;
  readonly line: number;
  readonly exported: boolean;
  readonly docstring?: string | undefined;
}

export interface ParsedImport {
  readonly moduleSpecifier: string;
  readonly symbols: readonly string[];
  readonly isDefault: boolean;
  readonly isNamespace: boolean;
}

export interface ParsedExport {
  readonly name: string;
  readonly isDefault: boolean;
}

export interface ParsedRoute {
  readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "ALL" | "UNKNOWN";
  readonly path: string;
  readonly handlerSymbol: string;
  readonly line: number;
}

export interface ParsedForeignKey {
  readonly column: string;
  readonly targetTable: string;
  readonly targetColumn: string;
}

export interface ParsedTable {
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly foreignKeys: readonly ParsedForeignKey[];
  readonly line: number;
}

export interface ParsedNetworkCall {
  readonly callee: string;
  readonly targetUrlOrEndpoint?: string | undefined;
  readonly line: number;
}

export interface ParsedFileResult {
  readonly filePath: string;
  readonly symbols: readonly ParsedSymbol[];
  readonly imports: readonly ParsedImport[];
  readonly exports: readonly ParsedExport[];
  readonly routes: readonly ParsedRoute[];
  readonly tables: readonly ParsedTable[];
  readonly networkCalls: readonly ParsedNetworkCall[];
}
