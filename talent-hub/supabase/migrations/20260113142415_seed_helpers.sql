-- Seed helper functions (used by supabase/seed.sql)

CREATE OR REPLACE FUNCTION public.seed_param_date(key text)
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT CASE key
    WHEN 'month0'         THEN date_trunc('month', current_date)::date
    WHEN 'donation_start' THEN (date_trunc('month', current_date) - interval '4 months')::date
    WHEN 'city_start'     THEN (date_trunc('month', current_date) - interval '2 months')::date
    WHEN 'retail_start'   THEN (date_trunc('month', current_date) - interval '7 months')::date
    WHEN 'bench_start'    THEN (date_trunc('month', current_date) - interval '1 months')::date
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.seed_param_ts(key text)
RETURNS timestamp
LANGUAGE sql
STABLE
AS $$
  SELECT CASE key
    WHEN 'invite_expires' THEN (now() + interval '14 days')::timestamp
    ELSE NULL
  END;
$$;
