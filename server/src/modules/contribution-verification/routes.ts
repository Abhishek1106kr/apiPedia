import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { createContributionRepository } from "./repository.js";
import { checkForSpam } from "./checks/spamDetector.js";
import { checkForDuplicate } from "./checks/duplicateDetector.js";
import { verifyGithubSource } from "./checks/githubVerifier.js";
import { computeTrustScore } from "./trustScore.js";
import { newApiPayloadSchema, correctionPayloadSchema } from "./payloadSchemas.js";
import { publishContribution } from "./publish.js";
import {
  submitContributionSchema,
  listContributionsQuerySchema,
  moderationActionSchema,
  contributionParamsSchema,
} from "./schemas.js";

export default async function contributionVerificationRoutes(fastify: FastifyInstance) {
  const repository = createContributionRepository(fastify.prisma);

  // Submit a contribution. Runs all automated checks synchronously and
  // stores their results, but always lands as PENDING — nothing here
  // auto-approves or auto-rejects. A human moderator makes that call via
  // the approve/reject endpoints below.
  fastify.post("/contributions", async (request, reply) => {
    const input = submitContributionSchema.parse(request.body);

    // Fail fast at submission, not at approval time: a payload that
    // doesn't match the expected shape for its type is rejected outright
    // rather than stored and discovered broken later during publish.
    let payload: Record<string, unknown> | undefined = undefined;
    if (input.payload !== undefined) {
      if (input.type === "NEW_API") {
        payload = newApiPayloadSchema.parse(input.payload);
      } else if (input.type === "CORRECTION") {
        payload = correctionPayloadSchema.parse(input.payload);
      } else {
        return reply.badRequest(`Contribution type "${input.type}" does not accept a structured payload.`);
      }
    }

    const spam = checkForSpam({ title: input.title, body: input.body });
    const isDuplicate = await checkForDuplicate(fastify.prisma, {
      type: input.type,
      targetApiId: input.targetApiId,
      title: input.title,
    });
    const githubVerified = await verifyGithubSource(input.sourceUrl);
    const trustScore = computeTrustScore({ spamScore: spam.score, isDuplicate, githubVerified });

    const contribution = await repository.create({
      type: input.type,
      targetApiId: input.targetApiId,
      submitterHandle: input.submitterHandle,
      title: input.title,
      body: input.body,
      sourceUrl: input.sourceUrl,
      spamScore: spam.score,
      spamFlags: spam.flags,
      isDuplicate,
      githubVerified,
      trustScore,
      payload: payload as Prisma.InputJsonValue | undefined,
    });

    await repository.addAuditLog(contribution.id, "submitted", input.submitterHandle);

    return reply.code(201).send(contribution);
  });

  fastify.get("/contributions", async (request) => {
    const query = listContributionsQuerySchema.parse(request.query);
    return repository.list(query.status);
  });

  fastify.get("/contributions/:id", async (request, reply) => {
    const params = contributionParamsSchema.parse(request.params);
    const contribution = await repository.getById(params.id);
    if (!contribution) {
      return reply.notFound(`No contribution found with id "${params.id}"`);
    }
    return contribution;
  });

  fastify.post("/contributions/:id/approve", { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const params = contributionParamsSchema.parse(request.params);
    const action = moderationActionSchema.parse(request.body);

    const existing = await repository.getById(params.id);
    if (!existing) {
      return reply.notFound(`No contribution found with id "${params.id}"`);
    }

    const updated = await repository.setStatus(params.id, "APPROVED");
    await repository.addAuditLog(params.id, "approved", action.actor, action.reason);

    const publishResult = await publishContribution(fastify.prisma, updated);
    await repository.addAuditLog(
      params.id,
      publishResult.published ? "published" : "publish_skipped",
      action.actor,
      publishResult.published ? `Wrote ${publishResult.apiId} to the catalog` : publishResult.reason
    );

    return { ...updated, publishResult };
  });

  fastify.post("/contributions/:id/reject", { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const params = contributionParamsSchema.parse(request.params);
    const action = moderationActionSchema.parse(request.body);

    const existing = await repository.getById(params.id);
    if (!existing) {
      return reply.notFound(`No contribution found with id "${params.id}"`);
    }

    const updated = await repository.setStatus(params.id, "REJECTED");
    await repository.addAuditLog(params.id, "rejected", action.actor, action.reason);
    return updated;
  });

  // Rollback: revert an already-decided (approved/rejected) contribution
  // back to PENDING, e.g. a moderator changes their mind or a decision was
  // made in error. The audit log preserves the full history either way.
  fastify.post("/contributions/:id/rollback", { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const params = contributionParamsSchema.parse(request.params);
    const action = moderationActionSchema.parse(request.body);

    const existing = await repository.getById(params.id);
    if (!existing) {
      return reply.notFound(`No contribution found with id "${params.id}"`);
    }
    if (existing.status === "PENDING") {
      return reply.badRequest("Contribution is already PENDING; nothing to roll back.");
    }

    const updated = await repository.setStatus(params.id, "PENDING");
    await repository.addAuditLog(params.id, "rolled_back", action.actor, action.reason);
    return updated;
  });
}
