-- CreateTable
CREATE TABLE "api_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoColor" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "docsUrl" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "openapiUrl" TEXT NOT NULL,
    "postmanUrl" TEXT NOT NULL,
    "sandboxAvailable" BOOLEAN NOT NULL DEFAULT false,
    "baseUrl" TEXT NOT NULL,
    "vitals" JSONB NOT NULL,
    "dna" JSONB NOT NULL,
    "painIndex" JSONB NOT NULL,
    "endpoints" JSONB NOT NULL,
    "recipes" JSONB NOT NULL,
    "paths" JSONB NOT NULL,
    "analytics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_entries_pkey" PRIMARY KEY ("id")
);
