-- Availability dashboard view
CREATE OR REPLACE VIEW public.v_availability_current AS
SELECT
  profile_id,
  month,
  hours_available,
  hours_committed,
  (hours_available - hours_committed) AS hours_free,
  status
FROM public.availability_months
WHERE month >= date_trunc('month', now())
  AND month <  date_trunc('month', now()) + interval '6 months';

-- Profile completeness view
CREATE OR REPLACE VIEW public.v_profile_completeness AS
SELECT
  id,
  (
    (CASE WHEN first_name  IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN last_name   IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN title       IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN bio         IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN linkedin_url IS NOT NULL THEN 1 ELSE 0 END)
  ) / 5.0 * 100 AS completeness_percentage
FROM public.profiles;

-- Compatibility helper: expose the "primary" department
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



-- Profiles with email 
CREATE OR REPLACE VIEW public.v_profiles_with_email AS
SELECT
  p.id, p.first_name, p.last_name, p.title, p.bio, p.phone, p.location,
  p.linkedin_url, p.github_url, p.portfolio_url,
  p.created_at, p.updated_at, p.display_name,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = auth.uid();  -- <-- hard guard

GRANT SELECT ON public.v_profiles_with_email TO authenticated;
REVOKE ALL ON public.v_profiles_with_email FROM anon;
