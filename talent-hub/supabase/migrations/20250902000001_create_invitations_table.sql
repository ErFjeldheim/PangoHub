-- Secure invitations (citext + token_hash)
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  role  TEXT   NOT NULL CHECK (role IN ('admin','consultant')) DEFAULT 'consultant',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;


-- Add FK to profiles instead of auth.users
ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_invited_by_fkey;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_invited_by_profiles_fkey
  FOREIGN KEY (invited_by)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Optional index for faster joins / lookups
CREATE INDEX IF NOT EXISTS invitations_invited_by_idx
  ON public.invitations (invited_by);
