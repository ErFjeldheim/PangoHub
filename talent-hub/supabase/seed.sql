-- =============================================================================
-- Rich local dev seed (idempotent) — with explicit ::uuid casts to avoid 42804
-- =============================================================================

-- 0) Extensions ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS citext;

-- 1) Departments ---------------------------------------------------------------
INSERT INTO public.departments (name, description)
VALUES
  ('Management','Operations & leadership'),
  ('Engineering','Product engineering'),
  ('Design','Product design'),
  ('Data & Analytics','Data platform & insights')
ON CONFLICT (name) DO NOTHING;

-- 2) Users (profiles created via trigger) --------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES
-- Admin
(
  '00000000-0000-0000-0000-000000000000',
  '8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
  'authenticated','authenticated','admin@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Ada","last_name":"Admin","title":"Head of Operations","department":"Management"}',
  now(), now(), '', '', '', ''
),
-- Consultants
-- Engineering
(
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000001',
  'authenticated','authenticated','alex.engineer@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Alex","last_name":"Engineer","title":"Software Engineer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000002',
  'authenticated','authenticated','riley.backend@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Riley","last_name":"Backend","title":"Backend Developer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000003',
  'authenticated','authenticated','taylor.devops@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Taylor","last_name":"DevOps","title":"DevOps Engineer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000004',
  'authenticated','authenticated','morgan.frontend@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Morgan","last_name":"Frontend","title":"Frontend Developer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000005',
  'authenticated','authenticated','charlie.qa@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Charlie","last_name":"QA","title":"QA Engineer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),

-- Design
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000001',
  'authenticated','authenticated','jamie.designer@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Jamie","last_name":"Designer","title":"UX Designer","department":"Design"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000002',
  'authenticated','authenticated','casey.ux@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Casey","last_name":"UX","title":"UI/UX Researcher","department":"Design"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000003',
  'authenticated','authenticated','robin.creative@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Robin","last_name":"Creative","title":"Graphic Designer","department":"Design"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000004',
  'authenticated','authenticated','kendall.brand@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Kendall","last_name":"Brand","title":"Brand Designer","department":"Design"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000005',
  'authenticated','authenticated','avery.motion@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Avery","last_name":"Motion","title":"Motion Designer","department":"Design"}',
  now(), now(), '', '', '', ''
),

-- Data & Analytics
(
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000001',
  'authenticated','authenticated','sam.data@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Sam","last_name":"Data","title":"Data Engineer","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000002',
  'authenticated','authenticated','jordan.analytics@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Jordan","last_name":"Analytics","title":"Data Analyst","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000003',
  'authenticated','authenticated','blake.bi@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Blake","last_name":"BI","title":"Business Intelligence Analyst","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000004',
  'authenticated','authenticated','drew.ml@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Drew","last_name":"ML","title":"Machine Learning Engineer","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000005',
  'authenticated','authenticated','hayden.stats@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Hayden","last_name":"Stats","title":"Statistician","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),

-- Management / Operations
(
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000001',
  'authenticated','authenticated','alexis.pm@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Alexis","last_name":"PM","title":"Project Manager","department":"Management"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000002',
  'authenticated','authenticated','reese.hr@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Reese","last_name":"HR","title":"HR Specialist","department":"Management"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000003',
  'authenticated','authenticated','taylor.ops@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Taylor","last_name":"Ops","title":"Operations Coordinator","department":"Management"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000004',
  'authenticated','authenticated','bailey.finance@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Bailey","last_name":"Finance","title":"Financial Analyst","department":"Management"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000005',
  'authenticated','authenticated','sasha.admin@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Sasha","last_name":"Admin","title":"Administrative Assistant","department":"Management"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  'authenticated','authenticated','consultant@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Casey","last_name":"Coder","title":"Senior Software Engineer","department":"Engineering"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-2222-3333-4444-555555555555',
  'authenticated','authenticated','designer@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Dana","last_name":"Designer","title":"Product Designer","department":"Design"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'authenticated','authenticated','data@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Ari","last_name":"Analyst","title":"Data Scientist","department":"Data & Analytics"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
  'authenticated','authenticated','fullstack@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Finley","last_name":"Fullstack","title":"Full-stack Engineer","department":"Engineering"}',
  now(), now(), '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;


-- Admin membership
INSERT INTO public.admin_members (user_id)
VALUES ('8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c'::uuid)
ON CONFLICT (user_id) DO NOTHING;

-- 3) Skills --------------------------------------------------------------------
INSERT INTO public.skills (name, aliases) VALUES
  ('React', '{ReactJS}'),
  ('Next.js', '{}'::text[]),
  ('TypeScript', '{}'::text[]),
  ('JavaScript', '{JS}'),
  ('Node.js', '{}'::text[]),
  ('PostgreSQL', '{Postgres}'),
  ('Supabase', '{}'::text[]),
  ('GraphQL', '{}'::text[]),
  ('Prisma', '{}'::text[]),
  ('Docker', '{}'::text[]),
  ('Kubernetes', '{K8s}'),
  ('AWS', '{}'::text[]),
  ('CI/CD', '{}'::text[]),
  ('Tailwind CSS', '{Tailwind}'),
  ('Figma', '{}'::text[]),
  ('UX Research', '{User Research}'),
  ('Python', '{}'::text[]),
  ('Pandas', '{}'::text[]),
  ('dbt', '{}'::text[]),
  ('Airflow', '{}'::text[]),
  ('Power BI', '{}'::text[]),
  ('BigQuery', '{}'::text[]),
  ('Redis', '{}'::text[]),
  ('tRPC', '{}'::text[])
ON CONFLICT (name) DO NOTHING;

-- 4) Link skills to profiles (explicit ::uuid casts) ---------------------------
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid, s.id,
  (4 + floor(random()*2))::smallint,
  (4 + floor(random()*4))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase','GraphQL','Prisma','Tailwind CSS','tRPC','CI/CD','Docker')
ON CONFLICT DO NOTHING;

INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  '11111111-2222-3333-4444-555555555555'::uuid, s.id,
  (3 + floor(random()*3))::smallint,
  (3 + floor(random()*5))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('Figma','UX Research','React','Tailwind CSS')
ON CONFLICT DO NOTHING;

INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, s.id,
  (4 + floor(random()*2))::smallint,
  (3 + floor(random()*6))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('Python','Pandas','dbt','Airflow','Power BI','BigQuery','PostgreSQL','AWS')
ON CONFLICT DO NOTHING;

INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  '77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid, s.id,
  (3 + floor(random()*3))::smallint,
  (2 + floor(random()*6))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase','GraphQL','Redis','CI/CD','Docker','AWS','Prisma')
ON CONFLICT DO NOTHING;

-- 5) Availability (12 months) — cast UUIDs inside UNION branches --------------
WITH months AS (
  SELECT (date_trunc('month', now()) + (n || ' months')::interval)::date AS m
  FROM generate_series(0,11) AS g(n)
)
INSERT INTO public.availability_months (profile_id, month, hours_available, hours_committed)
SELECT '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid, m, 160, (40 + floor(random()*41))::int FROM months
UNION ALL
SELECT '11111111-2222-3333-4444-555555555555'::uuid, m, (140 + floor(random()*21))::int, (20 + floor(random()*41))::int FROM months
UNION ALL
SELECT 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, m, 160, (60 + floor(random()*41))::int FROM months
UNION ALL
SELECT '77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid, m, (150 + floor(random()*11))::int, (0 + floor(random()*41))::int FROM months
ON CONFLICT DO NOTHING;

-- 6) Experiences / Educations (explicit ::uuid) --------------------------------
INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid,'Pango Consulting','Senior Software Engineer','2021-01-01',NULL,'job','Next.js + Supabase platform; RLS + FTS.'),
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid,'Tech Solutions Inc.','Frontend Engineer','2018-01-15','2020-12-31','job','Design systems, GraphQL/tRPC.'),
  ('11111111-2222-3333-4444-555555555555'::uuid,'Bright Apps','Product Designer','2020-02-01',NULL,'job','E2E product design; a11y/responsive.'),
  ('11111111-2222-3333-4444-555555555555'::uuid,'Studio Nine','UX Researcher','2017-09-01','2020-01-31','job','Mixed-methods research program.'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,'DataWorks','Data Scientist','2022-03-01',NULL,'job','Airflow/dbt pipelines; ML models.'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,'Market Insights Co.','Data Analyst','2018-08-01','2022-02-28','job','BI dashboards & ad-hoc SQL.'),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid,'Cloud Craft','Full-stack Engineer','2020-06-01',NULL,'job','React/Node; Docker on AWS.'),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid,'Web Innovators','Junior Developer','2017-06-01','2020-05-31','job','Legacy to Node/Postgres migration.')
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid,'NTNU','Computer Science','MSc',2013,2018),
  ('11111111-2222-3333-4444-555555555555'::uuid,'Aalto University','Product & Service Design','BDes',2012,2016),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,'University of Oslo','Data Science','MSc',2014,2019),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid,'BI Norwegian Business School','Business Analytics','BSc',2015,2018)
ON CONFLICT DO NOTHING;

-- 7) Compensation --------------------------------------------------------------
INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid, 1200, 'NOK', CURRENT_DATE),
  ('11111111-2222-3333-4444-555555555555'::uuid, 900, 'NOK', CURRENT_DATE),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, 1100, 'NOK', CURRENT_DATE),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid, 1150, 'NOK', CURRENT_DATE)
ON CONFLICT (profile_id) DO NOTHING;

-- 8) Clients, Companies, Projects ---------------------------------------------
INSERT INTO public.clients (name) VALUES
  ('Trondheim Kommune'),
  ('Pango Platform'),
  ('Nordic Retail Group')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.companies (name) VALUES
  ('Equinor'),
  ('Vipps'),
  ('Kahoot!'),
  ('Telenor')
ON CONFLICT (name) DO NOTHING;

-- Simple projects tied to clients
WITH c AS (
  SELECT id, name FROM public.clients
)
INSERT INTO public.projects (client_id, name, description, start_date, status)
SELECT c.id, 'Donation Portal Revamp', 'Vipps integration + analytics', CURRENT_DATE - INTERVAL '120 days', 'active'
FROM c WHERE c.name = 'Pango Platform'
UNION ALL
SELECT c.id, 'City Services App', 'Citizen portal MVP', CURRENT_DATE - INTERVAL '60 days', 'active'
FROM c WHERE c.name = 'Trondheim Kommune'
UNION ALL
SELECT c.id, 'Retail Insights', 'Data warehouse modernization', CURRENT_DATE - INTERVAL '200 days', 'on_hold'
FROM c WHERE c.name = 'Nordic Retail Group'
ON CONFLICT DO NOTHING;

-- 9) Project staffing & skills -------------------------------------------------
-- Grab project ids for convenience
WITH
p AS (SELECT id, name FROM public.projects),
s AS (SELECT id, name FROM public.skills)
INSERT INTO public.project_members (project_id, profile_id, role, start_date, hours, contribution)
SELECT p.id, '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid, 'Lead Engineer', CURRENT_DATE - INTERVAL '90 days', 60, 'Architecture & core features'
FROM p WHERE p.name = 'Donation Portal Revamp'
UNION ALL
SELECT p.id, '11111111-2222-3333-4444-555555555555'::uuid, 'Product Designer', CURRENT_DATE - INTERVAL '55 days', 40, 'Design system & flows'
FROM p WHERE p.name = 'City Services App'
UNION ALL
SELECT p.id, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, 'Data Scientist', CURRENT_DATE - INTERVAL '180 days', 30, 'Modeling & dashboards'
FROM p WHERE p.name = 'Retail Insights'
UNION ALL
SELECT p.id, '77777777-8888-9999-aaaa-bbbbbbbbbbbb'::uuid, 'Full-stack Engineer', CURRENT_DATE - INTERVAL '50 days', 50, 'API + UI'
FROM p WHERE p.name = 'City Services App'
ON CONFLICT DO NOTHING;

WITH
p AS (SELECT id, name FROM public.projects),
s AS (SELECT id, name FROM public.skills)
INSERT INTO public.project_skills (project_id, skill_id)
SELECT p.id, s.id FROM p, s
WHERE p.name = 'Donation Portal Revamp' AND s.name IN ('Supabase','PostgreSQL','Next.js','TypeScript','CI/CD')
ON CONFLICT DO NOTHING;

-- 10) Interests (companies & skills) ------------------------------------------
INSERT INTO public.profile_company_interests (profile_id, company_id)
SELECT '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b'::uuid, c.id FROM public.companies c WHERE c.name IN ('Vipps','Kahoot!')
ON CONFLICT DO NOTHING;

INSERT INTO public.profile_skill_interests (profile_id, skill_id, priority)
SELECT 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, s.id, 5 FROM public.skills s WHERE s.name IN ('dbt','Airflow','BigQuery')
ON CONFLICT DO NOTHING;

-- 11) Invitations --------------------------------------------------------------
INSERT INTO public.invitations (email, role, invited_by, token_hash, expires_at)
VALUES
  ('newhire@example.com','consultant','8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
   encode(extensions.digest('invite123', 'sha256'), 'hex'),
   now() + interval '14 days'),
  ('daniela@example.com','consultant','8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
   encode(extensions.digest('designme', 'sha256'), 'hex'),
   now() + interval '14 days'),
  ('arjun@example.com','consultant','8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
   encode(extensions.digest('datadev', 'sha256'), 'hex'),
   now() + interval '14 days')
ON CONFLICT (email) DO NOTHING;

-- 12) (Optional) quick sanity counts ------------------------------------------
-- SELECT
--   (SELECT count(*) FROM auth.users) AS users,
--   (SELECT count(*) FROM public.projects) AS projects,
--   (SELECT count(*) FROM public.project_members) AS project_members,
--   (SELECT count(*) FROM public.skills) AS skills,
--   (SELECT count(*) FROM public.profile_skills) AS profile_skills,
--   (SELECT count(*) FROM public.availability_months) AS availability_rows;
-- =============================================================================



-- =============================================================================
-- Addendum (no cross-statement CTEs): realistic seed for the 20 new consultants
-- =============================================================================

-- B) Ensure primary memberships per department --------------------------------
INSERT INTO public.profiles_departments (profile_id, department_id, is_primary, role)
SELECT p.id, d.id, TRUE, 'member'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.departments d ON d.name = 'Engineering'
WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','taylor.devops@example.com','morgan.frontend@example.com','charlie.qa@example.com')
ON CONFLICT (profile_id, department_id) DO NOTHING;

INSERT INTO public.profiles_departments (profile_id, department_id, is_primary, role)
SELECT p.id, d.id, TRUE, 'member'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.departments d ON d.name = 'Design'
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
ON CONFLICT (profile_id, department_id) DO NOTHING;

INSERT INTO public.profiles_departments (profile_id, department_id, is_primary, role)
SELECT p.id, d.id, TRUE, 'member'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.departments d ON d.name = 'Data & Analytics'
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
ON CONFLICT (profile_id, department_id) DO NOTHING;

INSERT INTO public.profiles_departments (profile_id, department_id, is_primary, role)
SELECT p.id, d.id, TRUE, 'member'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.departments d ON d.name = 'Management'
WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
ON CONFLICT (profile_id, department_id) DO NOTHING;

-- C) Assign leaders (optional; comment out if you want UI-only assignment) ----
UPDATE public.departments d
SET leader_profile_id = p.id
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE (d.name = 'Management'       AND u.email = 'admin@example.com')
   OR (d.name = 'Engineering'      AND u.email = 'alex.engineer@example.com')
   OR (d.name = 'Design'           AND u.email = 'jamie.designer@example.com')
   OR (d.name = 'Data & Analytics' AND u.email = 'sam.data@example.com');

-- D) Skills: sensible bundles per department ----------------------------------
-- Engineers
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT p.id, s.id, (3 + floor(random()*3))::smallint, (2 + floor(random()*6))::numeric(4,1)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.skills s ON s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase','GraphQL','CI/CD','Docker','AWS','Prisma','Redis')
WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','taylor.devops@example.com','morgan.frontend@example.com','charlie.qa@example.com')
ON CONFLICT DO NOTHING;

-- Designers
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT p.id, s.id, (3 + floor(random()*3))::smallint, (2 + floor(random()*6))::numeric(4,1)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.skills s ON s.name IN ('Figma','UX Research','Tailwind CSS','React')
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
ON CONFLICT DO NOTHING;

-- Data & Analytics
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT p.id, s.id, (3 + floor(random()*3))::smallint, (2 + floor(random()*6))::numeric(4,1)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.skills s ON s.name IN ('Python','Pandas','dbt','Airflow','Power BI','BigQuery','PostgreSQL','AWS')
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
ON CONFLICT DO NOTHING;

-- Management
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT p.id, s.id, (3 + floor(random()*3))::smallint, (3 + floor(random()*5))::numeric(4,1)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.skills s ON s.name IN ('CI/CD','Power BI','PostgreSQL','Node.js')
WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
ON CONFLICT DO NOTHING;

-- E) Availability: 12 months with different bands -----------------------------
WITH months AS (
  SELECT (date_trunc('month', now()) + (n || ' months')::interval)::date AS m
  FROM generate_series(0,11) AS g(n)
)
INSERT INTO public.availability_months (profile_id, month, hours_available, hours_committed)
-- Engineers: 150–170 avail, 20–80 committed
SELECT p.id, m.m, (150 + floor(random()*21))::int, (20 + floor(random()*61))::int
FROM months m
JOIN public.profiles p ON TRUE
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','taylor.devops@example.com','morgan.frontend@example.com','charlie.qa@example.com')
UNION ALL
-- Designers: 140–160 avail, 10–70 committed
SELECT p.id, m.m, (140 + floor(random()*21))::int, (10 + floor(random()*61))::int
FROM months m
JOIN public.profiles p ON TRUE
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
UNION ALL
-- Data & Analytics: 150–170 avail, 30–90 committed
SELECT p.id, m.m, (150 + floor(random()*21))::int, (30 + floor(random()*61))::int
FROM months m
JOIN public.profiles p ON TRUE
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
UNION ALL
-- Management: 120–160 avail, 20–60 committed
SELECT p.id, m.m, (120 + floor(random()*41))::int, (20 + floor(random()*41))::int
FROM months m
JOIN public.profiles p ON TRUE
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
ON CONFLICT DO NOTHING;

-- F) Compensation bands (NOK) --------------------------------------------------
INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, (1100 + floor(random()*201))::int, 'NOK', CURRENT_DATE
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','taylor.devops@example.com','morgan.frontend@example.com','charlie.qa@example.com')
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, (850 + floor(random()*151))::int, 'NOK', CURRENT_DATE
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, (1000 + floor(random()*201))::int, 'NOK', CURRENT_DATE
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, (800 + floor(random()*151))::int, 'NOK', CURRENT_DATE
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
ON CONFLICT (profile_id) DO NOTHING;

-- G) Experiences ---------------------------------------------------------------
INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Acme Tech', 'Software Engineer', (CURRENT_DATE - INTERVAL '5 years'), (CURRENT_DATE - INTERVAL '2 years'), 'job', 'Feature development, code reviews, cloud infra.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','morgan.frontend@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'CloudOps Co.', 'DevOps Engineer', (CURRENT_DATE - INTERVAL '4 years'), NULL, 'job', 'CI/CD, Kubernetes, SRE practices.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('taylor.devops@example.com','charlie.qa@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Design Studio 12', 'UX Designer', (CURRENT_DATE - INTERVAL '6 years'), NULL, 'job', 'Design systems, accessibility, prototyping.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Creative Lab', 'Graphic Designer', (CURRENT_DATE - INTERVAL '7 years'), (CURRENT_DATE - INTERVAL '1 year'), 'job', 'Branding, illustration, motion.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'DataWorks', 'Data Engineer', (CURRENT_DATE - INTERVAL '5 years'), NULL, 'job', 'ETL, dbt, Airflow, BigQuery.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Insights Hub', 'BI Analyst', (CURRENT_DATE - INTERVAL '4 years'), NULL, 'job', 'Dashboards, KPI modeling, stakeholder comms.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('blake.bi@example.com','hayden.stats@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'ML Forge', 'ML Engineer', (CURRENT_DATE - INTERVAL '3 years'), NULL, 'job', 'Model training, MLOps, monitoring.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('drew.ml@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Ops United', 'Project Manager', (CURRENT_DATE - INTERVAL '6 years'), NULL, 'job', 'Roadmaps, delivery, team leadership.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alexis.pm@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'PeopleFirst', 'HR Specialist', (CURRENT_DATE - INTERVAL '4 years'), NULL, 'job', 'Recruiting, onboarding, culture programs.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('reese.hr@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'Opsline', 'Operations Coordinator', (CURRENT_DATE - INTERVAL '5 years'), NULL, 'job', 'Process improvement, vendor mgmt.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('taylor.ops@example.com','sasha.admin@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id, 'FinGuard', 'Financial Analyst', (CURRENT_DATE - INTERVAL '4 years'), NULL, 'job', 'Forecasting, budgeting, BI.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('bailey.finance@example.com')
ON CONFLICT DO NOTHING;

-- H) Educations ----------------------------------------------------------------
INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'NTNU', 'Computer Science', 'BSc', 2012, 2015
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alex.engineer@example.com','morgan.frontend@example.com','charlie.qa@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'UiO', 'Informatics', 'MSc', 2015, 2017
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('riley.backend@example.com','taylor.devops@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'Aalto University', 'Product & Service Design', 'BDes', 2013, 2016
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'BI Norwegian Business School', 'Business Analytics', 'MSc', 2014, 2018
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'NHH', 'Economics & Administration', 'BSc', 2011, 2014
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
ON CONFLICT DO NOTHING;

-- I) Project members: add more real staffing ----------------------------------
WITH pjt AS (SELECT id, name FROM public.projects)
INSERT INTO public.project_members (project_id, profile_id, role, start_date, hours, contribution)
SELECT p.id, pr.id, 'QA Engineer',        CURRENT_DATE - INTERVAL '80 days', 30, 'Test plans, regression'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'charlie.qa@example.com'
WHERE p.name = 'Donation Portal Revamp'
UNION ALL
SELECT p.id, pr.id, 'DevOps Engineer',     CURRENT_DATE - INTERVAL '85 days', 35, 'CI/CD pipelines'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'taylor.devops@example.com'
WHERE p.name = 'Donation Portal Revamp'
UNION ALL
SELECT p.id, pr.id, 'Project Manager',     CURRENT_DATE - INTERVAL '65 days', 20, 'Delivery & comms'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'alexis.pm@example.com'
WHERE p.name = 'City Services App'
UNION ALL
SELECT p.id, pr.id, 'UX Designer',         CURRENT_DATE - INTERVAL '55 days', 25, 'Flows & usability'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'jamie.designer@example.com'
WHERE p.name = 'City Services App'
UNION ALL
SELECT p.id, pr.id, 'Frontend Developer',  CURRENT_DATE - INTERVAL '50 days', 35, 'UI features'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'morgan.frontend@example.com'
WHERE p.name = 'City Services App'
UNION ALL
SELECT p.id, pr.id, 'BI Analyst',          CURRENT_DATE - INTERVAL '160 days', 20, 'Dashboards, KPIs'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'blake.bi@example.com'
WHERE p.name = 'Retail Insights'
UNION ALL
SELECT p.id, pr.id, 'Data Engineer',       CURRENT_DATE - INTERVAL '170 days', 30, 'Pipelines, dbt'
FROM pjt p
JOIN public.profiles pr ON TRUE
JOIN auth.users u ON u.id = pr.id AND u.email = 'sam.data@example.com'
WHERE p.name = 'Retail Insights'
ON CONFLICT DO NOTHING;

-- J) Interests -----------------------------------------------------------------
INSERT INTO public.profile_company_interests (profile_id, company_id)
SELECT pr.id, c.id
FROM public.profiles pr
JOIN auth.users u ON u.id = pr.id
JOIN public.companies c ON c.name IN ('Vipps','Telenor')
WHERE u.email IN ('riley.backend@example.com','morgan.frontend@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.profile_skill_interests (profile_id, skill_id, priority)
SELECT pr.id, s.id, 4
FROM public.profiles pr
JOIN auth.users u ON u.id = pr.id
JOIN public.skills s ON s.name IN ('Kubernetes','GraphQL')
WHERE u.email IN ('taylor.devops@example.com','alex.engineer@example.com')
ON CONFLICT DO NOTHING;


REFRESH MATERIALIZED VIEW public.consultant_search;
