-- AlterTable: Convert prices from decimal to cents
-- Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'price_in_cents') THEN
        ALTER TABLE "product" ADD COLUMN "price_in_cents" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variation' AND column_name = 'price_in_cents') THEN
        ALTER TABLE "product_variation" ADD COLUMN "price_in_cents" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bundle' AND column_name = 'discount_percentage') THEN
        ALTER TABLE "bundle" ADD COLUMN "discount_percentage" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'total_price_in_cents') THEN
        ALTER TABLE "order" ADD COLUMN "total_price_in_cents" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'price_in_cents') THEN
        ALTER TABLE "order_item" ADD COLUMN "price_in_cents" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Convert existing decimal values to cents (multiply by 100) - only if columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'price') THEN
        UPDATE "product" SET "price_in_cents" = ROUND("price" * 100);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variation' AND column_name = 'price') THEN
        UPDATE "product_variation" SET "price_in_cents" = ROUND("price" * 100);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bundle' AND column_name = 'discount') THEN
        UPDATE "bundle" SET "discount_percentage" = ROUND("discount");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'total_price') THEN
        UPDATE "order" SET "total_price_in_cents" = ROUND("total_price" * 100);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'price') THEN
        UPDATE "order_item" SET "price_in_cents" = ROUND("price" * 100);
    END IF;
END $$;

-- Make new columns NOT NULL
DO $$
BEGIN
    -- Only set NOT NULL if the column exists and isn't already NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'price_in_cents' AND is_nullable = 'YES') THEN
        ALTER TABLE "product" ALTER COLUMN "price_in_cents" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variation' AND column_name = 'price_in_cents' AND is_nullable = 'YES') THEN
        ALTER TABLE "product_variation" ALTER COLUMN "price_in_cents" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bundle' AND column_name = 'discount_percentage' AND is_nullable = 'YES') THEN
        ALTER TABLE "bundle" ALTER COLUMN "discount_percentage" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'total_price_in_cents' AND is_nullable = 'YES') THEN
        ALTER TABLE "order" ALTER COLUMN "total_price_in_cents" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'price_in_cents' AND is_nullable = 'YES') THEN
        ALTER TABLE "order_item" ALTER COLUMN "price_in_cents" SET NOT NULL;
    END IF;
END $$;

-- Drop old columns if they exist
ALTER TABLE "product" DROP COLUMN IF EXISTS "price";
ALTER TABLE "product_variation" DROP COLUMN IF EXISTS "price";
ALTER TABLE "bundle" DROP COLUMN IF EXISTS "discount";
ALTER TABLE "order" DROP COLUMN IF EXISTS "total_price";
ALTER TABLE "order_item" DROP COLUMN IF EXISTS "price";
