CREATE OR REPLACE FUNCTION get_aggregated_availability_for_department(p_department_id UUID)
RETURNS TABLE (
  month TEXT,
  total_hours_available BIGINT,
  total_hours_committed BIGINT,
  total_hours_free BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT
    to_char(am.month, 'YYYY-MM') AS month,
    SUM(am.hours_available) AS total_hours_available,
    SUM(am.hours_committed) AS total_hours_committed,
    SUM(am.hours_available - am.hours_committed) AS total_hours_free
  FROM
    availability_months am
  JOIN
    profiles_departments pd ON am.profile_id = pd.profile_id
  WHERE
    pd.department_id = p_department_id
    AND am.month >= date_trunc('month', now())
    AND am.month < date_trunc('month', now()) + interval '6 months'
  GROUP BY
    am.month
  ORDER BY
    am.month;
$$;
