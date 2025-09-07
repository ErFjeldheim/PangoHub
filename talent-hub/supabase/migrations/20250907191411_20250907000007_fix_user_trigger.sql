-- 20250907000007_fix_user_trigger.sql

-- 1) Drop old trigger & function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2) Recreate with new schema (no profiles.email, no profiles.role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, first_name, last_name, title, department, bio, phone, location,
    linkedin_url, github_url, portfolio_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'title',''),
    NULLIF(NEW.raw_user_meta_data ->> 'department',''),
    NULLIF(NEW.raw_user_meta_data ->> 'bio',''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone',''),
    NULLIF(NEW.raw_user_meta_data ->> 'location',''),
    NULLIF(NEW.raw_user_meta_data ->> 'linkedin_url',''),
    NULLIF(NEW.raw_user_meta_data ->> 'github_url',''),
    NULLIF(NEW.raw_user_meta_data ->> 'portfolio_url','')
  )
  ON CONFLICT (id) DO NOTHING;

  -- This is a security risk and the cause of the login error.
  -- The authenticator role does not have permission to update auth.users.
  -- UPDATE auth.users
  -- SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data ->> 'role', 'consultant'))
  -- WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- 3) Recreate trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
