import type { FastifyInstance } from "fastify";
import { createApiCatalogRepository } from "./repository.js";
import { getApiParamsSchema } from "./schemas.js";

export default async function apiCatalogRoutes(fastify: FastifyInstance) {
  const repository = createApiCatalogRepository(fastify.prisma);

  fastify.get("/apis", async () => {
    return repository.listApis();
  });

  fastify.get("/apis/:id", async (request, reply) => {
    const params = getApiParamsSchema.parse(request.params);
    const api = await repository.getApiById(params.id);

    if (!api) {
      return reply.notFound(`No API found with id "${params.id}"`);
    }

    return api;
  });
}
