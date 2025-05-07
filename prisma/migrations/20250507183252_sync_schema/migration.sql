-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" TEXT NOT NULL,
    "base_currency" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_base_currency_idx" ON "exchange_rate"("base_currency");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_base_currency_key" ON "exchange_rate"("base_currency");
