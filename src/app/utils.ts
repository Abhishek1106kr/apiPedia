import type {
  ApiEntry,
  MetricClassification,
  MetricGroups,
  MetricRow,
  MetricValue,
  SortBy,
} from "@/types/api";

// Collapsible metric rows grouped into 11 developer categories
export const METRIC_GROUPS: MetricGroups = {
  "Overview": [
    { key: "category", label: "Category", get: (api) => api.category },
    { key: "health", label: "Health Score", get: (api) => api.vitals.healthScore, type: "progress", min: 80, max: 100, unit: "%" },
    { key: "uptime", label: "Uptime guarantee", get: (api) => api.vitals.uptime, type: "progress", min: 99.0, max: 100.0, unit: "%" }
  ],
  "Authentication": [
    { key: "auth", label: "Authentication Type", get: (api) => api.vitals.authType }
  ],
  "Performance": [
    { key: "latency", label: "Average Latency", get: (api) => api.vitals.latency, type: "progress_inverse", min: 40, max: 400, unit: "ms" },
    { key: "responseTime", label: "Response Time", get: (api) => api.vitals.responseTime }
  ],
  "Documentation": [
    { key: "docsScore", label: "Documentation Score", get: (api) => api.vitals.docsScore, type: "progress", min: 5, max: 10, unit: "/10" },
    { key: "openapi", label: "OpenAPI Spec", get: (api) => api.openapiUrl ? "✓ Available" : "— Missing" },
    { key: "postman", label: "Postman Collection", get: (api) => api.postmanUrl ? "✓ Available" : "— Missing" }
  ],
  "SDKs": [
    { key: "sdkScore", label: "SDK Quality Score", get: (api) => api.vitals.sdkScore, type: "progress", min: 5, max: 10, unit: "/10" },
    { key: "sdkLangs", label: "SDK Languages", get: (api) => api.id === "stripe" || api.id === "github" ? 12 : api.id === "clerk" || api.id === "razorpay" ? 8 : 10 },
    { key: "sandbox", label: "Sandbox Mode", get: (api) => api.sandboxAvailable ? "Yes" : "No" }
  ],
  "Pricing": [
    { key: "rateLimit", label: "Rate Limits", get: (api) => api.vitals.rateLimit }
  ],
  "Security": [
    { key: "security", label: "Security Profile", get: (api) => api.vitals.security }
  ],
  "Community": [
    { key: "community", label: "GitHub Stars / Community", get: (api) => api.vitals.community },
    { key: "githubActivity", label: "GitHub Activity", get: (api) => api.vitals.githubActivity }
  ],
  "Developer Experience": [
    { key: "pain", label: "Developer Pain Index", get: (api) => api.painIndex.learningDifficulty },
    { key: "issues", label: "Active Repo Issues", get: (api) => api.painIndex.githubIssues, type: "progress_inverse", min: 10, max: 200, unit: "" }
  ],
  "Reliability": [
    { key: "deprecation", label: "Deprecation Risk", get: (api) => api.dna.deprecationRisk }
  ],
  "AI Insights": [
    { key: "breaking", label: "6m Breaking Prediction", get: (api) => api.dna.breakingChangesPredictor, type: "progress_inverse", min: 0.5, max: 5.0, unit: "%" },
    { key: "aiConfidence", label: "AI Integration Confidence", get: (api) => api.vitals.aiConfidence, type: "progress", min: 80, max: 100, unit: "%" }
  ]
};

export const getMetricValueType = (val: MetricValue): "missing" | "normal" => {
  if (val === undefined || val === null || val === "" || String(val).includes("Missing") || String(val).includes("—")) {
    return "missing";
  }
  return "normal";
};

// Computes best (green), average (neutral), weakest (orange), or missing (gray) categories dynamically
export const getMetricClassifications = (
  metric: MetricRow,
  apis: ApiEntry[]
): Record<string, MetricClassification> => {
  const classifications: Record<string, MetricClassification> = {};
  if (!metric.type) {
    apis.forEach(api => {
      classifications[api.id] = getMetricValueType(metric.get(api)) === "missing" ? "missing" : "neutral";
    });
    return classifications;
  }

  const apiValues = apis.map(api => {
    const raw = metric.get(api);
    if (getMetricValueType(raw) === "missing") return { apiId: api.id, val: null as number | null };
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ''));
    return { apiId: api.id, val: isNaN(num) ? null : num };
  });

  const validValues = apiValues.filter(av => av.val !== null);
  if (validValues.length <= 1) {
    apis.forEach(api => {
      classifications[api.id] = getMetricValueType(metric.get(api)) === "missing" ? "missing" : "neutral";
    });
    return classifications;
  }

  const nums = validValues.map(av => av.val as number);
  const minVal = Math.min(...nums);
  const maxVal = Math.max(...nums);

  if (minVal === maxVal) {
    apis.forEach(api => {
      classifications[api.id] = getMetricValueType(metric.get(api)) === "missing" ? "missing" : "neutral";
    });
    return classifications;
  }

  apiValues.forEach(av => {
    if (av.val === null) {
      classifications[av.apiId] = "missing";
    } else if (metric.type === "progress") {
      if (av.val === maxVal) classifications[av.apiId] = "best";
      else if (av.val === minVal) classifications[av.apiId] = "weakest";
      else classifications[av.apiId] = "neutral";
    } else if (metric.type === "progress_inverse") {
      if (av.val === minVal) classifications[av.apiId] = "best";
      else if (av.val === maxVal) classifications[av.apiId] = "weakest";
      else classifications[av.apiId] = "neutral";
    } else {
      classifications[av.apiId] = "neutral";
    }
  });

  return classifications;
};

// Check if all values are identical (for hide identical toggle filter)
export const checkIsRowIdentical = (row: MetricRow, apis: ApiEntry[]): boolean => {
  if (apis.length <= 1) return true;
  const firstVal = String(row.get(apis[0])).toLowerCase().trim();
  return apis.every(a => String(row.get(a)).toLowerCase().trim() === firstVal);
};

// Dynamically sorts active columns lists
export const sortComparedApis = (apis: ApiEntry[], sortType: SortBy): ApiEntry[] => {
  return [...apis].sort((a, b) => {
    switch (sortType) {
      case "health":
        return b.vitals.healthScore - a.vitals.healthScore;
      case "latency":
        return a.vitals.latency - b.vitals.latency;
      case "sdk":
        return b.vitals.sdkScore - a.vitals.sdkScore;
      case "docs":
        return b.vitals.docsScore - a.vitals.docsScore;
      case "popularity":
        return b.vitals.popularity - a.vitals.popularity;
      case "community": {
        const starsA = parseFloat(a.vitals.community.replace(/[^0-9.]/g, '')) || 0;
        const starsB = parseFloat(b.vitals.community.replace(/[^0-9.]/g, '')) || 0;
        return starsB - starsA;
      }
      case "alpha":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
};
