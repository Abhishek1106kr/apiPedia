import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRedisConnection } from "../../ingestion/queue/connection.js";
import { runMonitoringRound } from "./runner.js";
import { MONITORING_QUEUE_NAME, scheduleMonitoring, DEFAULT_INTERVAL_MS } from "./scheduler.js";

// Entrypoint: npm run monitor:worker
// Schedules the recurring job (idempotent, safe to call every start) and
// processes it — every tick runs one real check per known API and records
// the result via monitoring/repository.ts.
async function main() {
  await scheduleMonitoring();

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const worker = new Worker(
    MONITORING_QUEUE_NAME,
    async () => {
      const results = await runMonitoringRound(prisma);
      console.log(`[monitoring] round complete: ${results.filter((r) => r.isUp).length}/${results.length} up`);
      return results;
    },
    { connection: createRedisConnection() }
  );

  worker.on("failed", (job, err) => {
    console.error(`[monitoring] job ${job?.id} failed:`, err.message);
  });

  console.log(`Monitoring worker started, checking every ${DEFAULT_INTERVAL_MS / 1000}s...`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
