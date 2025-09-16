CREATE OR REPLACE FUNCTION get_projects_for_department(p_department_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE
)
LANGUAGE sql STABLE AS $$
  SELECT DISTINCT
    p.id,
    p.name,
    p.description,
    p.start_date,
    p.end_date
  FROM
    projects p
  JOIN
    project_members pm ON p.id = pm.project_id
  JOIN
    profiles_departments pd ON pm.profile_id = pd.profile_id
  WHERE
    pd.department_id = p_department_id;
$$;
