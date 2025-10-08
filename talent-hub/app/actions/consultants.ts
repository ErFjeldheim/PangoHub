"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

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

export async function isAdmin(userId: string) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin", { uid: userId });
  return isAdmin;
}

// app/actions/consultants.ts
export async function getConsultant(consultantId: string) {
  const supabase = await createClient();

  const [emailView, overviewView, deptView] = await Promise.all([
    supabase
      .from("v_profiles_with_email")
      .select("*")
      .eq("id", consultantId)
      .single(), // email gated by owner/admin
    supabase
      .from("v_consultant_overview")
      .select("*")
      .eq("id", consultantId)
      .single(), // exp years, availability snapshot
    supabase
      .from("v_profiles_with_department")
      .select("primary_department")
      .eq("id", consultantId)
      .single(),
  ]);

  if (emailView.error || !emailView.data) {
    notFound();
  }

  return {
    ...overviewView.data, // first_name,last_name,title,bio,phone,location,links,experience_years,availability_status
    ...emailView.data, // safely adds email (may be null if not owner/admin)
    ...deptView.data, // adds primary_department if present
  };
}

export async function getSkills(consultantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_skills")
    .select("proficiency, years, skills(name)")
    .eq("profile_id", consultantId)
    .order("proficiency", { ascending: false });

  return data ?? [];
}

export async function getExperiences(consultantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .eq("profile_id", consultantId)
    .order("start_date", { ascending: false });

  return data ?? [];
}

export async function getEducations(consultantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("educations")
    .select("*")
    .eq("profile_id", consultantId)
    .order("end_year", { ascending: false });

  return data ?? [];
}
export async function getAvailability(consultantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_availability_current") // window: current month + next 6 months
    .select("*")
    .eq("profile_id", consultantId)
    .order("month", { ascending: true })
    .limit(1);

  return data?.[0] ?? null;
}

export async function getConsultantsForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_consultants_for_department", {
    p_department_id: id,
  });
  if (error) {
    console.error("Error fetching consultants for department:", error);
    return [];
  }
  return data;
}
