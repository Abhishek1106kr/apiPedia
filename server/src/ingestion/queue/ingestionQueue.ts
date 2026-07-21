import { Queue } from "bullmq";
import { createRedisConnection } from "./connection.js";

export interface IngestionJobData {
  apiId: string;
}

export const INGESTION_QUEUE_NAME = "ingestion";

export function createIngestionQueue() {
  return new Queue<IngestionJobData>(INGESTION_QUEUE_NAME, {
    connection: createRedisConnection(),
  });
}

export async function enqueueIngestion(apiId: string) {
  const queue = createIngestionQueue();
  const job = await queue.add("ingest-api", { apiId });
  await queue.close();
  return job.id;
}
