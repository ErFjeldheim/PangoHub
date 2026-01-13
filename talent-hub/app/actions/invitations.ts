// app/actions/invitations.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import type { PostgrestError } from "@/types/supabase";

/**
 * Admin-only: create an invitation and return the signup URL.
 */
export async function createInvitation(
  email: string,
  role: "consultant" | "admin"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const cleanEmail = email.trim();
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase.from("invitations").insert({
    email: cleanEmail,
    role,
    invited_by: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    if ((error as PostgrestError).code === "23505") {
      throw new Error("That email already has a pending invitation.");
    }
    console.error("Error creating invitation:", error);
    throw new Error("Failed to create invitation");
  }

  const inviteUrl =
    `${process.env.NEXT_PUBLIC_BASE_URL}` +
    `/auth/signup?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(cleanEmail)}`;

  return { inviteUrl };
}

/**
 * List pending (unaccepted) invitations.
 */
export async function getInvitations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(
      `
      id,
      email,
      role,
      created_at,
      expires_at,
      invited_by:profiles (
        first_name,
        last_name
      )
    `
    )
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    throw new Error("Failed to fetch invitations");
  }
  return data;
}

/**
 * Delete an invitation by id.
 */
export async function deleteInvitation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) {
    console.error("Error deleting invitation:", error);
    throw new Error("Failed to delete invitation");
  }
}

/**
 * Verify an invitation (token + email).
 * Uses SECURITY DEFINER RPC `verify_invitation` on the DB.
 */
export async function verifyInvitation(token: string, email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_invitation", {
    p_email: email,
    p_token: token,
  });

  if (error || !data) {
    return { error: { message: "Invalid or expired invitation" } };
  }
  return { invitation: data };
}

/**
 * Sign up WITH invitation: verifies invite, signs up user, then accepts invite.
 * Accept also auto-adds admin membership if the invite role was "admin"
 * via SECURITY DEFINER RPC `accept_invitation`.
 */
export async function signUpWithInvitation(formData: FormData) {
  const supabase = await createClient();

  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!token) return { error: { message: "Invalid invitation token" } };

  // 1) Verify invite
  const { data: invitation, error: verificationError } = await supabase.rpc(
    "verify_invitation",
    { p_email: email, p_token: token }
  );
  if (verificationError || !invitation) {
    return { error: { message: "Invalid or expired invitation" } };
  }

  // 2) Sign up (profile row created by trigger)
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
  if (signUpError) return { error: signUpError };

  // 3) Accept invitation (and add to admin_members if role=admin)
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
