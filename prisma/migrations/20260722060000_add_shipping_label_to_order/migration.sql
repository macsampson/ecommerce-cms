-- AlterTable
ALTER TABLE "order" ADD COLUMN     "ship_to_address" JSONB,
ADD COLUMN     "shipping_label" JSONB;
