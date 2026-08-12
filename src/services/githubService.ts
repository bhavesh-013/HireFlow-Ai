/**
 * GitHub REST API Service
 * Handles all direct interactions with the GitHub API from the browser.
 * Public repos don't require authentication — unauthenticated rate limit is 60 req/hr.
 * Supports optional PAT for 5,000 req/hr.
 */

import { GitHubRepoItem, GitHubUserProfile, GitHubTreeItem } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com';

/** Files we want to fetch and analyze for technology extraction */
const IMPORTANT_FILES = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'requirements.txt',
  'pyproject.toml',
  'setup.py',
  'setup.cfg',
  'Pipfile',
  'Cargo.toml',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'composer.json',
  'Gemfile',
  'go.mod',
  'go.sum',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'README.md',
  'readme.md',
  'README.rst',
  'vite.config.ts',
  'vite.config.js',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'tailwind.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  'angular.json',
  'pubspec.yaml',
  'CMakeLists.txt',
  '.github/workflows/ci.yml',
  '.github/workflows/ci.yaml',
  '.github/workflows/main.yml',
  '.github/workflows/deploy.yml',
  'Makefile',
  'webpack.config.js',
  'webpack.config.ts',
  'rollup.config.js',
  'rollup.config.mjs',
  'nuxt.config.ts',
  'nuxt.config.js',
  'svelte.config.js',
  'astro.config.mjs',
  'remix.config.js',
  'drizzle.config.ts',
  'prisma/schema.prisma',
  '.eslintrc.json',
  '.eslintrc.js',
  'jest.config.js',
  'jest.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  'cypress.config.ts',
  'cypress.config.js',
]);

/** Directories to skip entirely when scanning the tree */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  'vendor',
  '__pycache__',
  '.git',
  'target',
  'out',
  '.cache',
  '.turbo',
]);

// ─── Concurrency Limiter ─────────────────────────────────────────────────────

class Semaphore {
  private queue: (() => void)[] = [];
  private running = 0;

  constructor(private maxConcurrent: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.running++;
        resolve();
      });
    });
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }
}

const fetchSemaphore = new Semaphore(3);

// ─── Request Helpers ─────────────────────────────────────────────────────────

let _patToken: string | null = null;

export function setGitHubPAT(token: string | null): void {
  _patToken = token;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (_patToken) {
    headers.Authorization = `Bearer ${_patToken}`;
  }
  return headers;
}

async function githubFetch<T>(url: string): Promise<T> {
  await fetchSemaphore.acquire();
  try {
    const res = await fetch(url, { headers: getHeaders() });

    if (res.status === 404) {
      throw new GitHubApiError('User not found', 404);
    }
    if (res.status === 403) {
      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (remaining === '0') {
        const resetTime = res.headers.get('X-RateLimit-Reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
        const minutes = resetDate
          ? Math.ceil((resetDate.getTime() - Date.now()) / 60000)
          : '?';
        throw new GitHubApiError(
          `GitHub API rate limit exceeded. Resets in ~${minutes} minutes. Add a Personal Access Token for higher limits.`,
          403
        );
      }
      throw new GitHubApiError('GitHub API access forbidden.', 403);
    }
    if (!res.ok) {
      throw new GitHubApiError(`GitHub API error: ${res.statusText}`, res.status);
    }

    return res.json();
  } finally {
    fetchSemaphore.release();
  }
}

// ─── Custom Error ────────────────────────────────────────────────────────────

export class GitHubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Validate and fetch a GitHub user profile.
 */
export async function validateUser(username: string): Promise<GitHubUserProfile> {
  const data = await githubFetch<any>(`${GITHUB_API}/users/${encodeURIComponent(username)}`);
  return {
    login: data.login,
    name: data.name,
    avatar_url: data.avatar_url,
    bio: data.bio,
    public_repos: data.public_repos,
    followers: data.followers,
    html_url: data.html_url,
  };
}

/**
 * Fetch all public repositories for a user.
 * Automatically paginates to get all repos.
 * Ignores forks by default.
 */
export async function fetchRepos(
  username: string,
  options: { includeForks?: boolean } = {}
): Promise<GitHubRepoItem[]> {
  const allRepos: GitHubRepoItem[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await githubFetch<any[]>(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`
    );

    if (!data || data.length === 0) break;

    for (const repo of data) {
      // Skip forks if not included
      if (repo.fork && !options.includeForks) continue;

      allRepos.push({
        id: `gh_${repo.id}`,
        name: repo.name,
        description: repo.description || '',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || '',
        topics: repo.topics || [],
        updatedAt: formatRelativeDate(repo.updated_at),
        url: repo.html_url,
        selected: false,
        isFork: repo.fork,
        isArchived: repo.archived,
        isPractice: detectPracticeRepo(repo.name, repo.description),
        defaultBranch: repo.default_branch || 'main',
      } as GitHubRepoItem & { isFork?: boolean; isArchived?: boolean; isPractice?: boolean; defaultBranch?: string });
    }

    if (data.length < perPage) break;
    page++;
  }

  return allRepos;
}

/**
 * Fetch the file tree for a repository.
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubTreeItem[]> {
  try {
    const data = await githubFetch<any>(
      `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
    );
    return (data.tree || []) as GitHubTreeItem[];
  } catch (err) {
    console.warn(`Failed to fetch tree for ${owner}/${repo}:`, err);
    return [];
  }
}

/**
 * Fetch the raw content of a single file from a repository.
 * Returns the decoded text content.
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const data = await githubFetch<any>(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`
  );

  if (data.encoding === 'base64' && data.content) {
    return atob(data.content.replace(/\n/g, ''));
  }

  return data.content || '';
}

/**
 * Given a file tree, identify and fetch all important config/dependency files.
 * Returns a map of filepath → file content.
 */
export async function fetchImportantFiles(
  owner: string,
  repo: string,
  tree: GitHubTreeItem[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Filter tree for important files, skipping blacklisted directories
  const filesToFetch = tree.filter((item) => {
    if (item.type !== 'blob') return false;

    // Check if any ancestor directory is blacklisted
    const parts = item.path.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      if (SKIP_DIRS.has(parts[i])) return false;
    }

    // Check if filename or full path matches important files
    const filename = parts[parts.length - 1];
    if (IMPORTANT_FILES.has(filename)) return true;
    if (IMPORTANT_FILES.has(item.path)) return true;

    // Match pattern-based important files (e.g. any .github/workflows/*.yml)
    if (item.path.startsWith('.github/workflows/') && (item.path.endsWith('.yml') || item.path.endsWith('.yaml'))) {
      return true;
    }

    return false;
  });

  // Limit to 15 files max per repo to stay within rate limits
  const limited = filesToFetch.slice(0, 15);

  // Fetch all files concurrently (semaphore controls max parallelism)
  const fetchPromises = limited.map(async (item) => {
    try {
      const content = await fetchFileContent(owner, repo, item.path);
      results.set(item.path, content);
    } catch (err) {
      console.warn(`Failed to fetch ${item.path} from ${owner}/${repo}:`, err);
    }
  });

  await Promise.all(fetchPromises);
  return results;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function formatRelativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function detectPracticeRepo(name: string, description?: string): boolean {
  const practiceKeywords = [
    'tutorial', 'practice', 'learning', 'exercise', 'homework',
    'assignment', 'course', 'bootcamp', 'hello-world', 'test-repo',
    'sandbox', 'playground', 'demo', 'example',
  ];
  const combined = `${name} ${description || ''}`.toLowerCase();
  return practiceKeywords.some((kw) => combined.includes(kw));
}

// ─── Repo Metadata Cache ────────────────────────────────────────────────────

const repoCache = new Map<string, { tree: GitHubTreeItem[]; files: Map<string, string> }>();

export function getCachedRepoData(repoKey: string) {
  return repoCache.get(repoKey);
}

export function setCachedRepoData(
  repoKey: string,
  tree: GitHubTreeItem[],
  files: Map<string, string>
) {
  repoCache.set(repoKey, { tree, files });
}

export function clearCache() {
  repoCache.clear();
}

export const githubService = {
  validateUser,
  fetchRepos,
  fetchRepoTree,
  fetchFileContent,
  fetchImportantFiles,
  setGitHubPAT,
  getCachedRepoData,
  setCachedRepoData,
  clearCache,
};

export default githubService;
