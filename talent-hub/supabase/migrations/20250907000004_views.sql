-- Views you'll want



-- v_availability_current (for staffing dashboards): next 3–6 months with computed free hours.
CREATE VIEW v_availability_current AS
SELECT
  profile_id,
  month,
  hours_available,
  hours_committed,
  (hours_available - hours_committed) as hours_free,
  status
FROM availability_months
WHERE month >= date_trunc('month', now()) AND month < date_trunc('month', now()) + interval '6 months';

-- v_profile_completeness (to drive nudges).
CREATE VIEW v_profile_completeness AS
SELECT
  id,
  (
    (CASE WHEN first_name IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN last_name IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN title IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN linkedin_url IS NOT NULL THEN 1 ELSE 0 END)
  ) / 5.0 * 100 AS completeness_percentage
FROM profiles;
