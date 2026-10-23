import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT_DIR = process.cwd();
const RESUME_PATH = path.join(ROOT_DIR, "src", "data", "resume.yaml");
const CACHE_PATH = path.join(ROOT_DIR, "src", "data", "github-prs-cache.json");

interface CachedPR {
  owner: string;
  repo: string;
  number: number;
  state?: "open" | "closed";
  merged?: boolean;
  mergedAt?: string | null;
  title?: string;
  author?: string;
  notFound?: boolean;
  error?: string;
}

interface CacheStructure {
  _lastUpdated: string;
  prs: Record<string, CachedPR>;
  projects: Record<
    string,
    {
      badge: string;
      prStatus: "merged" | "open" | "closed";
    }
  >;
}

function loadCache(): CacheStructure {
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const content = fs.readFileSync(CACHE_PATH, "utf-8");
      return JSON.parse(content);
    } catch {
      // invalid cache, recreate
    }
  }
  return {
    _lastUpdated: new Date().toISOString(),
    prs: {},
    projects: {},
  };
}

function saveCache(cache: CacheStructure) {
  cache._lastUpdated = new Date().toISOString();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

function parseGithubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function parsePRNumbers(
  url?: string,
  explicitPrs?: (number | string)[],
  desc?: string,
): number[] {
  if (explicitPrs && explicitPrs.length > 0) {
    return explicitPrs.map((n) => Number(n)).filter((n) => !isNaN(n));
  }
  if (url) {
    const prMatch = url.match(/\/pull\/(\d+)/);
    if (prMatch) {
      return [parseInt(prMatch[1], 10)];
    }
  }
  if (desc) {
    const matches = Array.from(desc.matchAll(/#(\d+)/g));
    if (matches.length > 0) {
      return matches.map((m) => parseInt(m[1], 10));
    }
  }
  return [];
}

async function fetchPR(
  owner: string,
  repo: string,
  prNumber: number,
  token?: string,
): Promise<CachedPR | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const headers: Record<string, string> = {
    "User-Agent": "Astro-Portfolio-PR-Fetcher",
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(6000),
    });

    if (res.status === 200) {
      const data = (await res.json()) as any;
      return {
        owner,
        repo,
        number: prNumber,
        state: data.state,
        merged: Boolean(data.merged),
        mergedAt: data.merged_at || null,
        title: data.title,
        author: data.user?.login,
      };
    }

    if (res.status === 404) {
      console.warn(
        `[github-prs] PR ${owner}/${repo}#${prNumber} not found (HTTP 404).`,
      );
      return {
        owner,
        repo,
        number: prNumber,
        notFound: true,
      };
    }

    if (res.status === 403) {
      const rateLimitReset = res.headers.get("x-ratelimit-reset");
      console.warn(
        `[github-prs] Rate limit reached (HTTP 403). Reset: ${
          rateLimitReset
            ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString()
            : "unknown"
        }`,
      );
      return null;
    }

    console.warn(
      `[github-prs] Unexpected status ${res.status} for ${owner}/${repo}#${prNumber}`,
    );
    return null;
  } catch (err: any) {
    console.warn(
      `[github-prs] Network error fetching ${owner}/${repo}#${prNumber}: ${err.message}`,
    );
    return null;
  }
}

async function main() {
  console.log("--- Fetching / Verifying GitHub PR Statuses ---");

  if (!fs.existsSync(RESUME_PATH)) {
    console.warn("[github-prs] resume.yaml not found, skipping.");
    return;
  }

  const rawYaml = fs.readFileSync(RESUME_PATH, "utf-8");
  const doc = yaml.load(rawYaml) as any;
  const contributions = doc?.open_source_contributions || [];

  if (contributions.length === 0) {
    console.log("[github-prs] No open source contributions found.");
    return;
  }

  const cache = loadCache();
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  for (const item of contributions) {
    if (item.hide) continue;
    const repoInfo = parseGithubRepo(item.url);
    if (!repoInfo) continue;

    const prNumbers = parsePRNumbers(item.url, item.prs, item.description);
    if (prNumbers.length === 0) continue;

    const prResults: CachedPR[] = [];

    for (const prNum of prNumbers) {
      const cacheKey = `${repoInfo.owner}/${repoInfo.repo}#${prNum}`;
      const existing = cache.prs[cacheKey];

      // Immutable check: if already verified as merged, no need to query GitHub again
      if (existing && existing.merged) {
        prResults.push(existing);
        continue;
      }

      // If already known notFound, keep existing
      if (existing && existing.notFound) {
        prResults.push(existing);
        continue;
      }

      console.log(`[github-prs] Querying GitHub API for ${cacheKey}...`);
      const fetched = await fetchPR(
        repoInfo.owner,
        repoInfo.repo,
        prNum,
        token,
      );

      if (fetched) {
        cache.prs[cacheKey] = fetched;
        prResults.push(fetched);
      } else if (existing) {
        // Fallback to existing cache if API call returned null
        prResults.push(existing);
      }
    }

    // Determine aggregate badge and status for this project
    const allMerged =
      prResults.length > 0 &&
      prResults.every(
        (p) => p.merged || (p.notFound && item.badge?.includes("Merged")),
      );

    const anyOpen = prResults.some((p) => p.state === "open");

    let status: "merged" | "open" | "closed" = "merged";
    let badgeText = item.badge || `PR #${prNumbers.join(", #")}`;

    if (allMerged) {
      status = "merged";
      badgeText = `Merged PR #${prNumbers.join(", #")}`;
    } else if (anyOpen) {
      status = "open";
      badgeText = `Open PR #${prNumbers.join(", #")}`;
    } else if (
      prResults.length > 0 &&
      prResults.every((p) => p.state === "closed" && !p.merged)
    ) {
      status = "closed";
      badgeText = `Closed PR #${prNumbers.join(", #")}`;
    }

    cache.projects[item.name] = {
      badge: badgeText,
      prStatus: status,
    };
  }

  saveCache(cache);
  console.log(
    `--- GitHub PRs successfully verified & cached in ${path.relative(ROOT_DIR, CACHE_PATH)} ---`,
  );
}

main().catch((err) => {
  console.warn(`[github-prs] Non-fatal script warning: ${err.message}`);
  process.exit(0);
});
