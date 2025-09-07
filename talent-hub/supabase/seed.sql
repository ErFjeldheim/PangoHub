-- Enable hashing if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (trigger will auto-create profiles)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c',
    'authenticated','authenticated','admin@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User","title":"Administrator","department":"Management"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
    'authenticated','authenticated','consultant@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Consultant","last_name":"User","title":"Senior Software Engineer","department":"Engineering"}',
    now(), now()
  );

-- Admin role
INSERT INTO public.admin_members (user_id)
VALUES ('8d2b0f3e-4b1a-4b8a-8f0a-3b1e7b0a9b1c');

-- Canonical skills
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

-- Assign skills
INSERT INTO public.profile_skills (profile_id, skill_id, proficiency, years)
SELECT
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  s.id,
  (3 + floor(random() * 3))::smallint,
  (5 + floor(random() * 6))::numeric(4,1)
FROM public.skills s
WHERE s.name IN ('React','Next.js','TypeScript','Node.js','PostgreSQL','Supabase');

-- Availability (next 6 months)
INSERT INTO public.availability_months (profile_id, month, hours_available, hours_committed)
SELECT
  '9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  date_trunc('month', generate_series(now(), now() + interval '5 months', '1 month'))::date,
  160,
  (floor(random() * 80))::int;

-- Experience
INSERT INTO public.experiences (profile_id, org, role, start_date, end_date, type, description) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','Tech Solutions Inc.','Lead Developer','2018-01-15','2023-12-31','job','Led a team of 5 developers in building a new e-commerce platform from scratch using Next.js and GraphQL.'),
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','Web Innovators','Frontend Developer','2015-06-01','2017-12-31','job','Developed and maintained several client websites using React and Redux.');

-- Education
INSERT INTO public.educations (profile_id, institution, program, degree_level, start_year, end_year) VALUES
  ('9e0b1f2a-3c4d-5e6f-7a8b-9c0d1e2f3a4b','University of Technology','Computer Science','BSc',2011,2014);
