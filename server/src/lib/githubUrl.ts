export interface OwnerRepo {
  owner: string;
  repo: string;
}

export function parseGithubOwnerRepo(githubUrl: string): OwnerRepo | null {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
