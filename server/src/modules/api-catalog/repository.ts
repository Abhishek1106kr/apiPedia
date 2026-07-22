import type { PrismaClient } from "@prisma/client";

export function createApiCatalogRepository(prisma: PrismaClient) {
  return {
    listApis: () => prisma.apiEntry.findMany({ orderBy: { name: "asc" } }),
    getApiById: (id: string) => prisma.apiEntry.findUnique({ where: { id } }),
  };
}

export type ApiCatalogRepository = ReturnType<typeof createApiCatalogRepository>;
