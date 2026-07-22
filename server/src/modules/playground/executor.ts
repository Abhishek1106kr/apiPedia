import { assertUrlIsSafe } from "./ssrfGuard.js";
import type { ExecuteRequestInput } from "./schemas.js";

export interface ExecutionResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  latencyMs: number;
  truncated: boolean;
}

const MAX_BODY_CHARS = 200_000; // ~200KB of text; playground is for inspection, not bulk transfer

// Executes one HTTP request on the caller's behalf and returns the raw
// response. This is intentionally a thin passthrough (no response
// interpretation/pretty-printing) — that belongs in the frontend playground
// UI, not here. Response bodies are read fully then truncated as text
// rather than streamed with a hard byte cap; for a public-facing deployment
// this should switch to a streaming reader with a real byte limit so a
// malicious target can't exhaust memory before the string truncation runs.
export async function executeRequest(input: ExecuteRequestInput): Promise<ExecutionResult> {
  await assertUrlIsSafe(input.url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

  const start = performance.now();
  try {
    const response = await fetch(input.url, {
      method: input.method,
      headers: input.headers,
      body: input.method === "GET" ? undefined : input.body,
      signal: controller.signal,
      redirect: "manual", // avoid silently following a redirect into a private address
    });

    const latencyMs = Math.round(performance.now() - start);
    const rawBody = await response.text();
    const truncated = rawBody.length > MAX_BODY_CHARS;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body: truncated ? rawBody.slice(0, MAX_BODY_CHARS) : rawBody,
      latencyMs,
      truncated,
    };
  } finally {
    clearTimeout(timeout);
  }
}
