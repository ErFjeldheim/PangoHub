-- Indexing checklist

-- profile_skills (skill_id, proficiency) for skill searches.
CREATE INDEX profile_skills_skill_id_proficiency_idx ON profile_skills (skill_id, proficiency);

-- project_members (profile_id) and (project_id) for both directions.
CREATE INDEX project_members_profile_id_idx ON project_members (profile_id);
CREATE INDEX project_members_project_id_idx ON project_members (project_id);

-- skills.name unique citext + pg_trgm index for fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX skills_name_trgm ON skills USING gin (name gin_trgm_ops);
