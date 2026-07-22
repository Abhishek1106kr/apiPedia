import type { FastifyInstance } from "fastify";
import { INGESTION_SEEDS } from "../../ingestion/seeds.js";
import { createMonitoringRepository } from "./repository.js";
import { runMonitoringRound } from "./runner.js";
import { monitoringParamsSchema, historyQuerySchema } from "./schemas.js";

export default async function monitoringRoutes(fastify: FastifyInstance) {
  const repository = createMonitoringRepository(fastify.prisma);

  // Dynamic stats for every known API at once — this is what a "live
  // status board" view would render instead of the frontend's hardcoded
  // vitals.uptime/latency mock values.
  fastify.get("/monitoring", async () => {
    const stats = await Promise.all(
      Object.keys(INGESTION_SEEDS).map((apiId) => repository.getStats(apiId))
    );
    return stats;
  });

  fastify.get("/monitoring/:apiId", async (request, reply) => {
    const params = monitoringParamsSchema.parse(request.params);
    if (!INGESTION_SEEDS[params.apiId]) {
      return reply.notFound(`No monitored API with id "${params.apiId}".`);
    }
    return repository.getStats(params.apiId);
  });

  fastify.get("/monitoring/:apiId/history", async (request, reply) => {
    const params = monitoringParamsSchema.parse(request.params);
    const query = historyQuerySchema.parse(request.query);
    if (!INGESTION_SEEDS[params.apiId]) {
      return reply.notFound(`No monitored API with id "${params.apiId}".`);
    }
    return repository.getHistory(params.apiId, query.limit);
  });

  // Runs one real check round synchronously and returns the results
  // immediately — for manual refresh/testing without waiting for the
  // scheduler's next tick (default every 5 minutes, see scheduler.ts).
  fastify.post("/monitoring/run-now", { preHandler: fastify.requireAdmin }, async () => {
    return runMonitoringRound(fastify.prisma);
  });
}
