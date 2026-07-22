import type { IngestionSeed } from "./types.js";

// Hand-seeded source URLs for a small starting set of APIs. Automatically
// *discovering* these (official docs, OpenAPI spec, GitHub repo) from just
// a name — as the roadmap's Phase 3 prompt describes — is a separate,
// larger piece of work (search + AI-assisted resolution); this seed list
// is the v0 that lets the fetch/analyze/score pipeline exist and be tested
// end-to-end before that discovery step is built.
export const INGESTION_SEEDS: Record<string, IngestionSeed> = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    docsUrl: "https://stripe.com/docs/api",
    githubUrl: "https://github.com/stripe/stripe-node",
    openapiUrl: "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
    baseUrl: "https://api.stripe.com",
  },
  github: {
    id: "github",
    name: "GitHub",
    docsUrl: "https://docs.github.com/en/rest",
    githubUrl: "https://github.com/octokit/octokit.js",
    openapiUrl: "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
    baseUrl: "https://api.github.com",
  },
  clerk: {
    id: "clerk",
    name: "Clerk",
    docsUrl: "https://clerk.com/docs/reference/backend-api",
    githubUrl: "https://github.com/clerk/clerk-sdk-go",
    openapiUrl: "https://raw.githubusercontent.com/clerk/openapi-specs/main/bapi/2026-05-12.yml",
    baseUrl: "https://api.clerk.com/v1",
  },
};

export function getIngestionSeed(id: string): IngestionSeed | undefined {
  return INGESTION_SEEDS[id];
}
