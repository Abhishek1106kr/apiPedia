export interface TrustScoreInput {
  spamScore: number; // 0-100, higher = more spam-like
  isDuplicate: boolean;
  githubVerified: boolean | null; // null = not applicable (no GitHub source)
}

// Starts at 100 and subtracts for each negative signal. This is a starting
// point, not a calibrated model — the roadmap's Phase 4 prompt calls for
// comparing against official docs and running security scans too, neither
// of which exist yet. Every contribution stays PENDING regardless of score
// (see routes.ts) — this score informs moderator triage, it doesn't
// auto-approve or auto-reject anything yet.
export function computeTrustScore(input: TrustScoreInput): number {
  let score = 100;

  score -= input.spamScore * 0.6;

  if (input.isDuplicate) {
    score -= 40;
  }

  if (input.githubVerified === false) {
    score -= 25;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
