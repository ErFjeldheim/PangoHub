// lib/auth/server-auth.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getServerClient(): Promise<SupabaseClient> {
  return await createClient();
}

export async function getCurrentUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile() {
  const supabase = await getServerClient();
  const user = await getCurrentUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return profile ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

/**
 * Admin = membership in admin_members (via public.is_admin)
 * This matches your RLS + helpers.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return false;
  const { data, error } = await supabase.rpc("is_admin", { uid: auth.user.id });
  if (error) return false;
  return !!data;
}

export async function requireAdmin() {
  const ok = await isAdmin();
  if (!ok) redirect("/dashboard");
}
