import type { ApiEntry } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiClientError(body.message ?? `Request to ${path} failed with ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function fetchApis(): Promise<ApiEntry[]> {
  return request<ApiEntry[]>("/api/apis");
}

export function fetchApiById(id: string): Promise<ApiEntry> {
  return request<ApiEntry>(`/api/apis/${encodeURIComponent(id)}`);
}
