import { ParsedFileResult, ParsedSymbol, ParsedImport } from "./types";

export function parseFallbackFile(filePath: string, sourceText: string): ParsedFileResult {
  const lines = sourceText.split(/\r?\n/);
  const symbols: ParsedSymbol[] = [];
  const imports: ParsedImport[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNumber = i + 1;
    const trimmed = line.trim();

    // Generic function match (Go: func name, Rust: fn name)
    const funcMatch = trimmed.match(/^(?:pub\s+)?(?:func|fn)\s+([a-zA-Z_]\w*)/);
    if (funcMatch && funcMatch[1]) {
      symbols.push({
        name: funcMatch[1],
        kind: "function",
        line: lineNumber,
        exported: trimmed.startsWith("pub ") || /^[A-Z]/.test(funcMatch[1]),
      });
    }

    // Generic struct / type / class
    const typeMatch = trimmed.match(/^(?:pub\s+)?(?:type|struct|class)\s+([a-zA-Z_]\w*)/);
    if (typeMatch && typeMatch[1]) {
      symbols.push({
        name: typeMatch[1],
        kind: "class",
        line: lineNumber,
        exported: trimmed.startsWith("pub ") || /^[A-Z]/.test(typeMatch[1]),
      });
    }

    // Generic import
    if (trimmed.startsWith("import ") || trimmed.startsWith("use ")) {
      const match = trimmed.match(/^(?:import|use)\s+([^;]+)/);
      if (match && match[1]) {
        imports.push({
          moduleSpecifier: match[1].trim(),
          symbols: [match[1].trim()],
          isDefault: true,
          isNamespace: false,
        });
      }
    }
  }

  return {
    filePath,
    symbols,
    imports,
    exports: [],
    routes: [],
    tables: [],
    networkCalls: [],
  };
}
