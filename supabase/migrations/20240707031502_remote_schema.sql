create table "public"."shipping" (
    "id" character varying(191) not null,
    "order_id" text not null,
    "carrier" text not null,
    "service_level" text not null,
    "rate" numeric(65,30) not null,
    "tracking_number" character varying(191),
    "estimated_delivery" timestamp with time zone,
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone not null
);


alter table "public"."image" drop column "credit";

CREATE UNIQUE INDEX billboard_pkey ON public.billboard USING btree (id);

CREATE INDEX idx_17909_billboard_storeid_idx ON public.billboard USING btree (store_id);

CREATE INDEX idx_17916_bundle_productid_idx ON public.bundle USING btree (product_id);

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

CREATE UNIQUE INDEX idx_31119_primary ON public.bundle USING btree (id);

CREATE UNIQUE INDEX idx_31130_primary ON public.carousel_image USING btree (id);

CREATE UNIQUE INDEX idx_31137_primary ON public.category USING btree (id);

CREATE UNIQUE INDEX idx_31143_primary ON public.color USING btree (id);

CREATE UNIQUE INDEX idx_31149_primary ON public.image USING btree (id);

alter table "public"."billboard" add constraint "billboard_pkey" PRIMARY KEY using index "billboard_pkey";

alter table "public"."bundle" add constraint "idx_31119_primary" PRIMARY KEY using index "idx_31119_primary";

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

grant delete on table "public"."shipping" to "anon";

grant insert on table "public"."shipping" to "anon";

grant references on table "public"."shipping" to "anon";

grant select on table "public"."shipping" to "anon";

grant trigger on table "public"."shipping" to "anon";

grant truncate on table "public"."shipping" to "anon";

grant update on table "public"."shipping" to "anon";

grant delete on table "public"."shipping" to "authenticated";

grant insert on table "public"."shipping" to "authenticated";

grant references on table "public"."shipping" to "authenticated";

grant select on table "public"."shipping" to "authenticated";

grant trigger on table "public"."shipping" to "authenticated";

grant truncate on table "public"."shipping" to "authenticated";

grant update on table "public"."shipping" to "authenticated";

grant delete on table "public"."shipping" to "service_role";

grant insert on table "public"."shipping" to "service_role";

grant references on table "public"."shipping" to "service_role";

grant select on table "public"."shipping" to "service_role";

grant trigger on table "public"."shipping" to "service_role";

grant truncate on table "public"."shipping" to "service_role";

grant update on table "public"."shipping" to "service_role";


