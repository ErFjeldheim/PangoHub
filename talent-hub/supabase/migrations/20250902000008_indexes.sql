-- Useful secondary indexes
CREATE INDEX IF NOT EXISTS profile_skills_skill_id_proficiency_idx
  ON public.profile_skills (skill_id, proficiency);

CREATE INDEX IF NOT EXISTS project_members_profile_id_idx ON public.project_members (profile_id);
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON public.project_members (project_id);
