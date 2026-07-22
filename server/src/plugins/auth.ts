import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Deliberately not a full user/session/RBAC system — there are no user
// accounts yet (see docs/00-master-prompt.md and the production-readiness
// audit). This closes the actual, immediate hole: today, ANY caller can
// approve/reject/rollback a contribution or force a monitoring run. A
// single shared admin bearer token is the smallest real fix that isn't
// premature — building full RBAC before there's a user model to attach
// roles to would just be unverified surface area sitting on top of
// nothing. Replace this with real per-user roles once accounts exist.
declare module "fastify" {
  interface FastifyInstance {
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate("requireAdmin", async (request: FastifyRequest, reply: FastifyReply) => {
    const adminToken = process.env.ADMIN_API_TOKEN;
    if (!adminToken) {
      // Fail closed: an unconfigured token means "cannot verify," not
      // "allow everyone through."
      return reply.status(503).send({
        statusCode: 503,
        error: "Service Unavailable",
        message: "ADMIN_API_TOKEN is not configured on this server.",
      });
    }

    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

    if (!token || token !== adminToken) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "A valid admin bearer token is required for this action.",
      });
    }
  });
});
