import type { PrismaClient } from "@prisma/client";

export interface DuplicateCheckInput {
  type: "NEW_API" | "CORRECTION" | "RECIPE";
  targetApiId?: string | null;
  title: string;
}

// Real DB-backed duplicate checks: a NEW_API submission is a duplicate if
// that id already exists in the catalog; any submission is a duplicate if
// there's already a PENDING contribution with the same target and title.
// Fuzzy/semantic duplicate detection (e.g. two differently-worded
// corrections describing the same fix) is future work — this catches exact
// resubmissions, which is the common case for spam and accidental double-
// submits.
export async function checkForDuplicate(
  prisma: PrismaClient,
  input: DuplicateCheckInput
): Promise<boolean> {
  if (input.type === "NEW_API" && input.targetApiId) {
    const existing = await prisma.apiEntry.findUnique({ where: { id: input.targetApiId } });
    if (existing) return true;
  }

  const pendingDuplicate = await prisma.contribution.findFirst({
    where: {
      status: "PENDING",
      type: input.type,
      targetApiId: input.targetApiId ?? null,
      title: input.title,
    },
  });

  return Boolean(pendingDuplicate);
}
