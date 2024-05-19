SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.5 (Ubuntu 15.5-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: billboard; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."billboard" ("id", "store_id", "label", "image_url", "created_at", "updated_at", "landing_page") VALUES
	('0abc0d39-f91b-47eb-ac11-df8c0c489692', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'Cases', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698386163/oqo067bcqpv14ywgxpwc.jpg', '2023-10-27 05:56:07.03+00', '2023-10-27 05:56:07.03+00', false),
	('9ad16d11-6785-4343-89ce-4ee4b24fef71', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'Fan Shrouds', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698356502/yb93otvqp7g9vzqp21ml.jpg', '2023-10-26 21:41:53.372+00', '2023-10-26 22:09:29.914+00', false),
	('d33022b9-40b1-459f-8088-17a7252b2073', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1703007606/bpdnu6uowqcftqozczwe.png', '2023-10-24 22:21:54.416+00', '2023-12-19 17:40:09.902+00', true),
	('f29cedc6-d429-48dc-97cb-92810e6613ec', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'Keycaps', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194230/bldgcshf6ibtsww1ipcq.jpg', '2023-10-25 00:37:13.335+00', '2023-10-26 21:37:27.639+00', false);


--
-- Data for Name: bundle; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bundle" ("id", "min_quantity", "price", "product_id", "created_at", "updated_at") VALUES
	('16d2e802-a4a3-44ef-bcdc-035101c946a1', 5, 75.000000000000000000000000000000, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('7ce5b430-e21a-4b8c-ab91-3a7b4b036251', 3, 51.000000000000000000000000000000, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('ee574e63-5d9f-4b72-9d9e-60d9de49f216', 4, 64.000000000000000000000000000000, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('f42ae31b-417f-4dc8-82c3-e01d6692bad3', 2, 36.000000000000000000000000000000, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00');


--
-- Data for Name: bundle_item; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: carousel_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."carousel_image" ("id", "image_url", "created_at", "updated_at", "store_id", "image_credit") VALUES
	('375ba39d-1817-4453-b468-aaa848be3c98', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842151/gbvyatbnurtajrvvhi1j.jpg', '2024-02-25 06:24:09.589+00', '2024-02-25 06:24:09.589+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'IG: @luuniecaps'),
	('41e6c558-c2a6-46ba-9d3a-2e1bde3fce4f', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842150/djbjqoyfhw4aievvkxex.jpg', '2024-02-25 06:24:09.589+00', '2024-02-25 06:24:09.589+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'IG: @quokkakeys'),
	('6f84695f-ea7a-46c3-80c8-66ab99e4c9f8', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1704305697/wfqnv1cdfta7skp5p8aa.jpg', '2024-02-25 06:24:09.589+00', '2024-02-25 06:24:09.589+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', ''),
	('766a118b-b9d4-4b44-9d1a-6f1f1dab04ae', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842150/fux0yul9fzumponsxb8z.jpg', '2024-02-25 06:24:09.589+00', '2024-02-25 06:24:09.589+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'IG: @miso.crossing'),
	('c9065684-db86-4aaa-b77f-7643d69986d3', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842245/u4ago5qpuc88jewuetx4.jpg', '2024-02-25 06:24:09.589+00', '2024-02-25 06:24:09.589+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'IG: @luuniecaps');


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."category" ("id", "store_id", "billboard_id", "name", "created_at", "updated_at") VALUES
	('08a8af38-ce08-42ed-8997-a9f7bd784c57', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '0abc0d39-f91b-47eb-ac11-df8c0c489692', 'Cases', '2023-10-26 18:40:48.136+00', '2023-10-27 05:56:16.863+00'),
	('4c1cd01e-8625-4833-870c-1801d118167c', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '9ad16d11-6785-4343-89ce-4ee4b24fef71', 'Fan Shrouds', '2023-10-27 00:49:42.628+00', '2023-10-27 00:49:42.628+00'),
	('da43fdaf-496b-49d6-b225-e0179bce5e48', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'f29cedc6-d429-48dc-97cb-92810e6613ec', 'Keycaps', '2023-10-24 23:21:26.728+00', '2023-10-25 00:37:59.936+00');


--
-- Data for Name: color; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."image" ("id", "product_id", "url", "created_at", "updated_at") VALUES
	('0114da16-e635-4742-b210-8fe69265e093', '9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996495/vckxbcip1ugghvqxhsko.png', '2023-11-14 22:54:40.861+00', '2023-11-14 22:54:40.861+00'),
	('086fc432-2c55-406d-a3a6-a372a7134e75', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194322/bb7y79erijzf4rufvj5r.jpg', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('0b1a2d4e-59d6-43c9-9789-bf3753956f67', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961979/pmpcm0psbqsgqvdbdosy.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00'),
	('0ef5dc8b-548e-4b35-9122-a2831307ac26', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/exmjlolmavlyhajwnsjh.png', '2023-11-03 02:11:47.512+00', '2023-11-03 02:11:47.512+00'),
	('1e6bf5af-de59-4c35-8db1-e19ee921a382', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/ovxpauxk8sh8jxfaritl.jpg', '2024-01-06 00:37:23.552+00', '2024-01-06 00:37:23.552+00'),
	('20cfb827-5769-426d-ac5e-5f7d7f2ab0ee', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/egn3ljg3qsaa9rhwe4xl.png', '2023-11-03 02:11:47.512+00', '2023-11-03 02:11:47.512+00'),
	('25ccf0bf-67e6-4c29-b679-55f412328d11', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194322/twvbu0d8kpwdzhht3vzw.jpg', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('288a8dd5-bc0f-410a-a25d-70955bf37675', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/batzjfhnzvpnkwjff9gu.png', '2023-11-03 02:11:47.512+00', '2023-11-03 02:11:47.512+00'),
	('2f2962cd-1f46-4360-9459-197256288a42', '9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996519/aemmutc5s0uy6syrazm2.png', '2023-11-14 22:54:40.861+00', '2023-11-14 22:54:40.861+00'),
	('3147ff9b-8594-4ec5-86dc-ed2562bb2004', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977153/y9qnzasfvtnnpdxxbibf.jpg', '2024-02-21 17:27:04.09+00', '2024-02-21 17:27:04.09+00'),
	('3469e8f1-6897-47f9-a810-6ceb101c98bb', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698992167/ufadkwapitft2ymom3wd.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00'),
	('3a7b62e2-13fe-4577-89f7-cf7e5da99ece', '4917a2b7-b137-4fcf-8fa2-c48944e3c88b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194529/vncgzaxextgpyaoaxjl3.png', '2023-10-27 00:03:59.752+00', '2023-10-27 00:03:59.752+00'),
	('42fb5598-7622-47bb-88ac-caca504fee7a', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995788/s4l1yitlnvmmalbx32pr.jpg', '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00'),
	('48975edf-f7c8-4642-9bd2-22f28d64f966', '1613a926-960c-4a43-8372-a884c60fde42', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698195547/cbpogw49rs5wdijbpxgy.png', '2023-11-15 02:08:14.151+00', '2023-11-15 02:08:14.151+00'),
	('583083d5-1fa9-4d5d-b3ae-8a81a1c68896', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698992166/mxpnfprwkvw3uytxpwbj.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00'),
	('5a3bbda4-2581-4b8f-8007-5ec9ec604dba', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995776/tis561wh1ab0pfvppvy9.jpg', '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00'),
	('5f9edd34-e7ef-4cc9-ae1b-c5e2944fd778', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/fymnydhgl9mj1bzyoiua.jpg', '2024-01-06 00:37:23.552+00', '2024-01-06 00:37:23.552+00'),
	('5fe1c7b3-8676-43c1-bc7b-6912d187ac24', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979638/gy4limtjcufhicfnvlan.jpg', '2024-01-06 00:37:23.552+00', '2024-01-06 00:37:23.552+00'),
	('64c30f87-945d-4263-bc5b-7af8b99c3895', 'a208260e-7653-42f9-a7e4-502eb61793db', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1700002311/gwlvcodultdgyv17k48p.jpg', '2023-11-14 22:53:19.158+00', '2023-11-14 22:53:19.158+00'),
	('731633ec-f852-4c46-9e63-38564aab7939', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961979/hxwa6y6keu5kobdvq4q1.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00'),
	('765cec36-c689-48c3-9c49-e87c6abca240', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/ihkte4yewe6du1dzksdr.jpg', '2024-01-06 00:37:23.552+00', '2024-01-06 00:37:23.552+00'),
	('7e8a8ceb-120e-424f-a783-42b5205ce8ff', '7c861ab1-2ec2-45fb-90d7-cf5c75831055', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995913/pnqzcgqchkfzm9eyi2cw.png', '2023-11-14 22:54:25.636+00', '2023-11-14 22:54:25.636+00'),
	('81de3144-6e31-4609-a1ff-3e9a2c8e3f12', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698365917/cw44v6njhjs8myftwyvf.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00'),
	('a140e1e1-3b26-4fc4-a8cc-4b0c30c3910d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/osw92zef0drywlt8dxxu.jpg', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('a1be4ec3-8e56-4e10-9b67-29a84c7084a7', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/j6cowwxjctdtn5bhyemh.jpg', '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00'),
	('aa04c823-6b6a-4119-8b2c-5ea55aa644be', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698365901/furrsa0ljogadpyfw6mv.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00'),
	('aa2995ed-e973-4ac4-9f4a-bf83d90ace5b', 'c46c324b-7f05-433e-97dd-57342cc47f92', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698198079/ifwqne3iihcjwavyqbwp.png', '2023-11-15 02:07:44.198+00', '2023-11-15 02:07:44.198+00'),
	('ac6c62d8-c83f-4104-9e11-4e8f56e43593', 'a208260e-7653-42f9-a7e4-502eb61793db', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1700002311/dqnc39nbxauj0y93nfgf.jpg', '2023-11-14 22:53:19.158+00', '2023-11-14 22:53:19.158+00'),
	('b0c2e104-b287-45ac-9302-01eb9da78994', '7c861ab1-2ec2-45fb-90d7-cf5c75831055', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995901/bpbxtkhiphjoahmhaoe8.png', '2023-11-14 22:54:25.636+00', '2023-11-14 22:54:25.636+00'),
	('b26b34ed-afbf-4a36-934e-2286193d6896', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961981/hpc9xd91p5axyhvwh8gi.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00'),
	('be6a66b7-a05f-425a-a18e-0ecd2efd8f9c', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/jc6cv6aw9n1p0jlbjgyp.jpg', '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00'),
	('bef8300d-b290-4bad-b510-90abe6de8b01', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995725/bgifhfitmn9dvjlkz56g.jpg', '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00'),
	('d9176573-95b2-49ac-863b-a5ce67e5fada', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979033/gzchjnmnnog67zrnrhhh.jpg', '2024-02-21 17:27:04.09+00', '2024-02-21 17:27:04.09+00'),
	('d97fc602-c84c-4246-be9d-444f66172552', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/hpujr77dyldwtb1vte90.jpg', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('da3042b8-3847-4ef8-916c-13cc56373685', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/febcv5gmxk3l6v41kweh.jpg', '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00'),
	('dabd2c00-0e3d-491d-86fd-959dc11d1abf', '1932d64e-c282-4f83-8411-d9ad31a92428', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698208488/bkyxcdabvjtxq57yky86.png', '2023-11-15 02:08:03.429+00', '2023-11-15 02:08:03.429+00'),
	('db6da09b-6195-48ff-8d54-9b7a26f3d0ea', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/qwovmt6ysadc8nk9ugyq.jpg', '2023-11-03 02:11:47.512+00', '2023-11-03 02:11:47.512+00'),
	('f3f47867-f45e-4a80-9b39-ea5859b55daf', '78bc6119-b237-4674-b6c3-9638c3e6802e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996694/mvljwytocstlo5dwufao.png', '2023-11-14 22:54:50.809+00', '2023-11-14 22:54:50.809+00'),
	('f4683c5c-40fd-4ff6-99e1-d58bbedb34ce', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/ky7iqyeeomhoxq7mxmfw.jpg', '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00'),
	('f53c9dc4-6de2-473e-ac97-cc83f71c3351', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977153/azdeocll2e8wo1jc489w.jpg', '2024-02-21 17:27:04.09+00', '2024-02-21 17:27:04.09+00'),
	('f859c050-84a7-4234-9abe-58ca3e1e7a21', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698346939/xjiyrsystsuygfgjivys.jpg', '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00'),
	('fd2fdeda-3395-4eea-b38c-3564a293fb5b', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961849/immrdayxjbmwrctle2hw.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00');


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order" ("id", "store_id", "is_paid", "address", "created_at", "updated_at", "total_price", "shipping_address", "email_address", "is_abandoned") VALUES
	('14d3802a-1882-4619-855d-d9dccb30a074', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '121212, 12341, qwreq3ey, BC, V7A 1M7, CA', '2023-10-26 20:49:55.628+00', '2023-10-26 20:54:05.274+00', 0.000000000000000000000000000000, '', '', false),
	('33e18887-2c6b-4855-bc15-ef76e4855b1d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:34:39.751+00', '2023-11-14 23:36:20.78+00', 20.000000000000000000000000000000, '', '', false),
	('4538cbd4-3a31-4e2a-919d-9afdf10552eb', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:30:45.276+00', '2023-11-14 23:29:57.11+00', 75.000000000000000000000000000000, '', '', false),
	('7299b63b-2cff-4224-b405-26f80f9fc84e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:46:13.856+00', '2023-11-14 22:46:30.46+00', 36.000000000000000000000000000000, '', '', false),
	('b87831c2-d284-4fbc-b96b-fcf5da67e271', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:16:27.896+00', '2023-11-14 23:16:03.915+00', 36.000000000000000000000000000000, '', '', false),
	('1613f57b-5aef-47ff-9cdf-503b16ad7123', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-02 05:21:08.604+00', '2024-05-18 08:29:23.334+00', 0.000000000000000000000000000000, '', '', true),
	('1e9be139-8f55-4b5c-a0bd-dac15c07b61f', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-15 21:44:02.663+00', '2024-05-18 08:29:23.363+00', 105.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US, mac.sampson@proton.me', '', true),
	('29f97042-d90a-46fe-a100-827149488395', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-21 17:39:51.33+00', '2024-05-18 08:29:23.376+00', 36.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('810fdf66-d8dc-4e3f-b9f1-8362732fcdae', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 17:11:09.858+00', '2024-05-18 08:29:23.383+00', 0.000000000000000000000000000000, '', '', true),
	('83d0c152-9698-40c1-b74e-984b1f3e893d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 19:15:10.598+00', '2024-05-18 08:29:23.403+00', 0.000000000000000000000000000000, '', '', true),
	('866feb66-3a34-4e6b-b45e-37e9a5156c9f', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-20 07:31:27.56+00', '2024-05-18 08:29:23.416+00', 36.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('8a88bff7-b1c1-45c7-8481-9f496ddd61f4', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-12-27 23:04:06.459+00', '2024-05-18 08:29:23.425+00', 105.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US, mac.sampson@pm.me', '', true),
	('939741fd-7483-4809-80a3-9066510b47c5', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-20 07:34:44.49+00', '2024-05-18 08:29:23.439+00', 36.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('b09c2162-5a21-407a-bf90-f87cbb6e6795', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 19:03:28.003+00', '2024-05-18 08:29:23.446+00', 0.000000000000000000000000000000, '', '', true),
	('b20e5964-746d-42ac-a2e7-bd920fb1bd55', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 18:36:38.897+00', '2024-05-18 08:29:23.458+00', 0.000000000000000000000000000000, '', '', true),
	('b7d7413e-1ad0-453b-8081-b260001b6a8d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-21 03:17:02.429+00', '2024-05-18 08:29:23.465+00', 36.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('b9495df5-2e15-4935-a13c-7ca8b67fb309', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-03 00:57:59.09+00', '2024-05-18 08:29:23.473+00', 0.000000000000000000000000000000, '', '', true),
	('c67024bb-1277-49a9-9ff3-076ca26d2b1a', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-14 21:32:01.511+00', '2024-05-18 08:29:23.48+00', 36.000000000000000000000000000000, '', '', true),
	('dd151315-90d5-4ed2-9b2d-5b6e53cb61b1', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 18:36:51.804+00', '2024-05-18 08:29:23.488+00', 0.000000000000000000000000000000, '', '', true),
	('ec7962a2-ccb6-44b0-924a-5fd802ce1465', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-05-02 14:05:25.102+00', '2024-05-18 08:29:23.495+00', 20.000000000000000000000000000000, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true);


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_item" ("id", "order_id", "product_id", "created_at", "updated_at", "quantity", "product_variation_id", "price", "name") VALUES
	('19cde36b-e7f6-45ec-88eb-aff380c05319', '810fdf66-d8dc-4e3f-b9f1-8362732fcdae', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 17:11:09.858+00', '2023-10-26 17:11:09.858+00', 1, NULL, 0.000000000000000000000000000000, '""'),
	('22588624-5562-463a-bf55-49b1fcaa9248', '1613f57b-5aef-47ff-9cdf-503b16ad7123', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-02 05:21:08.604+00', '2023-11-02 05:21:08.604+00', 3, NULL, 0.000000000000000000000000000000, '""'),
	('28a43787-a48b-4752-ad6e-91b8b815bd66', '8a88bff7-b1c1-45c7-8481-9f496ddd61f4', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-12-27 23:04:06.459+00', '2023-12-27 23:04:06.459+00', 5, NULL, 20.000000000000000000000000000000, '""'),
	('3b416fe0-99e6-4c04-9352-88958cd6835c', '8a88bff7-b1c1-45c7-8481-9f496ddd61f4', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-12-27 23:04:06.459+00', '2023-12-27 23:04:06.459+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('41d1d3e5-ca33-4e83-b905-154ecf5e742d', 'b09c2162-5a21-407a-bf90-f87cbb6e6795', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 19:03:28.003+00', '2023-10-26 19:03:28.003+00', 5, NULL, 0.000000000000000000000000000000, '""'),
	('481c3545-c713-478e-a0a5-1c7e3e799eaa', 'b09c2162-5a21-407a-bf90-f87cbb6e6795', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 19:03:28.003+00', '2023-10-26 19:03:28.003+00', 1, NULL, 0.000000000000000000000000000000, '""'),
	('560b09b9-3b10-4c9a-ad7e-a6942bee3b6f', 'b87831c2-d284-4fbc-b96b-fcf5da67e271', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:16:27.896+00', '2023-11-14 22:16:27.896+00', 2, NULL, 36.000000000000000000000000000000, '""'),
	('699514fb-7801-4627-8678-d6f71db852af', '866feb66-3a34-4e6b-b45e-37e9a5156c9f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-20 07:31:27.56+00', '2024-02-20 07:31:27.56+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('6f13c474-01f2-4678-9364-5896f31ef798', 'c67024bb-1277-49a9-9ff3-076ca26d2b1a', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 21:32:01.511+00', '2023-11-14 21:32:01.511+00', 2, NULL, 36.000000000000000000000000000000, '""'),
	('6f44ff37-ed3a-42da-a384-649c2a34cbb8', '1e9be139-8f55-4b5c-a0bd-dac15c07b61f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-15 21:44:02.663+00', '2024-02-15 21:44:02.663+00', 5, NULL, 20.000000000000000000000000000000, '""'),
	('710da5e0-6872-4de6-b33b-34386dfe6ec3', '7299b63b-2cff-4224-b405-26f80f9fc84e', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:46:13.856+00', '2023-11-14 22:46:13.856+00', 2, NULL, 36.000000000000000000000000000000, '""'),
	('87fb2263-aeb7-490e-9116-ce1e0e5167fa', '4538cbd4-3a31-4e2a-919d-9afdf10552eb', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:30:45.276+00', '2023-11-14 22:30:45.276+00', 5, NULL, 75.000000000000000000000000000000, '""'),
	('95a1167d-9ed7-4437-af47-ed581b7f7cc8', 'b20e5964-746d-42ac-a2e7-bd920fb1bd55', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 18:36:38.897+00', '2023-10-26 18:36:38.897+00', 2, NULL, 0.000000000000000000000000000000, '""'),
	('a674f7f3-6ce6-4694-b723-84ff66ed5035', '83d0c152-9698-40c1-b74e-984b1f3e893d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 19:15:10.598+00', '2023-10-26 19:15:10.598+00', 1, NULL, 0.000000000000000000000000000000, '""'),
	('ade87224-66fc-417b-9813-3df31ce89a65', '29f97042-d90a-46fe-a100-827149488395', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-21 17:39:51.33+00', '2024-02-21 17:39:51.33+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('c7e1b4f1-e8e9-4a00-8b98-af714277fe01', '939741fd-7483-4809-80a3-9066510b47c5', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-20 07:34:44.49+00', '2024-02-20 07:34:44.49+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('cbf544ea-3985-4d19-9d5c-32b815774d3b', 'dd151315-90d5-4ed2-9b2d-5b6e53cb61b1', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 18:36:51.804+00', '2023-10-26 18:36:51.804+00', 7, NULL, 0.000000000000000000000000000000, '""'),
	('cbfebc5f-99ba-426a-869a-740cdb0d0ec1', 'b7d7413e-1ad0-453b-8081-b260001b6a8d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-21 03:17:02.429+00', '2024-02-21 03:17:02.429+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('cd79dfaa-6e59-4ddd-8ed6-2900acf5fa07', 'b9495df5-2e15-4935-a13c-7ca8b67fb309', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-03 00:57:59.09+00', '2023-11-03 00:57:59.09+00', 2, NULL, 0.000000000000000000000000000000, '""'),
	('d0e0cd5b-87ae-4d81-84f3-eeb162cbbcdd', '14d3802a-1882-4619-855d-d9dccb30a074', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 20:49:55.628+00', '2023-10-26 20:49:55.628+00', 1, NULL, 0.000000000000000000000000000000, '""'),
	('ec9bc74e-28ea-4167-b950-0359aa3268e2', '33e18887-2c6b-4855-bc15-ef76e4855b1d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:34:39.751+00', '2023-11-14 22:34:39.751+00', 1, NULL, 20.000000000000000000000000000000, '""'),
	('f6b30d2b-7ad1-4b2a-b2a0-582e0db95b75', '1e9be139-8f55-4b5c-a0bd-dac15c07b61f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-15 21:44:02.663+00', '2024-02-15 21:44:02.663+00', 2, NULL, 20.000000000000000000000000000000, '""'),
	('f7675c86-332e-4181-84b7-71c24d540ea6', '83d0c152-9698-40c1-b74e-984b1f3e893d', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 19:15:10.598+00', '2023-10-26 19:15:10.598+00', 1, NULL, 0.000000000000000000000000000000, '""'),
	('fb6bf639-0a54-4c2d-9a21-1e11e0fe6877', '14d3802a-1882-4619-855d-d9dccb30a074', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 20:49:55.628+00', '2023-10-26 20:49:55.628+00', 5, NULL, 0.000000000000000000000000000000, '""'),
	('d135ee26-094e-47a1-8c82-c108e2474a6b', 'ec7962a2-ccb6-44b0-924a-5fd802ce1465', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-05-02 14:05:25.102+00', '2024-05-02 14:05:25.102+00', 1, 'b91cc904-f8b6-45b7-9e1a-13c30d656ab0', 20.000000000000000000000000000000, '""'),
	('928d3975-faaa-4242-80e9-cdcbed0afeb3', 'f1bdd6e4-be18-4884-b686-5e036551a1ed', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-05-02 14:12:01.241+00', '2024-05-02 14:12:01.241+00', 1, 'b91cc904-f8b6-45b7-9e1a-13c30d656ab0', 20.000000000000000000000000000000, '""');


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product" ("id", "store_id", "category_id", "name", "price", "is_featured", "is_archived", "size_id", "color_id", "quantity", "created_at", "updated_at", "description") VALUES
	('0aafd8df-1d05-4758-b61f-061f89ceb4d9', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Snom - Pokemon', 50.000000000000000000000000000000, true, false, NULL, NULL, 0, '2023-11-03 02:08:20.577+00', '2024-02-21 17:27:03.016+00', 'The Coolest Typing Buddy! 🧊❄️

From the Crown Tundra to your fingertips, our Snom Keycap is the chill touch your keys need.

COMPATIBILITY
This keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Kailh and Razer switches.

DIMENSIONS
Width: 0.71" (18.2 mm)  
Height: 0.85" (21.7mm)'),
	('1613a926-960c-4a43-8372-a884c60fde42', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Fossil - Animal Crossing', 100.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-10-25 00:59:23.744+00', '2023-11-15 02:08:13.542+00', 'Animal Crossing Fossil Keycap 🦖🦴

Unearth a touch of prehistoric chic that makes every typing session an archaeological adventure!

Details:

Profile: OEM
Compatibility: Tailored for mechanical keyboards, this keycap perfectly complements Cherry MX, Gateron, and Kailh switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)
'),
	('1932d64e-c282-4f83-8411-d9ad31a92428', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Wasp Nest - Animal Crossing', 80.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-10-25 04:35:08.347+00', '2023-11-15 02:08:02.693+00', 'Animal Crossing Wasp Nest Keycap 🐝

Ever wanted to trigger your wasp-induced PTSD?
Now you can every time you look at your keyboard!

Profile: 
OEM

Compatibility: 
Designed for mechanical keyboards, this keycap is compatible with Cherry MX, Gateron, Kailh, and Razer switches.

Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)
'),
	('2f84e5c2-6896-4ec6-a468-546e44fba0ec', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Buu - Dragon Ball Z', 50.000000000000000000000000000000, true, false, NULL, NULL, 0, '2023-11-03 02:51:04.498+00', '2024-01-06 00:37:22.476+00', 'Summon mischief to your keyboard with our matte-finish Buu keycap 😈✨

With its soft, playful pink and the iconic grin of Dragonball''s Buu, this keycap is your trusty ally for both work and play.  👅'),
	('346a5664-bd86-4a38-b4f5-f64ae288ab09', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Traditional Mooncake', 30.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-03 02:11:47.512+00', '2023-11-03 02:11:47.512+00', 'Mid-Autumn Magic for Your Keys! 🥮
Our Mooncake Keycap brings the essence of the Mid-Autumn Festival to your fingertips.

COMPATIBILITY
This 3D printed keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Kailh, and Razer switches.

STANDARD: 
Dimensions
Width: 0.511" (13 mm)  
Height: 0.433" (11 mm)
'),
	('4917a2b7-b137-4fcf-8fa2-c48944e3c88b', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Bell Bag - Animal Crossing', 100.000000000000000000000000000000, true, false, NULL, NULL, 0, '2023-10-25 00:18:03.636+00', '2023-10-27 00:03:59.54+00', 'Animal Crossing Bell Bag Keycap 💰

Invest in your keyboard''s aesthetics with this expertly designed Bell Bag keycap - why wait for Tom Nook when you can cash in on every keystroke?

Details:

Profile: OEM
Compatibility: Tailored for mechanical keyboards, this keycap flawlessly suits Cherry MX, Gateron, and Kailh switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)


'),
	('604ae388-b63e-4d02-9294-7f09e453a1f6', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Owl Keycap - Link''s Awakening', 20.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-10-27 00:34:22.629+00', '2023-11-15 02:07:11.696+00', 'Owl Statue Keycap from Link''s Awakening with RGB Compatibility 🦉

Dive deep into the world of Koholint Island with our Stone Owl Statue Keycap. 
Carefully crafted, this keycap not only embodies the spirit and mystery of the legendary game but also boasts a design that lets the RGB lighting of your keyboard shine brilliantly through its eyes.

What secrets will it share with you? '),
	('637a1694-fcf6-4c0e-9ed6-308892fcd7df', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Eevee - Pokemon', 55.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-02 21:52:45.137+00', '2024-02-21 17:27:13.703+00', 'PocketCaps meets Pocket Monsters 🎮

Merge your love for Pokémon and sleek design with our enchanting Eevee Keycap. Catch it before it''s gone!

COMPATIBILITY
This keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Razer, and Kailh switches.

DIMENSIONS
Width: 0.75" (19 mm)  
Height: 0.86" (22mm)
'),
	('78bc6119-b237-4674-b6c3-9638c3e6802e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Xiao - Genshin Impact', 15.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-14 21:19:12.679+00', '2023-11-14 22:54:50.206+00', 'Step into the realm of adepti with our Xiao-inspired fan shroud, a must-have for any Genshin Impact PC build. 🌌🍃 


These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *
'),
	('7c861ab1-2ec2-45fb-90d7-cf5c75831055', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Lisa Fan Shroud - Genshin Impact', 15.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-14 21:09:42.119+00', '2023-11-14 22:54:25.037+00', 'Elevate your PC''s aesthetics with our Lisa-inspired fan shroud from Genshin Impact! 🌟🔮 

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *
'),
	('9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Hu Tao - Genshin Impact', 15.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-14 21:17:14.967+00', '2023-11-14 22:54:40.248+00', 'Bring the spirit-soothing ambiance of Hu Tao to your gaming sanctuary with this custom PC fan shroud 🌙💜 

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *

'),
	('a208260e-7653-42f9-a7e4-502eb61793db', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Power - Chainsaw Man', 15.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-11-14 22:53:19.158+00', '2023-11-14 22:53:19.158+00', 'Unleash the fierce energy of Power from Chainsaw Man with our custom PC fan shroud, designed for those who dare to embrace the wild side of their setup. 🌪️🔥

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *

If you have any questions or concerns, please feel free to message me. I''ll be happy to help!'),
	('ac8dada3-52c3-4e0d-99f1-af2eac8a991e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '08a8af38-ce08-42ed-8997-a9f7bd784c57', 'Mooncake Keycap Gift Case', 10.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-10-27 00:21:54.806+00', '2023-11-14 21:01:13.482+00', 'Elevate your keycap collection with our meticulously crafted Artisan Keycap Case. Designed with a touch of modern aesthetic and a hint of traditional patterns, this 3D-printed case is a perfect blend of form and function.

DIMENSIONS
Diameter: 2.55" (65 mm)  
Height: 0.827" (21 mm)'),
	('c46c324b-7f05-433e-97dd-57342cc47f92', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Peach - Animal Crossing', 90.000000000000000000000000000000, false, false, NULL, NULL, 0, '2023-10-25 01:41:33.207+00', '2023-11-15 02:07:43.518+00', 'Animal Crossing Peach Keycap 🍑

Ever shaken a tree and wished that perfect peach could land right on your keyboard? 😏

This keycap brings a slice of the orchard to your fingertips. Experience the joy of virtual fruit-gathering with every keystroke...minus the tree-shaking effort.

Details 📝:

Profile: OEM
Compatibility: Designed to fit seamlessly with Cherry MX, Gateron, Kailh, and Razer switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)'),
	('14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '08a8af38-ce08-42ed-8997-a9f7bd784c57', 'Poké Ball Keycap Gift Case', 15.000000000000000000000000000000, false, false, NULL, NULL, 2, '2023-10-26 19:02:49.652+00', '2024-05-18 08:29:23.454+00', 'Surprise the special Trainer in your life with our Poké Ball keycap gift cases! 🎁

Made with sturdy PLA, these cases come in small and large. Whether it''s a birthday, a tournament win, or just because, our Poké Ball cases ensure your gift is ready for a journey across the Kanto region and beyond. 

Small Poké Ball will fit 1 keycap and Large will fit 2!



DIMENSIONS:

SMALL: 35mm x 35mm x 35mm 
LARGE: 40mm x 40mm x40mm'),
	('ddb80a9d-7ae6-486a-b088-02174cb9701b', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Mooncake', 20.000000000000000000000000000000, true, false, NULL, NULL, 132, '2023-10-25 00:22:30.875+00', '2024-05-18 08:29:23.507+00', 'Indulge in a delectable touch of tradition with our Mooncake Keycaps, a feast for the eyes and a delight for the fingertips!

Inspired by the beloved Mid-Autumn Festival treat, these keycaps are 3D printed from resin to capture the intricate details of classic mooncake designs. 

🅰️ - Mooncakes marked as A-Grade are exactly how they appear in the listing!

🅱️ - Mooncakes marked as B-Grade may have minor imperfections on them, such as a slight frosted appearance in some areas or the odd minor discolored speck on its surface. All imperfections will be limited to the sides of the mooncake, not the top.

⌨️ COMPATIBILITY
These keycaps are for mechanical keyboards and will work with Cherry MX, Gateron, Kailh, and Razer switches.

📐 DIMENSIONS
Width: 0.511" (13 mm)
Height: 0.433" (11 mm)
');


--
-- Data for Name: product_variation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_variation" ("id", "product_id", "name", "price", "created_at", "updated_at", "quantity") VALUES
	('3ed3bf8f-899b-4514-b74b-ba32cf737644', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Pea Flower', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 19),
	('45dc21a6-c75e-4455-b8d9-beb8a69bdde5', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'Standard', 25.000000000000000000000000000000, '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00', 0),
	('50fba68d-beb0-482d-881d-464685dd26a5', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Yuzu', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 5),
	('5d205d3b-f73f-43db-8a5e-04d40c82015f', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'White', 10.000000000000000000000000000000, '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', 0),
	('6ec1008b-0339-4605-beae-59975f6641dd', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Taro', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 0),
	('780c1314-9d85-4cbd-9951-8afbae5d4bf0', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'Red', 10.000000000000000000000000000000, '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', 0),
	('8ed7fd45-94a1-475f-be39-65a05d225f13', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'Small', 10.000000000000000000000000000000, '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', 0),
	('b91cc904-f8b6-45b7-9e1a-13c30d656ab0', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Sakura', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 20),
	('c579f16f-4f09-408c-a025-a07043a1c91d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Green Tea', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 20),
	('dfa4ccb3-8a20-4c8b-bdb0-c3b4e3b99704', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'Large', 13.000000000000000000000000000000, '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', 0),
	('e47e36ab-41f3-4889-adc1-746c57a9979a', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'Mossy', 25.000000000000000000000000000000, '2023-11-15 02:07:12.775+00', '2023-11-15 02:07:12.775+00', 0),
	('edffb039-116f-4014-b8b7-f0aa16952313', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Snow Skin', 20.000000000000000000000000000000, '2024-02-22 09:39:14.429+00', '2024-02-22 09:39:14.429+00', 20);


--
-- Data for Name: shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: size; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store" ("id", "name", "user_id", "created_at", "updated_at") VALUES
	('6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'PocketCaps', 'user_2WgGKLubSkytWJp4DvBcpJciiBq', '2023-10-24 22:18:44.997+00', '2023-10-24 22:18:44.997+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
