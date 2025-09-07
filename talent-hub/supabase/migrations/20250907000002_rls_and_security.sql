-- No public RLS for SELECT. Validation happens through a SECURITY DEFINER fn:

CREATE OR REPLACE FUNCTION public.verify_invitation(p_email citext, p_token text)
RETURNS invitations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM invitations
  WHERE email = p_email
    AND accepted_at IS NULL
    AND expires_at > now()
    AND token_hash = encode(digest(p_token, 'sha256'), 'hex')
  LIMIT 1;
$$;

-- RLS (clean, maintainable)

-- Define a helper:

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM admin_members WHERE user_id = uid);
$$;


-- Policies (examples):
-- Drop old policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "invitations_admin_only" ON public.old_invitations;
DROP POLICY IF EXISTS "invitations_public_token_read" ON public.old_invitations;


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (true); -- everyone can view basic profiles
CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_skills_rw_self ON profile_skills
  USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
CREATE POLICY profile_skills_admin ON profile_skills
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE compensation ENABLE ROW LEVEL SECURITY;
CREATE POLICY compensation_admin ON compensation
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitations_admin_only ON public.invitations
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
