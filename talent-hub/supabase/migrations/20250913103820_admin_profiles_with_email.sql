-- 20YYYYMMDDHHMMSS_admin_profiles_with_email.sql
CREATE OR REPLACE FUNCTION admin_profiles_with_email()
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
    p.id, p.first_name, p.last_name, p.title,
    (
      SELECT d.name
      FROM public.profiles_departments pd
      JOIN public.departments d ON d.id = pd.department_id
      WHERE pd.profile_id = p.id
      ORDER BY pd.is_primary DESC, d.name ASC
      LIMIT 1
    ) AS department,
    p.bio, p.phone, p.location,
    p.linkedin_url, p.github_url, p.portfolio_url,
    p.created_at, p.updated_at, p.display_name,
    u.email
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE public.is_admin(auth.uid());
$$;

REVOKE ALL ON FUNCTION admin_profiles_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_profiles_with_email() TO authenticated, anon;
