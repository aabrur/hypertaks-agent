#!/usr/bin/env node
const path = require("node:path");

try {
  const { runCli } = require("../.build/runtime/cli.js");
  runCli(process.argv.slice(2)).then((code) => process.exit(code));
} catch (err) {
  console.error("Hypertaks CLI execution error:", err);
  process.exit(1);
}
