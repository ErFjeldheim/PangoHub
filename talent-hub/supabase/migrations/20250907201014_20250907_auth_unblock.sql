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

