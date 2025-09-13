-- Kill the view that joins auth.users (not visible to authenticated)
DROP VIEW IF EXISTS v_profiles_with_email;

