import { z } from "zod";

export const explainEndpointSchema = z.object({
  apiId: z.string().min(1),
  path: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
});
