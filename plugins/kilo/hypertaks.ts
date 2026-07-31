import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "@kilocode/plugin"

const pluginDir = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(pluginDir, "../..")
const skillNames = [
  "hypertaks",
  "hypertaks-verify",
  "hypertaks-brain",
  "hypertaks-graph",
  "hypertaks-continuity",
] as const

function loadHypertaksContext(): string {
  return skillNames
    .map((name) => {
      const content = readFileSync(resolve(repositoryRoot, "skills", name, "SKILL.md"), "utf8")
      return `\n\n# Hypertaks skill: ${name}\n${content}`
    })
    .join("")
}

const server: Plugin = async () => {
  const context = loadHypertaksContext()
  return {
    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(context)
    },
  }
}

export default {
  id: "hypertaks",
  server,
}
