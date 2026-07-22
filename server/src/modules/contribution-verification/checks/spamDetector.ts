export interface SpamCheckInput {
  title: string;
  body: string;
}

export interface SpamCheckResult {
  score: number; // 0 (clean) - 100 (spam)
  flags: string[];
}

const URL_PATTERN = /https?:\/\/\S+/gi;
const REPEATED_CHAR_PATTERN = /(.)\1{6,}/;
const MIN_BODY_LENGTH = 20;

// Heuristic, deterministic spam signals — cheap enough to run synchronously
// on every submission before it reaches a moderator queue. This is not a
// substitute for the AI-assisted validation the roadmap's Phase 4 prompt
// describes; it catches the cheap/obvious cases so moderators aren't
// triaging empty or link-spam submissions by hand.
export function checkForSpam({ title, body }: SpamCheckInput): SpamCheckResult {
  const flags: string[] = [];
  let score = 0;

  if (body.trim().length < MIN_BODY_LENGTH) {
    flags.push("body_too_short");
    score += 40;
  }

  const urls = body.match(URL_PATTERN) ?? [];
  if (urls.length >= 4) {
    flags.push("excessive_links");
    score += 30;
  }

  const linkDensity = urls.join("").length / Math.max(body.length, 1);
  if (linkDensity > 0.5) {
    flags.push("high_link_density");
    score += 20;
  }

  if (REPEATED_CHAR_PATTERN.test(title) || REPEATED_CHAR_PATTERN.test(body)) {
    flags.push("repeated_characters");
    score += 15;
  }

  if (title.trim().length === 0) {
    flags.push("empty_title");
    score += 25;
  }

  return { score: Math.min(score, 100), flags };
}
