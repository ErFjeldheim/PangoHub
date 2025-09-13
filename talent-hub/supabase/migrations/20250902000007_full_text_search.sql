-- Simple FTS materialized view for consultants
CREATE MATERIALIZED VIEW public.consultant_search AS
SELECT
  p.id,
  setweight(to_tsvector('simple', coalesce(p.display_name,'')), 'A') ||
  setweight(to_tsvector('simple', coalesce(p.bio,'')), 'C') ||
  setweight(to_tsvector('simple', coalesce(string_agg(DISTINCT s.name::text, ' '),'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(string_agg(DISTINCT prj.name, ' '),'')), 'B')
  AS doc
FROM public.profiles p
LEFT JOIN public.profile_skills ps ON ps.profile_id = p.id
LEFT JOIN public.skills        s  ON s.id = ps.skill_id
LEFT JOIN public.project_members pm ON pm.profile_id = p.id
LEFT JOIN public.projects      prj ON prj.id = pm.project_id
GROUP BY p.id;

CREATE INDEX IF NOT EXISTS consultant_search_gin ON public.consultant_search USING gin (doc);
