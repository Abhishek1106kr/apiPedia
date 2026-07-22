import type { PrismaClient } from "@prisma/client";
import type { CheckResult } from "./checker.js";

export interface DynamicStats {
  apiId: string;
  currentlyUp: boolean | null; // null = no checks recorded yet
  uptimePercent: number | null;
  avgLatencyMs: number | null;
  totalChecks: number;
  lastCheckedAt: Date | null;
  windowHours: number;
}

export function createMonitoringRepository(prisma: PrismaClient) {
  return {
    recordCheck: (apiId: string, url: string, result: CheckResult) =>
      prisma.endpointCheck.create({
        data: {
          apiId,
          url,
          isUp: result.isUp,
          statusCode: result.statusCode,
          latencyMs: result.latencyMs,
          error: result.error,
        },
      }),

    getHistory: (apiId: string, limit: number) =>
      prisma.endpointCheck.findMany({
        where: { apiId },
        orderBy: { checkedAt: "desc" },
        take: limit,
      }),

    // Computes stats from real stored checks rather than trusting a cached
    // field — this is the "fully dynamic" replacement for the frontend's
    // hardcoded vitals.uptime/latency mock values.
    getStats: async (apiId: string, windowHours = 24): Promise<DynamicStats> => {
      const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
      const checks = await prisma.endpointCheck.findMany({
        where: { apiId, checkedAt: { gte: since } },
        orderBy: { checkedAt: "desc" },
      });

      if (checks.length === 0) {
        return {
          apiId,
          currentlyUp: null,
          uptimePercent: null,
          avgLatencyMs: null,
          totalChecks: 0,
          lastCheckedAt: null,
          windowHours,
        };
      }

      const upCount = checks.filter((c) => c.isUp).length;
      const latencies = checks.filter((c) => c.latencyMs !== null).map((c) => c.latencyMs as number);
      const avgLatencyMs = latencies.length > 0
        ? Math.round(latencies.reduce((sum, l) => sum + l, 0) / latencies.length)
        : null;

      return {
        apiId,
        currentlyUp: checks[0].isUp,
        uptimePercent: Math.round((upCount / checks.length) * 10000) / 100,
        avgLatencyMs,
        totalChecks: checks.length,
        lastCheckedAt: checks[0].checkedAt,
        windowHours,
      };
    },
  };
}

export type MonitoringRepository = ReturnType<typeof createMonitoringRepository>;
