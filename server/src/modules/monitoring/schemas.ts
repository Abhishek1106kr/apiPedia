import { z } from "zod";

export const monitoringParamsSchema = z.object({
  apiId: z.string().min(1),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
