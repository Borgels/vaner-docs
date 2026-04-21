#!/usr/bin/env node
/**
 * Fetches GitHub releases (paginated), caches the JSON locally, and refreshes the
 * generated block in content/docs/changelog.mdx.
 *
 * Usage:
 *   node scripts/sync-changelog-from-github.mjs
 *   node scripts/sync-changelog-from-github.mjs --force
 *   node scripts/sync-changelog-from-github.mjs --offline
 *   node scripts/sync-changelog-from-github.mjs --max-cache-age 0
 *
 * Env:
 *   GITHUB_TOKEN — optional; raises API rate limits when set.
 *
 * Recommendation: keep this as a manual / CI step (not necessarily every local dev
 * build) so docs builds stay deterministic offline. Always link to GitHub releases
 * in the page intro so readers can open issues, assets, and pre-releases.
 */

import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const DEFAULT_REPO = 'Borgels/vaner';
/** MDX-safe markers (HTML comments break the fumadocs-mdx parser). */
const MARKER_BEGIN = '{/* sync:github-releases begin */}';
const MARKER_END = '{/* sync:github-releases end */}';
const USER_AGENT = 'vaner-docs-changelog-sync';

function parseArgs(argv) {
  let force = false;
  let offline = false;
  let maxCacheAgeSec = 86_400; // 24h
  let repo = DEFAULT_REPO;
  let cachePath = resolve(repoRoot, 'scripts/.cache/github-releases.json');
  let changelogPath = resolve(repoRoot, 'content/docs/changelog.mdx');

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') force = true;
    else if (a === '--offline') offline = true;
    else if (a === '--max-cache-age') {
      maxCacheAgeSec = Number(argv[++i]);
      if (Number.isNaN(maxCacheAgeSec)) {
        throw new Error('--max-cache-age needs a number (seconds)');
      }
    } else if (a === '--repo') repo = argv[++i];
    else if (a === '--cache') cachePath = resolve(repoRoot, argv[++i]);
    else if (a === '--output') changelogPath = resolve(repoRoot, argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: sync-changelog-from-github.mjs [options]
  --force              Ignore cache age and refetch from GitHub
  --offline            Only read cache (no HTTP); fails if cache missing
  --max-cache-age N    Skip refetch if cache is newer than N seconds (default 86400)
  --repo owner/name    Default ${DEFAULT_REPO}
  --cache path         Cache file (default scripts/.cache/github-releases.json)
  --output path        changelog.mdx path (default content/docs/changelog.mdx)
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }

  return { force, offline, maxCacheAgeSec, repo, cachePath, changelogPath };
}

function parseNextUrl(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

const FETCH_TIMEOUT_MS = 60_000;

async function fetchAllReleases(repo, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const out = [];
  let url = `https://api.github.com/repos/${repo}/releases?per_page=100`;

  while (url) {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
    }
    const page = await res.json();
    if (!Array.isArray(page)) {
      throw new Error(
        `[sync-changelog] Expected JSON array from GitHub releases API, got ${typeof page}`,
      );
    }
    out.push(...page);
    url = parseNextUrl(res.headers.get('link'));
  }

  return out
    .filter((r) => !r.draft)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
}

function formatReleasesMdx(releases, repo) {
  const releasesUrl = `https://github.com/${repo}/releases`;
  const visibleReleases = releases.filter(
    (r) => !r.prerelease && !/-((rc|beta|alpha)[\d.-]*)$/i.test(r.tag_name || ''),
  );
  const lines = [
    '',
    `_The section below is generated from [GitHub Releases](${releasesUrl}). Edit release notes on GitHub, then run \`npm run sync:changelog -- --force\`._`,
    '',
  ];

  for (const r of visibleReleases) {
    const rawTitle = r.name?.trim() || r.tag_name || 'Release';
    const title = String(rawTitle).replace(/\s+/g, ' ').trim();
    const date = r.published_at
      ? new Date(r.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
    lines.push(`## ${title}`);
    lines.push('');
    lines.push(
      date
        ? `_Released ${date} · [Details on GitHub](${r.html_url})_`
        : `_[Details on GitHub](${r.html_url})_`,
    );
    lines.push('');
    const body = extractHighlights(r.body || '', r.html_url);
    lines.push(...body.map((item) => `- ${item}`));
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

const MAX_HIGHLIGHTS = 6;
const HEADER_RE = /^#{1,6}\s+/;
const FULL_CHANGELOG_RE = /^\*\*full changelog\*\*:\s*/i;
const SECTION_HEADING_RE = /^##?\s*(highlights|what'?s changed|new contributors)\s*$/i;
const DEPENDABOT_RE = /\bdependabot\b/i;
const CHORE_DEPS_RE = /\bchore\(deps\)\b/i;
const NO_NOTES_RE = /^_?no release notes provided\.?_?$/i;
const PR_ATTRIBUTION_RE = /\s+by\s+@[\w-]+\s+in\s+https?:\/\/\S+\s*$/i;

function normalizeHighlight(text) {
  return text
    .replace(/^\s*[-*]\s+/, '')
    .replace(PR_ATTRIBUTION_RE, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '');
}

function shouldSkipLine(line) {
  if (!line) return true;
  if (HEADER_RE.test(line)) return true;
  if (SECTION_HEADING_RE.test(line)) return true;
  if (FULL_CHANGELOG_RE.test(line)) return true;
  if (NO_NOTES_RE.test(line)) return true;
  if (DEPENDABOT_RE.test(line)) return true;
  if (CHORE_DEPS_RE.test(line)) return true;
  return false;
}

function extractHighlights(body, releaseUrl) {
  const candidates = [];
  let inFence = false;

  for (const rawLine of body.split('\n')) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence || shouldSkipLine(trimmed)) continue;

    const normalized = normalizeHighlight(trimmed);
    if (!normalized) continue;
    candidates.push(normalized);
  }

  const deduped = [...new Set(candidates)];
  if (deduped.length === 0) return ['See details on GitHub.'];

  if (deduped.length > MAX_HIGHLIGHTS) {
    return [
      ...deduped.slice(0, MAX_HIGHLIGHTS),
      `...and more on [GitHub](${releaseUrl}).`,
    ];
  }
  return deduped;
}

function patchChangelog(changelogPath, generatedInner) {
  const before = readFileSync(changelogPath, 'utf8');
  const block = `${MARKER_BEGIN}\n${generatedInner}${MARKER_END}`;

  if (before.includes(MARKER_BEGIN) && before.includes(MARKER_END)) {
    const next = before.replace(
      new RegExp(
        `${escapeRegExp(MARKER_BEGIN)}[\\s\\S]*?${escapeRegExp(MARKER_END)}`,
      ),
      block,
    );
    writeFileSync(changelogPath, next, 'utf8');
    return;
  }

  const appended = `${before.trimEnd()}\n\n${block}\n`;
  writeFileSync(changelogPath, appended, 'utf8');
  console.warn(
    `[sync-changelog] Added ${MARKER_BEGIN}…${MARKER_END} to ${changelogPath}; review placement.`,
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const args = parseArgs(process.argv);
const token = process.env.GITHUB_TOKEN;

mkdirSync(dirname(args.cachePath), { recursive: true });

let releases;
const cacheExists = existsSync(args.cachePath);

function readCachedReleases(cachePath) {
  const raw = JSON.parse(readFileSync(cachePath, 'utf8'));
  if (!raw || !Array.isArray(raw.releases)) {
    throw new Error(
      `[sync-changelog] Invalid cache at ${cachePath} (missing releases array)`,
    );
  }
  return raw.releases;
}

if (args.offline) {
  if (!cacheExists) {
    throw new Error(
      `[sync-changelog] --offline but no cache at ${args.cachePath}`,
    );
  }
  releases = readCachedReleases(args.cachePath);
} else {
  let useNetwork = args.force || !cacheExists;
  if (!useNetwork && cacheExists) {
    const stat = JSON.parse(readFileSync(args.cachePath, 'utf8'));
    const ageSec = (Date.now() - new Date(stat.fetchedAt).getTime()) / 1000;
    if (ageSec > args.maxCacheAgeSec) useNetwork = true;
  }

  if (!useNetwork && cacheExists) {
    releases = readCachedReleases(args.cachePath);
    console.log(
      `[sync-changelog] Using cache (fresh within ${args.maxCacheAgeSec}s).`,
    );
  } else {
    console.log(`[sync-changelog] Fetching releases from GitHub…`);
    releases = await fetchAllReleases(args.repo, token);
    writeFileSync(
      args.cachePath,
      JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          repo: args.repo,
          releases,
        },
        null,
        2,
      ),
      'utf8',
    );
    console.log(
      `[sync-changelog] Cached ${releases.length} releases → ${args.cachePath}`,
    );
  }
}

const inner = formatReleasesMdx(releases, args.repo);
patchChangelog(args.changelogPath, inner);
console.log(`[sync-changelog] Updated ${args.changelogPath}`);
