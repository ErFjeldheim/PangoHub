ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS hours_required INT;

CREATE TABLE IF NOT EXISTS public.project_interest (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, profile_id)
);

ALTER TABLE public.project_interest ENABLE ROW LEVEL SECURITY;

-- Anyone signed-in can insert their own interest and read their own; admins can read all
CREATE POLICY pi_select_self_or_admin
  ON public.project_interest
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY pi_insert_self
  ON public.project_interest
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY pi_delete_self_or_admin
  ON public.project_interest
  FOR DELETE TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));
