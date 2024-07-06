

--
-- Name: billboard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billboard (
    id text NOT NULL,
    store_id text NOT NULL,
    label text NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    landing_page boolean DEFAULT false NOT NULL
);


ALTER TABLE public.billboard OWNER TO postgres;

--
-- Name: bundle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundle (
    id text NOT NULL,
    min_quantity integer NOT NULL,
    product_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    discount numeric(5,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE public.bundle OWNER TO postgres;

--
-- Name: carousel_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carousel_image (
    id text NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    store_id text NOT NULL,
    image_credit text DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.carousel_image OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id text NOT NULL,
    store_id text NOT NULL,
    billboard_id text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: color; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color (
    id text NOT NULL,
    store_id text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.color OWNER TO postgres;

--
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    id text NOT NULL,
    product_id text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id character varying(191) NOT NULL,
    store_id character varying(191) NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    address character varying(191) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    total_price numeric(10,2) DEFAULT 0.000000000000000000000000000000 NOT NULL,
    shipping_address character varying(191) DEFAULT ''::character varying NOT NULL,
    email_address character varying(191) DEFAULT ''::character varying NOT NULL,
    is_abandoned boolean DEFAULT false
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id character varying(191) NOT NULL,
    order_id character varying(191) NOT NULL,
    product_id character varying(191) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    product_variation_id character varying(191),
    price numeric(10,2) DEFAULT 0.000000000000000000000000000000 NOT NULL,
    name text DEFAULT '""'::text
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id character varying(191) NOT NULL,
    store_id character varying(191) NOT NULL,
    category_id character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    price numeric(10,2) NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    size_id character varying(191),
    color_id character varying(191),
    quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_variation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variation (
    id character varying(191) NOT NULL,
    product_id character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_variation OWNER TO postgres;

--
-- Name: shipping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping (
    id character varying(191) NOT NULL,
    order_id text NOT NULL,
    carrier text NOT NULL,
    service_level text NOT NULL,
    rate numeric(65,30) NOT NULL,
    tracking_number character varying(191),
    estimated_delivery timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.shipping OWNER TO postgres;

--
-- Name: size; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.size (
    id character varying(191) NOT NULL,
    store_id character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    value character varying(191) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.size OWNER TO postgres;

--
-- Name: store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store (
    id character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    user_id character varying(191) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.store OWNER TO postgres;

--