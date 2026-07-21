import { runIngestion } from "./pipeline.js";

// Usage: npm run ingest -- <api-id>
// Runs the ingestion pipeline synchronously and prints the resulting draft.
// This is the direct, queue-free path for local development and testing;
// queue/ingestionQueue.ts + queue/worker.ts run the same pipeline function
// asynchronously via BullMQ once Redis is available.
const apiId = process.argv[2];

if (!apiId) {
  console.error("Usage: npm run ingest -- <api-id>");
  process.exit(1);
}

try {
  const draft = await runIngestion(apiId);
  console.log(JSON.stringify(draft, null, 2));

  if (draft.errors.length > 0) {
    process.exitCode = 1;
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
