// lib/auth/server-auth.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CurrentProfile } from "@/types/profile";

async function getServerClient(): Promise<SupabaseClient> {
  return await createClient();
}

export async function getCurrentUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function isAdmin(uid?: string): Promise<boolean> {
  const supabase = await getServerClient();
  let userId = uid;
  if (!userId) {
    const { data: auth } = await supabase.auth.getUser();
    userId = auth?.user?.id;
  }
  if (!userId) return false;

  const { data, error } = await supabase.rpc("is_admin", { uid: userId });
  if (error) return false;
  return !!data;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await getServerClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // Pull email + display_name from the view
  const { data: row, error } = await supabase
    .from("v_profiles_with_email")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !row) return null;

  const admin = await isAdmin(user.id);
  return { ...row, is_admin: admin } as CurrentProfile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/dashboard");
}

export async function requireSelf(profileId: string) {
  const user = await getCurrentUser();
  const uid = user?.id;
  if (uid !== profileId) throw new Error("Forbidden");
}
