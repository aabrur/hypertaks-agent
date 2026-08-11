#!/usr/bin/env node
/**
 * Link check for Ticket #2 primary sources.
 * Required URLs must return HTTP success. Optional URLs report warnings only.
 */
const REQUIRED = [
  "https://arxiv.org/abs/2307.03172",
  "https://arxiv.org/abs/2104.08663",
  "https://arxiv.org/abs/2309.15217",
];

const OPTIONAL = [
  "https://export.arxiv.org/api/query?id_list=2307.03172,2104.08663,2309.15217",
  "https://www.jsonrpc.org/specification",
  "https://httpwg.org/specs/rfc9111.html",
  "https://modelcontextprotocol.io/specification/2025-11-25/server/tools",
  "https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf",
  "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/",
];

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    if (response.status === 405 || response.status === 403 || response.status === 404) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { Accept: "text/html,application/xhtml+xml,application/pdf,*/*" },
      });
    }
    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const requiredResults = [];
  for (const url of REQUIRED) {
    const result = await check(url);
    requiredResults.push(result);
    const label = result.ok ? "OK" : "FAIL";
    console.log(`${label} required status=${result.status} ${url}${result.error ? ` err=${result.error}` : ""}`);
  }

  for (const url of OPTIONAL) {
    const result = await check(url);
    const label = result.ok ? "OK" : "WARN";
    console.log(`${label} optional status=${result.status} ${url}${result.error ? ` err=${result.error}` : ""}`);
  }

  const failed = requiredResults.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`LINK_CHECK_FAILED count=${failed.length}`);
    process.exit(1);
  }
  console.log("LINK_CHECK_PASSED");
  process.exit(0);
}

main();
