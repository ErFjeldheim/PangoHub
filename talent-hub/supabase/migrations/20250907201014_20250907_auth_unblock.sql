-- 20250907_safe_auth_setup.sql

-- ✅ Let anon/authenticated introspect the *public* schema (no data granted).
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ✅ Make is_admin() safe for policies.
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

-- ❌ DO NOT touch grants/RLS on the auth schema (leave these out):
--   GRANT USAGE ON SCHEMA auth ...
--   ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
--   ...etc.

-- Optionally nuke any lingering view that referenced auth.* (harmless if absent).
DROP VIEW IF EXISTS public.v_profiles_with_email;
