/*
  Warnings:

  - You are about to drop the column `chitchatsEnabled` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `customsDeclaration` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `shippoEnabled` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `shipping_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[store_id]` on the table `shipping_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `store_id` to the `shipping_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `shipping_settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "shipping_settings_storeId_key";

-- AlterTable
ALTER TABLE "shipping_settings" DROP COLUMN "chitchatsEnabled",
DROP COLUMN "createdAt",
DROP COLUMN "customsDeclaration",
DROP COLUMN "shippoEnabled",
DROP COLUMN "storeId",
DROP COLUMN "updatedAt",
ADD COLUMN     "chitchats_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customs_declaration" JSONB,
ADD COLUMN     "shippo_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "store_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "shipping_settings_store_id_key" ON "shipping_settings"("store_id");
