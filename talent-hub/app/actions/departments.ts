"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_departments_with_details');
  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
  return data;
}

export async function createDepartment(name: string, description: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert([{ name, description }])
    .select();
  if (error) {
    console.error("Error creating department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  return { data };
}

export async function updateDepartment(id: string, values: { name: string; description: string; leader_profile_id: string | null }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .update(values)
    .eq("id", id)
    .select();
  if (error) {
    console.error("Error updating department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  revalidatePath(`/dashboard/departments/${id}`);
  return { data };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  return {};
}

export async function getDepartmentDetails(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("departments").select("id, name, description, leader_profile_id").eq("id", id).single();
  if (error) {
    console.error("Error fetching department details:", error);
    return null;
  }
  return data;
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

export async function addConsultantToDepartment(departmentId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles_departments").insert({ department_id: departmentId, profile_id: profileId });
  if (error) {
    console.error("Error adding consultant to department:", error);
    return { error };
  }
  revalidatePath(`/dashboard/departments/${departmentId}`);
  return {};
}

export async function removeConsultantFromDepartment(departmentId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles_departments").delete().eq("department_id", departmentId).eq("profile_id", profileId);
  if (error) {
    console.error("Error removing consultant from department:", error);
    return { error };
  }
  revalidatePath(`/dashboard/departments/${departmentId}`);
  return {};
}

export async function getProjectsForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_projects_for_department", { p_department_id: id });
  if (error) {
    console.error("Error fetching projects for department:", error);
    return [];
  }
  return data;
}

export async function getAggregatedAvailabilityForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_aggregated_availability_for_department", { p_department_id: id });
  if (error) {
    console.error("Error fetching aggregated availability:", error);
    return [];
  }
  return data;
}
