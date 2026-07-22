import { getIngestionSeed } from "../../ingestion/seeds.js";
import { fetchOpenApiDocument } from "../../ingestion/sources/openapi.js";
import { callGroq } from "./groqClient.js";

export interface ExplainEndpointInput {
  apiId: string;
  path: string;
  method: string;
}

export interface ExplainEndpointResult {
  apiId: string;
  path: string;
  method: string;
  explanation: string;
  groundedOn: {
    specUrl: string;
    operationSummary: string | null;
  };
}

// Grounds the explanation in the real, live OpenAPI spec for the requested
// endpoint (per docs/00-master-prompt.md Phase 6: ground AI responses in
// official specs, not invented behavior) rather than asking the model to
// explain an endpoint from its own training data, which risks describing a
// different API version or hallucinating parameters that don't exist.
export async function explainEndpoint(input: ExplainEndpointInput): Promise<ExplainEndpointResult> {
  const seed = getIngestionSeed(input.apiId);
  if (!seed) {
    throw new Error(`No known API "${input.apiId}". See src/ingestion/seeds.ts.`);
  }
  if (!seed.openapiUrl) {
    throw new Error(`"${input.apiId}" has no OpenAPI spec registered to ground an explanation in.`);
  }

  const doc = await fetchOpenApiDocument(seed.openapiUrl);
  const pathItem = doc.paths?.[input.path];
  const operation = pathItem?.[input.method.toLowerCase()];

  if (!operation) {
    throw new Error(
      `"${input.method} ${input.path}" was not found in ${seed.name}'s OpenAPI spec (${seed.openapiUrl}).`
    );
  }

  const prompt = [
    `You are explaining a real API endpoint to a developer integrating with ${seed.name}.`,
    `Endpoint: ${input.method.toUpperCase()} ${input.path}`,
    operation.summary ? `Summary from the spec: ${operation.summary}` : "",
    operation.description ? `Description from the spec: ${operation.description}` : "",
    operation.parameters ? `Parameters (raw spec fragment): ${JSON.stringify(operation.parameters).slice(0, 2000)}` : "",
    operation.responses ? `Response codes defined: ${Object.keys(operation.responses).join(", ")}` : "",
    "",
    "Explain in 3-5 sentences what this endpoint does, when a developer would call it, and one common mistake to avoid. Base the explanation only on the information given above — do not invent parameters or behavior not present in it.",
  ]
    .filter(Boolean)
    .join("\n");

  const explanation = await callGroq([
    { role: "system", content: "You are a precise technical writer for developer documentation. You never invent API behavior beyond what you're given." },
    { role: "user", content: prompt },
  ]);

  return {
    apiId: input.apiId,
    path: input.path,
    method: input.method.toUpperCase(),
    explanation,
    groundedOn: {
      specUrl: seed.openapiUrl,
      operationSummary: operation.summary ?? null,
    },
  };
}
