import type { PrismaClient } from "@prisma/client";

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  tagline: string;
  logoColor: string;
  rank: number;
}

// Real Postgres full-text search (the lexical/BM25-equivalent half of the
// roadmap's "hybrid BM25 + vector search"). The vector/semantic half is not
// implemented — it needs a text-embedding provider, and Groq (the only LLM
// key configured in this project so far) is chat-completion only, it does
// not serve embeddings. Wiring in real vector search requires a provider
// decision (OpenAI/Cohere/a local model + pgvector) — flagged here rather
// than faked with something that only looks like semantic search.
export function createSearchRepository(prisma: PrismaClient) {
  return {
    search: async (query: string, limit = 20): Promise<SearchResult[]> => {
      return prisma.$queryRaw<SearchResult[]>`
        SELECT
          id, name, category, tagline, "logoColor",
          ts_rank(
            to_tsvector('english', name || ' ' || tagline || ' ' || description || ' ' || category),
            plainto_tsquery('english', ${query})
          ) AS rank
        FROM api_entries
        WHERE to_tsvector('english', name || ' ' || tagline || ' ' || description || ' ' || category)
          @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;
    },
  };
}

export type SearchRepository = ReturnType<typeof createSearchRepository>;
