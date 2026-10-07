import * as ts from "typescript";
import {
  ParsedFileResult,
  ParsedImport,
  ParsedExport,
  ParsedSymbol,
  ParsedRoute,
  ParsedNetworkCall,
  SymbolKind,
} from "./types";

export function parseTypeScriptFile(filePath: string, sourceText: string): ParsedFileResult {
  const isJsx = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const symbols: ParsedSymbol[] = [];
  const imports: ParsedImport[] = [];
  const exportsList: ParsedExport[] = [];
  const routes: ParsedRoute[] = [];
  const networkCalls: ParsedNetworkCall[] = [];

  function getLine(pos: number): number {
    return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  }

  function isExported(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }

  function visit(node: ts.Node): void {
    // 1. Imports
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, "");
      const namedSymbols: string[] = [];
      let isDefault = false;
      let isNamespace = false;

      const importClause = node.importClause;
      if (importClause) {
        if (importClause.name) {
          isDefault = true;
          namedSymbols.push(importClause.name.text);
        }
        if (importClause.namedBindings) {
          if (ts.isNamedImports(importClause.namedBindings)) {
            for (const elem of importClause.namedBindings.elements) {
              namedSymbols.push(elem.name.text);
            }
          } else if (ts.isNamespaceImport(importClause.namedBindings)) {
            isNamespace = true;
            namedSymbols.push(importClause.namedBindings.name.text);
          }
        }
      }

      imports.push({
        moduleSpecifier,
        symbols: namedSymbols,
        isDefault,
        isNamespace,
      });
    }

    // 2. Export Declarations
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const elem of node.exportClause.elements) {
          exportsList.push({
            name: elem.name.text,
            isDefault: false,
          });
        }
      }
    }

    if (ts.isExportAssignment(node)) {
      exportsList.push({
        name: node.expression.getText(sourceFile),
        isDefault: !node.isExportEquals,
      });
    }

    // 3. Functions
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const exported = isExported(node);
      let kind: SymbolKind = "function";
      if (/^use[A-Z]/.test(name)) kind = "hook";
      else if (/^[A-Z]/.test(name)) kind = "component";

      symbols.push({
        name,
        kind,
        line: getLine(node.getStart(sourceFile)),
        exported,
      });

      if (exported) {
        exportsList.push({ name, isDefault: false });
        // Next.js Route Handlers check (GET, POST, etc.)
        if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(name)) {
          routes.push({
            method: name as ParsedRoute["method"],
            path: filePath,
            handlerSymbol: name,
            line: getLine(node.getStart(sourceFile)),
          });
        }
      }
    }

    // 4. Variables (functions / components / hooks assigned to const)
    if (ts.isVariableStatement(node)) {
      const exported = isExported(node);
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const name = decl.name.text;
          let kind: SymbolKind = "variable";

          if (
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
          ) {
            kind = "function";
            if (/^use[A-Z]/.test(name)) kind = "hook";
            else if (/^[A-Z]/.test(name)) kind = "component";
          }

          symbols.push({
            name,
            kind,
            line: getLine(decl.getStart(sourceFile)),
            exported,
          });

          if (exported) {
            exportsList.push({ name, isDefault: false });
            if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(name)) {
              routes.push({
                method: name as ParsedRoute["method"],
                path: filePath,
                handlerSymbol: name,
                line: getLine(decl.getStart(sourceFile)),
              });
            }
          }
        }
      }
    }

    // 5. Classes
    if (ts.isClassDeclaration(node) && node.name) {
      const name = node.name.text;
      const exported = isExported(node);
      symbols.push({
        name,
        kind: "class",
        line: getLine(node.getStart(sourceFile)),
        exported,
      });
      if (exported) exportsList.push({ name, isDefault: false });
    }

    // 6. Interfaces
    if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      const exported = isExported(node);
      symbols.push({
        name,
        kind: "interface",
        line: getLine(node.getStart(sourceFile)),
        exported,
      });
      if (exported) exportsList.push({ name, isDefault: false });
    }

    // 7. Types
    if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      const exported = isExported(node);
      symbols.push({
        name,
        kind: "type",
        line: getLine(node.getStart(sourceFile)),
        exported,
      });
      if (exported) exportsList.push({ name, isDefault: false });
    }

    // 8. Express-style routes or calls
    if (ts.isCallExpression(node)) {
      const callText = node.expression.getText(sourceFile);
      if (
        callText.endsWith(".get") ||
        callText.endsWith(".post") ||
        callText.endsWith(".put") ||
        callText.endsWith(".delete") ||
        callText.endsWith(".patch")
      ) {
        const methodMatch = callText.match(/\.(get|post|put|delete|patch)$/i);
        if (methodMatch && node.arguments.length > 0) {
          const firstArg = node.arguments[0];
          if (firstArg && ts.isStringLiteral(firstArg)) {
            routes.push({
              method: methodMatch[1]!.toUpperCase() as ParsedRoute["method"],
              path: firstArg.text,
              handlerSymbol: callText,
              line: getLine(node.getStart(sourceFile)),
            });
          }
        }
      }

      // Network calls
      if (callText === "fetch" || callText.startsWith("axios.")) {
        let targetUrl: string | undefined;
        const firstArg = node.arguments[0];
        if (firstArg && ts.isStringLiteral(firstArg)) {
          targetUrl = firstArg.text;
        }
        networkCalls.push({
          callee: callText,
          targetUrlOrEndpoint: targetUrl,
          line: getLine(node.getStart(sourceFile)),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

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
