-- Admin membership (source of truth)
CREATE TABLE IF NOT EXISTS public.admin_members (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills (canonical)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name CITEXT UNIQUE NOT NULL,
  aliases TEXT[] DEFAULT '{}'::text[]
);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS skills_aliases_gin ON public.skills USING gin (aliases);
CREATE INDEX IF NOT EXISTS skills_name_trgm ON public.skills USING gin (name gin_trgm_ops);

-- Profile skills (has)
CREATE TABLE IF NOT EXISTS public.profile_skills (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id   UUID NOT NULL REFERENCES public.skills(id)   ON DELETE RESTRICT,
  proficiency SMALLINT CHECK (proficiency BETWEEN 1 AND 5),
  years NUMERIC(4,1),
  PRIMARY KEY (profile_id, skill_id)
);

-- Skill interests (wants)
CREATE TABLE IF NOT EXISTS public.profile_skill_interests (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id   UUID NOT NULL REFERENCES public.skills(id)   ON DELETE RESTRICT,
  priority SMALLINT CHECK (priority BETWEEN 1 AND 5),
  PRIMARY KEY (profile_id, skill_id)
);

-- Companies + interests (optional)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name CITEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS public.profile_company_interests (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  PRIMARY KEY (profile_id, company_id)
);

-- Availability
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
        CREATE TYPE availability_status AS ENUM ('available','partly','busy','unavailable');
    END IF;
END
$$;
CREATE TABLE IF NOT EXISTS public.availability_months (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  hours_available INT NOT NULL CHECK (hours_available >= 0),
  hours_committed INT NOT NULL DEFAULT 0 CHECK (hours_committed >= 0),
  notes TEXT,
  status availability_status GENERATED ALWAYS AS (
    CASE
      WHEN hours_available - hours_committed >= 80 THEN 'available'::availability_status
      WHEN hours_available - hours_committed > 0  THEN 'partly'::availability_status
      WHEN hours_committed >= hours_available      THEN 'busy'::availability_status
      ELSE 'unavailable'::availability_status
    END
  ) STORED,
  PRIMARY KEY (profile_id, month)
);
CREATE INDEX IF NOT EXISTS avail_month_idx ON public.availability_months (month);

-- Clients/Projects
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name CITEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE, end_date DATE,
  status TEXT CHECK (status IN ('planned','active','completed','on_hold')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT,
  start_date DATE, end_date DATE,
  hours NUMERIC(6,1),
  contribution TEXT,
  PRIMARY KEY (project_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.project_skills (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id   UUID REFERENCES public.skills(id)   ON DELETE RESTRICT,
  PRIMARY KEY (project_id, skill_id)
);

-- Compensation (admin-only)
CREATE TABLE IF NOT EXISTS public.compensation (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NOK',
  valid_from DATE DEFAULT current_date
);

-- Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org         text NOT NULL,
  role        text NOT NULL,
  start_date  date NOT NULL,
  end_date    date,
  type        text NOT NULL CHECK (type IN ('job','contract','volunteer','education','other')),
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_experiences_set_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Educations
CREATE TABLE IF NOT EXISTS public.educations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution   text NOT NULL,
  program       text,
  degree_level  text,
  start_year    int,
  end_year      int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_educations_set_updated_at
  BEFORE UPDATE ON public.educations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();