import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async function prismaPlugin(fastify: FastifyInstance) {
  // The pg driver adapter connects lazily (on first query), so registering
  // this plugin never blocks server startup (e.g. /health) on a database
  // being reachable. It also avoids Prisma's native Rust query engine
  // binary entirely, which has no prebuilt Windows/ARM64 target.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
});
