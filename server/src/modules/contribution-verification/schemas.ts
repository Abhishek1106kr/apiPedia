import { z } from "zod";

export const submitContributionSchema = z.object({
  type: z.enum(["NEW_API", "CORRECTION", "RECIPE"]),
  targetApiId: z.string().min(1).optional(),
  submitterHandle: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  sourceUrl: z.string().url().optional(),
});

export const listContributionsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export const moderationActionSchema = z.object({
  actor: z.string().min(1),
  reason: z.string().optional(),
});

export const contributionParamsSchema = z.object({
  id: z.string().min(1),
});
