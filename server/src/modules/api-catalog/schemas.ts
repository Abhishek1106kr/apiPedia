import { z } from "zod";

// Path/query validation only. Response bodies pass the JSON columns through
// as-is for now — tightening these into full schemas (matching
// src/types/api.ts on the frontend) is worthwhile once this endpoint has a
// real consumer and the shape has stopped moving.
export const getApiParamsSchema = z.object({
  id: z.string().min(1),
});
