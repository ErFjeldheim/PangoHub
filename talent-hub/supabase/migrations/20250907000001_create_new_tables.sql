-- admins: source of truth for elevated rights
CREATE TABLE admin_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now()
);

-- Education & Experience
CREATE TABLE educations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution text NOT NULL,
  program text NOT NULL,
  degree_level text,       -- e.g., BSc/MSc
  current_year int,
  start_year int, end_year int
);

CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org text NOT NULL,
  role text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  type text CHECK (type IN ('job','internship','freelance')),
  description text
);

-- Skills & Interests
-- canonical skills
CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name citext UNIQUE NOT NULL,
  aliases text[] DEFAULT '{}'::text[]
);
CREATE INDEX skills_aliases_gin ON skills USING gin (aliases);

-- what a consultant *has*
CREATE TABLE profile_skills (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE RESTRICT,
  proficiency smallint CHECK (proficiency BETWEEN 1 AND 5),
  years numeric(4,1),
  PRIMARY KEY (profile_id, skill_id)
);

-- what a consultant *wants*
CREATE TABLE profile_skill_interests (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE RESTRICT,
  priority smallint CHECK (priority BETWEEN 1 AND 5),
  PRIMARY KEY (profile_id, skill_id)
);

-- optional: company interests
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name citext UNIQUE NOT NULL
);
CREATE TABLE profile_company_interests (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE RESTRICT,
  PRIMARY KEY (profile_id, company_id)
);

-- Availability (month-based capacity)
CREATE TYPE availability_status AS ENUM ('available','partly','busy','unavailable');

CREATE TABLE availability_months (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month date NOT NULL,                -- use first day of month
  hours_available int NOT NULL CHECK (hours_available >= 0),
  hours_committed int NOT NULL DEFAULT 0 CHECK (hours_committed >= 0),
  notes text,
  PRIMARY KEY (profile_id, month),
  status availability_status GENERATED ALWAYS AS (
    CASE
      WHEN hours_available - hours_committed >= 80 THEN 'available'::availability_status
      WHEN hours_available - hours_committed > 0 THEN 'partly'::availability_status
      WHEN hours_committed >= hours_available THEN 'busy'::availability_status
      ELSE 'unavailable'::availability_status
    END
  ) STORED
);
CREATE INDEX avail_month_idx ON availability_months (month);

-- Projects & Membership
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name citext UNIQUE NOT NULL
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  start_date date, end_date date,
  status text CHECK (status IN ('planned','active','completed','on_hold')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE project_members (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text,                                  -- project role (Dev, PM, etc.)
  start_date date, end_date date,
  hours numeric(6,1),
  contribution text,
  PRIMARY KEY (project_id, profile_id)
);

-- (Optional) tag a project with skills actually used
CREATE TABLE project_skills (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE RESTRICT,
  PRIMARY KEY (project_id, skill_id)
);

-- Compensation (admin-only)
CREATE TABLE compensation (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  hourly_rate numeric(10,2) NOT NULL,
  currency text DEFAULT 'NOK',
  valid_from date DEFAULT CURRENT_DATE
);

-- Rename the existing invitations table
ALTER TABLE public.invitations RENAME TO old_invitations;

-- Invitations (secure)
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin','consultant')) DEFAULT 'consultant',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
