import type { FastifyInstance } from "fastify";
import { executeRequestSchema } from "./schemas.js";
import { executeRequest } from "./executor.js";

export default async function playgroundRoutes(fastify: FastifyInstance) {
  fastify.post("/playground/execute", async (request, reply) => {
    const input = executeRequestSchema.parse(request.body);

    try {
      const result = await executeRequest(input);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      // SSRF/protocol/timeout failures are the caller's request being
      // invalid or unsafe, not a server fault — 400, not 500.
      return reply.status(400).send({ statusCode: 400, error: "Bad Request", message });
    }
  });
}
