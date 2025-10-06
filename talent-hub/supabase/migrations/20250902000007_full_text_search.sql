create extension if not exists unaccent;
-- rebuild MV once:
drop materialized view if exists public.consultant_search;
create materialized view public.consultant_search as
select
  p.id,
  setweight(to_tsvector('simple', unaccent(coalesce(p.display_name,''))), 'A') ||
  setweight(to_tsvector('simple', unaccent(coalesce(p.bio,''))), 'C') ||
  setweight(to_tsvector('simple', unaccent(coalesce(string_agg(distinct s.name::text, ' '),''))), 'B') ||
  setweight(to_tsvector('simple', unaccent(coalesce(string_agg(distinct prj.name, ' '),''))), 'B')
  as doc
from public.profiles p
left join public.profile_skills ps on ps.profile_id = p.id
left join public.skills s on s.id = ps.skill_id
left join public.project_members pm on pm.profile_id = p.id
left join public.projects prj on prj.id = pm.project_id
group by p.id;

create index if not exists consultant_search_gin on public.consultant_search using gin (doc);

CREATE UNIQUE INDEX IF NOT EXISTS consultant_search_id_uidx
  ON public.consultant_search (id);