import { Redis } from "ioredis";

// BullMQ requires this exact option on the ioredis connection it's given.
export function createRedisConnection() {
  return new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });
}
