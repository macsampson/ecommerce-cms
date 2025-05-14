-- CreateTable
CREATE TABLE "states" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country_id" BIGINT NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "fips_code" VARCHAR(255),
    "iso2" VARCHAR(255),
    "type" VARCHAR(191),
    "level" INTEGER,
    "parent_id" INTEGER,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" INTEGER NOT NULL DEFAULT 1,
    "wikiDataId" VARCHAR(255),

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);
