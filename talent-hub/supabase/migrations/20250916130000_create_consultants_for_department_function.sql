CREATE OR REPLACE FUNCTION get_consultants_for_department(p_department_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  title TEXT,
  email TEXT
)
LANGUAGE sql STABLE AS $$
  SELECT
    p.id,
    p.display_name,
    p.title,
    v.email
  FROM
    profiles_departments pd
  JOIN
    profiles p ON pd.profile_id = p.id
  LEFT JOIN
    v_profiles_with_email v ON pd.profile_id = v.id
  WHERE
    pd.department_id = p_department_id;
$$;
