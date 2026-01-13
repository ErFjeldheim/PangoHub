-- 20251006_accept_invitation.sql
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_email  citext,
  p_token  text,
  p_user_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  -- Verify + lock the invite
  SELECT role
    INTO v_role
  FROM public.invitations
  WHERE email = p_email
    AND accepted_at IS NULL
    AND expires_at > now()
    AND token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Mark accepted (and optionally record the user id if you have that column)
  UPDATE public.invitations
     SET accepted_at = now()
     -- , accepted_with_user_id = p_user_id  -- <- uncomment only if this column exists
   WHERE email = p_email
     AND accepted_at IS NULL
     AND expires_at > now()
     AND token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');

  -- Grant admin if the invite was for admin
  IF v_role = 'admin' THEN
    INSERT INTO public.admin_members(user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(citext,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation(citext,text,uuid) TO anon, authenticated;
