export interface IngestionSeed {
  id: string;
  name: string;
  docsUrl: string;
  githubUrl: string;
  openapiUrl?: string;
  baseUrl: string;
}

export interface GithubMetadata {
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  lastPushedAt: string;
  license: string | null;
  description: string | null;
}

export interface OpenApiSummary {
  title: string | null;
  version: string | null;
  endpointCount: number;
  servers: string[];
}

export interface IngestionDraft {
  id: string;
  fetchedAt: string;
  github: GithubMetadata | null;
  openapi: OpenApiSummary | null;
  errors: string[];
}
