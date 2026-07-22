-- Functional GIN index backing full-text search (search/repository.ts).
-- Not expressible in schema.prisma directly (Prisma has no native support
-- for expression indexes), so this migration is hand-written rather than
-- generated from a schema.prisma change.
CREATE INDEX IF NOT EXISTS api_entries_search_idx
  ON api_entries
  USING GIN (to_tsvector('english', name || ' ' || tagline || ' ' || description || ' ' || category));
