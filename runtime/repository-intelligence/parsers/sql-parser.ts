import { ParsedFileResult, ParsedTable, ParsedForeignKey } from "./types";

export function parseSqlFile(filePath: string, sourceText: string): ParsedFileResult {
  const lines = sourceText.split(/\r?\n/);
  const tables: ParsedTable[] = [];

  let currentTable: {
    tableName: string;
    columns: string[];
    foreignKeys: ParsedForeignKey[];
    line: number;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNumber = i + 1;
    const trimmed = line.trim();

    // Detect CREATE TABLE
    const createTableMatch = trimmed.match(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([a-zA-Z_]\w*)["`]?\s*\(/i,
    );
    if (createTableMatch && createTableMatch[1]) {
      if (currentTable) {
        tables.push(currentTable);
      }
      currentTable = {
        tableName: createTableMatch[1],
        columns: [],
        foreignKeys: [],
        line: lineNumber,
      };
      continue;
    }

    if (currentTable) {
      if (trimmed.startsWith(");") || trimmed === ")") {
        tables.push(currentTable);
        currentTable = null;
        continue;
      }

      // Detect FOREIGN KEY
      const fkMatch = trimmed.match(
        /FOREIGN\s+KEY\s*\(\s*["`]?([a-zA-Z_]\w*)["`]?\s*\)\s*REFERENCES\s+["`]?([a-zA-Z_]\w*)["`]?\s*\(\s*["`]?([a-zA-Z_]\w*)["`]?\s*\)/i,
      );
      if (fkMatch && fkMatch[1] && fkMatch[2] && fkMatch[3]) {
        currentTable.foreignKeys.push({
          column: fkMatch[1],
          targetTable: fkMatch[2],
          targetColumn: fkMatch[3],
        });
        continue;
      }

      // Detect simple column definition
      const colMatch = trimmed.match(/^["`]?([a-zA-Z_]\w*)["`]?\s+([a-zA-Z]+)/);
      if (
        colMatch &&
        colMatch[1] &&
        !["CONSTRAINT", "PRIMARY", "KEY", "FOREIGN", "UNIQUE", "CHECK"].includes(
          colMatch[1].toUpperCase(),
        )
      ) {
        currentTable.columns.push(colMatch[1]);
      }
    }
  }

  if (currentTable) {
    tables.push(currentTable);
  }

  return {
    filePath,
    symbols: [],
    imports: [],
    exports: [],
    routes: [],
    tables,
    networkCalls: [],
  };
}
