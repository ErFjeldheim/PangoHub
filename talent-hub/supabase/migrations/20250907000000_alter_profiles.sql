ALTER TABLE public.profiles
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  ADD COLUMN display_name text GENERATED ALWAYS AS (
    trim(both ' ' from coalesce(first_name,'') || ' ' || coalesce(last_name,''))
  ) STORED;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;