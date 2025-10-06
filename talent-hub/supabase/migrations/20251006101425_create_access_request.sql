-- 20251006XXXXXX_create_access_requests.sql
CREATE TABLE IF NOT EXISTS public.access_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       citext NOT NULL,
  name        text,
  message     text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- RLS: anyone (anon/auth) can create a request
CREATE POLICY access_requests_insert_anyone
  ON public.access_requests FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- RLS: admins can read/update/manage
CREATE POLICY access_requests_admin_manage
  ON public.access_requests FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
