-- Canonical helpers + RLS (one place)

-- schema visibility (safe; no data grants)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Admin helper (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_members WHERE user_id = uid);
$$;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;

-- Invitation validator (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.verify_invitation(p_email citext, p_token text)
RETURNS public.invitations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.invitations
  WHERE email = p_email
    AND accepted_at IS NULL
    AND expires_at > now()
    AND token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_invitation(citext,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_invitation(citext,text) TO anon, authenticated;

-- RLS policies (deterministic: drop first)
DROP POLICY IF EXISTS profiles_select        ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self   ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin  ON public.profiles;

DROP POLICY IF EXISTS profile_skills_rw_self ON public.profile_skills;
DROP POLICY IF EXISTS profile_skills_admin   ON public.profile_skills;

DROP POLICY IF EXISTS compensation_admin     ON public.compensation;

DROP POLICY IF EXISTS invitations_admin_only ON public.invitations;

DROP POLICY IF EXISTS departments_read_all   ON public.departments;
DROP POLICY IF EXISTS departments_admin_manage ON public.departments;

DROP POLICY IF EXISTS profiles_departments_read      ON public.profiles_departments;
DROP POLICY IF EXISTS profiles_departments_self_join ON public.profiles_departments;
DROP POLICY IF EXISTS profiles_departments_self_leave ON public.profiles_departments;

-- Profiles: everyone (auth) can read; owner/admin can update
CREATE POLICY profiles_select
  ON public.profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_admin
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Profile skills
CREATE POLICY profile_skills_rw_self
  ON public.profile_skills FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY profile_skills_admin
  ON public.profile_skills FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Compensation (admin-only)
CREATE POLICY compensation_admin
  ON public.compensation FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Invitations (admin-only; public validation goes via verify_invitation)
CREATE POLICY invitations_admin_only
  ON public.invitations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Departments + memberships
CREATE POLICY departments_read_all
  ON public.departments FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY departments_admin_manage
  ON public.departments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY profiles_departments_read
  ON public.profiles_departments FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY profiles_departments_self_join
  ON public.profiles_departments FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY profiles_departments_self_leave
  ON public.profiles_departments FOR DELETE TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));


-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for deterministic re-runs
DROP POLICY IF EXISTS experiences_select       ON public.experiences;
DROP POLICY IF EXISTS experiences_write_self   ON public.experiences;
DROP POLICY IF EXISTS experiences_write_admin  ON public.experiences;

DROP POLICY IF EXISTS educations_select        ON public.educations;
DROP POLICY IF EXISTS educations_write_self    ON public.educations;
DROP POLICY IF EXISTS educations_write_admin   ON public.educations;

-- Experiences: read for all authenticated; owner/admin write
CREATE POLICY experiences_select
  ON public.experiences FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY experiences_write_self
  ON public.experiences FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY experiences_write_admin
  ON public.experiences FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Educations: same model
CREATE POLICY educations_select
  ON public.educations FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY educations_write_self
  ON public.educations FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY educations_write_admin
  ON public.educations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
