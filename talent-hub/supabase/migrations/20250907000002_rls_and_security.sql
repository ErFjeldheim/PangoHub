-- Canonical RLS & security helpers
-- - Hardened admin helper (SECURITY DEFINER)
-- - Invite verification function (SECURITY DEFINER)
-- - Minimal RLS policies (idempotent via DROP POLICY IF EXISTS)
--
-- Requirements:
--   - Tables: profiles, profile_skills, compensation, invitations
--   - Extension: pgcrypto (for digest in verify_invitation)

-- 0) Extensions ----------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Helpers -------------------------------------------------------------------

-- Admin check: source of truth is public.admin_members
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

-- Invitation verification via token (no direct table reads required by clients)
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
    AND token_hash = encode(digest(p_token, 'sha256'), 'hex')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_invitation(citext, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_invitation(citext, text) TO anon, authenticated;

-- 2) Row Level Security --------------------------------------------------------

-- Enable RLS (safe to run repeatedly)
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations         ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to keep re-runs deterministic
DROP POLICY IF EXISTS profiles_select           ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self      ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin     ON public.profiles;

DROP POLICY IF EXISTS profile_skills_rw_self    ON public.profile_skills;
DROP POLICY IF EXISTS profile_skills_admin      ON public.profile_skills;

DROP POLICY IF EXISTS compensation_admin        ON public.compensation;

DROP POLICY IF EXISTS invitations_admin_only    ON public.invitations;

-- Profiles: readable by all authenticated; updates by owner or admin
CREATE POLICY profiles_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_admin
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Profile skills: self RW; admins full control
CREATE POLICY profile_skills_rw_self
  ON public.profile_skills FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY profile_skills_admin
  ON public.profile_skills FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Compensation: admin only
CREATE POLICY compensation_admin
  ON public.compensation FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Invitations: admin only (public validation goes through verify_invitation())
CREATE POLICY invitations_admin_only
  ON public.invitations FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
