-- v_project_overview: one row per project, with client, counts, and departments
CREATE OR REPLACE VIEW public.v_project_overview AS
SELECT
  p.id,
  p.name,
  p.description,
  p.status,              -- planned | active | completed | on_hold
  p.start_date,
  p.end_date,
  c.name AS client_name,
  COUNT(DISTINCT pm.profile_id)            AS consultant_count,
  ARRAY_REMOVE(
    ARRAY_AGG(DISTINCT d.name ORDER BY d.name),
    NULL
  )                                         AS departments,
  MIN(pm.start_date)                         AS first_member_start,
  MAX(pm.end_date)                           AS last_member_end,
  (p.status = 'active')                      AS is_active,
  CASE
    WHEN p.start_date IS NOT NULL AND p.end_date IS NOT NULL
      THEN GREATEST((p.end_date - p.start_date), 0)
    ELSE NULL
  END                                        AS duration_days
FROM public.projects p
LEFT JOIN public.clients c           ON c.id = p.client_id
LEFT JOIN public.project_members pm  ON pm.project_id = p.id
LEFT JOIN public.profiles_departments pd ON pd.profile_id = pm.profile_id
LEFT JOIN public.departments d       ON d.id = pd.department_id
GROUP BY p.id, c.name;

-- Reasonable permissions: let authenticated users read the view
GRANT SELECT ON public.v_project_overview TO authenticated;
REVOKE ALL ON public.v_project_overview FROM anon;
