SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."patient" ("identifier", "familyName", "given", "gender", "birthDate", "created_at", "updated_at", "id") VALUES
	('"12345"', '"Doe"', '"John"', 'male', '1970-01-01', '2025-04-11 09:35:28.212308+00', '2025-04-11 09:35:28.212308', 'c3073681-6acf-48e7-b592-9e335f7865da');


--
-- Data for Name: practitioner; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."practitioner" ("id", "practitioner_role", "optional_1", "optional_2", "optional_3", "active", "name", "created_at", "updated_at") VALUES
	('c7731cba-da47-4127-83f5-95f9890c9ffb', '"1"', '', 'RAD', '', true, '"Smith^Jane"', '2025-04-11 09:35:29.796422+00', '2025-04-11 09:35:29.796422');


--
-- Data for Name: serviceRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."serviceRequest" ("id", "modality", "identifier", "status", "code", "priority", "subject", "occurrence_dateTime", "requester", "performer", "reason", "insurance", "created_at", "updated_at") VALUES
	('6bae6b60-ca28-42a3-aaa8-20427f4ed0b0', '"US-ABDO^Abdominal Ultrasound"', '"67890"', 'active', '"US-ABDO^Abdominal Ultrasound"', 'routine', 'c3073681-6acf-48e7-b592-9e335f7865da', '2025-04-10 00:12:30', 'c7731cba-da47-4127-83f5-95f9890c9ffb', 'c7731cba-da47-4127-83f5-95f9890c9ffb', '"diagnostic"', 'BPJS', '2025-04-11 09:35:32.492057+00', '2025-04-11 09:35:32.492057');


--
-- Data for Name: diagnosticReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."diagnosticReport" ("id", "findings", "recommendations", "isAllDoctor", "identifier", "basedOn", "status", "effective_dateTime", "resultInterpreter", "created_at", "updated_at") VALUES
	('d3628ac3-ad6d-43a6-9ec2-9687b8edb7b3', '70', '', false, '"67890"', '6bae6b60-ca28-42a3-aaa8-20427f4ed0b0', 'final', '2025-04-10 00:12:30', 'c7731cba-da47-4127-83f5-95f9890c9ffb', '2025-04-11 09:35:34.088209+00', '2025-04-11 09:35:34.088209');


--
-- Data for Name: imagingStudy; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."imagingStudy" ("identifier", "status", "modality", "subject", "started", "created_at", "updated_at", "id") VALUES
	('"67890"', 'registered', '"US-ABDO^Abdominal Ultrasound"', 'c3073681-6acf-48e7-b592-9e335f7865da', '2025-04-10 00:12:30', '2025-04-11 09:35:31.676874+00', '2025-04-11 09:35:31.676874', 'd78c707e-d10e-4ac7-a12f-f6f93b39f408');


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."location" ("id", "status", "name", "type", "location_modality", "ae_title", "created_at", "updated_at") VALUES
	('1da946e1-44f6-4890-8670-b058bdad6213', 'active', 'RAD1', '"imaging"', '"US-ABDO^Abdominal Ultrasound"', 'RAD1', '2025-04-11 09:35:31.376085+00', '2025-04-11 09:35:31.376085');


--
-- Data for Name: observation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."observation" ("partOf", "status", "subject", "effective_dateTime", "performer", "component_valueQuantity", "componen_code", "created_at", "udpated_at", "id") VALUES
	('d78c707e-d10e-4ac7-a12f-f6f93b39f408', 'final', 'c3073681-6acf-48e7-b592-9e335f7865da', '2025-04-10 00:12:30', 'c7731cba-da47-4127-83f5-95f9890c9ffb', '"70"', NULL, '2025-04-11 09:35:34.90902+00', '2025-04-11 09:35:34.90902', '426f0fdb-910b-41e0-b7fa-1863f28272ba');


--
-- Data for Name: procedure; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."procedure" ("id", "identifier", "basedOn", "status", "performedDateTime", "performer_function", "performer_actor", "location", "created_at", "updated_at") VALUES
	('d5220c22-a2d9-4fd4-9488-451648603d6e', '"PROC123"', '6bae6b60-ca28-42a3-aaa8-20427f4ed0b0', 'completed', '2025-04-10 00:12:00', '"radiologist"', 'c7731cba-da47-4127-83f5-95f9890c9ffb', '1da946e1-44f6-4890-8670-b058bdad6213', '2025-04-11 09:35:33.317871+00', '2025-04-11 09:35:33.317871');


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
