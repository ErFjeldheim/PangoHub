-- Per-department required hours on a project
CREATE TABLE IF NOT EXISTS public.project_department_hours (
  project_id    uuid NOT NULL REFERENCES public.projects(id)    ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  hours_required int NOT NULL CHECK (hours_required >= 0),
  PRIMARY KEY (project_id, department_id)
);

ALTER TABLE public.project_department_hours ENABLE ROW LEVEL SECURITY;

-- Everyone signed in can read (consultants need to view it)
CREATE POLICY pdh_read_all
  ON public.project_department_hours
  FOR SELECT TO authenticated
  USING (TRUE);

-- Only admins can write
CREATE POLICY pdh_admin_write
  ON public.project_department_hours
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
