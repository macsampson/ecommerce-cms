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

INSERT INTO "public"."bundle" ("id", "min_quantity", "product_id", "created_at", "updated_at", "discount") VALUES
	('i466of', 5, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 24.00),
	('e9yjid', 3, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 14.00),
	('hbouss', 4, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 19.00),
	('91m5lb', 2, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 8.00),
	('676usj', 5, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 24.00),
	('r949d6', 3, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 14.00),
	('w4s0ra', 4, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 19.00),
	('us4hvw', 2, 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-09 02:51:20.639+00', '2024-07-09 02:51:20.639+00', 8.00);


--
-- Data for Name: carousel_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."carousel_image" ("id", "image_url", "created_at", "updated_at", "store_id", "image_credit") VALUES
	('4f5b8d8d-5d75-4de6-af37-6fa2d1272262', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842151/gbvyatbnurtajrvvhi1j.jpg', '2024-07-08 22:02:52.785+00', '2024-07-08 22:02:52.785+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '@luuniecaps'),
	('184329fa-8017-4701-8f18-c7053fb8ab17', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842150/djbjqoyfhw4aievvkxex.jpg', '2024-07-08 22:02:52.785+00', '2024-07-08 22:02:52.785+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '@quokkakeys'),
	('f240e4b0-a295-479e-86fd-a65e9833dcc2', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1704305697/wfqnv1cdfta7skp5p8aa.jpg', '2024-07-08 22:02:52.785+00', '2024-07-08 22:02:52.785+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', ''),
	('6c289907-8f19-4f75-b77c-d98282eb7166', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842150/fux0yul9fzumponsxb8z.jpg', '2024-07-08 22:02:52.785+00', '2024-07-08 22:02:52.785+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '@miso.crossing'),
	('b6e97aa0-0c9a-4e0d-ab40-fa205819813c', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1708842245/u4ago5qpuc88jewuetx4.jpg', '2024-07-08 22:02:52.785+00', '2024-07-08 22:02:52.785+00', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '@luuniecaps');


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

INSERT INTO "public"."image" ("id", "product_id", "url", "created_at", "updated_at", "credit", "ordering") VALUES
	('0114da16-e635-4742-b210-8fe69265e093', '9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996495/vckxbcip1ugghvqxhsko.png', '2023-11-14 22:54:40.861+00', '2023-11-14 22:54:40.861+00', '', 0),
	('0b1a2d4e-59d6-43c9-9789-bf3753956f67', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961979/pmpcm0psbqsgqvdbdosy.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00', '', 0),
	('5567e559-0cb8-4233-85dd-ce4492895a7f', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995788/s4l1yitlnvmmalbx32pr.jpg', '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', '', 0),
	('2f2962cd-1f46-4360-9459-197256288a42', '9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996519/aemmutc5s0uy6syrazm2.png', '2023-11-14 22:54:40.861+00', '2023-11-14 22:54:40.861+00', '', 0),
	('3469e8f1-6897-47f9-a810-6ceb101c98bb', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698992167/ufadkwapitft2ymom3wd.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', '', 0),
	('583083d5-1fa9-4d5d-b3ae-8a81a1c68896', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698992166/mxpnfprwkvw3uytxpwbj.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', '', 0),
	('731633ec-f852-4c46-9e63-38564aab7939', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961979/hxwa6y6keu5kobdvq4q1.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00', '', 0),
	('48975edf-f7c8-4642-9bd2-22f28d64f966', '1613a926-960c-4a43-8372-a884c60fde42', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698195547/cbpogw49rs5wdijbpxgy.png', '2023-11-15 02:08:14.151+00', '2024-07-09 02:35:49.849+00', '', 1),
	('7e8a8ceb-120e-424f-a783-42b5205ce8ff', '7c861ab1-2ec2-45fb-90d7-cf5c75831055', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995913/pnqzcgqchkfzm9eyi2cw.png', '2023-11-14 22:54:25.636+00', '2023-11-14 22:54:25.636+00', '', 0),
	('81de3144-6e31-4609-a1ff-3e9a2c8e3f12', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698365917/cw44v6njhjs8myftwyvf.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', '', 0),
	('79f9fbcd-be0f-4658-b4d9-2c68b5470970', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995776/tis561wh1ab0pfvppvy9.jpg', '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', '', 0),
	('aa04c823-6b6a-4119-8b2c-5ea55aa644be', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698365901/furrsa0ljogadpyfw6mv.jpg', '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', '', 0),
	('b0c2e104-b287-45ac-9302-01eb9da78994', '7c861ab1-2ec2-45fb-90d7-cf5c75831055', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995901/bpbxtkhiphjoahmhaoe8.png', '2023-11-14 22:54:25.636+00', '2023-11-14 22:54:25.636+00', '', 0),
	('b26b34ed-afbf-4a36-934e-2286193d6896', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961981/hpc9xd91p5axyhvwh8gi.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00', '', 0),
	('bef8300d-b290-4bad-b510-90abe6de8b01', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699995725/bgifhfitmn9dvjlkz56g.jpg', '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', '', 0),
	('dabd2c00-0e3d-491d-86fd-959dc11d1abf', '1932d64e-c282-4f83-8411-d9ad31a92428', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698208488/bkyxcdabvjtxq57yky86.png', '2023-11-15 02:08:03.429+00', '2024-07-07 23:28:40.972+00', '', 0),
	('258cbd18-6d4f-41d0-b16c-398deddf79af', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/j6cowwxjctdtn5bhyemh.jpg', '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', '', 0),
	('aa2995ed-e973-4ac4-9f4a-bf83d90ace5b', 'c46c324b-7f05-433e-97dd-57342cc47f92', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698198079/ifwqne3iihcjwavyqbwp.png', '2023-11-15 02:07:44.198+00', '2024-07-08 08:13:33.901+00', '', 0),
	('8b19e005-8065-498e-a0c6-d2868eabe811', '1613a926-960c-4a43-8372-a884c60fde42', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1720326623/tizekj550vh1ezkoipfr.jpg', '2024-07-07 04:30:45.96+00', '2024-07-09 02:35:49.863+00', '@robbie168', 2),
	('jd4v49', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/ky7iqyeeomhoxq7mxmfw.jpg', '2024-07-02 07:06:20.587+00', '2024-07-09 02:51:20.415+00', '', 3),
	('a21b7864-7e66-47c3-a9fc-65985204ebe4', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/jc6cv6aw9n1p0jlbjgyp.jpg', '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', '', 0),
	('m3f7lu', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194322/bb7y79erijzf4rufvj5r.jpg', '2024-07-02 07:06:20.587+00', '2024-07-09 02:51:20.432+00', '@szmoon', 4),
	('065gna', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194322/twvbu0d8kpwdzhht3vzw.jpg', '2024-07-02 07:06:20.587+00', '2024-07-09 02:51:20.451+00', '@quokkakeys', 2),
	('5qqzto', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/osw92zef0drywlt8dxxu.jpg', '2024-07-02 07:06:20.587+00', '2024-07-09 02:51:20.467+00', '', 0),
	('aw0p5b', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194424/hpujr77dyldwtb1vte90.jpg', '2024-07-02 07:06:20.587+00', '2024-07-09 02:51:20.483+00', '', 1),
	('f859c050-84a7-4234-9abe-58ca3e1e7a21', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698346939/xjiyrsystsuygfgjivys.jpg', '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', '', 0),
	('fd2fdeda-3395-4eea-b38c-3564a293fb5b', '637a1694-fcf6-4c0e-9ed6-308892fcd7df', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698961849/immrdayxjbmwrctle2hw.jpg', '2024-02-21 17:27:14.367+00', '2024-02-21 17:27:14.367+00', '', 0),
	('b506b546-64c3-4b91-8ffa-63f4750dd87c', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698366435/febcv5gmxk3l6v41kweh.jpg', '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', '', 0),
	('97b5ce82-9def-4c43-bbb1-89a9a0841e01', '4917a2b7-b137-4fcf-8fa2-c48944e3c88b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698194529/vncgzaxextgpyaoaxjl3.png', '2024-06-17 06:08:13.229+00', '2024-07-08 08:13:25.545+00', '', 0),
	('ed9399ed-9840-4557-9a12-98e8b31c96a2', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/ovxpauxk8sh8jxfaritl.jpg', '2024-06-17 06:08:49.822+00', '2024-07-07 07:07:54.861+00', '', 0),
	('30e3a988-949a-441d-a526-d49e0180d8a2', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/fymnydhgl9mj1bzyoiua.jpg', '2024-06-17 06:08:49.822+00', '2024-07-07 07:07:54.877+00', '', 0),
	('2129a13b-9c1d-457d-b041-b64e5ae39fb8', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979638/gy4limtjcufhicfnvlan.jpg', '2024-06-17 06:08:49.822+00', '2024-07-07 07:07:54.892+00', '', 0),
	('d14c489e-5093-4d9a-9cba-847b7c848f73', '2f84e5c2-6896-4ec6-a468-546e44fba0ec', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979636/ihkte4yewe6du1dzksdr.jpg', '2024-06-17 06:08:49.822+00', '2024-07-07 07:07:54.908+00', '', 0),
	('8be13fb1-9db0-48ed-ab57-77b0730b2271', '1613a926-960c-4a43-8372-a884c60fde42', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1720323988/xsybxuanyzzqhhsng4bs.jpg', '2024-07-07 03:46:39.898+00', '2024-07-09 02:35:49.874+00', '@miso.crossing', 0),
	('98a155af-1a4d-47ea-9879-bf564561abfa', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977153/y9qnzasfvtnnpdxxbibf.jpg', '2024-06-17 06:17:34.986+00', '2024-07-08 00:07:49.759+00', '', 0),
	('ac6eb035-ea8e-4fd0-a52b-98456e26c18d', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698979033/gzchjnmnnog67zrnrhhh.jpg', '2024-06-17 06:17:34.986+00', '2024-07-08 00:07:49.774+00', '', 0),
	('21c6f3a4-e94c-46df-8274-b4eee1c07090', '0aafd8df-1d05-4758-b61f-061f89ceb4d9', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977153/azdeocll2e8wo1jc489w.jpg', '2024-06-17 06:17:34.986+00', '2024-07-08 00:07:49.79+00', '', 0),
	('b85f33b3-ced6-42ad-96b8-5fcbd0944e1b', 'a208260e-7653-42f9-a7e4-502eb61793db', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1700002311/gwlvcodultdgyv17k48p.jpg', '2024-06-17 06:24:45.958+00', '2024-06-17 06:24:45.958+00', '', 0),
	('5c4d0002-b8be-48e3-8fc0-42a5ccd75208', 'a208260e-7653-42f9-a7e4-502eb61793db', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1700002311/dqnc39nbxauj0y93nfgf.jpg', '2024-06-17 06:24:45.958+00', '2024-06-17 06:24:45.958+00', '', 0),
	('cca620c0-edfe-4cea-a934-ffc3f14cb4bb', '78bc6119-b237-4674-b6c3-9638c3e6802e', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1699996694/mvljwytocstlo5dwufao.png', '2024-06-17 06:24:52.16+00', '2024-06-17 06:24:52.16+00', '', 0),
	('5d890d78-b7ef-420f-ab68-418383a99a10', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/exmjlolmavlyhajwnsjh.png', '2024-06-17 06:25:07.793+00', '2024-06-17 06:25:07.793+00', '', 0),
	('17ed6c7d-74b7-45cc-bfb3-3443333f2831', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/egn3ljg3qsaa9rhwe4xl.png', '2024-06-17 06:25:07.793+00', '2024-06-17 06:25:07.793+00', '', 0),
	('47a28e6d-af14-4e70-b5b6-ffaf65ee24c4', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/batzjfhnzvpnkwjff9gu.png', '2024-06-17 06:25:07.793+00', '2024-06-17 06:25:07.793+00', '', 0),
	('ab93bfa7-1997-44b1-b2eb-8a12fb80ca3f', '346a5664-bd86-4a38-b4f5-f64ae288ab09', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1698977348/qwovmt6ysadc8nk9ugyq.jpg', '2024-06-17 06:25:07.793+00', '2024-06-17 06:25:07.793+00', '', 0),
	('885ebe4f-d08d-48de-bc90-9a4354ef6295', '4917a2b7-b137-4fcf-8fa2-c48944e3c88b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1720325192/dfs8glagmvbaokx13qbz.jpg', '2024-07-07 04:06:46.767+00', '2024-07-08 08:13:25.567+00', '@robbie168', 0),
	('1c3c3708-1255-41c2-a242-825512bf7169', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'https://res.cloudinary.com/dlu7uqlkm/image/upload/v1720325217/kwhnpc0qhnjfp47zwenb.jpg', '2024-07-07 04:07:13.877+00', '2024-07-09 02:51:20.501+00', '@ookagami', 5);


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order" ("id", "store_id", "is_paid", "address", "created_at", "updated_at", "total_price", "shipping_address", "email_address", "is_abandoned") VALUES
	('405e3a66-3a50-45de-83af-6f1add2eebf5', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-07-02 05:32:42.296+00', '2024-07-02 18:33:05.971+00', 24.87, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('14d3802a-1882-4619-855d-d9dccb30a074', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '121212, 12341, qwreq3ey, BC, V7A 1M7, CA', '2023-10-26 20:49:55.628+00', '2023-10-26 20:54:05.274+00', 0.00, '', '', false),
	('33e18887-2c6b-4855-bc15-ef76e4855b1d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:34:39.751+00', '2023-11-14 23:36:20.78+00', 20.00, '', '', false),
	('4538cbd4-3a31-4e2a-919d-9afdf10552eb', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:30:45.276+00', '2023-11-14 23:29:57.11+00', 75.00, '', '', false),
	('7299b63b-2cff-4224-b405-26f80f9fc84e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:46:13.856+00', '2023-11-14 22:46:30.46+00', 36.00, '', '', false),
	('b87831c2-d284-4fbc-b96b-fcf5da67e271', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', true, '4730 Lougheed Hwy, Unit 302, Burnaby, BC, V5C 0M9, CA', '2023-11-14 22:16:27.896+00', '2023-11-14 23:16:03.915+00', 36.00, '', '', false),
	('1613f57b-5aef-47ff-9cdf-503b16ad7123', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-02 05:21:08.604+00', '2024-05-18 08:29:23.334+00', 0.00, '', '', true),
	('1e9be139-8f55-4b5c-a0bd-dac15c07b61f', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-15 21:44:02.663+00', '2024-05-18 08:29:23.363+00', 105.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US, mac.sampson@proton.me', '', true),
	('29f97042-d90a-46fe-a100-827149488395', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-21 17:39:51.33+00', '2024-05-18 08:29:23.376+00', 36.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('810fdf66-d8dc-4e3f-b9f1-8362732fcdae', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 17:11:09.858+00', '2024-05-18 08:29:23.383+00', 0.00, '', '', true),
	('83d0c152-9698-40c1-b74e-984b1f3e893d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 19:15:10.598+00', '2024-05-18 08:29:23.403+00', 0.00, '', '', true),
	('866feb66-3a34-4e6b-b45e-37e9a5156c9f', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-20 07:31:27.56+00', '2024-05-18 08:29:23.416+00', 36.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('8a88bff7-b1c1-45c7-8481-9f496ddd61f4', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-12-27 23:04:06.459+00', '2024-05-18 08:29:23.425+00', 105.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US, mac.sampson@pm.me', '', true),
	('939741fd-7483-4809-80a3-9066510b47c5', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-20 07:34:44.49+00', '2024-05-18 08:29:23.439+00', 36.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('b09c2162-5a21-407a-bf90-f87cbb6e6795', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 19:03:28.003+00', '2024-05-18 08:29:23.446+00', 0.00, '', '', true),
	('b20e5964-746d-42ac-a2e7-bd920fb1bd55', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 18:36:38.897+00', '2024-05-18 08:29:23.458+00', 0.00, '', '', true),
	('b7d7413e-1ad0-453b-8081-b260001b6a8d', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-02-21 03:17:02.429+00', '2024-05-18 08:29:23.465+00', 36.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true),
	('b9495df5-2e15-4935-a13c-7ca8b67fb309', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-03 00:57:59.09+00', '2024-05-18 08:29:23.473+00', 0.00, '', '', true),
	('c67024bb-1277-49a9-9ff3-076ca26d2b1a', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-11-14 21:32:01.511+00', '2024-05-18 08:29:23.48+00', 36.00, '', '', true),
	('dd151315-90d5-4ed2-9b2d-5b6e53cb61b1', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2023-10-26 18:36:51.804+00', '2024-05-18 08:29:23.488+00', 0.00, '', '', true),
	('ec7962a2-ccb6-44b0-924a-5fd802ce1465', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', false, '', '2024-05-02 14:05:25.102+00', '2024-05-18 08:29:23.495+00', 20.00, 'Mac Sampson, 2700 Broderick Way, Mountain View, CA, 94043, US', '', true);


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_item" ("id", "order_id", "product_id", "created_at", "updated_at", "quantity", "product_variation_id", "price", "name") VALUES
	('10005ddc-9f92-4faa-af96-176223f731d4', '405e3a66-3a50-45de-83af-6f1add2eebf5', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-07-02 05:32:42.296+00', '2024-07-02 05:32:42.296+00', 1, '6915d576-d1b3-4d55-8718-01667efc5067', 18.50, ''),
	('19cde36b-e7f6-45ec-88eb-aff380c05319', '810fdf66-d8dc-4e3f-b9f1-8362732fcdae', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 17:11:09.858+00', '2023-10-26 17:11:09.858+00', 1, NULL, 0.00, '""'),
	('22588624-5562-463a-bf55-49b1fcaa9248', '1613f57b-5aef-47ff-9cdf-503b16ad7123', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-02 05:21:08.604+00', '2023-11-02 05:21:08.604+00', 3, NULL, 0.00, '""'),
	('28a43787-a48b-4752-ad6e-91b8b815bd66', '8a88bff7-b1c1-45c7-8481-9f496ddd61f4', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-12-27 23:04:06.459+00', '2023-12-27 23:04:06.459+00', 5, NULL, 20.00, '""'),
	('3b416fe0-99e6-4c04-9352-88958cd6835c', '8a88bff7-b1c1-45c7-8481-9f496ddd61f4', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-12-27 23:04:06.459+00', '2023-12-27 23:04:06.459+00', 2, NULL, 20.00, '""'),
	('41d1d3e5-ca33-4e83-b905-154ecf5e742d', 'b09c2162-5a21-407a-bf90-f87cbb6e6795', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 19:03:28.003+00', '2023-10-26 19:03:28.003+00', 5, NULL, 0.00, '""'),
	('481c3545-c713-478e-a0a5-1c7e3e799eaa', 'b09c2162-5a21-407a-bf90-f87cbb6e6795', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 19:03:28.003+00', '2023-10-26 19:03:28.003+00', 1, NULL, 0.00, '""'),
	('560b09b9-3b10-4c9a-ad7e-a6942bee3b6f', 'b87831c2-d284-4fbc-b96b-fcf5da67e271', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:16:27.896+00', '2023-11-14 22:16:27.896+00', 2, NULL, 36.00, '""'),
	('699514fb-7801-4627-8678-d6f71db852af', '866feb66-3a34-4e6b-b45e-37e9a5156c9f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-20 07:31:27.56+00', '2024-02-20 07:31:27.56+00', 2, NULL, 20.00, '""'),
	('6f13c474-01f2-4678-9364-5896f31ef798', 'c67024bb-1277-49a9-9ff3-076ca26d2b1a', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 21:32:01.511+00', '2023-11-14 21:32:01.511+00', 2, NULL, 36.00, '""'),
	('6f44ff37-ed3a-42da-a384-649c2a34cbb8', '1e9be139-8f55-4b5c-a0bd-dac15c07b61f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-15 21:44:02.663+00', '2024-02-15 21:44:02.663+00', 5, NULL, 20.00, '""'),
	('710da5e0-6872-4de6-b33b-34386dfe6ec3', '7299b63b-2cff-4224-b405-26f80f9fc84e', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:46:13.856+00', '2023-11-14 22:46:13.856+00', 2, NULL, 36.00, '""'),
	('87fb2263-aeb7-490e-9116-ce1e0e5167fa', '4538cbd4-3a31-4e2a-919d-9afdf10552eb', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:30:45.276+00', '2023-11-14 22:30:45.276+00', 5, NULL, 75.00, '""'),
	('95a1167d-9ed7-4437-af47-ed581b7f7cc8', 'b20e5964-746d-42ac-a2e7-bd920fb1bd55', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 18:36:38.897+00', '2023-10-26 18:36:38.897+00', 2, NULL, 0.00, '""'),
	('a674f7f3-6ce6-4694-b723-84ff66ed5035', '83d0c152-9698-40c1-b74e-984b1f3e893d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 19:15:10.598+00', '2023-10-26 19:15:10.598+00', 1, NULL, 0.00, '""'),
	('ade87224-66fc-417b-9813-3df31ce89a65', '29f97042-d90a-46fe-a100-827149488395', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-21 17:39:51.33+00', '2024-02-21 17:39:51.33+00', 2, NULL, 20.00, '""'),
	('c7e1b4f1-e8e9-4a00-8b98-af714277fe01', '939741fd-7483-4809-80a3-9066510b47c5', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-20 07:34:44.49+00', '2024-02-20 07:34:44.49+00', 2, NULL, 20.00, '""'),
	('cbf544ea-3985-4d19-9d5c-32b815774d3b', 'dd151315-90d5-4ed2-9b2d-5b6e53cb61b1', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 18:36:51.804+00', '2023-10-26 18:36:51.804+00', 7, NULL, 0.00, '""'),
	('cbfebc5f-99ba-426a-869a-740cdb0d0ec1', 'b7d7413e-1ad0-453b-8081-b260001b6a8d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-21 03:17:02.429+00', '2024-02-21 03:17:02.429+00', 2, NULL, 20.00, '""'),
	('cd79dfaa-6e59-4ddd-8ed6-2900acf5fa07', 'b9495df5-2e15-4935-a13c-7ca8b67fb309', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-03 00:57:59.09+00', '2023-11-03 00:57:59.09+00', 2, NULL, 0.00, '""'),
	('d0e0cd5b-87ae-4d81-84f3-eeb162cbbcdd', '14d3802a-1882-4619-855d-d9dccb30a074', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 20:49:55.628+00', '2023-10-26 20:49:55.628+00', 1, NULL, 0.00, '""'),
	('ec9bc74e-28ea-4167-b950-0359aa3268e2', '33e18887-2c6b-4855-bc15-ef76e4855b1d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-11-14 22:34:39.751+00', '2023-11-14 22:34:39.751+00', 1, NULL, 20.00, '""'),
	('f6b30d2b-7ad1-4b2a-b2a0-582e0db95b75', '1e9be139-8f55-4b5c-a0bd-dac15c07b61f', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-02-15 21:44:02.663+00', '2024-02-15 21:44:02.663+00', 2, NULL, 20.00, '""'),
	('f7675c86-332e-4181-84b7-71c24d540ea6', '83d0c152-9698-40c1-b74e-984b1f3e893d', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '2023-10-26 19:15:10.598+00', '2023-10-26 19:15:10.598+00', 1, NULL, 0.00, '""'),
	('fb6bf639-0a54-4c2d-9a21-1e11e0fe6877', '14d3802a-1882-4619-855d-d9dccb30a074', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2023-10-26 20:49:55.628+00', '2023-10-26 20:49:55.628+00', 5, NULL, 0.00, '""'),
	('d135ee26-094e-47a1-8c82-c108e2474a6b', 'ec7962a2-ccb6-44b0-924a-5fd802ce1465', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-05-02 14:05:25.102+00', '2024-05-02 14:05:25.102+00', 1, 'b91cc904-f8b6-45b7-9e1a-13c30d656ab0', 20.00, '""'),
	('928d3975-faaa-4242-80e9-cdcbed0afeb3', 'f1bdd6e4-be18-4884-b686-5e036551a1ed', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', '2024-05-02 14:12:01.241+00', '2024-05-02 14:12:01.241+00', 1, 'b91cc904-f8b6-45b7-9e1a-13c30d656ab0', 20.00, '""');


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product" ("id", "store_id", "category_id", "name", "price", "is_featured", "is_archived", "size_id", "color_id", "quantity", "created_at", "updated_at", "description") VALUES
	('637a1694-fcf6-4c0e-9ed6-308892fcd7df', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Eevee - Pokemon', 55.00, false, false, NULL, NULL, 0, '2023-11-02 21:52:45.137+00', '2024-02-21 17:27:13.703+00', 'PocketCaps meets Pocket Monsters 🎮

Merge your love for Pokémon and sleek design with our enchanting Eevee Keycap. Catch it before it''s gone!

COMPATIBILITY
This keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Razer, and Kailh switches.

DIMENSIONS
Width: 0.75" (19 mm)  
Height: 0.86" (22mm)
'),
	('7c861ab1-2ec2-45fb-90d7-cf5c75831055', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Lisa Fan Shroud - Genshin Impact', 15.00, false, false, NULL, NULL, 0, '2023-11-14 21:09:42.119+00', '2023-11-14 22:54:25.037+00', 'Elevate your PC''s aesthetics with our Lisa-inspired fan shroud from Genshin Impact! 🌟🔮 

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *
'),
	('9393f64f-3c0c-4b03-9e1a-a9c21ed52fe5', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Hu Tao - Genshin Impact', 15.00, false, false, NULL, NULL, 0, '2023-11-14 21:17:14.967+00', '2023-11-14 22:54:40.248+00', 'Bring the spirit-soothing ambiance of Hu Tao to your gaming sanctuary with this custom PC fan shroud 🌙💜 

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *

'),
	('1613a926-960c-4a43-8372-a884c60fde42', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Fossil - Animal Crossing', 80.00, true, false, NULL, NULL, 5, '2023-10-25 00:59:23.744+00', '2024-07-09 02:35:49.802+00', 'Animal Crossing Fossil Keycap 🦖🦴

Unearth a touch of prehistoric chic that makes every typing session an archaeological adventure!

Details:

Profile: OEM
Compatibility: Tailored for mechanical keyboards, this keycap perfectly complements Cherry MX, Gateron, and Kailh switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)
'),
	('4917a2b7-b137-4fcf-8fa2-c48944e3c88b', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Bell Bag - Animal Crossing', 80.00, true, false, NULL, NULL, 5, '2023-10-25 00:18:03.636+00', '2024-07-08 08:13:25.467+00', 'Animal Crossing Bell Bag Keycap 💰

Invest in your keyboard''s aesthetics with this expertly designed Bell Bag keycap - why wait for Tom Nook when you can cash in on every keystroke?

Details:

Profile: OEM
Compatibility: Tailored for mechanical keyboards, this keycap flawlessly suits Cherry MX, Gateron, and Kailh switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)


'),
	('346a5664-bd86-4a38-b4f5-f64ae288ab09', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Traditional Mooncake', 28.50, false, false, NULL, NULL, 0, '2023-11-03 02:11:47.512+00', '2024-06-17 06:25:07.74+00', 'Mid-Autumn Magic for Your Keys! 🥮
Our Mooncake Keycap brings the essence of the Mid-Autumn Festival to your fingertips.

COMPATIBILITY
This 3D printed keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Kailh, and Razer switches.

STANDARD: 
Dimensions
Width: 0.511" (13 mm)  
Height: 0.433" (11 mm)
'),
	('604ae388-b63e-4d02-9294-7f09e453a1f6', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Owl Keycap - Link''s Awakening', 18.50, false, false, NULL, NULL, 0, '2023-10-27 00:34:22.629+00', '2024-06-17 06:25:25.16+00', 'Owl Statue Keycap from Link''s Awakening with RGB Compatibility 🦉

Dive deep into the world of Koholint Island with our Stone Owl Statue Keycap. 
Carefully crafted, this keycap not only embodies the spirit and mystery of the legendary game but also boasts a design that lets the RGB lighting of your keyboard shine brilliantly through its eyes.

What secrets will it share with you? '),
	('0aafd8df-1d05-4758-b61f-061f89ceb4d9', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Snom - Pokemon', 46.50, true, false, NULL, NULL, 0, '2023-11-03 02:08:20.577+00', '2024-07-08 00:07:49.696+00', 'The Coolest Typing Buddy! 🧊❄️

From the Crown Tundra to your fingertips, our Snom Keycap is the chill touch your keys need.

COMPATIBILITY
This keycap is for mechanical keyboards and will work with Cherry MX, Gateron, Kailh and Razer switches.

DIMENSIONS
Width: 0.71" (18.2 mm)  
Height: 0.85" (21.7mm)'),
	('2f84e5c2-6896-4ec6-a468-546e44fba0ec', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Buu - Dragon Ball Z', 46.50, false, false, NULL, NULL, 0, '2023-11-03 02:51:04.498+00', '2024-07-07 07:07:54.794+00', 'Summon mischief to your keyboard with our matte-finish Buu keycap 😈✨

With its soft, playful pink and the iconic grin of Dragonball''s Buu, this keycap is your trusty ally for both work and play.  👅'),
	('1932d64e-c282-4f83-8411-d9ad31a92428', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Wasp Nest - Animal Crossing', 80.00, true, false, NULL, NULL, 5, '2023-10-25 04:35:08.347+00', '2024-07-07 23:28:40.924+00', 'Animal Crossing Wasp Nest Keycap 🐝

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
	('ac8dada3-52c3-4e0d-99f1-af2eac8a991e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '08a8af38-ce08-42ed-8997-a9f7bd784c57', 'Mooncake Keycap Gift Case', 10.00, false, false, NULL, NULL, 0, '2023-10-27 00:21:54.806+00', '2023-11-14 21:01:13.482+00', 'Elevate your keycap collection with our meticulously crafted Artisan Keycap Case. Designed with a touch of modern aesthetic and a hint of traditional patterns, this 3D-printed case is a perfect blend of form and function.

DIMENSIONS
Diameter: 2.55" (65 mm)  
Height: 0.827" (21 mm)'),
	('14ca4239-ef6d-4fb5-8b6d-95074740d0ad', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '08a8af38-ce08-42ed-8997-a9f7bd784c57', 'Poké Ball Keycap Gift Case', 15.00, false, false, NULL, NULL, 0, '2023-10-26 19:02:49.652+00', '2024-05-18 08:29:23.454+00', 'Surprise the special Trainer in your life with our Poké Ball keycap gift cases! 🎁

Made with sturdy PLA, these cases come in small and large. Whether it''s a birthday, a tournament win, or just because, our Poké Ball cases ensure your gift is ready for a journey across the Kanto region and beyond. 

Small Poké Ball will fit 1 keycap and Large will fit 2!



DIMENSIONS:

SMALL: 35mm x 35mm x 35mm 
LARGE: 40mm x 40mm x40mm'),
	('a208260e-7653-42f9-a7e4-502eb61793db', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Power - Chainsaw Man', 14.00, false, false, NULL, NULL, 0, '2023-11-14 22:53:19.158+00', '2024-06-17 06:24:45.899+00', 'Unleash the fierce energy of Power from Chainsaw Man with our custom PC fan shroud, designed for those who dare to embrace the wild side of their setup. 🌪️🔥

These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *

If you have any questions or concerns, please feel free to message me. I''ll be happy to help!'),
	('c46c324b-7f05-433e-97dd-57342cc47f92', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Peach - Animal Crossing', 80.00, false, false, NULL, NULL, 5, '2023-10-25 01:41:33.207+00', '2024-07-08 08:13:33.824+00', 'Animal Crossing Peach Keycap 🍑

Ever shaken a tree and wished that perfect peach could land right on your keyboard? 😏

This keycap brings a slice of the orchard to your fingertips. Experience the joy of virtual fruit-gathering with every keystroke...minus the tree-shaking effort.

Details 📝:

Profile: OEM
Compatibility: Designed to fit seamlessly with Cherry MX, Gateron, Kailh, and Razer switches.
Dimensions:
Width: 0.75" (19 mm)
Height: 0.944" (24mm)'),
	('ddb80a9d-7ae6-486a-b088-02174cb9701b', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'da43fdaf-496b-49d6-b225-e0179bce5e48', 'Mooncake', 18.50, true, false, NULL, NULL, 194, '2023-10-25 00:22:30.875+00', '2024-07-09 02:51:20.335+00', 'Inspired by the Mid-Autumn Festival treat, these keycaps are 3D printed from resin to capture the intricate details of classic mooncake designs. 

🅰️ - Mooncakes marked as A-Grade are exactly how they appear in the listing!

🅱️ - Mooncakes marked as B-Grade may have minor imperfections on them, such as a slight frosted appearance in some areas or the odd minor discolored speck on its surface. All imperfections will be limited to the sides of the mooncake, not the top.

⌨️ COMPATIBILITY
These keycaps are for mechanical keyboards and will work with Cherry MX, Gateron, Kailh, and Razer switches.

📐 DIMENSIONS
Width: 0.511" (13 mm)
Height: 0.433" (11 mm)

⭐ BUNDLE PRICES
We offer bundle pricing! 
Bundle options are:

2x = 8% off
3x = 14% off
4x = 19% off
5x = 24% off

Savings will be applied at checkout.

I do my best to ensure consistency between keycaps, but as these are artisan, colors may vary slightly from those photographed



😄🥮'),
	('78bc6119-b237-4674-b6c3-9638c3e6802e', '6842bc48-0e22-44a8-bb66-b0d5f22e8db7', '4c1cd01e-8625-4833-870c-1801d118167c', 'Xiao - Genshin Impact', 14.00, false, false, NULL, NULL, 0, '2023-11-14 21:19:12.679+00', '2024-06-17 06:24:52.106+00', 'Step into the realm of adepti with our Xiao-inspired fan shroud, a must-have for any Genshin Impact PC build. 🌌🍃 


These covers are designed to fit over your existing LED or RGB fans. Available in both 120mm and 140mm sizes, you can easily find the perfect fit for your build.

Each fan cover is made to order using high-quality PLA filament, ensuring a durable and long-lasting product.

They are lightweight and durable, and won''t affect your PC''s performance.

To make installation a breeze, 4 fan screws are included with each cover.

Please note that while my fan covers are very smooth, they are still 3D printed products, so some imperfections may be present. But they will not affect the appearance of the cover when mounted.

* No fan included, fan cover only *
');


--
-- Data for Name: product_variation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_variation" ("id", "product_id", "name", "price", "created_at", "updated_at", "quantity") VALUES
	('5d205d3b-f73f-43db-8a5e-04d40c82015f', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'White', 10.00, '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', 0),
	('780c1314-9d85-4cbd-9951-8afbae5d4bf0', 'ac8dada3-52c3-4e0d-99f1-af2eac8a991e', 'Red', 10.00, '2023-11-14 21:01:14.389+00', '2023-11-14 21:01:14.389+00', 0),
	('8ed7fd45-94a1-475f-be39-65a05d225f13', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'Small', 10.00, '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', 0),
	('dfa4ccb3-8a20-4c8b-bdb0-c3b4e3b99704', '14ca4239-ef6d-4fb5-8b6d-95074740d0ad', 'Large', 13.00, '2023-11-14 21:02:17.334+00', '2023-11-14 21:02:17.334+00', 0),
	('2b49b11a-b37a-4ee0-9bb4-25a6ce3126db', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Pea Flower (A)', 18.50, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.538+00', 30),
	('8b2889c9-678b-46d3-983a-ab539b8853be', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Yuzu (B)', 16.00, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.555+00', 0),
	('407ee759-02ef-4475-9e23-9635e2fdf08d', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Taro (B)', 16.00, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.572+00', 3),
	('5a42b737-a1ad-4568-b599-4fa3c53b99b9', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Green Tea (A)', 18.50, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.587+00', 11),
	('ff544c9b-09a9-4da3-a5fb-cca311d367e5', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Snow Skin (A)', 18.50, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.604+00', 100),
	('6915d576-d1b3-4d55-8718-01667efc5067', 'ddb80a9d-7ae6-486a-b088-02174cb9701b', 'Sakura (A)', 18.50, '2024-06-21 08:33:08.334+00', '2024-07-09 02:51:20.623+00', 50),
	('5147573d-bffc-4564-b80d-e08c3a114b4d', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'Standard', 25.00, '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', 0),
	('1eed30c9-7afb-4435-9dda-130cf675d36b', '604ae388-b63e-4d02-9294-7f09e453a1f6', 'Mossy', 25.00, '2024-06-17 06:25:25.22+00', '2024-06-17 06:25:25.22+00', 0);


--
-- Data for Name: size; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store" ("id", "name", "user_id", "created_at", "updated_at") VALUES
	('6842bc48-0e22-44a8-bb66-b0d5f22e8db7', 'PocketCaps', 'user_2WgGKLubSkytWJp4DvBcpJciiBq', '2023-10-24 22:18:44.997+00', '2023-10-24 22:18:44.997+00'),
	('ad99fb8f-77fb-4be8-a70d-3cfc6fad2d93', 'maxia', 'user_2gqmgUwUvw9MLsP0Q3mtkPCSOyZ', '2024-05-23 03:07:16.71+00', '2024-05-23 03:07:16.71+00'),
	('587a82cb-5d4c-40c6-a8b5-129aa68e6f44', 'tiendita', 'user_2h2WXdKZToqY86A8tXZoZ1LA6CQ', '2024-05-27 06:52:20.736+00', '2024-05-27 06:52:20.736+00');


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
