import Fastify, { type FastifyInstance } from "fastify";
import sensible from "@fastify/sensible";
import prismaPlugin from "./plugins/prisma.js";
import apiCatalogRoutes from "./modules/api-catalog/routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);
  await app.register(prismaPlugin);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(apiCatalogRoutes, { prefix: "/api" });

  return app;
}
