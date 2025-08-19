/*
  Warnings:

  - You are about to drop the `ShippingSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ShippingSettings";

-- CreateTable
CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "street1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shippoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chitchatsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_settings_storeId_key" ON "shipping_settings"("storeId");
