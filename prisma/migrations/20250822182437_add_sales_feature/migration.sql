-- CreateTable
CREATE TABLE "sale" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DECIMAL(5,2) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_store_wide" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_product" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sale_store_id_idx" ON "sale"("store_id");

-- CreateIndex
CREATE INDEX "sale_start_date_end_date_idx" ON "sale"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "sale_product_sale_id_idx" ON "sale_product"("sale_id");

-- CreateIndex
CREATE INDEX "sale_product_product_id_idx" ON "sale_product"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "sale_product_sale_id_product_id_key" ON "sale_product"("sale_id", "product_id");

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_product" ADD CONSTRAINT "sale_product_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_product" ADD CONSTRAINT "sale_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
