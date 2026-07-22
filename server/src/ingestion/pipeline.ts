import { getIngestionSeed } from "./seeds.js";
import { fetchGithubMetadata } from "./sources/github.js";
import { fetchOpenApiSummary } from "./sources/openapi.js";
import type { IngestionDraft } from "./types.js";

// Runs the fetch/analyze steps for one API and returns a draft record. This
// does not write to the database or run AI analysis, latency benchmarking,
// or screenshot generation yet — those are the next slices of Phase 3.
// Individual source failures (e.g. GitHub rate limiting) are collected into
// `errors` rather than failing the whole ingestion, since a partial draft
// is still useful for review.
export async function runIngestion(apiId: string): Promise<IngestionDraft> {
  const seed = getIngestionSeed(apiId);
  if (!seed) {
    throw new Error(`No ingestion seed registered for "${apiId}". See src/ingestion/seeds.ts.`);
  }

  const errors: string[] = [];

  const github = await fetchGithubMetadata(seed.githubUrl).catch((err: Error) => {
    errors.push(`github: ${err.message}`);
    return null;
  });

  const openapi = seed.openapiUrl
    ? await fetchOpenApiSummary(seed.openapiUrl).catch((err: Error) => {
        errors.push(`openapi: ${err.message}`);
        return null;
      })
    : null;

  return {
    id: apiId,
    fetchedAt: new Date().toISOString(),
    github,
    openapi,
    errors,
  };
}
