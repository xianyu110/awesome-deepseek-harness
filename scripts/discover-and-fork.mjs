import { readFile, writeFile } from "node:fs/promises";

const API_ROOT = "https://api.github.com";
const TARGET_OWNER = process.env.TARGET_OWNER || "xianyu110";
const TARGET_REPO = process.env.TARGET_REPO || process.env.GITHUB_REPOSITORY?.split("/").pop() || "awesome-deepseek-harness";
const TOKEN = process.env.GITHUB_TOKEN || process.env.FORK_TOKEN || "";
const DRY_RUN = /^(1|true|yes)$/i.test(process.env.DRY_RUN || "");
const MAX_NEW_ENTRIES = positiveInt(process.env.MAX_NEW_ENTRIES, 20);
const MAX_SEARCH_RESULTS = positiveInt(process.env.MAX_SEARCH_RESULTS, 100);
const README_PATH = new URL("../README.md", import.meta.url);
const START_MARKER = "<!-- BEGIN DEEPSEEK-HARNESS-AUTO-DISCOVERY -->";
const END_MARKER = "<!-- END DEEPSEEK-HARNESS-AUTO-DISCOVERY -->";

if (!TOKEN && !DRY_RUN) {
  throw new Error("FORK_TOKEN or GITHUB_TOKEN is required unless DRY_RUN is enabled");
}

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "awesome-deepseek-harness-discovery",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function oneLine(value, maxLength = 180) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function repoKey(fullName) {
  return String(fullName).toLowerCase();
}

function sameRepo(left, right) {
  return repoKey(left) === repoKey(right);
}

function externalHomepage(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.hostname.toLowerCase() === "github.com") return "";
    return url.href;
  } catch {
    return "";
  }
}

async function request(path, init = {}, { allow404 = false } = {}) {
  const url = path.startsWith("http") ? path : `${API_ROOT}${path}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init.headers || {}) },
    });
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: oneLine(text, 300) };
      }
    }

    if (response.ok) return data;
    if (response.status === 404 && allow404) return null;

    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < 2) {
      const retryAfter = Number.parseInt(response.headers.get("retry-after") || "2", 10);
      await sleep(Math.min(Math.max(retryAfter, 1), 15) * 1000);
      continue;
    }

    const message = data?.message ? oneLine(data.message, 300) : `HTTP ${response.status}`;
    throw new Error(`${response.status} ${message}`);
  }

  throw new Error(`GitHub request failed: ${path}`);
}

async function searchRepositories(query, source) {
  const params = new URLSearchParams({
    q: query,
    sort: "updated",
    order: "desc",
    per_page: String(MAX_SEARCH_RESULTS),
  });
  const result = await request(`/search/repositories?${params}`);
  return (result?.items || []).map((item) => ({
    full_name: item.full_name,
    name: item.name,
    html_url: item.html_url,
    homepage: item.homepage,
    description: item.description,
    stargazers_count: item.stargazers_count || 0,
    archived: item.archived,
    disabled: item.disabled,
    fork: item.fork,
    owner: item.owner,
    discoverySources: new Set([source]),
  }));
}

function extractRepoLinks(readme) {
  const found = new Set();
  const pattern = /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g;
  for (const match of readme.matchAll(pattern)) found.add(repoKey(`${match[1]}/${match[2]}`));
  return found;
}

async function canonicalizeAutoBlock(readme) {
  const markerPattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);
  const match = readme.match(markerPattern);
  if (!match) return { readme, replaced: 0 };

  const block = match[0];
  const linkPattern = new RegExp(`https://github\\.com/${TARGET_OWNER}/([A-Za-z0-9_.-]+)`, "g");
  const names = [...block.matchAll(linkPattern)].map((entry) => entry[1]);
  let nextBlock = block;
  let replaced = 0;

  for (const name of new Set(names)) {
    const repo = await request(`/repos/${TARGET_OWNER}/${name}`, {}, { allow404: true });
    const upstream = repo?.fork ? repo.parent?.full_name : null;
    if (!upstream || sameRepo(upstream, `${TARGET_OWNER}/${name}`)) continue;

    const currentUrl = `https://github.com/${TARGET_OWNER}/${name}`;
    const upstreamUrl = `https://github.com/${upstream}`;
    if (nextBlock.includes(currentUrl)) {
      nextBlock = nextBlock.replaceAll(currentUrl, upstreamUrl);
      replaced += 1;
    }
  }

  return { readme: readme.replace(block, nextBlock), replaced };
}

function renderAutoBlock(entries) {
  const lines = entries.length
    ? entries.map((entry) => {
      const sources = [...entry.discoverySources].join(" + ");
      const stars = `★ ${entry.stargazers_count || 0}`;
      const homepage = externalHomepage(entry.homepage);
      const website = homepage ? `[官网](${homepage})` : "";
      return `- [${entry.full_name}](${entry.html_url}) - ${oneLine(entry.description) || "未提供项目描述"}（${stars}；来源：${sources}）${website}`;
      })
    : ["本次运行未发现新的候选项目。"];

  return [
    START_MARKER,
    "### 自动发现项目",
    "",
    "以下条目由 GitHub Actions 根据 `dsh-plugin` Topic 或 `deepseek-harness` 搜索结果自动维护。",
    "",
    ...lines,
    END_MARKER,
  ].join("\n");
}

async function updateReadme(readme, entries) {
  const block = renderAutoBlock(entries);
  const markerPattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);
  if (markerPattern.test(readme)) return readme.replace(markerPattern, block);

  const insertionPoint = "## 收录范围";
  if (!readme.includes(insertionPoint)) return `${readme.trimEnd()}\n\n${block}\n`;
  return readme.replace(insertionPoint, `${block}\n\n${insertionPoint}`);
}

async function main() {
  const originalReadme = await readFile(README_PATH, "utf8");
  const canonicalized = await canonicalizeAutoBlock(originalReadme);
  const readme = canonicalized.readme;
  const knownRepos = extractRepoLinks(readme);
  const queries = [
    ["topic:dsh-plugin", "dsh-plugin"],
    ["\"deepseek-harness\" in:name,description,readme", "deepseek-harness"],
  ];
  const candidates = new Map();

  for (const [query, source] of queries) {
    const results = await searchRepositories(query, source);
    for (const result of results) {
      if (
        result.owner?.login?.toLowerCase() === TARGET_OWNER.toLowerCase() ||
        result.archived ||
        result.disabled ||
        result.fork ||
        sameRepo(result.full_name, `${TARGET_OWNER}/${TARGET_REPO}`)
      ) {
        continue;
      }

      const key = repoKey(result.full_name);
      const existing = candidates.get(key);
      if (existing) existing.discoverySources.add(source);
      else candidates.set(key, result);
    }
  }

  const newCandidates = [...candidates.values()]
    .filter((candidate) => !knownRepos.has(repoKey(candidate.full_name)))
    .sort((left, right) => (right.stargazers_count || 0) - (left.stargazers_count || 0))
    .slice(0, MAX_NEW_ENTRIES);

  const nextReadme = await updateReadme(readme, newCandidates);

  if (!DRY_RUN && nextReadme !== readme) {
    await writeFile(README_PATH, nextReadme, "utf8");
  }

  console.log(
    JSON.stringify({
      dryRun: DRY_RUN,
      canonicalizedLinks: canonicalized.replaced,
      searchCandidates: candidates.size,
      newCandidates: newCandidates.length,
    }),
  );
}

main().catch((error) => {
  console.error(`[discover-and-fork] ${error.message}`);
  process.exitCode = 1;
});
