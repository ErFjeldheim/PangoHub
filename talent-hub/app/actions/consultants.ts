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
  const { data: isAdmin } = await supabase.rpc('is_admin', { uid: userId });
  return isAdmin;
}

export async function getConsultant(consultantId: string) {
  const supabase = await createClient();
  const { data: consultant, error } = await supabase
    .from("v_profiles_with_email")
    .select("*")
    .eq("id", consultantId)
    .single();

  if (error || !consultant) {
    notFound();
  }

  return consultant;
}

export async function getSkills(consultantId: string) {
  const supabase = await createClient();
  const { data: skills } = await supabase
    .from('profile_skills')
    .select('proficiency, skills(name)')
    .eq('profile_id', consultantId);

  return skills;
}

export async function getExperiences(consultantId: string) {
  const supabase = await createClient();
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('profile_id', consultantId)
    .order('start_date', { ascending: false });

  return experiences;
}

export async function getEducations(consultantId: string) {
  const supabase = await createClient();
  const { data: educations } = await supabase
    .from('educations')
    .select('*')
    .eq('profile_id', consultantId)
    .order('end_year', { ascending: false });

  return educations;
}

export async function getAvailability(consultantId: string) {
  const supabase = await createClient();
  const { data: availability } = await supabase
    .from('availability_months')
    .select('*')
    .eq('profile_id', consultantId)
    .gte('month', new Date().toISOString())
    .order('month')
    .limit(1);

  return availability?.[0];
}

export async function getConsultantsForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_consultants_for_department", { p_department_id: id });
  if (error) {
    console.error("Error fetching consultants for department:", error);
    return [];
  }
  return data;
}