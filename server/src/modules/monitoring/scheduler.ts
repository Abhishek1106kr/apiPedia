import { Queue } from "bullmq";
import { createRedisConnection } from "../../ingestion/queue/connection.js";

export const MONITORING_QUEUE_NAME = "endpoint-monitoring";
export const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function createMonitoringQueue() {
  return new Queue(MONITORING_QUEUE_NAME, { connection: createRedisConnection() });
}

// Registers the recurring check as a BullMQ repeatable job. Safe to call on
// every process start — BullMQ dedupes repeatable jobs with the same key
// instead of stacking up duplicates.
export async function scheduleMonitoring(intervalMs = DEFAULT_INTERVAL_MS) {
  const queue = createMonitoringQueue();
  await queue.add(
    "check-all-endpoints",
    {},
    { repeat: { every: intervalMs }, jobId: "endpoint-monitoring-recurring" }
  );
  await queue.close();
}
