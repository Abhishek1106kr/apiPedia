import { load as loadYaml } from "js-yaml";
import type { OpenApiSummary } from "../types.js";

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
}

export interface OpenApiDocument {
  info?: { title?: string; version?: string };
  paths?: Record<string, Record<string, OpenApiOperation>>;
  servers?: Array<{ url?: string }>;
}

export async function fetchOpenApiDocument(specUrl: string): Promise<OpenApiDocument> {
  const response = await fetch(specUrl);
  if (!response.ok) {
    throw new Error(`Fetching OpenAPI spec returned ${response.status}: ${specUrl}`);
  }

  const raw = await response.text();
  // js-yaml parses both YAML and JSON documents, so this works regardless
  // of which format the spec is published in (the seeds mix both).
  return loadYaml(raw) as OpenApiDocument;
}

export async function fetchOpenApiSummary(specUrl: string): Promise<OpenApiSummary> {
  const doc = await fetchOpenApiDocument(specUrl);

  return {
    title: doc.info?.title ?? null,
    version: doc.info?.version ?? null,
    endpointCount: doc.paths ? Object.keys(doc.paths).length : 0,
    servers: (doc.servers ?? []).map((s) => s.url).filter((url): url is string => Boolean(url)),
  };
}
