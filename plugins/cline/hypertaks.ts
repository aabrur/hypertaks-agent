import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { AgentPlugin } from "@cline/sdk"

const pluginDir = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(pluginDir, "../..")

const skills = [
  "hypertaks",
  "hypertaks-verify",
  "hypertaks-brain",
  "hypertaks-graph",
  "hypertaks-continuity",
] as const

function readSkill(skill: (typeof skills)[number]): string {
  return readFileSync(resolve(repositoryRoot, "skills", skill, "SKILL.md"), "utf8")
}

const plugin: AgentPlugin = {
  name: "hypertaks",
  manifest: {
    capabilities: ["rules", "commands"],
  },
  setup(api) {
    for (const skill of skills) {
      api.registerRule({
        id: `hypertaks:${skill}`,
        source: `skills/${skill}/SKILL.md`,
        content: readSkill(skill),
      })
    }

    api.registerCommand({
      name: "hypertaks",
      description: "Run the Hypertaks Founder Operating System on the supplied task.",
      handler(input) {
        const task = input.trim() || "Inspect the active project and state the highest-value next action."
        return {
          submitPrompt: `Use the Hypertaks Founder Operating System and its five registered rules for this task:\n\n${task}`,
        }
      },
    })
  },
}

export default plugin
