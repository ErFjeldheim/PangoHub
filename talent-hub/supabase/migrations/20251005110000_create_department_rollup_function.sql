-- 1) A stable function to list department rollups
CREATE OR REPLACE FUNCTION public.get_department_rollup()
RETURNS TABLE (
  department_id uuid,
  department_name text,
  leader_name text,
  total_consultants int,
  available_consultants int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH dept AS (
    SELECT d.id, d.name,
           (SELECT pr.display_name
            FROM profiles pr
            WHERE pr.id = d.leader_profile_id) AS leader_name
    FROM departments d
  ),
  members AS (
    SELECT pd.department_id, pd.profile_id
    FROM profiles_departments pd
  ),
  avail_now AS (
    SELECT a.profile_id,
           CASE
             WHEN (a.hours_available - a.hours_committed) >= 80 THEN 'available'
             WHEN (a.hours_available - a.hours_committed) > 0 THEN 'partially_available'
             ELSE 'unavailable'
           END AS status
    FROM availability_months a
    WHERE a.month = date_trunc('month', now())::date
  )
  SELECT
    d.id,
    d.name,
    d.leader_name,
    COUNT(m.profile_id)::int AS total_consultants,
    COALESCE(SUM(CASE WHEN an.status = 'available' THEN 1 ELSE 0 END), 0)::int AS available_consultants
  FROM dept d
  LEFT JOIN members m ON m.department_id = d.id
  LEFT JOIN avail_now an ON an.profile_id = m.profile_id
  GROUP BY d.id, d.name, d.leader_name
  ORDER BY d.name;
$$;

-- Only allow authenticated to call it (no arbitrary public)
REVOKE ALL ON FUNCTION public.get_department_rollup() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_department_rollup() TO authenticated;