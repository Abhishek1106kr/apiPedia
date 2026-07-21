import type { GithubMetadata } from "../types.js";

function parseOwnerRepo(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function fetchGithubMetadata(githubUrl: string): Promise<GithubMetadata> {
  const parsed = parseOwnerRepo(githubUrl);
  if (!parsed) {
    throw new Error(`Could not parse owner/repo from GitHub URL: ${githubUrl}`);
  }

  const headers: Record<string, string> = {
    "User-Agent": "apipedia-ingestion",
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status} for ${parsed.owner}/${parsed.repo}`);
  }

  const body = (await response.json()) as {
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    default_branch: string;
    pushed_at: string;
    license: { name: string } | null;
    description: string | null;
  };

  return {
    stars: body.stargazers_count,
    forks: body.forks_count,
    openIssues: body.open_issues_count,
    defaultBranch: body.default_branch,
    lastPushedAt: body.pushed_at,
    license: body.license?.name ?? null,
    description: body.description,
  };
}
