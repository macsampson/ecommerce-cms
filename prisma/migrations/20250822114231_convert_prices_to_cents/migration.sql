-- AlterTable: Convert prices from decimal to cents
-- Add new columns
ALTER TABLE "product" ADD COLUMN "price_in_cents" INTEGER;
ALTER TABLE "product_variation" ADD COLUMN "price_in_cents" INTEGER;
ALTER TABLE "bundle" ADD COLUMN "discount_percentage" INTEGER DEFAULT 0;
ALTER TABLE "order" ADD COLUMN "total_price_in_cents" INTEGER DEFAULT 0;
ALTER TABLE "order_item" ADD COLUMN "price_in_cents" INTEGER DEFAULT 0;

-- Convert existing decimal values to cents (multiply by 100)
UPDATE "product" SET "price_in_cents" = ROUND("price" * 100);
UPDATE "product_variation" SET "price_in_cents" = ROUND("price" * 100);
UPDATE "bundle" SET "discount_percentage" = ROUND("discount");
UPDATE "order" SET "total_price_in_cents" = ROUND("total_price" * 100);
UPDATE "order_item" SET "price_in_cents" = ROUND("price" * 100);

-- Make new columns NOT NULL
ALTER TABLE "product" ALTER COLUMN "price_in_cents" SET NOT NULL;
ALTER TABLE "product_variation" ALTER COLUMN "price_in_cents" SET NOT NULL;
ALTER TABLE "bundle" ALTER COLUMN "discount_percentage" SET NOT NULL;
ALTER TABLE "order" ALTER COLUMN "total_price_in_cents" SET NOT NULL;
ALTER TABLE "order_item" ALTER COLUMN "price_in_cents" SET NOT NULL;

-- Drop old columns
ALTER TABLE "product" DROP COLUMN "price";
ALTER TABLE "product_variation" DROP COLUMN "price";
ALTER TABLE "bundle" DROP COLUMN "discount";
ALTER TABLE "order" DROP COLUMN "total_price";
ALTER TABLE "order_item" DROP COLUMN "price";
