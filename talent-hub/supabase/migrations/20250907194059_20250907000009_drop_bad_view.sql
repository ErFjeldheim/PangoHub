-- Kill the view that joins auth.users (not visible to authenticated)
DROP VIEW IF EXISTS v_profiles_with_email;

-- If you need email for admin screens, expose it via a SECURITY DEFINER RPC instead:
CREATE OR REPLACE FUNCTION public.admin_profiles_with_email()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  title text,
  department text,
  bio text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  created_at timestamptz,
  updated_at timestamptz,
  display_name text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.first_name, p.last_name, p.title, p.department, p.bio, p.phone, p.location,
    p.linkedin_url, p.github_url, p.portfolio_url, p.created_at, p.updated_at, p.display_name,
    u.email
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE public.is_admin(auth.uid());  -- guard: only admins get data
$$;

REVOKE ALL ON FUNCTION admin_profiles_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_profiles_with_email() TO authenticated, anon;
