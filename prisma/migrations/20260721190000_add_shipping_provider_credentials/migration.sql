-- AlterTable
ALTER TABLE "shipping_settings"
  ADD COLUMN "shippo_api_key" TEXT,
  ADD COLUMN "chitchats_api_key" TEXT,
  ADD COLUMN "chitchats_api_url" TEXT,
  ADD COLUMN "chitchats_client_id" TEXT;
