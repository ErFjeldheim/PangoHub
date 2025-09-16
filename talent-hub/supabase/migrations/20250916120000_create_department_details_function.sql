CREATE OR REPLACE FUNCTION get_departments_with_details()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  consultant_count bigint,
  leader_name text
)
LANGUAGE sql STABLE AS $$
  SELECT
    d.id,
    d.name,
    d.description,
    (SELECT COUNT(*) FROM profiles_departments pd WHERE pd.department_id = d.id) as consultant_count,
    p.display_name as leader_name
  FROM
    departments d
  LEFT JOIN
    profiles p ON d.leader_profile_id = p.id;
$$;
