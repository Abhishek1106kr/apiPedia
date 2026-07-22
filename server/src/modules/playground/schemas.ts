import { z } from "zod";

export const executeRequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  timeoutMs: z.number().int().min(1000).max(30000).default(10000),
});

export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>;
