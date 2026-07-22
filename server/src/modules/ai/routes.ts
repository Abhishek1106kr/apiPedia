import type { FastifyInstance } from "fastify";
import { explainEndpointSchema } from "./schemas.js";
import { explainEndpoint } from "./explainEndpoint.js";

export default async function aiRoutes(fastify: FastifyInstance) {
  // Stricter than the global default (see app.ts) — this route calls a
  // paid, externally rate-limited LLM API per request, so it needs its own
  // tighter cap rather than relying on the general one.
  fastify.post("/ai/explain-endpoint", {
    config: {
      rateLimit: { max: 10, timeWindow: "1 minute" },
    },
  }, async (request, reply) => {
    const input = explainEndpointSchema.parse(request.body);

    try {
      return await explainEndpoint(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Explanation failed";
      return reply.status(400).send({ statusCode: 400, error: "Bad Request", message });
    }
  });
}
