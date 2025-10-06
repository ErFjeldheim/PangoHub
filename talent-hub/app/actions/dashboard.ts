"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export async function getConsultants() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_consultant_overview")
    .select("*");

  if (error) throw error;

  // Call a lightweight RPC to check admin IDs, or fetch admin_members and filter
  const { data: admins } = await supabase.rpc("is_admin_batch", {
    ids: data.map((p) => p.id),
  });
  // If you don't have is_admin_batch, see the DB approach below for a better solution.

  const adminSet = new Set(admins); // array of UUIDs that are admins
  return data.filter((p) => !adminSet.has(p.id));
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
