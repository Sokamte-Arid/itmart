--
-- PostgreSQL database dump
--

\restrict 4IxdySnJPqTLKgDsct0IrkYtQF1O2xoueSOhTgj78ZRpYLFLw9DlG8D0hypvrdC

-- Dumped from database version 16.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.related_products DROP CONSTRAINT IF EXISTS related_products_related_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.related_products DROP CONSTRAINT IF EXISTS related_products_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_admin_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_group_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_brand_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_variants DROP CONSTRAINT IF EXISTS product_variants_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_attribute_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.category_attributes DROP CONSTRAINT IF EXISTS category_attributes_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
DROP INDEX IF EXISTS public.related_products_product_id_related_product_id_key;
DROP INDEX IF EXISTS public.push_subscriptions_endpoint_key;
DROP INDEX IF EXISTS public.push_subscriptions_admin_id_idx;
DROP INDEX IF EXISTS public.products_slug_key;
DROP INDEX IF EXISTS public.products_sku_key;
DROP INDEX IF EXISTS public.products_is_best_seller_idx;
DROP INDEX IF EXISTS public.products_category_id_idx;
DROP INDEX IF EXISTS public.products_brand_id_idx;
DROP INDEX IF EXISTS public.product_variants_sku_key;
DROP INDEX IF EXISTS public.product_variants_product_id_idx;
DROP INDEX IF EXISTS public.product_attribute_values_product_id_attribute_id_key;
DROP INDEX IF EXISTS public.product_attribute_values_attribute_id_value_idx;
DROP INDEX IF EXISTS public.orders_reference_key;
DROP INDEX IF EXISTS public.orders_invoice_number_key;
DROP INDEX IF EXISTS public.newsletter_subscribers_email_key;
DROP INDEX IF EXISTS public.delivery_zones_city_key;
DROP INDEX IF EXISTS public.categories_slug_key;
DROP INDEX IF EXISTS public.brands_slug_key;
DROP INDEX IF EXISTS public.admins_email_key;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.related_products DROP CONSTRAINT IF EXISTS related_products_pkey;
ALTER TABLE IF EXISTS ONLY public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_variants DROP CONSTRAINT IF EXISTS product_variants_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.product_groups DROP CONSTRAINT IF EXISTS product_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_pkey;
ALTER TABLE IF EXISTS ONLY public.delivery_zones DROP CONSTRAINT IF EXISTS delivery_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.category_attributes DROP CONSTRAINT IF EXISTS category_attributes_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY public.banners DROP CONSTRAINT IF EXISTS banners_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.related_products;
DROP TABLE IF EXISTS public.push_subscriptions;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_variants;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.product_groups;
DROP TABLE IF EXISTS public.product_attribute_values;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.newsletter_subscribers;
DROP TABLE IF EXISTS public.delivery_zones;
DROP TABLE IF EXISTS public.category_attributes;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.brands;
DROP TABLE IF EXISTS public.banners;
DROP TABLE IF EXISTS public.admins;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."OrderStatus";
DROP TYPE IF EXISTS public."BannerPlacement";
DROP TYPE IF EXISTS public."AttributeType";
DROP TYPE IF EXISTS public."AdminRole";
--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'EDITOR'
);


--
-- Name: AttributeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttributeType" AS ENUM (
    'TEXT',
    'NUMBER',
    'SELECT',
    'BOOLEAN',
    'COLOR'
);


--
-- Name: BannerPlacement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BannerPlacement" AS ENUM (
    'HERO',
    'DEALS',
    'PROMO',
    'SIDE',
    'SIDE_LEFT'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONTACTED',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."AdminRole" DEFAULT 'ADMIN'::public."AdminRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id text NOT NULL,
    image text NOT NULL,
    title_en text,
    title_fr text,
    subtitle_en text,
    subtitle_fr text,
    cta_text_en text,
    cta_text_fr text,
    cta_link text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    placement public."BannerPlacement" DEFAULT 'HERO'::public."BannerPlacement" NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    logo text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    slug text NOT NULL,
    name_en text NOT NULL,
    name_fr text NOT NULL,
    image text,
    parent_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: category_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_attributes (
    id text NOT NULL,
    category_id text NOT NULL,
    name_en text NOT NULL,
    name_fr text NOT NULL,
    type public."AttributeType" DEFAULT 'TEXT'::public."AttributeType" NOT NULL,
    unit text,
    is_filterable boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_zones (
    id text NOT NULL,
    city text NOT NULL,
    fee numeric(12,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id text NOT NULL,
    email text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    variant_id text,
    variant_label text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    reference text NOT NULL,
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text,
    address text NOT NULL,
    city text NOT NULL,
    notes text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total numeric(12,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    delivery_fee numeric(12,2) DEFAULT 0 NOT NULL,
    invoice_number text,
    invoiced_at timestamp(3) without time zone,
    stock_deducted boolean DEFAULT false NOT NULL
);


--
-- Name: product_attribute_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attribute_values (
    id text NOT NULL,
    product_id text NOT NULL,
    attribute_id text NOT NULL,
    value text NOT NULL,
    hex_value text
);


--
-- Name: product_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_groups (
    id text NOT NULL,
    name_en text NOT NULL,
    name_fr text NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    product_id text NOT NULL,
    url text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    product_id text NOT NULL,
    color_name text,
    color_hex text,
    size text,
    sku text,
    stock integer DEFAULT 0 NOT NULL,
    image_id text,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    sku text NOT NULL,
    slug text NOT NULL,
    category_id text NOT NULL,
    brand_id text,
    group_id text,
    name_en text NOT NULL,
    name_fr text NOT NULL,
    description_en text,
    description_fr text,
    price numeric(12,2) NOT NULL,
    discount_price numeric(12,2),
    stock integer DEFAULT 0 NOT NULL,
    is_best_seller boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    cost_price numeric(12,2),
    short_description_en character varying(200),
    short_description_fr character varying(200),
    variant_size_label text
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id text NOT NULL,
    admin_id text NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    lang text DEFAULT 'fr'::text NOT NULL,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: related_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.related_products (
    id text NOT NULL,
    product_id text NOT NULL,
    related_product_id text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
35c406d3-51d6-4d8b-a7b4-af02eb1f91bb	68486f889efc969e74befdc7bb582e82b8c9a690a2b42727fb7f09d63d7400ce	2026-09-23 11:27:09.512081+01	20260923102707_init	\N	\N	2026-09-23 11:27:07.706999+01	1
b12447ba-0fb5-4647-b655-e435e515a7e2	45d9a679419888963b4ca3c9881bcf0778d48a1cdc32e6d9d92a63872f6a5550	2026-10-02 14:08:02.824887+01	20261002130802_add_short_description	\N	\N	2026-10-02 14:08:02.633632+01	1
5c7cb6d7-4c5e-42a4-ad81-9c2e491d8162	553ff1e890fdf6a3baaef770c4b701a9e0927a09d0594e638daa8125ce694295	2026-09-23 14:11:47.879604+01	20260923131147_add_banners	\N	\N	2026-09-23 14:11:47.746229+01	1
93085497-f3da-4ab7-b14d-61c8b5eee7c7	9982f33a5236c5cb9de7c959c00221b62663cb17700613b9974b0a36506fab17	2026-09-23 21:48:49.295635+01	20260923204847_add_banner_placement	\N	\N	2026-09-23 21:48:48.043034+01	1
90a7a68b-fa8f-4481-af27-e83e1ff204e0	644f0cc167c82771ad12f6b75f115e1997ac25176cf3f4df61c553f372e60dbc	2026-09-23 22:23:42.192685+01	20260923212341_add_newsletter	\N	\N	2026-09-23 22:23:41.615118+01	1
8796be36-3619-4133-be3b-17c9f942838f	3953ccfc220a4a9c80a9cce11201ec88c82e7ecd42684221bc17d0eb0952796e	2026-10-13 16:05:39.255377+01	20261013150532_variants_and_settings	\N	\N	2026-10-13 16:05:34.578549+01	1
0149e200-0cfd-4e02-aa5e-9a4f386873e2	e564acb13d88cd112a4d665ba93791b9eaba337a2ced90b73b60d1cc977d7466	2026-09-24 20:39:26.582896+01	20260924193925_add_related_products	\N	\N	2026-09-24 20:39:25.854456+01	1
6c93d01a-6d91-46ed-b07d-d88cacbad4cb	eb7da589d4baabb29745505eceb3525b814987bf2af06f738bb794031c3a9ac3	2026-09-24 21:14:13.193708+01	20260924201411_add_related_products	\N	\N	2026-09-24 21:14:11.906767+01	1
f99b9c31-f0c5-4bb9-a2c2-0544e58b2067	87ef37accc751cc174a3ef2b266a0a04b2fd153f5df08b92c743ecd320412761	2026-09-25 13:43:02.853932+01	20260925124301_add_cost_price	\N	\N	2026-09-25 13:43:02.553719+01	1
ca4dcc56-553d-418c-84c8-469d3709f8fc	ca13ceb8cbbf6cec716b4a4b235c08d189f0925b168f3d3ae0d8439f186fb5a8	2026-09-26 21:59:22.964541+01	20260926205922_add_color_attribute	\N	\N	2026-09-26 21:59:22.24741+01	1
0a4e861b-1def-4e4d-bc4f-c4d4cb9a1183	1feee44946cf0813b2de2790170e15629583859ee03d3ed04c98a18ef85b32e5	2026-09-29 12:30:51.057483+01	20260929113050_add_push_subscriptions	\N	\N	2026-09-29 12:30:50.309509+01	1
2f636833-b7ab-4cee-9d04-1e4eda57ab29	7c09ee5851995f6a03c1fed732061e7ee0b622483cf6083e59682a50c947589f	2026-09-29 16:35:34.821975+01	20260929153534_add_invoice_number	\N	\N	2026-09-29 16:35:34.687474+01	1
3ecbb94b-22b1-43bf-895e-fa054f71fbcc	03fd6ade0a3ec8113065afe6f2b190559fb70fc260e02abf2d24cb4f5b2de248	2026-09-30 15:28:23.320834+01	20260930142822_add_stock_deducted	\N	\N	2026-09-30 15:28:22.905733+01	1
04f04468-77af-4f90-8a90-3455e40469b6	1dcd69f5855a9a0f4f95ab7c907b98ec35b8736208c7efca1547b692c590a664	2026-10-02 12:53:30.39553+01	20261002115330_add_side_banner_placement	\N	\N	2026-10-02 12:53:30.27058+01	1
79dac0cb-72bd-4ff5-88bf-a60a5eb33a59	e959cdfa6d6bd3a2dda4ae752c6c79b5d8eb6c1fe2e6c42b667a6357d0756483	2026-10-02 13:25:49.610543+01	20261002122549_add_side_left_placement	\N	\N	2026-10-02 13:25:49.570249+01	1
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, name, email, password_hash, role, created_at, updated_at) FROM stdin;
6c4894ab-9927-44ea-94fa-961c00ec8edb	Super Admin	admin@itmart.cm	$2a$10$r8cP21PixMAFLOJazMp7Vu5KWBF5.un9Y53AHFkiJIEU.bMgqyoXO	SUPER_ADMIN	2026-09-23 10:27:36.918	2026-09-25 14:25:27.982
657781d6-c1b2-47e8-8512-4405ddc96163	Arid	sokamtearid@gmail.com	$2a$10$IgMGPv3oyh/Kg28/uj.YBem/F8kwdTpxuz38sJTSqqVP0PZpRDEiO	SUPER_ADMIN	2026-09-26 22:11:02.662	2026-09-26 22:11:02.662
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, image, title_en, title_fr, subtitle_en, subtitle_fr, cta_text_en, cta_text_fr, cta_link, is_active, sort_order, created_at, updated_at, placement) FROM stdin;
fce191ae-4ab9-4191-8e16-e4254827ffb3	/uploads/banners/1790872831968-170176990.webp								t	0	2026-10-01 16:40:32.521	2026-10-01 16:40:32.521	HERO
f14b89f7-e156-425b-abbe-4993f66fa410	/uploads/banners/1791062241399-516040952.webp					Order Now!	Commandez!	products/canon-pixma-ts3640-can-gud2z4	f	0	2026-10-03 21:13:33.209	2026-10-13 23:01:54.825	SIDE
1433c5a2-8087-4b5e-9630-ce6041a0aab3	/uploads/banners/1790885888693-445204514.webp					Get yours now	Commandez	/products/canon-pixma-g3470-can-pxzhre	f	1	2026-10-01 20:18:09.449	2026-10-14 19:44:37.892	HERO
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, slug, name, logo, created_at) FROM stdin;
3a33d61f-c101-426a-9f02-245cf1f6a35b	canon	canon	/uploads/brands/1790195332013-665191193.webp	2026-09-23 16:46:36.257
aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	hp	hp	/uploads/brands/1790195380401-985225000.webp	2026-09-23 10:27:36.94
9c51cf56-c894-41ee-9caa-58e7e6335580	epson	Epson	/uploads/brands/1790586395798-45426856.webp	2026-09-28 09:06:36.894
0b03fc19-5677-4c2d-b827-22b96c7f2013	kaspersky	Kaspersky	/uploads/brands/1792051629128-654493655.webp	2026-10-07 18:06:25.313
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, slug, name_en, name_fr, image, parent_id, created_at, updated_at) FROM stdin;
34c76323-87ac-4892-b410-a072b29fc0b2	printers	Printers	Imprimantes		\N	2026-09-23 15:31:18.032	2026-09-23 15:31:18.032
4066701a-3cac-4805-8b2e-e6213029e51f	projectors	Projectors	Projecteurs		\N	2026-09-23 16:53:05.957	2026-09-23 19:03:13.154
6d869665-27ce-41ad-aa42-0aca3f404ca1	ink-jet-printers	Ink-Jet printers	Jet d'encre	\N	34c76323-87ac-4892-b410-a072b29fc0b2	2026-09-24 14:06:56.572	2026-09-24 14:06:56.572
29027220-6a15-4f01-b7fa-e3a75657f554	ink-tank-printers	Ink Tank Printers	Imprimante a reservoir d'encre	\N	34c76323-87ac-4892-b410-a072b29fc0b2	2026-09-25 11:34:53.522	2026-09-25 11:34:53.522
b3e98ae6-51b1-4125-88b4-ae8844cfe536	laser-printer	Laser Printer	Imprimante Laser	\N	34c76323-87ac-4892-b410-a072b29fc0b2	2026-09-25 16:25:09.52	2026-09-25 16:25:09.52
e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	accessory	accessory	Accessoire	\N	\N	2026-09-26 19:25:07.885	2026-10-01 12:56:33.592
6e1926ca-7d90-4c3b-b755-d46314962457	ink	Ink	Encres	\N	\N	2026-10-15 21:15:18.073	2026-10-15 21:15:18.073
3680c175-0993-47ba-8acf-f228cbfa1dc9	toners	Toners	Toners	\N	6e1926ca-7d90-4c3b-b755-d46314962457	2026-09-26 12:18:32.135	2026-10-15 21:15:45.254
cd2fc8d3-6f2e-4f6c-b4e3-cc6bdf03752a	ink-cartridge	Ink Cartridge	Cartouche d'encre	\N	6e1926ca-7d90-4c3b-b755-d46314962457	2026-09-24 20:31:49.576	2026-10-15 21:19:09.006
afbd342a-2cb9-44f8-83f4-a1be3a872a0a	ink-bottles	Ink bottles	Boite d'encre	\N	6e1926ca-7d90-4c3b-b755-d46314962457	2026-09-28 10:35:00.688	2026-10-15 21:19:41.151
4c416813-7ce6-4015-a98d-e0469246b3bc	accessory-2	Accessory	Accessoire	\N	6e1926ca-7d90-4c3b-b755-d46314962457	2026-09-26 20:10:18.425	2026-10-15 21:29:06.259
\.


--
-- Data for Name: category_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.category_attributes (id, category_id, name_en, name_fr, type, unit, is_filterable, sort_order) FROM stdin;
74ee7489-413a-4bd8-a2ed-7fb367071e47	34c76323-87ac-4892-b410-a072b29fc0b2	Ink	Encre	TEXT		t	0
c6b9d7df-bfc1-4a03-999d-6c9e733546fa	34c76323-87ac-4892-b410-a072b29fc0b2	Function	Fonction	TEXT		t	0
4d946f1c-2852-4ab3-ba76-ca24e63df001	34c76323-87ac-4892-b410-a072b29fc0b2	Paper size	Taille du papier	TEXT		t	0
5f11be25-541f-4639-8c52-d47ac9b600b1	34c76323-87ac-4892-b410-a072b29fc0b2	Estimated black yield	Quantité d'impression noir	TEXT		t	0
6e34f7fb-1086-4bc8-82c3-b6a505317409	34c76323-87ac-4892-b410-a072b29fc0b2	Estimated colour yield	Quantité d'impression couleur	TEXT		t	0
cf114a28-6e4e-449f-9bca-0e4e7faf899f	29027220-6a15-4f01-b7fa-e3a75657f554	Ink	Encre	TEXT		t	0
c6acc5b1-a339-4d0e-9570-11e36869a332	29027220-6a15-4f01-b7fa-e3a75657f554	Function	Fonction	TEXT		t	0
3b002100-ed50-4301-8e9e-d246be5ee43c	29027220-6a15-4f01-b7fa-e3a75657f554	Estimated black yield	Quantité d'impréssion en noir	TEXT		t	0
72be76b3-951d-44f3-a033-d996156d7a9f	29027220-6a15-4f01-b7fa-e3a75657f554	Estimated coloured yield	Quantitéd'impréssion couleur	TEXT		t	0
dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	29027220-6a15-4f01-b7fa-e3a75657f554	Connectivity	Connectivité	TEXT		t	0
f88789fc-0325-4501-8361-c8ac7fa376d5	6d869665-27ce-41ad-aa42-0aca3f404ca1	Function	Fonction	TEXT		t	0
1799f78a-a1a1-4bc4-af58-866a36750e7a	6d869665-27ce-41ad-aa42-0aca3f404ca1	Ink	Encre	TEXT		t	0
d8117c7d-b75a-4699-af2c-8571df1b2114	6d869665-27ce-41ad-aa42-0aca3f404ca1	Estimated black yield	Capacité d'encre noir	TEXT		t	0
ad393487-b52d-4862-9ee6-c54b1516a127	6d869665-27ce-41ad-aa42-0aca3f404ca1	Estimated colored yield	Capacité d'encre couleur	TEXT		t	0
ae207013-358e-42ea-96b5-ac947de15ef6	6d869665-27ce-41ad-aa42-0aca3f404ca1	Connectivity	connectivité	TEXT		t	0
f8dfa6a4-4a27-4f3b-975d-7df94d412a3e	29027220-6a15-4f01-b7fa-e3a75657f554	Colour	Couleur	COLOR		t	0
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_zones (id, city, fee, is_active, sort_order, created_at, updated_at) FROM stdin;
6ad42344-7879-43d5-b141-8e641a2d2b1f	Douala	1500.00	t	0	2026-09-24 20:32:47.036	2026-09-24 20:32:47.036
84fffdd1-318a-4e5c-8ba2-154071f4827e	Yaounde	1500.00	t	0	2026-09-24 20:32:37.342	2026-10-12 14:10:58.7
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, email, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, variant_id, variant_label) FROM stdin;
219e7f7a-a77f-466d-b1d0-c946bc2480b2	cba30982-009e-4475-8379-1f6f7100d4fd	b64f2dad-c688-44d6-88b8-9c3bde9c8079	1	50000.00	\N	\N
cd34c8e3-b0fb-4e3c-bd36-383e207a7b4c	919b799c-d11d-4057-8fc4-0eae34a6d93c	bd757631-84e9-4867-b18f-8f1350215541	1	50000.00	\N	\N
76e606d9-29cf-4d97-838c-9597d6da45eb	27b3babb-870a-4687-a878-0ed2aff473b1	b64f2dad-c688-44d6-88b8-9c3bde9c8079	1	50000.00	\N	\N
f99ddc9a-76f7-4c44-82ed-a0469be19af3	2b6d8e80-b59d-47f2-bf99-e97e53a06ca0	16512291-c07e-4f1e-9cb9-f8ff6beceaf0	1	40000.00	\N	\N
a52e0d74-a20b-4fab-a436-9c6e663bde0b	ee9218f4-e568-4979-b1a6-a27eeded0988	5df8f7c3-91fa-49fd-a152-ef93e97b8618	1	150000.00	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, reference, customer_name, phone, email, address, city, notes, status, total, created_at, updated_at, delivery_fee, invoice_number, invoiced_at, stock_deducted) FROM stdin;
ee9218f4-e568-4979-b1a6-a27eeded0988	ORD-421695	Sokamte Arid	672352130	\N	edea	Yaounde		CANCELLED	151500.00	2026-09-29 14:04:51.209	2026-10-02 21:00:47.795	1500.00	\N	\N	f
2b6d8e80-b59d-47f2-bf99-e97e53a06ca0	ORD-953935	pride soh	692345246	sohpride8@gmail.com	simbok	Yaounde		CANCELLED	41500.00	2026-09-25 13:41:58.812	2026-10-02 21:00:48.922	1500.00	\N	\N	f
27b3babb-870a-4687-a878-0ed2aff473b1	ORD-651488	pride soh	692345246	sohpride8@gmail.com	simbok	Yaounde		CANCELLED	51500.00	2026-09-25 13:26:13.076	2026-10-02 21:00:50.808	1500.00	\N	\N	f
919b799c-d11d-4057-8fc4-0eae34a6d93c	ORD-820685	Soh mba	692345246	\N	emombo	yaounde		CANCELLED	50000.00	2026-09-23 19:15:49.247	2026-10-02 21:00:52.673	0.00	\N	\N	f
cba30982-009e-4475-8379-1f6f7100d4fd	ORD-387042	Sokamte Arid	672352130	\N	Poste	Yaounde		CANCELLED	50000.00	2026-09-23 18:47:26.024	2026-10-02 21:00:54.705	0.00	\N	\N	f
\.


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_attribute_values (id, product_id, attribute_id, value, hex_value) FROM stdin;
aff6790b-b1bf-4878-ade4-e1f323c48f55	13d65a9c-2e55-443e-9bf5-924b45b72a51	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
44faaae8-5ef2-4b0a-9d9a-3129c0d8d036	13d65a9c-2e55-443e-9bf5-924b45b72a51	3b002100-ed50-4301-8e9e-d246be5ee43c	8500 copies	\N
28d0b05e-4f8e-4643-b026-2d612987f606	13d65a9c-2e55-443e-9bf5-924b45b72a51	72be76b3-951d-44f3-a033-d996156d7a9f	7500 copies	\N
733e2a76-bd3f-4321-a865-d4183d144c3d	13d65a9c-2e55-443e-9bf5-924b45b72a51	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	Wi-Fi, Wi-Fi Direct, USB	\N
4ec8753a-03e4-4bab-8ffb-75ddc917b453	d4d93860-7e3d-4685-b476-80199774400e	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy, ADF, wireless	\N
ebb6f057-79c4-4086-a3c1-e059b4822fa6	d4d93860-7e3d-4685-b476-80199774400e	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	USB 2.0, Wi-Fi, LAN, Wi-Fi Direct	\N
782133e6-0c15-4e33-8732-75cf4f1677ef	d4d93860-7e3d-4685-b476-80199774400e	3b002100-ed50-4301-8e9e-d246be5ee43c	6000 copies	\N
e08ab911-a09e-4d67-80cd-ad887453a77b	d4d93860-7e3d-4685-b476-80199774400e	72be76b3-951d-44f3-a033-d996156d7a9f	6000 copies	\N
5728aa31-c41d-418c-8e64-1f0395080bcb	d4d93860-7e3d-4685-b476-80199774400e	cf114a28-6e4e-449f-9bca-0e4e7faf899f	HP GT53 XL Black, GT52 cyan, yellow, magenta	\N
05b72655-7ea0-48ca-9978-0b25352292dc	f50aa46f-cf7a-4c3c-ba57-475fa324274d	f88789fc-0325-4501-8361-c8ac7fa376d5	Print, scan, copy	\N
4d4a429e-0193-41e2-a126-649ae28cc16f	f50aa46f-cf7a-4c3c-ba57-475fa324274d	1799f78a-a1a1-4bc4-af58-866a36750e7a	Canon 445 Black, 446 Colour	\N
779cd37e-7550-4140-8cf3-54e59be8d918	f50aa46f-cf7a-4c3c-ba57-475fa324274d	d8117c7d-b75a-4699-af2c-8571df1b2114	300 copies	\N
2d08a728-a912-4ed3-9ec5-7cf376de4d49	f50aa46f-cf7a-4c3c-ba57-475fa324274d	ad393487-b52d-4862-9ee6-c54b1516a127	200 copies	\N
ebefa783-8f17-4666-b8b9-c781b7a5522e	f50aa46f-cf7a-4c3c-ba57-475fa324274d	ae207013-358e-42ea-96b5-ac947de15ef6	Wi-Fi, USB	\N
bf8172e8-643c-4733-9766-d73b0ba300a9	99ef1e23-b645-49cc-84f5-8132abdc19a1	f88789fc-0325-4501-8361-c8ac7fa376d5	Print, scan, copy	\N
32d18b2d-b84c-4b39-966e-e66f37ea901c	99ef1e23-b645-49cc-84f5-8132abdc19a1	1799f78a-a1a1-4bc4-af58-866a36750e7a	HP 653 noir, couleur	\N
f088d255-48ab-40aa-8202-02926b621aa7	99ef1e23-b645-49cc-84f5-8132abdc19a1	d8117c7d-b75a-4699-af2c-8571df1b2114	300 copies	\N
73b6deb3-3851-4093-9f08-7bac19023912	99ef1e23-b645-49cc-84f5-8132abdc19a1	ad393487-b52d-4862-9ee6-c54b1516a127	200 copies	\N
b53359d2-0511-450d-999e-11d000b0c69f	99ef1e23-b645-49cc-84f5-8132abdc19a1	ae207013-358e-42ea-96b5-ac947de15ef6	USB 2.0, Wi-Fi	\N
b266c99b-a8dc-49ba-9c7e-60626c2c2575	b64f2dad-c688-44d6-88b8-9c3bde9c8079	4d946f1c-2852-4ab3-ba76-ca24e63df001	A4	\N
558a47cc-78b7-4b16-8cd6-126abe0c2741	b64f2dad-c688-44d6-88b8-9c3bde9c8079	c6b9d7df-bfc1-4a03-999d-6c9e733546fa	Print, scan, copy	\N
f89b92a5-0c07-4e5e-a34a-bb7127560525	b64f2dad-c688-44d6-88b8-9c3bde9c8079	74ee7489-413a-4bd8-a2ed-7fb367071e47	Canon 445 Black, 446 Colour	\N
8f3b13b2-ae32-42ed-b18c-a02d59ca024b	b64f2dad-c688-44d6-88b8-9c3bde9c8079	5f11be25-541f-4639-8c52-d47ac9b600b1	300 copies	\N
4479094c-3804-46e9-bd46-aa818817b939	b64f2dad-c688-44d6-88b8-9c3bde9c8079	6e34f7fb-1086-4bc8-82c3-b6a505317409	200 copies	\N
2884321d-6acf-4e0a-8d53-e8667b0a74a3	b64f2dad-c688-44d6-88b8-9c3bde9c8079	f88789fc-0325-4501-8361-c8ac7fa376d5	Print, scan, copy	\N
a3b08790-b242-4ea4-baae-1641d1f7e6e7	b64f2dad-c688-44d6-88b8-9c3bde9c8079	1799f78a-a1a1-4bc4-af58-866a36750e7a	Canon 445 Black, 446 Colour	\N
c236069b-2da4-4e41-ae99-4228eed30eee	b64f2dad-c688-44d6-88b8-9c3bde9c8079	d8117c7d-b75a-4699-af2c-8571df1b2114	300 copies	\N
41771d04-9515-41e0-b023-877fb2ab0dd9	b64f2dad-c688-44d6-88b8-9c3bde9c8079	ad393487-b52d-4862-9ee6-c54b1516a127	200 copies	\N
362c71dc-d9e9-44ca-9aa0-3aadbbb4226f	b64f2dad-c688-44d6-88b8-9c3bde9c8079	ae207013-358e-42ea-96b5-ac947de15ef6	Wi-Fi, USB	\N
c6dacadf-97df-4d8c-b886-968c78fc8ee5	8ff107cb-eb07-4334-b470-10efd7334adb	cf114a28-6e4e-449f-9bca-0e4e7faf899f	HP GT53XL black, HP GT52 cyan, magenta and yellow	\N
e1cad6da-bae7-4d51-9223-1e0fa35f088a	8ff107cb-eb07-4334-b470-10efd7334adb	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
bd511853-caa1-48db-85ec-a65000a489de	8ff107cb-eb07-4334-b470-10efd7334adb	3b002100-ed50-4301-8e9e-d246be5ee43c	6000 copies	\N
9bea3e59-86a0-4d4b-9de3-26edf7e8acb8	8ff107cb-eb07-4334-b470-10efd7334adb	72be76b3-951d-44f3-a033-d996156d7a9f	6000 copies	\N
3e3ec8fe-6de4-4ef8-85d2-24b5e340950c	8ff107cb-eb07-4334-b470-10efd7334adb	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	Wi-Fi 2.4 GHz, Wi-Fi Direct, USB 2.0	\N
335936d7-ff17-4e5c-b498-6cf74ea0f513	ff9fe919-7847-473d-b96e-b4404febb414	3b002100-ed50-4301-8e9e-d246be5ee43c	4500 copies	\N
1e38e4d7-e0c2-478b-9b6f-804925afff29	ff9fe919-7847-473d-b96e-b4404febb414	72be76b3-951d-44f3-a033-d996156d7a9f	7500 copies	\N
97d2dd0a-9497-47ab-9c88-226b382ab6f7	ff9fe919-7847-473d-b96e-b4404febb414	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
601fcf1a-48e7-4b45-a9ce-bd10c2628b8a	ff9fe919-7847-473d-b96e-b4404febb414	cf114a28-6e4e-449f-9bca-0e4e7faf899f	Epson 103 Black, Cyan, Magenta, Yellow	\N
f245e3e6-633c-4074-983b-4cb4e473c686	ff9fe919-7847-473d-b96e-b4404febb414	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	USB	\N
3f2700ea-803b-4815-b7af-49b61da41fb0	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	f88789fc-0325-4501-8361-c8ac7fa376d5	Print, scan, copy	\N
5ec39753-38a1-4456-888a-33940d6a017d	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	1799f78a-a1a1-4bc4-af58-866a36750e7a	Canon 445 Black, 446 Colour	\N
7c359148-b278-42d5-9947-90e686f99de0	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	d8117c7d-b75a-4699-af2c-8571df1b2114	300 copies	\N
5c9b2c20-a4d2-42b8-821b-988cd01afaec	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	ad393487-b52d-4862-9ee6-c54b1516a127	200 copies	\N
0efc6949-4d6d-497b-be6b-35dd6ab6241d	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	ae207013-358e-42ea-96b5-ac947de15ef6	USB	\N
9a6be358-86a0-4018-a11d-71a997f588e5	210afe72-7c62-446f-8305-2b376cb20e7b	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
650fb002-bd2f-4446-9184-3e687a37a676	210afe72-7c62-446f-8305-2b376cb20e7b	cf114a28-6e4e-449f-9bca-0e4e7faf899f	Canon GI-490 Black, Cyan, Magenta, Yellow	\N
2c19b6d6-96cc-40bd-b1f3-15c86f547ff0	210afe72-7c62-446f-8305-2b376cb20e7b	3b002100-ed50-4301-8e9e-d246be5ee43c	6000 copies	\N
3fa677a0-e189-434f-9e2a-f34b142fe413	210afe72-7c62-446f-8305-2b376cb20e7b	72be76b3-951d-44f3-a033-d996156d7a9f	7700 copies	\N
bf836883-8db6-40f5-a52c-5d6884a5ce06	210afe72-7c62-446f-8305-2b376cb20e7b	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	Wi-Fi, USB	\N
f88d1870-8903-4980-abb5-48fa4d53a91a	499ab7a7-4ab9-4fc2-baff-56097ef21507	cf114a28-6e4e-449f-9bca-0e4e7faf899f	Canon GI-41 Black, Cyan, Magenta, Yellow	\N
3c0f7806-8e97-4ab2-9ee7-4ac1f7e061b6	499ab7a7-4ab9-4fc2-baff-56097ef21507	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
c8cd07dc-c6ab-41f1-a1c3-d0f7f6ad8461	499ab7a7-4ab9-4fc2-baff-56097ef21507	f8dfa6a4-4a27-4f3b-975d-7df94d412a3e	Noir	#000000
63aeedd8-8c1d-4b63-ba2c-6132a15c1197	499ab7a7-4ab9-4fc2-baff-56097ef21507	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	Wi-Fi, USB	\N
2f0eeda2-554f-427c-9252-8a9fa54026cd	499ab7a7-4ab9-4fc2-baff-56097ef21507	3b002100-ed50-4301-8e9e-d246be5ee43c	6000 copies	\N
92baa6fb-8c60-46c2-b53c-792d373d18b7	499ab7a7-4ab9-4fc2-baff-56097ef21507	72be76b3-951d-44f3-a033-d996156d7a9f	7700 copies	\N
74b0ad36-31b0-4d37-a820-768aad7b9e22	5df8f7c3-91fa-49fd-a152-ef93e97b8618	dc653f41-2e1a-4919-a7b0-b7c8c6c8ee0f	Wi-Fi, Wi-Fi Direct, USB 2.0	\N
b7bc77d1-fe78-481e-807f-ce3936fbdfa1	5df8f7c3-91fa-49fd-a152-ef93e97b8618	3b002100-ed50-4301-8e9e-d246be5ee43c	4500 copies	\N
ea8dc7e6-eb6f-487d-a31d-2ba115f171c5	5df8f7c3-91fa-49fd-a152-ef93e97b8618	72be76b3-951d-44f3-a033-d996156d7a9f	7500 copies	\N
70e813f0-7074-4d11-9a15-afa11ab221de	5df8f7c3-91fa-49fd-a152-ef93e97b8618	c6acc5b1-a339-4d0e-9570-11e36869a332	Print, scan, copy	\N
\.


--
-- Data for Name: product_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_groups (id, name_en, name_fr) FROM stdin;
b1295568-8d64-4772-90db-3e3c1f654457	HP EliteBook 840	HP EliteBook 840
93912a68-b181-4a82-89ef-675cfe35f087	HP EliteBook 840	HP EliteBook 840
424985d8-402f-4db8-9134-4a6352051ffb	HP EliteBook 840	HP EliteBook 840
5de42b7f-0b99-4820-9c6c-0dd9746c7ca8	HP EliteBook 840	HP EliteBook 840
80d7d688-2ab2-4ec9-b233-a316de806f12	HP EliteBook 840	HP EliteBook 840
b07a579c-487c-49a5-a7f0-6c0b8bdea5cb	HP EliteBook 840	HP EliteBook 840
a8ddd0a8-b11e-4a0b-ae92-6ef8181f35c3	HP EliteBook 840	HP EliteBook 840
f9f000c5-3661-44d7-ada3-76761746f469	HP EliteBook 840	HP EliteBook 840
e41a43be-e747-4b28-a344-9fb07638dfe7	HP EliteBook 840	HP EliteBook 840
6787b255-35e6-46be-9f71-57abfea163c1	HP EliteBook 840	HP EliteBook 840
2e1d645e-0f9f-46a3-9c27-22115b125414	HP EliteBook 840	HP EliteBook 840
2dd1f27b-7da3-40de-ba61-6f0309cd332d	HP EliteBook 840	HP EliteBook 840
2442e178-76a4-41c0-84f4-05de855c3248	Canon PIXMA G3470	Canon PIXMA G3470
4bde2d02-829f-4c45-83cf-621e13eeb119	black	black
fa0d5199-5c87-40a1-af7c-9981e2cc1814	Black	Black
ba5d3ca1-ed9b-4de9-89a6-ff2b9e683085	White	White
347238a4-0679-4d98-8b0d-c2c57547f366	red	red
99406635-2ca2-4b49-b953-a2403c0e0997	Red	Red
3729526d-32bb-4565-a9dc-95ebeb13fb71	http://localhost:3000/products/canon-pixma-g3470-can-3ivvt0	http://localhost:3000/products/canon-pixma-g3470-can-3ivvt0
8e093880-f70a-4836-84f6-47edcb61b6d0	http://localhost:3000/products/canon-pixma-g3470-can-pxzhre	http://localhost:3000/products/canon-pixma-g3470-can-pxzhre
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, url, is_primary, sort_order) FROM stdin;
7e1e3b1e-7d6f-44fb-ac87-e02cd4588561	16512291-c07e-4f1e-9cb9-f8ff6beceaf0	/uploads/products/1790199942855-671585302.webp	t	0
2c8b58bc-474e-44df-945d-c606e03103ef	499ab7a7-4ab9-4fc2-baff-56097ef21507	/uploads/products/1790460260683-545651486.webp	t	4
3a72ec26-f621-4db4-964e-0f61c5cc882e	210afe72-7c62-446f-8305-2b376cb20e7b	/uploads/products/1790370588316-949549672.webp	f	0
68976659-b341-457d-ba84-2d14322c9d7e	210afe72-7c62-446f-8305-2b376cb20e7b	/uploads/products/1790370588687-566326344.webp	f	1
e187be76-3451-4f72-906e-c8c584197d4e	210afe72-7c62-446f-8305-2b376cb20e7b	/uploads/products/1790370588687-779510217.webp	f	2
c5575e31-8a44-463b-835e-98f4677e4ea0	8ff107cb-eb07-4334-b470-10efd7334adb	/uploads/products/1790444020575-832381254.webp	f	1
89231ea2-c88d-4227-9267-7316d2f0576b	210afe72-7c62-446f-8305-2b376cb20e7b	/uploads/products/1790370588688-469618939.webp	t	3
f283794c-671d-4759-a187-68cb6257bb0e	8ff107cb-eb07-4334-b470-10efd7334adb	/uploads/products/1790444019711-4804607.webp	f	0
d032d7db-e840-4760-a6eb-ace0da3f2a45	b64f2dad-c688-44d6-88b8-9c3bde9c8079	/uploads/products/1790414130467-280056303.webp	f	1
f1772776-5d9a-443b-aad9-0818376f2301	b64f2dad-c688-44d6-88b8-9c3bde9c8079	/uploads/products/1790414116603-807040397.webp	t	3
daa56682-3d4c-407c-8030-bc2dd127a3be	b64f2dad-c688-44d6-88b8-9c3bde9c8079	/uploads/products/1790414139866-153871141.webp	f	2
4f84a9f2-e108-4431-b047-7591f99e0334	b64f2dad-c688-44d6-88b8-9c3bde9c8079	/uploads/products/1790414144347-526628482.webp	f	3
35355f64-3f0b-46a4-89cc-7270be4cebb3	99ef1e23-b645-49cc-84f5-8132abdc19a1	/uploads/products/1790429837621-698243703.webp	t	0
9c4ff97b-da11-43ba-9a47-cbaa1b89dba1	99ef1e23-b645-49cc-84f5-8132abdc19a1	/uploads/products/1790429844061-128091957.webp	f	1
8a1b9cce-7a4f-4fa5-8ed3-16954f63e2d9	99ef1e23-b645-49cc-84f5-8132abdc19a1	/uploads/products/1790429848398-608361487.webp	f	2
8ed28521-5d77-4962-90fc-b8aad0861a10	99ef1e23-b645-49cc-84f5-8132abdc19a1	/uploads/products/1790429854068-250002620.webp	f	3
2ec358c7-7d60-4742-989d-43090cfa21fc	8ff107cb-eb07-4334-b470-10efd7334adb	/uploads/products/1790444022834-602217746.webp	t	0
cd2f6f16-f64d-4488-b20f-587826222711	f50aa46f-cf7a-4c3c-ba57-475fa324274d	/uploads/products/1790414769285-904376254.webp	f	1
9ab85f19-c3db-4aa8-b4f9-e757ca0ed1b6	f50aa46f-cf7a-4c3c-ba57-475fa324274d	/uploads/products/1790414773672-560121604.webp	f	2
6195bc78-f742-4d15-87e7-dcfc5c273a11	f50aa46f-cf7a-4c3c-ba57-475fa324274d	/uploads/products/1790414777328-79907595.webp	f	3
7639043b-ba1f-4cea-a922-3e5e45fdf309	f50aa46f-cf7a-4c3c-ba57-475fa324274d	/uploads/products/1790414757706-970886634.webp	t	3
ce0609e5-bdc5-4fc3-b47d-0450088186bd	dd95d060-fe32-453d-9df5-01c66185d125	/uploads/products/1790452755985-271696299.webp	t	0
4a1477a9-f67d-4928-b866-bb5fb291f1ba	dd95d060-fe32-453d-9df5-01c66185d125	/uploads/products/1790452756688-411458528.webp	f	1
c0ef537b-aa2a-4cad-aca1-8a3b5cd25783	dd95d060-fe32-453d-9df5-01c66185d125	/uploads/products/1790452756690-662796321.webp	f	2
30042f75-71b4-479c-be6f-e87686fa70a2	dd95d060-fe32-453d-9df5-01c66185d125	/uploads/products/1790452756690-979459670.webp	f	3
67588907-320e-4751-9422-276938d10beb	5df8f7c3-91fa-49fd-a152-ef93e97b8618	/uploads/products/1790589793378-704273498.webp	f	0
86aad204-059e-4c3f-9e53-fa2eb4a06c06	5df8f7c3-91fa-49fd-a152-ef93e97b8618	/uploads/products/1790589793380-696653599.webp	f	1
b1daa2fb-c3fc-4511-8f5c-4c2b3c88d4b4	5df8f7c3-91fa-49fd-a152-ef93e97b8618	/uploads/products/1790589793380-146349447.webp	f	2
a487e2a1-88e5-4664-a7a1-38391a70d5d3	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	/uploads/products/1790591745887-220823195.webp	t	0
e6b1a217-bb1b-4233-a35c-1f4dc1ec3d2b	5df8f7c3-91fa-49fd-a152-ef93e97b8618	/uploads/products/1790589793380-247996528.webp	t	3
4d4bc74d-95d0-47bd-b8c9-0d08d73170c7	807c1c6a-60cb-476f-862c-9335194798a1	/uploads/products/1790591899777-674555727.webp	t	0
eec3a683-6181-4569-977c-6a428b37dfd1	d68a073b-497b-4112-9061-c7ce109f1e6f	/uploads/products/1790592375669-8006354.webp	t	0
50209ab2-d4a5-4f00-a582-aae4426d250a	ffce4481-bbbf-45be-9009-ed606b1e5d99	/uploads/products/1790592447468-772139236.webp	t	0
952531cd-dc2d-4977-a314-3625b4077fe2	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	/uploads/products/1790595245712-772772236.webp	t	0
9c814bd3-db54-46ef-bcb9-d19efb223b6d	bc79e2ab-bf4d-4266-a666-b2d10448941b	/uploads/products/1790595348823-982783395.webp	t	0
7f60a1d0-d89c-4848-a4c7-1f848e338f35	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	/uploads/products/1790595449893-759326161.webp	t	0
26d0edde-a972-4a9c-a439-01e9f9452027	ab16b9b5-af0b-4a47-8e53-23ef9462558b	/uploads/products/1790595549037-210275478.webp	t	0
1c9a2a20-c6e4-4141-b485-7f095a869d8c	499ab7a7-4ab9-4fc2-baff-56097ef21507	/uploads/products/1790460260673-54435632.webp	f	0
5371e50e-e472-4098-b974-9eecf05eff03	499ab7a7-4ab9-4fc2-baff-56097ef21507	/uploads/products/1790460260682-8271109.webp	f	1
a976a0de-3c1e-4562-ae59-dd20202c2ac3	499ab7a7-4ab9-4fc2-baff-56097ef21507	/uploads/products/1790460260682-933363781.webp	f	2
e2f9b6e9-de3d-417f-9609-7ea9fa730bec	499ab7a7-4ab9-4fc2-baff-56097ef21507	/uploads/products/1790460260683-62425123.webp	f	3
1a492a39-2a49-477d-9360-3c70db91a13f	dda060e8-21fc-4093-ad48-6296ec34133e	/uploads/products/1790759725772-80612065.webp	t	0
56a1a1a0-8f12-4421-84fa-8c3d20d5884a	dda060e8-21fc-4093-ad48-6296ec34133e	/uploads/products/1790759730203-389970284.webp	f	1
900cf408-ade0-4085-8773-eed726c68567	986f6c75-39c4-4ff6-94e4-47d8b5fd6b05	/uploads/products/1790759918608-874561202.webp	t	0
2597bb75-4f1e-453d-be39-4963c09781b5	986f6c75-39c4-4ff6-94e4-47d8b5fd6b05	/uploads/products/1790759918609-665003516.webp	f	1
d6e671ab-9670-473f-b6a7-d05505214f10	986f6c75-39c4-4ff6-94e4-47d8b5fd6b05	/uploads/products/1790759918660-683691842.webp	f	2
daf10c1c-bfe9-451c-a0fc-2b5ce0e49021	62418d90-8db4-412c-9e27-286c422c8ade	/uploads/products/1790969688669-185667929.webp	t	1
d3d6a045-6174-47a5-a653-d6717022d4f2	5ee56167-ea62-4183-b0f3-d04b3c191f94	/uploads/products/1790969752522-283394801.webp	t	0
9ea9ac5d-c945-434e-94fa-94fc1f485537	cc6c7867-d314-43a2-a443-6e2b72b6ea56	/uploads/products/1790787038131-591186297.webp	f	0
181f3fee-7839-48bc-93f0-cdfda7556fdb	cc6c7867-d314-43a2-a443-6e2b72b6ea56	/uploads/products/1790787038186-459268515.webp	f	2
8aafb730-0214-4a0c-94d4-4f06bc7ce491	cc6c7867-d314-43a2-a443-6e2b72b6ea56	/uploads/products/1790787038185-418946008.webp	t	1
9653e7ee-9272-4e11-a5ac-1f19640f3d6b	d4d93860-7e3d-4685-b476-80199774400e	/uploads/products/1790975032708-605460676.webp	f	0
8d86a574-56fa-49ef-b634-d230973ec22f	d4d93860-7e3d-4685-b476-80199774400e	/uploads/products/1790975032773-469161441.webp	f	1
87b92118-9aa3-4f44-bf11-e6926a34e452	d4d93860-7e3d-4685-b476-80199774400e	/uploads/products/1790975032774-722593707.webp	f	2
75988da1-5227-48d5-99db-415f4c8bd9ea	d4d93860-7e3d-4685-b476-80199774400e	/uploads/products/1790975032774-396856623.webp	t	3
5cee8054-5759-4008-9ff3-f06bd23f5d95	b6d83b9d-7521-40bb-bd28-3920ed25eb37	/uploads/products/1790975431840-516641303.webp	t	0
a7964b69-39a2-4712-98fc-13f669d65e65	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	/uploads/products/1791053719057-703414948.webp	t	0
c099c7e4-5f83-4b16-858d-a555f83c04ab	09265091-4384-4a06-b2be-d0a8fa754656	/uploads/products/1791054016854-902328845.webp	t	0
bbe2c82f-e7ff-4fbf-aeea-83e5b2be5365	ff9fe919-7847-473d-b96e-b4404febb414	/uploads/products/1790785035698-163719137.webp	t	2
2233202f-81ec-4d73-9986-8d6717b9eedf	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	/uploads/products/1790969495346-484224249.webp	f	0
cfeaf8fc-155e-45fd-99d6-cb29303cfa5d	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	/uploads/products/1790969495433-196403865.webp	f	1
5113d4cf-282b-4d93-90f4-9303ccb63665	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	/uploads/products/1790969495433-308216933.webp	f	2
bdd3b604-0dcb-4b36-b0d1-9b38118ba12c	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	/uploads/products/1790969495433-836908658.webp	t	3
60cb43a2-5a9a-4341-a8d9-8b8db4810952	6c61c33f-a114-4b0c-9799-a1694345004d	/uploads/products/1791055571787-80434397.webp	f	0
79b2bb98-4981-45a3-a3cb-165ad0489009	6c61c33f-a114-4b0c-9799-a1694345004d	/uploads/products/1791055571787-970507956.webp	f	1
25eb7b62-6cf1-4169-958c-2d6aeb80f329	6c61c33f-a114-4b0c-9799-a1694345004d	/uploads/products/1791055571787-575754821.webp	f	2
d27e8df5-e028-4ac5-8635-fede68294a99	6c61c33f-a114-4b0c-9799-a1694345004d	/uploads/products/1791055571788-885810119.webp	t	3
abea28a2-b89f-40d4-b674-eb221256333a	fec0acb8-4cef-460c-9c71-5a68daedf2da	/uploads/products/1792053527968-698079154.webp	t	0
e9664427-55b0-4e33-9fd8-e6d96d5fcb57	fec0acb8-4cef-460c-9c71-5a68daedf2da	/uploads/products/1792053528170-644172513.webp	f	1
5d6eba19-6500-4031-bc4d-6465ec0bdb1a	fec0acb8-4cef-460c-9c71-5a68daedf2da	/uploads/products/1792053528170-421716629.webp	f	2
a31834f7-ce0b-4931-a6c0-c144720849b0	a5ff69ef-c479-4442-9d3f-d1a4d652822a	/uploads/products/1792053586804-673394130.webp	f	0
a130acb4-1dc1-44ee-9816-dcc64e95312f	a5ff69ef-c479-4442-9d3f-d1a4d652822a	/uploads/products/1792053586805-812864720.webp	f	2
2b6cd631-8e99-4c3e-81e0-a4cdfed420d3	a5ff69ef-c479-4442-9d3f-d1a4d652822a	/uploads/products/1792053586805-5119774.webp	t	1
60c6f4ad-9db4-4b47-bfe8-8f168d381599	fd5f3c13-5005-420f-9320-03de6a52f580	/uploads/products/1792053698830-891772776.webp	t	0
303ec69b-5e43-4b13-ac8c-e97a55eb927c	4de1812a-0a8d-4395-806c-7bcbfb576ec9	/uploads/products/1792053758425-801809685.webp	t	0
100cd8dc-99a5-4b4b-896c-bbd7074d7572	502d85eb-3edd-4193-8268-96f60cec0e0c	/uploads/products/1792053817635-893724418.webp	f	0
f0308b87-c64f-419c-9357-645e686ab81c	87cddaba-e65e-4729-aca1-acba475fe7f4	/uploads/products/1792053967290-971766732.webp	t	0
1e94199a-a857-43a8-b2c8-c4340a020cbe	502d85eb-3edd-4193-8268-96f60cec0e0c	/uploads/products/1792053817635-271036767.webp	f	2
42070dc6-1d85-419c-ac91-f859720afec3	502d85eb-3edd-4193-8268-96f60cec0e0c	/uploads/products/1792053817635-575901542.webp	f	3
3569a1cf-1774-464f-8c77-7b275d62ce9c	502d85eb-3edd-4193-8268-96f60cec0e0c	/uploads/products/1792053817635-567744818.webp	t	1
21ee3e18-e6fd-4a9f-8c20-0f14c343c25b	87cddaba-e65e-4729-aca1-acba475fe7f4	/uploads/products/1792053967290-682075354.webp	f	1
07ac4a03-6e69-4c83-bc0d-a2b265f91c13	87cddaba-e65e-4729-aca1-acba475fe7f4	/uploads/products/1792053967291-385418917.webp	f	2
4aa20890-988d-4e62-b3c4-d159a65dd7de	500b6b9b-24b2-45cf-a6b4-d13aa7d9a486	/uploads/products/1792054062852-217459677.webp	f	0
c856f7de-bebb-409d-9f32-a8b56d572687	13d65a9c-2e55-443e-9bf5-924b45b72a51	/uploads/products/1792006187499-341436208.webp	f	0
c67ed340-7b18-4f84-94bc-9c9b7a709e8d	13d65a9c-2e55-443e-9bf5-924b45b72a51	/uploads/products/1792006187526-346300011.webp	f	2
7693d4af-6281-47e2-963a-cf0879ad56a8	13d65a9c-2e55-443e-9bf5-924b45b72a51	/uploads/products/1792006187526-290798198.webp	f	3
19944f78-c98f-4f0c-8633-1a64afab7d86	13d65a9c-2e55-443e-9bf5-924b45b72a51	/uploads/products/1792006187526-19942866.webp	t	1
fbd8505a-02dc-4880-90dd-32afd0943347	500b6b9b-24b2-45cf-a6b4-d13aa7d9a486	/uploads/products/1792054062852-977888915.webp	f	2
cc73abff-e215-45a3-96c0-0390c7c7d788	500b6b9b-24b2-45cf-a6b4-d13aa7d9a486	/uploads/products/1792054062852-339702923.webp	f	3
3e49706c-f580-46d3-81ac-51075424d8fd	500b6b9b-24b2-45cf-a6b4-d13aa7d9a486	/uploads/products/1792054062852-43875381.webp	t	1
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (id, product_id, color_name, color_hex, size, sku, stock, image_id, sort_order) FROM stdin;
dee28766-5302-43f8-9148-d38c5e4a1be7	499ab7a7-4ab9-4fc2-baff-56097ef21507	Blanche	#FFFFFF	\N	\N	40	a976a0de-3c1e-4562-ae59-dd20202c2ac3	0
5742eb4f-9f2b-4009-8dfc-0aabcb39b69f	499ab7a7-4ab9-4fc2-baff-56097ef21507	Rouge	#F00000	\N	\N	40	1c9a2a20-c6e4-4141-b485-7f095a869d8c	1
0d9406e2-b454-4f98-b8c9-53d77f1e1d1e	499ab7a7-4ab9-4fc2-baff-56097ef21507	Noir	#000000	\N	\N	40	2c8b58bc-474e-44df-945d-c606e03103ef	2
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, sku, slug, category_id, brand_id, group_id, name_en, name_fr, description_en, description_fr, price, discount_price, stock, is_best_seller, is_active, created_at, updated_at, cost_price, short_description_en, short_description_fr, variant_size_label) FROM stdin;
b29e14e4-a8bd-444f-b2b5-6e2ee537066e	1245375-COPY-LFDA6-COPY-KJLBK	canon-pixma-ts3640-copy-kjlbk	34c76323-87ac-4892-b410-a072b29fc0b2	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	CANON PIXMA G3410	CANON PIXMA G3410			135000.00	130000.00	0	t	f	2026-09-23 16:54:55.336	2026-09-23 16:56:25.022	\N	\N	\N	\N
2d1a4f63-d3d7-4e10-bc15-8b4c05de9402	1245375-COPY-LFDA6-COPY-QBD24	canon-pixma-ts3640-copy-qbd24	34c76323-87ac-4892-b410-a072b29fc0b2	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	CANON PIXMA G3410	CANON PIXMA G3410			135000.00	129998.00	10	t	f	2026-09-23 16:57:00.949	2026-09-23 16:57:32.039	\N	\N	\N	\N
2f0e3436-31a9-4fc2-8857-00598855ee4a	5JF58FH	hththtr-5jf58fh	4066701a-3cac-4805-8b2e-e6213029e51f	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HTHTHTR	HTHTHTR			25000.00	35000.00	50	t	f	2026-09-23 16:58:41.161	2026-09-23 16:59:08.861	\N	\N	\N	\N
16512291-c07e-4f1e-9cb9-f8ff6beceaf0	KMPRO58746	mini-projector-hy300-pro-kmpro58746	4066701a-3cac-4805-8b2e-e6213029e51f	\N	\N	Mini Projector HY300 Pro	Mini Projector HY300 Pro			50000.00	\N	10	f	t	2026-09-23 19:04:29.946	2026-10-13 04:46:15.392	40000.00	\N	\N	\N
b64f2dad-c688-44d6-88b8-9c3bde9c8079	1245375-COPY-LFDA6	hp-2876-copy-lfda6	6d869665-27ce-41ad-aa42-0aca3f404ca1	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	CANON PIXMA TS3640	CANON PIXMA TS3640	The Canon PIXMA TS3640 is a compact wireless multifunction inkjet printer designed for home users, students, and small offices. With print, scan, and copy functions, Wi-Fi connectivity, and smartphone printing support, it makes everyday document and photo printing simple and convenient.	La Canon PIXMA TS3640 est une imprimante jet d'encre multifonction sans fil et compacte, conçue pour les particuliers, les étudiants et les petits bureaux. Grâce à ses fonctions d'impression, de numérisation et de copie, à sa connectivité Wi-Fi et à la prise en charge de l'impression depuis un smartphone, elle rend l'impression quotidienne de documents et de photos simple et pratique.	60000.00	55000.00	40	f	f	2026-09-23 16:08:13.43	2026-09-26 09:22:37.41	45000.00	\N	\N	\N
ff9fe919-7847-473d-b96e-b4404febb414	EPS-RW48IA	epson-l3210-eps-rw48ia	29027220-6a15-4f01-b7fa-e3a75657f554	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson Ecotank L3210	Epson Ecotank L3210	The printer provides print, scan and copy functions and connects to a computer through USB. It does not provide built-in Wi-Fi, making it suitable for a workstation where direct computer connection is acceptable.	Sa capacité à imprimer aussi bien en noir qu'en couleur en fait un choix polyvalent, tant pour les documents professionnels que pour les impressions personnelles.	145000.00	\N	10	f	t	2026-09-30 11:36:31.145	2026-10-01 19:29:40.822	130000.00	\N	\N	\N
bd757631-84e9-4867-b18f-8f1350215541	1245375	hp-2876-1245375	34c76323-87ac-4892-b410-a072b29fc0b2	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP 2876	HP 2876			60000.00	50000.00	8	f	f	2026-09-23 15:39:15.492	2026-09-26 11:34:38.359	\N	\N	\N	\N
210afe72-7c62-446f-8305-2b376cb20e7b	CAN-I65AYA	canon-pixma-g3410-can-i65aya	29027220-6a15-4f01-b7fa-e3a75657f554	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	CANON PIXMA G3410	CANON PIXMA G3410	With an estimated yield of up to 6,000 pages in black and 7,000 pages in colour, it is suitable for users who regularly print documents, school materials, business reports, and colour graphics. Actual yields vary depending on the content printed and usage conditions. 	Avec un rendement estimé allant jusqu'à 6 000 pages en noir et 7 000 pages en couleur, ce modèle convient aux utilisateurs qui impriment régulièrement des documents, du matériel scolaire, des rapports professionnels et des graphiques en couleur. Les rendements réels varient en fonction du contenu imprimé et des conditions d'utilisation.	135000.00	\N	70	f	t	2026-09-25 07:32:26.586	2026-10-15 08:50:21.575	125000.00	\N	\N	\N
5ee56167-ea62-4183-b0f3-d04b3c191f94	CAN-YCQT96	canon-446-colour-can-ycqt96	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon 446 Colour	Canon 446 Couleur			13000.00	\N	20	f	t	2026-09-30 18:14:23.271	2026-10-02 19:36:17.99	12000.00	\N	\N	\N
8ff107cb-eb07-4334-b470-10efd7334adb	HPS-N2VTZE	hp-smart-tank-585-hps-n2vtze	29027220-6a15-4f01-b7fa-e3a75657f554	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP Smart Tank 585	HP Smart Tank 585	Its combination of refillable ink tanks, wireless connectivity, and multifunction capabilities makes it suitable for small businesses, home offices, educational environments, and entrepreneurs who regularly handle printed documents.	Sa combinaison de réservoirs d'encre rechargeables, de connectivité sans fil et de fonctionnalités multifonctions la rend adaptée aux petites entreprises, aux bureaux à domicile, aux environnements éducatifs et aux entrepreneurs qui manipulent régulièrement des documents imprimés.	135000.00	\N	40	f	t	2026-09-26 13:43:48.72	2026-10-15 08:51:09.684	125000.00	\N	\N	\N
5df8f7c3-91fa-49fd-a152-ef93e97b8618	EPS-Y5DFT4	epson-ecotank-l3252-eps-y5dft4	29027220-6a15-4f01-b7fa-e3a75657f554	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson EcoTank L3252	Epson EcoTank L3252	The Epson EcoTank L3252 is a compact, wireless, ink-tank multifunction printer. Featuring printing, scanning, and copying functions, as well as Wi-Fi and Wi-Fi Direct connectivity, it allows for easy printing from compatible smartphones, tablets, and computers.	L'Epson EcoTank L3252 est une imprimante multifonction sans fil compacte à réservoirs d'encre. Dotée de fonctions d'impression, de numérisation et de copie, ainsi que de la connectivité Wi-Fi et Wi-Fi Direct, elle permet d'imprimer facilement depuis des smartphones, tablettes et ordinateurs compatibles.	150000.00	\N	40	f	t	2026-09-28 10:03:04.633	2026-10-15 08:52:51.611	135000.00	\N	\N	\N
99ef1e23-b645-49cc-84f5-8132abdc19a1	HPD-N61ERO	hp-deskjet-ink-advantage-2876-hpd-n61ero	6d869665-27ce-41ad-aa42-0aca3f404ca1	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP DeskJet Ink Advantage 2876	HP DeskJet Ink Advantage 2876	Wireless All-in-One Colour Printer with Wi-Fi, Scanner and Copier	Imprimante couleur tout-en-un sans fil avec Wi-Fi, scanner et copieur	65000.00	60000.00	40	t	t	2026-09-26 13:22:47.172	2026-10-15 08:50:53.007	50000.00	\N	\N	\N
4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	C13T00S14A	epson-103-black-c13t00s14a	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson 103 Black	Epson 103 Noir			12000.00	\N	40	f	t	2026-09-28 10:34:32.971	2026-09-28 10:39:59.498	10000.00	\N	\N	\N
807c1c6a-60cb-476f-862c-9335194798a1	C13T00S24A	epson-103-cyan-c13t00s24a	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson 103 Cyan	Epson 103 Cyan			12000.00	\N	40	f	t	2026-09-28 10:38:03.987	2026-09-28 10:38:35.569	10000.00	\N	\N	\N
ffce4481-bbbf-45be-9009-ed606b1e5d99	C13T00S44A	epson-103-yellow-c13t00s44a	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson 103 Yellow	Epson 103 Yellow			12000.00	\N	31	f	t	2026-09-28 10:47:22.004	2026-09-28 10:47:55.16	10000.00	\N	\N	\N
e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	CAN-MCTWH0	canon-pixma-mg2541s-can-mctwh0	6d869665-27ce-41ad-aa42-0aca3f404ca1	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon PIXMA MG2541S	Canon PIXMA MG2541S	The Canon PIXMA MG2541S combines print, scan and copy functions in a compact body that fits easily on a desk or home workstation. It uses Canon FINE cartridge technology for everyday black-and-white and colour printing. The USB connection makes it suitable for direct connection to a compatible computer		50000.00	\N	50	f	t	2026-09-30 18:07:54.581	2026-10-13 04:43:58.254	40000.00	\N	The Canon PIXMA MG2541S is a compact multifunction inkjet printer designed for everyday home and light office printing.	\N
d68a073b-497b-4112-9061-c7ce109f1e6f	C13T00S34A	epson-103-magenta-c13t00s34a	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson 103 Magenta	Epson 103 Magenta			12000.00	\N	45	f	t	2026-09-28 10:46:05.651	2026-09-28 10:48:23.534	10000.00	\N	\N	\N
ab16b9b5-af0b-4a47-8e53-23ef9462558b	CAN-H7M842	canon-gi-41-cyan-can-h7m842	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon GI-41 Cyan	Canon GI-41 Cyan			10000.00	\N	40	f	t	2026-09-28 11:39:03.632	2026-09-28 11:39:49.305	9000.00	\N	\N	\N
dda060e8-21fc-4093-ad48-6296ec34133e	CAN-OP1T28	canon-mc-g04-can-op1t28	4c416813-7ce6-4015-a98d-e0469246b3bc	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon MC-G04	Canon MC-G04			30000.00	\N	10	f	t	2026-09-30 09:14:46.158	2026-09-30 09:17:07.872	20000.00	\N	\N	\N
6473481b-68ba-4cf3-9d6a-d8e70a273c9e	CAN-DPUIUT	canon-gi-41-black-can-dpuiut	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon GI-41 Black	Canon GI-41 Noir			10000.00	\N	40	f	t	2026-09-28 11:33:48.013	2026-09-28 11:40:30.719	9000.00	\N	\N	\N
bc79e2ab-bf4d-4266-a666-b2d10448941b	CAN-LSWJD5	canon-gi-41-yellow-can-lswjd5	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon GI-41 Yellow	Canon GI-41 Yellow			10000.00	\N	40	f	t	2026-09-28 11:35:41.981	2026-09-28 11:40:06.495	9000.00	\N	\N	\N
8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	CAN-PYY27F	canon-gi-41-magenta-can-pyy27f	afbd342a-2cb9-44f8-83f4-a1be3a872a0a	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon GI-41 Magenta	Canon GI-41 Magenta			10000.00	\N	40	f	t	2026-09-28 11:37:24.097	2026-09-28 11:39:37.066	9000.00	\N	\N	\N
986f6c75-39c4-4ff6-94e4-47d8b5fd6b05	CAN-N7OOWR	canon-mc-g02-can-n7oowr	4c416813-7ce6-4015-a98d-e0469246b3bc	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon MC-G02	Canon MC-G02			18000.00	\N	30	f	t	2026-09-30 09:18:14.207	2026-09-30 09:20:23.085	14000.00	\N	\N	\N
499ab7a7-4ab9-4fc2-baff-56097ef21507	CAN-3IVVT0	canon-pixma-g3470-can-3ivvt0	29027220-6a15-4f01-b7fa-e3a75657f554	3a33d61f-c101-426a-9f02-245cf1f6a35b	2442e178-76a4-41c0-84f4-05de855c3248	Canon PIXMA G3470	Canon PIXMA G3470	Its combination of black and colour printing capabilities makes it a versatile choice for both professional documents and personal printing.	Sa capacité à imprimer aussi bien en noir qu'en couleur en fait un choix polyvalent, tant pour les documents professionnels que pour les impressions personnelles.	160000.00	\N	120	f	t	2026-09-26 22:04:07.926	2026-10-15 08:51:30.758	135000.00	\N	\N	\N
cc6c7867-d314-43a2-a443-6e2b72b6ea56	HPD-0JUCER	hp-deskjet-ink-advantage-2975-hpd-0jucer	6d869665-27ce-41ad-aa42-0aca3f404ca1	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP DeskJet Ink Advantage 2975	HP DeskJet Ink Advantage 2975			65000.00	\N	40	f	t	2026-09-30 10:26:26.232	2026-09-30 16:51:26.152	50000.00	\N	\N	\N
dd95d060-fe32-453d-9df5-01c66185d125	MAG-DRGZ1F	magnetic-phone-stand-mag-drgz1f	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	\N	\N	Magnetic Phone Stand	Magnetic Phone Stand	The Magnetic Phone Stand is a practical and stylish phone holder designed to keep your smartphone securely positioned for hands-free use.	Le support magnétique pour téléphone est un accessoire pratique et élégant, conçu pour maintenir votre smartphone en toute sécurité pour une utilisation mains libres.	8000.00	\N	8	f	t	2026-09-26 19:39:22.178	2026-10-14 19:32:58.366	4000.00	\N	A compact magnetic phone stand designed for hands-free smartphone viewing on desks and other suitable flat surfaces.	\N
62418d90-8db4-412c-9e27-286c422c8ade	CAN-76WRTJ	canon-445-black-can-76wrtj	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon 445 Black	Canon 445 Noir			13000.00	\N	20	f	t	2026-09-30 18:13:23.76	2026-10-02 19:35:28.385	11500.00	\N	\N	\N
f50aa46f-cf7a-4c3c-ba57-475fa324274d	CAN-GUD2Z4	canon-pixma-ts3640-can-gud2z4	6d869665-27ce-41ad-aa42-0aca3f404ca1	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon PIXMA TS3640	Canon PIXMA TS3640	The Canon PIXMA TS3640 is a compact wireless multifunction inkjet printer designed for home users, students, and small offices. With print, scan, and copy functions, Wi-Fi connectivity, and smartphone printing support, it makes everyday document and photo printing simple and convenient.	La Canon PIXMA TS3640 est une imprimante jet d'encre multifonction sans fil et compacte, conçue pour les particuliers, les étudiants et les petits bureaux. Grâce à ses fonctions d'impression, de numérisation et de copie, à sa connectivité Wi-Fi et à la prise en charge de l'impression depuis un smartphone, elle rend l'impression quotidienne de documents et de photos simple et pratique.	60000.00	\N	40	f	t	2026-09-26 09:25:22.481	2026-10-15 08:50:36.088	50000.00	\N	\N	\N
13d65a9c-2e55-443e-9bf5-924b45b72a51	EPS-ONHX5O	epson-ecotank-l3250-eps-onhx5o	29027220-6a15-4f01-b7fa-e3a75657f554	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson EcoTank L3250	Epson EcoTank L3250	The Epson EcoTank L3250 is a wireless all-in-one ink tank printer designed for families and\nstudents who need economical printing, scanning and copying. It adds Wi-Fi Direct and Epson mobile-printing services for a better proximity with the users need.		170000.00	150000.00	101	t	t	2026-10-01 19:35:38.564	2026-10-15 11:41:58.163	135000.00	\N	\N	\N
8b5f1c50-2c04-401f-a4e1-d9fc78143a28	GTM-MTE4YN	gt-52-magenta-gtm-mte4yn	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP GT52 Magenta	GT 52 Magenta			12000.00	\N	20	f	t	2026-10-03 18:55:10.414	2026-10-03 18:58:36.994	10000.00	\N	\N	\N
b6d83b9d-7521-40bb-bd28-3920ed25eb37	HPG-EIFFKZ	hp-gt-52cyan-hpg-eiffkz	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP GT 52Cyan	HP GT 52Cyan			12000.00	\N	20	f	t	2026-10-02 21:10:12.567	2026-10-02 21:13:52.513	10000.00	\N	\N	\N
d4d93860-7e3d-4685-b476-80199774400e	HPS-9WMCRC	hp-smart-tank-750-hps-9wmcrc	29027220-6a15-4f01-b7fa-e3a75657f554	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP Smart Tank 750	HP Smart Tank 750	The HP Smart Tank 750 is a wireless all-in-one ink tank printer designed for home offices and small businesses. It combines refillable ink tanks, print, scan and copy functions, a 35-sheet automatic document feeder and automatic duplex printing.		250000.00	\N	100	f	t	2026-10-01 19:39:06.665	2026-10-14 19:47:44.241	230000.00	\N	The HP Smart Tank 750 is a wireless all-in-one ink tank printer designed for home offices and small businesses.	\N
09265091-4384-4a06-b2be-d0a8fa754656	HPG-NB9NIT	hp-gt52-yellow-hpg-nb9nit	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP GT52 Yellow	HP GT52 Yellow			12000.00	\N	20	f	t	2026-10-03 19:00:06.495	2026-10-03 19:00:53.096	10000.00	\N	\N	\N
500b6b9b-24b2-45cf-a6b4-d13aa7d9a486	HPL-81R4AW	hp-laserjet-mfp-m236dw-hpl-81r4aw	b3e98ae6-51b1-4125-88b4-ae8844cfe536	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP LaserJet MFP M236dw	HP LaserJet MFP M236dw	The HP LaserJet MFP M236dw is a monochrome laser multifunction printer for print, copy and scan tasks. It combines up to 29 ppm A4 printing, automatic duplex printing, dual-band Wi-Fi, Ethernet and mobile printing		135000.00	\N	20	f	t	2026-10-01 19:42:20.809	2026-10-15 08:48:20.396	120000.00	\N	The HP LaserJet MFP M236sdw is a wireless monochrome laser multifunction printer designed for productive document workflows	\N
87cddaba-e65e-4729-aca1-acba475fe7f4	HPL-4QJGCV	hp-laserjet-mfp-m141a-hpl-4qjgcv	b3e98ae6-51b1-4125-88b4-ae8844cfe536	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP LaserJet MFP M141a	HP LaserJet MFP M141a	The HP LaserJet MFP M141a is a compact monochrome laser multifunction printer for print, copy and scan tasks. It is designed for home offices and small businesses that need dependable black-and-white document printing through a USB connection.		125000.00	\N	12	f	t	2026-10-01 20:16:29.204	2026-10-15 08:47:17.427	110000.00	\N	\N	\N
6c61c33f-a114-4b0c-9799-a1694345004d	EPS-4OZEL5	epson-ecotank-l3252-eps-4ozel5	29027220-6a15-4f01-b7fa-e3a75657f554	9c51cf56-c894-41ee-9caa-58e7e6335580	\N	Epson EcoTank L3252	Epson EcoTank L3252	The L3252 uses Epson's refillable four-colour ink tank system with front-facing tanks and keyed bottles designed for convenient refilling.\nWi-Fi and Wi-Fi Direct support wireless printing from compatible devices. Epson Smart Panel and Epson Connect services provide mobile and cloud-printing options.\nThe printer uses Epson Micro Piezo printhead technology and supports up to 5760 × 1440 dpi resolution, with borderless printing up to 10 × 15 cm.	The L3252 uses Epson's refillable four-colour ink tank system with front-facing tanks and keyed bottles designed for convenient refilling.\nWi-Fi and Wi-Fi Direct support wireless printing from compatible devices. Epson Smart Panel and Epson Connect services provide mobile and cloud-printing options.\nThe printer uses Epson Micro Piezo printhead technology and supports up to 5760 × 1440 dpi resolution, with borderless printing up to 10 × 15 cm.	180000.00	150000.00	37	f	t	2026-10-03 19:25:59.892	2026-10-15 08:45:45.271	135000.00	The Epson EcoTank L3252 is a compact wireless multifunction ink tank printer that combines print, scan and copy functions with Wi-Fi Direct and Epson mobile-print	The Epson EcoTank L3252 is a compact wireless multifunction ink tank printer that combines print, scan and copy functions with Wi-Fi Direct and Epson mobile-print	\N
4de1812a-0a8d-4395-806c-7bcbfb576ec9	KAS-GJ8TGZ	kaspersky-internet-security-2-devices-kas-gj8tgz	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	\N	\N	Kaspersky Internet Security – 2 Devices	Kaspersky Internet Security – 2 Postes			20000.00	\N	15	f	t	2026-10-07 18:06:00.448	2026-10-15 08:42:43.303	14000.00	\N	\N	\N
502d85eb-3edd-4193-8268-96f60cec0e0c	HPL-UGNS8H	hp-laserjet-mfp-m236sdw-hpl-ugns8h	b3e98ae6-51b1-4125-88b4-ae8844cfe536	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP LaserJet MFP M236sdw	HP LaserJet MFP M236sdw			230000.00	\N	14	f	t	2026-10-07 18:04:19.111	2026-10-15 08:43:52.538	210000.00	\N	\N	\N
88a77865-6aab-45eb-b5a6-5d60540f1d12	CAN-99R64B	canon-i-sensys-mf641cw-can-99r64b	b3e98ae6-51b1-4125-88b4-ae8844cfe536	3a33d61f-c101-426a-9f02-245cf1f6a35b	\N	Canon i-SENSYS MF641Cw	Canon i-SENSYS MF641Cw			300000.00	\N	12	f	t	2026-10-07 18:02:33.231	2026-10-15 08:45:29.823	278000.00	\N	\N	\N
fd5f3c13-5005-420f-9320-03de6a52f580	CAB-1EZOI8	cable-print-15m-cab-1ezoi8	e5ec0c1c-9c95-41e7-a35a-d06930d6ef9e	\N	\N	Cable Print 1.5M	Câble imprimante 1.5M			2000.00	\N	103	f	t	2026-10-15 08:41:16.263	2026-10-15 08:41:46.812	1000.00	\N	\N	\N
fec0acb8-4cef-460c-9c71-5a68daedf2da	HPC-ZVAVPD	hp-color-laser-150a-hpc-zvavpd	b3e98ae6-51b1-4125-88b4-ae8844cfe536	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP Color Laser 150a	HP Color Laser 150a			200000.00	\N	11	f	t	2026-10-07 18:11:00.805	2026-10-15 08:42:02.49	185000.00	\N	\N	\N
a5ff69ef-c479-4442-9d3f-d1a4d652822a	HPC-BE368F	hp-color-laserjet-pro-mfp-3303sdw-hpc-be368f	b3e98ae6-51b1-4125-88b4-ae8844cfe536	aabf87e0-d3f5-4d0c-97b7-de9fae4b8ea7	\N	HP Color LaserJet Pro MFP 3303sdw	HP Color LaserJet Pro MFP 3303sdw			315000.00	\N	20	f	t	2026-10-07 18:08:00.646	2026-10-15 08:42:21.076	295000.00	\N	\N	\N
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_subscriptions (id, admin_id, endpoint, p256dh, auth, lang, user_agent, created_at, updated_at) FROM stdin;
7eb4588a-d564-4fb0-ba84-6ab1d824b7aa	657781d6-c1b2-47e8-8512-4405ddc96163	https://fcm.googleapis.com/fcm/send/eky1Q5sm04w:APA91bEIfK9EPjHrFXsz7WnKiFNSeqjqBfJ-Nhwe4X0ftBdUHsVqzqQsgTtDWOFcf-PDnZ_ZXPNNYI9p1qlANMa0RKMyny8x_BIRPaTx-GAL5Gzu31wv-1YYegufzG56Ks28zBApjF0B	BE35k0dAm3_FSS7QNHMULnG2WEJ5anvXgR3nJrXPbKC-lNj3pX5QcIICZYIHLzMkGgHNtfRXeMK68mblNgWJ_Lc	LRbU7-gfzncMLEo-y1aXPw	fr	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36	2026-09-29 15:42:56.1	2026-09-29 15:42:56.1
\.


--
-- Data for Name: related_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.related_products (id, product_id, related_product_id, sort_order) FROM stdin;
e526d18f-2158-41b5-a6a5-b3d3f1bc129d	d4d93860-7e3d-4685-b476-80199774400e	09265091-4384-4a06-b2be-d0a8fa754656	0
a563aa81-8623-4df0-9901-1648acd57453	807c1c6a-60cb-476f-862c-9335194798a1	5df8f7c3-91fa-49fd-a152-ef93e97b8618	0
5eb40650-2041-4dfe-a9f4-06634cfae92f	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	5df8f7c3-91fa-49fd-a152-ef93e97b8618	0
636bbe3e-6d65-497d-b958-62b7da5bffbe	d4d93860-7e3d-4685-b476-80199774400e	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	1
8f9cc6f7-5a60-4558-b4d3-93e83b5c7bad	d4d93860-7e3d-4685-b476-80199774400e	b6d83b9d-7521-40bb-bd28-3920ed25eb37	2
e09c09ef-011e-4f54-bbca-2f5294963f0b	a5ff69ef-c479-4442-9d3f-d1a4d652822a	fd5f3c13-5005-420f-9320-03de6a52f580	0
0076e115-507b-45b4-9619-262f9e6bc351	ffce4481-bbbf-45be-9009-ed606b1e5d99	5df8f7c3-91fa-49fd-a152-ef93e97b8618	0
6abf4f44-276e-4ac2-a826-6e2ba97dd5ef	ffce4481-bbbf-45be-9009-ed606b1e5d99	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	1
51c77f69-7b0b-4b3f-b541-a39fa9043714	ffce4481-bbbf-45be-9009-ed606b1e5d99	807c1c6a-60cb-476f-862c-9335194798a1	2
c39a1e53-ff70-4363-8b50-1725ff09ee06	ffce4481-bbbf-45be-9009-ed606b1e5d99	d68a073b-497b-4112-9061-c7ce109f1e6f	3
5c98e479-0d04-4d52-871f-807cdb7cffc7	d68a073b-497b-4112-9061-c7ce109f1e6f	5df8f7c3-91fa-49fd-a152-ef93e97b8618	0
7f468992-8d3a-4fa0-a060-eb3fbbd926d0	d68a073b-497b-4112-9061-c7ce109f1e6f	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	1
c0874cd3-521e-4f19-9de3-8151638e16f7	d68a073b-497b-4112-9061-c7ce109f1e6f	807c1c6a-60cb-476f-862c-9335194798a1	2
bee0cfe3-eb7e-41fe-8339-b16187aa7a97	d68a073b-497b-4112-9061-c7ce109f1e6f	ffce4481-bbbf-45be-9009-ed606b1e5d99	3
63946a80-8923-4872-b02c-6e653d3fcb94	502d85eb-3edd-4193-8268-96f60cec0e0c	fd5f3c13-5005-420f-9320-03de6a52f580	0
5b85d9ad-1237-418d-be8c-4cd3e8223124	6c61c33f-a114-4b0c-9799-a1694345004d	ffce4481-bbbf-45be-9009-ed606b1e5d99	0
5e27c51a-f035-40ad-b8d4-8b584a1a79b8	6c61c33f-a114-4b0c-9799-a1694345004d	d68a073b-497b-4112-9061-c7ce109f1e6f	1
70aa8512-392e-45d3-a62a-9a5c6aeba3f2	6c61c33f-a114-4b0c-9799-a1694345004d	807c1c6a-60cb-476f-862c-9335194798a1	2
24566d83-6a36-486f-ab8d-e52a0fbda2b1	6c61c33f-a114-4b0c-9799-a1694345004d	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	3
fd076af0-d04a-48d2-8e2b-c01384a5e6e1	6c61c33f-a114-4b0c-9799-a1694345004d	fd5f3c13-5005-420f-9320-03de6a52f580	4
d1e40b48-5bac-4cfd-8221-42327a8118a5	210afe72-7c62-446f-8305-2b376cb20e7b	986f6c75-39c4-4ff6-94e4-47d8b5fd6b05	0
e70576ef-1d27-4206-89b7-e69604a80cdd	210afe72-7c62-446f-8305-2b376cb20e7b	fd5f3c13-5005-420f-9320-03de6a52f580	1
7733a726-3d9f-4575-bd8e-bcfedf4eaf0f	ff9fe919-7847-473d-b96e-b4404febb414	ffce4481-bbbf-45be-9009-ed606b1e5d99	0
16e0aa13-2d3d-4128-8d25-7ca6bb7e5895	ff9fe919-7847-473d-b96e-b4404febb414	d68a073b-497b-4112-9061-c7ce109f1e6f	1
9e5435a5-7289-4cb1-ab7b-fc3fed15acfe	499ab7a7-4ab9-4fc2-baff-56097ef21507	ab16b9b5-af0b-4a47-8e53-23ef9462558b	0
dd58a298-bbfa-43cf-a8cf-ae8075efae89	ff9fe919-7847-473d-b96e-b4404febb414	807c1c6a-60cb-476f-862c-9335194798a1	2
63da7d39-a364-4f61-80d0-e308ba70c7ad	ff9fe919-7847-473d-b96e-b4404febb414	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	3
4dc8e43d-f928-4c17-b378-2d30779ce663	499ab7a7-4ab9-4fc2-baff-56097ef21507	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	1
500b973c-4a48-4b3a-a8a7-71175fef1049	499ab7a7-4ab9-4fc2-baff-56097ef21507	bc79e2ab-bf4d-4266-a666-b2d10448941b	2
aac65330-1e84-4a99-a659-5d7b3d507854	499ab7a7-4ab9-4fc2-baff-56097ef21507	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	3
f2544475-8b78-4a62-8ab3-73f3ee910d79	499ab7a7-4ab9-4fc2-baff-56097ef21507	dda060e8-21fc-4093-ad48-6296ec34133e	4
e6fcc7d2-71a4-4ae9-9e9b-a51aa7d9f7ce	499ab7a7-4ab9-4fc2-baff-56097ef21507	fd5f3c13-5005-420f-9320-03de6a52f580	5
c0760ce8-e7e2-41d5-9e31-45dc780e4286	13d65a9c-2e55-443e-9bf5-924b45b72a51	ffce4481-bbbf-45be-9009-ed606b1e5d99	0
63933cdd-4880-463a-bff2-12ca4e54fd48	13d65a9c-2e55-443e-9bf5-924b45b72a51	d68a073b-497b-4112-9061-c7ce109f1e6f	1
2b100d01-d4fe-4c49-bf51-581751483c21	13d65a9c-2e55-443e-9bf5-924b45b72a51	807c1c6a-60cb-476f-862c-9335194798a1	2
409ddddf-28ae-4935-85c6-8b0e2a39c6fa	13d65a9c-2e55-443e-9bf5-924b45b72a51	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	3
17325aae-6b35-47db-8835-645659056f5b	5ee56167-ea62-4183-b0f3-d04b3c191f94	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	0
7ec88b57-14e8-4153-ac8e-ad4299efa6e6	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	499ab7a7-4ab9-4fc2-baff-56097ef21507	0
356b3d32-44ea-4024-90be-458100ebf80c	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	bc79e2ab-bf4d-4266-a666-b2d10448941b	3
2ffa94d5-c861-48b9-9bc3-30131d6f2541	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	4
a1ee4f69-e245-4851-b3bc-c9fdfde96271	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	ab16b9b5-af0b-4a47-8e53-23ef9462558b	5
23a5fe87-f61c-4f76-9f50-0f11c2ae0166	ab16b9b5-af0b-4a47-8e53-23ef9462558b	499ab7a7-4ab9-4fc2-baff-56097ef21507	0
eaed10bb-eb03-471e-ad4a-5e57d17a6c3f	ab16b9b5-af0b-4a47-8e53-23ef9462558b	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	3
066d28ee-99cc-4d7a-9f59-d2b509b67d0d	ab16b9b5-af0b-4a47-8e53-23ef9462558b	bc79e2ab-bf4d-4266-a666-b2d10448941b	4
2ff36150-9124-4ef6-9bd4-925fbafbc7b6	ab16b9b5-af0b-4a47-8e53-23ef9462558b	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	5
2bd387e1-37c5-456f-acd0-ba44e32a23f6	bc79e2ab-bf4d-4266-a666-b2d10448941b	499ab7a7-4ab9-4fc2-baff-56097ef21507	0
e4203df6-5fa8-45ae-afb2-c9c6bedef035	bc79e2ab-bf4d-4266-a666-b2d10448941b	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	3
b800b1ce-c07e-475e-a339-51a3f441e44e	bc79e2ab-bf4d-4266-a666-b2d10448941b	ab16b9b5-af0b-4a47-8e53-23ef9462558b	4
20f5f5da-6d5e-441c-aa6d-6daaf80aaee1	bc79e2ab-bf4d-4266-a666-b2d10448941b	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	5
890d1bfd-9a31-43e1-8132-d5d4ce7b1d2e	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	499ab7a7-4ab9-4fc2-baff-56097ef21507	0
99499b8f-5f87-4a31-9059-e10752a72995	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	ab16b9b5-af0b-4a47-8e53-23ef9462558b	3
a08f2eb6-b920-4370-a287-fe7c8ea7b574	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	8d1b16e1-ec92-4709-a6a0-8d0eeb4424ef	4
9395da17-24b0-435a-bef2-824ade8c5c2e	6473481b-68ba-4cf3-9d6a-d8e70a273c9e	bc79e2ab-bf4d-4266-a666-b2d10448941b	5
3e27fbca-c46c-49e3-81a6-4ccc813a3571	fec0acb8-4cef-460c-9c71-5a68daedf2da	fd5f3c13-5005-420f-9320-03de6a52f580	0
f36631f1-1aa5-4f5f-949d-ea3fc63f7d31	87cddaba-e65e-4729-aca1-acba475fe7f4	fd5f3c13-5005-420f-9320-03de6a52f580	0
93315e43-6fe0-48a6-9965-d2cd25738e7f	f50aa46f-cf7a-4c3c-ba57-475fa324274d	62418d90-8db4-412c-9e27-286c422c8ade	0
596bd780-bff5-43b0-b19b-bb1f09433333	f50aa46f-cf7a-4c3c-ba57-475fa324274d	5ee56167-ea62-4183-b0f3-d04b3c191f94	1
8cbed7c1-421d-4c27-bb12-908970ce40b0	f50aa46f-cf7a-4c3c-ba57-475fa324274d	fd5f3c13-5005-420f-9320-03de6a52f580	2
00fd7c37-157e-433f-9975-7f2286b2dc10	99ef1e23-b645-49cc-84f5-8132abdc19a1	fd5f3c13-5005-420f-9320-03de6a52f580	0
13f58069-52c5-4cd7-9d3e-f64b66e29a3f	62418d90-8db4-412c-9e27-286c422c8ade	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	0
6ca28b8b-0560-440e-8ad3-8ba87b231d6a	b6d83b9d-7521-40bb-bd28-3920ed25eb37	8ff107cb-eb07-4334-b470-10efd7334adb	0
52c49462-006d-43b4-acff-909353896740	b6d83b9d-7521-40bb-bd28-3920ed25eb37	d4d93860-7e3d-4685-b476-80199774400e	1
8ed2e902-19a2-4756-877e-75d5dfe6ed13	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	8ff107cb-eb07-4334-b470-10efd7334adb	0
674e0107-4d28-4359-8278-eb25d2c472fb	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	d4d93860-7e3d-4685-b476-80199774400e	1
2927a8b3-3026-432e-b72d-7b35e37e9073	09265091-4384-4a06-b2be-d0a8fa754656	8ff107cb-eb07-4334-b470-10efd7334adb	0
da338040-4fa2-40d1-8727-6b707f87b12d	09265091-4384-4a06-b2be-d0a8fa754656	d4d93860-7e3d-4685-b476-80199774400e	1
9e3acf60-4548-45dc-af69-9cdb48dd1afd	09265091-4384-4a06-b2be-d0a8fa754656	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	2
5a907257-c10a-4368-8975-735357545ebc	09265091-4384-4a06-b2be-d0a8fa754656	b6d83b9d-7521-40bb-bd28-3920ed25eb37	3
510c81bc-737a-40b4-83d0-13940cdbdd25	8ff107cb-eb07-4334-b470-10efd7334adb	09265091-4384-4a06-b2be-d0a8fa754656	0
6f95f07b-f95a-405d-9385-5373ac9a2018	8ff107cb-eb07-4334-b470-10efd7334adb	8b5f1c50-2c04-401f-a4e1-d9fc78143a28	1
a308e53d-f499-4587-a22b-0bb7ba70354f	8ff107cb-eb07-4334-b470-10efd7334adb	b6d83b9d-7521-40bb-bd28-3920ed25eb37	2
ae4679de-d084-4c4b-90d3-d4ac82a75133	8ff107cb-eb07-4334-b470-10efd7334adb	fd5f3c13-5005-420f-9320-03de6a52f580	3
65524d1e-bc70-463f-810b-b45940451283	5df8f7c3-91fa-49fd-a152-ef93e97b8618	4fc8b4c9-baa1-4217-95fd-e8890bcd9a03	0
23006bab-b1c1-4893-a88f-c2a16ebae505	5df8f7c3-91fa-49fd-a152-ef93e97b8618	ffce4481-bbbf-45be-9009-ed606b1e5d99	1
724fc490-60f7-431d-83f7-92298dbf57ef	dda060e8-21fc-4093-ad48-6296ec34133e	499ab7a7-4ab9-4fc2-baff-56097ef21507	0
adca5070-06fc-4f31-bd2b-433ea3345e28	5df8f7c3-91fa-49fd-a152-ef93e97b8618	807c1c6a-60cb-476f-862c-9335194798a1	2
3b543186-a7c4-4e12-8f65-283c111630ad	5df8f7c3-91fa-49fd-a152-ef93e97b8618	d68a073b-497b-4112-9061-c7ce109f1e6f	3
3ce48dcd-d693-4f35-9e2f-456c1a1621e6	5df8f7c3-91fa-49fd-a152-ef93e97b8618	fd5f3c13-5005-420f-9320-03de6a52f580	4
375fea5d-9e69-4148-82bf-1f2ca832eb9b	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	62418d90-8db4-412c-9e27-286c422c8ade	0
e5215298-9e46-41e6-9121-db17facd1a05	e1e6b1f9-d3fc-405a-928d-bc317fcdd42b	5ee56167-ea62-4183-b0f3-d04b3c191f94	1
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, updated_at) FROM stdin;
tracking	{"metaPixelId":"1884790486223869","gaMeasurementId":"","googleAdsId":"","googleAdsPurchaseLabel":"","clarityProjectId":"","requireConsent":true}	2026-10-14 08:28:44.177
store	{"whatsappNumber":"683174015","contactPhone":"683174015","contactEmail":"kmcom2025@gmail.com","notificationEmail":"kmcom2025@gmail.com","facebookUrl":"","instagramUrl":"","tiktokUrl":"","companyName":"IT Mart","companyAddress":"","companyCity":"","companyNiu":"","companyRccm":"","invoiceFooter":"","proformaValidityDays":15,"lowStockThreshold":5}	2026-10-14 18:30:05.743
branding	{"primaryColor":"#BB48E5","darkColor":"#500C69","backgroundColor":"#F8F7F8","logoUrl":"/uploads/branding/logo-1792056751329-946605.png","iconUrl":"/uploads/branding/icon-1792056298419-526246.png","logoDarkUrl":"/uploads/branding/logo-dark-1792058625797-320452.png"}	2026-10-15 21:12:56.777
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_attributes category_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_pkey PRIMARY KEY (id);


--
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_values product_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_pkey PRIMARY KEY (id);


--
-- Name: product_groups product_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_groups
    ADD CONSTRAINT product_groups_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: related_products related_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: delivery_zones_city_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX delivery_zones_city_key ON public.delivery_zones USING btree (city);


--
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- Name: orders_invoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_invoice_number_key ON public.orders USING btree (invoice_number);


--
-- Name: orders_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_reference_key ON public.orders USING btree (reference);


--
-- Name: product_attribute_values_attribute_id_value_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_attribute_values_attribute_id_value_idx ON public.product_attribute_values USING btree (attribute_id, value);


--
-- Name: product_attribute_values_product_id_attribute_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_attribute_values_product_id_attribute_id_key ON public.product_attribute_values USING btree (product_id, attribute_id);


--
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_brand_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_brand_id_idx ON public.products USING btree (brand_id);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_is_best_seller_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_best_seller_idx ON public.products USING btree (is_best_seller);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: push_subscriptions_admin_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_subscriptions_admin_id_idx ON public.push_subscriptions USING btree (admin_id);


--
-- Name: push_subscriptions_endpoint_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint);


--
-- Name: related_products_product_id_related_product_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX related_products_product_id_related_product_id_key ON public.related_products USING btree (product_id, related_product_id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: category_attributes category_attributes_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_attribute_values product_attribute_values_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_attribute_id_fkey FOREIGN KEY (attribute_id) REFERENCES public.category_attributes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attribute_values product_attribute_values_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.product_images(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.product_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: push_subscriptions push_subscriptions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: related_products related_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: related_products related_products_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4IxdySnJPqTLKgDsct0IrkYtQF1O2xoueSOhTgj78ZRpYLFLw9DlG8D0hypvrdC

