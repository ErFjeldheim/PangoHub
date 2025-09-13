-- Departments normalization + M2M for profiles
-- Forward:
--   1) Create departments + profiles_departments
--   2) Backfill from profiles.department (text)
--   3) Leader support (FK + invariant trigger)
--   4) Enable RLS + minimal policies (using public.is_admin())
--   5) Drop legacy profiles.department
--
-- Backward (manual if needed):
--   1) ALTER TABLE profiles ADD COLUMN department text;
--   2) UPDATE profiles p SET department = d.name
--      FROM profiles_departments pd JOIN departments d ON d.id = pd.department_id
--      WHERE pd.profile_id = p.id AND pd.is_primary IS TRUE;
--   3) DROP VIEW IF EXISTS v_profiles_with_department;
--   4) DROP TABLE profiles_departments;
--   5) DROP TABLE departments;

BEGIN;

-- 1) Core tables ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  leader_profile_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_unique UNIQUE (name)
);

-- Leader FK (nullable; if leader gets deleted, clear the leader)
-- (Postgres has no IF NOT EXISTS for constraints; migrations are linear, so this is fine.)
ALTER TABLE public.departments
  ADD CONSTRAINT departments_leader_fk
  FOREIGN KEY (leader_profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.profiles_departments (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT TRUE,
  role text,
  since date DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, department_id)
);

-- 2) Updated-at triggers ----------------------------------------------------

-- Reuse the existing helper: public.update_updated_at_column()
CREATE TRIGGER trg_departments_set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_profiles_departments_set_updated_at
  BEFORE UPDATE ON public.profiles_departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Business invariant: Leader must be a member of the department ----------

CREATE OR REPLACE FUNCTION public.ensure_leader_is_member()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.leader_profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles_departments pd
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

-- 4) Indexes ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_departments_profile
  ON public.profiles_departments(profile_id);

CREATE INDEX IF NOT EXISTS idx_profiles_departments_department
  ON public.profiles_departments(department_id);

CREATE INDEX IF NOT EXISTS idx_departments_name_ci
  ON public.departments (lower(name));

-- 5) Backfill from profiles.department (text) -------------------------------

-- Seed unique departments from existing text values
WITH distinct_deps AS (
  SELECT DISTINCT trim(both FROM department) AS name
  FROM public.profiles
  WHERE department IS NOT NULL AND trim(department) <> ''
)
INSERT INTO public.departments(name)
SELECT name FROM distinct_deps
ON CONFLICT (name) DO NOTHING;

-- Link profiles to departments (primary membership)
INSERT INTO public.profiles_departments(profile_id, department_id, is_primary)
SELECT p.id, d.id, TRUE
FROM public.profiles p
JOIN public.departments d ON d.name = trim(p.department)
WHERE p.department IS NOT NULL AND trim(p.department) <> ''
ON CONFLICT (profile_id, department_id) DO NOTHING;

-- 6) RLS + minimal policies (use public.is_admin()) -------------------------

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_departments ENABLE ROW LEVEL SECURITY;

-- Clean up in case of re-runs in local/staging
DROP POLICY IF EXISTS "departments_read_all" ON public.departments;
DROP POLICY IF EXISTS "departments_admin_manage" ON public.departments;
DROP POLICY IF EXISTS "profiles_departments_read" ON public.profiles_departments;
DROP POLICY IF EXISTS "profiles_departments_self_join" ON public.profiles_departments;
DROP POLICY IF EXISTS "profiles_departments_self_leave" ON public.profiles_departments;

-- Read for all authenticated users
CREATE POLICY "departments_read_all"
  ON public.departments FOR SELECT
  TO authenticated
  USING (TRUE);

-- Admin manage everything (via helper function)
CREATE POLICY "departments_admin_manage"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Join table: self or admin
CREATE POLICY "profiles_departments_read"
  ON public.profiles_departments FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "profiles_departments_self_join"
  ON public.profiles_departments FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "profiles_departments_self_leave"
  ON public.profiles_departments FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- 7) Compatibility view (mimic the old single department) -------------------

CREATE OR REPLACE VIEW public.v_profiles_with_department AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.title,
  p.bio,
  p.phone,
  p.location,
  p.linkedin_url,
  p.github_url,
  p.portfolio_url,
  p.created_at,
  p.updated_at,
  p.display_name,
  (
    SELECT d.name
    FROM public.profiles_departments pd
    JOIN public.departments d ON d.id = pd.department_id
    WHERE pd.profile_id = p.id
    ORDER BY pd.is_primary DESC, d.name ASC
    LIMIT 1
  ) AS primary_department
FROM public.profiles p;


-- 8) Drop the legacy text column -------------------------------------------

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS department;

COMMIT;
