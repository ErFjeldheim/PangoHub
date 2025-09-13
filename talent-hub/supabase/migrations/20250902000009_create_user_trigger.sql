-- Create profile on auth.users insert + optional department membership

-- Safety: drop any prior version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dep_name TEXT;
  dep_id   UUID;
BEGIN
  INSERT INTO public.profiles (
    id, first_name, last_name, title, bio, phone, location,
    linkedin_url, github_url, portfolio_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'title',''),
    NULLIF(NEW.raw_user_meta_data ->> 'bio',''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone',''),
    NULLIF(NEW.raw_user_meta_data ->> 'location',''),
    NULLIF(NEW.raw_user_meta_data ->> 'linkedin_url',''),
    NULLIF(NEW.raw_user_meta_data ->> 'github_url',''),
    NULLIF(NEW.raw_user_meta_data ->> 'portfolio_url','')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Optional initial department from metadata
  dep_name := NULLIF(trim(NEW.raw_user_meta_data ->> 'department'), '');
  IF dep_name IS NOT NULL THEN
    INSERT INTO public.departments(name) VALUES (dep_name)
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO dep_id FROM public.departments WHERE name = dep_name;

    IF dep_id IS NOT NULL THEN
      INSERT INTO public.profiles_departments(profile_id, department_id, is_primary)
      VALUES (NEW.id, dep_id, TRUE)
      ON CONFLICT (profile_id, department_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
