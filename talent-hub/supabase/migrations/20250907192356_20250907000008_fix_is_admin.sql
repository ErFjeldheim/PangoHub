-- Make is_admin work under RLS by running with owner privileges
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_members WHERE user_id = uid);
$$;

-- Lock down who can invoke it
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;

-- (Optional harden admin_members)
-- REVOKE ALL ON TABLE public.admin_members FROM PUBLIC, anon, authenticated;
