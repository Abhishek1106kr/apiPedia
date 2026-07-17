import test from "node:test";
import assert from "node:assert";
import { 
  METRIC_GROUPS, 
  getMetricValueType, 
  getMetricClassifications, 
  checkIsRowIdentical, 
  sortComparedApis 
} from "../src/app/utils.js";

// Mock data mapping basic API properties for tests
const mockApis = [
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    vitals: { healthScore: 98, latency: 120, uptime: 99.99, docsScore: 9.7, sdkScore: 9.8, community: "18k Stars" },
    dna: { breakingChangesPredictor: 1.2 },
    painIndex: { githubIssues: 25 }
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "Payments",
    vitals: { healthScore: 92, latency: 240, uptime: 99.95, docsScore: 8.8, sdkScore: 8.5, community: "4k Stars" },
    dna: { breakingChangesPredictor: 2.8 },
    painIndex: { githubIssues: 85 }
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payments",
    vitals: { healthScore: 95, latency: 180, uptime: 99.97, docsScore: 9.3, sdkScore: 9.0, community: "11k Stars" },
    dna: { breakingChangesPredictor: 1.5 },
    painIndex: { githubIssues: 45 }
  }
];

test("METRIC_GROUPS contains valid structures", () => {
  assert.ok(METRIC_GROUPS.Overview, "Overview group exists");
  assert.ok(METRIC_GROUPS.Performance, "Performance group exists");
  assert.equal(typeof METRIC_GROUPS.Overview[0].get, "function", "Get is an accessor function");
});

test("getMetricValueType classifies correctly", () => {
  assert.equal(getMetricValueType("— Missing"), "missing");
  assert.equal(getMetricValueType(""), "missing");
  assert.equal(getMetricValueType(null), "missing");
  assert.equal(getMetricValueType("120ms"), "normal");
});

test("getMetricClassifications identifies best and weakest values", () => {
  // Metric: latency (progress_inverse - lower is better)
  const latencyMetric = METRIC_GROUPS.Performance[0];
  const classifications = getMetricClassifications(latencyMetric, mockApis);

  assert.equal(classifications.stripe, "best", "Stripe has lowest latency (120ms) - should be best");
  assert.equal(classifications.razorpay, "weakest", "Razorpay has highest latency (240ms) - should be weakest");
  assert.equal(classifications.paypal, "neutral", "PayPal has medium latency (180ms) - should be neutral");

  // Metric: healthScore (progress - higher is better)
  const healthMetric = METRIC_GROUPS.Overview[1];
  const healthClassifications = getMetricClassifications(healthMetric, mockApis);

  assert.equal(healthClassifications.stripe, "best", "Stripe has highest healthScore (98%) - should be best");
  assert.equal(healthClassifications.razorpay, "weakest", "Razorpay has lowest healthScore (92%) - should be weakest");
});

test("checkIsRowIdentical correctly spots differences", () => {
  // Identical row (same category description text)
  const mockRowIdentical = { get: (api) => "Payments" };
  assert.ok(checkIsRowIdentical(mockRowIdentical, mockApis), "Identical row evaluates to true");

  // Non-identical row (different latency values)
  const mockRowDifferent = { get: (api) => api.vitals.latency };
  assert.ok(!checkIsRowIdentical(mockRowDifferent, mockApis), "Different row evaluates to false");
});

test("sortComparedApis sorts column lists dynamically", () => {
  // Sort by healthScore desc
  const sortedByHealth = sortComparedApis(mockApis, "health");
  assert.equal(sortedByHealth[0].id, "stripe", "Stripe has highest health (98) - first");
  assert.equal(sortedByHealth[1].id, "paypal", "PayPal has medium health (95) - second");
  assert.equal(sortedByHealth[2].id, "razorpay", "Razorpay has lowest health (92) - last");

  // Sort by latency asc
  const sortedByLatency = sortComparedApis(mockApis, "latency");
  assert.equal(sortedByLatency[0].id, "stripe", "Stripe has lowest latency (120ms) - first");
  assert.equal(sortedByLatency[2].id, "razorpay", "Razorpay has highest latency (240ms) - last");
});
