-- Seed for normalized schema (departments M2M + RLS helpers)
-- Runs as a privileged role via migrations; RLS won't block.

-- 0) Extensions ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS citext;

-- 1) Users (trigger will auto-create profiles and department membership) -------
-- NOTE: password hashing uses extensions.crypt / extensions.gen_salt

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',                 -- Admin
  'authenticated','authenticated','admin@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"User","title":"Administrator","department":"Management"}',
  now(), now(),
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',                 -- Consultant
  'authenticated','authenticated','consultant@example.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Consultant","last_name":"User","title":"Senior Software Engineer","department":"Engineering"}',
  now(), now(),
  '', '', '', ''
);

-- Make the first user an admin (used by public.is_admin())
INSERT INTO public.admin_members (user_id)
VALUES ('8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c')
ON CONFLICT (user_id) DO NOTHING;

-- (Optional) If you want to be extra sure the department rows exist even without triggers,
-- you can upsert them explicitly. Usually not necessary, the handle_new_user trigger
-- already created both departments and memberships from metadata.
INSERT INTO public.departments (name) VALUES ('Management'), ('Engineering')
ON CONFLICT (name) DO NOTHING;

-- 2) Canonical skills ----------------------------------------------------------
INSERT INTO public.skills (name, aliases) VALUES
  ('React', '{ReactJS}'),
  ('Next.js', '{}'),
  ('TypeScript', '{}'),
  ('Node.js', '{}'),
  ('PostgreSQL', '{Postgres}'),
  ('Supabase', '{}'),
  ('GraphQL', '{}'),
  ('Docker', '{}')
ON CONFLICT (name) DO NOTHING;

-- 3) Link skills to the consultant profile ------------------------------------
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  s.id,
  (3 + floor(random() * 3))::smallint,
  (5 + floor(random() * 6))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase');

-- 4) Availability for next 6 months ------------------------------------------
INSERT INTO public.availability_months (profile_id, month, hours_available, hours_committed)
SELECT
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  date_trunc('month', gs)::date,
  160,
  (floor(random() * 80))::int
FROM generate_series(now(), now() + interval '5 months', '1 month') AS gs;

-- 5) Experience ----------------------------------------------------------------
INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','Tech Solutions Inc.','Lead Developer','2018-01-15','2023-12-31','job','Led a team of 5 developers in building a new e-commerce platform from scratch using Next.js and GraphQL.'),
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','Web Innovators','Frontend Developer','2015-06-01','2017-12-31','job','Developed and maintained several client websites using React and Redux.');

-- 6) Education -----------------------------------------------------------------
INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','University of Technology','Computer Science','BSc',2011,2014);

-- 7) Example invitation (valid for 14 days) -----------------------------------
-- The token a user would type is 'invite123'; hash aligns with verify_invitation().
INSERT INTO public.invitations (email, role, invited_by, token_hash, expires_at)
VALUES (
  'newhire@example.com',
  'consultant',
  '8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
  encode(extensions.digest('invite123', 'sha256'), 'hex'),
  now() + interval '14 days'
)
ON CONFLICT (email) DO NOTHING;
