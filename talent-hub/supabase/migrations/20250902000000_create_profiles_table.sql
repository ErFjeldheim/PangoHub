-- Create profiles table for consultant information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'consultant' CHECK (role IN ('admin', 'consultant')),
  title TEXT,
  department TEXT,
  skills TEXT[],
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  bio TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    (current_setting('request.jwt.claims', true)::jsonb ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR 
    (current_setting('request.jwt.claims', true)::jsonb ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles FOR DELETE
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
  );
