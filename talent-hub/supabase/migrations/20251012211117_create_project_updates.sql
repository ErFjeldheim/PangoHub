-- 1) Project owner
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 2) Updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  title text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_project_updates_project_created
  ON project_updates (project_id, created_at DESC);
