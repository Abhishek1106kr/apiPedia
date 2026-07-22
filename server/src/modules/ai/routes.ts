import type { FastifyInstance } from "fastify";
import { explainEndpointSchema } from "./schemas.js";
import { explainEndpoint } from "./explainEndpoint.js";

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post("/ai/explain-endpoint", async (request, reply) => {
    const input = explainEndpointSchema.parse(request.body);

    try {
      return await explainEndpoint(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Explanation failed";
      return reply.status(400).send({ statusCode: 400, error: "Bad Request", message });
    }
  });
}
