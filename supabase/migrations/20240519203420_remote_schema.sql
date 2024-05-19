alter table "public"."billboard" drop constraint "billboard_store_id_fkey";

alter table "public"."bundle" drop constraint "bundle_product_id_fkey";

alter table "public"."bundle_item" drop constraint "bundle_item_bundle_id_fkey";

alter table "public"."bundle_item" drop constraint "bundle_item_order_item_id_fkey";

alter table "public"."bundle_item" drop constraint "bundle_item_product_variation_id_fkey";

alter table "public"."carousel_image" drop constraint "carousel_image_store_id_fkey";

alter table "public"."category" drop constraint "category_billboard_id_fkey";

alter table "public"."category" drop constraint "category_store_id_fkey";

alter table "public"."color" drop constraint "color_store_id_fkey";

alter table "public"."image" drop constraint "image_product_id_fkey";

alter table "public"."order" drop constraint "order_store_id_fkey";

alter table "public"."order_item" drop constraint "order_item_order_id_fkey";

alter table "public"."order_item" drop constraint "order_item_product_id_fkey";

alter table "public"."order_item" drop constraint "order_item_product_variation_id_fkey";

alter table "public"."product" drop constraint "product_category_id_fkey";

alter table "public"."product" drop constraint "product_color_id_fkey";

alter table "public"."product" drop constraint "product_size_id_fkey";

alter table "public"."product" drop constraint "product_store_id_fkey";

alter table "public"."product_variation" drop constraint "product_variation_product_id_fkey";

alter table "public"."shipping" drop constraint "shipping_order_id_fkey";

alter table "public"."size" drop constraint "size_store_id_fkey";

alter table "public"."billboard" drop constraint "billboard_pkey";

alter table "public"."bundle" drop constraint "bundle_pkey";

alter table "public"."bundle_item" drop constraint "bundle_item_pkey";

alter table "public"."carousel_image" drop constraint "carousel_image_pkey";

alter table "public"."category" drop constraint "category_pkey";

alter table "public"."color" drop constraint "color_pkey";

alter table "public"."image" drop constraint "image_pkey";

alter table "public"."order" drop constraint "order_pkey";

alter table "public"."order_item" drop constraint "order_item_pkey";

alter table "public"."product" drop constraint "product_pkey";

alter table "public"."product_variation" drop constraint "product_variation_pkey";

alter table "public"."shipping" drop constraint "shipping_pkey";

alter table "public"."size" drop constraint "size_pkey";

alter table "public"."store" drop constraint "store_pkey";

drop index if exists "public"."billboard_pkey";

drop index if exists "public"."billboard_store_id_idx";

drop index if exists "public"."bundle_item_bundle_id_idx";

drop index if exists "public"."bundle_item_order_item_id_idx";

drop index if exists "public"."bundle_item_pkey";

drop index if exists "public"."bundle_item_product_variation_id_idx";

drop index if exists "public"."bundle_pkey";

drop index if exists "public"."bundle_product_id_idx";

drop index if exists "public"."carousel_image_pkey";

drop index if exists "public"."carousel_image_store_id_idx";

drop index if exists "public"."category_billboard_id_idx";

drop index if exists "public"."category_pkey";

drop index if exists "public"."category_store_id_idx";

drop index if exists "public"."color_pkey";

drop index if exists "public"."color_store_id_idx";

drop index if exists "public"."image_pkey";

drop index if exists "public"."image_product_id_idx";

drop index if exists "public"."order_item_order_id_idx";

drop index if exists "public"."order_item_pkey";

drop index if exists "public"."order_item_product_id_idx";

drop index if exists "public"."order_item_product_variation_id_idx";

drop index if exists "public"."order_pkey";

drop index if exists "public"."order_store_id_idx";

drop index if exists "public"."product_category_id_idx";

drop index if exists "public"."product_color_id_idx";

drop index if exists "public"."product_pkey";

drop index if exists "public"."product_size_id_idx";

drop index if exists "public"."product_store_id_idx";

drop index if exists "public"."product_variation_pkey";

drop index if exists "public"."product_variation_product_id_idx";

drop index if exists "public"."shipping_order_id_idx";

drop index if exists "public"."shipping_order_id_key";

drop index if exists "public"."shipping_pkey";

drop index if exists "public"."size_pkey";

drop index if exists "public"."size_store_id_idx";

drop index if exists "public"."store_pkey";

alter table "public"."billboard" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."billboard" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."bundle" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."bundle" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."bundle_item" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."bundle_item" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."carousel_image" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."carousel_image" alter column "image_credit" set default ''::character varying;

alter table "public"."carousel_image" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."category" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."category" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."color" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."color" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."image" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."image" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."order" alter column "address" set default ''::character varying;

alter table "public"."order" alter column "address" set data type character varying(191) using "address"::character varying(191);

alter table "public"."order" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."order" alter column "email_address" set default ''::character varying;

alter table "public"."order" alter column "email_address" set data type character varying(191) using "email_address"::character varying(191);

alter table "public"."order" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."order" alter column "is_abandoned" drop not null;

alter table "public"."order" alter column "shipping_address" set default ''::character varying;

alter table "public"."order" alter column "shipping_address" set data type character varying(191) using "shipping_address"::character varying(191);

alter table "public"."order" alter column "store_id" set data type character varying(191) using "store_id"::character varying(191);

alter table "public"."order" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."order_item" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."order_item" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."order_item" alter column "name" set default '""'::text;

alter table "public"."order_item" alter column "name" drop not null;

alter table "public"."order_item" alter column "order_id" set data type character varying(191) using "order_id"::character varying(191);

alter table "public"."order_item" alter column "product_id" set data type character varying(191) using "product_id"::character varying(191);

alter table "public"."order_item" alter column "product_variation_id" set data type character varying(191) using "product_variation_id"::character varying(191);

alter table "public"."order_item" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."product" alter column "category_id" set data type character varying(191) using "category_id"::character varying(191);

alter table "public"."product" alter column "color_id" set data type character varying(191) using "color_id"::character varying(191);

alter table "public"."product" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."product" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."product" alter column "name" set data type character varying(191) using "name"::character varying(191);

alter table "public"."product" alter column "size_id" set data type character varying(191) using "size_id"::character varying(191);

alter table "public"."product" alter column "store_id" set data type character varying(191) using "store_id"::character varying(191);

alter table "public"."product" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."product_variation" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."product_variation" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."product_variation" alter column "name" set data type character varying(191) using "name"::character varying(191);

alter table "public"."product_variation" alter column "product_id" set data type character varying(191) using "product_id"::character varying(191);

alter table "public"."product_variation" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."shipping" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."shipping" alter column "estimated_delivery" set data type timestamp with time zone using "estimated_delivery"::timestamp with time zone;

alter table "public"."shipping" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."shipping" alter column "tracking_number" set data type character varying(191) using "tracking_number"::character varying(191);

alter table "public"."shipping" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."size" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."size" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."size" alter column "name" set data type character varying(191) using "name"::character varying(191);

alter table "public"."size" alter column "store_id" set data type character varying(191) using "store_id"::character varying(191);

alter table "public"."size" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."size" alter column "value" set data type character varying(191) using "value"::character varying(191);

alter table "public"."store" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."store" alter column "id" set data type character varying(191) using "id"::character varying(191);

alter table "public"."store" alter column "name" set data type character varying(191) using "name"::character varying(191);

alter table "public"."store" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."store" alter column "user_id" set data type character varying(191) using "user_id"::character varying(191);

CREATE INDEX idx_17909_billboard_storeid_idx ON public.billboard USING btree (store_id);

CREATE INDEX idx_17916_bundle_productid_idx ON public.bundle USING btree (product_id);

CREATE INDEX idx_17920_bundleitem_bundleid_idx ON public.bundle_item USING btree (bundle_id);

CREATE INDEX idx_17920_bundleitem_orderitemid_idx ON public.bundle_item USING btree (order_item_id);

CREATE INDEX idx_17920_bundleitem_productvariationid_idx ON public.bundle_item USING btree (product_variation_id);

CREATE INDEX idx_17927_carouselimage_storeid_idx ON public.carousel_image USING btree (store_id);

CREATE INDEX idx_17934_category_billboardid_idx ON public.category USING btree (billboard_id);

CREATE INDEX idx_17934_category_storeid_idx ON public.category USING btree (store_id);

CREATE INDEX idx_17940_color_storeid_idx ON public.color USING btree (store_id);

CREATE INDEX idx_17946_image_productid_idx ON public.image USING btree (product_id);

CREATE INDEX idx_17952_order_storeid_idx ON public."order" USING btree (store_id);

CREATE UNIQUE INDEX idx_17952_primary ON public."order" USING btree (id);

CREATE INDEX idx_17963_orderitem_orderid_idx ON public.order_item USING btree (order_id);

CREATE INDEX idx_17963_orderitem_productid_idx ON public.order_item USING btree (product_id);

CREATE INDEX idx_17963_orderitem_productvariationid_idx ON public.order_item USING btree (product_variation_id);

CREATE UNIQUE INDEX idx_17963_primary ON public.order_item USING btree (id);

CREATE UNIQUE INDEX idx_17971_primary ON public.product USING btree (id);

CREATE INDEX idx_17971_product_categoryid_idx ON public.product USING btree (category_id);

CREATE INDEX idx_17971_product_colorid_idx ON public.product USING btree (color_id);

CREATE INDEX idx_17971_product_sizeid_idx ON public.product USING btree (size_id);

CREATE INDEX idx_17971_product_storeid_idx ON public.product USING btree (store_id);

CREATE UNIQUE INDEX idx_17980_primary ON public.product_variation USING btree (id);

CREATE INDEX idx_17980_productvariation_productid_idx ON public.product_variation USING btree (product_id);

CREATE UNIQUE INDEX idx_17987_primary ON public.shipping USING btree (id);

CREATE UNIQUE INDEX idx_17993_primary ON public.size USING btree (id);

CREATE INDEX idx_17993_size_storeid_idx ON public.size USING btree (store_id);

CREATE UNIQUE INDEX idx_17999_primary ON public.store USING btree (id);

CREATE UNIQUE INDEX idx_31112_primary ON public.billboard USING btree (id);

CREATE UNIQUE INDEX idx_31119_primary ON public.bundle USING btree (id);

CREATE UNIQUE INDEX idx_31123_primary ON public.bundle_item USING btree (id);

CREATE UNIQUE INDEX idx_31130_primary ON public.carousel_image USING btree (id);

CREATE UNIQUE INDEX idx_31137_primary ON public.category USING btree (id);

CREATE UNIQUE INDEX idx_31143_primary ON public.color USING btree (id);

CREATE UNIQUE INDEX idx_31149_primary ON public.image USING btree (id);

alter table "public"."billboard" add constraint "idx_31112_primary" PRIMARY KEY using index "idx_31112_primary";

alter table "public"."bundle" add constraint "idx_31119_primary" PRIMARY KEY using index "idx_31119_primary";

alter table "public"."bundle_item" add constraint "idx_31123_primary" PRIMARY KEY using index "idx_31123_primary";

alter table "public"."carousel_image" add constraint "idx_31130_primary" PRIMARY KEY using index "idx_31130_primary";

alter table "public"."category" add constraint "idx_31137_primary" PRIMARY KEY using index "idx_31137_primary";

alter table "public"."color" add constraint "idx_31143_primary" PRIMARY KEY using index "idx_31143_primary";

alter table "public"."image" add constraint "idx_31149_primary" PRIMARY KEY using index "idx_31149_primary";

alter table "public"."order" add constraint "idx_17952_primary" PRIMARY KEY using index "idx_17952_primary";

alter table "public"."order_item" add constraint "idx_17963_primary" PRIMARY KEY using index "idx_17963_primary";

alter table "public"."product" add constraint "idx_17971_primary" PRIMARY KEY using index "idx_17971_primary";

alter table "public"."product_variation" add constraint "idx_17980_primary" PRIMARY KEY using index "idx_17980_primary";

alter table "public"."shipping" add constraint "idx_17987_primary" PRIMARY KEY using index "idx_17987_primary";

alter table "public"."size" add constraint "idx_17993_primary" PRIMARY KEY using index "idx_17993_primary";

alter table "public"."store" add constraint "idx_17999_primary" PRIMARY KEY using index "idx_17999_primary";


