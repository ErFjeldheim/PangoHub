-- Normalize nullable token columns; provide safe sanitizer
UPDATE auth.users SET confirmation_token = '' WHERE confirmation_token IS NULL;
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
UPDATE auth.users SET email_change_token_new = '' WHERE email_change_token_new IS NULL;
UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL;

CREATE OR REPLACE FUNCTION public.sanitize_auth_user_tokens(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE auth.users SET
    confirmation_token      = COALESCE(confirmation_token, ''),
    email_change            = COALESCE(email_change, ''),
    email_change_token_new  = COALESCE(email_change_token_new, ''),
    recovery_token          = COALESCE(recovery_token, '')
  WHERE id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.sanitize_auth_user_tokens(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sanitize_auth_user_tokens(uuid) TO anon, authenticated, service_role;
