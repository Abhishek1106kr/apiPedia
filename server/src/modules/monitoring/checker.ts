export interface CheckResult {
  isUp: boolean;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
}

const CHECK_TIMEOUT_MS = 8000;

// "Valid" here means reachable, not "returns 200" — most API base URLs
// correctly return 401/403 without credentials, and that response still
// proves the endpoint is live. Only a network failure, timeout, or DNS
// failure counts as down.
export async function checkEndpoint(url: string): Promise<CheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });
    const latencyMs = Math.round(performance.now() - start);

    return {
      isUp: true,
      statusCode: response.status,
      latencyMs,
      error: null,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      isUp: false,
      statusCode: null,
      latencyMs,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
