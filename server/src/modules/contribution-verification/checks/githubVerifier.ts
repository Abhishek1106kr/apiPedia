import { parseGithubOwnerRepo } from "../../../lib/githubUrl.js";

// Returns null when sourceUrl isn't a GitHub link (not applicable, not a
// failure) — true/false only when it is one and we could/couldn't confirm
// the repo actually exists.
export async function verifyGithubSource(sourceUrl: string | null | undefined): Promise<boolean | null> {
  if (!sourceUrl || !sourceUrl.includes("github.com")) {
    return null;
  }

  const parsed = parseGithubOwnerRepo(sourceUrl);
  if (!parsed) return false;

  const headers: Record<string, string> = {
    "User-Agent": "apipedia-contribution-verification",
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}
