import type { Prisma, PrismaClient, ContributionStatus } from "@prisma/client";

export function createContributionRepository(prisma: PrismaClient) {
  return {
    create: (data: Prisma.ContributionCreateInput) => prisma.contribution.create({ data }),

    list: (status?: ContributionStatus) =>
      prisma.contribution.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
      }),

    getById: (id: string) =>
      prisma.contribution.findUnique({
        where: { id },
        include: { auditLogs: { orderBy: { createdAt: "asc" } } },
      }),

    setStatus: (id: string, status: ContributionStatus) =>
      prisma.contribution.update({ where: { id }, data: { status } }),

    addAuditLog: (contributionId: string, action: string, actor: string, reason?: string) =>
      prisma.auditLog.create({ data: { contributionId, action, actor, reason } }),
  };
}

export type ContributionRepository = ReturnType<typeof createContributionRepository>;
