import type { FastifyInstance } from "fastify";
import { createSearchRepository } from "./repository.js";
import { searchQuerySchema } from "./schemas.js";

export default async function searchRoutes(fastify: FastifyInstance) {
  const repository = createSearchRepository(fastify.prisma);

  fastify.get("/search", async (request) => {
    const query = searchQuerySchema.parse(request.query);
    return repository.search(query.q, query.limit);
  });
}
