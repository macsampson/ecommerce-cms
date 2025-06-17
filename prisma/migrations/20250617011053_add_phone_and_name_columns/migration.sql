-- AlterTable
ALTER TABLE "order" ADD COLUMN     "customer_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone_number" TEXT NOT NULL DEFAULT '';
