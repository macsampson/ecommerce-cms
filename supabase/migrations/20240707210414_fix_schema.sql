alter table "public"."bundle" drop constraint "idx_31119_primary";

alter table "public"."carousel_image" drop constraint "idx_31130_primary";

alter table "public"."category" drop constraint "idx_31137_primary";

alter table "public"."color" drop constraint "idx_31143_primary";

alter table "public"."image" drop constraint "idx_31149_primary";

drop index if exists "public"."idx_31119_primary";

drop index if exists "public"."idx_31130_primary";

drop index if exists "public"."idx_31137_primary";

drop index if exists "public"."idx_31143_primary";

drop index if exists "public"."idx_31149_primary";

CREATE UNIQUE INDEX bundle_pkey ON public.bundle USING btree (id);

CREATE UNIQUE INDEX carousel_image_pkey ON public.carousel_image USING btree (id);

CREATE UNIQUE INDEX category_pkey ON public.category USING btree (id);

CREATE UNIQUE INDEX color_pkey ON public.color USING btree (id);

CREATE UNIQUE INDEX image_pkey ON public.image USING btree (id);

alter table "public"."bundle" add constraint "bundle_pkey" PRIMARY KEY using index "bundle_pkey";

alter table "public"."carousel_image" add constraint "carousel_image_pkey" PRIMARY KEY using index "carousel_image_pkey";

alter table "public"."category" add constraint "category_pkey" PRIMARY KEY using index "category_pkey";

alter table "public"."color" add constraint "color_pkey" PRIMARY KEY using index "color_pkey";

alter table "public"."image" add constraint "image_pkey" PRIMARY KEY using index "image_pkey";


