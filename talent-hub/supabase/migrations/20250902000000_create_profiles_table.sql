-- Base profiles table (already "final form": no email/role/department columns)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  title      TEXT,
  bio        TEXT,
  phone      TEXT,
  location   TEXT,
  linkedin_url TEXT,
  github_url   TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- nice display field
  display_name TEXT GENERATED ALWAYS AS (
    trim(both ' ' from coalesce(first_name,'') || ' ' || coalesce(last_name,''))
  ) STORED
);

-- Enable RLS (policies are defined later)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
