// lib/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpWithInvitation(formData: FormData) {
  const supabase = await createClient(); // ✅ await

  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!token) {
    return { error: { message: "Invalid invitation token" } };
  }

  // 1) Verify the invitation
  const { data: invitation, error: verificationError } = await supabase.rpc(
    "verify_invitation",
    { p_email: email, p_token: token }
  );

  if (verificationError || !invitation) {
    return { error: { message: "Invalid or expired invitation" } };
  }

  // 2) Sign up the user (profiles row is created by trigger)
  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (signUpError) {
    return { error: signUpError };
  }

  // 3) Accept the invitation + (if admin) add to admin_members via SECURITY DEFINER
  if (user?.id) {
    const { error: acceptErr } = await supabase.rpc("accept_invitation", {
      p_email: email,
      p_token: token,
      p_user_id: user.id,
    });
    if (acceptErr) {
      console.error("accept_invitation error:", acceptErr);
      return {
        error: {
          message:
            "Account created, but invite acceptance failed. Contact an admin.",
        },
      };
    }
  }

  return { user };
}

export async function verifyInvitation(token: string, email: string) {
  const supabase = await createClient(); // ✅ await

  const { data, error } = await supabase.rpc("verify_invitation", {
    p_email: email,
    p_token: token,
  });

  if (error || !data) {
    return { error: { message: "Invalid or expired invitation" } };
  }

  return { invitation: data };
}
