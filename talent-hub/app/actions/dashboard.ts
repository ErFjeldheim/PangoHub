"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Consultant } from "@/types/consultant";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  return profile;
}

export async function getConsultants(): Promise<Consultant[]> {
  const supabase = await createClient();

  // pull only the columns you actually use on the dashboard
  const { data, error } = await supabase
    .from("v_consultant_overview")
    .select(
      "id, first_name, last_name, title, availability_status, experience_years"
    );

  if (error) throw error;
  const rows = (data ?? []) as Consultant[];

  // If there are no rows, avoid calling the RPC
  if (rows.length === 0) return rows;

  // Optional: filter out admins (keep null-safe)
  const ids = rows.map((p) => p.id);
  const { data: admins, error: adminErr } = await supabase.rpc(
    "is_admin_batch",
    { ids }
  );
  if (adminErr) {
    // If the RPC fails, just return the rows rather than breaking the dashboard
    return rows;
  }
  const adminSet = new Set((admins ?? []) as string[]);
  return rows.filter((p) => !adminSet.has(p.id));
}

export async function getPendingInvitations() {
  const supabase = await createClient();
  const { data: pendingInvitations } = await supabase
    .from("invitations")
    .select("*")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  return pendingInvitations;
}

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_departments_with_details");
  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
  console.log(data);
  return data;
}
