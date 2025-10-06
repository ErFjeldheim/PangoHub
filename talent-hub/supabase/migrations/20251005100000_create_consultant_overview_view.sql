CREATE OR REPLACE VIEW public.v_consultant_overview AS
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
  am.status AS availability_status,
  (
    SELECT SUM(EXTRACT(YEAR FROM COALESCE(e.end_date, NOW())) - EXTRACT(YEAR FROM e.start_date))
    FROM experiences e
    WHERE e.profile_id = p.id
  ) AS experience_years
FROM
  profiles p
LEFT JOIN
  availability_months am ON p.id = am.profile_id AND am.month = date_trunc('month', now());

  

create or replace function public.search_consultants(
  q text,
  p_limit int default 10,
  p_offset int default 0
)
returns table (
  id uuid,
  display_name text,
  title text,
  availability_status text,
  rank real
)
language sql
stable
set search_path = public
as $$
  select
    v.id,
    v.display_name,
    v.title,
    coalesce(v.availability_status::text, 'unavailable') as availability_status,
    ts_rank(cs.doc, websearch_to_tsquery('simple', unaccent(q))) as rank
  from public.consultant_search cs
  join public.v_consultant_overview v on v.id = cs.id
  where websearch_to_tsquery('simple', unaccent(q)) @@ cs.doc
  order by rank desc, v.display_name asc
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_consultants(text,int,int) to authenticated;
