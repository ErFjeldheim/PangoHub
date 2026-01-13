// app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/types/admin";
import type { Invitation } from "@/types/invitation";
import { requireAdmin } from "@/lib/auth/server-auth";

// Matches the function's RETURNS TABLE in SQL
type AdminProfilesWithEmailRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  department: string | null; // computed in SQL
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  email: string | null;
};

export async function listUsersAndInvites(): Promise<{
  users: AdminUser[];
  invitations: Invitation[];
}> {
  await requireAdmin();
  const supabase = await createClient();

  // Call the SECURITY DEFINER fn; no generics here
  const rpcRes = await supabase.rpc("admin_profiles_with_email", {});
  if (rpcRes.error) throw rpcRes.error;

  // Assert result to our row type
  const usersRows = (rpcRes.data ?? []) as AdminProfilesWithEmailRow[];

  // Admin membership set (use .returns<T>() if available in your supabase-js)
  const { data: adminRows, error: amErr } = await supabase
    .from("admin_members")
    .select("user_id")
    .returns<{ user_id: string }[]>();
  if (amErr) throw amErr;

  const adminSet = new Set((adminRows ?? []).map((r) => r.user_id));

  const users: AdminUser[] = usersRows.map((u) => ({
    id: u.id,
    // normalize nullable fields to empty strings (or whatever default you prefer)
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    title: u.title ?? "",
    department: u.department ?? "",
    bio: u.bio ?? "",
    phone: u.phone ?? "",
    location: u.location ?? "",
    linkedin_url: u.linkedin_url ?? "",
    github_url: u.github_url ?? "",
    portfolio_url: u.portfolio_url ?? "",
    created_at: u.created_at,
    updated_at: u.updated_at,
    display_name: u.display_name ?? "",
    email: u.email ?? "",
    is_admin: adminSet.has(u.id),
  }));

  // Pending, not expired invites
  const nowIso = new Date().toISOString();
  const { data: invites, error: invErr } = await supabase
    .from("invitations")
    .select("*")
    .is("accepted_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });
  if (invErr) throw invErr;

  return { users, invitations: (invites ?? []) as Invitation[] };
}

export async function setUserRoleAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const userId = String(formData.get("userId"));
  const newRole = String(formData.get("newRole")) as "admin" | "consultant";

  if (newRole === "admin") {
    const { error } = await supabase
      .from("admin_members")
      .insert({ user_id: userId });
    if (error && error.code !== "23505") throw error; // ignore duplicates
  } else {
    const { error } = await supabase
      .from("admin_members")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteInvitationAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const invitationId = String(formData.get("invitationId"));
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId);
  if (error) throw error;

  revalidatePath("/dashboard/settings");
}
