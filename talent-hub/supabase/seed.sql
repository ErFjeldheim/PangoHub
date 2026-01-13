-- =============================================================================
-- Deterministic, realistic seed.sql (Supabase seeder-safe) — RELATIVE DATES
-- Uses helper functions created via migration (seed_helpers).
-- =============================================================================
-- Conventions:
-- - project_members.hours = planned HOURS PER MONTH
-- - availability_months.hours_committed is derived from staffing
-- =============================================================================

-- 0) Extensions ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS citext;

-- 1) Departments (upsert) ------------------------------------------------------
INSERT INTO public.departments (name, description) VALUES
  ('Management','Operations & leadership'),
  ('Tech','Product engineering'),
  ('Design','Product design'),
  ('Strategy','Strategy, data & insights')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- 2) Users (insert-if-missing by email; profiles created via trigger) ----------
WITH seed_users(email, first_name, last_name, title, dept) AS (
  VALUES
  -- Admin
  ('admin@example.com','Ada','Admin','Head of Operations','Management'),
  -- Tech
  ('alex.engineer@example.com','Alex','Engineer','Software Engineer','Tech'),
  ('riley.backend@example.com','Riley','Backend','Backend Developer','Tech'),
  ('taylor.devops@example.com','Taylor','DevOps','DevOps Engineer','Tech'),
  ('morgan.frontend@example.com','Morgan','Frontend','Frontend Developer','Tech'),
  ('charlie.qa@example.com','Charlie','QA','QA Engineer','Tech'),
  -- Design
  ('jamie.designer@example.com','Jamie','Designer','UX Designer','Design'),
  ('casey.ux@example.com','Casey','UX','UI/UX Researcher','Design'),
  ('robin.creative@example.com','Robin','Creative','Graphic Designer','Design'),
  ('kendall.brand@example.com','Kendall','Brand','Brand Designer','Design'),
  ('avery.motion@example.com','Avery','Motion','Motion Designer','Design'),
  -- Strategy
  ('sam.data@example.com','Sam','Data','Data Engineer','Strategy'),
  ('jordan.analytics@example.com','Jordan','Analytics','Data Analyst','Strategy'),
  ('blake.bi@example.com','Blake','BI','Business Intelligence Analyst','Strategy'),
  ('drew.ml@example.com','Drew','ML','Machine Learning Engineer','Strategy'),
  ('hayden.stats@example.com','Hayden','Stats','Statistician','Strategy'),
  -- Management
  ('alexis.pm@example.com','Alexis','PM','Project Manager','Management'),
  ('reese.hr@example.com','Reese','HR','HR Specialist','Management'),
  ('taylor.ops@example.com','Taylor','Ops','Operations Coordinator','Management'),
  ('bailey.finance@example.com','Bailey','Finance','Financial Analyst','Management'),
  ('sasha.admin@example.com','Sasha','Admin','Administrative Assistant','Management')
)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated','authenticated',
  su.email,
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'first_name', su.first_name,
    'last_name',  su.last_name,
    'title',      su.title,
    'department', su.dept
  ),
  now(), now(), '', '', '', ''
FROM seed_users su
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = su.email);

-- Admin membership
INSERT INTO public.admin_members (user_id)
SELECT u.id FROM auth.users u WHERE u.email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3) Skills (upsert) -----------------------------------------------------------
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
ON CONFLICT (name) DO UPDATE
SET aliases = EXCLUDED.aliases;

-- 4) Primary department memberships -------------------------------------------
INSERT INTO public.profiles_departments (profile_id, department_id, is_primary, role)
SELECT p.id, d.id, TRUE, 'member'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
JOIN public.departments d ON d.name = COALESCE((u.raw_user_meta_data->>'department'), 'Tech')
ON CONFLICT (profile_id, department_id) DO NOTHING;

-- Assign leaders (optional)
UPDATE public.departments d
SET leader_profile_id = p.id
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE (d.name = 'Management' AND u.email = 'admin@example.com')
   OR (d.name = 'Tech'       AND u.email = 'alex.engineer@example.com')
   OR (d.name = 'Design'     AND u.email = 'jamie.designer@example.com')
   OR (d.name = 'Strategy'   AND u.email = 'sam.data@example.com');

-- 5) Profile skills (deterministic) -------------------------------------------
-- Tech
WITH tech AS (
  SELECT p.id AS pid
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE u.email IN ('alex.engineer@example.com','riley.backend@example.com','taylor.devops@example.com','morgan.frontend@example.com','charlie.qa@example.com')
),
skills AS (SELECT id, name FROM public.skills)
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT t.pid, s.id,
       CASE s.name
         WHEN 'React' THEN 5 WHEN 'Next.js' THEN 5 WHEN 'TypeScript' THEN 5
         WHEN 'Node.js' THEN 4 WHEN 'PostgreSQL' THEN 4 WHEN 'Supabase' THEN 4
         WHEN 'GraphQL' THEN 4 WHEN 'CI/CD' THEN 4 WHEN 'Docker' THEN 4
         WHEN 'AWS' THEN 3 WHEN 'Prisma' THEN 4 WHEN 'Redis' THEN 3
         ELSE 3 END::smallint,
       CASE s.name
         WHEN 'React' THEN 5.0 WHEN 'Next.js' THEN 4.0 WHEN 'TypeScript' THEN 4.0
         WHEN 'Node.js' THEN 5.0 WHEN 'PostgreSQL' THEN 4.0 WHEN 'Supabase' THEN 3.0
         WHEN 'GraphQL' THEN 3.0 WHEN 'CI/CD' THEN 3.0 WHEN 'Docker' THEN 3.0
         WHEN 'AWS' THEN 2.0 WHEN 'Prisma' THEN 3.0 WHEN 'Redis' THEN 2.0
         ELSE 2.0 END::numeric(4,1)
FROM tech t
JOIN skills s ON s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase','GraphQL','CI/CD','Docker','AWS','Prisma','Redis')
ON CONFLICT DO NOTHING;

-- Design
WITH des AS (
  SELECT p.id AS pid
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE u.email IN ('jamie.designer@example.com','casey.ux@example.com','robin.creative@example.com','kendall.brand@example.com','avery.motion@example.com')
),
skills AS (SELECT id, name FROM public.skills)
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT d.pid, s.id,
       CASE s.name WHEN 'Figma' THEN 5 WHEN 'UX Research' THEN 4 WHEN 'Tailwind CSS' THEN 3 WHEN 'React' THEN 3 ELSE 3 END::smallint,
       CASE s.name WHEN 'Figma' THEN 5.0 WHEN 'UX Research' THEN 4.0 WHEN 'Tailwind CSS' THEN 3.0 WHEN 'React' THEN 2.0 ELSE 2.0 END::numeric(4,1)
FROM des d
JOIN skills s ON s.name IN ('Figma','UX Research','Tailwind CSS','React')
ON CONFLICT DO NOTHING;

-- Strategy
WITH strat AS (
  SELECT p.id AS pid
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE u.email IN ('sam.data@example.com','jordan.analytics@example.com','blake.bi@example.com','drew.ml@example.com','hayden.stats@example.com')
),
skills AS (SELECT id, name FROM public.skills)
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT st.pid, s.id,
       CASE s.name
         WHEN 'Python' THEN 5 WHEN 'Pandas' THEN 5
         WHEN 'dbt' THEN 4 WHEN 'Airflow' THEN 4
         WHEN 'Power BI' THEN 4 WHEN 'BigQuery' THEN 4
         WHEN 'PostgreSQL' THEN 4 WHEN 'AWS' THEN 3
         ELSE 3 END::smallint,
       CASE s.name
         WHEN 'Python' THEN 5.0 WHEN 'Pandas' THEN 5.0
         WHEN 'dbt' THEN 3.0 WHEN 'Airflow' THEN 3.0
         WHEN 'Power BI' THEN 3.0 WHEN 'BigQuery' THEN 3.0
         WHEN 'PostgreSQL' THEN 4.0 WHEN 'AWS' THEN 2.0
         ELSE 2.0 END::numeric(4,1)
FROM strat st
JOIN skills s ON s.name IN ('Python','Pandas','dbt','Airflow','Power BI','BigQuery','PostgreSQL','AWS')
ON CONFLICT DO NOTHING;

-- Management
WITH mgmt AS (
  SELECT p.id AS pid
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE u.email IN ('alexis.pm@example.com','reese.hr@example.com','taylor.ops@example.com','bailey.finance@example.com','sasha.admin@example.com')
),
skills AS (SELECT id, name FROM public.skills)
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT m.pid, s.id,
       CASE s.name WHEN 'CI/CD' THEN 3 WHEN 'Power BI' THEN 4 WHEN 'PostgreSQL' THEN 3 WHEN 'Node.js' THEN 2 ELSE 2 END::smallint,
       CASE s.name WHEN 'CI/CD' THEN 2.0 WHEN 'Power BI' THEN 4.0 WHEN 'PostgreSQL' THEN 3.0 WHEN 'Node.js' THEN 1.0 ELSE 1.0 END::numeric(4,1)
FROM mgmt m
JOIN skills s ON s.name IN ('CI/CD','Power BI','PostgreSQL','Node.js')
ON CONFLICT DO NOTHING;

-- 6) Experiences / Educations (relative dates) --------------------------------
INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id,'Pango Consulting','Senior Software Engineer',
       (current_date - interval '4 years')::date, NULL,
       'job','Next.js + Supabase platform; RLS + FTS.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'alex.engineer@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id,'Bright Apps','Product Designer',
       (current_date - interval '5 years' - interval '2 months')::date, NULL,
       'job','E2E product design; a11y/responsive.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'jamie.designer@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description)
SELECT p.id,'DataWorks','Data Engineer',
       (current_date - interval '3 years' - interval '10 months')::date, NULL,
       'job','Airflow/dbt pipelines; ML models.'
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'sam.data@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'NTNU','Computer Science','MSc',2013,2018
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'alex.engineer@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'Aalto University','Product & Service Design','BDes',2012,2016
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'jamie.designer@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year)
SELECT p.id, 'University of Oslo','Data Science','MSc',2014,2019
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'sam.data@example.com'
ON CONFLICT DO NOTHING;

-- 7) Compensation (relative upsert) --------------------------------------------
INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, 1200, 'NOK', public.seed_param_date('month0')
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'alex.engineer@example.com'
ON CONFLICT (profile_id) DO UPDATE
SET hourly_rate = EXCLUDED.hourly_rate, currency = EXCLUDED.currency, valid_from = EXCLUDED.valid_from;

INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, 900, 'NOK', public.seed_param_date('month0')
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'jamie.designer@example.com'
ON CONFLICT (profile_id) DO UPDATE
SET hourly_rate = EXCLUDED.hourly_rate, currency = EXCLUDED.currency, valid_from = EXCLUDED.valid_from;

INSERT INTO public.compensation (profile_id, hourly_rate, currency, valid_from)
SELECT p.id, 1100, 'NOK', public.seed_param_date('month0')
FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'sam.data@example.com'
ON CONFLICT (profile_id) DO UPDATE
SET hourly_rate = EXCLUDED.hourly_rate, currency = EXCLUDED.currency, valid_from = EXCLUDED.valid_from;

-- 8) Clients & Companies (upsert) ---------------------------------------------
INSERT INTO public.clients (name) VALUES
  ('Trondheim Kommune'), ('Pango Platform'), ('Nordic Retail Group')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.companies (name) VALUES
  ('Equinor'), ('Vipps'), ('Kahoot!'), ('Telenor')
ON CONFLICT (name) DO NOTHING;

-- 9) Projects (insert-if-missing, then update to canonical values) ------------
-- Donation Portal Revamp
INSERT INTO public.projects (client_id, name, description, start_date, status)
SELECT c.id, 'Donation Portal Revamp', 'Vipps integration + analytics', public.seed_param_date('donation_start'), 'active'
FROM public.clients c
WHERE c.name = 'Pango Platform'
  AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.name = 'Donation Portal Revamp');

UPDATE public.projects
SET description = 'Vipps integration + analytics',
    start_date = public.seed_param_date('donation_start'),
    status = 'active'
WHERE name = 'Donation Portal Revamp';

-- City Services App
INSERT INTO public.projects (client_id, name, description, start_date, status)
SELECT c.id, 'City Services App', 'Citizen portal MVP', public.seed_param_date('city_start'), 'active'
FROM public.clients c
WHERE c.name = 'Trondheim Kommune'
  AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.name = 'City Services App');

UPDATE public.projects
SET description = 'Citizen portal MVP',
    start_date = public.seed_param_date('city_start'),
    status = 'active'
WHERE name = 'City Services App';

-- Retail Insights
INSERT INTO public.projects (client_id, name, description, start_date, status)
SELECT c.id, 'Retail Insights', 'Data warehouse modernization', public.seed_param_date('retail_start'), 'on_hold'
FROM public.clients c
WHERE c.name = 'Nordic Retail Group'
  AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.name = 'Retail Insights');

UPDATE public.projects
SET description = 'Data warehouse modernization',
    start_date = public.seed_param_date('retail_start'),
    status = 'on_hold'
WHERE name = 'Retail Insights';

-- Internal / Bench
INSERT INTO public.projects (client_id, name, description, start_date, status)
SELECT c.id, 'Internal Initiatives / Bench', 'Internal tooling, docs, interviews', public.seed_param_date('bench_start'), 'active'
FROM public.clients c
WHERE c.name = 'Pango Platform'
  AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.name = 'Internal Initiatives / Bench');

UPDATE public.projects
SET description = 'Internal tooling, docs, interviews',
    start_date  = public.seed_param_date('bench_start'),
    status      = 'active'
WHERE name = 'Internal Initiatives / Bench';

-- 10) Project staffing (hours = per month) ------------------------------------
WITH p AS (SELECT id, name FROM public.projects),
     u AS (SELECT id, email FROM auth.users),
     v(project, email, role, start_offset_days, hours_per_month, contribution) AS (
       VALUES
       -- Donation Portal Revamp
       ('Donation Portal Revamp','alex.engineer@example.com','Lead Engineer', 0, 60,'Architecture & core features'),
       ('Donation Portal Revamp','taylor.devops@example.com','DevOps Engineer', 0, 35,'CI/CD pipelines'),
       ('Donation Portal Revamp','charlie.qa@example.com','QA Engineer', 14, 30,'Test plans, regression'),
       -- City Services App
       ('City Services App','alexis.pm@example.com','Project Manager', 0, 20,'Delivery & comms'),
       ('City Services App','jamie.designer@example.com','UX Designer', 0, 25,'Flows & usability'),
       ('City Services App','morgan.frontend@example.com','Frontend Dev', 14, 35,'UI features'),
       ('City Services App','riley.backend@example.com','Backend Dev', 14, 30,'APIs & data'),
       -- Retail Insights
       ('Retail Insights','sam.data@example.com','Data Engineer', 0, 30,'Pipelines, dbt'),
       ('Retail Insights','blake.bi@example.com','BI Analyst', 0, 20,'Dashboards, KPIs'),
       -- Internal / Bench
       ('Internal Initiatives / Bench','casey.ux@example.com','UX Researcher', 0, 10,'Research & interviews'),
       ('Internal Initiatives / Bench','robin.creative@example.com','Graphic Designer', 0, 10,'Brand assets'),
       ('Internal Initiatives / Bench','kendall.brand@example.com','Brand Designer', 0, 10,'Brand system'),
       ('Internal Initiatives / Bench','avery.motion@example.com','Motion Designer', 0, 10,'Motion assets'),
       ('Internal Initiatives / Bench','drew.ml@example.com','ML Engineer', 0, 10,'Prototypes'),
       ('Internal Initiatives / Bench','hayden.stats@example.com','Statistician', 0, 10,'Experiment design'),
       ('Internal Initiatives / Bench','taylor.ops@example.com','Operations Coordinator', 0, 10,'Process improvements'),
       ('Internal Initiatives / Bench','reese.hr@example.com','HR Specialist', 0, 10,'Hiring & onboarding'),
       ('Internal Initiatives / Bench','bailey.finance@example.com','Financial Analyst', 0, 10,'Forecasting'),
       ('Internal Initiatives / Bench','sasha.admin@example.com','Admin', 0, 10,'Admin & docs')
     )
INSERT INTO public.project_members (project_id, profile_id, role, start_date, end_date, hours, contribution)
SELECT
  p.id,
  u.id,
  v.role,
  (
    CASE v.project
      WHEN 'Donation Portal Revamp' THEN public.seed_param_date('donation_start')
      WHEN 'City Services App' THEN public.seed_param_date('city_start')
      WHEN 'Retail Insights' THEN public.seed_param_date('retail_start')
      WHEN 'Internal Initiatives / Bench' THEN public.seed_param_date('bench_start')
    END
    + (v.start_offset_days || ' days')::interval
  )::date,
  NULL,
  v.hours_per_month,
  v.contribution
FROM v
JOIN p ON p.name = v.project
JOIN u ON u.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_members pm
  WHERE pm.project_id = p.id AND pm.profile_id = u.id
);

-- 11) Project skills -----------------------------------------------------------
WITH p AS (SELECT id, name FROM public.projects),
     s AS (SELECT id, name FROM public.skills)
INSERT INTO public.project_skills (project_id, skill_id)
SELECT p.id, s.id
FROM p, s
WHERE p.name = 'Donation Portal Revamp'
  AND s.name IN ('Supabase','PostgreSQL','Next.js','TypeScript','CI/CD')
  AND NOT EXISTS (SELECT 1 FROM public.project_skills ps WHERE ps.project_id = p.id AND ps.skill_id = s.id);

WITH p AS (SELECT id, name FROM public.projects),
     s AS (SELECT id, name FROM public.skills)
INSERT INTO public.project_skills (project_id, skill_id)
SELECT p.id, s.id
FROM p, s
WHERE p.name = 'City Services App'
  AND s.name IN ('React','Next.js','TypeScript','Tailwind CSS','Figma')
  AND NOT EXISTS (SELECT 1 FROM public.project_skills ps WHERE ps.project_id = p.id AND ps.skill_id = s.id);

WITH p AS (SELECT id, name FROM public.projects),
     s AS (SELECT id, name FROM public.skills)
INSERT INTO public.project_skills (project_id, skill_id)
SELECT p.id, s.id
FROM p, s
WHERE p.name = 'Retail Insights'
  AND s.name IN ('Python','dbt','Airflow','Power BI','BigQuery')
  AND NOT EXISTS (SELECT 1 FROM public.project_skills ps WHERE ps.project_id = p.id AND ps.skill_id = s.id);

-- 12) Interests ----------------------------------------------------------------
INSERT INTO public.profile_company_interests (profile_id, company_id)
SELECT u.id, c.id
FROM auth.users u
JOIN public.companies c ON c.name IN ('Vipps','Kahoot!')
WHERE u.email = 'alex.engineer@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profile_company_interests pci
    WHERE pci.profile_id = u.id AND pci.company_id = c.id
  );

INSERT INTO public.profile_skill_interests (profile_id, skill_id, priority)
SELECT u.id, s.id, 5
FROM auth.users u
JOIN public.skills s ON s.name IN ('dbt','Airflow','BigQuery')
WHERE u.email = 'sam.data@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profile_skill_interests psi
    WHERE psi.profile_id = u.id AND psi.skill_id = s.id
  );

-- 13) Invitations (after users exist) -----------------------------------------
INSERT INTO public.invitations (email, role, invited_by, token_hash, expires_at)
SELECT 'newhire@example.com','consultant', a.id,
       encode(extensions.digest('invite123','sha256'),'hex'),
       public.seed_param_ts('invite_expires')
FROM auth.users a
WHERE a.email = 'admin@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.invitations i WHERE i.email = 'newhire@example.com');

-- 14) Departmental planning (canonical) ---------------------------------------
WITH p AS (SELECT id, name FROM public.projects),
     d AS (SELECT id, name FROM public.departments)
INSERT INTO public.project_department_hours (project_id, department_id, hours_required)
SELECT p.id, d.id, v.hours
FROM p
JOIN (VALUES
  ('Donation Portal Revamp','Tech',       240),
  ('Donation Portal Revamp','Design',      80),
  ('Donation Portal Revamp','Management',  40)
) AS v(project, department, hours) ON v.project = p.name
JOIN d ON d.name = v.department
ON CONFLICT (project_id, department_id) DO UPDATE
SET hours_required = EXCLUDED.hours_required;

WITH p AS (SELECT id, name FROM public.projects),
     d AS (SELECT id, name FROM public.departments)
INSERT INTO public.project_department_hours (project_id, department_id, hours_required)
SELECT p.id, d.id, v.hours
FROM p
JOIN (VALUES
  ('City Services App','Tech',     200),
  ('City Services App','Design',   120),
  ('City Services App','Strategy',  40)
) AS v(project, department, hours) ON v.project = p.name
JOIN d ON d.name = v.department
ON CONFLICT (project_id, department_id) DO UPDATE
SET hours_required = EXCLUDED.hours_required;

WITH p AS (SELECT id, name FROM public.projects),
     d AS (SELECT id, name FROM public.departments)
INSERT INTO public.project_department_hours (project_id, department_id, hours_required)
SELECT p.id, d.id, v.hours
FROM p
JOIN (VALUES
  ('Retail Insights','Strategy', 220),
  ('Retail Insights','Tech',      60)
) AS v(project, department, hours) ON v.project = p.name
JOIN d ON d.name = v.department
ON CONFLICT (project_id, department_id) DO UPDATE
SET hours_required = EXCLUDED.hours_required;

-- 15) Availability (12 months; commitments derived from staffing) -------------
WITH months AS (
  SELECT (public.seed_param_date('month0') + (n || ' months')::interval)::date AS m
  FROM generate_series(0,11) AS g(n)
),
avail AS (  -- deterministic hours_available by primary department
  SELECT p.id AS profile_id, mo.m AS month,
         CASE d.name WHEN 'Tech' THEN 160 WHEN 'Design' THEN 150
                     WHEN 'Strategy' THEN 160 WHEN 'Management' THEN 140
                     ELSE 160 END AS hours_available
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  JOIN public.profiles_departments pd ON pd.profile_id = p.id AND pd.is_primary IS TRUE
  JOIN public.departments d ON d.id = pd.department_id
  CROSS JOIN months mo
),
pm_monthly AS (  -- sum hours_per_month for months covered by each membership
  SELECT pm.profile_id, mo.m AS month, SUM(pm.hours)::int AS monthly_committed
  FROM public.project_members pm
  JOIN months mo
    ON pm.start_date <= mo.m
   AND (pm.end_date IS NULL OR pm.end_date >= mo.m)
  GROUP BY pm.profile_id, mo.m
)
INSERT INTO public.availability_months (profile_id, month, hours_available, hours_committed)
SELECT a.profile_id, a.month, a.hours_available, COALESCE(p.monthly_committed, 0) AS hours_committed
FROM avail a
LEFT JOIN pm_monthly p
  ON p.profile_id = a.profile_id AND p.month = a.month
ON CONFLICT (profile_id, month) DO UPDATE
SET hours_available = EXCLUDED.hours_available,
    hours_committed = EXCLUDED.hours_committed;

-- 16) Applications ("I'm interested") -----------------------------------------
WITH u AS (SELECT id, email FROM auth.users),
     p AS (SELECT id, name FROM public.projects),
     v(project, email, msg) AS (
       VALUES
       ('City Services App','morgan.frontend@example.com','Happy to take frontend tasks.'),
       ('City Services App','jamie.designer@example.com','Can help with flows and visuals.'),
       ('Donation Portal Revamp','alex.engineer@example.com','I can assist with payments integration.'),
       ('Retail Insights','sam.data@example.com','Interested in modeling and dashboards.')
     )
INSERT INTO public.project_interest (project_id, profile_id, message)
SELECT p.id, u.id, v.msg
FROM v
JOIN u ON u.email = v.email
JOIN p ON p.name = v.project
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_interest pi
  WHERE pi.project_id = p.id AND pi.profile_id = u.id
);

-- 17) Final touch: refresh materialized view (assumes it exists) ---------------
DO $$
BEGIN
  EXECUTE 'REFRESH MATERIALIZED VIEW public.consultant_search';
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- =============================================================================
-- End of seed
-- =============================================================================
