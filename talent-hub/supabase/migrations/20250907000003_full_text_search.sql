CREATE MATERIALIZED VIEW consultant_search AS
SELECT
  p.id,
  setweight(to_tsvector('simple', coalesce(p.display_name,'')), 'A') ||
  setweight(to_tsvector('simple', coalesce(p.bio,'')), 'C') ||
  setweight(to_tsvector('simple', string_agg(DISTINCT s.name::text, ' ')), 'B') ||
  setweight(to_tsvector('simple', string_agg(DISTINCT prj.name, ' ')), 'B')
  AS doc
FROM profiles p
LEFT JOIN profile_skills ps ON ps.profile_id = p.id
LEFT JOIN skills s ON s.id = ps.skill_id
LEFT JOIN project_members pm ON pm.profile_id = p.id
LEFT JOIN projects prj ON prj.id = pm.project_id
GROUP BY p.id;

CREATE INDEX consultant_search_gin ON consultant_search USING gin (doc);
