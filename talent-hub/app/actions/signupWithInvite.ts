// app/actions/signupWithInvite.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function signupWithInvite(opts: {
  email: string;
  password: string;
  token: string;
  first_name?: string;
  last_name?: string;
}) {
  const supabase = await createClient();

  const email = opts.email.trim();
  const token = opts.token.trim();

  // 1) Validate invitation (doesn't expose table due to RLS)
  const { data: invite, error: vErr } = await supabase
    .rpc("verify_invitation", { p_email: email, p_token: token })
    .single();

  if (vErr || !invite) {
    throw new Error("Invalid or expired invitation.");
  }

  // 2) Create the auth user (profile row is created by trigger)
  const { data: signUp, error: sErr } = await supabase.auth.signUp({
    email,
    password: opts.password,
    options: {
      data: {
        first_name: opts.first_name ?? "",
        last_name: opts.last_name ?? "",
      },
    },
  });
  if (sErr) throw new Error(sErr.message);

  // 3) Mark invitation accepted + grant admin if needed
  const userId = signUp.user?.id;
  if (userId) {
    const { error: aErr } = await supabase.rpc("accept_invitation", {
      p_email: email,
      p_token: token,
      p_user_id: userId,
    });
    if (aErr) throw new Error(aErr.message);
  }

  // If email confirmations are enabled, the user may need to confirm email before session is active.
  return { ok: true };
}
