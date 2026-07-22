import Fastify, { type FastifyInstance } from "fastify";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import apiCatalogRoutes from "./modules/api-catalog/routes.js";
import contributionVerificationRoutes from "./modules/contribution-verification/routes.js";
import playgroundRoutes from "./modules/playground/routes.js";
import monitoringRoutes from "./modules/monitoring/routes.js";
import aiRoutes from "./modules/ai/routes.js";
import searchRoutes from "./modules/search/routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  // Global default; routes that hit paid/costly third-party APIs (Groq)
  // set a stricter per-route override — see modules/ai/routes.ts.
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Routes call schema.parse() directly rather than passing a Fastify
  // validator, so a bad request surfaces as a thrown ZodError — map that to
  // 400 here instead of letting it fall through to Fastify's default 500.
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
      });
    }
    return reply.send(error);
  });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(apiCatalogRoutes, { prefix: "/api" });
  await app.register(contributionVerificationRoutes, { prefix: "/api" });
  await app.register(playgroundRoutes, { prefix: "/api" });
  await app.register(monitoringRoutes, { prefix: "/api" });
  await app.register(aiRoutes, { prefix: "/api" });
  await app.register(searchRoutes, { prefix: "/api" });

  return app;
}
