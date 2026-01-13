-- Departments + M2M (final form)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles_departments (
  profile_id    UUID NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  is_primary    BOOLEAN NOT NULL DEFAULT TRUE,
  role          TEXT,
  since         DATE DEFAULT current_date,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, department_id)
);

-- updated_at triggers
CREATE TRIGGER trg_departments_set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_profiles_departments_set_updated_at
  BEFORE UPDATE ON public.profiles_departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Invariant: leader must be a member
CREATE OR REPLACE FUNCTION public.ensure_leader_is_member()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.leader_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles_departments pd
    WHERE pd.profile_id = NEW.leader_profile_id
      AND pd.department_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Leader must be a member of the department';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_departments_leader_check ON public.departments;
CREATE TRIGGER trg_departments_leader_check
  BEFORE INSERT OR UPDATE OF leader_profile_id ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.ensure_leader_is_member();

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_departments_profile
  ON public.profiles_departments(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_departments_department
  ON public.profiles_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_name_ci
  ON public.departments (lower(name));

-- RLS enabled (policies are defined centrally later)
ALTER TABLE public.departments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_departments ENABLE ROW LEVEL SECURITY;
