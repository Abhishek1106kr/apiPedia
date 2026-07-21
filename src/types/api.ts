// Shape of an API catalog entry as currently produced by src/app/data.ts.
// This is the mock-data schema described in docs/00-master-prompt.md — it
// doubles as the first draft of the Phase 2 database schema, so keep field
// names in sync if the backend model diverges.

export interface ApiVitals {
  healthScore: number;
  latency: number;
  uptime: number;
  docsScore: number;
  sdkScore: number;
  communityScore: number;
  githubActivity: string;
  status: string;
  responseTime: string;
  popularity: number;
  security: string;
  community: string;
  aiConfidence: number;
  lastUpdated: string;
  commitsCount: string;
  version: string;
  rateLimit: string;
  authType: string;
  responseFormat: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface ApiDnaSimilarity {
  target: string;
  percentage: number;
  reason: string;
}

export interface ApiDnaRadar {
  auth: number;
  performance: number;
  docs: number;
  dx: number;
  pricing: number;
}

export interface ApiDnaEvolutionEvent {
  date: string;
  event: string;
}

export interface ApiDna {
  similarities: ApiDnaSimilarity[];
  radar: ApiDnaRadar;
  migrationComplexity: string;
  breakingChangesPredictor: number;
  evolutionTimeline: ApiDnaEvolutionEvent[];
  sdkMaturity: string;
  deprecationRisk: string;
}

export interface ApiConfusingEndpoint {
  path: string;
  complexity: string;
}

export interface ApiCommonError {
  code: string;
  description: string;
  remedy: string;
}

export interface ApiPainIndex {
  githubIssues: number;
  stackoverflowQuestions: number;
  discordMentions: number;
  redditActivity: string;
  learningDifficulty: string;
  topComplaints: string[];
  confusingEndpoints: ApiConfusingEndpoint[];
  commonErrors: ApiCommonError[];
}

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiCodeExamples {
  curl?: string;
  python?: string;
  javascript?: string;
  go?: string;
}

export interface ApiEndpointResponse {
  status: number;
  body: unknown;
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  description: string;
  authRequired: boolean;
  rateLimit: string;
  params: ApiParam[];
  codeExamples: ApiCodeExamples;
  response: ApiEndpointResponse;
}

export interface ApiRecipe {
  title: string;
  framework: string;
  duration: string;
  difficulty: string;
  diagram: string;
  code: string;
}

export interface ApiLearningPath {
  id: string;
  name: string;
  progress: number;
  steps: string[];
}

export interface ApiAnalytics {
  labels: string[];
  latency: number[];
  uptime: number[];
  errors: number[];
}

export interface ApiEntry {
  id: string;
  name: string;
  logoColor: string;
  category: string;
  verified: boolean;
  tagline: string;
  description: string;
  docsUrl: string;
  githubUrl: string;
  openapiUrl: string;
  postmanUrl: string;
  sandboxAvailable: boolean;
  baseUrl: string;
  vitals: ApiVitals;
  dna: ApiDna;
  painIndex: ApiPainIndex;
  endpoints: ApiEndpoint[];
  recipes: ApiRecipe[];
  paths: ApiLearningPath[];
  analytics: ApiAnalytics;
}

export type MetricValue = string | number | undefined | null;

export type MetricClassification = "best" | "weakest" | "neutral" | "missing";

export interface MetricRow {
  key: string;
  label: string;
  get: (api: ApiEntry) => MetricValue;
  type?: "progress" | "progress_inverse";
  min?: number;
  max?: number;
  unit?: string;
}

export type MetricGroups = Record<string, MetricRow[]>;

export type SortBy =
  | "health"
  | "latency"
  | "sdk"
  | "docs"
  | "popularity"
  | "community"
  | "alpha";
