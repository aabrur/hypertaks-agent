import {
  ParsedFileResult,
  ParsedImport,
  ParsedExport,
  ParsedSymbol,
  ParsedRoute,
  ParsedNetworkCall,
} from "./types";

export function parsePythonFile(filePath: string, sourceText: string): ParsedFileResult {
  const lines = sourceText.split(/\r?\n/);
  const symbols: ParsedSymbol[] = [];
  const imports: ParsedImport[] = [];
  const exportsList: ParsedExport[] = [];
  const routes: ParsedRoute[] = [];
  const networkCalls: ParsedNetworkCall[] = [];

  let lastDecoratorRoute: { method: ParsedRoute["method"]; path: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNumber = i + 1;
    const trimmed = line.trim();

    // 1. Imports
    if (trimmed.startsWith("import ")) {
      const match = trimmed.match(/^import\s+([\w,.\s]+)/);
      if (match && match[1]) {
        const modules = match[1].split(",").map((s) => s.trim());
        for (const mod of modules) {
          imports.push({
            moduleSpecifier: mod,
            symbols: [mod],
            isDefault: true,
            isNamespace: false,
          });
        }
      }
    } else if (trimmed.startsWith("from ")) {
      const match = trimmed.match(/^from\s+([\w.]+)\s+import\s+([\w*,\s]+)/);
      if (match && match[1] && match[2]) {
        const specifier = match[1];
        const syms = match[2].split(",").map((s) => s.trim());
        imports.push({
          moduleSpecifier: specifier,
          symbols: syms,
          isDefault: false,
          isNamespace: syms.includes("*"),
        });
      }
    }

    // 2. Route decorators (FastAPI/Flask/Django)
    // E.g., @app.get("/items"), @router.post("/users")
    const routeMatch = trimmed.match(
      /@(?:app|router|bp)\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/i,
    );
    if (routeMatch && routeMatch[1] && routeMatch[2]) {
      lastDecoratorRoute = {
        method: routeMatch[1].toUpperCase() as ParsedRoute["method"],
        path: routeMatch[2],
      };
    }

    // 3. Functions
    const funcMatch = trimmed.match(/^(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\(/);
    if (funcMatch && funcMatch[1]) {
      const name = funcMatch[1];
      const exported = !name.startsWith("_");
      symbols.push({
        name,
        kind: "function",
        line: lineNumber,
        exported,
      });
      if (exported) {
        exportsList.push({ name, isDefault: false });
      }

      if (lastDecoratorRoute) {
        routes.push({
          method: lastDecoratorRoute.method,
          path: lastDecoratorRoute.path,
          handlerSymbol: name,
          line: lineNumber,
        });
        lastDecoratorRoute = null;
      }
    }

    // 4. Classes
    const classMatch = trimmed.match(/^class\s+([a-zA-Z_]\w*)\s*(?:\([^)]*\))?:/);
    if (classMatch && classMatch[1]) {
      const name = classMatch[1];
      const exported = !name.startsWith("_");
      symbols.push({
        name,
        kind: "class",
        line: lineNumber,
        exported,
      });
      if (exported) {
        exportsList.push({ name, isDefault: false });
      }
    }

    // 5. Network calls
    if (
      trimmed.includes("requests.get(") ||
      trimmed.includes("requests.post(") ||
      trimmed.includes("httpx.get(") ||
      trimmed.includes("httpx.post(") ||
      trimmed.includes("aiohttp.")
    ) {
      networkCalls.push({
        callee: trimmed.split("(")[0] || "http_client",
        line: lineNumber,
      });
    }
  }

  return {
    filePath,
    symbols,
    imports,
    exports: exportsList,
    routes,
    tables: [],
    networkCalls,
  };
}
