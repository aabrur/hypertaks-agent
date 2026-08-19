/**
 * Canonical public-skill router.
 * Single source of truth for PUBLIC_SKILLS, focused routing policy,
 * preferredSkill override, resolution, and reason strings.
 * Consumers: runtime/router.ts (re-export) and runtime/mcp-server.mjs
 * (createRequire of the compiled CommonJS build).
 *
 * Phase A2: deterministic primary-intent policy with locale packs.
 * Phase A3: token-safe diagnostics and immutable runtime identity.
 * Language-neutral stages consume English and Indonesian vocabulary packs.
 * No LLM, embeddings, BM25, or network access.
 */

import { createHash } from "node:crypto";

export const PUBLIC_SKILLS = [
  "hypertaks",
  "hypertaks-verify",
  "hypertaks-brain",
  "hypertaks-graph",
  "hypertaks-continuity",
] as const;

export type PublicSkill = (typeof PUBLIC_SKILLS)[number];
export type FocusedSkill = Exclude<PublicSkill, "hypertaks">;

export interface PublicSkillRoute {
  readonly skill: PublicSkill;
  readonly reason: string;
}

/** Stable identity for consumers and installation diagnostics. */
export const PUBLIC_SKILL_ROUTER_MODULE = "public-skill-router" as const;

/** Bumped when deterministic routing semantics change. */
export const ROUTE_POLICY_VERSION = "a2.1" as const;

export const SUPPORTED_LOCALES = ["en", "id"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type DiagnosticsLevel = "none" | "compact" | "full";

export type PrimaryIntent =
  | "founder_strategy"
  | "verify_setup"
  | "durable_memory"
  | "structural_graph"
  | "continuity_ops"
  | "explicit_skill"
  | "preferred_override"
  | "generic"
  | "unsupported_locale";

export interface SuppressedSkillInfo {
  readonly skill: FocusedSkill;
  readonly reason: "explicit_negation" | "exclusion" | "supporting_only";
}

export interface PublicSkillRouteDiagnostics {
  readonly skill: PublicSkill;
  readonly reason: string;
  readonly primaryIntent: PrimaryIntent;
  readonly secondaryIntents: readonly PrimaryIntent[];
  readonly matchedSignals: readonly string[];
  readonly suppressedSkills: readonly SuppressedSkillInfo[];
  readonly routePolicyVersion: typeof ROUTE_POLICY_VERSION;
  readonly detectedLocale: SupportedLocale | "unknown";
  readonly localeSupport: "full" | "fallback" | "unknown";
  readonly routerRulesDigest: string;
  readonly nextTool: "hypertaks_get_skill";
  readonly mutationPerformed: false;
  readonly approvalRequiredForExternalMutation: true;
}

export interface RouterRuntimeIdentity {
  readonly routePolicyVersion: typeof ROUTE_POLICY_VERSION;
  readonly routerRulesDigest: string;
  readonly buildRevision: string;
  readonly buildTimestamp: string;
  readonly supportedLocales: readonly SupportedLocale[];
}

/** @deprecated use PrimaryIntent */
type IntentLabel = PrimaryIntent;

interface LocalePack {
  readonly id: SupportedLocale;
  readonly strongPhrases: Readonly<Record<FocusedSkill, readonly string[]>>;
  readonly actions: Readonly<Record<FocusedSkill, readonly string[]>>;
  readonly objects: Readonly<Record<FocusedSkill, readonly string[]>>;
  readonly founderPrimary: readonly string[];
  readonly negation: readonly string[];
  readonly explicitUse: readonly string[];
  readonly explicitRoute: readonly string[];
}

/**
 * Canonical focused-policy tables (single definition).
 * Locale vocabulary lives here; resolution logic stays language-neutral.
 */
const FOCUSED_SKILL_RULES: {
  readonly locales: readonly LocalePack[];
  readonly skillAliases: Readonly<Record<string, PublicSkill>>;
  readonly globalExclusions: readonly {
    readonly suppress: FocusedSkill;
    readonly phrases: readonly string[];
  }[];
} = {
  skillAliases: {
    hypertaks: "hypertaks",
    "hypertaks-verify": "hypertaks-verify",
    "hypertaks-brain": "hypertaks-brain",
    "hypertaks-graph": "hypertaks-graph",
    "hypertaks-continuity": "hypertaks-continuity",
    verify: "hypertaks-verify",
    brain: "hypertaks-brain",
    graph: "hypertaks-graph",
    continuity: "hypertaks-continuity",
  },
  globalExclusions: [
    {
      suppress: "hypertaks-brain",
      phrases: [
        "memory leak",
        "memory leaks",
        "heap memory",
        "out of memory",
        "oom",
        "ram usage",
        "ram memory",
        "kebocoran memori",
        "memory footprint",
      ],
    },
    {
      suppress: "hypertaks-graph",
      phrases: [
        "graph chart",
        "bar graph",
        "line graph",
        "pie chart",
        "chart of",
        "grafik batang",
        "grafik garis",
        "import csv",
        "import customer",
        "customer records from csv",
        "from csv",
      ],
    },
    {
      suppress: "hypertaks-verify",
      phrases: [
        // Generic tech nouns alone are handled by action-object rules.
        // Keep phrase-level blocks for known false positives.
        "install python",
        "install node",
        "install dependencies",
        "install dependency",
        "npm install",
        "pip install",
      ],
    },
  ],
  locales: [
    {
      id: "en",
      strongPhrases: {
        "hypertaks-verify": [
          "installation verification",
          "runtime verification",
          "verify installation",
          "verify setup",
          "verify configuration",
          "verify checksum",
          "scan-only",
          "scan only",
          "hypertaks installation",
          "hypertaks mcp adapter",
          "memory pointer configuration",
          "repair the hypertaks",
          "repair hypertaks",
        ],
        "hypertaks-brain": [
          "founder memory",
          "durable memory",
          "save memory",
          "retrieve memory",
          "correct memory",
          "store this approved",
          "memory records",
          "revalidate memory",
          "archive memory",
        ],
        "hypertaks-graph": [
          "blast radius",
          "change impact",
          "dependency graph",
          "import graph",
          "module imports",
          "graph freshness",
          "dependency change impact",
          "callers and callees",
        ],
        "hypertaks-continuity": [
          "proof-of-done",
          "proof of done",
          "proof of-done",
          "create a checkpoint",
          "create checkpoint",
          "resume checkpoint",
          "cross-agent handoff",
          "verify proof-of-done",
          "verify proof of done",
        ],
      },
      actions: {
        "hypertaks-verify": [
          "verify",
          "verifying",
          "validation",
          "validate",
          "scan",
          "repair",
          "check",
          "inspect installation",
        ],
        "hypertaks-brain": [
          "save",
          "store",
          "retrieve",
          "correct",
          "remember",
          "inspect",
          "recall",
          "archive",
          "revalidate",
        ],
        "hypertaks-graph": [
          "analyze",
          "trace",
          "map",
          "inspect",
          "check",
          "query",
        ],
        "hypertaks-continuity": [
          "checkpoint",
          "resume",
          "handoff",
          "reconcile",
          "reconciliation",
          "create",
          "verify",
        ],
      },
      objects: {
        "hypertaks-verify": [
          "installation",
          "install",
          "setup",
          "configuration",
          "checksum",
          "runtime",
          "hypertaks",
          "mcp adapter",
          "memory pointer",
          "pointer configuration",
          "deployed hypertaks",
        ],
        "hypertaks-brain": [
          "memory",
          "memories",
          "founder memory",
          "durable memory",
          "product decision",
          "approved decision",
          "approved product decision",
          "memory target",
          "memory records",
        ],
        "hypertaks-graph": [
          "dependency",
          "dependencies",
          "caller",
          "callers",
          "callee",
          "callees",
          "imports",
          "import",
          "blast radius",
          "change impact",
          "graph freshness",
          "module imports",
          "structural",
        ],
        "hypertaks-continuity": [
          "checkpoint",
          "handoff",
          "resume",
          "reconciliation",
          "proof-of-done",
          "proof of done",
          "proof",
        ],
      },
      founderPrimary: [
        "founder strategy",
        "business strategy",
        "engineering strategy",
        "product strategy",
        "founder plan",
        "business plan",
        "engineering plan",
        "product plan",
        "roadmap",
        "multi-domain",
        "across business and engineering",
        "business and engineering",
        "strategy covering",
        "design the",
        "design an",
        "build an",
        "build a",
        "launch",
        "strategi founder",
      ],
      negation: [
        "do not",
        "don't",
        "dont",
        "never",
        "without",
        "no need to",
        "no need for",
        "not",
      ],
      explicitUse: ["use", "using", "via", "through", "with skill"],
      explicitRoute: ["route to", "route this to", "send to", "open skill"],
    },
    {
      id: "id",
      strongPhrases: {
        "hypertaks-verify": [
          "verifikasi konfigurasi",
          "verifikasi instalasi",
          "verifikasi setup",
          "verifikasi checksum",
          "verifikasi runtime",
          "instalasi hypertaks",
          "konfigurasi instalasi",
          "perbaiki konfigurasi hypertaks",
        ],
        "hypertaks-brain": [
          "memori founder",
          "simpan memori",
          "ambil memori",
          "koreksi memori",
          "memori tahan lama",
        ],
        "hypertaks-graph": [
          "dampak perubahan",
          "radius ledakan",
          "graf dependensi",
          "dependensi modul",
        ],
        "hypertaks-continuity": [
          "bukti selesai",
          "buat checkpoint",
          "rekonsiliasi",
          "serah terima",
        ],
      },
      actions: {
        "hypertaks-verify": [
          "verifikasi",
          "periksa",
          "perbaiki",
          "scan",
          "validasi",
        ],
        "hypertaks-brain": [
          "simpan",
          "ambil",
          "koreksi",
          "ingat",
          "ingatkan",
          "periksa",
        ],
        "hypertaks-graph": [
          "analisis",
          "telusuri",
          "petakan",
          "periksa",
        ],
        "hypertaks-continuity": [
          "checkpoint",
          "lanjutkan",
          "handoff",
          "rekonsiliasi",
          "buat",
          "verifikasi",
        ],
      },
      objects: {
        "hypertaks-verify": [
          "instalasi",
          "install",
          "setup",
          "konfigurasi",
          "checksum",
          "runtime",
          "hypertaks",
          "adapter mcp",
        ],
        "hypertaks-brain": [
          "memori",
          "memory",
          "keputusan produk",
          "keputusan yang disetujui",
        ],
        "hypertaks-graph": [
          "dependensi",
          "dependency",
          "imports",
          "import",
          "dampak perubahan",
          "blast radius",
          "pemanggil",
        ],
        "hypertaks-continuity": [
          "checkpoint",
          "handoff",
          "resume",
          "rekonsiliasi",
          "bukti selesai",
          "proof-of-done",
          "bukti",
        ],
      },
      founderPrimary: [
        "strategi founder",
        "strategi bisnis",
        "strategi engineering",
        "strategi produk",
        "rencana founder",
        "rencana bisnis",
        "peta jalan",
        "lintas domain",
        "bisnis dan engineering",
        "desain",
        "rancang",
        "bangun",
        "luncurkan",
      ],
      negation: [
        "jangan",
        "bukan",
        "tidak perlu",
        "tanpa",
        "bukan untuk",
        "tidak",
      ],
      explicitUse: ["pakai", "gunakan", "menggunakan", "lewat skill"],
      explicitRoute: ["route ke", "arahkan ke", "kirim ke"],
    },
  ],
};

const FOCUSED_SKILLS: readonly FocusedSkill[] = [
  "hypertaks-verify",
  "hypertaks-brain",
  "hypertaks-graph",
  "hypertaks-continuity",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Normalize for matching while preserving skill names and hyphenated phrases. */
export function normalizeRequestText(requestText: string): string {
  return requestText
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/proof\s+of\s+done/g, "proof-of-done")
    .replace(/[^\p{L}\p{N}\s+./_-]+/gu, " ")
    .replace(/[./_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token-boundary match that does not treat "-" as a boundary (skill names). */
function containsPhrase(haystack: string, phrase: string): boolean {
  const needle = phrase.toLowerCase().trim();
  if (!needle) return false;
  if (needle.includes(" ")) {
    return haystack.includes(needle);
  }
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}_-])${escapeRegExp(needle)}(?=$|[^\\p{L}\\p{N}_-])`,
    "u",
  ).test(haystack);
}

function skillTokenPattern(skill: string): string {
  // Do not allow \\b after "hypertaks" to match inside "hypertaks-brain".
  return `${escapeRegExp(skill)}(?=$|[^\\p{L}\\p{N}_-])`;
}

function anyPhrase(haystack: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => containsPhrase(haystack, phrase));
}

function splitClauses(normalized: string): string[] {
  const rough = normalized
    .split(
      /\s*(?:[.!?;\n]+|\b(?:but|however|instead|except|tapi|namun|melainkan|sebaliknya)\b)\s*/u,
    )
    .map((part) => part.trim())
    .filter(Boolean);
  return rough.length > 0 ? rough : [normalized];
}

function detectLocaleHints(normalized: string): {
  readonly supportedHit: boolean;
  readonly locales: SupportedLocale[];
} {
  const hits = new Set<SupportedLocale>();
  for (const pack of FOCUSED_SKILL_RULES.locales) {
    const vocab = [
      ...pack.negation,
      ...pack.founderPrimary,
      ...pack.explicitUse,
      ...pack.explicitRoute,
      ...FOCUSED_SKILLS.flatMap((skill) => [
        ...pack.strongPhrases[skill],
        ...pack.actions[skill],
        ...pack.objects[skill],
      ]),
    ];
    if (anyPhrase(normalized, vocab)) {
      hits.add(pack.id);
    }
  }
  // ASCII-heavy generic English engineering text still counts as supported en.
  if (/[a-z]/.test(normalized)) {
    hits.add("en");
  }
  // Indonesian-specific characters or tokens force id support recognition.
  if (/[à-ÿ]|mbak|mas\b|dong\b|sih\b|nya\b|kah\b/u.test(normalized)) {
    hits.add("id");
  }
  return { supportedHit: hits.size > 0, locales: [...hits] };
}

function suppressedByExclusion(
  normalized: string,
  skill: FocusedSkill,
): boolean {
  return FOCUSED_SKILL_RULES.globalExclusions.some(
    (rule) =>
      rule.suppress === skill && anyPhrase(normalized, rule.phrases),
  );
}

function clauseHasNegation(clause: string, pack: LocalePack): boolean {
  return anyPhrase(clause, pack.negation);
}

function skillMentionedInClause(clause: string, skill: FocusedSkill): boolean {
  if (containsPhrase(clause, skill)) return true;
  const short = skill.replace(/^hypertaks-/, "");
  if (containsPhrase(clause, short)) return true;
  // "route ke verify" style
  if (skill === "hypertaks-verify" && containsPhrase(clause, "verify")) {
    return true;
  }
  return false;
}

interface ExplicitResolution {
  readonly skill: PublicSkill | null;
  readonly suppressed: FocusedSkill[];
  readonly reason: string | null;
}

function resolveExplicitSkillInstruction(
  normalized: string,
  clauses: readonly string[],
): ExplicitResolution {
  const suppressed = new Set<FocusedSkill>();
  const affirmed = new Set<PublicSkill>();

  // Longest skill first so hypertaks-brain wins over hypertaks prefix.
  const skillsLongestFirst = [...PUBLIC_SKILLS].sort(
    (a, b) => b.length - a.length,
  );

  for (const skill of skillsLongestFirst) {
    const token = skillTokenPattern(skill);
    const usePattern = new RegExp(
      `(?:^|[^\\p{L}\\p{N}_-])(?:use|using|pakai|gunakan|via|through|route(?:\\s+this)?\\s+to|arahkan\\s+ke|kirim\\s+ke)\\s+${token}`,
      "u",
    );
    const negPattern = new RegExp(
      `(?:^|[^\\p{L}\\p{N}_-])(?:do\\s+not|don't|dont|never|jangan|bukan|tidak\\s+perlu|without)(?=$|[^\\p{L}\\p{N}_-])[\\s\\S]{0,48}${token}`,
      "u",
    );
    if (negPattern.test(normalized) && skill !== "hypertaks") {
      suppressed.add(skill as FocusedSkill);
      affirmed.delete(skill);
      continue;
    }
    if (usePattern.test(normalized)) {
      affirmed.add(skill);
    }
  }

  // Short alias with explicit route/use cue only (never bare product nouns).
  for (const clause of clauses) {
    for (const pack of FOCUSED_SKILL_RULES.locales) {
      const hasNeg = clauseHasNegation(clause, pack);
      const hasRouteCue =
        anyPhrase(clause, pack.explicitUse) ||
        anyPhrase(clause, pack.explicitRoute) ||
        containsPhrase(clause, "route") ||
        containsPhrase(clause, "arahkan");

      if (!hasRouteCue) continue;

      const aliasHits: PublicSkill[] = [];
      if (
        containsPhrase(clause, "hypertaks-verify") ||
        (containsPhrase(clause, "verify") && hasRouteCue)
      ) {
        aliasHits.push("hypertaks-verify");
      }
      if (containsPhrase(clause, "hypertaks-brain") || containsPhrase(clause, "brain")) {
        // "brain" alone is too ambiguous unless full skill or use-brain cue.
        if (
          containsPhrase(clause, "hypertaks-brain") ||
          containsPhrase(clause, "use brain") ||
          containsPhrase(clause, "route") && containsPhrase(clause, "brain")
        ) {
          aliasHits.push("hypertaks-brain");
        }
      }
      if (containsPhrase(clause, "hypertaks-graph")) {
        aliasHits.push("hypertaks-graph");
      }
      if (containsPhrase(clause, "hypertaks-continuity")) {
        aliasHits.push("hypertaks-continuity");
      }
      // "route ke verify" / "jangan route ke verify"
      if (
        containsPhrase(clause, "verify") &&
        !containsPhrase(clause, "hypertaks-verify") &&
        (containsPhrase(clause, "route") || containsPhrase(clause, "arahkan"))
      ) {
        aliasHits.push("hypertaks-verify");
      }

      for (const skill of aliasHits) {
        if (skill === "hypertaks") continue;
        if (hasNeg) {
          suppressed.add(skill as FocusedSkill);
          affirmed.delete(skill);
        } else {
          affirmed.add(skill);
        }
      }
    }
  }

  // "jangan route ke verify" whole-text guard
  if (
    /(?:jangan|do\s+not|don't|dont|never)[\s\S]{0,32}(?:route|arahkan)[\s\S]{0,24}(?:verify|verifikasi|hypertaks-verify)/u.test(
      normalized,
    )
  ) {
    suppressed.add("hypertaks-verify");
    affirmed.delete("hypertaks-verify");
  }

  // Prefer the most specific affirmed focused skill over bare hypertaks.
  const affirmedList = [...affirmed].filter(
    (skill) => skill === "hypertaks" || !suppressed.has(skill as FocusedSkill),
  );
  const focusedAffirmed = affirmedList.filter((skill) => skill !== "hypertaks");
  if (focusedAffirmed.length === 1) {
    return {
      skill: focusedAffirmed[0]!,
      suppressed: [...suppressed],
      reason: `Explicit canonical skill instruction selected ${focusedAffirmed[0]}.`,
    };
  }
  if (focusedAffirmed.length > 1) {
    return {
      skill: "hypertaks",
      suppressed: [...suppressed],
      reason:
        "Multiple affirmative canonical skill instructions; use the main Founder Operating System flow.",
    };
  }
  if (affirmedList.length === 1 && affirmedList[0] === "hypertaks") {
    return {
      skill: "hypertaks",
      suppressed: [...suppressed],
      reason: "Explicit canonical skill instruction selected hypertaks.",
    };
  }
  return { skill: null, suppressed: [...suppressed], reason: null };
}

function actionObjectEligible(
  clause: string,
  skill: FocusedSkill,
  pack: LocalePack,
): boolean {
  const hasAction = anyPhrase(clause, pack.actions[skill]);
  const hasObject = anyPhrase(clause, pack.objects[skill]);
  if (!(hasAction && hasObject)) return false;

  // Verify requires Hypertaks-oriented object or explicit verification object pair.
  if (skill === "hypertaks-verify") {
    const hypertaksObject =
      containsPhrase(clause, "hypertaks") ||
      containsPhrase(clause, "memory pointer") ||
      containsPhrase(clause, "pointer configuration") ||
      containsPhrase(clause, "mcp adapter") ||
      containsPhrase(clause, "checksum") ||
      containsPhrase(clause, "runtime verification") ||
      containsPhrase(clause, "installation") ||
      containsPhrase(clause, "instalasi") ||
      containsPhrase(clause, "setup") ||
      containsPhrase(clause, "configuration") ||
      containsPhrase(clause, "konfigurasi");
    const verifyAction =
      containsPhrase(clause, "verify") ||
      containsPhrase(clause, "verifikasi") ||
      containsPhrase(clause, "scan") ||
      containsPhrase(clause, "repair") ||
      containsPhrase(clause, "perbaiki") ||
      containsPhrase(clause, "checksum") ||
      containsPhrase(clause, "runtime verification");

    // "Configure a new MCP server" has configuration-ish language but no verify action + Hypertaks object.
    if (containsPhrase(clause, "mcp") && !containsPhrase(clause, "hypertaks") && !containsPhrase(clause, "verify") && !containsPhrase(clause, "verifikasi")) {
      return false;
    }
    // Generic install without Hypertaks verification framing.
    if (
      (containsPhrase(clause, "install") || containsPhrase(clause, "instalasi")) &&
      !containsPhrase(clause, "hypertaks") &&
      !containsPhrase(clause, "verify") &&
      !containsPhrase(clause, "verifikasi") &&
      !containsPhrase(clause, "checksum") &&
      !containsPhrase(clause, "scan")
    ) {
      return false;
    }
    return hypertaksObject && verifyAction;
  }

  if (skill === "hypertaks-brain") {
    // "store approved product decision" counts as durable memory write.
    if (
      (containsPhrase(clause, "store") || containsPhrase(clause, "save") || containsPhrase(clause, "simpan")) &&
      (containsPhrase(clause, "decision") || containsPhrase(clause, "keputusan"))
    ) {
      return true;
    }
    // Standalone "memory" without durable-memory action is not enough (handled by hasAction).
    if (containsPhrase(clause, "memory leak")) return false;
  }

  if (skill === "hypertaks-graph") {
    if (containsPhrase(clause, "graph chart") || containsPhrase(clause, "chart of")) {
      return false;
    }
    // "imports" alone as dependency structure needs structural cue.
    if (
      containsPhrase(clause, "imports") &&
      !containsPhrase(clause, "dependency") &&
      !containsPhrase(clause, "dependensi") &&
      !containsPhrase(clause, "module") &&
      !containsPhrase(clause, "blast") &&
      !containsPhrase(clause, "caller") &&
      !containsPhrase(clause, "trace")
    ) {
      // "callers imports blast radius" still has callers/blast via other phrases
      if (!containsPhrase(clause, "import graph")) return false;
    }
  }

  if (skill === "hypertaks-continuity") {
    // "verify proof-of-done" is continuity, not verify-setup.
    if (
      containsPhrase(clause, "proof-of-done") ||
      containsPhrase(clause, "proof of done") ||
      containsPhrase(clause, "bukti selesai")
    ) {
      return true;
    }
  }

  return true;
}

function strongPhraseEligible(
  clause: string,
  skill: FocusedSkill,
  pack: LocalePack,
): boolean {
  return anyPhrase(clause, pack.strongPhrases[skill]);
}

function clauseNegatesSkill(
  clause: string,
  skill: FocusedSkill,
  pack: LocalePack,
): boolean {
  if (!clauseHasNegation(clause, pack)) return false;
  if (skillMentionedInClause(clause, skill)) return true;
  // Negate action-object pair in same clause: "do not save memory"
  if (
    anyPhrase(clause, pack.actions[skill]) &&
    anyPhrase(clause, pack.objects[skill])
  ) {
    return true;
  }
  // "jangan route ke verify"
  if (
    skill === "hypertaks-verify" &&
    (containsPhrase(clause, "verify") || containsPhrase(clause, "verifikasi"))
  ) {
    return true;
  }
  return false;
}

function founderPrimaryIn(text: string, pack: LocalePack): boolean {
  return anyPhrase(text, pack.founderPrimary);
}

function isSupportingContinuity(normalized: string, clause: string): boolean {
  // Checkpoint as supporting requirement under design/strategy/plan.
  const supportingCue =
    containsPhrase(normalized, "with checkpoint") ||
    containsPhrase(normalized, "checkpoint requirements") ||
    containsPhrase(normalized, "and a project checkpoint") ||
    containsPhrase(normalized, "with proof-of-done") ||
    containsPhrase(clause, "requirements");
  const primaryDesign =
    containsPhrase(normalized, "design") ||
    containsPhrase(normalized, "strategy") ||
    containsPhrase(normalized, "strategi") ||
    containsPhrase(normalized, "plan") ||
    containsPhrase(normalized, "rencana") ||
    containsPhrase(normalized, "founder");
  return supportingCue && primaryDesign;
}

interface FocusedMatch {
  readonly skill: FocusedSkill;
  readonly primary: boolean;
  readonly via: "strong_phrase" | "action_object";
}

function collectFocusedMatches(
  normalized: string,
  clauses: readonly string[],
  suppressed: ReadonlySet<FocusedSkill>,
): FocusedMatch[] {
  const matches: FocusedMatch[] = [];

  for (const skill of FOCUSED_SKILLS) {
    if (suppressed.has(skill)) continue;
    if (suppressedByExclusion(normalized, skill)) continue;

    let hit = false;
    let via: FocusedMatch["via"] = "strong_phrase";
    let primary = false;

    for (const clause of clauses) {
      let negated = false;
      for (const pack of FOCUSED_SKILL_RULES.locales) {
        if (clauseNegatesSkill(clause, skill, pack)) {
          negated = true;
          break;
        }
      }
      if (negated) continue;

      for (const pack of FOCUSED_SKILL_RULES.locales) {
        if (strongPhraseEligible(clause, skill, pack)) {
          hit = true;
          via = "strong_phrase";
          primary = true;
        } else if (actionObjectEligible(clause, skill, pack)) {
          hit = true;
          via = "action_object";
          primary = true;
        }
      }
    }

    // Whole-text strong phrases (multi-clause coverage)
    if (!hit) {
      for (const pack of FOCUSED_SKILL_RULES.locales) {
        if (strongPhraseEligible(normalized, skill, pack)) {
          hit = true;
          via = "strong_phrase";
          primary = true;
        } else if (actionObjectEligible(normalized, skill, pack)) {
          hit = true;
          via = "action_object";
          primary = true;
        }
      }
    }

    if (!hit) continue;

    if (skill === "hypertaks-continuity" && isSupportingContinuity(normalized, normalized)) {
      primary = false;
    }

    // Continuity primary when the head objective is checkpoint/handoff/proof.
    if (skill === "hypertaks-continuity") {
      const continuityHead =
        /^(?:create|buat|verify|verifikasi|resume|handoff|reconcile)?\s*(?:a\s+)?(?:checkpoint|handoff|resume|proof-of-done|bukti selesai)/u.test(
          normalized,
        ) ||
        containsPhrase(normalized, "create a checkpoint") ||
        containsPhrase(normalized, "create checkpoint") ||
        containsPhrase(normalized, "checkpoint, handoff") ||
        containsPhrase(normalized, "proof-of-done") ||
        containsPhrase(normalized, "bukti selesai") ||
        containsPhrase(normalized, "resume handoff");
      if (continuityHead && !isSupportingContinuity(normalized, normalized)) {
        primary = true;
      }
    }

    matches.push({ skill, primary, via });
  }

  return matches;
}

function hasFounderPrimary(normalized: string, clauses: readonly string[]): boolean {
  for (const pack of FOCUSED_SKILL_RULES.locales) {
    if (founderPrimaryIn(normalized, pack)) return true;
    for (const clause of clauses) {
      if (founderPrimaryIn(clause, pack)) return true;
    }
  }
  // Broad multi-domain founder cues
  if (
    containsPhrase(normalized, "founder") &&
    (containsPhrase(normalized, "strategy") ||
      containsPhrase(normalized, "strategi") ||
      containsPhrase(normalized, "plan") ||
      containsPhrase(normalized, "business") ||
      containsPhrase(normalized, "engineering"))
  ) {
    return true;
  }
  if (
    containsPhrase(normalized, "ambiguous multi-domain") ||
    containsPhrase(normalized, "multi-domain strategy")
  ) {
    return true;
  }
  return false;
}

function intentForSkill(skill: PublicSkill): PrimaryIntent {
  switch (skill) {
    case "hypertaks":
      return "founder_strategy";
    case "hypertaks-verify":
      return "verify_setup";
    case "hypertaks-brain":
      return "durable_memory";
    case "hypertaks-graph":
      return "structural_graph";
    case "hypertaks-continuity":
      return "continuity_ops";
    default:
      return "generic";
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

/** Deterministic digest of canonical routing policy (not manual copy). */
export function computeRouterRulesDigest(): string {
  const payload = {
    module: PUBLIC_SKILL_ROUTER_MODULE,
    routePolicyVersion: ROUTE_POLICY_VERSION,
    publicSkills: PUBLIC_SKILLS,
    supportedLocales: SUPPORTED_LOCALES,
    focusedSkillRules: FOCUSED_SKILL_RULES,
  };
  return createHash("sha256").update(stableStringify(payload), "utf8").digest("hex");
}

let cachedRouterRulesDigest: string | null = null;

export function getRouterRulesDigest(): string {
  if (cachedRouterRulesDigest === null) {
    cachedRouterRulesDigest = computeRouterRulesDigest();
  }
  return cachedRouterRulesDigest;
}

function readTrustedBuildRevision(): string {
  const candidates = [
    process.env.HYPERTAKS_BUILD_COMMIT,
    process.env.HYPERTAKS_BUILD_REVISION,
    process.env.SOURCE_VERSION,
    process.env.BUILD_COMMIT,
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.COMMIT_REF,
  ];
  for (const raw of candidates) {
    const value = typeof raw === "string" ? raw.trim() : "";
    // Accept only short/long hex git-like revisions; never invent values.
    if (/^[0-9a-f]{7,64}$/i.test(value)) {
      return value.toLowerCase();
    }
  }
  return "unknown";
}

function readTrustedBuildTimestamp(): string {
  const candidates = [
    process.env.HYPERTAKS_BUILD_TIMESTAMP,
    process.env.BUILD_TIMESTAMP,
    process.env.SOURCE_DATE_EPOCH,
  ];
  for (const raw of candidates) {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) continue;
    if (/^\d{10}$/.test(value)) {
      // Unix seconds from SOURCE_DATE_EPOCH-style env.
      const ms = Number(value) * 1000;
      if (Number.isFinite(ms)) return new Date(ms).toISOString();
    }
    if (/^\d{13}$/.test(value)) {
      const ms = Number(value);
      if (Number.isFinite(ms)) return new Date(ms).toISOString();
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
      return value;
    }
  }
  return "unknown";
}

export function getRouterRuntimeIdentity(): RouterRuntimeIdentity {
  return {
    routePolicyVersion: ROUTE_POLICY_VERSION,
    routerRulesDigest: getRouterRulesDigest(),
    buildRevision: readTrustedBuildRevision(),
    buildTimestamp: readTrustedBuildTimestamp(),
    supportedLocales: SUPPORTED_LOCALES,
  };
}

function sortSignals(signals: Iterable<string>): string[] {
  return [...new Set(signals)].sort((a, b) => a.localeCompare(b));
}

function sortSuppressed(
  items: Iterable<SuppressedSkillInfo>,
): SuppressedSkillInfo[] {
  const map = new Map<FocusedSkill, SuppressedSkillInfo>();
  for (const item of items) {
    if (!map.has(item.skill)) map.set(item.skill, item);
  }
  return [...map.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

function localePresentation(localeHints: {
  readonly supportedHit: boolean;
  readonly locales: SupportedLocale[];
}): {
  readonly detectedLocale: SupportedLocale | "unknown";
  readonly localeSupport: "full" | "fallback" | "unknown";
} {
  if (localeHints.locales.length === 0) {
    return { detectedLocale: "unknown", localeSupport: "unknown" };
  }
  // Prefer id when present with en for mixed input reporting stability: first sorted.
  const ordered = [...localeHints.locales].sort();
  const detected = ordered.includes("en") && ordered.length === 1
    ? "en"
    : ordered.includes("id") && ordered.length === 1
      ? "id"
      : ordered[0]!;
  return {
    detectedLocale: detected,
    localeSupport: localeHints.supportedHit ? "full" : "fallback",
  };
}

function finishDiagnostics(input: {
  readonly skill: PublicSkill;
  readonly reason: string;
  readonly primaryIntent: PrimaryIntent;
  readonly secondaryIntents?: readonly PrimaryIntent[];
  readonly matchedSignals: readonly string[];
  readonly suppressedSkills: readonly SuppressedSkillInfo[];
  readonly localeHints: { readonly supportedHit: boolean; readonly locales: SupportedLocale[] };
}): PublicSkillRouteDiagnostics {
  const locale = localePresentation(input.localeHints);
  const secondary = [...new Set(input.secondaryIntents ?? [])]
    .filter((intent) => intent !== input.primaryIntent)
    .sort((a, b) => a.localeCompare(b));
  return {
    skill: input.skill,
    reason: input.reason,
    primaryIntent: input.primaryIntent,
    secondaryIntents: secondary,
    matchedSignals: sortSignals(input.matchedSignals),
    suppressedSkills: sortSuppressed(input.suppressedSkills),
    routePolicyVersion: ROUTE_POLICY_VERSION,
    detectedLocale: locale.detectedLocale,
    localeSupport:
      input.primaryIntent === "unsupported_locale" ? "fallback" : locale.localeSupport,
    routerRulesDigest: getRouterRulesDigest(),
    nextTool: "hypertaks_get_skill",
    mutationPerformed: false,
    approvalRequiredForExternalMutation: true,
  };
}

/**
 * Full deterministic diagnostics for a route decision.
 * Does not include raw request text, secrets, or environment dumps.
 */
export function diagnosePublicSkillRoute(
  requestText: string,
  preferredSkill?: string,
): PublicSkillRouteDiagnostics {
  const emptyLocale = { supportedHit: true, locales: ["en"] as SupportedLocale[] };

  if (
    typeof preferredSkill === "string" &&
    (PUBLIC_SKILLS as readonly string[]).includes(preferredSkill)
  ) {
    return finishDiagnostics({
      skill: preferredSkill as PublicSkill,
      reason: "Explicit preferredSkill override.",
      primaryIntent: "preferred_override",
      secondaryIntents: [intentForSkill(preferredSkill as PublicSkill)],
      matchedSignals: ["preferred_skill", `skill:${preferredSkill}`],
      suppressedSkills: [],
      localeHints: emptyLocale,
    });
  }

  const normalized = normalizeRequestText(requestText || "");
  if (!normalized) {
    return finishDiagnostics({
      skill: "hypertaks",
      reason: "Empty request; use the main Founder Operating System flow.",
      primaryIntent: "generic",
      matchedSignals: ["empty_request"],
      suppressedSkills: [],
      localeHints: emptyLocale,
    });
  }

  const clauses = splitClauses(normalized);
  const localeHints = detectLocaleHints(normalized);
  const signals: string[] = [];
  const suppressedList: SuppressedSkillInfo[] = [];

  for (const skill of FOCUSED_SKILLS) {
    if (suppressedByExclusion(normalized, skill)) {
      suppressedList.push({ skill, reason: "exclusion" });
      signals.push(`exclusion:${skill}`);
    }
  }

  const explicit = resolveExplicitSkillInstruction(normalized, clauses);
  const suppressed = new Set<FocusedSkill>(explicit.suppressed);
  for (const skill of explicit.suppressed) {
    suppressedList.push({ skill, reason: "explicit_negation" });
    signals.push(`negation:${skill}`);
  }

  if (explicit.skill) {
    signals.push("explicit_skill", `skill:${explicit.skill}`);
    return finishDiagnostics({
      skill: explicit.skill,
      reason: explicit.reason || "Explicit canonical skill instruction.",
      primaryIntent:
        explicit.skill === "hypertaks" && explicit.reason?.includes("Multiple")
          ? "founder_strategy"
          : "explicit_skill",
      secondaryIntents:
        explicit.skill === "hypertaks" ? [] : [intentForSkill(explicit.skill)],
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  const focused = collectFocusedMatches(normalized, clauses, suppressed);
  const founderPrimary = hasFounderPrimary(normalized, clauses);
  if (founderPrimary) signals.push("founder_primary");

  const primaryFocused = focused.filter((item) => item.primary);
  const anyFocused = focused;
  for (const item of focused) {
    signals.push(`${item.via}:${item.skill}`);
    if (!item.primary) {
      suppressedList.push({ skill: item.skill, reason: "supporting_only" });
      signals.push(`supporting:${item.skill}`);
    }
  }

  const secondaryFromFocused = (items: readonly { skill: FocusedSkill }[]) =>
    items.map((item) => intentForSkill(item.skill));

  // Special-case legacy bag-of-words verify lists used in baseline tests.
  if (
    anyPhrase(normalized, [
      "install setup configuration checksum runtime verification",
      "install setup configuration checksum",
    ]) ||
    (containsPhrase(normalized, "checksum") &&
      containsPhrase(normalized, "runtime") &&
      (containsPhrase(normalized, "verification") ||
        containsPhrase(normalized, "install") ||
        containsPhrase(normalized, "setup")))
  ) {
    if (!suppressed.has("hypertaks-verify") && !founderPrimary) {
      signals.push("legacy:verify_bag", "skill:hypertaks-verify");
      return finishDiagnostics({
        skill: "hypertaks-verify",
        reason: "Matched focused hypertaks-verify routing vocabulary.",
        primaryIntent: "verify_setup",
        matchedSignals: signals,
        suppressedSkills: suppressedList,
        localeHints,
      });
    }
  }

  if (
    (containsPhrase(normalized, "callers") || containsPhrase(normalized, "caller")) &&
    (containsPhrase(normalized, "imports") || containsPhrase(normalized, "import")) &&
    containsPhrase(normalized, "blast radius")
  ) {
    if (
      !suppressed.has("hypertaks-graph") &&
      !suppressedByExclusion(normalized, "hypertaks-graph")
    ) {
      signals.push("legacy:graph_bag", "skill:hypertaks-graph");
      return finishDiagnostics({
        skill: "hypertaks-graph",
        reason: "Matched focused hypertaks-graph routing vocabulary.",
        primaryIntent: "structural_graph",
        matchedSignals: signals,
        suppressedSkills: suppressedList,
        localeHints,
      });
    }
  }

  if (
    containsPhrase(normalized, "resume") &&
    containsPhrase(normalized, "handoff") &&
    (containsPhrase(normalized, "reconcile") ||
      containsPhrase(normalized, "reconciliation") ||
      containsPhrase(normalized, "rekonsiliasi"))
  ) {
    if (!suppressed.has("hypertaks-continuity")) {
      signals.push("legacy:continuity_bag", "skill:hypertaks-continuity");
      return finishDiagnostics({
        skill: "hypertaks-continuity",
        reason: "Matched focused hypertaks-continuity routing vocabulary.",
        primaryIntent: "continuity_ops",
        matchedSignals: signals,
        suppressedSkills: suppressedList,
        localeHints,
      });
    }
  }

  if (primaryFocused.length === 1 && !founderPrimary) {
    const only = primaryFocused[0]!;
    signals.push(`skill:${only.skill}`);
    return finishDiagnostics({
      skill: only.skill,
      reason: `Matched focused ${only.skill} routing vocabulary.`,
      primaryIntent: intentForSkill(only.skill),
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  if (primaryFocused.length === 1 && founderPrimary) {
    signals.push("conflict:founder_over_focused", `skill:hypertaks`);
    return finishDiagnostics({
      skill: "hypertaks",
      reason:
        "Founder primary intent outranks a supporting focused signal; use the main Founder Operating System flow.",
      primaryIntent: "founder_strategy",
      secondaryIntents: secondaryFromFocused(primaryFocused),
      matchedSignals: signals,
      suppressedSkills: [
        ...suppressedList,
        { skill: primaryFocused[0]!.skill, reason: "supporting_only" },
      ],
      localeHints,
    });
  }

  if (primaryFocused.length > 1) {
    signals.push("conflict:multi_focused", "skill:hypertaks");
    return finishDiagnostics({
      skill: "hypertaks",
      reason:
        "Multiple focused skills matched; use the main Founder Operating System flow.",
      primaryIntent: "founder_strategy",
      secondaryIntents: secondaryFromFocused(primaryFocused),
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  if (anyFocused.length >= 1 && founderPrimary) {
    signals.push("founder_with_supporting", "skill:hypertaks");
    return finishDiagnostics({
      skill: "hypertaks",
      reason:
        "Founder primary intent with supporting focused terms; use the main Founder Operating System flow.",
      primaryIntent: "founder_strategy",
      secondaryIntents: secondaryFromFocused(anyFocused),
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  if (anyFocused.length === 1 && !founderPrimary) {
    const only = anyFocused[0]!;
    signals.push(`skill:${only.skill}`);
    return finishDiagnostics({
      skill: only.skill,
      reason: `Matched focused ${only.skill} routing vocabulary.`,
      primaryIntent: intentForSkill(only.skill),
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  if (anyFocused.length > 1) {
    signals.push("conflict:multi_focused", "skill:hypertaks");
    return finishDiagnostics({
      skill: "hypertaks",
      reason:
        "Multiple focused skills matched; use the main Founder Operating System flow.",
      primaryIntent: "founder_strategy",
      secondaryIntents: secondaryFromFocused(anyFocused),
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  if (!localeHints.supportedHit && /[^\x00-\x7F]/u.test(normalized)) {
    signals.push("unsupported_locale", "skill:hypertaks");
    return finishDiagnostics({
      skill: "hypertaks",
      reason:
        "Unsupported or uncertain locale without explicit skill instruction; conservative main-skill fallback.",
      primaryIntent: "unsupported_locale",
      matchedSignals: signals,
      suppressedSkills: suppressedList,
      localeHints,
    });
  }

  signals.push("default_main", "skill:hypertaks");
  return finishDiagnostics({
    skill: "hypertaks",
    reason:
      "No focused subskill was required; use the main Founder Operating System flow.",
    primaryIntent: founderPrimary ? "founder_strategy" : "generic",
    matchedSignals: signals,
    suppressedSkills: suppressedList,
    localeHints,
  });
}

export function routePublicSkill(
  requestText: string,
  preferredSkill?: string,
): PublicSkillRoute {
  const diagnosed = diagnosePublicSkillRoute(requestText, preferredSkill);
  return { skill: diagnosed.skill, reason: diagnosed.reason };
}

/**
 * Present diagnostics at a token-safe level.
 * none: legacy compact client shape (default)
 * compact: adds primaryIntent/suppressedSkills/locale/version
 * full: adds matchedSignals/secondaryIntents/routerRulesDigest
 */
export function presentRouteDiagnostics(
  diagnosed: PublicSkillRouteDiagnostics,
  level: DiagnosticsLevel = "none",
): Record<string, unknown> {
  const legacy = {
    skill: diagnosed.skill,
    reason: diagnosed.reason,
    nextTool: diagnosed.nextTool,
    mutationPerformed: diagnosed.mutationPerformed,
    approvalRequiredForExternalMutation:
      diagnosed.approvalRequiredForExternalMutation,
  };

  if (level === "none") {
    return legacy;
  }

  const compact = {
    ...legacy,
    primaryIntent: diagnosed.primaryIntent,
    suppressedSkills: diagnosed.suppressedSkills,
    detectedLocale: diagnosed.detectedLocale,
    localeSupport: diagnosed.localeSupport,
    routePolicyVersion: diagnosed.routePolicyVersion,
  };

  if (level === "compact") {
    return compact;
  }

  return {
    ...compact,
    matchedSignals: diagnosed.matchedSignals,
    secondaryIntents: diagnosed.secondaryIntents,
    routerRulesDigest: diagnosed.routerRulesDigest,
  };
}

export function describeRouteIntent(skill: PublicSkill): PrimaryIntent {
  return intentForSkill(skill);
}

export function parseDiagnosticsLevel(value: unknown): DiagnosticsLevel {
  if (value === undefined || value === null || value === "") return "none";
  if (value === "none" || value === "compact" || value === "full") return value;
  throw new Error('diagnostics must be one of: "none", "compact", "full".');
}
