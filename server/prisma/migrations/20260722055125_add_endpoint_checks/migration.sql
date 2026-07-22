-- CreateTable
CREATE TABLE "endpoint_checks" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isUp" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "latencyMs" INTEGER,
    "error" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "endpoint_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "endpoint_checks_apiId_checkedAt_idx" ON "endpoint_checks"("apiId", "checkedAt");
