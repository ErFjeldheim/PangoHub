-- Migration from your current prototype

-- 1. Backfill skills
-- Seed skills from distinct UNNEST of profiles.skills.
INSERT INTO skills(name)
SELECT DISTINCT s FROM public.profiles, unnest(coalesce(skills,'{}'::text[])) AS s
ON CONFLICT (name) DO NOTHING;

-- Insert into profile_skills with default proficiency (e.g., 3) for now.
INSERT INTO profile_skills(profile_id, skill_id, proficiency)
SELECT p.id, sk.id, 3
FROM public.profiles p
CROSS JOIN LATERAL unnest(coalesce(p.skills,'{}'::text[])) sname
JOIN skills sk ON sk.name = sname;

-- 2. Move pay data
INSERT INTO compensation(profile_id, hourly_rate)
SELECT id, hourly_rate FROM public.profiles WHERE hourly_rate IS NOT NULL;

-- 3. Introduce availability
-- Create availability_months and seed next 6 months with a sane default.
INSERT INTO availability_months (profile_id, month, hours_available)
SELECT id, date_trunc('month', generate_series(now(), now() + interval '5 months', '1 month')), 160
FROM public.profiles;

-- 4. Populate new invitations table
-- Copy data and create a placeholder hash
INSERT INTO invitations (id, email, role, invited_by, token_hash, expires_at, accepted_at, created_at)
SELECT id, email, role, invited_by, encode(digest(email || created_at::text, 'sha256'), 'hex'), expires_at, accepted_at, created_at
FROM old_invitations;

-- Drop the old table
DROP TABLE old_invitations;

-- 5. Drop old columns from profiles table

ALTER TABLE public.profiles DROP COLUMN IF EXISTS skills;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS experience_years;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hourly_rate;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS availability_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
