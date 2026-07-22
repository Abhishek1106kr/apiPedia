import type { PrismaClient } from "@prisma/client";
import { INGESTION_SEEDS } from "../../ingestion/seeds.js";
import { checkEndpoint } from "./checker.js";
import { createMonitoringRepository } from "./repository.js";

export interface MonitoringRoundResult {
  apiId: string;
  url: string;
  isUp: boolean;
  statusCode: number | null;
  latencyMs: number;
}

// One round = one real check per known API's baseUrl. Runs sequentially
// (not Promise.all) so this doesn't fire a burst of concurrent requests at
// third-party APIs every time the scheduler ticks.
export async function runMonitoringRound(prisma: PrismaClient): Promise<MonitoringRoundResult[]> {
  const repository = createMonitoringRepository(prisma);
  const results: MonitoringRoundResult[] = [];

  for (const seed of Object.values(INGESTION_SEEDS)) {
    const result = await checkEndpoint(seed.baseUrl);
    await repository.recordCheck(seed.id, seed.baseUrl, result);
    results.push({
      apiId: seed.id,
      url: seed.baseUrl,
      isUp: result.isUp,
      statusCode: result.statusCode,
      latencyMs: result.latencyMs,
    });
  }

  return results;
}
