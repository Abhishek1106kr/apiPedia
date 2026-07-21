import { Worker } from "bullmq";
import { createRedisConnection } from "./connection.js";
import { INGESTION_QUEUE_NAME, type IngestionJobData } from "./ingestionQueue.js";
import { runIngestion } from "../pipeline.js";

// Entrypoint: npm run ingest:worker
// Processes queued ingestion jobs by running the same pipeline the CLI
// calls directly (src/ingestion/cli.ts) — the queue exists to make
// ingestion async/retryable/observable, not to duplicate its logic.
const worker = new Worker<IngestionJobData>(
  INGESTION_QUEUE_NAME,
  async (job) => {
    const draft = await runIngestion(job.data.apiId);
    if (draft.errors.length > 0) {
      job.log(`Completed with partial errors: ${draft.errors.join("; ")}`);
    }
    return draft;
  },
  { connection: createRedisConnection() }
);

worker.on("completed", (job) => {
  console.log(`[ingestion] job ${job.id} (${job.data.apiId}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[ingestion] job ${job?.id} (${job?.data.apiId}) failed:`, err.message);
});

console.log("Ingestion worker started, waiting for jobs...");
