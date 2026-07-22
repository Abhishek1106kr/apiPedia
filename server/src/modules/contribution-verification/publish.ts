import type { PrismaClient } from "@prisma/client";
import { newApiPayloadSchema, correctionPayloadSchema } from "./payloadSchemas.js";

export interface ContributionLike {
  type: string;
  targetApiId: string | null;
  payload: unknown;
}

export type PublishResult =
  | { published: true; apiId: string }
  | { published: false; reason: string };

// Runs when a contribution is approved (see routes.ts). A NEW_API
// contribution with a valid payload creates a real ApiEntry row; a
// CORRECTION with a valid payload patches the existing one. Anything else
// (no payload, or a RECIPE contribution, which has nowhere structured to
// go yet) approves without touching the catalog — that's a deliberate,
// documented no-op, not a silent failure.
export async function publishContribution(
  prisma: PrismaClient,
  contribution: ContributionLike
): Promise<PublishResult> {
  if (contribution.payload === null || contribution.payload === undefined) {
    return { published: false, reason: "No structured payload was submitted with this contribution." };
  }

  if (contribution.type === "NEW_API") {
    const parsed = newApiPayloadSchema.safeParse(contribution.payload);
    if (!parsed.success) {
      return { published: false, reason: `Stored payload no longer matches the expected shape: ${parsed.error.message}` };
    }

    const data = parsed.data;
    await prisma.apiEntry.upsert({
      where: { id: data.id },
      create: {
        ...data,
        verified: false,
        vitals: {},
        dna: {},
        painIndex: {},
        endpoints: [],
        recipes: [],
        paths: [],
        analytics: {},
      },
      update: data,
    });

    return { published: true, apiId: data.id };
  }

  if (contribution.type === "CORRECTION") {
    if (!contribution.targetApiId) {
      return { published: false, reason: "CORRECTION contribution has no targetApiId to patch." };
    }

    const parsed = correctionPayloadSchema.safeParse(contribution.payload);
    if (!parsed.success) {
      return { published: false, reason: `Stored payload no longer matches the expected shape: ${parsed.error.message}` };
    }

    const existing = await prisma.apiEntry.findUnique({ where: { id: contribution.targetApiId } });
    if (!existing) {
      return { published: false, reason: `Target API "${contribution.targetApiId}" no longer exists in the catalog.` };
    }

    await prisma.apiEntry.update({ where: { id: contribution.targetApiId }, data: parsed.data });
    return { published: true, apiId: contribution.targetApiId };
  }

  return { published: false, reason: `Contribution type "${contribution.type}" has no catalog target.` };
}
