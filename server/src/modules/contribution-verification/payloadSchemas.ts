import { z } from "zod";

// The minimum fields needed to create a real ApiEntry row. Deliberately not
// the full frontend ApiEntry shape (src/types/api.ts) — vitals/dna/painIndex/
// endpoints/recipes/paths/analytics are populated later by ingestion (Phase 3)
// and monitoring (Phase 6), not by a contributor typing them in by hand.
// A freshly-published entry starts with empty JSON for all of those and
// correctly shows "no data yet" rather than a fabricated number.
export const newApiPayloadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  docsUrl: z.string().url(),
  githubUrl: z.string().url(),
  baseUrl: z.string().url(),
  logoColor: z.string().default("#4F8CFF"),
  openapiUrl: z.string().default(""),
  postmanUrl: z.string().default(""),
  sandboxAvailable: z.boolean().default(false),
});

export type NewApiPayload = z.infer<typeof newApiPayloadSchema>;

// A CORRECTION only needs the fields it's actually changing.
export const correctionPayloadSchema = newApiPayloadSchema.partial();

export type CorrectionPayload = z.infer<typeof correctionPayloadSchema>;
