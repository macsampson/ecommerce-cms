-- Chit Chats is now positioned as an optional add-on rather than a default-on
-- carrier; new stores should have it off until explicitly enabled. Existing
-- rows keep whatever value they already have.
ALTER TABLE "shipping_settings" ALTER COLUMN "chitchats_enabled" SET DEFAULT false;
